import { createApp } from 'vue'
import Material from '@primevue/themes/material'
import PrimeVue from 'primevue/config'
import {
    Button,
    Card,
    Checkbox,
    Column,
    ConfirmationService,
    ConfirmDialog,
    DataTable,
    Dialog,
    DialogService,
    Drawer,
    FileUpload,
    FloatLabel,
    IconField,
    InputIcon,
    InputNumber,
    InputText,
    Menu,
    Password,
    Row,
    Select,
    SelectButton,
    Tag,
    Textarea,
    Toast,
    ToastService,
    Toolbar,
    Tooltip
} from 'primevue'

import App from './app.vue'
import router from './router.js'
import pinia from './pinia.js'
import i18n from './i18n.js'

import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'
import './style.css'

createApp(App)
    .use(pinia)
    .use(router)
    .use(i18n)
    .use(PrimeVue, { theme: { preset: Material }, ripple: true })
    .use(ConfirmationService)
    .use(DialogService)
    .use(ToastService)
    .component('pv-button',         Button)
    .component('pv-card',           Card)
    .component('pv-checkbox',       Checkbox)
    .component('pv-column',         Column)
    .component('pv-confirm-dialog', ConfirmDialog)
    .component('pv-data-table',     DataTable)
    .component('pv-dialog',         Dialog)
    .component('pv-drawer',         Drawer)
    .component('pv-file-upload',    FileUpload)
    .component('pv-float-label',    FloatLabel)
    .component('pv-icon-field',     IconField)
    .component('pv-input-icon',     InputIcon)
    .component('pv-input-number',   InputNumber)
    .component('pv-input-text',     InputText)
    .component('pv-menu',           Menu)
    .component('pv-password',       Password)
    .component('pv-row',            Row)
    .component('pv-select',         Select)
    .component('pv-select-button',  SelectButton)
    .component('pv-tag',            Tag)
    .component('pv-textarea',       Textarea)
    .component('pv-toast',          Toast)
    .component('pv-toolbar',        Toolbar)
    .directive('tooltip',           Tooltip)
    .mount('#App')