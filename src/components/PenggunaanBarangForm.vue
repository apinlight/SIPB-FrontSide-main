<template>
  <div class="bg-white p-6 rounded-xl shadow">
    <h2 class="text-lg font-semibold text-gray-800 mb-4">
      {{ isEdit ? 'Edit Penggunaan Barang' : 'Tambah Penggunaan Barang' }}
    </h2>
    <form @submit.prevent="handleSubmit" class="space-y-4">
        <select v-model="form.id_barang" required :disabled="isEdit">
            <option value="">-- Pilih Barang --</option>
            <option v-for="item in availableStock" :key="item.id_barang" :value="item.id_barang" :disabled="item.jumlah_tersedia === 0">
                {{ item.nama_barang }} (Stok: {{ item.jumlah_tersedia }})
            </option>
        </select>
        <div class="flex gap-3 pt-4">
            <BaseButton type="submit" variant="primary" :disabled="!isFormValid || store.isLoading">
                {{ store.isLoading ? 'Menyimpan...' : (isEdit ? 'Update' : 'Simpan') }}
            </BaseButton>
            <BaseButton type="button" variant="secondary" @click="$emit('cancel')">
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
  return form.value.id_barang && 
         form.value.jumlah_digunakan > 0 && 
         form.value.keperluan?.trim() && 
         (!selectedStock.value || form.value.jumlah_digunakan <= selectedStock.value.jumlah_tersedia);
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