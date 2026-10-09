<script setup lang="ts">
/**
 * RevInputText - Revolve text field with a floating label.
 * Styles copied from @backmarket/design-system 129.13.0 (InputTextFloatingLabel.vue).
 * Docs: design-system/components/forms/RevInputText.md
 *
 *   <RevInputText id="sku" v-model="sku" label="SKU" />
 */
import '~/assets/css/revolve.css'

const props = withDefaults(defineProps<{
  id: string
  label: string
  type?: string
  disabled?: boolean
  hasClearButton?: boolean
}>(), {
  type: 'text',
  disabled: false,
  hasClearButton: true,
})

const model = defineModel<string | number | null>({ default: '' })

const focused = ref(false)
const hasValue = computed(() => model.value !== '' && model.value !== null && model.value !== undefined)
const isFloating = computed(() => hasValue.value || focused.value)
const showClear = computed(() => props.hasClearButton && hasValue.value && !props.disabled)
</script>

<template>
  <div class="rev-input-text">
    <input
      :id="id"
      v-model="model"
      :type="type"
      :disabled="disabled"
      :class="['rev-input-text__input', isFloating && 'rev-input-text__input--floating', showClear && 'rev-input-text__input--clearable']"
      @focus="focused = true"
      @blur="focused = false"
    />
    <div class="rev-input-text__border" />
    <label :for="id" :class="['rev-input-text__label', isFloating && 'rev-input-text__label--floating']">{{ label }}</label>
    <div v-if="showClear" class="rev-input-text__clear">
      <RevButtonIcon icon="IconCrossInCircle" variant="ghost" aria-label="Clear" @click="model = ''" />
    </div>
  </div>
</template>

<style scoped>
.rev-input-text {
  position: relative;
  font-family: BMDupletTXT, HelveticaTXT, sans-serif;
  font-size: 1rem;
  line-height: 1.5rem;
}
.rev-input-text__input {
  position: relative;
  width: 100%;
  min-width: 0;
  height: 3rem;
  padding: 0 0.75rem;
  border: 0;
  border-radius: 0.375rem;
  background-color: var(--rev-bg-static-default-low);
  color: var(--rev-text-action-default-hi);
  text-overflow: ellipsis;
  appearance: none;
  -moz-appearance: textfield;
  transition: background-color 0.2s;
}
.rev-input-text__input::-webkit-outer-spin-button,
.rev-input-text__input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.rev-input-text__input:hover {
  background-color: var(--rev-bg-static-default-low-hover);
}
.rev-input-text__input:focus-visible {
  outline: none;
}
.rev-input-text__input:disabled {
  background-color: transparent;
  color: var(--rev-text-action-default-hi-disabled);
}
.rev-input-text__input--floating {
  padding-top: 0.875rem;
}
.rev-input-text__input--clearable {
  padding-right: 3rem;
}

.rev-input-text__border {
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
  height: 3rem;
  border: 1px solid var(--rev-border-action-default-low);
  border-radius: 0.375rem;
  transition: border-color 0.2s;
}
.rev-input-text__input:focus-visible + .rev-input-text__border {
  border-width: 2px;
  border-color: var(--rev-border-action-default-low-pressed);
}
@media (min-resolution: 2x) {
  .rev-input-text__input:focus-visible + .rev-input-text__border {
    border-width: 1.5px;
  }
}
.rev-input-text__input:disabled + .rev-input-text__border {
  border-color: var(--rev-border-action-default-low-disabled);
}

.rev-input-text__label {
  pointer-events: none;
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  top: 1.5rem;
  max-width: 100%;
  transform: translateY(-50%);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--rev-text-action-default-hi);
  transition: all 0.2s;
}
.rev-input-text__label--floating {
  top: 0.3125rem;
  transform: none;
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--rev-text-static-default-low);
}
.rev-input-text__input--clearable ~ .rev-input-text__label {
  padding-right: 2.25rem;
}

.rev-input-text__clear {
  position: absolute;
  right: 0.25rem;
  top: 0.25rem;
  z-index: 1;
  color: var(--rev-text-static-default-low);
}
</style>
