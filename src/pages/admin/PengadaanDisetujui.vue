<template>
  <DefaultLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">📦 Pengadaan Disetujui</h1>

      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="flex gap-4">
          <select v-model="filters.branch" @change="handleFilterChange" class="border rounded px-3 py-2">
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
            </div>
            
            <div class="flex flex-col gap-2 ml-4">
              <button class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm" @click="showDetail(pengajuan)">
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

      <div v-if="pagination.last_page > 1" class="flex justify-center gap-2 mt-6">
        <button @click="changePage(pagination.current_page - 1)" :disabled="pagination.current_page === 1" class="px-3 py-1 border rounded disabled:opacity-50">
          Sebelumnya
        </button>
        <span class="px-3 py-1">
          {{ pagination.current_page }} / {{ pagination.last_page }}
        </span>
        <button @click="changePage(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page" class="px-3 py-1 border rounded disabled:opacity-50">
          Berikutnya
        </button>
      </div>

      <div v-if="selectedPengajuan" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click="closeDetail">
          </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePengadaanAdminStore } from '@/stores/pengadaanAdminStore';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

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

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const formatCurrency = (amount) => new Intl.NumberFormat('id-ID').format(amount || 0);
const getTotalHarga = (pengajuan) => pengajuan.details?.reduce((total, detail) => total + ((detail.barang?.harga_barang || 0) * detail.jumlah), 0) || 0;
</script>