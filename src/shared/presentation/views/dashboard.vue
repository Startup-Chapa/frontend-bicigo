<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useIamStore } from '../../../iam/application/iam.store.js'
const { t } = useI18n()
const iam = useIamStore()
const route = useRoute()
const modules = computed(() => [
  { name: 'trip-management-trips', title: 'trips', description: 'tripDescription', icon: 'pi pi-map' },
  { name: 'plans', title: 'billing', description: 'billingDescription', icon: 'pi pi-credit-card' },
  { name: 'fleet-bike-points', title: 'fleet', description: 'fleetDescription', icon: 'pi pi-map-marker' },
  { name: 'maintenance-report', title: 'report', description: 'reportDescription', icon: 'pi pi-wrench' },
  ...(iam.canManageMaintenance ? [{ name: 'maintenance-management', title: 'management', description: 'managementDescription', icon: 'pi pi-cog' }] : [])
])
</script>

<template>
  <section class="maintenance-page">
    <div class="page-heading"><p class="eyebrow">{{ t('common.brand') }}</p><h1>{{ t('integration.welcome', { name: iam.currentUser?.username }) }}</h1><p class="subtitle">{{ t('integration.subtitle') }}</p></div>
    <p v-if="route.query.denied" class="alert alert-danger" role="alert">{{ t('integration.noAccess') }}</p>
    <div class="current-plan surface"><span>{{ t('integration.plan') }}</span><strong>{{ t(iam.isPro ? 'integration.pro' : 'integration.tarifa') }}</strong><router-link :to="{ name: 'plans' }" class="text-link">{{ t('integration.billing') }} →</router-link></div>
    <div class="module-grid"><article v-for="item in modules" :key="item.name" class="surface module-card"><i :class="item.icon" aria-hidden="true" /><h2>{{ t(`integration.${item.title}`) }}</h2><p class="muted">{{ t(`integration.${item.description}`) }}</p><router-link :to="{ name: item.name }" class="btn btn-primary">{{ t('integration.open') }}</router-link></article></div>
  </section>
</template>
