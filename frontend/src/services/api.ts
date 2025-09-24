/**
 * API Service Configuration
 * Mengatur base URL dan konfigurasi untuk komunikasi dengan backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

// Check if we're in development mode using proxy
const isDevelopmentWithProxy = process.env.NODE_ENV === 'development' && !process.env.REACT_APP_API_URL;

export const apiConfig = {
  baseURL: isDevelopmentWithProxy ? '/' : API_BASE_URL,
  endpoints: {
    // Table endpoints
    tables: '/tables',
  tableById: (id: string) => `/tables/${id}`,
  tableStatus: (id: string) => `/tables/${id}/status`,
  tableStats: '/tables/stats',
    tableHistory: (id: string) => `/tables/${id}/history`,
    
    // User endpoints
    users: '/users',
    auth: '/auth',
    
    // Menu endpoints
    menus: '/menus',
    categories: '/menu-categories',
    
    // Order endpoints
    orders: '/orders',
    
    // Customer endpoints
    customers: '/customers'
  }
};

/**
 * Generic API request helper
 */
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${apiConfig.baseURL}${endpoint}`;
  console.log('🔍 API Request URL:', url);
  console.log('🔧 BaseURL:', apiConfig.baseURL);
  console.log('🎯 Endpoint:', endpoint);
  

  // Always get the latest token from localStorage before each request
  const token = localStorage.getItem('token');
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const config: RequestInit = {
    headers: { ...defaultHeaders, ...options.headers },
    ...options
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const err: any = new Error(errorData.message || `HTTP error! status: ${response.status}`);
      err.status = response.status;
      err.data = errorData;
      // Provide an axios-like response object so callers can check `error.response.status`
      err.response = { status: response.status, data: errorData };

      // If unauthorized, clear stored token to avoid repeated failing requests
      if (response.status === 401) {
        try { localStorage.removeItem('token'); } catch (e) { /* ignore */ }
      }

      throw err;
    }

    // Some endpoints (DELETE, 204 No Content) return an empty body.
    // Attempt to parse JSON, but fall back to null when there's no content.
    const text = await response.text();
    if (!text) return null;

    try {
      return JSON.parse(text);
    } catch (parseErr) {
      // If response isn't JSON, return raw text
      return text;
    }
  } catch (error) {
    console.error(`API request failed for ${url}:`, error);
    throw error;
  }
};

/**
 * API methods for different HTTP verbs
 */
export const api = {
  get: (endpoint: string, options?: RequestInit) => 
    apiRequest(endpoint, { method: 'GET', ...options }),
    
  post: (endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options
    }),
    
  put: (endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest(endpoint, {
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined,
      ...options
    }),
    
  patch: (endpoint: string, data?: any, options?: RequestInit) =>
    apiRequest(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined, 
      ...options
    }),
    
  delete: (endpoint: string, options?: RequestInit) =>
    apiRequest(endpoint, { method: 'DELETE', ...options })
};

export default api;
