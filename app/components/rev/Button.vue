<script setup lang="ts">
/**
 * RevButton - Revolve labelled button.
 * Styles copied from @backmarket/design-system 129.13.0 (Button.vue).
 * Docs: design-system/components/actions/RevButton.md
 *
 *   <RevButton variant="primary">Apply filters</RevButton>
 *   <RevButton variant="secondary" size="small">View details</RevButton>
 *   <RevButton variant="secondary" size="small" icon="IconDealFilled">Unlock deal</RevButton>
 */
import '~/assets/css/revolve.css'

const props = withDefaults(defineProps<{
  variant: 'primary' | 'secondary'
  size?: 'medium' | 'small'
  disabled?: boolean
  loading?: boolean
  /** always = full width, adaptive = full width on phones only */
  fullWidth?: 'always' | 'never' | 'adaptive'
  /** Revolve icon name, e.g. "IconDealFilled". Shown after the label. */
  icon?: string
  type?: 'button' | 'submit'
  /** Renders a link instead of a button. */
  href?: string
}>(), {
  size: 'medium',
  disabled: false,
  loading: false,
  fullWidth: 'never',
  icon: undefined,
  type: 'button',
  href: undefined,
})

const emit = defineEmits<{ click: [event: MouseEvent] }>()

const isBlocked = computed(() => props.disabled || props.loading)

function onClick(event: MouseEvent) {
  if (isBlocked.value) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<template>
  <component
    :is="href && !isBlocked ? 'a' : 'button'"
    :href="href && !isBlocked ? href : undefined"
    :type="href && !isBlocked ? undefined : type"
    :disabled="href ? undefined : disabled"
    :aria-disabled="isBlocked ? 'true' : undefined"
    :class="[
      'rev-button rev-focus',
      `rev-button--${variant}`,
      `rev-button--${size}`,
      fullWidth !== 'never' && `rev-button--full-${fullWidth}`,
      isBlocked && 'rev-button--blocked',
      loading && 'rev-button--loading',
    ]"
    @click="onClick"
  >
    <span class="rev-button__content" :aria-hidden="loading ? 'true' : undefined">
      <span class="rev-button__label"><slot /></span>
      <RevIcon v-if="icon" :name="icon" :size="size === 'small' ? 16 : 24" />
    </span>
    <RevSpinner v-if="loading" class="rev-button__spinner" :size="size === 'small' ? 'small' : 'medium'" />
  </component>
</template>

<style scoped>
.rev-button {
  position: relative;
  max-width: 100%;
  border-radius: 0.375rem;
  cursor: pointer;
  user-select: none;
  text-decoration: none;
  font-family: BMDupletTXT, HelveticaTXT, sans-serif;
  font-weight: 600;
  letter-spacing: 0;
}
.rev-button--blocked {
  cursor: not-allowed;
}

/* Sizes */
.rev-button--medium {
  display: inline-block;
  padding: 0.75rem;
  font-size: 1rem;
  line-height: 1.5rem;
  transition: color 0.2s ease-in, background-color 0.2s ease-in, border-color 0.2s ease-in;
}
.rev-button--small {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  transition: all 0.3s ease-in;
}
.rev-button--full-always {
  width: 100%;
}
.rev-button--full-adaptive {
  width: 100%;
  min-width: 5rem;
}
@media (min-width: 768px) {
  .rev-button--full-adaptive {
    width: auto;
  }
}

.rev-button__content {
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}
.rev-button--small .rev-button__content {
  column-gap: 0.5rem;
}
.rev-button__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rev-button--medium .rev-button__label {
  padding: 0 0.25rem;
}
.rev-button--loading .rev-button__content {
  visibility: hidden;
}
.rev-button__spinner {
  position: absolute;
  inset: 0;
  margin: auto;
}

/* Variants */
.rev-button--primary {
  background-color: var(--rev-bg-action-default-hi);
  color: var(--rev-text-onaction-default-hi);
}
.rev-button--primary:hover {
  background-color: var(--rev-bg-action-default-hi-hover);
}
.rev-button--primary:disabled {
  background-color: var(--rev-bg-action-default-hi-disabled);
  color: var(--rev-text-onaction-default-hi-disabled);
}

.rev-button--secondary {
  border: 1px solid var(--rev-border-action-default-hi);
  background-color: var(--rev-bg-action-default-min);
  color: var(--rev-text-action-default-hi);
}
.rev-button--secondary.rev-button--medium {
  padding: 0.6875rem;
}
.rev-button--secondary.rev-button--small {
  padding: 0.3125rem 0.6875rem;
}
.rev-button--secondary:hover {
  background-color: var(--rev-bg-action-default-min-hover);
}
.rev-button--secondary:disabled {
  border-color: var(--rev-border-action-default-hi-disabled);
  background-color: var(--rev-bg-action-default-min-disabled);
  color: var(--rev-text-onaction-default-hi-disabled);
}

@media (prefers-reduced-motion: reduce) {
  .rev-button {
    transition: none;
  }
}
</style>
