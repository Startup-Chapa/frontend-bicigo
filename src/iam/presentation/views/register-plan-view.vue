<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useBillingStore } from '../../../billing/application/billing-store.js'
const { t } = useI18n()
const router = useRouter()
const billing = useBillingStore()
const selectedPlanId = ref(null)
function continueWithPlan() {
  const plan = billing.plans.find(item => item.id === selectedPlanId.value)
  if (!plan) return
  if (plan.type === 'PAY_PER_USE') { router.push({ name: 'dashboard' }); return }
  billing.selectPlan(plan)
  router.push({ name: 'subscribe', query: { planId: plan.id } })
}
onMounted(() => billing.fetchPlans())
</script>

<template>
  <section class="maintenance-page plan-selection">
    <div class="page-heading"><h1>{{ t('integration.registerPlan') }}</h1><p class="subtitle">{{ t('integration.selectionSubtitle') }}</p></div>
    <p v-if="billing.loading" role="status">{{ t('common.loading') }}</p>
    <div v-else-if="billing.error" class="alert alert-danger" role="alert">{{ t('integration.billingEmpty') }} <button type="button" class="btn btn-secondary" @click="billing.fetchPlans()">{{ t('common.retry') }}</button></div>
    <div v-else class="plan-options">
      <label v-for="plan in billing.plans" :key="plan.id" class="surface plan-option" :class="{ selected: selectedPlanId === plan.id }">
        <pv-radio-button v-model="selectedPlanId" :input-id="'plan-' + plan.id" :value="plan.id" />
        <span><strong>{{ plan.name }}</strong><small>{{ plan.description }}</small></span>
        <strong>S/ {{ Number(plan.price).toFixed(2) }}</strong>
      </label>
      <button type="button" class="btn btn-primary" :disabled="!selectedPlanId" @click="continueWithPlan">{{ t('integration.selectPlan') }}</button>
    </div>
  </section>
</template>

<style scoped>
.plan-selection { max-width: 800px; }
.plan-options { display: grid; gap: 20px; }
.plan-option { display: flex; align-items: center; gap: 16px; padding: 24px; cursor: pointer; }
.plan-option.selected { border-color: var(--accent); }
.plan-option span { flex: 1; min-width: 0; }
.plan-option small { display: block; color: var(--text); }
@media (max-width: 600px) { .plan-option { padding: 16px; flex-wrap: wrap; } }
</style>
