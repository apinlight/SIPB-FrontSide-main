<!-- src/pages/user/RiwayatPengajuan.vue -->
<template>
  <DefaultLayout>
    <div class="p-6 space-y-6">
      <h1 class="text-2xl font-bold">🕘 Riwayat Pengajuan</h1>

      <!-- Filter -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex gap-4">
          <select v-model="statusFilter" @change="fetchData" class="border rounded px-3 py-2">
            <option value="">Semua Status</option>
            <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Ditolak">Ditolak</option>
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

      <div v-if="loading" class="text-center py-10">Memuat riwayat pengajuan...</div>

      <div v-else-if="pengajuanList.length === 0" class="text-center py-10 text-gray-500">
        Anda belum pernah mengajukan permintaan.
      </div>

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
                <span
                  :class="getStatusClass(pengajuan.status_pengajuan)"
                  class="px-3 py-1 text-sm rounded-full font-medium"
                >
                  {{ pengajuan.status_pengajuan }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-2">
                Tanggal: {{ formatDate(pengajuan.created_at) }}
              </p>
              <p class="text-sm text-gray-600 mb-3">
                Total Item: {{ pengajuan.details?.length || 0 }} jenis barang
              </p>
              
              <!-- Quick preview of items -->
              <div v-if="pengajuan.details && pengajuan.details.length > 0" class="mb-3">
                <p class="text-sm font-medium text-gray-700 mb-1">Item yang diajukan:</p>
                <div class="flex flex-wrap gap-2">
                  <span 
                    v-for="detail in pengajuan.details.slice(0, 3)" 
                    :key="detail.id_barang"
                    class="text-xs bg-gray-100 px-2 py-1 rounded"
                  >
                    {{ detail.barang?.nama_barang }} ({{ detail.jumlah }})
                  </span>
                  <span v-if="pengajuan.details.length > 3" class="text-xs text-gray-500">
                    +{{ pengajuan.details.length - 3 }} lainnya
                  </span>
                </div>
              </div>
            </div>
            
            <div class="flex gap-2">
              <button
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                @click="showDetail(pengajuan)"
              >
                Lihat Detail
              </button>
              <button
                v-if="pengajuan.status_pengajuan === 'Menunggu Persetujuan'"
                class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                @click="cancelPengajuan(pengajuan)"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="flex justify-center gap-2">
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
              <div>
                <span class="font-medium">Tanggal Pengajuan:</span>
                <p>{{ formatDate(selectedPengajuan.created_at) }}</p>
              </div>
              <div>
                <span class="font-medium">Total Item:</span>
                <p>{{ selectedPengajuan.details?.length || 0 }} jenis barang</p>
              </div>
            </div>
            
                        <div>
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
                  <tfoot class="bg-gray-50 font-medium">
                    <tr>
                      <td colspan="3" class="border px-3 py-2 text-right">Total Keseluruhan:</td>
                      <td class="border px-3 py-2">Rp {{ formatCurrency(getTotalHarga(selectedPengajuan)) }}</td>
                    </tr>
                  </tfoot>
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
import API from '@/lib/api'
import { toast } from 'vue3-toastify'
import { useUserStore } from '@/stores/userStore'
import { logger } from '@/lib/logger'

const pengajuanList = ref([])
const selectedPengajuan = ref(null)
const loading = ref(true)
const search = ref('')
const statusFilter = ref('')
const userStore = useUserStore()

const pagination = ref({
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
  total: 0
})

const fetchData = async (page = 1) => {
  loading.value = true
  
  const params = {
    page,
    search: search.value || undefined,
    status: statusFilter.value || undefined,
    user_id: userStore.user.unique_id // Filter by current user
  }

  try {
    logger.info('User: Fetching riwayat pengajuan', {
      params,
      user: userStore.user?.username,
      branch: userStore.user?.branch_name
    })
    
    const res = await API.get('/pengajuan', { params })
    
    // ✅ Handle different response structures
    if (res.data.success) {
      pengajuanList.value = res.data.data || []
      if (res.data.meta) {
        pagination.value = res.data.meta
      }
    } else {
      // Fallback for direct data array
      pengajuanList.value = Array.isArray(res.data) ? res.data : res.data.data || []
    }
    
    logger.info('User: Riwayat pengajuan loaded successfully', {
      count: res.data.data.length,
      page,
      totalPages: res.data.meta?.last_page,
      user: userStore.user?.username
    })
  } catch (e) {
    logger.error('User: Failed to fetch riwayat pengajuan', {
      error: e.message,
      response: e.response?.data,
      params,
      user: userStore.user?.username
    })
    
    // ✅ Set empty data on error to prevent crashes
    pengajuanList.value = []
    
    const errorMsg = e.response?.data?.message || 'Gagal memuat riwayat pengajuan'
    toast.error(`Backend Error: ${errorMsg}`)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  logger.info('User: Searching riwayat pengajuan', {
    search: search.value,
    statusFilter: statusFilter.value,
    user: userStore.user?.username
  })
  pagination.value.current_page = 1
  fetchData()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    logger.info('User: Changing page in riwayat pengajuan', {
      fromPage: pagination.value.current_page,
      toPage: page,
      user: userStore.user?.username
    })
    fetchData(page)
  }
}

const showDetail = async (pengajuan) => {
  try {
    logger.info('User: Fetching pengajuan detail', {
      pengajuanId: pengajuan.id_pengajuan,
      status: pengajuan.status_pengajuan,
      user: userStore.user?.username
    })
    
    // Fetch detailed data including items
    const res = await API.get(`/pengajuan/${pengajuan.id_pengajuan}`)
    selectedPengajuan.value = res.data.data
    
    logger.info('User: Pengajuan detail loaded successfully', {
      pengajuanId: pengajuan.id_pengajuan,
      itemCount: res.data.data.details?.length || 0,
      totalValue: getTotalHarga(res.data.data)
    })
  } catch (e) {
    logger.error('User: Failed to fetch pengajuan detail', {
      error: e.message,
      response: e.response?.data,
      pengajuanId: pengajuan.id_pengajuan,
      user: userStore.user?.username
    })
    const errorMsg = e.response?.data?.message || 'Gagal memuat detail pengajuan'
    toast.error(errorMsg)
  }
}

const closeDetail = () => {
  logger.info('User: Closing pengajuan detail modal', {
    pengajuanId: selectedPengajuan.value?.id_pengajuan
  })
  selectedPengajuan.value = null
}

const cancelPengajuan = async (pengajuan) => {
  if (!confirm(`Yakin ingin membatalkan pengajuan ${pengajuan.id_pengajuan}?`)) {
    logger.info('User: Pengajuan cancellation cancelled by user', {
      pengajuanId: pengajuan.id_pengajuan,
      user: userStore.user?.username
    })
    return
  }
  
  try {
    logger.info('User: Cancelling pengajuan', {
      pengajuanId: pengajuan.id_pengajuan,
      status: pengajuan.status_pengajuan,
      user: userStore.user?.username
    })
    
    await API.delete(`/pengajuan/${pengajuan.id_pengajuan}`)
    
    logger.info('User: Pengajuan cancelled successfully', {
      pengajuanId: pengajuan.id_pengajuan,
      user: userStore.user?.username
    })
    
    toast.success('Pengajuan berhasil dibatalkan')
    fetchData(pagination.value.current_page)
  } catch (e) {
    logger.error('User: Failed to cancel pengajuan', {
      error: e.message,
      response: e.response?.data,
      pengajuanId: pengajuan.id_pengajuan,
      user: userStore.user?.username
    })
    const errorMsg = e.response?.data?.message || 'Gagal membatalkan pengajuan'
    toast.error(errorMsg)
  }
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Menunggu Persetujuan':
      return 'bg-yellow-100 text-yellow-800'
    case 'Disetujui':
      return 'bg-green-100 text-green-800'
    case 'Ditolak':
      return 'bg-red-100 text-red-800'
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
  return new Intl.NumberFormat('id-ID').format(amount)
}

const getTotalHarga = (pengajuan) => {
  return pengajuan.details?.reduce((total, detail) => {
    return total + ((detail.barang?.harga_barang || 0) * detail.jumlah)
  }, 0) || 0
}

onMounted(() => {
  logger.info('User: RiwayatPengajuan component mounted', {
    user: userStore.user?.username,
    branch: userStore.user?.branch_name
  })
  fetchData()
})
</script>
