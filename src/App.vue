<script setup>
import { watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Layout from './shared/presentation/components/layout.vue'

const route = useRoute()
const { t, locale } = useI18n()
watchEffect(() => {
  document.documentElement.lang = locale.value
  document.title = `${t(route.meta.titleKey || 'maintenance.title')} | BiciGO`
})
</script>

<template>
  <Layout />
</template>
