<template>
  <div class="app-layout">
    <AppNavigation />

    <main class="app-main">
      <slot />
    </main>

    <footer class="app-footer">
      <div class="footer-container">
        <p>&copy; 2024 Room Booking. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
  width: 100%;
}

.app-footer {
  background-color: #f8f9fa;
  text-align: center;
  padding: 2rem 1rem;
  color: #6c757d;
  border-top: 1px solid #dee2e6;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
