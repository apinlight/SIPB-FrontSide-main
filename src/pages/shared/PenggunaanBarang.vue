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
            <span class="px-3 py-1 text-sm rounded-full" :class="getRoleBadgeClass()">
              {{ getRoleText() }}
            </span>
            <BaseButton 
              v-if="!showForm" 
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
        :readonly="false"
        @edit="handleEdit"
        @approve="handleApprove"
        @reject="handleReject"
        @change-page="handlePageChange"
        @saved="handleTableAction"
        ref="tableRef"
      />
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import PenggunaanBarangForm from '@/components/PenggunaanBarangForm.vue'
import PenggunaanBarangTable from '@/components/PenggunaanBarangTable.vue'
import { useUserStore } from '@/stores/userStore'
import { usePenggunaanBarangStore } from '@/stores/penggunaanBarangStore'
import API from '@/lib/api'
import { logger } from '@/lib/logger'

const userStore = useUserStore()
const penggunaanBarangStore = usePenggunaanBarangStore()
const showForm = ref(false)
const editingPenggunaan = ref(null)
const tableRef = ref(null)

// Methods
const getPageDescription = () => {
  if (userStore.isAdmin) {
    return 'Kelola semua penggunaan barang di seluruh cabang'
  } else if (userStore.isManager) {
    return 'Kelola penggunaan barang di cabang Anda'
  } else {
    return 'Catat dan pantau penggunaan barang Anda'
  }
}

const getRoleText = () => {
  if (userStore.isAdmin) return 'Admin'
  if (userStore.isManager) return 'Manager'
  return 'User'
}

const getRoleBadgeClass = () => {
  if (userStore.isAdmin) {
    return 'bg-red-100 text-red-800'
  } else if (userStore.isManager) {
    return 'bg-blue-100 text-blue-800'
  } else {
    return 'bg-green-100 text-green-800'
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

const handleApprove = async (penggunaan) => {
  if (!confirm(`Yakin ingin menyetujui penggunaan barang "${penggunaan.barang?.nama_barang}"?`)) {
    return
  }

  try {
    logger.debug('Approving penggunaan barang:', penggunaan.id_penggunaan)
    await API.post(`/penggunaan-barang/${penggunaan.id_penggunaan}/approve`)
    // Backend returns a Resource on success; if we reach here, it's successful
    toast.success('Penggunaan barang berhasil disetujui')
    await penggunaanBarangStore.fetchPenggunaanBarang()
  } catch (err) {
    logger.error('Failed to approve penggunaan barang:', err.response?.data?.message || err.message)
    const msg = err.response?.data?.message || 'Gagal menyetujui penggunaan barang'
    toast.error(msg)
  }
}

const handleReject = async (penggunaan) => {
  if (!confirm(`Yakin ingin menolak penggunaan barang "${penggunaan.barang?.nama_barang}"?`)) {
    return
  }

  try {
    logger.debug('Rejecting penggunaan barang:', penggunaan.id_penggunaan)
    await API.post(`/penggunaan-barang/${penggunaan.id_penggunaan}/reject`)
    // Backend returns a Resource on success; if we reach here, it's successful
    toast.success('Penggunaan barang berhasil ditolak')
    await penggunaanBarangStore.fetchPenggunaanBarang()
  } catch (err) {
    logger.error('Failed to reject penggunaan barang:', err.response?.data?.message || err.message)
    const msg = err.response?.data?.message || 'Gagal menolak penggunaan barang'
    toast.error(msg)
  }
}

const handleTableAction = (result) => {
  if (result.success) {
    toast.success(result.message)
  } else {
    toast.error(result.message)
  }
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
</script>