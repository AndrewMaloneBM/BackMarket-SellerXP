<script setup lang="ts">
/**
 * RevTag - Revolve read-only label (status, category). Never clickable.
 * Styles copied from @backmarket/design-system 129.13.0 (Tag.vue).
 * Docs: design-system/components/selection/RevTag.md
 *
 *   <RevTag label="Active" variant="success" />
 */
import '~/assets/css/revolve.css'

withDefaults(defineProps<{
  label: string
  variant: 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'danger' | 'alternate'
  size?: 'small' | 'medium' | 'large'
  variation?: 'filled' | 'outline'
  /** Revolve icon name shown before the label. */
  icon?: string
}>(), {
  size: 'medium',
  variation: 'filled',
  icon: undefined,
})
</script>

<template>
  <span :class="['rev-tag', `rev-tag--${size}`, `rev-tag--${variation}`, `rev-tag--${variant}`]" :title="label">
    <RevIcon v-if="icon" :name="icon" :size="size === 'large' ? 20 : 16" />
    <span class="rev-tag__label">{{ label }}</span>
  </span>
</template>

<style scoped>
.rev-tag {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  gap: 0.125rem;
  border-radius: 0.125rem;
  font-family: BMDupletTXT, HelveticaTXT, sans-serif;
  font-weight: 600;
  letter-spacing: 0;
}
.rev-tag__label {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rev-tag--small {
  padding: 0 0.125rem;
  font-size: 0.75rem;
  line-height: 1rem;
}
.rev-tag--medium {
  padding: 0 0.25rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
}
.rev-tag--large {
  padding: 0 0.25rem;
  font-size: 1rem;
  line-height: 1.5rem;
}

.rev-tag--filled.rev-tag--primary { background-color: var(--rev-bg-static-brand-hi); color: var(--rev-text-static-default-hi); }
.rev-tag--filled.rev-tag--secondary { background-color: var(--rev-bg-static-default-mid); color: var(--rev-text-static-default-hi); }
.rev-tag--filled.rev-tag--info { background-color: var(--rev-bg-static-info-mid); color: var(--rev-text-static-info-hi); }
.rev-tag--filled.rev-tag--success { background-color: var(--rev-bg-static-success-mid); color: var(--rev-text-static-success-hi); }
.rev-tag--filled.rev-tag--warning { background-color: var(--rev-bg-static-warning-mid); color: var(--rev-text-static-warning-hi); }
.rev-tag--filled.rev-tag--danger { background-color: var(--rev-bg-static-danger-mid); color: var(--rev-text-static-danger-hi); }
.rev-tag--filled.rev-tag--alternate { background-color: var(--rev-bg-static-brand-mid); color: var(--rev-text-static-brand-hi); }

.rev-tag--outline { border: 1px solid; }
.rev-tag--outline.rev-tag--small { line-height: 14px; }
.rev-tag--outline.rev-tag--medium { line-height: 18px; }
.rev-tag--outline.rev-tag--large { line-height: 22px; }
.rev-tag--outline.rev-tag--primary { border-color: var(--rev-border-static-brand-hi); color: var(--rev-text-static-default-hi); }
.rev-tag--outline.rev-tag--secondary { border-color: var(--rev-border-static-default-mid); color: var(--rev-text-static-default-hi); }
.rev-tag--outline.rev-tag--info { border-color: var(--rev-border-static-info-mid); color: var(--rev-text-static-info-hi); }
.rev-tag--outline.rev-tag--success { border-color: var(--rev-border-static-success-mid); color: var(--rev-text-static-success-hi); }
.rev-tag--outline.rev-tag--warning { border-color: var(--rev-border-static-warning-mid); color: var(--rev-text-static-warning-hi); }
.rev-tag--outline.rev-tag--danger { border-color: var(--rev-border-static-danger-mid); color: var(--rev-text-static-danger-hi); }
.rev-tag--outline.rev-tag--alternate { border-color: var(--rev-border-static-brand-mid); color: var(--rev-text-static-brand-hi); }
</style>
