<!-- src/pages/BatasPengajuan.vue -->
<template>
  <DefaultLayout>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">📋 Kelola Batas Pengajuan</h1>
        <button 
          @click="showForm = !showForm"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {{ showForm ? 'Tutup Form' : '+ Set Batas Pengajuan' }}
        </button>
      </div>

      <!-- Alert -->
      <div v-if="alert.message" :class="alertClass" class="p-3 rounded mb-4">
        {{ alert.message }}
      </div>

      <!-- Form -->
      <div v-if="showForm" class="bg-white p-4 rounded-lg shadow mb-6">
        <h2 class="text-lg font-semibold mb-4">
          {{ editMode ? 'Edit Batas Pengajuan' : 'Set Batas Pengajuan' }}
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
              <label class="block text-sm font-medium mb-2">Batas Maksimal Pengajuan</label>
              <input 
                v-model.number="form.batas_pengajuan"
                type="number" 
                min="1"
                class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan batas maksimal"
                required
              />
              <p class="text-xs text-gray-500 mt-1">
                Jumlah maksimal yang dapat diajukan per pengajuan untuk barang ini
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
            v-model="jenisFilter"
            @change="handleSearch"
            class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Semua Jenis</option>
            <option 
              v-for="jenis in jenisBarangList" 
              :key="jenis.id_jenis_barang" 
              :value="jenis.id_jenis_barang"
            >
              {{ jenis.nama_jenis_barang }}
            </option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="loading && batasPengajuanList.length === 0" class="p-8 text-center text-gray-500">
          Memuat data...
        </div>
        <div v-else-if="batasPengajuanList.length === 0" class="p-8 text-center text-gray-500">
          Belum ada data batas pengajuan
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
                Harga Satuan
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Batas Pengajuan
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Nilai Maks
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pengajuan Bulan Ini
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in batasPengajuanList" :key="item.id_barang" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.barang?.nama_barang || 'Unknown' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ item.barang?.jenis_barang?.nama_jenis_barang || 'No Category' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Rp {{ formatCurrency(item.barang?.harga_barang || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span class="font-semibold text-blue-600">{{ item.batas_pengajuan }}</span> unit
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Rp {{ formatCurrency((item.barang?.harga_barang || 0) * item.batas_pengajuan) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex items-center">
                  <span class="mr-2">{{ getMonthlyUsage(item.id_barang) }}</span>
                  <div class="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      class="bg-blue-600 h-2 rounded-full" 
                      :style="{ width: getUsagePercentage(item) + '%' }"
                    ></div>
                  </div>
                  <span class="ml-2 text-xs text-gray-500">
                    {{ Math.round(getUsagePercentage(item)) }}%
                  </span>
                </div>
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

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Total Barang Terbatas</h3>
          <p class="text-2xl font-bold text-blue-600">{{ batasPengajuanList.length }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Total Nilai Maksimal</h3>
          <p class="text-2xl font-bold text-green-600">
            Rp {{ formatCurrency(getTotalMaxValue()) }}
          </p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-sm font-medium text-gray-500">Rata-rata Batas</h3>
          <p class="text-2xl font-bold text-purple-600">
            {{ getAverageLimit() }} unit
          </p>
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
const batasPengajuanList = ref([])
const barangList = ref([])
const jenisBarangList = ref([])
const pengajuanData = ref([])
const search = ref('')
const jenisFilter = ref('')
const alert = ref({ message: '', type: 'success' })

const form = ref({
  id_barang: '',
  batas_pengajuan: 0
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
  
  // Filter out barang that already have batas pengajuan set
  const existingIds = batasPengajuanList.value.map(item => item.id_barang)
  return barangList.value.filter(barang => !existingIds.includes(barang.id_barang))
})

// Methods
const fetchData = async (page = 1) => {
  loading.value = true
  logger.info('Fetching batas pengajuan data', { page, search: search.value, jenis: jenisFilter.value })
  
  try {
    const params = {
      page,
      search: search.value || undefined,
      jenis: jenisFilter.value || undefined
    }
    
    const response = await API.get('/batas-pengajuan', { params })
    batasPengajuanList.value = response.data.data
    
    if (response.data.meta) {
      pagination.value = response.data.meta
    }
    
    logger.success('Batas pengajuan data loaded successfully', { count: batasPengajuanList.value.length })
  } catch (error) {
    logger.error('Error fetching batas pengajuan:', error.message)
    showAlert('Gagal memuat data batas pengajuan', 'error')
  } finally {
    loading.value = false
  }
}

const fetchBarang = async () => {
  logger.debug('Fetching barang data for batas pengajuan')
  try {
    const response = await API.get('/barang')
    barangList.value = response.data.data
    logger.success('Barang data loaded for batas pengajuan', { count: barangList.value.length })
  } catch (error) {
    logger.error('Error fetching barang:', error.message)
    showAlert('Gagal memuat data barang', 'error')
  }
}

const fetchJenisBarang = async () => {
  logger.debug('Fetching jenis barang data')
  try {
    const response = await API.get('/jenis-barang')
    jenisBarangList.value = response.data.data
    logger.success('Jenis barang data loaded', { count: jenisBarangList.value.length })
  } catch (error) {
    logger.error('Error fetching jenis barang:', error.message)
  }
}

const fetchPengajuanData = async () => {
  logger.debug('Fetching pengajuan data for usage calculation')
  try {
    const response = await API.get('/pengajuan')
    pengajuanData.value = response.data.data
    logger.success('Pengajuan data loaded', { count: pengajuanData.value.length })
  } catch (error) {
    logger.error('Error fetching pengajuan data:', error.message)
  }
}

const submitForm = async () => {
  loading.value = true
  logger.info('Submitting batas pengajuan form', { 
    mode: editMode.value ? 'edit' : 'create',
    id_barang: form.value.id_barang,
    batas_pengajuan: form.value.batas_pengajuan
  })
  
  try {
    if (editMode.value) {
      await API.put(`/batas-pengajuan/${form.value.id_barang}`, {
        batas_pengajuan: form.value.batas_pengajuan
      })
      logger.success('Batas pengajuan updated successfully', { id_barang: form.value.id_barang })
      showAlert('Batas pengajuan berhasil diupdate', 'success')
    } else {
      await API.post('/batas-pengajuan', form.value)
      logger.success('Batas pengajuan created successfully', { id_barang: form.value.id_barang })
      showAlert('Batas pengajuan berhasil ditambahkan', 'success')
    }
    
    resetForm()
    fetchData()
  } catch (error) {
    logger.error('Error saving batas pengajuan:', error.message, { form: form.value })
    const errorMsg = error.response?.data?.message || 'Gagal menyimpan batas pengajuan'
    showAlert(errorMsg, 'error')
  } finally {
    loading.value = false
  }
}

const editItem = (item) => {
  logger.info('Editing batas pengajuan', { id_barang: item.id_barang, current_batas: item.batas_pengajuan })
  
  form.value = {
    id_barang: item.id_barang,
    batas_pengajuan: item.batas_pengajuan
  }
  editMode.value = true
  showForm.value = true
}

const deleteItem = async (item) => {
  const barangName = item.barang?.nama_barang || 'barang ini'
  if (confirm(`Yakin ingin menghapus batas pengajuan untuk "${barangName}"?`)) {
    logger.info('Deleting batas pengajuan', { id_barang: item.id_barang, nama_barang: barangName })
    
    try {
      await API.delete(`/batas-pengajuan/${item.id_barang}`)
      logger.success('Batas pengajuan deleted successfully', { id_barang: item.id_barang })
      showAlert('Batas pengajuan berhasil dihapus', 'success')
      fetchData()
    } catch (error) {
      logger.error('Error deleting batas pengajuan:', error.message, { id_barang: item.id_barang })
      const errorMsg = error.response?.data?.message || 'Gagal menghapus batas pengajuan'
      showAlert(errorMsg, 'error')
    }
  }
}

const resetForm = () => {
  logger.debug('Resetting batas pengajuan form')
  form.value = {
    id_barang: '',
    batas_pengajuan: 0
  }
  editMode.value = false
  showForm.value = false
}

const handleSearch = () => {
  logger.debug('Searching batas pengajuan', { search: search.value, jenis: jenisFilter.value })
  pagination.value.current_page = 1
  fetchData()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    logger.debug('Changing page', { page })
    fetchData(page)
  }
}

const getMonthlyUsage = (idBarang) => {
  // Get current month's pengajuan for this barang
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  
  const monthlyPengajuan = pengajuanData.value.filter(pengajuan => {
    const pengajuanDate = new Date(pengajuan.created_at)
    return pengajuanDate.getMonth() === currentMonth && 
           pengajuanDate.getFullYear() === currentYear &&
           pengajuan.details?.some(detail => detail.id_barang === idBarang)
  })
  
  const usage = monthlyPengajuan.reduce((total, pengajuan) => {
    const detail = pengajuan.details?.find(d => d.id_barang === idBarang)
    return total + (detail?.jumlah || 0)
  }, 0)
  
  logger.debug('Calculated monthly usage', { id_barang: idBarang, usage })
  return usage
}

const getUsagePercentage = (item) => {
  const monthlyUsage = getMonthlyUsage(item.id_barang)
  const batas = item.batas_pengajuan
  return batas > 0 ? Math.min((monthlyUsage / batas) * 100, 100) : 0
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount)
}

const getTotalMaxValue = () => {
  return batasPengajuanList.value.reduce((total, item) => {
    const harga = item.barang?.harga_barang || 0
    return total + (harga * item.batas_pengajuan)
  }, 0)
}

const getAverageLimit = () => {
  if (batasPengajuanList.value.length === 0) return 0
  const totalLimit = batasPengajuanList.value.reduce((total, item) => total + item.batas_pengajuan, 0)
  return Math.round(totalLimit / batasPengajuanList.value.length)
}

const showAlert = (message, type = 'success') => {
  alert.value = { message, type }
  setTimeout(() => {
    alert.value.message = ''
  }, 3000)
}

// Lifecycle
onMounted(async () => {
  logger.info('BatasPengajuan page mounted')
  await Promise.all([
    fetchData(),
    fetchBarang(),
    fetchJenisBarang(),
    fetchPengajuanData()
  ])
})
</script>