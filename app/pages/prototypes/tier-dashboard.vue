<script setup lang="ts">
import type { PrototypeConcept } from '~/composables/usePrototypeSidebar'
import { getSellerTierStatus, type TierScenario } from '~/utils/mockTierApi'
import TierFullDashboard from '~/components/prototypes/TierFullDashboard.vue'
import TierWalletBaseline from '~/components/prototypes/TierWalletBaseline.vue'
import DailyPayouts from '~/components/prototypes/DailyPayouts.vue'
import IntegratedWallet from '~/components/prototypes/IntegratedWallet.vue'
import UnifiedPayouts from '~/components/prototypes/UnifiedPayouts.vue'
import IntegratedPayoutDetails from '~/components/prototypes/IntegratedPayoutDetails.vue'
import MinimalDeferredCard from '~/components/prototypes/MinimalDeferredCard.vue'
import RevIcon from '~/components/RevIcon.vue'

definePageMeta({ layout: false, alias: ['/share/tier-dashboard'] })

const route = useRoute()
const shareMode = computed(() => route.path.startsWith('/share/'))
const scenario = ref<TierScenario>('upgrade-in-progress')

const scenarioOptions: { value: TierScenario; label: string }[] = [
  { value: 'upgrade-in-progress', label: 'Upgrade in progress' },
  { value: 'close-to-upgrade', label: 'Close to upgrade' },
  { value: 'downgrade-notice', label: 'Downgrade notice' },
  { value: 'top-tier', label: 'Top tier' },
  { value: 'stable', label: 'Stable' },
]

const seller = computed(() => getSellerTierStatus('TechRenew-EU-001', scenario.value))
const droppedConcepts = [3] as const
const showDroppedModal = ref(false)

const conceptMeta: readonly PrototypeConcept[] = [
  {
    name: 'Full dashboard below wallet',
    prdFeature: 'PRD 2.1 - Tier Dashboard in Seller Back-Office',
    prdMetric: 'The 6-Tier experience lives in Your wallet, with faster payouts in a separate tab.',
    pros: ['Keeps the full experience in the existing Your wallet journey', 'No new Money navigation item', 'Makes the relationship with wallet balance and payouts explicit'],
    cons: ['Creates a long and dense page', 'The most important tier information may sit below the fold'],
    pages: [{
      id: 'money', label: 'Money', navItem: 'Money',
      changes: ['Existing wallet content remains first', 'Full tier dashboard appears below it', 'Tier information stays in one Your wallet journey'],
      changeTargets: [
        { pageId: 'money', sectionId: 'concept-1-wallet-baseline' },
        { pageId: 'money', subStateId: 'daily-payouts', sectionId: 'concept-1-daily-payouts' },
        { pageId: 'money', subStateId: 'daily-payouts', sectionId: 'concept-1-daily-payouts' },
      ],
      subStates: [{ id: 'wallet', label: 'Your wallet' }],
    }],
  },
  {
    name: 'Split payouts',
    prdFeature: '6-Tier Risk Model plus BackFunds payout architecture',
    prdMetric: 'Separate tabs for Your wallet, Daily payouts, and Deferred payouts.',
    pros: ['Keeps daily and deferred money conceptually distinct', 'Gives BackFunds and the 6-Tier model room to explain themselves', 'Makes the difference between faster payouts and held money explicit'],
    cons: ['Adds more navigation', 'Sellers need to understand which payout tab to use'],
    pages: [{
      id: 'money', label: 'Money', navItem: 'Money',
      changes: ['Your wallet remains the familiar money overview', 'Deferred payouts are shown in their own full-detail tab'],
      changeTargets: [
        { pageId: 'money', subStateId: 'wallet', sectionId: 'concept-2-wallet-baseline' },
        { pageId: 'money', subStateId: 'deferred-payouts', sectionId: 'concept-2-deferred-details' },
      ],
      subStates: [{ id: 'wallet', label: 'Your wallet' }, { id: 'deferred-payouts', label: 'Deferred payouts' }],
    }],
  },
  {
    name: 'Wallet summary + Payouts',
    prdFeature: '6-Tier Risk Model plus unified payout workspace',
    prdMetric: 'A lightweight wallet summary with a full Payouts tab for daily and deferred money.',
    pros: ['Keeps the seller in the familiar Your wallet context', 'Puts full payout information in one dedicated workspace', 'Avoids repeating detailed payout information in the wallet overview'],
    cons: ['The Payouts tab becomes information-dense', 'Requires clear hierarchy between payout activity and held money'],
    pages: [{
      id: 'money', label: 'Money', navItem: 'Money',
      changes: ['Your wallet shows balance, next payout, and deferred payout at a glance', 'The Payouts tab contains the full payout workspace', 'Deferred payout details remain concise until opened'],
      changeTargets: [
        { pageId: 'money', subStateId: 'wallet', sectionId: 'concept-3-wallet' },
        { pageId: 'money', subStateId: 'payouts', sectionId: 'concept-3-payouts' },
        { pageId: 'money', subStateId: 'payouts', sectionId: 'concept-3-deferred-details' },
      ],
      subStates: [{ id: 'wallet', label: 'Your wallet' }, { id: 'payouts', label: 'Payouts' }],
    }],
  },
]

const { sidebarOpen, previewMode, activeConcept, activePages, conceptTabs, flashHotspots, showHotspots } = usePrototypeSidebar(conceptMeta)
watch(activeConcept, (newVal) => { showDroppedModal.value = droppedConcepts.includes(newVal as 3) })

const navItems = ['Home', 'Insights', 'Customer Care', 'Listings', 'Orders', 'Opportunities', 'Money', 'Options', 'Seller Support']
const baseTabs = ['Your wallet', 'Past invoices', 'Goodwill gestures', 'Seller compensation', 'Financial report']
const concept1Tabs = ['Your wallet', 'Daily payouts', ...baseTabs.slice(1)]
const concept2Tabs = ['Your wallet', 'Daily payouts', 'Deferred payouts', ...baseTabs.slice(1)]
const concept3Tabs = ['Your wallet', 'Payouts', ...baseTabs.slice(1)]

function makeNavDotPredicate(conceptIdx: number) {
  return (item: string) => conceptMeta[conceptIdx]?.pages.some(page => page.navItem === item) ?? false
}
function onNavClick(item: string) {
  const page = conceptMeta[activeConcept.value - 1]?.pages.find(candidate => candidate.navItem === item)
  if (page) activePages.value[activeConcept.value - 1] = page.id
}
function setActivePage(id: string) {
  activePages.value[activeConcept.value - 1] = id
}
const activeSubStateId = computed(() => {
  if (activeConcept.value === 1) return 'wallet'
  if (activeConcept.value === 2) {
    const tab = conceptTabs.value[1]
    return tab === 'Deferred payouts' ? 'deferred-payouts' : 'wallet'
  }
  if (activeConcept.value === 3) return conceptTabs.value[2] === 'Payouts' ? 'payouts' : 'wallet'
  return 'wallet'
})
function onSetSubState(pageId: string, subStateId: string) {
  if (pageId !== 'money') return
  if (activeConcept.value === 1) conceptTabs.value[0] = subStateId === 'daily-payouts' ? 'Daily payouts' : 'Your wallet'
  if (activeConcept.value === 2) conceptTabs.value[1] = subStateId === 'daily-payouts' ? 'Daily payouts' : subStateId === 'deferred-payouts' ? 'Deferred payouts' : 'Your wallet'
  if (activeConcept.value === 3) conceptTabs.value[2] = subStateId === 'payouts' ? 'Payouts' : 'Your wallet'
}
function scrollToSection(sectionId: string) {
  nextTick(() => requestAnimationFrame(() => document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })))
}
</script>

<template>
  <div :class="['flex h-screen overflow-hidden font-body', showHotspots ? 'prototype-hotspots' : '']">
    <PrototypeSidebar v-if="!shareMode" title="6-Tier Risk Model" :concepts="conceptMeta" :active-concept="activeConcept" :preview-mode="previewMode" :sidebar-open="sidebarOpen" :active-page-id="activePages[activeConcept - 1]" :active-sub-state-id="activeSubStateId" :dropped-concepts="droppedConcepts" :share-mode="shareMode" @update:active-concept="activeConcept = $event" @update:preview-mode="previewMode = $event" @update:sidebar-open="sidebarOpen = $event" @update:active-page-id="setActivePage" @set-sub-state="onSetSubState" @navigate-to-section="scrollToSection" @reset="() => undefined" />
    <div class="fixed top-4 right-4 z-[60] flex items-center gap-2 rounded-full bg-white border border-bm-border px-3 py-2 shadow-sm"><label for="scenario" class="text-xs font-semibold text-bm-text-mid">Seller state</label><select id="scenario" v-model="scenario" class="bg-transparent text-xs font-semibold text-bm-text-hi outline-none"><option v-for="option in scenarioOptions" :key="option.value" :value="option.value">{{ option.label }}</option></select></div>
    <div class="flex-1 relative overflow-hidden">
      <div class="absolute inset-0 overflow-y-auto bg-bm-surface" @click="flashHotspots">
        <div v-show="activeConcept === 1"><BmShell :nav-items="navItems" :active-nav-item="'Money'" :seller-name="seller.sellerName" page-title="Money" :tabs="concept1Tabs" :active-tab="conceptTabs[0]" :nav-dot-predicate="makeNavDotPredicate(0)" @update:active-tab="conceptTabs[0] = $event" @nav-item-click="onNavClick"><div v-if="conceptTabs[0] === 'Your wallet'" class="mt-6 pb-12"><TierWalletBaseline id="concept-1-wallet-baseline" :seller="seller"><template #deferred><MinimalDeferredCard :seller="seller" :scenario="scenario" /></template></TierWalletBaseline></div><div v-else class="mt-6 pb-12"><DailyPayouts :seller="seller" :scenario="scenario" /></div></BmShell></div>
        <div v-show="activeConcept === 2"><BmShell :nav-items="navItems" :active-nav-item="'Money'" :seller-name="seller.sellerName" page-title="Money" :tabs="concept2Tabs" :active-tab="conceptTabs[1]" :nav-dot-predicate="makeNavDotPredicate(1)" @update:active-tab="conceptTabs[1] = $event" @nav-item-click="onNavClick"><div v-if="conceptTabs[1] === 'Your wallet'" class="mt-6 pb-12"><TierWalletBaseline id="concept-2-wallet-baseline" :seller="seller" /></div><div v-else-if="conceptTabs[1] === 'Daily payouts'" class="mt-6 pb-12"><DailyPayouts :seller="seller" :scenario="scenario" /></div><div v-else class="mt-6 pb-12"><TierFullDashboard id="concept-2-deferred-details" :seller="seller" :scenario="scenario" /></div></BmShell></div>
        <div v-show="activeConcept === 3"><BmShell :nav-items="navItems" :active-nav-item="'Money'" :seller-name="seller.sellerName" page-title="Money" :tabs="concept3Tabs" :active-tab="conceptTabs[2]" :nav-dot-predicate="makeNavDotPredicate(2)" @update:active-tab="conceptTabs[2] = $event" @nav-item-click="onNavClick"><div v-if="conceptTabs[2] === 'Payouts'" class="mt-6 pb-12"><UnifiedPayouts id="concept-3-payouts" :seller="seller" :scenario="scenario" :show-faster-banner="false" :show-deferred-summary="false" /><IntegratedPayoutDetails class="mt-8" :seller="seller" :scenario="scenario" /></div><div v-else class="mt-6 pb-12"><IntegratedWallet :seller="seller" :scenario="scenario" /></div></BmShell></div>
      </div>
      <div v-if="showDroppedModal" class="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4 font-body">
        <div class="relative bg-white rounded-bm-xl shadow-xl w-full max-w-md">
          <div class="p-8 text-center">
            <div class="w-12 h-12 mx-auto mb-5 rounded-full bg-bm-gray-50 flex items-center justify-center"><RevIcon name="IconBlocked" class="h-5 w-5" /></div>
            <p class="text-xs font-semibold tracking-widest text-bm-text-low uppercase mb-2">Concept {{ activeConcept }}</p>
            <h2 class="font-heading-primary font-semibold text-2xl text-bm-text-hi mb-3">Dropped on April 23rd</h2>
            <p class="text-sm text-bm-text-low leading-relaxed mb-8">Kept for reference.</p>
            <button type="button" class="prototype-hotspot w-full bg-bm-text-hi hover:opacity-80 text-white font-semibold rounded-bm px-5 py-3 text-sm transition-opacity" @click="showDroppedModal = false">View it anyway</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
