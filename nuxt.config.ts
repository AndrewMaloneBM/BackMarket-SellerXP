export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  tailwindcss: {
    configPath: '~/tailwind.config.ts',
    cssPath: '~/assets/css/main.css',
  },
  app: {
    // GitHub Pages serves from /sellerxp-prototypes/ subdirectory.
    // Set NUXT_APP_BASE_URL in CI; Vercel leaves it unset (defaults to /).
    baseURL: process.env.NUXT_APP_BASE_URL ?? '/',
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      script: [{ src: 'https://mcp.figma.com/mcp/html-to-design/capture.js', async: true }],
    },
  },
  nitro: {
    prerender: {
      routes: ['/', '/prototypes/money-tab', '/prototypes/support-ai', '/share/backfunds'],
    },
  },
})
