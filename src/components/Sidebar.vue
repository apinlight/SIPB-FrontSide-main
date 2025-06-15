<template>
  <aside
    :class="[
      'bg-gray-100 h-full p-4 shadow-md transition-all duration-300',
      collapsed ? 'w-20' : 'w-64'
    ]"
  >
    <!-- Tombol Collapse -->
    <div class="flex justify-end mb-4">
      <button @click="collapsed = !collapsed" class="text-sm text-gray-600 hover:text-gray-800">
        {{ collapsed ? '≡' : 'x' }}
      </button>
    </div>

    <!-- Menu -->
    <nav class="flex flex-col gap-2">
      <SidebarLink
        v-for="item in filteredMenu"
        :key="item.name"
        :item="item"
        :collapsed="collapsed"
      />
    </nav>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '@/stores/userStore'
import SidebarLink from './SidebarLink.vue'

const collapsed = ref(false)
const userStore = useUserStore()

const allMenu = [
  { 
    name: 'Dashboard', 
    path: '/dashboard',
    emoji: '🏠',
    roles: ['admin', 'manager', 'user'] // All roles can access
  },
  {
    name: 'Pengadaan',
    emoji: '📦',
    roles: ['admin', 'manager', 'user'],
    children: [
      { name: 'Daftar Barang', path: '/daftar-barang', emoji: '📥', roles: ['admin'] },
      { name: 'Riwayat', path: '/pengadaan-riwayat', emoji: '🕘', roles: ['admin', 'manager', 'user'] }
    ]
  },
  { 
    name: 'Laporan', 
    path: '/laporan',
    emoji: '📊',
    roles: ['admin', 'manager']
  }
]

// ✅ Filter menu based on user roles
const filteredMenu = computed(() => {
  if (!userStore.user || !userStore.userRoles.length) {
    return [] // No menu if no user or roles
  }

  return allMenu.filter(item => {
    // Check if user has any of the required roles for this menu item
    const hasAccess = item.roles.some(role => userStore.hasRole(role))
    
    if (hasAccess && item.children) {
      // Filter children based on roles too
      item.children = item.children.filter(child => 
        child.roles.some(role => userStore.hasRole(role))
      )
    }
    
    return hasAccess
  })
})
</script>
