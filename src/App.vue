
<template>
  <component :is="isAuthenticated ? DefaultLayout : GuestLayout">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DefaultLayout from './layouts/DefaultLayout.vue';
import GuestLayout from './layouts/GuestLayout.vue';
import { useAuthStore } from './stores/auth';

defineOptions({
  name: 'App',
});


const authStore = useAuthStore();

const isAuthenticated = computed(() => authStore.isAuthenticated);
</script>


<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
