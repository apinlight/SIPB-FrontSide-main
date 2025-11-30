<template>
  <aside 
    :class="[
      'bg-white h-full shadow-xl transition-all duration-300 flex flex-col',
      collapsed ? 'w-20' : 'w-64 sm:w-72'
    ]"
  >
    <!-- Header with close/collapse button -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <h2 v-if="!collapsed" class="text-lg font-bold text-gray-800">Menu</h2>
      <button 
        @click="handleToggle" 
        class="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
        :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'"
      >
        <!-- Close icon on mobile, collapse/expand on desktop -->
        <svg v-if="!collapsed" class="w-6 h-6 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <svg v-if="!collapsed" class="w-6 h-6 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        <svg v-if="collapsed" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Navigation menu - scrollable -->
    <nav class="flex-1 overflow-y-auto p-3 space-y-1">
      <SidebarLink 
        v-for="item in filteredMenu" 
        :key="item.name" 
        :item="item" 
        :collapsed="collapsed"
        @navigate="handleNavigate"
      />
    </nav>

    <!-- Footer with version or branding (optional) -->
    <div v-if="!collapsed" class="p-4 border-t border-gray-200">
      <p class="text-xs text-gray-500 text-center">SIMBA v1.0</p>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/userStore';
import SidebarLink from './SidebarLink.vue';

const emit = defineEmits(['close']);
const collapsed = ref(false);
const userStore = useUserStore();

const handleToggle = () => {
  // On mobile, emit close event to parent (DefaultLayout)
  // On desktop, just toggle collapsed state
  if (window.innerWidth < 768) {
    emit('close');
  } else {
    collapsed.value = !collapsed.value;
  }
};

const handleNavigate = () => {
  // Close sidebar on mobile after navigation
  if (window.innerWidth < 768) {
    emit('close');
  }
};

const allMenu = [
  { 
    name: 'Dashboard', 
    path: '/dashboard',
    emoji: '🏠',
    roles: ['admin', 'manager', 'user']
  },
  {
    name: 'Pengadaan Barang',
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
    name: 'Gudang',
    emoji: '🔧',
    roles: ['admin', 'manager', 'user'],
    children: [
      { name: 'Kelola Penggunaan Barang', path: '/penggunaan-barang', emoji: '📋', roles: ['admin', 'manager', 'user'] },
      { name: 'Stok Tersedia', path: '/stok-tersedia', emoji: '📊', roles: ['admin', 'manager', 'user'] }
    ]
  },
  {
    name: 'Laporan',
    emoji: '📈',
    roles: ['admin', 'manager'],
    children: [
      { name: 'Laporan Pengadaan', path: '/laporan', emoji: '📊', roles: ['admin', 'manager'] }
    ]
  },
  {
    name: 'Administrasi',
    emoji: '⚙️',
    roles: ['admin'],
    children: [
      { name: 'Kelola Users', path: '/users', emoji: '👥', roles: ['admin'] },
      { name: 'Jenis Barang', path: '/jenis-barang', emoji: '🏷️', roles: ['admin'] },
      { name: 'Kelola Cabang', path: '/cabang', emoji: '🏢', roles: ['admin'] },
      { name: 'Batas Barang', path: '/batas-barang', emoji: '⚠️', roles: ['admin'] },
      { name: 'Batas Pengajuan', path: '/batas-pengajuan', emoji: '📊', roles: ['admin'] }
    ]
  }
];

// This logic is now safer and more robust
const filteredMenu = computed(() => {
  if (!userStore.isAuthenticated) return [];

  const userRoles = userStore.userRoles;

  return allMenu
    .map(item => {
      // Create a new item object to avoid mutation
      const newItem = { ...item };
      
      // If the item has children, filter them first
      if (newItem.children) {
        newItem.children = newItem.children.filter(child =>
          child.roles.some(role => userRoles.includes(role))
        );
      }
      return newItem;
    })
    .filter(item => {
      // Then, filter the parent item based on its roles or if it still has visible children
      const hasAccess = item.roles.some(role => userRoles.includes(role));
      return hasAccess && (!item.children || item.children.length > 0);
    });
});
</script>