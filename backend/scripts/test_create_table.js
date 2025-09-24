(async () => {
  try {
    const fetch = (await import('node-fetch')).default;

    const loginRes = await fetch('http://localhost:3001/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });

    const loginJson = await loginRes.json();
    console.log('Login response status:', loginRes.status);
    console.log('Login response body:', JSON.stringify(loginJson));

    const token = loginJson?.data?.token;
    if (!token) {
      console.error('No token found in login response');
      process.exit(1);
    }

    const createRes = await fetch('http://localhost:3001/api/v1/tables', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ table_number: 'T070', capacity: 4, area: 'indoor' })
    });

    const createJson = await createRes.text();
    console.log('Create response status:', createRes.status);
    console.log('Create response body:', createJson);
  } catch (err) {
    console.error('Error in script:', err);
    process.exit(1);
  }
})();
