<template>
  <DefaultLayout>
    <div class="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div class="bg-white p-6 rounded-xl shadow">
        <h1 class="text-2xl font-bold text-gray-800">🛠️ Pengadaan Manual oleh Admin</h1>
        <p class="text-gray-600 mt-1">Tambahkan pengadaan langsung untuk user/cabang tertentu</p>
      </div>

      <div class="bg-white rounded-xl shadow p-6">
        <h2 class="text-lg font-semibold mb-4">Tambah Pengadaan Manual</h2>
        <form @submit.prevent="submitForm" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block mb-1 font-semibold">Pilih Cabang</label>
              <select v-model="form.id_cabang" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                <option disabled value="">-- Pilih Cabang --</option>
                <option v-for="cabang in formDependencies.cabang" :key="cabang.id_cabang" :value="cabang.id_cabang">
                  {{ cabang.nama_cabang }}
                </option>
              </select>
            </div>
            <div>
              <label class="block mb-1 font-semibold">Pilih Barang</label>
              <select v-model="form.id_barang" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                <option disabled value="">-- Pilih Barang --</option>
                <option v-for="barang in formDependencies.barang" :key="barang.id_barang" :value="barang.id_barang">
                  {{ barang.nama_barang }} - Rp {{ formatCurrency(barang.harga_barang) }}
                </option>
              </select>
            </div>
            <div>
              <label class="block mb-1 font-semibold">Jumlah Barang</label>
              <input type="number" v-model.number="form.jumlah" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" min="1" required />
            </div>
            <div>
              <label class="block mb-1 font-semibold">Keterangan (Opsional)</label>
              <input type="text" v-model="form.keterangan" class="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Keterangan pengadaan manual..." />
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-2">
            <BaseButton type="submit" variant="primary" :disabled="submitting" :loading="submitting" fullWidth>
              Tambah Pengadaan
            </BaseButton>
            <BaseButton type="button" variant="secondary" @click="resetForm" fullWidth>
              Reset
            </BaseButton>
          </div>
        </form>
      </div>

      <div class="bg-white rounded-xl shadow">
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
          <div v-else class="overflow-x-auto hidden md:block">
            <table class="w-full table-auto border-collapse border">
              <thead class="bg-gray-50">
                <tr>
                  <th class="border px-4 py-3 text-left">Tanggal</th>
                  <th class="border px-4 py-3 text-left">Cabang</th>
                  <th class="border px-4 py-3 text-left">Barang</th>
                  <th class="border px-4 py-3 text-center">Jumlah</th>
                  <th class="border px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in riwayatList" :key="item.id || (item.id_cabang + '-' + item.id_barang + '-' + item.created_at)" class="border-b hover:bg-gray-50">
                  <td class="border px-4 py-3">{{ formatDate(item.created_at) }}</td>
                  <td class="border px-4 py-3">
                    {{ item.cabang?.nama_cabang || '-' }}<br>
                    <span class="text-sm text-gray-500">{{ item.barang?.jenis?.nama_jenis || 'Barang' }}</span>
                  </td>
                  <td class="border px-4 py-3">
                    {{ item.barang?.nama_barang }}
                  </td>
                  <td class="border px-4 py-3 text-center">{{ item.jumlah_barang }}</td>
                  <td class="border px-4 py-3 text-center">
                    <BaseButton size="sm" variant="danger" @click="handleDelete(item)">Hapus</BaseButton>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- Mobile Cards -->
          <div class="md:hidden divide-y">
            <div v-for="item in riwayatList" :key="item.id || (item.id_cabang + '-' + item.id_barang + '-' + item.created_at)" class="p-4">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-semibold text-gray-900">{{ item.barang?.nama_barang }}</h3>
                  <p class="text-xs text-gray-500">{{ formatDate(item.created_at) }}</p>
                  <p class="text-xs text-gray-500">Cabang: {{ item.cabang?.nama_cabang || '-' }}</p>
                </div>
              </div>
              <div class="flex items-center justify-between mt-2">
                <span class="text-sm">Jumlah: {{ item.jumlah_barang }}</span>
                <BaseButton size="sm" variant="danger" @click="handleDelete(item)">Hapus</BaseButton>
              </div>
            </div>
          </div>
          <div v-if="pagination.last_page > 1" class="bg-white p-4 rounded-xl shadow flex flex-col sm:flex-row gap-3 sm:gap-2 sm:justify-center items-center mt-6">
            <BaseButton size="sm" variant="secondary" @click="prevPage" :disabled="pagination.current_page <= 1">Sebelumnya</BaseButton>
            <span class="px-3 py-1 text-sm">{{ pagination.current_page }} / {{ pagination.last_page }}</span>
            <BaseButton size="sm" variant="secondary" @click="nextPage" :disabled="pagination.current_page >= pagination.last_page">Berikutnya</BaseButton>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { usePengadaanAdminStore } from '@/stores/pengadaanAdminStore';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import BaseButton from '@/components/BaseButton.vue';

const store = usePengadaanAdminStore();
const {
  itemList: riwayatList,
  pagination,
  loading: loadingRiwayat,
  processing: submitting,
  formDependencies,
} = storeToRefs(store);

const form = ref({ id_cabang: '', id_barang: '', jumlah: 1, keterangan: '' });

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
  form.value = { id_cabang: '', id_barang: '', jumlah: 1, keterangan: '' };
};

const prevPage = () => {
  if (pagination.value.current_page > 1) {
    store.fetchItems({ endpoint: '/gudang', page: pagination.value.current_page - 1 });
  }
};

const nextPage = () => {
  if (pagination.value.current_page < pagination.value.last_page) {
    store.fetchItems({ endpoint: '/gudang', page: pagination.value.current_page + 1 });
  }
};

</script>