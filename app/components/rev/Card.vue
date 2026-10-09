<script setup lang="ts">
/**
 * RevCard - Revolve card surface (white, 12px radius, short shadow).
 * Styles copied from @backmarket/design-system 129.13.0 (Card.vue).
 * Docs: design-system/components/cards/RevCard.md
 * Padding is not built in: add it with a class, e.g. class="p-6" (24px).
 */
import '~/assets/css/revolve.css'

defineProps<{ hoverable?: boolean }>()
</script>

<template>
  <div :class="['rev-card', hoverable && 'rev-card--hoverable']">
    <slot />
  </div>
</template>

<style scoped>
.rev-card {
  border-radius: 0.75rem;
  background-color: var(--rev-bg-float-default-low);
  box-shadow: var(--rev-shadow-short);
}
.rev-card--hoverable:hover,
.rev-card--hoverable:focus-within {
  background-color: var(--rev-bg-float-default-low-hover);
  box-shadow: var(--rev-shadow-middle);
}
</style>
