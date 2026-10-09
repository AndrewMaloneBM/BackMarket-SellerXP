<script setup lang="ts">
/**
 * RevTabs - Revolve tab bar ("flexible" variant: tabs sized to their label).
 * Styles copied from @backmarket/design-system 129.13.0 (Tabs.vue).
 * Docs: design-system/components/navigation/RevTabs.md
 *
 *   <RevTabs label="Sections">
 *     <RevTabItem label="Deals" :active="tab === 'Deals'" @click="tab = 'Deals'" />
 *   </RevTabs>
 */
import '~/assets/css/revolve.css'

defineProps<{ label: string }>()
</script>

<template>
  <nav class="rev-tabs" :aria-label="label">
    <div class="rev-tabs__inner">
      <div class="rev-tabs__list" role="tablist">
        <slot />
      </div>
      <div class="rev-tabs__track" aria-hidden="true" />
    </div>
  </nav>
</template>

<style scoped>
.rev-tabs {
  position: relative;
  max-width: 100%;
  margin-left: -0.25rem;
  margin-right: -0.25rem;
  padding-left: 0.25rem;
  padding-right: 0.25rem;
  overflow-x: auto;
}
.rev-tabs__inner {
  width: max-content;
}
/* Grey line under the whole bar */
.rev-tabs__inner::after {
  content: '';
  position: absolute;
  left: 0.25rem;
  right: 0.25rem;
  bottom: 0.5rem;
  border-top: 1px solid var(--rev-border-static-default-low);
}
.rev-tabs__list {
  display: flex;
  max-width: 100%;
  gap: 2rem;
  margin: 0 -0.25rem;
  padding: 0 0.25rem;
  list-style: none;
}
.rev-tabs__track {
  position: relative;
  height: 0.125rem;
  max-width: 100%;
  margin-bottom: 0.5rem;
}
</style>
