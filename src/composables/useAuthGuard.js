import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { logger } from '@/lib/logger'

export function useAuthGuard(requiredRoles = []) {
  const router = useRouter()
  const userStore = ref(null)

  const checkAuth = async () => {
    logger.debug('Checking authentication...')
    
    try {
      // ✅ Dynamic import untuk memastikan Pinia ready
      const { useUserStore } = await import('@/stores/userStore')
      userStore.value = useUserStore()
      
      // Load user from storage
      userStore.value.loadUserFromStorage()

      // Check if authenticated
      if (!userStore.value.isAuthenticated) {
        logger.warn('Not authenticated, redirecting to login')
        router.push('/')
        return false
      }

      // Check roles if required
      if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some(role => userStore.value.hasRole(role))
        
        if (!hasRequiredRole) {
          logger.warn('Access denied. Required roles:', requiredRoles, 'User roles:', userStore.value.userRoles)
          router.push('/dashboard')
          return false
        }
      }

      logger.success('Authentication check passed')
      return true
      
    } catch (error) {
      logger.error('Failed to initialize auth guard:', error)
      router.push('/')
      return false
    }
  }

  onMounted(() => {
    checkAuth()
  })

  return {
    get userStore() { return userStore.value },
    checkAuth
  }
}
