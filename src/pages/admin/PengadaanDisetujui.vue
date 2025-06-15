<!-- src/pages/admin/PengadaanDisetujui.vue -->
<template>
  <DefaultLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">📦 Pengadaan Disetujui</h1>

      <!-- Filter -->
      <div class="bg-white p-4 rounded-lg shadow mb-6">
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
            placeholder="Cari ID pengajuan..."
            class="border rounded px-3 py-2 flex-1"
          />
        </div>
      </div>

      <div v-if="loading" class="text-center py-10">Loading...</div>
      <div v-else-if="pengajuanList.length === 0" class="text-center py-10 text-gray-500">
        Tidak ada pengajuan yang disetujui.
      </div>

      <div v-else class="grid gap-6">
        <div
          v-for="pengajuan in pengajuanList"
          :key="pengajuan.id_pengajuan"
          class="bg-white shadow rounded-xl p-6 border hover:shadow-md transition-shadow"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-3">
                <h2 class="font-semibold text-lg">{{ pengajuan.id_pengajuan }}</h2>
                <span class="bg-green-100 text-green-800 px-3 py-1 text-sm rounded-full font-medium">
                  {{ pengajuan.status_pengajuan }}
                </span>
              </div>
              
              <div class="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                <div>
                  <span class="font-medium">Diajukan oleh:</span>
                  <p>{{ pengajuan.user?.username }} ({{ pengajuan.user?.branch_name }})</p>
                </div>
                <div>
                  <span class="font-medium">Tanggal Disetujui:</span>
                  <p>{{ formatDate(pengajuan.updated_at) }}</p>
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

              <!-- Preview items -->
              <div v-if="pengajuan.details && pengajuan.details.length > 0" class="mb-4">
                <p class="text-sm font-medium text-gray-700 mb-2">Item yang disetujui:</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div 
                    v-for="detail in pengajuan.details" 
                    :key="detail.id_barang"
                    class="text-sm bg-gray-50 px-3 py-2 rounded border"
                  >
                    <div class="flex justify-between">
                      <span class="font-medium">{{ detail.barang?.nama_barang }}</span>
                      <span class="text-gray-600">{{ detail.jumlah }} unit</span>
                    </div>
                    <div class="text-xs text-gray-500">
                      @ Rp {{ formatCurrency(detail.barang?.harga_barang || 0) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col gap-2 ml-4">
              <button
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
                @click="showDetail(pengajuan)"
              >
                Lihat Detail
              </button>
              <button
                class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
                @click="handleTambahKeGudang(pengajuan)"
                :disabled="processing || pengajuan.status_pengajuan === 'Selesai'"
              >
                {{ pengajuan.status_pengajuan === 'Selesai' ? 'Sudah di Gudang' : 'Tambah ke Gudang' }}
              </button>
            </div>
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
                  <p><span class="font-medium">Tanggal Pengajuan:</span> {{ formatDate(selectedPengajuan.created_at) }}</p>
                  <p><span class="font-medium">Tanggal Disetujui:</span> {{ formatDate(selectedPengajuan.updated_at) }}</p>
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
              <h3 class="font-medium mb-3">Daftar Barang yang Disetujui</h3>
              <div class="overflow-x-auto">
                <table class="w-full text-sm border-collapse border">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="border px-3 py-2 text-left">Nama Barang</th>
                      <th class="border px-3 py-2 text-left">Jenis</th>
                      <th class="border px-3 py-2 text-center">Jumlah</th>
                      <th class="border px-3 py-2 text-right">Harga Satuan</th>
                      <th class="border px-3 py-2 text-right">Total Harga</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="detail in selectedPengajuan.details" :key="detail.id_barang">
                      <td class="border px-3 py-2">{{ detail.barang?.nama_barang || 'Unknown' }}</td>
                      <td class="border px-3 py-2">{{ detail.barang?.jenis_barang?.nama_jenis_barang || '-' }}</td>
                      <td class="border px-3 py-2 text-center">{{ detail.jumlah }}</td>
                      <td class="border px-3 py-2 text-right">Rp {{ formatCurrency(detail.barang?.harga_barang || 0) }}</td>
                      <td class="border px-3 py-2 text-right">Rp {{ formatCurrency((detail.barang?.harga_barang || 0) * detail.jumlah) }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-gray-50 font-medium">
                    <tr>
                      <td colspan="4" class="border px-3 py-2 text-right">Total Keseluruhan:</td>
                      <td class="border px-3 py-2 text-right">Rp {{ formatCurrency(getTotalHarga(selectedPengajuan)) }}</td>
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
                v-if="selectedPengajuan.status_pengajuan !== 'Selesai'"
                @click="handleTambahKeGudang(selectedPengajuan)"
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                :disabled="processing"
              >
                Tambah ke Gudang
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import API from '@/lib/api'
import { logger } from '@/lib/logger'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
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
      status: 'Disetujui'
    }
    
    const { data } = await API.get('/pengajuan', { params })
    pengajuanList.value = data.data
    
    if (data.meta) {
      pagination.value = data.meta
    }

    // Extract unique branches
    const uniqueBranches = [...new Set(data.data.map(p => p.user?.branch_name).filter(Boolean))]
    branches.value = uniqueBranches
  } catch (e) {
    logger.error('Failed to load pengajuan data:', e.response?.data?.message || e.message)
    toast.error('Gagal memuat data pengajuan')
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

const handleTambahKeGudang = async (pengajuan) => {
  if (!confirm(`Tambah semua barang dari pengajuan ${pengajuan.id_pengajuan} ke gudang?`)) return

  processing.value = true
  try {
    // Get detail pengajuan if not already loaded
    let detailList = pengajuan.details
    if (!detailList) {
      const { data } = await API.get(`/detail-pengajuan?id_pengajuan=${pengajuan.id_pengajuan}`)
      detailList = data.data
    }

    // Add each item to gudang
    for (const item of detailList) {
      await API.post('/gudang', {
        unique_id: pengajuan.unique_id,
        id_barang: item.id_barang,
        jumlah_barang: item.jumlah
      })
    }

    // Update status to 'Selesai'
    await API.put(`/pengajuan/${pengajuan.id_pengajuan}`, {
      status_pengajuan: 'Selesai'
    })

    toast.success(`Barang dari pengajuan ${pengajuan.id_pengajuan} berhasil ditambahkan ke gudang`)
    closeDetail()
    await fetchData(pagination.value.current_page)
  } catch (e) {
    logger.error('Failed to add items to gudang:', e.response?.data?.message || e.message)
    const errorMsg = e.response?.data?.message || 'Gagal menambahkan barang ke gudang'
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

onMounted(() => fetchData())
</script>

