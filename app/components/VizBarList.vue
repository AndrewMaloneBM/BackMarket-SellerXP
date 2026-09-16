<script setup lang="ts">
/**
 * Horizontal bar list. Length from a common zero, the highest-accuracy
 * magnitude channel available after position.
 *
 * Does triple duty on purpose: comparing queue sizes, showing an ageing
 * distribution, and category breakdowns are all "length on a common
 * baseline, sorted". One primitive, three jobs, one perceptual strategy
 * (Few's pitfall #6: consistency beats variety).
 *
 * Single hue for all bars. Direct-labelled, so no legend is needed.
 */
export interface BarDatum {
  id: string
  label: string
  value: number
  /** Secondary fact shown right of the value, e.g. "oldest 6 days". */
  note?: string
  /** Marks this row as past a threshold. Used sparingly. */
  breach?: boolean
  cta?: string
}

const props = withDefaults(defineProps<{
  data: BarDatum[]
  /** Shared scale across all rows. Defaults to the largest value. */
  scaleMax?: number
  /** Sort worst-first. Length comparisons are easier when ordered. */
  sorted?: boolean
  labelWidth?: string
  unit?: string
  compact?: boolean
}>(), {
  scaleMax: undefined,
  sorted: true,
  labelWidth: 'w-40',
  unit: '',
  compact: false,
})

const rows = computed(() =>
  props.sorted ? [...props.data].sort((a, b) => b.value - a.value) : props.data,
)

const max = computed(() => props.scaleMax ?? Math.max(...props.data.map(d => d.value), 1))

const pct = (n: number) => `${max.value ? (n / max.value) * 100 : 0}%`
</script>

<template>
  <ul class="divide-y divide-bm-border">
    <li
      v-for="row in rows"
      :key="row.id"
      class="flex items-center gap-3 px-5"
      :class="compact ? 'py-2' : 'py-2.5'"
    >
      <span class="flex-shrink-0 text-sm text-bm-text-hi truncate" :class="labelWidth">{{ row.label }}</span>

      <!-- Bars share one scale, so "which is biggest" is a pop-out judgement -->
      <span class="flex-1 min-w-[80px] h-4 flex items-center" role="img" :aria-label="`${row.label}: ${row.value}${unit}`">
        <span
          class="h-2.5 rounded-r-[1px] min-w-[2px]"
          :class="row.breach ? 'bg-bm-danger' : 'bg-bm-gray-500'"
          :style="{ width: pct(row.value) }"
          aria-hidden="true"
        />
      </span>

      <span
        class="flex-shrink-0 w-12 text-right text-sm font-semibold tabular-nums"
        :class="row.breach ? 'text-bm-danger' : 'text-bm-text-hi'"
      >{{ row.value }}{{ unit }}</span>

      <span v-if="row.note" class="flex-shrink-0 w-28 text-right text-[11px] text-bm-text-muted">{{ row.note }}</span>

      <span v-if="row.cta" class="flex-shrink-0 text-xs font-medium text-bm-text-hi">{{ row.cta }} ›</span>
    </li>
  </ul>
</template>
