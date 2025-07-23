#!/usr/bin/env node

/**
 * Test Database Connection Script
 * Run this after setting up your database to verify connection
 */

require('dotenv').config();
const { Pool } = require('pg');

async function testConnection() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔄 Testing database connection...');
    console.log(`📍 Connecting to: ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':****@')}`);
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Successfully connected to PostgreSQL!');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('📊 Database info:');
    console.log(`   - Current time: ${result.rows[0].current_time}`);
    console.log(`   - PostgreSQL version: ${result.rows[0].version.split(',')[0]}`);
    
    // Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log(`\n📋 Found ${tablesResult.rows.length} tables:`);
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    } else {
      console.log('\n⚠️  No tables found. You need to run the migration script.');
    }
    
    client.release();
    await pool.end();
    
    console.log('\n✅ Database connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Database connection test failed:');
    console.error(error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('🔍 Could not find the database host. Check your DATABASE_URL.');
    } else if (error.code === '28P01') {
      console.error('🔐 Authentication failed. Check your database password.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Connection refused. Check if the database is running and accessible.');
    }
    
    await pool.end();
    process.exit(1);
  }
}

// Run the test
testConnection();