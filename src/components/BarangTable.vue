<template>
  <div class="space-y-4">
    <!-- Search bar -->
    <div class="flex flex-col sm:flex-row sm:justify-end gap-3">
      <input
        :value="searchQuery"
        @input="$emit('search', $event.target.value)"
        type="text"
        placeholder="Cari nama barang..."
        class="border border-gray-300 px-4 py-2.5 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />
    </div>
    
    <!-- Desktop: Table view -->
    <div class="hidden md:block overflow-x-auto bg-white rounded-xl shadow-md">
      <table class="min-w-full table-auto text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Jenis Barang</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Nama Barang</th>
            <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Harga Barang</th>
            <th v-if="canEdit" class="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-if="loading">
            <td :colspan="canEdit ? 4 : 3" class="text-center py-8 text-gray-500">
              <div class="flex items-center justify-center gap-2">
                <svg class="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                <span>Memuat data...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="items.length === 0">
            <td :colspan="canEdit ? 4 : 3" class="text-center py-8 text-gray-500">
              <div class="flex flex-col items-center gap-2">
                <span class="text-3xl">📦</span>
                <span>Tidak ada data barang</span>
              </div>
            </td>
          </tr>
          <tr v-for="barang in items" :key="barang.id_barang" class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 text-gray-900">{{ barang.jenis_barang?.nama_jenis_barang || 'N/A' }}</td>
            <td class="px-6 py-4 font-medium text-gray-900">{{ barang.nama_barang }}</td>
            <td class="px-6 py-4 text-gray-900">Rp {{ (barang.harga_barang || 0).toLocaleString('id-ID') }}</td>
            <td v-if="canEdit" class="px-6 py-4">
              <div class="flex items-center justify-center gap-2">
                <BaseButton size="sm" variant="primary" @click="$emit('edit', barang)" icon="✏️">Edit</BaseButton>
                <BaseButton size="sm" variant="danger" @click="$emit('delete', barang)" icon="🗑️">Hapus</BaseButton>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile: Card view -->
    <div class="md:hidden space-y-3">
      <div v-if="loading" class="flex items-center justify-center py-8 text-gray-500">
        <div class="flex items-center gap-2">
          <svg class="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span>Memuat data...</span>
        </div>
      </div>
      <div v-else-if="items.length === 0" class="flex flex-col items-center py-8 text-gray-500">
        <span class="text-3xl mb-2">📦</span>
        <span>Tidak ada data barang</span>
      </div>
      <div v-for="barang in items" :key="barang.id_barang" class="bg-white rounded-lg shadow-md p-4 space-y-3">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 text-lg">{{ barang.nama_barang }}</h3>
            <p class="text-sm text-gray-500 mt-1">{{ barang.jenis_barang?.nama_jenis_barang || 'N/A' }}</p>
          </div>
        </div>
        <div class="border-t pt-3">
          <div class="text-sm">
            <span class="text-gray-500">Harga:</span>
            <span class="font-semibold text-gray-900 ml-2">Rp {{ (barang.harga_barang || 0).toLocaleString('id-ID') }}</span>
          </div>
        </div>
        <div v-if="canEdit" class="flex gap-2 pt-2">
          <BaseButton size="sm" variant="primary" @click="$emit('edit', barang)" icon="✏️" fullWidth>Edit</BaseButton>
          <BaseButton size="sm" variant="danger" @click="$emit('delete', barang)" icon="🗑️" fullWidth>Hapus</BaseButton>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.last_page > 1" class="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-md">
      <div class="text-sm text-gray-600">
        Menampilkan {{ pagination.from }} - {{ pagination.to }} dari {{ pagination.total }} data
      </div>
      <div class="flex gap-2">
        <BaseButton 
          size="sm" 
          variant="secondary" 
          @click="$emit('change-page', pagination.current_page - 1)" 
          :disabled="pagination.current_page === 1"
        >
          &laquo; Sebelumnya
        </BaseButton>
        <BaseButton 
          size="sm" 
          variant="secondary" 
          @click="$emit('change-page', pagination.current_page + 1)" 
          :disabled="pagination.current_page === pagination.last_page"
        >
          Berikutnya &raquo;
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from './BaseButton.vue';

defineProps({
  items: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  pagination: { type: Object, required: true },
  canEdit: { type: Boolean, default: false },
  searchQuery: { type: String, default: '' },
});

defineEmits(['edit', 'delete', 'change-page', 'search']);
</script>