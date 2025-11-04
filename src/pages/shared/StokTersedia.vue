<template>
  <DefaultLayout>
    <div class="space-y-6">
      <div class="bg-white p-6 rounded-xl shadow">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">📊 Stok Tersedia</h1>
            <p class="text-gray-600 mt-1">Lihat stok barang yang tersedia untuk digunakan</p>
          </div>
          <BaseButton @click="store.fetchStock()" variant="outline" :disabled="isLoading">
            🔄 Refresh
          </BaseButton>
        </div>
      </div>

      <div class="bg-white p-4 rounded-xl shadow">
        <div class="flex flex-col sm:flex-row gap-3 items-center">
          <div class="flex-1 w-full">
            <input
              :value="filterQuery"
              @input="store.setFilter($event.target.value)"
              type="text"
              placeholder="Cari nama barang..."
              class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow overflow-hidden">
        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kode Barang</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Barang</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stok Tersedia</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="isLoading">
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">Memuat data...</td>
              </tr>
              <tr v-else-if="filteredStock.length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                    {{ filterQuery ? 'Tidak ada barang yang sesuai' : 'Belum ada stok barang' }}
                </td>
              </tr>
              <tr v-else v-for="item in filteredStock" :key="item.id_barang" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ item.id_barang || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">{{ item.nama_barang || 'Unknown' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.jenis_barang || 'N/A' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">{{ item.jumlah_tersedia ?? 0 }} unit</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStockBadgeClass(item.jumlah_tersedia ?? 0)">
                    {{ getStockStatus(item.jumlah_tersedia ?? 0, 5) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden divide-y">
          <div v-if="isLoading" class="p-8 text-center text-gray-500">
            Memuat data...
          </div>
          <div v-else-if="filteredStock.length === 0" class="p-8 text-center text-gray-500">
            {{ filterQuery ? 'Tidak ada barang yang sesuai' : 'Belum ada stok barang' }}
          </div>
          <div v-else v-for="item in filteredStock" :key="item.id_barang" class="p-4">
            <div class="flex justify-between items-start mb-2">
              <div>
                <h3 class="font-semibold text-gray-900">{{ item.nama_barang || 'Unknown' }}</h3>
                <p class="text-xs text-gray-500">Kode: {{ item.id_barang || '-' }}</p>
                <p class="text-xs text-gray-500">Jenis: {{ item.jenis_barang || 'N/A' }}</p>
              </div>
              <span :class="getStockBadgeClass(item.jumlah_tersedia ?? 0)">
                {{ getStockStatus(item.jumlah_tersedia ?? 0, 5) }}
              </span>
            </div>
            <div class="mt-2">
              <span class="text-sm font-medium">Stok: {{ item.jumlah_tersedia ?? 0 }} unit</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white p-6 rounded-xl shadow">
            <p class="text-sm font-medium text-gray-500">Total Jenis Barang</p>
            <p class="text-2xl font-semibold text-gray-900">{{ totalItemTypes }}</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow">
            <p class="text-sm font-medium text-gray-500">Total Stok Unit</p>
            <p class="text-2xl font-semibold text-green-600">{{ totalStockCount }}</p>
        </div>
        <div class="bg-white p-6 rounded-xl shadow">
            <p class="text-sm font-medium text-gray-500">Stok Menipis (≤5)</p>
            <p class="text-2xl font-semibold text-red-600">{{ lowStockCount }}</p>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import BaseButton from '@/components/BaseButton.vue';
import { useStokStore } from '@/stores/stokStore';
// ✅ Import the correct, standardized function names
import { getStockStatus, getStockBadgeClass } from '@/utils/formatters';

const store = useStokStore();
const { isLoading, filterQuery, filteredStock, totalStockCount, lowStockCount, totalItemTypes } = storeToRefs(store);

onMounted(() => {
  store.fetchStock();
});
</script>