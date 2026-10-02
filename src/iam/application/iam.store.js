import { defineStore } from 'pinia'
import { ref, shallowRef, computed } from 'vue'
import { iamApi } from '../infrastructure/iam-api.js'
import { UserAssembler } from '../infrastructure/user.assembler.js'
import { iamStorage, TOKEN_KEY, USER_KEY } from '../infrastructure/iam-storage.js'

/**
 * @param {string} jwt
 * @returns {?{userId:string, email:string, role:string}}
 */
function decodeJwt(jwt) {
    try {
        const base64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(atob(base64))
        if (!payload.sub) return null
        return { userId: String(payload.sub), email: payload.email || '', role: payload.role || 'USER' }
    } catch {
        return null
    }
}

export const useIamStore = defineStore('iam', () => {
    /** @type {import('vue').ShallowRef<?import('../domain/model/user.entity.js').User>} */
    const currentUser = shallowRef(null)
    const token       = ref(iamStorage.get(TOKEN_KEY))
    const errors      = ref([])
    const loading     = ref(false)

    const isAuthenticated = computed(() => !!token.value && !!currentUser.value)

    // Restore the previous session
    const savedUser = iamStorage.get(USER_KEY)
    if (savedUser) {
        try { currentUser.value = UserAssembler.toEntityFromResource(JSON.parse(savedUser)) } catch { }
    }

    function setCurrentUser(user) {
        currentUser.value = user
        iamStorage.set(USER_KEY, JSON.stringify(UserAssembler.toResourceFromEntity(user)))
    }

    function clearSession() {
        currentUser.value = null
        token.value = null
        iamStorage.remove(TOKEN_KEY)
        iamStorage.remove(USER_KEY)
    }

    function clearErrors() {
        errors.value = []
    }

    async function startSession(jwt) {
        const claims = decodeJwt(jwt)
        if (!claims) throw new Error('Invalid token')
        token.value = jwt
        iamStorage.set(TOKEN_KEY, jwt)
        const res = await iamApi.getUserById(claims.userId)
        const user = UserAssembler.toEntityFromResource(res.data)
        if (user.isSuspended) {
            clearSession()
            errors.value = ['accountSuspended']
            return false
        }
        setCurrentUser(user)
        return true
    }

    // Sign in
    async function login(email, password) {
        errors.value = []
        loading.value = true
        try {
            const res = await iamApi.signIn(email, password)
            return await startSession(res.data.token)
        } catch (e) {
            clearSession()
            errors.value = [e?.response?.data?.code === 'ACCOUNT_SUSPENDED' ? 'accountSuspended' : 'invalidCredentials']
            return false
        } finally {
            loading.value = false
        }
    }

    // Sign up
    async function register(data) {
        errors.value = []
        loading.value = true
        try {
            await iamApi.signUp(data)
            const res = await iamApi.signIn(data.email, data.password)
            return await startSession(res.data.token)
        } catch (e) {
            clearSession()
            errors.value = [e?.response?.status === 409 ? 'emailTaken' : 'registerError']
            return false
        } finally {
            loading.value = false
        }
    }

    async function fetchCurrentUser() {
        const userId = currentUser.value?.id
        if (!userId) return false
        try {
            const res = await iamApi.getUserById(userId)
            setCurrentUser(UserAssembler.toEntityFromResource(res.data))
            return true
        } catch {
            return false
        }
    }

    // Account data
    async function updateAccount(data) {
        if (!currentUser.value?.id) return false
        errors.value = []
        loading.value = true
        try {
            const res = await iamApi.updateUser(currentUser.value.id, data)
            const updated = UserAssembler.toEntityFromResource(res.data)
            setCurrentUser(updated.profile ? updated : updated.clone({ profile: currentUser.value.profile }))
            return true
        } catch (e) {
            const code = e?.response?.data?.code
            if (e?.response?.status === 409)               errors.value = ['emailTaken']
            else if (code === 'INVALID_CURRENT_PASSWORD')  errors.value = ['invalidCurrentPassword']
            else                                           errors.value = ['updateError']
            return false
        } finally {
            loading.value = false
        }
    }

    // UserProfile
    async function updateProfile(data) {
        if (!currentUser.value?.id) return false
        errors.value = []
        loading.value = true
        try {
            const res = await iamApi.updateProfile(currentUser.value.id, data)
            setCurrentUser(currentUser.value.clone({ profile: UserAssembler.toProfileFromResource(res.data) }))
            return true
        } catch {
            errors.value = ['updateError']
            return false
        } finally {
            loading.value = false
        }
    }

    // Change password
    async function changePassword(currentPassword, newPassword) {
        if (!currentUser.value?.id) return false
        errors.value = []
        loading.value = true
        try {
            await iamApi.changePassword(currentUser.value.id, currentPassword, newPassword)
            return true
        } catch (e) {
            errors.value = [e?.response?.data?.code === 'INVALID_CURRENT_PASSWORD' ? 'invalidCurrentPassword' : 'updateError']
            return false
        } finally {
            loading.value = false
        }
    }

    // Password recovery
    async function requestPasswordReset(email) {
        errors.value = []
        loading.value = true
        try {
            await iamApi.requestPasswordReset(email)
            return true
        } catch {
            errors.value = ['resetError']
            return false
        } finally {
            loading.value = false
        }
    }

    async function resetPassword(resetToken, newPassword) {
        errors.value = []
        loading.value = true
        try {
            await iamApi.resetPassword(resetToken, newPassword)
            return true
        } catch (e) {
            errors.value = [e?.response?.status === 400 ? 'invalidResetToken' : 'resetError']
            return false
        } finally {
            loading.value = false
        }
    }

    function logout() {
        clearSession()
    }

    return {
        currentUser, token, errors, loading, isAuthenticated,
        login, register, fetchCurrentUser, updateAccount, updateProfile, changePassword,
        requestPasswordReset, resetPassword, clearErrors, logout
    }
})
