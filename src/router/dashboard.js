// src/router/dashboard.js
export const dashboardRoutes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/pages/shared/Dashboard.vue'),
    meta: {
      requiresAuth: true,
      title: 'Dashboard'
    }
  },
  {
    path: '/daftar-barang',
    name: 'DaftarBarang',
    component: () => import('@/pages/shared/DaftarBarang.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['admin', 'manager', 'user'],
      title: 'Daftar Barang'
    }
  },
  {
    path: '/stok-tersedia',
    name: 'StokTersedia',
    component: () => import('@/pages/shared/StokTersedia.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['admin', 'manager', 'user'],
      title: 'Stok Tersedia'
    }
  },
  {
    path: '/laporan',
    name: 'Laporan',
    component: () => import('@/pages/shared/LaporanPengadaan.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['admin', 'manager'],
      title: 'Laporan Pengadaan'
    }
  },
  // Note: LaporanPenggunaan and LaporanStok functionality 
  // can be accessed through main Laporan page
  {
    path: '/user/riwayat',
    name: 'RiwayatPengajuan',
    component: () => import('@/pages/user/RiwayatPengajuan.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['admin', 'manager', 'user'],
      title: 'Riwayat Pengajuan'
    }
  }
]
