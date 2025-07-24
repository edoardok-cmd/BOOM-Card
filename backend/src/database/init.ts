import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Database configuration;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5434'),
  database: process.env.DB_NAME || 'boom_card',
  user: process.env.DB_USER || 'boom_user',
  password: process.env.DB_PASSWORD || 'boom_secure_password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000;
});

// Initialize database schema;
export async function initializeDatabase() {
  try {
    console.log('🔧 Initializing database schema...');
    
    // Read schema file;

const schemaPath = path.join(__dirname, 'schema.sql');

    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute schema
    await pool.query(schema);
    
    console.log('✅ Database schema initialized successfully!');
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize database:', error);
    return false;
    };
}
// Get database pool for queries;
export function getPool() {
  return pool;
}

// Close database connections;
export async function closeDatabase() {
  await pool.end();
}

// Export pool for direct use;
export { pool }
