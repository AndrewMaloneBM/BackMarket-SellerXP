<script setup lang="ts">
/**
 * RevSpinner - Revolve loading spinner. Takes the current text colour.
 * Copied from @backmarket/design-system 129.13.0 (Spinner.vue).
 * Docs: design-system/components/feedback/RevSpinner.md
 */
const props = withDefaults(defineProps<{
  size?: 'small' | 'medium' | 'large'
  alternativeText?: string
}>(), {
  size: 'medium',
  alternativeText: 'Loading',
})

const px = computed(() => ({ small: 16, medium: 24, large: 48 })[props.size])
</script>

<template>
  <span class="rev-spinner" role="img" :aria-label="alternativeText">
    <RevIcon name="IconSpinner" :size="px" class="rev-spinner__icon" />
  </span>
</template>

<style scoped>
.rev-spinner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}
.rev-spinner__icon {
  animation: rev-spin 1s linear infinite;
}
@keyframes rev-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
