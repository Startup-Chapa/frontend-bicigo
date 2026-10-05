<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBillingStore } from '../../application/billing-store.js'

const router = useRouter()
const billing = useBillingStore()

const subscription = computed(() => billing.lastSubscription)
const payment = computed(() => billing.lastPayment)
</script>

<template>
  <div class="success-page">
    <div class="success-card">
      <i class="pi pi-check-circle" style="font-size: 4rem; color: #84cc16"></i>
      <h1>¡Pago exitoso!</h1>
      <p v-if="subscription">
        Tu suscripción <strong>{{ subscription.planType }}</strong> está activa
        <span v-if="payment"> — S/ {{ payment.amount.toFixed(2) }}</span>.
      </p>
      <pv-button label="Volver a planes" @click="router.push({ name: 'plans' })" />
    </div>
  </div>
</template>

<style scoped>
.success-page { display: flex; justify-content: center; margin-top: 3rem; }
.success-card {
  background: #2f3b2f;
  color: #fff;
  border-radius: 1.25rem;
  padding: 3rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}
</style>
