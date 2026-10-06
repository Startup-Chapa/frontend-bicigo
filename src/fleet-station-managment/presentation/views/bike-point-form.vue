<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast as usePrimeToast } from 'primevue/usetoast';
import { useFleetStore } from '../../application/fleet.store.js';
import { RegisterBikePointCommand } from '../../domain/model/register-bike-point.command.js';
import { BikePointStatus } from '../../domain/model/bike-point-status.enum.js';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const toast = usePrimeToast();
const store = useFleetStore();

const id = computed(() => route.params.id);
const isEdit = computed(() => Boolean(id.value));

const form = ref({
  name: '',
  district: '',
  address: '',
  latitude: 0,
  longitude: 0,
  capacity: 10,
  status: BikePointStatus.OPERATIONAL
});

const statusOptions = Object.values(BikePointStatus);

onMounted(async () => {
  if (isEdit.value) {
    if (!store.bikePointsLoaded) {
      await store.fetchBikePoints();
    }
    const existing = store.getBikePointById(id.value);
    if (existing) {
      form.value = {
        name: existing.name,
        district: existing.district,
        address: existing.address,
        latitude: existing.latitude,
        longitude: existing.longitude,
        capacity: existing.capacity,
        status: existing.status
      };
    } else {
      toast.add({ severity: 'error', summary: t('common.error'), detail: t('fleet.notFound'), life: 3000 });
      navigateBack();
    }
  }
});

const navigateBack = () => router.push({ name: 'fleet-bike-points' });

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      const bikePoint = store.getBikePointById(id.value);
      bikePoint.name = form.value.name;
      bikePoint.district = form.value.district;
      bikePoint.address = form.value.address;
      bikePoint.latitude = form.value.latitude;
      bikePoint.longitude = form.value.longitude;
      bikePoint.updateStatus(form.value.status);
      bikePoint.assignCapacity(Number(form.value.capacity));
      await store.updateBikePoint(bikePoint);
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('fleet.bikePointUpdated'), life: 3000 });
    } else {
      const command = new RegisterBikePointCommand(form.value);
      await store.addBikePoint(command);
      toast.add({ severity: 'success', summary: t('common.success'), detail: t('fleet.bikePointCreated'), life: 3000 });
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
            {{ isEdit ? t('fleet.editBikePoint') : t('fleet.newBikePoint') }}
          </h2>
        </div>
      </template>
      <template #content>
        <form @submit.prevent="handleSubmit" class="p-fluid grid formgrid">
          <div class="field col-12 md:col-6">
            <label for="name" class="font-medium">{{ t('fleet.name') }} *</label>
            <pv-input-text id="name" v-model="form.name" required />
          </div>
          <div class="field col-12 md:col-6">
            <label for="district" class="font-medium">{{ t('fleet.district') }} *</label>
            <pv-input-text id="district" v-model="form.district" required />
          </div>
          <div class="field col-12">
            <label for="address" class="font-medium">{{ t('fleet.address') }} *</label>
            <pv-input-text id="address" v-model="form.address" required />
          </div>
          <div class="field col-12 md:col-4">
            <label for="capacity" class="font-medium">{{ t('fleet.capacity') }} *</label>
            <pv-input-number id="capacity" v-model="form.capacity" :min="1" required />
          </div>
          <div class="field col-12 md:col-4">
            <label for="latitude" class="font-medium">{{ t('fleet.latitude') }}</label>
            <pv-input-number id="latitude" v-model="form.latitude" :minFractionDigits="4" :maxFractionDigits="6" />
          </div>
          <div class="field col-12 md:col-4">
            <label for="longitude" class="font-medium">{{ t('fleet.longitude') }}</label>
            <pv-input-number id="longitude" v-model="form.longitude" :minFractionDigits="4" :maxFractionDigits="6" />
          </div>
          <div v-if="isEdit" class="field col-12">
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