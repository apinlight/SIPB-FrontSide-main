<template>
  <DefaultLayout>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">🏢 Kelola Cabang</h1>
        <BaseButton @click="openForm()" variant="primary">
          + Tambah Cabang
        </BaseButton>
      </div>

      <div v-if="showForm" class="bg-white p-4 sm:p-6 rounded-xl shadow mb-6">
        <h2 class="text-lg font-semibold mb-4">
          {{ editMode ? 'Edit Cabang' : 'Tambah Cabang' }}
        </h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Nama Cabang</label>
            <input
              v-model="form.nama_cabang"
              type="text"
              class="w-full border rounded px-3 py-2"
              placeholder="Masukkan nama cabang"
              required
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
        <div v-if="loading && cabangList.length === 0" class="p-8 text-center text-gray-500">
          Memuat data...
        </div>
        <div v-else-if="cabangList.length === 0" class="p-8 text-center text-gray-500">
          Belum ada data cabang.
        </div>
        <!-- Desktop Table -->
        <table v-else class="w-full hidden md:table">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Nama Cabang</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Jumlah User</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Jumlah Jenis Item</th>
              <th class="px-6 py-3 text-left text-xs font-medium uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="item in cabangList" :key="item.id_cabang" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ item.id_cabang }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">{{ item.nama_cabang }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ item.users_count || 0 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">{{ item.gudang_count || 0 }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                <BaseButton size="sm" variant="secondary" @click="editItem(item)">Edit</BaseButton>
                <BaseButton size="sm" variant="danger" @click="handleDelete(item)">Hapus</BaseButton>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Mobile Cards -->
        <div class="md:hidden divide-y">
          <div v-for="item in cabangList" :key="item.id_cabang" class="p-4">
            <div class="flex justify-between items-start gap-3">
              <div>
                <h3 class="font-semibold text-gray-900">{{ item.nama_cabang }}</h3>
                <p class="text-xs text-gray-500">ID: {{ item.id_cabang }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  {{ item.users_count || 0 }} User • {{ item.gudang_count || 0 }} Jenis Item
                </p>
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
import { useCabangStore } from '@/stores/cabangStore';
import BaseButton from '@/components/BaseButton.vue';

const cabangStore = useCabangStore();
const { cabangList, loading } = storeToRefs(cabangStore);

const showForm = ref(false);
const editMode = ref(false);
const form = ref({
  nama_cabang: '',
});
const currentId = ref(null);

onMounted(() => {
  cabangStore.fetchCabang();
});

function openForm() {
  showForm.value = true;
  editMode.value = false;
  form.value = { nama_cabang: '' };
}

function closeForm() {
  showForm.value = false;
  editMode.value = false;
  form.value = { nama_cabang: '' };
  currentId.value = null;
}

function editItem(item) {
  showForm.value = true;
  editMode.value = true;
  currentId.value = item.id_cabang;
  form.value = {
    nama_cabang: item.nama_cabang,
  };
}

async function handleSubmit() {
  const data = { ...form.value };
  let result;

  if (editMode.value) {
    result = await cabangStore.updateCabang(currentId.value, data);
  } else {
    result = await cabangStore.createCabang(data);
  }

  if (result.success) {
    alert(editMode.value ? 'Cabang berhasil diupdate!' : 'Cabang berhasil ditambahkan!');
    closeForm();
    cabangStore.fetchCabang();
  } else {
    alert(result.error || 'Terjadi kesalahan');
  }
}

async function handleDelete(item) {
  if (!confirm(`Yakin ingin menghapus cabang "${item.nama_cabang}"?`)) {
    return;
  }

  const result = await cabangStore.deleteCabang(item.id_cabang);
  if (result.success) {
    alert('Cabang berhasil dihapus!');
    cabangStore.fetchCabang();
  } else {
    alert(result.error || 'Gagal menghapus cabang');
  }
}
</script>
