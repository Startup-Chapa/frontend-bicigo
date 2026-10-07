<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { BIKE_STATUSES } from '../../domain/model/maintenance.entity.js'
const props = defineProps({ status: { type: String, default: null } })
const { t } = useI18n()
const known = computed(() => Object.values(BIKE_STATUSES).includes(props.status))
</script>

<template>
  <span class="status-chip" :class="{ 'status-available': status === BIKE_STATUSES.AVAILABLE, 'status-maintenance': status === BIKE_STATUSES.MAINTENANCE }">
    <span class="status-dot" aria-hidden="true" />
    {{ known ? t(`maintenance.statuses.${status}`) : (status || t('common.unknown')) }}
  </span>
</template>
