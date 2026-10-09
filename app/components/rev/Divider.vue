<script setup lang="ts">
/**
 * RevDivider - Revolve separator line.
 * Copied from @backmarket/design-system 129.13.0 (Divider.vue).
 * Docs: design-system/components/layout/RevDivider.md
 */
import '~/assets/css/revolve.css'

withDefaults(defineProps<{ variant?: 'horizontal' | 'vertical' }>(), { variant: 'horizontal' })
</script>

<template>
  <hr :class="['rev-divider', `rev-divider--${variant}`]" />
</template>

<style scoped>
.rev-divider {
  border: 0 solid var(--rev-border-static-default-low);
}
.rev-divider--horizontal {
  border-top-width: 1px;
}
.rev-divider--vertical {
  border-left-width: 1px;
}
</style>
