import fetch from 'node-fetch';

const testLogin = async () => {
  try {
    console.log('Testing admin login endpoint...');
    console.log('URL: http://localhost:8000/admin/login');
    
    const response = await fetch('http://localhost:8000/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123'
      })
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testLogin();
