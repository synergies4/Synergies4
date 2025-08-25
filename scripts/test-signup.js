const fetch = require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

async function testSignup(data, description) {
  console.log(`\n🧪 Testing: ${description}`);
  console.log('📤 Request:', JSON.stringify(data, null, 2));
  
  try {
    const response = await fetch(`${BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    
    console.log(`📊 Status: ${response.status}`);
    console.log('📥 Response:', JSON.stringify(responseData, null, 2));
    
    if (response.ok) {
      console.log('✅ SUCCESS');
    } else {
      console.log('❌ FAILED');
    }
    
    return { success: response.ok, data: responseData };
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Starting Signup API Tests\n');
  console.log(`📍 Base URL: ${BASE_URL}\n`);

  const tests = [
    {
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      },
      description: "Valid signup"
    },
    {
      data: {
        name: "Test User",
        email: "invalid-email",
        password: "password123"
      },
      description: "Invalid email format"
    },
    {
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "123"
      },
      description: "Weak password"
    },
    {
      data: {
        name: "Test User",
        email: "test@example.com"
      },
      description: "Missing password"
    },
    {
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "password123"
      },
      description: "Duplicate email (should fail if user exists)"
    }
  ];

  const results = [];
  
  for (const test of tests) {
    const result = await testSignup(test.data, test.description);
    results.push({ ...test, result });
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n📋 Test Summary:');
  console.log('================');
  
  results.forEach((test, index) => {
    const status = test.result.success ? '✅ PASS' : '❌ FAIL';
    console.log(`${index + 1}. ${test.description}: ${status}`);
  });

  const passed = results.filter(r => r.result.success).length;
  const total = results.length;
  
  console.log(`\n🎯 Results: ${passed}/${total} tests passed`);
}

// Run the tests
runTests().catch(console.error);
