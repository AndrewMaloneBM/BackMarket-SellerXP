<script setup lang="ts">
/**
 * Delta badge. Three parts: arrow glyph, signed value, semantic colour.
 *
 * The critical detail, implemented the same way by Polaris Viz
 * (TrendIndicator takes `direction` AND `trend` independently), Datadog
 * ("Increases as better" / "Decreases as better") and Grafana ("Standard" /
 * "Inverted"): DIRECTION AND SENTIMENT ARE SEPARATE INPUTS.
 *
 * Orders up is good. Defective rate up is bad. Never derive sentiment from
 * the arithmetic sign.
 *
 * Colour never carries the meaning alone: the arrow shape and the sign do
 * that, and colour reinforces (WCAG 1.4.1).
 */
const props = withDefaults(defineProps<{
  /** Signed change. Null renders the neutral state. */
  value: number | null
  /** 'pct' for volumes, 'pts' for rates. A rate change in % is ambiguous. */
  unit?: 'pct' | 'pts' | 'abs'
  /** Is an increase good or bad for THIS metric? */
  increaseIsGood?: boolean
  /** Comparison window, stated in words. */
  vs?: string
  /** Below this magnitude, render neutral rather than a misleading signal. */
  materiality?: number
  /** Too few observations to compare. Overrides everything. */
  insufficient?: boolean
}>(), {
  unit: 'pct',
  increaseIsGood: true,
  vs: undefined,
  materiality: 0,
  insufficient: false,
})

const direction = computed<'up' | 'down' | 'flat'>(() => {
  if (props.value === null || props.insufficient) return 'flat'
  if (Math.abs(props.value) <= props.materiality) return 'flat'
  return props.value > 0 ? 'up' : 'down'
})

const sentiment = computed<'positive' | 'negative' | 'neutral'>(() => {
  if (direction.value === 'flat') return 'neutral'
  const isUp = direction.value === 'up'
  return isUp === props.increaseIsGood ? 'positive' : 'negative'
})

const toneClass = computed(() => {
  switch (sentiment.value) {
    case 'positive': return 'text-bm-success'
    case 'negative': return 'text-bm-danger'
    default:         return 'text-bm-text-muted'
  }
})

const suffix = computed(() => (props.unit === 'pct' ? '%' : props.unit === 'pts' ? ' pts' : ''))

const display = computed(() => {
  if (props.insufficient) return 'Too few to compare'
  if (props.value === null || direction.value === 'flat') return 'No change'
  const sign = props.value > 0 ? '+' : '−'
  return `${sign}${Math.abs(props.value)}${suffix.value}`
})

const ariaLabel = computed(() => {
  if (props.insufficient) return 'Too few observations to compare'
  if (direction.value === 'flat') return `No material change${props.vs ? ` versus ${props.vs}` : ''}`
  const dir = direction.value === 'up' ? 'up' : 'down'
  return `${dir} ${Math.abs(props.value!)}${suffix.value}${props.vs ? ` versus ${props.vs}` : ''}, ${sentiment.value}`
})
</script>

<template>
  <span class="inline-flex items-center gap-1 text-xs font-medium" :class="toneClass" :aria-label="ariaLabel">
    <!-- Shape carries direction so colour is never the only cue -->
    <svg v-if="direction === 'up'" class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 4l6 8H4l6-8z" />
    </svg>
    <svg v-else-if="direction === 'down'" class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <path d="M10 16L4 8h12l-6 8z" />
    </svg>
    <!-- Neutral is a real state, not a fake green uptick -->
    <svg v-else class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
      <rect x="4" y="9" width="12" height="2" rx="1" />
    </svg>
    <span class="tabular-nums whitespace-nowrap">{{ display }}</span>
  </span>
</template>
