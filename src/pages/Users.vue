<script setup>
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import { toast } from 'vue3-toastify';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useUserStore } from '@/stores/userStore';
import { useUserManagementStore } from '@/stores/userManagementStore'; // ✅ Import the new store
import { logger } from '@/lib/logger';
import BaseButton from '@/components/BaseButton.vue'

// --- STORES ---
const userStore = useUserStore();
const userManagementStore = useUserManagementStore();

// ✅ Get state and actions from the stores. `storeToRefs` keeps them reactive.
const { users, pagination, filters, loading, error } = storeToRefs(userManagementStore);
const { fetchUsers, saveUser, deleteUser, applyFilters } = userManagementStore;


// --- LOCAL COMPONENT STATE ---
// This state is purely for the UI of this component and belongs here.
const showForm = ref(false);
const editMode = ref(false);
const form = ref({
  unique_id: '',
  username: '',
  email: '',
  password: '',
  password_confirmation: '',
  branch_name: '',
  role: ''
});

// --- COMPUTED PROPERTIES (Authorization) ---
// These are fine to keep in the component as they are view-specific logic
// based on the currently logged-in user.
const canManageUsers = computed(() => userStore.isAdmin || userStore.isManager);
const canCreateUsers = computed(() => userStore.isAdmin);

const canDeleteUser = (user) => {
  return userStore.isAdmin && user.id !== userStore.user?.id;
};

const canEditUser = (user) => {
  if (userStore.isAdmin) return true;
  if (userStore.isManager) {
    return user.branch_name === userStore.user?.branch_name;
  }
  return user.id === userStore.user?.id;
};

// --- METHODS (Delegating to Store) ---

const handleSubmit = async () => {
  const success = await saveUser(form.value);
  if (success) {
    resetForm();
  }
};

const handleEdit = (user) => {
  if (!canEditUser(user)) {
    toast.error('Anda tidak memiliki akses untuk mengedit user ini');
    return;
  }
  logger.info('Editing user', { userId: user.id, username: user.username });
  form.value = {
    unique_id: user.id,
    username: user.username,
    email: user.email,
    password: '',
    branch_name: user.branch_name,
    role: user.roles?.[0]?.name || ''
  };
  editMode.value = true;
  showForm.value = true;
};

const handleDelete = async (user) => {
  if (!canDeleteUser(user)) {
    toast.error('Anda tidak memiliki akses untuk menghapus user ini');
    return;
  }
  if (confirm(`Yakin ingin menghapus user "${user.username}"?`)) {
    await deleteUser(user);
  }
};

const handleSearch = () => {
    // Let the store handle the logic of resetting the page and fetching.
    applyFilters();
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    fetchUsers(page);
  }
}

const resetForm = () => {
  logger.debug('Resetting user form');
  form.value = {
    unique_id: '', username: '', email: '', password: '', branch_name: '', role: ''
  };
  editMode.value = false;
  showForm.value = false;
};

const getRoleBadgeClass = (roleName) => {
  const roleClasses = {
    'admin': 'bg-red-100 text-red-800',
    'manager': 'bg-blue-100 text-blue-800',
    'user': 'bg-green-100 text-green-800',
  };
  return roleClasses[roleName] || 'bg-gray-100 text-gray-800';
};

// --- LIFECYCLE HOOK ---
onMounted(() => {
  logger.info('Users page mounted');
  if (canManageUsers.value) {
    fetchUsers(1); // ✅ Simple call to the store action
  } else {
    logger.warn('Access denied to users page', { userRoles: userStore.userRoles });
  }
});
</script>

<template>
  <DefaultLayout>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-800">👥 Kelola User</h1>
        <BaseButton
          v-if="canCreateUsers"
          @click="showForm = !showForm; resetForm()"
          variant="primary"
        >
          {{ showForm ? 'Tutup Form' : '+ Tambah User' }}
        </BaseButton>
      </div>

      <div v-if="error" class="p-3 rounded mb-4 bg-red-100 text-red-800 border border-red-200">
        {{ error }}
      </div>

      <div v-if="showForm && canCreateUsers" class="bg-white p-4 sm:p-6 rounded-xl shadow mb-6">
        <h2 class="text-lg font-semibold mb-4">
          {{ editMode ? 'Edit User' : 'Tambah User' }}
        </h2>
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label class="block text-sm font-medium mb-2">Unique ID</label>
              <input
                v-model="form.unique_id"
                type="text"
                class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                placeholder="e.g., USER001"
                :disabled="editMode"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Username</label>
              <input
                v-model="form.username"
                type="text"
                class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan username"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Email</label>
              <input
                v-model="form.email"
                type="email"
                class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan email"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Password</label>
              <input
                v-model="form.password"
                type="password"
                class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan password"
                :required="!editMode"
              />
              <p v-if="editMode" class="text-xs text-gray-500 mt-1">
                Kosongkan jika tidak ingin mengubah password
              </p>
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Nama Cabang</label>
              <input
                v-model="form.branch_name"
                type="text"
                class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan nama cabang"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-2">Role</label>
              <select
                v-model="form.role"
                class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">-- Pilih Role --</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-2 mt-4">
            <BaseButton type="submit" variant="primary" :disabled="loading" :loading="loading" fullWidth>
              {{ editMode ? 'Update' : 'Simpan' }}
            </BaseButton>
            <BaseButton type="button" variant="secondary" @click="resetForm" fullWidth>
              Batal
            </BaseButton>
          </div>
        </form>
      </div>

      <div class="bg-white p-4 rounded-xl shadow mb-6">
        <div class="flex flex-col sm:flex-row gap-3">
          <input
            v-model="filters.search"
            @input="handleSearch"
            type="text"
            placeholder="Cari username atau email..."
            class="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            v-model="filters.role"
            @change="handleSearch"
            class="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="loading && users.length === 0" class="p-8 text-center text-gray-500">
          Memuat data...
        </div>
        <div v-else-if="users.length === 0" class="p-8 text-center text-gray-500">
          Tidak ada data user ditemukan
        </div>
        <!-- Desktop Table -->
        <table v-else class="w-full hidden md:table">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Cabang</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.username }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.email }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.branch_name }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  v-if="user.roles && user.roles.length > 0"
                  :class="getRoleBadgeClass(user.roles[0]?.name || user.role || 'user')"
                  class="px-2 py-1 text-xs font-medium rounded-full"
                >
                  {{ user.roles[0]?.name || user.role || 'user' }}
                </span>
                <span v-else class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                  No Role
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                <BaseButton v-if="canEditUser(user)" size="sm" variant="secondary" @click="handleEdit(user)">Edit</BaseButton>
                <BaseButton v-if="canDeleteUser(user)" size="sm" variant="danger" @click="handleDelete(user)">Hapus</BaseButton>
                <span v-if="!canEditUser(user) && !canDeleteUser(user)" class="text-gray-400">No Access</span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Mobile Cards -->
        <div class="md:hidden divide-y">
          <div v-for="user in users" :key="user.id" class="p-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold text-gray-900">{{ user.username }}</h3>
                <p class="text-xs text-gray-500">{{ user.email }}</p>
                <p class="text-xs text-gray-500">Cabang: {{ user.branch_name }}</p>
              </div>
              <span
                v-if="user.roles && user.roles.length > 0"
                :class="getRoleBadgeClass(user.roles[0]?.name || user.role || 'user')"
                class="px-2 py-1 text-xs font-medium rounded-full"
              >
                {{ user.roles[0]?.name || user.role || 'user' }}
              </span>
            </div>
            <div class="flex gap-2 mt-3">
              <BaseButton v-if="canEditUser(user)" size="sm" variant="secondary" fullWidth @click="handleEdit(user)">Edit</BaseButton>
              <BaseButton v-if="canDeleteUser(user)" size="sm" variant="danger" fullWidth @click="handleDelete(user)">Hapus</BaseButton>
            </div>
          </div>
        </div>
        
        <div v-if="pagination.last_page > 1" class="bg-gray-50 px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3 sm:gap-0 sm:justify-between sm:items-center">
          <div class="text-sm text-gray-700">
            Menampilkan {{ pagination.from }} - {{ pagination.to }} dari {{ pagination.total }} data
          </div>
          <div class="flex items-center gap-2">
            <BaseButton size="sm" variant="secondary" @click="changePage(pagination.current_page - 1)" :disabled="pagination.current_page === 1">Sebelumnya</BaseButton>
            <span class="px-2 py-1 text-sm">{{ pagination.current_page }} / {{ pagination.last_page }}</span>
            <BaseButton size="sm" variant="secondary" @click="changePage(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page">Berikutnya</BaseButton>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>