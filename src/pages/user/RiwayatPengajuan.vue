<template>
  <DefaultLayout>
    <div class="p-4 sm:p-6 space-y-6">
      <div class="bg-white p-6 rounded-xl shadow">
        <h1 class="text-2xl font-bold text-gray-800">🕘 Riwayat Pengajuan</h1>
        <p class="text-gray-600 mt-1">Lihat dan kelola riwayat pengajuan Anda</p>
      </div>

      <div class="bg-white p-4 rounded-xl shadow">
        <div class="flex flex-col sm:flex-row gap-3">
          <select v-model="filters.status" @change="handleFilterChange" class="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500">
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
            class="border border-gray-300 rounded-lg px-3 py-2.5 flex-1 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div v-if="loading" class="text-center py-10">Memuat riwayat pengajuan...</div>
      <div v-else-if="riwayatList.length === 0" class="text-center py-10 text-gray-500">
        Anda belum pernah mengajukan permintaan.
      </div>

      <div v-else class="space-y-3">
        <div v-for="pengajuan in riwayatList" :key="pengajuan.id_pengajuan" class="bg-white border rounded-xl p-4 sm:p-6 shadow hover:shadow-md transition-shadow">
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
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
            <div class="flex flex-col sm:flex-row gap-2">
              <BaseButton size="sm" variant="primary" @click="handleShowDetail(pengajuan)" fullWidth>
                Lihat Detail
              </BaseButton>
              <BaseButton v-if="pengajuan.status_pengajuan === 'Menunggu Persetujuan'" size="sm" variant="danger" @click="handleCancel(pengajuan)" fullWidth>
                Batalkan
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <div v-if="pagination.last_page > 1" class="bg-white p-4 rounded-xl shadow flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-center items-center">
        <BaseButton size="sm" variant="secondary" @click="changePage(pagination.current_page - 1)" :disabled="pagination.current_page === 1">
          Sebelumnya
        </BaseButton>
        <span class="px-3 py-1 text-sm">{{ pagination.current_page }} / {{ pagination.last_page }}</span>
        <BaseButton size="sm" variant="secondary" @click="changePage(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page">
          Berikutnya
        </BaseButton>
      </div>

      <div v-if="selectedPengajuan" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click="closeDetail">
        <div class="bg-white rounded-xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto" @click.stop>
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-xl font-semibold">Detail Pengajuan</h2>
            <BaseButton size="sm" variant="secondary" @click="closeDetail">✕</BaseButton>
          </div>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600">ID Pengajuan</p>
                <p class="font-medium">{{ selectedPengajuan.id_pengajuan }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Status</p>
                <span :class="getStatusClass(selectedPengajuan.status_pengajuan)" class="inline-block px-3 py-1 text-sm rounded-full font-medium">
                  {{ selectedPengajuan.status_pengajuan }}
                </span>
              </div>
              <div>
                <p class="text-sm text-gray-600">Tanggal Pengajuan</p>
                <p class="font-medium">{{ formatDate(selectedPengajuan.created_at) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Tipe</p>
                <p class="font-medium capitalize">{{ selectedPengajuan.tipe_pengajuan }}</p>
              </div>
            </div>
            <div v-if="selectedPengajuan.keterangan">
              <p class="text-sm text-gray-600 mb-1">Keterangan</p>
              <p class="text-sm bg-gray-50 p-3 rounded">{{ selectedPengajuan.keterangan }}</p>
            </div>
            <div>
              <p class="font-semibold mb-2">Detail Barang</p>
              <div class="space-y-2">
                <div v-for="(detail, idx) in selectedPengajuan.details" :key="idx" class="border rounded-lg p-3 bg-gray-50">
                  <div class="flex justify-between">
                    <span class="font-medium">{{ detail.barang?.nama_barang || 'Unknown' }}</span>
                    <span class="text-gray-600">{{ detail.jumlah }} unit</span>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">{{ detail.barang?.id_barang }}</p>
                </div>
              </div>
            </div>
          </div>
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
import BaseButton from '@/components/BaseButton.vue';

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