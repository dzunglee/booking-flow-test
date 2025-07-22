<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

// Auto redirect to booking page
await navigateTo('/booking', { replace: true })
</script>

<template>
  <!-- This template won't be rendered due to redirect -->
  <div>
    <p>Redirecting to booking...</p>
  </div>
</template>

<!-- No styles needed for redirect page -->
