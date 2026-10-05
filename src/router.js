import { createRouter, createWebHistory } from 'vue-router'
import billingRoutes from './billing/presentation/billing-routes.js'

const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue')

const routes = [
  { path: '/billing', name: 'billing', children: billingRoutes },
  { path: '/', redirect: '/billing/plans' },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: pageNotFound, meta: { title: 'Page Not Found' } }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from) => {
  document.title = `BiciGo - ${to.meta['title'] ?? 'Billing'}`
  return true
})

export default router
