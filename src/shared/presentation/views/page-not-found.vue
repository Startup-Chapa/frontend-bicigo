<template>
  <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:1rem">
    <span style="font-size:4rem">🚲</span>
    <h1>404</h1>
    <p style="color:var(--color-neutral-medium)">Pagina no encontrada</p>
    <RouterLink to="/" class="btn btn-gold" style="display:inline-flex;align-items:center;margin-top:1rem;text-decoration:none">
      Volver al inicio
    </RouterLink>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>