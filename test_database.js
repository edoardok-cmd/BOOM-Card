const { Client } = require('pg');
const Redis = require('ioredis');

async function testDatabases() {
  console.log('🗄️  Testing BOOM Card Database Connections\n');
  
  // Test PostgreSQL
  console.log('1. Testing PostgreSQL Connection');
  const pgClient = new Client({
    host: 'localhost',
    port: 5434,
    database: 'boom_card',
    user: 'boom_user',
    password: 'boom_password',
  });
  
  try {
    await pgClient.connect();
    const result = await pgClient.query('SELECT NOW() as current_time, version() as pg_version');
    console.log('   ✅ PostgreSQL Connected');
    console.log('   📊 Version:', result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1]);
    console.log('   🕐 Current Time:', result.rows[0].current_time);
    await pgClient.end();
  } catch (error) {
    console.log('   ❌ PostgreSQL Error:', error.message);
  }
  
  // Test Redis
  console.log('\n2. Testing Redis Connection');
  const redis = new Redis({
    host: 'localhost',
    port: 6381,
  });
  
  try {
    await redis.set('test_key', 'BOOM Card Test');
    const testValue = await redis.get('test_key');
    const info = await redis.info('server');
    const version = info.match(/redis_version:(.+)/)[1];
    
    console.log('   ✅ Redis Connected');
    console.log('   📊 Version:', version);
    console.log('   🧪 Test Write/Read:', testValue);
    
    await redis.del('test_key');
    await redis.quit();
  } catch (error) {
    console.log('   ❌ Redis Error:', error.message);
  }
  
  console.log('\n🏁 Database test complete!');
}

testDatabases().catch(console.error);