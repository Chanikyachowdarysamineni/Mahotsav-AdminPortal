// Simple health check test
const testHealthCheck = async () => {
  try {
    console.log('Testing health check...');
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Health check successful:', data);
    } else {
      console.log('❌ Health check failed:', response.status, data);
    }
  } catch (error) {
    console.error('❌ Health check error:', error.message);
  }
};

testHealthCheck();