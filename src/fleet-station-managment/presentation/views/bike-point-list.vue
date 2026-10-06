<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { useFleetStore } from '../../application/fleet.store.js';
import { BikePointStatus } from '../../domain/model/bike-point-status.enum.js';

const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();
const store = useFleetStore();

onMounted(async () => {
  await store.fetchAll();
});

const navigateToNew = () => router.push({ name: 'fleet-bike-points-new' });
const navigateToEdit = (id) => router.push({ name: 'fleet-bike-points-edit', params: { id } });

const getStatusSeverity = (status) => {
  switch (status) {
    case BikePointStatus.OPERATIONAL: return 'success';
    case BikePointStatus.FULL: return 'warn';
    case BikePointStatus.MAINTENANCE: return 'info';
    case BikePointStatus.DISABLED: return 'danger';
    default: return 'secondary';
  }
};

const handleDisable = async (bikePoint) => {
  try {
    await store.disableBikePoint(bikePoint.bikePointId);
    toast.add({ severity: 'info', summary: t('common.success'), detail: t('fleet.bikePointDisabled'), life: 3000 });
  } catch (error) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: error.message, life: 3000 });
  }
};

const confirmDelete = (bikePoint) => {
  confirm.require({
    message: t('fleet.deleteBikePointConfirmation', { name: bikePoint.name }),
    header: t('common.confirmation'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await store.deleteBikePoint(bikePoint.bikePointId);
        toast.add({ severity: 'success', summary: t('common.success'), detail: t('fleet.bikePointDeleted'), life: 3000 });
      } catch (error) {
        toast.add({ severity: 'error', summary: t('common.error'), detail: error.message, life: 3000 });
      }
    }
  });
};
</script>

<template>
  <div class="p-4">
    <!-- Tarjetas de Métricas -->
    <div class="grid mb-4">
      <div class="col-12 md:col-3">
        <pv-card class="shadow-1">
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <span class="text-secondary text-sm font-medium">{{ t('fleet.totalBikePoints') }}</span>
              <i class="pi pi-map-marker text-primary text-xl"></i>
            </div>
          </template>
          <template #content>
            <span class="text-3xl font-bold text-900">{{ store.bikePointsCount }}</span>
          </template>
        </pv-card>
      </div>
      <div class="col-12 md:col-3">
        <pv-card class="shadow-1">
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <span class="text-secondary text-sm font-medium">{{ t('fleet.operationalStations') }}</span>
              <i class="pi pi-check-circle text-green-500 text-xl"></i>
            </div>
          </template>
          <template #content>
            <span class="text-3xl font-bold text-green-600">{{ store.operationalBikePointsCount }}</span>
          </template>
        </pv-card>
      </div>
      <div class="col-12 md:col-3">
        <pv-card class="shadow-1">
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <span class="text-secondary text-sm font-medium">{{ t('fleet.totalBicycles') }}</span>
              <i class="pi pi-compass text-blue-500 text-xl"></i>
            </div>
          </template>
          <template #content>
            <span class="text-3xl font-bold text-blue-600">{{ store.bicyclesCount }}</span>
          </template>
        </pv-card>
      </div>
      <div class="col-12 md:col-3">
        <pv-card class="shadow-1">
          <template #title>
            <div class="flex justify-content-between align-items-center">
              <span class="text-secondary text-sm font-medium">{{ t('fleet.availableBicycles') }}</span>
              <i class="pi pi-bolt text-amber-500 text-xl"></i>
            </div>
          </template>
          <template #content>
            <span class="text-3xl font-bold text-amber-600">{{ store.availableBicyclesCount }}</span>
          </template>
        </pv-card>
      </div>
    </div>

    <!-- Encabezado y Tabla -->
    <pv-card>
      <template #title>
        <div class="flex justify-content-between align-items-center flex-wrap gap-2">
          <h2 class="m-0 text-xl font-bold">{{ t('fleet.bikePointsTitle') }}</h2>
          <pv-button
              :label="t('fleet.newBikePoint')"
              icon="pi pi-plus"
              class="p-button-primary"
              @click="navigateToNew"
          />
        </div>
      </template>
      <template #content>
        <pv-data-table
            :value="store.bikePoints"
            :loading="store.loading"
            paginator
            :rows="10"
            responsiveLayout="scroll"
            class="p-datatable-sm"
        >
          <pv-column field="name" :header="t('fleet.name')" sortable>
            <template #body="{ data }">
              <span class="font-semibold">{{ data.name }}</span>
              <div class="text-xs text-500">{{ data.district }}</div>
            </template>
          </pv-column>
          <pv-column field="address" :header="t('fleet.address')" />
          <pv-column field="capacity" :header="t('fleet.capacity')" sortable class="text-center" />
          <pv-column field="currentBicyclesCount" :header="t('fleet.dockedBikes')" sortable class="text-center">
            <template #body="{ data }">
              <span class="font-bold text-primary">{{ data.currentBicyclesCount }}</span> / {{ data.capacity }}
            </template>
          </pv-column>
          <pv-column :header="t('fleet.availableSlots')" class="text-center">
            <template #body="{ data }">
                            <span :class="{'text-red-500 font-bold': data.availableSlots === 0}">
                                {{ data.getAvailableSlots() }}
                            </span>
            </template>
          </pv-column>
          <pv-column field="status" :header="t('fleet.status')" sortable>
            <template #body="{ data }">
              <pv-tag :value="data.status" :severity="getStatusSeverity(data.status)" />
            </template>
          </pv-column>
          <pv-column :header="t('common.actions')" class="text-right">
            <template #body="{ data }">
              <div class="flex justify-content-end gap-1">
                <pv-button
                    icon="pi pi-pencil"
                    class="p-button-text p-button-sm p-button-secondary"
                    @click="navigateToEdit(data.bikePointId)"
                />
                <pv-button
                    v-if="data.status !== BikePointStatus.DISABLED"
                    icon="pi pi-ban"
                    class="p-button-text p-button-sm p-button-warning"
                    v-tooltip="t('fleet.disableStation')"
                    @click="handleDisable(data)"
                />
                <pv-button
                    icon="pi pi-trash"
                    class="p-button-text p-button-sm p-button-danger"
                    @click="confirmDelete(data)"
                />
              </div>
            </template>
          </pv-column>
        </pv-data-table>
      </template>
    </pv-card>
  </div>
</template>