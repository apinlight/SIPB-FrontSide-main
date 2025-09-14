export const penggunaanRoutes = [
  {
    path: '/penggunaan-barang',
    name: 'PenggunaanBarang',
    component: () => import('@/pages/shared/PenggunaanBarang.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin', 'manager', 'user'], // ✅ Standardized to 'roles'
      title: 'Penggunaan Barang'
    }
  }
];