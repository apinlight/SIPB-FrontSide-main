<!-- src/pages/admin/PengadaanManual.vue -->
<template>
  <DefaultLayout>
    <div class="p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">🛠️ Pengadaan Manual oleh Admin</h1>

      <!-- Form Pengadaan Manual -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Tambah Pengadaan Manual</h2>
        
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 font-semibold">Pilih User/Cabang</label>
              <select v-model="form.unique_id" class="w-full p-2 border rounded" required>
                <option disabled value="">-- Pilih User --</option>
                <option v-for="user in userList" :key="user.unique_id" :value="user.unique_id">
                  {{ user.username }} - {{ user.branch_name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block mb-1 font-semibold">Pilih Barang</label>
              <select v-model="form.id_barang" class="w-full p-2 border rounded" required>
                <option disabled value="">-- Pilih Barang --</option>
                <option v-for="barang in barangList" :key="barang.id_barang" :value="barang.id_barang">
                  {{ barang.nama_barang }} - Rp {{ formatCurrency(barang.harga_barang) }}
                </option>
              </select>
            </div>

            <div>
              <label class="block mb-1 font-semibold">Jumlah Barang</label>
              <input
                type="number"
                v-model.number="form.jumlah"
                class="w-full p-2 border rounded"
                min="1"
                required
              />
            </div>

            <div>
              <label class="block mb-1 font-semibold">Keterangan (Opsional)</label>
              <input
                type="text"
                v-model="form.keterangan"
                class="w-full p-2 border rounded"
                placeholder="Keterangan pengadaan manual..."
              />
            </div>
          </div>

          <div class="flex gap-3">
            <button 
              type="submit" 
              class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              :disabled="submitting"
            >
              {{ submitting ? 'Memproses...' : 'Tambah Pengadaan' }}
            </button>
            <button 
              type="button"
              @click="resetForm"
              class="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <!-- Riwayat Pengadaan Manual -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <div class="flex justify-between items-center">
            <h2 class="text-lg font-semibold">Riwayat Pengadaan Manual</h2>
            <div class="flex gap-3">
              <select v-model="filterUser" @change="fetchRiwayat" class="border rounded px-3 py-2">
                <option value="">Semua User</option>
                <option v-for="user in userList" :key="user.unique_id" :value="user.unique_id">
                  {{ user.username }} - {{ user.branch_name }}
                </option>
              </select>
              <input 
                v-model="searchRiwayat"
                @input="handleSearchRiwayat"
                type="text"
                placeholder="Cari barang..."
                class="border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>

        <div class="p-6">
          <div v-if="loadingRiwayat" class="text-center py-10 text-gray-500">
            Memuat riwayat...
          </div>
          
          <div v-else-if="riwayatList.length === 0" class="text-center py-10 text-gray-500">
            Belum ada riwayat pengadaan manual.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full table-auto border-collapse border">
              <thead class="bg-gray-50">
                <tr>
                  <th class="border px-4 py-3 text-left">Tanggal</th>
                  <th class="border px-4 py-3 text-left">User/Cabang</th>
                  <th class="border px-4 py-3 text-left">Barang</th>
                  <th class="border px-4 py-3 text-center">Jumlah</th>
                  <th class="border px-4 py-3 text-right">Total Nilai</th>
                  <th class="border px-4 py-3 text-left">Keterangan</th>
                  <th class="border px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in riwayatList" :key="item.id" class="border-b hover:bg-gray-50">
                  <td class="border px-4 py-3">{{ formatDate(item.created_at) }}</td>
                  <td class="border px-4 py-3">
                    {{ item.user?.username }}<br>
                    <span class="text-sm text-gray-500">{{ item.user?.branch_name }}</span>
                  </td>
                  <td class="border px-4 py-3">
                    {{ item.barang?.nama_barang }}<br>
                    <span class="text-sm text-gray-500">{{ item.barang?.jenis_barang?.nama_jenis_barang }}</span>
                  </td>
                  <td class="border px-4 py-3 text-center">{{ item.jumlah_barang }}</td>
                  <td class="border px-4 py-3 text-right">
                    Rp {{ formatCurrency((item.barang?.harga_barang || 0) * item.jumlah_barang) }}
                  </td>
                  <td class="border px-4 py-3">{{ item.keterangan || '-' }}</td>
                  <td class="border px-4 py-3 text-center">
                    <button
                      @click="deleteRiwayat(item)"
                      class="text-red-600 hover:text-red-800 text-sm"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
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
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import API from '@/lib/api'
import { toast } from 'vue3-toastify'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { logger } from '../../lib/logger'

const submitting = ref(false)
const loadingRiwayat = ref(true)
const searchRiwayat = ref('')
const filterUser = ref('')

const barangList = ref([])
const userList = ref([])
const riwayatList = ref([])

const pagination = ref({
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
  total: 0
})

const form = ref({
  unique_id: '',
  id_barang: '',
  jumlah: 1,
  keterangan: ''
})

const fetchBarang = async () => {
  try {
    const res = await API.get('/barang')
    barangList.value = res.data.data
  } catch (e) {
    logger.error('Failed to load barang data:', e.response?.data?.message || e.message) 
    toast.error('Gagal memuat data barang')
  }
}

const fetchUsers = async () => {
  try {
    const res = await API.get('/users')
    userList.value = res.data.data
  } catch (e) {
    logger.error('Failed to load users data:', e.response?.data?.message || e.message)
    toast.error('Gagal memuat data user')
  }
}

const fetchRiwayat = async (page = 1) => {
  loadingRiwayat.value = true
  try {
    const params = {
      page,
      search: searchRiwayat.value || undefined,
      user_id: filterUser.value || undefined
      // ✅ Removed 'type: manual' - column doesn't exist in database
    }
    
    const res = await API.get('/gudang', { params })
    
    // ✅ Handle different response structures
    if (res.data.success) {
      riwayatList.value = res.data.data || []
      if (res.data.meta) {
        pagination.value = res.data.meta
      }
    } else {
      // Fallback for direct data array
      riwayatList.value = Array.isArray(res.data) ? res.data : res.data.data || []
    }
  } catch (e) {
    logger.error('Failed to load riwayat data:', e.response?.data?.message || e.message)
    toast.error('Gagal memuat riwayat')
  } finally {
    loadingRiwayat.value = false
  }
}

const handleSearchRiwayat = () => {
  pagination.value.current_page = 1
  fetchRiwayat()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    fetchRiwayat(page)
  }
}

const submitForm = async () => {
  submitting.value = true
  try {
    // Create pengajuan manual
    const pengajuanData = {
      id_pengajuan: `MAN-${Date.now()}`,
      unique_id: form.value.unique_id,
      status_pengajuan: 'Disetujui',
      tipe_pengajuan: 'manual',
      keterangan: form.value.keterangan
    }
    
    const pengajuanRes = await API.post('/pengajuan', pengajuanData)
    
    // Create detail pengajuan
    await API.post('/detail-pengajuan', {
      id_pengajuan: pengajuanData.id_pengajuan,
      id_barang: form.value.id_barang,
      jumlah: form.value.jumlah
    })
    
    // Add directly to gudang
    await API.post('/gudang', {
      unique_id: form.value.unique_id,
      id_barang: form.value.id_barang,
      jumlah_barang: form.value.jumlah,
      keterangan: form.value.keterangan,
      tipe: 'manual'
    })
    
    toast.success('Pengadaan manual berhasil ditambahkan')
    resetForm()
    fetchRiwayat()
  } catch (e) {
    logger.error('Failed to create manual pengadaan:', e.response?.data?.message || e.message)
    const errorMsg = e.response?.data?.message || 'Gagal menambahkan pengadaan'
    toast.error(errorMsg)
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    unique_id: '',
    id_barang: '',
    jumlah: 1,
    keterangan: ''
  }
}

const deleteRiwayat = async (item) => {
  if (!confirm(`Hapus riwayat pengadaan ${item.barang?.nama_barang}?`)) return
  
  try {
    await API.delete(`/gudang/${item.unique_id}/${item.id_barang}`)
    toast.success('Riwayat berhasil dihapus')
    fetchRiwayat(pagination.value.current_page)
  } catch (e) {
    logger.error('Failed to delete riwayat:', e.response?.data?.message || e.message)
    const errorMsg = e.response?.data?.message || 'Gagal menghapus riwayat'
    toast.error(errorMsg)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('id-ID', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID').format(amount || 0)
}

onMounted(async () => {
  await Promise.all([
    fetchBarang(),
    fetchUsers(),
    fetchRiwayat()
  ])
})
</script>

