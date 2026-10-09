<script setup lang="ts">
/**
 * RevRating - Revolve star score (read-only).
 * Styles copied from @backmarket/design-system 129.13.0 (Rating.vue).
 * Docs: design-system/components/selection/RevRating.md
 *
 *   <RevRating :score="4.8" />
 */
import '~/assets/css/revolve.css'

const props = withDefaults(defineProps<{
  score: number
  size?: 'extra-small' | 'small' | 'medium'
  showScoreLabel?: boolean
}>(), {
  size: 'medium',
  showScoreLabel: true,
})

const MAX = 5
const iconSize = computed(() => ({ 'extra-small': 12, small: 16, medium: 24 })[props.size])
// Same rule as the real component: a decimal part below .3 shows no extra
// star, below .8 shows a half star, .8 and above shows a full star.
const stars = computed(() => {
  if (props.score < 0 || props.score > MAX) return []
  const whole = Math.floor(props.score)
  const decimal = Number.parseFloat(props.score.toFixed(1)) - whole
  let filled = whole
  let lastIsHalf = false
  if (decimal >= 0.8 - Number.EPSILON) filled = whole + 1
  else if (decimal >= 0.3 - Number.EPSILON) { filled = whole + 1; lastIsHalf = true }
  return Array.from({ length: MAX }, (_, index) => {
    if (index + 1 === filled && lastIsHalf) return 'IconStarHalf'
    return index < filled ? 'IconStarFilled' : 'IconStarOutlined'
  })
})
const scoreLabel = computed(() => `${Math.round(props.score * 10) / 10}/${MAX}`)
</script>

<template>
  <div class="rev-rating" role="img" :aria-label="`Rating: ${scoreLabel}`">
    <div class="rev-rating__stars">
      <RevIcon v-for="(star, index) in stars" :key="index" :name="star" :size="iconSize" />
    </div>
    <span v-if="showScoreLabel" :class="['rev-rating__score', `rev-rating__score--${size}`]">{{ scoreLabel }}</span>
  </div>
</template>

<style scoped>
.rev-rating {
  display: flex;
  align-items: center;
  color: var(--rev-text-action-default-hi);
}
.rev-rating__stars {
  display: flex;
}
.rev-rating__score {
  margin-left: 0.25rem;
  margin-top: 0.0625rem;
  font-weight: 600;
}
.rev-rating__score--extra-small {
  font-family: BMDupletTXT, HelveticaTXT, sans-serif;
  font-size: 0.75rem;
  line-height: 1rem;
}
.rev-rating__score--small {
  font-family: BMDupletTXT, HelveticaTXT, sans-serif;
  font-size: 0.875rem;
  line-height: 1.25rem;
}
.rev-rating__score--medium {
  font-family: BMDupletDSP, HelveticaDSP, sans-serif;
  font-size: 1.125rem;
  line-height: 1.5rem;
}
@media (min-width: 768px) {
  .rev-rating__score {
    margin-top: 0.125rem;
  }
  .rev-rating__score--medium {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
}
</style>
