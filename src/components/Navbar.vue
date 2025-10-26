<template>
  <nav class="bg-white shadow px-6 py-4 flex justify-between items-center">
    <div class="flex items-center gap-2">
      <button class="md:hidden mr-2 text-2xl" @click="$emit('toggle-sidebar')" aria-label="Open sidebar">
        &#9776;
      </button>
      <h1 class="text-2xl font-semibold text-gray-800 items-center">SIMBA</h1>
    </div>
    <div class="flex items-center gap-4">
      <span class="text-gray-600">
        Halo, {{ userStore.user?.username }} ({{ userStore.user?.branch_name }})
      </span>
      <button @click="userStore.logout()" class="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700">
        Logout
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore';

// The Navbar's only job is to use the store. No router or API needed here.
const userStore = useUserStore();
</script>