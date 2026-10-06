const maintenanceRoutes = [
  { path: 'report', name: 'maintenance-report', component: () => import('./views/report-maintenance.vue'), meta: { titleKey: 'maintenance.report.title' } },
  { path: 'management', name: 'maintenance-management', component: () => import('./views/maintenance-management.vue'), meta: { titleKey: 'maintenance.management.title', audience: ['ADMIN', 'OPERATOR'] } }
]

export default maintenanceRoutes
