// Lazy-loaded components
const tripList = () => import('./views/trip-list.vue');
const tripMap = () => import('./views/trip-map-view.vue'); // <-- 1. Importar la vista del mapa

const tripManagementRoutes = [
    {
        path: 'trips',
        name: 'trip-management-trips',
        component: tripList,
        meta: { title: 'Mis Viajes', requiresAuth: true }
    },
    {
        path: 'map',
        name: 'trip-management-map',
        component: tripMap, // <-- 2. Vista con mapa y métricas en vivo
        meta: { title: 'Viaje en Curso', requiresAuth: true }
    }
];

export default tripManagementRoutes;