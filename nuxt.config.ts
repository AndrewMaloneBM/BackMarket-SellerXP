const appBaseURL = process.env.NUXT_APP_BASE_URL ?? '/'

/**
 * Tester mode (TESTER_MODE=true) builds a stripped, tester-only copy of the
 * deals-step-one prototype for external sharing:
 *  - every page except deals-step-one is removed from the build (pages:extend)
 *  - deals-step-one is remapped to "/" so testers land on the root
 *  - noindex/nofollow meta, neutral page title, no hub tooling script
 * The default build (no flag) is completely unchanged.
 */
const testerMode = process.env.TESTER_MODE === 'true'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  tailwindcss: {
    configPath: '~/tailwind.config.ts',
    cssPath: '~/assets/css/main.css',
  },
  runtimeConfig: {
    public: {
      testerMode,
    },
  },
  hooks: {
    'pages:extend'(pages) {
      if (!testerMode) return
      // Keep only deals-step-one, remapped to "/", drop everything else so no
      // hub or other-prototype code is compiled into the output.
      const kept = pages.filter((page) => page.path === '/prototypes/deals-step-one')
      for (const page of kept) {
        page.path = '/'
        page.name = 'tester-deals-step-one'
        delete page.alias
      }
      pages.splice(0, pages.length, ...kept)
    },
  },
  app: {
    // GitHub Pages serves from a subdirectory.
    // Set NUXT_APP_BASE_URL in CI; Vercel leaves it unset (defaults to /).
    baseURL: appBaseURL,
    pageTransition: { name: 'page', mode: 'out-in' },
    head: testerMode
      ? {
          title: 'Back Market',
          meta: [{ name: 'robots', content: 'noindex, nofollow' }],
          link: [
            { rel: 'icon', type: 'image/svg+xml', href: `${appBaseURL}bm-avatar.svg` },
            { rel: 'icon', type: 'image/x-icon', href: `${appBaseURL}favicon.ico` },
          ],
        }
      : {
          link: [
            { rel: 'icon', type: 'image/svg+xml', href: `${appBaseURL}bm-avatar.svg` },
            { rel: 'icon', type: 'image/x-icon', href: `${appBaseURL}favicon.ico` },
          ],
          script: [{ src: 'https://mcp.figma.com/mcp/html-to-design/capture.js', async: true }],
        },
  },
  nitro: {
    prerender: {
      routes: testerMode ? ['/'] : ['/', '/prototypes/money-tab', '/prototypes/support-ai', '/prototypes/tier-dashboard', '/share/backfunds'],
    },
  },
})
