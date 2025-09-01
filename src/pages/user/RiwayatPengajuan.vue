<template>
  <DefaultLayout>
    <div class="p-6 space-y-6">
      <h1 class="text-2xl font-bold">🕘 Riwayat Pengajuan</h1>

      <div class="bg-white p-4 rounded-lg shadow">
        <div class="flex gap-4">
          <select v-model="filters.status" @change="handleFilterChange" class="border rounded px-3 py-2">
            <option value="">Semua Status</option>
            <option value="Menunggu Persetujuan">Menunggu Persetujuan</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Ditolak">Ditolak</option>
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

      <div v-if="loading" class="text-center py-10">Memuat riwayat pengajuan...</div>
      <div v-else-if="riwayatList.length === 0" class="text-center py-10 text-gray-500">
        Anda belum pernah mengajukan permintaan.
      </div>

      <div v-else class="space-y-4">
        <div v-for="pengajuan in riwayatList" :key="pengajuan.id_pengajuan" class="bg-white border rounded-xl p-6 shadow hover:shadow-md transition-shadow">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <h2 class="font-semibold text-lg">{{ pengajuan.id_pengajuan }}</h2>
                <span :class="getStatusClass(pengajuan.status_pengajuan)" class="px-3 py-1 text-sm rounded-full font-medium">
                  {{ pengajuan.status_pengajuan }}
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-2">Tanggal: {{ formatDate(pengajuan.created_at) }}</p>
              <p class="text-sm text-gray-600 mb-3">Total Item: {{ pengajuan.details?.length || 0 }} jenis barang</p>
            </div>
            <div class="flex gap-2">
              <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm" @click="handleShowDetail(pengajuan)">
                Lihat Detail
              </button>
              <button v-if="pengajuan.status_pengajuan === 'Menunggu Persetujuan'" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm" @click="handleCancel(pengajuan)">
                Batalkan
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="pagination.last_page > 1" class="flex justify-center gap-2">
        <button @click="changePage(pagination.current_page - 1)" :disabled="pagination.current_page === 1" class="px-3 py-1 border rounded disabled:opacity-50">
          Sebelumnya
        </button>
        <span class="px-3 py-1">{{ pagination.current_page }} / {{ pagination.last_page }}</span>
        <button @click="changePage(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page" class="px-3 py-1 border rounded disabled:opacity-50">
          Berikutnya
        </button>
      </div>

      <div v-if="selectedPengajuan" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeDetail">
        <div class="bg-white rounded-xl w-full max-w-2xl p-6 m-4 max-h-[80vh] overflow-y-auto" @click.stop>
            </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { formatDate, formatCurrency, getStatusClass } from '@/utils/formatters';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useRiwayatPengajuanStore } from '@/stores/riwayatPengajuanStore';

const store = useRiwayatPengajuanStore();

// Get state and make it reactive
const { riwayatList, pagination, filters, loading } = storeToRefs(store);

// Local UI state for the modal
const selectedPengajuan = ref(null);

onMounted(() => {
  store.fetchRiwayat();
});

const handleFilterChange = () => {
  store.fetchRiwayat(1); // Go back to page 1 on filter change
};

const changePage = (page) => {
    store.fetchRiwayat(page);
};

const handleShowDetail = async (pengajuan) => {
  // The component asks the store to fetch the data and then uses it
  const detailData = await store.fetchDetail(pengajuan.id_pengajuan);
  if (detailData) {
    selectedPengajuan.value = detailData;
  }
};

const closeDetail = () => {
  selectedPengajuan.value = null;
};

const handleCancel = (pengajuan) => {
  if (confirm(`Yakin ingin membatalkan pengajuan ${pengajuan.id_pengajuan}?`)) {
    store.cancelPengajuan(pengajuan.id_pengajuan);
  }
};

</script>