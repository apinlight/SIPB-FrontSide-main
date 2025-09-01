<template>
  <router-view />
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