<script setup lang="ts">
import type { PrototypeConcept } from '~/composables/usePrototypeSidebar'

definePageMeta({ layout: false })

const conceptMeta: readonly PrototypeConcept[] = [
  {
    name: 'Inline margin',
    prdFeature: 'PRD 2.1 — Margin tradeoff visibility',
    prdMetric: 'Recommended-price adoption 31% → 40%+. Seller-set vs optimal-margin gap under €8.',
    pros: [
      'Margin becomes visible at the moment of decision without adding any vertical weight',
      'Keeps the table fast to scan and act on — no new surface, no extra clicks',
      'Targets the €15 gap by showing when a promotion out-earns the BackBox',
    ],
    cons: [
      'Inline figures are subtler than cards — easier to overlook at a glance',
      'Shows the margin but doesn\'t help the seller decide or act faster on it',
    ],
    pages: [
      {
        id: 'listings',
        label: 'Listings',
        navItem: 'Listings',
        changes: [
          'Projected net margin per unit shown inline beneath each price — BackBox and promotion — without changing the table layout',
          'Higher-margin option marked with a small indicator, not a card or border',
          '"How is this calculated?" opens a fee breakdown: commission, CCBM, logistics, trade-in',
          'Min/target inputs and row height unchanged — the table stays compact and fast to scan',
          '"Last time you won the BackBox here: 14 units in 7 days" links out to Opportunities',
        ],
      },
    ],
  },
  {
    name: 'Recommended action',
    prdFeature: 'PRD 2.2 — Reasoned recommendation',
    prdMetric: 'Recommended-price adoption 31% → 40%+. Fewer sellers overriding then manually pricing within €5 of the recommendation.',
    pros: [
      'Reduces decision load — the seller gets a defensible answer, not a comparison to work through',
      'Reasoning-by-default is the direct fix for what the old recommendation lacked',
      'Scales to many markets: one clear call per row, confirmed in one click',
    ],
    cons: [
      'A distrusted or wrong recommendation erodes trust faster than a neutral comparison would',
      'De-emphasising the alternative risks sellers feeling steered toward the platform\'s interest',
    ],
    pages: [
      {
        id: 'listings',
        label: 'Listings',
        navItem: 'Listings',
        changes: [
          'The platform recommends one pricing option per market — BackBox or the available promotion, whichever earns more — and marks it clearly',
          'A one-line plain-language reason sits with every recommendation, always visible',
          'Projected net margin shown under both options, as in the baseline margin view',
          'The seller always confirms — the recommended option\'s Apply button is emphasised, but nothing is pre-filled or applied automatically',
          'Min/target inputs and row height unchanged — the table stays compact and fast',
        ],
      },
    ],
  },
  {
    name: 'Concept 3',
    prdFeature: 'TBD',
    prdMetric: 'TBD',
    pros: [],
    cons: [],
    pages: [
      { id: 'listings', label: 'Listings', navItem: 'Listings', changes: ['TBD — changes will be defined when the concept brief is written.'] },
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

const activePageId = computed(() => activePages.value[activeConcept.value - 1] ?? '')
function setActivePage(id: string) {
  activePages.value[activeConcept.value - 1] = id
}

watch(activeConcept, () => {
  // Hook for per-concept state resets when switching concepts (no-op for now).
})

function resetDismissedUi() {
  // No dismissible UI to reset at the page level — each ListingsBaseline owns its own state.
}
</script>

<template>
  <div :class="['flex h-screen overflow-hidden font-body', showHotspots ? 'prototype-hotspots' : '']" @click="flashHotspots">
    <PrototypeSidebar
      title="Listing Page explorations"
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
        <ListingsBaseline v-show="previewMode === 'before'" />
        <ListingsAfterConcept1 v-show="previewMode === 'after'" />
      </div>
      <div v-show="activeConcept === 2">
        <ListingsBaseline v-show="previewMode === 'before'" />
        <ListingsAfterConcept2 v-show="previewMode === 'after'" />
      </div>
      <div v-show="activeConcept === 3">
        <ListingsBaseline />
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
