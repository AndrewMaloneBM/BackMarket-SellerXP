<script setup lang="ts">
/**
 * Full-width Home section. Single-column stack of these replaces the masonry grid.
 * Follows Shopify's admin homepage pattern and Datadog's grouping guidance:
 * most important group at the top, collapsible for anything editorial.
 */
withDefaults(defineProps<{
  title: string
  /** Scope stated in the label, not in a paragraph. e.g. "Last 30 days" */
  meta?: string
  actionLabel?: string
  collapsible?: boolean
  dismissible?: boolean
  /** Work cannot be dismissed. Marketing can. */
  locked?: boolean
  tone?: 'default' | 'critical'
}>(), {
  meta: undefined,
  actionLabel: undefined,
  collapsible: false,
  dismissible: false,
  locked: false,
  tone: 'default',
})

const collapsed = ref(false)
const dismissed = ref(false)
</script>

<template>
  <section v-if="!dismissed" class="bg-white rounded-bm-lg border border-bm-border">
    <header
      class="flex items-center gap-3 px-5 h-12 border-b border-bm-border"
      :class="collapsed ? 'border-b-0' : ''"
    >
      <button
        v-if="collapsible"
        class="text-bm-text-muted hover:text-bm-text-hi transition-colors -ml-1"
        :aria-expanded="!collapsed"
        @click="collapsed = !collapsed"
      >
        <svg class="w-4 h-4 transition-transform duration-150" :class="collapsed ? '' : 'rotate-90'" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <h2 class="text-sm font-semibold" :class="tone === 'critical' ? 'text-bm-danger' : 'text-bm-text-hi'">
        {{ title }}
      </h2>

      <span v-if="meta" class="text-xs text-bm-text-muted">{{ meta }}</span>

      <div class="ml-auto flex items-center gap-2">
        <slot name="header-actions" />
        <button
          v-if="actionLabel"
          class="text-xs text-bm-text-hi border border-bm-border rounded-bm-sm px-2.5 py-1 hover:bg-bm-gray-50 transition-colors"
        >
          {{ actionLabel }}
        </button>
        <button
          v-if="dismissible && !locked"
          class="text-bm-text-muted hover:text-bm-text-hi transition-colors p-0.5"
          aria-label="Dismiss"
          @click="dismissed = true"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <span
          v-if="locked"
          class="text-[10px] uppercase tracking-wider text-bm-text-muted"
          title="Work cannot be dismissed"
        >Always shown</span>
      </div>
    </header>

    <div v-show="!collapsed">
      <slot />
    </div>
  </section>
</template>
