<script setup lang="ts">
/**
 * RevList - Revolve list wrapper: draws the divider lines between items.
 * Styles copied from @backmarket/design-system 129.13.0 (List.vue).
 * Docs: design-system/components/data-display/RevList.md
 */
import '~/assets/css/revolve.css'

withDefaults(defineProps<{ hasExternalBorders?: boolean }>(), { hasExternalBorders: true })
</script>

<template>
  <ul :class="['rev-list', hasExternalBorders && 'rev-list--bordered']">
    <slot />
  </ul>
</template>

<style scoped>
.rev-list {
  list-style: none;
  border: 0 solid var(--rev-border-static-default-low);
}
.rev-list--bordered {
  border-top-width: 1px;
  border-bottom-width: 1px;
}
.rev-list > :deep(* + *) {
  border-top: 1px solid var(--rev-border-static-default-low);
}
</style>
