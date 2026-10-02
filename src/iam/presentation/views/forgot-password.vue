<script setup>
import { ref, reactive, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required, email } from '@vuelidate/validators'
import { useIamStore } from '../../application/iam.store.js'
import LanguageSwitcher from '../../../shared/presentation/components/language-switcher.vue'

const iamStore = useIamStore()

const form  = reactive({ email: '' })
const sent  = ref(false)
const v$    = useVuelidate({ email: { required, email } }, form)

onMounted(() => iamStore.clearErrors())

async function handleSubmit() {
  const valid = await v$.value.$validate()
  if (!valid) return

  const ok = await iamStore.requestPasswordReset(form.email.trim())
  if (ok) sent.value = true
}
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-lang-row">
        <LanguageSwitcher />
      </div>

      <div v-if="sent" class="iam-success-block">
        <i class="pi pi-envelope" aria-hidden="true" />
        <h2>{{ $t('auth.resetEmailSentTitle') }}</h2>
        <p class="auth-subtitle">{{ $t('auth.resetEmailSentDesc') }}</p>
        <RouterLink :to="{ name: 'login' }" class="auth-link">{{ $t('auth.backToLogin') }}</RouterLink>
      </div>

      <template v-else>
        <h1 class="auth-title">{{ $t('auth.forgotPasswordTitle') }}</h1>
        <p class="auth-subtitle">{{ $t('auth.forgotPasswordDesc') }}</p>

        <div v-if="iamStore.errors.length" class="iam-alert iam-alert--danger" role="alert">
          <i class="pi pi-times-circle" aria-hidden="true" />
          {{ $t('errors.' + iamStore.errors[0]) }}
        </div>

        <form novalidate @submit.prevent="handleSubmit">
          <div class="iam-field">
            <pv-float-label>
              <pv-input-text
                  id="fp-email"
                  v-model="form.email"
                  type="email"
                  autocomplete="email"
                  :invalid="v$.email.$error"
                  :aria-invalid="v$.email.$error"
                  aria-describedby="fp-email-error"
                  fluid
              />
              <label for="fp-email">{{ $t('auth.email') }}</label>
            </pv-float-label>
            <span v-if="v$.email.$error" id="fp-email-error" class="iam-error" role="alert">
              {{ $t('auth.emailInvalid') }}
            </span>
          </div>

          <pv-button
              type="submit"
              :label="$t('auth.sendResetLink')"
              icon="pi pi-send"
              :loading="iamStore.loading"
              fluid
          />
        </form>

        <RouterLink :to="{ name: 'login' }" class="auth-back-link">{{ $t('auth.backToLogin') }}</RouterLink>
      </template>
    </div>
  </div>
</template>
