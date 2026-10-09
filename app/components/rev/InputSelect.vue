<script setup lang="ts">
/**
 * RevInputSelect - Revolve dropdown.
 * Styles copied from @backmarket/design-system 129.13.0 (InputSelect.vue).
 * Docs: design-system/components/forms/RevInputSelect.md
 *
 * medium (default): 48px field with a floating label.
 * small: 32px field, bold value, the label is only read by screen readers.
 * Uses the browser's own option list (the real one draws a custom list).
 *
 *   <RevInputSelect id="sort" v-model="sortBy" label="Sort by" :options="['Newest', 'Oldest']" />
 */
import '~/assets/css/revolve.css'

type Option = string | { label: string; value: string }

const props = withDefaults(defineProps<{
  id: string
  label: string
  options: readonly Option[]
  size?: 'medium' | 'small'
  disabled?: boolean
}>(), {
  size: 'medium',
  disabled: false,
})

const model = defineModel<string>({ default: '' })

const normalised = computed(() =>
  props.options.map((option) => (typeof option === 'string' ? { label: option, value: option } : option)),
)
const hasSelectedOption = computed(() => model.value !== '' && model.value !== undefined && model.value !== null)
</script>

<template>
  <div :class="['rev-input-select', `rev-input-select--${size}`, hasSelectedOption && 'rev-input-select--selected']">
    <label
      :for="id"
      :class="size === 'small' ? 'sr-only' : 'rev-input-select__label'"
    ><span class="rev-input-select__label-text">{{ label }}</span></label>
    <select :id="id" v-model="model" class="rev-input-select__select" :disabled="disabled">
      <option v-if="!hasSelectedOption" value="" disabled hidden>{{ size === 'small' ? label : '' }}</option>
      <option v-for="option in normalised" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <RevIcon name="IconChevronDown" size="20" class="rev-input-select__chevron" />
    <div class="rev-input-select__border" />
  </div>
</template>

<style scoped>
.rev-input-select {
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  border-radius: 0.375rem;
  background-color: var(--rev-bg-static-default-low);
  color: var(--rev-text-action-default-hi);
  font-family: BMDupletTXT, HelveticaTXT, sans-serif;
  transition: background-color 0.2s ease-in-out;
}
.rev-input-select:hover {
  background-color: var(--rev-bg-static-default-low-hover);
}
.rev-input-select--medium { height: 3rem; }
.rev-input-select--small { height: 2rem; }

.rev-input-select__select {
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 0.375rem;
  background: transparent;
  color: inherit;
  outline: none;
  cursor: pointer;
  appearance: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rev-input-select__select:disabled {
  color: var(--rev-text-action-default-hi-disabled);
  cursor: not-allowed;
}
.rev-input-select--medium .rev-input-select__select {
  padding: 1.25rem 2rem 0 0.75rem;
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 400;
}
.rev-input-select--small .rev-input-select__select {
  padding: 0 2.5rem 0 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 600;
}

.rev-input-select__label {
  pointer-events: none;
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  top: 0;
  display: flex;
  height: 100%;
  align-items: center;
  padding-right: 1rem;
  font-size: 1rem;
  line-height: 1.5rem;
  color: var(--rev-text-action-default-hi);
}
/* The label always stays on one line; it is cut with "…" if the field is too narrow */
.rev-input-select__label-text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rev-input-select--selected .rev-input-select__label {
  top: 0.25rem;
  height: auto;
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--rev-text-static-default-low);
}

.rev-input-select__chevron {
  pointer-events: none;
  position: absolute;
  color: var(--rev-text-action-default-hi);
}
.rev-input-select--medium .rev-input-select__chevron { right: 0.75rem; }
.rev-input-select--small .rev-input-select__chevron { right: 0.5rem; }
.rev-input-select--medium.rev-input-select--selected .rev-input-select__chevron {
  color: var(--rev-text-static-default-low);
}

.rev-input-select__border {
  pointer-events: none;
  position: absolute;
  inset: 0;
  border: 1px solid var(--rev-border-action-default-low);
  border-radius: 0.375rem;
  transition: border-color 0.2s ease-in-out;
}
.rev-input-select:focus-within .rev-input-select__border {
  border-width: 2px;
  border-color: var(--rev-border-action-default-low-pressed);
}
@media (min-resolution: 2x) {
  .rev-input-select:focus-within .rev-input-select__border {
    border-width: 1.5px;
  }
}
</style>
