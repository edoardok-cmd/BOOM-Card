import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as ExcelJS from 'exceljs';
import { Parser } from 'json2csv';
import * as fs from 'fs/promises';
import * as path from 'path';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { promisify } from 'util';
import * as archiver from 'archiver';
import { Card } from '../entities/card.entity';
import { Transaction } from '../entities/transaction.entity';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { CardProgram } from '../entities/card-program.entity';
import { SpendingControl } from '../entities/spending-control.entity';
import { NotificationService } from './notification.service';
import { EmailService } from './email.service';
import { CacheService } from './cache.service';
import { MetricsService } from './metrics.service';
;
export enum ReportType {
  TRANSACTION_SUMMARY = 'transaction_summary',
  SPENDING_ANALYSIS = 'spending_analysis',
  CARD_USAGE = 'card_usage',
  COMPLIANCE = 'compliance',
  RECONCILIATION = 'reconciliation',
  BUDGET_PERFORMANCE = 'budget_performance',
  FRAUD_ANALYSIS = 'fraud_analysis',
  VENDOR_ANALYSIS = 'vendor_analysis',
  EMPLOYEE_EXPENSES = 'employee_expenses',
  CUSTOM = 'custom'
}
export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json'
}
export enum ReportFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}
export enum ReportStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}
export interface ReportGenerationOptions {
  type: ReportType;
  format: ReportFormat,
  organizationId: string,
  userId?: string,
  dateRange: {
  start: Date,
  end: Date,
  }
  filters?: {
    cardIds?: string[];
    userIds?: string[];
    categories?: string[];
    merchants?: string[];
    minAmount?: number;
    maxAmount?: number;
    status?: string[];
    tags?: string[];
  }
  groupBy?: string[];
  sortBy?: {
  field: string,
  order: 'asc' | 'desc',
  }
  includeCharts?: boolean;
  includeDetails?: boolean;
  customFields?: string[];
  timezone?: string;
  locale?: string;
}
export interface ReportSchedule {
  id: string;
  organizationId: string,
  userId: string,
  name: string,
  description?: string,
  type: ReportType,
  format: ReportFormat,
  frequency: ReportFrequency,
  options: ReportGenerationOptions,
  recipients: string[];,
  nextRunAt: Date,
  lastRunAt?: Date,
  isActive: boolean,
  createdAt: Date,
  updatedAt: Date,
}
export interface ReportJob {
  id: string;
  scheduleId?: string,
  organizationId: string,
  userId: string,
  type: ReportType,
  format: ReportFormat,
  status: ReportStatus,
  options: ReportGenerationOptions,
  progress: number,
  fileUrl?: string
  error?: string
  startedAt?: Date
  completedAt?: Date
  metadata?: Record<string, any>}
export interface ReportMetadata {
  reportId: string;
  generatedAt: Date,
  generatedBy: string,
  organization: {
  id: string,
  name: string,
  },
    reportType: ReportType,
  dateRange: {
  start: Date,
  end: Date,
  },
    totalRecords: number,
  filters: Record<string, any>;,
  summary: Record<string, any>;
}
export interface TransactionReportData {
  transactionId: string;
  cardId: string,
  cardNumber: string,
  cardholderName: string,
  merchantName: string,
  merchantCategory: string,
  transactionDate: Date,
  postingDate?: Date,
  amount: number,
  currency: string,
  status: string,
  description?: string
  tags?: string[]
  notes?: string
  receiptUrl?: string
  category?: string
  project?: string
  department?: string}
export interface SpendingAnalysisData {
  category: string;
  totalSpent: number,
  transactionCount: number,
  averageTransaction: number,
  percentageOfTotal: number,
  trend: number,
  topMerchants: Array<{
  name: string,
  amount: number,
  count: number,
  }>;
  monthlyBreakdown?: Array<{
  month: string,
  amount: number,
  count: number,
  }>;
}
export interface CardUsageData {
  cardId: string;
  cardNumber: string,
  cardholderName: string,
  status: string,
  totalSpent: number,
  transactionCount: number,
  lastUsed?: Date,
  utilizationRate: number,
  topCategories: Array<{
  category: string,
  amount: number,
  }>;,
  monthlySpending: Array<{
  month: string,
  amount: number,
  }>;
}
export interface ComplianceReportData {
  policyViolations: Array<{
  transactionId: string;
  cardId: string,
  violationType: string,
  description: string,
  amount: number,
  date: Date,
  status: string,
  }>;,
  spendingLimitExceeded: Array<{
  cardId: string,
  limit: number,
  actual: number,
  period: string,
  }>;,
  unusualTransactions: Array<{
  transactionId: string,
  reason: string,
  riskScore: number,
  }>;,
  complianceScore: number,
  recommendations: string[],
}
export interface ChartConfiguration {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'area';
  title: string,
  data: {
  labels: string[];,
  datasets: Array<{
  label: string,
  data: number[],
      backgroundColor?: string | string[]
      borderColor?: string}>;
  }
  options?: Record<string, any>;
}
const REPORT_CONSTANTS = {
  MAX_RECORDS_PER_PAGE: 1000,
  DEFAULT_PAGE_SIZE: 50,
  MAX_EXPORT_RECORDS: 100000,
  REPORT_RETENTION_DAYS: 90,
  MAX_CONCURRENT_REPORTS: 5,
  REPORT_TIMEOUT_MINUTES: 30,
  CACHE_TTL_SECONDS: 3600,
  MAX_FILE_SIZE_MB: 100,
  SUPPORTED_CURRENCIES: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
  DATE_FORMATS: {
  display: 'MMM dd, yyyy',
    filename: 'yyyy-MM-dd',
    timestamp: 'yyyy-MM-dd HH:mm:ss'
  },
  CHART_COLORS: {
  primary: '#4F46E5',
    secondary: '#10B981',
    tertiary: '#F59E0B',
    danger: '#EF4444',
    info: '#3B82F6',
    success: '#22C55E',
    warning: '#F97316',
    neutral: '#6B7280'
  }
    const REPORT_TEMPLATES = {
  [ReportType.TRANSACTION_SUMMARY]: {
  title: 'Transaction Summary Report',
    sections: ['overview', 'transactions', 'summary', 'charts'],
    defaultFormat: ReportFormat.EXCEL
  },
  [ReportType.SPENDING_ANALYSIS]: {
  title: 'Spending Analysis Report',
    sections: ['overview', 'categories', 'merchants', 'trends', 'charts'],
    defaultFormat: ReportFormat.PDF
  },
  [ReportType.CARD_USAGE]: {
  title: 'Card Usage Report',
    sections: ['overview', 'cards', 'utilization', 'charts'],
    defaultFormat: ReportFormat.EXCEL
  },
  [ReportType.COMPLIANCE]: {
  title: 'Compliance Report',
    sections: ['overview', 'violations', 'risks', 'recommendations'],
    defaultFormat: ReportFormat.PDF
  },
  [ReportType.RECONCILIATION]: {
  title: 'Reconciliation Report',
    sections: ['overview', 'transactions', 'discrepancies', 'summary'],
    defaultFormat: ReportFormat.EXCEL
  }
@Injectable();
export class ReportGeneratorService {
  private readonly logger = new Logger(ReportGeneratorService.name);
  private s3: S3,
  private readonly reportsDir = path.join(process.cwd(), 'temp', 'reports');
;
export class ReportGeneratorService {
  private templates: Map<string, ReportTemplate> = new Map();
  private reportCache: NodeCache,
  private pdfGenerator: PDFDocument | null = null,
  private excelWorkbook: Excel.Workbook | null = null,
  constructor(
    private readonly cardHolderService: CardHolderService,
    private readonly transactionService: TransactionService,
    private readonly analyticsService: AnalyticsService,
    private readonly merchantService: MerchantService,
    private readonly emailService: EmailService,
    private readonly storageService: StorageService,
    private readonly auditService: AuditService,
    private readonly cacheService: CacheService,
    private readonly logger: Logger
  ) {
    this.reportCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 }),
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Transaction Report Template
    this.templates.set('transaction-report', {
  id: 'transaction-report',
      name: 'Transaction Report',
      description: 'Detailed transaction history and analytics',
      sections: [
        { type: 'header', config: { title: 'Transaction Report', includeDate: true } },
        { type: 'summary', config: { fields: ['totalTransactions', 'totalAmount', 'dateRange'] } },
        { type: 'chart', config: { type: 'line', dataSource: 'transactionTrends' } },
        { type: 'table', config: { columns: ['date', 'merchant', 'amount', 'status', 'category'] } }
      ],
      defaultFormat: 'pdf',
      supportedFormats: ['pdf', 'excel', 'csv'],
      permissions: ['report:view', 'transaction:view']
    });

    // Spending Analysis Template
    this.templates.set('spending-analysis', {
  id: 'spending-analysis',
      name: 'Spending Analysis',
      description: 'Category-wise spending breakdown and insights',
      sections: [
        { type: 'header', config: { title: 'Spending Analysis Report' } },
        { type: 'chart', config: { type: 'pie', dataSource: 'categoryBreakdown' } },
        { type: 'chart', config: { type: 'bar', dataSource: 'monthlyComparison' } },
        { type: 'insights', config: { metrics: ['topCategories', 'savingOpportunities'] } }
      ],
      defaultFormat: 'pdf',
      supportedFormats: ['pdf', 'excel'],
      permissions: ['report:view', 'analytics:view']
    });

    // Merchant Activity Template
    this.templates.set('merchant-activity', {
  id: 'merchant-activity',
      name: 'Merchant Activity Report',
      description: 'Merchant transaction summary and performance',
      sections: [
        { type: 'header', config: { title: 'Merchant Activity Report' } },
        { type: 'summary', config: { fields: ['totalMerchants', 'activeTransactions', 'revenue'] } },
        { type: 'table', config: { columns: ['merchant', 'transactions', 'revenue', 'avgTicket'] } },
        { type: 'chart', config: { type: 'bar', dataSource: 'topMerchants' } }
      ],
      defaultFormat: 'excel',
      supportedFormats: ['pdf', 'excel', 'csv'],
      permissions: ['report:view', 'merchant:view']
    });
  }

  async generateReport(options: ReportGenerationOptions): Promise<GeneratedReport> {
    try {
      // Validate permissions
      await this.validatePermissions(options.userId, options.templateId);

      // Check cache;

const cacheKey = this.getCacheKey(options);

      const cachedReport = this.reportCache.get<GeneratedReport>(cacheKey);
      if (cachedReport && !options.forceRegenerate) {
        this.logger.info('Returning cached report', { reportId: cachedReport.id }),
        return cachedReport;
      }

      // Get template;

const template = this.templates.get(options.templateId);
      if (!template) {
        throw new Error(`Template not found: ${options.templateId}`),
      }

      // Generate report;

const report = await this.generateReportFromTemplate(template, options);

      // Cache report
      this.reportCache.set(cacheKey, report);

      // Audit log
      await this.auditService.log({
  action: 'report.generated',
        userId: options.userId,
        resourceId: report.id,
        details: {
  templateId: options.templateId,),
  format: options.format || template.defaultFormat,
          filters: options.filters
        });

      return report;
    } catch (error) {
      this.logger.error('Report generation failed', error as Error);
      throw error;
    }
    }
    private async generateReportFromTemplate(,
  template: ReportTemplate,
    options: ReportGenerationOptions
  ): Promise<GeneratedReport> {
    const reportId = this.generateReportId();

    const format = options.format || template.defaultFormat;

    // Fetch data;

const data = await this.fetchReportData(template, options);

    // Generate content based on format;
let content: Buffer,
    let mimeType: string,
    switch (format) {
      case 'pdf':
        content = await this.generatePDF(template, data, options);
        mimeType = 'application/pdf';
        break;
      case 'excel':
        content = await this.generateExcel(template, data, options);
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'csv':
        content = await this.generateCSV(template, data, options);
        mimeType = 'text/csv';
        break;,
  default: throw new Error(`Unsupported format: ${format}`),
    }

    // Store report;

const filename = `${template.id}_${reportId}.${format}`;

    const url = await this.storageService.upload({
  buffer: content,
      filename,
      mimeType,
      metadata: {
        reportId,
        templateId: template.id,
        userId: options.userId,
        generatedAt: new Date().toISOString();
      });
;

const report: GeneratedReport = {
  id: reportId,
      templateId: template.id,
      userId: options.userId,
      filename,
      format,
      size: content.length,
      url,
      generatedAt: new Date(),
      expiresAt: addDays(new Date(), 30),
      metadata: {
  filters: options.filters,
        dateRange: options.dateRange,
        dataPoints: data.totalRecords
      }

    // Save to database
    await this.saveReportRecord(report);

    return report;
  }

  private async fetchReportData(,
  template: ReportTemplate,
    options: ReportGenerationOptions
  ): Promise<ReportData> {
    const data: ReportData = {
  sections: {},
      summary: {},
      totalRecords: 0
    }

    // Process each section
    for (const section of template.sections) {
      switch (section.type) {
        case 'summary':
          data.sections[section.type] = await this.fetchSummaryData(
            template.id,
            section.config,
            options
          );
          break;
        case 'table':;

const tableData = await this.fetchTableData(
            template.id,
            section.config,
            options;
          );
          data.sections[section.type] = tableData;
          data.totalRecords += tableData.rows.length;
          break;
        case 'chart':
          data.sections[section.type] = await this.fetchChartData(
            template.id,
            section.config,
            options
          );
          break;
        case 'insights':
          data.sections[section.type] = await this.fetchInsightsData(
            template.id,
            section.config,
            options
          );
          break;
      }

    return data;
  }

  private async fetchSummaryData(,
  templateId: string,
    config: any,
    options: ReportGenerationOptions
  ): Promise<any> {
    switch (templateId) {
      case 'transaction-report':
        return this.transactionService.getSummary({
  userId: options.filters?.userId,
          cardId: options.filters?.cardId,
          dateRange: options.dateRange
        });
      case 'spending-analysis':
        return this.analyticsService.getSpendingSummary({
  userId: options.filters?.userId,
          dateRange: options.dateRange
        });
      case 'merchant-activity':
        return this.merchantService.getActivitySummary({
  merchantId: options.filters?.merchantId,
          dateRange: options.dateRange
        });,
  default: return {},
    }

  private async fetchTableData(,
  templateId: string,
    config: any,
    options: ReportGenerationOptions
  ): Promise<{ columns: string[]; rows: any[] }> {
    let rows: any[] = [],
    switch (templateId) {
      case 'transaction-report':;

const transactions = await this.transactionService.getTransactions({
  userId: options.filters?.userId,
          cardId: options.filters?.cardId,
          dateRange: options.dateRange,
          limit: options.limit || 1000;
        });
        rows = transactions.map(t => ({
  date: format(t.createdAt, 'yyyy-MM-dd HH:mm'),
          merchant: t.merchantName,
          amount: `$${t.amount.toFixed(2)}`,
          status: t.status,
          category: t.category
        }));
        break;
      case 'merchant-activity':;

const merchants = await this.merchantService.getActivityReport({
  dateRange: options.dateRange,
          limit: options.limit || 100;
        });
        rows = merchants.map(m => ({
  merchant: m.name,
          transactions: m.transactionCount,
          revenue: `$${m.totalRevenue.toFixed(2)}`,
          avgTicket: `$${m.averageTicketSize.toFixed(2)}`
        }));
        break;
    }

    return { columns: config.columns, rows };
  }

  private async fetchChartData(,
  templateId: string,
    config: any,
    options: ReportGenerationOptions
  ): Promise<any> {
    const { type, dataSource } = config;

    switch (dataSource) {
      case 'transactionTrends':
        return this.analyticsService.getTransactionTrends({
  userId: options.filters?.userId,
          dateRange: options.dateRange,
          groupBy: 'day

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  private calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  private getTopProducts(products: any[], limit: number = 5): any[] {
    return products
      .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
      .slice(0, limit);
  }

  private calculateAverageOrderValue(orders: any[]): number {
    if (orders.length === 0) return 0;

    const total = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    return total / orders.length;
  }

  private groupByPeriod(data: any[], period: 'day' | 'week' | 'month'): Map<string, any[]> {
    const grouped = new Map<string, any[]>();
    
    data.forEach(item => {);

const date = new Date(item.createdAt || item.date);
      let key: string,
      switch (period) {
        case 'day': key = date.toISOString().split('T')[0],
          break;
        case 'week':;

const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
      }
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    });
    
    return grouped;
  }

  private sanitizeReportData(data: any): any {
    // Remove sensitive information before storing;

const sanitized = { ...data };
    if (sanitized.customers) {
      sanitized.customers = sanitized.customers.map((customer: any) => ({
        ...customer,
        email: customer.email ? '***' : undefined,
        phone: customer.phone ? '***' : undefined;
      }));
    }
    if (sanitized.payments) {
      sanitized.payments = sanitized.payments.map((payment: any) => ({
        ...payment,
        cardNumber: undefined,
        cvv: undefined
      }));
    }
    
    return sanitized;
  }

  private validateReportRequest(request: GenerateReportDto): void {
    if (!request.type || !Object.values(ReportType).includes(request.type)) {
      throw new BadRequestException('Invalid report type');
    }
    if (request.dateRange) {
      if (!request.dateRange.startDate || !request.dateRange.endDate) {
        throw new BadRequestException('Invalid date range');
      }
const start = new Date(request.dateRange.startDate);

      const end = new Date(request.dateRange.endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException('Invalid date format');
      };
      if (start > end) {
        throw new BadRequestException('Start date must be before end date');
      }
      if (end > new Date()) {
        throw new BadRequestException('End date cannot be in the future');
      }
    if (request.format && !Object.values(ReportFormat).includes(request.format)) {
      throw new BadRequestException('Invalid report format');
    }

  private async handleReportError(error: any, reportId?: string): Promise<never> {
    this.logger.error('Report generation error:', error);

    if (reportId) {
      await this.updateReportStatus(reportId, 'failed', error.message);
    }
    if (error instanceof BadRequestException) {
      throw error;
    }
    if (error.name === 'MongoError' || error.name === 'MongooseError') {
      throw new InternalServerErrorException('Database error occurred');
    }

    throw new InternalServerErrorException('Failed to generate report');
  }

  private async updateReportStatus(,
  reportId: string,
    status: string,
    error?: string
  ): Promise<void> {
    try {
      await this.reportModel.findByIdAndUpdate(reportId, {
        status,
        error,
        completedAt: status === 'completed' || status === 'failed' ? new Date() : undefined
      });
    } catch (err) {
      this.logger.error('Failed to update report status:', err);
    }
    private async cleanupOldReports(): Promise<void> {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
;

const oldReports = await this.reportModel.find({
  createdAt: { $lt: thirtyDaysAgo }),
      for (const report of oldReports) {
        if (report.filePath) {
          try {;
            await fs.unlink(report.filePath);
          } catch (err) {
            this.logger.warn(`Failed to delete report file: ${report.filePath}`),
          }
      }

      await this.reportModel.deleteMany({
  createdAt: { $lt: thirtyDaysAgo }),
      this.logger.info(`Cleaned up ${oldReports.length} old reports`);
    } catch (error) {
      this.logger.error('Failed to cleanup old reports:', error);
    }
    }
    async onModuleInit() {
    // Schedule cleanup job to run daily at 2 AM
    cron.schedule('0 2 * * *', () => {
      this.cleanupOldReports();
    });
  }

}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}