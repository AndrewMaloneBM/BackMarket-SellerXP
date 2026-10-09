<script setup lang="ts">
/**
 * RevToggle - Revolve on/off switch.
 * Styles copied from @backmarket/design-system 129.13.0 (Toggle.vue).
 * Docs: design-system/components/selection/RevToggle.md
 *
 *   <RevToggle id="expand-all" v-model="expandAll" label="Expand all" />
 */
import '~/assets/css/revolve.css'

withDefaults(defineProps<{
  id: string
  label?: string
  disabled?: boolean
}>(), {
  label: '',
  disabled: false,
})

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <label :for="id" :class="['rev-toggle', disabled && 'rev-toggle--disabled']">
    <input :id="id" v-model="model" type="checkbox" class="rev-toggle__input sr-only" :disabled="disabled" />
    <span class="rev-toggle__track" />
    <span v-if="label" class="rev-toggle__label">{{ label }}</span>
  </label>
</template>

<style scoped>
.rev-toggle {
  isolation: isolate;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}
.rev-toggle--disabled {
  cursor: not-allowed;
}
.rev-toggle__track {
  position: relative;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  width: 46px;
  height: 1.5rem;
  border: 1px solid var(--rev-border-action-default-mid);
  border-radius: 0.75rem;
  background-color: var(--rev-bg-action-success-low);
  color: var(--rev-text-onaction-success-low);
  transition: all 0.4s ease-in-out;
}
/* Knob */
.rev-toggle__track::before {
  content: '';
  position: absolute;
  left: 0.1875rem;
  width: 1rem;
  height: 1rem;
  border-radius: 624.938rem;
  background-color: currentColor;
  box-shadow: var(--rev-shadow-long);
  transition: all 0.4s ease-in-out;
}
/* Hover halo */
.rev-toggle__track::after {
  content: '';
  pointer-events: none;
  position: absolute;
  right: 0.5625rem;
  z-index: -1;
  width: 3rem;
  height: 3rem;
  border-radius: 624.938rem;
  background-color: var(--rev-bg-action-default-min-hover);
  opacity: 0;
  transition: all 0.4s ease-in-out;
}
.rev-toggle__input:hover + .rev-toggle__track::after {
  opacity: 1;
}
.rev-toggle__input:focus-visible + .rev-toggle__track {
  outline: 0.125rem solid var(--rev-outline-default-hi);
  outline-offset: 0.125rem;
}
.rev-toggle__input:checked + .rev-toggle__track {
  border: none;
  background-color: var(--rev-bg-action-success-low-pressed);
  color: var(--rev-text-onaction-success-low-pressed);
}
.rev-toggle__input:checked + .rev-toggle__track::before {
  width: 1.25rem;
  height: 1.25rem;
  transform: translateX(21px);
}
.rev-toggle__input:checked + .rev-toggle__track::after {
  transform: translateX(21px);
}
.rev-toggle__input:disabled + .rev-toggle__track::after {
  display: none;
}
.rev-toggle__label {
  font-family: BMDupletTXT, HelveticaTXT, sans-serif;
  font-size: 1rem;
  line-height: 1.5rem;
  color: var(--rev-text-action-default-hi);
}
@media (prefers-reduced-motion: reduce) {
  .rev-toggle__track,
  .rev-toggle__track::before,
  .rev-toggle__track::after {
    transition: none;
  }
}
</style>
