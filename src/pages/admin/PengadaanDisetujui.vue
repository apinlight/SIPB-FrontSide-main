<template>
  <DefaultLayout>
    <div class="p-4 sm:p-6 space-y-6">
      <div class="bg-white p-6 rounded-xl shadow">
        <h1 class="text-2xl font-bold text-gray-800">📦 Pengadaan Disetujui</h1>
        <p class="text-gray-600 mt-1">Daftar pengajuan yang telah disetujui</p>
      </div>

      <div class="bg-white p-4 rounded-xl shadow mb-6">
        <div class="flex flex-col sm:flex-row gap-3">
          <select v-model="filters.branch" @change="handleFilterChange" class="border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500">
            <option value="">Semua Cabang</option>
            <option v-for="branch in uniqueBranches" :key="branch" :value="branch">
              {{ branch }}
            </option>
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
          <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
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
            </div>
            
            <div class="flex flex-col sm:flex-row gap-2 ml-0 sm:ml-4">
              <BaseButton size="sm" variant="secondary" @click="showDetail(pengajuan)" fullWidth>
                Lihat Detail
              </BaseButton>
              <BaseButton
                size="sm"
                :variant="pengajuan.status_pengajuan === 'Selesai' ? 'secondary' : 'primary'"
                @click="handleTambahKeGudang(pengajuan)"
                :disabled="processing || pengajuan.status_pengajuan === 'Selesai'"
                :loading="processing && pengajuan.status_pengajuan !== 'Selesai'"
                fullWidth
              >
                {{ pengajuan.status_pengajuan === 'Selesai' ? 'Sudah di Gudang' : 'Tambah ke Gudang' }}
              </BaseButton>
            </div>
          </div>
        </div>
      </div>

      <div v-if="pagination.last_page > 1" class="bg-white p-4 rounded-xl shadow flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-center items-center mt-6">
        <BaseButton size="sm" variant="secondary" @click="changePage(pagination.current_page - 1)" :disabled="pagination.current_page === 1">
          Sebelumnya
        </BaseButton>
        <span class="px-3 py-1 text-sm">
          {{ pagination.current_page }} / {{ pagination.last_page }}
        </span>
        <BaseButton size="sm" variant="secondary" @click="changePage(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page">
          Berikutnya
        </BaseButton>
      </div>

      <div v-if="selectedPengajuan" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="closeDetail">
        <div class="bg-white rounded-xl shadow-lg p-6 max-w-xl w-full relative" @click.stop>
          <div class="flex justify-between items-start mb-4">
            <h2 class="text-xl font-bold">Detail Pengajuan {{ selectedPengajuan.id_pengajuan }}</h2>
            <BaseButton size="sm" variant="secondary" @click="closeDetail">✕</BaseButton>
          </div>
          <div class="mb-2"><b>Diajukan oleh:</b> {{ selectedPengajuan.user?.username }} ({{ selectedPengajuan.user?.branch_name }})</div>
          <div class="mb-2"><b>Tanggal Disetujui:</b> {{ formatDate(selectedPengajuan.updated_at) }}</div>
          <div class="mb-2"><b>Status:</b> {{ selectedPengajuan.status_pengajuan }}</div>
          <div class="mb-2"><b>Daftar Barang:</b></div>
          <ul class="list-disc pl-5 mb-2">
            <li v-for="detail in selectedPengajuan.details" :key="detail.id_detail_pengajuan">
              {{ detail.barang?.nama_barang }} - {{ detail.jumlah }} unit (Rp {{ formatCurrency(detail.barang?.harga_barang) }})
            </li>
          </ul>
          <div class="mt-4 font-semibold text-green-700">
            Total Nilai: Rp {{ formatCurrency(getTotalHarga(selectedPengajuan)) }}
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePengadaanAdminStore } from '@/stores/pengadaanAdminStore';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { formatDate, formatCurrency } from '@/utils/formatters';
import BaseButton from '@/components/BaseButton.vue';

const selectedPengajuan = ref(null);

const store = usePengadaanAdminStore();
const { itemList: pengajuanList, pagination, filters, loading, processing } = storeToRefs(store);

const uniqueBranches = computed(() => {
    const branches = pengajuanList.value.map(p => p.user?.branch_name).filter(Boolean);
    return [...new Set(branches)];
});

onMounted(() => {
  store.fetchItems({ status: 'Disetujui' });
});

const handleFilterChange = () => {
    changePage(1);
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    store.fetchItems({ status: 'Disetujui', page });
  }
}

const handleTambahKeGudang = (pengajuan) => {
  if (confirm(`Tambah semua barang dari pengajuan ${pengajuan.id_pengajuan} ke gudang? This will mark the request as 'Selesai'.`)) {
    store.processToGudang(pengajuan);
  }
};

const showDetail = (pengajuan) => {
  selectedPengajuan.value = pengajuan;
};

const closeDetail = () => {
  selectedPengajuan.value = null;
};

// This function is specific to this component, so it stays.
const getTotalHarga = (pengajuan) => pengajuan.details?.reduce((total, detail) => total + ((detail.barang?.harga_barang || 0) * detail.jumlah), 0) || 0;

</script>