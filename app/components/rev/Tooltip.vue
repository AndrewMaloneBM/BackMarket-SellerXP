<script setup lang="ts">
/**
 * RevTooltip - Revolve hover/focus tooltip (dark bubble with a caret).
 * Styles copied from @backmarket/design-system 129.13.0 (Tooltip.vue).
 * Docs: design-system/components/overlays/RevTooltip.md
 * Simplified: wrap the trigger in the default slot and pass the text as `content`.
 *
 *   <RevTooltip content="Grade"><BoPill>...</BoPill></RevTooltip>
 */
import '~/assets/css/revolve.css'

withDefaults(defineProps<{
  content: string
  position?: 'top' | 'bottom'
}>(), {
  position: 'top',
})
</script>

<template>
  <span class="rev-tooltip" tabindex="0">
    <slot />
    <span :class="['rev-tooltip__bubble rev-mood-inverse', `rev-tooltip__bubble--${position}`]" role="tooltip">{{ content }}</span>
  </span>
</template>

<style scoped>
.rev-tooltip {
  position: relative;
  display: inline-flex;
  outline: none;
}
.rev-tooltip__bubble {
  pointer-events: none;
  position: absolute;
  left: 50%;
  z-index: 30;
  width: max-content;
  max-width: 14rem;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  background-color: var(--rev-bg-overlap-default-low);
  color: var(--rev-text-static-default-mid);
  font-family: BMDupletTXT, HelveticaTXT, sans-serif;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 400;
  text-align: center;
  white-space: normal;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-50%);
  transition: opacity 0.15s;
}
.rev-tooltip__bubble--top { bottom: calc(100% + 0.5rem); }
.rev-tooltip__bubble--bottom { top: calc(100% + 0.5rem); }
/* Caret */
.rev-tooltip__bubble::after {
  content: '';
  position: absolute;
  left: calc(50% - 6px);
  border: 6px solid transparent;
}
.rev-tooltip__bubble--top::after {
  bottom: -12px;
  border-top-color: var(--rev-bg-overlap-default-low);
}
.rev-tooltip__bubble--bottom::after {
  top: -12px;
  border-bottom-color: var(--rev-bg-overlap-default-low);
}
.rev-tooltip:hover .rev-tooltip__bubble,
.rev-tooltip:focus-visible .rev-tooltip__bubble {
  opacity: 1;
  visibility: visible;
}
</style>
