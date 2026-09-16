<script setup lang="ts">
/**
 * KPI tile: one number, one delta badge, one sparkline. Never two charts.
 *
 * Few's pitfall #2 is the whole reason this component exists: "To state that
 * quarter-to-date sales total $736,502 without any context means little.
 * Compared to what?" So the tile always carries a comparison and a trend.
 *
 * Separated by dividers rather than card borders, which strips a lot of
 * non-data ink out of the page.
 */
import type { Metric } from '~/utils/mockHomeData'

withDefaults(defineProps<{
  metric: Metric
  editable?: boolean
}>(), {
  editable: false,
})

const emit = defineEmits<{ swap: [id: string] }>()
</script>

<template>
  <div class="px-5 py-4">
    <div class="flex items-center gap-1.5 mb-1.5">
      <span class="text-xs text-bm-text-low">{{ metric.label }}</span>
      <button
        v-if="editable"
        class="text-bm-text-muted hover:text-bm-text-hi transition-colors"
        :aria-label="`Change ${metric.label}`"
        @click="emit('swap', metric.id)"
      >
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z" />
        </svg>
      </button>
      <span
        v-if="metric.status === 'partial'"
        class="text-[9px] uppercase tracking-wider text-bm-warning"
        title="Not confirmed as available seller-side"
      >?</span>
    </div>

    <div class="flex items-end justify-between gap-3">
      <div class="min-w-0">
        <p class="text-2xl font-semibold text-bm-text-hi tabular-nums leading-none mb-1.5">{{ metric.value }}</p>
        <VizDelta
          :value="metric.deltaValue ?? null"
          :unit="metric.deltaUnit ?? 'pct'"
          :increase-is-good="metric.increaseIsGood ?? true"
          :vs="metric.comparison"
        />
      </div>

      <!-- Trend sits beside the number, never instead of it -->
      <VizSparkline
        v-if="metric.series?.length"
        :points="metric.series"
        :area="metric.sparkArea"
        :min="metric.sparkMin"
        :max="metric.sparkMax"
        :tone="metric.sparkTone ?? 'neutral'"
      />
    </div>

    <!-- Scope stated in the label, not in a paragraph -->
    <p class="text-[11px] text-bm-text-muted mt-2">{{ metric.comparison ? `vs ${metric.comparison}` : metric.window }}</p>
  </div>
</template>
