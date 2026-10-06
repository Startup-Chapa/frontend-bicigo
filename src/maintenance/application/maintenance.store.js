import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { maintenanceApi } from '../infrastructure/maintenance-api.js'
import { MaintenanceAssembler } from '../infrastructure/maintenance.assembler.js'
import { MaintenanceReport, nextBikeStatus, validateReport } from '../domain/model/maintenance.entity.js'

export function maintenanceErrorKey(error) {
  const known = ['integrationPending', 'invalidResponse', 'storageUnavailable', 'invalidDemoData', 'invalidReport', 'notFound', 'conflict', 'invalidTransition']
  if (known.includes(error?.code)) return error.code
  const status = error?.response?.status
  if (status === 401 || status === 403) return 'forbidden'
  if (status === 409) return 'conflict'
  return 'requestFailed'
}

export const useMaintenanceStore = defineStore('maintenance', () => {
  const reports = ref([])
  const loading = ref(false)
  const submitting = ref(false)
  const updatingBikeId = ref(null)
  const error = ref(null)
  const loaded = ref(false)
  const demoMode = ref(false)
  const success = ref(null)
  const busy = computed(() => loading.value || submitting.value || updatingBikeId.value !== null)

  function clearFeedback() { error.value = null; success.value = null }

  async function fetchReports() {
    if (busy.value) return false
    loading.value = true
    clearFeedback()
    try {
      reports.value = MaintenanceAssembler.toEntitiesFromResponse(await maintenanceApi.getReports())
      loaded.value = true
      return true
    } catch (e) { error.value = maintenanceErrorKey(e); loaded.value = false; return false }
    finally { loading.value = false }
  }

  async function enableDemo() {
    if (busy.value) return false
    maintenanceApi.enableDemo()
    demoMode.value = true
    reports.value = []
    loaded.value = false
    return fetchReports()
  }

  async function createReport(data) {
    if (busy.value) return false
    clearFeedback()
    if (Object.keys(validateReport(data)).length) { error.value = 'invalidReport'; return false }
    submitting.value = true
    try {
      const payload = MaintenanceAssembler.toResourceFromEntity(new MaintenanceReport(data))
      const response = await maintenanceApi.createReport(payload)
      if (![200, 201].includes(response.status)) throw Object.assign(new Error('Invalid response'), { code: 'invalidResponse' })
      const report = MaintenanceAssembler.toEntityFromResource(response.data)
      reports.value.unshift(report)
      success.value = 'reportCreated'
      return true
    } catch (e) { error.value = maintenanceErrorKey(e); return false }
    finally { submitting.value = false }
  }

  async function updateBikeStatus(bikeId, status, expectedStatus) {
    if (busy.value) return false
    clearFeedback()
    const report = reports.value.find(item => item.bikeId === bikeId)
    if (!report || report.status !== expectedStatus || nextBikeStatus(expectedStatus) !== status) {
      error.value = 'invalidTransition'
      return false
    }
    updatingBikeId.value = bikeId
    try {
      const response = await maintenanceApi.updateBikeStatus(bikeId, status, expectedStatus)
      if (![200, 204].includes(response.status)) throw Object.assign(new Error('Invalid response'), { code: 'invalidResponse' })
      // Status belongs to a bicycle: update all its reports together.
      reports.value = reports.value.map(item => item.bikeId === bikeId ? new MaintenanceReport({ ...item, status }) : item)
      success.value = 'statusUpdated'
      return true
    } catch (e) { error.value = maintenanceErrorKey(e); return false }
    finally { updatingBikeId.value = null }
  }

  return { reports, loading, submitting, updatingBikeId, error, loaded, demoMode, success, busy,
    fetchReports, createReport, updateBikeStatus, enableDemo, clearFeedback }
})
