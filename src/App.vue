<template>
  <div id="app-shell">
    <header class="app-header">
      <router-link to="/billing/plans" class="brand">🚲 BiciGo</router-link>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  padding: 1rem 2rem;
  background: #2f3b2f;
}
.brand {
  color: #84cc16;
  font-weight: 800;
  font-size: 1.25rem;
  text-decoration: none;
}
main {
  padding: 1rem;
}
</style>
