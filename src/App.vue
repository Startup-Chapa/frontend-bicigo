<script setup>
import { RouterView } from 'vue-router'
import { watch } from 'vue'
import { useIamStore } from './iam/application/iam.store.js'
import { useBillingStore } from './billing/application/billing-store.js'
import { useMaintenanceStore } from './maintenance/application/maintenance.store.js'
import useTripManagementStore from './trip-management/application/trip-management.store.js'
import { useFleetStore } from './fleet-station-managment/application/fleet.store.js'

const iam = useIamStore()
const billing = useBillingStore()
const maintenance = useMaintenanceStore()
const trips = useTripManagementStore()
const fleet = useFleetStore()
watch(() => iam.currentUser?.id, () => {
  billing.$reset()
  maintenance.clearSession()
  trips.clearSession()
  fleet.$reset()
}, { flush: 'sync' })
</script>

<template>
  <RouterView />
  <pv-toast position="top-right" />
  <pv-confirm-dialog />
</template>
