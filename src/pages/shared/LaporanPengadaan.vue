<template>
  <DefaultLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">📊 Laporan Pengadaan & Stok</h1>

      <!-- Filter Controls -->
      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Periode</label>
            <select v-model="periodFilter" @change="fetchData" class="w-full border rounded px-3 py-2">
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="year">Tahun Ini</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          <div v-if="periodFilter === 'custom'">
            <label class="block text-sm font-medium mb-1">Dari Tanggal</label>
            <input 
              v-model="startDate" 
              @change="fetchData"
              type="date" 
              class="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div v-if="periodFilter === 'custom'">
            <label class="block text-sm font-medium mb-1">Sampai Tanggal</label>
            <input 
              v-model="endDate" 
              @change="fetchData"
              type="date" 
              class="w-full border rounded px-3 py-2"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Cabang</label>
            <select v-model="branchFilter" @change="fetchData" class="w-full border rounded px-3 py-2">
              <option value="">Semua Cabang</option>
              <option v-for="branch in branches" :key="branch" :value="branch">
                {{ branch }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100 text-blue-600">
              📦
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Pengajuan</p>
              <p class="text-2xl font-bold text-gray-900">{{ summary.total_pengajuan }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-green-100 text-green-600">
              ✅
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Disetujui</p>
              <p class="text-2xl font-bold text-gray-900">{{ summary.total_disetujui }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
              ⏳
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Menunggu</p>
              <p class="text-2xl font-bold text-gray-900">{{ summary.total_menunggu }}</p>
            </div>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-purple-100 text-purple-600">
              💰
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Nilai</p>
              <p class="text-2xl font-bold text-gray-900">Rp {{ formatCurrency(summary.total_nilai) }}</p>
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="text-center py-10">Memuat data...</div>
      <div v-else>
        <!-- Tabs -->
        <div class="bg-white rounded-lg shadow">
          <div class="border-b">
            <nav class="flex space-x-8 px-6">
              <button
                v-for="tab in tabs"
                :key="tab.key"
                @click="activeTab = tab.key"
                :class="[
                  'py-4 px-1 border-b-2 font-medium text-sm',
                  activeTab === tab.key
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]"
              >
                {{ tab.label }}
              </button>
            </nav>
          </div>

          <div class="p-6">
            <!-- Tab: Laporan Barang -->
            <div v-if="activeTab === 'barang'">
              <div class="mb-4">
                <input
                  v-model="searchBarang"
                  @input="filterBarang"
                  type="text"
                  placeholder="Cari nama barang..."
                  class="border rounded px-3 py-2 w-64"
                />
              </div>
              
              <div class="overflow-x-auto">
                <table class="w-full table-auto border-collapse border">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="border px-4 py-3 text-left">Nama Barang</th>
                      <th class="border px-4 py-3 text-left">Jenis</th>
                      <th class="border px-4 py-3 text-center">Total Pengadaan</th>
                      <th class="border px-4 py-3 text-center">Stok Saat Ini</th>
                      <th class="border px-4 py-3 text-right">Nilai Pengadaan</th>
                      <th class="border px-4 py-3 text-center">Status Stok</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in filteredBarang" :key="item.id_barang" class="border-b hover:bg-gray-50">
                      <td class="border px-4 py-3">{{ item.nama_barang }}</td>
                      <td class="border px-4 py-3">{{ item.jenis_barang?.nama_jenis_barang || '-' }}</td>
                      <td class="border px-4 py-3 text-center">{{ item.total_pengadaan || 0 }}</td>
                      <td class="border px-4 py-3 text-center">{{ item.stok_saat_ini || 0 }}</td>
                      <td class="border px-4 py-3 text-right">Rp {{ formatCurrency(item.nilai_pengadaan || 0) }}</td>
                                            <td class="border px-4 py-3 text-center">
                        <span :class="getStockStatusClass(item.stok_saat_ini, item.batas_minimum)" class="px-2 py-1 rounded-full text-xs font-medium">
                          {{ getStockStatus(item.stok_saat_ini, item.batas_minimum) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Tab: Laporan Pengajuan -->
            <div v-if="activeTab === 'pengajuan'">
              <div class="overflow-x-auto">
                <table class="w-full table-auto border-collapse border">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="border px-4 py-3 text-left">ID Pengajuan</th>
                      <th class="border px-4 py-3 text-left">Pengaju</th>
                      <th class="border px-4 py-3 text-left">Cabang</th>
                      <th class="border px-4 py-3 text-center">Tanggal</th>
                      <th class="border px-4 py-3 text-center">Status</th>
                      <th class="border px-4 py-3 text-center">Jumlah Item</th>
                      <th class="border px-4 py-3 text-right">Total Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="pengajuan in laporanPengajuan" :key="pengajuan.id_pengajuan" class="border-b hover:bg-gray-50">
                      <td class="border px-4 py-3">{{ pengajuan.id_pengajuan }}</td>
                      <td class="border px-4 py-3">{{ pengajuan.user?.username }}</td>
                      <td class="border px-4 py-3">{{ pengajuan.user?.branch_name }}</td>
                      <td class="border px-4 py-3 text-center">{{ formatDate(pengajuan.created_at) }}</td>
                      <td class="border px-4 py-3 text-center">
                        <span :class="getStatusClass(pengajuan.status_pengajuan)" class="px-2 py-1 rounded-full text-xs font-medium">
                          {{ pengajuan.status_pengajuan }}
                        </span>
                      </td>
                      <td class="border px-4 py-3 text-center">{{ pengajuan.total_items || 0 }}</td>
                      <td class="border px-4 py-3 text-right">Rp {{ formatCurrency(pengajuan.total_nilai || 0) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Tab: Laporan Cabang -->
            <div v-if="activeTab === 'cabang'">
              <div class="overflow-x-auto">
                <table class="w-full table-auto border-collapse border">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="border px-4 py-3 text-left">Nama Cabang</th>
                      <th class="border px-4 py-3 text-center">Total Pengajuan</th>
                      <th class="border px-4 py-3 text-center">Disetujui</th>
                      <th class="border px-4 py-3 text-center">Menunggu</th>
                      <th class="border px-4 py-3 text-center">Ditolak</th>
                      <th class="border px-4 py-3 text-right">Total Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="cabang in laporanCabang" :key="cabang.branch_name" class="border-b hover:bg-gray-50">
                      <td class="border px-4 py-3 font-medium">{{ cabang.branch_name }}</td>
                      <td class="border px-4 py-3 text-center">{{ cabang.total_pengajuan }}</td>
                      <td class="border px-4 py-3 text-center">{{ cabang.total_disetujui }}</td>
                      <td class="border px-4 py-3 text-center">{{ cabang.total_menunggu }}</td>
                      <td class="border px-4 py-3 text-center">{{ cabang.total_ditolak }}</td>
                      <td class="border px-4 py-3 text-right">Rp {{ formatCurrency(cabang.total_nilai) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Export Button -->
      <div class="mt-6 flex justify-end">
        <button
          @click="exportData"
          class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 flex items-center gap-2"
          :disabled="loading"
        >
          📊 Export Excel
        </button>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import API from '@/lib/api'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { toast } from 'vue3-toastify'
import { logger } from '@/lib/logger'

const loading = ref(true)
const activeTab = ref('barang')
const periodFilter = ref('month')
const branchFilter = ref('')
const startDate = ref('')
const endDate = ref('')
const searchBarang = ref('')

const tabs = [
  { key: 'barang', label: 'Laporan Barang' },
  { key: 'pengajuan', label: 'Laporan Pengajuan' },
  { key: 'cabang', label: 'Laporan per Cabang' }
]

const summary = ref({
  total_pengajuan: 0,
  total_disetujui: 0,
  total_menunggu: 0,
  total_nilai: 0
})

const laporanBarang = ref([])
const laporanPengajuan = ref([])
const laporanCabang = ref([])
const branches = ref([])

const filteredBarang = computed(() => {
  if (!searchBarang.value) return laporanBarang.value
  
  return laporanBarang.value.filter(item =>
    item.nama_barang.toLowerCase().includes(searchBarang.value.toLowerCase())
  )
})

const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      period: periodFilter.value,
      branch: branchFilter.value || undefined,
      start_date: startDate.value || undefined,
      end_date: endDate.value || undefined
    }

    logger.info('Shared: Fetching laporan data', { params })

    // Since the API only has export endpoints, we'll use pengajuan data to build summaries
    const pengajuanRes = await API.get('/pengajuan', { params })
    const allPengajuan = pengajuanRes.data.data || []
    
    // Build summary from pengajuan data
    summary.value = {
      total_pengajuan: allPengajuan.length,
      total_disetujui: allPengajuan.filter(p => p.status_pengajuan === 'Disetujui').length,
      total_menunggu: allPengajuan.filter(p => p.status_pengajuan === 'Menunggu Persetujuan').length,
      total_nilai: allPengajuan.reduce((sum, p) => sum + (p.total_nilai || 0), 0)
    }
    
    // Use pengajuan data for laporan
    laporanPengajuan.value = allPengajuan
    
    // Get barang data for laporan barang
    const barangRes = await API.get('/barang', { params })
    laporanBarang.value = barangRes.data.data || []
    
    // Build branch summary from pengajuan data
    const branchSummary = {}
    allPengajuan.forEach(p => {
      const branch = p.user?.branch_name || 'Unknown'
      if (!branchSummary[branch]) {
        branchSummary[branch] = {
          branch_name: branch,
          total_pengajuan: 0,
          total_disetujui: 0,
          total_menunggu: 0,
          total_ditolak: 0,
          total_nilai: 0
        }
      }
      branchSummary[branch].total_pengajuan++
      if (p.status_pengajuan === 'Disetujui') branchSummary[branch].total_disetujui++
      if (p.status_pengajuan === 'Menunggu Persetujuan') branchSummary[branch].total_menunggu++
      if (p.status_pengajuan === 'Ditolak') branchSummary[branch].total_ditolak++
      branchSummary[branch].total_nilai += (p.total_nilai || 0)
    })
    laporanCabang.value = Object.values(branchSummary)

    // Extract branches
    const uniqueBranches = [...new Set(laporanPengajuan.value.map(p => p.user?.branch_name).filter(Boolean))]
    branches.value = uniqueBranches

    logger.info('Shared: Laporan data loaded successfully', {
      summaryTotal: summary.value.total_pengajuan,
      barangCount: laporanBarang.value.length,
      pengajuanCount: laporanPengajuan.value.length,
      cabangCount: laporanCabang.value.length
    })

  } catch (e) {
    logger.error('Shared: Failed to fetch laporan data', {
      error: e.message,
      response: e.response?.data,
      period: periodFilter.value,  // ✅ Use actual variables
      branch: branchFilter.value,
      start_date: startDate.value,
      end_date: endDate.value
    })
    const errorMsg = e.response?.data?.message || 'Gagal memuat laporan'
    toast.error(errorMsg)
  } finally {
    loading.value = false
  }
}

const filterBarang = () => {
  logger.info('Shared: Filtering barang in laporan', { search: searchBarang.value })
}

const exportData = async () => {
  try {
    const params = {
      period: periodFilter.value,
      branch: branchFilter.value || undefined,
      start_date: startDate.value || undefined,
      end_date: endDate.value || undefined
    }

    logger.info('Shared: Exporting laporan data', { params })

    // Try legacy export endpoint with type parameter (from API documentation)
    const response = await API.get('/laporan/export', { 
      params: {
        ...params,
        type: 'summary'
      },
      responseType: 'blob'
    })

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `laporan-pengadaan-${new Date().toISOString().split('T')[0]}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)

    logger.info('Shared: Laporan exported successfully')
    toast.success('Laporan berhasil diexport')
  } catch (e) {
    logger.error('Shared: Failed to export laporan', {
      error: e.message,
      status: e.response?.status,
      response: e.response?.data
    })
    
    let errorMsg = 'Gagal export laporan'
    if (e.response?.status === 500) {
      errorMsg = 'Server error saat export laporan. Coba lagi nanti.'
    } else if (e.response?.status === 403) {
      errorMsg = 'Tidak memiliki izin untuk export laporan'
    } else if (e.response?.data?.message) {
      errorMsg = e.response.data.message
    }
    
    toast.error(errorMsg)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount || 0)
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

const getStockStatus = (currentStock, minStock) => {
  if (currentStock === 0) return 'Habis'
  if (currentStock <= (minStock || 5)) return 'Rendah'
  return 'Normal'
}

const getStockStatusClass = (currentStock, minStock) => {
  if (currentStock === 0) return 'bg-red-100 text-red-800'
  if (currentStock <= (minStock || 5)) return 'bg-yellow-100 text-yellow-800'
  return 'bg-green-100 text-green-800'
}

onMounted(() => {
  logger.info('Shared: LaporanPengadaan component mounted')
  fetchData()
})
</script>
