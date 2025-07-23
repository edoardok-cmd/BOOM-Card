// 1. All import statements
// No external library imports are specifically needed for defining interfaces and types.

// 2. All TypeScript interfaces and types

/**
 * Enum for the type of discount.
 */
export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
}

/**
 * Enum for what the discount applies to.
 * This can be extended based on specific business logic, e.g., categories, user groups.
 */
export enum DiscountAppliesTo {
  ALL_PRODUCTS = 'all_products',
  SPECIFIC_PRODUCTS = 'specific_products',
  SPECIFIC_CATEGORIES = 'specific_categories',
  // Further types like FIRST_ORDER, NEW_USERS could be added here
}

/**
 * Interface representing a Discount entity in the database.
 * This defines the shape of the data for a discount.
 */
export interface IDiscount {
  id: string; // Unique identifier for the discount (e.g., UUID)
  code: string; // The unique discount code (e.g., "SUMMER20", "SAVE10")
  type: DiscountType; // The type of discount (e.g., 'percentage', 'fixed_amount')
  value: number; // The discount value (e.g., 10 for 10% or $10 off)

  min_purchase_amount?: number; // Optional: Minimum order amount required to apply the discount
  max_discount_amount?: number; // Optional: Maximum discount amount that can be applied (e.g., 10% off up to $20)
  usage_limit?: number; // Optional: Total number of times this discount can be used across all users
  per_user_limit?: number; // Optional: Number of times a single user can apply this discount
  
  applies_to?: DiscountAppliesTo; // Optional: Specifies what the discount applies to
  applies_to_ids?: string[]; // Optional: Array of IDs (product, category, etc.) if 'applies_to' is specific

  start_date: Date; // The date from which the discount is valid
  end_date: Date; // The date until which the discount is valid

  active: boolean; // Whether the discount is currently active and usable
  created_at: Date; // Timestamp when the discount was created
  updated_at: Date; // Timestamp when the discount was last updated
}

/**
 * Interface for creating a new Discount.
 * Omits auto-generated fields like 'id', 'created_at', 'updated_at'.
 * 'active' can be provided but often defaults to true.
 */
export interface IDiscountCreatePayload {
  code: string;
  type: DiscountType;
  value: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  per_user_limit?: number;
  applies_to?: DiscountAppliesTo;
  applies_to_ids?: string[];
  start_date: Date;
  end_date: Date;
  active?: boolean;
}

/**
 * Interface for updating an existing Discount.
 * All fields are optional as an update may only modify a subset of fields.
 */
export interface IDiscountUpdatePayload {
  code?: string;
  type?: DiscountType;
  value?: number;
  min_purchase_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  per_user_limit?: number;
  applies_to?: DiscountAppliesTo;
  applies_to_ids?: string[];
  start_date?: Date;
  end_date?: Date;
  active?: boolean;
}

// 3. All constants and configuration

// Constants for discount code validation
export const DISCOUNT_CODE_MIN_LENGTH: number = 4;
export const DISCOUNT_CODE_MAX_LENGTH: number = 20;

// Arrays containing all valid enum values for validation purposes
export const VALID_DISCOUNT_TYPES: DiscountType[] = Object.values(DiscountType);
export const VALID_DISCOUNT_APPLIES_TO: DiscountAppliesTo[] = Object.values(DiscountAppliesTo);

// 4. Any decorators or metadata
// No decorators are required for basic TypeScript interface and type definitions.
// Decorators would typically be used with specific ORM libraries (e.g., TypeORM's @Entity, @Column).

// Part 2: Main class/function implementations, core business logic, middleware functions

const DiscountSchema = new Schema<IDiscountDocument, IDiscountModel>({
    code: {
        type: String,
        required: [true, 'Discount code is required'],
        unique: true,
        trim: true,
        uppercase: true, // Ensure codes are stored consistently
    },
    type: {
        type: String,
        enum: Object.values(DiscountType),
        required: [true, 'Discount type is required'],
    },
    value: {
        type: Number,
        required: [true, 'Discount value is required'],
        min: [0, 'Discount value cannot be negative'],
    },
    isPercentage: {
        type: Boolean,
        required: [true, 'Specify if discount is a percentage or fixed amount'],
    },
    description: {
        type: String,
        trim: true,
    },
    startDate: {
        type: Date,
        required: [true, 'Discount start date is required'],
    },
    endDate: {
        type: Date,
        required: [true, 'Discount end date is required'],
        validate: {
            validator: function (this: IDiscountDocument, val: Date): boolean {
                // Ensure endDate is not before startDate
                return val >= this.startDate;
            },
            message: 'End date must be on or after start date',
        },
    },
    minimumPurchaseAmount: {
        type: Number,
        min: [0, 'Minimum purchase amount cannot be negative'],
        default: 0, // A discount can apply to any amount if not specified
    },
    maximumUses: {
        type: Number,
        min: [0, 'Maximum uses cannot be negative'],
        default: null, // null implies unlimited uses
    },
    currentUses: {
        type: Number,
        default: 0,
        min: [0, 'Current uses cannot be negative'],
    },
    applicableItems: [{
        type: Schema.Types.ObjectId,
        ref: 'Product', // Assuming 'Product' is another model
    }],
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Assuming 'User' is another model
        required: false, // Could be null for initial system discounts or if admin info not recorded
    },
    updatedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt fields automatically
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true }, // Include virtuals when converting to object
});

// -------------------------------------------------------------------------
// Middleware Functions (Mongoose Pre/Post Hooks)
// -------------------------------------------------------------------------

// Pre-save hook for validation or side effects before saving
DiscountSchema.pre('save', function (next) {
    // Ensure currentUses does not exceed maximumUses if maximumUses is set
    if (this.isModified('currentUses') && this.maximumUses !== null && this.currentUses > this.maximumUses) {
        return next(new Error('Current uses cannot exceed maximum uses.'));
    }
    // Convert code to uppercase before saving for consistent lookup
    if (this.isModified('code')) {
        this.code = this.code.toUpperCase();
    }
    next();
});

// -------------------------------------------------------------------------
// Core Business Logic (Instance Methods)
// -------------------------------------------------------------------------

/**
 * Checks if the discount is currently active based on dates and usage limits.
 * This is a helper method for the document instance.
 * @returns {boolean} True if the discount is active, false otherwise.
 */
DiscountSchema.methods.isActive = function (): boolean {
    const now = new Date();
    const isDateValid = now >= this.startDate && now <= this.endDate;
    const isUsageValid = this.maximumUses === null || this.currentUses < this.maximumUses;
    return isDateValid && isUsageValid;
};

/**
 * Checks if the discount is valid for a given purchase amount, considering activity and minimum purchase.
 * @param {number} purchaseAmount The total amount of the purchase.
 * @returns {boolean} True if the discount is valid for the purchase, false otherwise.
 */
DiscountSchema.methods.isValidForPurchase = function (purchaseAmount: number): boolean {
    if (!this.isActive()) {
        return false;
    }
    // Check minimum purchase amount
    if (this.minimumPurchaseAmount !== undefined && purchaseAmount < this.minimumPurchaseAmount) {
        return false;
    }
    // Additional logic could be added here for `applicableItems` if needed.
    // For example, if a discount only applies to specific products, you'd check if the purchase includes those products.
    return true;
};

/**
 * Applies the discount to an original price and returns the discounted price.
 * Throws an error if the discount is not valid for the given purchase amount.
 * @param {number} originalPrice The original price before discount.
 * @returns {number} The price after discount is applied.
 * @throws {Error} If the discount is not valid for the provided price (e.g., expired, minimum not met).
 */
DiscountSchema.methods.applyDiscount = function (originalPrice: number): number {
    if (!this.isValidForPurchase(originalPrice)) {
        // More specific errors could be thrown here (e.g., DiscountExpiredError, MinimumPurchaseAmountNotMetError)
        throw new Error('Discount is not valid for this purchase or has expired/reached max uses.');
    }

    let discountedPrice = originalPrice;

    if (this.isPercentage) {
        if (this.value < 0 || this.value > 100) {
            throw new Error('Percentage discount value must be between 0 and 100.');
        }
        const discountAmount = originalPrice * (this.value / 100);
        discountedPrice = originalPrice - discountAmount;
    } else { // Fixed amount
        if (this.value < 0) {
            // This should ideally be caught by schema validation (min: 0) but as a safeguard.
            throw new Error('Fixed amount discount value cannot be negative.');
        }
        discountedPrice = originalPrice - this.value;
    }

    // Ensure the discounted price does not go below zero
    return Math.max(0, discountedPrice);
};

// -------------------------------------------------------------------------
// Core Business Logic (Static Methods)
// -------------------------------------------------------------------------

/**
 * Finds a discount by its unique code.
 * @param {string} code The discount code to search for.
 * @returns {Promise<IDiscountDocument | null>} The found discount document, or null if not found.
 */
DiscountSchema.statics.findByCode = async function (code: string): Promise<IDiscountDocument | null> {
    return this.findOne({ code: code.toUpperCase() });
};

/**
 * Finds an active discount by its unique code, considering its dates and usage limits.
 * This static method combines a database query for date validity with the instance method for full activity check.
 * @param {string} code The discount code to search for.
 * @returns {Promise<IDiscountDocument | null>} The found and active discount document, or null if not found or not active.
 */
DiscountSchema.statics.findActiveByCode = async function (code: string): Promise<IDiscountDocument | null> {
    // First, query the database based on code and date validity to leverage indexing
    const discount = await this.findOne({
        code: code.toUpperCase(),
        startDate: { $lte: now },
        endDate: { $gte: now },
    });

    // Then, use the instance method to perform the complete activity check (including usage limits)
    if (discount && discount.isActive()) {
        return discount;
    }
    return null;
};

// -------------------------------------------------------------------------
// Model Export
// -------------------------------------------------------------------------

const Discount = mongoose.model<IDiscountDocument, IDiscountModel>('Discount', DiscountSchema);

export default Discount;
