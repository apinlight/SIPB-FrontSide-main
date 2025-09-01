<!-- src/pages/BatasBarang.vue -->
<template>
  <DefaultLayout>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">⚠️ Kelola Batas Barang</h1>
        <button 
          @click="showForm = !showForm"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {{ showForm ? 'Tutup Form' : '+ Set Batas Barang' }}
        </button>
      </div>

      <!-- Alert -->
      <div v-if="alert.message" :class="alertClass" class="p-3 rounded mb-4">
        {{ alert.message }}
      </div>

      <!-- Form -->
      <div v-if="showForm" class="bg-white p-4 rounded-lg shadow mb-6">
        <h2 class="text-lg font-semibold mb-4">
          {{ editMode ? 'Edit Batas Barang' : 'Set Batas Barang' }}
        </h2>
        <form @submit.prevent="submitForm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Pilih Barang</label>
              <select 
                v-model="form.id_barang"
                class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                :disabled="editMode"
              >
                <option value="">-- Pilih Barang --</option>
                <option 
                  v-for="barang in availableBarang" 
                  :key="barang.id_barang" 
                  :value="barang.id_barang"
                >
                  {{ barang.nama_barang }} ({{ barang.jenis_barang?.nama_jenis_barang || 'No Category' }})
                </option>
              </select>
              <p v-if="editMode" class="text-xs text-gray-500 mt-1">
                Barang tidak dapat diubah saat edit
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Batas Minimum Stok</label>
              <input 
                v-model.number="form.batas_barang"
                type="number" 
                min="0"
                class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan batas minimum"
                required
              />
              <p class="text-xs text-gray-500 mt-1">
                Sistem akan memberikan peringatan jika stok di bawah nilai ini
              </p>
            </div>
          </div>
          
          <div class="flex gap-2 mt-6">
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

      <!-- Search -->
      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="flex gap-4">
          <input 
            v-model="search"
            @input="handleSearch"
            type="text"
            placeholder="Cari nama barang..."
            class="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select 
            v-model="statusFilter"
            @change="handleSearch"
            class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Semua Status</option>
            <option value="normal">Normal</option>
            <option value="warning">Peringatan</option>
            <option value="critical">Kritis</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="loading && batasBarangList.length === 0" class="p-8 text-center text-gray-500">
          Memuat data...
        </div>
        <div v-else-if="batasBarangList.length === 0" class="p-8 text-center text-gray-500">
          Belum ada data batas barang
        </div>
        <table v-else class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Barang
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jenis Barang
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Batas Minimum
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stok Saat Ini
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in batasBarangList" :key="item.id_barang" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.barang?.nama_barang || 'Unknown' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.barang?.jenis_barang?.nama_jenis_barang || 'No Category' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.batas_barang }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ getCurrentStock(item.id_barang) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadgeClass(item)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ getStatusText(item) }}
                </span>
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

        <!-- Pagination -->
        <div v-if="pagination.last_page > 1" class="bg-gray-50 px-6 py-3 flex justify-between items-center">
          <div class="text-sm text-gray-700">
            Menampilkan {{ pagination.from }} - {{ pagination.to }} dari {{ pagination.total }} data
          </div>
          <div class="flex gap-2">
            <button 
              @click="changePage(pagination.current_page - 1)"
              :disabled="pagination.current_page === 1"
              class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Sebelumnya
            </button>
            <span class="px-3 py-1 text-sm">
              {{ pagination.current_page }} / {{ pagination.last_page }}
            </span>
            <button 
              @click="changePage(pagination.current_page + 1)"
              :disabled="pagination.current_page === pagination.last_page"
              class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Berikutnya
            </button>
          </div>
        </div>
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
const batasBarangList = ref([])
const barangList = ref([])
const gudangData = ref([])
const search = ref('')
const statusFilter = ref('')
const alert = ref({ message: '', type: 'success' })

const form = ref({
  id_barang: '',
  batas_barang: 0
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

const availableBarang = computed(() => {
  if (editMode.value) return barangList.value
  
  // Filter out barang that already have batas set
  const existingIds = batasBarangList.value.map(item => item.id_barang)
  return barangList.value.filter(barang => !existingIds.includes(barang.id_barang))
})

// Methods
const fetchData = async (page = 1) => {
  loading.value = true
  logger.info('Fetching batas barang data', { page, search: search.value, status: statusFilter.value })
  
  try {
    const params = {
      page,
      search: search.value || undefined,
      status: statusFilter.value || undefined,
      with: 'barang.jenis_barang' // ✅ Request related barang data
    }
    
    const response = await API.get('/batas-barang', { params })
    batasBarangList.value = response.data.data
    
    if (response.data.meta) {
      pagination.value = response.data.meta
    }
    
    logger.success('Batas barang data loaded successfully', { count: batasBarangList.value.length })
  } catch (error) {
    logger.error('Error fetching batas barang:', error.message)
    showAlert('Gagal memuat data batas barang', 'error')
  } finally {
    loading.value = false
  }
}

const fetchBarang = async () => {
  logger.debug('Fetching barang data for batas barang')
  try {
    const response = await API.get('/barang', { 
      params: { with: 'jenis_barang' } // ✅ Request related jenis data
    })
    barangList.value = response.data.data
    logger.success('Barang data loaded for batas barang', { count: barangList.value.length })
  } catch (error) {
    logger.error('Error fetching barang:', error.message)
    showAlert('Gagal memuat data barang', 'error')
  }
}

const fetchGudangData = async () => {
  logger.debug('Fetching gudang data for stock calculation')
  try {
    const response = await API.get('/gudang')
    gudangData.value = response.data.data
    logger.success('Gudang data loaded', { count: gudangData.value.length })
  } catch (error) {
    logger.error('Error fetching gudang data:', error.message)
  }
}

const submitForm = async () => {
  loading.value = true
  logger.info('Submitting batas barang form', { 
    mode: editMode.value ? 'edit' : 'create',
    id_barang: form.value.id_barang,
    batas_barang: form.value.batas_barang
  })
  
  try {
    if (editMode.value) {
      await API.put(`/batas-barang/${form.value.id_barang}`, {
        batas_barang: form.value.batas_barang
      })
      logger.success('Batas barang updated successfully', { id_barang: form.value.id_barang })
      showAlert('Batas barang berhasil diupdate', 'success')
    } else {
      await API.post('/batas-barang', form.value)
      logger.success('Batas barang created successfully', { id_barang: form.value.id_barang })
      showAlert('Batas barang berhasil ditambahkan', 'success')
    }
    
    resetForm()
    fetchData()
  } catch (error) {
    logger.error('Error saving batas barang:', error.message, { form: form.value })
    const errorMsg = error.response?.data?.message || 'Gagal menyimpan batas barang'
    showAlert(errorMsg, 'error')
  } finally {
    loading.value = false
  }
}

const editItem = (item) => {
  logger.info('Editing batas barang', { id_barang: item.id_barang, current_batas: item.batas_barang })
  
  form.value = {
    id_barang: item.id_barang,
    batas_barang: item.batas_barang
  }
  editMode.value = true
  showForm.value = true
}

const deleteItem = async (item) => {
  const barangName = item.barang?.nama_barang || 'barang ini'
  if (confirm(`Yakin ingin menghapus batas untuk "${barangName}"?`)) {
    logger.info('Deleting batas barang', { id_barang: item.id_barang, nama_barang: barangName })
    
    try {
      await API.delete(`/batas-barang/${item.id_barang}`)
      logger.success('Batas barang deleted successfully', { id_barang: item.id_barang })
      showAlert('Batas barang berhasil dihapus', 'success')
      fetchData()
    } catch (error) {
      logger.error('Error deleting batas barang:', error.message, { id_barang: item.id_barang })
      const errorMsg = error.response?.data?.message || 'Gagal menghapus batas barang'
      showAlert(errorMsg, 'error')
    }
  }
}

const resetForm = () => {
  logger.debug('Resetting batas barang form')
  form.value = {
    id_barang: '',
    batas_barang: 0
  }
  editMode.value = false
  showForm.value = false
}

const handleSearch = () => {
  logger.debug('Searching batas barang', { search: search.value, status: statusFilter.value })
  pagination.value.current_page = 1
  fetchData()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    logger.debug('Changing page', { page })
    fetchData(page)
  }
}

// ✅ Memoized stock calculations to prevent performance issues
const stockCache = computed(() => {
  const cache = {}
  // ✅ Add safeguard against excessive data
  if (gudangData.value.length > 10000) {
    logger.warn('Large gudang dataset detected', { count: gudangData.value.length })
  }
  
  gudangData.value.forEach(item => {
    if (!cache[item.id_barang]) {
      cache[item.id_barang] = 0
    }
    cache[item.id_barang] += (item.jumlah_barang || 0)
  })
  return cache
})

const getCurrentStock = (idBarang) => {
  const stock = stockCache.value[idBarang] || 0
  logger.debug('Getting current stock from cache', { id_barang: idBarang, stock })
  return stock
}

const getStatusText = (item) => {
  const currentStock = getCurrentStock(item.id_barang)
  const batas = item.batas_barang
  
  if (currentStock === 0) return 'Habis'
  if (currentStock <= batas * 0.5) return 'Kritis'
  if (currentStock <= batas) return 'Peringatan'
  return 'Normal'
}

const getStatusBadgeClass = (item) => {
  const status = getStatusText(item)
  switch (status) {
    case 'Habis':
      return 'bg-black text-white'
    case 'Kritis':
      return 'bg-red-100 text-red-800'
    case 'Peringatan':
      return 'bg-yellow-100 text-yellow-800'
    case 'Normal':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const showAlert = (message, type = 'success') => {
  alert.value = { message, type }
  setTimeout(() => {
    alert.value.message = ''
  }, 3000)
}

// Lifecycle
onMounted(async () => {
  logger.info('BatasBarang page mounted')
  await Promise.all([
    fetchData(),
    fetchBarang(),
    fetchGudangData()
  ])
})
</script>