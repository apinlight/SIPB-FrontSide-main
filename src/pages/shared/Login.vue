<!-- src/pages/shared/Login.vue -->
<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 p-4">
    <div class="w-full max-w-sm rounded-lg bg-white p-6 shadow-md">
  <h2 class="mb-6 text-center text-2xl font-bold text-gray-800">Login to SIMBA</h2>
      
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="login" class="block text-sm font-medium text-gray-700">Username or Email</label>
          <input 
            v-model="credentials.login" 
            id="login"
            type="text" 
            placeholder="e.g., your_username"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" 
            required 
          />
        </div>
        
        <div class="mb-6">
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <input 
            v-model="credentials.password" 
            id="password"
            type="password" 
            placeholder="••••••••"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm" 
            required 
          />
        </div>

        <p v-if="errorMsg" class="mb-4 text-center text-sm text-red-600">{{ errorMsg }}</p>

        <BaseButton 
          type="submit" 
          variant="primary" 
          :loading="loading" 
          fullWidth
        >
          Sign In
        </BaseButton>

      </form>
      <div class="mt-4 text-center text-sm">
        <router-link to="/register" class="font-medium text-green-600 hover:text-green-500">
          Don't have an account? Register
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useUserStore } from '@/stores/userStore'; // ✅ Only import the store
import { logger } from '@/lib/logger';
import BaseButton from '@/components/BaseButton.vue';

// ✅ The router is no longer needed here, as the store handles redirection.
const userStore = useUserStore();
const loading = ref(false);
const errorMsg = ref('');

// ✅ Use a reactive object for the form data for cleaner binding.
const credentials = reactive({
  login: '',
  password: '',
});

// ✅ The onMounted hook is removed. It's not the component's job to clear user state.

/**
 * The login method is now incredibly simple. It delegates all work to the store.
 */
function extractErrorMessage(error) {
  // 1) Prefer detailed validation messages if present (Laravel 422 format)
  const errors = error?.response?.data?.errors;
  if (errors && typeof errors === 'object') {
    const messages = Object.values(errors)
      .flat()
      .filter(Boolean)
      .slice(0, 3); // show up to 3 messages
    if (messages.length) return messages.join('\n');
  }

  // 2) Otherwise, use backend-provided message if it's meaningful
  const backendMsg = error?.response?.data?.message;
  if (backendMsg && typeof backendMsg === 'string') return backendMsg;

  // 3) HTTP status-based fallback
  const status = error?.response?.status;
  if (status === 401) return 'Kredensial salah. Periksa username/email dan password.';
  if (status === 429) return 'Terlalu banyak percobaan. Coba lagi beberapa saat.';
  if (status >= 500) return 'Terjadi kesalahan pada server. Coba lagi nanti.';

  // 4) Generic fallback
  return error?.message || 'Gagal login. Silakan coba lagi.';
}

async function handleLogin() {
  loading.value = true;
  errorMsg.value = '';
  logger.info('Login form submitted', { login: credentials.login });

  try {
    // ✅ This is the ONLY business logic call. The component trusts the store
    // to handle the API call, state changes, and redirection.
    await userStore.login(credentials);
    
    // No router.push() needed here. The store does it.
    // No toast needed here, as the successful redirect provides feedback.

  } catch (error) {
    // The store's login action re-throws the error so we can catch it here.
    // The component's ONLY job is to display the error message.
    errorMsg.value = extractErrorMessage(error);
    logger.error('Login failed in component', { error: errorMsg.value, status: error?.response?.status });
  } finally {
    loading.value = false;
  }
}
</script>