import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { iamApi } from '../infrastructure/iam-api.js'

export const PLANS = Object.freeze({
  TARIFA: 'tarifa',
  PRO: 'pro'
})

export const useIamStore = defineStore('iam', () => {
  const currentUser = ref(null)
  const token       = ref(localStorage.getItem('bicigo_token') || null)
  const errors      = ref([])
  const loading     = ref(false)

  const isAuthenticated = computed(() => !!token.value && !!currentUser.value)
  const isTarifa        = computed(() => currentUser.value?.plan === PLANS.TARIFA)
  const canManageMaintenance = computed(() => ['ADMIN', 'OPERATOR'].includes(currentUser.value?.role))
  const isPro           = computed(() => currentUser.value?.plan === PLANS.PRO)

  // Rehydrate user from localStorage on cold load
  const savedUser = localStorage.getItem('bicigo_user')
  if (savedUser) {
    try { currentUser.value = JSON.parse(savedUser) } catch {}
  }

  function persistSession(user) {
    const { password: _password, ...sessionUser } = user
    currentUser.value = sessionUser
    token.value = `mock-jwt-${user.id}`
    localStorage.setItem('bicigo_token', token.value)
    localStorage.setItem('bicigo_user', JSON.stringify(sessionUser))
  }

  async function login(email, password) {
    errors.value = []
    loading.value = true
    try {
      const res = await iamApi.login(email, password)
      if (res.status !== 200) { console.error(`${res.status}, ${res.statusText}`); return false }
      const users = res.data
      if (!users || users.length === 0) {
        errors.value = ['invalidCredentials']
        return false
      }
      persistSession(users[0])
      return true
    } catch (e) {
      errors.value = ['invalidCredentials']
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(data) {
    errors.value = []
    loading.value = true
    try {
      const payload = { ...data, plan: data.plan || PLANS.TARIFA }
      const res = await iamApi.register(payload)
      if (![200, 201].includes(res.status)) { console.error(`${res.status}, ${res.statusText}`); return false }
      persistSession(res.data)
      return true
    } catch (e) {
      errors.value = ['registerError']
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(data) {
    if (!currentUser.value?.id) return false
    errors.value = []
    loading.value = true
    try {
      const res = await iamApi.updateProfile(currentUser.value.id, data)
      if (res.status !== 200) { console.error(`${res.status}, ${res.statusText}`); return false }
      const { password: _password, ...sessionUser } = res.data
      currentUser.value = sessionUser
      localStorage.setItem('bicigo_user', JSON.stringify(sessionUser))
      return true
    } catch (e) {
      errors.value = ['updateError']
      return false
    } finally {
      loading.value = false
    }
  }

  async function requestPasswordReset(email) {
    errors.value = []
    loading.value = true
    try {
      await iamApi.requestPasswordReset(email)
      return true
    } catch (e) {
      errors.value = ['resetError']
      return false
    } finally {
      loading.value = false
    }
  }

  function applyPlanUpgrade(planKey) {
    if (!currentUser.value) return
    if (!Object.values(PLANS).includes(planKey)) return
    currentUser.value = { ...currentUser.value, plan: planKey }
    localStorage.setItem('bicigo_user', JSON.stringify(currentUser.value))
  }

  function logout() {
    currentUser.value = null
    token.value = null
    localStorage.removeItem('bicigo_token')
    localStorage.removeItem('bicigo_user')
  }

  return {
    currentUser, token, errors, loading,
    isAuthenticated, isTarifa, isPro, canManageMaintenance,
    login, register, updateProfile, requestPasswordReset, applyPlanUpgrade, logout
  }
})