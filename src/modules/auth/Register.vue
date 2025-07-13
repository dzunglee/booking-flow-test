<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">Create Account</h2>
      <p class="login-subtitle">Join us today! Create your account to get started.</p>

      <form @submit.prevent="handleRegister" class="login-form">
        <div class="form-group">
          <label for="name" class="form-label">Full Name</label>
          <input id="name" v-model="form.name" type="text" class="form-input" :class="{ 'form-input-error': errors.name }" placeholder="Enter your full name" required />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <input id="email" v-model="form.email" type="email" class="form-input" :class="{ 'form-input-error': errors.email }" placeholder="Enter your email" required />
          <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input id="password" v-model="form.password" type="password" class="form-input" :class="{ 'form-input-error': errors.password }" placeholder="Enter your password" required />
          <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input id="confirmPassword" v-model="form.confirmPassword" type="password" class="form-input" :class="{ 'form-input-error': errors.confirmPassword }" placeholder="Confirm your password" required />
          <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
        </div>

        <div v-if="errors.general" class="error-message general-error">
          {{ errors.general }}
        </div>

        <button type="submit" class="login-button" :disabled="authStore.isLoading" :class="{ loading: authStore.isLoading }">
          <span v-if="authStore.isLoading">Creating account...</span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <div class="login-footer">
        <p>Already have an account?</p>
        <router-link to="/login" class="login-link">Sign in here</router-link>
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
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  general: '',
})

const clearErrors = () => {
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.general = ''
}

const validateForm = () => {
  clearErrors()
  let isValid = true

  if (!form.name.trim()) {
    errors.name = 'Full name is required'
    isValid = false
  } else if (form.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long'
    isValid = false
  }

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

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  const result = await authStore.register({
    name: form.name.trim(),
    email: form.email,
    password: form.password,
  })

  if (result.success) {
    router.push('/')
  } else {
    console.log(result.error)
    errors.general = result.error || 'Registration failed. Please try again.'
  }
}
</script>

<style scoped></style>
