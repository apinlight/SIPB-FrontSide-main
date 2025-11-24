<template>
  <DefaultLayout>
    <div class="p-4 sm:p-6 space-y-6">
      <!-- Header -->
      <div class="bg-white p-6 rounded-xl shadow">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">📊 Dashboard</h1>
        <p class="text-gray-600 mt-1">Sistem Informasi dan Pencatatan Barang (SIMBA)</p>
      </div>
      
      <div v-if="userStore?.user">
        <!-- Greeting Card -->
        <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white">
          <h2 class="text-xl font-semibold mb-2">👋 Selamat Datang, {{ userStore.user.username }}!</h2>
          <p class="text-sm opacity-90">
            Anda login sebagai <span class="font-semibold">{{ formatRole }}</span>
            <span v-if="!userStore.isAdmin"> di {{ cabangName }}</span>
          </p>
        </div>

        <!-- Account Info Card -->
        <div class="bg-white p-6 rounded-xl shadow">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-800">📋 Informasi Akun</h2>
            <router-link to="/profile" class="text-sm text-green-600 hover:text-green-700 font-medium">
              Edit Profil →
            </router-link>
          </div>
          
          <!-- Main Account Info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <!-- Username & Email -->
            <div class="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p class="text-xs font-semibold text-blue-600 uppercase tracking-wide">Username</p>
              <p class="font-semibold text-gray-900 mt-1">{{ userStore.user.username }}</p>
              <p class="text-sm text-gray-600 mt-2">{{ userStore.user.email }}</p>
            </div>

            <!-- Role Badge -->
            <div class="p-4 bg-purple-50 rounded-lg border border-purple-100">
              <p class="text-xs font-semibold text-purple-600 uppercase tracking-wide">Role</p>
              <div class="mt-2 flex gap-2 flex-wrap">
                <span 
                  v-for="role in userStore.userRoles" 
                  :key="role"
                  :class="getRoleBadgeClass(role)"
                  class="inline-block px-3 py-1 rounded-full text-xs font-medium"
                >
                  {{ formatRoleName(role) }}
                </span>
              </div>
            </div>

            <!-- Branch Info (for non-admin) -->
            <div v-if="!userStore.isAdmin" class="p-4 bg-orange-50 rounded-lg border border-orange-100">
              <p class="text-xs font-semibold text-orange-600 uppercase tracking-wide">Cabang</p>
              <p class="font-semibold text-gray-900 mt-1">{{ cabangName }}</p>
              <p class="text-xs text-gray-600 mt-1">ID: {{ userStore.user.id_cabang }}</p>
            </div>
          </div>

          <!-- Role-Specific Section -->
          <div class="border-t pt-6">
            <h3 class="font-semibold text-gray-800 mb-4">🔐 Hak Akses & Wewenang</h3>
            
            <!-- Admin Access Info -->
            <div v-if="userStore.isAdmin" class="p-4 bg-red-50 rounded-lg border border-red-200">
              <div class="flex gap-3">
                <span class="text-2xl">🔑</span>
                <div class="flex-1">
                  <p class="font-semibold text-red-900">Akses Administrator</p>
                  <ul class="text-sm text-red-800 mt-2 space-y-1 list-disc list-inside">
                    <li>Mengelola semua barang dan inventori</li>
                    <li>Mengelola semua pengguna dan role</li>
                    <li>Menyetujui/menolak semua pengajuan</li>
                    <li>Mengatur batas dan pengaturan sistem</li>
                    <li>Mengakses laporan dan analytics</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Manager Access Info -->
            <div v-else-if="userStore.isManager" class="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div class="flex gap-3">
                <span class="text-2xl">👔</span>
                <div class="flex-1">
                  <p class="font-semibold text-blue-900">Akses Manager</p>
                  <ul class="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                    <li>Mengelola barang di cabang {{ cabangName }}</li>
                    <li>Menyetujui/menolak pengajuan barang</li>
                    <li>Melihat laporan penggunaan barang</li>
                    <li>Mengelola pengguna cabang</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- User Access Info -->
            <div v-else-if="userStore.isUser" class="p-4 bg-green-50 rounded-lg border border-green-200">
              <div class="flex gap-3">
                <span class="text-2xl">👤</span>
                <div class="flex-1">
                  <p class="font-semibold text-green-900">Akses User Biasa</p>
                  <ul class="text-sm text-green-800 mt-2 space-y-1 list-disc list-inside">
                    <li>Mengajukan permintaan barang</li>
                    <li>Mencatat penggunaan barang</li>
                    <li>Melihat riwayat pengajuan pribadi</li>
                  </ul>
                </div>
              </div>
            </div>

            <!-- Unknown Role -->
            <div v-else class="p-4 bg-gray-100 rounded-lg border border-gray-300">
              <div class="flex gap-3">
                <span class="text-2xl">❓</span>
                <div>
                  <p class="font-semibold text-gray-900">Role Tidak Dikenali</p>
                  <p class="text-sm text-gray-600 mt-1">Silakan hubungi administrator untuk memeriksa akun Anda</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
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
import { computed } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useUserStore } from '@/stores/userStore'
import { formatRoleName, getRoleBadgeClass } from '@/utils/formatters'

const userStore = useUserStore()

// Format full role name for greeting
const formatRole = computed(() => {
  if (userStore.isAdmin) return 'Administrator'
  if (userStore.isManager) return 'Manager'
  if (userStore.isUser) return 'User'
  return 'Pengguna'
})

// Get cabang name from cabang relationship or fallback to id_cabang
const cabangName = computed(() => {
  if (userStore.user?.cabang) {
    // If cabang is an object with nama_cabang property
    if (typeof userStore.user.cabang === 'object' && userStore.user.cabang.nama_cabang) {
      return userStore.user.cabang.nama_cabang
    }
    // If cabang is just a string
    if (typeof userStore.user.cabang === 'string') {
      return userStore.user.cabang
    }
  }
  // Fallback to Pusat if no cabang data
  return 'Pusat'
})
</script>

