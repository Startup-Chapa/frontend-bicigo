import { createRouter, createWebHashHistory } from 'vue-router'
import iamRoutes from './iam/presentation/iam-routes.js'
import billingRoutes from './billing/presentation/billing-routes.js'
import maintenanceRoutes from './maintenance/presentation/maintenance-routes.js'
import tripRoutes from './trip-management/presentation/trip-management-routes.js'
import { fleetRoutes } from './fleet-station-managment/presentation/fleet-routes.js'
import { useIamStore } from './iam/application/iam.store.js'
import pinia from './pinia.js'
import i18n from './i18n.js'
import { watch } from 'vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: { name: 'dashboard' } },
    ...iamRoutes.filter(route => route.path.startsWith('/auth/')),
    { path: '/auth/forgot', name: 'forgot-password', component: () => import('./iam/presentation/views/forgot-password/forgot-password.vue'), meta: { titleKey: 'auth.forgotPasswordTitle' } },
    {
      path: '/app', component: () => import('./shared/presentation/components/app-layout.vue'), meta: { requiresAuth: true },
      children: [
        { path: '', redirect: { name: 'dashboard' } },
        { path: 'dashboard', name: 'dashboard', component: () => import('./shared/presentation/views/dashboard.vue'), meta: { titleKey: 'integration.dashboard' } },
        ...iamRoutes.filter(route => !route.path.startsWith('/auth/')),
        { path: 'tarifa/dashboard', name: 'tarifa-dashboard', redirect: { name: 'dashboard' } },
        { path: 'pro/dashboard', name: 'pro-dashboard', redirect: { name: 'dashboard' } },
        { path: 'subscriptions/plans', name: 'subscriptions-plans', redirect: { name: 'plans' } },
        { path: '/billing', children: billingRoutes, redirect: { name: 'plans' } },
        { path: '/maintenance', children: maintenanceRoutes, redirect: { name: 'maintenance-report' } },
        { path: '/fleet', children: fleetRoutes, redirect: { name: 'fleet-bike-points' } },
        { path: '/trip-management', children: tripRoutes, redirect: { name: 'trip-management-trips' } },
        { path: '/trips', redirect: { name: 'trip-management-trips' } },
        { path: 'trips', redirect: { name: 'trip-management-trips' } },
        { path: '/fleet/stations', redirect: { name: 'fleet-bike-points' } },
        { path: '/iam/register/plan', name: 'register-plan', component: () => import('./iam/presentation/views/register-plan-view.vue'), meta: { titleKey: 'integration.registerPlan' } }
      ]
    },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./shared/presentation/views/page-not-found.vue'), meta: { titleKey: 'page-not-found.title' } }
  ]
})

router.beforeEach(to => {
  const iam = useIamStore(pinia)
  if (to.meta.requiresAuth && !iam.isAuthenticated) return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.audience && !iam.canManageMaintenance) return { name: 'dashboard', query: { denied: '1' } }
  return true
})

function updateTitle() {
  const meta = router.currentRoute.value.meta
  document.title = `${meta.titleKey ? i18n.global.t(meta.titleKey) : meta.title || 'BiciGO'} | BiciGO`
}
router.afterEach(updateTitle)
watch(i18n.global.locale, updateTitle)

export default router
