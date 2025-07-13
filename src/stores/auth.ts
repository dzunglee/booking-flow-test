import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface User {
  id: number
  name: string
  email: string
  createdAt: string
}

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  name: string
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const isAuthenticated = computed(() => !!user.value)
  const initializeAuth = () => {
    const allUsers = localStorage.getItem('users')
    const users = allUsers ? JSON.parse(allUsers) : []
    console.log('🚀 ~ initializeAuth ~ users:', users)
    if (users.length === 0) {
      localStorage.setItem('users', JSON.stringify([{ id: Date.now(), name: 'Admin user', email: 'admin@gmail.com', password: '123456' }]))
    }
    const currentUser = localStorage.getItem('user')
    if (currentUser) {
      try {
        user.value = JSON.parse(currentUser)
      } catch (error) {
        console.log('Error parsing user from local storage:', error)
      }
    }
  }
  const login = async (credentials: LoginPayload) => {
    try {
      isLoading.value = true
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const allUsers = localStorage.getItem('users')
      const users = allUsers ? JSON.parse(allUsers) : []
      const foundUser = users.find((u: User & { password: string }) => u.email.toLowerCase() === credentials.email.toLowerCase() && u.password === credentials.password)
      isLoading.value = false
      if (!foundUser) {
        return { success: false, error: 'Invalid email or password' }
      }
      const { password, ...rest } = foundUser
      user.value = rest
      localStorage.setItem('user', JSON.stringify(rest))
      return {
        success: true,
        message: 'Login successful!',
      }
    } catch (error) {
      isLoading.value = false
      return {
        success: false,
        error: 'Login failed',
      }
    }
  }
  const register = async (credentials: RegisterPayload) => {
    try {
      isLoading.value = true
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const allUsers = localStorage.getItem('users') || ''
      const users = allUsers ? JSON.parse(allUsers) : ([] as User[])
      // check if user arlready exists
      if (users.some((u: User) => u.email.toLowerCase() === credentials.email.toLowerCase())) {
        return { success: false, error: 'Email already registered!' }
      }
      const newUser: User = {
        id: Date.now(),
        name: credentials.name,
        email: credentials.email,
        createdAt: new Date().toISOString(),
      }
      users.push({ ...newUser, password: credentials.password })
      localStorage.setItem('users', JSON.stringify(users))
      isLoading.value = false
      return {
        success: true,
        message: 'Registration successful!',
        data: newUser,
      }
    } catch (error) {
      isLoading.value = false
      return {
        success: false,
        error: 'Registration failed',
      }
    }
  }
  const logout = () => {
    user.value = null
    localStorage.removeItem('user')
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    initializeAuth,
    login,
    register,
    logout,
  }
})
