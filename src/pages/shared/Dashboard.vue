<template>
  <DefaultLayout>
    <div class="p-4 bg-gray-100">
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <br />
      <div v-if="userStore?.user">
        <p>Selamat datang di Dashboard, {{ userStore.user.branch_name }} ({{ userStore.user.username }})</p>
        
        <div class="mt-4 p-4 bg-white rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-2">Informasi Akun</h2>
          <p><strong>Username:</strong> {{ userStore.user.username }}</p>
          <p><strong>Email:</strong> {{ userStore.user.email }}</p>
          <p><strong>Cabang:</strong> {{ userStore.user.branch_name }}</p>
          <p><strong>Role:</strong> 
            <span v-if="userStore.userRoles?.length > 0">
              {{ userStore.userRoles.join(', ') }}
            </span>
            <span v-else class="text-gray-500">Tidak ada role</span>
          </p>
          
          <div class="mt-4">
            <div v-if="userStore.isAdmin" class="p-2 bg-red-100 text-red-800 rounded">
              🔑 Anda memiliki akses Admin
            </div>
            <div v-else-if="userStore.isManager" class="p-2 bg-blue-100 text-blue-800 rounded">
              👔 Anda memiliki akses Manager
            </div>
            <div v-else-if="userStore.isUser" class="p-2 bg-green-100 text-green-800 rounded">
              👤 Anda memiliki akses User
            </div>
            <div v-else class="p-2 bg-gray-100 text-gray-800 rounded">
              ❓ Role tidak dikenali
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-gray-500">
        Loading user data...
      </div>
    </div>
  </DefaultLayout>
</template>
  
<script setup>
import { onMounted, ref } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

// ✅ SIMPLIFIED: Use direct store import instead of complex auth guard
const userStore = ref(null)

onMounted(async () => {
  try {
    // Dynamic import to ensure Pinia is ready
    const { useUserStore } = await import('@/stores/userStore')
    userStore.value = useUserStore()
    
    // Load user from storage
    userStore.value.loadUserFromStorage()
    
    // Check if user is authenticated, redirect if not
    if (!userStore.value.isAuthenticated) {
      const { useRouter } = await import('vue-router')
      const router = useRouter()
      router.push('/')
    }
    
  } catch (error) {
    console.error('Failed to initialize dashboard:', error)
    window.location.href = '/'
  }
})
</script>
