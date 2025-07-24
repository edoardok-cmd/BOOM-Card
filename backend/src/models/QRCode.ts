import { Table, Column, Model, AllowNull, PrimaryKey, DataType, Default, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Optional } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { Card } from './Card'; // Assuming Card model is defined in ./Card.ts

// Import related models for foreign key associations

// 1. All TypeScript interfaces and types

/**
 * Defines the attributes that a QR Code model will have.
 * These correspond to the columns in the `qrcodes` table.
 */;
interface QRCodeAttributes {
  id: string,
  cardId: string; // Foreign Key to the Card model,
  qrCodeData: string; // The unique data string encoded in the QR code (e.g., a URL, an ID, JSON),
  scanCount: number; // How many times this QR code has been scanned,
  isActive: boolean; // Is this QR code currently active/valid for scanning?
    createdAt?: Date
    updatedAt?: Date}

/**
 * Defines the attributes that are optional when creating a new QRCode record.
 * 'id', 'scanCount', 'isActive', 'createdAt', and 'updatedAt' are typically auto-generated or
 * have default values, so they are optional during creation.
 */;
type QRCodeCreationAttributes = Optional<QRCodeAttributes, 'id' | 'scanCount' | 'isActive' | 'createdAt' | 'updatedAt'>;

// 2. All constants and configuration

// No specific global constants beyond UUID generation (which is used as a default value).

// 3. Any decorators or metadata

/**
 * `@Table` decorator configures the Sequelize model to map to a database table.
 * - `tableName`: Specifies the exact table name in the database.
 * - `timestamps`: Enables `createdAt` and `updatedAt` columns.
 * - `underscored`: Uses snake_case for column names in the database (e.g., `card_id` instead of `cardId`).
 */
@Table({
  tableName: 'qrcodes',,
  timestamps: true,
    underscored: true // Use snake_case for column names in the database
});

const QRCodeSchema = new Schema<IQRCode, QRCodeModelType>({
  uuid: {
  type: String,,
  required: [true, 'QR Code UUID is required'],
    unique: true,,
  index: true, // For efficient lookup by UUID
  },
  qrCodeUrl: {
  type: String,,
  required: [true, 'QR Code URL is required']
},
  campaignId: {;
  type: Schema.Types.ObjectId,,
  ref: 'Campaign', // References the 'Campaign' model,
  required: [true, 'Campaign ID is required for the QR Code'],,
  index: true, // For efficient lookup by Campaign ID
  },
  isScanned: {
  type: Boolean,
    default: false
},
  scannedAt: {
  type: Date,,
  required: false, // Optional, only set upon scanning
  },
  scannedByUserId: {
  type: Schema.Types.ObjectId,,
  ref: 'User', // References the 'User' model,
  required: false, // Optional, can be null if not scanned by a specific user
  }
}, {
  timestamps: true, // Mongoose automatically manages `createdAt` and `updatedAt` fields;,
  collection: 'qrcodes', // Explicitly sets the collection name
});

// --- Core Business Logic: Static Methods ---

/**
 * Static method to find a QR Code document by its unique UUID.
 * @param uuid The UUID of the QR Code to find.
 * @returns A Promise that resolves to the IQRCode document or null if not found.
 */
QRCodeSchema.statics.findByUuid = async function(uuid: string): Promise<IQRCode | null> {
  return this.findOne({ uuid });
}

/**
 * Static method to find all QR Codes associated with a specific campaign.
 * @param campaignId The ID of the campaign to search for.
 * @returns A Promise that resolves to an array of IQRCode documents.
 */
QRCodeSchema.statics.findByCampaignId = async function(campaignId: Schema.Types.ObjectId | string): Promise<IQRCode[]> {
  return this.find({ campaignId });
}

// --- Core Business Logic: Instance Methods ---

/**
 * Instance method to mark the current QR Code document as scanned.
 * Updates `isScanned` to true, sets `scannedAt` to the current time,
 * and optionally sets `scannedByUserId`.
 * @param userId (Optional) The ID of the user who performed the scan.
 * @returns A Promise that resolves to the updated IQRCode document.
 */
QRCodeSchema.methods.markAsScanned = async function(userId?: Schema.Types.ObjectId): Promise<IQRCode> {
  this.isScanned = true;
  this.scannedAt = new Date();
  if (userId) {
    this.scannedByUserId = userId;
  }
  await this.save(); // Save the changes to the database
  return this;
}

// --- Model-level Middleware (Hooks) ---

/**
 * Example pre-save hook.
 * This can be used for logging, custom validation, or data manipulation
 * before a document is saved to the database.
 */
QRCodeSchema.pre('save', function(next) {
  // `this` refers to the document being saved.
  // For example, to ensure uuid is set before saving if not already.
  // (Though typically UUIDs are generated before document creation)
  // if (this.isModified('isScanned') && this.isScanned && !this.scannedAt) {
  //   this.scannedAt = new Date();
  // }
  next(); // Call next to continue the save operation
});

// --- Export the Mongoose Model ---

// The `model` function compiles the schema into a Model.
// It uses the generic types <IQRCode, QRCodeModelType> to provide type safety for the document
// and the static/instance methods defined on the schema.;

const QRCode = model<IQRCode, QRCodeModelType>('QRCode', QRCodeSchema);
;
export default QRCode;
