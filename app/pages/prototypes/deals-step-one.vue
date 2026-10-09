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

/**
 * Page changes. With `animate`, the current page's content slides out
 * sideways while fading (~120ms) and the next one slides in from the other
 * side (~250ms ease-out); without it the swap is instant. The motion follows
 * the main navigation: going to a tab further right brings the page in from
 * the right, and the other way round. Only the content below the navigation
 * moves; the header stays still. Either way the new page starts at the top.
 * Nothing animates when prefers-reduced-motion is set. Implemented manually
 * because each page renders its own BoShell.
 *
 * - Main navigation: animated in tester mode, instant in the hub (as before).
 * - "View eligible listings" / "View deals": always animated, see onViewDeals.
 */
const transitioning = ref(false)
const enterAnimated = ref(testerMode)
/** 1 = the new page is to the right in the navigation, -1 = to the left. */
const pageDirection = ref(1)
const PAGE_ORDER = ['home', 'listings', 'opportunities']
const prefersReducedMotion = ref(false)
/** The element that scrolls the page (one per layout below). */
const scroller = ref<HTMLElement | null>(null)

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

function swapPage(pageId: string, afterSwap?: () => void) {
  setActivePage(pageId)
  if (scroller.value) scroller.value.scrollTop = 0
  if (import.meta.client) window.scrollTo(0, 0)
  if (afterSwap) nextTick(afterSwap)
}

function goToPage(pageId: string, animate: boolean, afterSwap?: () => void) {
  if (pageId === activePageId.value) {
    afterSwap?.()
    return
  }
  if (!animate || prefersReducedMotion.value) {
    enterAnimated.value = false
    swapPage(pageId, afterSwap)
    return
  }
  if (transitioning.value) return
  pageDirection.value = PAGE_ORDER.indexOf(pageId) >= PAGE_ORDER.indexOf(activePageId.value) ? 1 : -1
  transitioning.value = true
  enterAnimated.value = true
  // Slide out (~120ms), then swap + scroll to top + slide in
  setTimeout(() => {
    swapPage(pageId, afterSwap)
    transitioning.value = false
  }, 120)
}

function onShellNav(item: string) {
  const pageId = NAV_TO_PAGE[item]
  if (!pageId || pageId === activePageId.value) return
  goToPage(pageId, testerMode)
}

/**
 * "View eligible listings" (Home) and "View deals" (Listings): open the
 * Opportunities page from the top so the seller sees where they have landed,
 * pause briefly, then glide down to the Deals section.
 */
const DEALS_SCROLL_DELAY_MS = 600

function onViewDeals() {
  goToPage('opportunities', true, () => {
    const reduced = prefersReducedMotion.value
    setTimeout(() => {
      document.getElementById('deals-section')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    }, reduced ? 0 : DEALS_SCROLL_DELAY_MS)
  })
}

const NAV_TO_PAGE: Record<string, string> = {
  Home: 'home',
  Listings: 'listings',
  Opportunities: 'opportunities',
}
</script>

<template>
  <!-- No hub sidebar: the prototype fills the full width in both modes. -->
  <div v-if="testerMode" ref="scroller" class="h-screen overflow-y-auto font-body">
    <div
      :key="activePageId"
      :class="['page-content-anim', transitioning ? 'anim-leave' : enterAnimated ? 'anim-enter' : '']"
      :style="{ '--page-dir': pageDirection }"
    >
      <HomeBaseline v-if="activePageId === 'home'" @nav-item-click="onShellNav" @view-deals="onViewDeals" />
      <DealsStepOneListingsPage v-else-if="activePageId === 'listings'" @nav-item-click="onShellNav" @view-deals="onViewDeals" />
      <OpportunitiesDealsShell v-else-if="activePageId === 'opportunities'" @nav-item-click="onShellNav" />
    </div>
  </div>

  <div v-else :class="['flex h-screen overflow-hidden font-body', showHotspots ? 'prototype-hotspots' : '']" @click="flashHotspots">
    <div ref="scroller" class="flex-1 overflow-auto">
      <div
        v-show="activeConcept === 1"
        :key="activePageId"
        :class="['page-content-anim', transitioning ? 'anim-leave' : enterAnimated ? 'anim-enter' : '']"
        :style="{ '--page-dir': pageDirection }"
      >
        <HomeBaseline v-if="activePageId === 'home'" @nav-item-click="onShellNav" @view-deals="onViewDeals" />
        <DealsStepOneListingsPage v-if="activePageId === 'listings'" @nav-item-click="onShellNav" @view-deals="onViewDeals" />
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

<style>
/* Page transition: the content below the navigation slides out sideways
   (120ms) and the new page's content slides in from the other side (250ms).
   --page-dir is 1 when moving to a tab on the right, -1 to the left. The
   leaving state is applied for the 120ms swap window, then the new page
   mounts directly in its enter animation. */
.page-content-anim .bo-shell {
  overflow-x: clip;
}
.page-content-anim.anim-leave .bo-shell__content {
  animation: pageSlideOut 0.12s ease-in forwards;
}
.page-content-anim.anim-enter .bo-shell__content {
  animation: pageSlideIn 0.25s ease-out;
}
@keyframes pageSlideOut {
  from { opacity: 1; transform: translateX(0); }
  to { opacity: 0; transform: translateX(calc(var(--page-dir, 1) * -16px)); }
}
@keyframes pageSlideIn {
  from { opacity: 0; transform: translateX(calc(var(--page-dir, 1) * 32px)); }
  to { opacity: 1; transform: translateX(0); }
}
@media (prefers-reduced-motion: reduce) {
  .page-content-anim.anim-leave .bo-shell__content,
  .page-content-anim.anim-enter .bo-shell__content {
    animation: none;
  }
}
</style>
