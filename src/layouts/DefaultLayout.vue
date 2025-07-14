<template>
  <div class="default-layout">
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
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.content {
  flex: 1;
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
