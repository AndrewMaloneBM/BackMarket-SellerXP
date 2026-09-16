<script setup lang="ts">
/**
 * Sparkline. Trend for one KPI in a tile, encoded as 2D position
 * (Munzner rank 1, the most accurate magnitude channel).
 *
 * Spec follows Tufte ("word-sized graphic with typographic resolution",
 * "max[data], min[design]") and Few's scaling guidance: never per-tile
 * auto-fit for metrics sellers compare across tiles, because "the same
 * pattern seen in two sparklines may represent significantly different
 * values".
 *
 * No axes, no gridlines, no frame, no legend, no animation.
 */
const props = withDefaults(defineProps<{
  points: number[]
  /** Fixed scale. Use for rate/compliance metrics so today is comparable to yesterday. */
  min?: number
  max?: number
  /** Zero-baselined with area fill. Use for volume metrics (Few's method 4). */
  area?: boolean
  /** Normal range shown as a grey band, following Tufte's glucose example. */
  band?: { from: number, to: number }
  /** Comparison series, drawn dashed grey (Polaris Viz isComparison pattern). */
  comparison?: number[]
  width?: number
  height?: number
  tone?: 'neutral' | 'critical' | 'warning'
  ariaLabel?: string
}>(), {
  min: undefined,
  max: undefined,
  area: false,
  band: undefined,
  comparison: undefined,
  width: 96,
  height: 24,
  tone: 'neutral',
  ariaLabel: undefined,
})

/** Fewer than ~7 points is noise, not a trend. Render an explicit empty state. */
const enoughData = computed(() => props.points.length >= 7)

const PAD = 2

const scale = computed(() => {
  const all = [...props.points, ...(props.comparison ?? [])]
  const lo = props.min ?? (props.area ? 0 : Math.min(...all))
  const hi = props.max ?? Math.max(...all)
  // Guard against a flat series collapsing the range
  const span = hi - lo || 1
  return { lo, hi, span }
})

function toXY(vals: number[]) {
  const { lo, span } = scale.value
  const w = props.width - PAD * 2
  const h = props.height - PAD * 2
  const step = vals.length > 1 ? w / (vals.length - 1) : 0
  return vals.map((v, i) => {
    const x = PAD + i * step
    const y = PAD + h - ((v - lo) / span) * h
    return [x, y] as const
  })
}

const path = computed(() => toXY(props.points).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' '))

const comparisonPath = computed(() =>
  props.comparison
    ? toXY(props.comparison).map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
    : null,
)

/** Zero-baselined area fill: magnitude also carried by the filled region. */
const areaPath = computed(() => {
  const pts = toXY(props.points)
  if (!pts.length) return ''
  const last = pts[pts.length - 1]!
  const first = pts[0]!
  const baseY = props.height - PAD
  return `M${first[0]},${baseY} L${pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' L')} L${last[0]},${baseY} Z`
})

const endpoint = computed(() => {
  const pts = toXY(props.points)
  return pts.length ? pts[pts.length - 1]! : null
})

const bandRect = computed(() => {
  if (!props.band) return null
  const { lo, span } = scale.value
  const h = props.height - PAD * 2
  const yTop = PAD + h - ((props.band.to - lo) / span) * h
  const yBot = PAD + h - ((props.band.from - lo) / span) * h
  return { y: yTop, height: Math.max(1, yBot - yTop) }
})

const strokeClass = computed(() => {
  switch (props.tone) {
    case 'critical': return 'stroke-bm-danger'
    case 'warning':  return 'stroke-bm-warning'
    default:         return 'stroke-bm-gray-500'
  }
})
const fillClass = computed(() => {
  switch (props.tone) {
    case 'critical': return 'fill-bm-danger/10'
    case 'warning':  return 'fill-bm-warning/10'
    default:         return 'fill-bm-gray-300/30'
  }
})
</script>

<template>
  <!-- Not enough data is a real state, not a misleading 2-point line -->
  <span
    v-if="!enoughData"
    class="inline-flex items-center text-[10px] text-bm-text-muted"
    :style="{ width: `${width}px`, height: `${height}px` }"
  >Not enough data</span>

  <svg
    v-else
    :width="width"
    :height="height"
    :viewBox="`0 0 ${width} ${height}`"
    class="overflow-visible block"
    aria-hidden="true"
    focusable="false"
  >
    <!-- Normal-range band, per Tufte: deviations read against a grey band -->
    <rect
      v-if="bandRect"
      x="0"
      :y="bandRect.y"
      :width="width"
      :height="bandRect.height"
      class="fill-bm-gray-200/60"
    />

    <path v-if="area" :d="areaPath" :class="fillClass" stroke="none" />

    <!-- Comparison series: dashed, grey, never competing with the primary -->
    <polyline
      v-if="comparisonPath"
      :points="comparisonPath"
      fill="none"
      class="stroke-bm-gray-300"
      stroke-width="1.25"
      stroke-dasharray="2 2"
      stroke-linecap="round"
    />

    <!-- 1.5px minimum: anti-aliasing renders hairlines fainter than specified -->
    <polyline
      :points="path"
      fill="none"
      :class="strokeClass"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <!-- Endpoint dot: "the dot should refer to a specific number" -->
    <circle
      v-if="endpoint"
      :cx="endpoint[0]"
      :cy="endpoint[1]"
      r="2"
      :class="tone === 'critical' ? 'fill-bm-danger' : tone === 'warning' ? 'fill-bm-warning' : 'fill-bm-text-hi'"
    />
  </svg>
</template>
