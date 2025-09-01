// src/router/penggunaan.js
export const penggunaanRoutes = [
  {
    path: '/penggunaan-barang',
    name: 'PenggunaanBarang',
    component: () => import('@/pages/shared/PenggunaanBarang.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: ['admin', 'manager', 'user'],
      title: 'Penggunaan Barang'
    }
  }
  // Note: CreatePenggunaanBarang, DetailPenggunaanBarang, and PendingApprovals 
  // functionality is handled within PenggunaanBarang.vue comprehensive page
]
