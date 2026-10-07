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

    <button class="sidebar-logout" @click="logout" :aria-label="$t('nav.logout')">
      <i class="pi pi-sign-out" aria-hidden="true" />
      {{ $t('nav.logout') }}
    </button>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useIamStore, PLANS } from '../../../iam/application/iam.store.js'
import { useI18n } from 'vue-i18n'


const { t } = useI18n()
const route  = useRoute()
const router = useRouter()
const iamStore = useIamStore()

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
</style>
<style scoped>
@media (max-width: 600px) {
  .sidebar { width: 100%; min-height: auto; padding: 12px; }
  .sidebar-logo, .sidebar-section-label { margin-bottom: 8px; }
  .sidebar-nav { display: flex; flex-wrap: wrap; }
  .sidebar-section-label { width: 100%; }
  .sidebar-link { padding: 8px; margin: 0; }
  .sidebar-logout { margin-top: 8px; }
}
</style>
