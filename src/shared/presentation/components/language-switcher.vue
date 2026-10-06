<script setup>
import { useI18n } from 'vue-i18n'
const { t, locale } = useI18n()
</script>

<template>
  <div class="language-switcher" role="group" :aria-label="t('common.language')">
    <button type="button" :aria-pressed="locale === 'es'" :aria-label="t('common.spanish')" @click="locale = 'es'">ES</button>
    <button type="button" :aria-pressed="locale === 'en'" :aria-label="t('common.english')" @click="locale = 'en'">EN</button>
  </div>
</template>
