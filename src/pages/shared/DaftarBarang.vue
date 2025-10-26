<template>
  <DefaultLayout>
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-2xl font-bold text-gray-800">📦 Daftar Barang</h1>
        <BaseButton v-if="userStore.isAdmin" @click="toggleForm" variant="primary">
          {{ showForm ? 'Tutup Form' : '+ Tambah Barang' }}
        </BaseButton>
      </div>

      <BarangForm
        v-if="showForm && userStore.isAdmin"
        :edit-data="editItem"
        :jenis-barang-list="jenisBarangStore.itemList"
        @close="resetForm"
        @save="handleSave"
      />
      <BarangTable 
        :items="barangStore.itemList"
        :loading="barangStore.loading"
        :pagination="barangStore.pagination"
        :can-edit="userStore.isAdmin"
        @edit="handleEdit" 
        @delete="handleDelete"
        @change-page="handleChangePage"
        @search="handleSearch"
      />
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useBarangStore } from '@/stores/barangStore';
import { useJenisBarangStore } from '@/stores/jenisBarangStore'; // Also need this for the form
import BarangForm from '@/components/BarangForm.vue';
import BarangTable from '@/components/BarangTable.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import BaseButton from '@/components/BaseButton.vue';

const userStore = useUserStore();
const barangStore = useBarangStore();
const jenisBarangStore = useJenisBarangStore();

const showForm = ref(false);
const editItem = ref(null);

onMounted(() => {
  barangStore.fetchItems();
  jenisBarangStore.fetchItems(); // Fetch categories for the form dropdown
});

const toggleForm = () => {
  editItem.value = null;
  showForm.value = !showForm.value;
};

const resetForm = () => {
  showForm.value = false;
  editItem.value = null;
};

const handleEdit = (item) => {
  editItem.value = item;
  showForm.value = true;
};

const handleSave = async (formData) => {
    const success = await barangStore.saveItem(formData);
    if(success) {
        resetForm();
    }
}

const handleDelete = (item) => {
    if(confirm(`Yakin ingin menghapus barang "${item.nama_barang}"?`)){
        barangStore.deleteItem(item.id_barang);
    }
}

const handleChangePage = (page) => {
    barangStore.fetchItems(page);
}

const handleSearch = (query) => {
    barangStore.fetchItems(1, query);
}
</script>