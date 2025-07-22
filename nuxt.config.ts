export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@vueuse/nuxt'],

  css: ['~/assets/main.css'],

  // Nitro for server-side storage
  nitro: {
    storage: {
      data: {
        driver: 'fs',
        base: './.data',
      },
      sessions: {
        driver: 'fs',
        base: './.sessions',
      },
    },
  },

  // Auto imports
  imports: {
    dirs: ['composables', 'stores', 'utils'],
  },

  // Component auto-imports
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  // Compatibility
  compatibilityDate: '2025-07-22',
})
