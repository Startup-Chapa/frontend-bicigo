<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const steps = ['Datos personales', 'Contacto', 'Seguridad', 'Plan']
const currentStep = 3 // 0-based, "Plan" is active

const registrationPlans = [
  { id: 'daily', name: 'Pase Diario', desc: 'Hasta 30 min por viaje', price: null, popular: false },
  { id: 'monthly', name: 'Suscripción Mensual', desc: 'Viajes ilimitados', price: 30.0, popular: true }
]

const selectedPlanId = ref(null)
const acceptTerms = ref(false)
const acceptNews = ref(false)

function createAccount() {
  if (!acceptTerms.value) {
    alert('Debes aceptar los Términos de servicio y la Política de privacidad.')
    return
  }
  // Flujo demo: después de crear la cuenta, el usuario puede gestionar su plan
  router.push({ name: 'plans' })
}
</script>

<template>
  <div class="register-page">
    <aside class="brand-panel">
      <div class="brand">
        <span class="logo">🚲</span>
        <div>
          <strong>biciGO</strong>
          <p>Sistema de Bicicletas Compartidas</p>
        </div>
      </div>
      <h1>Únete a <span>la comunidad.</span></h1>
      <p class="brand-desc">Crea tu cuenta en menos de 2 minutos y empieza a moverte de forma sostenible por la ciudad.</p>
      <div class="stats">
        <div class="stat"><strong>52</strong><span>BikePoints</span></div>
        <div class="stat"><strong>600+</strong><span>Bicicletas</span></div>
        <div class="stat"><strong>28k</strong><span>Usuarios</span></div>
      </div>
      <p class="copy">© 2026 biciGO · Todos los derechos reservados</p>
    </aside>

    <section class="form-panel">
      <div class="auth-tabs">
        <button class="tab">Iniciar sesión</button>
        <button class="tab active">Crear cuenta</button>
      </div>

      <h2>Crear cuenta nueva</h2>
      <p class="form-subtitle">Completa los pasos para registrarte</p>

      <div class="stepper">
        <template v-for="(step, i) in steps" :key="step">
          <div class="step">
            <span class="circle" :class="{ done: i < currentStep, active: i === currentStep }">
              <i v-if="i < currentStep" class="pi pi-check"></i>
              <template v-else>{{ i + 1 }}</template>
            </span>
            <small>{{ step }}</small>
          </div>
          <div v-if="i < steps.length - 1" class="line" :class="{ done: i < currentStep }"></div>
        </template>
      </div>

      <div class="plan-options">
        <label v-for="p in registrationPlans" :key="p.id" class="plan-option" :class="{ selected: selectedPlanId === p.id }">
          <pv-radio-button v-model="selectedPlanId" :input-id="p.id" :value="p.id" />
          <div class="plan-info">
            <strong>{{ p.name }}</strong>
            <small>{{ p.desc }}</small>
          </div>
          <div class="plan-price">
            <span v-if="p.popular" class="popular-badge">Popular</span>
            <strong v-if="p.price">S/{{ p.price.toFixed(2) }}</strong>
          </div>
        </label>
      </div>

      <div class="terms">
        <label><pv-checkbox v-model="acceptTerms" :binary="true" /> Acepto los <a>Términos de servicio</a> y la <a>Política de privacidad</a> de biciGO *</label>
        <label><pv-checkbox v-model="acceptNews" :binary="true" /> Quiero recibir ofertas, novedades y promociones de biciGO por email</label>
      </div>

      <div class="actions">
        <pv-button label="← Atrás" outlined severity="secondary" @click="router.back()" />
        <pv-button label="Crear cuenta →" class="create-btn" @click="createAccount" />
      </div>
      <p class="login-link">¿Ya tienes cuenta? <a>Inicia sesión</a></p>
    </section>
  </div>
</template>

<style scoped>
.register-page { display: flex; min-height: 100vh; }

.brand-panel {
  flex: 0 0 40%;
  background: #2f3b2f;
  color: #fff;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.brand { display: flex; align-items: center; gap: 0.75rem; }
.brand .logo { background: #84cc16; border-radius: 0.75rem; padding: 0.5rem 0.75rem; font-size: 1.5rem; }
.brand p { margin: 0; font-size: 0.75rem; color: #9ca3af; }
.brand-panel h1 { font-size: 2.5rem; margin: 0; color: #fff; }
.brand-panel h1 span { color: #84cc16; }
.brand-desc { color: #9ca3af; max-width: 320px; }
.stats { display: flex; gap: 1rem; }
.stat { background: rgba(255,255,255,0.08); border-radius: 0.75rem; padding: 1rem 1.5rem; display: flex; flex-direction: column; }
.stat strong { color: #84cc16; font-size: 1.5rem; }
.stat span { font-size: 0.75rem; color: #9ca3af; }
.copy { margin-top: auto; font-size: 0.7rem; color: #6b7280; }

.form-panel { flex: 1; padding: 3rem 4rem; }
.auth-tabs { display: inline-flex; background: #e5e7eb; border-radius: 0.75rem; padding: 0.25rem; margin-bottom: 2rem; }
.tab { border: none; background: transparent; padding: 0.5rem 2rem; border-radius: 0.5rem; cursor: pointer; color: #6b7280; }
.tab.active { background: #fff; color: #1f2937; font-weight: 600; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

.form-panel h2 { margin: 0; font-size: 1.75rem; }
.form-subtitle { color: #9ca3af; margin-bottom: 2rem; }

.stepper { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 2rem; }
.step { display: flex; flex-direction: column; align-items: center; gap: 0.25rem; }
.step small { font-size: 0.7rem; color: #9ca3af; }
.circle {
  width: 2rem; height: 2rem; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid #d1d5db; color: #9ca3af; font-size: 0.85rem;
}
.circle.done { background: #84cc16; border-color: #84cc16; color: #fff; }
.circle.active { background: #2f3b2f; border-color: #2f3b2f; color: #fff; font-weight: 700; }
.line { flex: 1; height: 2px; background: #d1d5db; margin-bottom: 1.25rem; }
.line.done { background: #84cc16; }

.plan-options { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1.5rem; }
.plan-option {
  display: flex; align-items: center; gap: 1rem;
  background: #fff; border: 1px solid #e5e7eb; border-radius: 0.75rem;
  padding: 1rem 1.25rem; cursor: pointer;
}
.plan-option.selected { border-color: #84cc16; box-shadow: 0 0 0 1px #84cc16; }
.plan-info { flex: 1; display: flex; flex-direction: column; }
.plan-info small { color: #9ca3af; }
.plan-price { text-align: right; display: flex; flex-direction: column; align-items: flex-end; }
.popular-badge { background: #2f3b2f; color: #fff; font-size: 0.65rem; border-radius: 999px; padding: 0.15rem 0.6rem; }

.terms { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; font-size: 0.85rem; color: #6b7280; }
.terms label { display: flex; align-items: center; gap: 0.5rem; }
.terms a { color: #84cc16; text-decoration: none; }

.actions { display: flex; gap: 1rem; align-items: center; }
.actions .create-btn { flex: 1; background: #84cc16 !important; border: none !important; color: #1f2937 !important; font-weight: 700; }
.login-link { text-align: center; margin-top: 1.5rem; font-size: 0.85rem; color: #9ca3af; }
.login-link a { color: #84cc16; text-decoration: none; }

@media (max-width: 900px) {
  .register-page { flex-direction: column; }
  .brand-panel { flex: none; }
  .form-panel { padding: 2rem; }
}
</style>
