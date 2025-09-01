<template>
  <DefaultLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">📊 Laporan Pengadaan & Stok</h1>
      </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useLaporanStore } from '@/stores/laporanStore';
// ✅ 1. Import all necessary helpers
import { 
  formatDate, 
  formatCurrency, 
  getStatusClass, 
  getStockStatus, 
  getStockStatusClass 
} from '@/utils/formatters';

// --- STORES ---
const laporanStore = useLaporanStore();
const { 
  filters, summary, laporanBarang, laporanPengajuan, laporanCabang, 
  branches, loading 
} = storeToRefs(laporanStore);
const { fetchLaporanData, exportLaporan } = laporanStore;

// --- LOCAL UI STATE ---
const activeTab = ref('barang');
const searchBarang = ref('');
const tabs = [
  { key: 'barang', label: 'Laporan Barang' },
  { key: 'pengajuan', label: 'Laporan Pengajuan' },
  { key: 'cabang', label: 'Laporan per Cabang' }
];

// --- COMPUTED ---
const filteredBarang = computed(() => {
  if (!searchBarang.value) return laporanBarang.value;
  return laporanBarang.value.filter(item =>
    item.nama_barang.toLowerCase().includes(searchBarang.value.toLowerCase())
  );
});

// --- LIFECYCLE HOOK ---
onMounted(() => {
  fetchLaporanData();
});

</script>