export const fleetRoutes = [
    {
        path: '/fleet/bike-points',
        name: 'fleet-bike-points',
        component: () => import('./views/bike-point-list.vue'),
        meta: { title: 'Fleet - Bike Points' }
    },
    {
        path: '/fleet/bike-points/new',
        name: 'fleet-bike-points-new',
        component: () => import('./views/bike-point-form.vue'),
        meta: { title: 'Fleet - New Bike Point' }
    },
    {
        path: '/fleet/bike-points/edit/:id',
        name: 'fleet-bike-points-edit',
        component: () => import('./views/bike-point-form.vue'),
        props: true,
        meta: { title: 'Fleet - Edit Bike Point' }
    },
    {
        path: '/fleet/bicycles',
        name: 'fleet-bicycles',
        component: () => import('./views/bicycle-list.vue'),
        meta: { title: 'Fleet - Bicycles' }
    },
    {
        path: '/fleet/bicycles/new',
        name: 'fleet-bicycles-new',
        component: () => import('./views/bicycle-form.vue'),
        meta: { title: 'Fleet - New Bicycle' }
    },
    {
        path: '/fleet/bicycles/edit/:id',
        name: 'fleet-bicycles-edit',
        component: () => import('./views/bicycle-form.vue'),
        props: true,
        meta: { title: 'Fleet - Edit Bicycle' }
    }
];