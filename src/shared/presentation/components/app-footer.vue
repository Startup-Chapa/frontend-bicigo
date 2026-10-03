<template>
  <footer class="app-footer" role="contentinfo">
    <div class="footer-left">
      <span class="footer-brand">
        <span aria-hidden="true">🚲</span> BiciGo
      </span>
      <span class="footer-tagline">{{ $t('footer.tagline') }}</span>
    </div>
    <div class="footer-links">
      <RouterLink to="/terms" class="footer-link">{{ $t('footer.terms') }}</RouterLink>
      <span class="footer-sep" aria-hidden="true">·</span>
      <RouterLink to="/privacy" class="footer-link">{{ $t('footer.privacy') }}</RouterLink>
    </div>
    <p class="footer-copy">{{ $t('footer.copyright') }}</p>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.app-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-neutral-light);
  font-size: 0.75rem;
  color: var(--color-neutral-medium);
  flex-shrink: 0;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-brand {
  font-weight: 700;
  color: var(--color-primary-dark);
  letter-spacing: 0.04em;
}

.footer-tagline {
  color: var(--color-neutral-medium);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.footer-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-link {
  color: var(--color-neutral-medium);
  text-decoration: none;
  transition: color 0.2s;
}

.footer-link:hover { color: var(--color-primary-dark); }

.footer-sep { color: var(--color-neutral-medium); }

.footer-copy { margin: 0; }
</style>