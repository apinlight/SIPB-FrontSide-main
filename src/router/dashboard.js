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
      roles: ['admin', 'manager', 'user'], // ✅ Standardized to 'roles'
      title: 'Daftar Barang'
    }
  },
  {
    path: '/stok-tersedia',
    name: 'StokTersedia',
    component: () => import('@/pages/shared/StokTersedia.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin', 'manager', 'user'], // ✅ Standardized to 'roles'
      title: 'Stok Tersedia'
    }
  },
  {
    path: '/laporan',
    name: 'Laporan',
    component: () => import('@/pages/shared/LaporanPengadaan.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin', 'manager'], // ✅ Standardized to 'roles'
      title: 'Laporan Pengadaan'
    }
  },
  {
    path: '/user/riwayat',
    name: 'RiwayatPengajuan',
    component: () => import('@/pages/user/RiwayatPengajuan.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin', 'manager', 'user'], // ✅ Standardized to 'roles'
      title: 'Riwayat Pengajuan'
    }
  }
];