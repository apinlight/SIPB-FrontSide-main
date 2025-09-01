<template>
  <div class="border p-4 bg-gray-50 rounded mb-4">
    <h2 class="text-lg font-semibold mb-2">{{ editData ? 'Edit Barang' : 'Tambah Barang' }}</h2>
    <form @submit.prevent="$emit('save', form)">
      <div class="mb-2">
        <label class="block">Jenis Barang:</label>
        <select v-model="form.id_jenis_barang" class="border rounded w-full px-3 py-2" required>
          <option value="" disabled>Pilih jenis barang</option>
          <option v-for="jenis in jenisBarangList" :key="jenis.id_jenis_barang" :value="jenis.id_jenis_barang">
            {{ jenis.nama_jenis_barang }}
          </option>
        </select>
      </div>
      <div class="mb-2">
        <label class="block">Nama Barang:</label>
        <input v-model="form.nama_barang" type="text" class="border rounded w-full px-3 py-2" required />
      </div>
      <div class="mb-2">
        <label class="block">Harga Barang:</label>
        <input v-model.number="form.harga_barang" type="number" class="w-full border px-2 py-1 rounded" required />
      </div>
      <div class="flex gap-2 mt-3">
        <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded">{{ editData ? 'Update' : 'Simpan' }}</button>
        <button @click="$emit('close')" type="button" class="text-gray-500 px-4 py-2 rounded hover:bg-gray-200">Batal</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  editData: { type: Object, default: null },
  jenisBarangList: { type: Array, required: true },
});

defineEmits(['close', 'save']);

const form = ref({});

watch(() => props.editData, (val) => {
  if (val) {
    // Editing: populate form with existing data
    form.value = { 
        id_barang: val.id_barang,
        id_jenis_barang: val.id_jenis_barang,
        nama_barang: val.nama_barang,
        harga_barang: val.harga_barang,
    };
  } else {
    // Creating: reset to default
    form.value = { id_jenis_barang: '', nama_barang: '', harga_barang: 0 };
  }
}, { immediate: true, deep: true });
</script>