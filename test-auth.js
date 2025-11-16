// Test login functionality
const testLogin = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'chanikyachowdary@gmail.com.com',
        password: 'chani8877'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Login successful!');
      console.log('Token:', data.token.substring(0, 50) + '...');
      console.log('User:', data.user);
    } else {
      console.log('❌ Login failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
};

// Test with different users
const testUsers = [
  { email: 'chanikyachowdary@gmail.com.com', password: 'chani8877' },
  { email: 'bandaruakash8@gmail.com', password: 'akash123' },
  { email: 'admin1@gmail.com', password: 'admin2' },
  { email: 'admin1@gmail.com', password: 'wrongpassword' }, // This should fail
];

const runTests = async () => {
  console.log('🧪 Testing authentication...\n');
  
  for (const [index, user] of testUsers.entries()) {
    console.log(`Test ${index + 1}: ${user.email}`);
    
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('   ✅ SUCCESS - Login successful');
        console.log('   📧 User:', data.user.name, '-', data.user.role);
      } else {
        console.log('   ❌ FAILED -', data.message);
      }
    } catch (error) {
      console.log('   ❌ ERROR -', error.message);
    }
    
    console.log('');
  }
};

runTests();