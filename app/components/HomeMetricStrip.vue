<script setup lang="ts">
import type { Metric } from '~/utils/mockHomeData'

/**
 * Metrics as a divided row, not a grid of cards.
 * Shopify's geometry: heading, value, delta badge, separated by vertical
 * dividers rather than card borders. Removes a lot of visual weight.
 */
withDefaults(defineProps<{
  metrics: Metric[]
  /** Show the pencil affordance for swapping a slot. */
  editable?: boolean
}>(), {
  editable: false,
})

const emit = defineEmits<{ swap: [id: string] }>()

function deltaClasses(tone?: string) {
  switch (tone) {
    case 'critical': return 'text-bm-danger'
    case 'success':  return 'text-bm-success'
    case 'warning':  return 'text-bm-warning'
    default:         return 'text-bm-text-muted'
  }
}
</script>

<template>
  <div class="flex flex-wrap divide-x divide-bm-border">
    <div
      v-for="m in metrics"
      :key="m.id"
      class="flex-1 min-w-[160px] px-5 py-4"
    >
      <div class="flex items-center gap-1.5 mb-1.5">
        <span class="text-xs text-bm-text-low">{{ m.label }}</span>
        <button
          v-if="editable"
          class="text-bm-text-muted hover:text-bm-text-hi transition-colors"
          :aria-label="`Change ${m.label}`"
          @click="emit('swap', m.id)"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
          </svg>
        </button>
        <span
          v-if="m.status === 'partial'"
          class="text-[9px] uppercase tracking-wider text-bm-warning"
          title="Not confirmed as available seller-side"
        >?</span>
      </div>

      <div class="flex items-baseline gap-2">
        <span class="text-2xl font-semibold text-bm-text-hi tabular-nums">{{ m.value }}</span>
        <span v-if="m.delta" class="text-xs font-medium inline-flex items-center gap-0.5" :class="deltaClasses(m.deltaTone)">
          <!-- Icon pairs with colour so tone never relies on hue alone -->
          <svg v-if="m.deltaTone === 'success'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 4l6 8H4l6-8z" /></svg>
          <svg v-else-if="m.deltaTone === 'critical'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 16L4 8h12l-6 8z" /></svg>
          {{ m.delta }}
        </span>
      </div>
    </div>
  </div>
</template>
