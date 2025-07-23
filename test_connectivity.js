const axios = require('axios');

async function testConnectivity() {
  console.log('🧪 Testing BOOM Card Connectivity\n');
  
  // Test backend directly
  console.log('1. Testing Backend (Direct)');
  try {
    const healthResponse = await axios.get('http://localhost:5001/health');
    console.log('   ✅ Health:', healthResponse.data);
    
    const testResponse = await axios.get('http://localhost:5001/api/test');
    console.log('   ✅ API Test:', testResponse.data);
  } catch (error) {
    console.log('   ❌ Backend Error:', error.message);
  }
  
  // Test frontend
  console.log('\n2. Testing Frontend');
  try {
    const frontendResponse = await axios.get('http://localhost:3000', { timeout: 5000 });
    console.log('   ✅ Frontend accessible (status:', frontendResponse.status, ')');
  } catch (error) {
    console.log('   ❌ Frontend Error:', error.message);
  }
  
  // Test frontend proxy
  console.log('\n3. Testing Frontend Proxy to Backend');
  try {
    const proxyHealthResponse = await axios.get('http://localhost:3000/health', { timeout: 5000 });
    console.log('   ✅ Proxy Health:', proxyHealthResponse.data);
  } catch (error) {
    console.log('   ❌ Proxy Error:', error.message);
  }
  
  try {
    const proxyTestResponse = await axios.get('http://localhost:3000/api/test', { timeout: 5000 });
    console.log('   ✅ Proxy API Test:', proxyTestResponse.data);
  } catch (error) {
    console.log('   ❌ Proxy API Error:', error.message);
  }
  
  console.log('\n🏁 Connectivity test complete!');
}

testConnectivity().catch(console.error);