<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useTripManagementStore from '../../application/trip-management.store.js'
import { useIamStore } from '../../../iam/application/iam.store.js'
import { Trip } from '../../domain/model/trip.entity.js'
import { QRValidation } from '../../domain/model/qr-validation.entity.js'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const tripStore = useTripManagementStore()
const iamStore = useIamStore()

// Pasos del flujo: 1 = Escaneo QR, 2 = Viaje en Curso (Mapa), 3 = Confirmar Devolución
const currentStep = ref(2) // Por defecto muestra el mapa en curso de tu captura

// Datos simulados del viaje en curso
const bikeCode = ref('Bici B-0234')
const bikeId = ref('BIKE-0234')
const elapsedSeconds = ref(1122) // 18:42
const distanceKm = ref(4.3)
const speedKmh = ref(14.2)
const batteryPct = ref(87)
const isPremium = computed(() => iamStore.currentUser?.plan === 'PRO')

let timerInterval = null

// Formateador de tiempo mm:ss
const formattedTime = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60).toString().padStart(2, '0')
  const s = (elapsedSeconds.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

// Costo calculado usando la entidad del dominio
const calculatedCost = computed(() => {
  if (isPremium.value) return '0,00'
  return (distanceKm.value * 0.29).toFixed(2).replace('.', ',')
})

onMounted(() => {
  // Cronómetro en vivo
  timerInterval = setInterval(() => {
    elapsedSeconds.value++
    // Simula avance ligero de distancia
    if (elapsedSeconds.value % 15 === 0) {
      distanceKm.value = Number((distanceKm.value + 0.1).toFixed(1))
    }
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

// Acciones del flujo
const simulateQrScan = async () => {
  const validation = new QRValidation({
    tripId: 'TRIP-' + Date.now(),
    bicycleId: bikeId.value,
    qrCodeSnapshot: 'QR-B-0234'
  })
  await tripStore.validateQR(validation, 'QR-B-0234')

  // Inicia viaje con la entidad
  const newTrip = new Trip({
    tripId: validation.tripId,
    userId: iamStore.currentUser?.id || 'USER-1',
    bicycleId: bikeId.value
  })
  newTrip.startTrip()
  await tripStore.addTrip(newTrip)

  currentStep.value = 2 // Pasa al mapa
}

const goToFinish = () => {
  currentStep.value = 3 // Paso final de foto
}

const completeReturn = async () => {
  // Finaliza el viaje
  const activeTrip = tripStore.activeTrips[0] || new Trip({
    tripId: 'TRIP-DEMO',
    userId: iamStore.currentUser?.id || 'USER-1',
    bicycleId: bikeId.value,
    status: 'IN_PROGRESS'
  })

  await tripStore.finishTrip(activeTrip, distanceKm.value, 0.29, isPremium.value)
  router.push({ name: 'trip-management-trips' })
}
</script>

<template>
  <div class="trip-map-container">
    <!-- Barra de progreso superior (Stepper) -->
    <div class="stepper-bar">
      <div class="step-segment" :class="{ active: currentStep >= 1 }"></div>
      <div class="step-segment" :class="{ active: currentStep >= 2 }"></div>
      <div class="step-segment" :class="{ active: currentStep >= 2 }"></div>
      <div class="step-segment" :class="{ active: currentStep >= 3 }"></div>
      <div class="step-segment" :class="{ active: currentStep >= 3 }"></div>
    </div>

    <!-- ========================================== -->
    <!-- PASO 1: DESBLOQUEO QR                      -->
    <!-- ========================================== -->
    <div v-if="currentStep === 1" class="step-content text-center py-6">
      <span class="step-tag">PASO 2</span>
      <h1 class="step-title">Desbloquea tu bicicleta</h1>
      <p class="step-subtitle">Escanea el QR situado en el manillar.</p>

      <div class="qr-scanner-box my-5 mx-auto">
        <i class="pi pi-qrcode qr-icon"></i>
      </div>

      <button class="btn-primary-brand w-20rem mx-auto block mb-3" @click="simulateQrScan">
        Simular escaneo QR
      </button>
      <button class="btn-link" @click="router.push('/app/trips')">Volver a la ruta</button>
    </div>

    <!-- ========================================== -->
    <!-- PASO 2: MAPA Y VIAJE EN CURSO (TU CAPTURA) -->
    <!-- ========================================== -->
    <div v-else-if="currentStep === 2" class="step-content p-4">
      <!-- Encabezado de Viaje -->
      <div class="flex justify-content-between align-items-center mb-3">
        <div>
          <span class="trip-status-tag">VIAJE EN CURSO</span>
          <div class="trip-timer">{{ formattedTime }}</div>
        </div>
        <div class="bike-badge">
          {{ bikeCode }}
        </div>
      </div>

      <!-- Layout Principal: Mapa a la izquierda + Paneles a la derecha -->
      <div class="grid">
        <!-- Columna Izquierda: Mapa con Ruta SVG interactiva -->
        <div class="col-12 lg:col-8">
          <div class="map-card shadow-1 relative overflow-hidden">
            <!-- Grilla visual simulando calles de la ciudad -->
            <svg class="map-svg" viewBox="0 0 800 450" preserveAspectRatio="none">
              <!-- Calles de fondo -->
              <path d="M 0,150 Q 400,120 800,160" stroke="#CBD5E1" stroke-width="12" fill="none" opacity="0.4" />
              <path d="M 0,320 Q 300,280 800,340" stroke="#CBD5E1" stroke-width="16" fill="none" opacity="0.4" />
              <path d="M 220,0 L 250,450" stroke="#CBD5E1" stroke-width="10" fill="none" opacity="0.4" />
              <path d="M 580,0 L 560,450" stroke="#CBD5E1" stroke-width="10" fill="none" opacity="0.4" />

              <!-- Trazo Verde de la Ruta (Animado) -->
              <path
                  d="M 120,330 C 260,330 360,180 620,180"
                  stroke="#7CB342"
                  stroke-width="8"
                  stroke-linecap="round"
                  fill="none"
              />
            </svg>

            <!-- Marcador: Ubicación actual del usuario -->
            <div class="map-marker user-marker" style="top: 73%; left: 15%;">
              <div class="user-dot"></div>
              <div class="marker-label">Tu ubicación</div>
            </div>

            <!-- Indicación paso a paso de navegación -->
            <div class="nav-instruction-box">
              <div class="font-bold text-sm text-900">Sigue por Calle de Alcalá</div>
              <div class="text-xs text-600">Gira a la derecha en 280 m</div>
            </div>

            <!-- Marcador: Destino (BikePoint Retiro) -->
            <div class="map-marker station-marker" style="top: 36%; left: 78%;">
              <div class="station-icon-bubble">
                <i class="pi pi-compass text-white text-xs"></i>
              </div>
              <div class="station-label">BikePoint Retiro</div>
            </div>
          </div>

          <!-- Métricas de viaje (Distancia, Velocidad, Batería) -->
          <div class="grid mt-3">
            <div class="col-4">
              <div class="stat-metric-card">
                <span class="metric-label">Distancia</span>
                <span class="metric-value">{{ distanceKm }} km</span>
              </div>
            </div>
            <div class="col-4">
              <div class="stat-metric-card">
                <span class="metric-label">Velocidad</span>
                <span class="metric-value">{{ speedKmh }} km/h</span>
              </div>
            </div>
            <div class="col-4">
              <div class="stat-metric-card">
                <span class="metric-label">Batería</span>
                <span class="metric-value">{{ batteryPct }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna Derecha: Tarifa del Viaje + Estación Destino + Botón Finalizar -->
        <div class="col-12 lg:col-4 flex flex-column gap-3">
          <!-- Tarjeta de Tarifa -->
          <div class="tariff-card">
            <div class="flex justify-content-between align-items-center mb-1">
              <span class="text-xs uppercase font-bold text-400">Tarifa del viaje</span>
              <i class="pi pi-check-circle text-green-400"></i>
            </div>
            <div class="text-xl font-bold text-white mb-2">
              {{ isPremium ? 'Cubierto por tu plan' : 'Tarifa por kilómetro' }}
            </div>
            <div class="flex justify-content-between align-items-end">
              <div class="text-xs text-300">
                <p class="m-0 font-medium">{{ isPremium ? 'Plan Pro Mensual' : 'Plan Tarifa Estándar' }}</p>
                <p class="m-0 text-400">Primeros 60 min incluidos.<br>Después: €0,29/km · Te avisaremos antes.</p>
              </div>
              <div class="text-2xl font-bold text-green-400">
                €{{ calculatedCost }}
              </div>
            </div>
          </div>

          <!-- Tarjeta de Estación de Destino -->
          <div class="destination-card">
            <div class="font-bold text-base text-900 mb-1">BikePoint Retiro</div>
            <div class="text-xs text-600 mb-2">A 280 m · 2 min · 6 anclajes libres</div>
            <!-- Barra de capacidad -->
            <div class="capacity-bar">
              <div class="capacity-fill" style="width: 75%;"></div>
            </div>
          </div>

          <!-- Botón de Llegada y Devolución -->
          <button class="btn-finish-trip" @click="goToFinish">
            Ya llegué · Finalizar
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- PASO 3: CONFIRMACIÓN DE DEVOLUCIÓN         -->
    <!-- ========================================== -->
    <div v-else-if="currentStep === 3" class="step-content text-center py-6">
      <span class="step-tag">ÚLTIMO PASO</span>
      <h1 class="step-title">Confirma la devolución</h1>
      <p class="step-subtitle">Aparca en el anclaje 06 y envía una foto de la bicicleta.</p>

      <div class="photo-dropzone my-5 mx-auto">
        <div class="camera-icon-bubble">
          <i class="pi pi-camera text-xl text-green-700"></i>
        </div>
        <div class="font-bold text-900 mb-1">Hacer o subir foto</div>
        <div class="text-xs text-500">Debe verse la bici correctamente anclada</div>
      </div>

      <button class="btn-primary-brand w-20rem mx-auto block mb-3" @click="completeReturn">
        Finalizar viaje
      </button>
      <button class="btn-link" @click="currentStep = 2">Volver al mapa</button>
    </div>
  </div>
</template>

<style scoped>
.trip-map-container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Stepper horizontal */
.stepper-bar {
  display: flex;
  gap: 0.5rem;
  padding: 1.5rem 1rem 0.5rem 1rem;
}
.step-segment {
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: #E2E8F0;
  transition: background 0.3s;
}
.step-segment.active {
  background: #7CB342;
}

/* Tags de estado */
.trip-status-tag {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: #7CB342;
}
.trip-timer {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0F172A;
  line-height: 1.1;
}
.bike-badge {
  background: #DCFCE7;
  color: #166534;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
}

/* Mapa con SVG */
.map-card {
  height: 380px;
  background: #E8F0E6;
  border-radius: 1rem;
  border: 1px solid #D1D5DB;
}
.map-svg {
  width: 100%;
  height: 100%;
}

/* Marcadores */
.map-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.user-dot {
  width: 16px;
  height: 16px;
  background: #3B82F6;
  border: 3px solid #FFFFFF;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}
.station-icon-bubble {
  width: 32px;
  height: 32px;
  background: #7CB342;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #FFFFFF;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}
.marker-label, .station-label {
  background: #FFFFFF;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #1E293B;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  white-space: nowrap;
}

/* Navegación paso a paso */
.nav-instruction-box {
  position: absolute;
  bottom: 1.25rem;
  left: 1.25rem;
  background: #FFFFFF;
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* Métricas */
.stat-metric-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
}
.metric-label {
  display: block;
  font-size: 0.75rem;
  color: #64748B;
  margin-bottom: 0.25rem;
}
.metric-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0F172A;
}

/* Tarjeta de Tarifa (Negra / Verde) */
.tariff-card {
  background: #1E293B;
  border-radius: 1rem;
  padding: 1.25rem;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
}

/* Tarjeta de Estación Destino */
.destination-card {
  background: #FFFFFF;
  border: 1px solid #E2E8F0;
  border-radius: 1rem;
  padding: 1.25rem;
}
.capacity-bar {
  height: 6px;
  background: #E2E8F0;
  border-radius: 999px;
  overflow: hidden;
}
.capacity-fill {
  height: 100%;
  background: #7CB342;
  border-radius: 999px;
}

/* Botones principales */
.btn-finish-trip {
  background: #1E293B;
  color: #FFFFFF;
  border: none;
  font-weight: 700;
  font-size: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-finish-trip:hover {
  background: #0F172A;
}

.btn-primary-brand {
  background: #7CB342;
  color: #FFFFFF;
  border: none;
  font-weight: 700;
  font-size: 1rem;
  padding: 0.85rem 1.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
}
.btn-primary-brand:hover {
  background: #689F38;
}

.btn-link {
  background: none;
  border: none;
  color: #475569;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
}

/* Scanner y Foto */
.qr-scanner-box {
  width: 260px;
  height: 260px;
  background: #1E293B;
  border-radius: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qr-icon {
  font-size: 7rem;
  color: #7CB342;
}

.photo-dropzone {
  width: 500px;
  max-width: 90%;
  height: 240px;
  border: 2px dashed #CBD5E1;
  border-radius: 1.25rem;
  background: #F8FAFC;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.camera-icon-bubble {
  width: 50px;
  height: 50px;
  background: #DCFCE7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
}
.step-tag {
  color: #7CB342;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
}
.step-title {
  font-size: 2rem;
  font-weight: 800;
  color: #0F172A;
  margin: 0.25rem 0;
}
.step-subtitle {
  color: #64748B;
  margin: 0;
}
</style>