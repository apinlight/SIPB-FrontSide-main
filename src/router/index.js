import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import { toast } from 'vue3-toastify'

// Import route modules
import { authRoutes } from './auth'
import { dashboardRoutes } from './dashboard'
import { penggunaanRoutes } from './penggunaan'

// Combine all routes
const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  ...authRoutes,
  ...dashboardRoutes,
  ...penggunaanRoutes,
  
  // Additional routes that weren't in modules
  {
    path: '/admin/pengadaan-disetujui',
    name: 'PengadaanDisetujui',
    component: () => import('@/pages/admin/PengadaanDisetujui.vue'),
    meta: { 
      requiresAuth: true, 
      requiresRole: ['admin'],
      title: 'Pengadaan Disetujui'
    }
  },
  {
    path: '/admin/pengadaan-manual',
    name: 'PengadaanManual',
    component: () => import('@/pages/admin/PengadaanManual.vue'),
    meta: { 
      requiresAuth: true, 
      requiresRole: ['admin'],
      title: 'Pengadaan Manual'
    }
  },
  {
    path: '/admin/persetujuan',
    name: 'PersetujuanPengadaan',
    component: () => import('@/pages/admin/PersetujuanPengadaan.vue'),
    meta: { 
      requiresAuth: true, 
      requiresRole: ['admin'],
      title: 'Persetujuan Pengadaan'
    }
  },
  {
    path: '/user/pengajuan',
    name: 'PengajuanBarang',
    component: () => import('@/pages/user/PengajuanBarang.vue'),
    meta: { 
      requiresAuth: true, 
      requiresRole: ['user'],
      title: 'Pengajuan Barang'
    }
  },
  {
    path: '/manager/riwayat-cabang',
    name: 'RiwayatCabang',
    component: () => import('@/pages/manager/RiwayatCabang.vue'),
    meta: { 
      requiresAuth: true, 
      requiresRole: ['manager'],
      title: 'Riwayat Cabang'
    }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/pages/Users.vue'),
    meta: { 
      requiresAuth: true, 
      requiresRole: ['admin'],
      title: 'Kelola Users'
    }
  },
  {
    path: '/jenis-barang',
    name: 'JenisBarang',
    component: () => import('@/pages/JenisBarang.vue'),
    meta: { 
      requiresAuth: true, 
      requiresRole: ['admin'],
      title: 'Jenis Barang'
    }
  },
  {
    path: '/batas-barang',
    name: 'BatasBarang',
    component: () => import('@/pages/BatasBarang.vue'),
    meta: { 
      requiresAuth: true, 
      requiresRole: ['admin'],
      title: 'Batas Barang'
    }
  },
  {
    path: '/batas-pengajuan',
    name: 'BatasPengajuan',
    component: () => import('@/pages/BatasPengajuan.vue'),
    meta: { 
      requiresAuth: true, 
      requiresRole: ['admin'],
      title: 'Batas Pengajuan'
    }
  },
  
  // 404 fallback
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/pages/NotFound.vue'),
    meta: {
      title: '404 - Halaman Tidak Ditemukan'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()
  
  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - SIPB`
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!userStore.isAuthenticated) {
      // Try to load user from storage first
      const loaded = userStore.loadUserFromStorage()
      
      if (!loaded) {
        toast.error('Silakan login terlebih dahulu')
        next({
          name: 'Login',
          query: { redirect: to.fullPath }
        })
        return
      }
    }
    
    // Check role-based access
    if (to.meta.requiresRole) {
      const requiredRoles = Array.isArray(to.meta.requiresRole) 
        ? to.meta.requiresRole 
        : [to.meta.requiresRole]
      
      const hasRequiredRole = requiredRoles.some(role => userStore.hasRole(role))
      
      if (!hasRequiredRole) {
        toast.error('Anda tidak memiliki akses ke halaman ini')
        next({ name: 'Dashboard' })
        return
      }
    }
  }
  
  // Redirect authenticated users away from auth pages
  if (to.meta.requiresGuest && userStore.isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }
  
  next()
})

export default router
