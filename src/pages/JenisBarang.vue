<!-- src/pages/JenisBarang.vue -->
<template>
  <DefaultLayout>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">🏷️ Kelola Jenis Barang</h1>
        <button
          @click="showForm = !showForm"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {{ showForm ? 'Tutup Form' : '+ Tambah Jenis Barang' }}
        </button>
      </div>

      <!-- Alert -->
      <div v-if="alert.message" :class="alertClass" class="p-3 rounded mb-4">
        {{ alert.message }}
      </div>

      <!-- Form -->
      <div v-if="showForm" class="bg-white p-4 rounded-lg shadow mb-6">
        <h2 class="text-lg font-semibold mb-4">
          {{ editMode ? 'Edit Jenis Barang' : 'Tambah Jenis Barang' }}
        </h2>
        <form @submit.prevent="submitForm">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-2">Nama Jenis Barang</label>
            <input
              v-model="form.nama"
              type="text"
              class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Masukkan nama jenis barang"
              required
            />
          </div>
          <div class="flex gap-2">
            <button
              type="submit"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              :disabled="loading"
            >
              {{ loading ? 'Menyimpan...' : (editMode ? 'Update' : 'Simpan') }}
            </button>
            <button
              type="button"
              @click="resetForm"
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Batal
            </button>
          </div>
        </form>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="loading && jenisBarangList.length === 0" class="p-8 text-center text-gray-500">
          Memuat data...
        </div>
        <div v-else-if="jenisBarangList.length === 0" class="p-8 text-center text-gray-500">
          Belum ada data jenis barang
        </div>
        <table v-else class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID Jenis Barang
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Jenis Barang
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in jenisBarangList" :key="item.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.nama }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                <button
                  @click="editItem(item)"
                  class="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit
                </button>
                <button
                  @click="deleteItem(item)"
                  class="text-red-600 hover:text-red-800 font-medium"
                >
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import API from '@/lib/api'
import { toast } from 'vue3-toastify'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { logger } from '@/lib/logger'

// State
const showForm = ref(false)
const editMode = ref(false)
const loading = ref(false)
const jenisBarangList = ref([])
const search = ref('')
const alert = ref({ message: '', type: 'success' })

const form = ref({
  id_jenis_barang: '',
  nama_jenis_barang: '',
  deskripsi: ''
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
  logger.info('Fetching jenis barang data', { page, search: search.value })
  
  try {
    const params = {
      page,
      search: search.value || undefined
    }
    
    const response = await API.get('/jenis-barang', { params })
    jenisBarangList.value = response.data.data
    
    if (response.data.meta) {
      pagination.value = response.data.meta
    }
    
    logger.success('Jenis barang data loaded successfully', { count: jenisBarangList.value.length })
  } catch (error) {
    logger.error('Error fetching jenis barang:', error.message)
    showAlert('Gagal memuat data jenis barang', 'error')
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  loading.value = true
  logger.info('Submitting jenis barang form', { 
    mode: editMode.value ? 'edit' : 'create',
    nama_jenis_barang: form.value.nama_jenis_barang
  })
  
  try {
    if (editMode.value) {
      await API.put(`/jenis-barang/${form.value.id_jenis_barang}`, {
        nama_jenis_barang: form.value.nama_jenis_barang,
        deskripsi: form.value.deskripsi
      })
      logger.success('Jenis barang updated successfully', { 
        id: form.value.id_jenis_barang,
        nama: form.value.nama_jenis_barang 
      })
      showAlert('Jenis barang berhasil diupdate', 'success')
    } else {
      await API.post('/jenis-barang', {
        nama_jenis_barang: form.value.nama_jenis_barang,
        deskripsi: form.value.deskripsi
      })
      logger.success('Jenis barang created successfully', { nama: form.value.nama_jenis_barang })
      showAlert('Jenis barang berhasil ditambahkan', 'success')
    }
    
    resetForm()
    fetchData()
  } catch (error) {
    logger.error('Error saving jenis barang:', error.message, { form: form.value })
    const errorMsg = error.response?.data?.message || 'Gagal menyimpan jenis barang'
    showAlert(errorMsg, 'error')
  } finally {
    loading.value = false
  }
}

const editItem = (item) => {
  logger.info('Editing jenis barang', { 
    id: item.id_jenis_barang, 
    nama: item.nama_jenis_barang 
  })
  
  form.value = {
    id_jenis_barang: item.id_jenis_barang,
    nama_jenis_barang: item.nama_jenis_barang,
    deskripsi: item.deskripsi || ''
  }
  editMode.value = true
  showForm.value = true
}

const deleteItem = async (item) => {
  if (confirm(`Yakin ingin menghapus jenis barang "${item.nama_jenis_barang}"?`)) {
    logger.info('Deleting jenis barang', { 
      id: item.id_jenis_barang, 
      nama: item.nama_jenis_barang 
    })
    
    try {
      await API.delete(`/jenis-barang/${item.id_jenis_barang}`)
      logger.success('Jenis barang deleted successfully', { nama: item.nama_jenis_barang })
      showAlert('Jenis barang berhasil dihapus', 'success')
      fetchData()
    } catch (error) {
      logger.error('Error deleting jenis barang:', error.message, { 
        id: item.id_jenis_barang,
        nama: item.nama_jenis_barang 
      })
      const errorMsg = error.response?.data?.message || 'Gagal menghapus jenis barang'
      showAlert(errorMsg, 'error')
    }
  }
}

const resetForm = () => {
  logger.debug('Resetting jenis barang form')
  form.value = {
    id_jenis_barang: '',
    nama_jenis_barang: '',
    deskripsi: ''
  }
  editMode.value = false
  showForm.value = false
}

const handleSearch = () => {
  logger.debug('Searching jenis barang', { search: search.value })
  pagination.value.current_page = 1
  fetchData()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    logger.debug('Changing page', { page })
    fetchData(page)
  }
}

const showAlert = (message, type = 'success') => {
  alert.value = { message, type }
  setTimeout(() => {
    alert.value.message = ''
  }, 3000)
}

// Lifecycle
onMounted(() => {
  logger.info('JenisBarang page mounted')
  fetchData()
})
</script>