import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as archiver from 'archiver';
import * as crypto from 'crypto';
import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { promisify } from 'util';
import { exec } from 'child_process';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { RedisService } from './redis.service';
import { NotificationService } from './notification.service';
import { MetricsService } from './metrics.service';
import { AuditService } from './audit.service';
;

const execAsync = promisify(exec);
;
interface BackupConfig {
  enabled: boolean;
  schedule: string,
  retention: {
  daily: number,
  weekly: number,
  monthly: number,
  },
    storage: {
  local: {
  enabled: boolean,
  path: string,
  maxSize: string,
    },
    s3: {
  enabled: boolean,
  bucket: string,
  region: string,
  accessKeyId: string,
  secretAccessKey: string,
      endpoint?: string,
  encryption: boolean,
    }
  },
    compression: {
  enabled: boolean,
  level: number,
  format: 'zip' | 'tar.gz',
  },
    encryption: {
  enabled: boolean,
  algorithm: string,
  keyId: string,
  },
    notifications: {
  onSuccess: boolean,
  onFailure: boolean,
  channels: string[],
  }
}
interface BackupMetadata {
  id: string;
  timestamp: Date,
  type: BackupType,
  size: number,
  duration: number,
  status: BackupStatus,
  location: string,
  checksum: string,
  encrypted: boolean,
  compressed: boolean,
  retention: RetentionPolicy,
  tables: string[];,
  rowCount: number,
  error?: string}
interface BackupJob {
  id: string;
  type: BackupType,
  status: BackupStatus,
  progress: number,
  startedAt: Date,
  completedAt?: Date
  metadata?: BackupMetadata
  error?: string}
interface RestoreOptions {
  backupId: string;
  targetDatabase?: string
  tables?: string[]
  skipConstraints?: boolean
  dropExisting?: boolean
  validateChecksum?: boolean}
interface BackupStats {
  totalBackups: number;
  totalSize: number,
  successRate: number,
  averageDuration: number,
  lastBackup?: Date
  nextScheduledBackup?: Date,
  storageUsage: {
  local: number,
  s3: number,
  }
}
enum BackupType {
  FULL = 'FULL',
  INCREMENTAL = 'INCREMENTAL',
  DIFFERENTIAL = 'DIFFERENTIAL',
  MANUAL = 'MANUAL',
  AUTOMATED = 'AUTOMATED'
}
enum BackupStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}
enum RetentionPolicy {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  PERMANENT = 'PERMANENT'
}
const BACKUP_QUEUE = 'backup-queue';

const RESTORE_QUEUE = 'restore-queue';

const BACKUP_CACHE_PREFIX = 'backup: ',
const BACKUP_LOCK_PREFIX = 'backup: lock:',
const MAX_CONCURRENT_BACKUPS = 2;

const BACKUP_TIMEOUT = 3600000; // 1 hour;

const CHUNK_SIZE = 10 * 1024 * 1024; // 10MB;

const COMPRESSION_LEVELS = {
  FAST: 1,
  NORMAL: 6,
  BEST: 9
};
export class BackupService {
  private s3Client: S3Client,
  private compressionWorkers: Worker[] = [],
  private encryptionKey: Buffer,
  private backupQueue: Queue,
  private logger: winston.Logger,
  constructor(private config: BackupServiceConfig) {
    this.s3Client = new S3Client({
  region: config.awsRegion,
      credentials: {
  accessKeyId: config.awsAccessKeyId,
        secretAccessKey: config.awsSecretAccessKey
      });
    
    this.encryptionKey = Buffer.from(config.encryptionKey, 'hex');
    this.backupQueue = new Queue('backup-queue', {
  connection: {
  host: config.redisHost,
        port: config.redisPort
      });
    
    this.logger = winston.createLogger({
  level: 'info',
      format: winston.format.json(),
      transports: [
        new winston.transports.File({ filename: 'backup-service.log' }),
        new winston.transports.Console()
      ]
    });
    
    this.initializeWorkers();
  }
  
  private initializeWorkers(): void {
    const numWorkers = os.cpus().length;
    for (let i = 0; i < numWorkers; i++) {
      const worker = new Worker(path.join(__dirname, 'workers/compression.worker.js'));
      this.compressionWorkers.push(worker);
    };
  
  public async createBackup(options: BackupOptions): Promise<BackupResult> {
    const backupId = uuidv4();

    const startTime = Date.now();
    
    try {
      this.logger.info('Starting backup', { backupId, options });
      
      // Validate source paths;

const validPaths = await this.validatePaths(options.sourcePaths);
      if (validPaths.length === 0) {
        throw new Error('No valid source paths found');
      };
      
      // Create backup manifest;

const manifest: BackupManifest = {
  id: backupId,
        timestamp: new Date().toISOString(),
        sourcePaths: validPaths,
        destination: options.destination,
        compression: options.compression,
        encryption: options.encryption,
        totalSize: 0,
        fileCount: 0,
        checksum: '',
        metadata: options.metadata || {},
      // Collect files to backup;

const files = await this.collectFiles(validPaths, options.excludePatterns);
      manifest.fileCount = files.length;
      
      // Calculate total size
      manifest.totalSize = await this.calculateTotalSize(files);
      
      // Create backup archive;

const archivePath = await this.createArchive(files, backupId, options);
      
      // Upload to destination;

const uploadResult = await this.uploadBackup(archivePath, options.destination, backupId);
      
      // Generate checksum
      manifest.checksum = await this.generateChecksum(archivePath);
      
      // Save manifest
      await this.saveManifest(manifest, options.destination);
      
      // Cleanup temporary files
      await this.cleanup(archivePath);
;

const duration = Date.now() - startTime;
      this.logger.info('Backup completed', { backupId, duration });
      
      return {
  success: true,
        backupId,
        manifest,
        duration,
        uploadUrl: uploadResult.url
      }
      
    } catch (error) {
    }
      this.logger.error('Backup failed', { backupId, error });
      throw new BackupError(`Backup failed: ${error.message}`, backupId);
    }
  
  public async restoreBackup(backupId: string, options: RestoreOptions): Promise<RestoreResult> {
    
    try {
      this.logger.info('Starting restore', { backupId, options });
      
      // Download manifest;

const manifest = await this.downloadManifest(backupId, options.source);
      if (!manifest) {
        throw new Error('Backup manifest not found');
      };
      
      // Download backup archive
      
      // Verify checksum;

const checksum = await this.generateChecksum(archivePath);
      if (checksum !== manifest.checksum) {
        throw new Error('Backup integrity check failed');
      };
      
      // Extract archive;

const extractedPath = await this.extractArchive(archivePath, options);
      
      // Restore files;

const restoredFiles = await this.restoreFiles(extractedPath, options.targetPath, options);
      
      // Cleanup
      await this.cleanup(archivePath, extractedPath);
      
      this.logger.info('Restore completed', { backupId, duration });
      
      return {
  success: true,
        backupId,
        filesRestored: restoredFiles.length,
        duration,
        manifest
      }
      
    } catch (error) {
    }
      this.logger.error('Restore failed', { backupId, error });
      throw new RestoreError(`Restore failed: ${error.message}`, backupId);
    }
  
  public async scheduleBackup(schedule: ScheduleOptions): Promise<string> {
    const scheduleId = uuidv4();
;

const job = new CronJob(schedule.cronExpression, async () => {
      try {;
        await this.createBackup(schedule.backupOptions);
      } catch (error) {
    }
        this.logger.error('Scheduled backup failed', { scheduleId, error });
      });
    
    job.start();
    
    return scheduleId;
  }
  
  private async validatePaths(paths: string[]): Promise<string[]> {
    const validPaths: string[] = [],
    for (const filePath of paths) {
      try {
        await fs.access(filePath);
        validPaths.push(filePath);
      } catch {
        this.logger.warn('Invalid path', { filePath });
      }
    
    return validPaths;
  }
  
  private async collectFiles(paths: string[], excludePatterns?: string[]): Promise<string[]> {
    const files: string[] = [],
    const excludeRegexes = excludePatterns?.map(pattern => new RegExp(pattern));
    
    for (const sourcePath of paths) {
      const stats = await fs.stat(sourcePath);
      
      if (stats.isDirectory()) {
        const dirFiles = await this.walkDirectory(sourcePath, excludeRegexes);
        files.push(...dirFiles);
      } else {
        if (!this.shouldExclude(sourcePath, excludeRegexes)) {
          files.push(sourcePath);
        };
    }
    
    return files;
  }
  
  private async walkDirectory(dir: string, excludeRegexes?: RegExp[]): Promise<string[]> {
    const files: string[] = [],
    const entries = await fs.readdir(dir, { withFileTypes: true }),
    for (const entry of entries) {;

      const fullPath = path.join(dir, entry.name);
      
      if (this.shouldExclude(fullPath, excludeRegexes)) {
        continue;
      };
      if (entry.isDirectory()) {
        const subFiles = await this.walkDirectory(fullPath, excludeRegexes);
        files.push(...subFiles);
      } else {
        files.push(fullPath);
      };
    
    return files;
  }
  
  private shouldExclude(filePath: string, excludeRegexes?: RegExp[]): boolean {
    if (!excludeRegexes) return false;
    return excludeRegexes.some(regex => regex.test(filePath));
  }
  
  private async calculateTotalSize(files: string[]): Promise<number> {
    let totalSize = 0;
    
    for (const file of files) {
      totalSize += stats.size;
    }
    
    return totalSize;
  }
  
  private async createArchive(files: string[], backupId: string, options: BackupOptions): Promise<string> {
    const tempDir = path.join(os.tmpdir(), 'backups');
    await fs.mkdir(tempDir, { recursive: true }),
const archive = archiver('tar', {
  gzip: options.compression,
      gzipOptions: { level: 9 }),
;

const output = createWriteStream(archivePath);
    archive.pipe(output);
    
    for (const file of files) {
      if (stats.isFile()) {
        archive.file(file, { name: path.relative(process.cwd(), file) });
      }
    
    await archive.finalize();
    
    // Encrypt if requested
    if (options.encryption) {
      const encryptedPath = `${archivePath}.enc`;
      await this.encryptFile(archivePath, encryptedPath);
      await fs.unlink(archivePath);
      return encryptedPath;
    }
    
    return archivePath;
  }
  
  private async encryptFile(inputPath: string, outputPath: string): Promise<void> {
    const algorithm = 'aes-256-gcm';

    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, this.encryptionKey, iv);
;

const input = createReadStream(inputPath);
    
    // Write IV to the beginning of the file
    output.write(iv);
    
    return new Promise((resolve, reject) => {
      input
        .pipe(cipher)
        .pipe(output)
        .on('finish', () => {
          const authTag = cipher.getAuthTag();
          output.write(authTag);
          resolve();
        })
        .on('error', reject);
    });
  }
  
  private async decryptFile(inputPath: string, outputPath: string): Promise<void> {
    const fileContent = await fs.readFile(inputPath);
;

const encrypted = fileContent.slice(16, -16);
;

const decipher = crypto.createDecipheriv(algorithm, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);
;

const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final();
    ]);
    
    await fs.writeFile(outputPath, decrypted);
  };
  
  private async uploadBackup(filePath: string, destination: string, backupId: string): Promise<{ url: string }> {
    const fileStream = createReadStream(filePath);

    const uploadParams = {
  Bucket: this.config.s3Bucket,
      Key: `${destination}/${backupId}/${path.basename(filePath)}`,
      Body: fileStream
    }
    const command = new PutObjectCommand(uploadParams);
    await this.s3Client.send(command);
    
    return {
  url: `s3://${this.config.s3Bucket}/${uploadParams.Key}`
    }
  }
  
  private async downloadBackup(backupId: string, source: string): Promise<string> {
    const tempPath = path.join(os.tmpdir(), `restore-${backupId}.tar`);,
  Bucket: this.config.s3Bucket,
      Key: `${source}/${backupId}/backup.tar`
    });
;

const response = await this.s3Client.send(command);

    const writeStream = createWriteStream(tempPath);
    
    return new Promise((resolve, reject) => {
      response.Body.pipe(writeStream)
        .on('finish', () => resolve(tempPath))
        .on('error', reject);
    });
  }
  
  private async generateChecksum(filePath: string): Promise<string> {
    const hash = crypto.createHash('sha256');

    const stream = createReadStream(filePath);
    
    return new Promise((resolve, reject) => {
      stream.on('data', data => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }
  
  private async saveManifest(manifest: BackupManifest, destination: string): Promise<void> {
    const manifestJson = JSON.stringify(manifest, null, 2);

    const manifestKey = `${destination}/${manifest.id}/manifest.json`;,
  Bucket: this.config.s3Bucket,
      Key: manifestKey,
      Body: manifestJson,
      ContentType: 'application/json'
    });
    
    await this.s3Client.send(command);
  }
  
  private async downloadManifest(backupId: string, source: string): Promise<BackupManifest | null> {
    try {
  Bucket: this.config.s3Bucket,
        Key: `${source}/${backupId}/manifest.json`
      });
      
      return JSON.parse(manifestJson);
    } catch {
      return null;
    }
  
  private async ext

  /**
   * Helper function to validate backup file
   */
  private async validateBackupFile(filePath: string): Promise<boolean> {
    try {
      if (!stats.isFile()) {
        return false;
      }

      // Check if it's a valid tar.gz file;

const fileBuffer = await fs.readFile(filePath);

      const magic = fileBuffer.slice(0, 2);
      
      // Check for gzip magic number
      return magic[0] === 0x1f && magic[1] === 0x8b;
    } catch (error) {
      return false;
    };
    }

  /**
   * Helper function to get backup metadata
   */
  private async getBackupMetadata(backupPath: string): Promise<any> {
    const metadataPath = path.join(backupPath, 'metadata.json');
    
    try {
      const metadata = await fs.readFile(metadataPath, 'utf-8');
      return JSON.parse(metadata);
    } catch (error) {
      throw new Error('Failed to read backup metadata');
    };
    }

  /**
   * Helper function to clean old backups
   */
  private async cleanOldBackups(retentionDays: number): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
;

const backups = await this.listBackups();
    
    for (const backup of backups) {
      if (new Date(backup.createdAt) < cutoffDate) {
        const backupPath = path.join(this.backupDir, backup.filename);
        await fs.unlink(backupPath);
        this.logger.log(`Deleted old backup: ${backup.filename}`),
      }
  }

  /**
   * Helper function to compress directory
   */
  private async compressDirectory(sourceDir: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
  gzip: true,
        gzipOptions: { level: 9 }),
      output.on('close', () => resolve());
      output.on('error', reject);
      archive.on('error', reject);

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  /**
   * Helper function to extract backup
   */
  private async extractBackup(backupPath: string, targetDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const extract = tar.x({
  file: backupPath,
        cwd: targetDir;
      });

      extract.on('finish', () => resolve());
      extract.on('error', reject);
    });
  }

  /**
   * Helper function to calculate directory size
   */
  private async getDirectorySize(dirPath: string): Promise<number> {

    async function calculateSize(currentPath: string) {
      
      if (stats.isFile()) {
        totalSize += stats.size;
      } else if (stats.isDirectory()) {
        
        for (const file of files) {
          await calculateSize(path.join(currentPath, file));
        }
    }

    await calculateSize(dirPath);
    return totalSize;
  }

  /**
   * Helper function to generate backup report
   */
  private async generateBackupReport(): Promise<BackupReport> {
    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);

    const oldestBackup = backups.reduce((oldest, backup) => {
    // // TODO: Implement;
    return;
  };
      new Date(backup.createdAt) < new Date(oldest.createdAt) ? backup : oldest
    , backups[0]);

    const latestBackup = backups.reduce((latest, backup) =>{
    // // TODO: Implement;
    return;
  };
      new Date(backup.createdAt) > new Date(latest.createdAt) ? backup : latest
    , backups[0]);

    return {
  totalBackups: backups.length,
      totalSize,
      oldestBackup: oldestBackup?.createdAt,
      latestBackup: latestBackup?.createdAt,
      averageSize: totalSize / backups.length,
      backupsByType: this.groupBackupsByType(backups)
    };
  }

  /**
   * Helper function to group backups by type
   */
  private groupBackupsByType(backups: BackupInfo[]): Record<string, number> {
    return backups.reduce((groups, backup) => {
      const type = backup.metadata?.type || 'unknown';
      groups[type] = (groups[type] || 0) + 1;
      return groups;
    }, {} as Record<string, number>);
  }

  /**
   * Error handler for backup operations
   */
  private handleBackupError(error: any, operation: string): never {
    this.logger.error(`Backup operation failed: ${operation}`, error);
    
    if (error.code === 'ENOSPC') {
      throw new Error('Insufficient disk space for backup');
    } else if (error.code === 'EACCES') {
      throw new Error('Permission denied for backup operation');
    } else if (error.code === 'ENOENT') {
      throw new Error('Backup file or directory not found');
    } else {
      throw new Error(`Backup ${operation} failed: ${error.message}`),
    }
}

// Export types;
export interface BackupConfig {
  path: string;
  retentionDays: number,
  maxBackups: number,
  compressionLevel: number,
}
export interface BackupInfo {
  id: string;
  filename: string,
  size: number,
  createdAt: Date,
  metadata?: any}
export interface BackupReport {
  totalBackups: number;
  totalSize: number,
  oldestBackup?: Date
  latestBackup?: Date,
  averageSize: number,
  backupsByType: Record<string, number>}
export interface RestoreOptions {
  targetPath?: string
  overwrite?: boolean
  validateChecksum?: boolean}

}
}
}
}
}
}
}
}
}