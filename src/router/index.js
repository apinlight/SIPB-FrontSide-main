import { createRouter, createWebHistory } from 'vue-router'

// ✅ FIX: Use simpler dynamic imports to avoid 500 errors
const routes = [
  {
    path: '/',
    component: () => import('../pages/shared/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    component: () => import('../pages/shared/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/daftar-barang',
    component: () => import('../pages/shared/DaftarBarang.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/laporan',
    name: 'LaporanPengadaan',
    component: () => import('../pages/shared/LaporanPengadaan.vue'),
    meta: { requiresAuth: true }
  },
  // Admin routes
  {
    path: '/admin/pengadaan-disetujui',
    name: 'PengadaanDisetujui',
    component: () => import('../pages/admin/PengadaanDisetujui.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/pengadaan-manual',
    name: 'PengadaanManual',
    component: () => import('../pages/admin/PengadaanManual.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/admin/persetujuan',
    name: 'PersetujuanPengadaan',
    component: () => import('../pages/admin/PersetujuanPengadaan.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  // User routes
  {
    path: '/user/pengajuan',
    name: 'PengajuanBarang',
    component: () => import('../pages/user/PengajuanBarang.vue'),
    meta: { requiresAuth: true, roles: ['user'] }
  },
  {
    path: '/user/riwayat',
    name: 'RiwayatPengajuan',
    component: () => import('../pages/user/RiwayatPengajuan.vue'),
    meta: { requiresAuth: true, roles: ['user'] }
  },
  // Manager routes
  {
    path: '/manager/riwayat-cabang',
    name: 'RiwayatCabang',
    component: () => import('../pages/manager/RiwayatCabang.vue'),
    meta: { requiresAuth: true, roles: ['manager'] }
  },
  // Management routes
  {
    path: '/users',
    name: 'Users',
    component: () => import('../pages/Users.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/jenis-barang',
    name: 'JenisBarang',
    component: () => import('../pages/JenisBarang.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/batas-barang',
    name: 'BatasBarang',
    component: () => import('../pages/BatasBarang.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/batas-pengajuan',
    name: 'BatasPengajuan',
    component: () => import('../pages/BatasPengajuan.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ✅ Optional: Add navigation guards if needed
// router.beforeEach((to, from, next) => {
//   // Add auth logic here if needed
//   next()
// })

export default router
