<template>
  <div class="auth-layout">
    <!-- Form panel -->
    <div class="auth-form-panel">
      <div class="auth-form-inner">
        <h1>LOG IN</h1>

        <div v-if="iamStore.errors.length" class="alert alert-danger">
          {{ $t('auth.invalidCredentials') }}
        </div>

        <form @submit.prevent="handleLogin" novalidate>
          <div class="auth-field">
            <pv-float-label>
              <pv-input-text
                  id="login-email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  :invalid="v$.email.$error"
                  :aria-invalid="v$.email.$error"
                  aria-describedby="login-email-error"
                  fluid
              />
              <label for="login-email">{{ $t('auth.email') }}</label>
            </pv-float-label>
            <span v-if="v$.email.$error" id="login-email-error" class="error-msg" role="alert">
              {{ v$.email.required.$invalid ? $t('auth.emailRequired') : $t('auth.emailInvalid') }}
            </span>
          </div>

          <div class="auth-field">
            <pv-float-label>
              <pv-password
                  input-id="login-password"
                  v-model="form.password"
                  :feedback="false"
                  toggle-mask
                  autocomplete="current-password"
                  :invalid="v$.password.$error"
                  :aria-invalid="v$.password.$error"
                  aria-describedby="login-password-error"
                  fluid
              />
              <label for="login-password">{{ $t('auth.password') }}</label>
            </pv-float-label>
            <span v-if="v$.password.$error" id="login-password-error" class="error-msg" role="alert">{{ $t('auth.passwordRequired') }}</span>
          </div>

          <div class="login-row">
            <RouterLink to="/auth/forgot" class="forgot-link">{{ $t('auth.forgotPassword') }}</RouterLink>

            <div class="login-row-right">
              <button type="button" class="lang-toggle" @click="toggleLocale" :aria-label="$t('nav.toggleLanguage')">
                <span :class="{ active: locale === 'en' }">EN</span>
                <span class="lang-sep" aria-hidden="true">|</span>
                <span :class="{ active: locale === 'es' }">ES</span>
              </button>

              <div class="flex align-items-center gap-2">
                <pv-checkbox v-model="form.remember" input-id="remember-me" :binary="true" />
                <label for="remember-me" style="color: var(--color-neutral-medium); font-size: 0.82rem; cursor: pointer">
                  {{ $t('auth.rememberMe') }}
                </label>
              </div>
            </div>
          </div>

          <pv-button
              type="submit"
              :label="$t('auth.login')"
              :loading="iamStore.loading"
              class="w-full"
              style="margin-top:1.5rem"
          />
        </form>

        <p class="register-link">
          {{ $t('auth.noAccount') }}
          <RouterLink to="/auth/register" class="text-link">{{ $t('auth.registerLink') }}</RouterLink>
        </p>
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
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useIamStore, PLANS } from '../../../application/iam.store.js'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'

const router   = useRouter()
const route = useRoute()
const iamStore = useIamStore()
const { locale } = useI18n({ useScope: 'global' })

const form = reactive({ email: '', password: '', remember: false })

const rules = {
  email:    { required, email },
  password: { required }
}

const v$ = useVuelidate(rules, form)

function toggleLocale() {
  locale.value = locale.value === 'es' ? 'en' : 'es'
}

async function handleLogin() {
  await v$.value.$validate()
  if (v$.value.$error) return

  const ok = await iamStore.login(form.email, form.password)
  if (!ok) return

  if (typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') && !route.query.redirect.startsWith('//')) router.push(route.query.redirect)
  else if (iamStore.currentUser?.plan === PLANS.PRO) router.push({ name: 'pro-dashboard' })
  else router.push({ name: 'tarifa-dashboard' })
}
</script>

<style scoped>
.login-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.82rem;
}

.login-row-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.forgot-link {
  color: var(--color-neutral-medium);
  text-decoration: none;
  font-size: 0.8rem;
}

.forgot-link:hover { color: var(--color-primary-dark); }

.brand-text-block { text-align: center; }

.brand-name {
  font-size: 1.6rem;
  font-weight: 900;
  color: var(--color-primary-brand);
  letter-spacing: 0.12em;
}

.brand-tagline {
  font-size: 0.7rem;
  color: var(--color-neutral-light);
  letter-spacing: 0.15em;
  margin-top: 0.25rem;
}

.register-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.82rem;
  color: var(--color-neutral-medium);
}

.text-link {
  color: var(--color-primary-dark);
  font-weight: 600;
  text-decoration: none;
}

.text-link:hover { text-decoration: underline; }
</style>
