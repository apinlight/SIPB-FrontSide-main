<template>
  <DefaultLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">📊 Riwayat Pengajuan Cabang</h1>
      <p class="text-gray-600 mb-4">Menampilkan riwayat pengajuan untuk cabang: {{ userStore.user?.branch_name }}</p>
      
      <!-- Filter -->
      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="flex gap-4">
          <select v-model="statusFilter" @change="fetchData" class="border rounded px-3 py-2">
            <option value="">Semua Status</option>
            <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Ditolak">Ditolak</option>
            <option value="Selesai">Selesai</option>
          </select>
          <input 
            v-model="search"
            @input="handleSearch"
            type="text"
            placeholder="Cari ID pengajuan..."
            class="border rounded px-3 py-2 flex-1"
          />
        </div>
      </div>

      <div v-if="loading" class="text-center py-10">Memuat data...</div>
      <div v-else-if="pengajuanList.length === 0" class="text-center py-10 text-gray-500">
        Tidak ada riwayat pengajuan untuk cabang ini.
      </div>
      
      <!-- Pengajuan List -->
      <div v-else class="space-y-4">
        <div
          v-for="pengajuan in pengajuanList"
          :key="pengajuan.id_pengajuan"
          class="bg-white border rounded-xl p-6 shadow hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h2 class="font-semibold text-lg">{{ pengajuan.id_pengajuan }}</h2>
                <span :class="getStatusClass(pengajuan.status_pengajuan)" class="px-3 py-1 text-sm rounded-full font-medium">
                  {{ pengajuan.status_pengajuan }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                <div>
                  <span class="font-medium">Diajukan oleh:</span>
                  <p>{{ pengajuan.user?.username }}</p>
                </div>
                <div>
                  <span class="font-medium">Tanggal:</span>
                  <p>{{ formatDate(pengajuan.created_at) }}</p>
                </div>
                <div>
                  <span class="font-medium">Total Item:</span>
                  <p>{{ pengajuan.details?.length || 0 }} jenis barang</p>
                </div>
                <div>
                  <span class="font-medium">Total Nilai:</span>
                  <p class="font-semibold text-green-600">Rp {{ formatCurrency(getTotalHarga(pengajuan)) }}</p>
                </div>
              </div>
            </div>
            
            <button
              class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
              @click="showDetail(pengajuan)"
            >
              Lihat Detail
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="flex justify-center gap-2 mt-6">
        <button 
          @click="changePage(pagination.current_page - 1)"
          :disabled="pagination.current_page === 1"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Sebelumnya
        </button>
        <span class="px-3 py-1">
          {{ pagination.current_page }} / {{ pagination.last_page }}
        </span>
        <button 
          @click="changePage(pagination.current_page + 1)"
          :disabled="pagination.current_page === pagination.last_page"
          class="px-3 py-1 border rounded disabled:opacity-50"
        >
          Berikutnya
        </button>
      </div>

      <!-- Modal Detail -->
      <div
        v-if="selectedPengajuan"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click="closeDetail"
      >
        <div class="bg-white rounded-xl w-full max-w-2xl p-6 m-4 max-h-[80vh] overflow-y-auto" @click.stop>
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold">Detail Pengajuan</h2>
            <button @click="closeDetail" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>
          
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium">ID Pengajuan:</span>
                <p>{{ selectedPengajuan.id_pengajuan }}</p>
              </div>
              <div>
                <span class="font-medium">Status:</span>
                <p>
                  <span :class="getStatusClass(selectedPengajuan.status_pengajuan)" class="px-2 py-1 rounded-full text-xs">
                    {{ selectedPengajuan.status_pengajuan }}
                  </span>
                </p>
              </div>
            </div>
            
            <div v-if="selectedPengajuan.details">
              <h3 class="font-medium mb-2">Daftar Barang:</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm border-collapse border">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="border px-3 py-2 text-left">Nama Barang</th>
                      <th class="border px-3 py-2 text-left">Jumlah</th>
                      <th class="border px-3 py-2 text-left">Harga Satuan</th>
                      <th class="border px-3 py-2 text-left">Total Harga</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="detail in selectedPengajuan.details" :key="detail.id_barang">
                      <td class="border px-3 py-2">{{ detail.barang?.nama_barang || 'Unknown' }}</td>
                      <td class="border px-3 py-2">{{ detail.jumlah }}</td>
                      <td class="border px-3 py-2">Rp {{ formatCurrency(detail.barang?.harga_barang || 0) }}</td>
                      <td class="border px-3 py-2">Rp {{ formatCurrency((detail.barang?.harga_barang || 0) * detail.jumlah) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useUserStore } from '@/stores/userStore'
import API from '@/lib/api'
import { toast } from 'vue3-toastify'
import { logger } from '@/lib/logger'

const userStore = useUserStore()
const pengajuanList = ref([])
const selectedPengajuan = ref(null)
const loading = ref(true)
const search = ref('')
const statusFilter = ref('')

const pagination = ref({
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
  total: 0
})

const fetchData = async (page = 1) => {
  loading.value = true
  try {
    logger.info('Manager: Fetching branch pengajuan data', { 
      page, 
      branch: userStore.user?.branch_name,
      search: search.value,
      status: statusFilter.value 
    })
    
    const params = {
      page,
      search: search.value || undefined,
      status: statusFilter.value || undefined,
      branch: userStore.user?.branch_name
    }
    
    const res = await API.get('/pengajuan', { params })
    pengajuanList.value = res.data.data
    
    if (res.data.meta) {
      pagination.value = res.data.meta
    }
    
    logger.info('Manager: Branch pengajuan data loaded successfully', { 
      count: res.data.data.length,
      branch: userStore.user?.branch_name 
    })
  } catch (e) {
    logger.error('Manager: Failed to fetch branch pengajuan data', {
      error: e.message,
      response: e.response?.data,
      branch: userStore.user?.branch_name
    })
    const errorMsg = e.response?.data?.message || 'Gagal memuat riwayat pengajuan cabang'
    toast.error(errorMsg)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  logger.info('Manager: Searching branch pengajuan', { search: search.value, status: statusFilter.value })
  pagination.value.current_page = 1
  fetchData()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    logger.info('Manager: Changing page', { page, branch: userStore.user?.branch_name })
    fetchData(page)
  }
}

const showDetail = async (pengajuan) => {
  try {
    logger.info('Manager: Fetching pengajuan detail', { 
      id: pengajuan.id_pengajuan,
      branch: userStore.user?.branch_name 
    })
    
    const res = await API.get(`/pengajuan/${pengajuan.id_pengajuan}`)
    selectedPengajuan.value = res.data.data
    
    logger.info('Manager: Pengajuan detail loaded successfully', { id: pengajuan.id_pengajuan })
  } catch (e) {
    logger.error('Manager: Failed to fetch pengajuan detail', {
      error: e.message,
      response: e.response?.data,
      id: pengajuan.id_pengajuan
    })
    const errorMsg = e.response?.data?.message || 'Gagal memuat detail pengajuan'
    toast.error(errorMsg)
  }
}

const closeDetail = () => {
  logger.info('Manager: Closing pengajuan detail modal')
  selectedPengajuan.value = null
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Menunggu Persetujuan':
      return 'bg-yellow-100 text-yellow-800'
    case 'Disetujui':
      return 'bg-green-100 text-green-800'
    case 'Ditolak':
      return 'bg-red-100 text-red-800'
    case 'Selesai':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount || 0)
}

const getTotalHarga = (pengajuan) => {
  return pengajuan.details?.reduce((total, detail) => {
    return total + ((detail.barang?.harga_barang || 0) * detail.jumlah)
  }, 0) || 0
}

onMounted(() => {
  logger.info('Manager: RiwayatCabang component mounted', { branch: userStore.user?.branch_name })
  fetchData()
})
</script>
