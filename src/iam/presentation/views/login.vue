<script setup>
import { reactive, onMounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import { useIamStore } from '../../application/iam.store.js'
import LanguageSwitcher from '../../../shared/presentation/components/language-switcher.vue'

const router   = useRouter()
const route    = useRoute()
const iamStore = useIamStore()

const form  = reactive({ email: '', password: '' })
const rules = {
  email:    { required, email },
  password: { required }
}
const v$ = useVuelidate(rules, form)

onMounted(() => iamStore.clearErrors())

async function handleLogin() {
  const valid = await v$.value.$validate()
  if (!valid) return

  const ok = await iamStore.login(form.email.trim(), form.password)
  if (!ok) return

  const target   = route.query.redirect
  const redirect = typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')
      ? target
      : '/home'
  router.push(redirect)
}
</script>

<template>
  <div class="auth-layout">
    <div class="auth-form-panel">
      <div class="auth-form-inner">
        <div class="auth-lang-row">
          <LanguageSwitcher />
        </div>

        <h1 class="auth-title">{{ $t('auth.loginTitle') }}</h1>
        <p class="auth-subtitle">{{ $t('auth.loginSubtitle') }}</p>

        <div v-if="iamStore.errors.length" class="iam-alert iam-alert--danger" role="alert">
          <i class="pi pi-times-circle" aria-hidden="true" />
          {{ $t('errors.' + iamStore.errors[0]) }}
        </div>

        <form novalidate @submit.prevent="handleLogin">
          <div class="iam-field">
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
            <span v-if="v$.email.$error" id="login-email-error" class="iam-error" role="alert">
              {{ $t('auth.emailInvalid') }}
            </span>
          </div>

          <div class="iam-field">
            <pv-float-label>
              <pv-password
                  id="login-password"
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
            <span v-if="v$.password.$error" id="login-password-error" class="iam-error" role="alert">
              {{ $t('auth.passwordRequired') }}
            </span>
          </div>

          <div class="auth-aside-row">
            <RouterLink :to="{ name: 'forgot-password' }" class="auth-link">{{ $t('auth.forgotPassword') }}</RouterLink>
          </div>

          <pv-button type="submit" :label="$t('auth.login')" :loading="iamStore.loading" class="w-full" />
        </form>

        <p class="auth-footer-text">
          {{ $t('auth.noAccount') }}
          <RouterLink :to="{ name: 'register' }" class="auth-link">{{ $t('auth.registerLink') }}</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
