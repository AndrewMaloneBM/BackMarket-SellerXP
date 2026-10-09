<script setup lang="ts">
/**
 * RevButtonIcon - Revolve icon-only button (round).
 * Styles copied from @backmarket/design-system 129.13.0 (ButtonIcon.vue).
 * Docs: design-system/components/actions/RevButtonIcon.md
 *
 *   <RevButtonIcon icon="IconCross" variant="ghost" aria-label="Close" />
 */
import '~/assets/css/revolve.css'

withDefaults(defineProps<{
  /** Revolve icon name, e.g. "IconChevronDown". */
  icon: string
  variant: 'primary' | 'secondary' | 'ghost'
  size?: 'medium' | 'small'
  disabled?: boolean
  ariaLabel: string
}>(), {
  size: 'medium',
  disabled: false,
})

defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <button
    type="button"
    :aria-label="ariaLabel"
    :disabled="disabled"
    :class="['rev-button-icon rev-focus', `rev-button-icon--${variant}`, `rev-button-icon--${size}`]"
    @click="$emit('click', $event)"
  >
    <RevIcon :name="icon" size="24" />
  </button>
</template>

<style scoped>
.rev-button-icon {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 624.938rem;
  border: 0;
  cursor: pointer;
  appearance: none;
  transition: all 0.3s ease-in;
}
.rev-button-icon:disabled {
  cursor: not-allowed;
}
.rev-button-icon--medium {
  width: 2.5rem;
  height: 2.5rem;
}
.rev-button-icon--small {
  width: 2rem;
  height: 2rem;
}

.rev-button-icon--primary {
  background-color: var(--rev-bg-action-default-hi);
  color: var(--rev-text-onaction-default-hi);
}
.rev-button-icon--primary:hover {
  background-color: var(--rev-bg-action-default-hi-hover);
}
.rev-button-icon--primary:disabled {
  background-color: var(--rev-bg-action-default-hi-disabled);
  color: var(--rev-text-onaction-default-hi-disabled);
}

.rev-button-icon--secondary {
  border: 1px solid var(--rev-border-action-default-low);
  background-color: var(--rev-bg-action-default-min);
  color: var(--rev-text-action-default-hi);
}
.rev-button-icon--ghost {
  background-color: var(--rev-bg-action-default-min);
  color: var(--rev-text-action-default-hi);
}
.rev-button-icon--secondary:hover,
.rev-button-icon--ghost:hover {
  background-color: var(--rev-bg-action-default-min-hover);
}
.rev-button-icon--secondary:disabled,
.rev-button-icon--ghost:disabled {
  background-color: var(--rev-bg-action-default-min-disabled);
  color: var(--rev-text-action-default-hi-disabled);
}
.rev-button-icon--secondary:disabled {
  border-color: var(--rev-border-action-default-low-disabled);
}

@media (prefers-reduced-motion: reduce) {
  .rev-button-icon {
    transition: none;
  }
}
</style>
