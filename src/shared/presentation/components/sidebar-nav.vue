<template>
  <aside class="sidebar" role="complementary" :aria-label="$t('nav.sidebar')">
    <div class="sidebar-logo" aria-hidden="true">
      <span class="logo-icon">🚲</span>
      <span class="logo-text">BiciGo</span>
    </div>

    <nav class="sidebar-nav" role="navigation" :aria-label="$t('nav.mainNav')">
      <p class="sidebar-section-label" aria-hidden="true">{{ sectionLabel }}</p>
      <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="item.to"
          class="sidebar-link"
          :class="{ active: isActive(item.to) }"
          :aria-current="isActive(item.to) ? 'page' : undefined"
          :aria-label="item.label"
      >
        <i :class="item.icon" class="sidebar-link-icon" aria-hidden="true" />
        {{ item.label }}
      </RouterLink>
    </nav>

    <div v-if="iamStore.isTarifa" class="sidebar-balance">
      <div class="balance-row">
        <span class="balance-label">{{ $t('nav.balance') }}</span>
        <span class="balance-value">S/ {{ balanceFormatted }}</span>
      </div>
      <button class="sidebar-topup" :aria-label="$t('nav.topUp')" @click="topUpVisible = true">
        <i class="pi pi-plus" aria-hidden="true" />
        {{ $t('nav.topUp') }}
      </button>
    </div>

    <button class="sidebar-logout" @click="logout" :aria-label="$t('nav.logout')">
      <i class="pi pi-sign-out" aria-hidden="true" />
      {{ $t('nav.logout') }}
    </button>

    <pv-dialog v-model:visible="topUpVisible" :header="$t('nav.topUpTitle')" modal class="w-11 md:w-5">
      <p class="text-sm text-600 mb-3">{{ $t('nav.topUpDesc') }}</p>
      <div class="flex gap-2">
        <button
            v-for="amount in TOP_UP_AMOUNTS"
            :key="amount"
            class="topup-amount-btn"
            :disabled="topUpLoading"
            @click="confirmTopUp(amount)"
        >
          S/ {{ amount.toFixed(2) }}
        </button>
      </div>
    </pv-dialog>
  </aside>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useIamStore, PLANS } from '../../../iam/application/iam.store.js'
import { useBillingStore } from '../../../billing/application/billing-store.js'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'


const { t } = useI18n()
const route  = useRoute()
const router = useRouter()
const iamStore = useIamStore()
const billingStore = useBillingStore()
const toast = useToast()

const topUpVisible = ref(false)
const topUpLoading = ref(false)
const TOP_UP_AMOUNTS = [10, 20, 50]

const userBalance = computed(() => {
  const b = iamStore.currentUser?.balance
  return typeof b === 'number' && Number.isFinite(b) ? b : null
})
const balanceFormatted = computed(() => (userBalance.value === null ? '—' : userBalance.value.toFixed(2)))

onMounted(() => {
  // Sesiones viejas en localStorage no tienen balance: recargar el perfil
  if (iamStore.isTarifa && userBalance.value === null) iamStore.refreshProfile().catch(() => {})
})

async function confirmTopUp(amount) {
  if (topUpLoading.value) return
  topUpLoading.value = true
  try {
    await billingStore.topUpBalance({ userId: iamStore.currentUser?.id, amount })
    topUpVisible.value = false
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('nav.topUpSuccess'), life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('nav.topUpError'), life: 3000 })
  } finally {
    topUpLoading.value = false
  }
}

const plan = computed(() => iamStore.currentUser?.plan || PLANS.TARIFA)

const sectionLabel = computed(() => {
  const map = {
    [PLANS.TARIFA]: t('common.plan.tarifa'),
    [PLANS.PRO]:    t('common.plan.pro')
  }
  return map[plan.value] || ''
})

const navItems = computed(() => [
  { name: 'dashboard', label: t('nav.dashboard'), icon: 'pi pi-th-large', to: '/app/dashboard' },
  { name: 'trip-map',  label: 'Mapa de ruta',     icon: 'pi pi-map',      to: '/map' },
  { name: 'plans', label: t('nav.subscriptions'), icon: 'pi pi-star', to: '/billing/plans' },
  { name: 'trips', label: t('integration.trips'), icon: 'pi pi-map', to: '/trip-management/trips' },
  { name: 'fleet', label: t('integration.fleet'), icon: 'pi pi-map-marker', to: '/fleet/bike-points' },
  { name: 'bicycles', label: t('integration.bicycles'), icon: 'pi pi-bicycle', to: '/fleet/bicycles' },
  { name: 'report', label: t('integration.report'), icon: 'pi pi-wrench', to: '/maintenance/report' },
  ...(iamStore.canManageMaintenance ? [{ name: 'management', label: t('integration.management'), icon: 'pi pi-cog', to: '/maintenance/management' }] : []),
  { name: 'profile', label: t('nav.myProfile'), icon: 'pi pi-user', to: '/app/profile' }
])

function isActive(path) {
  return route.path.startsWith(path)
}

function logout() {
  iamStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.sidebar {
  width: 220px;
  min-height: 100vh;
  background: var(--color-neutral-dark);
  display: flex;
  flex-direction: column;
  padding: 1.25rem 0;
  flex-shrink: 0;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1.25rem;
  margin-bottom: 2rem;
  font-family: var(--font-primary);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-white);
}

.logo-icon { font-size: 1.3rem; }

.sidebar-section-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  padding: 0 1.25rem;
  margin-bottom: 0.5rem;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 1.25rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: color 0.2s, background 0.2s;
  margin: 0.1rem 0.5rem;
  border-radius: var(--radius-max);
}

.sidebar-link:hover { color: var(--color-white); background: rgba(255, 255, 255, 0.08); }

.sidebar-link.active {
  background: var(--color-primary-brand);
  color: var(--color-neutral-dark);
  font-weight: 600;
}

.sidebar-link-icon { font-size: 0.9rem; width: 16px; }

.sidebar-logout {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem 1.75rem;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.5);
  background: none;
  border: none;
  cursor: pointer;
  margin-top: 1rem;
  transition: color 0.2s;
}

.sidebar-logout:hover { color: #FF8A80; }

.sidebar-balance {
  margin-top: 1rem;
  padding: 0.75rem 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.balance-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
}

.balance-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--color-white);
}

.sidebar-topup {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
  font-weight: 700;
  background: var(--color-primary-brand);
  color: var(--color-neutral-dark);
  border: none;
  border-radius: var(--radius-max);
  cursor: pointer;
}

.topup-amount-btn {
  flex: 1;
  padding: 0.75rem;
  font-weight: 700;
  font-size: 1rem;
  background: var(--color-primary-brand);
  color: var(--color-neutral-dark);
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
}

.topup-amount-btn:disabled,
.sidebar-topup:disabled {
  opacity: 0.5;
  cursor: wait;
}
</style>
<style scoped>
@media (max-width: 600px) {
  .sidebar { width: 100%; min-height: auto; padding: 12px; }
  .sidebar-logo, .sidebar-section-label { margin-bottom: 8px; }
  .sidebar-nav { display: flex; flex-wrap: wrap; }
  .sidebar-section-label { width: 100%; }
  .sidebar-link { padding: 8px; margin: 0; }
  .sidebar-logout { margin-top: 8px; }
  .sidebar-balance { margin-top: 8px; padding: 8px 12px; }
}
</style>
