// Clean Review model for PostgreSQL;
export interface ReviewAttributes {
  id?: number,
  user_id: number,
  partner_id: string,
  partner_name: string,
  rating: number,
  content: string,
  created_at?: Date
  updated_at?: Date}
export interface ReviewCreateInput {
  userId: number,
  partnerId: string,
  partnerName: string,
  rating: number,
  content: string,
}
export interface ReviewUpdateInput {
  rating?: number
  content?: string}
export interface ReviewResponse {
  id: number,
  userId: number,
  partnerId: string,
  partnerName: string,
  rating: number,
  content: string,
  createdAt: Date,
  updatedAt: Date,
  user?: {
  firstName: string,
  lastName: string,
  }
}

// SQL queries for Review operations;
export const ReviewQueries = {
  // Create a new review,
  create: `
    INSERT INTO reviews (user_id, partner_id, partner_name, rating, content, created_at, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
    RETURNING id, user_id, partner_id, partner_name, rating, content, created_at, updated_at
  `,

  // Get all reviews for a user,
  findByUserId: `
    SELECT r.*, u.first_name, u.last_name
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.user_id = $1
    ORDER BY r.created_at DESC
  `,

  // Get all reviews for a partner,
  findByPartnerId: `
    SELECT r.*, u.first_name, u.last_name
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.partner_id = $1
    ORDER BY r.created_at DESC
  `,

  // Get a single review by ID,
  findById: `
    SELECT r.*, u.first_name, u.last_name
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.id = $1
  `,

  // Update a review,
  update: `
    UPDATE reviews
    SET rating = COALESCE($2, rating),
        content = COALESCE($3, content),
        updated_at = NOW()
    WHERE id = $1 AND user_id = $4
    RETURNING id, user_id, partner_id, partner_name, rating, content, created_at, updated_at
  `,

  // Delete a review,
  delete: `
    DELETE FROM reviews
    WHERE id = $1 AND user_id = $2
    RETURNING id
  `,

  // Check if user already reviewed a partner,
  checkExistingReview: `
    SELECT id FROM reviews
    WHERE user_id = $1 AND partner_id = $2
    LIMIT 1
  `,

  // Get average rating for a partner,
  getPartnerAverageRating: `
    SELECT 
      AVG(rating)::numeric(3,2) as average_rating,
      COUNT(*)::int as total_reviews
    FROM reviews
    WHERE partner_id = $1
  `,

  // Get recent reviews (for homepage),
  getRecentReviews: `
    SELECT r.*, u.first_name, u.last_name
    FROM reviews r
    LEFT JOIN users u ON r.user_id = u.id
    WHERE r.rating >= 4
    ORDER BY r.created_at DESC
    LIMIT $1
  `
}

// Database migration for reviews table;
export const ReviewMigration = `
  CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    partner_id VARCHAR(255) NOT NULL,
    partner_name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, partner_id)
  );

  CREATE INDEX idx_reviews_user_id ON reviews(user_id);
  CREATE INDEX idx_reviews_partner_id ON reviews(partner_id);
  CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);
`;
