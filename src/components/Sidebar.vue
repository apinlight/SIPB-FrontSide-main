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
    roles: ['admin', 'manager', 'user']
  },
  {
    name: 'Pengadaan',
    emoji: '📦',
    roles: ['admin', 'manager', 'user'],
    children: [
      { name: 'Daftar Barang', path: '/daftar-barang', emoji: '📥', roles: ['admin', 'manager', 'user'] },
      { name: 'Pengajuan Barang', path: '/user/pengajuan', emoji: '📝', roles: ['user'] },
      { name: 'Riwayat Pengajuan', path: '/user/riwayat', emoji: '🕘', roles: ['admin', 'manager', 'user'] },
      { name: 'Persetujuan Pengadaan', path: '/admin/persetujuan', emoji: '✅', roles: ['admin'] },
      { name: 'Pengadaan Disetujui', path: '/admin/pengadaan-disetujui', emoji: '📋', roles: ['admin'] },
      { name: 'Pengadaan Manual', path: '/admin/pengadaan-manual', emoji: '✏️', roles: ['admin'] }
    ]
  },
  {
    name: 'Penggunaan Barang',
    emoji: '🔧',
    roles: ['admin', 'manager', 'user'],
    children: [
      { name: 'Kelola Penggunaan', path: '/penggunaan-barang', emoji: '📋', roles: ['user'] },
      { name: 'Stok Tersedia', path: '/stok-tersedia', emoji: '📊', roles: ['admin', 'manager', 'user'] }
    ]
  },
  {
    name: 'Laporan',
    emoji: '📈',
    roles: ['admin', 'manager'],
    children: [
      { name: 'Laporan Pengadaan', path: '/laporan', emoji: '📊', roles: ['admin'] },
      { name: 'Riwayat Cabang', path: '/manager/riwayat-cabang', emoji: '🏢', roles: ['manager'] }
    ]
  },
  {
    name: 'Administrasi',
    emoji: '⚙️',
    roles: ['admin'],
    children: [
      { name: 'Kelola Users', path: '/users', emoji: '👥', roles: ['admin'] },
      { name: 'Jenis Barang', path: '/jenis-barang', emoji: '🏷️', roles: ['admin'] },
      { name: 'Batas Barang', path: '/batas-barang', emoji: '⚠️', roles: ['admin'] },
      { name: 'Batas Pengajuan', path: '/batas-pengajuan', emoji: '📊', roles: ['admin'] }
    ]
  }
]

// Filter menu based on user roles
const filteredMenu = computed(() => {
  if (!userStore.user || !userStore.userRoles.length) {
    return []
  }

  return allMenu.filter(item => {
    const hasAccess = item.roles.some(role => userStore.hasRole(role))
    
    if (hasAccess && item.children) {
      item.children = item.children.filter(child => 
        child.roles.some(role => userStore.hasRole(role))
      )
    }
    
    return hasAccess
  })
})
</script>
