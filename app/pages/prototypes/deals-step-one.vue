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

/**
 * Page transition (tester mode): fade the current page out quickly (~120ms),
 * scroll to top, then fade the next page in with a slight upward slide
 * (~200ms ease-out). Instant when prefers-reduced-motion is set. Implemented
 * manually because each page renders its own BmShell (header + tabs must
 * stay fixed while only the content swaps).
 */
const transitioning = ref(false)
const leavingPageId = ref<string | null>(null)
const prefersReducedMotion = ref(false)

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
})

function onShellNav(item: string) {
  const pageId = NAV_TO_PAGE[item]
  if (!pageId || pageId === activePageId.value) return
  if (!testerMode || prefersReducedMotion.value) {
    setActivePage(pageId)
    return
  }
  if (transitioning.value) return
  transitioning.value = true
  leavingPageId.value = activePageId.value
  // Fade out (~120ms), then swap + scroll top + slide in
  setTimeout(() => {
    setActivePage(pageId)
    if (import.meta.client) {
      const scroller = document.querySelector('.h-screen.overflow-y-auto')
      if (scroller) scroller.scrollTop = 0
      window.scrollTo(0, 0)
    }
    leavingPageId.value = null
    transitioning.value = false
  }, 120)
}

const NAV_TO_PAGE: Record<string, string> = {
  Home: 'home',
  Listings: 'listings',
  Opportunities: 'opportunities',
}

function resetDismissedUi() {
  // Reset any dismissible UI state your prototype owns.
}
</script>

<template>
  <!-- Tester mode: no hub sidebar/panel, prototype fills the full width. -->
  <div v-if="testerMode" class="h-screen overflow-y-auto font-body bg-bm-surface">
    <div :class="['page-content-anim', transitioning ? 'anim-leave' : 'anim-enter']" :key="activePageId">
      <HomeBaseline v-if="activePageId === 'home'" @nav-item-click="onShellNav" />
      <ListingsBaseline v-else-if="activePageId === 'listings'" @nav-item-click="onShellNav" />
      <OpportunitiesDealsShell v-else-if="activePageId === 'opportunities'" @nav-item-click="onShellNav" />
    </div>
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

<style>
/* Tester-mode page transition: fade out 120ms, fade in + 8px slide 200ms.
   The leaving state is applied for the 120ms swap window, then the new page
   mounts directly in its enter animation. */
.page-content-anim.anim-leave {
  animation: pageFadeOut 0.12s ease-out forwards;
}
.page-content-anim.anim-enter {
  animation: pageSlideIn 0.2s ease-out;
}
@keyframes pageFadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
@keyframes pageSlideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .page-content-anim.anim-leave,
  .page-content-anim.anim-enter {
    animation: none;
  }
}
</style>
