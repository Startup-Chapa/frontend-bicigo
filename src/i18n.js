import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import en from './locales/en.json'
import { watch } from 'vue'

const i18n = createI18n({
    legacy: false,
    locale: 'en',
    fallbackLocale: 'es',
    messages: { en, es }
})

watch(i18n.global.locale, locale => {
    document.documentElement.lang = locale
}, { immediate: true })

export default i18n
