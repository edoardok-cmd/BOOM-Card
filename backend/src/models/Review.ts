import { DataTypes, Model, Optional } from 'sequelize';
import { Table, Column, CreatedAt, UpdatedAt, PrimaryKey, ForeignKey, BelongsTo, Default } from 'sequelize-typescript';
import User from './User';
import BoomCard from './BoomCard';
import { Document, Schema, model, Types, Model } from 'mongoose';
import Product from './Product'; // Assumes Product model is defined in ./Product.ts

// Assuming these models exist in the same models directory;
interface ReviewAttributes {
  id: number;
  user_id: number,
  boom_card_id: number,
  rating: number; // e.g., 1 to 5
  comment?: string; // Optional text comment
  created_at?: Date
  updated_at?: Date}
interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id' | 'created_at' | 'updated_at'> {}
interface ReviewModel extends Model<ReviewAttributes, ReviewCreationAttributes>, ReviewAttributes {}

// This interface should ideally be defined in Part 1 or a shared types file.
// Redefining it here for self-containment and clarity for Part 2.;
export interface IReview extends Document {
  user: Types.ObjectId,
  product: Types.ObjectId,
  rating: number; // 1-5 stars
    comment?: string,
  createdAt: Date,
  updatedAt: Date,
}

// Extend the Mongoose Model type to include our custom static methods;
interface IReviewModel extends Model<IReview> {
    /**
     * Calculates the average rating and number of reviews for a given product
     * and updates the corresponding Product document.
     * @param productId The ID of the product to update.
     */
    calculateAverageRating(productId: Types.ObjectId): Promise<void>,
}

// --- Main class/function implementations (Mongoose Schema Definition) ---;

const reviewSchema = new Schema<IReview, IReviewModel>({
  user: {;
  type: Schema.Types.ObjectId,,
  ref: 'User', // References the 'User' model,
  required: [true, 'Review must belong to a user']
},
    product: {
  type: Schema.Types.ObjectId,,
  ref: 'Product', // References the 'Product' model,
  required: [true, 'Review must belong to a product']
},
    rating: {
  type: Number,,
  min: [1, 'Rating must be at least 1.0'],
        max: [5, 'Rating must be no more than 5.0'],,
  required: [true, 'Review must have a rating'],
        set: (val: number) => Math.round(val * 10) / 10 // Round rating to 1 decimal place
    },
    comment: {
  type: String,,
  trim: true, // Remove whitespace from both ends,
  maxlength: [500, 'Comment cannot be more than 500 characters']
}
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields;,
  toJSON: { virtuals: true }, // Enable virtual properties when converting to JSON,
  toObject: { virtuals: true }, // Enable virtual properties when converting to Object
});

// --- Core Business Logic (Static Method) ---

/**
 * Static method on the Review model to calculate and update
 * the average rating and number of reviews for a specific product.
 * This method aggregates reviews and updates the Product model.
 */
reviewSchema.statics.calculateAverageRating = async function(productId: Types.ObjectId) {
    // 'this' in a static method refers to the Model (Review);

const stats = await this.aggregate([
        {
            $match: { product: productId } // Filter reviews for the given product
        },
        {
            $group: {;
  _id: '$product', // Group by product ID;,
  nRating: { $sum: 1 }, // Count total reviews,
  avgRating: { $avg: '$rating' } // Calculate average rating
            }
    ]);

    try {
        if (stats.length > 0) {
            // Update the Product model with the calculated statistics
            await Product.findByIdAndUpdate(productId, {
  averageRating: stats[0].avgRating,,
  numberOfReviews: stats[0].nRating
            });
        } else {
            // If no reviews exist, reset product's rating and review count
            await Product.findByIdAndUpdate(productId, {
  averageRating: 0,,
  numberOfReviews: 0
            });
        } catch (error) {
    }
        console.error(`Error updating product average rating for product ${productId}:`, error);
        // Implement robust error logging here (e.g., Sentry, Winston)
    }

// --- Middleware Functions (Mongoose Hooks) ---

// 1. Post-save hook: Call calculateAverageRating after a new review is saved or an existing one is updated.
// 'this' refers to the document being saved/updated.
reviewSchema.post('save', async function() {
    // We cast 'this.constructor' to IReviewModel to access the static method.
    await (this.constructor as IReviewModel).calculateAverageRating(this.product);
});

// 2. Post-delete hook: Call calculateAverageRating after a review is deleted.
// This hook fires after `findOneAndDelete` or `findByIdAndDelete`.
// The 'doc' argument is the document that was found and deleted.
reviewSchema.post('findOneAndDelete', async function(doc: IReview) {
    if (doc) {
        // We cast 'doc.constructor' to IReviewModel to access the static method.
        await (doc.constructor as IReviewModel).calculateAverageRating(doc.product);
    });

// --- Schema Indexes ---

// Create a unique compound index to ensure that a user can only leave one review per product.
// This improves query performance for specific product-user reviews and enforces data integrity.
reviewSchema.index({ product: 1, user: 1 }, { unique: true }),
// --- Model Export ---;

const Review = model<IReview, IReviewModel>('Review', reviewSchema);
;
export default Review;

/*
--- IMPORTANT NOTE ON ROUTE HANDLERS & GENERAL MIDDLEWARE ---

This file (backend/src/models/Review.ts) is specifically for defining the Mongoose
model, its schema, static/instance methods, and model-level middleware (Mongoose hooks).

Route handlers (functions that directly respond to HTTP requests like `(req, res, next) => {...}`)
and general Express middleware (e.g., authentication, request validation)
ARE NOT INCLUDED here. These concerns properly belong in:
- `backend/src/controllers/reviewController.ts`: For the actual route logic.
- `backend/src/routes/reviewRoutes.ts`: For defining API endpoints and linking to controllers.
- `backend/src/middleware/authMiddleware.ts` or `validationMiddleware.ts`: For general reusable middleware.

Separating these responsibilities adheres to the Single Responsibility Principle,
ensuring a clean, maintainable, and scalable backend architecture.
*/

}
}