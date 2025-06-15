<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-sm bg-white p-6 rounded shadow">
      <h2 class="text-2xl font-bold mb-4">Login</h2>
      <form @submit.prevent="loginActivity">
        <div class="mb-4">
          <label class="block text-gray-700">Username</label>
          <input 
            v-model="username" 
            type="text" 
            name="username"
            placeholder="username"
            class="w-full px-3 py-2 border rounded" 
            required 
          />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700">Password</label>
          <input 
            v-model="password" 
            type="password" 
            name="password"
            placeholder="password"
            class="w-full px-3 py-2 border rounded" 
            required 
          />
        </div>
        <button 
          type="submit" 
          :disabled="loading"
          class="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          {{ loading ? 'LOADING...' : 'LOGIN' }}
        </button>
        <p v-if="errorMsg" class="text-red-500 mt-2">{{ errorMsg }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import API from '../../lib/api'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import { useUserStore } from '../../stores/userStore'
import { logger } from '@/lib/logger'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const username = ref('')
const password = ref('')
const errorMsg = ref('')

// ✅ PERBAIKI: Check auth dengan lebih hati-hati
onMounted(async () => {
  logger.info('Shared: Login component mounted')
  
  // ✅ Clear any existing redirect flags
  localStorage.removeItem('auth_user') // Clear potentially invalid session
  
  // Don't auto-redirect, let user login fresh
  logger.info('Shared: Login page ready')
})

// ... rest of the functions remain the same
async function getCsrfCookie() {
  try {
    logger.info('Shared: Getting CSRF cookie')
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    await API.get('/sanctum/csrf-cookie')
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const token = getCookie('XSRF-TOKEN')
    if (!token) {
      throw new Error('CSRF token not set')
    }
    logger.info('Shared: CSRF cookie obtained successfully')
    return true
  } catch (error) {
    logger.error('Shared: Failed to get CSRF cookie', {
      error: error.message
    })
    errorMsg.value = 'Failed to establish secure connection'
    return false
  }
}

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop().split(';').shift()
  }
  return null
}

async function loginActivity() {
  loading.value = true
  errorMsg.value = ''
  
  logger.info('Shared: Starting login process', { username: username.value })
  
  try {
    const csrfSuccess = await getCsrfCookie()
    if (!csrfSuccess) {
      loading.value = false
      return
    }

    const response = await API.post('/api/login', {
      login: username.value,
      password: password.value,
    })

    logger.info('Shared: Login successful', {
      user: response.data.user?.username,
      branch: response.data.user?.branch_name,
      roles: response.data.user?.roles?.map(r => r.name)
    })
    
    userStore.setUser(response.data.user)
    
    toast.success('Login successful!')
    router.push('/dashboard')

  } catch (error) {
    logger.error('Shared: Login failed', {
      error: error.message,
      response: error.response?.data,
      username: username.value
    })
    
    const errorMessage = error.response?.data?.message || 'Login failed'
    errorMsg.value = errorMessage
    toast.error(errorMessage)
  } finally {
    loading.value = false
  }
}
</script>
