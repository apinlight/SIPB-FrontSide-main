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
    <BaseButton
      class="mt-4"
      variant="primary"
      @click="$emit('submit')"
      :disabled="ringkasan.length === 0"
      fullWidth
    >
      📋 Ajukan Pengadaan
    </BaseButton>
  </div>
</template>

<script setup>
import BaseButton from '@/components/BaseButton.vue';

const props = defineProps({
  ringkasan: Array
})
</script>
