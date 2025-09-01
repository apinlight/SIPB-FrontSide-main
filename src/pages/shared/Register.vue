<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Register SIPB</h1>
      
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            v-model="form.username"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            v-model="form.password"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nama Cabang</label>
          <input
            v-model="form.branch_name"
            type="text"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <BaseButton type="submit" variant="primary" class="w-full" :disabled="isLoading">
          {{ isLoading ? 'Mendaftar...' : 'Daftar' }}
        </BaseButton>
      </form>
      
      <p class="text-center text-sm text-gray-600 mt-4">
        Sudah punya akun? 
        <router-link to="/login" class="text-green-600 hover:text-green-700 font-medium">
          Login di sini
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'
import BaseButton from '@/components/BaseButton.vue'

const router = useRouter()
const isLoading = ref(false)

const form = ref({
  username: '',
  email: '',
  password: '',
  branch_name: ''
})

const handleRegister = async () => {
  isLoading.value = true
  try {
    // Register logic would go here
    toast.success('Registrasi berhasil! Silakan login.')
    router.push('/login')
  } catch (error) {
    toast.error('Registrasi gagal')
  } finally {
    isLoading.value = false
  }
}
</script>