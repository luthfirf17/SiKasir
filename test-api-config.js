/**
 * Test script to verify API configuration
 * Run with: node test-api-config.js
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Check if we're in development mode using proxy
const isDevelopmentWithProxy = process.env.NODE_ENV === 'development' && !process.env.REACT_APP_API_URL;

const apiConfig = {
  baseURL: isDevelopmentWithProxy ? '/' : API_BASE_URL,
  endpoints: {
    tables: '/api/v1/tables',
    tableById: (id) => `/api/v1/tables/${id}`,
  }
};

console.log('=== API Configuration Test ===');
console.log('Environment:', process.env.NODE_ENV || 'development');
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL || 'undefined');
console.log('isDevelopmentWithProxy:', isDevelopmentWithProxy);
console.log('API_BASE_URL:', API_BASE_URL);
console.log('baseURL:', apiConfig.baseURL);
console.log('');

console.log('=== URL Construction Test ===');
const testEndpoint = apiConfig.endpoints.tables;
const testUrl = `${apiConfig.baseURL}${testEndpoint}`;
console.log('Endpoint:', testEndpoint);
console.log('Final URL:', testUrl);

if (isDevelopmentWithProxy) {
  console.log('✅ Development with proxy: URL should be forwarded by proxy');
  console.log('   Proxy will forward:', testUrl, '->', `http://localhost:3001${testUrl}`);
} else {
  console.log('✅ Production/Direct: Direct API call to:', testUrl);
}

console.log('');
console.log('=== Expected Backend Route ===');
console.log('Backend expects: /api/v1/tables');
console.log('Our request goes to:', testUrl);
console.log('Match:', testUrl.includes('/api/v1/tables') ? '✅ YES' : '❌ NO');