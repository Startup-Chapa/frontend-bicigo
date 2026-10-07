<script setup>
import { useI18n } from 'vue-i18n'
import { useMaintenanceStore } from '../../application/maintenance.store.js'
const { t } = useI18n()
const store = useMaintenanceStore()
</script>

<template>
  <section class="integration-notice" :aria-label="t(store.demoMode ? 'maintenance.demo.activeTitle' : 'maintenance.demo.pendingTitle')">
    <div>
      <strong>{{ t(store.demoMode ? 'maintenance.demo.activeTitle' : 'maintenance.demo.pendingTitle') }}</strong>
      <p>{{ t(store.demoMode ? 'maintenance.demo.active' : 'maintenance.demo.pending') }}</p>
    </div>
    <button v-if="!store.demoMode" type="button" class="btn btn-secondary" :disabled="store.busy" @click="store.enableDemo()">{{ t('maintenance.demo.activate') }}</button>
  </section>
  <div v-if="store.error" class="alert alert-danger" role="alert">{{ t(`maintenance.errors.${store.error}`) }}</div>
  <div v-if="store.success" class="alert alert-success" role="status">{{ t(`maintenance.success.${store.success}`) }}</div>
</template>
