<template>
  <nav class="bg-white shadow-md">
    <div class="px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
      <!-- Left section: Menu + Brand -->
      <div class="flex items-center gap-2 sm:gap-3">
        <button 
          class="md:hidden p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors active:bg-gray-200 touch-manipulation" 
          @click="$emit('toggle-sidebar')" 
          aria-label="Open sidebar"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 class="text-xl sm:text-2xl font-bold text-green-700">
          <span class="inline xs:inline">SIMBA </span>
          <span class="inline xs:hidden">- Sistem Informasi Manajemen Barang 📦</span>
        </h1>
      </div>

      <!-- Right section: User Dropdown -->
      <UserDropdown />
    </div>
  </nav>
</template>

<script setup>
import UserDropdown from '@/components/UserDropdown.vue';
</script>