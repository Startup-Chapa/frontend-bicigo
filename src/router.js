import { createRouter, createWebHistory } from 'vue-router';
import { fleetRoutes } from './fleet/presentation/fleet-routes.js';


const routes = [
    // ... rutas base
    ...fleetRoutes,
    // ... ruta 404
];

export const router = createRouter({
    history: createWebHistory(),
    routes
});