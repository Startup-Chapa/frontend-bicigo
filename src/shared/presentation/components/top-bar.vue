<template>
  <header class="topbar" role="banner">
    <div class="topbar-search">
      <div class="search-box" role="search">
        <i class="pi pi-search" style="color: var(--color-neutral-medium); font-size:0.8rem" aria-hidden="true" />
        <input
            :placeholder="$t('common.search')"
            v-model="searchQuery"
            :aria-label="$t('common.search')"
            type="search"
            autocomplete="off"
        />
      </div>
    </div>

    <div class="topbar-actions">
      <button class="lang-toggle" @click="toggleLocale" :aria-label="$t('nav.toggleLanguage')">
        <span :class="{ active: locale === 'en' }">EN</span>
        <span class="lang-sep" aria-hidden="true">|</span>
        <span :class="{ active: locale === 'es' }">ES</span>
      </button>
      <button class="topbar-icon-btn" :aria-label="$t('nav.notifications')" :aria-haspopup="true">
        <i class="pi pi-bell" aria-hidden="true" />
        <span v-if="hasNotifications" class="notif-dot" role="status" :aria-label="$t('nav.newNotifications')" />
      </button>
      <div class="topbar-divider" aria-hidden="true" />
      <div class="topbar-user" @click="goToProfile" role="button" tabindex="0" :aria-label="$t('nav.userMenu', { name: displayName })" @keyup.enter="goToProfile">
        <div class="user-avatar" aria-hidden="true">{{ initials }}</div>
        <span class="user-name">{{ displayName }}</span>
        <i class="pi pi-chevron-down" style="font-size:0.7rem; color: var(--color-neutral-medium)" aria-hidden="true" />
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useIamStore } from '../../../iam/application/iam.store.js'

const router = useRouter()
const { locale } = useI18n()
const iamStore = useIamStore()

const searchQuery = ref('')
const hasNotifications = ref(true)

const displayName = computed(() => iamStore.currentUser?.username || 'Usuario')
const initials = computed(() => {
  const name = displayName.value
  return name.slice(0, 2).toUpperCase()
})

function toggleLocale() {
  locale.value = locale.value === 'es' ? 'en' : 'es'
}

function goToProfile() {
  router.push({ name: 'profile' })
}
</script>

<style scoped>
.topbar {
  height: 56px;
  background: var(--color-white);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  flex-shrink: 0;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-neutral-light);
  border: 1px solid var(--color-border);
  border-radius: 999px;
  padding: 0.45rem 1rem;
  min-width: 240px;
}

.search-box input {
  background: none;
  border: none;
  outline: none;
  color: var(--color-neutral-dark);
  font-size: 0.875rem;
  width: 100%;
}

.search-box input::placeholder { color: var(--color-neutral-medium); }

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.topbar-icon-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-neutral-medium);
  cursor: pointer;
  border-radius: var(--radius-max);
  position: relative;
  transition: color 0.2s, background 0.2s;
}

.topbar-icon-btn:hover { color: var(--color-neutral-dark); background: var(--color-neutral-light); }

.lang-toggle {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--color-neutral-light);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.25rem 0.6rem;
  cursor: pointer;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-neutral-medium);
  letter-spacing: 0.06em;
  transition: border-color 0.2s;
}
.lang-toggle:hover { border-color: var(--color-primary-brand); }
.lang-toggle span.active { color: var(--color-primary-dark); }
.lang-sep { color: var(--color-border); }

.notif-dot {
  position: absolute;
  top: 6px; right: 6px;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--color-danger);
}

.topbar-divider {
  width: 1px;
  height: 24px;
  background: var(--color-border);
  margin: 0 0.25rem;
}

.topbar-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  border-radius: var(--radius-max);
  transition: background 0.2s;
}

.topbar-user:hover { background: var(--color-neutral-light); }

.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--color-primary-brand);
  color: var(--color-neutral-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
}

.user-name { font-size: 0.875rem; font-weight: 500; color: var(--color-neutral-dark); }
</style>