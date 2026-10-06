import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router.js'
import pinia from './pinia.js'
import i18n from './i18n.js'

createApp(App).use(pinia).use(router).use(i18n).mount('#app')
