<template>
  <div class="auth-layout">
    <!-- Form panel -->
    <div class="auth-form-panel">
      <div class="auth-form-inner">
        <h1>{{ $t('auth.createAccount') }}</h1>

        <div v-if="iamStore.errors.length" class="alert alert-danger">
          {{ $t('auth.registerError') }}
        </div>

        <pv-button
            :label="$t('auth.continueGoogle')"
            severity="secondary"
            outlined
            class="w-full"
            type="button"
        >
          <template #icon>
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" width="18" alt="Google" style="margin-right:0.5rem" />
          </template>
        </pv-button>

        <div class="auth-divider">{{ $t('auth.or') }}</div>

        <form @submit.prevent="handleRegister" novalidate>
          <div class="auth-field">
            <pv-float-label>
              <pv-input-text
                  id="reg-email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  :invalid="v$.email.$error"
                  :aria-invalid="v$.email.$error"
                  aria-describedby="reg-email-error"
                  fluid
              />
              <label for="reg-email">{{ $t('auth.email') }}</label>
            </pv-float-label>
            <span v-if="v$.email.$error" id="reg-email-error" class="error-msg" role="alert">{{ $t('auth.emailInvalid') }}</span>
          </div>

          <div class="auth-field">
            <pv-float-label>
              <pv-input-text
                  id="reg-username"
                  v-model="form.username"
                  autocomplete="username"
                  :invalid="v$.username.$error"
                  :aria-invalid="v$.username.$error"
                  aria-describedby="reg-username-error"
                  fluid
              />
              <label for="reg-username">{{ $t('auth.username') }}</label>
            </pv-float-label>
            <span v-if="v$.username.$error" id="reg-username-error" class="error-msg" role="alert">{{ $t('auth.fieldRequired') }}</span>
          </div>

          <div class="auth-field">
            <pv-float-label>
              <pv-password
                  input-id="reg-password"
                  v-model="form.password"
                  toggle-mask
                  autocomplete="new-password"
                  :invalid="v$.password.$error"
                  :aria-invalid="v$.password.$error"
                  aria-describedby="reg-password-error"
                  fluid
              />
              <label for="reg-password">{{ $t('auth.password') }}</label>
            </pv-float-label>
            <span v-if="v$.password.$error" id="reg-password-error" class="error-msg" role="alert">{{ $t('auth.passwordRequired') }}</span>
          </div>

          <div class="auth-field">
            <pv-float-label>
              <pv-input-text
                  id="reg-phone"
                  v-model="form.phoneNumber"
                  type="tel"
                  autocomplete="tel"
                  fluid
              />
              <label for="reg-phone">{{ $t('auth.phoneNumber') }}</label>
            </pv-float-label>
          </div>

          <div class="account-row">
            <p class="account-text">
              {{ $t('auth.alreadyHaveAccount') }}
              <RouterLink to="/auth/login" class="text-link">{{ $t('auth.login') }}</RouterLink>
            </p>

            <button type="button" class="lang-toggle" @click="toggleLocale" :aria-label="$t('nav.toggleLanguage')">
              <span :class="{ active: locale === 'en' }">EN</span>
              <span class="lang-sep" aria-hidden="true">|</span>
              <span :class="{ active: locale === 'es' }">ES</span>
            </button>
          </div>

          <pv-button
              type="submit"
              :label="$t('auth.signUp')"
              :loading="iamStore.loading"
              class="w-full"
          />
        </form>
      </div>
    </div>

    <!-- Brand panel -->
    <div class="auth-brand-panel">
      <div class="brand-logo-text">🚲</div>
      <div class="brand-text-block">
        <p class="brand-name">BICIGO</p>
        <p class="brand-tagline">Una nueva forma de llegar a tu destino</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useIamStore } from '../../../application/iam.store.js'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'

const router   = useRouter()
const iamStore = useIamStore()
const { locale } = useI18n()

const form = reactive({
  email: '', username: '', password: '', phoneNumber: ''
})

const rules = {
  email:    { required, email },
  username: { required },
  password: { required }
}

const v$ = useVuelidate(rules, form)

function toggleLocale() {
  locale.value = locale.value === 'es' ? 'en' : 'es'
}

async function handleRegister() {
  await v$.value.$validate()
  if (v$.value.$error) return

  const ok = await iamStore.register({
    email:       form.email,
    username:    form.username,
    password:    form.password,
    phoneNumber: form.phoneNumber
  })

  if (!ok) return

  router.push({ name: 'tarifa-dashboard' })
}
</script>

<style scoped>
.account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.account-text {
  font-size: 0.8rem;
  color: var(--color-neutral-medium);
}

.brand-text-block { text-align: center; }
.brand-name { font-size: 1.6rem; font-weight: 900; color: var(--color-primary-brand); letter-spacing: 0.12em; }
.brand-tagline { font-size: 0.7rem; color: var(--color-neutral-light); letter-spacing: 0.15em; margin-top: 0.25rem; }
.text-link { color: var(--color-primary-dark); font-weight: 600; text-decoration: none; }
.text-link:hover { text-decoration: underline; }
</style>