<script setup lang="ts">
/**
 * RevButtonCard - a card where the whole surface is the button.
 * Styles copied from @backmarket/design-system 129.13.0 (ButtonCard.vue).
 * Docs: design-system/components/actions/RevButtonCard.md
 * Do not put buttons or links inside it.
 */
import '~/assets/css/revolve.css'

defineProps<{ disabled?: boolean }>()
defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button type="button" class="rev-button-card rev-focus" :disabled="disabled" @click="$emit('click', $event)">
    <slot />
  </button>
</template>

<style scoped>
.rev-button-card {
  position: relative;
  display: block;
  border-radius: 0.75rem;
  background-color: var(--rev-bg-float-default-low);
  box-shadow: var(--rev-shadow-short);
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease-in;
}
.rev-button-card:hover {
  background-color: var(--rev-bg-float-default-low-hover);
  box-shadow: var(--rev-shadow-long);
}
.rev-button-card:disabled {
  cursor: not-allowed;
  filter: saturate(0);
}
@media (prefers-reduced-motion: reduce) {
  .rev-button-card {
    transition: none;
  }
}
</style>
