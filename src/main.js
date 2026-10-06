import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Material from '@primeuix/themes/material'
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'
import { Button, FloatLabel, InputText, Card, RadioButton, Checkbox } from 'primevue'
import router from './router.js'
import pinia from './pinia.js'

const primeUiLicenseKey = import.meta.env.VITE_PRIME_UI_LICENSE_KEY

createApp(App)
  .use(PrimeVue, { theme: { preset: Material }, ripple: true, license: primeUiLicenseKey })
  .component('pv-button', Button)
  .component('pv-float-label', FloatLabel)
  .component('pv-input-text', InputText)
  .component('pv-card', Card)
  .component('pv-radio-button', RadioButton)
  .component('pv-checkbox', Checkbox)
  .use(router)
  .use(pinia)
  .mount('#app')
