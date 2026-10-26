<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import useTripManagementStore from '../../application/trip-management.store.js'
import { useIamStore } from '../../../iam/application/iam.store.js'
import { Trip } from '../../domain/model/trip.entity.js'
import { QRValidation } from '../../domain/model/qr-validation.entity.js'

const { t } = useI18n()
const router = useRouter()
const tripStore = useTripManagementStore()
const iamStore = useIamStore()

// Pasos: 1 = Escaneo QR, 2 = Mapa Google Maps en curso, 3 = Confirmar Devolución
const currentStep = ref(2)
const mapContainer = ref(null)

// Datos del viaje
const bikeCode = ref('Bici B-0234')
const bikeId = ref('BIKE-0234')
const elapsedSeconds = ref(0)
const distanceKm = ref(0.0)
const speedKmh = ref(0.0)
const batteryPct = ref(94)
const isPremium = computed(() => iamStore.currentUser?.plan === 'PRO' || iamStore.currentUser?.plan === 'pro')
const quotaExceeded = ref(false)

let map = null
let userMarker = null
let stationMarker = null
let routePolyline = null
let watchId = null
let timerInterval = null
let simInterval = null
const pathCoordinates = ref([])

// Posición inicial (ej. Lima / Miraflores o Madrid)
const currentPos = ref({ lat: -12.1215, lng: -77.0298 })
const destinationPos = ref({ lat: -12.1180, lng: -77.0345 })

const formattedTime = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60).toString().padStart(2, '0')
  const s = (elapsedSeconds.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

const calculatedCost = computed(() => {
  if (isPremium.value) return '0,00'
  return (distanceKm.value * 0.29).toFixed(2).replace('.', ',')
})

// Cargar script oficial de Google Maps si no existe
const loadGoogleMapsScript = () => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve(window.google.maps)
      return
    }

    window.gm_authFailure = () => {
      quotaExceeded.value = true
    }

    const script = document.createElement('script')
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyD3v4Gdb1neltygFLGICHPlLKU0ZbmJI3Y'
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker,geometry&v=weekly&callback=initGoogleMapsCallback`
    script.async = true
    script.defer = true

    window.initGoogleMapsCallback = () => {
      resolve(window.google.maps)
    }
    script.onerror = (err) => reject(err)
    document.head.appendChild(script)
  })
}

// Inicializar mapa de Google Maps
const initMap = async () => {
  try {
    await loadGoogleMapsScript()
    if (!mapContainer.value) return

    map = new google.maps.Map(mapContainer.value, {
      center: currentPos.value,
      zoom: 16,
      mapId: 'DEMO_MAP_ID', // Requerido para AdvancedMarkerElement
      disableDefaultUI: true,
      zoomControl: true
    })

    // Polilínea de la ruta verde en vivo
    routePolyline = new google.maps.Polyline({
      path: pathCoordinates.value,
      geodesic: true,
      strokeColor: '#7CB342',
      strokeOpacity: 0.9,
      strokeWeight: 6,
      map: map
    })

    // Marcador de la Bicicleta (Posición actual)
    const bikePin = document.createElement('div')
    bikePin.className = 'custom-bike-marker'
    bikePin.innerHTML = '<span style="font-size: 20px;">🚲</span>'

    userMarker = new google.maps.marker.AdvancedMarkerElement({
      map: map,
      position: currentPos.value,
      title: 'Tu Bici BiciGo',
      content: bikePin
    })

    // Marcador de Estación Destino (BikePoint)
    const stationPin = document.createElement('div')
    stationPin.className = 'custom-station-marker'
    stationPin.innerHTML = '<span style="font-size: 16px;">📍</span>'

    stationMarker = new google.maps.marker.AdvancedMarkerElement({
      map: map,
      position: destinationPos.value,
      title: 'BikePoint Retiro',
      content: stationPin
    })

    // Iniciar rastreo GPS o simulador si no hay GPS real
    startTracking()
  } catch (error) {
    console.error('Error al cargar Google Maps:', error)
  }
}

// Rastrear posición GPS y calcular distancia real
const startTracking = () => {
  if ('geolocation' in navigator) {
    watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLat = position.coords.latitude
          const newLng = position.coords.longitude
          updateBicyclePosition(newLat, newLng, position.coords.speed)
        },
        () => {
          // Fallback simulador si el usuario deniega GPS o está en PC
          startSimulation()
        },
        { enableHighAccuracy: true, maximumAge: 1000 }
    )
  } else {
    startSimulation()
  }
}

// Actualizar posición, distancia y mapa
const updateBicyclePosition = (lat, lng, speed = null) => {
  const newLatLng = new google.maps.LatLng(lat, lng)

  if (pathCoordinates.value.length > 0) {
    const lastPoint = pathCoordinates.value[pathCoordinates.value.length - 1]
    const addedMeters = google.maps.geometry.spherical.computeDistanceBetween(lastPoint, newLatLng)

    // Si se desplazó al menos 2 metros, sumamos distancia
    if (addedMeters > 2) {
      distanceKm.value = Number((distanceKm.value + addedMeters / 1000).toFixed(2))
      if (speed && speed > 0) {
        speedKmh.value = Number((speed * 3.6).toFixed(1))
      }
    }
  }

  pathCoordinates.value.push(newLatLng)
  currentPos.value = { lat, lng }

  if (routePolyline) routePolyline.setPath(pathCoordinates.value)
  if (userMarker) userMarker.position = newLatLng
  if (map) map.panTo(newLatLng)
}

// Simulador de movimiento suave por las calles
const startSimulation = () => {
  let step = 0
  simInterval = setInterval(() => {
    step++
    const deltaLat = 0.00008 * Math.cos(step * 0.1)
    const deltaLng = 0.00010 * Math.sin(step * 0.1)
    const nextLat = currentPos.value.lat + deltaLat
    const nextLng = currentPos.value.lng + deltaLng

    speedKmh.value = Number((14 + Math.random() * 2).toFixed(1))
    updateBicyclePosition(nextLat, nextLng)

    // Batería baja ligeramente cada minuto
    if (step % 60 === 0 && batteryPct.value > 10) {
      batteryPct.value--
    }
  }, 2000)
}

onMounted(async () => {
  timerInterval = setInterval(() => {
    elapsedSeconds.value++
  }, 1000)

  // Iniciar mapa en el siguiente ciclo del DOM
  setTimeout(() => {
    initMap()
  }, 200)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (simInterval) clearInterval(simInterval)
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId)
  }
})

// Acciones de flujo
const simulateQrScan = async () => {
  const validation = new QRValidation({
    tripId: 'TRIP-' + Date.now(),
    bicycleId: bikeId.value,
    qrCodeSnapshot: 'QR-B-0234'
  })
  await tripStore.validateQR(validation, 'QR-B-0234')

  const newTrip = new Trip({
    tripId: validation.tripId,
    userId: iamStore.currentUser?.id || '1',
    bicycleId: bikeId.value
  })
  newTrip.startTrip()
  await tripStore.addTrip(newTrip)
  currentStep.value = 2
  setTimeout(() => initMap(), 100)
}

const completeReturn = async () => {
  const activeTrip = tripStore.activeTrips[0] || new Trip({
    tripId: 'TRIP-' + Date.now(),
    userId: iamStore.currentUser?.id || '1',
    bicycleId: bikeId.value,
    status: 'IN_PROGRESS'
  })
  await tripStore.finishTrip(activeTrip, distanceKm.value, 0.29, isPremium.value)
  router.push({ name: 'trip-management-trips' })
}
</script>

<template>
  <div class="trip-map-container">
    <!-- Aviso de Quota de Google Maps si aplica -->
    <div v-if="quotaExceeded" class="bg-amber-50 border-round p-2 mb-3 text-xs text-amber-900 text-center">
      Google Maps Platform quota reached. If you are the app owner, visit
      <a href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors" target="_blank" class="font-bold underline">maps developer site</a>.
    </div>

    <!-- Barra de progreso superior (Stepper) -->
    <div class="stepper-bar">
      <div class="step-segment" :class="{ active: currentStep >= 1 }"></div>
      <div class="step-segment" :class="{ active: currentStep >= 2 }"></div>
      <div class="step-segment" :class="{ active: currentStep >= 2 }"></div>
      <div class="step-segment" :class="{ active: currentStep >= 3 }"></div>
      <div class="step-segment" :class="{ active: currentStep >= 3 }"></div>
    </div>

    <!-- PASO 1: QR -->
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

    <!-- PASO 2: GOOGLE MAPS REAL EN CURSO -->
    <div v-else-if="currentStep === 2" class="step-content p-4">
      <div class="flex justify-content-between align-items-center mb-3">
        <div>
          <span class="trip-status-tag">VIAJE EN CURSO</span>
          <div class="trip-timer">{{ formattedTime }}</div>
        </div>
        <div class="bike-badge">
          {{ bikeCode }}
        </div>
      </div>

      <div class="grid">
        <!-- Mapa de Google Maps Real -->
        <div class="col-12 lg:col-8">
          <div class="map-card-wrapper shadow-2 relative overflow-hidden">
            <!-- Contenedor del Mapa -->
            <div ref="mapContainer" class="google-map-element"></div>

            <!-- Indicación flotante -->
            <div class="nav-instruction-box">
              <div class="font-bold text-sm text-900">Ruta GPS en tiempo real</div>
              <div class="text-xs text-600">Calculando metros recorridos...</div>
            </div>
          </div>

          <!-- Métricas en vivo -->
          <div class="grid mt-3">
            <div class="col-4">
              <div class="stat-metric-card">
                <span class="metric-label">Distancia Real</span>
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

        <!-- Columna derecha -->
        <div class="col-12 lg:col-4 flex flex-column gap-3">
          <div class="tariff-card">
            <div class="flex justify-content-between align-items-center mb-1">
              <span class="text-xs uppercase font-bold text-400">Tarifa del viaje</span>
              <i class="pi pi-check-circle text-green-400"></i>
            </div>
            <div class="text-xl font-bold text-white mb-2">
              {{ isPremium ? 'Cubierto por tu plan' : 'Tarifa por distancia' }}
            </div>
            <div class="flex justify-content-between align-items-end">
              <div class="text-xs text-300">
                <p class="m-0 font-medium">{{ isPremium ? 'Plan Pro Mensual' : 'Plan Tarifa Estándar' }}</p>
                <p class="m-0 text-400">€0,29/km calculado automáticamente.</p>
              </div>
              <div class="text-2xl font-bold text-green-400">
                €{{ calculatedCost }}
              </div>
            </div>
          </div>

          <div class="destination-card">
            <div class="font-bold text-base text-900 mb-1">BikePoint Próximo</div>
            <div class="text-xs text-600 mb-2">Estación de anclaje disponible</div>
            <div class="capacity-bar">
              <div class="capacity-fill" style="width: 70%;"></div>
            </div>
          </div>

          <button class="btn-finish-trip" @click="currentStep = 3">
            Ya llegué · Finalizar
          </button>
        </div>
      </div>
    </div>

    <!-- PASO 3: DEVOLUCIÓN -->
    <div v-else-if="currentStep === 3" class="step-content text-center py-6">
      <span class="step-tag">ÚLTIMO PASO</span>
      <h1 class="step-title">Confirma la devolución</h1>
      <p class="step-subtitle">Aparca en el anclaje y envía una foto de la bicicleta.</p>
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
}
.step-segment.active {
  background: #7CB342;
}

.map-card-wrapper {
  height: 420px;
  border-radius: 1rem;
  border: 1px solid #D1D5DB;
}
.google-map-element {
  width: 100%;
  height: 100%;
}

:deep(.custom-bike-marker) {
  background: #FFFFFF;
  border: 3px solid #7CB342;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.25);
  animation: pulse 2s infinite;
}
:deep(.custom-station-marker) {
  background: #1E293B;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0,0,0,0.25);
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(124, 179, 66, 0.6); }
  70% { box-shadow: 0 0 0 12px rgba(124, 179, 66, 0); }
  100% { box-shadow: 0 0 0 0 rgba(124, 179, 66, 0); }
}

.nav-instruction-box {
  position: absolute;
  bottom: 1rem;
  left: 1rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  padding: 0.75rem 1.25rem;
  border-radius: 0.75rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 5;
}
.trip-status-tag {
  font-size: 0.75rem;
  font-weight: 800;
  color: #7CB342;
}
.trip-timer {
  font-size: 2.25rem;
  font-weight: 800;
  color: #0F172A;
}
.bike-badge {
  background: #DCFCE7;
  color: #166534;
  font-weight: 700;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
}
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
}
.metric-value {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0F172A;
}
.tariff-card {
  background: #1E293B;
  border-radius: 1rem;
  padding: 1.25rem;
}
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
}
.btn-finish-trip {
  background: #1E293B;
  color: #FFFFFF;
  border: none;
  font-weight: 700;
  padding: 1rem;
  border-radius: 0.75rem;
  cursor: pointer;
}
.btn-primary-brand {
  background: #7CB342;
  color: #FFFFFF;
  border: none;
  font-weight: 700;
  padding: 0.85rem 1.5rem;
  border-radius: 0.75rem;
  cursor: pointer;
}
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
  height: 220px;
  border: 2px dashed #CBD5E1;
  border-radius: 1.25rem;
  background: #F8FAFC;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.camera-icon-bubble {
  width: 48px;
  height: 48px;
  background: #DCFCE7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}
.step-tag {
  color: #7CB342;
  font-size: 0.75rem;
  font-weight: 800;
}
.step-title {
  font-size: 2rem;
  font-weight: 800;
  color: #0F172A;
}
.step-subtitle {
  color: #64748B;
}
.btn-link {
  background: none;
  border: none;
  color: #475569;
  font-weight: 600;
  cursor: pointer;
}
</style>