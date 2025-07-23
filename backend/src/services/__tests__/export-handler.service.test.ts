import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ExportHandlerService } from '../export-handler.service';
import { DatabaseService } from '../database.service';
import { RedisService } from '../redis.service';
import { FileStorageService } from '../file-storage.service';
import { QueueService } from '../queue.service';
import { Logger } from '../../utils/logger';
import { ExportFormat, ExportStatus, ExportOptions, ExportResult } from '../../types/export.types';
import { Card } from '../../models/card.model';
import { User } from '../../models/user.model';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as csv from 'csv-parse';
import * as xlsx from 'xlsx';
import { Readable } from 'stream';

interface MockExportJob {
  id: string;
  userId: string;
  format: ExportFormat;
  options: ExportOptions;
  status: ExportStatus;
  progress: number;
  totalItems: number;
  processedItems: number;
  fileUrl?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

interface ExportMetadata {
  jobId: string;
  format: ExportFormat;
  totalCards: number;
  exportedAt: Date;
  filters?: Record<string, any>;
  columns?: string[];
}

interface BatchProcessingOptions {
  batchSize: number;
  maxRetries: number;
  retryDelay: number;
}

type MockDatabaseService = DeepMockProxy<DatabaseService>;
type MockRedisService = DeepMockProxy<RedisService>;
type MockFileStorageService = DeepMockProxy<FileStorageService>;
type MockQueueService = DeepMockProxy<QueueService>;
type MockLogger = DeepMockProxy<Logger>;

const EXPORT_QUEUE_NAME = 'export-jobs';
const EXPORT_CACHE_PREFIX = 'export:';
const EXPORT_TTL = 3600; // 1 hour
const MAX_EXPORT_SIZE = 100000; // 100k records
const BATCH_SIZE = 1000;
const TEMP_DIR = '/tmp/boom-exports';

const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  format: ExportFormat.CSV,
  includeArchived: false,
  includeDeleted: false,
  dateRange: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date()
  },
  columns: ['id', 'title', 'description', 'status', 'createdAt', 'updatedAt']
};

const MOCK_USER: User = {
  id: 'user123',
  email: 'test@boomcard.com',
  name: 'Test User',
  role: 'user',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

const MOCK_CARDS: Card[] = [
  {
    id: 'card1',
    userId: 'user123',
    title: 'Test Card 1',
    description: 'Description 1',
    status: 'active',
    tags: ['tag1', 'tag2'],
    metadata: { category: 'business' },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'card2',
    userId: 'user123',
    title: 'Test Card 2',
    description: 'Description 2',
    status: 'active',
    tags: ['tag2', 'tag3'],
    metadata: { category: 'personal' },
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  }
];

const CSV_HEADERS = ['id', 'title', 'description', 'status', 'tags', 'createdAt', 'updatedAt'];
const EXCEL_SHEET_NAME = 'Cards Export';
const JSON_INDENT = 2;

describe('ExportHandlerService', () => {
  let exportHandler: ExportHandlerService;
  let mockPrisma: any;
  let mockLogger: any;
  let mockMetrics: any;
  let mockCache: any;
  let mockS3: any;
  let mockQueue: any;
  let mockValidator: any;
  let mockAuth: any;
  let mockTransform: any;
  let mockRetry: any;
  let mockCompression: any;
  let mockEncryption: any;
  let mockTenant: any;
  let mockActivity: any;
  let mockVersion: any;
  let mockStream: any;
  let mockExcel: any;
  let mockPdf: any;
  let mockReport: any;
  let mockNotification: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = createMockPrisma();
    mockLogger = createMockLogger();
    mockMetrics = createMockMetrics();
    mockCache = createMockCache();
    mockS3 = createMockS3();
    mockQueue = createMockQueue();
    mockValidator = createMockValidator();
    mockAuth = createMockAuth();
    mockTransform = createMockTransform();
    mockRetry = createMockRetry();
    mockCompression = createMockCompression();
    mockEncryption = createMockEncryption();
    mockTenant = createMockTenant();
    mockActivity = createMockActivity();
    mockVersion = createMockVersion();
    mockStream = createMockStream();
    mockExcel = createMockExcel();
    mockPdf = createMockPdf();
    mockReport = createMockReport();
    mockNotification = createMockNotification();

    exportHandler = new ExportHandlerService(
      mockPrisma,
      mockLogger,
      mockMetrics,
      mockCache,
      mockS3,
      mockQueue,
      mockValidator,
      mockAuth,
      mockTransform,
      mockRetry,
      mockCompression,
      mockEncryption,
      mockTenant,
      mockActivity,
      mockVersion,
      mockStream,
      mockExcel,
      mockPdf,
      mockReport,
      mockNotification
    );
  });

  describe('createExport', () => {
    it('should create a new export successfully', async () => {
      const request: ExportRequest = {
        type: ExportType.CARDS,
        format: ExportFormat.CSV,
        filters: {
          status: ['active'],
          dateRange: {
            start: new Date('2024-01-01'),
            end: new Date('2024-12-31')
          },
        options: {
          includeArchived: false,
          includeMetadata: true
        };

      const mockExport = {
        id: 'export123',
        status: ExportStatus.PENDING,
        createdAt: new Date(),
        ...request
      };

      mockValidator.validateRequest.mockResolvedValue(true);
      mockAuth.checkPermission.mockResolvedValue(true);
      mockPrisma.export.create.mockResolvedValue(mockExport);
      mockQueue.add.mockResolvedValue({ id: 'job123' });

      const result = await exportHandler.createExport(request, 'user123', 'tenant123');

      expect(result).toEqual(mockExport);
      expect(mockValidator.validateRequest).toHaveBeenCalledWith(request);
      expect(mockQueue.add).toHaveBeenCalledWith('export-processing', {)
        exportId: mockExport.id,
        request
      });
    });

    it('should handle validation errors', async () => {
      const request: ExportRequest = {
        type: ExportType.CARDS,
        format: ExportFormat.CSV,
        filters: {};

      mockValidator.validateRequest.mockRejectedValue(
        new ValidationError('Invalid request')
      );

      await expect()
        exportHandler.createExport(request, 'user123', 'tenant123')
      ).rejects.toThrow(ValidationError);

      expect(mockPrisma.export.create).not.toHaveBeenCalled();
    });

    it('should handle authorization errors', async () => {
      const request: ExportRequest = {
        type: ExportType.CARDS,
        format: ExportFormat.CSV,
        filters: {};

      mockValidator.validateRequest.mockResolvedValue(true);
      mockAuth.checkPermission.mockResolvedValue(false);

      await expect()
        exportHandler.createExport(request, 'user123', 'tenant123')
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe('processExport', () => {
    it('should process CSV export successfully', async () => {
      const exportId = 'export123';
        id: exportId,
        type: ExportType.CARDS,
        format: ExportFormat.CSV,
        filters: {
          status: ['active']
        },
        status: ExportStatus.PROCESSING
      };

      const mockData = [
        { id: '1', cardNumber: '1234', status: 'active' },
        { id: '2', cardNumber: '5678', status: 'active' }
      ];

      mockPrisma.export.findUnique.mockResolvedValue(mockExport);
      mockPrisma.card.findMany.mockResolvedValue(mockData);
      mockTransform.toCSV.mockResolvedValue('csv content');
      mockS3.upload.mockResolvedValue({
        Location: 'https://s3.example.com/export123.csv'
      });


      expect(result.status).toBe(ExportStatus.COMPLETED);
      expect(result.url).toBe('https://s3.example.com/export123.csv');
      expect(mockMetrics.increment).toHaveBeenCalledWith('export.completed', 1, {
        type: ExportType.CARDS,)
        format: ExportFormat.CSV
      });
    });

    it('should process Excel export with multiple sheets', async () => {
        id: exportId,
        type: ExportType.CARDS,
        format: ExportFormat.EXCEL,
        filters: {},
        options: {
          multiSheet: true
        };

      const mockCards = [
        { id: '1', cardNumber: '1234', status: 'active' },
        { id: '2', cardNumber: '5678', status: 'inactive' }
      ];

      const mockTransactions = [
        { id: 't1', cardId: '1', amount: 100 },
        { id: 't2', cardId: '2', amount: 200 }
      ];

      mockPrisma.export.findUnique.mockResolvedValue(mockExport);
      mockPrisma.card.findMany.mockResolvedValue(mockCards);
      mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
      mockExcel.createWorkbook.mockResolvedValue({
        xlsx: { writeBuffer: jest.fn().mockResolvedValue(Buffer.from('excel')) });


      expect(result.status).toBe(ExportStatus.COMPLETED);
      expect(mockExcel.createWorkbook).toHaveBeenCalled();
      expect(mockExcel.addSheet).toHaveBeenCalledTimes(2);
    });

    it('should handle large exports with streaming', async () => {
        id: exportId,
        type: ExportType.TRANSACTIONS,
        format: ExportFormat.CSV,
        filters: {},
        estimatedSize: 1000000 // 1GB
      };

      mockPrisma.export.findUnique.mockResolvedValue(mockExport);
      mockPrisma.transaction.count.mockResolvedValue(1000000);
      mockStream.createReadStream.mockReturnValue(new PassThrough());
      mockStream.createWriteStream.mockReturnValue(new PassThrough());

      await exportHandler.processExport(exportId);

      expect(mockStream.createReadStream).toHaveBeenCalled();
      expect(mockCompression.createGzip).toHaveBeenCalled();
    });

    it('should retry on failure', async () => {
        id: exportId,
        type: ExportType.CARDS,
        format: ExportFormat.CSV,
        attempts: 1
      };

      mockPrisma.export.findUnique.mockResolvedValue(mockExport);
      mockPrisma.card.findMany.mockRejectedValueOnce(new Error('DB error'));
      mockPrisma.card.findMany.mockResolvedValueOnce([]);

      await exportHandler.processExport(exportId);

      expect(mockRetry.withRetry).toHaveBeenCalled();
      expect(mockPrisma.export.update).toHaveBeenCalledWith({
        where: { id: exportId },
        data: expect.objectContaining({
          attempts: 2
        })
      });
    });

    it('should handle export timeout', async () => {
        id: exportId,
        type: ExportType.CARDS,
        format: ExportFormat.CSV,
        createdAt: new Date(Date.now() - 3600000) // 1 hour ago
      };

      mockPrisma.export.findUnique.mockResolvedValue(mockExport);
      const timeoutError = new Error('Export timeout');
      timeoutError.name = 'TimeoutError';
      mockPrisma.card.findMany.mockRejectedValue(timeoutError);

      await expect(exportHandler.processExport(exportId)).rejects.toThrow('Export timeout');

      expect(mockPrisma.export.update).toHaveBeenCalledWith({
        where: { id: exportId },
        data: expect.objectContaining({
          status: ExportStatus.FAILED,
          error: 'Export timeout'
        })
      });
    });
  });

  describe('downloadExport', () => {
    it('should generate download URL for completed export', async () => {
        id: exportId,
        status: ExportStatus.COMPLETED,
        url: 'https://s3.example.com/export123.csv',
        expiresAt: new Date(Date.now() + 3600000)
      };

      mockPrisma.export.findUnique.mockResolvedValue(mockExport);
      mockAuth.checkAccess.mockResolvedValue(true);
      mockS3.getSignedUrlPromise.mockResolvedValue('https://signed-url.example.com');


      expect(result.url).toBe('https://signed-url.example.com');
      expect(result.expiresIn).toBe(3600);
      expect(mockActivity.log).toHaveBeenCalledWith({
        action: 'export.downloaded',)
        exportId,
        userId: 'user123'
      });
    });

    it('should handle expired exports', async () => {
        id: exportId,
        status: ExportStatus.COMPLETED,
        expiresAt: new Date(Date.now() - 3600000) // expired
      };

      mockPrisma.export.findUnique.mockResol
}}}