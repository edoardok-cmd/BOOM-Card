import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { parse } from 'csv-parse';
import * as xlsx from 'xlsx';
import { createReadStream } from 'fs';
import { Readable } from 'stream';
import { Partner } from '../entities/partner.entity';
import { Location } from '../entities/location.entity';
import { Category } from '../entities/category.entity';
import { Discount } from '../entities/discount.entity';
import { OpeningHours } from '../entities/opening-hours.entity';
import { LoggerService } from './logger.service';
import { NotificationService } from './notification.service';
import { ValidationService } from './validation.service';
import { CacheService } from './cache.service';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  importedRecords: number;
  failedRecords: number;
  errors: ImportError[];
  warnings: ImportWarning[];
  duration: number;
}

export interface ImportError {
  row: number;
  field: string;
  value: any;
  message: string;
}

export interface ImportWarning {
  row: number;
  field: string;
  message: string;
}

export interface ImportOptions {
  batchSize?: number;
  validateOnly?: boolean;
  updateExisting?: boolean;
  notifyPartners?: boolean;
  generateCredentials?: boolean;
  defaultLanguage?: string;
}

export interface PartnerImportData {
  // Basic Information
  businessName: string;
  businessNameEn?: string;
  email: string;
  phone: string;
  website?: string;
  description?: string;
  descriptionEn?: string;
  
  // Location Information
  address: string;
  addressEn?: string;
  city: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  
  // Category & Type
  category: string;
  subcategory?: string;
  businessType?: string;
  
  // Discount Information
  discountPercentage: number;
  discountDescription?: string;
  discountDescriptionEn?: string;
  discountConditions?: string;
  discountConditionsEn?: string;
  validFrom?: Date;
  validUntil?: Date;
  
  // Opening Hours (JSON string or object)
  openingHours?: string | any;
  
  // Features & Amenities
  features?: string;
  amenities?: string;
  
  // Images
  logoUrl?: string;
  coverImageUrl?: string;
  galleryImages?: string;
  
  // Contact Person
  contactPersonName?: string;
  contactPersonPhone?: string;
  contactPersonEmail?: string;
  
  // Status
  isActive?: boolean;
  isVerified?: boolean;
  
  // Payment & POS
  acceptsCash?: boolean;
  acceptsCard?: boolean;
  hasPosIntegration?: boolean;
  posSystemType?: string;
}

@Injectable()
export class ImportHandlerService {
  private readonly defaultBatchSize = 100;
  private readonly supportedFormats = ['csv', 'xlsx', 'xls', 'json'];

  constructor(
    @InjectRepository(Partner)
    private partnerRepository: Repository<Partner>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Discount)
    private discountRepository: Repository<Discount>,
    @InjectRepository(OpeningHours)
    private openingHoursRepository: Repository<OpeningHours>,
    private dataSource: DataSource,
    private logger: LoggerService,
    private notificationService: NotificationService,
    private validationService: ValidationService,
    private cacheService: CacheService,
    private i18n: I18nService,
  ) {}

  async importPartners(
    file: Express.Multer.File,
    options: ImportOptions = {},
  ): Promise<ImportResult> {
    const startTime = Date.now();
    const result: ImportResult = {
      success: false,
      totalRecords: 0,
      importedRecords: 0,
      failedRecords: 0,
      errors: [],
      warnings: [],
      duration: 0,
    };

    try {
      // Validate file format
      const fileExtension = this.getFileExtension(file.originalname);
      if (!this.supportedFormats.includes(fileExtension)) {
        throw new Error(`Unsupported file format: ${fileExtension}`);
      }

      // Parse file data
      const data = await this.parseFile(file, fileExtension);
      result.totalRecords = data.length;

      // Process in batches
      const batchSize = options.batchSize || this.defaultBatchSize;
      const batches = this.createBatches(data, batchSize);

      for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
        const batch = batches[batchIndex];
        
        if (options.validateOnly) {
          await this.validateBatch(batch, batchIndex * batchSize, result);
        } else {
          await this.processBatch(batch, batchIndex * batchSize, options, result);
        }

      // Clear relevant caches
      if (!options.validateOnly && result.importedRecords > 0) {
        await this.clearRelatedCaches();
      }

      result.success = result.failedRecords === 0;
      result.duration = Date.now() - startTime;

      this.logger.log('Import completed', {
        totalRecords: result.totalRecords,)
        importedRecords: result.importedRecords,
        failedRecords: result.failedRecords,
        duration: result.duration,
      });

      return result;
    } catch (error) {
      this.logger.error('Import failed', error);
      result.errors.push({
        row: 0,
        field: 'general',
        value: null,
        message: error.message,
      });
      result.duration = Date.now() - startTime;
      return result;
    }

  private async parseFile(
    file: Express.Multer.File,)
    format: string,
  ): Promise<PartnerImportData[]> {
    switch (format) {
      case 'csv':
        return this.parseCsv(file);
      case 'xlsx':
      case 'xls':
        return this.parseExcel(file);
      case 'json':
        return this.parseJson(file);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }

  private async parseCsv(file: Express.Multer.File): Promise<PartnerImportData[]> {
    return new Promise((resolve, reject) => {
      const results: PartnerImportData[] = [];
      const stream = Readable.from(file.buffer);

      stream
        .pipe(
          parse({
            columns: true,
            skip_empty_lines: true,
            trim: true,
            cast: true,
            cast_date: true,
          }),
        )
        .on('data', (data) => {
          results.push(this.normalizeImportData(data));
        })
        .on('error', reject)
        .on('end', () => resolve(results));
    });
  }

  private async parseExcel(file: Express.Multer.File): Promise<PartnerImportData[]> {
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, {
      raw: false,
      dateNF: 'yyyy-mm-dd',
    });

    return jsonData.map((row) => this.normalizeImportData(row));
  }

  private async parseJson(file: Express.Multer.File): Promise<PartnerImportData[]> {
    const jsonString = file.buffer.toString('utf-8');
    
    if (!Array.isArray(data)) {
      throw new Error('JSON file must contain an array of partner data');
    }

    return data.map((row) => this.normalizeImportData(row));
  }

  private normalizeImportData(data: any): PartnerImportData {
    // Map common variations of column names
    const normalized: PartnerImportData = {
      businessName: data.businessName || data.business_name || data.name || '',
      businessNameEn: data.businessNameEn || data.business_name_en || data.name_en,
      email: data.email || data.business_email || '',
      phone: data.phone || data.telephone || data.contact_number || '',
      website: data.website || data.web || data.url,
      description: data.description || data.desc,
      descriptionEn: data.descriptionEn || data.description_en || data.desc_en,
      
      address: data.address || data.street_address || '',
      addressEn: data.addressEn || data.address_en,
      city: data.city || data.town || '',
      postalCode: data.postalCode || data.postal_code || data.zip,
      latitude: this.parseNumber(data.latitude || data.lat),
      longitude: this.parseNumber(data.longitude || data.lng || data.lon),
      
      category: data.category || data.main_category || '',
      subcategory: data.subcategory || data.sub_category,
      businessType: data.businessType || data.business_type || data.type,
      
      discountPercentage: this.parseNumber(data.discountPercentage || data.discount_percentage || data.discount || 0),
      discountDescription: data.discountDescription || data.discount_description,
      discountDescriptionEn: data.discountDescriptionEn || data.discount_description_en,
      discountConditions: data.discountConditions || data.discount_conditions || data.terms,
      discountConditionsEn: data.discountConditionsEn || data.discount_conditions_en || data.terms_en,
      validFrom: this.parseDate(data.validFrom || data.valid_from || data.start_date),
      validUntil: this.parseDate(data.validUntil || data.valid_until || data.end_date),
      
      openingHours: data.openingHours || data.opening_hours || data.hours,
      
      features: data.features || data.amenities,
      amenities: data.amenities || data.facilities,
      
      logoUrl: data.logoUrl || data.logo_url || data.logo,
      coverImageUrl: data.coverImageUrl || data.cover_image_url || data.cover,
      galleryImages: data.galleryImages || data.gallery_images || data.images,
      
      contactPersonName: data.contactPersonName || data.contact_person_name || data.contact_name,
      contactPersonPhone: data.contactPersonPhone || data.contact_person_phone || data.contact_phone,
      contactPersonEmail: data.contactPersonEmail || data.contact_person_
}}}
}
}
}
