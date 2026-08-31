<script setup lang="ts">
import type { PrototypeConcept } from '~/composables/usePrototypeSidebar'

definePageMeta({ layout: false })

const conceptMeta: readonly PrototypeConcept[] = [
  {
    name: 'Hackathon V1',
    prdFeature: 'PRD Step 1 — Deal visibility in the Listing page',
    prdMetric: 'Lift deal adoption from 35-40% to 50-60% (FR/ES). Every seller sees deal price and incentive for every product. Increase count of sellers participating in deals.',
    pros: [
      'Deals work commercially when sellers participate: +9% GMV uplift, 60% adoption at deal price (Apr 2025 campaign)',
      'Listing page is the natural surface where sellers already manage pricing, no new navigation needed',
      'Deal visibility is the #1 blocker: 0.2% click rate on deal email vs 60% on save, deals invisible to API sellers (74% of GMV)',
    ],
    cons: [
      'Deal prices too low for many sellers to participate commercially (SSM + seller feedback, Jul 2026)',
      'Commission discount display confusing: "up to 4% discount" is ambiguous, seller must reduce price significantly (Nefix International)',
      'Automated pricing systems can overwrite deal prices for integrated sellers, creating financial risk',
    ],
    pages: [
      {
        id: 'listings',
        label: 'Listings',
        navItem: 'Listings',
        changes: [
          'Deal banner: campaign name, market, timeframe, how deals work, CSV export of deal products',
          'Filter to see which listings are in active deals',
          'Deal icon next to every listing in a deal',
          'Deal price displayed alongside BackBox price with unlock button',
          'Financial benefit shown as margin impact, not just price proximity',
        ],
      },
    ],
  },
]

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

const navItems = ['Home', 'Insights', 'Customer Care', 'Listings', 'Orders', 'Opportunities', 'Money', 'Options', 'Seller Support']

function makeNavDotPredicate(conceptIdx: number) {
  return (item: string) => conceptMeta[conceptIdx]?.pages.some(page => page.navItem === item) ?? false
}

function onNavClick(item: string) {
  const page = conceptMeta[activeConcept.value - 1]?.pages.find(candidate => candidate.navItem === item)
  if (page) setActivePage(page.id)
}

function resetDismissedUi() {
  // Reset any dismissible UI state your prototype owns.
}
</script>

<template>
  <div :class="['flex h-screen overflow-hidden font-body', showHotspots ? 'prototype-hotspots' : '']" @click="flashHotspots">
    <PrototypeSidebar
      title="Deals Adoption"
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
        <ListingsBaseline v-if="activePageId === 'listings'" v-show="previewMode === 'before'" />
        <ListingsDealsAfter v-if="activePageId === 'listings'" v-show="previewMode === 'after'" />
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
