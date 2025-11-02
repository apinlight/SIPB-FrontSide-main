<template>
  <!-- Lightweight app-shell-first: render a tiny placeholder while route chunks load -->
  <router-view v-slot="{ Component }">
    <Suspense>
      <component :is="Component" />
      <template #fallback>
        <div class="min-h-screen bg-gray-100">
          <div class="pt-16 p-6 max-w-7xl mx-auto">
            <div class="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
            <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="h-24 bg-white rounded-xl shadow animate-pulse"></div>
              <div class="h-24 bg-white rounded-xl shadow animate-pulse"></div>
            </div>
          </div>
        </div>
      </template>
    </Suspense>
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';

// Get the user store instance
const userStore = useUserStore();

// When the application component is first mounted,
// check if there's an existing token and validate it with the server.
onMounted(() => {
  userStore.checkAuth();
});
</script>