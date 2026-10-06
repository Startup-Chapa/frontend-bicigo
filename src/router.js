import { createRouter, createWebHashHistory } from 'vue-router'
import maintenanceRoutes from './maintenance/presentation/maintenance-routes.js'

//“Algo que agregar chicos para que no se equivoquen IAM y sus guards no están presentes en esta rama. audience es solo metadata descriptiva; la autorización real para producción debe integrarse con IAM/backend.”
export default createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: { name: 'maintenance-report' } },
    { path: '/maintenance', children: maintenanceRoutes, redirect: { name: 'maintenance-report' } },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./shared/presentation/views/page-not-found.vue') }
  ]
})
