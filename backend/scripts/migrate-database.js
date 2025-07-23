#!/usr/bin/env node

/**
 * Database Migration Script
 * Runs the schema.sql file against the configured database
 */

require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🚀 Starting database migration...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '../../database/schema.sql');
    console.log(`📖 Reading schema from: ${schemaPath}`);
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    // Connect to database
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    // Start transaction
    await client.query('BEGIN');
    console.log('🔄 Transaction started');
    
    try {
      // Run the schema
      console.log('⚙️  Creating tables and types...');
      await client.query(schema);
      
      // Commit transaction
      await client.query('COMMIT');
      console.log('✅ Migration completed successfully!');
      
      // Verify tables were created
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      console.log(`\n📋 Created ${tablesResult.rows.length} tables:`);
      tablesResult.rows.forEach(row => {
        console.log(`   ✓ ${row.table_name}`);
      });
      
    } catch (error) {
      // Rollback on error
      await client.query('ROLLBACK');
      console.error('❌ Migration failed, rolled back changes');
      throw error;
    } finally {
      client.release();
    }
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration error:');
    console.error(error.message);
    
    if (error.code === '42P07') {
      console.error('⚠️  Some database objects already exist. This might be okay if you\'re re-running the migration.');
    }
    
    await pool.end();
    process.exit(1);
  }
}

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  console.error('💡 Make sure to set it in your .env file or environment');
  process.exit(1);
}

// Run migration
runMigration();