<template>
  <nav class="app-navigation">
    <div class="nav-container">
      <NuxtLink to="/booking" class="nav-logo">
        <h1>🏨 Room Booking</h1>
      </NuxtLink>

      <ul class="nav-menu" :class="{ 'nav-menu-open': isMobileMenuOpen }">
        <li class="nav-item">
          <NuxtLink to="/booking" class="nav-link">Room Search</NuxtLink>
        </li>
        <li class="nav-item" v-if="user">
          <NuxtLink to="/dashboard" class="nav-link">Dashboard</NuxtLink>
        </li>
      </ul>

      <div class="nav-user-menu">
        <template v-if="user">
          <span class="user-greeting">Hi, {{ user.name }}</span>
          <button class="nav-button logout-button" @click="handleLogout">Logout</button>
        </template>
        <template v-else>
          <NuxtLink to="/auth/login" class="nav-button login-button">Login</NuxtLink>
          <NuxtLink to="/auth/register" class="nav-button register-button">Register</NuxtLink>
        </template>
      </div>

      <button class="mobile-menu-toggle" @click="toggleMobileMenu" :class="{ 'mobile-menu-toggle-open': isMobileMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
const isMobileMenuOpen = ref(false)
const user = ref(null)

const checkAuth = async () => {
  try {
    const { data } = await $fetch('/api/auth/me')
    user.value = data?.user || null
  } catch (error) {
    user.value = null
  }
}

const handleLogout = async () => {
  try {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/auth/login')
    isMobileMenuOpen.value = false
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

onMounted(() => {
  checkAuth()
})

watch(
  () => useRoute().path,
  () => {
    checkAuth()
  },
)
</script>

<style scoped>
.app-navigation {
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 70px;
}

.nav-logo {
  text-decoration: none;
  color: #2c3e50;
}

.nav-logo h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2rem;
}

.nav-item {
  margin: 0;
}

.nav-link {
  text-decoration: none;
  color: #555;
  font-weight: 500;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  position: relative;
  display: block;
}

.nav-link:hover {
  color: #2c3e50;
  background-color: #f8f9fa;
}

.nav-link.router-link-active {
  color: #2c3e50;
  background-color: #e9ecef;
  font-weight: 600;
}

.nav-user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-greeting {
  color: #555;
  font-weight: 500;
  margin-right: 0.5rem;
}

.nav-button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-block;
  text-align: center;
}

.login-button {
  background-color: transparent;
  color: #2c3e50;
  border: 1px solid #dee2e6;
}

.login-button:hover {
  background-color: #f8f9fa;
  border-color: #adb5bd;
}

.register-button {
  background-color: #2c3e50;
  color: white;
}

.register-button:hover {
  background-color: #34495e;
}

.logout-button {
  background-color: #f8f9fa;
  color: #2c3e50;
  border: 1px solid #dee2e6;
}

.logout-button:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

/* Mobile Menu Toggle */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-around;
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.mobile-menu-toggle span {
  width: 100%;
  height: 2px;
  background-color: #2c3e50;
  transition: all 0.3s ease;
}

.mobile-menu-toggle-open span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.mobile-menu-toggle-open span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle-open span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -6px);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 1rem;
  }

  .nav-logo h1 {
    font-size: 1.5rem;
  }

  .nav-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    flex-direction: column;
    background-color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    gap: 0.5rem;
    transform: translateY(-10px);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .nav-menu-open {
    transform: translateY(0);
    opacity: 1;
    visibility: visible;
  }

  .nav-link {
    padding: 0.75rem 1rem;
    display: block;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .nav-user-menu {
    gap: 0.5rem;
  }

  .user-greeting {
    display: none;
  }

  .nav-button {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 0.5rem;
  }

  .nav-logo h1 {
    font-size: 1.3rem;
  }

  .nav-button {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
}
</style>
