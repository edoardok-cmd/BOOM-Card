#!/usr/bin/env node

/**
 * Test Redis Connection Script
 * Run this after setting up Upstash Redis to verify connection
 */

require('dotenv').config();
const Redis = require('ioredis');

async function testRedisConnection() {
  let redis;
  
  try {
    console.log('🔄 Testing Redis connection...');
    
    // Parse Redis URL or use individual components
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is not set!');
    }
    
    console.log(`📍 Connecting to: ${redisUrl.replace(/:[^:]*@/, ':****@')}`);
    
    // Create Redis client
    redis = new Redis(redisUrl, {
      tls: process.env.NODE_ENV === 'production' ? {} : undefined,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });
    
    // Wait for connection
    await new Promise((resolve, reject) => {
      redis.once('connect', resolve);
      redis.once('error', reject);
      setTimeout(() => reject(new Error('Connection timeout')), 5000);
    });
    
    console.log('✅ Successfully connected to Redis!');
    
    // Test basic operations
    console.log('\n🧪 Testing Redis operations:');
    
    // SET operation
    await redis.set('test:key', 'Hello BOOM Card!', 'EX', 60);
    console.log('   ✓ SET test:key');
    
    // GET operation
    const value = await redis.get('test:key');
    console.log(`   ✓ GET test:key = "${value}"`);
    
    // Test JSON operations
    const testData = { user: 'test', timestamp: new Date().toISOString() };
    await redis.set('test:json', JSON.stringify(testData), 'EX', 60);
    const jsonValue = await redis.get('test:json');
    console.log('   ✓ JSON storage working');
    
    // Test expiration
    const ttl = await redis.ttl('test:key');
    console.log(`   ✓ TTL test:key = ${ttl} seconds`);
    
    // Get Redis info
    const info = await redis.info('server');
    const version = info.match(/redis_version:([^\r\n]+)/)?.[1];
    console.log(`\n📊 Redis server info:`);
    console.log(`   - Version: ${version || 'Unknown'}`);
    console.log(`   - Provider: ${redisUrl.includes('upstash') ? 'Upstash' : 'Other'}`);
    
    // Cleanup
    await redis.del('test:key', 'test:json');
    console.log('\n🧹 Cleaned up test keys');
    
    console.log('\n✅ Redis connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Redis connection test failed:');
    console.error(error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.error('🔍 Could not find the Redis host. Check your REDIS_URL.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🚫 Connection refused. Check if Redis is accessible.');
    } else if (error.message.includes('AUTH')) {
      console.error('🔐 Authentication failed. Check your Redis password.');
    }
    
    process.exit(1);
  } finally {
    if (redis) {
      redis.disconnect();
    }
  }
}

// Check if REDIS_URL is set
if (!process.env.REDIS_URL) {
  console.error('❌ REDIS_URL environment variable is not set!');
  console.error('💡 Make sure to set it in your .env file or environment');
  console.error('   Example: REDIS_URL=redis://default:password@endpoint:port');
  process.exit(1);
}

// Run test
testRedisConnection();