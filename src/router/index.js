import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminDashboardView.vue'),
    },
    {
      path: '/katalog',
      name: 'katalog',
      component: () => import('../views/KatalogView.vue'),
    },
    {
      path: '/community',
      name: 'community',
      component: () => import('../views/CommunityView.vue'),
    },
    {
      path: '/community/:id',
      name: 'community-detail',
      component: () => import('../views/PostDetailView.vue'),
    },
     {
      path: '/product/:id',
      name: 'pflanze-detail',
      component: () => import('../views/ProductDetail.vue') },
    {
      path: '/warenkorb',
      name: 'warenkorb',
      component: () => import('../views/WarenkorbView.vue'),
    },
    {
      path: '/impressum',
      name: 'impressum',
      component: () => import('../views/ImpressumView.vue'),
    },
    {
      path: '/datenschutz',
      name: 'datenschutz',
      component: () => import('../views/DatenschutzView.vue'),
    },
  ],
})

export default router
