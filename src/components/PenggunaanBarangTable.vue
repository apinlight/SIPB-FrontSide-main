<template>
  <div class="bg-white rounded-xl shadow overflow-hidden">
    <div class="px-6 py-4 border-b border-gray-200">
      <h3 class="text-lg font-medium text-gray-900">Riwayat Penggunaan Barang</h3>
    </div>

    <div class="overflow-x-auto">
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
            <td :colspan="colspan" class="px-6 py-4 text-center text-gray-500">Memuat data...</td>
          </tr>
          <tr v-else-if="!items || items.length === 0">
            <td :colspan="colspan" class="px-6 py-4 text-center text-gray-500">Belum ada data.</td>
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
                <button v-if="canApprove(item)" @click="$emit('approve', item)" class="text-green-600 hover:text-green-900" title="Setujui">✅</button>
                <button v-if="canReject(item)" @click="$emit('reject', item)" class="text-red-600 hover:text-red-900" title="Tolak">❌</button>
                <button v-if="canEdit(item)" @click="$emit('edit', item)" class="text-blue-600 hover:text-blue-900" title="Edit">✏️</button>
                </div>
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