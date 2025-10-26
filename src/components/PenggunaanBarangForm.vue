<template>
  <div class="bg-white p-4 sm:p-6 rounded-xl shadow">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">
      {{ isEdit ? 'Edit Penggunaan Barang' : 'Tambah Penggunaan Barang' }}
    </h2>
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Barang selector -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Barang</label>
        <select 
          v-model="form.id_barang" 
          required 
          :disabled="isEdit"
          class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">-- Pilih Barang --</option>
          <option v-for="item in availableStock" :key="item.id_barang" :value="item.id_barang" :disabled="item.jumlah_tersedia === 0">
            {{ item.nama_barang }} (Stok: {{ item.jumlah_tersedia }})
          </option>
        </select>
      </div>

      <!-- Tanggal penggunaan -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Penggunaan</label>
        <input 
          v-model="form.tanggal_penggunaan"
          type="date"
          class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        />
      </div>

      <!-- Jumlah digunakan -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Jumlah Digunakan</label>
        <input 
          v-model.number="form.jumlah_digunakan"
          type="number" min="1"
          class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Masukkan jumlah"
          required
        />
        <p v-if="selectedStock" class="text-xs text-gray-500 mt-1">Stok tersedia: {{ selectedStock.jumlah_tersedia }}</p>
      </div>

      <!-- Keperluan -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Keperluan</label>
        <textarea 
          v-model="form.keperluan"
          rows="2"
          class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Tuliskan keperluan penggunaan"
          required
        />
      </div>

      <!-- Keterangan (opsional) -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Keterangan (opsional)</label>
        <input 
          v-model="form.keterangan"
          type="text"
          class="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          placeholder="Tambahan informasi jika ada"
        />
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 pt-2">
        <BaseButton type="submit" variant="primary" :disabled="!isFormValid || store.loading" :loading="store.loading" fullWidth>
          {{ isEdit ? 'Update' : 'Simpan' }}
        </BaseButton>
        <BaseButton type="button" variant="secondary" @click="$emit('cancel')" fullWidth>
          Batal
        </BaseButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { usePenggunaanBarangStore } from '@/stores/penggunaanBarangStore';
import BaseButton from '@/components/BaseButton.vue';

const props = defineProps({
  penggunaan: { type: Object, default: null },
  // The form now receives its dependencies as props
  availableStock: { type: Array, required: true },
});

const emit = defineEmits(['saved', 'cancel']);

const store = usePenggunaanBarangStore();

const form = ref({});

const isEdit = computed(() => !!props.penggunaan?.id_penggunaan);

// Watch the prop to reset the form for editing or creating
watch(() => props.penggunaan, (newData) => {
  if (newData) {
    form.value = { ...newData };
  } else {
    form.value = {
      id_barang: '',
      jumlah_digunakan: 1,
      keperluan: '',
      tanggal_penggunaan: new Date().toISOString().split('T')[0],
      keterangan: '',
    };
  }
}, { immediate: true, deep: true });

const selectedStock = computed(() => {
  if (!form.value.id_barang) return null;
  return props.availableStock.find(item => item.id_barang === form.value.id_barang);
});

const isFormValid = computed(() => {
  return !!form.value.id_barang && 
         Number(form.value.jumlah_digunakan) > 0 && 
         !!form.value.keperluan?.trim() && 
         (!selectedStock.value || Number(form.value.jumlah_digunakan) <= Number(selectedStock.value.jumlah_tersedia));
});

const handleSubmit = async () => {
  if (!isFormValid.value) return;
  
  // Use the unified save action for both create and edit
  const success = await store.savePenggunaan(form.value);
  if (success) {
    emit('saved');
  }
};
</script>