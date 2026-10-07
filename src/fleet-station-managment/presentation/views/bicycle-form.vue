<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useFleetStore } from '../../application/fleet.store.js';
import { RegisterBicycleCommand } from '../../domain/model/register-bicycle.command.js';
import { BicycleStatus } from '../../domain/model/bicycle-status.enum.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const store = useFleetStore();

const id = computed(() => route.params.id);
const isEdit = computed(() => Boolean(id.value));

const form = ref({
  serialNumber: '',
  bikeCode: '',
  qrCode: '',
  model: '',
  status: BicycleStatus.AVAILABLE,
  currentBikePointId: null
});

const statusOptions = Object.values(BicycleStatus);

onMounted(async () => {
  if (!store.bikePointsLoaded) {
    await store.fetchBikePoints();
  }
  if (isEdit.value) {
    if (!store.bicyclesLoaded) {
      await store.fetchBicycles();
    }
    const existing = store.getBicycleById(id.value);
    if (existing) {
      form.value = {
        serialNumber: existing.serialNumber,
        bikeCode: existing.bikeCode,
        qrCode: existing.qrCode,
        model: existing.model,
        status: existing.status,
        currentBikePointId: existing.currentBikePointId
      };
    } else {
      toast.add({ severity: 'error', summary: t('common.error'), detail: t('fleet.notFound'), life: 3000 });
      navigateBack();
    }
  }
});

const navigateBack = () => router.push({ name: 'fleet-bicycles' });

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      const bicycle = store.getBicycleById(id.value);
      bicycle.serialNumber = form.value.serialNumber;
      bicycle.bikeCode = form.value.bikeCode;
      bicycle.qrCode = form.value.qrCode;
      bicycle.model = form.value.model;
      bicycle.updateStatus(form.value.status);
      if (form.value.currentBikePointId !== bicycle.currentBikePointId) {
        await store.assignBicycleToBikePoint(bicycle.bicycleId, form.value.currentBikePointId);
      }
      await store.updateBicycle(bicycle);
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('fleet.bicycleUpdated'), life: 3000 });
    } else {
      const command = new RegisterBicycleCommand(form.value);
      await store.addBicycle(command);
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('fleet.bicycleCreated'), life: 3000 });
    }
    navigateBack();
  } catch (error) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: error.message, life: 3000 });
  }
};
</script>

<template>
  <div class="p-4 flex justify-content-center">
    <pv-card class="w-full md:w-8 lg:w-6 shadow-2">
      <template #title>
        <div class="flex align-items-center gap-2">
          <pv-button icon="pi pi-arrow-left" class="p-button-text p-button-sm" @click="navigateBack" />
          <h2 class="m-0 text-xl font-bold">
            {{ isEdit ? t('fleet.editBicycle') : t('fleet.newBicycle') }}
          </h2>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="handleSubmit" class="p-fluid grid formgrid">
          <div class="field col-12 md:col-6">
            <label for="bikeCode" class="font-medium">{{ t('fleet.bikeCode') }} *</label>
            <pv-input-text id="bikeCode" v-model="form.bikeCode" required placeholder="BK-1001" />
          </div>
          <div class="field col-12 md:col-6">
            <label for="serialNumber" class="font-medium">{{ t('fleet.serialNumber') }} *</label>
            <pv-input-text id="serialNumber" v-model="form.serialNumber" required placeholder="SN-987654321" />
          </div>
          <div class="field col-12 md:col-6">
            <label for="model" class="font-medium">{{ t('fleet.model') }} *</label>
            <pv-input-text id="model" v-model="form.model" required placeholder="City Cruiser V2" />
          </div>
          <div class="field col-12 md:col-6">
            <label for="qrCode" class="font-medium">{{ t('fleet.qrCode') }} *</label>
            <pv-input-text id="qrCode" v-model="form.qrCode" required placeholder="QR-BK-1001" />
          </div>
          <div class="field col-12 md:col-6">
            <label for="station" class="font-medium">{{ t('fleet.initialStation') }}</label>
            <pv-dropdown
                id="station"
                v-model="form.currentBikePointId"
                :options="store.bikePoints"
                optionLabel="name"
                optionValue="bikePointId"
                showClear
                :placeholder="t('fleet.chooseStationPlaceholder')"
            />
          </div>
          <div v-if="isEdit" class="field col-12 md:col-6">
            <label for="status" class="font-medium">{{ t('fleet.status') }}</label>
            <pv-dropdown id="status" v-model="form.status" :options="statusOptions" />
          </div>

          <div class="col-12 flex justify-content-end gap-2 mt-3">
            <pv-button :label="t('common.cancel')" class="p-button-text p-button-secondary" @click="navigateBack" />
            <pv-button :label="t('common.save')" type="submit" icon="pi pi-check" :loading="store.loading" />
          </div>
        </form>
      </template>
    </pv-card>
  </div>
</template>