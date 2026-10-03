<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useIamStore } from '../../../application/iam.store.js'

const { t, locale } = useI18n()
const iamStore = useIamStore()

const email    = ref('')
const sent     = ref(false)
const emailErr = ref('')

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function toggleLocale() {
  locale.value = locale.value === 'es' ? 'en' : 'es'
}

async function handleSubmit() {
  emailErr.value = ''

  if (!email.value.trim() || !EMAIL_RE.test(email.value.trim())) {
    emailErr.value = t('auth.emailInvalid')
    return
  }

  const ok = await iamStore.requestPasswordReset(email.value.trim())
  if (ok) {
    sent.value = true
  } else {
    emailErr.value = t('auth.resetError')
  }
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-lang-row">
        <button type="button" class="lang-toggle" @click="toggleLocale" :aria-label="$t('nav.toggleLanguage')">
          <span :class="{ active: locale === 'en' }">EN</span>
          <span class="lang-sep" aria-hidden="true">|</span>
          <span :class="{ active: locale === 'es' }">ES</span>
        </button>
      </div>

      <div v-if="sent" class="success-block">
        <i class="pi pi-envelope" style="font-size:2rem;color:var(--color-primary-brand);display:block;margin-bottom:0.75rem" />
        <h2>{{ $t('auth.resetEmailSentTitle') }}</h2>
        <p class="auth-subtitle">{{ $t('auth.resetEmailSentDesc') }}</p>
        <RouterLink to="/auth/login" class="btn-link" style="margin-top:1.5rem;display:inline-block">
          ← {{ $t('auth.backToLogin') }}
        </RouterLink>
      </div>

      <template v-else>
        <h1>{{ $t('auth.forgotPasswordTitle') }}</h1>
        <p class="auth-subtitle">{{ $t('auth.forgotPasswordDesc') }}</p>

        <form @submit.prevent="handleSubmit" novalidate>
          <pv-float-label variant="on" class="auth-field">
            <pv-input-text
                id="fp-email"
                v-model="email"
                type="email"
                autocomplete="email"
                :invalid="!!emailErr"
                :aria-invalid="!!emailErr"
                aria-describedby="fp-email-error"
                fluid
            />
            <label for="fp-email">{{ $t('auth.email') }}</label>
          </pv-float-label>
          <span v-if="emailErr" id="fp-email-error" class="error-msg" role="alert">{{ emailErr }}</span>

          <pv-button
              type="submit"
              :label="$t('auth.sendResetLink')"
              icon="pi pi-send"
              :loading="iamStore.loading"
              fluid
              style="margin-top:1.25rem"
          />
        </form>

        <RouterLink to="/auth/login" class="back-link">
          ← {{ $t('auth.backToLogin') }}
        </RouterLink>
      </template>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-neutral-light);
  padding: 1rem;
}

.auth-card {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(38, 50, 56, 0.08);
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
}

.auth-lang-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

h1 {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-neutral-dark);
  margin-bottom: 0.4rem;
}

.auth-subtitle {
  font-size: 0.85rem;
  color: var(--color-neutral-medium);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.auth-field { width: 100%; margin-top: 0.5rem; }

.back-link {
  display: block;
  margin-top: 1.25rem;
  font-size: 0.82rem;
  color: var(--color-neutral-medium);
  text-decoration: none;
  text-align: center;
  transition: color 0.2s;
}
.back-link:hover { color: var(--color-primary-dark); }

.success-block { text-align: center; padding: 1rem 0; }
.success-block h2 { font-size: 1.1rem; font-weight: 700; color: var(--color-neutral-dark); margin-bottom: 0.5rem; }

.btn-link {
  color: var(--color-primary-dark);
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
}
.btn-link:hover { text-decoration: underline; }
</style>