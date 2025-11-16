// Test script to verify all API endpoints are working

const baseURL = 'http://localhost:5000';

// Test 1: Health Check
console.log('🔍 Testing API Endpoints...\n');

fetch(`${baseURL}/api/health`)
  .then(res => res.json())
  .then(data => {
    console.log('✅ Health Check:', data.message);
  })
  .catch(err => console.error('❌ Health Check Failed:', err.message));

// Test 2: Get All Registrations (requires auth)
const token = 'YOUR_AUTH_TOKEN_HERE'; // Replace with actual token from localStorage

fetch(`${baseURL}/api/registrations`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('✅ Registrations Endpoint:', Array.isArray(data) ? `${data.length} registrations found` : 'Working');
  })
  .catch(err => console.error('❌ Registrations Endpoint Failed:', err.message));

// Test 3: Get All Teams (requires auth)
fetch(`${baseURL}/api/teams`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
  .then(res => res.json())
  .then(data => {
    console.log('✅ Teams Endpoint:', Array.isArray(data) ? `${data.length} teams found` : 'Working');
  })
  .catch(err => console.error('❌ Teams Endpoint Failed:', err.message));

console.log('\n📝 Note: For authenticated endpoints, replace YOUR_AUTH_TOKEN_HERE with actual token from localStorage');
console.log('You can get the token by:');
console.log('1. Login to admin portal (http://localhost:5175)');
console.log('2. Open browser console (F12)');
console.log('3. Type: localStorage.getItem("token")');
console.log('4. Copy the token and paste it in this script\n');

// Example: Public Registration (No auth required)
console.log('\n📋 Example: Create a test registration (Public Endpoint)');
console.log(`
curl -X POST ${baseURL}/api/registrations/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "9876543210",
    "gender": "Male",
    "college": "Test College",
    "state": "Karnataka",
    "year": "2025",
    "events": [],
    "amountPaid": 350,
    "paymentStatus": "Paid"
  }'
`);

// Example: Create Team (No auth required)
console.log('\n👥 Example: Create a test team (Public Endpoint)');
console.log(`
curl -X POST ${baseURL}/api/teams/create \\
  -H "Content-Type: application/json" \\
  -d '{
    "teamId": "TEAM001",
    "teamName": "Test Team",
    "eventId": "EVENT_ID_HERE",
    "eventName": "Basketball",
    "captain": {
      "name": "Captain Name",
      "email": "captain@example.com",
      "phone": "9876543210",
      "registrationId": "REGISTRATION_ID_HERE"
    },
    "members": [],
    "totalMembers": 1,
    "college": "Test College",
    "status": "active"
  }'
`);
