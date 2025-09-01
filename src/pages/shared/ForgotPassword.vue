<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-gray-800 mb-6">Lupa Password</h1>
      
      <form @submit.prevent="handleForgotPassword" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="Masukkan email Anda"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <BaseButton type="submit" variant="primary" class="w-full" :disabled="isLoading">
          {{ isLoading ? 'Mengirim...' : 'Kirim Link Reset' }}
        </BaseButton>
      </form>
      
      <p class="text-center text-sm text-gray-600 mt-4">
        Ingat password? 
        <router-link to="/login" class="text-green-600 hover:text-green-700 font-medium">
          Login di sini
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import BaseButton from '@/components/BaseButton.vue'

const email = ref('')
const isLoading = ref(false)

const handleForgotPassword = async () => {
  isLoading.value = true
  try {
    // Forgot password logic would go here
    toast.success('Link reset password telah dikirim ke email Anda')
  } catch (error) {
    toast.error('Gagal mengirim link reset password')
  } finally {
    isLoading.value = false
  }
}
</script>