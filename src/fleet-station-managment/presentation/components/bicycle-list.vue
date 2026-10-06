<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import { useFleetStore } from '../../application/fleet.store.js';
import { BicycleStatus } from '../../domain/model/bicycle-status.enum.js';

const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const toast = useToast();
const store = useFleetStore();

// Modales de acciones rápidas
const assignDialogVisible = ref(false);
const statusDialogVisible = ref(false);
const selectedBicycle = ref(null);
const selectedBikePointId = ref(null);
const selectedStatus = ref(null);

const statusOptions = Object.values(BicycleStatus);

onMounted(async () => {
  await store.fetchAll();
});

const navigateToNew = () => router.push({ name: 'fleet-bicycles-new' });
const navigateToEdit = (id) => router.push({ name: 'fleet-bicycles-edit', params: { id } });

const getStatusSeverity = (status) => {
  switch (status) {
    case BicycleStatus.AVAILABLE: return 'success';
    case BicycleStatus.IN_USE: return 'info';
    case BicycleStatus.MAINTENANCE: return 'warn';
    case BicycleStatus.DISABLED: return 'danger';
    default: return 'secondary';
  }
};

const getStationName = (bikePointId) => {
  if (!bikePointId) return t('fleet.unassigned');
  const bp = store.getBikePointById(bikePointId);
  return bp ? `${bp.name} (${bp.district})` : bikePointId;
};

// Desbloquear Bicicleta
const handleUnlock = async (bicycle) => {
  try {
    await store.unlockBicycle(bicycle.bicycleId);
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('fleet.bicycleUnlocked'), life: 3000 });
  } catch (error) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: error.message, life: 3000 });
  }
};

// Abrir modal de asignación a estación
const openAssignDialog = (bicycle) => {
  selectedBicycle.value = bicycle;
  selectedBikePointId.value = bicycle.currentBikePointId;
  assignDialogVisible.value = true;
};

const confirmAssign = async () => {
  try {
    await store.assignBicycleToBikePoint(selectedBicycle.value.bicycleId, selectedBikePointId.value);
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('fleet.bicycleAssigned'), life: 3000 });
    assignDialogVisible.value = false;
  } catch (error) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: error.message, life: 3000 });
  }
};

// Abrir modal de cambio de estado
const openStatusDialog = (bicycle) => {
  selectedBicycle.value = bicycle;
  selectedStatus.value = bicycle.status;
  statusDialogVisible.value = true;
};

const confirmStatusChange = async () => {
  try {
    await store.updateBicycleStatus(selectedBicycle.value.bicycleId, selectedStatus.value);
    toast.add({ severity: 'success', summary: t('common.success'), detail: t('fleet.statusUpdated'), life: 3000 });
    statusDialogVisible.value = false;
  } catch (error) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: error.message, life: 3000 });
  }
};

const confirmDelete = (bicycle) => {
  confirm.require({
    message: t('fleet.deleteBicycleConfirmation', { code: bicycle.bikeCode }),
    header: t('common.confirmation'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await store.deleteBicycle(bicycle.bicycleId);
        toast.add({ severity: 'success', summary: t('common.success'), detail: t('fleet.bicycleDeleted'), life: 3000 });
      } catch (error) {
        toast.add({ severity: 'error', summary: t('common.error'), detail: error.message, life: 3000 });
      }
    }
  });
};
</script>

<template>
  <div class="p-4">
    <pv-card>
      <template #title>
        <div class="flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h2 class="m-0 text-xl font-bold">{{ t('fleet.bicyclesTitle') }}</h2>
            <span class="text-xs text-500">{{ t('fleet.bicyclesSubtitle') }}</span>
          </div>
          <pv-button
              :label="t('fleet.newBicycle')"
              icon="pi pi-plus"
              class="p-button-primary"
              @click="navigateToNew"
          />
        </div>
      </template>
      <template #content>
        <pv-data-table
            :value="store.bicycles"
            :loading="store.loading"
            paginator
            :rows="10"
            responsiveLayout="scroll"
            class="p-datatable-sm"
        >
          <pv-column field="bikeCode" :header="t('fleet.bikeCode')" sortable>
            <template #body="{ data }">
              <span class="font-bold text-primary">{{ data.bikeCode }}</span>
            </template>
          </pv-column>
          <pv-column field="serialNumber" :header="t('fleet.serialNumber')" sortable />
          <pv-column field="model" :header="t('fleet.model')" sortable />
          <pv-column field="qrCode" :header="t('fleet.qrCode')">
            <template #body="{ data }">
              <span class="text-xs font-mono text-600 bg-gray-100 p-1 border-round">{{ data.qrCode }}</span>
            </template>
          </pv-column>
          <pv-column field="status" :header="t('fleet.status')" sortable>
            <template #body="{ data }">
              <pv-tag :value="data.status" :severity="getStatusSeverity(data.status)" />
            </template>
          </pv-column>
          <pv-column :header="t('fleet.currentStation')">
            <template #body="{ data }">
                            <span :class="{'text-500 italic': !data.currentBikePointId}">
                                {{ getStationName(data.currentBikePointId) }}
                            </span>
            </template>
          </pv-column>
          <pv-column :header="t('common.actions')" class="text-right">
            <template #body="{ data }">
              <div class="flex justify-content-end gap-1">
                <!-- Desbloquear si está disponible -->
                <pv-button
                    v-if="data.status === BicycleStatus.AVAILABLE"
                    icon="pi pi-lock-open"
                    class="p-button-text p-button-sm p-button-success"
                    v-tooltip="t('fleet.unlockBicycle')"
                    @click="handleUnlock(data)"
                />
                <!-- Asignar a estación -->
                <pv-button
                    icon="pi pi-map-marker"
                    class="p-button-text p-button-sm p-button-info"
                    v-tooltip="t('fleet.assignStation')"
                    @click="openAssignDialog(data)"
                />
                <!-- Cambiar estado -->
                <pv-button
                    icon="pi pi-sync"
                    class="p-button-text p-button-sm p-button-warning"
                    v-tooltip="t('fleet.changeStatus')"
                    @click="openStatusDialog(data)"
                />
                <!-- Editar -->
                <pv-button
                    icon="pi pi-pencil"
                    class="p-button-text p-button-sm p-button-secondary"
                    @click="navigateToEdit(data.bicycleId)"
                />
                <!-- Eliminar -->
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

    <!-- Dialog: Asignar a estación -->
    <pv-dialog v-model:visible="assignDialogVisible" :header="t('fleet.assignStation')" modal class="w-11 md:w-5">
      <div class="p-fluid">
        <label class="font-medium block mb-2">{{ t('fleet.selectStation') }}</label>
        <pv-dropdown
            v-model="selectedBikePointId"
            :options="store.bikePoints"
            optionLabel="name"
            optionValue="bikePointId"
            :placeholder="t('fleet.chooseStationPlaceholder')"
        />
      </div>
      <template #footer>
        <pv-button :label="t('common.cancel')" class="p-button-text" @click="assignDialogVisible = false" />
        <pv-button :label="t('common.save')" class="p-button-primary" @click="confirmAssign" />
      </template>
    </pv-dialog>

    <!-- Dialog: Cambiar Estado -->
    <pv-dialog v-model:visible="statusDialogVisible" :header="t('fleet.changeStatus')" modal class="w-11 md:w-4">
      <div class="p-fluid">
        <label class="font-medium block mb-2">{{ t('fleet.selectNewStatus') }}</label>
        <pv-dropdown v-model="selectedStatus" :options="statusOptions" />
      </div>
      <template #footer>
        <pv-button :label="t('common.cancel')" class="p-button-text" @click="statusDialogVisible = false" />
        <pv-button :label="t('common.save')" class="p-button-primary" @click="confirmStatusChange" />
      </template>
    </pv-dialog>
  </div>
</template>