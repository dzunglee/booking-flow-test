<template>
  <div class="guest-layout">
    <AppNavigation />

    <main class="guest-main">
      <div class="container">
        <slot />
      </div>
    </main>

    <footer class="guest-footer">
      <div class="container">
        <p>&copy; 2024 Room Booking. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.guest-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.guest-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.guest-footer {
  background-color: white;
  text-align: center;
  padding: 2rem 1rem;
  color: #6c757d;
  border-top: 1px solid #dee2e6;
}

.guest-footer .container {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
