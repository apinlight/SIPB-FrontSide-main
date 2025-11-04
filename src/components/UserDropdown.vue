<template>
  <div class="relative">
    <!-- User Avatar Button -->
    <button
      @click="toggleDropdown"
      class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation min-h-[44px]"
      aria-label="User menu"
    >
      <!-- User Icon -->
      <div class="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold text-sm">
        {{ userInitial }}
      </div>
      
      <!-- Username (hide on mobile) -->
      <div class="hidden sm:flex flex-col items-start text-sm">
        <span class="font-medium text-gray-800">{{ userStore.user?.username }}</span>
        <span class="text-xs text-gray-500">{{ userStore.user?.branch_name }}</span>
      </div>

      <!-- Chevron icon -->
      <svg 
        class="w-4 h-4 text-gray-500 transition-transform" 
        :class="{ 'rotate-180': isOpen }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
      >
        <div class="py-1">
          <!-- Profile Info Header (mobile only) -->
          <div class="sm:hidden px-4 py-3 border-b">
            <p class="text-sm font-medium text-gray-900">{{ userStore.user?.username }}</p>
            <p class="text-xs text-gray-500 truncate">{{ userStore.user?.email }}</p>
            <span class="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
              {{ userRole }}
            </span>
          </div>

          <!-- Profile Link -->
          <router-link
            to="/profile"
            @click="closeDropdown"
            class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg class="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profil Saya
          </router-link>

          <!-- Divider -->
          <div class="border-t border-gray-100"></div>

          <!-- Logout Button -->
          <button
            @click="handleLogout"
            class="w-full flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
          >
            <svg class="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </transition>

    <!-- Invisible overlay to close dropdown when clicking outside -->
    <div
      v-if="isOpen"
      @click="closeDropdown"
      class="fixed inset-0 z-40"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();
const isOpen = ref(false);

const userInitial = computed(() => {
  return userStore.user?.username?.charAt(0).toUpperCase() || 'U';
});

const userRole = computed(() => {
  const roles = userStore.userRoles || [];
  if (roles.includes('admin')) return 'Admin';
  if (roles.includes('manager')) return 'Manager';
  return 'User';
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
  isOpen.value = false;
};

const handleLogout = () => {
  closeDropdown();
  userStore.logout();
};
</script>
