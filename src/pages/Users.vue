<script setup>
import { ref, onMounted, computed } from 'vue'
import API from '@/lib/api'
import { toast } from 'vue3-toastify'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useUserStore } from '@/stores/userStore'
import { logger } from '@/lib/logger'

const userStore = useUserStore()

// State
const showForm = ref(false)
const editMode = ref(false)
const loading = ref(false)
const userList = ref([])
const search = ref('')
const roleFilter = ref('')
const alert = ref({ message: '', type: 'success' })

const form = ref({
  unique_id: '',
  username: '',
  email: '',
  password: '',
  branch_name: '',
  role: ''
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  from: 0,
  to: 0,
  total: 0
})

// Computed
const alertClass = computed(() =>
  alert.value.type === 'success'
    ? 'bg-green-100 text-green-800 border border-green-200'
    : 'bg-red-100 text-red-800 border border-red-200')

// Check if current user can manage users
const canManageUsers = computed(() => {
  return userStore.hasAnyRole(['admin', 'manager'])
})

const canCreateUsers = computed(() => {
  return userStore.hasRole('admin')
})

const canDeleteUser = (user) => {
  // Only admin can delete, and can't delete themselves
  return userStore.hasRole('admin') && user.id !== userStore.user?.id
}

const canEditUser = (user) => {
  // Admin can edit anyone
  if (userStore.hasRole('admin')) return true 
  
  // Manager can edit users in same branch
  if (userStore.hasRole('manager')) {
    return user.branch_name === userStore.user?.branch_name
  } 
  
  // Users can edit themselves
  return user.id === userStore.user?.id
}

// Methods
const fetchData = async (page = 1) => {
  loading.value = true
  logger.info('Fetching users data', { page, search: search.value, role: roleFilter.value })
  
  try {
    const params = {
      page,
      search: search.value || undefined,
      role: roleFilter.value || undefined
    }
    
    const response = await API.get('/users', { params })
    
    logger.debug('Users API response received', { dataCount: response.data.data?.length })
    
    // Handle different response structures
    if (response.data.data) {
      userList.value = response.data.data
      if (response.data.meta) {
        pagination.value = response.data.meta
      }
    } else if (Array.isArray(response.data)) {
      userList.value = response.data
    }
    
    logger.success('Users data loaded successfully', { count: userList.value.length })
    
  } catch (error) {
    logger.error('Error fetching users:', error.message)
    if (error.response?.status === 403) {
      showAlert('Anda tidak memiliki akses untuk melihat data user', 'error')
    } else {
      showAlert('Gagal memuat data user', 'error')
    }
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  loading.value = true
  logger.info('Submitting user form', { mode: editMode.value ? 'edit' : 'create', username: form.value.username })
  
  try {
    const payload = { ...form.value }
    
    // Remove empty password for edit mode
    if (editMode.value && !payload.password) {
      delete payload.password
    }
    
    if (editMode.value) {
      await API.put(`/users/${form.value.unique_id}`, payload)
      logger.success('User updated successfully', { username: form.value.username })
      showAlert('User berhasil diupdate', 'success')
      toast.success('User berhasil diupdate')
    } else {
      await API.post('/users', payload)
      logger.success('User created successfully', { username: form.value.username })
      showAlert('User berhasil ditambahkan', 'success')
      toast.success('User berhasil ditambahkan')
    }
    
    resetForm()
    fetchData()
  } catch (error) {
    logger.error('Error saving user:', error.message, { username: form.value.username })
    const errorMsg = error.response?.data?.message || 'Gagal menyimpan user'
    showAlert(errorMsg, 'error')
    toast.error(errorMsg)
  } finally {
    loading.value = false
  }
}

const editItem = (user) => {
  if (!canEditUser(user)) {
    logger.warn('Access denied for editing user', { userId: user.id, currentUser: userStore.user?.id })
    showAlert('Anda tidak memiliki akses untuk mengedit user ini', 'error')
    return
  }
  
  logger.info('Editing user', { userId: user.id, username: user.username })
  
  form.value = {
    unique_id: user.id,
    username: user.username,
    email: user.email,
    password: '',
    branch_name: user.branch_name,
    role: user.roles?.[0] || ''
  }
  editMode.value = true
  showForm.value = true
}

const deleteItem = async (user) => {
  if (!canDeleteUser(user)) {
    logger.warn('Access denied for deleting user', { userId: user.id })
    showAlert('Anda tidak memiliki akses untuk menghapus user ini', 'error')
    return
  }
  
  if (confirm(`Yakin ingin menghapus user "${user.username}"?`)) {
    logger.info('Deleting user', { userId: user.id, username: user.username })
    
    try {
      await API.delete(`/users/${user.id}`)
      logger.success('User deleted successfully', { username: user.username })
      showAlert('User berhasil dihapus', 'success')
      toast.success('User berhasil dihapus')
      fetchData()
    } catch (error) {
      logger.error('Error deleting user:', error.message, { username: user.username })
      const errorMsg = error.response?.data?.message || 'Gagal menghapus user'
      showAlert(errorMsg, 'error')
      toast.error(errorMsg)
    }
  }
}

const resetForm = () => {
  logger.debug('Resetting user form')
  form.value = {
    unique_id: '',
    username: '',
    email: '',
    password: '',
    branch_name: '',
    role: ''
  }
  editMode.value = false
  showForm.value = false
}

const handleSearch = () => {
  logger.debug('Searching users', { search: search.value, roleFilter: roleFilter.value })
  pagination.value.current_page = 1
  fetchData()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.last_page) {
    logger.debug('Changing page', { page })
    fetchData(page)
  }
}

const getRoleBadgeClass = (role) => {
  const roleClasses = {
    'admin': 'bg-red-100 text-red-800',
    'manager': 'bg-blue-100 text-blue-800',
    'user': 'bg-green-100 text-green-800'
  }
  return roleClasses[role] || 'bg-gray-100 text-gray-800'
}

const showAlert = (message, type = 'success') => {
  alert.value = { message, type }
  setTimeout(() => {
    alert.value.message = ''
  }, 3000)
}

// Lifecycle
onMounted(() => {
  logger.info('Users page mounted')
  if (canManageUsers.value) {
    fetchData()
  } else {
    logger.warn('Access denied to users page', { userRoles: userStore.userRoles })
    showAlert('Anda tidak memiliki akses untuk melihat halaman ini', 'error')
  }
})
</script>

<template>
  <DefaultLayout>
    <div class="p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">👥 Kelola User</h1>
        <button
          v-if="canCreateUsers"
          @click="showForm = !showForm"
          class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          {{ showForm ? 'Tutup Form' : '+ Tambah User' }}
        </button>
      </div>

      <!-- Alert -->
      <div v-if="alert.message" :class="alertClass" class="p-3 rounded mb-4">
        {{ alert.message }}
      </div>

      <!-- Form - Only show if user can create users -->
      <div v-if="showForm && canCreateUsers" class="bg-white p-4 rounded-lg shadow mb-6">
        <h2 class="text-lg font-semibold mb-4">
          {{ editMode ? 'Edit User' : 'Tambah User' }}
        </h2>
        <form @submit.prevent="submitForm">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-2">Unique ID</label>
              <input
                v-model="form.unique_id"
                type="text"
                class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Masukkan unique ID (contoh: USER001)"
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
          
          <div class="flex gap-2 mt-6">
            <button
              type="submit"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              :disabled="loading"
            >
              {{ loading ? 'Menyimpan...' : (editMode ? 'Update' : 'Simpan') }}
            </button>
            <button
              type="button"
              @click="resetForm"
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Batal
            </button>
          </div>
        </form>
      </div>

      <!-- Search -->
      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="flex gap-4">
          <input
            v-model="search"
            @input="handleSearch"
            type="text"
            placeholder="Cari username atau email..."
            class="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <select
            v-model="roleFilter"
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

      <!-- Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div v-if="loading && userList.length === 0" class="p-8 text-center text-gray-500">
          Memuat data...
        </div>
        <div v-else-if="userList.length === 0" class="p-8 text-center text-gray-500">
          Tidak ada data user ditemukan
        </div>
        <table v-else class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nama Cabang
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in userList" :key="user.unique_id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.username }}
              </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.branch_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getRoleBadgeClass(user.roles?.[0])" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ user.roles?.[0] || 'No Role' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                <button
                  v-if="canEditUser(user)"
                  @click="editItem(user)"
                  class="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit
                </button>
                <button
                  v-if="canDeleteUser(user)"
                  @click="deleteItem(user)"
                  class="text-red-600 hover:text-red-800 font-medium"
                >
                  Hapus
                </button>
                <span v-if="!canEditUser(user) && !canDeleteUser(user)" class="text-gray-400">
                  No Access
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Pagination -->
        <div v-if="pagination.last_page > 1" class="bg-gray-50 px-6 py-3 flex justify-between items-center">
          <div class="text-sm text-gray-700">
            Menampilkan {{ pagination.from }} - {{ pagination.to }} dari {{ pagination.total }} data
          </div>
          <div class="flex gap-2">
            <button
              @click="changePage(pagination.current_page - 1)"
              :disabled="pagination.current_page === 1"
              class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Sebelumnya
            </button>
            <span class="px-3 py-1 text-sm">
              {{ pagination.current_page }} / {{ pagination.last_page }}
            </span>
            <button
              @click="changePage(pagination.current_page + 1)"
              :disabled="pagination.current_page === pagination.last_page"
              class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              Berikutnya
            </button>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

