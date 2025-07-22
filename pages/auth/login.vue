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

        <button type="submit" class="login-button" :disabled="pending" :class="{ loading: pending }">
          <span v-if="pending">Signing in...</span>
          <span v-else>Sign In</span>
        </button>
      </form>

      <div class="login-footer">
        <p>Don't have an account?</p>
        <NuxtLink to="/auth/register" class="register-link">Create an account</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'guest',
})

const form = reactive({
  email: '',
  password: '',
})

const errors = reactive({
  email: '',
  password: '',
  general: '',
})

const pending = ref(false)

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

  pending.value = true

  try {
    const { data: result } = await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: form.email,
        password: form.password,
      },
    })

    if (result.success) {
      await $fetch('/api/auth/session', {
        method: 'POST',
        body: { user: result.user, token: result.token },
      })

      await navigateTo('/dashboard')
    } else {
      errors.general = result.error || 'Login failed. Please try again.'
    }
  } catch (error: any) {
    errors.general = error.data?.message || 'Login failed. Please try again.'
  } finally {
    pending.value = false
  }
}
</script>
