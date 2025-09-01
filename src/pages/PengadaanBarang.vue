<!-- src/pages/PengadaanBarang.vue -->
<template>
  <DefaultLayout>
    <div v-if="alert.message" :class="alertClass" class="p-3 rounded mb-4">
      {{ alert.message }}
    </div>

    <div class="flex items-center justify-between mb-4">
      <h1 class="text-2xl font-bold">Manajemen Stok Gudang</h1>
      <button @click="toggleForm" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
        {{ showForm ? 'Tutup Form' : '+ Tambah Stok' }}
      </button>
    </div>

    <BarangForm
      v-if="showForm"
      :editData="editItem"
      @close="resetForm"
      @saved="handleSaved"
    />
    <BarangTable ref="barangTable" @edit="handleEdit" @saved="handleSaved" />
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import API from '@/lib/api'
import { toast } from 'vue3-toastify'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useUserStore } from '@/stores/userStore'
import { logger } from '@/lib/logger'

const userStore = useUserStore()

// State
const showForm = ref(false)
const editMode = ref(false)
const loading = ref(false)
const pengadaanList = ref([])
const barangList = ref([])
const search = ref('')
const statusFilter = ref('')
const alert = ref({ message: '', type: 'success' })

const form = ref({
  unique_id: '',
  id_barang: '',
  jumlah_barang: 0,
  tanggal_pengadaan: '',
  supplier: '',
  keterangan: ''
})

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
  logger.info('Fetching pengadaan data', { page, search: search.value, status: statusFilter.value })
  
  try {
    const params = {
      page,
      search: search.value || undefined,
      status: statusFilter.value || undefined
    }
    
    const response = await API.get('/gudang', { params })
    pengadaanList.value = response.data.data
    
    if (response.data.meta) {
      pagination.value = response.data.meta
    }
    
    logger.success('Pengadaan data loaded successfully', { count: pengadaanList.value.length })
  } catch (error) {
    logger.error('Error fetching pengadaan:', error.message)
    showAlert('Gagal memuat data pengadaan', 'error')
  } finally {
    loading.value = false
  }
}

const fetchBarang = async () => {
  logger.debug('Fetching barang data for pengadaan')
  try {
    const response = await API.get('/barang')
    barangList.value = response.data.data
    logger.success('Barang data loaded for pengadaan', { count: barangList.value.length })
  } catch (error) {
    logger.error('Error fetching barang:', error.message)
    showAlert('Gagal memuat data barang', 'error')
  }
}

const submitForm = async () => {
  loading.value = true
  logger.info('Submitting pengadaan form', { 
    mode: editMode.value ? 'edit' : 'create',
    id_barang: form.value.id_barang,
    jumlah_barang: form.value.jumlah_barang
  })
  
  try {
    const payload = {
      ...form.value,
      unique_id: userStore.user.unique_id
    }
    
    if (editMode.value) {
      await API.put(`/gudang/${payload.unique_id}/${payload.id_barang}`, payload)
      logger.success('Gudang entry updated successfully', { unique_id: payload.unique_id, id_barang: payload.id_barang })
      showAlert('Data gudang berhasil diupdate', 'success')
    } else {
      await API.post('/gudang', payload)
      logger.success('Gudang entry created successfully', { unique_id: payload.unique_id, id_barang: payload.id_barang })
      showAlert('Data gudang berhasil ditambahkan', 'success')
    }
    
    resetForm()
    fetchData()
  } catch (error) {
    logger.error('Error saving pengadaan:', error.message, { form: form.value })
    const errorMsg = error.response?.data?.message || 'Gagal menyimpan pengadaan'
    showAlert(errorMsg, 'error')
  } finally {
    loading.value = false
  }
}

const editItem = (item) => {
  logger.info('Editing gudang entry', { 
    unique_id: item.unique_id,
    id_barang: item.id_barang,
    barang: item.barang?.nama_barang 
  })
  
  form.value = {
    unique_id: item.unique_id,
    id_barang: item.id_barang,
    jumlah_barang: item.jumlah_barang,
    tanggal_pengadaan: item.tanggal_pengadaan || '',
    supplier: item.supplier || '',
    keterangan: item.keterangan || ''
  }
  editMode.value = true
  showForm.value = true
}

const deleteItem = async (item) => {
  if (confirm(`Yakin ingin menghapus data gudang "${item.barang?.nama_barang}"?`)) {
    logger.info('Deleting gudang entry', { 
      unique_id: item.unique_id,
      id_barang: item.id_barang,
      barang: item.barang?.nama_barang 
    })
    
    try {
      await API.delete(`/gudang/${item.unique_id}/${item.id_barang}`)
      logger.success('Gudang entry deleted successfully', { unique_id: item.unique_id, id_barang: item.id_barang })
      showAlert('Data gudang berhasil dihapus', 'success')
      fetchData()
    } catch (error) {
      logger.error('Error deleting gudang entry:', error.message, { unique_id: item.unique_id, id_barang: item.id_barang })
      const errorMsg = error.response?.data?.message || 'Gagal menghapus data gudang'
      showAlert(errorMsg, 'error')
    }
  }
}

const resetForm = () => {
  logger.debug('Resetting gudang form')
  form.value = {
    unique_id: '',
    id_barang: '',
    jumlah_barang: 0,
    tanggal_pengadaan: '',
    supplier: '',
    keterangan: ''
  }
  editMode.value = false
  showForm.value = false
}

const handleSearch = () => {
  logger.debug('Searching pengadaan', { search: search.value, status: statusFilter.value })
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
    fetchBarang()
  ])
})
</script>