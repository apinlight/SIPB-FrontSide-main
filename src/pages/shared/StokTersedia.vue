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
        <div class="flex gap-4 items-center">
          <div class="flex-1">
            <input
              :value="filterQuery"
              @input="store.setFilter($event.target.value)"
              type="text"
              placeholder="Cari nama barang..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow overflow-hidden">
        <div class="overflow-x-auto">
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
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ item.id_barang }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">{{ item.nama_barang }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.jenis_barang }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="getStockStatusClass(item.jumlah_tersedia)">{{ item.jumlah_tersedia }} unit</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStockBadgeClass(item.jumlah_tersedia)">{{ getStockStatus(item.jumlah_tersedia) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
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
import { useStokStore } from '@/stores/stokStore'; // ✅ Use the new store

const store = useStokStore();

// Get state and getters from the store
const { isLoading, filterQuery, filteredStock, totalStockCount, lowStockCount, totalItemTypes } = storeToRefs(store);

onMounted(() => {
  store.fetchStock();
});

// Formatting helpers remain in the component as they are purely for presentation
const getStockStatus = (stock) => {
  if (stock === 0) return 'Habis';
  if (stock <= 5) return 'Menipis';
  return 'Tersedia';
};
const getStockStatusClass = (stock) => {
  if (stock === 0) return 'text-red-600 font-semibold';
  if (stock <= 5) return 'text-orange-600 font-semibold';
  return 'text-green-600 font-semibold';
};
const getStockBadgeClass = (stock) => {
  const base = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  if (stock === 0) return `${base} bg-red-100 text-red-800`;
  if (stock <= 5) return `${base} bg-orange-100 text-orange-800`;
  return `${base} bg-green-100 text-green-800`;
};
</script>