<!-- src/components/pengajuan/RingkasanPengajuan.vue -->
<template>
  <div class="bg-white p-4 rounded-2xl shadow-sm border">
    <h3 class="font-bold text-lg mb-4">Ringkasan Pengajuan</h3>
    <ul class="space-y-2">
      <li v-for="item in ringkasan" :key="item.id_barang" class="flex justify-between">
        <span>{{ item.nama_barang }}</span>
        <span>x{{ item.jumlah }}</span>
      </li>
    </ul>
    <button
      class="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      @click="$emit('submit')"
      :disabled="ringkasan.length === 0"
    >
      Ajukan Pengadaan
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  ringkasan: Array
})
</script>
