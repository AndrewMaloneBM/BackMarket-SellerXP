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
          'See all deals CTA in header with active deal count badge',
          'Deals drawer with 3 card variants (Figma original, compact improved, minimal scannable)',
          'Deal cards show status tags (starting soon, active, ending soon, ended, price update)',
          'Volume tier ladder with commission discounts and progress bars',
          'Per-deal models table with deal price, your price, units sold, price update indicators',
          'Filterable model list (search, market, grade, listing status) with sort on units sold',
          'In deal chip on listing rows for products in active deals',
          'BackBox price column with won (green checkmark tag) and opportunity (flame icon) states',
          'Sales strategy column: visibility boost, deal opportunity, or no strategy available',
          'Deal opportunity strategy shows deal price, commission savings, and set deal price CTA',
          'Deal status filter in more filters: In an active deal / Deal opportunity / Not in a deal',
        ],
      },
    ],
  },
  {
    name: 'Opportunities >> Deals',
    prdFeature: 'Listings for visibility, Opportunities >> Deals for assessment and action',
    prdMetric: 'Listings shows deal status at a glance. Opportunities >> Deals gives space for listing-level eligibility, pricing, margin, and next action. No volume-based commission mechanics.',
    pros: [
      'Opportunities page gives more space for listing-level info and actions than a drawer',
      'Listings remains the natural entry point for deal visibility',
      'Separating assessment from Listings keeps the pricing workflow focused',
      'No volume-based mechanics simplifies the model: eligibility is based on target price only',
    ],
    cons: [
      'Requires sellers to navigate to a second page for full deal details',
      'Opportunities page may be unfamiliar to sellers who rarely visit it',
      'Need clear cross-linking between Listings and Opportunities to avoid dead ends',
    ],
    pages: [
      {
        id: 'listings',
        label: 'Listings',
        navItem: 'Listings',
        changes: [
          'Deal status filter: In an active deal / Deal opportunity / Not in a deal',
          'See all deals CTA links to Opportunities >> Deals tab',
          'In deal chip on listing rows',
        ],
      },
      {
        id: 'opportunities',
        label: 'Opportunities',
        navItem: 'Opportunities',
        changes: [
          'Deals tab in Opportunities with deal cards',
          'Per-listing deal table: current price vs deal target price',
          'Eligibility status: Eligible, Near target, Not eligible, Not listed',
          'Estimated payout with standard vs deal commission',
          'Estimated seller profit per unit and total impact based on current stock',
          'One clear next action per listing: See listing, Update price, Review margin, Create listing',
          'No volume-based commission mechanics or progress bars',
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

// Concept 2: default to Opportunities page
watch(activeConcept, (n) => {
  if (n === 2) setActivePage('opportunities')
}, { immediate: true })

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
      <div v-show="activeConcept === 2">
        <ListingsDealsAfter v-if="activePageId === 'listings'" v-show="previewMode === 'after'" hide-deals-cta />
        <OpportunitiesDeals v-if="activePageId === 'opportunities'" :preview-mode="previewMode" />
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
