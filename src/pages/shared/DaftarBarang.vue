<template>
  <DefaultLayout>
    <div v-if="alert.message" :class="alertClass" class="p-3 rounded mb-4">
      {{ alert.message }}
    </div>

    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Daftar Barang</h1>
      <button 
        v-if="userStore.isAdmin" 
        @click="toggleForm" 
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        {{ showForm ? 'Tutup Form' : '+ Tambah Barang' }}
      </button>
    </div>

    <BarangForm
      v-if="showForm && userStore.isAdmin"
      :editData="editItem"
      @close="resetForm"
      @saved="handleSaved"
    />
    <BarangTable 
      ref="barangTable" 
      @edit="handleEdit" 
      @saved="handleSaved"
      :canEdit="userStore.isAdmin"
    />
  </DefaultLayout>
</template>

<script setup>
import { ref, computed } from 'vue'
import BarangForm from '@/components/BarangForm.vue'
import BarangTable from '@/components/BarangTable.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useUserStore } from '@/stores/userStore'
import { logger } from '@/lib/logger'

const userStore = useUserStore()

const showForm = ref(false)
const editItem = ref(null)
const alert = ref({ message: '', type: 'success' })
const barangTable = ref(null)

const toggleForm = () => {
  if (!userStore.isAdmin) {
    logger.warn('Shared: Non-admin user attempted to toggle barang form', {
      user: userStore.user?.username,
      roles: userStore.userRoles
    })
    return
  }
  
  logger.info('Shared: Toggling barang form', { 
    showForm: !showForm.value,
    user: userStore.user?.username 
  })
  
  editItem.value = null
  showForm.value = !showForm.value
}

const resetForm = () => {
  logger.info('Shared: Resetting barang form')
  showForm.value = false
  editItem.value = null
}

const handleEdit = (item) => {
  if (!userStore.isAdmin) {
    logger.warn('Shared: Non-admin user attempted to edit barang', {
      user: userStore.user?.username,
      roles: userStore.userRoles,
      itemId: item?.id_barang
    })
    return
  }
  
  logger.info('Shared: Opening barang edit form', { 
    itemId: item.id_barang,
    itemName: item.nama_barang,
    user: userStore.user?.username 
  })
  
  editItem.value = item
  showForm.value = true
}

const alertClass = computed(() =>
  alert.value.type === 'success'
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800'
)

const showAlert = (message, type = 'success') => {
  logger.info('Shared: Showing alert', { message, type })
  alert.value = { message, type }
  setTimeout(() => (alert.value.message = ''), 3000)
}

const handleSaved = (result) => {
  logger.info('Shared: Barang save operation completed', { 
    success: result.success,
    message: result.message,
    user: userStore.user?.username 
  })
  
  resetForm()
  showAlert(result.message || 'Terjadi Kesalahan', result.success ? 'success' : 'error')
  if (result.success) barangTable.value?.fetchBarang()
}
</script>
