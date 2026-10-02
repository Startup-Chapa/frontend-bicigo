export const iamPublicRoutes = [
    { path: '/auth/login',    name: 'login',           component: () => import('./views/login.vue'),           meta: { guestOnly: true } },
    { path: '/auth/register', name: 'register',        component: () => import('./views/register.vue'),        meta: { guestOnly: true } },
    { path: '/auth/forgot',   name: 'forgot-password', component: () => import('./views/forgot-password.vue'), meta: { guestOnly: true } },
    { path: '/auth/reset',    name: 'reset-password',  component: () => import('./views/reset-password.vue') }
]

export default [...iamPublicRoutes]