// src/lib/api.js
import axios from 'axios'
import { logger } from './logger'

// Create main axios instance for stateless auth
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://sipb.crulxproject.com',
  withCredentials: false, // ✅ No cookies needed for stateless
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }
})

// ✅ Request interceptor - Add Bearer token
API.interceptors.request.use(
  config => {
    logger.api.request(config.method, config.url)
    
    // ✅ Add Bearer token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      logger.auth.tokenAttached()
    }
    
    // ✅ Add /api/v1 prefix to all API calls except auth
    if (!config.url.startsWith('/api/login') && 
        !config.url.startsWith('/api/register') && 
        !config.url.startsWith('/api/forgot-password') && 
        !config.url.startsWith('/api/reset-password') && 
        !config.url.startsWith('/api/refresh-token') &&
        !config.url.startsWith('/api/logout')) {
      
      if (!config.url.startsWith('/api/v1')) {
        config.url = '/api/v1' + config.url
      }
    }

    return config
  },
  error => {
    logger.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// ✅ Response interceptor - Handle token refresh
API.interceptors.response.use(
  response => {
    logger.api.response(response.config.method, response.config.url, response.status)
    return response
  },
  async error => {
    const originalRequest = error.config
    
    logger.api.error(
      error.config?.method,
      error.config?.url,
      error.response?.status,
      error.response?.data?.message || error.message
    )
    
    // ✅ Handle token expiration
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      logger.auth.tokenExpired()
      
      // Clear auth data and redirect to login
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
      
      return Promise.reject(error)
    }
    
    return Promise.reject(error)
  }
)

export default API
