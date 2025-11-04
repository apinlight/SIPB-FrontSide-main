<template>
  <!-- ✅ FIX: Removed Suspense to avoid experimental API warnings -->
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :is="Component" />
    </transition>
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

<style scoped>
/* Smooth page transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>