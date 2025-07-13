<template>
  <div class="guest-layout">
    <slot></slot>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.guest-layout {
  display: flex;
  min-height: 100vh;
  flex-direction: column;
  justify-content: center;
}
</style>
