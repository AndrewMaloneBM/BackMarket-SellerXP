<script setup lang="ts">
/**
 * RevTabItem - one tab inside RevTabs.
 * Styles copied from @backmarket/design-system 129.13.0 (TabItem.vue).
 * The default slot goes after the label (e.g. a RevTag or a badge).
 */
import '~/assets/css/revolve.css'

const props = withDefaults(defineProps<{
  label: string
  active?: boolean
  disabled?: boolean
}>(), {
  active: false,
  disabled: false,
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

function onClick(event: MouseEvent) {
  if (!props.disabled) emit('click', event)
}
</script>

<template>
  <button
    type="button"
    role="tab"
    :aria-selected="active"
    :aria-disabled="disabled ? 'true' : undefined"
    :tabindex="disabled ? -1 : undefined"
    :class="['rev-tab-item rev-focus-inset', active && 'rev-tab-item--active', disabled && 'rev-tab-item--disabled']"
    @click="onClick"
  >
    <span class="rev-tab-item__label">
      <span>{{ label }}</span>
      <span v-if="$slots.default" class="rev-tab-item__suffix"><slot /></span>
    </span>
  </button>
</template>

<style scoped>
.rev-tab-item {
  position: relative;
  display: flex;
  align-items: center;
  white-space: nowrap;
  border: 0;
  background: transparent;
  padding: 0;
}
.rev-tab-item__label {
  display: flex;
  align-items: center;
  height: 3.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: BMDupletTXT, HelveticaTXT, sans-serif;
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 400;
  color: var(--rev-text-action-default-low);
  cursor: pointer;
  transition: all 0.2s;
}
.rev-tab-item:hover .rev-tab-item__label {
  background-color: var(--rev-bg-static-default-min-hover);
  color: var(--rev-text-action-default-low-hover);
}
.rev-tab-item__suffix {
  margin-left: 0.5rem;
  vertical-align: middle;
}

.rev-tab-item--active {
  pointer-events: none;
}
.rev-tab-item--active .rev-tab-item__label {
  font-weight: 600;
  color: var(--rev-text-action-default-low-pressed);
  cursor: default;
}
/* Black line under the active tab, sitting on the grey line of RevTabs */
.rev-tab-item--active::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.125rem;
  z-index: 10;
  border-top: 2px solid var(--rev-border-action-default-low-pressed);
}

.rev-tab-item--disabled .rev-tab-item__label,
.rev-tab-item--disabled:hover .rev-tab-item__label {
  background-color: transparent;
  color: var(--rev-text-action-default-low-disabled);
  cursor: not-allowed;
}
</style>
