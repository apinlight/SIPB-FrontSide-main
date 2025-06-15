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
  
  // Auth specific logging (never log sensitive data)
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
    
    // Never log actual tokens or passwords
    csrfToken: () => {
      if (isDev) console.log('🔑 CSRF token obtained')
    }
  }
}

export { logger }
