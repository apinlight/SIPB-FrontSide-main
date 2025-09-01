// src/router/auth.js
export const authRoutes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/pages/shared/Login.vue'),
    meta: {
      requiresGuest: true,
      title: 'Login'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/pages/shared/Register.vue'),
    meta: {
      requiresGuest: true,
      title: 'Register'
    }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('@/pages/shared/ForgotPassword.vue'),
    meta: {
      requiresGuest: true,
      title: 'Lupa Password'
    }
  }
]