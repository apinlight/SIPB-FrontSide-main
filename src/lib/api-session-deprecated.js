import axios from 'axios'
import { logger } from './logger'

// Helper function to get cookie
function getCookie(name) {
  if (typeof document === 'undefined') return null
  
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    const cookieValue = parts.pop().split(';').shift()
    return cookieValue ? decodeURIComponent(cookieValue) : null
  }
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
    
    // ✅ Add /api/v1 prefix to all API calls except auth and sanctum
    if (!config.url.startsWith('/sanctum') && 
        !config.url.startsWith('/api/login') && 
        !config.url.startsWith('/api/register') && 
        !config.url.startsWith('/api/forgot-password') && 
        !config.url.startsWith('/api/reset-password')) {
      
      if (!config.url.startsWith('/api/v1')) {
        config.url = '/api/v1' + config.url
      }
    }
    
    // ✅ Add XSRF-TOKEN if available
    const token = getCookie('XSRF-TOKEN')
    if (token) {
      config.headers['X-XSRF-TOKEN'] = token
      logger.auth.csrfToken()
    }

    // ✅ REMOVED: Session cookie check - HttpOnly cookies can't be read by JS
    // The session cookie is automatically sent by the browser with withCredentials: true
    // No need to check or warn about it - it's working correctly behind the scenes

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
      // Clear any stored auth data
      localStorage.removeItem('auth_user')
      // Redirect to login if not already there
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    } else if (error.response?.status === 405) {
      logger.error('Method not allowed. Check API endpoint:', error.config.url)
    }
    
    return Promise.reject(error)
  }
)

export default API
