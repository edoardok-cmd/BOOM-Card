// Partner model for PostgreSQL
export interface PartnerAttributes {
  id?: number;
  name: string;
  slug: string;
  category: string;
  description: string;
  logo?: string;
  coverImage?: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  discountPercentage: number;
  discountDescription: string;
  terms?: string;
  isActive: boolean;
  isFeatured: boolean;
  rating?: number;
  totalReviews?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PartnerCreateInput {
  name: string;
  category: string;
  description: string;
  logo?: string;
  coverImage?: string;
  address: string;
  city: string;
  phone?: string;
  email?: string;
  website?: string;
  discountPercentage: number;
  discountDescription: string;
  terms?: string;
  isFeatured?: boolean;
}

export interface PartnerUpdateInput {
  name?: string;
  category?: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  website?: string;
  discountPercentage?: number;
  discountDescription?: string;
  terms?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

export interface PartnerSearchFilters {
  category?: string;
  city?: string;
  minDiscount?: number;
  searchTerm?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}

// SQL queries for Partner operations
export const PartnerQueries = {
  // Create a new partner
  create: `
    INSERT INTO partners (name, slug, category, description, logo, cover_image, 
                         address, city, phone, email, website, 
                         discount_percentage, discount_description, terms, 
                         is_active, is_featured)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING id, name, slug, category, description, logo, cover_image, 
              address, city, phone, email, website,
              discount_percentage, discount_description, terms,
              is_active, is_featured, created_at, updated_at
  `,

  // Find partner by ID
  findById: `
    SELECT p.*, 
           0::numeric(3,2) as rating,
           0::int as total_reviews
    FROM partners p
    WHERE p.id = $1
  `,

  // Find partner by slug
  findBySlug: `
    SELECT p.*, 
           0::numeric(3,2) as rating,
           0::int as total_reviews
    FROM partners p
    WHERE p.slug = $1
  `,

  // Find all partners with filters
  findAll: `
    SELECT p.*, 
           0::numeric(3,2) as rating,
           0::int as total_reviews
    FROM partners p
    WHERE 1=1
      AND ($1::text IS NULL OR p.category = $1)
      AND ($2::text IS NULL OR p.city = $2)
      AND ($3::int IS NULL OR p.discount_percentage >= $3)
      AND ($4::text IS NULL OR (
        LOWER(p.name) LIKE LOWER($4) OR 
        LOWER(p.description) LIKE LOWER($4) OR
        LOWER(p.category) LIKE LOWER($4)
      ))
      AND ($5::boolean IS NULL OR p.is_active = $5)
      AND ($6::boolean IS NULL OR p.is_featured = $6)
    ORDER BY p.is_featured DESC, p.created_at DESC
  `,

  // Update partner
  update: `
    UPDATE partners
    SET name = COALESCE($2, name),
        category = COALESCE($3, category),
        description = COALESCE($4, description),
        logo = COALESCE($5, logo),
        cover_image = COALESCE($6, cover_image),
        address = COALESCE($7, address),
        city = COALESCE($8, city),
        phone = COALESCE($9, phone),
        email = COALESCE($10, email),
        website = COALESCE($11, website),
        discount_percentage = COALESCE($12, discount_percentage),
        discount_description = COALESCE($13, discount_description),
        terms = COALESCE($14, terms),
        is_active = COALESCE($15, is_active),
        is_featured = COALESCE($16, is_featured),
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, name, slug, category, description, logo, cover_image,
              address, city, phone, email, website,
              discount_percentage, discount_description, terms,
              is_active, is_featured, created_at, updated_at
  `,

  // Delete partner (soft delete)
  deactivate: `
    UPDATE partners
    SET is_active = false,
        updated_at = NOW()
    WHERE id = $1
  `,

  // Get partner categories
  getCategories: `
    SELECT DISTINCT category, COUNT(*) as count
    FROM partners
    WHERE is_active = true
    GROUP BY category
    ORDER BY count DESC
  `,

  // Get partner cities
  getCities: `
    SELECT DISTINCT city, COUNT(*) as count
    FROM partners
    WHERE is_active = true
    GROUP BY city
    ORDER BY count DESC
  `,

  // Get featured partners
  getFeatured: `
    SELECT p.*, 
           0::numeric(3,2) as rating,
           0::int as total_reviews
    FROM partners p
    WHERE p.is_active = true AND p.is_featured = true
    ORDER BY RANDOM()
    LIMIT $1
  `,

  // Check if slug exists
  checkSlugExists: `
    SELECT id FROM partners WHERE slug = $1 LIMIT 1
  `
};

// Database migration for partners table
export const PartnerMigration = `
  CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    logo VARCHAR(500),
    cover_image VARCHAR(500),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    discount_percentage INTEGER NOT NULL CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    discount_description TEXT NOT NULL,
    terms TEXT,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  CREATE INDEX idx_partners_slug ON partners(slug);
  CREATE INDEX idx_partners_category ON partners(category);
  CREATE INDEX idx_partners_city ON partners(city);
  CREATE INDEX idx_partners_is_active ON partners(is_active);
  CREATE INDEX idx_partners_is_featured ON partners(is_featured);
`;