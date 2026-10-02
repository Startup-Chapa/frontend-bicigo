import { useIamStore } from '../application/iam.store.js'

/**
 * Global navigation guard for the IAM bounded context.
 * - Routes with `meta.requiresAuth` send anonymous users to the login page.
 * - Routes with `meta.guestOnly` send signed-in users to /home.
 *
 * Usage: router.beforeEach(iamAuthGuard)
 *
 * @param {import('vue-router').RouteLocationNormalized} to
 */
export function iamAuthGuard(to) {
    const iamStore = useIamStore()
    if (to.meta.requiresAuth && !iamStore.isAuthenticated) {
        return { name: 'login', query: { redirect: to.fullPath } }
    }
    if (to.meta.guestOnly && iamStore.isAuthenticated) {
        return { path: '/home' }
    }
    return true
}
