<!-- src/pages/shared/Login.vue -->
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-sm bg-white p-6 rounded shadow">
      <h2 class="text-2xl font-bold mb-4">Login</h2>
      <form @submit.prevent="loginActivity">
        <div class="mb-4">
          <label class="block text-gray-700">Username or Email</label>
          <input 
            v-model="username" 
            type="text" 
            name="username"
            placeholder="username or email"
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

onMounted(() => {
  logger.info('Shared: Login component mounted (stateless)')
  
  // ✅ Clear any existing auth data
  userStore.clearUser()
  
  logger.info('Shared: Login page ready')
})

async function loginActivity() {
  loading.value = true
  errorMsg.value = ''
  
  logger.info('Shared: Starting stateless login', { username: username.value })
  
  try {
    // ✅ Stateless login
    const response = await API.post('/api/login', {
      login: username.value,
      password: password.value,
    })

    logger.info('Shared: Login successful', {
      user: response.data.user?.username,
      branch: response.data.user?.branch_name,
      roles: response.data.user?.roles?.map(r => r.name),
      tokenType: response.data.token_type
    })
    
    // ✅ Store user and token
    userStore.setUser(response.data.user)
    userStore.setToken(response.data.token)
    
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
