import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { toast } from 'vue3-toastify';
import { logger } from '@/lib/logger';

// Import route modules (assuming these exist and are correct)
import { authRoutes } from './auth';
import { dashboardRoutes } from './dashboard';
import { penggunaanRoutes } from './penggunaan';

const routes = [
  { path: '/', redirect: '/dashboard' },
  ...authRoutes,
  ...dashboardRoutes,
  ...penggunaanRoutes,
  {
    path: '/admin/persetujuan',
    name: 'PersetujuanPengadaan',
    component: () => import('@/pages/admin/PersetujuanPengadaan.vue'),
    meta: { requiresAuth: true, roles: ['admin'], title: 'Persetujuan Pengadaan' }
  },
  {
    path: '/user/pengajuan',
    name: 'PengajuanBarang',
    component: () => import('@/pages/user/PengajuanBarang.vue'),
    meta: { requiresAuth: true, roles: ['user', 'admin'], title: 'Pengajuan Barang' }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/pages/Users.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'manager'], title: 'Kelola Users' }
  },
  // ... (keep all your other route definitions here) ...
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
  scrollBehavior: (to, from, savedPosition) => savedPosition || { top: 0 },
});

/**
 * Global Navigation Guard
 * This guard is now much simpler. It only READS from the user store.
 * The responsibility of loading and validating the user is handled elsewhere (App.vue).
 */
router.beforeEach((to, from, next) => {
  const userStore = useUserStore();
  const isAuthenticated = userStore.isAuthenticated;

  // Set page title
  document.title = to.meta.title ? `${to.meta.title} - SIPB` : 'SIPB';

  const requiredRoles = to.meta.roles || [];

  // Rule 1: If a route requires auth and the user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    logger.warn('Guard: Blocked access to protected route. Redirecting to login.', { path: to.fullPath });
    toast.error('Silakan login terlebih dahulu.');
    next({ name: 'Login', query: { redirect: to.fullPath } });
  } 
  // Rule 2: If a route requires a specific role and the user doesn't have it
  else if (requiredRoles.length > 0 && !userStore.userRoles.some(role => requiredRoles.includes(role))) {
    logger.warn('Guard: Role-based access denied.', { path: to.fullPath, required: requiredRoles, userRoles: userStore.userRoles });
    toast.error('Anda tidak memiliki akses ke halaman ini.');
    next({ name: 'Dashboard' }); // Or a dedicated 'Access Denied' page
  }
  // Rule 3: If a route is for guests (like Login) but the user is already authenticated
  else if (to.meta.requiresGuest && isAuthenticated) {
    logger.info('Guard: Authenticated user tried to access a guest page. Redirecting to dashboard.');
    next({ name: 'Dashboard' });
  } 
  // Rule 4: Otherwise, allow navigation
  else {
    next();
  }
});

export default router;