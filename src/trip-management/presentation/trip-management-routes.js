// Lazy-loaded components
const tripList = () => import('./views/trip-list.vue');

const tripManagementRoutes = [
    {
        path: 'trips',
        name: 'trip-management-trips',
        component: tripList,
        meta: {title: 'Trips'}
    }
];

export default tripManagementRoutes;
