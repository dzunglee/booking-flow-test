<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">Sign In</h2>
      <p class="login-subtitle">Welcome back! Please sign in to your account.</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <input id="email" v-model="form.email" type="email" class="form-input" :class="{ 'form-input-error': errors.email }" placeholder="Enter your email" autocomplete="off" required />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input id="password" v-model="form.password" type="password" class="form-input" :class="{ 'form-input-error': errors.password }" placeholder="Enter your password" autocomplete="off" required />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div v-if="errors.general" class="error-message general-error">
          {{ errors.general }}
        </div>

        <button type="submit" class="login-button" :disabled="authStore.isLoading" :class="{ loading: authStore.isLoading }">
          <span v-if="authStore.isLoading">Signing in...</span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <div class="login-footer">
        <p>Don't have an account?</p>
        <router-link to="/register" class="register-link">Create an account</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
  general: '',
})

const clearErrors = () => {
  errors.email = ''
  errors.password = ''
  errors.general = ''
}

const validateForm = () => {
  clearErrors()
  let isValid = true

  if (!form.email) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long'
    isValid = false
  }

  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) {
    return
  }

  const result = await authStore.login({
    email: form.email,
    password: form.password,
  })

  if (result.success) {
    router.push('/')
  } else {
    console.log(result.error)
    errors.general = result.error || 'Login failed. Please try again.'
  }
}
</script>

<style scoped></style>
