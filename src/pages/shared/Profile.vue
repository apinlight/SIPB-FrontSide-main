<template>
  <div class="p-4 sm:p-6 max-w-4xl mx-auto">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Profil Saya</h1>
          <p class="text-sm text-gray-600 mt-1">Kelola informasi profil dan keamanan akun Anda</p>
        </div>
        <BaseButton variant="secondary" @click="router.back()">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </BaseButton>
      </div>
    </div>

    <!-- Profile Card -->
    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <!-- Profile Header -->
      <div class="bg-gradient-to-r from-green-600 to-green-700 px-6 py-8 text-white">
        <div class="flex items-center gap-4">
          <!-- Avatar -->
          <div class="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-3xl font-bold">
            {{ userInitial }}
          </div>
          <!-- Info -->
          <div>
            <h2 class="text-2xl font-bold">{{ userStore.user?.username }}</h2>
            <p class="text-green-100">{{ userStore.user?.email }}</p>
            <span class="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-white bg-opacity-20">
              {{ userRole }}
            </span>
          </div>
        </div>
      </div>

      <!-- Form Section -->
      <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
        <!-- Personal Information -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Informasi Pribadi
          </h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Username -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Username <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.username"
                type="text"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Username Anda"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>

            <!-- Cabang (read-only) -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Cabang
              </label>
              <input
                :value="userStore.user?.cabang?.nama_cabang || '-'"
                type="text"
                disabled
                class="w-full border border-gray-200 bg-gray-50 text-gray-600 rounded-lg px-4 py-2"
              />
            </div>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-200"></div>

        <!-- Password Section -->
        <div>
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg class="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Ubah Password
          </h3>
          
          <p class="text-sm text-gray-600 mb-4">Kosongkan jika tidak ingin mengubah password</p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- New Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Password Baru
              </label>
              <input
                v-model="form.password"
                type="password"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Minimal 6 karakter"
                minlength="6"
              />
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Konfirmasi Password
              </label>
              <input
                v-model="form.password_confirmation"
                type="password"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ulangi password baru"
                :disabled="!form.password"
              />
            </div>
          </div>

          <!-- Password validation message -->
          <p v-if="passwordMismatch" class="text-sm text-red-600 mt-2">
            Password dan konfirmasi tidak cocok
          </p>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-200"></div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3 justify-end">
          <BaseButton
            type="button"
            variant="secondary"
            @click="resetForm"
            :disabled="loading"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </BaseButton>
          
          <BaseButton
            type="submit"
            variant="primary"
            :disabled="loading || !isFormValid"
          >
            <svg v-if="!loading" class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <svg v-else class="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </BaseButton>
        </div>
      </form>
    </div>

    <!-- Info Box -->
    <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start">
        <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div class="text-sm text-blue-800">
          <p class="font-medium mb-1">Informasi Keamanan</p>
          <ul class="list-disc list-inside space-y-1 text-blue-700">
            <li>Role dan status akun hanya dapat diubah oleh administrator</li>
            <li>Password baru minimal 6 karakter</li>
            <li>Setelah menyimpan, Anda tetap login dengan session yang sama</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import BaseButton from '@/components/BaseButton.vue';
import { toast } from 'vue3-toastify';
import { logger } from '@/lib/logger';

const router = useRouter();

const userStore = useUserStore();
const loading = ref(false);

const form = ref({
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
});

const userInitial = computed(() => {
  return userStore.user?.username?.charAt(0).toUpperCase() || 'U';
});

const userRole = computed(() => {
  const roles = userStore.userRoles || [];
  if (roles.includes('admin')) return 'Administrator';
  if (roles.includes('manager')) return 'Manager';
  return 'User';
});

const passwordMismatch = computed(() => {
  return form.value.password && form.value.password !== form.value.password_confirmation;
});

const isFormValid = computed(() => {
  const hasBasicInfo = form.value.username && form.value.email;
  const passwordValid = !form.value.password || (form.value.password === form.value.password_confirmation && form.value.password.length >= 6);
  return hasBasicInfo && passwordValid;
});

const loadUserData = () => {
  if (userStore.user) {
    form.value.username = userStore.user.username || '';
    form.value.email = userStore.user.email || '';
    form.value.password = '';
    form.value.password_confirmation = '';
  }
};

const resetForm = () => {
  loadUserData();
  toast.info('Form direset ke data awal');
};

const handleSubmit = async () => {
  if (!isFormValid.value) {
    toast.error('Mohon lengkapi form dengan benar');
    return;
  }

  loading.value = true;
  logger.info('Submitting profile update', { username: form.value.username });

  try {
    // Build payload - only send fields that are set
    const payload = {
      username: form.value.username,
      email: form.value.email,
    };

    // Only include password if user wants to change it
    if (form.value.password) {
      payload.password = form.value.password;
      payload.password_confirmation = form.value.password_confirmation;
    }

    const result = await userStore.updateProfile(payload);

    if (result.success) {
      toast.success('Profil berhasil diperbarui');
      // Clear password fields after successful update
      form.value.password = '';
      form.value.password_confirmation = '';
      
      // Redirect to dashboard after successful update
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } else {
      toast.error(result.error || 'Gagal memperbarui profil');
    }
  } catch (error) {
    logger.error('Profile update error:', error);
    toast.error('Terjadi kesalahan saat memperbarui profil');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadUserData();
});
</script>
