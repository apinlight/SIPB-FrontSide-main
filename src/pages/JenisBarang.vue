<template>
  <DefaultLayout>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">🏷️ Kelola Jenis Barang</h1>
        <BaseButton @click="openForm()" variant="primary">
          + Tambah Jenis Barang
        </BaseButton>
      </div>

      <div v-if="showForm" class="bg-white p-4 sm:p-6 rounded-xl shadow mb-6">
        <h2 class="text-lg font-semibold mb-4">
          {{ editMode ? 'Edit Jenis Barang' : 'Tambah Jenis Barang' }}
        </h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Nama Jenis Barang</label>
            <input
              v-model="form.nama_jenis_barang"
              type="text"
              class="w-full border rounded px-3 py-2"
              placeholder="Masukkan nama jenis barang"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Deskripsi (Opsional)</label>
            <input
              v-model="form.deskripsi"
              type="text"
              class="w-full border rounded px-3 py-2"
              placeholder="Deskripsi singkat"
            />
          </div>
          <div class="flex flex-col sm:flex-row gap-2">
            <BaseButton type="submit" variant="primary" :loading="loading" :disabled="loading" fullWidth>
              {{ editMode ? 'Update' : 'Simpan' }}
            </BaseButton>
            <BaseButton type="button" variant="secondary" @click="closeForm" fullWidth>
              Batal
            </BaseButton>
          </div>
        </form>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="loading && itemList.length === 0" class="p-8 text-center text-gray-500">
          Memuat data...
        </div>
        <div v-else-if="itemList.length === 0" class="p-8 text-center text-gray-500">
          Belum ada data jenis barang.
        </div>
        <!-- Desktop Table -->
        <table v-else class="w-full hidden md:table">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Nama Jenis Barang</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in itemList" :key="item.id_jenis_barang" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ item.id_jenis_barang }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ item.nama_jenis_barang }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                <BaseButton size="sm" variant="secondary" @click="editItem(item)">Edit</BaseButton>
                <BaseButton size="sm" variant="danger" @click="handleDelete(item)">Hapus</BaseButton>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Mobile Cards -->
        <div class="md:hidden divide-y">
          <div v-for="item in itemList" :key="item.id_jenis_barang" class="p-4">
            <div class="flex justify-between items-start gap-3">
              <div>
                <h3 class="font-semibold text-gray-900">{{ item.nama_jenis_barang }}</h3>
                <p class="text-xs text-gray-500">ID: {{ item.id_jenis_barang }}</p>
              </div>
            </div>
            <div class="flex gap-2 mt-3">
              <BaseButton size="sm" variant="secondary" fullWidth @click="editItem(item)">Edit</BaseButton>
              <BaseButton size="sm" variant="danger" fullWidth @click="handleDelete(item)">Hapus</BaseButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useJenisBarangStore } from '@/stores/jenisBarangStore';
import BaseButton from '@/components/BaseButton.vue'

const store = useJenisBarangStore();

// Get reactive state from the store
const { itemList, pagination, loading } = storeToRefs(store);

// Local UI state for the form
const showForm = ref(false);
const editMode = ref(false);
const form = ref({
  id_jenis_barang: '',
  nama_jenis_barang: '',
  deskripsi: ''
});

onMounted(() => {
  store.fetchItems();
});

const resetForm = () => {
    form.value = { id_jenis_barang: '', nama_jenis_barang: '', deskripsi: '' };
    editMode.value = false;
}

const openForm = () => {
    resetForm();
    showForm.value = true;
}

const closeForm = () => {
    resetForm();
    showForm.value = false;
}

const editItem = (item) => {
  form.value = { ...item };
  editMode.value = true;
  showForm.value = true;
};

const handleSubmit = async () => {
  const success = await store.saveItem(form.value);
  if (success) {
    closeForm();
  }
};

const handleDelete = (item) => {
  if (confirm(`Yakin ingin menghapus jenis barang "${item.nama_jenis_barang}"?`)) {
    store.deleteItem(item.id_jenis_barang);
  }
};
</script>