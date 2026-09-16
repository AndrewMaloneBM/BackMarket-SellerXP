<script setup lang="ts">
import type { QueueItem } from '~/utils/mockHomeData'

/**
 * One exception in the queue. Every count carries a window, a rule and a verb.
 * "196 orders" is a fact. "11 past ship-by" is a task.
 */
const props = withDefaults(defineProps<{
  item: QueueItem
  /** Show the scoping rule inline. Useful for critique, noisy in production. */
  showRule?: boolean
}>(), {
  showRule: true,
})

const toneClasses = computed(() => {
  switch (props.item.tone) {
    case 'critical': return { count: 'text-bm-danger', dot: 'bg-bm-danger' }
    case 'warning':  return { count: 'text-bm-warning', dot: 'bg-bm-warning' }
    case 'success':  return { count: 'text-bm-success', dot: 'bg-bm-success' }
    default:         return { count: 'text-bm-text-hi', dot: 'bg-bm-gray-400' }
  }
})
</script>

<template>
  <button
    class="w-full flex items-center gap-4 px-5 py-3.5 text-left border-b border-bm-border last:border-b-0 hover:bg-bm-gray-50 transition-colors group"
  >
    <!-- Tone carried by icon shape as well as colour, never colour alone -->
    <span class="flex-shrink-0 w-1.5 h-1.5 rounded-full" :class="toneClasses.dot" />

    <span class="flex-shrink-0 text-xl font-semibold tabular-nums w-12" :class="toneClasses.count">
      {{ item.count }}
    </span>

    <span class="flex-1 min-w-0">
      <span class="block text-sm text-bm-text-hi leading-snug">{{ item.label }}</span>
      <span v-if="showRule" class="block text-xs text-bm-text-muted mt-0.5 leading-snug">
        {{ item.rule }}<template v-if="item.consequence"> · {{ item.consequence }}</template>
      </span>
    </span>

    <span
      v-if="item.status === 'partial'"
      class="flex-shrink-0 text-[10px] uppercase tracking-wider text-bm-warning border border-bm-warning/40 rounded-bm-xs px-1.5 py-0.5"
      title="Metric exists but is not confirmed as a seller-facing count"
    >Data unconfirmed</span>

    <span class="flex-shrink-0 inline-flex items-center gap-1 text-sm font-medium text-bm-text-hi">
      {{ item.cta }}
      <svg class="w-3.5 h-3.5 text-bm-text-muted transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </span>
  </button>
</template>
