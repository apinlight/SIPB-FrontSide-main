import { createRouter, createWebHistory } from 'vue-router';
import { getActivePinia } from 'pinia';
import { useUserStore } from '@/stores/userStore';
import { toast } from 'vue3-toastify';
import { logger } from '@/lib/logger';

import { authRoutes } from './auth';
import { dashboardRoutes } from './dashboard';
import { penggunaanRoutes } from './penggunaan';

const routes = [
  { path: '/', redirect: '/dashboard' },
  ...authRoutes,
  ...dashboardRoutes,
  ...penggunaanRoutes,
  
  // --- Admin Routes ---
  {
    path: '/admin/persetujuan',
    name: 'PersetujuanPengadaan',
    component: () => import('@/pages/admin/PersetujuanPengadaan.vue'),
     meta: { requiresAuth: true, roles: ['admin'], title: 'Persetujuan Pengadaan' } // ✅ FIX: hanya admin yang approve
  },
  // ✅ ADDED MISSING ADMIN ROUTES
  {
    path: '/admin/pengadaan-disetujui',
    name: 'PengadaanDisetujui',
    component: () => import('@/pages/admin/PengadaanDisetujui.vue'),
    meta: { requiresAuth: true, roles: ['admin'], title: 'Pengadaan Disetujui' }
  },
  {
    path: '/admin/pengadaan-manual',
    name: 'PengadaanManual',
    component: () => import('@/pages/admin/PengadaanManual.vue'),
    meta: { requiresAuth: true, roles: ['admin'], title: 'Pengadaan Manual' }
  },
  {
    path: '/jenis-barang',
    name: 'JenisBarang',
    component: () => import('@/pages/JenisBarang.vue'),
    meta: { requiresAuth: true, roles: ['admin'], title: 'Jenis Barang' }
  },
  {
    path: '/batas-barang',
    name: 'BatasBarang',
    component: () => import('@/pages/BatasBarang.vue'),
    meta: { requiresAuth: true, roles: ['admin'], title: 'Batas Barang' }
  },
  {
    path: '/batas-pengajuan',
    name: 'BatasPengajuan',
    component: () => import('@/pages/BatasPengajuan.vue'),
    meta: { requiresAuth: true, roles: ['admin'], title: 'Batas Pengajuan' }
  },

  // --- User/Manager Routes ---
  {
    path: '/user/pengajuan',
    name: 'PengajuanBarang',
    component: () => import('@/pages/user/PengajuanBarang.vue'),
    meta: { requiresAuth: true, roles: ['user', 'admin'], title: 'Pengajuan Barang' } // ✅ FIX: manager tidak ajukan
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/pages/Users.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'manager'], title: 'Kelola Users' }
  },
  {
    path: '/manager/riwayat-cabang',
    name: 'RiwayatCabang',
    component: () => import('@/pages/manager/RiwayatCabang.vue'),
    meta: { requiresAuth: true, roles: ['manager'], title: 'Riwayat Cabang' }
  },
  
  // --- 404 Fallback ---
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue'),
    meta: { title: '404 - Halaman Tidak Ditemukan' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

router.beforeEach((to, from, next) => {
  // Avoid using stores before Pinia is installed/active
  const activePinia = getActivePinia();
  const userStore = activePinia ? useUserStore() : null;
  const isAuthenticated = userStore?.isAuthenticated ?? false;
  document.title = to.meta.title ? `${to.meta.title} - SIMBA` : 'SIMBA';
  const requiredRoles = to.meta.roles || [];

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (requiredRoles.length > 0 && userStore && !userStore.userRoles.some(role => requiredRoles.includes(role))) {
    toast.error('Anda tidak memiliki akses ke halaman ini.');
    next({ name: 'Dashboard' });
  } else if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'Dashboard' });
  } else {
    next();
  }
});

export default router;