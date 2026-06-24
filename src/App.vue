<script setup>
import { watch } from 'vue'
import { RouterView } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import { useAuth } from '@/composables/useAuth'

const { isAuthenticated, syncUser } = useAuth()

watch(isAuthenticated, (val) => {
  if (val) syncUser()
}, { immediate: true })
</script>

<template>
  <AppHeader />
  <RouterView />
  <AppFooter />
</template>
