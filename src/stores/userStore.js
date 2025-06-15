import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import API from '../lib/api'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)

  const setUser = (userData) => {
    user.value = userData
    isAuthenticated.value = true
    localStorage.setItem('auth_user', JSON.stringify(userData))
    
    console.log('✅ User set in store:', userData.username, 'Role:', userData.roles?.[0]?.name)
    console.log('🎭 All roles:', userData.roles)
  }

  const loadUserFromStorage = () => {
    const saved = localStorage.getItem('auth_user')
    if (saved) {
      try {
        const userData = JSON.parse(saved)
        user.value = userData
        isAuthenticated.value = true
        console.log('📦 User loaded from storage:', userData.username, 'Role:', userData.roles?.[0]?.name)
        
        // ✅ PERBAIKI: Validate session tapi jangan block UI
        validateSession().catch(() => {
          // Session invalid, tapi jangan langsung clear user
          console.log('⚠️ Session validation failed, but keeping user data for now')
        })
      } catch (e) {
        console.error('❌ Error loading user from storage:', e)
        clearUser()
      }
    }
  }

  const validateSession = async () => {
    console.log('🔍 Validating session...')
    try {
      const response = await API.get('/api/v1/users')
      console.log('✅ Session valid')
      isAuthenticated.value = true
      return true
    } catch (error) {
      console.error('❌ Session validation failed:', error)
      
      // ✅ PERBAIKI: Clear user data jika session expired
      if (error.response?.status === 401) {
        console.log('🧹 Session expired, clearing user data')
        clearUser()
        // Redirect akan ditangani oleh API interceptor
      }
      
      isAuthenticated.value = false
      return false
    }
  }

  const clearUser = () => {
    console.log('🧹 Clearing user data')
    user.value = null
    isAuthenticated.value = false
    localStorage.removeItem('auth_user')
  }

  // ✅ Computed properties untuk role checking
  const userRoles = computed(() => {
    return user.value?.roles?.map(role => role.name) || []
  })

  const isAdmin = computed(() => {
    return userRoles.value.includes('admin')
  })

  const isManager = computed(() => {
    return userRoles.value.includes('manager')
  })

  const isUser = computed(() => {
    return userRoles.value.includes('user')
  })

  // ✅ Helper function untuk check role
  const hasRole = (roleName) => {
    return userRoles.value.includes(roleName)
  }

  return {
    // State
    user,
    isAuthenticated,
    
    // Computed
    userRoles,
    isAdmin,
    isManager,
    isUser,
    
    // Actions
    setUser,
    loadUserFromStorage,
    validateSession,
    clearUser,
    hasRole
  }
})
