<script setup lang="ts">
import type { PrototypeConcept } from '~/composables/usePrototypeSidebar'

definePageMeta({ layout: false })

const conceptMeta: readonly PrototypeConcept[] = [
  {
    name: 'Step One shell',
    prdFeature: 'Back Office scaffolding: shell, Home, Listings, Opportunities placeholder',
    prdMetric: 'Testers can navigate the Back Office shell before deals features are added',
    pros: [
      'Scoped starting point, one feature at a time based on tester feedback',
      'Baseline Home and Listings pages match today\'s Back Office',
    ],
    cons: [],
    pages: [
      {
        id: 'home',
        label: 'Home',
        navItem: 'Home',
        changes: ['Baseline Back Office Home page (no deals UI)'],
      },
      {
        id: 'listings',
        label: 'Listings',
        navItem: 'Listings',
        changes: ['Baseline Listings page (no deals UI)'],
      },
      {
        id: 'opportunities',
        label: 'Opportunities',
        navItem: 'Opportunities',
        changes: [
          'Deals tab with four active deal campaigns with real campaign names and markets',
          'Clicking a campaign card opens a drawer with the deal criteria',
          'Per-listing table: price vs deal target, status, next action',
        ],
      },
    ],
  },
]

const { public: publicConfig } = useRuntimeConfig()
const testerMode = publicConfig.testerMode as boolean

const {
  sidebarOpen,
  previewMode,
  activeConcept,
  activePages,
  flashHotspots,
  showHotspots,
} = usePrototypeSidebar(conceptMeta)

previewMode.value = 'after'

const activePageId = computed(() => activePages.value[activeConcept.value - 1] ?? '')
function setActivePage(id: string) {
  activePages.value[activeConcept.value - 1] = id
}

// Tester mode starts directly on the Back Office Home.
if (testerMode) {
  activePages.value[activeConcept.value - 1] = 'home'
}

const NAV_TO_PAGE: Record<string, string> = {
  Home: 'home',
  Listings: 'listings',
  Opportunities: 'opportunities',
}

function onShellNav(item: string) {
  const pageId = NAV_TO_PAGE[item]
  if (pageId) setActivePage(pageId)
}

function resetDismissedUi() {
  // Reset any dismissible UI state your prototype owns.
}
</script>

<template>
  <!-- Tester mode: no hub sidebar/panel, prototype fills the full width. -->
  <div v-if="testerMode" class="h-screen overflow-hidden font-body bg-bm-surface">
    <HomeBaseline v-if="activePageId === 'home'" @nav-item-click="onShellNav" />
    <ListingsBaseline v-else-if="activePageId === 'listings'" @nav-item-click="onShellNav" />
    <OpportunitiesDealsShell v-else-if="activePageId === 'opportunities'" @nav-item-click="onShellNav" />
  </div>

  <div v-else :class="['flex h-screen overflow-hidden font-body', showHotspots ? 'prototype-hotspots' : '']" @click="flashHotspots">
    <PrototypeSidebar
      title="Deals Step One Testing"
      :concepts="conceptMeta"
      :active-concept="activeConcept"
      :preview-mode="previewMode"
      :sidebar-open="sidebarOpen"
      :active-page-id="activePageId"
      @update:active-concept="activeConcept = $event"
      @update:preview-mode="previewMode = $event"
      @update:sidebar-open="sidebarOpen = $event"
      @update:active-page-id="setActivePage"
      @reset="resetDismissedUi"
    />

    <div class="flex-1 overflow-auto bg-bm-surface">
      <div v-show="activeConcept === 1">
        <HomeBaseline v-if="activePageId === 'home'" @nav-item-click="onShellNav" />
        <ListingsBaseline v-if="activePageId === 'listings'" @nav-item-click="onShellNav" />
        <OpportunitiesDealsShell v-if="activePageId === 'opportunities'" @nav-item-click="onShellNav" />
      </div>
    </div>
  </div>
</template>

<style>
.prototype-hotspot {
  position: relative;
}

.prototype-hotspot::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(13, 153, 255, 0.25);
  border-radius: 0;
  pointer-events: none;
  opacity: 0;
  z-index: 10;
}

.prototype-hotspots .prototype-hotspot::before {
  animation: figmaHotspotFlash 1000ms ease-out forwards;
}

@keyframes figmaHotspotFlash {
  0%   { opacity: 0; }
  15%  { opacity: 1; }
  70%  { opacity: 1; }
  100% { opacity: 0; }
}
</style>
