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
        :show-user="userStore.isAdmin || userStore.isManager"
        :readonly="false"
        @edit="handleEdit"
        @approve="handleApprove"
        @reject="handleReject"
        @saved="handleTableAction"
        ref="tableRef"
      />
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref } from 'vue'
import { toast } from 'vue3-toastify'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BaseButton from '@/components/BaseButton.vue'
import PenggunaanBarangForm from '@/components/PenggunaanBarangForm.vue'
import PenggunaanBarangTable from '@/components/PenggunaanBarangTable.vue'
import { useUserStore } from '@/stores/userStore'
import API from '@/lib/api'
import { logger } from '@/lib/logger'

const userStore = useUserStore()
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
  tableRef.value?.fetchPenggunaanBarang()
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
    const response = await API.post(`/penggunaan-barang/${penggunaan.id_penggunaan}/approve`)
    
    if (response.data.success) {
      toast.success('Penggunaan barang berhasil disetujui')
      tableRef.value?.fetchPenggunaanBarang()
    }
  } catch (err) {
    logger.error('Failed to approve penggunaan barang:', err.response?.data?.message || err.message)
    toast.error('Gagal menyetujui penggunaan barang')
  }
}

const handleReject = async (penggunaan) => {
  if (!confirm(`Yakin ingin menolak penggunaan barang "${penggunaan.barang?.nama_barang}"?`)) {
    return
  }

  try {
    logger.debug('Rejecting penggunaan barang:', penggunaan.id_penggunaan)
    const response = await API.post(`/penggunaan-barang/${penggunaan.id_penggunaan}/reject`)
    
    if (response.data.success) {
      toast.success('Penggunaan barang berhasil ditolak')
      tableRef.value?.fetchPenggunaanBarang()
    }
  } catch (err) {
    logger.error('Failed to reject penggunaan barang:', err.response?.data?.message || err.message)
    toast.error('Gagal menolak penggunaan barang')
  }
}

const handleTableAction = (result) => {
  if (result.success) {
    toast.success(result.message)
  } else {
    toast.error(result.message)
  }
}
</script>