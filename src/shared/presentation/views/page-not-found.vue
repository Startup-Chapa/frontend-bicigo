<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
const unavailableRoute = route.path;
</script>

<template>
  <section class="pt-6 p-4 md:p-5">
    <div class="flex flex-column gap-3">
      <h1 class="text-4xl font-bold text-color">Página no encontrada</h1>
      <p class="m-0 line-height-3 text-color-secondary">
        La ruta {{ unavailableRoute }} no está disponible.
      </p>
      <router-link to="/billing/plans" class="text-primary font-medium">
        Volver a planes
      </router-link>
    </div>
  </section>
</template>
