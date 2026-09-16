<script setup lang="ts">
import type { PrototypeConcept } from '~/composables/usePrototypeSidebar'
import { SELLER_NAME } from '~/utils/mockHomeData'

definePageMeta({ layout: false })

const NAV_ITEMS = [
  'Home', 'Insights', 'Customer Care', 'Listings', 'Orders',
  'Opportunities', 'Money', 'Options', 'Seller Support',
] as const

const activeNavItem = ref<string>('Home')

/**
 * Five content archetypes, each isolating a different bet about what the
 * Home page is for. Use Before / After in the sidebar to compare any concept
 * against today's masonry layout.
 *
 * Research backing this set is in the Sep 2026 pass: Dust internal evidence
 * (data signal inventory, SSAT, churn drivers) plus a public benchmark of
 * Amazon, Shopify, eBay, Etsy, Stripe, Walmart, Datadog and NN/g.
 */
const conceptMeta: readonly PrototypeConcept[] = [
  {
    name: 'A · Triage',
    prdFeature: 'Exception queue leads',
    prdMetric: 'Reduce share of Home sessions with zero interaction; cut time-to-clear on late orders and messages.',
    pros: [
      'Matches the one pattern present in all 5 benchmarked comparators',
      'Fits the finding that 69% of integrator sellers still use the BO for exceptions',
      'Every count has a window and a rule, so nothing on the page is noise',
      'Easiest to measure: did the queue shrink?',
    ],
    cons: [
      'Needs a real empty state or it dies in a quiet week (toggle included)',
      'Requires cross-squad agreement on what counts as actionable',
      'Says nothing about whether the business is healthy',
    ],
    pages: [
      {
        id: 'triage',
        label: 'Home',
        navItem: 'Home',
        changes: [
          'Masonry replaced with a single-column stack of full-width sections',
          'Leads with scoped exceptions, not raw totals (11 past ship-by, not 196 open)',
          'Queue and Money are undismissible; everything else can be dismissed',
          'Quality reduced to a status chip in the header, detail lives off-page',
          'Metrics compressed to a 4-tile divided strip, no card chrome',
          'Shortcuts use pinning and recency instead of duplicating the nav',
        ],
      },
    ],
  },
  {
    name: 'B · Cash flow',
    prdFeature: 'Money leads',
    prdMetric: 'Reduce payout-related support contacts and improve finance-related S-SAT.',
    pros: [
      'Targets the #1 voluntary churn driver: 21% of churners cite fees',
      '44% of sellers called the payout process too long or complex',
      'Payout timeline makes deferred amounts legible instead of mysterious',
      'Tier progression turns a passive hold into an achievable unlock',
    ],
    cons: [
      'Narrow: may not sustain a whole page for a seller with no cash concern',
      'Risks reading as a BackFunds upsell surface',
      'Deprioritises the operational work that brings sellers in daily',
    ],
    pages: [
      {
        id: 'cashflow',
        label: 'Home',
        navItem: 'Home',
        changes: [
          'Money promoted to the top, expanded, with tier progression visible',
          '"What happens next" timeline for the current sales period',
          'Only payout-affecting exceptions surface, keeping the page on-message',
          'Daily payout offer is provider-neutral until the CTA',
          'Performance demoted to a collapsible section',
        ],
      },
    ],
  },
  {
    name: 'C · Scoreboard',
    prdFeature: 'Seller-language KPIs lead',
    prdMetric: 'Sellers can state their own performance without leaving Home; fewer "why am I not winning" contacts.',
    pros: [
      'Direct answer to "your metrics matter to you, not to us"',
      'Uses turnover, revenue and sell-through instead of GMV',
      'Quality shown against real limits with the real consequence stated',
      'CSV export is an explicit and repeated seller request',
    ],
    cons: [
      'Scoreboards decay into wallpaper fastest of any archetype',
      'A table of limits and suspensions can read as surveillance',
      'Work is demoted to one line, which may be the wrong trade',
    ],
    pages: [
      {
        id: 'scoreboard',
        label: 'Home',
        navItem: 'Home',
        changes: [
          'Trading metrics first, in seller language, with a range selector',
          'Quality as a table: your value, the limit, the window, the consequence',
          'Every row states what happens if the limit is exceeded',
          'Export CSV surfaced at section level',
          'Open work compressed to a single summary row',
        ],
      },
    ],
  },
  {
    name: 'D · Next best action',
    prdFeature: 'Ranked opportunity feed',
    prdMetric: 'Tool adoption rate per surfaced opportunity; dismiss rate per card type as the noise signal.',
    pros: [
      'Addresses 58% of sellers discovering BO features only via a survey',
      'Serves the 2026 "100% tools adoption" target directly',
      'Highest ceiling on value of any archetype',
      'Suppression rules are built in: eligibility gate, 3/day cap, 24h TTL, dismissal with reason',
    ],
    cons: [
      'Highest build cost by far; needs a real ranking pipeline',
      'Becomes an ignored promo rail without the suppression machinery',
      'Recommendation quality is the whole product, and it is unproven here',
    ],
    pages: [
      {
        id: 'nextbest',
        label: 'Home',
        navItem: 'Home',
        changes: [
          'Ranked feed of at most 3 opportunities, each with a "based on" line',
          '"Not useful" captures a structured reason, which is how noise gets found',
          'Feed rules surfaced in-page for critique only',
          'Work stays above the feed but compressed to one row',
          'Explanatory prose allowed here only, because the sentence is the product',
        ],
      },
    ],
  },
  {
    name: 'E · Bounded hybrid',
    prdFeature: 'Fixed spine plus narrow customisation',
    prdMetric: 'Metric-slot swap rate tells us within a quarter whether the customisation instinct is real.',
    pros: [
      'Mirrors what Shopify actually ships, the closest real-world analogue',
      'Fixed spine still leads with work and money, so it decides rather than defers',
      'Metric slots are per user, so a listings person and an owner see different numbers',
      'All the perceived control of a canvas at a fraction of the cost',
    ],
    cons: [
      'Risks becoming a compromise that leads with nothing in particular',
      'Per-user state needs persistence and a migration story',
      'NN/g: most users never customise, so the default still carries the page',
    ],
    pages: [
      {
        id: 'hybrid',
        label: 'Home',
        navItem: 'Home',
        changes: [
          'Fixed spine: work, then money, always in that order',
          '4 metric slots the seller can swap, scoped to them not the account',
          'Exactly one recommendation, following the single-banner rule',
          'Shortcuts and What\'s new collapsible, editorial pinned last',
          'No drag-and-drop canvas, deliberately',
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

const activePageId = computed(() => activePages.value[activeConcept.value - 1] ?? '')
function setActivePage(id: string) {
  activePages.value[activeConcept.value - 1] = id
}

function onNavClick(item: string) {
  activeNavItem.value = item
}

/** Reset transient UI. Concepts own their own dismiss state via keyed remount. */
const resetKey = ref(0)
function resetDismissedUi() {
  resetKey.value += 1
  activeNavItem.value = 'Home'
}
</script>

<template>
  <div
    :class="['flex h-screen overflow-hidden font-body', showHotspots ? 'prototype-hotspots' : '']"
    @click="flashHotspots"
  >
    <PrototypeSidebar
      title="Home Page Explorations"
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
      <!-- Before: today's masonry Home, untouched, as the control -->
      <HomeBaseline v-if="previewMode === 'before'" />

      <!-- After: the selected concept, inside the standard BO shell -->
      <BmShell
        v-else
        :key="resetKey"
        :nav-items="NAV_ITEMS"
        :active-nav-item="activeNavItem"
        :seller-name="SELLER_NAME"
        @nav-item-click="onNavClick"
      >
        <template #custom>
          <HomeConceptTriage     v-if="activeConcept === 1" />
          <HomeConceptCashflow   v-else-if="activeConcept === 2" />
          <HomeConceptScoreboard v-else-if="activeConcept === 3" />
          <HomeConceptNextBest   v-else-if="activeConcept === 4" />
          <HomeConceptHybrid     v-else-if="activeConcept === 5" />
        </template>
      </BmShell>
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
