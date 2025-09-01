<template>
  <DefaultLayout>
    <div class="p-6 max-w-4xl mx-auto">
      <h1 class="text-2xl font-bold mb-6">🛠️ Pengadaan Manual oleh Admin</h1>

      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold mb-4">Tambah Pengadaan Manual</h2>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 font-semibold">Pilih User/Cabang</label>
              <select v-model="form.unique_id" class="w-full p-2 border rounded" required>
                <option disabled value="">-- Pilih User --</option>
                <option v-for="user in formDependencies.users" :key="user.unique_id" :value="user.unique_id">
                  {{ user.username }} - {{ user.branch_name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block mb-1 font-semibold">Pilih Barang</label>
              <select v-model="form.id_barang" class="w-full p-2 border rounded" required>
                <option disabled value="">-- Pilih Barang --</option>
                <option v-for="barang in formDependencies.barang" :key="barang.id_barang" :value="barang.id_barang">
                  {{ barang.nama_barang }} - Rp {{ formatCurrency(barang.harga_barang) }}
                </option>
              </select>
            </div>
            <div>
              <label class="block mb-1 font-semibold">Jumlah Barang</label>
              <input type="number" v-model.number="form.jumlah" class="w-full p-2 border rounded" min="1" required />
            </div>
            <div>
              <label class="block mb-1 font-semibold">Keterangan (Opsional)</label>
              <input type="text" v-model="form.keterangan" class="w-full p-2 border rounded" placeholder="Keterangan pengadaan manual..." />
            </div>
          </div>
          <div class="flex gap-3">
            <button type="submit" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700" :disabled="submitting">
              {{ submitting ? 'Memproses...' : 'Tambah Pengadaan' }}
            </button>
            <button type="button" @click="resetForm" class="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
              Reset
            </button>
          </div>
        </form>
      </div>

      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b">
          <h2 class="text-lg font-semibold">Riwayat Pengadaan Manual</h2>
          </div>
        <div class="p-6">
          <div v-if="loadingRiwayat" class="text-center py-10 text-gray-500">
            Memuat riwayat...
          </div>
          <div v-else-if="riwayatList.length === 0" class="text-center py-10 text-gray-500">
            Belum ada riwayat pengadaan manual.
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full table-auto border-collapse border">
              <thead class="bg-gray-50">
                <tr>
                  <th class="border px-4 py-3 text-left">Tanggal</th>
                  <th class="border px-4 py-3 text-left">User/Cabang</th>
                  <th class="border px-4 py-3 text-left">Barang</th>
                  <th class="border px-4 py-3 text-center">Jumlah</th>
                  <th class="border px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in riwayatList" :key="item.id" class="border-b hover:bg-gray-50">
                  <td class="border px-4 py-3">{{ formatDate(item.created_at) }}</td>
                  <td class="border px-4 py-3">
                    {{ item.user?.username }}<br>
                    <span class="text-sm text-gray-500">{{ item.user?.branch_name }}</span>
                  </td>
                  <td class="border px-4 py-3">
                    {{ item.barang?.nama_barang }}
                  </td>
                  <td class="border px-4 py-3 text-center">{{ item.jumlah_barang }}</td>
                  <td class="border px-4 py-3 text-center">
                    <button @click="handleDelete(item)" class="text-red-600 hover:text-red-800 text-sm">
                      Hapus
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="pagination.last_page > 1" class="flex justify-center gap-2 mt-6">
              </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { usePengadaanAdminStore } from '@/stores/pengadaanAdminStore';
import DefaultLayout from '@/layouts/DefaultLayout.vue';

const store = usePengadaanAdminStore();
const {
  itemList: riwayatList,
  pagination,
  loading: loadingRiwayat,
  processing: submitting,
  formDependencies,
} = storeToRefs(store);

const form = ref({ unique_id: '', id_barang: '', jumlah: 1, keterangan: '' });

onMounted(() => {
  store.fetchFormDependencies();
  store.fetchItems({ endpoint: '/gudang' }); // Assuming this endpoint gets the manual history
});

const submitForm = async () => {
  const success = await store.createManualPengadaan(form.value);
  if (success) {
    resetForm();
  }
};

const handleDelete = (item) => {
    if(confirm(`Hapus riwayat pengadaan ${item.barang?.nama_barang}? Ini tidak bisa dibatalkan.`)){
        store.deleteManualRiwayat(item);
    }
}

const resetForm = () => {
  form.value = { unique_id: '', id_barang: '', jumlah: 1, keterangan: '' };
};

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const formatCurrency = (amount) => new Intl.NumberFormat('id-ID').format(amount || 0);
</script>