<template>
  <div class="border p-4 sm:p-6 bg-white rounded-xl shadow mb-4">
    <h2 class="text-lg font-semibold mb-4 text-gray-800">{{ editData ? 'Edit Barang' : 'Tambah Barang' }}</h2>
    <form @submit.prevent="$emit('save', form)" class="space-y-4">
      <div v-if="!editData">
        <label class="block text-sm font-medium text-gray-700 mb-1">Kode Barang (ID)</label>
        <input
          v-model="form.id_barang"
          type="text"
          class="border border-gray-300 rounded-lg w-full px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Masukkan kode barang unik (contoh: BRG-001)"
          required
        />
        <small class="text-gray-500">Harus unik. Digunakan sebagai ID barang.</small>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Barang</label>
        <select v-model="form.id_jenis_barang" class="border border-gray-300 rounded-lg w-full px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent" required>
          <option value="" disabled>Pilih jenis barang</option>
          <option v-for="jenis in jenisBarangList" :key="jenis.id_jenis_barang" :value="jenis.id_jenis_barang">
            {{ jenis.nama_jenis_barang }}
          </option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
        <input v-model="form.nama_barang" type="text" class="border border-gray-300 rounded-lg w-full px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Harga Barang</label>
        <input v-model.number="form.harga_barang" type="number" min="0" class="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" required />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Satuan (opsional)</label>
        <input v-model="form.satuan" type="text" class="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="contoh: pcs, box" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Deskripsi (opsional)</label>
        <textarea v-model="form.deskripsi" class="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" rows="2" placeholder="Deskripsi singkat barang"></textarea>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Batas Minimum (opsional)</label>
        <input v-model.number="form.batas_minimum" type="number" min="0" class="w-full border border-gray-300 px-3 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent" placeholder="Default: 5" />
      </div>
      <div class="flex flex-col sm:flex-row gap-3 pt-2">
        <BaseButton type="submit" variant="primary" fullWidth>{{ editData ? 'Update' : 'Simpan' }}</BaseButton>
        <BaseButton @click="$emit('close')" type="button" variant="secondary" fullWidth>Batal</BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import BaseButton from './BaseButton.vue';

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
        satuan: val.satuan || '',
        deskripsi: val.deskripsi || '',
        batas_minimum: val.batas_minimum ?? 5,
    };
  } else {
    // Creating: reset to default
    form.value = { id_barang: '', id_jenis_barang: '', nama_barang: '', harga_barang: 0, satuan: '', deskripsi: '', batas_minimum: 5 };
  }
}, { immediate: true, deep: true });
</script>