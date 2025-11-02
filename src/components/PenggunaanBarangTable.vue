<template>
  <div class="space-y-4">
    <div class="px-6 py-4 bg-white rounded-xl shadow-md">
      <h3 class="text-lg font-semibold text-gray-900">Riwayat Penggunaan Barang</h3>
    </div>

    <!-- Desktop: Table view -->
    <div class="hidden md:block overflow-x-auto bg-white rounded-xl shadow-md">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barang</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keperluan</th>
            <th v-if="showUser" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
            <th v-if="!isManager" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="loading">
            <td :colspan="colspan" class="px-6 py-8 text-center text-gray-500">Memuat data...</td>
          </tr>
          <tr v-else-if="!items || items.length === 0">
            <td :colspan="colspan" class="px-6 py-8 text-center text-gray-500">Belum ada data.</td>
          </tr>
          <tr v-else v-for="item in items" :key="item.id_penggunaan" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ formatDate(item.tanggal_penggunaan) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ item.barang?.nama_barang }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">{{ item.jumlah_digunakan }} unit</td>
            <td class="px-6 py-4 text-sm max-w-xs truncate">{{ item.keperluan }}</td>
            <td v-if="showUser" class="px-6 py-4 whitespace-nowrap text-sm">{{ item.user?.username }}</td>
            <td v-if="!isManager" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <BaseButton v-if="canEdit(item)" size="sm" variant="secondary" @click="$emit('edit', item)" icon="✏️">Edit</BaseButton>
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
      <div v-else-if="!items || items.length === 0" class="flex flex-col items-center py-8 text-gray-500">
        <span class="text-3xl mb-2">🗂️</span>
        <span>Belum ada data.</span>
      </div>
      <div
        v-for="item in items"
        :key="item.id_penggunaan"
        class="bg-white rounded-lg shadow-md p-4 space-y-3"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 text-base">{{ item.barang?.nama_barang }}</h3>
            <p class="text-xs text-gray-500 mt-1">{{ formatDate(item.tanggal_penggunaan) }}</p>
          </div>
          <span :class="getStatusBadgeClass(item.status)">{{ getStatusText(item.status) }}</span>
        </div>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div class="text-gray-500">Jumlah</div>
            <div class="font-semibold text-gray-900">{{ item.jumlah_digunakan }} unit</div>
          </div>
          <div>
            <div class="text-gray-500">Keperluan</div>
            <div class="font-semibold text-gray-900 truncate">{{ item.keperluan }}</div>
          </div>
          <div v-if="showUser" class="col-span-2">
            <div class="text-gray-500">User</div>
            <div class="font-semibold text-gray-900">{{ item.user?.username }}</div>
          </div>
        </div>
        <div v-if="!isManager && canEdit(item)" class="flex gap-2 pt-1">
          <BaseButton size="sm" variant="secondary" fullWidth @click="$emit('edit', item)" icon="✏️">Edit</BaseButton>
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
        >&laquo; Sebelumnya</BaseButton>
        <BaseButton 
          size="sm" 
          variant="secondary" 
          @click="$emit('change-page', pagination.current_page + 1)" 
          :disabled="pagination.current_page === pagination.last_page"
        >Berikutnya &raquo;</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import BaseButton from './BaseButton.vue';
import { useUserStore } from '@/stores/userStore';

const props = defineProps({
  items: { type: Array, required: true, default: () => [] },
  loading: { type: Boolean, default: false },
  pagination: { type: Object, required: true, default: () => ({
    current_page: 1,
    last_page: 1,
    from: 0,
    to: 0,
    total: 0
  }) },
  showUser: { type: Boolean, default: false },
});

defineEmits(['edit', 'change-page']);

const userStore = useUserStore();

const colspan = computed(() => {
  let count = 4; // base columns: Tanggal, Barang, Jumlah, Keperluan
  if (props.showUser) count++;
  if (!isManager.value) count++; // Aksi column
  return count;
});

const isManager = computed(() => userStore.user?.role === 'manager');

// ✅ FIX: Authorization logic sesuai aturan bisnis baru
// Admin: selalu bisa edit
// Manager: tidak bisa edit (read-only/oversight)
// User: hanya miliknya (cek via user.unique_id dari resource)
const canEdit = (item) => {
  const userRole = userStore.user?.role;
  
  // Admin selalu bisa edit
  if (userRole === 'admin') return true;
  
  // Manager tidak bisa edit (read-only)
  if (userRole === 'manager') return false;
  
  // User hanya bisa edit miliknya (cek unique_id dari relasi user di resource)
  return item.user?.unique_id === userStore.user?.unique_id;
};

// Formatting helpers
const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
</script>