<template>
  <div class="default-layout">
    <nav class="top-nav">
      <div class="logo">Booking Flow</div>
      <div class="user-menu" v-if="isAuthenticated">
        <span class="user-name">Hi, {{ user?.name }}</span>
        <button class="logout-button" @click="handleLogout">
          <img width="16" :src="logoutIcon" alt="Logout Icon" class="logout-icon" />
        </button>
      </div>
    </nav>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import logoutIcon from '@/assets/logout.svg?url'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const { user, isAuthenticated } = storeToRefs(authStore)
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.default-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
}

.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 60px;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-weight: 500;
  color: #2c3e50;
}

.logout-button {
  background-color: #f8f9fa;
  color: #2c3e50;
  border: 1px solid #dee2e6;
  padding: 0.5rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.logout-button:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.content {
  flex: 1;
  padding: 1rem 2rem;
}
</style>
