<script setup lang="ts">
// Hub redesign sandbox. Local tinkering only: live at /redesign on the dev
// server, never linked from the main hub, not in the prod prerender list.
definePageMeta({ layout: false })

const { hub } = useAppConfig()
const runtimeConfig = useRuntimeConfig()
const baseHref = (runtimeConfig.app.baseURL ?? '/').replace(/\/$/, '')
const withBase = (path: string) => `${baseHref}${path}`

useHead({ title: `${hub.teamName} Hub · Redesign` })

const prototypes = useHubPrototypes()
</script>

<template>
  <div class="min-h-screen bg-bm-surface">
    <div class="max-w-6xl mx-auto px-8 py-10">
      <div class="bg-bm-white border border-bm-border rounded-bm-lg p-8 text-center">
        <h1 class="font-display text-3xl text-bm-text-hi">Redesign sandbox</h1>
        <p class="text-sm text-bm-text-low mt-2">
          This route is your tinker space. The live dashboard is untouched at
          <a :href="withBase('/')" class="text-bm-green-700 hover:underline">/</a>.
        </p>
        <p class="text-xs text-bm-text-muted mt-4">{{ prototypes.length }} prototypes loaded from hubData</p>
      </div>
    </div>
  </div>
</template>
