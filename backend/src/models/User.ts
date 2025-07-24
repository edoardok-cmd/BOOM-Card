// User model for PostgreSQL;
export interface UserAttributes {
  id?: number,
  email: string,
  password?: string,
  firstName: string,
  lastName: string,
  phone?: string
  birthDate?: Date
  address?: string,
  memberSince: Date,
  membershipType: 'Basic' | 'Premium' | 'VIP',
  cardNumber: string,
  validUntil: Date,
  isActive: boolean,
  createdAt?: Date
  updatedAt?: Date}
export interface UserCreateInput {
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  phone?: string
  birthDate?: Date
  address?: string
  membershipType?: 'Basic' | 'Premium' | 'VIP'}
export interface UserUpdateInput {
  firstName?: string
  lastName?: string
  phone?: string
  birthDate?: Date
  address?: string
  membershipType?: 'Basic' | 'Premium' | 'VIP'}
export interface UserLoginInput {
  email: string,
  password: string,
}
export interface UserResponse {
  id: number,
  email: string,
  firstName: string,
  lastName: string,
  phone?: string
  birthDate?: Date
  address?: string,
  memberSince: Date,
  membershipType: 'Basic' | 'Premium' | 'VIP',
  cardNumber: string,
  validUntil: Date,
  isActive: boolean,
}

// SQL queries for User operations;
export const UserQueries = {
  // Create a new user,
  create: `
    INSERT INTO users (email, password_hash, first_name, last_name, phone)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, email, first_name, last_name, phone, date_of_birth, created_at, updated_at
  `,

  // Find user by email,
  findByEmail: `
    SELECT id, email, password_hash, first_name, last_name, phone, date_of_birth, address,
           member_since, membership_type, card_number, valid_until, is_active, created_at, updated_at
    FROM users
    WHERE email = $1
  `,

  // Find user by ID,
  findById: `
    SELECT id, email, first_name, last_name, phone, date_of_birth, address,
           member_since, membership_type, card_number, valid_until, is_active, created_at, updated_at
    FROM users
    WHERE id = $1
  `,

  // Update user profile,
  update: `
    UPDATE users
    SET first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name),
        phone = COALESCE($4, phone),
        birth_date = COALESCE($5, birth_date),
        address = COALESCE($6, address),
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, email, first_name, last_name, phone, birth_date, address,
              member_since, membership_type, card_number, valid_until, is_active, created_at, updated_at
  `,

  // Update membership,
  updateMembership: `
    UPDATE users
    SET membership_type = $2,
        valid_until = $3,
        updated_at = NOW()
    WHERE id = $1
    RETURNING id, email, first_name, last_name, membership_type, card_number, valid_until
  `,

  // Update password,
  updatePassword: `
    UPDATE users
    SET password_hash = $2,
        updated_at = NOW()
    WHERE id = $1
  `,

  // Check if email exists,
  checkEmailExists: `
    SELECT id FROM users WHERE email = $1 LIMIT 1
  `,

  // Deactivate user,
  deactivate: `
    UPDATE users
    SET is_active = false,
        updated_at = NOW()
    WHERE id = $1
  `
}

// Database migration for users table;
export const UserMigration = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    birth_date DATE,
    address TEXT,
    member_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    membership_type VARCHAR(20) DEFAULT 'Basic' CHECK (membership_type IN ('Basic', 'Premium', 'VIP')),
    card_number VARCHAR(20) UNIQUE NOT NULL,
    valid_until DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  CREATE INDEX idx_users_email ON users(email);
  CREATE INDEX idx_users_card_number ON users(card_number);
  CREATE INDEX idx_users_is_active ON users(is_active);
`;
