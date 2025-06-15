<!-- src/components/pengajuan/PilihBarangCard.vue -->
<template>
  <div class="border rounded-2xl p-4 shadow-sm flex justify-between items-center">
    <div>
      <h2 class="font-semibold text-lg">{{ barang.nama_barang }}</h2>
      <p class="text-sm text-gray-500">Harga: Rp {{ barang.harga_barang.toLocaleString() }}</p>
    </div>
    <div class="flex items-center gap-2">
      <input type="number" min="0" class="w-20 rounded border px-2 py-1"
             v-model.number="jumlah" @change="updateJumlah" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  barang: Object,
  jumlahDipilih: Number,
})
const emit = defineEmits(['update'])

const jumlah = ref(props.jumlahDipilih || 0)

watch(() => props.jumlahDipilih, (val) => {
  jumlah.value = val
})

function updateJumlah() {
  emit('update', { id_barang: props.barang.id_barang, jumlah: jumlah.value })
}
</script>
