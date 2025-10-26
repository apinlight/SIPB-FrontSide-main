<template>
  <DefaultLayout>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">⚠️ Kelola Batas Barang</h1>
        <BaseButton @click="openForm()" variant="primary">
          + Set Batas Barang
        </BaseButton>
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