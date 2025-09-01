<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="text-center">
      <div class="text-9xl font-bold text-gray-300 mb-4">404</div>
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Halaman Tidak Ditemukan</h1>
      <p class="text-gray-600 mb-8">Maaf, halaman yang Anda cari tidak dapat ditemukan.</p>
      <div class="space-x-4">
        <BaseButton @click="$router.go(-1)" variant="outline">
          ← Kembali
        </BaseButton>
        <BaseButton @click="$router.push('/dashboard')" variant="primary">
          🏠 Dashboard
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/BaseButton.vue'
</script>
