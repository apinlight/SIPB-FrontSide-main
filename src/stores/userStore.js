// src/stores/userStore.js
import { defineStore } from 'pinia'
import { logger } from '@/lib/logger'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false
  }),

  getters: {
    userRoles: (state) => {
      return state.user?.roles?.map(role => role.name) || []
    },
    
    // ✅ FIX: Use this.userRoles instead of state.userRoles
    isAdmin() {
      return this.userRoles.includes('admin')
    },
    
    isManager() {
      return this.userRoles.includes('manager')
    },
    
    isUser() {
      return this.userRoles.includes('user')
    }
  },

  actions: {
    setUser(userData) {
      logger.info('UserStore: Setting user data', { 
        username: userData.username,
        roles: userData.roles?.map(r => r.name)
      })
      
      this.user = userData
      this.isAuthenticated = true
      localStorage.setItem('auth_user', JSON.stringify(userData))
    },

    setToken(token) {
      // ✅ FIX: logger.auth.tokenSet doesn't exist in your logger
      logger.info('UserStore: Token set')
      this.token = token
      localStorage.setItem('auth_token', token)
    },

    clearUser() {
      logger.auth.logout()
      this.user = null
      this.token = null
      this.isAuthenticated = false
      
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
    },

    loadUserFromStorage() {
      try {
        const storedUser = localStorage.getItem('auth_user')
        const storedToken = localStorage.getItem('auth_token')
        
        if (storedUser && storedToken) {
          this.user = JSON.parse(storedUser)
          this.token = storedToken
          this.isAuthenticated = true
          
          logger.info('UserStore: Loaded user from storage', { 
            username: this.user.username,
            hasToken: !!this.token
          })
          return true
        }
      } catch (error) {
        logger.error('UserStore: Failed to load user from storage', error)
        this.clearUser()
      }
      return false
    },

    hasRole(role) {
      return this.userRoles.includes(role)
    },

    hasAnyRole(roles) {
      return roles.some(role => this.userRoles.includes(role))
    }
  }
})
