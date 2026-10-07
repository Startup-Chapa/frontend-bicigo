<script setup>
import { reactive, computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBillingStore } from '../../application/billing-store.js'
import { useIamStore, PLANS } from '../../../iam/application/iam.store.js'

const router = useRouter()
const billing = useBillingStore()
const iam = useIamStore()
const route = useRoute()
const syncPending = ref(false)
const targetPlan = computed(() => plan.value?.type === 'MONTHLY' ? PLANS.PRO : PLANS.TARIFA)

const plan = computed(() => billing.plans.find(p => String(p.id) === String(route.query.planId)) ?? billing.selectedPlan ?? billing.plans.find(p => p.recommended))

onMounted(() => { if (!billing.plans.length) billing.fetchPlans() })

const form = reactive({
  cardNumber: '',
  cardHolder: '',
  expiry: '',
  cvv: ''
})

function generateRandomData() {
  form.cardNumber = '4111 1111 1111 ' + Math.floor(1000 + Math.random() * 9000)
  form.cardHolder = iam.currentUser?.username || ''
  form.expiry = '12/28'
  form.cvv = String(Math.floor(100 + Math.random() * 900))
}

async function pay() {
  if (!plan.value || billing.loading || syncPending.value) return
  try {
    await billing.purchaseSubscription({ userId: iam.currentUser?.id, plan: plan.value, card: form })
    syncPending.value = true
    await synchronizePlan()
  } catch {
    // error already stored in the store
  }
}

async function synchronizePlan() {
  if (iam.loading) return
  if (await iam.updateProfile({ plan: targetPlan.value })) {
    syncPending.value = false
    router.push({ name: 'payment-success' })
  }
}
</script>

<template>
  <div class="pay-page">
    <h1>Realiza tu pago</h1>
    <p class="subtitle" v-if="plan">Plan {{ plan.name }}: {{ plan.price > 0 ? `S/ ${plan.price.toFixed(2)} / mes` : 'pago por uso, sin costo mensual' }}</p>

    <div class="form-card">
      <h2>Datos de la tarjeta</h2>
      <pv-button label="Generar datos aleatorios" outlined @click="generateRandomData" />
      <form class="fields" @submit.prevent>
        <pv-float-label>
          <pv-input-text id="cardNumber" v-model="form.cardNumber" />
          <label for="cardNumber">Número de tarjeta</label>
        </pv-float-label>
        <pv-float-label>
          <pv-input-text id="cardHolder" v-model="form.cardHolder" />
          <label for="cardHolder">Nombre del titular</label>
        </pv-float-label>
        <pv-float-label>
          <pv-input-text id="expiry" v-model="form.expiry" placeholder="MM/AA" />
          <label for="expiry">Fecha de vencimiento</label>
        </pv-float-label>
        <pv-float-label>
          <pv-input-text id="cvv" v-model="form.cvv" />
          <label for="cvv">CVV</label>
        </pv-float-label>
      </form>
      <pv-button
        :label="plan && plan.price > 0 ? `Pagar S/ ${plan.price.toFixed(2)}` : 'Activar Plan'"
        class="pay-btn"
        :loading="billing.loading"
        :disabled="!plan || billing.loading || iam.loading || syncPending"
        @click="pay"
      />
      <p v-if="billing.error" class="error">{{ billing.error }}</p>
      <div v-if="syncPending" class="alert alert-danger" role="alert"><p>{{ $t('integration.profileSyncPending') }}</p><button type="button" class="btn btn-secondary" :disabled="iam.loading" @click="synchronizePlan">{{ $t('integration.syncProfile') }}</button></div>
    </div>
  </div>
</template>

<style scoped>
.pay-page { max-width: 560px; margin: 2rem auto; padding: 0 1rem; }
.subtitle { color: #6b7280; }
.form-card {
  background: #f4fce8;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.fields { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1rem; }
.fields input { width: 100%; }
.pay-btn { background: #84cc16 !important; border: none !important; color: #1f2937 !important; font-weight: 700; }
.error { color: #dc2626; }
</style>
