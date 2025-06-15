<template>
  <div class="p-6">
    <!-- Search -->
    <div class="flex justify-end mb-4">
      <input
        v-model="search"
        @input="handleSearch"
        type="text"
        placeholder="Cari nama barang..."
        class="border px-3 py-2 rounded w-64"
      />
    </div>
    
    <!-- Table -->
    <div class="overflow-x-auto bg-white rounded-xl shadow">
      <table class="min-w-full table-auto text-sm">
        <thead class="bg-gray-100 text-left text-gray-700">
          <tr>
            <th class="px-6 py-3">Jenis Barang</th>
            <th class="px-6 py-3">Nama Barang</th>
            <th class="px-6 py-3">Harga Barang</th>
            <th v-if="!readonly" class="px-6 py-3 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="isLoading">
            <td :colspan="readonly ? 3 : 4" class="text-center py-4">Memuat data...</td>
          </tr>
          <tr v-else-if="barangList.length === 0">
            <td :colspan="readonly ? 3 : 4" class="text-center py-4 text-gray-500">Tidak ada data barang</td>
          </tr>
          <tr v-for="barang in barangList" :key="barang.id_barang" class="border-b hover:bg-gray-50">
            <td class="px-6 py-4">{{ barang.jenis_barang?.nama_jenis_barang || 'N/A' }}</td>
            <td class="px-6 py-4">{{ barang.nama_barang }}</td>
            <td class="px-6 py-4">Rp {{ barang.harga_barang.toLocaleString('id-ID') }}</td>
            <td v-if="!readonly" class="px-6 py-4 text-center space-x-2">
              <BaseButton variant="primary" @click="$emit('edit', barang)">Edit</BaseButton>
              <BaseButton variant="danger" @click="confirmDelete(barang)">Hapus</BaseButton>
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
import { ref, onMounted, watch } from 'vue'
import API from '@/lib/api'
import { logger } from '@/lib/logger'
import { toast } from 'vue3-toastify'
import BaseButton from './BaseButton.vue'

// ✅ FIX: Add missing props
const props = defineProps({
  canEdit: {
    type: Boolean,
    default: false
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['edit', 'saved'])
const barangList = ref([])
const search = ref('')
const isLoading = ref(false)

const currentPage = ref(1)
const pagination = ref({
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
  total: 0
})

const fetchBarang = async () => {
  isLoading.value = true
  try {
    logger.debug('Fetching barang data...')
    const res = await API.get('/barang', {
      params: {
        page: currentPage.value,
        search: search.value || undefined
      }
    })
    logger.success('Barang data loaded successfully')
    barangList.value = res.data.data
    
    if (res.data.meta) {
      pagination.value = res.data.meta
    }
  } catch (err) {
    logger.error('Failed to fetch barang:', err.response?.data?.message || err.message)
    toast.error('Gagal mengambil barang')
  } finally {
    isLoading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchBarang()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    currentPage.value = page
    fetchBarang()
  }
}

const confirmDelete = async (barang) => {
  if (!props.canEdit) return
  
  if (!confirm(`Yakin ingin menghapus barang "${barang.nama_barang}"?`)) return

  try {
    logger.debug('Deleting barang:', barang.nama_barang)
    await API.delete(`/barang/${barang.id_barang}`)
    logger.success('Barang deleted successfully')
    toast.success('Barang berhasil dihapus')
    fetchBarang()
    emit('saved', { success: true, message: 'Barang berhasil dihapus' })
  } catch (err) {
    logger.error('Failed to delete barang:', err.response?.data?.message || err.message)
    toast.error('Gagal menghapus barang')
    emit('saved', { success: false, message: 'Gagal menghapus barang' })
  }
}

onMounted(fetchBarang)
watch(currentPage, fetchBarang)

defineExpose({ fetchBarang })
</script>
