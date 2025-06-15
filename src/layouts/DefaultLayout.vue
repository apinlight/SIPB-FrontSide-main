<template>
  <div class="min-h-screen bg-gray-100 text-gray-800">
    <!-- Loading Overlay -->
    <div
      v-if="isLoading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
    >
      <div class="bg-white px-6 py-4 rounded shadow text-lg font-semibold flex items-center gap-2">
        <svg class="animate-spin h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        Loading page...
      </div>
    </div>
    
    <!-- Sticky Navbar at the very top -->
    <Navbar class="fixed top-0 left-0 right-0 z-30" 
      @toggle-sidebar="sidebarOpen = !sidebarOpen"
    />

    <!-- Sidebar overlay and backdrop for mobile/tablet -->
    <transition name="fade">
      <div
        v-if="sidebarOpen"
        class="fixed inset-0 z-20 bg-black bg-opacity-40"
        @click="sidebarOpen = false"
      ></div>
    </transition>
    <transition name="slide">
      <Sidebar
        v-if="sidebarOpen"
        class="fixed top-0 left-0 h-full z-30"
        @close="sidebarOpen = false"
      />
    </transition>

    <!-- Main content area, with left sidebar for desktop -->
    <div class="flex pt-16 min-h-screen">
      <!-- Sidebar always visible on desktop -->
      <Sidebar class="hidden md:block h-[calc(100vh-4rem)] sticky top-16" />
      <main class="flex-1 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar.vue'  
import Navbar from '@/components/Navbar.vue'

const sidebarOpen = ref(false)

// ✅ FIX: Simple loading state to avoid Pinia timing issues
const isLoading = ref(false)
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.slide-enter-active, .slide-leave-active {
  transition: transform 0.2s;
}
.slide-enter-from, .slide-leave-to {
  transform: translateX(-100%);
}
</style>
