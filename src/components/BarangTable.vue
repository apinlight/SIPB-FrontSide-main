<template>
  <div class="p-6">
    <div class="flex justify-end mb-4">
      <input
        :value="searchQuery"
        @input="$emit('search', $event.target.value)"
        type="text"
        placeholder="Cari nama barang..."
        class="border px-3 py-2 rounded w-64"
      />
    </div>
    
    <div class="overflow-x-auto bg-white rounded-xl shadow">
      <table class="min-w-full table-auto text-sm">
        <thead class="bg-gray-100 text-left text-gray-700">
          <tr>
            <th class="px-6 py-3">Jenis Barang</th>
            <th class="px-6 py-3">Nama Barang</th>
            <th class="px-6 py-3">Harga Barang</th>
            <th v-if="canEdit" class="px-6 py-3 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="canEdit ? 4 : 3" class="text-center py-4">Memuat data...</td>
          </tr>
          <tr v-else-if="items.length === 0">
            <td :colspan="canEdit ? 4 : 3" class="text-center py-4 text-gray-500">Tidak ada data barang</td>
          </tr>
          <tr v-for="barang in items" :key="barang.id_barang" class="border-b hover:bg-gray-50">
            <td class="px-6 py-4">{{ barang.jenis_barang?.nama_jenis_barang || 'N/A' }}</td>
            <td class="px-6 py-4">{{ barang.nama_barang }}</td>
            <td class="px-6 py-4">Rp {{ (barang.harga_barang || 0).toLocaleString('id-ID') }}</td>
            <td v-if="canEdit" class="px-6 py-4 text-center space-x-2">
              <BaseButton variant="primary" @click="$emit('edit', barang)">Edit</BaseButton>
              <BaseButton variant="danger" @click="$emit('delete', barang)">Hapus</BaseButton>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="pagination.last_page > 1" class="flex justify-between items-center p-4 border-t">
        <div class="text-sm text-gray-600">
          Menampilkan {{ pagination.from }} - {{ pagination.to }} dari {{ pagination.total }} data
        </div>
        <div class="flex space-x-2">
          <BaseButton variant="secondary" @click="$emit('change-page', pagination.current_page - 1)" :disabled="pagination.current_page === 1">&laquo; Sebelumnya</BaseButton>
          <BaseButton variant="secondary" @click="$emit('change-page', pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page">Berikutnya &raquo;</BaseButton>
        </div>
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