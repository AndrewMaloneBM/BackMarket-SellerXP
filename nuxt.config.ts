const appBaseURL = process.env.NUXT_APP_BASE_URL ?? '/'

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
    baseURL: appBaseURL,
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: `${appBaseURL}bm-avatar.svg` },
        { rel: 'icon', type: 'image/x-icon', href: `${appBaseURL}favicon.ico` },
      ],
      script: [{ src: 'https://mcp.figma.com/mcp/html-to-design/capture.js', async: true }],
    },
  },
  nitro: {
    prerender: {
      routes: ['/', '/prototypes/money-tab', '/prototypes/support-ai', '/prototypes/tier-dashboard', '/share/backfunds'],
    },
  },
})
