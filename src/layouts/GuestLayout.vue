<template>
  <div class="guest-layout">
    <AppNavigation />
    <main class="content">
      <slot></slot>
    </main>
  </div>
</template>

<script setup lang="ts">
import AppNavigation from '@/components/AppNavigation.vue'
</script>

<style scoped>
.guest-layout {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem 1rem;
}

@media (max-width: 768px) {
  .content {
    padding: 1rem 0.5rem;
  }
}
</style>
