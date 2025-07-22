export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: ['@pinia/nuxt', '@vueuse/nuxt'],

  css: ['~/assets/main.css'],

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

  imports: {
    dirs: ['composables', 'stores', 'utils'],
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  compatibilityDate: '2025-07-22',
})
