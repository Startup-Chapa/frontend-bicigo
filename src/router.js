import { createRouter, createWebHashHistory } from 'vue-router'
import { useIamStore } from './iam/application/iam.store.js'

const router = createRouter({
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', redirect: '/auth/login' },

        // IAM – public auth pages
        {
            path: '/auth',
            children: [
                { path: 'login',    name: 'login',    component: () => import('./iam/presentation/views/login/login.vue') },
                { path: 'register', name: 'register', component: () => import('./iam/presentation/views/register/register.vue') },
                { path: 'forgot',   name: 'forgot-password',  component: () => import('./iam/presentation/views/forgot-password/forgot-password.vue') },
            ]
        },

        // Protected app shell
        {
            path: '/app',
            component: () => import('./shared/presentation/components/app-layout.vue'),
            meta: { requiresAuth: true },
            children: [
                // IAM – profile
                { path: 'profile', name: 'profile', component: () => import('./iam/presentation/views/profile/profile.vue') },
            ]
        },

        // Catch-all
        { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./shared/presentation/views/page-not-found.vue') }
    ]
})

router.beforeEach((to, _from, next) => {
    document.title = to.meta.title ? `${to.meta.title} | Bicigo` : 'BiciGo'

    if (to.meta.requiresAuth) {
        const iamStore = useIamStore()
        if (!iamStore.isAuthenticated) {
            return next({ name: 'login' })
        }
    }
    next()
})

export default router
