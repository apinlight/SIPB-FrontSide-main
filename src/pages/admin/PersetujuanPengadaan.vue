<!-- src/pages/admin/PersetujuanPengadaan.vue -->
<template>
  <DefaultLayout>
    <div class="p-6 space-y-6">
      <h1 class="text-2xl font-bold">✅ Persetujuan Pengajuan</h1>

      <!-- Filter -->
      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex gap-4">
          <select v-model="branchFilter" @change="fetchData" class="border rounded px-3 py-2">
            <option value="">Semua Cabang</option>
            <option v-for="branch in branches" :key="branch" :value="branch">
              {{ branch }}
            </option>
          </select>
          <input 
            v-model="search"
            @input="handleSearch"
            type="text"
            placeholder="Cari ID pengajuan atau nama user..."
            class="border rounded px-3 py-2 flex-1"
          />
        </div>
      </div>

      <div v-if="loading" class="text-center py-10">Memuat pengajuan...</div>

      <div v-else-if="pengajuanList.length === 0" class="text-center py-10 text-gray-500">
        Tidak ada pengajuan yang menunggu persetujuan.
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
                <span class="bg-yellow-100 text-yellow-800 px-3 py-1 text-sm rounded-full font-medium">
                  {{ pengajuan.status_pengajuan }}
                </span>
              </div>
              <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                <div>
                  <span class="font-medium">Diajukan oleh:</span>
                  <p>{{ pengajuan.user?.username }} ({{ pengajuan.user?.branch_name }})</p>
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
                  <span class="font-medium">Estimasi Total:</span>
                  <p class="font-semibold text-green-600">Rp {{ formatCurrency(getTotalHarga(pengajuan)) }}</p>
                </div>
              </div>
              
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
            
            <div class="flex flex-col gap-2">
              <button
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                @click="showDetail(pengajuan)"
              >
                Detail
              </button>
              <button
                class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 text-sm"
                @click="approvePengajuan(pengajuan)"
                :disabled="processing"
              >
                Setujui
              </button>
              <button
                class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                @click="rejectPengajuan(pengajuan)"
                :disabled="processing"
              >
                Tolak
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
        <div class="bg-white rounded-xl w-full max-w-4xl p-6 m-4 max-h-[80vh] overflow-y-auto" @click.stop>
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold">Detail Pengajuan - {{ selectedPengajuan.id_pengajuan }}</h2>
            <button @click="closeDetail" class="text-gray-500 hover:text-gray-700 text-2xl">&times;</button>
          </div>
          
          <div class="space-y-6">
            <!-- Info Pengajuan -->
            <div class="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 class="font-medium text-gray-700 mb-2">Informasi Pengajuan</h3>
                <div class="space-y-1 text-sm">
                  <p><span class="font-medium">ID:</span> {{ selectedPengajuan.id_pengajuan }}</p>
                  <p><span class="font-medium">Status:</span> {{ selectedPengajuan.status_pengajuan }}</p>
                  <p><span class="font-medium">Tanggal:</span> {{ formatDate(selectedPengajuan.created_at) }}</p>
                </div>
              </div>
              <div>
                <h3 class="font-medium text-gray-700 mb-2">Informasi Pengaju</h3>
                <div class="space-y-1 text-sm">
                  <p><span class="font-medium">Nama:</span> {{ selectedPengajuan.user?.username }}</p>
                  <p><span class="font-medium">Cabang:</span> {{ selectedPengajuan.user?.branch_name }}</p>
                  <p><span class="font-medium">Email:</span> {{ selectedPengajuan.user?.email }}</p>
                </div>
              </div>
            </div>
            
            <!-- Daftar Barang -->
            <div>
              <h3 class="font-medium mb-3">Daftar Barang yang Diajukan</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm border-collapse border">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="border px-3 py-2 text-left">Nama Barang</th>
                      <th class="border px-3 py-2 text-left">Jenis</th>
                      <th class="border px-3 py-2 text-center">Jumlah</th>
                      <th class="border px-3 py-2 text-right">Harga Satuan</th>
                      <th class="border px-3 py-2 text-right">Total Harga</th>
                      <th class="border px-3 py-2 text-center">Stok Tersedia</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="detail in selectedPengajuan.details" :key="detail.id_barang">
                      <td class="border px-3 py-2">{{ detail.barang?.nama_barang || 'Unknown' }}</td>
                      <td class="border px-3 py-2">{{ detail.barang?.jenis_barang?.nama_jenis_barang || '-' }}</td>
                      <td class="border px-3 py-2 text-center">{{ detail.jumlah }}</td>
                      <td class="border px-3 py-2 text-right">Rp {{ formatCurrency(detail.barang?.harga_barang || 0) }}</td>
                      <td class="border px-3 py-2 text-right">Rp {{ formatCurrency((detail.barang?.harga_barang || 0) * detail.jumlah) }}</td>
                      <td class="border px-3 py-2 text-center">
                        <span class="text-xs px-2 py-1 rounded" :class="getStockClass(detail.stok_tersedia)">
                          {{ detail.stok_tersedia || 0 }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-gray-50 font-medium">
                    <tr>
                      <td colspan="4" class="border px-3 py-2 text-right">Total Keseluruhan:</td>
                      <td class="border px-3 py-2 text-right">Rp {{ formatCurrency(getTotalHarga(selectedPengajuan)) }}</td>
                      <td class="border px-3 py-2"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-3 pt-4 border-t">
              <button
                @click="closeDetail"
                class="px-4 py-2 border rounded hover:bg-gray-50"
              >
                Tutup
              </button>
              <button
                @click="rejectPengajuan(selectedPengajuan)"
                class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                :disabled="processing"
              >
                Tolak
              </button>
              <button
                @click="approvePengajuan(selectedPengajuan)"
                class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                :disabled="processing"
              >
                Setujui
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import API from '@/lib/api'
import { logger } from '@/lib/logger'
import { toast } from 'vue3-toastify'

const pengajuanList = ref([])
const selectedPengajuan = ref(null)
const loading = ref(true)
const processing = ref(false)
const search = ref('')
const branchFilter = ref('')
const branches = ref([])

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
    const params = {
      page,
      search: search.value || undefined,
      branch: branchFilter.value || undefined,
      status: 'Menunggu Persetujuan'
    }
    
    const res = await API.get('/pengajuan', { params })
    pengajuanList.value = res.data.data
    
    if (res.data.meta) {
      pagination.value = res.data.meta
    }

    // Extract unique branches
    const uniqueBranches = [...new Set(res.data.data.map(p => p.user?.branch_name).filter(Boolean))]
    branches.value = uniqueBranches
  } catch (e) {
    logger.error('Failed to load pengajuan data:', e.response?.data?.message || e.message)
    toast.error('Gagal memuat pengajuan')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.current_page = 1
  fetchData()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    fetchData(page)
  }
}

const showDetail = async (pengajuan) => {
  try {
    const res = await API.get(`/pengajuan/${pengajuan.id_pengajuan}`)
    selectedPengajuan.value = res.data.data
  } catch (e) {
    logger.error('Failed to load pengajuan detail:', e.response?.data?.message || e.message)
    toast.error('Gagal memuat detail pengajuan')
  }
}

const closeDetail = () => {
  selectedPengajuan.value = null
}

const approvePengajuan = async (pengajuan) => {
  if (!confirm(`Setujui pengajuan ${pengajuan.id_pengajuan}?`)) return
  
  processing.value = true
  try {
    await API.put(`/pengajuan/${pengajuan.id_pengajuan}`, {
      status_pengajuan: 'Disetujui'
    })
    
    toast.success(`Pengajuan ${pengajuan.id_pengajuan} berhasil disetujui`)
    closeDetail()
    fetchData(pagination.value.current_page)
  } catch (e) {
    logger.error('Failed to approve pengajuan:', e.response?.data?.message || e.message)
    const errorMsg = e.response?.data?.message || 'Gagal menyetujui pengajuan'
    toast.error(errorMsg)
  } finally {
    processing.value = false
  }
}

const rejectPengajuan = async (pengajuan) => {
  const reason = prompt(`Alasan menolak pengajuan ${pengajuan.id_pengajuan}:`)
  if (!reason) return
  
  processing.value = true
  try {
    await API.put(`/pengajuan/${pengajuan.id_pengajuan}`, {
      status_pengajuan: 'Ditolak',
      rejection_reason: reason
    })
    
    toast.success(`Pengajuan ${pengajuan.id_pengajuan} berhasil ditolak`)
    closeDetail()
    fetchData(pagination.value.current_page)
  } catch (e) {
    logger.error('Failed to reject pengajuan:', e.response?.data?.message || e.message)
    const errorMsg = e.response?.data?.message || 'Gagal menolak pengajuan'
    toast.error(errorMsg)
  } finally {
    processing.value = false
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

const getStockClass = (stock) => {
  if (stock > 10) return 'bg-green-100 text-green-800'
  if (stock > 5) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

onMounted(() => fetchData())
</script>