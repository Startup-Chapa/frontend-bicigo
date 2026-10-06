<script setup>
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

const route = useRoute();
const unavailableRoute = route.path;
const { t } = useI18n();
</script>

<template>
  <section class="maintenance-page empty-state">
    <div>
      <h1>{{ t('page-not-found.title') }}</h1>
      <p>
        {{ t('page-not-found.content', { 'unavailable-route': unavailableRoute }) }}
      </p>
      <router-link :to="{ name: 'maintenance-report' }" class="btn btn-primary">
        {{ t('page-not-found.go-home') }}
      </router-link>
    </div>
  </section>
</template>
