<template>
  <div class="kpi-card" :class="{ 'alert-active': alertActive }">
    <p class="kpi-label">{{ label }}</p>
    <p class="kpi-value" :class="{ danger: alertActive }">{{ value }}</p>
    <p v-if="trend" class="kpi-trend" :class="{ down: trendDown }">
      <i :class="trendDown ? 'pi pi-arrow-down' : 'pi pi-arrow-up'" />
      {{ trend }}
    </p>
    <i v-if="icon" :class="icon" class="kpi-icon" />
  </div>
</template>

<script setup>
const props = defineProps({
  label:       { type: String, required: true },
  value:       { type: [String, Number], required: true },
  trend:       { type: String,  default: '' },
  trendDown:   { type: Boolean, default: false },
  icon:        { type: String,  default: '' },
  alertActive: { type: Boolean, default: false }
})
</script>

<style scoped>
.kpi-card {
  background: var(--color-neutral-light);
  border-radius: var(--radius-max);
  border: 1px solid var(--color-border);
  padding: 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}

.kpi-card.alert-active { border-color: rgba(211, 47, 47, 0.4); }

.kpi-label {
  font-size: 0.8rem;
  color: var(--color-neutral-medium);
  font-weight: 500;
}

.kpi-value {
  font-family: var(--font-primary);
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--color-neutral-dark);
}

.kpi-value.danger { color: var(--color-danger); }

.kpi-icon {
  position: absolute;
  top: 1.1rem;
  right: 1.1rem;
  opacity: 0.6;
  font-size: 1.1rem;
  color: var(--color-primary-dark);
}

.kpi-trend {
  font-size: 0.75rem;
  color: var(--color-primary-dark);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.kpi-trend.down { color: var(--color-danger); }
</style>