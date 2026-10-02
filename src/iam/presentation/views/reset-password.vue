<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required, minLength, sameAs } from '@vuelidate/validators'
import { useIamStore } from '../../application/iam.store.js'
import LanguageSwitcher from '../../../shared/presentation/components/language-switcher.vue'

const route    = useRoute()
const router   = useRouter()
const iamStore = useIamStore()

const resetToken = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))

const form = reactive({ password: '', confirmPassword: '' })
const done = ref(false)

const rules = computed(() => ({
  password:        { required, minLength: minLength(8) },
  confirmPassword: { required, sameAsPassword: sameAs(form.password) }
}))
const v$ = useVuelidate(rules, form)

onMounted(() => iamStore.clearErrors())

async function handleSubmit() {
  const valid = await v$.value.$validate()
  if (!valid || !resetToken.value) return

  const ok = await iamStore.resetPassword(resetToken.value, form.password)
  if (ok) done.value = true
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-lang-row">
        <LanguageSwitcher />
      </div>

      <div v-if="done" class="iam-success-block">
        <i class="pi pi-check-circle" aria-hidden="true" />
        <h2>{{ $t('auth.resetDoneTitle') }}</h2>
        <p class="auth-subtitle">{{ $t('auth.resetDoneDesc') }}</p>
        <pv-button
            :label="$t('auth.goToLogin')"
            icon="pi pi-sign-in"
            fluid
            @click="router.push({ name: 'login' })"
        />
      </div>

      <div v-else-if="!resetToken" class="iam-success-block">
        <i class="pi pi-exclamation-triangle" aria-hidden="true" />
        <h2>{{ $t('auth.resetMissingTokenTitle') }}</h2>
        <p class="auth-subtitle">{{ $t('auth.resetMissingTokenDesc') }}</p>
        <RouterLink :to="{ name: 'forgot-password' }" class="auth-link">{{ $t('auth.requestNewLink') }}</RouterLink>
      </div>

      <template v-else>
        <h1 class="auth-title">{{ $t('auth.resetTitle') }}</h1>
        <p class="auth-subtitle">{{ $t('auth.resetSubtitle') }}</p>

        <div v-if="iamStore.errors.length" class="iam-alert iam-alert--danger" role="alert">
          <i class="pi pi-times-circle" aria-hidden="true" />
          {{ $t('errors.' + iamStore.errors[0]) }}
        </div>

        <form novalidate @submit.prevent="handleSubmit">
          <div class="iam-field">
            <pv-float-label>
              <pv-password
                  id="rp-password"
                  v-model="form.password"
                  :feedback="false"
                  toggle-mask
                  autocomplete="new-password"
                  :invalid="v$.password.$error"
                  :aria-invalid="v$.password.$error"
                  aria-describedby="rp-password-error"
                  fluid
              />
              <label for="rp-password">{{ $t('auth.newPassword') }}</label>
            </pv-float-label>
            <span v-if="v$.password.$error" id="rp-password-error" class="iam-error" role="alert">
              {{ $t('auth.passwordMin') }}
            </span>
          </div>

          <div class="iam-field">
            <pv-float-label>
              <pv-password
                  id="rp-confirm"
                  v-model="form.confirmPassword"
                  :feedback="false"
                  toggle-mask
                  autocomplete="new-password"
                  :invalid="v$.confirmPassword.$error"
                  :aria-invalid="v$.confirmPassword.$error"
                  aria-describedby="rp-confirm-error"
                  fluid
              />
              <label for="rp-confirm">{{ $t('auth.confirmPassword') }}</label>
            </pv-float-label>
            <span v-if="v$.confirmPassword.$error" id="rp-confirm-error" class="iam-error" role="alert">
              {{ $t('auth.passwordMismatch') }}
            </span>
          </div>

          <pv-button
              type="submit"
              :label="$t('auth.resetSubmit')"
              icon="pi pi-lock"
              :loading="iamStore.loading"
              fluid
          />
        </form>

        <RouterLink :to="{ name: 'login' }" class="auth-back-link">{{ $t('auth.backToLogin') }}</RouterLink>
      </template>
    </div>
  </div>
</template>