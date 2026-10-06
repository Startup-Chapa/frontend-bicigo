<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBillingStore } from '../../application/billing-store.js'

const router = useRouter()
const billing = useBillingStore()

const userName = 'Rodrigo'

const weekActivity = [
  { day: 'L', trips: 10 },
  { day: 'Ma', trips: 5 },
  { day: 'Mi', trips: 3 },
  { day: 'J', trips: 6 },
  { day: 'V', trips: 8 },
  { day: 'S', trips: 5 },
  { day: 'D', trips: 1 }
]

const maxTrips = computed(() => Math.max(...weekActivity.map((d) => d.trips)))

function goToSubscribe(plan) {
  billing.selectPlan(plan)
  router.push({ name: 'subscribe' })
}

onMounted(() => billing.fetchPlans())
</script>

<template>
  <div class="plans-page">
    <h1 class="title">Planes para {{ userName }}</h1>
    <p class="subtitle">De acuerdo a tu frecuencia con nuestra aplicación</p>

    <div class="activity-card">
      <h3>Actividad Semanal</h3>
      <div class="bars">
        <div v-for="d in weekActivity" :key="d.day" class="bar-col">
          <div
            class="bar"
            :class="{ highlight: d.day === 'L' }"
            :style="{ height: (d.trips / maxTrips) * 100 + 'px' }"
          ></div>
          <span class="day">{{ d.day }}</span>
        </div>
      </div>
      <p class="activity-note">28 viajes esta semana - promedio 4/día</p>
    </div>

    <div class="plans-grid">
      <div
        v-for="plan in billing.plans"
        :key="plan.id"
        class="plan-card"
        :class="{ recommended: plan.recommended }"
      >
        <p v-if="plan.recommended" class="recommended-label">Recomendado</p>
        <h2>{{ plan.name }}</h2>
        <p class="plan-desc">{{ plan.description }}</p>
        <ul class="features">
          <li v-for="f in plan.features" :key="f">{{ f }}</li>
        </ul>
        <p v-if="plan.price > 0" class="price">S/ {{ plan.price.toFixed(2) }} <span>al mes</span></p>
        <p v-else class="price">Pago por uso</p>
        <pv-button
          :label="plan.current ? 'Activar Plan' : 'Mejorar Plan'"
          class="improve-btn"
          @click="goToSubscribe(plan)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.plans-page {
  max-width: 980px;
  margin: 2rem auto;
  padding: 0 1rem;
  text-align: center;
}
.title { font-size: 2rem; font-weight: 800; color: #1f2937; }
.subtitle { color: #9ca3af; margin-bottom: 1.5rem; }

.activity-card {
  background: #2f3b2f;
  border-radius: 1.25rem;
  padding: 1.5rem;
  max-width: 520px;
  margin: 0 auto 2rem;
  text-align: left;
  color: #fff;
}
.activity-card h3 { margin: 0 0 1rem; font-size: 1rem; }
.bars { display: flex; align-items: flex-end; gap: 0.75rem; height: 130px; }
.bar-col { display: flex; flex-direction: column; align-items: center; gap: 0.35rem; flex: 1; }
.bar {
  width: 100%;
  border-radius: 0.25rem 0.25rem 0 0;
  background: #4a6b32;
}
.bar.highlight { background: #84cc16; }
.day { font-size: 0.7rem; color: #d1d5db; }
.activity-note { font-size: 0.7rem; color: #9ca3af; margin-top: 0.75rem; }

.plans-grid { display: flex; gap: 2rem; justify-content: center; flex-wrap: wrap; }
.plan-card {
  border-radius: 1.25rem;
  padding: 2rem;
  width: 380px;
  background: #f4fce8;
  border: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.plan-card.recommended {
  background: #2f3b2f;
  color: #fff;
}
.plan-card h2 { font-size: 1.75rem; margin: 0; }
.plan-desc { color: #84cc16; font-weight: 600; margin: 0; }
.features { text-align: left; padding-left: 1.25rem; margin: 0.5rem 0 1rem; }
.features li { margin-bottom: 0.25rem; font-weight: 600; }
.price { font-size: 2rem; font-weight: 800; margin: 0; }
.price span { font-size: 0.9rem; color: #9ca3af; font-weight: 400; }
.recommended-label { font-weight: 700; font-size: 1.25rem; margin: 0; }
.improve-btn { background: #84cc16 !important; border: none !important; color: #1f2937 !important; font-weight: 700; }
</style>
