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
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th v-if="showUser" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
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
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusBadgeClass(item.status)">{{ getStatusText(item.status) }}</span>
            </td>
            <td v-if="showUser" class="px-6 py-4 whitespace-nowrap text-sm">{{ item.user?.username }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex gap-2">
                <BaseButton v-if="canApprove(item)" size="sm" variant="primary" @click="$emit('approve', item)" icon="✅">Setujui</BaseButton>
                <BaseButton v-if="canReject(item)" size="sm" variant="danger" @click="$emit('reject', item)" icon="❌">Tolak</BaseButton>
                <BaseButton v-if="canEdit(item)" size="sm" variant="secondary" @click="$emit('edit', item)" icon="✏️">Edit</BaseButton>
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
        <div class="flex gap-2 pt-1">
          <BaseButton v-if="canApprove(item)" size="sm" variant="primary" fullWidth @click="$emit('approve', item)" icon="✅">Setujui</BaseButton>
          <BaseButton v-if="canReject(item)" size="sm" variant="danger" fullWidth @click="$emit('reject', item)" icon="❌">Tolak</BaseButton>
          <BaseButton v-if="canEdit(item)" size="sm" variant="secondary" fullWidth @click="$emit('edit', item)" icon="✏️">Edit</BaseButton>
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

defineEmits(['edit', 'approve', 'reject', 'change-page']);

const userStore = useUserStore();

const colspan = computed(() => props.showUser ? 7 : 6);

// Authorization logic can remain here as it's purely presentational
const canEdit = (item) => userStore.isAdmin || (userStore.isUser && item.unique_id === userStore.user?.unique_id && item.status === 'pending');
const canApprove = (item) => (userStore.isAdmin || userStore.isManager) && item.status === 'pending';
const canReject = (item) => (userStore.isAdmin || userStore.isManager) && item.status === 'pending';

// Formatting helpers
const formatDate = (date) => new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
const getStatusText = (status) => ({ pending: 'Menunggu', approved: 'Disetujui', rejected: 'Ditolak' }[status] || status);
const getStatusBadgeClass = (status) => ({
  pending: 'px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800',
  approved: 'px-2 py-1 text-xs rounded-full bg-green-100 text-green-800',
  rejected: 'px-2 py-1 text-xs rounded-full bg-red-100 text-red-800',
}[status] || 'px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800');
</script>