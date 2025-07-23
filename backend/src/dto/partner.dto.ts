import {
  IsString,
  IsOptional,
  IsUrl,
  IsEmail,
  IsEnum,
  MinLength,
  MaxLength,
  IsUUID,
  IsIn,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

// --- Enums ---
export enum PartnerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  BLOCKED = 'blocked',
}

// --- Interfaces and Types ---

// Base interface for common partner properties, used for DTO creation
interface IPartnerBase {
  name: string;
  description?: string;
  websiteUrl?: string;
  logoUrl?: string;
  contactEmail?: string;
  status?: PartnerStatus;
}

// DTO for creating a new partner
export class CreatePartnerDto implements IPartnerBase {
  @IsString()
  @MinLength(PARTNER_NAME_MIN_LENGTH)
  @MaxLength(PARTNER_NAME_MAX_LENGTH)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(PARTNER_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(PARTNER_URL_MAX_LENGTH)
  websiteUrl?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(PARTNER_URL_MAX_LENGTH)
  logoUrl?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(PARTNER_EMAIL_MAX_LENGTH)
  contactEmail?: string;

  @IsOptional()
  @IsEnum(PartnerStatus)
  status?: PartnerStatus;
}

// DTO for updating an existing partner (all fields are optional)
export class UpdatePartnerDto implements Partial<IPartnerBase> {
  @IsOptional()
  @IsString()
  @MinLength(PARTNER_NAME_MIN_LENGTH)
  @MaxLength(PARTNER_NAME_MAX_LENGTH)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(PARTNER_DESCRIPTION_MAX_LENGTH)
  description?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(PARTNER_URL_MAX_LENGTH)
  websiteUrl?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(PARTNER_URL_MAX_LENGTH)
  logoUrl?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(PARTNER_EMAIL_MAX_LENGTH)
  contactEmail?: string;

  @IsOptional()
  @IsEnum(PartnerStatus)
  status?: PartnerStatus;
}

// DTO for retrieving a partner (response from API)
export class PartnerResponseDto implements IPartnerBase {
  @IsUUID('4') // Assuming UUID v4 for IDs
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  websiteUrl?: string;

  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsEnum(PartnerStatus)
  status: PartnerStatus;

  @IsDateString()
  createdAt: Date;

  @IsDateString()
  updatedAt: Date;
}

// DTO for querying partners (e.g., for search, filtering, pagination)
export class PartnerQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(2) // Minimum length for a meaningful search term
  search?: string; // Generic search term across multiple fields

  @IsOptional()
  @IsEnum(PartnerStatus)
  status?: PartnerStatus;

  @IsOptional()
  @IsString()
  name?: string; // Specific search by name

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number) // Converts string from query params to number
  page?: number = DEFAULT_PAGE_NUMBER;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number) // Converts string from query params to number
  limit?: number = DEFAULT_PAGE_LIMIT;

  @IsOptional()
  @IsString()
  sortBy?: string = DEFAULT_SORT_BY; // e.g., 'createdAt', 'name'

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = DEFAULT_SORT_ORDER;
}

// --- Constants and Configuration ---
export const PARTNER_NAME_MIN_LENGTH = 3;
export const PARTNER_NAME_MAX_LENGTH = 100;
export const PARTNER_DESCRIPTION_MAX_LENGTH = 500;
export const PARTNER_URL_MAX_LENGTH = 2048; // Standard maximum URL length
export const PARTNER_EMAIL_MAX_LENGTH = 255; // Standard maximum email length

// Default pagination and sorting values for query DTOs
export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_LIMIT = 10;
export const DEFAULT_SORT_BY = 'createdAt';
export const DEFAULT_SORT_ORDER = 'desc';

// --- PART 2 START ---

import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  IsUUID,
  ValidateNested,
  IsBoolean,
  IsNumber,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

// Assume these enums and base DTOs were defined in Part 1 or are globally available
// For completeness, re-declaring them here.
export enum PartnerStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED',
}

export enum PartnerTypeEnum {
  MERCHANT = 'MERCHANT',
  DISTRIBUTOR = 'DISTRIBUTOR',
  INTEGRATOR = 'INTEGRATOR',
  SERVICE_PROVIDER = 'SERVICE_PROVIDER',
  OTHER = 'OTHER',
}

export class AddressDto {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiPropertyOptional({ description: 'Apartment, suite, etc.' })
  @IsString()
  @IsOptional()
  apartment?: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State or Province' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class BrandingInfoDto {
  @ApiPropertyOptional({
    description: 'URL to the partner logo',
    example: 'https://example.com/logo.png',
  })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({
    description: 'Primary brand color (hex code)',
    example: '#FF0000',
  })
  @IsString()
  @IsOptional()
  primaryColor?: string;

  @ApiPropertyOptional({
    description: 'Secondary brand color (hex code)',
    example: '#0000FF',
  })
  @IsString()
  @IsOptional()
  secondaryColor?: string;

  @ApiPropertyOptional({
    description: 'Custom font name or URL',
    example: 'Roboto',
  })
  @IsString()
  @IsOptional()
  customFont?: string;
}

/**
 * DTO for creating a new Partner.
 * Defines the required fields for onboarding a new partner.
 */
export class CreatePartnerDto {
  @ApiProperty({ description: 'Display name of the partner', example: 'Boom Card Retail' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Official legal name of the partner', example: 'Boom Card Inc.' })
  @IsString()
  @IsNotEmpty()
  legalName: string;

  @ApiProperty({ enum: PartnerTypeEnum, description: 'Type of the partner' })
  @IsEnum(PartnerTypeEnum)
  @IsNotEmpty()
  type: PartnerTypeEnum;

  @ApiProperty({ description: 'Primary contact person for the partner', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  contactPerson: string;

  @ApiProperty({ description: 'Primary contact email for the partner', example: 'john.doe@example.com' })
  @IsEmail()
  @IsNotEmpty()
  contactEmail: string;

  @ApiPropertyOptional({ description: 'Primary contact phone number for the partner', example: '+1234567890' })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiProperty({ description: 'Physical address of the partner' })
  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
  address: AddressDto;

  @ApiProperty({ description: 'Default currency for transactions with this partner (e.g., USD, CAD)', example: 'USD' })
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiPropertyOptional({ description: 'Branding information for the partner' })
  @ValidateNested()
  @Type(() => BrandingInfoDto)
  @IsOptional()
  brandingInfo?: BrandingInfoDto;

  @ApiPropertyOptional({
    description: 'Boolean indicating if API access is enabled for this partner',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  apiAccessEnabled?: boolean = true;
}

/**
 * DTO for updating an existing Partner.
 * Extends CreatePartnerDto, making all fields optional, and allows updating the status.
 */
export class UpdatePartnerDto extends PartialType(CreatePartnerDto) {
  @ApiPropertyOptional({ enum: PartnerStatusEnum, description: 'Current operational status of the partner' })
  @IsEnum(PartnerStatusEnum)
  @IsOptional()
  status?: PartnerStatusEnum;
}

/**
 * DTO for filtering partners when fetching a list.
 * Used for query parameters in GET /partners.
 */
export class GetPartnersFilterDto {
  @ApiPropertyOptional({ description: 'Filter by partial or full partner name', example: 'Boom' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ enum: PartnerTypeEnum, description: 'Filter by partner type' })
  @IsEnum(PartnerTypeEnum)
  @IsOptional()
  type?: PartnerTypeEnum;

  @ApiPropertyOptional({ enum: PartnerStatusEnum, description: 'Filter by partner status' })
  @IsEnum(PartnerStatusEnum)
  @IsOptional()
  status?: PartnerStatusEnum;

  @ApiPropertyOptional({ description: 'Filter by contact email', example: 'john.doe@example.com' })
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional({ description: 'Page number for pagination', example: 1, default: 1 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page for pagination', example: 10, default: 10 })
  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}

/**
 * DTO for the response structure when retrieving partner details.
 * Contains all read-only fields of a Partner.
 */
export class PartnerResponseDto {
  @ApiProperty({ description: 'Unique identifier of the partner', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Display name of the partner', example: 'Boom Card Retail' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Official legal name of the partner', example: 'Boom Card Inc.' })
  @IsString()
  legalName: string;

  @ApiProperty({ enum: PartnerTypeEnum, description: 'Type of the partner' })
  @IsEnum(PartnerTypeEnum)
  type: PartnerTypeEnum;

  @ApiProperty({ enum: PartnerStatusEnum, description: 'Current operational status of the partner' })
  @IsEnum(PartnerStatusEnum)
  status: PartnerStatusEnum;

  @ApiProperty({ description: 'Primary contact person for the partner', example: 'John Doe' })
  @IsString()
  contactPerson: string;

  @ApiProperty({ description: 'Primary contact email for the partner', example: 'john.doe@example.com' })
  @IsEmail()
  contactEmail: string;

  @ApiPropertyOptional({ description: 'Primary contact phone number for the partner', example: '+1234567890' })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiProperty({ description: 'Physical address of the partner' })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({ description: 'Default currency for transactions with this partner', example: 'USD' })
  @IsString()
  currency: string;

  @ApiPropertyOptional({ description: 'Branding information for the partner' })
  @ValidateNested()
  @Type(() => BrandingInfoDto)
  @IsOptional()
  brandingInfo?: BrandingInfoDto;

  @ApiProperty({
    description: 'Boolean indicating if API access is enabled for this partner',
    example: true,
  })
  @IsBoolean()
  apiAccessEnabled: boolean;

  @ApiProperty({ description: 'Timestamp when the partner was created', example: '2023-01-01T12:00:00Z' })
  @IsDateString()
  createdAt: Date;

  @ApiProperty({ description: 'Timestamp when the partner was last updated', example: '2023-01-01T12:00:00Z' })
  @IsDateString()
  updatedAt: Date;
}
