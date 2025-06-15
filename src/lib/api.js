import axios from 'axios'
import { logger } from './logger'

// Helper function to get cookie
function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return null
}

// Create main axios instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://sipb.crulxproject.com',
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }
})

// Request interceptor with logger
API.interceptors.request.use(
  config => {
    logger.api.request(config.method, config.url)
    
    // ✅ Fix: Add /api/v1 prefix to all API calls except auth and sanctum
    if (!config.url.startsWith('/sanctum') && 
        !config.url.startsWith('/api/login') && 
        !config.url.startsWith('/api/register') && 
        !config.url.startsWith('/api/forgot-password') && 
        !config.url.startsWith('/api/reset-password')) {
      
      if (!config.url.startsWith('/api/v1')) {
        config.url = '/api/v1' + config.url
      }
    }
    
    // Add XSRF-TOKEN if available
    const token = getCookie('XSRF-TOKEN')
    if (token) {
      config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token)
      logger.auth.csrfToken()
    }

    // Check for session cookie
    const sessionCookie = getCookie('laravel_session') || getCookie('sipb_session')
    if (!sessionCookie) {
      logger.warn('No session cookie found')
    }

    return config
  },
  error => {
    logger.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor to handle common errors
API.interceptors.response.use(
  response => {
    logger.api.response(response.config.method, response.config.url, response.status)
    return response
  },
  error => {
    logger.api.error(
      error.config?.method,
      error.config?.url,
      error.response?.status,
      error.response?.data?.message || error.message
    )
    
    if (error.response?.status === 401) {
      logger.warn('Unauthorized, redirecting to login')
      window.location.href = '/'
    } else if (error.response?.status === 405) {
      logger.error('Method not allowed. Check API endpoint:', error.config.url)
    }
    return Promise.reject(error)
  }
)

export default API
