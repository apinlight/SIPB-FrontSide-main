<template>
  <DefaultLayout>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">🏷️ Kelola Jenis Barang</h1>
        <button @click="openForm()" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
          + Tambah Jenis Barang
        </button>
      </div>

      <div v-if="showForm" class="bg-white p-4 rounded-lg shadow mb-6">
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
          <div class="flex gap-2">
            <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded" :disabled="loading">
              {{ loading ? 'Menyimpan...' : (editMode ? 'Update' : 'Simpan') }}
            </button>
            <button type="button" @click="closeForm" class="bg-gray-500 text-white px-4 py-2 rounded">
              Batal
            </button>
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
        <table v-else class="w-full">
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
                <button @click="editItem(item)" class="text-blue-600 hover:text-blue-800 font-medium">Edit</button>
                <button @click="handleDelete(item)" class="text-red-600 hover:text-red-800 font-medium">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useJenisBarangStore } from '@/stores/jenisBarangStore';

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