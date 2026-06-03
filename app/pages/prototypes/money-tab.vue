<script setup lang="ts">
import { getSellerBackFundsData } from '~/utils/mockBackFundsApi'
import { pickRecommendedProvider, REINVESTMENT_FRACTION } from '~/utils/growthSimulator'
import type { PrototypeConcept } from '~/composables/usePrototypeSidebar'

definePageMeta({ layout: false, alias: ['/share/backfunds'] })

const route = useRoute()
const shareMode = computed(() => route.path.startsWith('/share/'))

const sellerData = getSellerBackFundsData('TechRenew-EU-001')
const showBanner = ref(true)
const showNudge = ref(true)
const showNudgePanel = ref(false)

const conceptMeta: readonly PrototypeConcept[] = [
  {
    name: 'Banner',
    prdFeature: 'PRD 1.1 — Eligibility Visibility',
    prdMetric: '100% of eligible sellers see status within 24h. Target: 15 full in-BO applications by EOY 2026.',
    pros: [
      'Home strip is dismissible — one signal per 30-day offer cycle, industry standard (Shopify, Stripe)',
      'Two-surface discovery: ambient awareness (Home) + conversion moment (Money page)',
      'Active state spans both surfaces — BackFunds card on Home, live advance strip on Money',
    ],
    cons: [
      'If seller dismisses Home strip and never visits Money, offer is invisible until next cycle',
      'Active state split across two pages may make a future unified dashboard harder to scope',
    ],
    pages: [
      {
        id: 'home',
        label: 'Home',
        navItem: 'Home',
        changes: [
          'Eligibility strip injected above dashboard stats — dismissible, returns after 30-day cycle',
          '"See how it works" opens Money page → learn more modal',
          'Active state: BackFunds card (2/3 width) below wallet card row; customer reviews shrink to 1/3',
        ],
        subStates: [
          { id: 'home-eligible', label: 'Eligible — banner' },
          { id: 'home-applied', label: 'Applied — status strip' },
          { id: 'home-active', label: 'Active — BackFunds card' },
        ],
      },
      {
        id: 'money',
        label: 'Money',
        navItem: 'Money',
        changes: [
          'Promotional banner above wallet cards — "Apply for BackFunds" and "Model your growth" CTAs inline',
          'D+1 value prop + personalised daily advance inline',
          'After applying: compact under-review strip with 3-stage progress tracker',
          'Active state: green left-border strip — today\'s advance, D+1 badge, fee rate, month-to-date total',
          '"Growth simulator" opens assumptions panel (days to get paid, stock days, sell days, margin)',
        ],
        subStates: [
          { id: 'money-landing', label: 'Landing' },
          { id: 'money-active', label: 'Active — daily advances' },
          { id: 'growth-simulator', label: 'Growth simulator' },
          { id: 'learn-more', label: 'Learn more modal' },
          { id: 'step-1', label: 'Step 1 · Eligibility' },
          { id: 'step-2', label: 'Step 2 · Provider' },
          { id: 'step-3', label: 'Step 3 · Data sharing & submit' },
          { id: 'step-processing', label: 'Application processing' },
        ],
      },
    ],
  },
  {
    name: 'Dedicated Tab',
    prdFeature: 'PRD 2.1 + 2.3 — Self-Onboarding & Dashboard',
    prdMetric: '15 sellers (25%) complete in-BO application by EOY 2026. <10 min median onboarding time. 25%+ of active sellers view dashboard monthly.',
    pros: [
      'Full space for onboarding and active dashboard — no disruption to baseline Money UX',
      'Natural home for all BackFunds states: eligible → active',
      'Wallet promo card provides passive discovery without adding nav clutter',
      'Estimate card leads with business impact (capital freed + revenue/year) — cost shown as secondary detail, not the headline',
    ],
    cons: [
      'Sellers must navigate to the tab — lower passive discovery than a home banner alone',
      'Adds one tab to an already-dense sub-nav',
    ],
    pages: [
      {
        id: 'eligible',
        label: 'Eligible — not applied',
        navItem: 'Money',
        changes: [
          '"Daily payout ●" tab added to Money sub-nav',
          'Wallet page: subtle BackFunds promo card links to Daily payout tab',
          'Hero: D+1, 80% GMV advanced, +33% avg GMV growth',
          'Estimate card: impact numbers (capital freed/year, additional revenue/year) are the hero at text-4xl — daily/monthly advance + fee shown as compact secondary row',
          '"Growth simulator" button opens assumptions panel — terminology aligned with Storfund',
          '"Apply for BackFunds" launches 4-step onboarding',
        ],
        subStates: [
          { id: 'eligible-landing', label: 'Landing page' },
          { id: 'growth-simulator', label: 'Growth simulator' },
          { id: 'step-1', label: 'Step 1 · Eligibility' },
          { id: 'step-2', label: 'Step 2 · Provider' },
          { id: 'step-3', label: 'Step 3 · Data sharing & submit' },
          { id: 'step-processing', label: 'Application processing' },
        ],
      },
      {
        id: 'under-review',
        label: 'Application under review',
        navItem: 'Money',
        changes: [
          '3-stage progress tracker (submitted → Storfund review → activation)',
          '"Get a decision within 1–2 days" — confirmed by Storfund (corrected from 2–3 weeks)',
          'Status updates automatically via Storfund webhook — no manual refresh needed',
          '"No action needed" guidance — Storfund sends email updates at each stage',
        ],
      },
      {
        id: 'application-denied',
        label: 'Application not approved',
        navItem: 'Money',
        changes: [
          'Shown on Daily payout tab when Storfund webhook returns a denial after their identity check',
          'Progress tracker shows denial at Storfund review step — activation not reached',
          'Neutral tone — no specific reason given (standard across industry; Storfund controls this)',
          'Seller account impact clearly stated — payouts unaffected',
          '✏️ Reapply window is a placeholder — confirm timing with Storfund Thursday',
        ],
      },
      {
        id: 'active',
        label: 'Active — daily advances',
        navItem: 'Money',
        changes: [
          'Today\'s advance hero — amount + D+1 confirmation',
          'Stats: advanced this month, fees, total since onboarding',
          'Transaction history: Date | Type | Amount | Fee | Balance',
          'Pause and Stop BackFunds controls · Contact Support',
        ],
      },
    ],
  },
  {
    name: 'Grid Card',
    prdFeature: 'PRD 1.1 + 2.2 — Eligibility & Pricing Calculator',
    prdMetric: 'Adoption 11% → 23% by Q3 2026, 40% by Q4. Pricing calculator demonstrably improves conversion. <10s calculator load time.',
    pros: [
      'Contextual — seen while reviewing real financial data',
      'Inline estimates make value tangible immediately',
      'Scans quickly alongside balance and payout cards',
    ],
    cons: [
      'Grid rebalancing may feel visually disruptive',
      'Limited real estate for trust signals',
      'Harder to adapt to the active seller dashboard state',
    ],
    pages: [
      {
        id: 'money',
        label: 'Money',
        navItem: 'Money',
        changes: [
          'Wallet grid expanded: balance → BackFunds → payouts',
          '"Eligible ✓" badge + ⚡ icon for immediate scannability',
          'Inline estimates: daily advance + monthly fee',
          'CTA directly in card — removes friction',
          'No nav or tab changes required',
        ],
        subStates: [
          { id: 'card-collapsed', label: 'Card — collapsed' },
          { id: 'card-expanded', label: 'Card — expanded' },
          { id: 'learn-more', label: 'Learn more modal' },
          { id: 'step-1', label: 'Step 1 · Eligibility' },
          { id: 'step-2', label: 'Step 2 · Provider' },
          { id: 'step-3', label: 'Step 3 · Data sharing & submit' },
          { id: 'step-processing', label: 'Application processing' },
        ],
      },
    ],
  },
  {
    name: 'Nudge Strip',
    prdFeature: 'PRD 1.1 — Eligibility Visibility (minimum viable)',
    prdMetric: '100% of eligible sellers see eligibility status. Baseline KPI: onboarding without SSM assistance.',
    pros: [
      'Least intrusive — doesn\'t compete with primary financial tasks',
      'Lower banner-fatigue risk vs. a full slab',
      'Dismissal still generates an intent signal',
    ],
    cons: [
      'Lowest visual salience of the four concepts',
      'May not move the needle on the 24h awareness KPI',
      'Minimal space to communicate value or build trust',
    ],
    pages: [
      {
        id: 'money',
        label: 'Money',
        navItem: 'Money',
        changes: [
          'Inline strip above balance / payouts sub-grid',
          'Personalised daily advance amount shown inline',
          '"Learn more →" opens trust panel — estimate, social proof, apply CTA',
          'Dismissible — tracks intent signal · Zero structural nav changes',
        ],
        subStates: [
          { id: 'nudge-visible', label: 'Nudge — visible' },
          { id: 'nudge-dismissed', label: 'Nudge — dismissed' },
          { id: 'learn-more', label: 'Learn more panel' },
          { id: 'step-1', label: 'Step 1 · Eligibility' },
          { id: 'step-2', label: 'Step 2 · Provider' },
          { id: 'step-3', label: 'Step 3 · Data sharing & submit' },
          { id: 'step-processing', label: 'Application processing' },
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
  conceptTabs,
  showHotspots,
  flashHotspots,
} = usePrototypeSidebar(conceptMeta)

// In share mode (e.g. /share/backfunds), land on the realistic seller scenario:
// Concept 2 (Dedicated Tab) → Money page → Daily payout sub-tab → Eligible state.
onMounted(() => {
  if (!shareMode.value) return
  activeConcept.value = 2
  activePages.value[1] = 'eligible'
  conceptTabs.value[1] = 'Payout'
})

const activePageId = computed(() => activePages.value[activeConcept.value - 1] ?? '')

function setActivePageForConcept(conceptIdx: number, pageId: string) {
  activePages.value[conceptIdx] = pageId
}
function setActivePage(id: string) {
  const idx = activeConcept.value - 1
  activePages.value[idx] = id
  if (idx === 1) conceptTabs.value[1] = 'Payout'
  // Close any open overlays when navigating to a new top-level page
  showLearnMoreModal.value = false
  showOnboardingModal.value = false
  showGrowthSimulator.value = false
  showNudgePanel.value = false
  consentChecked.value = false
}

// Close all overlays when switching concepts so state doesn't bleed across
watch(activeConcept, (newVal) => {
  showLearnMoreModal.value = false
  showOnboardingModal.value = false
  showGrowthSimulator.value = false
  showNudgePanel.value = false
  consentChecked.value = false
  c3CardExpanded.value = false
  showDroppedModal.value = (DROPPED_CONCEPTS as readonly number[]).includes(newVal)
})

const currentSubStateId = computed(() => {
  if (activeConcept.value === 1) return c1ActiveSubState.value
  if (activeConcept.value === 2) return c2ActiveSubState.value
  if (activeConcept.value === 3) return c3ActiveSubState.value
  if (activeConcept.value === 4) return c4ActiveSubState.value
  return ''
})

function resetDismissedUi() {
  showBanner.value = true
  showNudge.value = true
  showNudgePanel.value = false
  showLearnMoreModal.value = false
  showOnboardingModal.value = false
  consentChecked.value = false
  c1Applied.value = false
  c3CardExpanded.value = false
}

function scrollToHowItWorks() {
  if (typeof window === 'undefined') return
  window.document.getElementById('daily-payout-how')?.scrollIntoView({ behavior: 'smooth' })
}

const DROPPED_CONCEPTS = [3, 4] as const
const showDroppedModal = ref(false)

// Concept 1 — Learn More modal + onboarding stepper state
const showLearnMoreModal = ref(false)
const showOnboardingModal = ref(false)
const onboardingStep = ref<1 | 2 | 3 | 'processing'>(1)
const consentChecked = ref(false)
const c1Applied = ref(false)
const c1Active = ref(false)
const showGrowthSimulator = ref(false)
const c1ActiveSubState = computed(() => {
  const page = activePages.value[0]
  if (page === 'home') {
    if (c1Active.value) return 'home-active'
    return c1Applied.value ? 'home-applied' : 'home-eligible'
  }
  if (page === 'money') {
    if (c1Active.value) return 'money-active'
    if (showGrowthSimulator.value) return 'growth-simulator'
    if (showLearnMoreModal.value) return 'learn-more'
    if (showOnboardingModal.value) {
      if (onboardingStep.value === 1) return 'step-1'
      if (onboardingStep.value === 2) return 'step-2'
      if (onboardingStep.value === 3) return 'step-3'
      if (onboardingStep.value === 'processing') return 'step-processing'
    }
    return 'money-landing'
  }
  return ''
})

function openLearnMore() {
  showLearnMoreModal.value = true
}
function openOnboarding() {
  showLearnMoreModal.value = false
  showOnboardingModal.value = true
  onboardingStep.value = 1
}
function closeOnboarding() {
  const wasSubmit = onboardingStep.value === 'processing'
  if (wasSubmit) {
    if (activeConcept.value === 1) c1Applied.value = true
    if (activeConcept.value === 2) activePages.value[1] = 'under-review'
  }
  showOnboardingModal.value = false
  onboardingStep.value = 1
  consentChecked.value = false
  if (wasSubmit) nextTick(() => scrollPageToTop())
}

function onC1SubState(_pageId: string, subStateId: string) {
  // Reset all transient UI first
  showLearnMoreModal.value = false
  showOnboardingModal.value = false
  showGrowthSimulator.value = false
  consentChecked.value = false
  c1Applied.value = false
  c1Active.value = false

  switch (subStateId) {
    case 'home-eligible':
      setActivePageForConcept(0, 'home')
      break
    case 'home-applied':
      setActivePageForConcept(0, 'home')
      c1Applied.value = true
      break
    case 'home-active':
      setActivePageForConcept(0, 'home')
      c1Applied.value = true
      c1Active.value = true
      break
    case 'money-active':
      setActivePageForConcept(0, 'money')
      c1Applied.value = true
      c1Active.value = true
      break
    case 'money-landing':
      setActivePageForConcept(0, 'money')
      break
    case 'growth-simulator':
      setActivePageForConcept(0, 'money')
      showGrowthSimulator.value = true
      break
    case 'learn-more':
      setActivePageForConcept(0, 'money')
      showLearnMoreModal.value = true
      break
    case 'step-1':
      setActivePageForConcept(0, 'money')
      showOnboardingModal.value = true
      onboardingStep.value = 1
      break
    case 'step-2':
      setActivePageForConcept(0, 'money')
      showOnboardingModal.value = true
      onboardingStep.value = 2
      break
    case 'step-3':
      setActivePageForConcept(0, 'money')
      showOnboardingModal.value = true
      onboardingStep.value = 3
      break
    case 'step-processing':
      setActivePageForConcept(0, 'money')
      showOnboardingModal.value = true
      onboardingStep.value = 'processing'
      break
  }
}

// Concept 2 sub-state tracking
const c2ActiveSubState = computed(() => {
  if (activePages.value[1] !== 'eligible') return ''
  if (showGrowthSimulator.value) return 'growth-simulator'
  if (showOnboardingModal.value) {
    if (onboardingStep.value === 1) return 'step-1'
    if (onboardingStep.value === 2) return 'step-2'
    if (onboardingStep.value === 3) return 'step-3'
    if (onboardingStep.value === 'processing') return 'step-processing'
  }
  return 'eligible-landing'
})

function onC2SubState(_pageId: string, subStateId: string) {
  showOnboardingModal.value = false
  showGrowthSimulator.value = false
  consentChecked.value = false
  setActivePageForConcept(1, 'eligible')
  conceptTabs.value[1] = 'Payout'
  if (subStateId === 'eligible-landing') return
  if (subStateId === 'growth-simulator') {
    showGrowthSimulator.value = true
    return
  }
  showOnboardingModal.value = true
  onboardingStep.value = ({ 'step-1': 1, 'step-2': 2, 'step-3': 3, 'step-processing': 'processing' } as Record<string, 1|2|3|'processing'>)[subStateId] ?? 1
}

// Concept 3 sub-state tracking
const c3ActiveSubState = computed(() => {
  if (showLearnMoreModal.value) return 'learn-more'
  if (showOnboardingModal.value) {
    if (onboardingStep.value === 1) return 'step-1'
    if (onboardingStep.value === 2) return 'step-2'
    if (onboardingStep.value === 3) return 'step-3'
    if (onboardingStep.value === 'processing') return 'step-processing'
  }
  return c3CardExpanded.value ? 'card-expanded' : 'card-collapsed'
})

function onC3SubState(_pageId: string, subStateId: string) {
  showLearnMoreModal.value = false
  showOnboardingModal.value = false
  consentChecked.value = false
  c3CardExpanded.value = false
  if (subStateId === 'card-expanded') { c3CardExpanded.value = true; return }
  if (subStateId === 'learn-more') { c3CardExpanded.value = true; showLearnMoreModal.value = true; return }
  if (subStateId === 'card-collapsed') return
  showOnboardingModal.value = true
  onboardingStep.value = ({ 'step-1': 1, 'step-2': 2, 'step-3': 3, 'step-processing': 'processing' } as Record<string, 1|2|3|'processing'>)[subStateId] ?? 1
}

// Concept 4 sub-state tracking
const c4ActiveSubState = computed(() => {
  if (showNudgePanel.value) return 'learn-more'
  if (showOnboardingModal.value) {
    if (onboardingStep.value === 1) return 'step-1'
    if (onboardingStep.value === 2) return 'step-2'
    if (onboardingStep.value === 3) return 'step-3'
    if (onboardingStep.value === 'processing') return 'step-processing'
  }
  return showNudge.value ? 'nudge-visible' : 'nudge-dismissed'
})

function onC4SubState(_pageId: string, subStateId: string) {
  showNudgePanel.value = false
  showOnboardingModal.value = false
  consentChecked.value = false
  showNudge.value = true
  if (subStateId === 'nudge-dismissed') { showNudge.value = false; return }
  if (subStateId === 'learn-more') { showNudgePanel.value = true; return }
  if (subStateId === 'nudge-visible') return
  showOnboardingModal.value = true
  onboardingStep.value = ({ 'step-1': 1, 'step-2': 2, 'step-3': 3, 'step-processing': 'processing' } as Record<string, 1|2|3|'processing'>)[subStateId] ?? 1
}

function onSetSubState(pageId: string, subStateId: string) {
  if (activeConcept.value === 1) onC1SubState(pageId, subStateId)
  else if (activeConcept.value === 2) onC2SubState(pageId, subStateId)
  else if (activeConcept.value === 3) onC3SubState(pageId, subStateId)
  else if (activeConcept.value === 4) onC4SubState(pageId, subStateId)
}

// Deep-link via ?s=substate-id&sidebar=closed (used for Figma screen captures)
onMounted(() => {
  if (typeof window === 'undefined') return
  const params = new URLSearchParams(window.location.search)
  const s = params.get('s')
  if (params.get('sidebar') === 'closed') sidebarOpen.value = false
  if (s) nextTick(() => onSetSubState('', s))
})

const estimatedMonthlyCost = computed(() =>
  Math.round(sellerData.estimatedMonthlyAdvance * (sellerData.dailyFee / 100) * 30),
)

// Growth simulator — seller-editable assumptions feed the PRD 8-step engine,
// which evaluates every eligible provider and returns the cheapest.
const simDaysToGetPaid = sellerData.payoutDelayDays
const simStockDays = ref(4)
const simSellDays = ref(5)
const simShipDays = ref(1)
const simMargin = ref(40) // gross margin %
const simInventoryCycle = computed(() => simStockDays.value + simSellDays.value + simShipDays.value)
const simReinvestPct = Math.round(REINVESTMENT_FRACTION * 100)

const recommended = computed(() =>
  pickRecommendedProvider(sellerData.annualRevenue, sellerData.currency, {
    inventoryCycleDays: simInventoryCycle.value,
    grossMargin: simMargin.value / 100,
  }),
)
const simProviderName = computed(() => recommended.value?.provider.name ?? '—')
const simProviderAdvancePct = computed(() => recommended.value ? Math.round(recommended.value.provider.advanceRate * 100) : 0)
const simProviderFeePct = computed(() => recommended.value ? +(recommended.value.provider.feeRate * 100).toFixed(2) : 0)
const simIncrementalProfit = computed(() => recommended.value ? Math.round(recommended.value.sim.incrementalProfit) : 0)
const simRoi = computed(() => recommended.value ? +recommended.value.sim.roi.toFixed(1) : 0)
const simWorkingCapitalFreed = computed(() => recommended.value ? Math.round(recommended.value.sim.workingCapitalFreed) : 0)

// Concept 2 — active dashboard mock advances. Numbers reflect a seller ~1 year
// into BackFunds usage (the prototype lands here after the simulated approval).
const recentAdvancesMature = [
  { date: '28 May 2026', type: 'Advance',    amount: 712,  fee: 5, balance: 712 },
  { date: '27 May 2026', type: 'Repayment',  amount: -704, fee: 0, balance: 0 },
  { date: '26 May 2026', type: 'Advance',    amount: 704,  fee: 5, balance: 0 },
  { date: '23 May 2026', type: 'Advance',    amount: 685,  fee: 5, balance: 0 },
  { date: '22 May 2026', type: 'Advance',    amount: 697,  fee: 5, balance: 0 },
  { date: '21 May 2026', type: 'Advance',    amount: 661,  fee: 4, balance: 0 },
]

// Concept 2 — under-review / active transition
const c2CheckingStatus = ref(false)
// Pause / Stop service controls
const c2Paused = ref(false)
const c2WasStopped = ref(false)
const showPauseConfirm = ref(false)
const showResumeConfirm = ref(false)
const showStopConfirm = ref(false)

function confirmPause() {
  c2Paused.value = true
  showPauseConfirm.value = false
  nextTick(() => scrollPageToTop())
}
function confirmResume() {
  c2Paused.value = false
  showResumeConfirm.value = false
  nextTick(() => scrollPageToTop())
}
function confirmStop() {
  c2Paused.value = false
  c2WasStopped.value = true
  activePages.value[1] = 'eligible'
  showStopConfirm.value = false
  nextTick(() => scrollPageToTop())
}

// Restart the prototype: drop the seller back to the landing screen as if they
// just opened the share URL. Only exposed in shareMode (internal users use the
// sidebar reset).
function restartPrototype() {
  activePages.value[1] = 'eligible'
  conceptTabs.value[1] = 'Payout'
  c2Paused.value = false
  c2WasStopped.value = false
  c2CheckingStatus.value = false
  showOnboardingModal.value = false
  showLearnMoreModal.value = false
  showGrowthSimulator.value = false
  showPauseConfirm.value = false
  showResumeConfirm.value = false
  showStopConfirm.value = false
  onboardingStep.value = 1
  consentChecked.value = false
  pendingAction.value = null
  nextTick(() => scrollPageToTop())
}
// Track per-button "loading" so onboarding step transitions feel real
const pendingAction = ref<'step-1' | 'step-2' | 'step-3' | 'check-status' | null>(null)

// Reset scroll position when transitioning between major page states.
const scrollContainerRef = ref<HTMLElement | null>(null)
function scrollPageToTop() {
  scrollContainerRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}

function advanceWithDelay(key: typeof pendingAction.value, action: () => void, ms = 700) {
  if (pendingAction.value) return
  pendingAction.value = key
  setTimeout(() => {
    action()
    pendingAction.value = null
  }, ms)
}

// Prototype-only shortcut: in production, status updates automatically via webhook.
// For the user test we need an explicit trigger that completes within a single session.
function simulateApproval() {
  if (c2CheckingStatus.value) return
  c2CheckingStatus.value = true
  setTimeout(() => {
    activePages.value[1] = 'active'
    c2WasStopped.value = false
    c2CheckingStatus.value = false
    nextTick(() => scrollPageToTop())
  }, 5000)
}

const recentAdvances = recentAdvancesMature

// Concept 3 — grid card expand/collapse state
const c3CardExpanded = ref(false)

const currentPageMeta = computed(() => {
  const idx = activeConcept.value - 1
  const pageId = activePages.value[idx]
  return conceptMeta[idx]?.pages.find(p => p.id === pageId) ?? conceptMeta[idx]?.pages[0]
})
const activeNavItem = computed(() => currentPageMeta.value?.navItem ?? 'Money')

const navItems = [
  'Home', 'Insights', 'Customer Care', 'Listings', 'Orders',
  'Opportunities', 'Money', 'Options', 'Seller Support',
]
const tabs = [
  'Your wallet', 'Past invoices', 'Goodwill gestures',
  'Seller compensation', 'Financial report',
]

// Concept 2 adds a "Payout" tab as the 3rd entry when the "after" design is active.
const c2Tabs = computed(() =>
  previewMode.value === 'after'
    ? ['Your wallet', 'Past invoices', 'Payout', 'Goodwill gestures', 'Seller compensation', 'Financial report']
    : tabs,
)

function makeNavDotPredicate(conceptIdx: number) {
  return (item: string) => conceptMeta[conceptIdx]?.pages.some(p => p.navItem === item) ?? false
}

function onConcept1NavClick(item: string) {
  if (item === 'Home') setActivePageForConcept(0, 'home')
  else if (item === 'Money') setActivePageForConcept(0, 'money')
}

const payoutCollection = [
  { id: '1', payoutDate: '22/4/2026', salesPeriod: '8/4/2026 – 15/4/2026', amount: '-€1,837.87' },
  { id: '2', payoutDate: '29/4/2026', salesPeriod: '15/4/2026 – 22/4/2026', amount: '-€75.00' },
]
const payoutColumns = [
  { key: 'payoutDate', label: 'Payout date' },
  { key: 'salesPeriod', label: 'Sales period' },
  { key: 'amount', label: 'Amount in €', align: 'end' },
]

const invoiceCollection = [
  { id: '1', invoice: 'EU-2026-0415', period: '2 Apr – 9 Apr 2026',   issued: '16 Apr 2026', amount: '€11,240.00', status: 'Paid' },
  { id: '2', invoice: 'EU-2026-0408', period: '26 Mar – 2 Apr 2026',  issued: '9 Apr 2026',  amount: '€13,890.50', status: 'Paid' },
  { id: '3', invoice: 'EU-2026-0401', period: '19 Mar – 26 Mar 2026', issued: '2 Apr 2026',  amount: '€10,550.00', status: 'Paid' },
  { id: '4', invoice: 'EU-2026-0325', period: '12 Mar – 19 Mar 2026', issued: '26 Mar 2026', amount: '€9,100.00',  status: 'Paid' },
]
const invoiceColumns = [
  { key: 'invoice', label: 'Invoice #' },
  { key: 'period',  label: 'Period' },
  { key: 'issued',  label: 'Issued' },
  { key: 'amount',  label: 'Amount (EUR)', align: 'end' },
  { key: 'status',  label: 'Status' },
]
</script>

<template>
  <div :class="['flex h-screen overflow-hidden font-body', showHotspots ? 'prototype-hotspots' : '']">

    <PrototypeSidebar
      v-if="!shareMode"
      title="BackFunds"
      :concepts="conceptMeta"
      :active-concept="activeConcept"
      :preview-mode="previewMode"
      :sidebar-open="sidebarOpen"
      :active-page-id="activePageId"
      :active-sub-state-id="currentSubStateId"
      :dropped-concepts="DROPPED_CONCEPTS"
      :share-mode="shareMode"
      @update:active-concept="activeConcept = $event"
      @update:preview-mode="previewMode = $event"
      @update:sidebar-open="sidebarOpen = $event"
      @update:active-page-id="setActivePage"
      @set-sub-state="onSetSubState"
      @reset="resetDismissedUi"
    />

    <div class="flex-1 relative overflow-hidden">
    <!-- Floating prototype-reset pill (share mode only — internal users have the sidebar reset). -->
    <button
      v-if="shareMode"
      type="button"
      class="absolute top-4 right-4 z-40 inline-flex items-center gap-2 bg-[#0F1117] text-white text-xs font-semibold rounded-full pl-2.5 pr-3.5 py-1.5 shadow-lg hover:bg-gray-800 transition-colors"
      @click="restartPrototype"
    >
      <span class="bg-amber-300 text-[#0F1117] text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded">Test</span>
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><path d="M4 4v6h6M20 20v-6h-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /><path d="M20 10A8 8 0 005.6 5.6M4 14a8 8 0 0014.4 4.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
      Restart prototype
    </button>
    <div ref="scrollContainerRef" class="absolute inset-0 overflow-y-auto bg-gray-50" @click="flashHotspots">

      <!-- ═════════ CONCEPT 1 ═════════ -->
      <div v-show="activeConcept === 1">

        <!-- ── Home page ── -->
        <BmShell
          v-if="activePages[0] === 'home'"
          :nav-items="navItems"
          :active-nav-item="activeNavItem"
          :seller-name="sellerData.sellerName"
          :nav-dot-predicate="makeNavDotPredicate(0)"
          @nav-item-click="onConcept1NavClick"
        >
          <template #custom>
            <div class="px-8 pb-12 font-body">
              <h1 class="text-3xl font-bold text-gray-900 mt-6 mb-6">Hello {{ sellerData.sellerName }}!</h1>

              <div
                v-if="previewMode === 'after' && !c1Applied && !c1Active && showBanner"
                class="bg-green-50 border border-green-200 rounded-xl px-6 py-4 mb-6 flex items-center justify-between"
              >
                <div class="flex items-center gap-4">
                  <div class="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-green-700" viewBox="0 0 24 24"><path d="M16.75 10.31V12a.75.75 0 0 0 1.5 0V9A1.25 1.25 0 0 0 17 7.75h-3a.75.75 0 0 0 0 1.5h1.69l-3.19 3.19-1.616-1.617a1.25 1.25 0 0 0-1.768 0L5.97 13.97a.75.75 0 1 0 1.06 1.06L10 12.06l1.616 1.617a1.249 1.249 0 0 0 1.767 0l3.367-3.366" fill="currentColor"/><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12M12 3.75a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5" clip-rule="evenodd" fill="currentColor"/></svg>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-900">{{ sellerData.sellerName }} qualifies for BackFunds — €{{ Math.round(sellerData.estimatedMonthlyAdvance / 30).toLocaleString() }}/day available</p>
                    <p class="text-xs text-gray-500 mt-0.5">Get paid D+1 instead of D+7 — no upfront cost.</p>
                  </div>
                </div>
                <div class="flex items-center gap-4 flex-shrink-0 ml-6">
                  <button
                    class="prototype-hotspot text-sm text-[#0F1117] underline underline-offset-2 hover:opacity-60 whitespace-nowrap transition-opacity"
                    @click="setActivePageForConcept(0, 'money'); openLearnMore()"
                  >
                    See how it works
                  </button>
                  <button
                    class="prototype-hotspot text-gray-400 hover:text-gray-600 transition-colors p-1"
                    aria-label="Dismiss"
                    @click="showBanner = false"
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M3.47 3.47a.75.75 0 0 1 1.06 0L12 10.94l7.47-7.47a.75.75 0 1 1 1.06 1.06L13.06 12l7.47 7.47a.75.75 0 1 1-1.06 1.06L12 13.06l-7.47 7.47a.75.75 0 0 1-1.06-1.06L10.94 12 3.47 4.53a.75.75 0 0 1 0-1.06" clip-rule="evenodd" fill="currentColor"/></svg>
                  </button>
                </div>
              </div>

              <div
                v-else-if="previewMode === 'after' && c1Applied && !c1Active"
                class="bg-white border border-gray-200 border-l-4 border-l-amber-400 rounded-xl px-6 py-4 mb-6 flex items-center justify-between"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-amber-600" viewBox="0 0 24 24"><path d="M12.75 6.5a.75.75 0 0 0-1.5 0v5.293a1.25 1.25 0 0 0 .366.884l2.354 2.353a.75.75 0 1 0 1.06-1.06l-2.28-2.28V6.5" fill="currentColor"/><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25M3.75 12a8.25 8.25 0 1 1 16.5 0 8.25 8.25 0 1 1-16.5 0" clip-rule="evenodd" fill="currentColor"/></svg>
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-[#0F1117]">BackFunds — Application under review</p>
                    <p class="text-xs text-[#5C5E63] mt-0.5">Submitted 22 Apr 2026 · Storfund is reviewing your details · decision in 1–2 days</p>
                  </div>
                </div>
                <div class="flex items-center gap-2.5 flex-shrink-0 ml-6">
                  <span class="flex items-center gap-1.5 text-xs text-[#5C5E63]"><span class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>Submitted</span>
                  <span class="text-gray-300">·</span>
                  <span class="flex items-center gap-1.5 text-xs text-amber-600 font-medium"><span class="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span>In review</span>
                  <span class="text-gray-300">·</span>
                  <span class="flex items-center gap-1.5 text-xs text-[#5C5E63]"><span class="w-2 h-2 rounded-full bg-gray-200 flex-shrink-0"></span>Activation</span>
                </div>
              </div>

              <div class="grid grid-cols-4 gap-6 mb-6">
                <div class="col-span-1 bg-white rounded-xl border border-gray-200 p-5">
                  <div class="flex items-center gap-2">
                    <svg class="w-4 h-4 text-gray-700" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M4.25 5A1.25 1.25 0 0 1 5.5 3.75h2A1.25 1.25 0 0 1 8.75 5v2A1.25 1.25 0 0 1 7.5 8.25h-2A1.25 1.25 0 0 1 4.25 7V5m1.5.25v1.5h1.5v-1.5h-1.5M4.25 11A1.25 1.25 0 0 1 5.5 9.75h2A1.25 1.25 0 0 1 8.75 11v2a1.25 1.25 0 0 1-1.25 1.25h-2A1.25 1.25 0 0 1 4.25 13v-2m1.5.25v1.5h1.5v-1.5h-1.5M4.25 17a1.25 1.25 0 0 1 1.25-1.25h2A1.25 1.25 0 0 1 8.75 17v2a1.25 1.25 0 0 1-1.25 1.25h-2A1.25 1.25 0 0 1 4.25 19v-2m1.5.25v1.5h1.5v-1.5h-1.5M10.25 6A.75.75 0 0 1 11 5.25h8a.75.75 0 0 1 0 1.5h-8A.75.75 0 0 1 10.25 6m0 12A.75.75 0 0 1 11 17.25h8a.75.75 0 0 1 0 1.5h-8A.75.75 0 0 1 10.25 18m0-6A.75.75 0 0 1 11 11.25h8a.75.75 0 0 1 0 1.5h-8A.75.75 0 0 1 10.25 12" clip-rule="evenodd" fill="currentColor"/></svg>
                    <span class="text-sm font-semibold text-gray-900">Task list</span>
                  </div>
                  <div class="flex items-center gap-2 mt-1 mb-4">
                    <svg class="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M8.25 4a.75.75 0 0 0-1.5 0v1.25H4.5A2.25 2.25 0 0 0 2.25 7.5v11a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25v-11a2.25 2.25 0 0 0-2.25-2.25h-2.25V4a.75.75 0 0 0-1.5 0v1.25h-7.5V4m12 5.75V7.5a.75.75 0 0 0-.75-.75h-2.25V8a.75.75 0 0 1-1.5 0V6.75h-7.5V8a.75.75 0 0 1-1.5 0V6.75H4.5A.75.75 0 0 0 3.75 7.5v2.25h16.5m-16.5 1.5h16.5v7.25a.75.75 0 0 1-.75.75h-15a.75.75 0 0 1-.75-.75v-7.25" clip-rule="evenodd" fill="currentColor"/></svg>
                    <span class="text-xs text-gray-500">Monday, 20 April 2026</span>
                  </div>
                  <a href="#" class="flex items-center justify-between py-2 text-sm text-gray-900 hover:text-gray-600 border-t border-gray-100">
                    <span>You have <span class="font-semibold">196</span> orders to process</span>
                    <span class="text-gray-400">›</span>
                  </a>
                  <a href="#" class="flex items-center justify-between py-2 text-sm text-gray-900 hover:text-gray-600 border-t border-gray-100">
                    <span>You have <span class="font-semibold">141</span> customer care task(s) to complete.</span>
                    <span class="text-gray-400">›</span>
                  </a>
                </div>

                <div class="col-span-3 bg-white rounded-xl border border-gray-200 p-5">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-gray-700" viewBox="0 0 24 24"><path d="M10.5 6.125a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-9M6 9.625a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5H6m-1.5 7.25a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15m11.5-5.25a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-2" fill="currentColor"/></svg>
                      <span class="text-sm font-semibold text-gray-900">Sale insights</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <button class="border border-gray-200 rounded-md text-xs px-3 py-1 text-gray-700 hover:bg-gray-50 flex items-center gap-1">Last 7 days <span class="text-gray-400">▾</span></button>
                      <button class="border border-gray-200 rounded-md text-xs px-3 py-1 text-gray-700 hover:bg-gray-50">View details</button>
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-4">
                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                      <p class="text-xs text-gray-500 mb-3">Orders received</p>
                      <div class="flex items-baseline justify-between mb-2">
                        <div class="flex items-baseline gap-2">
                          <span class="text-2xl font-bold text-gray-900">845</span>
                          <span class="text-xs text-red-500 font-medium">↓ -27%</span>
                        </div>
                        <span class="text-xs text-gray-400">Apr 13 – 19, '26</span>
                      </div>
                      <div class="flex items-baseline justify-between mb-2">
                        <span class="text-sm text-gray-700">1163</span>
                        <span class="text-xs text-gray-400">Apr 6 – 12, '26</span>
                      </div>
                      <div class="flex items-baseline justify-between">
                        <div class="flex items-baseline gap-2">
                          <span class="text-sm text-gray-700">1291</span>
                          <span class="text-xs text-red-500 font-medium">↓ -35%</span>
                        </div>
                        <span class="text-xs text-gray-400">Apr 13 – 19, '25</span>
                      </div>
                    </div>

                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                      <p class="text-xs text-gray-500 mb-3">Sales revenue from shipped orders (shipping incl.)</p>
                      <div class="flex items-baseline justify-between mb-2">
                        <div class="flex items-baseline gap-2">
                          <span class="text-base font-bold text-gray-900">€289,601.55</span>
                          <span class="text-xs text-red-500 font-medium">↓ -25.17%</span>
                        </div>
                        <span class="text-xs text-gray-400">Apr 13 – 19, '26</span>
                      </div>
                      <div class="flex items-baseline justify-between mb-2">
                        <span class="text-sm text-gray-700">€387,001.76</span>
                        <span class="text-xs text-gray-400">Apr 6 – 12, '26</span>
                      </div>
                      <div class="flex items-baseline justify-between">
                        <div class="flex items-baseline gap-2">
                          <span class="text-sm text-gray-700">€474,142.38</span>
                          <span class="text-xs text-red-500 font-medium">↓ -38.92%</span>
                        </div>
                        <span class="text-xs text-gray-400">Apr 13 – 19, '25</span>
                      </div>
                    </div>

                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                      <p class="text-xs text-gray-500 mb-3">Total refunds (shipping incl.)</p>
                      <div class="flex items-baseline justify-between mb-2">
                        <div class="flex items-baseline gap-2">
                          <span class="text-base font-bold text-gray-900">€5,430.22</span>
                          <span class="text-xs text-red-500 font-medium">↓ -61.31%</span>
                        </div>
                        <span class="text-xs text-gray-400">Apr 13 – 19, '26</span>
                      </div>
                      <div class="flex items-baseline justify-between mb-2">
                        <span class="text-sm text-gray-700">€14,036.00</span>
                        <span class="text-xs text-gray-400">Apr 6 – 12, '26</span>
                      </div>
                      <div class="flex items-baseline justify-between">
                        <div class="flex items-baseline gap-2">
                          <span class="text-sm text-gray-700">€54,867.35</span>
                          <span class="text-xs text-red-500 font-medium">↓ -90.1%</span>
                        </div>
                        <span class="text-xs text-gray-400">Apr 13 – 19, '25</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-4 gap-6 mb-6">
                <div class="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-gray-700" viewBox="0 0 24 24"><path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75a.75.75 0 0 0-1.5 0 8.25 8.25 0 1 1-16.5 0 8.25 8.25 0 0 1 14.124-5.794l.042.044H16a.75.75 0 0 0 0 1.5h3a1.25 1.25 0 0 0 1.25-1.25V3a.75.75 0 0 0-1.5 0v1.964A9.72 9.72 0 0 0 12 2.25" fill="currentColor"/></svg>
                      <span class="text-sm font-semibold text-gray-900">Trade In</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span class="text-xs text-gray-500">Last 7 days</span>
                      <button class="border border-gray-200 rounded-md text-xs px-3 py-1 text-gray-700 hover:bg-gray-50">View details</button>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                      <p class="text-xs text-gray-500 mb-3">Orders received</p>
                      <div class="flex items-baseline justify-between mb-2">
                        <span class="text-2xl font-bold text-gray-900">1158</span>
                        <span class="text-xs text-gray-500">shipped</span>
                      </div>
                      <div class="flex items-baseline justify-between">
                        <span class="text-sm text-gray-700">771</span>
                        <span class="text-xs text-gray-500">delivered</span>
                      </div>
                    </div>
                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                      <p class="text-xs text-gray-500 mb-3">Orders that require action</p>
                      <div class="flex items-baseline justify-between mb-2">
                        <span class="text-2xl font-bold text-gray-900">610</span>
                        <span class="text-xs text-gray-500">to process</span>
                      </div>
                      <div class="flex items-baseline justify-between">
                        <span class="text-sm text-gray-700">413</span>
                        <span class="text-xs text-gray-500">to reply to</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
                  <div class="flex items-center gap-2 mb-4">
                    <svg class="w-4 h-4 text-gray-700" viewBox="0 0 24 24"><path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75a.75.75 0 0 0-1.5 0 8.25 8.25 0 1 1-16.5 0 8.25 8.25 0 0 1 14.124-5.794l.042.044H16a.75.75 0 0 0 0 1.5h3a1.25 1.25 0 0 0 1.25-1.25V3a.75.75 0 0 0-1.5 0v1.964A9.72 9.72 0 0 0 12 2.25" fill="currentColor"/></svg>
                    <span class="text-sm font-semibold text-gray-900">Opportunities</span>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-semibold text-gray-700">Sales</span>
                        <button class="border border-gray-200 rounded-md text-xs px-2.5 py-1 text-gray-700 hover:bg-gray-50">View details</button>
                      </div>
                      <div class="space-y-2">
                        <div class="bg-white rounded-lg border border-gray-200 p-3">
                          <a href="#" class="inline-block bg-blue-50 rounded px-2 py-0.5 text-xs text-blue-600 font-medium mb-1">924 quick wins</a>
                          <p class="text-xs text-gray-500">Listings ready to convert with a small nudge.</p>
                        </div>
                        <div class="bg-white rounded-lg border border-gray-200 p-3">
                          <a href="#" class="inline-block bg-blue-50 rounded px-2 py-0.5 text-xs text-blue-600 font-medium mb-1">64 listings in trouble</a>
                          <p class="text-xs text-gray-500">Fix issues to restore visibility.</p>
                        </div>
                        <div class="bg-white rounded-lg border border-gray-200 p-3">
                          <a href="#" class="inline-block bg-blue-50 rounded px-2 py-0.5 text-xs text-blue-600 font-medium mb-1">250 BackBoxes to boost</a>
                          <p class="text-xs text-gray-500">Increase exposure on high-potential BackBoxes.</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <span class="text-xs font-semibold text-gray-700">Trade-in</span>
                        <button class="border border-gray-200 rounded-md text-xs px-2.5 py-1 text-gray-700 hover:bg-gray-50">View details</button>
                      </div>
                      <div class="bg-white rounded-lg border border-gray-200 p-3">
                        <a href="#" class="inline-block bg-blue-50 rounded px-2 py-0.5 text-xs text-blue-600 font-medium mb-1">1955 sourcing opportunities</a>
                        <p class="text-xs text-gray-500">Devices available to source from Back Market customers.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-4 gap-6 mb-6">
                <div class="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
                  <div class="flex items-center gap-2 mb-4">
                    <svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24"><path d="M7 6.25a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5H7M6.25 10A.75.75 0 0 1 7 9.25h10a.75.75 0 0 1 0 1.5H7A.75.75 0 0 1 6.25 10M7 12.25a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5H7" fill="currentColor"/><path fill-rule="evenodd" d="M21.75 14.5v-9a3.25 3.25 0 0 0-3.25-3.25h-13A3.25 3.25 0 0 0 2.25 5.5v9a3.25 3.25 0 0 0 3.25 3.25h.75V21a.75.75 0 0 0 1.219.586l4.794-3.836H18.5a3.25 3.25 0 0 0 3.25-3.25m-1.5 0a1.75 1.75 0 0 1-1.75 1.75h-6.325a1.25 1.25 0 0 0-.78.274L7.75 19.439V17.5a1.25 1.25 0 0 0-1.25-1.25h-1a1.75 1.75 0 0 1-1.75-1.75v-9A1.75 1.75 0 0 1 5.5 3.75h13a1.75 1.75 0 0 1 1.75 1.75v9" clip-rule="evenodd" fill="currentColor"/></svg>
                    <span class="text-xs text-gray-500">Share your feedback</span>
                  </div>
                  <h2 class="text-xl font-bold text-gray-900 mb-2">How do you like the Back Office?</h2>
                  <p class="text-sm text-gray-600 mb-5">Help us improve your workspace. Take a minute to tell us what you think.</p>
                  <button class="bg-gray-900 text-white rounded px-4 py-2 text-sm font-medium hover:bg-gray-800">Give feedback</button>
                </div>

                <div class="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-gray-700" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M8.75 10.5a3.25 3.25 0 1 1 6.5 0 3.25 3.25 0 0 1-6.5 0M12 8.75a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5" clip-rule="evenodd" fill="currentColor"/><path fill-rule="evenodd" d="M21.75 5.5a1.25 1.25 0 0 0-1.25-1.25h-17A1.25 1.25 0 0 0 2.25 5.5v10a1.25 1.25 0 0 0 1.25 1.25h17a1.25 1.25 0 0 0 1.25-1.25v-10m-4.17.25H6.42a3.505 3.505 0 0 1-2.67 2.67v4.16a3.505 3.505 0 0 1 2.67 2.67h11.16a3.505 3.505 0 0 1 2.67-2.67V8.42a3.505 3.505 0 0 1-2.67-2.67" clip-rule="evenodd" fill="currentColor"/><path d="M5 18.25a.75.75 0 0 0 0 1.5h14a.75.75 0 0 0 0-1.5H5" fill="currentColor"/></svg>
                      <span class="text-sm font-semibold text-gray-900">Wallet</span>
                    </div>
                    <div class="flex items-center gap-2">
                      <button class="border border-gray-200 rounded-md text-xs px-3 py-1 text-gray-700 hover:bg-gray-50 flex items-center gap-1">EUR <span class="text-gray-400">▾</span></button>
                      <button class="border border-gray-200 rounded-md text-xs px-3 py-1 text-gray-700 hover:bg-gray-50">View details</button>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                      <p class="text-xs text-gray-500 mb-2">Total amount</p>
                      <p class="text-2xl font-bold text-gray-900">€13,227.85</p>
                    </div>
                    <div class="bg-white rounded-lg border border-gray-200 p-4">
                      <p class="text-sm font-semibold text-gray-900">Next payout: 22/04/2026</p>
                      <p class="text-xs text-gray-500 mt-0.5 mb-2">Sales period: 08/04/2026-15/04/2026</p>
                      <p class="text-xl font-bold text-green-600">€13,227.85</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-6 mb-6">
                <!-- BackFunds active card — 2/3 width, shown once seller is enrolled -->
                <div
                  v-if="previewMode === 'after' && c1Active"
                  class="col-span-2 bg-white rounded-xl border border-gray-200 p-5"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <svg class="w-5 h-5 text-green-700" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12.009 2.482c.79-1.097 2.516-.335 2.237.988l-1.322 6.28h5.1a1.25 1.25 0 0 1 1.014 1.98l-7.047 9.788c-.79 1.097-2.516.334-2.238-.988l1.323-6.28h-5.1a1.25 1.25 0 0 1-1.014-1.98l7.047-9.788m.526 1.836-6.07 8.432H12a.75.75 0 0 1 .734.905l-1.269 6.027 6.07-8.432H12a.75.75 0 0 1-.734-.905l1.269-6.027" clip-rule="evenodd" fill="currentColor"/></svg>
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <p class="text-sm font-semibold text-[#0F1117]">BackFunds · Daily payout</p>
                          <span class="flex items-center gap-1 text-xs font-medium text-green-700"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>Active</span>
                        </div>
                        <p class="text-xs text-[#5C5E63]">Powered by Storfund · Daily advances running</p>
                      </div>
                    </div>
                    <a href="#" class="prototype-hotspot text-sm font-semibold text-[#0F1117] underline hover:opacity-60 transition-opacity">Manage on Storfund →</a>
                  </div>
                  <div class="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <p class="text-xs text-[#5C5E63] mb-1">Today's advance</p>
                      <p class="text-2xl font-bold text-green-700">€{{ Math.round(sellerData.estimatedMonthlyAdvance / 30).toLocaleString() }}</p>
                      <p class="text-xs text-[#5C5E63] mt-0.5">Landing tomorrow · D+1</p>
                    </div>
                    <div class="border-l border-gray-100 pl-4">
                      <p class="text-xs text-[#5C5E63] mb-1">Advanced this month</p>
                      <p class="text-2xl font-bold text-[#0F1117]">€{{ (Math.round(sellerData.estimatedMonthlyAdvance / 30) * 17).toLocaleString() }}</p>
                      <p class="text-xs text-[#5C5E63] mt-0.5">17 advances in April</p>
                    </div>
                    <div class="border-l border-gray-100 pl-4">
                      <p class="text-xs text-[#5C5E63] mb-1">Fees this month</p>
                      <p class="text-2xl font-bold text-[#0F1117]">€{{ Math.round(estimatedMonthlyCost * 0.55).toLocaleString() }}</p>
                      <p class="text-xs text-[#5C5E63] mt-0.5">{{ sellerData.dailyFee }}% daily on outstanding</p>
                    </div>
                    <div class="border-l border-gray-100 pl-4">
                      <p class="text-xs text-[#5C5E63] mb-1">Advance rate</p>
                      <p class="text-2xl font-bold text-[#0F1117]">{{ sellerData.advanceRate }}%</p>
                      <p class="text-xs text-[#5C5E63] mt-0.5">of shipped GMV</p>
                    </div>
                  </div>
                </div>

                <!-- Customer reviews — 1/3 when BackFunds active, full width otherwise -->
                <div
                  :class="previewMode === 'after' && c1Active ? 'col-span-1' : 'col-span-3'"
                  class="bg-white rounded-xl border border-gray-200 p-5"
                >
                  <div class="flex items-center gap-2 mb-3">
                    <svg class="w-4 h-4 text-gray-500" viewBox="0 0 24 24"><path d="M13.154 3.65c-.427-1.026-1.881-1.026-2.308 0L8.838 8.478l-5.21.418C2.519 8.984 2.07 10.367 2.914 11.09l3.97 3.4-1.213 5.085c-.258 1.082.919 1.937 1.868 1.357l4.46-2.724 4.462 2.724c.949.58 2.125-.275 1.867-1.357l-1.212-5.084 3.97-3.4c.844-.724.394-2.107-.714-2.196l-5.21-.418-2.008-4.826" fill="currentColor"/></svg>
                    <span class="text-xs text-gray-500">Customer reviews</span>
                  </div>
                  <div class="flex items-center justify-between flex-wrap gap-3">
                    <div class="flex items-center gap-4">
                      <div class="flex items-center gap-1">
                        <svg v-for="n in 4" :key="`full-${n}`" class="w-5 h-5 text-yellow-400" viewBox="0 0 24 24"><path d="M13.154 3.65c-.427-1.026-1.881-1.026-2.308 0L8.838 8.478l-5.21.418C2.519 8.984 2.07 10.367 2.914 11.09l3.97 3.4-1.213 5.085c-.258 1.082.919 1.937 1.868 1.357l4.46-2.724 4.462 2.724c.949.58 2.125-.275 1.867-1.357l-1.212-5.084 3.97-3.4c.844-.724.394-2.107-.714-2.196l-5.21-.418-2.008-4.826" fill="currentColor"/></svg>
                        <svg class="w-5 h-5 text-gray-300" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M10.846 3.65c.427-1.026 1.881-1.026 2.308 0l2.008 4.827 5.21.418c1.108.089 1.558 1.472.713 2.195l-3.97 3.4 1.213 5.085c.258 1.082-.918 1.937-1.867 1.357L12 18.208l-4.461 2.724c-.949.58-2.126-.275-1.868-1.357l1.213-5.084-3.97-3.4C2.07 10.366 2.52 8.983 3.628 8.894l5.21-.418 2.008-4.826M12 4.783l-1.835 4.412A1.25 1.25 0 0 1 9.11 9.96l-4.763.382 3.63 3.109a1.25 1.25 0 0 1 .402 1.24L7.27 19.338l4.078-2.491a1.25 1.25 0 0 1 1.303 0l4.079 2.49-1.109-4.648a1.25 1.25 0 0 1 .403-1.24l3.63-3.108-4.765-.382a1.25 1.25 0 0 1-1.054-.766L12 4.782" clip-rule="evenodd" fill="currentColor"/></svg>
                      </div>
                      <div>
                        <p class="text-2xl font-bold text-gray-900">4.1/5</p>
                        <p class="text-sm text-gray-500">Last 24 months.</p>
                      </div>
                    </div>
                    <button class="border border-gray-200 rounded px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex-shrink-0">See all reviews</button>
                  </div>
                </div>
              </div>

              <footer class="mt-12 pt-6 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400">
                <span>© 2026 Back Market</span>
                <div class="flex items-center gap-4">
                  <a href="#" class="underline hover:text-gray-600">Terms and Conditions</a>
                  <span>·</span>
                  <a href="#" class="underline hover:text-gray-600">Quality Charter</a>
                  <span>·</span>
                  <a href="#" class="underline hover:text-gray-600">Seller Support Centre</a>
                </div>
              </footer>
            </div>
          </template>
        </BmShell>

        <!-- ── Money page ── -->
        <BmShell
          v-else
          :nav-items="navItems"
          :active-nav-item="activeNavItem"
          :tabs="tabs"
          :active-tab="conceptTabs[0]"
          :seller-name="sellerData.sellerName"
          page-title="Money"
          :nav-dot-predicate="makeNavDotPredicate(0)"
          :tab-dot-predicate="previewMode === 'after' && !c1Applied ? (tab) => tab === 'Your wallet' : undefined"
          @update:active-tab="conceptTabs[0] = $event"
          @nav-item-click="onConcept1NavClick"
        >
          <div v-if="conceptTabs[0] === 'Your wallet'" class="mt-6 pb-12">
            <div
              v-if="!sellerData.storeExists && previewMode === 'after' && !c1Applied && !c1Active"
              class="bg-white rounded-xl border border-gray-200 border-l-4 border-l-green-600 shadow-sm p-8 mb-6"
            >
              <div class="grid grid-cols-5 gap-8 items-center">
                <div class="col-span-3">
                  <p class="text-[11px] font-semibold text-green-700 uppercase tracking-widest mb-4">Payout acceleration · Eligible</p>

                  <div class="flex items-center gap-4 mb-3">
                    <span class="text-5xl font-bold text-[#0F1117] leading-none tracking-tight">€{{ Math.round(sellerData.estimatedMonthlyAdvance / 30).toLocaleString() }}<span class="text-2xl font-semibold text-[#5C5E63]">/day</span></span>
                    <span class="bg-green-100 text-green-800 text-xs font-semibold rounded-full px-3 py-1 whitespace-nowrap">D+7 → D+1</span>
                  </div>

                  <p class="text-sm text-[#5C5E63] mb-6 leading-relaxed">Based on your last payout · Apply in minutes · decision in 1–2 days</p>

                  <div class="flex items-center gap-5">
                    <button
                      type="button"
                      class="prototype-hotspot bg-green-900 hover:bg-green-800 text-white font-semibold rounded-bm px-6 py-2.5 text-sm transition-colors shadow-sm"
                      @click="openOnboarding()"
                    >
                      Apply for BackFunds
                    </button>
                    <button
                      type="button"
                      class="prototype-hotspot text-sm font-semibold text-green-700 hover:text-green-800 transition-colors flex items-center gap-1.5"
                      @click="showGrowthSimulator = true"
                    >
                      Model your growth
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24"><path d="M15.573 16.47a.75.75 0 0 0 1.06 1.06l4.647-4.646a1.25 1.25 0 0 0 0-1.768L16.634 6.47a.75.75 0 0 0-1.06 1.06l3.719 3.72H3.103a.75.75 0 0 0 0 1.5h16.19l-3.72 3.72" fill="currentColor"/></svg>
                    </button>
                  </div>
                </div>

                <div class="col-span-2 bg-[#F2F3F7] rounded-xl p-5 flex flex-col gap-3.5">
                  <div class="flex items-start gap-3">
                    <span class="flex items-center justify-center w-5 h-5 rounded-full bg-green-600 flex-shrink-0 mt-0.5">
                      <svg class="w-3 h-3 text-white" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M20.53 6.073a.75.75 0 0 1 0 1.06L9.884 17.78a1.25 1.25 0 0 1-1.768 0L3.47 13.134a.75.75 0 0 1 1.06-1.06L9 16.542l10.47-10.47a.75.75 0 0 1 1.06 0" clip-rule="evenodd" fill="currentColor"/></svg>
                    </span>
                    <span class="text-sm text-[#0F1117] leading-snug"><span class="font-semibold">+33% avg GMV growth</span> for active sellers</span>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="flex items-center justify-center w-5 h-5 rounded-full bg-green-600 flex-shrink-0 mt-0.5">
                      <svg class="w-3 h-3 text-white" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M20.53 6.073a.75.75 0 0 1 0 1.06L9.884 17.78a1.25 1.25 0 0 1-1.768 0L3.47 13.134a.75.75 0 0 1 1.06-1.06L9 16.542l10.47-10.47a.75.75 0 0 1 1.06 0" clip-rule="evenodd" fill="currentColor"/></svg>
                    </span>
                    <span class="text-sm text-[#0F1117] leading-snug"><span class="font-semibold">58+ Back Market sellers</span> already enrolled</span>
                  </div>
                  <div class="flex items-start gap-3">
                    <span class="flex items-center justify-center w-5 h-5 rounded-full bg-green-600 flex-shrink-0 mt-0.5">
                      <svg class="w-3 h-3 text-white" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M20.53 6.073a.75.75 0 0 1 0 1.06L9.884 17.78a1.25 1.25 0 0 1-1.768 0L3.47 13.134a.75.75 0 0 1 1.06-1.06L9 16.542l10.47-10.47a.75.75 0 0 1 1.06 0" clip-rule="evenodd" fill="currentColor"/></svg>
                    </span>
                    <span class="text-sm text-[#0F1117] leading-snug">Est. <span class="font-semibold">€{{ estimatedMonthlyCost.toLocaleString() }}/month</span> · {{ sellerData.dailyFee }}% daily on advances</span>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="!sellerData.storeExists && previewMode === 'after' && c1Applied && !c1Active"
              class="bg-white border border-gray-200 border-l-4 border-l-amber-400 rounded-xl px-6 py-4 mb-6 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-amber-600" viewBox="0 0 24 24"><path d="M12.75 6.5a.75.75 0 0 0-1.5 0v5.293a1.25 1.25 0 0 0 .366.884l2.354 2.353a.75.75 0 1 0 1.06-1.06l-2.28-2.28V6.5" fill="currentColor"/><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25M3.75 12a8.25 8.25 0 1 1 16.5 0 8.25 8.25 0 1 1-16.5 0" clip-rule="evenodd" fill="currentColor"/></svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-[#0F1117]">BackFunds — Application under review</p>
                  <p class="text-xs text-[#5C5E63] mt-0.5">Submitted 22 Apr 2026 · Storfund is reviewing your details · decision in 1–2 days</p>
                </div>
              </div>
              <div class="flex items-center gap-2.5 flex-shrink-0 ml-6">
                <span class="flex items-center gap-1.5 text-xs text-[#5C5E63]"><span class="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>Submitted</span>
                <span class="text-gray-300">·</span>
                <span class="flex items-center gap-1.5 text-xs text-amber-600 font-medium"><span class="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span>In review</span>
                <span class="text-gray-300">·</span>
                <span class="flex items-center gap-1.5 text-xs text-[#5C5E63]"><span class="w-2 h-2 rounded-full bg-gray-200 flex-shrink-0"></span>Activation</span>
              </div>
            </div>

            <!-- BackFunds active strip on Money / Your wallet tab -->
            <div
              v-if="previewMode === 'after' && c1Active"
              class="bg-white border border-gray-200 border-l-4 border-l-green-600 rounded-xl px-6 py-4 mb-6 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-green-700" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12.009 2.482c.79-1.097 2.516-.335 2.237.988l-1.322 6.28h5.1a1.25 1.25 0 0 1 1.014 1.98l-7.047 9.788c-.79 1.097-2.516.334-2.238-.988l1.323-6.28h-5.1a1.25 1.25 0 0 1-1.014-1.98l7.047-9.788m.526 1.836-6.07 8.432H12a.75.75 0 0 1 .734.905l-1.269 6.027 6.07-8.432H12a.75.75 0 0 1-.734-.905l1.269-6.027" clip-rule="evenodd" fill="currentColor"/></svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-[#0F1117]">BackFunds — Daily payout active</p>
                  <p class="text-xs text-[#5C5E63] mt-0.5">Today's advance: €{{ Math.round(sellerData.estimatedMonthlyAdvance / 30).toLocaleString() }} · Landing tomorrow · {{ sellerData.dailyFee }}% daily fee on outstanding</p>
                </div>
              </div>
              <div class="flex items-center gap-6 flex-shrink-0 ml-6">
                <div class="text-right">
                  <p class="text-xs text-[#5C5E63]">Advanced this month</p>
                  <p class="text-sm font-semibold text-[#0F1117]">€{{ (Math.round(sellerData.estimatedMonthlyAdvance / 30) * 17).toLocaleString() }} · 17 advances</p>
                </div>
                <span class="flex items-center gap-1.5 text-xs text-green-700 font-medium"><span class="w-2 h-2 rounded-full bg-green-500"></span>Active</span>
                <a href="#" class="prototype-hotspot text-sm font-semibold text-[#0F1117] underline whitespace-nowrap hover:opacity-60 transition-opacity">Manage on Storfund →</a>
              </div>
            </div>

            <div class="grid grid-cols-4 gap-6">
              <div class="col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 class="text-xl font-bold mb-5">Your wallet</h2>
                <div class="grid grid-cols-3 gap-6">
                  <div class="col-span-1 rounded-bm border border-indigo-100 shadow-sm bg-indigo-50 relative overflow-hidden p-6">
                    <svg class="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-400 opacity-10 pointer-events-none" viewBox="0 0 24 24"><path d="M5.25 15A.75.75 0 0 1 6 14.25h4a.75.75 0 0 1 0 1.5H6A.75.75 0 0 1 5.25 15M13 14.25a.75.75 0 0 0 0 1.5h1a.75.75 0 0 0 0-1.5h-1" fill="currentColor"/><path fill-rule="evenodd" d="M4.5 5.25A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-15M3.75 7.5A.75.75 0 0 1 4.5 6.75h15a.75.75 0 0 1 .75.75v1H3.75v-1m0 4v5a.75.75 0 0 0 .75.75h15a.75.75 0 0 0 .75-.75v-5H3.75" clip-rule="evenodd" fill="currentColor"/></svg>
                    <p class="text-base font-semibold text-gray-900 mb-2">Your wallet balance</p>
                    <p class="text-sm text-gray-500 mb-4">This is the amount you currently have in your Back Market wallet.</p>
                    <div class="flex items-baseline justify-between"><span class="text-sm text-gray-500">€</span><span class="text-lg font-semibold text-gray-900">-1,912.87</span></div>
                  </div>
                  <div class="col-span-2 rounded-bm border border-bm-gray-200 shadow-sm bg-white p-6">
                    <p class="text-base font-semibold text-gray-900 mb-2">Upcoming payouts</p>
                    <p class="text-sm text-gray-500 mb-4">The amount in your wallet will be split between 2 upcoming payouts.</p>
                    <table class="w-full text-sm">
                      <thead><tr class="border-b border-gray-200"><th v-for="col in payoutColumns" :key="col.key" :class="['pb-3 text-xs font-medium text-gray-400 uppercase tracking-wide', col.align === 'end' ? 'text-right' : 'text-left', col.key !== 'amount' ? 'pr-6' : '']">{{ col.label }}</th></tr></thead>
                      <tbody><tr v-for="row in payoutCollection" :key="row.id" class="border-b border-gray-100 last:border-0"><td class="py-3 pr-6 text-gray-700">{{ row.payoutDate }}</td><td class="py-3 pr-6 text-gray-500">{{ row.salesPeriod }}</td><td class="py-3 text-right font-medium text-gray-900">{{ row.amount }}</td></tr></tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div class="col-span-1 relative overflow-hidden rounded-xl bg-[#F2F3F7] shadow-sm p-6 flex flex-col gap-3">
                <svg class="absolute pointer-events-none text-[#ECEEF2] rotate-[10deg]" style="width:160px;height:160px;right:-20px;top:-20px;" viewBox="0 0 24 24"><path d="M12 12.25A.75.75 0 0 1 12.75 13v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 12 12.25" fill="currentColor"/><path fill-rule="evenodd" d="M7.75 8.25V7.2c0-2.243 1.967-3.95 4.25-3.95s4.25 1.707 4.25 3.95v1.05h.25a3.25 3.25 0 0 1 3.25 3.25v6a3.25 3.25 0 0 1-3.25 3.25h-9a3.25 3.25 0 0 1-3.25-3.25v-6A3.25 3.25 0 0 1 7.5 8.25h.25m1.5-1.05c0-1.291 1.166-2.45 2.75-2.45s2.75 1.159 2.75 2.45v1.05h-5.5V7.2m7.25 2.55a1.75 1.75 0 0 1 1.75 1.75v6a1.75 1.75 0 0 1-1.75 1.75h-9a1.75 1.75 0 0 1-1.75-1.75v-6A1.75 1.75 0 0 1 7.5 9.75h9" clip-rule="evenodd" fill="currentColor"/></svg>
                <p class="font-heading-secondary font-semibold text-lg text-[#0F1117] relative z-10">Deferred payout</p>
                <p class="text-sm leading-5 text-[#0F1117] relative z-10">This is the security payment. Or the amount of money Back Market holds for any issues that might happen with your products under warranty. Issues can include repairs, refunds, and more.</p>
                <a href="#" class="text-sm font-semibold underline text-[#0F1117] hover:opacity-60 transition-opacity relative z-10">Read this article for more details</a>
                <p class="text-sm text-gray-400 mt-1 relative z-10">No deferred payout</p>
              </div>
            </div>
          </div>

          <div v-else-if="conceptTabs[0] === 'Past invoices'" class="mt-6 pb-12">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900">Past invoices</h2>
              <button class="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-green-700 transition-colors">Download Financial Report</button>
            </div>
            <div class="bg-white rounded-bm border border-bm-gray-200 shadow-sm overflow-hidden">
              <table class="w-full text-sm">
                <thead class="border-b border-gray-200"><tr><th v-for="col in invoiceColumns" :key="col.key" :class="['px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide bg-gray-50', col.align === 'end' ? 'text-right' : 'text-left']">{{ col.label }}</th></tr></thead>
                <tbody><tr v-for="row in invoiceCollection" :key="row.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"><td class="px-4 py-3 font-mono text-xs text-gray-700">{{ row.invoice }}</td><td class="px-4 py-3 text-gray-600">{{ row.period }}</td><td class="px-4 py-3 text-gray-600">{{ row.issued }}</td><td class="px-4 py-3 text-right font-medium text-gray-900">{{ row.amount }}</td><td class="px-4 py-3"><span class="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">{{ row.status }}</span></td></tr></tbody>
              </table>
            </div>
          </div>

          <div v-else class="mt-6 text-sm text-gray-400 py-8 text-center">{{ conceptTabs[0] }} — coming soon</div>
        </BmShell>

      </div>

      <!-- ═════════ CONCEPT 2 ═════════ -->
      <div v-show="activeConcept === 2">
        <BmShell
          :nav-items="navItems"
          active-nav-item="Money"
          :tabs="c2Tabs"
          :active-tab="conceptTabs[1]"
          :seller-name="sellerData.sellerName"
          page-title="Money"
          :nav-dot-predicate="makeNavDotPredicate(1)"
          :tab-dot-predicate="previewMode === 'after' ? (tab) => tab === 'Payout' : undefined"
          @update:active-tab="conceptTabs[1] = $event"
        >

          <div v-if="conceptTabs[1] === 'Your wallet'" class="mt-6 pb-12">
            <div
              v-if="previewMode === 'after'"
              class="bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-6 flex items-center justify-between"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg class="w-4 h-4 text-green-700" viewBox="0 0 24 24"><path d="M16.75 10.31V12a.75.75 0 0 0 1.5 0V9A1.25 1.25 0 0 0 17 7.75h-3a.75.75 0 0 0 0 1.5h1.69l-3.19 3.19-1.616-1.617a1.25 1.25 0 0 0-1.768 0L5.97 13.97a.75.75 0 1 0 1.06 1.06L10 12.06l1.616 1.617a1.249 1.249 0 0 0 1.767 0l3.367-3.366" fill="currentColor"/><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12M12 3.75a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5" clip-rule="evenodd" fill="currentColor"/></svg>
                </div>
                <div>
                  <p class="text-sm font-semibold text-gray-900">Get paid D+1 — €{{ Math.round(sellerData.estimatedMonthlyAdvance / 30).toLocaleString() }}/day available for {{ sellerData.sellerName }}</p>
                  <p class="text-xs text-gray-500 mt-0.5">BackFunds advances your payouts the next business day. No upfront cost.</p>
                </div>
              </div>
              <button
                class="prototype-hotspot text-sm font-semibold text-green-800 underline underline-offset-2 hover:opacity-70 whitespace-nowrap ml-6 transition-opacity"
                @click="conceptTabs[1] = 'Payout'"
              >
                See BackFunds →
              </button>
            </div>

            <div class="grid grid-cols-4 gap-6">
              <div class="col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 class="text-xl font-bold mb-5">Your wallet</h2>
                <div class="grid grid-cols-3 gap-6">
                  <div class="col-span-1 rounded-bm border border-indigo-100 shadow-sm bg-indigo-50 relative overflow-hidden p-6">
                    <svg class="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-400 opacity-10 pointer-events-none" viewBox="0 0 24 24"><path d="M5.25 15A.75.75 0 0 1 6 14.25h4a.75.75 0 0 1 0 1.5H6A.75.75 0 0 1 5.25 15M13 14.25a.75.75 0 0 0 0 1.5h1a.75.75 0 0 0 0-1.5h-1" fill="currentColor"/><path fill-rule="evenodd" d="M4.5 5.25A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-15M3.75 7.5A.75.75 0 0 1 4.5 6.75h15a.75.75 0 0 1 .75.75v1H3.75v-1m0 4v5a.75.75 0 0 0 .75.75h15a.75.75 0 0 0 .75-.75v-5H3.75" clip-rule="evenodd" fill="currentColor"/></svg>
                    <p class="text-base font-semibold text-gray-900 mb-2">Your wallet balance</p>
                    <p class="text-sm text-gray-500 mb-4">This is the amount you currently have in your Back Market wallet.</p>
                    <div class="flex items-baseline justify-between"><span class="text-sm text-gray-500">€</span><span class="text-lg font-semibold text-gray-900">-1,912.87</span></div>
                  </div>
                  <div class="col-span-2 rounded-bm border border-bm-gray-200 shadow-sm bg-white p-6">
                    <p class="text-base font-semibold text-gray-900 mb-2">Upcoming payouts</p>
                    <p class="text-sm text-gray-500 mb-4">The amount in your wallet will be split between 2 upcoming payouts.</p>
                    <table class="w-full text-sm">
                      <thead><tr class="border-b border-gray-200"><th v-for="col in payoutColumns" :key="col.key" :class="['pb-3 text-xs font-medium text-gray-400 uppercase tracking-wide', col.align === 'end' ? 'text-right' : 'text-left', col.key !== 'amount' ? 'pr-6' : '']">{{ col.label }}</th></tr></thead>
                      <tbody><tr v-for="row in payoutCollection" :key="row.id" class="border-b border-gray-100 last:border-0"><td class="py-3 pr-6 text-gray-700">{{ row.payoutDate }}</td><td class="py-3 pr-6 text-gray-500">{{ row.salesPeriod }}</td><td class="py-3 text-right font-medium text-gray-900">{{ row.amount }}</td></tr></tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div class="col-span-1 relative overflow-hidden rounded-xl bg-[#F2F3F7] shadow-sm p-6 flex flex-col gap-3">
                <svg class="absolute pointer-events-none text-[#ECEEF2] rotate-[10deg]" style="width:160px;height:160px;right:-20px;top:-20px;" viewBox="0 0 24 24"><path d="M12 12.25A.75.75 0 0 1 12.75 13v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 12 12.25" fill="currentColor"/><path fill-rule="evenodd" d="M7.75 8.25V7.2c0-2.243 1.967-3.95 4.25-3.95s4.25 1.707 4.25 3.95v1.05h.25a3.25 3.25 0 0 1 3.25 3.25v6a3.25 3.25 0 0 1-3.25 3.25h-9a3.25 3.25 0 0 1-3.25-3.25v-6A3.25 3.25 0 0 1 7.5 8.25h.25m1.5-1.05c0-1.291 1.166-2.45 2.75-2.45s2.75 1.159 2.75 2.45v1.05h-5.5V7.2m7.25 2.55a1.75 1.75 0 0 1 1.75 1.75v6a1.75 1.75 0 0 1-1.75 1.75h-9a1.75 1.75 0 0 1-1.75-1.75v-6A1.75 1.75 0 0 1 7.5 9.75h9" clip-rule="evenodd" fill="currentColor"/></svg>
                <p class="font-heading-secondary font-semibold text-lg text-[#0F1117] relative z-10">Deferred payout</p>
                <p class="text-sm leading-5 text-[#0F1117] relative z-10">This is the security payment. Or the amount of money Back Market holds for any issues that might happen with your products under warranty. Issues can include repairs, refunds, and more.</p>
                <a href="#" class="text-sm font-semibold underline text-[#0F1117] hover:opacity-60 transition-opacity relative z-10">Read this article for more details</a>
                <p class="text-sm text-gray-400 mt-1 relative z-10">No deferred payout</p>
              </div>
            </div>
          </div>

          <div v-else-if="conceptTabs[1] === 'Past invoices'" class="mt-6 pb-12">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900">Past invoices</h2>
              <button class="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-green-700 transition-colors">Download Financial Report</button>
            </div>
            <div class="bg-white rounded-bm border border-bm-gray-200 shadow-sm overflow-hidden">
              <table class="w-full text-sm">
                <thead class="border-b border-gray-200"><tr><th v-for="col in invoiceColumns" :key="col.key" :class="['px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide bg-gray-50', col.align === 'end' ? 'text-right' : 'text-left']">{{ col.label }}</th></tr></thead>
                <tbody><tr v-for="row in invoiceCollection" :key="row.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"><td class="px-4 py-3 font-mono text-xs text-gray-700">{{ row.invoice }}</td><td class="px-4 py-3 text-gray-600">{{ row.period }}</td><td class="px-4 py-3 text-gray-600">{{ row.issued }}</td><td class="px-4 py-3 text-right font-medium text-gray-900">{{ row.amount }}</td><td class="px-4 py-3"><span class="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">{{ row.status }}</span></td></tr></tbody>
              </table>
            </div>
          </div>

          <div v-else-if="conceptTabs[1] === 'Payout'" class="mt-6 pb-16">

            <!-- ── Under review state ── -->
            <template v-if="activePages[1] === 'under-review'">
              <div class="max-w-2xl mx-auto py-2">
                <div class="flex items-center gap-4 mb-8">
                  <div class="w-11 h-11 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-amber-600" viewBox="0 0 24 24"><path d="M12.75 6.5a.75.75 0 0 0-1.5 0v5.293a1.25 1.25 0 0 0 .366.884l2.354 2.353a.75.75 0 1 0 1.06-1.06l-2.28-2.28V6.5" fill="currentColor"/><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25M3.75 12a8.25 8.25 0 1 1 16.5 0 8.25 8.25 0 1 1-16.5 0" clip-rule="evenodd" fill="currentColor"/></svg>
                  </div>
                  <div>
                    <h2 class="font-heading-primary font-semibold text-2xl text-[#0F1117]">Application under review</h2>
                    <p class="text-sm text-[#5C5E63]">Submitted 18 Apr 2026 · Powered by Storfund</p>
                  </div>
                </div>

                <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
                  <p class="text-sm font-semibold text-[#0F1117] mb-6">Application progress</p>

                  <div class="flex items-start gap-4 mb-1">
                    <div class="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M20.53 6.073a.75.75 0 0 1 0 1.06L9.884 17.78a1.25 1.25 0 0 1-1.768 0L3.47 13.134a.75.75 0 0 1 1.06-1.06L9 16.542l10.47-10.47a.75.75 0 0 1 1.06 0" clip-rule="evenodd" fill="currentColor"/></svg>
                    </div>
                    <div class="flex-1 pb-5 border-b border-gray-100">
                      <div class="flex items-center justify-between">
                        <p class="text-sm font-semibold text-[#0F1117]">Application submitted</p>
                        <span class="text-xs text-green-600 font-medium">Complete</span>
                      </div>
                      <p class="text-xs text-[#5C5E63] mt-0.5">Data consent given · Application sent to Storfund</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-4 mb-1 pt-4">
                    <div class="w-7 h-7 rounded-full bg-amber-50 border-2 border-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div class="w-2 h-2 rounded-full bg-amber-500"></div>
                    </div>
                    <div class="flex-1 pb-5 border-b border-gray-100">
                      <div class="flex items-center justify-between">
                        <p class="text-sm font-semibold text-[#0F1117]">Storfund review</p>
                        <span class="text-xs text-amber-600 font-medium bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">In progress · 1–2 days</span>
                      </div>
                      <p class="text-xs text-[#5C5E63] mt-0.5">Verifying business details and sales history</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-4 pt-4">
                    <div class="w-7 h-7 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div class="w-2 h-2 rounded-full bg-gray-300"></div>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center justify-between">
                        <p class="text-sm font-medium text-[#5C5E63]">Activation</p>
                        <span class="text-xs text-[#5C5E63]">Pending</span>
                      </div>
                      <p class="text-xs text-[#5C5E63] mt-0.5">Account setup and first daily advance</p>
                    </div>
                  </div>

                </div>

                <div class="bg-[#F2F3F7] rounded-2xl p-5 mb-5">
                  <p class="text-sm font-semibold text-[#0F1117] mb-2">What to expect</p>
                  <p class="text-sm text-[#5C5E63] leading-relaxed">Storfund typically responds within 1–2 days. They'll email you at each stage, and your status on this page updates automatically — no need to refresh. Once approved, your daily advances begin immediately.</p>
                </div>

                <!-- Prototype-only affordance: fast-forward through Storfund's review window. -->
                <div class="border-2 border-dashed border-gray-300 rounded-xl p-4 mb-5">
                  <div class="flex items-start gap-3">
                    <span class="bg-amber-100 text-amber-800 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded flex-shrink-0">Just for this test</span>
                    <div class="flex-1">
                      <p class="text-sm text-[#0F1117] font-medium mb-1">Don't want to wait 1–2 days?</p>
                      <p class="text-xs text-[#5C5E63] mb-3">In real life, Storfund would review your application over a couple of days and email you when they're done. For this preview, you can skip the wait and jump straight to what your dashboard looks like once you're approved and using BackFunds.</p>
                      <button
                        type="button"
                        :disabled="c2CheckingStatus"
                        :class="['prototype-hotspot inline-flex items-center gap-2 text-sm font-semibold rounded-bm px-4 py-2 transition-colors border-2 border-dashed', c2CheckingStatus ? 'border-gray-300 bg-white text-[#5C5E63] cursor-wait' : 'border-[#0F1117] bg-white text-[#0F1117] hover:bg-gray-50']"
                        @click="simulateApproval"
                      >
                        <svg v-if="c2CheckingStatus" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.13 5.82 3 7.94l3-2.65z" />
                        </svg>
                        <svg v-else class="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M4 4l8 8-8 8M12 4l8 8-8 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" /></svg>
                        {{ c2CheckingStatus ? 'Approving you now…' : 'Skip ahead to approved' }}
                      </button>
                    </div>
                  </div>
                </div>

                <div class="bg-white rounded-2xl border border-gray-200 p-5">
                  <p class="text-xs font-semibold text-[#5C5E63] uppercase tracking-wide mb-4">Your estimate once approved</p>
                  <div class="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p class="text-2xl font-bold text-[#0F1117]">€{{ Math.round(sellerData.estimatedMonthlyAdvance / 30).toLocaleString() }}</p>
                      <p class="text-xs text-[#5C5E63] mt-1">daily advance</p>
                    </div>
                    <div class="border-x border-gray-100">
                      <p class="text-2xl font-bold text-[#0F1117]">D+1</p>
                      <p class="text-xs text-[#5C5E63] mt-1">payout speed</p>
                    </div>
                    <div>
                      <p class="text-2xl font-bold text-[#0F1117]">€{{ estimatedMonthlyCost.toLocaleString() }}</p>
                      <p class="text-xs text-[#5C5E63] mt-1">monthly fee (est.)</p>
                    </div>
                  </div>
                </div>
              </div>
            </template>

            <!-- ── Application not approved state ── -->
            <template v-else-if="activePages[1] === 'application-denied'">
              <div class="max-w-2xl mx-auto py-2">
                <div class="flex items-center gap-4 mb-8">
                  <div class="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg class="w-5 h-5 text-red-600" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06" clip-rule="evenodd" fill="currentColor"/></svg>
                  </div>
                  <div>
                    <h2 class="font-heading-primary font-semibold text-2xl text-[#0F1117]">Application not approved</h2>
                    <p class="text-sm text-[#5C5E63]">Reviewed 18 Apr 2026 · Powered by Storfund</p>
                  </div>
                </div>

                <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-5">
                  <p class="text-sm font-semibold text-[#0F1117] mb-6">Application progress</p>

                  <div class="flex items-start gap-4 mb-1">
                    <div class="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M20.53 6.073a.75.75 0 0 1 0 1.06L9.884 17.78a1.25 1.25 0 0 1-1.768 0L3.47 13.134a.75.75 0 0 1 1.06-1.06L9 16.542l10.47-10.47a.75.75 0 0 1 1.06 0" clip-rule="evenodd" fill="currentColor"/></svg>
                    </div>
                    <div class="flex-1 pb-5 border-b border-gray-100">
                      <div class="flex items-center justify-between">
                        <p class="text-sm font-semibold text-[#0F1117]">Application submitted</p>
                        <span class="text-xs text-green-600 font-medium">Complete</span>
                      </div>
                      <p class="text-xs text-[#5C5E63] mt-0.5">Data consent given · Application sent to Storfund</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-4 mb-1 pt-4">
                    <div class="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg class="w-3.5 h-3.5 text-red-600" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06" clip-rule="evenodd" fill="currentColor"/></svg>
                    </div>
                    <div class="flex-1 pb-5 border-b border-gray-100">
                      <div class="flex items-center justify-between">
                        <p class="text-sm font-semibold text-[#0F1117]">Storfund review</p>
                        <span class="text-xs text-red-600 font-medium bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">Not approved</span>
                      </div>
                      <p class="text-xs text-[#5C5E63] mt-0.5">Storfund was unable to approve your application at this time</p>
                    </div>
                  </div>

                  <div class="flex items-start gap-4 pt-4">
                    <div class="w-7 h-7 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div class="w-2 h-2 rounded-full bg-gray-300"></div>
                    </div>
                    <div class="flex-1">
                      <div class="flex items-center justify-between">
                        <p class="text-sm font-medium text-[#5C5E63]">Activation</p>
                        <span class="text-xs text-[#5C5E63]">Not reached</span>
                      </div>
                      <p class="text-xs text-[#5C5E63] mt-0.5">Account setup and first daily advance</p>
                    </div>
                  </div>
                </div>

                <div class="bg-[#F2F3F7] rounded-2xl p-5 mb-5">
                  <p class="text-sm font-semibold text-[#0F1117] mb-3">What this means for your account</p>
                  <div class="space-y-2.5">
                    <div class="flex items-start gap-2.5 text-sm text-[#5C5E63]">
                      <svg class="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M20.53 6.073a.75.75 0 0 1 0 1.06L9.884 17.78a1.25 1.25 0 0 1-1.768 0L3.47 13.134a.75.75 0 0 1 1.06-1.06L9 16.542l10.47-10.47a.75.75 0 0 1 1.06 0" clip-rule="evenodd" fill="currentColor"/></svg>
                      <span>Your Back Market seller account and scheduled payouts are not affected</span>
                    </div>
                    <div class="flex items-start gap-2.5 text-sm text-[#5C5E63]">
                      <svg class="w-4 h-4 text-[#5C5E63] flex-shrink-0 mt-0.5" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12m8.706-1.442c.133-.14.29-.252.46-.35a1.75 1.75 0 0 1 2.59 1.531c0 .54-.244 1.022-.625 1.347l-.012.01c-.292.24-.548.506-.548.905v.5a.75.75 0 0 0 1.5 0v-.5c0-.84.494-1.438.916-1.78A3.25 3.25 0 1 0 8.75 12a.75.75 0 0 0 1.5 0c0-.402.12-.776.328-1.087zM12 18.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" clip-rule="evenodd" fill="currentColor"/></svg>
                      <span>Storfund may contact you separately with more details about their decision</span>
                    </div>
                    <div class="flex items-start gap-2.5 text-sm text-[#5C5E63]">
                      <svg class="w-4 h-4 text-[#5C5E63] flex-shrink-0 mt-0.5" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75m13.5 9a1.5 1.5 0 0 0-1.5-1.5H5.25a1.5 1.5 0 0 0-1.5 1.5v7.5a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5z" clip-rule="evenodd" fill="currentColor"/></svg>
                      <span>✏️ You may be eligible to reapply in [X months] — confirm reapplication window with Storfund on Thursday</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    class="prototype-hotspot text-sm font-semibold text-[#0F1117] border border-bm-border rounded-bm px-5 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    Contact support
                  </button>
                  <button
                    type="button"
                    class="prototype-hotspot bg-[#0F1117] text-white text-sm font-semibold rounded-bm px-5 py-2.5 hover:bg-gray-800 transition-colors"
                    @click="setActivePage('eligible')"
                  >
                    Back to your wallet
                  </button>
                </div>
              </div>
            </template>

            <!-- ── Active dashboard state ── -->
            <!-- Lands here after simulated approval. Numbers depict a seller ~1 year into BackFunds. -->
            <template v-else-if="activePages[1] === 'active'">
              <div class="space-y-5">
                <!-- Paused banner -->
                <div v-if="c2Paused" class="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center justify-between gap-4">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <svg class="w-4 h-4 text-amber-700" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5h3v14H8zm5 0h3v14h-3z" /></svg>
                    </div>
                    <div>
                      <p class="text-sm font-semibold text-[#0F1117]">BackFunds is paused</p>
                      <p class="text-xs text-[#5C5E63] mt-0.5">No new daily advances. Your account is otherwise unchanged.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    class="prototype-hotspot text-sm font-semibold text-[#0F1117] underline underline-offset-2 hover:opacity-70 transition-opacity"
                    @click="showResumeConfirm = true"
                  >
                    Resume advances →
                  </button>
                </div>

                <!-- Hero card -->
                <div :class="['rounded-2xl p-8 relative overflow-hidden', c2Paused ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-green-900 to-green-800']">
                  <div class="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/5" />
                  <div class="relative flex items-end justify-between gap-6">
                    <div>
                      <p :class="['text-xs font-semibold tracking-widest uppercase mb-3', c2Paused ? 'text-gray-400' : 'text-green-300']">{{ c2Paused ? 'Daily payout · Paused · Powered by Storfund' : 'Daily payout · Active · Powered by Storfund' }}</p>
                      <p :class="['text-sm mb-1', c2Paused ? 'text-gray-300' : 'text-green-200']">{{ c2Paused ? 'Today\'s advance' : 'Today\'s advance' }}</p>
                      <p class="font-heading-primary font-semibold text-5xl text-white leading-none">{{ c2Paused ? '—' : '€' + Math.round(sellerData.estimatedMonthlyAdvance / 30).toLocaleString() }}</p>
                      <p :class="['text-sm mt-3', c2Paused ? 'text-gray-400' : 'text-green-300']">{{ c2Paused ? 'No new advances while paused' : 'Landing in your account tomorrow · D+1' }}</p>
                    </div>
                    <div class="flex flex-col items-end gap-3 flex-shrink-0">
                      <span v-if="c2Paused" class="bg-amber-400/20 text-amber-200 text-xs font-semibold px-3 py-1 rounded-full border border-amber-400/30">❙❙ Paused</span>
                      <span v-else class="bg-green-400/20 text-green-200 text-xs font-semibold px-3 py-1 rounded-full border border-green-400/30">● Active</span>
                      <p :class="['text-xs text-right', c2Paused ? 'text-gray-400' : 'text-green-400']">{{ sellerData.advanceRate }}% of shipped GMV<br>{{ sellerData.dailyFee }}% daily fee on outstanding</p>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-white rounded-xl border border-gray-200 p-5">
                    <p class="text-xs text-[#5C5E63] uppercase tracking-wide mb-2">Advanced this month</p>
                    <p class="text-2xl font-bold text-[#0F1117]">€18,940</p>
                    <p class="text-xs text-[#5C5E63] mt-1">26 advances in May</p>
                  </div>
                  <div class="bg-white rounded-xl border border-gray-200 p-5">
                    <p class="text-xs text-[#5C5E63] uppercase tracking-wide mb-2">Fees paid this month</p>
                    <p class="text-2xl font-bold text-[#0F1117]">€142</p>
                    <p class="text-xs text-[#5C5E63] mt-1">{{ sellerData.dailyFee }}% daily · outstanding balance</p>
                  </div>
                  <div class="bg-white rounded-xl border border-gray-200 p-5">
                    <p class="text-xs text-[#5C5E63] uppercase tracking-wide mb-2">Total advanced since onboarding</p>
                    <p class="text-2xl font-bold text-[#0F1117]">€245,180</p>
                    <p class="text-xs text-[#5C5E63] mt-1">Since May 2025</p>
                  </div>
                  <div class="bg-white rounded-xl border border-gray-200 p-5">
                    <p class="text-xs text-[#5C5E63] uppercase tracking-wide mb-2">Total fees since onboarding</p>
                    <p class="text-2xl font-bold text-[#0F1117]">€1,720</p>
                    <p class="text-xs text-[#5C5E63] mt-1">{{ sellerData.dailyFee }}% daily on outstanding</p>
                  </div>
                </div>

                <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <p class="font-semibold text-[#0F1117]">Transaction history</p>
                    <button class="prototype-hotspot text-xs text-[#5C5E63] border border-gray-200 rounded-bm px-3 py-1.5 hover:bg-gray-50 transition-colors">Export CSV</button>
                  </div>
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="border-b border-gray-100 bg-gray-50">
                        <th class="text-left px-6 py-3 text-xs font-medium text-[#5C5E63] uppercase tracking-wide">Date</th>
                        <th class="text-left px-6 py-3 text-xs font-medium text-[#5C5E63] uppercase tracking-wide">Type</th>
                        <th class="text-right px-6 py-3 text-xs font-medium text-[#5C5E63] uppercase tracking-wide">Amount</th>
                        <th class="text-right px-6 py-3 text-xs font-medium text-[#5C5E63] uppercase tracking-wide">Fee</th>
                        <th class="text-right px-6 py-3 text-xs font-medium text-[#5C5E63] uppercase tracking-wide">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in recentAdvances" :key="row.date + row.type" class="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td class="px-6 py-3 text-[#5C5E63]">{{ row.date }}</td>
                        <td class="px-6 py-3">
                          <span :class="['text-xs font-medium px-2 py-0.5 rounded-full', row.type === 'Advance' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600']">{{ row.type }}</span>
                        </td>
                        <td :class="['px-6 py-3 text-right font-semibold', row.amount < 0 ? 'text-[#5C5E63]' : 'text-[#0F1117]']">{{ row.amount > 0 ? '€' + row.amount.toLocaleString() : '−€' + Math.abs(row.amount).toLocaleString() }}</td>
                        <td class="px-6 py-3 text-right text-[#5C5E63]">{{ row.fee > 0 ? '€' + row.fee : '—' }}</td>
                        <td class="px-6 py-3 text-right text-[#0F1117]">{{ row.balance > 0 ? '€' + row.balance.toLocaleString() : '€0' }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="bg-[#F2F3F7] rounded-xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <p class="text-sm font-semibold text-[#0F1117] mb-0.5">Manage your BackFunds service</p>
                    <p class="text-xs text-[#5C5E63]">Pausing keeps your account active but stops new advances. Stopping ends BackFunds — you can reapply anytime.</p>
                  </div>
                  <div class="flex gap-2 flex-shrink-0">
                    <button
                      v-if="!c2Paused"
                      class="prototype-hotspot border border-gray-300 bg-white text-sm font-medium text-[#0F1117] px-4 py-2 rounded-bm hover:bg-gray-50 transition-colors"
                      @click="showPauseConfirm = true"
                    >
                      Pause advances
                    </button>
                    <button
                      v-else
                      class="prototype-hotspot border border-gray-300 bg-white text-sm font-medium text-[#0F1117] px-4 py-2 rounded-bm hover:bg-gray-50 transition-colors"
                      @click="showResumeConfirm = true"
                    >
                      Resume advances
                    </button>
                    <button
                      class="prototype-hotspot border border-red-200 bg-white text-sm font-medium text-red-600 px-4 py-2 rounded-bm hover:bg-red-50 transition-colors"
                      @click="showStopConfirm = true"
                    >
                      Stop BackFunds
                    </button>
                    <button class="prototype-hotspot text-sm font-medium text-[#5C5E63] px-4 py-2 rounded-bm hover:text-[#0F1117] transition-colors underline">Contact Support</button>
                  </div>
                </div>

              </div>
            </template>

            <!-- ── Default: eligible, not yet applied ── -->
            <template v-else>
            <div v-if="c2WasStopped" class="bg-gray-100 border border-gray-200 rounded-xl px-5 py-4 mb-6 flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-[#5C5E63]" viewBox="0 0 24 24" fill="none"><path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" /><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" /></svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-[#0F1117]">You stopped BackFunds</p>
                <p class="text-xs text-[#5C5E63] mt-0.5">Daily advances have ended. You can reapply below anytime.</p>
              </div>
            </div>
            <div class="bg-gradient-to-br from-green-900 to-green-800 rounded-2xl p-10 mb-8 relative overflow-hidden">
              <div class="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-white/5" />
              <div class="relative flex gap-10 items-center">
                <div class="flex-1">
                  <p class="text-xs font-semibold tracking-widest text-green-300 uppercase mb-3">Daily payout · Powered by BackFunds</p>
                  <h2 class="font-heading-primary font-semibold text-4xl text-white mb-4 leading-tight">Get paid tomorrow,<br>not next week.</h2>
                  <p class="text-green-200 text-sm mb-8 max-w-sm leading-relaxed">BackFunds advances your Back Market payouts from D+7 to D+1. Reinvest in inventory faster, grow your GMV, and never wait for your money again.</p>
                  <div class="flex items-center">
                    <button
                      type="button"
                      class="prototype-hotspot bg-white text-green-900 font-semibold px-6 py-3 rounded-bm text-sm hover:bg-green-50 transition-colors"
                      @click="openOnboarding"
                    >
                      {{ c2WasStopped ? 'Reapply for BackFunds' : 'Apply for BackFunds' }}
                    </button>
                    <a href="#daily-payout-how" class="prototype-hotspot text-green-300 text-sm underline ml-4 hover:text-white" @click.prevent="scrollToHowItWorks">See how it works →</a>
                  </div>
                </div>
                <div class="flex flex-col gap-3 flex-shrink-0">
                  <div class="bg-white/10 rounded-xl px-6 py-4 text-center min-w-[140px]">
                    <p class="text-3xl font-bold text-white">D+1</p>
                    <p class="text-xs text-green-300 mt-1">payout speed</p>
                  </div>
                  <div class="bg-white/10 rounded-xl px-6 py-4 text-center min-w-[140px]">
                    <p class="text-3xl font-bold text-white">80%</p>
                    <p class="text-xs text-green-300 mt-1">of GMV advanced</p>
                  </div>
                  <div class="bg-white/10 rounded-xl px-6 py-4 text-center min-w-[140px]">
                    <p class="text-3xl font-bold text-white">+33%</p>
                    <p class="text-xs text-green-300 mt-1">avg GMV growth</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-[#F2F3F7] rounded-2xl overflow-hidden mb-8 flex items-stretch gap-0">
              <div class="w-1/2 bg-gray-900 relative flex items-center justify-center h-64">
                <div class="flex flex-col items-center">
                  <div class="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center cursor-pointer hover:bg-white/30 transition-colors">
                    <svg class="w-7 h-7 text-white ml-1" viewBox="0 0 24 24"><path d="M16.57 11.218c.573.402.573 1.162 0 1.564l-5.684 3.992C10.129 17.307 9 16.839 9 15.993V8.008c0-.846 1.129-1.314 1.886-.782l5.684 3.992" fill="currentColor"/></svg>
                  </div>
                  <p class="text-xs text-gray-400 mt-3 text-center">Why cash cycles matter for e-commerce sellers</p>
                </div>
              </div>
              <div class="w-1/2 p-8 flex flex-col justify-center">
                <p class="text-xs font-semibold text-green-700 uppercase tracking-widest mb-2">How it works</p>
                <h3 class="font-heading-secondary font-semibold text-xl text-[#0F1117] mb-4">The fastest sellers don't just sell more — they move money faster</h3>
                <ul class="space-y-2">
                  <li class="flex items-start text-sm text-[#0F1117]">
                    <span class="text-green-600 mr-2">✓</span>
                    <span>Back Market pays you weekly, 7 to 14 days after a sale</span>
                  </li>
                  <li class="flex items-start text-sm text-[#0F1117]">
                    <span class="text-green-600 mr-2">✓</span>
                    <span>BackFunds advances 80% of your GMV the next day (D+1)</span>
                  </li>
                  <li class="flex items-start text-sm text-[#0F1117]">
                    <span class="text-green-600 mr-2">✓</span>
                    <span>Back Market repays BackFunds on your behalf — you keep the difference</span>
                  </li>
                </ul>
                <p class="text-xs text-[#5C5E63] mt-4">Inspired by: Why cash cycles matter in e-commerce</p>
              </div>
            </div>

            <div class="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
              <div class="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 class="font-heading-secondary text-lg font-semibold text-[#0F1117]">Your personalised estimate</h3>
                  <p class="text-sm mt-1 text-[#5C5E63]">Based on your last 30 days of sales activity</p>
                </div>
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-900 text-white flex-shrink-0">
                  <svg class="w-3 h-3" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M20.53 6.073a.75.75 0 0 1 0 1.06L9.884 17.78a1.25 1.25 0 0 1-1.768 0L3.47 13.134a.75.75 0 0 1 1.06-1.06L9 16.542l10.47-10.47a.75.75 0 0 1 1.06 0" clip-rule="evenodd" fill="currentColor"/></svg>
                  Verified partner
                </span>
              </div>

              <div class="grid grid-cols-2 gap-8 pb-6 border-b border-gray-100">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wide mb-3 text-[#5C5E63]">Working capital freed</p>
                  <p class="font-heading-secondary text-4xl font-semibold text-green-700">+€{{ simWorkingCapitalFreed.toLocaleString() }}</p>
                  <p class="text-sm mt-2 text-[#5C5E63]">Cash unlocked now by moving from D+{{ simDaysToGetPaid }} to D+1 — available to reinvest in inventory immediately.</p>
                </div>
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wide mb-3 text-[#5C5E63]">Potential additional profit / year</p>
                  <p class="font-heading-secondary text-4xl font-semibold text-green-700">+€{{ simIncrementalProfit.toLocaleString() }}</p>
                  <p class="text-sm mt-2 text-[#5C5E63]">Net of financing fees, from recycling that capital into faster inventory cycles.</p>
                </div>
              </div>

              <div class="pt-4 flex items-center gap-5">
                <div class="flex items-center gap-1.5">
                  <span class="text-xs text-[#5C5E63]">Daily advance</span>
                  <span class="text-sm font-semibold text-green-700">€{{ Math.round(sellerData.estimatedMonthlyAdvance / 30).toLocaleString() }}</span>
                </div>
                <div class="w-px h-3.5 bg-gray-200 flex-shrink-0"></div>
                <div class="flex items-center gap-1.5">
                  <span class="text-xs text-[#5C5E63]">Monthly advance</span>
                  <span class="text-sm font-semibold text-[#0F1117]">€{{ sellerData.estimatedMonthlyAdvance.toLocaleString() }}</span>
                </div>
                <div class="w-px h-3.5 bg-gray-200 flex-shrink-0"></div>
                <div class="flex items-center gap-1.5">
                  <span class="text-xs text-[#5C5E63]">Monthly fee (est.)</span>
                  <span class="text-sm font-semibold text-[#0F1117]">€{{ estimatedMonthlyCost.toLocaleString() }} · {{ sellerData.dailyFee }}% daily</span>
                </div>
              </div>

              <div class="flex items-center justify-between gap-3 mt-6 pt-6 border-t border-gray-100">
                <p class="text-xs text-[#5C5E63]">Powered by <span class="font-semibold text-[#0F1117]">Storfund</span> · No long-term commitment, pause anytime</p>
                <div class="flex items-center gap-3 flex-shrink-0">
                  <button
                    type="button"
                    class="prototype-hotspot border border-gray-300 text-[#0F1117] font-semibold text-sm px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                    @click="showGrowthSimulator = true"
                  >
                    Growth simulator
                  </button>
                  <button
                    type="button"
                    class="prototype-hotspot bg-green-900 hover:bg-green-800 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-colors"
                    @click="openOnboarding"
                  >
                    Apply for BackFunds
                  </button>
                </div>
              </div>
            </div>

            <div id="daily-payout-how" class="grid grid-cols-3 gap-4 mb-8">
              <div class="bg-white rounded-2xl border border-gray-200 p-6">
                <p class="text-4xl font-bold text-green-100 mb-3">01</p>
                <p class="font-semibold text-[#0F1117] mb-2">Apply in minutes</p>
                <p class="text-sm text-[#5C5E63]">Complete a short form and consent to share your Back Market sales data with Storfund.</p>
              </div>
              <div class="bg-white rounded-2xl border border-gray-200 p-6">
                <p class="text-4xl font-bold text-green-100 mb-3">02</p>
                <p class="font-semibold text-[#0F1117] mb-2">Storfund verifies you</p>
                <p class="text-sm text-[#5C5E63]">Storfund reaches out directly to verify your business identity. You'll typically get a decision within 1–2 days.</p>
              </div>
              <div class="bg-white rounded-2xl border border-gray-200 p-6">
                <p class="text-4xl font-bold text-green-100 mb-3">03</p>
                <p class="font-semibold text-[#0F1117] mb-2">Get paid daily</p>
                <p class="text-sm text-[#5C5E63]">Your payouts move from weekly to next-day. No changes to how you sell on Back Market.</p>
              </div>
            </div>
            </template>
          </div>

          <div v-else class="mt-6 text-sm text-gray-400 py-8 text-center">{{ conceptTabs[1] }} — coming soon</div>
        </BmShell>
      </div>

      <!-- ═════════ CONCEPT 3 ═════════ -->
      <div v-show="activeConcept === 3">
        <BmShell
          :nav-items="navItems"
          active-nav-item="Money"
          :tabs="tabs"
          :active-tab="conceptTabs[2]"
          :seller-name="sellerData.sellerName"
          page-title="Money"
          :nav-dot-predicate="makeNavDotPredicate(2)"
          @update:active-tab="conceptTabs[2] = $event"
        >
          <div v-if="conceptTabs[2] === 'Your wallet'" class="mt-6 pb-12">
            <div class="grid grid-cols-4 gap-6">
              <div class="col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 class="text-xl font-bold mb-5">Your wallet</h2>
                <div class="grid grid-cols-3 gap-6">
                  <div class="col-span-1 rounded-bm border border-indigo-100 shadow-sm bg-indigo-50 relative overflow-hidden p-6">
                    <svg class="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-400 opacity-10 pointer-events-none" viewBox="0 0 24 24"><path d="M5.25 15A.75.75 0 0 1 6 14.25h4a.75.75 0 0 1 0 1.5H6A.75.75 0 0 1 5.25 15M13 14.25a.75.75 0 0 0 0 1.5h1a.75.75 0 0 0 0-1.5h-1" fill="currentColor"/><path fill-rule="evenodd" d="M4.5 5.25A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-15M3.75 7.5A.75.75 0 0 1 4.5 6.75h15a.75.75 0 0 1 .75.75v1H3.75v-1m0 4v5a.75.75 0 0 0 .75.75h15a.75.75 0 0 0 .75-.75v-5H3.75" clip-rule="evenodd" fill="currentColor"/></svg>
                    <p class="text-base font-semibold text-gray-900 mb-2">Your wallet balance</p>
                    <p class="text-sm text-gray-500 mb-4">This is the amount you currently have in your Back Market wallet.</p>
                    <div class="flex items-baseline justify-between"><span class="text-sm text-gray-500">€</span><span class="text-lg font-semibold text-gray-900">-1,912.87</span></div>
                  </div>
                  <div
                    v-if="previewMode === 'after'"
                    class="prototype-hotspot"
                    :class="[
                      'col-span-1 rounded-bm border-2 bg-white p-5 flex flex-col cursor-pointer transition-all',
                      c3CardExpanded ? 'border-green-500 shadow-lg' : 'border-green-400 hover:border-green-500 hover:shadow-md',
                    ]"
                    @click="c3CardExpanded = !c3CardExpanded"
                  >
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Eligible ✓</span>
                      <span class="text-xl">⚡</span>
                    </div>
                    <p class="font-heading-secondary font-semibold text-base text-[#0F1117] mb-1">BackFunds</p>
                    <p class="text-xs text-[#5C5E63] mb-4">Get paid D+1 instead of D+7</p>
                    <div class="border-t border-gray-100 mb-3" />
                    <div class="flex justify-between text-xs py-1"><span class="text-[#5C5E63]">Daily advance</span><span class="font-semibold text-green-700">€{{ Math.round(sellerData.estimatedMonthlyAdvance / 30).toLocaleString() }}</span></div>
                    <div class="flex justify-between text-xs py-1"><span class="text-[#5C5E63]">Monthly fee</span><span class="font-semibold text-[#0F1117]">€{{ estimatedMonthlyCost.toLocaleString() }}</span></div>

                    <template v-if="c3CardExpanded">
                      <div class="border-t border-gray-100 my-3" />
                      <div class="flex items-center gap-2 py-1 mb-3">
                        <svg class="w-4 h-4 text-green-600 flex-shrink-0" viewBox="0 0 24 24"><path d="M16.75 10.31V12a.75.75 0 0 0 1.5 0V9A1.25 1.25 0 0 0 17 7.75h-3a.75.75 0 0 0 0 1.5h1.69l-3.19 3.19-1.616-1.617a1.25 1.25 0 0 0-1.768 0L5.97 13.97a.75.75 0 1 0 1.06 1.06L10 12.06l1.616 1.617a1.249 1.249 0 0 0 1.767 0l3.367-3.366" fill="currentColor"/><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12M12 3.75a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5" clip-rule="evenodd" fill="currentColor"/></svg>
                        <span class="text-xs text-[#0F1117]">Avg +33% GMV growth for active sellers</span>
                      </div>
                      <button
                        class="prototype-hotspot bg-green-900 hover:bg-green-800 text-white font-semibold rounded-bm px-4 py-2.5 text-xs transition-colors w-full text-center block"
                        @click.stop="openOnboarding()"
                      >
                        Apply for BackFunds
                      </button>
                      <button
                        class="prototype-hotspot text-xs text-[#5C5E63] underline text-center mt-2 block hover:text-[#0F1117] w-full"
                        @click.stop="openLearnMore()"
                      >
                        Learn more →
                      </button>
                      <button
                        class="prototype-hotspot mt-3 w-full text-center text-xs text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1"
                        @click.stop="c3CardExpanded = false"
                      >
                        Show less ▴
                      </button>
                    </template>
                    <button
                      v-else
                      class="prototype-hotspot mt-4 w-full text-center text-xs font-semibold text-green-700 hover:text-green-900 flex items-center justify-center gap-1"
                      @click.stop="c3CardExpanded = true"
                    >
                      See full details ▾
                    </button>
                  </div>
                  <div :class="['rounded-bm border border-bm-gray-200 shadow-sm bg-white p-6', previewMode === 'before' ? 'col-span-2' : 'col-span-1']">
                    <p class="text-base font-semibold text-gray-900 mb-2">Upcoming payouts</p>
                    <p class="text-sm text-gray-500 mb-4">The amount in your wallet will be split between 2 upcoming payouts.</p>
                    <table class="w-full text-sm">
                      <thead><tr class="border-b border-gray-200"><th v-for="col in payoutColumns" :key="col.key" :class="['pb-3 text-xs font-medium text-gray-400 uppercase tracking-wide', col.align === 'end' ? 'text-right' : 'text-left', col.key !== 'amount' ? 'pr-4' : '']">{{ col.label }}</th></tr></thead>
                      <tbody><tr v-for="row in payoutCollection" :key="row.id" class="border-b border-gray-100 last:border-0"><td class="py-3 pr-4 text-gray-700">{{ row.payoutDate }}</td><td class="py-3 pr-4 text-gray-500">{{ row.salesPeriod }}</td><td class="py-3 text-right font-medium text-gray-900">{{ row.amount }}</td></tr></tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div class="col-span-1 relative overflow-hidden rounded-xl bg-[#F2F3F7] shadow-sm p-6 flex flex-col gap-3">
                <svg class="absolute pointer-events-none text-[#ECEEF2] rotate-[10deg]" style="width:160px;height:160px;right:-20px;top:-20px;" viewBox="0 0 24 24"><path d="M12 12.25A.75.75 0 0 1 12.75 13v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 12 12.25" fill="currentColor"/><path fill-rule="evenodd" d="M7.75 8.25V7.2c0-2.243 1.967-3.95 4.25-3.95s4.25 1.707 4.25 3.95v1.05h.25a3.25 3.25 0 0 1 3.25 3.25v6a3.25 3.25 0 0 1-3.25 3.25h-9a3.25 3.25 0 0 1-3.25-3.25v-6A3.25 3.25 0 0 1 7.5 8.25h.25m1.5-1.05c0-1.291 1.166-2.45 2.75-2.45s2.75 1.159 2.75 2.45v1.05h-5.5V7.2m7.25 2.55a1.75 1.75 0 0 1 1.75 1.75v6a1.75 1.75 0 0 1-1.75 1.75h-9a1.75 1.75 0 0 1-1.75-1.75v-6A1.75 1.75 0 0 1 7.5 9.75h9" clip-rule="evenodd" fill="currentColor"/></svg>
                <p class="font-heading-secondary font-semibold text-lg text-[#0F1117] relative z-10">Deferred payout</p>
                <p class="text-sm leading-5 text-[#0F1117] relative z-10">This is the security payment. Or the amount of money Back Market holds for any issues that might happen with your products under warranty. Issues can include repairs, refunds, and more.</p>
                <a href="#" class="text-sm font-semibold underline text-[#0F1117] hover:opacity-60 transition-opacity relative z-10">Read this article for more details</a>
                <p class="text-sm text-gray-400 mt-1 relative z-10">No deferred payout</p>
              </div>
            </div>
          </div>

          <div v-else-if="conceptTabs[2] === 'Past invoices'" class="mt-6 pb-12">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900">Past invoices</h2>
              <button class="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-green-700 transition-colors">Download Financial Report</button>
            </div>
            <div class="bg-white rounded-bm border border-bm-gray-200 shadow-sm overflow-hidden">
              <table class="w-full text-sm">
                <thead class="border-b border-gray-200"><tr><th v-for="col in invoiceColumns" :key="col.key" :class="['px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide bg-gray-50', col.align === 'end' ? 'text-right' : 'text-left']">{{ col.label }}</th></tr></thead>
                <tbody><tr v-for="row in invoiceCollection" :key="row.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"><td class="px-4 py-3 font-mono text-xs text-gray-700">{{ row.invoice }}</td><td class="px-4 py-3 text-gray-600">{{ row.period }}</td><td class="px-4 py-3 text-gray-600">{{ row.issued }}</td><td class="px-4 py-3 text-right font-medium text-gray-900">{{ row.amount }}</td><td class="px-4 py-3"><span class="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">{{ row.status }}</span></td></tr></tbody>
              </table>
            </div>
          </div>

          <div v-else class="mt-6 text-sm text-gray-400 py-8 text-center">{{ conceptTabs[2] }} — coming soon</div>
        </BmShell>
      </div>

      <!-- ═════════ CONCEPT 4 ═════════ -->
      <div v-show="activeConcept === 4">
        <BmShell
          :nav-items="navItems"
          active-nav-item="Money"
          :tabs="tabs"
          :active-tab="conceptTabs[3]"
          :seller-name="sellerData.sellerName"
          page-title="Money"
          :nav-dot-predicate="makeNavDotPredicate(3)"
          @update:active-tab="conceptTabs[3] = $event"
        >
          <div v-if="conceptTabs[3] === 'Your wallet'" class="mt-6 pb-12">
            <div class="grid grid-cols-4 gap-6">
              <div class="col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h2 class="text-xl font-bold mb-5">Your wallet</h2>
                <div
                  v-if="showNudge && previewMode === 'after'"
                  class="bg-white border border-green-200 rounded-bm-lg px-5 py-4 mb-5 shadow-sm"
                >
                  <div class="flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                      <svg class="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12.009 2.482c.79-1.097 2.516-.335 2.237.988l-1.322 6.28h5.1a1.25 1.25 0 0 1 1.014 1.98l-7.047 9.788c-.79 1.097-2.516.334-2.238-.988l1.323-6.28h-5.1a1.25 1.25 0 0 1-1.014-1.98l7.047-9.788m.526 1.836-6.07 8.432H12a.75.75 0 0 1 .734.905l-1.269 6.027 6.07-8.432H12a.75.75 0 0 1-.734-.905l1.269-6.027" clip-rule="evenodd"/></svg>
                      <div>
                        <div class="text-sm font-semibold text-[#0F1117]">TechRenew GmbH is eligible for BackFunds</div>
                        <div class="text-xs text-[#5C5E63] mt-0.5">Get paid tomorrow instead of waiting 7 days · D+7 → D+1</div>
                      </div>
                    </div>
                    <div class="flex items-center gap-3 flex-shrink-0">
                      <span class="bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs font-semibold text-green-700">€{{ Math.round(sellerData.estimatedMonthlyAdvance / 30).toLocaleString() }}/day advance</span>
                      <button class="prototype-hotspot text-sm font-semibold text-green-700 hover:text-green-900 underline underline-offset-2 transition-colors" @click="showNudgePanel = true">Learn more →</button>
                      <button class="prototype-hotspot bg-green-900 hover:bg-green-800 text-white font-semibold rounded-bm px-4 py-1.5 text-xs transition-colors" @click="openOnboarding()">Apply now</button>
                      <button class="prototype-hotspot text-gray-400 hover:text-gray-600 text-lg leading-none ml-1 transition-colors" @click="showNudge = false">×</button>
                    </div>
                  </div>
                  <div class="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100">
                    <div class="flex items-center gap-1.5 text-xs text-[#5C5E63]">
                      <span class="font-semibold text-[#0F1117]">+33%</span> avg GMV growth for active sellers
                    </div>
                    <span class="text-gray-300">·</span>
                    <div class="flex items-center gap-1.5 text-xs text-[#5C5E63]">
                      <span class="font-semibold text-[#0F1117]">58+</span> sellers already enrolled
                    </div>
                    <span class="text-gray-300">·</span>
                    <div class="flex items-center gap-1.5 text-xs text-[#5C5E63]">
                      <span class="bg-green-900 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">Best Match</span>
                      <span class="font-semibold text-[#0F1117]">Storfund</span> recommended for your volume
                    </div>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-6">
                  <div class="col-span-1 rounded-bm border border-indigo-100 shadow-sm bg-indigo-50 relative overflow-hidden p-6">
                    <svg class="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-400 opacity-10 pointer-events-none" viewBox="0 0 24 24"><path d="M5.25 15A.75.75 0 0 1 6 14.25h4a.75.75 0 0 1 0 1.5H6A.75.75 0 0 1 5.25 15M13 14.25a.75.75 0 0 0 0 1.5h1a.75.75 0 0 0 0-1.5h-1" fill="currentColor"/><path fill-rule="evenodd" d="M4.5 5.25A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-15M3.75 7.5A.75.75 0 0 1 4.5 6.75h15a.75.75 0 0 1 .75.75v1H3.75v-1m0 4v5a.75.75 0 0 0 .75.75h15a.75.75 0 0 0 .75-.75v-5H3.75" clip-rule="evenodd" fill="currentColor"/></svg>
                    <p class="text-base font-semibold text-gray-900 mb-2">Your wallet balance</p>
                    <p class="text-sm text-gray-500 mb-4">This is the amount you currently have in your Back Market wallet.</p>
                    <div class="flex items-baseline justify-between"><span class="text-sm text-gray-500">€</span><span class="text-lg font-semibold text-gray-900">-1,912.87</span></div>
                  </div>
                  <div class="col-span-2 rounded-bm border border-bm-gray-200 shadow-sm bg-white p-6">
                    <p class="text-base font-semibold text-gray-900 mb-2">Upcoming payouts</p>
                    <p class="text-sm text-gray-500 mb-4">The amount in your wallet will be split between 2 upcoming payouts.</p>
                    <table class="w-full text-sm">
                      <thead><tr class="border-b border-gray-200"><th v-for="col in payoutColumns" :key="col.key" :class="['pb-3 text-xs font-medium text-gray-400 uppercase tracking-wide', col.align === 'end' ? 'text-right' : 'text-left', col.key !== 'amount' ? 'pr-6' : '']">{{ col.label }}</th></tr></thead>
                      <tbody><tr v-for="row in payoutCollection" :key="row.id" class="border-b border-gray-100 last:border-0"><td class="py-3 pr-6 text-gray-700">{{ row.payoutDate }}</td><td class="py-3 pr-6 text-gray-500">{{ row.salesPeriod }}</td><td class="py-3 text-right font-medium text-gray-900">{{ row.amount }}</td></tr></tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div class="col-span-1 relative overflow-hidden rounded-xl bg-[#F2F3F7] shadow-sm p-6 flex flex-col gap-3">
                <svg class="absolute pointer-events-none text-[#ECEEF2] rotate-[10deg]" style="width:160px;height:160px;right:-20px;top:-20px;" viewBox="0 0 24 24"><path d="M12 12.25A.75.75 0 0 1 12.75 13v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 12 12.25" fill="currentColor"/><path fill-rule="evenodd" d="M7.75 8.25V7.2c0-2.243 1.967-3.95 4.25-3.95s4.25 1.707 4.25 3.95v1.05h.25a3.25 3.25 0 0 1 3.25 3.25v6a3.25 3.25 0 0 1-3.25 3.25h-9a3.25 3.25 0 0 1-3.25-3.25v-6A3.25 3.25 0 0 1 7.5 8.25h.25m1.5-1.05c0-1.291 1.166-2.45 2.75-2.45s2.75 1.159 2.75 2.45v1.05h-5.5V7.2m7.25 2.55a1.75 1.75 0 0 1 1.75 1.75v6a1.75 1.75 0 0 1-1.75 1.75h-9a1.75 1.75 0 0 1-1.75-1.75v-6A1.75 1.75 0 0 1 7.5 9.75h9" clip-rule="evenodd" fill="currentColor"/></svg>
                <p class="font-heading-secondary font-semibold text-lg text-[#0F1117] relative z-10">Deferred payout</p>
                <p class="text-sm leading-5 text-[#0F1117] relative z-10">This is the security payment. Or the amount of money Back Market holds for any issues that might happen with your products under warranty. Issues can include repairs, refunds, and more.</p>
                <a href="#" class="text-sm font-semibold underline text-[#0F1117] hover:opacity-60 transition-opacity relative z-10">Read this article for more details</a>
                <p class="text-sm text-gray-400 mt-1 relative z-10">No deferred payout</p>
              </div>
            </div>
          </div>

          <div v-else-if="conceptTabs[3] === 'Past invoices'" class="mt-6 pb-12">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-gray-900">Past invoices</h2>
              <button class="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded hover:bg-green-700 transition-colors">Download Financial Report</button>
            </div>
            <div class="bg-white rounded-bm border border-bm-gray-200 shadow-sm overflow-hidden">
              <table class="w-full text-sm">
                <thead class="border-b border-gray-200"><tr><th v-for="col in invoiceColumns" :key="col.key" :class="['px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide bg-gray-50', col.align === 'end' ? 'text-right' : 'text-left']">{{ col.label }}</th></tr></thead>
                <tbody><tr v-for="row in invoiceCollection" :key="row.id" class="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"><td class="px-4 py-3 font-mono text-xs text-gray-700">{{ row.invoice }}</td><td class="px-4 py-3 text-gray-600">{{ row.period }}</td><td class="px-4 py-3 text-gray-600">{{ row.issued }}</td><td class="px-4 py-3 text-right font-medium text-gray-900">{{ row.amount }}</td><td class="px-4 py-3"><span class="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">{{ row.status }}</span></td></tr></tbody>
              </table>
            </div>
          </div>

          <div v-else class="mt-6 text-sm text-gray-400 py-8 text-center">{{ conceptTabs[3] }} — coming soon</div>
        </BmShell>

      </div>

    </div>

    <!-- ═════════ CONCEPT 1 — Learn More modal ═════════ -->
    <div
      v-if="showLearnMoreModal"
      class="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-4 font-body"
    >
      <div class="relative bg-white rounded-bm-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          class="prototype-hotspot absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Close"
          @click="showLearnMoreModal = false"
        >
          ×
        </button>

        <div class="p-6">
          <p class="text-xs font-semibold tracking-widest text-[#5C5E63] uppercase mb-2">BackFunds · Powered by Storfund</p>
          <h2 class="font-heading-primary font-semibold text-2xl text-[#0F1117] mb-2">Get paid tomorrow, not in 7 days</h2>
          <p class="text-sm text-[#5C5E63] mb-6">BackFunds accelerates your payouts from D+7 to D+1. 58+ sellers are already growing faster with daily cash flow.</p>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="bg-[#F2F3F7] rounded-bm-lg p-4">
              <p class="text-xs text-[#5C5E63] mb-1">Estimated monthly advance</p>
              <p class="font-heading-secondary font-semibold text-xl text-[#0F1117]">€{{ sellerData.estimatedMonthlyAdvance.toLocaleString() }} <span class="text-sm font-body font-normal text-[#5C5E63]">/month</span></p>
              <p class="text-xs text-[#5C5E63] mt-1">based on your last payout</p>
            </div>
            <div class="bg-[#F2F3F7] rounded-bm-lg p-4">
              <p class="text-xs text-[#5C5E63] mb-1">Estimated monthly fee</p>
              <p class="font-heading-secondary font-semibold text-xl text-[#0F1117]">€{{ estimatedMonthlyCost.toLocaleString() }} <span class="text-sm font-body font-normal text-[#5C5E63]">/month</span></p>
              <p class="text-xs text-[#5C5E63] mt-1">{{ sellerData.dailyFee }}% per day on outstanding advances</p>
            </div>
          </div>

          <div class="bg-green-50 border border-green-200 rounded-bm-lg p-4 mb-6">
            <p class="text-sm font-semibold text-[#0F1117]">Sellers on BackFunds report +33% GMV growth over 12 months</p>
            <p class="text-xs text-[#5C5E63] mt-1">Based on Back Market internal data</p>
          </div>

          <div class="border border-gray-200 rounded-bm-lg p-4 mb-6 flex items-center justify-between gap-4">
            <div>
              <p class="text-xs text-[#5C5E63] mb-0.5">Financing partner</p>
              <p class="font-semibold text-[#0F1117]">Storfund</p>
              <p class="text-xs text-[#5C5E63] mt-1">{{ sellerData.advanceRate }}% of shipped GMV · {{ sellerData.dailyFee }}% daily fee</p>
            </div>
            <span class="text-xs bg-green-900 text-white px-2 py-1 rounded-full whitespace-nowrap">Verified partner</span>
          </div>
        </div>

        <div class="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end">
          <button
            type="button"
            class="prototype-hotspot bg-green-900 hover:bg-green-800 text-white font-semibold rounded-bm px-5 py-2.5 text-sm transition-colors"
            @click="openOnboarding"
          >
            Apply for BackFunds
          </button>
        </div>
      </div>
    </div>

    <!-- ═════════ CONCEPT 1 — Onboarding stepper modal ═════════ -->
    <div
      v-if="showOnboardingModal"
      class="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-4 font-body"
    >
      <div class="relative bg-white rounded-bm-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          class="prototype-hotspot absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Close"
          @click="closeOnboarding"
        >
          ×
        </button>

        <div v-if="onboardingStep === 1" class="p-6">
          <p class="text-xs font-semibold tracking-widest text-[#5C5E63] uppercase mb-4">Step 1 of 3 · Eligibility</p>
          <h2 class="font-heading-primary font-semibold text-2xl text-[#0F1117] mb-3">You're eligible for BackFunds</h2>
          <span class="inline-block bg-green-100 text-green-800 rounded-full px-3 py-1 text-sm mb-5">Eligible ✓</span>

          <div class="bg-[#F2F3F7] rounded-bm-lg p-4 mb-4 space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-[#5C5E63]">Monthly advance (est.)</span>
              <span class="font-semibold text-[#0F1117]">€{{ sellerData.estimatedMonthlyAdvance.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-[#5C5E63]">Daily advance (est.)</span>
              <span class="font-semibold text-green-700">€{{ Math.round(sellerData.estimatedMonthlyAdvance / 30).toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between text-sm border-t border-gray-200 pt-2 mt-2">
              <span class="text-[#5C5E63]">Daily fee</span>
              <span class="font-semibold text-[#0F1117]">{{ sellerData.dailyFee }}% on outstanding advances</span>
            </div>
            <div class="flex items-center justify-between text-sm">
              <span class="text-[#5C5E63]">Monthly fee (est.)</span>
              <span class="font-semibold text-[#0F1117]">€{{ estimatedMonthlyCost.toLocaleString() }}</span>
            </div>
          </div>

          <p class="text-xs text-[#5C5E63] mb-6">Estimates based on your last 30 days of payout history. Final amounts confirmed after approval.</p>

          <div class="flex justify-end">
            <button
              type="button"
              :disabled="pendingAction === 'step-1'"
              :class="['prototype-hotspot bg-green-900 text-white font-semibold rounded-bm px-5 py-2.5 text-sm transition-colors inline-flex items-center gap-2', pendingAction === 'step-1' ? 'opacity-75 cursor-wait' : 'hover:bg-green-800']"
              @click="advanceWithDelay('step-1', () => onboardingStep = 2)"
            >
              <svg v-if="pendingAction === 'step-1'" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.13 5.82 3 7.94l3-2.65z" /></svg>
              {{ pendingAction === 'step-1' ? 'Loading' : 'Continue' }}
            </button>
          </div>
        </div>

        <div v-else-if="onboardingStep === 2" class="p-6">
          <p class="text-xs font-semibold tracking-widest text-[#5C5E63] uppercase mb-4">Step 2 of 3 · Provider</p>
          <h2 class="font-heading-primary font-semibold text-2xl text-[#0F1117] mb-2">Your financing partner</h2>
          <p class="text-sm text-[#5C5E63] mb-5">We've matched you with Storfund based on your Back Market sales profile — this is your best-fit financing partner.</p>

          <div class="border-2 border-green-600 rounded-bm-lg p-4 mb-6 relative">
            <span class="absolute -top-2.5 left-4 bg-green-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">Computed for you</span>
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="font-semibold text-[#0F1117]">Storfund</p>
                <p class="text-xs text-[#5C5E63] mt-0.5">{{ sellerData.advanceRate }}% of GMV advanced · {{ sellerData.dailyFee }}% daily fee · EU, UK, US, CA</p>
              </div>
              <div class="text-right flex-shrink-0">
                <p class="text-sm font-semibold text-green-700">€{{ Math.round(sellerData.estimatedMonthlyAdvance / 30).toLocaleString() }}/day</p>
                <p class="text-xs text-[#5C5E63]">est. daily advance</p>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              type="button"
              :disabled="pendingAction === 'step-2'"
              :class="['prototype-hotspot bg-green-900 text-white font-semibold rounded-bm px-5 py-2.5 text-sm transition-colors inline-flex items-center gap-2', pendingAction === 'step-2' ? 'opacity-75 cursor-wait' : 'hover:bg-green-800']"
              @click="advanceWithDelay('step-2', () => onboardingStep = 3)"
            >
              <svg v-if="pendingAction === 'step-2'" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.13 5.82 3 7.94l3-2.65z" /></svg>
              {{ pendingAction === 'step-2' ? 'Loading' : 'Continue' }}
            </button>
          </div>
        </div>

        <div v-else-if="onboardingStep === 3" class="p-6">
          <p class="text-xs font-semibold tracking-widest text-[#5C5E63] uppercase mb-4">Step 3 of 3 · Data sharing & submit</p>
          <h2 class="font-heading-primary font-semibold text-2xl text-[#0F1117] mb-3">Authorise data sharing & submit</h2>
          <p class="text-sm text-[#5C5E63] mb-4">Back Market and Storfund will need to process your sales data to assess your BackFunds application. Read below to understand how your data will be used and how to withdraw your consent at any time.</p>

          <div class="border border-bm-border rounded-bm-lg bg-white h-48 overflow-y-auto p-4 mb-4 text-xs text-[#5C5E63] leading-relaxed space-y-3">
            <p><strong class="text-[#0F1117]">✏️ Purpose of data processing</strong><br>Back Market (controller) shares the following data with Storfund (processor) solely to assess your eligibility for BackFunds payout acceleration and to service any advance facility granted to you: order history, payout amounts, GMV, refund rates, and store performance metrics. Storfund may not use this data for any other purpose.</p>
            <p><strong class="text-[#0F1117]">✏️ Categories of data shared</strong><br>Sales order records; payout schedules and amounts; gross merchandise value (GMV); return and refund history; store performance scores; account standing and suspension history. No personal identity data (name, address, ID documents) is shared at this stage.</p>
            <p><strong class="text-[#0F1117]">✏️ Legal basis</strong><br>Processing is carried out on the basis of your explicit consent (GDPR Art. 6(1)(a)). You may withdraw your consent at any time without affecting the lawfulness of processing carried out prior to withdrawal. Withdrawal of consent will result in termination of any active BackFunds facility.</p>
            <p><strong class="text-[#0F1117]">✏️ Data retention</strong><br>Back Market will retain shared data logs for a period of 5 years from the date of sharing, in accordance with applicable financial record-keeping obligations. Storfund's retention schedule is governed by their Privacy Policy, available at storfund.com/privacy.</p>
            <p><strong class="text-[#0F1117]">✏️ Your rights</strong><br>You have the right to access, rectify, or erase your personal data; to restrict or object to processing; and to data portability. To exercise these rights, contact privacy@backmarket.com. You also have the right to lodge a complaint with your local supervisory authority.</p>
          </div>

          <p class="text-xs text-[#5C5E63] mb-5">Data is encrypted in transit. If you withdraw consent, any active BackFunds facility will be terminated. See our <a href="#" class="prototype-hotspot underline">Privacy Policy</a> for full details.</p>

          <label class="prototype-hotspot flex items-start gap-3 text-sm text-[#0F1117] mb-6 cursor-pointer">
            <input
              v-model="consentChecked"
              type="checkbox"
              class="prototype-hotspot mt-0.5 rounded-bm-sm border-gray-300"
            />
            <span>I have read the above and give consent to Back Market sharing my sales data with Storfund for the purpose of my BackFunds application.</span>
          </label>

          <div class="flex justify-end">
            <button
              type="button"
              :disabled="!consentChecked || pendingAction === 'step-3'"
              :class="[
                'prototype-hotspot bg-green-900 text-white font-semibold rounded-bm px-5 py-2.5 text-sm transition-colors inline-flex items-center gap-2',
                !consentChecked ? 'opacity-50 cursor-not-allowed' : pendingAction === 'step-3' ? 'opacity-75 cursor-wait' : 'hover:bg-green-800',
              ]"
              @click="consentChecked && advanceWithDelay('step-3', () => onboardingStep = 'processing', 1800)"
            >
              <svg v-if="pendingAction === 'step-3'" class="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" /><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.29A7.96 7.96 0 014 12H0c0 3.04 1.13 5.82 3 7.94l3-2.65z" /></svg>
              {{ pendingAction === 'step-3' ? 'Submitting' : 'Submit application' }}
            </button>
          </div>
        </div>

        <div v-else-if="onboardingStep === 'processing'" class="p-6 py-8 text-center">
          <div class="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-green-700" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M21.03 7.97a.75.75 0 0 1 0 1.06l-9.25 9.25a.75.75 0 0 1-1.06 0l-4.25-4.25a.75.75 0 1 1 1.06-1.06l3.72 3.72 8.72-8.72a.75.75 0 0 1 1.06 0" clip-rule="evenodd" fill="currentColor"/></svg>
          </div>
          <h2 class="font-heading-secondary font-semibold text-xl text-[#0F1117] mb-2">Application submitted</h2>
          <p class="text-sm text-[#5C5E63] mb-5">Your BackFunds application is in. It's now over to our funding partner to confirm a few things before you're set up.</p>

          <div class="border border-bm-border rounded-bm-lg bg-[#F2F3F7] p-4 text-left mb-6 space-y-3">
            <p class="text-xs font-semibold tracking-widest text-[#5C5E63] uppercase">What happens next</p>
            <div class="flex items-start gap-3">
              <span class="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"><svg class="w-3 h-3 text-green-700" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M21.03 7.97a.75.75 0 0 1 0 1.06l-9.25 9.25a.75.75 0 0 1-1.06 0l-4.25-4.25a.75.75 0 1 1 1.06-1.06l3.72 3.72 8.72-8.72a.75.75 0 0 1 1.06 0" clip-rule="evenodd" fill="currentColor"/></svg></span>
              <p class="text-sm text-[#0F1117]"><span class="font-semibold">Handed to our funding partner.</span> Storfund will reach out to verify your identity and confirm a few business details — this happens entirely on their side.</p>
            </div>
            <div class="flex items-start gap-3">
              <span class="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center"><svg class="w-3 h-3 text-amber-600" viewBox="0 0 24 24"><path d="M12.75 6.5a.75.75 0 0 0-1.5 0v5.293a1.25 1.25 0 0 0 .366.884l2.354 2.353a.75.75 0 1 0 1.06-1.06l-2.28-2.28V6.5" fill="currentColor"/><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25M3.75 12a8.25 8.25 0 1 1 16.5 0 8.25 8.25 0 1 1-16.5 0" clip-rule="evenodd" fill="currentColor"/></svg></span>
              <p class="text-sm text-[#0F1117]"><span class="font-semibold">Decision in 1–2 days.</span> Watch for an email from Storfund — they may ask for ID or extra info. Your status updates automatically here on your Money page.</p>
            </div>
          </div>

          <div class="mt-2 flex justify-center">
            <button
              type="button"
              class="prototype-hotspot bg-green-900 hover:bg-green-800 text-white font-semibold rounded-bm px-5 py-2.5 text-sm transition-colors"
              @click="closeOnboarding"
            >
              Back to Money
            </button>
          </div>
        </div>
      </div>
    </div>


    <!-- ═════════ CONCEPT 2 — Growth simulator modal ═════════ -->
    <div
      v-if="showGrowthSimulator"
      class="absolute inset-0 z-[60] flex items-center justify-center font-body"
    >
      <div class="absolute inset-0 bg-black/50" />

      <div class="relative w-[calc(100%-4rem)] max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[calc(100%-4rem)]">
        <div class="px-8 py-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <div>
            <p class="text-xs font-semibold tracking-widest text-green-700 uppercase mb-0.5">Growth simulator</p>
            <h2 class="font-heading-secondary font-semibold text-xl text-[#0F1117]">Adjust your assumptions</h2>
          </div>
          <button type="button" class="prototype-hotspot text-gray-400 hover:text-gray-600 transition-colors" @click="showGrowthSimulator = false">
            <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M3.47 3.47a.75.75 0 0 1 1.06 0L12 10.94l7.47-7.47a.75.75 0 1 1 1.06 1.06L13.06 12l7.47 7.47a.75.75 0 1 1-1.06 1.06L12 13.06l-7.47 7.47a.75.75 0 0 1-1.06-1.06L10.94 12 3.47 4.53a.75.75 0 0 1 0-1.06" clip-rule="evenodd" fill="currentColor"/></svg>
          </button>
        </div>

        <div class="flex flex-1 overflow-hidden">
          <div class="w-2/5 bg-[#F2F3F7] p-8 flex flex-col border-r border-gray-200 overflow-y-auto">
            <p class="text-xs font-semibold text-[#5C5E63] uppercase tracking-wide mb-6">What Back Market can see</p>

            <div class="space-y-6">
              <div>
                <p class="text-sm font-semibold text-[#0F1117] mb-0.5">Number of days you wait to get paid</p>
                <p class="text-xs text-[#5C5E63] mb-3">The average number of days between shipping an order and receiving payment from Back Market.</p>
                <p class="text-2xl font-bold text-[#0F1117]">{{ simDaysToGetPaid }} days</p>
              </div>

              <div class="border-t border-gray-200 pt-6">
                <p class="text-sm font-semibold text-[#0F1117] mb-0.5">Annual revenue</p>
                <p class="text-xs text-[#5C5E63] mb-3">Your last 12 months of sales on Back Market.</p>
                <p class="text-2xl font-bold text-[#0F1117]">€{{ sellerData.annualRevenue.toLocaleString() }}</p>
              </div>

              <div class="border-t border-gray-200 pt-6">
                <p class="text-sm font-semibold text-[#0F1117] mb-0.5">Security deposit held</p>
                <p class="text-xs text-[#5C5E63] mb-3">Funds Back Market currently holds against warranty issues.</p>
                <p class="text-2xl font-bold text-[#0F1117]">€{{ sellerData.currentDeposit.toLocaleString() }}</p>
              </div>
            </div>

            <p class="text-xs text-[#5C5E63] mt-auto pt-8">If you don't have 12 months of data, we use your recent performance to build an estimate.</p>
          </div>

          <div class="flex-1 p-8 overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
              <p class="text-xs font-semibold text-[#5C5E63] uppercase tracking-wide">Your inputs</p>
              <p class="text-xs text-[#5C5E63]">Adjust to match your business</p>
            </div>

            <div class="space-y-5">
              <div class="flex items-start justify-between py-4 border-b border-gray-100">
                <div class="flex-1 pr-8">
                  <p class="text-sm font-semibold text-[#0F1117] mb-0.5">How quickly do you receive stock from your suppliers</p>
                  <p class="text-xs text-[#5C5E63]">The average number of days between ordering stock and receiving it.</p>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <input v-model.number="simStockDays" type="number" min="0" class="w-14 text-right text-sm font-bold text-[#0F1117] border border-gray-300 rounded-bm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-600" />
                  <span class="text-sm text-[#5C5E63]">days</span>
                </div>
              </div>

              <div class="flex items-start justify-between py-4 border-b border-gray-100">
                <div class="flex-1 pr-8">
                  <p class="text-sm font-semibold text-[#0F1117] mb-0.5">How quickly do you sell</p>
                  <p class="text-xs text-[#5C5E63]">The average number of days between listing items and selling them.</p>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <input v-model.number="simSellDays" type="number" min="0" class="w-14 text-right text-sm font-bold text-[#0F1117] border border-gray-300 rounded-bm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-600" />
                  <span class="text-sm text-[#5C5E63]">days</span>
                </div>
              </div>

              <div class="flex items-start justify-between py-4 border-b border-gray-100">
                <div class="flex-1 pr-8">
                  <p class="text-sm font-semibold text-[#0F1117] mb-0.5">How quickly do you ship your orders</p>
                  <p class="text-xs text-[#5C5E63]">The average number of days between selling an item and shipping it. If you ship the day you sell, select 0.</p>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <input v-model.number="simShipDays" type="number" min="0" class="w-14 text-right text-sm font-bold text-[#0F1117] border border-gray-300 rounded-bm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-600" />
                  <span class="text-sm text-[#5C5E63]">days</span>
                </div>
              </div>

              <div class="flex items-start justify-between py-4">
                <div class="flex-1 pr-8">
                  <p class="text-sm font-semibold text-[#0F1117] mb-0.5">What is your gross margin</p>
                  <p class="text-xs text-[#5C5E63]">The percentage you make on your sales before financing fees. We subtract the BackFunds fee separately.</p>
                </div>
                <div class="flex items-center gap-1.5 flex-shrink-0">
                  <input v-model.number="simMargin" type="number" min="0" max="100" class="w-14 text-right text-sm font-bold text-[#0F1117] border border-gray-300 rounded-bm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-600" />
                  <span class="text-sm text-[#5C5E63]">%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-200 bg-green-900 px-8 py-6 flex-shrink-0">
          <p class="text-xs text-green-300 mb-4">
            Best rate for you: <span class="font-semibold text-white">{{ simProviderName }}</span>
            · {{ simProviderAdvancePct }}% advance · {{ simProviderFeePct }}% / yr fee
            — the cheapest of the providers you qualify for
          </p>
          <div class="flex items-center gap-10">
            <div>
              <p class="text-xs font-semibold text-green-300 uppercase tracking-wide mb-1">Potential additional profit / year</p>
              <p class="text-2xl font-bold text-white">+€{{ simIncrementalProfit.toLocaleString() }}</p>
              <p class="text-xs text-green-300 mt-0.5">Net of financing fees</p>
            </div>
            <div class="w-px bg-green-700 self-stretch" />
            <div>
              <p class="text-xs font-semibold text-green-300 uppercase tracking-wide mb-1">Return on financing</p>
              <p class="text-2xl font-bold text-white">{{ simRoi }}×</p>
              <p class="text-xs text-green-300 mt-0.5">Profit per €1 of fees</p>
            </div>
            <div class="w-px bg-green-700 self-stretch" />
            <div>
              <p class="text-xs font-semibold text-green-300 uppercase tracking-wide mb-1">Working capital freed</p>
              <p class="text-2xl font-bold text-white">+€{{ simWorkingCapitalFreed.toLocaleString() }}</p>
              <p class="text-xs text-green-300 mt-0.5">Cash unlocked now</p>
            </div>
            <div class="ml-auto">
              <button
                type="button"
                class="prototype-hotspot bg-white text-green-900 font-semibold rounded-bm px-6 py-2.5 text-sm hover:bg-green-50 transition-colors"
                @click="showGrowthSimulator = false; openOnboarding()"
              >
                Apply for BackFunds
              </button>
            </div>
          </div>
          <p class="text-xs text-green-400 mt-4">Illustrative estimate assuming {{ simReinvestPct }}% of freed capital is reinvested. Individual results may vary. Not financial advice.</p>
        </div>
      </div>
    </div>

    <!-- Concept 4 — BackFunds learn-more slide-in panel -->
    <div
      v-if="showNudgePanel"
      class="absolute inset-0 z-50 flex justify-end"
      @click.self="showNudgePanel = false"
    >
      <div class="absolute inset-0 bg-black/30" @click="showNudgePanel = false" />
      <div class="relative w-[420px] h-full bg-white shadow-xl flex flex-col overflow-y-auto">
        <div class="flex items-center justify-between px-6 py-5 border-b border-gray-200 flex-shrink-0">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12.009 2.482c.79-1.097 2.516-.335 2.237.988l-1.322 6.28h5.1a1.25 1.25 0 0 1 1.014 1.98l-7.047 9.788c-.79 1.097-2.516.334-2.238-.988l1.323-6.28h-5.1a1.25 1.25 0 0 1-1.014-1.98l7.047-9.788m.526 1.836-6.07 8.432H12a.75.75 0 0 1 .734.905l-1.269 6.027 6.07-8.432H12a.75.75 0 0 1-.734-.905l1.269-6.027" clip-rule="evenodd"/></svg>
            <span class="font-semibold text-[#0F1117] text-sm">BackFunds</span>
          </div>
          <button class="prototype-hotspot text-gray-400 hover:text-gray-600 transition-colors" @click="showNudgePanel = false">
            <svg class="w-5 h-5" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M3.47 3.47a.75.75 0 0 1 1.06 0L12 10.94l7.47-7.47a.75.75 0 1 1 1.06 1.06L13.06 12l7.47 7.47a.75.75 0 1 1-1.06 1.06L12 13.06l-7.47 7.47a.75.75 0 0 1-1.06-1.06L10.94 12 3.47 4.53a.75.75 0 0 1 0-1.06" clip-rule="evenodd" fill="currentColor"/></svg>
          </button>
        </div>

        <div class="px-6 pt-6 pb-4">
          <p class="font-heading-secondary font-semibold text-xl text-[#0F1117] leading-snug mb-1">Get paid D+1 instead of D+7</p>
          <p class="text-sm text-[#5C5E63]">BackFunds advances your Back Market payouts the next business day — no waiting, no limits on your growth.</p>
        </div>

        <div class="mx-6 bg-[#F2F3F7] rounded-bm-lg p-4 mb-5">
          <p class="text-xs font-semibold text-[#5C5E63] uppercase tracking-wide mb-3">Your estimate</p>
          <div class="flex justify-between items-baseline mb-2">
            <span class="text-sm text-[#0F1117]">Daily advance</span>
            <span class="text-base font-semibold text-green-700">€{{ Math.round(sellerData.estimatedMonthlyAdvance / 30).toLocaleString() }}/day</span>
          </div>
          <div class="flex justify-between items-baseline mb-2">
            <span class="text-sm text-[#0F1117]">Monthly advance</span>
            <span class="text-sm font-semibold text-[#0F1117]">€{{ sellerData.estimatedMonthlyAdvance.toLocaleString() }}</span>
          </div>
          <div class="border-t border-gray-200 mt-3 pt-3 flex justify-between items-baseline">
            <span class="text-sm text-[#0F1117]">Fee</span>
            <span class="text-sm font-semibold text-[#0F1117]">{{ sellerData.dailyFee }}% per day · €{{ estimatedMonthlyCost.toLocaleString() }}/mo</span>
          </div>
          <p class="text-xs text-[#5C5E63] mt-2">Based on your recent sales. Final terms confirmed after review.</p>
        </div>

        <div class="px-6 mb-5 space-y-3">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-green-700" viewBox="0 0 24 24"><path d="M16.75 10.31V12a.75.75 0 0 0 1.5 0V9A1.25 1.25 0 0 0 17 7.75h-3a.75.75 0 0 0 0 1.5h1.69l-3.19 3.19-1.616-1.617a1.25 1.25 0 0 0-1.768 0L5.97 13.97a.75.75 0 1 0 1.06 1.06L10 12.06l1.616 1.617a1.249 1.249 0 0 0 1.767 0l3.367-3.366" fill="currentColor"/><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12M12 3.75a8.25 8.25 0 1 0 0 16.5 8.25 8.25 0 0 0 0-16.5" clip-rule="evenodd" fill="currentColor"/></svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-[#0F1117]">+33% avg GMV growth</p>
              <p class="text-xs text-[#5C5E63]">Sellers who use BackFunds reinvest faster and grow more stock</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-green-700" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M17 4.5a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5m-1.75 3.25a1.75 1.75 0 1 1 3.5 0 1.75 1.75 0 0 1-3.5 0" clip-rule="evenodd" fill="currentColor"/><path d="M15.536 11.5a3.25 3.25 0 0 0-2.299.952L12.97 12.72a.75.75 0 1 0 1.06 1.06l.268-.267A1.75 1.75 0 0 1 15.536 13h2.929a1.75 1.75 0 0 1 1.237.513l.06.06a1.664 1.664 0 0 1 .488 1.177.75.75 0 0 0 1.5 0 3.164 3.164 0 0 0-.927-2.237l-.06-.061a3.25 3.25 0 0 0-2.299-.952h-2.928" fill="currentColor"/><path fill-rule="evenodd" d="M4.5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0m4-2.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5" clip-rule="evenodd" fill="currentColor"/><path d="M6.414 14a4.164 4.164 0 0 0-4.164 4.164v.586a.75.75 0 0 0 1.5 0v-.586A2.664 2.664 0 0 1 6.414 15.5h4.172a2.664 2.664 0 0 1 2.664 2.664v.586a.75.75 0 0 0 1.5 0v-.586A4.164 4.164 0 0 0 10.586 14H6.414" fill="currentColor"/></svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-[#0F1117]">58+ sellers enrolled</p>
              <p class="text-xs text-[#5C5E63]">Across Europe — from solo traders to high-volume refurbishers</p>
            </div>
          </div>
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-green-700" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12m14.78-2.47a.75.75 0 0 0-1.06-1.06l-5.47 5.47-2.47-2.47a.75.75 0 0 0-1.06 1.06l2.646 2.647a1.25 1.25 0 0 0 1.768 0L17.03 9.53" clip-rule="evenodd" fill="currentColor"/></svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-[#0F1117]">Powered by Storfund</p>
              <p class="text-xs text-[#5C5E63]">Your data stays within Back Market and Storfund — never shared further</p>
            </div>
          </div>
        </div>

        <div class="mt-auto px-6 py-5 border-t border-gray-200 space-y-2 flex-shrink-0">
          <button
            class="prototype-hotspot w-full bg-green-900 hover:bg-green-800 text-white font-semibold rounded-bm px-4 py-3 text-sm transition-colors"
            @click="showNudgePanel = false; openOnboarding()"
          >
            Apply for BackFunds
          </button>
          <button
            class="prototype-hotspot w-full text-center text-sm text-[#5C5E63] hover:text-[#0F1117] py-2 transition-colors"
            @click="showNudgePanel = false"
          >
            Not now
          </button>
        </div>
      </div>
    </div>

    <!-- ═════════ CONCEPT 2 — Pause advances confirmation ═════════ -->
    <div
      v-if="showPauseConfirm"
      class="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-4 font-body"
    >
      <div class="relative bg-white rounded-bm-xl shadow-xl w-full max-w-md p-6">
        <p class="text-xs font-semibold tracking-widest text-[#5C5E63] uppercase mb-3">Pause BackFunds</p>
        <h2 class="font-heading-primary font-semibold text-xl text-[#0F1117] mb-3">Pause your daily advances?</h2>
        <p class="text-sm text-[#5C5E63] mb-4">Pausing keeps your BackFunds account active, but no new daily advances will be added until you resume.</p>
        <ul class="space-y-2 mb-6">
          <li class="flex items-start gap-2 text-sm text-[#5C5E63]">
            <span class="text-green-600 mt-0.5">✓</span>
            <span>Your Back Market payouts continue as normal (D+7)</span>
          </li>
          <li class="flex items-start gap-2 text-sm text-[#5C5E63]">
            <span class="text-green-600 mt-0.5">✓</span>
            <span>You can resume daily advances anytime from this page</span>
          </li>
          <li class="flex items-start gap-2 text-sm text-[#5C5E63]">
            <span class="text-green-600 mt-0.5">✓</span>
            <span>No new fees while paused</span>
          </li>
        </ul>
        <div class="flex gap-3 justify-end">
          <button type="button" class="prototype-hotspot text-sm font-semibold text-[#0F1117] px-5 py-2.5 rounded-bm hover:bg-gray-50 transition-colors" @click="showPauseConfirm = false">Cancel</button>
          <button type="button" class="prototype-hotspot bg-[#0F1117] text-white text-sm font-semibold rounded-bm px-5 py-2.5 hover:bg-gray-800 transition-colors" @click="confirmPause">Pause advances</button>
        </div>
      </div>
    </div>

    <!-- ═════════ CONCEPT 2 — Resume advances confirmation ═════════ -->
    <div
      v-if="showResumeConfirm"
      class="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-4 font-body"
    >
      <div class="relative bg-white rounded-bm-xl shadow-xl w-full max-w-md p-6">
        <p class="text-xs font-semibold tracking-widest text-[#5C5E63] uppercase mb-3">Resume BackFunds</p>
        <h2 class="font-heading-primary font-semibold text-xl text-[#0F1117] mb-3">Resume your daily advances?</h2>
        <p class="text-sm text-[#5C5E63] mb-6">Daily advances will restart with your next sale. Your existing settings and fee rate stay the same.</p>
        <div class="flex gap-3 justify-end">
          <button type="button" class="prototype-hotspot text-sm font-semibold text-[#0F1117] px-5 py-2.5 rounded-bm hover:bg-gray-50 transition-colors" @click="showResumeConfirm = false">Cancel</button>
          <button type="button" class="prototype-hotspot bg-green-900 hover:bg-green-800 text-white text-sm font-semibold rounded-bm px-5 py-2.5 transition-colors" @click="confirmResume">Resume advances</button>
        </div>
      </div>
    </div>

    <!-- ═════════ CONCEPT 2 — Stop BackFunds confirmation ═════════ -->
    <div
      v-if="showStopConfirm"
      class="absolute inset-0 z-50 bg-black/40 flex items-center justify-center p-4 font-body"
    >
      <div class="relative bg-white rounded-bm-xl shadow-xl w-full max-w-md p-6">
        <p class="text-xs font-semibold tracking-widest text-red-600 uppercase mb-3">Stop BackFunds</p>
        <h2 class="font-heading-primary font-semibold text-xl text-[#0F1117] mb-3">Stop BackFunds permanently?</h2>
        <p class="text-sm text-[#5C5E63] mb-4">Stopping ends your BackFunds service. Your Back Market account is unaffected, but daily advances will end.</p>
        <ul class="space-y-2 mb-6">
          <li class="flex items-start gap-2 text-sm text-[#5C5E63]">
            <span class="text-amber-600 mt-0.5">!</span>
            <span>Any outstanding advance must be repaid from your next Back Market payouts before BackFunds closes</span>
          </li>
          <li class="flex items-start gap-2 text-sm text-[#5C5E63]">
            <span class="text-amber-600 mt-0.5">!</span>
            <span>You can reapply later, but you'll need to go through the full application again</span>
          </li>
          <li class="flex items-start gap-2 text-sm text-[#5C5E63]">
            <span class="text-green-600 mt-0.5">✓</span>
            <span>If you just need a break, pausing is reversible — try that first</span>
          </li>
        </ul>
        <div class="flex gap-3 justify-end">
          <button type="button" class="prototype-hotspot text-sm font-semibold text-[#0F1117] px-5 py-2.5 rounded-bm hover:bg-gray-50 transition-colors" @click="showStopConfirm = false">Cancel</button>
          <button type="button" class="prototype-hotspot bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-bm px-5 py-2.5 transition-colors" @click="confirmStop">Yes, stop BackFunds</button>
        </div>
      </div>
    </div>

    <!-- ═════════ Dropped Concept overlay ═════════ -->
    <div
      v-if="showDroppedModal"
      class="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4 font-body"
    >
      <div class="relative bg-white rounded-bm-xl shadow-xl w-full max-w-md">
        <div class="p-8 text-center">
          <div class="w-12 h-12 mx-auto mb-5 rounded-full bg-[#F2F3F7] flex items-center justify-center">
            <svg class="w-5 h-5 text-[#5C5E63]" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18M7.254 17.806A7.5 7.5 0 0 0 17.806 7.254L7.254 17.806M12 4.5a7.5 7.5 0 0 0-5.807 12.245L16.745 6.193A7.467 7.467 0 0 0 12 4.5" clip-rule="evenodd" fill="currentColor"/></svg>
          </div>
          <p class="text-xs font-semibold tracking-widest text-[#5C5E63] uppercase mb-2">Concept {{ activeConcept }}</p>
          <h2 class="font-heading-primary font-semibold text-2xl text-[#0F1117] mb-3">Dropped on April 23rd</h2>
          <p class="text-sm text-[#5C5E63] leading-relaxed mb-8">Kept for reference.</p>
          <button
            class="prototype-hotspot w-full bg-[#0F1117] hover:opacity-80 text-white font-semibold rounded-bm px-5 py-3 text-sm transition-opacity"
            @click="showDroppedModal = false"
          >
            View it anyway
          </button>
        </div>
      </div>
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
