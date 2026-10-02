<script setup>
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useIamStore } from '../../application/iam.store.js'

const { t } = useI18n()
const router = useRouter()
const iamStore = useIamStore()

function logout() {
  iamStore.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="flex align-items-center gap-2 mr-3">
    <template v-if="iamStore.isAuthenticated">
      <pv-button
          class="p-button-text"
          icon="pi pi-user"
          :label="iamStore.currentUser?.firstName || t('profile.myProfile')"
          @click="router.push({ name: 'profile' })"
      />
      <pv-button
          class="p-button-text"
          icon="pi pi-sign-out"
          :aria-label="t('auth.logout')"
          :title="t('auth.logout')"
          @click="logout"
      />
    </template>
    <template v-else>
      <pv-button class="p-button-text" :label="t('auth.login')" @click="router.push({ name: 'login' })" />
      <pv-button :label="t('auth.signUp')" @click="router.push({ name: 'register' })" />
    </template>
  </div>
</template>