<template>
  <DefaultLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">📊 Riwayat Pengajuan Cabang</h1>
      <p class="text-gray-600 mb-4">Menampilkan riwayat pengajuan untuk cabang: {{ userStore.user?.branch_name }}</p>
      
      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="flex gap-4">
          <select v-model="filters.status" @change="handleFilterChange" class="border rounded px-3 py-2">
            <option value="">Semua Status</option>
            <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Ditolak">Ditolak</option>
            <option value="Selesai">Selesai</option>
          </select>
          <input 
            v-model="filters.search"
            @input="handleFilterChange"
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
      
      <div v-else class="space-y-4">
          </div>

      <div v-if="pagination.last_page > 1" class="flex justify-center gap-2 mt-6">
        <BaseButton 
          size="sm" 
          variant="secondary" 
          @click="changePage(pagination.current_page - 1)" 
          :disabled="pagination.current_page === 1"
        >
          ← Sebelumnya
        </BaseButton>
        <span class="px-3 py-1 text-gray-700">
          {{ pagination.current_page }} / {{ pagination.last_page }}
        </span>
        <BaseButton 
          size="sm" 
          variant="secondary" 
          @click="changePage(pagination.current_page + 1)" 
          :disabled="pagination.current_page === pagination.last_page"
        >
          Berikutnya →
        </BaseButton>
      </div>

      <div v-if="selectedPengajuan" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeDetail">
        </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useUserStore } from '@/stores/userStore';
import { formatDate, formatCurrency, getStatusClass } from '@/utils/formatters';
import { useRiwayatCabangStore } from '@/stores/riwayatCabangStore';
import apiClient from '@/lib/api'; // Only needed for the detail view
import { toast } from 'vue3-toastify';
import BaseButton from '@/components/BaseButton.vue';

const userStore = useUserStore();
const store = useRiwayatCabangStore();

// Get reactive state from the store
const { pengajuanList, pagination, filters, loading } = storeToRefs(store);

// Local UI state for the modal
const selectedPengajuan = ref(null);

onMounted(() => {
  store.fetchRiwayat();
});

const handleFilterChange = () => {
  store.fetchRiwayat(1); // Reset to the first page when filters change
};

const changePage = (page) => {
  store.fetchRiwayat(page);
};

const showDetail = async (pengajuan) => {
  try {
    const { data } = await apiClient.get(`/pengajuan/${pengajuan.id_pengajuan}`);
    selectedPengajuan.value = data.data;
  } catch (e) {
    toast.error('Gagal memuat detail pengajuan.');
  }
};

const closeDetail = () => {
  selectedPengajuan.value = null;
};

const getTotalHarga = (pengajuan) => pengajuan.details?.reduce((total, detail) => total + ((detail.barang?.harga_barang || 0) * detail.jumlah), 0) || 0;
</script>