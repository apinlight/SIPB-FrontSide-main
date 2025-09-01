<template>
  <DefaultLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white p-6 rounded-xl shadow">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">📊 Stok Tersedia</h1>
            <p class="text-gray-600 mt-1">Lihat stok barang yang tersedia untuk digunakan</p>
          </div>
          <BaseButton @click="refreshStock" variant="outline" :disabled="isLoading">
            🔄 Refresh
          </BaseButton>
        </div>
      </div>

      <!-- Filter -->
      <div class="bg-white p-4 rounded-xl shadow">
        <div class="flex gap-4 items-center">
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama barang..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <BaseButton @click="applyFilter" variant="primary">
            🔍 Cari
          </BaseButton>
        </div>
      </div>

      <!-- Stock Table -->
      <div class="bg-white rounded-xl shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kode Barang
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nama Barang
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Jenis
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stok Tersedia
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Harga Satuan
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="isLoading">
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                  <div class="flex items-center justify-center">
                    <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Memuat data...
                  </div>
                </td>
              </tr>
              <tr v-else-if="filteredStock.length === 0">
                <td colspan="6" class="px-6 py-4 text-center text-gray-500">
                  <div class="text-center py-8">
                    <span class="text-4xl mb-2 block">📦</span>
                    <p>{{ searchQuery ? 'Tidak ada barang yang sesuai dengan pencarian' : 'Belum ada stok barang' }}</p>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="item in filteredStock" :key="item.id_barang" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ item.id_barang }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ item.nama_barang }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ item.jenis_barang }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span :class="getStockStatusClass(item.jumlah_tersedia)">
                    {{ item.jumlah_tersedia }} unit
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rp {{ formatCurrency(item.harga_satuan) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStockBadgeClass(item.jumlah_tersedia)">
                    {{ getStockStatus(item.jumlah_tersedia) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-xl shadow">
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 rounded-lg">
              <span class="text-2xl">📦</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Total Jenis Barang</p>
              <p class="text-2xl font-semibold text-gray-900">{{ availableStock.length }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow">
          <div class="flex items-center">
            <div class="p-3 bg-green-100 rounded-lg">
              <span class="text-2xl">✅</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Stok Tersedia</p>
              <p class="text-2xl font-semibold text-green-600">{{ totalAvailableStock }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-xl shadow">
          <div class="flex items-center">
            <div class="p-3 bg-red-100 rounded-lg">
              <span class="text-2xl">⚠️</span>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-500">Stok Menipis</p>
              <p class="text-2xl font-semibold text-red-600">{{ lowStockCount }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import { usePenggunaanBarangStore } from '@/stores/penggunaanBarangStore'
import { logger } from '@/lib/logger'

const penggunaanStore = usePenggunaanBarangStore()
const searchQuery = ref('')
const isLoading = ref(false)

// Computed properties
const availableStock = computed(() => penggunaanStore.availableStock)

const filteredStock = computed(() => {
  if (!searchQuery.value) return availableStock.value
  
  return availableStock.value.filter(item =>
    item.nama_barang.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    item.id_barang.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const totalAvailableStock = computed(() => {
  return availableStock.value.reduce((total, item) => total + item.jumlah_tersedia, 0)
})

const lowStockCount = computed(() => {
  return availableStock.value.filter(item => item.jumlah_tersedia <= 5).length
})

// Methods
const refreshStock = async () => {
  isLoading.value = true
  try {
    await penggunaanStore.fetchAvailableStock()
    toast.success('Data stok berhasil diperbarui')
  } catch (error) {
    toast.error('Gagal memuat data stok')
  } finally {
    isLoading.value = false
  }
}

const applyFilter = () => {
  logger.info('Applying filter:', searchQuery.value)
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

const getStockStatus = (stock) => {
  if (stock === 0) return 'Habis'
  if (stock <= 5) return 'Menipis'
  if (stock <= 20) return 'Terbatas'
  return 'Tersedia'
}

const getStockStatusClass = (stock) => {
  if (stock === 0) return 'text-red-600 font-semibold'
  if (stock <= 5) return 'text-orange-600 font-semibold'
  if (stock <= 20) return 'text-yellow-600 font-semibold'
  return 'text-green-600 font-semibold'
}

const getStockBadgeClass = (stock) => {
  const baseClass = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  if (stock === 0) return `${baseClass} bg-red-100 text-red-800`
  if (stock <= 5) return `${baseClass} bg-orange-100 text-orange-800`
  if (stock <= 20) return `${baseClass} bg-yellow-100 text-yellow-800`
  return `${baseClass} bg-green-100 text-green-800`
}

// Lifecycle
onMounted(() => {
  refreshStock()
})
</script>