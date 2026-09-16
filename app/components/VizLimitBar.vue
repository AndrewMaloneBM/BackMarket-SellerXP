<script setup lang="ts">
/**
 * Limit bar. Stephen Few's bullet graph, reversed-polarity variant.
 *
 * Few names this exact case: "the display of defects in a manufacturing
 * process, which we want to remain below some defined threshold". Built to
 * his published Bullet Graph Design Specification:
 *
 *  - value encoded as a bar, thickness roughly 1/3 the band container
 *  - limit encoded as a short perpendicular line, less dominant but easy to see
 *  - qualitative ranges as intensity steps of a SINGLE hue, never distinct
 *    hues, because those "might not be distinguishable by those who are
 *    colorblind". Three bands, which Few calls the ideal number
 *  - scale extends past the limit so a breach has somewhere to be drawn,
 *    and the scale endpoints are labelled (fixes NN/g's complaint that
 *    gauge-like charts hide the range)
 *  - optional projection, split bar, answering "am I on track to breach?"
 *
 * Colour discipline: bands are grey. Saturated colour appears only when
 * breached or projected to breach, so healthy rows stay quiet and the one
 * row that needs action pops out.
 */
const props = withDefaults(defineProps<{
  label: string
  value: number
  limit: number
  /** Scale end. Defaults to ~20% past the limit so a breach is drawable. */
  scaleMax?: number
  unit?: string
  /** Lower is better (defect rates). False for targets you want to exceed. */
  lowerIsBetter?: boolean
  /** Projected end-of-period value at the current rate. */
  projected?: number
  /** Headroom expressed in the seller's unit of action, e.g. "12 more defects allowed". */
  headroom?: string
  window?: string
  consequence?: string
}>(), {
  scaleMax: undefined,
  unit: '%',
  lowerIsBetter: true,
  projected: undefined,
  headroom: undefined,
  window: undefined,
  consequence: undefined,
})

const max = computed(() => props.scaleMax ?? props.limit * 1.2)
const pct = (n: number) => `${Math.min(100, Math.max(0, (n / max.value) * 100))}%`

const breached = computed(() =>
  props.lowerIsBetter ? props.value > props.limit : props.value < props.limit,
)

const projectedBreach = computed(() => {
  if (props.projected === undefined || breached.value) return false
  return props.lowerIsBetter ? props.projected > props.limit : props.projected < props.limit
})

const state = computed<'breached' | 'at-risk' | 'safe'>(() => {
  if (breached.value) return 'breached'
  if (projectedBreach.value) return 'at-risk'
  // In the darkest band, i.e. within 10% of the limit
  const nearness = props.lowerIsBetter ? props.value / props.limit : props.limit / props.value
  return nearness >= 0.9 ? 'at-risk' : 'safe'
})

/** Three bands as grey intensity steps. Darkest sits where the risk is. */
const bands = computed(() => {
  const b1 = props.limit * 0.7
  const b2 = props.limit * 0.9
  return props.lowerIsBetter
    ? [
        { width: pct(b1), cls: 'bg-bm-gray-100' },
        { width: `calc(${pct(b2)} - ${pct(b1)})`, cls: 'bg-bm-gray-200' },
        { width: `calc(100% - ${pct(b2)})`, cls: 'bg-bm-gray-300' },
      ]
    : [
        { width: pct(b1), cls: 'bg-bm-gray-300' },
        { width: `calc(${pct(b2)} - ${pct(b1)})`, cls: 'bg-bm-gray-200' },
        { width: `calc(100% - ${pct(b2)})`, cls: 'bg-bm-gray-100' },
      ]
})

const barClass = computed(() => {
  switch (state.value) {
    case 'breached': return 'bg-bm-danger'
    case 'at-risk':  return 'bg-bm-text-hi'
    default:         return 'bg-bm-text-hi'
  }
})

const gap = computed(() => {
  const diff = Math.abs(props.limit - props.value)
  const rounded = Math.round(diff * 10) / 10
  const side = breached.value ? 'above' : 'below'
  return `${rounded}${props.unit} ${side} limit`
})

const ariaLabel = computed(() =>
  `${props.label} ${props.value}${props.unit}, limit ${props.limit}${props.unit}, ${gap.value}, status ${state.value}`,
)
</script>

<template>
  <div
    class="flex items-center gap-4 px-5 py-3 border-l-2"
    :class="{
      'border-bm-danger bg-bm-danger/5': state === 'breached',
      'border-bm-warning bg-bm-warning/5': state === 'at-risk',
      'border-transparent': state === 'safe',
    }"
  >
    <!-- Label, left, plain dark text -->
    <div class="w-40 flex-shrink-0">
      <p class="text-sm text-bm-text-hi leading-tight">{{ label }}</p>
      <p v-if="window" class="text-[11px] text-bm-text-muted mt-0.5">{{ window }}</p>
    </div>

    <!-- The graph -->
    <div class="flex-1 min-w-[140px]" role="img" :aria-label="ariaLabel">
      <div class="relative h-5" aria-hidden="true">
        <!-- Qualitative bands: single hue, intensity steps -->
        <div class="absolute inset-0 flex rounded-bm-xs overflow-hidden">
          <span v-for="(b, i) in bands" :key="i" :class="b.cls" :style="{ width: b.width }" />
        </div>

        <!-- Projection segment, hatched, drawn behind the actual bar -->
        <div
          v-if="projected !== undefined && projected > value"
          class="absolute top-1/2 -translate-y-1/2 h-[7px] opacity-40"
          :class="projectedBreach ? 'bg-bm-warning' : 'bg-bm-gray-500'"
          :style="{ left: pct(value), width: `calc(${pct(projected)} - ${pct(value)})` }"
        />

        <!-- Featured measure: bar at ~1/3 the container height, most prominent -->
        <div
          class="absolute top-1/2 -translate-y-1/2 h-[7px] rounded-r-[1px]"
          :class="barClass"
          :style="{ left: 0, width: pct(value) }"
        />

        <!-- Limit: short perpendicular line, identifiable without colour -->
        <div
          class="absolute top-0 bottom-0 w-[2px] bg-bm-text-hi"
          :style="{ left: pct(limit) }"
        />
      </div>

      <!-- Scale endpoints and the limit, labelled -->
      <div class="relative h-3.5 mt-0.5" aria-hidden="true">
        <span class="absolute left-0 text-[10px] text-bm-text-muted tabular-nums">0</span>
        <span
          class="absolute text-[10px] text-bm-text-hi font-medium tabular-nums -translate-x-1/2 whitespace-nowrap"
          :style="{ left: pct(limit) }"
        >{{ limit }}{{ unit }} limit</span>
        <span class="absolute right-0 text-[10px] text-bm-text-muted tabular-nums">{{ Math.round(max * 10) / 10 }}{{ unit }}</span>
      </div>
    </div>

    <!-- Value and the gap expressed directly, so nobody has to subtract -->
    <div class="w-44 flex-shrink-0 text-right">
      <p
        class="text-lg font-semibold tabular-nums leading-tight"
        :class="state === 'breached' ? 'text-bm-danger' : 'text-bm-text-hi'"
      >{{ value }}{{ unit }}</p>
      <p
        class="text-[11px] mt-0.5 leading-snug"
        :class="state === 'breached' ? 'text-bm-danger' : state === 'at-risk' ? 'text-bm-warning' : 'text-bm-text-muted'"
      >
        <template v-if="state === 'breached'">Above limit. Action required.</template>
        <template v-else-if="state === 'at-risk' && projectedBreach">On track to breach</template>
        <template v-else>{{ gap }}</template>
      </p>
      <!-- Headroom in the seller's unit of action is worth more than the chart -->
      <p v-if="headroom && state !== 'breached'" class="text-[11px] text-bm-text-muted mt-0.5 leading-snug">
        {{ headroom }}
      </p>
    </div>
  </div>
</template>
