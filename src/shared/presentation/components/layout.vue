<script setup>
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from './language-switcher.vue'
import FooterContent from './footer-content.vue'
const { t } = useI18n()
</script>

<template>
  <a class="skip-link" href="#main-content">{{ t('common.skip') }}</a>
  <header class="app-header">
    <div class="header-inner">
      <router-link :to="{ name: 'maintenance-report' }" class="brand">{{ t('common.brand') }}<span class="brand-dot" aria-hidden="true">●</span></router-link>
      <nav :aria-label="t('common.mainNav')" class="app-nav">
        <router-link :to="{ name: 'maintenance-report' }">{{ t('maintenance.reportNav') }}</router-link>
        <router-link :to="{ name: 'maintenance-management' }">{{ t('maintenance.managementNav') }}</router-link>
      </nav>
      <LanguageSwitcher />
    </div>
  </header>
  <main id="main-content" class="app-content" tabindex="-1"><router-view /></main>
  <FooterContent />
</template>
