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
      path: '/katalog',
      name: 'katalog',
      component: () => import('../views/KatalogView.vue'),
    },
     {
      path: '/product/:id',
      name: 'pflanze-detail',
      component: () => import('../views/ProductDetail.vue') },
  ],
})

export default router
