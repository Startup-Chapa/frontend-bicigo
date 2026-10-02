<script setup>
import { reactive, computed, onMounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required, email, minLength, sameAs } from '@vuelidate/validators'
import { useIamStore } from '../../application/iam.store.js'
import LanguageSwitcher from '../../../shared/presentation/components/language-switcher.vue'

const router   = useRouter()
const iamStore = useIamStore()

const form = reactive({
  firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: ''
})

const rules = computed(() => ({
  firstName:       { required },
  lastName:        { required },
  email:           { required, email },
  phone:           { valid: (value) => !value || /^\d{7,15}$/.test(value) },
  password:        { required, minLength: minLength(8) },
  confirmPassword: { required, sameAsPassword: sameAs(form.password) }
}))

const v$ = useVuelidate(rules, form)

onMounted(() => iamStore.clearErrors())

/** Blocks non-numeric keys in the phone input. */
function onlyDigits(e) {
  const allowed = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (e.ctrlKey || e.metaKey || allowed.includes(e.key)) return
  if (!/^\d$/.test(e.key)) e.preventDefault()
}

async function handleRegister() {
  const valid = await v$.value.$validate()
  if (!valid) return

  const ok = await iamStore.register({
    firstName: form.firstName.trim(),
    lastName:  form.lastName.trim(),
    email:     form.email.trim(),
    phone:     form.phone,
    password:  form.password
  })
  if (!ok) return

  router.push('/home') // ASSUMED landing route
}
</script>

<template>
  <div class="auth-layout">
    <div class="auth-form-panel">
      <div class="auth-form-inner">
        <div class="auth-lang-row">
          <LanguageSwitcher />
        </div>

        <h1 class="auth-title">{{ $t('auth.createAccount') }}</h1>
        <p class="auth-subtitle">{{ $t('auth.registerSubtitle') }}</p>

        <div v-if="iamStore.errors.length" class="iam-alert iam-alert--danger" role="alert">
          <i class="pi pi-times-circle" aria-hidden="true" />
          {{ $t('errors.' + iamStore.errors[0]) }}
        </div>

        <form novalidate @submit.prevent="handleRegister">
          <div class="iam-field-row">
            <div class="iam-field">
              <pv-float-label>
                <pv-input-text
                    id="reg-first-name"
                    v-model="form.firstName"
                    autocomplete="given-name"
                    :invalid="v$.firstName.$error"
                    :aria-invalid="v$.firstName.$error"
                    aria-describedby="reg-first-name-error"
                    fluid
                />
                <label for="reg-first-name">{{ $t('auth.firstName') }}</label>
              </pv-float-label>
              <span v-if="v$.firstName.$error" id="reg-first-name-error" class="iam-error" role="alert">
                {{ $t('auth.fieldRequired') }}
              </span>
            </div>

            <div class="iam-field">
              <pv-float-label>
                <pv-input-text
                    id="reg-last-name"
                    v-model="form.lastName"
                    autocomplete="family-name"
                    :invalid="v$.lastName.$error"
                    :aria-invalid="v$.lastName.$error"
                    aria-describedby="reg-last-name-error"
                    fluid
                />
                <label for="reg-last-name">{{ $t('auth.lastName') }}</label>
              </pv-float-label>
              <span v-if="v$.lastName.$error" id="reg-last-name-error" class="iam-error" role="alert">
                {{ $t('auth.fieldRequired') }}
              </span>
            </div>
          </div>

          <div class="iam-field">
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
            <span v-if="v$.email.$error" id="reg-email-error" class="iam-error" role="alert">
              {{ $t('auth.emailInvalid') }}
            </span>
          </div>

          <div class="iam-field">
            <pv-float-label>
              <pv-input-text
                  id="reg-phone"
                  v-model="form.phone"
                  type="tel"
                  inputmode="numeric"
                  autocomplete="tel"
                  :invalid="v$.phone.$error"
                  :aria-invalid="v$.phone.$error"
                  aria-describedby="reg-phone-error"
                  fluid
                  @keydown="onlyDigits"
              />
              <label for="reg-phone">{{ $t('auth.phone') }}</label>
            </pv-float-label>
            <span v-if="v$.phone.$error" id="reg-phone-error" class="iam-error" role="alert">
              {{ $t('auth.phoneInvalid') }}
            </span>
          </div>

          <div class="iam-field">
            <pv-float-label>
              <pv-password
                  id="reg-password"
                  v-model="form.password"
                  :feedback="false"
                  toggle-mask
                  autocomplete="new-password"
                  :invalid="v$.password.$error"
                  :aria-invalid="v$.password.$error"
                  aria-describedby="reg-password-error"
                  fluid
              />
              <label for="reg-password">{{ $t('auth.password') }}</label>
            </pv-float-label>
            <span v-if="v$.password.$error" id="reg-password-error" class="iam-error" role="alert">
              {{ $t('auth.passwordMin') }}
            </span>
          </div>

          <div class="iam-field">
            <pv-float-label>
              <pv-password
                  id="reg-confirm"
                  v-model="form.confirmPassword"
                  :feedback="false"
                  toggle-mask
                  autocomplete="new-password"
                  :invalid="v$.confirmPassword.$error"
                  :aria-invalid="v$.confirmPassword.$error"
                  aria-describedby="reg-confirm-error"
                  fluid
              />
              <label for="reg-confirm">{{ $t('auth.confirmPassword') }}</label>
            </pv-float-label>
            <span v-if="v$.confirmPassword.$error" id="reg-confirm-error" class="iam-error" role="alert">
              {{ $t('auth.passwordMismatch') }}
            </span>
          </div>

          <pv-button type="submit" :label="$t('auth.signUp')" :loading="iamStore.loading" class="w-full" />
        </form>

        <p class="auth-footer-text">
          {{ $t('auth.alreadyHaveAccount') }}
          <RouterLink :to="{ name: 'login' }" class="auth-link">{{ $t('auth.login') }}</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>