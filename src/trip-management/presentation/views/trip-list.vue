<script setup>
import {onMounted, toRefs, computed} from "vue";
import {useRouter} from "vue-router";
import useTripManagementStore from "../../application/trip-management.store.js";

import { useIamStore } from '../../../iam/application/iam.store.js';
const iam = useIamStore();
const router = useRouter();
const store = useTripManagementStore();
const {trips, tripsLoaded, errors} = toRefs(store);
const {fetchTrips} = store;
const userTrips = computed(() => trips.value.filter(trip => String(trip.userId) === String(iam.currentUser?.id)));

onMounted(() => {
    if (!store.tripsLoaded) {
        fetchTrips().catch(() => {});
    }
});

const goToTrip = (tripId) => {
    router.push({name: 'trip-management-trips', query: {id: tripId}});
};
</script>

<template>
  <div class="p-4">
    <h1>Trip Management</h1>

    <pv-data-table
        :value="userTrips"
        :loading="!tripsLoaded && !errors.length"
        striped-rows
        table-style="min-width: 70rem"
        paginator
        :rows="5"
        :rows-per-page-options="[5, 10, 20]"
    >
      <pv-column field="tripId" header="Trip ID" sortable />
      <pv-column field="userId" header="User" sortable />
      <pv-column field="bicycleId" header="Bicycle" sortable />
      <pv-column field="startedAt" header="Started At" />
      <pv-column field="finishedAt" header="Finished At" />
      <pv-column field="distanceKm" header="Distance (km)" sortable />
      <pv-column field="status" header="Status" sortable />
      <pv-column field="totalCost" header="Total Cost" sortable />
      <pv-column header="Actions">
        <template #body="slotProps">
          <pv-button icon="pi pi-eye" text rounded @click="goToTrip(slotProps.data.tripId)" />
          <pv-button icon="pi pi-wrench" :label="$t('integration.report')" text @click="router.push({ name: 'maintenance-report', query: { bikeId: slotProps.data.bicycleId } })" />
        </template>
      </pv-column>
    </pv-data-table>

    <div v-if="errors.length" class="text-red-500 mt-3">
      Errors: {{ errors.map(error => error.message).join(', ') }}
    </div>
  </div>
</template>

<style scoped>
</style>
