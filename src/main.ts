import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import './style.css'

const pinia = createPinia()

const app = createApp(App)
const createVueApp = () => {
  app.use(router)
  app.use(pinia)
}

createVueApp()

const authStore = useAuthStore()
authStore.initializeAuth()
app.mount('#app')
