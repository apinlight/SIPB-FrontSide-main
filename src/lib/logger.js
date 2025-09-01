// File baru: src/lib/logger.js
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD

const logger = {
  // Development only logs
  info: (...args) => {
    if (isDev) console.log('ℹ️', ...args)
  },
  
  debug: (...args) => {
    if (isDev) console.debug('🔍', ...args)
  },
  
  success: (...args) => {
    if (isDev) console.log('✅', ...args)
  },
  
  // Warning - show in both dev and prod
  warn: (...args) => {
    console.warn('⚠️', ...args)
  },
  
  // Error - always show for debugging
  error: (...args) => {
    console.error('❌', ...args)
  },
  
  // API specific logging
  api: {
    request: (method, url) => {
      if (isDev) console.log('🌐 API Request:', method.toUpperCase(), url)
    },
    
    response: (method, url, status) => {
      if (isDev) console.log('✅ API Response:', method.toUpperCase(), url, status)
    },
    
    error: (method, url, status, error) => {
      console.error('❌ API Error:', method?.toUpperCase(), url, status, error)
    }
  },
  
  // Auth specific logging
  auth: {
    login: (username) => {
      if (isDev) console.log('🔐 Login attempt for:', username)
    },
    
    logout: () => {
      if (isDev) console.log('🚪 User logged out')
    },
    
    tokenRefresh: () => {
      if (isDev) console.log('🔄 Token refreshed')
    },
    
    // ✅ Add token logging
    tokenAttached: () => {
      if (isDev) console.log('🎟️ Bearer token attached to request')
    },
    
    tokenExpired: () => {
      if (isDev) console.log('⏰ Token expired')
    },
    
    // ✅ Add missing methods
    csrfToken: () => {
      if (isDev) console.log('🛡️ CSRF token attached')
    }
  }
}

export { logger }
