<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMaintenanceStore } from '../../application/maintenance.store.js'
import { PROBLEM_TYPES, REPORT_LIMITS, validateReport } from '../../domain/model/maintenance.entity.js'
import MaintenanceFeedback from '../components/maintenance-feedback.vue'

const { t } = useI18n()
const store = useMaintenanceStore()
const form = reactive({ bikeId: '', problemType: '', description: '' })
const attempted = ref(false)
const formElement = ref(null)
const errors = computed(() => attempted.value ? validateReport(form) : {})
onMounted(() => store.clearFeedback())

async function submit() {
  if (store.busy || !store.demoMode) return
  attempted.value = true
  store.clearFeedback()
  if (Object.keys(errors.value).length) {
    await nextTick()
    formElement.value?.querySelector('[aria-invalid="true"]')?.focus()
    return
  }
  if (await store.createReport(form)) {
    Object.assign(form, { bikeId: '', problemType: '', description: '' })
    attempted.value = false
  }
}
</script>

<template>
  <section class="maintenance-page">
    <div class="page-heading">
      <p class="eyebrow">{{ t('maintenance.eyebrow') }}</p>
      <h1>{{ t('maintenance.report.title') }}</h1>
      <p class="subtitle">{{ t('maintenance.report.subtitle') }}</p>
    </div>
    <MaintenanceFeedback />
    <div class="report-layout">
      <form ref="formElement" class="surface report-form" novalidate :aria-busy="store.submitting" @submit.prevent="submit">
        <h2>{{ t('maintenance.report.formTitle') }}</h2>
        <p class="muted form-note">{{ t('maintenance.report.required') }}</p>
        <div class="form-field">
          <label for="bike-id">{{ t('maintenance.report.bikeId') }}</label>
          <input id="bike-id" v-model="form.bikeId" name="bikeId" class="form-control" required :maxlength="REPORT_LIMITS.bikeId" :placeholder="t('maintenance.report.bikePlaceholder')" :disabled="store.submitting" :aria-invalid="!!errors.bikeId" :aria-describedby="errors.bikeId ? 'bike-help bike-error' : 'bike-help'" />
          <p id="bike-help" class="field-help">{{ t('maintenance.report.bikeHelp') }}</p>
          <p v-if="errors.bikeId" id="bike-error" class="error-msg">{{ t(`maintenance.validation.${errors.bikeId}`) }}</p>
        </div>
        <div class="form-field">
          <label for="problem-type">{{ t('maintenance.report.problemType') }}</label>
          <select id="problem-type" v-model="form.problemType" name="problemType" class="form-control" required :disabled="store.submitting" :aria-invalid="!!errors.problemType" :aria-describedby="errors.problemType ? 'type-error' : undefined">
            <option value="" disabled>{{ t('maintenance.report.selectType') }}</option>
            <option v-for="type in PROBLEM_TYPES" :key="type" :value="type">{{ t(`maintenance.types.${type}`) }}</option>
          </select>
          <p v-if="errors.problemType" id="type-error" class="error-msg">{{ t(`maintenance.validation.${errors.problemType}`) }}</p>
        </div>
        <div class="form-field">
          <label for="description">{{ t('maintenance.report.description') }}</label>
          <textarea id="description" v-model="form.description" name="description" class="form-control" rows="6" required :maxlength="REPORT_LIMITS.descriptionMax" :placeholder="t('maintenance.report.descriptionPlaceholder')" :disabled="store.submitting" :aria-invalid="!!errors.description" :aria-describedby="errors.description ? 'description-help description-error' : 'description-help'" />
          <div class="field-meta"><p id="description-help" class="field-help">{{ t('maintenance.report.descriptionHelp') }}</p><span class="field-help">{{ t('maintenance.report.characters', { count: form.description.length, max: REPORT_LIMITS.descriptionMax }) }}</span></div>
          <p v-if="errors.description" id="description-error" class="error-msg">{{ t(`maintenance.validation.${errors.description}`) }}</p>
        </div>
        <button type="submit" class="btn btn-primary submit-button" :disabled="store.busy || !store.demoMode">
          <span v-if="store.submitting" class="spinner" aria-hidden="true" />
          {{ t(store.submitting ? 'maintenance.report.submitting' : 'maintenance.report.submit') }}
        </button>
      </form>
      <aside class="report-aside">
        <section class="care-card"><span class="care-symbol" aria-hidden="true">↗</span><h2>{{ t('maintenance.report.asideTitle') }}</h2><p>{{ t('maintenance.report.asideText') }}</p></section>
        <section class="surface safety-card"><h2>{{ t('maintenance.report.safetyTitle') }}</h2><p class="muted">{{ t('maintenance.report.safetyText') }}</p></section>
        <router-link :to="{ name: 'maintenance-management' }" class="text-link">{{ t('maintenance.report.reviewReports') }} <span aria-hidden="true">→</span></router-link>
      </aside>
    </div>
  </section>
</template>
