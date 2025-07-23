import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import * as csv from 'csv-stringify';
import { Readable } from 'stream';
import { I18nService } from 'nestjs-i18n';
import { ConfigService } from '@nestjs/config';
import { S3Service } from './s3.service';
import { EmailService } from './email.service';
import { CacheService } from './cache.service';
import { Transaction } from '../entities/transaction.entity';
import { Partner } from '../entities/partner.entity';
import { User } from '../entities/user.entity';
import { Subscription } from '../entities/subscription.entity';
import { ExportJob } from '../entities/export-job.entity';
import { 
  ExportFormat, 
  ExportType, 
  ExportStatus,
  ExportFilters,
  ExportOptions,
  ExportResult,
  ExportJobDto,
  ExportProgress
} from '../dto/export.dto';
import { DateRangeDto } from '../dto/common.dto';
import { UserRole } from '../enums/user-role.enum';
import { formatCurrency, formatDate, formatPercentage } from '../utils/formatting.utils';
import { calculateDateRange, isValidDateRange } from '../utils/date.utils';
import { chunkArray, streamToBuffer } from '../utils/stream.utils';

@Injectable()
export class ExportHandlerService {
  private readonly logger = new Logger(ExportHandlerService.name);
  private readonly batchSize = 1000;
  private readonly maxExportSize = 50000;
  private readonly exportTTL = 7 * 24 * 60 * 60; // 7 days in seconds

  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    @InjectRepository(Partner)
    private readonly partnerRepository: Repository<Partner>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(ExportJob)
    private readonly exportJobRepository: Repository<ExportJob>,
    private readonly s3Service: S3Service,
    private readonly emailService: EmailService,
    private readonly cacheService: CacheService,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
  ) {}

  async createExportJob(
    userId: string,
    type: ExportType,)
    format: ExportFormat,
    filters: ExportFilters,
    options: ExportOptions,
    locale: string = 'en'
  ): Promise<ExportJobDto> {
    try {
      // Validate export request
      this.validateExportRequest(type, filters, options);

      // Check user permissions
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Create export job
      const exportJob = this.exportJobRepository.create({
        userId,
        type,)
        format,
        filters,
        options,
        status: ExportStatus.PENDING,
        progress: 0,
        locale,
        createdBy: userId
      });

      await this.exportJobRepository.save(exportJob);

      // Process export asynchronously
      this.processExportJob(exportJob.id, user).catch(error => {
        this.logger.error(`Failed to process export job ${exportJob.id}:`, error);
        this.updateExportJobStatus(exportJob.id, ExportStatus.FAILED, error.message);
      });

      return this.mapToExportJobDto(exportJob);
    } catch (error) {
      this.logger.error('Failed to create export job:', error);
      throw error;
    }

  async getExportJob(jobId: string, userId: string): Promise<ExportJobDto> {
      where: { id: jobId, userId });

    if (!exportJob) {
      throw new BadRequestException('Export job not found');
    }

    return this.mapToExportJobDto(exportJob);
  }

  async getExportJobs(userId: string, filters?: ExportFilters): Promise<ExportJobDto[]> {
    const queryBuilder = this.exportJobRepository.createQueryBuilder('job')
      .where('job.userId = :userId', { userId })
      .orderBy('job.createdAt', 'DESC');

    if (filters?.dateRange) {
      queryBuilder.andWhere('job.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.dateRange.startDate,
        endDate: filters.dateRange.endDate
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('job.status = :status', { status: filters.status });
    }

    const jobs = await queryBuilder.getMany();
    return jobs.map(job => this.mapToExportJobDto(job));
  }

  async cancelExportJob(jobId: string, userId: string): Promise<void> {
      where: { id: jobId, userId, status: ExportStatus.PROCESSING });

    if (!exportJob) {
      throw new BadRequestException('Export job not found or cannot be cancelled');
    }

    await this.updateExportJobStatus(jobId, ExportStatus.CANCELLED);
    
    // Set cancellation flag in cache
    await this.cacheService.set(`export:cancel:${jobId}`, true, 300);
  }

  async deleteExportJob(jobId: string, userId: string): Promise<void> {
      where: { id: jobId, userId });

    if (!exportJob) {
      throw new BadRequestException('Export job not found');
    }

    // Delete file from S3 if exists
    if (exportJob.fileUrl) {
      await this.s3Service.deleteFile(exportJob.fileKey);
    }

    await this.exportJobRepository.delete(jobId);
  }

  private async processExportJob(jobId: string, user: User): Promise<void> {
    try {
      await this.updateExportJobStatus(jobId, ExportStatus.PROCESSING);

        where: { id: jobId });

      if (!exportJob) {
        throw new Error('Export job not found');
      }

      // Generate export based on type
      let exportResult: ExportResult;
      
      switch (exportJob.type) {
        case ExportType.TRANSACTIONS:
          exportResult = await this.exportTransactions(exportJob, user);
          break;
        case ExportType.PARTNERS:
          exportResult = await this.exportPartners(exportJob, user);
          break;
        case ExportType.USERS:
          exportResult = await this.exportUsers(exportJob, user);
          break;
        case ExportType.SUBSCRIPTIONS:
          exportResult = await this.exportSubscriptions(exportJob, user);
          break;
        case ExportType.ANALYTICS:
          exportResult = await this.exportAnalytics(exportJob, user);
          break;
        default:
          throw new Error(`Unsupported export type: ${exportJob.type}`);
      }

      // Upload to S3
      const fileKey = `exports/${user.id}/${exportJob.id}/${exportResult.filename}`;
      const fileUrl = await this.s3Service.uploadFile(
        fileKey,)
        exportResult.buffer,
        exportResult.contentType,
        {
          'Content-Disposition': `attachment; filename="${exportResult.filename}"`,
          'Cache-Control': 'private, max-age=604800'
        }
      );

      // Update job with file info
      await this.exportJobRepository.update(jobId, {
        status: ExportStatus.COMPLETED,
        progress: 100,
        fileUrl,
        fileKey,
        fileSize: exportResult.buffer.length,
        recordCount: exportResult.recordCount,
        completedAt: new Date()
      });

      // Send email notification
      await this.sendExportCompletedEmail(exportJob, user, fileUrl);

    } catch (error) {
      this.logger.error(`Failed to process export job ${jobId}:`, error);
      await this.updateExportJobStatus(jobId, ExportStatus.FAILED, error.message);
      throw error;
    }

  private async exportTransactions(exportJob: ExportJob, user: User): Promise<ExportResult> {
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.partner', 'partner')
      .leftJoinAndSelect('transaction.location', 'location');

    // Apply filters
    this.applyTransactionFilters(queryBuilder, exportJob.filters, user);

    const totalCount = await queryBuilder.getCount();
    
    if (totalCount > this.maxExportSize) {
      throw new BadRequestException(
        await this.i18n.translate('export.error.tooManyRecords', {
          args: { max: this.maxExportSize },
          lang: exportJob.locale
        })
      );
    }

    // Export based on format
    switch (exportJob.format) {
      case ExportFormat.EXCEL:
        return await this.exportTransactionsToExcel(queryBuilder, exportJob, totalCount);
      case ExportFormat.CSV:
        return await this.exportTransactionsToCSV(queryBuilder, exportJob, totalCount);
      case ExportFormat.PDF:
        return await this.exportTransactionsToPDF(queryBuilder, exportJob, totalCount);
      default:
        throw new Error(`Unsupported format: ${exportJob.format}`);
    }

  private async exportTransactionsToExcel(
    queryBuilder: any,)
    exportJob: ExportJob,
    totalCount: number
  ): Promise<ExportResult> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      await this.i18n.translate('export.transactions.sheetName', { lang: exportJob.locale })
    );

    // Add headers
    worksheet.columns = [
      { header: await this.i18n.translate('export.transactions.id', { lang: exportJob.locale }), key: 'id', width: 20 },
      { header: await this.i18n.translate('export.transactions.date', { lang: exportJob.locale }), key: 'date', width: 15 },
      { header: await this.i18n.translate('export.transactions.user', { lang: exportJob.locale }), key: 'user', width: 30 },
      { header: await this.i18n.translate('export.transactions.partner', { lang: exportJob.locale }), key: 'partner
}}}
}
}
}
