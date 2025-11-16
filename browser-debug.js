// DEBUG SCRIPT - Run this in browser console when on the login page

console.log('🧪 Running login debug test...');

// Test 1: Check if API is accessible
fetch('http://localhost:5000/api/health')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Health check successful:', data);
    
    // Test 2: Try login with correct credentials
    return fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'chanikyachowdary@gmail.com.com',
        password: 'chani8877'
      })
    });
  })
  .then(response => {
    console.log('📡 Login response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📧 Login response data:', data);
    
    if (data.token) {
      console.log('✅ Login successful! Token received');
      console.log('👤 User:', data.user);
      localStorage.setItem('token', data.token);
      console.log('💾 Token saved to localStorage');
    } else {
      console.log('❌ Login failed:', data.message);
    }
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });

// Test 3: List all available users for reference
fetch('http://localhost:5000/api/leads', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(response => response.json())
.then(data => {
  if (data.success) {
    console.log('📋 Available users in database:');
    data.data.forEach(user => {
      console.log(`  - ${user.name}: ${user.email} (${user.role})`);
    });
  } else {
    console.log('❌ Could not fetch users (need authentication)');
  }
})
.catch(error => {
  console.log('ℹ️ Could not fetch users (need authentication first)');
});