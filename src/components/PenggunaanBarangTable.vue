<template>
  <div class="bg-white rounded-xl shadow overflow-hidden">
    <!-- Table Header -->
    <div class="px-6 py-4 border-b border-gray-200">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium text-gray-900">Riwayat Penggunaan Barang</h3>
        <div class="flex gap-2">
          <select
            v-model="statusFilter"
            @change="applyFilter"
            class="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
          <BaseButton @click="refreshData" variant="outline">
            🔄 Refresh
          </BaseButton>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tanggal
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Barang
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Jumlah
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Keperluan
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th v-if="showUser" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th v-if="!readonly" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="isLoading">
            <td :colspan="getColspan()" class="px-6 py-4 text-center text-gray-500">
              <div class="flex items-center justify-center">
                <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Memuat data...
              </div>
            </td>
          </tr>
          <tr v-else-if="filteredData.length === 0">
            <td :colspan="getColspan()" class="px-6 py-4 text-center text-gray-500">
              <div class="text-center py-8">
                <span class="text-4xl mb-2 block">📋</span>
                <p>Belum ada data penggunaan barang</p>
              </div>
            </td>
          </tr>
          <tr v-else v-for="item in filteredData" :key="item.id_penggunaan" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatDate(item.tanggal_penggunaan) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div>
                <div class="text-sm font-medium text-gray-900">{{ item.barang?.nama_barang }}</div>
                <div class="text-sm text-gray-500">{{ item.id_barang }}</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.jumlah_digunakan }} unit
            </td>
            <td class="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
              {{ item.keperluan }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusBadgeClass(item.status)">
                {{ getStatusText(item.status) }}
              </span>
            </td>
            <td v-if="showUser" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ item.user?.username }}
            </td>
            <td v-if="!readonly" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex gap-2">
                <button
                  @click="viewDetail(item)"
                  class="text-blue-600 hover:text-blue-900"
                  title="Lihat Detail"
                >
                  👁️
                </button>
                <button
                  v-if="canEdit(item)"
                  @click="editItem(item)"
                  class="text-green-600 hover:text-green-900"
                  title="Edit"
                >
                  ✏️
                </button>
                <button
                  v-if="canApprove(item)"
                  @click="approveItem(item)"
                  class="text-green-600 hover:text-green-900"
                  title="Setujui"
                >
                  ✅
                </button>
                <button
                  v-if="canReject(item)"
                  @click="rejectItem(item)"
                  class="text-red-600 hover:text-red-900"
                  title="Tolak"
                >
                  ❌
                </button>
                <button
                  v-if="canDelete(item)"
                  @click="deleteItem(item)"
                  class="text-red-600 hover:text-red-900"
                  title="Hapus"
                >
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="flex justify-between items-center p-4 border-t">
        <div class="text-sm text-gray-600">
          Menampilkan {{ pagination.from }} - {{ pagination.to }} dari {{ pagination.total }} data
        </div>
        <div class="flex space-x-2">
          <BaseButton
            variant="secondary"
            @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
          >
            &laquo; Sebelumnya
          </BaseButton>
          <BaseButton
            variant="secondary"
            @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page"
          >
            Berikutnya &raquo;
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import API from '@/lib/api'
import { logger } from '@/lib/logger'
import { toast } from 'vue3-toastify'
import BaseButton from './BaseButton.vue'
import { useUserStore } from '@/stores/userStore'

const props = defineProps({
  showUser: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'approve', 'reject', 'saved'])

const userStore = useUserStore()
const penggunaanList = ref([])
const search = ref('')
const statusFilter = ref('')
const isLoading = ref(false)
const currentPage = ref(1)
const pagination = ref({
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
  total: 0
})

// Computed
const filteredData = computed(() => {
  return penggunaanList.value
})

// Methods
const fetchPenggunaanBarang = async () => {
  isLoading.value = true
  try {
    logger.debug('Fetching penggunaan barang data...')
    const res = await API.get('/penggunaan-barang', {
      params: {
        page: currentPage.value,
        search: search.value || undefined,
        status: statusFilter.value || undefined
      }
    })
    
    logger.success('Penggunaan barang data fetched successfully')
    
    if (res.data.success) {
      penggunaanList.value = res.data.data || []
      pagination.value = res.data.meta || pagination.value
    } else {
      throw new Error(res.data.message || 'Failed to fetch data')
    }
  } catch (err) {
    logger.error('Failed to fetch penggunaan barang:', err.response?.data?.message || err.message)
    toast.error('Gagal memuat data penggunaan barang')
    penggunaanList.value = []
  } finally {
    isLoading.value = false
  }
}

const refreshData = () => {
  fetchPenggunaanBarang()
}

const applyFilter = () => {
  currentPage.value = 1
  fetchPenggunaanBarang()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    currentPage.value = page
    fetchPenggunaanBarang()
  }
}

const getColspan = () => {
  let cols = 5 // base columns
  if (props.showUser) cols++
  if (!props.readonly) cols++
  return cols
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  try {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

const getStatusText = (status) => {
  const statusMap = {
    pending: 'Menunggu',
    approved: 'Disetujui',
    rejected: 'Ditolak'
  }
  return statusMap[status] || status
}

const getStatusBadgeClass = (status) => {
  const classMap = {
    pending: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
    approved: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
    rejected: 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800'
  }
  return classMap[status] || 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800'
}

const canEdit = (item) => {
  if (userStore.isAdmin) return true
  if (userStore.isUser && item.unique_id === userStore.user?.unique_id && item.status === 'pending') {
    return true
  }
  return false
}

const canApprove = (item) => {
  return (userStore.isAdmin || userStore.isManager) && item.status === 'pending'
}

const canReject = (item) => {
  return (userStore.isAdmin || userStore.isManager) && item.status === 'pending'
}

const canDelete = (item) => {
  if (userStore.isAdmin) return true
  if (userStore.isUser && item.unique_id === userStore.user?.unique_id && 
      (item.status === 'pending' || item.status === 'rejected')) {
    return true
  }
  return false
}

const viewDetail = (item) => {
  // Implement view detail logic
  logger.info('View detail for:', item.id_penggunaan)
}

const editItem = (item) => {
  emit('edit', item)
}

const approveItem = (item) => {
  emit('approve', item)
}

const rejectItem = (item) => {
  emit('reject', item)
}

const deleteItem = async (item) => {
  if (!confirm(`Yakin ingin menghapus penggunaan barang "${item.barang?.nama_barang}"?`)) {
    return
  }

  try {
    logger.debug('Deleting penggunaan barang:', item.id_penggunaan)
    const response = await API.delete(`/penggunaan-barang/${item.id_penggunaan}`)
    
    if (response.data.success) {
      toast.success('Penggunaan barang berhasil dihapus')
      fetchPenggunaanBarang()
      emit('saved', { success: true, message: 'Data berhasil dihapus' })
    }
  } catch (err) {
    logger.error('Failed to delete penggunaan barang:', err.response?.data?.message || err.message)
    toast.error('Gagal menghapus penggunaan barang')
    emit('saved', { success: false, message: 'Gagal menghapus data' })
  }
}

// Watchers
watch([search, statusFilter], () => {
  applyFilter()
})

// Lifecycle
onMounted(() => {
  fetchPenggunaanBarang()
})

// Expose methods for parent component
defineExpose({
  fetchPenggunaanBarang,
  refreshData
})
</script>
