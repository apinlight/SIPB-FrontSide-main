<template>
  <DefaultLayout>
    <div class="p-4 sm:p-6 space-y-6">
      <div class="bg-white p-6 rounded-xl shadow">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">📊 Dashboard</h1>
        <p class="text-gray-600 mt-1">Selamat datang di Sistem Informasi dan Pencatatan Barang</p>
      </div>
      
      <div v-if="userStore?.user">
        <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <h2 class="text-xl font-semibold mb-2">👋 Selamat Datang!</h2>
          <p class="text-lg">{{ userStore.user.username }}</p>
          <p class="text-sm opacity-90">{{ userStore.user.branch_name }}</p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow mt-6">
          <h2 class="text-lg font-semibold mb-4 text-gray-800">📋 Informasi Akun</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-600 mb-1">Username</p>
              <p class="font-medium text-gray-900">{{ userStore.user.username }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-600 mb-1">Email</p>
              <p class="font-medium text-gray-900">{{ userStore.user.email }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-600 mb-1">Cabang</p>
              <p class="font-medium text-gray-900">{{ userStore.user.branch_name }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm text-gray-600 mb-1">Role</p>
              <p class="font-medium text-gray-900">
                <span v-if="userStore.userRoles?.length > 0">
                  {{ userStore.userRoles.join(', ') }}
                </span>
                <span v-else class="text-gray-500">Tidak ada role</span>
              </p>
            </div>
          </div>
          
          <div class="mt-6">
            <div v-if="userStore.isAdmin" class="p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
              <div class="flex items-center gap-2">
                <span class="text-2xl">🔑</span>
                <div>
                  <p class="font-semibold">Akses Administrator</p>
                  <p class="text-sm">Anda memiliki hak akses penuh ke semua fitur sistem</p>
                </div>
              </div>
            </div>
            <div v-else-if="userStore.isManager" class="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg">
              <div class="flex items-center gap-2">
                <span class="text-2xl">👔</span>
                <div>
                  <p class="font-semibold">Akses Manager</p>
                  <p class="text-sm">Anda dapat mengelola cabang dan menyetujui pengajuan</p>
                </div>
              </div>
            </div>
            <div v-else-if="userStore.isUser" class="p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
              <div class="flex items-center gap-2">
                <span class="text-2xl">👤</span>
                <div>
                  <p class="font-semibold">Akses User</p>
                  <p class="text-sm">Anda dapat mengajukan dan menggunakan barang</p>
                </div>
              </div>
            </div>
            <div v-else class="p-4 bg-gray-50 border border-gray-200 text-gray-800 rounded-lg">
              <div class="flex items-center gap-2">
                <span class="text-2xl">❓</span>
                <div>
                  <p class="font-semibold">Role tidak dikenali</p>
                  <p class="text-sm">Silakan hubungi administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="bg-white p-8 rounded-xl shadow text-center">
        <div class="animate-pulse">
          <div class="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2 mx-auto mt-4"></div>
        </div>
        <p class="text-gray-500 mt-4">Memuat data pengguna...</p>
      </div>
    </div>
  </DefaultLayout>
</template>
  
<script setup>
import { ref } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useUserStore } from '@/stores/userStore' // ✅ Direct import

// ✅ SIMPLIFIED: No need for useAuthGuard anymore
const userStore = useUserStore()

// ✅ No need for complex auth checking - router guard handles it!
</script>

