const axios = require('axios');

const API_URL = 'http://localhost:5000/api/reviews';

async function testReviewAPI() {
  try {
    console.log('🧪 Testing Review API...\n');

    // Test 1: Get recent reviews
    console.log('1. Testing GET /api/reviews/recent');
    const recentReviews = await axios.get(`${API_URL}/recent`);
    console.log('✅ Recent reviews:', recentReviews.data);
    console.log('');

    // Test 2: Create a new review
    console.log('2. Testing POST /api/reviews');
    const newReview = {
      partnerId: 'partner-123',
      partnerName: 'Test Restaurant',
      rating: 5,
      content: 'Amazing food and great service! The BOOM Card discount made it even better.'
    };
    
    try {
      const createResponse = await axios.post(API_URL, newReview);
      console.log('✅ Created review:', createResponse.data);
    } catch (error) {
      console.log('⚠️  Create review failed (expected if no real auth):', error.response?.data || error.message);
    }
    console.log('');

    // Test 3: Get partner reviews
    console.log('3. Testing GET /api/reviews/partner/:partnerId');
    const partnerReviews = await axios.get(`${API_URL}/partner/partner-123`);
    console.log('✅ Partner reviews:', partnerReviews.data);
    console.log('');

    // Test 4: Get partner stats
    console.log('4. Testing GET /api/reviews/stats/:partnerId');
    const partnerStats = await axios.get(`${API_URL}/stats/partner-123`);
    console.log('✅ Partner stats:', partnerStats.data);
    console.log('');

    // Test 5: Get my reviews (requires auth)
    console.log('5. Testing GET /api/reviews/my-reviews');
    try {
      const myReviews = await axios.get(`${API_URL}/my-reviews`);
      console.log('✅ My reviews:', myReviews.data);
    } catch (error) {
      console.log('⚠️  Get my reviews failed (expected if no real auth):', error.response?.data || error.message);
    }

    console.log('\n🎉 Review API test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testReviewAPI();