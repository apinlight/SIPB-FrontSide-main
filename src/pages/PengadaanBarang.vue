<!-- src/pages/PengadaanBarang.vue -->
<template>
  <DefaultLayout>
    <div v-if="alert.message" :class="alertClass" class="p-3 rounded mb-4">
      {{ alert.message }}
    </div>

    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold text-gray-800">Manajemen Barang</h1>
      <BaseButton 
        variant="primary" 
        size="md" 
        @click="toggleForm"
      >
        {{ showForm ? 'Tutup Form' : '+ Tambah Barang' }}
      </BaseButton>
    </div>

    <BarangForm
      v-if="showForm"
      :editData="editingItem"
      :jenisBarangList="jenisBarangList"
      @close="resetForm"
      @save="handleSave"
    />
    <BarangTable
      ref="barangTable"
      :items="items"
      :loading="loading"
      :pagination="pagination"
      :canEdit="true"
      :searchQuery="search"
      @edit="handleEdit"
      @delete="handleDelete"
      @change-page="changePage"
      @search="handleSearch"
    />
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import API from '@/lib/api'
import { toast } from 'vue3-toastify'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import BarangForm from '@/components/BarangForm.vue'
import BarangTable from '@/components/BarangTable.vue'
import BaseButton from '@/components/BaseButton.vue'
import { useUserStore } from '@/stores/userStore'
import { logger } from '@/lib/logger'

const userStore = useUserStore()

// State
const showForm = ref(false)
const editMode = ref(false)
const loading = ref(false)
const items = ref([]) // barang list
const jenisBarangList = ref([])
const search = ref('')
const alert = ref({ message: '', type: 'success' })

const editingItem = ref(null)

const pagination = ref({
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
  total: 0
})

// Computed
const alertClass = computed(() =>
  alert.value.type === 'success'
    ? 'bg-green-100 text-green-800 border border-green-200'
    : 'bg-red-100 text-red-800 border border-red-200'
)

// Methods
const fetchData = async (page = 1) => {
  loading.value = true
  logger.info('Fetching barang data', { page, search: search.value })
  
  try {
    const params = { page, search: search.value || undefined }
    const response = await API.get('/barang', { params })
    items.value = response.data.data || []
    if (response.data.meta) {
      pagination.value = response.data.meta
    }
    logger.success('Barang data loaded successfully', { count: items.value.length })
  } catch (error) {
    logger.error('Error fetching barang:', error.message)
    showAlert('Gagal memuat data barang', 'error')
  } finally {
    loading.value = false
  }
}

const fetchJenisBarang = async () => {
  logger.debug('Fetching jenis barang list')
  try {
    const response = await API.get('/jenis-barang')
    jenisBarangList.value = response.data.data || []
    logger.success('Jenis barang loaded', { count: jenisBarangList.value.length })
  } catch (error) {
    logger.error('Error fetching jenis barang:', error.message)
    showAlert('Gagal memuat jenis barang', 'error')
  }
}

const handleSave = async (payloadRef) => {
  loading.value = true
  logger.info('Saving barang', { mode: editMode.value ? 'edit' : 'create', form: payloadRef?.value })
  try {
    const data = payloadRef?.value ?? {}
    if (editMode.value && data.id_barang) {
      await API.put(`/barang/${data.id_barang}`, data)
      logger.success('Barang updated successfully', { id_barang: data.id_barang })
      showAlert('Barang berhasil diupdate', 'success')
    } else {
      await API.post('/barang', data)
      logger.success('Barang created successfully', { nama_barang: data.nama_barang })
      showAlert('Barang berhasil ditambahkan', 'success')
    }
    resetForm()
    fetchData()
  } catch (error) {
    logger.error('Error saving barang:', error.message, { form: payloadRef?.value })
    const msg = error.response?.data?.message || 'Gagal menyimpan barang'
    showAlert(msg, 'error')
  } finally {
    loading.value = false
  }
}

const handleEdit = (item) => {
  logger.info('Editing barang', { id_barang: item.id_barang, nama_barang: item.nama_barang })
  editingItem.value = {
    id_barang: item.id_barang,
    id_jenis_barang: item.id_jenis_barang || item.jenis_barang?.id_jenis_barang,
    nama_barang: item.nama_barang,
    harga_barang: item.harga_barang,
    satuan: item.satuan || '',
    deskripsi: item.deskripsi || '',
    batas_minimum: item.batas_minimum ?? 5,
  }
  editMode.value = true
  showForm.value = true
}

const handleDelete = async (item) => {
  if (confirm(`Yakin ingin menghapus barang "${item.nama_barang}"?`)) {
    logger.info('Deleting barang', { id_barang: item.id_barang, nama_barang: item.nama_barang })
    try {
      await API.delete(`/barang/${item.id_barang}`)
      logger.success('Barang deleted successfully', { id_barang: item.id_barang })
      showAlert('Barang berhasil dihapus', 'success')
      fetchData()
    } catch (error) {
      logger.error('Error deleting barang:', error.message, { id_barang: item.id_barang })
      const errorMsg = error.response?.data?.message || 'Gagal menghapus barang'
      showAlert(errorMsg, 'error')
    }
  }
}

const resetForm = () => {
  logger.debug('Resetting barang form')
  editingItem.value = null
  editMode.value = false
  showForm.value = false
}

const toggleForm = () => {
  if (showForm.value) {
    resetForm()
  } else {
    showForm.value = true
  }
}

const handleSearch = (q) => {
  search.value = q
  logger.debug('Searching barang', { search: search.value })
  pagination.value.current_page = 1
  fetchData()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    logger.debug('Changing page', { page })
    fetchData(page)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

const getTotalValue = (item) => {
  return (item.barang?.harga_barang || 0) * item.jumlah_barang
}

const showAlert = (message, type = 'success') => {
  alert.value = { message, type }
  setTimeout(() => {
    alert.value.message = ''
  }, 3000)
}

// Lifecycle
onMounted(async () => {
  logger.info('PengadaanBarang page mounted')
  await Promise.all([
    fetchData(),
    fetchJenisBarang()
  ])
})
</script>