<template>
  <DefaultLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold mb-6">📊 Laporan Pengadaan & Stok</h1>

      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Periode</label>
            <select v-model="filters.period" @change="fetchLaporanData" class="w-full border rounded px-3 py-2">
              <option value="all">Semua Waktu</option>
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="year">Tahun Ini</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div v-if="filters.period === 'custom'">
            <label class="block text-sm font-medium mb-1">Dari Tanggal</label>
            <input v-model="filters.startDate" @change="fetchLaporanData" type="date" class="w-full border rounded px-3 py-2" />
          </div>
          <div v-if="filters.period === 'custom'">
            <label class="block text-sm font-medium mb-1">Sampai Tanggal</label>
            <input v-model="filters.endDate" @change="fetchLaporanData" type="date" class="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Cabang</label>
            <select v-model="filters.branch" @change="fetchLaporanData" class="w-full border rounded px-3 py-2">
              <option value="">Semua Cabang</option>
              <option v-for="branch in branches" :key="branch" :value="branch">{{ branch }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <p class="text-sm font-medium text-gray-600">Total Pengajuan</p>
          <p class="text-2xl font-bold text-gray-900">{{ summary.total_pengajuan }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <p class="text-sm font-medium text-gray-600">Disetujui</p>
          <p class="text-2xl font-bold text-gray-900">{{ summary.total_disetujui }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <p class="text-sm font-medium text-gray-600">Menunggu</p>
          <p class="text-2xl font-bold text-gray-900">{{ summary.total_menunggu }}</p>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <p class="text-sm font-medium text-gray-600">Total Nilai</p>
          <p class="text-2xl font-bold text-gray-900">Rp {{ formatCurrency(summary.total_nilai) }}</p>
        </div>
      </div>

      <div v-if="loading" class="text-center py-10">Memuat data...</div>
      <div v-else>
        <div class="bg-white rounded-lg shadow">
          <div class="border-b">
            <nav class="flex space-x-8 px-6">
              <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key" :class="['py-4 px-1 border-b-2 font-medium text-sm', activeTab === tab.key ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']">
                {{ tab.label }}
              </button>
            </nav>
          </div>

          <div class="p-6">
            <div v-if="activeTab === 'barang'">
              <div class="overflow-x-auto">
                <table class="w-full table-auto border-collapse border">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="border px-4 py-3 text-left">Nama Barang</th>
                      <th class="border px-4 py-3 text-center">Stok Saat Ini</th>
                      <th class="border px-4 py-3 text-right">Nilai Pengadaan</th>
                      <th class="border px-4 py-3 text-center">Status Stok</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in laporanBarang" :key="item.id_barang" class="border-b hover:bg-gray-50">
                      <td class="border px-4 py-3">{{ item.nama_barang }}</td>
                      <td class="border px-4 py-3 text-center">{{ item.stok_saat_ini ?? 0 }}</td>
                      <td class="border px-4 py-3 text-right">Rp {{ formatCurrency(item.nilai_pengadaan || 0) }}</td>
                      <td class="border px-4 py-3 text-center">
                        <span :class="getStockBadgeClass(item.stok_saat_ini ?? 0)">
                          {{ getStockStatus(item.stok_saat_ini ?? 0, item.batas_minimum ?? 5) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-if="activeTab === 'pengajuan'">
              <div class="overflow-x-auto">
                <table class="w-full table-auto border-collapse border">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="border px-4 py-3 text-left">Pemohon</th>
                      <th class="border px-4 py-3 text-left">Cabang</th>
                      <th class="border px-4 py-3 text-center">Total Item</th>
                      <th class="border px-4 py-3 text-right">Total Nilai</th>
                      <th class="border px-4 py-3 text-center">Status</th>
                      <th class="border px-4 py-3 text-left">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="p in laporanPengajuan" :key="p.id_pengajuan" class="border-b hover:bg-gray-50">
                      <td class="border px-4 py-3">{{ p.user?.name || '-' }}</td>
                      <td class="border px-4 py-3">{{ p.user?.branch_name || '-' }}</td>
                      <td class="border px-4 py-3 text-center">{{ p.total_items ?? 0 }}</td>
                      <td class="border px-4 py-3 text-right">Rp {{ formatCurrency(p.total_nilai ?? 0) }}</td>
                      <td class="border px-4 py-3 text-center">
                        <span :class="getStatusClass(p.status_pengajuan)">{{ p.status_pengajuan }}</span>
                      </td>
                      <td class="border px-4 py-3">{{ formatDate(p.created_at) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-if="activeTab === 'cabang'">
              <div class="overflow-x-auto">
                <table class="w-full table-auto border-collapse border">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="border px-4 py-3 text-left">Cabang</th>
                      <th class="border px-4 py-3 text-center">Total Pengajuan</th>
                      <th class="border px-4 py-3 text-center">Disetujui</th>
                      <th class="border px-4 py-3 text-center">Menunggu</th>
                      <th class="border px-4 py-3 text-right">Total Nilai</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="c in laporanCabang" :key="c.branch_name" class="border-b hover:bg-gray-50">
                      <td class="border px-4 py-3">{{ c.branch_name || '-' }}</td>
                      <td class="border px-4 py-3 text-center">{{ c.total_pengajuan ?? 0 }}</td>
                      <td class="border px-4 py-3 text-center">{{ c.total_disetujui ?? 0 }}</td>
                      <td class="border px-4 py-3 text-center">{{ c.total_menunggu ?? 0 }}</td>
                      <td class="border px-4 py-3 text-right">Rp {{ formatCurrency(c.total_nilai ?? 0) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-end">
        <div class="flex items-center gap-2">
          <label for="exportType" class="text-sm text-gray-600">Jenis Export</label>
          <select id="exportType" v-model="exportType" class="border rounded px-3 py-2 text-sm">
            <option value="summary">Summary</option>
            <option value="barang">Barang</option>
            <option value="pengajuan">Pengajuan</option>
            <option v-if="userStore.isAdmin || userStore.isManager" value="penggunaan">Penggunaan</option>
            <option v-if="userStore.isAdmin || userStore.isManager" value="stok">Stok</option>
            <option v-if="userStore.isAdmin || userStore.isManager" value="all">Semua</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <label for="exportFormat" class="text-sm text-gray-600">Format</label>
          <select id="exportFormat" v-model="exportFormat" class="border rounded px-3 py-2 text-sm">
            <option value="xlsx">Excel (.xlsx)</option>
            <option value="docx">Word (.docx)</option>
          </select>
        </div>
        <button @click="handleExport" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-60" :disabled="loading">
          📊 Export Excel
        </button>
        <p v-if="!userStore.isAdmin && !userStore.isManager" class="text-xs text-gray-500">Catatan: Export memerlukan peran admin atau manager.</p>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useLaporanStore } from '@/stores/laporanStore';
import { useUserStore } from '@/stores/userStore';
// ✅ Import the correct, standardized function names
import { 
  formatDate, 
  formatCurrency, 
  getStatusClass, 
  getStockStatus, 
  getStockBadgeClass 
} from '@/utils/formatters';

// --- STORES ---
const laporanStore = useLaporanStore();
const { 
  filters, summary, laporanBarang, laporanPengajuan, laporanCabang, 
  branches, loading 
} = storeToRefs(laporanStore);
const { fetchLaporanData, exportLaporan } = laporanStore;
const userStore = useUserStore();

// --- LOCAL UI STATE ---
const activeTab = ref('barang');
const tabs = [
  { key: 'barang', label: 'Laporan Barang' },
  { key: 'pengajuan', label: 'Laporan Pengajuan' },
  { key: 'cabang', label: 'Laporan per Cabang' }
];

// --- LIFECYCLE HOOK ---
onMounted(() => {
  fetchLaporanData();
});

const exportType = ref('summary');
const exportFormat = ref('xlsx');
const handleExport = () => exportLaporan(exportType.value, exportFormat.value);
</script>