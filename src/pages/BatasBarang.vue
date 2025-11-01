<template>
  <DefaultLayout>
    <div class="p-4 sm:p-6 space-y-6">
      <div class="bg-white p-6 rounded-xl shadow">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-800">⚠️ Kelola Batas Barang</h1>
            <p class="text-gray-600 mt-1">Set batas minimum stok untuk setiap barang</p>
          </div>
          <BaseButton @click="openForm()" variant="primary">
            + Set Batas Barang
          </BaseButton>
        </div>
      </div>

      <div v-if="loading" class="text-center py-10">Memuat data...</div>
      
      <div v-else-if="getBatasWithStatus.length === 0" class="bg-white rounded-xl shadow p-10 text-center text-gray-500">
        Belum ada batas barang yang diset. Klik tombol di atas untuk menambahkan.
      </div>

      <!-- Desktop Table -->
      <div v-else class="bg-white rounded-xl shadow overflow-hidden hidden md:block">
        <table class="w-full">
          <thead class="bg-gray-50 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nama Barang</th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Jenis</th>
              <th class="px-6 py-3 text-center text-sm font-semibold text-gray-700">Batas Minimum</th>
              <th class="px-6 py-3 text-center text-sm font-semibold text-gray-700">Stok Saat Ini</th>
              <th class="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
              <th class="px-6 py-3 text-center text-sm font-semibold text-gray-700">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr v-for="item in getBatasWithStatus" :key="item.id_barang" class="hover:bg-gray-50">
              <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ item.barang?.nama_barang || 'N/A' }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">{{ item.barang?.jenis_barang?.nama_jenis_barang || '-' }}</td>
              <td class="px-6 py-4 text-sm text-center">{{ item.batas_barang }}</td>
              <td class="px-6 py-4 text-sm text-center">{{ item.currentStock || 0 }}</td>
              <td class="px-6 py-4 text-center">
                <span :class="[
                  'px-3 py-1 text-xs rounded-full font-medium',
                  item.status === 'Aman' ? 'bg-green-100 text-green-800' :
                  item.status === 'Menipis' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                ]">
                  {{ item.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-center">
                <div class="flex justify-center gap-2">
                  <BaseButton size="sm" variant="secondary" @click="editItem(item)">Edit</BaseButton>
                  <BaseButton size="sm" variant="danger" @click="handleDelete(item)">Hapus</BaseButton>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div v-if="!loading && getBatasWithStatus.length > 0" class="md:hidden space-y-4">
        <div v-for="item in getBatasWithStatus" :key="item.id_barang" class="bg-white rounded-xl shadow p-4">
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="font-semibold text-gray-900">{{ item.barang?.nama_barang || 'N/A' }}</h3>
              <p class="text-sm text-gray-500">{{ item.barang?.jenis_barang?.nama_jenis_barang || '-' }}</p>
            </div>
            <span :class="[
              'px-3 py-1 text-xs rounded-full font-medium',
              item.status === 'Aman' ? 'bg-green-100 text-green-800' :
              item.status === 'Menipis' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            ]">
              {{ item.status }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-3 text-sm mb-3">
            <div>
              <span class="text-gray-500">Batas Min:</span>
              <span class="font-medium ml-1">{{ item.batas_barang }}</span>
            </div>
            <div>
              <span class="text-gray-500">Stok:</span>
              <span class="font-medium ml-1">{{ item.currentStock || 0 }}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <BaseButton size="sm" variant="secondary" @click="editItem(item)" fullWidth>Edit</BaseButton>
            <BaseButton size="sm" variant="danger" @click="handleDelete(item)" fullWidth>Hapus</BaseButton>
          </div>
        </div>
      </div>

      <!-- Form Modal -->
      <div v-if="showForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" @click.self="showForm = false">
        <div class="bg-white rounded-xl shadow-lg p-6 max-w-md w-full" @click.stop>
          <h2 class="text-xl font-bold mb-4">{{ editMode ? 'Edit' : 'Tambah' }} Batas Barang</h2>
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Barang</label>
              <select v-model="form.id_barang" :disabled="editMode" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                <option value="">-- Pilih Barang --</option>
                <option v-for="barang in availableBarang" :key="barang.id_barang" :value="barang.id_barang">
                  {{ barang.nama_barang }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Batas Minimum</label>
              <input v-model.number="form.batas_barang" type="number" min="0" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required />
              <small class="text-gray-500">Stok di bawah nilai ini akan dianggap menipis</small>
            </div>
            <div class="flex gap-2">
              <BaseButton type="submit" variant="primary" fullWidth>Simpan</BaseButton>
              <BaseButton type="button" variant="secondary" @click="showForm = false" fullWidth>Batal</BaseButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { usePengaturanStore } from '@/stores/pengaturanStore';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import BaseButton from '@/components/BaseButton.vue'

const store = usePengaturanStore();
const { barangList, loading, getBatasWithStatus } = storeToRefs(store);

const showForm = ref(false);
const editMode = ref(false);
const form = ref({ id_barang: '', batas_barang: 0 });

onMounted(() => store.fetchBatasBarang());

const availableBarang = computed(() => {
  if (editMode.value) return barangList.value;
  const existingIds = getBatasWithStatus.value.map(item => item.id_barang);
  return barangList.value.filter(b => !existingIds.includes(b.id_barang));
});

const openForm = () => {
  editMode.value = false;
  form.value = { id_barang: '', batas_barang: 0 };
  showForm.value = true;
};
const editItem = (item) => {
  editMode.value = true;
  form.value = { id_barang: item.id_barang, batas_barang: item.batas_barang };
  showForm.value = true;
};
const handleSubmit = async () => {
  const success = await store.saveBatasBarang(form.value);
  if (success) showForm.value = false;
};
const handleDelete = async (item) => {
    if (confirm(`Hapus batas untuk "${item.barang?.nama_barang}"?`)) {
        await store.deleteBatasBarang(item.id_barang);
    }
};
</script>