// 1. All import statements
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  Index,
  OneToMany, // Potentially for relationships in the future, if transactions are linked
} from 'typeorm';

// 2. All TypeScript interfaces and types
export enum TransactionCategoryType {
  EXPENSE = 'expense',
  INCOME = 'income',
  TRANSFER = 'transfer',
  GENERAL = 'general', // Default or uncategorized type
}

/**
 * Interface representing the structure of a Category entity.
 */
export interface ICategory {
  id: string;
  name: string;
  description?: string;
  type: TransactionCategoryType;
  icon?: string; // e.g., an SVG path, a Material Design Icon name, or a URL
  userId?: string; // Optional: ID of the user who owns this category (if user-specific), null for global categories
  createdAt: Date;
  updatedAt: Date;
  // transactions?: Transaction[]; // Placeholder for future relationship, type would need `import { Transaction } from './Transaction';`
}

/**
 * Data Transfer Object for creating a new Category.
 * Picks essential fields from ICategory.
 */
export type CreateCategoryDTO = Pick<ICategory, 'name' | 'type' | 'description' | 'icon' | 'userId'>;

/**
 * Data Transfer Object for updating an existing Category.
 * All fields are optional for partial updates.
 */
export type UpdateCategoryDTO = Partial<CreateCategoryDTO>;

// 3. All constants and configuration (TransactionCategoryType enum defined above)

// 4. Any decorators or metadata (TypeORM Entity definition)
@Entity('categories')
@Index(['name', 'userId'], { unique: true }) // Ensures (name, userId) pairs are unique.
                                             // If userId is null, (name, null) must be unique among other (name, null) entries.
export class Category extends BaseEntity implements ICategory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: TransactionCategoryType,
    default: TransactionCategoryType.GENERAL,
    nullable: false,
  })
  type!: TransactionCategoryType;

  @Column({ nullable: true })
  icon?: string;

  @Column({ type: 'uuid', nullable: true }) // userId can be null for global categories
  userId?: string;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  // Example of a potential One-to-Many relationship with a Transaction entity
  // This relationship definition typically uses a string for the entity name to avoid circular dependencies
  // if Transaction also references Category. The actual Transaction class would be defined in './Transaction.ts'.
  // @OneToMany(() => 'Transaction', transaction => transaction.category)
  // transactions?: Transaction[];
}

import { Schema, model, Document, Types, Model } from 'mongoose';

// Assuming ICategory was defined in Part 1 as:
// export interface ICategory extends Document {
//   name: string;
//   parentCategory?: Types.ObjectId; // Reference to another Category
//   isCustom: boolean;
//   createdBy?: Types.ObjectId; // Reference to User model
//   // Mongoose will add _id, createdAt, updatedAt
// }

// Define an interface for the Category Model, to include static methods
interface ICategoryModel extends Model<ICategory> {
  findRootCategories(): Promise<ICategory[]>;
  findChildrenOf(parentId: Types.ObjectId | string): Promise<ICategory[]>;
  findAncestors(categoryId: Types.ObjectId | string): Promise<ICategory[]>;
  findDescendants(categoryId: Types.ObjectId | string): Promise<ICategory[]>;
  findCustomCategoriesByUser(userId: Types.ObjectId | string): Promise<ICategory[]>;
  getCategoryByName(name: string): Promise<ICategory | null>;
}

// Main class/function implementations & Core business logic

const CategorySchema = new Schema<ICategory, ICategoryModel>({
  name: {
    type: String,
    required: [true, 'Category name is required.'],
    unique: true, // Ensures unique names at the database level
    trim: true, // Trims whitespace from the beginning and end of the string
    minlength: [2, 'Category name must be at least 2 characters long.'],
    maxlength: [50, 'Category name cannot exceed 50 characters.'],
  },
  parentCategory: {
    type: Types.ObjectId,
    ref: 'Category', // Self-referencing: refers to another Category document
    default: null, // Root categories will have no parent
  },
  isCustom: {
    type: Boolean,
    default: false, // Default categories are not custom
  },
  createdBy: {
    type: Types.ObjectId,
    ref: 'User', // Reference to the User model (assuming a User model exists)
    required: function() {
      // 'createdBy' is required only if 'isCustom' is true
      return (this as ICategory).isCustom === true;
    },
  },
}, {
  timestamps: true, // Mongoose adds createdAt and updatedAt fields automatically
  toJSON: { virtuals: true }, // Ensure virtuals are included when converting to JSON
  toObject: { virtuals: true }, // Ensure virtuals are included when converting to a plain object
});

// -------------------------------------------------------------------------
// Middleware functions (Mongoose Pre/Post Hooks)
// These hooks allow you to execute logic before or after certain Mongoose operations.
// -------------------------------------------------------------------------

/**
 * Pre-save hook:
 * - Trims the category name.
 * - Validates that if a parentCategory is provided, it exists and is not the category itself.
 * - Ensures that custom categories have a creator.
 */
CategorySchema.pre('save', async function (next) {
  // Trim the 'name' field if it has been modified
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }

  // If 'parentCategory' is provided and modified, validate it
  if (this.isModified('parentCategory') && this.parentCategory) {
    const parentExists = await (this.constructor as ICategoryModel).findById(this.parentCategory);
    if (!parentExists) {
      return next(new Error('Parent category does not exist.'));
    }
    // Prevent a category from being its own parent
    if (this._id && this._id.equals(this.parentCategory)) {
        return next(new Error('A category cannot be its own parent.'));
    }

  // If 'isCustom' is true, ensure 'createdBy' is present
  if (this.isCustom && !this.createdBy) {
    return next(new Error('Custom categories must have a creator (createdBy).'));
  }

  next(); // Continue with the save operation
});

// -------------------------------------------------------------------------
// Core business logic (Static Methods on the Model)
// These methods operate on the Category Model itself (e.g., Category.findRootCategories()).
// -------------------------------------------------------------------------

/**
 * Finds all root categories (categories without a parent).
 * @returns {Promise<ICategory[]>} A promise that resolves to an array of root categories.
 */
CategorySchema.statics.findRootCategories = function(): Promise<ICategory[]> {
  return this.find({ parentCategory: null });
};

/**
 * Finds all direct children categories of a given parent ID.
 * @param {Types.ObjectId | string} parentId - The ID of the parent category.
 * @returns {Promise<ICategory[]>} A promise that resolves to an array of children categories.
 */
CategorySchema.statics.findChildrenOf = function(parentId: Types.ObjectId | string): Promise<ICategory[]> {
  return this.find({ parentCategory: parentId });
};

/**
 * Finds all custom categories created by a specific user.
 * @param {Types.ObjectId | string} userId - The ID of the user.
 * @returns {Promise<ICategory[]>} A promise that resolves to an array of custom categories.
 */
CategorySchema.statics.findCustomCategoriesByUser = function(userId: Types.ObjectId | string): Promise<ICategory[]> {
  return this.find({ isCustom: true, createdBy: userId });
};

/**
 * Finds a category by its exact name (case-sensitive due to unique: true on schema).
 * @param {string} name - The name of the category to find.
 * @returns {Promise<ICategory | null>} A promise that resolves to the found category document or null if not found.
 */
CategorySchema.statics.getCategoryByName = function(name: string): Promise<ICategory | null> {
  return this.findOne({ name: name });
};

/**
 * Finds all ancestor categories for a given category, from its immediate parent up to the root.
 * Uses Mongoose's `$graphLookup` aggregation operator for efficient traversal.
 * @param {Types.ObjectId | string} categoryId - The ID of the starting category.
 * @returns {Promise<ICategory[]>} A promise that resolves to an array of ancestor categories.
 */
CategorySchema.statics.findAncestors = async function(categoryId: Types.ObjectId | string): Promise<ICategory[]> {
  const result = await this.aggregate([
    { $match: { _id: new Types.ObjectId(categoryId) } }, // Start from the specific category
    {
      $graphLookup: {
        from: 'categories', // The collection to join (self-referencing)
        startWith: '$parentCategory', // Start the recursive search with the parentCategory field
        connectFromField: 'parentCategory', // Field from which to connect (the parent in the current document)
        connectToField: '_id', // Field to which to connect (the ID of the target document)
        as: 'ancestors', // Name of the array field added to the output documents
        depthField: 'depth', // Optional: adds a 'depth' field to each element in 'ancestors'
      },
    { $unwind: '$ancestors' }, // Deconstructs the 'ancestors' array so each ancestor is a separate document
    { $sort: { 'ancestors.depth': 1 } }, // Sort ancestors by depth (root first)
    { $replaceRoot: { newRoot: '$ancestors' } }, // Promotes the ancestor document to the root level
    { $project: { __v: 0, createdAt: 0, updatedAt: 0 } } // Exclude unnecessary fields
  ]);
  return result;
};

/**
 * Finds all descendant categories for a given category, from its immediate children down to the leaf nodes.
 * Uses Mongoose's `$graphLookup` aggregation operator for efficient traversal.
 * @param {Types.ObjectId | string} categoryId - The ID of the starting category.
 * @returns {Promise<ICategory[]>} A promise that resolves to an array of descendant categories.
 */
CategorySchema.statics.findDescendants = async function(categoryId: Types.ObjectId | string): Promise<ICategory[]> {
    { $match: { _id: new Types.ObjectId(categoryId) } }, // Start from the specific category
    {
      $graphLookup: {
        from: 'categories', // The collection to join (self-referencing)
        startWith: '$_id', // Start the recursive search with the current category's ID
        connectFromField: '_id', // The field in the 'categories' collection to connect FROM (i.e., this is the parent)
        connectToField: 'parentCategory', // The field in the 'categories' collection to connect TO (i.e., this is the child's parentCategory)
        as: 'descendants', // Name of the array field added to the output documents
        depthField: 'depth', // Optional: adds a 'depth' field to each element in 'descendants'
      },
    { $unwind: '$descendants' }, // Deconstructs the 'descendants' array
    { $sort: { 'descendants.depth': 1 } }, // Sort descendants by depth
    { $replaceRoot: { newRoot: '$descendants' } }, // Promotes the descendant document to the root level
    { $project: { __v: 0, createdAt: 0, updatedAt: 0 } } // Exclude unnecessary fields
  ]);
  // Filter out the starting category itself, as $graphLookup with startWith: '$_id' includes it.
  return result.filter((cat: ICategory) => !cat._id.equals(categoryId));
};

// -------------------------------------------------------------------------
// Core business logic (Instance Methods on a Document)
// These methods operate on a specific Category document (e.g., category.isRoot()).
// -------------------------------------------------------------------------

/**
 * Populates the 'parentCategory' field of the current category document with the actual parent document.
 * @returns {Promise<ICategory>} The current category document with 'parentCategory' populated.
 */
CategorySchema.methods.populateParent = function(): Promise<ICategory> {
  return this.populate('parentCategory');
};

/**
 * Finds and returns the direct children categories of the current category instance.
 * @returns {Promise<ICategory[]>} A promise that resolves to an array of children categories.
 */
CategorySchema.methods.getChildren = function(): Promise<ICategory[]> {
  // Use the static method to find children
  return (this.constructor as ICategoryModel).findChildrenOf(this._id);
};

/**
 * Checks if the current category is a root category (i.e., it has no parent).
 * @returns {boolean} True if it's a root category, false otherwise.
 */
CategorySchema.methods.isRoot = function(): boolean {
  return this.parentCategory === null || this.parentCategory === undefined;
};

// -------------------------------------------------------------------------
// Model Export
// -------------------------------------------------------------------------

// Create and export the Mongoose model
const Category = model<ICategory, ICategoryModel>('Category', CategorySchema);

export default Category;

}
}
}
