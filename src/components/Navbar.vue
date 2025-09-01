<template>
  <nav class="bg-white shadow px-6 py-4 flex justify-between items-center">
    <div class="flex items-center gap-2">
      <!-- Hamburger for mobile -->
      <button
        class="md:hidden mr-2 text-2xl"
        @click="$emit('toggle-sidebar')"
        aria-label="Open sidebar"
      >
        &#9776;
      </button>
      <h1 class="text-2xl font-semibold text-gray-800 items-center">SIPB</h1>
    </div>
    <div class="flex items-center gap-4">
      <span class="flex items-center text-gray-600">
        Halo, {{ userStore.user?.branch_name }} ({{ userStore.user?.username }})
      </span>
    </div>
    <div class="justify-between items-center">
      <h1 class="text-2xl font-bold"></h1>
      <button
        @click="logout"
        class="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700"
      >
        Logout
      </button>
    </div>
  </nav>
</template>

<!-- src/components/Navbar.vue -->
<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { logger } from '@/lib/logger'
import API from '@/lib/api'

const router = useRouter()
const userStore = useUserStore()

const logout = async () => {
  logger.auth.logout()
  
  try {
    // ✅ Stateless logout - delete token on server (API uses /api/logout not /api/v1/logout)
    await API.post('/api/logout', {})
    logger.success('Logout API call successful')

  } catch (err) {
    logger.warn('Logout API error (continuing with logout):', err.response?.data?.message || err.message)
    // Continue with logout even if API call fails
  } finally {
    // ✅ Always clear auth data and redirect
    userStore.clearUser()
    router.replace('/login')
  }
}
</script>
