<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMaintenanceStore } from '../../application/maintenance.store.js'
import { BIKE_STATUSES, PROBLEM_TYPES, nextBikeStatus } from '../../domain/model/maintenance.entity.js'
import MaintenanceFeedback from '../components/maintenance-feedback.vue'
import MaintenanceStatus from '../components/maintenance-status.vue'

const { t, locale } = useI18n()
const store = useMaintenanceStore()
const search = ref('')
const statusFilter = ref('')
const dialog = ref(null)
const pending = ref(null)
const visibleReports = computed(() => {
  const term = search.value.trim().toLocaleLowerCase(locale.value)
  return store.reports.filter(report => (!statusFilter.value || report.status === statusFilter.value) &&
    (!term || `${report.bikeId} ${report.description}`.toLocaleLowerCase(locale.value).includes(term)))
})
const bikeCounts = computed(() => {
  const bikes = new Map(store.reports.map(report => [report.bikeId, report.status]))
  return { available: [...bikes.values()].filter(status => status === BIKE_STATUSES.AVAILABLE).length,
    maintenance: [...bikes.values()].filter(status => status === BIKE_STATUSES.MAINTENANCE).length }
})

function formatDate(value) {
  if (!value) return t('common.unknown')
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? t('common.unknown') : new Intl.DateTimeFormat(locale.value, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function problemLabel(type) { return PROBLEM_TYPES.includes(type) ? t(`maintenance.types.${type}`) : (type || t('common.unknown')) }

async function requestChange(report) {
  if (store.busy || !store.demoMode) return
  store.clearFeedback()
  pending.value = { bikeId: report.bikeId, from: report.status, to: nextBikeStatus(report.status) }
  if (!pending.value.to) return
  await nextTick()
  dialog.value.showModal()
}

function cancel(event) {
  if (store.busy) { event?.preventDefault(); return }
  event?.preventDefault()
  dialog.value.close()
  pending.value = null
}

async function confirm() {
  const change = pending.value
  if (!change || store.busy) return
  if (await store.updateBikeStatus(change.bikeId, change.to, change.from)) {
    dialog.value.close()
    pending.value = null
  }
}

onMounted(() => { store.clearFeedback(); if (store.demoMode) store.fetchReports() })
</script>

<template>
  <section class="maintenance-page">
    <div class="page-heading heading-row">
      <div><p class="eyebrow">{{ t('maintenance.title') }}</p><h1>{{ t('maintenance.management.title') }}</h1><p class="subtitle">{{ t('maintenance.management.subtitle') }}</p></div>
      <button type="button" class="btn btn-secondary" :disabled="store.busy || !store.demoMode" @click="store.fetchReports()">{{ t('common.refresh') }}</button>
    </div>
    <MaintenanceFeedback />
    <div class="stats-grid">
      <div class="surface stat-card"><span>{{ t('maintenance.management.total') }}</span><strong>{{ store.reports.length }}</strong></div>
      <div class="surface stat-card stat-highlight"><span>{{ t('maintenance.management.maintenance') }}</span><strong>{{ bikeCounts.maintenance }}</strong></div>
      <div class="surface stat-card"><span>{{ t('maintenance.management.available') }}</span><strong>{{ bikeCounts.available }}</strong></div>
    </div>
    <section class="surface report-list" :aria-busy="store.loading" aria-labelledby="list-title">
      <div class="list-heading"><h2 id="list-title">{{ t('maintenance.management.listTitle') }}</h2><span class="muted" role="status">{{ t('maintenance.management.results', { count: visibleReports.length }) }}</span></div>
      <div class="list-filters">
        <input v-model="search" type="search" class="form-control" :placeholder="t('common.search')" :aria-label="t('common.search')" />
        <select v-model="statusFilter" class="form-control" :aria-label="t('maintenance.management.filter')"><option value="">{{ t('common.all') }}</option><option v-for="status in BIKE_STATUSES" :key="status" :value="status">{{ t(`maintenance.statuses.${status}`) }}</option></select>
      </div>
      <div v-if="store.loading" class="empty-state" role="status"><span class="spinner" aria-hidden="true" /><p>{{ t('common.loading') }}</p></div>
      <div v-else-if="store.error && !store.loaded" class="empty-state"><h3>{{ t('maintenance.management.errorTitle') }}</h3><button type="button" class="btn btn-secondary" :disabled="store.busy || !store.demoMode" @click="store.fetchReports()">{{ t('common.retry') }}</button></div>
      <div v-else-if="!visibleReports.length" class="empty-state">
        <h3>{{ t(store.reports.length ? 'maintenance.management.noResultsTitle' : 'maintenance.management.emptyTitle') }}</h3>
        <p class="muted">{{ t(store.reports.length ? 'maintenance.management.noResultsText' : 'maintenance.management.emptyText') }}</p>
        <router-link v-if="!store.reports.length" :to="{ name: 'maintenance-report' }" class="btn btn-primary">{{ t('maintenance.management.create') }}</router-link>
      </div>
      <div v-else class="reports-grid">
        <article v-for="report in visibleReports" :key="report.reportId" class="report-card">
          <div class="report-card-heading"><h3>{{ t('maintenance.management.bike', { id: report.bikeId }) }}</h3><MaintenanceStatus :status="report.status" /></div>
          <p class="problem-label">{{ problemLabel(report.problemType) }}</p>
          <p class="report-description">{{ report.description }}</p>
          <p class="report-date"><span>{{ t('maintenance.management.date') }}:</span> <time :datetime="report.createdAt || undefined">{{ formatDate(report.createdAt) }}</time></p>
          <div class="report-actions" :aria-label="t('maintenance.management.actions')">
            <button v-if="nextBikeStatus(report.status)" type="button" class="btn" :class="report.status === BIKE_STATUSES.AVAILABLE ? 'btn-secondary' : 'btn-primary'" :disabled="store.busy || !store.demoMode" @click="requestChange(report)">
              {{ t(store.updatingBikeId === report.bikeId ? 'maintenance.management.updating' : report.status === BIKE_STATUSES.AVAILABLE ? 'maintenance.management.toMaintenance' : 'maintenance.management.toAvailable') }}
            </button>
            <p v-else class="muted">{{ t('maintenance.management.unknownState') }}</p>
          </div>
        </article>
      </div>
    </section>
    <dialog ref="dialog" class="confirm-dialog" aria-labelledby="confirm-title" aria-describedby="confirm-description" @cancel="cancel">
      <template v-if="pending">
        <h2 id="confirm-title">{{ t('maintenance.management.confirmTitle') }}</h2>
        <p id="confirm-description">{{ t('maintenance.management.confirmText', { bikeId: pending.bikeId, from: t(`maintenance.statuses.${pending.from}`), to: t(`maintenance.statuses.${pending.to}`) }) }}</p>
        <p v-if="store.error" role="alert" class="error-msg">{{ t(`maintenance.errors.${store.error}`) }}</p>
        <div class="dialog-actions"><button type="button" class="btn btn-secondary" autofocus :disabled="store.busy" @click="cancel">{{ t('common.cancel') }}</button><button type="button" class="btn btn-primary" :disabled="store.busy" @click="confirm">{{ t(store.busy ? 'maintenance.management.updating' : 'common.confirm') }}</button></div>
      </template>
    </dialog>
  </section>
</template>
