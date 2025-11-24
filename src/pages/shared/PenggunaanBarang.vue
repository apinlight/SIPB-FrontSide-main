<template>
  <DefaultLayout>
    <div class="space-y-6">
      <!-- Header -->
      <div class="bg-white p-6 rounded-xl shadow">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">Penggunaan Barang</h1>
            <p class="text-gray-600 mt-1">{{ getPageDescription() }}</p>
          </div>
          <div class="flex items-center space-x-3">
            <span class="px-3 py-1 text-sm rounded-full" :class="getRoleBadgeSimpleClass(getRoleText())">
              {{ getRoleText() }}
            </span>
            <!-- ✅ FIX: Only regular Users dapat record usage; Admin & Manager are read-only -->
            <BaseButton 
              v-if="!showForm && userStore.isUser" 
              variant="primary" 
              @click="showForm = true"
            >
              + Tambah Penggunaan
            </BaseButton>
          </div>
        </div>
      </div>

      <!-- Form Section -->
      <div v-if="showForm">
        <PenggunaanBarangForm
          :penggunaan="editingPenggunaan"
          :availableStock="penggunaanBarangStore.availableStock"
          @saved="handleFormSaved"
          @cancel="handleFormCancel"
        />
      </div>

      <!-- Table Section -->
      <PenggunaanBarangTable
        :items="penggunaanBarangStore.penggunaanList"
        :loading="penggunaanBarangStore.loading"
        :pagination="penggunaanBarangStore.pagination"
        :show-user="userStore.isAdmin || userStore.isManager"
        @edit="handleEdit"
        @change-page="handlePageChange"
        ref="tableRef"
      />
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { toast } from 'vue3-toastify'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import PenggunaanBarangForm from '@/components/PenggunaanBarangForm.vue'
import PenggunaanBarangTable from '@/components/PenggunaanBarangTable.vue'
import { useUserStore } from '@/stores/userStore'
import { usePenggunaanBarangStore } from '@/stores/penggunaanBarangStore'
import API from '@/lib/api'
import { logger } from '@/lib/logger'
import { getRoleBadgeSimpleClass } from '@/utils/formatters'

const userStore = useUserStore()
const penggunaanBarangStore = usePenggunaanBarangStore()
const showForm = ref(false)
const editingPenggunaan = ref(null)
const tableRef = ref(null)

// Methods
const getRoleText = () => {
  if (userStore.isAdmin) return 'Admin (Read-Only)'
  if (userStore.isManager) return 'Manager (Read-Only)'
  return 'User'
}

const getPageDescription = () => {
  if (userStore.isAdmin) {
    return 'Monitoring penggunaan barang dari semua cabang (read-only)'
  } else if (userStore.isManager) {
    return 'Monitoring penggunaan barang dari semua cabang (read-only)'
  } else {
    return 'Catat dan pantau penggunaan barang Anda'
  }
}

const handleFormSaved = (data) => {
  showForm.value = false
  editingPenggunaan.value = null
  penggunaanBarangStore.fetchPenggunaanBarang()
  toast.success('Penggunaan barang berhasil disimpan')
}

const handleFormCancel = () => {
  showForm.value = false
  editingPenggunaan.value = null
}

const handleEdit = (penggunaan) => {
  editingPenggunaan.value = penggunaan
  showForm.value = true
}

const handlePageChange = (page) => {
  penggunaanBarangStore.fetchPenggunaanBarang({ page })
}

// Fetch data on component mount
onMounted(async () => {
  try {
    logger.debug('Mounting PenggunaanBarang component, fetching data...')
    await penggunaanBarangStore.fetchPenggunaanBarang()
    logger.success('PenggunaanBarang data loaded successfully')
  } catch (error) {
    logger.error('Failed to load penggunaan barang data:', error)
    toast.error('Gagal memuat data penggunaan barang')
  }
})

// Load available stock whenever form opens
watch(showForm, async (open) => {
  if (open) {
    try {
      await penggunaanBarangStore.fetchAvailableStock()
    } catch (_) {
      // Feedback already handled in store/logger
    }
  }
})
</script>