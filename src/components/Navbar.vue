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
          <span class="hidden xs:inline">SIMBA</span>
          <span class="inline xs:hidden">📦</span>
        </h1>
      </div>

      <!-- Right section: User info + Logout -->
      <div class="flex items-center gap-2 sm:gap-4">
        <!-- User greeting - hide branch on small screens -->
        <div class="hidden sm:flex flex-col items-end text-sm">
          <span class="font-medium text-gray-800">{{ userStore.user?.username }}</span>
          <span class="text-xs text-gray-500">{{ userStore.user?.branch_name }}</span>
        </div>
        <!-- Mobile: show only username -->
        <span class="sm:hidden text-sm font-medium text-gray-800 max-w-[100px] truncate">
          {{ userStore.user?.username }}
        </span>
        
        <!-- Logout button - icon on mobile, text on desktop -->
        <button 
          @click="userStore.logout()" 
          class="bg-red-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-red-700 active:bg-red-800 transition-colors shadow-sm flex items-center gap-2 touch-manipulation min-h-[44px]"
          aria-label="Logout"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden sm:inline font-medium">Logout</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useUserStore } from '@/stores/userStore';

// The Navbar's only job is to use the store. No router or API needed here.
const userStore = useUserStore();
</script>