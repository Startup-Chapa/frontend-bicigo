<template>
  <div class="app-shell">
    <SidebarNav />
    <div class="app-main">
      <TopBar />
      <main class="app-content" role="main" id="main-content">
        <RouterView />
      </main>
      <AppFooter />
    </div>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import SidebarNav from './sidebar-nav.vue'
import TopBar from './top-bar.vue'
import AppFooter from './app-footer.vue'
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background: var(--color-white);
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.app-content {
  flex: 1;
  overflow-y: auto;
}
</style>
<style scoped>
.app-main { min-width: 0; }
@media (max-width: 600px) { .app-shell { flex-direction: column; } }
</style>
