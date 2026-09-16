<script setup lang="ts">
import type { PrototypeConcept } from '~/composables/usePrototypeSidebar'

definePageMeta({ layout: false })

const runtimeConfig = useRuntimeConfig()
const baseHref = (runtimeConfig.app.baseURL ?? '/').replace(/\/$/, '')

const NAV_ITEMS = ['Home', 'Insights', 'Customer Care', 'Listings', 'Orders', 'Opportunities', 'Money', 'Options', 'Seller Support'] as const
const SELLER_NAME = 'TechRenew GmbH'
const DROPPED_CONCEPTS: number[] = []

const activeNavItem = ref('Home')
const activeSubStateId = ref('')

const drawerOpen = ref(false)
const chatInput = ref('')
const chatLoading = ref(false)
const chatContainer = ref<HTMLElement | null>(null)

async function scrollToBottom() {
  await nextTick()
  if (chatContainer.value) chatContainer.value.scrollTop = chatContainer.value.scrollHeight
}

type InsightType = 'deal' | 'stock' | 'performance'
type InsightStatus = 'new' | 'open' | 'in_progress' | 'acknowledged' | 'completed' | 'dismissed' | 'expired'

interface Insight {
  id: string
  type: InsightType
  status: InsightStatus
  title: string
  reason: string
  freshness: string
  impact: string
  ctaLabel: string
}

type DealFlowState = 'idle' | 'preparing' | 'recommendationReady' | 'reviewingSelection' | 'awaitingConfirmation' | 'submitting' | 'submitted' | 'partialSuccess' | 'failed'
type StockFlowState = 'idle' | 'loadingEvidence' | 'evidenceReady' | 'listingDetails' | 'acknowledged'
type PerformanceFlowState = 'idle' | 'loadingExplanation' | 'explanationReady' | 'acknowledged'

const insights = ref<Insight[]>([
  {
    id: 'deal-1',
    type: 'deal',
    status: 'new',
    title: 'A Deal could help you sell more',
    reason: '18 recommended listings across 4 categories based on recent demand, pricing, and available stock.',
    freshness: 'Updated today',
    impact: 'Estimated 15-20% visibility boost on selected listings',
    ctaLabel: 'Prepare this Deal',
  },
  {
    id: 'stock-1',
    type: 'stock',
    status: 'new',
    title: 'Some strong-selling listings may run low soon',
    reason: '7 listings have fewer than 10 days of estimated stock remaining. Based on recent sales velocity.',
    freshness: 'Updated today',
    impact: 'Estimated €2,400/week in potential sales at risk',
    ctaLabel: 'Show affected listings',
  },
  {
    id: 'perf-1',
    type: 'performance',
    status: 'new',
    title: 'Your on-time shipping rate improved',
    reason: 'On-time shipping increased from 93% to 98% this month across 1,240 orders.',
    freshness: 'This month',
    impact: 'Progress toward Tier 1 payout eligibility',
    ctaLabel: 'Show me what changed',
  },
])

const dealFlowState = ref<DealFlowState>('idle')
const stockFlowState = ref<StockFlowState>('idle')
const performanceFlowState = ref<PerformanceFlowState>('idle')

const dealListings = [
  { id: 'l1', name: 'iPhone 14 128GB', category: 'Smartphones', eligible: true, reason: '' },
  { id: 'l2', name: 'iPhone 13 128GB', category: 'Smartphones', eligible: true, reason: '' },
  { id: 'l3', name: 'iPhone 14 Pro 256GB', category: 'Smartphones', eligible: true, reason: '' },
  { id: 'l4', name: 'Samsung Galaxy S22', category: 'Smartphones', eligible: true, reason: '' },
  { id: 'l5', name: 'iPhone 13 Pro 256GB', category: 'Smartphones', eligible: true, reason: '' },
  { id: 'l6', name: 'MacBook Air M2', category: 'Laptops', eligible: true, reason: '' },
  { id: 'l7', name: 'MacBook Pro 14"', category: 'Laptops', eligible: true, reason: '' },
  { id: 'l8', name: 'iPad Air 5th gen', category: 'Tablets', eligible: true, reason: '' },
  { id: 'l9', name: 'iPad Pro 11"', category: 'Tablets', eligible: true, reason: '' },
  { id: 'l10', name: 'iPhone 12 64GB', category: 'Smartphones', eligible: true, reason: '' },
  { id: 'l11', name: 'iPhone 14 Pro Max', category: 'Smartphones', eligible: true, reason: '' },
  { id: 'l12', name: 'Samsung Galaxy Tab S8', category: 'Tablets', eligible: true, reason: '' },
  { id: 'l13', name: 'MacBook Air M1', category: 'Laptops', eligible: true, reason: '' },
  { id: 'l14', name: 'iPhone SE 2022', category: 'Smartphones', eligible: false, reason: 'Margin below minimum threshold' },
  { id: 'l15', name: 'iPad 9th gen', category: 'Tablets', eligible: false, reason: 'Margin below minimum threshold' },
  { id: 'l16', name: 'Samsung Galaxy A53', category: 'Smartphones', eligible: false, reason: 'Already in an active Deal' },
  { id: 'l17', name: 'iPhone 13 mini', category: 'Smartphones', eligible: true, reason: '' },
  { id: 'l18', name: 'MacBook Pro 16"', category: 'Laptops', eligible: true, reason: '' },
]

const dealSelectedIds = ref<Set<string>>(new Set(dealListings.filter(l => l.eligible).map(l => l.id)))

const stockListings = [
  { name: 'iPhone 14 128GB', daysLeft: 4, velocity: '8.2/day', trend: '↑', atRisk: '€820/week' },
  { name: 'iPhone 13 128GB', daysLeft: 6, velocity: '5.1/day', trend: '↑', atRisk: '€510/week' },
  { name: 'iPhone 14 Pro 256GB', daysLeft: 7, velocity: '3.4/day', trend: '→', atRisk: '€340/week' },
  { name: 'Samsung Galaxy S22', daysLeft: 8, velocity: '2.8/day', trend: '↑', atRisk: '€280/week' },
  { name: 'MacBook Air M2', daysLeft: 9, velocity: '1.2/day', trend: '→', atRisk: '€240/week' },
  { name: 'iPhone 13 Pro 256GB', daysLeft: 9, velocity: '2.1/day', trend: '↓', atRisk: '€150/week' },
  { name: 'iPad Air 5th gen', daysLeft: 10, velocity: '0.8/day', trend: '→', atRisk: '€60/week' },
]

interface ChatMessage {
  role: 'ai' | 'user'
  text: string
  bullets?: string[]
  source?: string
  showFeedback?: boolean
  feedbackGiven?: 'up' | 'down' | null
  isError?: boolean
  responsePills?: Array<{ label: string; action: string }>
  responsePillsUsed?: boolean
  ctaButton?: { label: string; action?: string; navItem?: string }
  note?: string
  basedOn?: string
  insightCards?: boolean
  dealRecommendation?: boolean
  dealReviewList?: boolean
  dealConfirmSummary?: boolean
  dealSubmitting?: boolean
  dealResult?: 'success' | 'partial' | 'failed'
  stockListings?: boolean
  performanceDetails?: boolean
  staleWarning?: boolean
  persistNotice?: boolean
  isTopicSelection?: boolean
}

const chatMessages = ref<ChatMessage[]>([])

watch([() => chatMessages.value.length, chatLoading], scrollToBottom)

const attentionCount = computed(() => {
  return insights.value.filter(i =>
    i.status === 'new' || i.status === 'open' || i.status === 'in_progress'
  ).length
})

const badgeLabel = computed(() => {
  const c = attentionCount.value
  if (c === 0) return ''
  if (c > 3) return '3+'
  return String(c)
})

function getInsight(id: string) {
  return insights.value.find(i => i.id === id)
}

function openDrawer() {
  drawerOpen.value = true
  if (chatMessages.value.length === 0) {
    showGreeting()
  }
}

function showGreeting() {
  const inProgress = insights.value.filter(i => i.status === 'in_progress')
  const newItems = insights.value.filter(i => i.status === 'new')

  let text: string
  if (inProgress.length > 0 || newItems.length === 0) {
    const parts: string[] = []
    if (inProgress.length > 0) parts.push(`${inProgress.length} insight${inProgress.length > 1 ? 's' : ''} in progress`)
    if (newItems.length > 0) parts.push(`${newItems.length} new item${newItems.length > 1 ? 's' : ''} to review`)
    text = `You have ${parts.join(' and ')}. Select one to explore it, or ask me anything about your business.`
  } else {
    text = `I found ${newItems.length} things worth your attention based on your recent activity. Select one to explore it, or ask me anything about your business.`
  }

  chatMessages.value = [{
    role: 'ai',
    text,
    insightCards: true,
  }]
}

function selectInsight(id: string) {
  const insight = getInsight(id)
  if (!insight) return

  if (insight.status === 'new') insight.status = 'open'

  chatMessages.value.push({
    role: 'user',
    text: insight.title,
    isTopicSelection: true,
  })

  if (insight.type === 'deal') startDealFlow(insight)
  else if (insight.type === 'stock') startStockFlow(insight)
  else if (insight.type === 'performance') startPerformanceFlow(insight)
}

async function startDealFlow(insight: Insight) {
  if (insight.status === 'completed') return
  insight.status = 'in_progress'
  dealFlowState.value = 'preparing'
  chatLoading.value = true
  await new Promise(r => setTimeout(r, 1200))
  chatLoading.value = false

  chatMessages.value.push({
    role: 'ai',
    text: `I analysed your recent demand, pricing, and available stock. Here's what I found:`,
    dealRecommendation: true,
    responsePills: [
      { label: 'Continue with all eligible listings', action: 'deal-continue' },
      { label: 'Review and adjust selection', action: 'deal-review' },
    ],
  })
  dealFlowState.value = 'recommendationReady'
}

async function startStockFlow(insight: Insight) {
  if (insight.status === 'acknowledged') return
  insight.status = 'in_progress'
  stockFlowState.value = 'loadingEvidence'
  chatLoading.value = true
  await new Promise(r => setTimeout(r, 1200))
  chatLoading.value = false

  chatMessages.value.push({
    role: 'ai',
    text: `Here's the stock forecast for your top-selling listings. The estimate is based on recent sales velocity and was updated today.\n\nImportant: this is a projection, not a real-time stock count. Actual remaining stock may vary.`,
    bullets: [
      '7 listings have fewer than 10 days of estimated stock remaining',
      'Ranking is by days remaining, then by sales velocity',
      'Sales at risk is estimated from current daily run-rate',
    ],
    basedOn: 'Sales velocity (last 14 days), active listings, order history',
    stockListings: true,
    responsePills: [
      { label: 'Acknowledge', action: 'stock-ack' },
      { label: 'Dismiss', action: 'stock-dismiss' },
    ],
  })
  stockFlowState.value = 'evidenceReady'
}

async function startPerformanceFlow(insight: Insight) {
  if (insight.status === 'acknowledged') return
  insight.status = 'in_progress'
  performanceFlowState.value = 'loadingExplanation'
  chatLoading.value = true
  await new Promise(r => setTimeout(r, 1200))
  chatLoading.value = false

  chatMessages.value.push({
    role: 'ai',
    text: `Your on-time shipping rate went from 93% to 98% this month. That's a meaningful improvement across 1,240 orders.\n\nHere's what changed:`,
    bullets: [
      'Processing time: down from 1.4 days to 0.9 days average',
      'Late handovers: dropped from 89 to 25 incidents',
      'Fulfilment consistency: 96% of orders shipped within SLA (up from 88%)',
      'Delivery-related contacts: down 31%',
    ],
    note: 'I can see the improvement correlates with faster processing, but I can\'t confirm a single cause. Multiple factors likely contributed.',
    basedOn: 'Order metrics (this month vs last month), shipping carrier data, customer contact logs',
    performanceDetails: true,
    responsePills: [
      { label: 'Acknowledge', action: 'perf-ack' },
      { label: 'Dismiss', action: 'perf-dismiss' },
    ],
  })
  performanceFlowState.value = 'explanationReady'
}

async function handleResponsePill(msg: ChatMessage, action: string) {
  msg.responsePillsUsed = true

  if (action === 'deal-continue') {
    chatMessages.value.push({ role: 'user', text: 'Continue with all eligible listings' })
    showDealConfirmation()
  } else if (action === 'deal-review') {
    chatMessages.value.push({ role: 'user', text: 'Review and adjust selection' })
    dealFlowState.value = 'reviewingSelection'
    chatMessages.value.push({
      role: 'ai',
      text: `Here are all 18 recommended listings. Eligible ones are selected by default. You can remove any you don't want in this Deal.`,
      dealReviewList: true,
      responsePills: [
        { label: 'Confirm selection', action: 'deal-confirm-review' },
      ],
    })
  } else if (action === 'deal-confirm-review') {
    chatMessages.value.push({ role: 'user', text: 'Confirm selection' })
    showDealConfirmation()
  } else if (action === 'stock-ack') {
    chatMessages.value.push({ role: 'user', text: 'Acknowledge' })
    const insight = getInsight('stock-1')!
    insight.status = 'acknowledged'
    stockFlowState.value = 'acknowledged'
    chatMessages.value.push({
      role: 'ai',
      text: `Got it. I'll keep this insight available but it won't count in your attention badge anymore. If the stock risk changes significantly, I'll surface it again.`,
    })
  } else if (action === 'stock-dismiss') {
    chatMessages.value.push({ role: 'user', text: 'Dismiss' })
    const insight = getInsight('stock-1')!
    insight.status = 'dismissed'
    stockFlowState.value = 'idle'
    chatMessages.value.push({
      role: 'ai',
      text: `Dismissed. I won't show this insight again unless the risk level changes materially.`,
    })
  } else if (action === 'perf-ack') {
    chatMessages.value.push({ role: 'user', text: 'Acknowledge' })
    const insight = getInsight('perf-1')!
    insight.status = 'acknowledged'
    performanceFlowState.value = 'acknowledged'
    chatMessages.value.push({
      role: 'ai',
      text: `Noted. Your shipping improvement is reflected in your performance metrics. This won't appear as an attention item anymore.`,
    })
  } else if (action === 'perf-dismiss') {
    chatMessages.value.push({ role: 'user', text: 'Dismiss' })
    const insight = getInsight('perf-1')!
    insight.status = 'dismissed'
    performanceFlowState.value = 'idle'
    chatMessages.value.push({
      role: 'ai',
      text: `Dismissed. I won't surface this again.`,
    })
  }
}

function showDealConfirmation() {
  const eligibleCount = dealListings.filter(l => l.eligible).length
  const selectedCount = dealSelectedIds.value.size
  const categories = [...new Set(dealListings.filter(l => dealSelectedIds.value.has(l.id)).map(l => l.category))]
  const excludedCount = dealListings.filter(l => !l.eligible).length

  dealFlowState.value = 'awaitingConfirmation'
  chatMessages.value.push({
    role: 'ai',
    text: `Here's your final Deal summary:`,
    dealConfirmSummary: true,
    bullets: [
      `Listings to include: ${selectedCount}`,
      `Eligible listings: ${eligibleCount}`,
      `Excluded: ${excludedCount} (margin threshold or active Deal)`,
      `Categories: ${categories.join(', ')}`,
      `Estimated visibility boost: 15-20% on selected listings`,
    ],
    note: 'This will create a Deal campaign pending approval. It won\'t go live until approved.',
    responsePills: [
      { label: `Submit Deal for ${selectedCount} listings`, action: 'deal-submit' },
    ],
  })
}

async function submitDeal() {
  const lastMsg = chatMessages.value[chatMessages.value.length - 1]
  if (lastMsg.responsePills) lastMsg.responsePillsUsed = true

  const count = dealSelectedIds.value.size
  chatMessages.value.push({ role: 'user', text: `Submit Deal for ${count} listings` })

  dealFlowState.value = 'submitting'
  chatLoading.value = true
  await new Promise(r => setTimeout(r, 2000))
  chatLoading.value = false

  const insight = getInsight('deal-1')!
  const partialCount = Math.max(0, count - 2)

  dealFlowState.value = 'partialSuccess'
  insight.status = 'completed'
  chatMessages.value.push({
    role: 'ai',
    text: `The Deal was submitted for ${partialCount} listings. 2 listings were excluded because their current margin was below the minimum threshold. The campaign is pending approval.`,
    dealResult: 'partial',
    bullets: [
      `Submitted: ${partialCount} listings`,
      'Excluded at submission: 2 (margin below threshold)',
      'Status: Pending approval',
    ],
    note: 'You can review the excluded listings below. The Deal won\'t go live until it\'s approved.',
    responsePills: [
      { label: 'Close this insight', action: 'deal-close' },
    ],
  })
}

function closeDealInsight() {
  const lastMsg = chatMessages.value[chatMessages.value.length - 1]
  if (lastMsg.responsePills) lastMsg.responsePillsUsed = true
  chatMessages.value.push({ role: 'user', text: 'Close this insight' })
  chatMessages.value.push({
    role: 'ai',
    text: `This insight is now closed. The Deal campaign is pending approval. You can track its status in Opportunities.`,
    ctaButton: { label: 'Go to Opportunities →', navItem: 'Opportunities' },
  })
}

function dismissInsight(id: string) {
  const insight = getInsight(id)
  if (!insight) return
  insight.status = 'dismissed'
  if (insight.type === 'stock') stockFlowState.value = 'idle'
  if (insight.type === 'performance') performanceFlowState.value = 'idle'

  chatMessages.value.push({
    role: 'user',
    text: `Dismiss: ${insight.title}`,
    isTopicSelection: true,
  })
  chatMessages.value.push({
    role: 'ai',
    text: `Dismissed. I won't surface this insight again unless the underlying condition changes materially.`,
  })
}

function toggleListing(id: string) {
  if (dealSelectedIds.value.has(id)) {
    dealSelectedIds.value.delete(id)
  } else {
    const listing = dealListings.find(l => l.id === id)
    if (listing?.eligible) dealSelectedIds.value.add(id)
  }
  dealSelectedIds.value = new Set(dealSelectedIds.value)
}

function clearChat() {
  chatMessages.value = []
  chatInput.value = ''
  chatLoading.value = false

  const openInsights = insights.value.filter(i =>
    i.status === 'open' || i.status === 'in_progress' || i.status === 'new'
  )

  if (openInsights.length > 0) {
    chatMessages.value.push({
      role: 'ai',
      text: `The chat was cleared, but your open insights are still available. You can resume an in-progress item or explore a new one.`,
      persistNotice: true,
      insightCards: true,
    })
  } else {
    chatMessages.value.push([{
      role: 'ai',
      text: `The chat was cleared. You have no open insights right now. Ask me anything about your business.`,
    }][0])
  }
}

async function sendMessage() {
  const text = chatInput.value.trim()
  if (!text || chatLoading.value) return
  chatMessages.value.push({ role: 'user', text })
  chatInput.value = ''
  chatLoading.value = true
  await new Promise(r => setTimeout(r, 1200))
  chatMessages.value.push({
    role: 'ai',
    text: `I can help with questions about your listings, orders, payouts, and Back Market policies. For proactive insights, select one of the cards above, or ask me about a specific topic.`,
    showFeedback: true,
    feedbackGiven: null,
  })
  chatLoading.value = false
}

function giveFeedback(msg: ChatMessage, vote: 'up' | 'down') {
  msg.feedbackGiven = vote
}

function handleReset() {
  drawerOpen.value = false
  chatMessages.value = []
  chatInput.value = ''
  chatLoading.value = false
  dealFlowState.value = 'idle'
  stockFlowState.value = 'idle'
  performanceFlowState.value = 'idle'
  insights.value.forEach(i => {
    if (i.id === 'deal-1') i.status = 'new'
    if (i.id === 'stock-1') i.status = 'new'
    if (i.id === 'perf-1') i.status = 'new'
  })
}

const conceptMeta: readonly PrototypeConcept[] = [
  {
    name: '🔍 Proactive Insights MVP',
    prdFeature: 'Proactive Seller Insights',
    prdMetric: 'Sellers notice, understand, and explore proactive insights.',
    pros: ['Persistent insight system independent from chat transcript', 'One executable action flow (Deal) with full confirm and result reporting'],
    cons: ['Badge model needs careful tuning to avoid feeling like an unread counter', 'Requires realistic failure and partial success states to be convincing'],
    pages: [
      {
        id: 'home',
        label: 'Home',
        navItem: 'Home',
        changes: [
          '✦ Support AI badge counts high-confidence attention items',
          'Three insight cards: Deal, Stock, Performance',
          'Opening an insight does not reduce the badge',
        ],
        subStates: [
          { id: 'drawer-greeting',             label: 'Drawer — greeting with insight cards' },
          { id: 'drawer-deal-prep',            label: 'Deal — recommendation ready' },
          { id: 'drawer-deal-review',          label: 'Deal — review and adjust' },
          { id: 'drawer-deal-confirm',         label: 'Deal — awaiting confirmation' },
          { id: 'drawer-deal-submitting',      label: 'Deal — submitting' },
          { id: 'drawer-deal-success',         label: 'Deal — submitted successfully' },
          { id: 'drawer-deal-partial',         label: 'Deal — partial success' },
          { id: 'drawer-deal-failed',          label: 'Deal — failed' },
          { id: 'drawer-deal-resume',          label: 'Deal — resume after clearing chat' },
          { id: 'drawer-stock-evidence',       label: 'Stock — evidence ready' },
          { id: 'drawer-stock-listings',       label: 'Stock — listing details' },
          { id: 'drawer-stock-acknowledged',   label: 'Stock — acknowledged' },
          { id: 'drawer-performance-explain',  label: 'Performance — explanation ready' },
          { id: 'drawer-performance-ack',      label: 'Performance — acknowledged' },
          { id: 'drawer-stale-data',           label: 'Failure — stale data warning' },
          { id: 'drawer-permission',           label: 'Failure — permission limitation' },
          { id: 'drawer-insight-expired',      label: 'Failure — insight expired' },
          { id: 'drawer-cleared-persist',      label: 'Chat cleared — insights persist' },
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
} = usePrototypeSidebar(conceptMeta)

watch(activeConcept, () => {
  handleReset()
})

const activePageId = computed(() => activePages.value[activeConcept.value - 1] ?? '')

function setActivePage(id: string) {
  activePages.value[activeConcept.value - 1] = id
  activeSubStateId.value = ''
  if (id === 'home') {
    handleReset()
  }
}

const dealEligibleCount = computed(() => dealListings.filter(l => l.eligible).length)
const dealExcludedListings = computed(() => dealListings.filter(l => !l.eligible))
</script>

<template>
  <div class="flex h-screen overflow-hidden font-body">

    <!-- Sidebar -->
    <PrototypeSidebar
      title="Proactive Seller Insights"
      :concepts="conceptMeta"
      :active-concept="activeConcept"
      :preview-mode="previewMode"
      :sidebar-open="sidebarOpen"
      :active-page-id="activePageId"
      :active-sub-state-id="activeSubStateId"
      :dropped-concepts="DROPPED_CONCEPTS"
      hide-concept-details
      @update:active-concept="activeConcept = $event"
      @update:preview-mode="previewMode = $event"
      @update:sidebar-open="sidebarOpen = $event"
      @update:active-page-id="setActivePage"
      @set-sub-state="(_, sub) => applySubState(sub)"
      @reset="handleReset"
    />

    <!-- Main -->
    <div class="flex-1 flex flex-col overflow-hidden relative">

      <!-- Header -->
      <div class="sticky top-0 z-30 bg-bm-surface flex-shrink-0">
        <header class="border-b border-bm-border">
          <div class="flex items-center px-8 h-14 gap-4">
            <img :src="`${baseHref}/bm-logo.svg`" alt="Back Market" class="h-8 w-auto select-none" />
            <span class="ml-4 text-sm text-bm-text-mid">Hello <strong class="font-semibold text-bm-text-hi">{{ SELLER_NAME }}</strong></span>
            <div class="ml-auto flex items-center gap-2">
              <button @click="openDrawer" class="inline-flex items-center gap-1.5 bg-bm-text-hi text-white text-sm font-medium px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11l-1.5-3.5L3 6l3.5-1.5L8 1z"/>
                  <path d="M13 10l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8L13 10z"/>
                </svg>
                Support AI
                <span
                  v-if="badgeLabel"
                  class="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold rounded-full"
                  :class="attentionCount > 0 ? 'bg-amber-400 text-black' : 'bg-bm-gray-200 text-bm-text-muted'"
                >{{ badgeLabel }}</span>
              </button>
              <button class="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-bm-text-hi bg-bm-gray-100 hover:bg-bm-gray-200 rounded-bm transition-colors">
                EN
                <svg class="w-4 h-4 text-bm-text-muted" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
              </button>
              <button class="w-8 h-8 rounded-full bg-bm-gray-100 border border-bm-border flex items-center justify-center hover:bg-bm-gray-200 transition-colors">
                <svg class="w-4 h-4 text-bm-text-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
              </button>
            </div>
          </div>
        </header>

        <!-- Nav -->
        <nav class="border-b border-bm-border">
          <div class="px-8 flex items-center">
            <button
              v-for="item in NAV_ITEMS"
              :key="item"
              :class="['relative px-4 py-3 text-sm transition-colors border-b-2 whitespace-nowrap', item === activeNavItem ? 'font-semibold text-bm-text-hi border-bm-text-hi' : 'font-normal text-bm-text-muted border-transparent hover:text-bm-text-mid hover:border-bm-gray-300']"
              @click="activeNavItem = item"
            >{{ item }}</button>
          </div>
        </nav>
      </div>

      <!-- Page content -->
      <div class="relative flex-1 overflow-hidden">
        <div class="absolute inset-0 overflow-y-auto bg-bm-surface">
          <div class="px-8 py-6">

            <!-- Page heading -->
            <div class="flex items-center justify-between mb-6">
              <h1 class="text-2xl font-heading-secondary font-semibold text-bm-text-hi">Hello, {{ SELLER_NAME }}!</h1>
              <button class="flex items-center gap-1 px-3 py-1.5 text-sm text-bm-text-hi bg-white hover:bg-bm-gray-100 rounded-bm border border-bm-border transition-colors">
                Euro
                <svg class="w-4 h-4 text-bm-text-muted" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
              </button>
            </div>

            <!-- Dashboard grid (simplified placeholder) -->
            <div class="grid grid-cols-3 gap-4">
              <div class="bg-white rounded-bm-lg border border-bm-border p-5">
                <div class="text-sm font-semibold text-bm-text-hi mb-3">Task list</div>
                <div class="space-y-2">
                  <div v-for="i in 4" :key="i" class="h-3 bg-bm-gray-200 rounded" :style="{ width: `${60 + i * 8}%` }"></div>
                </div>
              </div>
              <div class="col-span-2 bg-white rounded-bm-lg border border-bm-border p-5">
                <div class="text-sm font-semibold text-bm-text-hi mb-3">Sale Insights</div>
                <div class="grid grid-cols-3 gap-3">
                  <div v-for="i in 3" :key="i" class="bg-bm-surface rounded-bm p-3">
                    <div class="w-24 h-3 bg-bm-gray-200 rounded mb-2"></div>
                    <div class="w-16 h-5 bg-bm-gray-200 rounded mb-2"></div>
                    <div class="w-20 h-3 bg-bm-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Drawer backdrop -->
      <Transition name="backdrop">
        <div v-if="drawerOpen" class="absolute inset-0 z-40 bg-black/30" @click="drawerOpen = false" />
      </Transition>

      <!-- Support AI chat drawer -->
      <Transition name="drawer">
        <div v-if="drawerOpen" class="absolute right-0 top-0 bottom-0 z-50 w-[65vw] bg-surface-default-mid flex flex-col border-l border-bm-border shadow-2xl">

          <!-- Drawer header -->
          <div class="flex items-center px-5 py-2.5 border-b border-bm-border flex-shrink-0">
            <button @click="clearChat" class="text-xs text-bm-text-muted hover:text-bm-text-hi transition-colors">Clear chat</button>
            <span class="flex-1 text-center text-sm font-semibold text-bm-text-hi">Support AI</span>
            <button @click="drawerOpen = false" class="w-7 h-7 flex items-center justify-center rounded-bm hover:bg-bm-gray-100 text-bm-text-muted hover:text-bm-text-hi transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Messages -->
          <div ref="chatContainer" class="flex-1 overflow-y-auto px-4 py-3 space-y-3">

            <template v-for="(msg, i) in chatMessages" :key="i">

              <!-- User message -->
              <div v-if="msg.role === 'user'" class="bg-static-default-low rounded-bm-lg p-3">
                <div class="flex items-center gap-2 mb-1">
                  <div class="w-6 h-6 rounded-full bg-bm-gray-300 flex items-center justify-center flex-shrink-0">
                    <span class="text-xs font-semibold text-bm-text-mid">{{ SELLER_NAME[0] }}</span>
                  </div>
                  <span class="text-xs font-semibold text-bm-text-hi">{{ SELLER_NAME }}</span>
                  <span v-if="msg.isTopicSelection" class="text-[9px] font-medium text-bm-text-muted bg-bm-gray-100 px-1.5 py-0.5 rounded-full">Selected topic</span>
                </div>
                <p class="text-xs text-bm-text-mid leading-relaxed pl-8">{{ msg.text }}</p>
              </div>

              <!-- AI message -->
              <div v-else class="flex gap-2">
                <div class="w-7 h-7 rounded-full bg-[#6B5CE7] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <img :src="`${baseHref}/bm-avatar.svg`" class="w-4 h-4 invert" alt="" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-semibold text-bm-text-hi mb-1">Support AI</p>
                  <div class="bg-static-default-low rounded-bm-lg p-3">

                  <p class="text-sm text-bm-text-mid leading-relaxed whitespace-pre-line">{{ msg.text }}</p>

                  <!-- Insight cards -->
                  <div v-if="msg.insightCards" class="mt-3 space-y-2">
                    <div
                      v-for="insight in insights.filter(i => i.status === 'new' || i.status === 'open' || i.status === 'in_progress')"
                      :key="insight.id"
                      class="bg-white rounded-bm border border-bm-border overflow-hidden hover:border-bm-gray-400 transition-colors cursor-pointer"
                      @click="selectInsight(insight.id)"
                    >
                      <div
                        class="h-1"
                        :class="{
                          'bg-purple-500': insight.type === 'deal',
                          'bg-orange-500': insight.type === 'stock',
                          'bg-green-500': insight.type === 'performance',
                        }"
                      ></div>
                      <div class="p-3">
                        <!-- Type label -->
                        <span
                          class="text-xs font-semibold uppercase tracking-wide"
                          :class="{
                            'text-purple-600': insight.type === 'deal',
                            'text-orange-600': insight.type === 'stock',
                            'text-green-600': insight.type === 'performance',
                          }"
                        >{{ insight.type === 'deal' ? 'Deal opportunity' : insight.type === 'stock' ? 'Stock alert' : 'Performance highlight' }}</span>
                        <!-- Title -->
                        <p class="text-sm font-semibold text-bm-text-hi mt-1 mb-1">{{ insight.title }}</p>
                        <!-- Reason -->
                        <p class="text-sm text-bm-text-mid leading-snug">{{ insight.reason }}</p>
                        <!-- Metadata -->
                        <p class="text-xs text-bm-text-muted mt-2">{{ insight.freshness }} · {{ insight.impact }}</p>
                        <!-- Footer -->
                        <div class="flex items-center justify-between mt-3 pt-2 border-t border-bm-gray-100">
                          <button
                            class="text-sm font-medium text-bm-text-muted hover:text-bm-text-hi transition-colors"
                            @click.stop="dismissInsight(insight.id)"
                          >Dismiss</button>
                          <button
                            class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-bm-text-hi rounded-bm hover:opacity-90 transition-opacity"
                            @click.stop="selectInsight(insight.id)"
                          >{{ insight.ctaLabel }}
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Deal recommendation summary -->
                  <div v-if="msg.dealRecommendation" class="mt-2 bg-white rounded-bm border border-bm-border p-3">
                    <div class="grid grid-cols-4 gap-3 mb-2">
                      <div>
                        <p class="text-[9px] font-semibold uppercase tracking-wide text-bm-text-muted">Recommended</p>
                        <p class="text-base font-semibold text-bm-text-hi">18</p>
                      </div>
                      <div>
                        <p class="text-[9px] font-semibold uppercase tracking-wide text-bm-text-muted">Eligible</p>
                        <p class="text-base font-semibold text-bm-text-hi">{{ dealEligibleCount }}</p>
                      </div>
                      <div>
                        <p class="text-[9px] font-semibold uppercase tracking-wide text-bm-text-muted">Excluded</p>
                        <p class="text-base font-semibold text-orange-600">{{ dealExcludedListings.length }}</p>
                      </div>
                      <div>
                        <p class="text-[9px] font-semibold uppercase tracking-wide text-bm-text-muted">Categories</p>
                        <p class="text-base font-semibold text-bm-text-hi">4</p>
                      </div>
                    </div>
                    <div class="border-t border-bm-border pt-2">
                      <p class="text-[9px] font-semibold uppercase tracking-wide text-bm-text-muted mb-1">Excluded listings</p>
                      <div v-for="l in dealExcludedListings" :key="l.id" class="flex items-center justify-between text-[11px] py-0.5">
                        <span class="text-bm-text-mid">{{ l.name }}</span>
                        <span class="text-bm-text-muted">{{ l.reason }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Deal review list -->
                  <div v-if="msg.dealReviewList" class="mt-2 bg-white rounded-bm border border-bm-border p-3">
                    <div class="max-h-48 overflow-y-auto space-y-0.5">
                      <div
                        v-for="l in dealListings"
                        :key="l.id"
                        class="flex items-center justify-between py-1 px-1.5 rounded hover:bg-bm-gray-50 transition-colors"
                      >
                        <div class="flex items-center gap-2">
                          <input
                            type="checkbox"
                            :checked="dealSelectedIds.has(l.id)"
                            :disabled="!l.eligible"
                            @change="toggleListing(l.id)"
                            class="w-3.5 h-3.5 rounded border-bm-border"
                          />
                          <span class="text-xs text-bm-text-hi">{{ l.name }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="text-[10px] text-bm-text-muted">{{ l.category }}</span>
                          <span v-if="!l.eligible" class="text-[10px] text-orange-600">{{ l.reason }}</span>
                        </div>
                      </div>
                    </div>
                    <p class="text-[11px] text-bm-text-muted mt-1.5">{{ dealSelectedIds.size }} listings selected</p>
                  </div>

                  <!-- Deal confirm summary -->
                  <div v-if="msg.dealConfirmSummary" class="mt-2 bg-white rounded-bm border border-bm-border p-3">
                    <p class="text-[11px] font-semibold text-bm-text-hi mb-1.5">Submission summary</p>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <p class="text-[9px] font-semibold uppercase tracking-wide text-bm-text-muted">Listings to include</p>
                        <p class="text-sm font-semibold text-bm-text-hi">{{ dealSelectedIds.size }}</p>
                      </div>
                      <div>
                        <p class="text-[9px] font-semibold uppercase tracking-wide text-bm-text-muted">Estimated boost</p>
                        <p class="text-sm font-semibold text-green-600">15-20%</p>
                      </div>
                    </div>
                  </div>

                  <!-- Deal submitting state -->
                  <div v-if="msg.dealSubmitting" class="mt-2 flex items-center gap-2 text-xs text-bm-text-muted">
                    <svg class="w-3.5 h-3.5 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/></svg>
                    Submitting Deal...
                  </div>

                  <!-- Deal result -->
                  <div v-if="msg.dealResult === 'partial'" class="mt-2 bg-orange-50 border border-orange-200 rounded-bm p-2.5">
                    <div class="flex items-center gap-2 mb-0.5">
                      <svg class="w-3.5 h-3.5 text-orange-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                      <p class="text-xs font-semibold text-orange-800">Partial success</p>
                    </div>
                    <p class="text-[11px] text-orange-700">The Deal was submitted but 2 listings were excluded at submission time.</p>
                  </div>

                  <div v-if="msg.dealResult === 'success'" class="mt-2 bg-green-50 border border-green-200 rounded-bm p-2.5">
                    <div class="flex items-center gap-2">
                      <svg class="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p class="text-xs font-semibold text-green-800">Deal submitted successfully</p>
                    </div>
                  </div>

                  <div v-if="msg.dealResult === 'failed'" class="mt-2 bg-red-50 border border-red-200 rounded-bm p-2.5">
                    <div class="flex items-center gap-2 mb-0.5">
                      <svg class="w-3.5 h-3.5 text-red-600" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                      <p class="text-xs font-semibold text-red-800">Submission failed</p>
                    </div>
                    <p class="text-[11px] text-red-700">The Deal could not be submitted. Please try again or contact support.</p>
                  </div>

                  <!-- Stock listings table -->
                  <div v-if="msg.stockListings" class="mt-2 bg-white rounded-bm border border-bm-border p-3 overflow-x-auto">
                    <table class="w-full text-[11px]">
                      <thead>
                        <tr class="border-b border-bm-border text-bm-text-muted">
                          <th class="text-left font-semibold py-1.5 pr-2">Listing</th>
                          <th class="text-right font-semibold py-1.5 px-2">Days</th>
                          <th class="text-right font-semibold py-1.5 px-2">Velocity</th>
                          <th class="text-center font-semibold py-1.5 px-2">Trend</th>
                          <th class="text-right font-semibold py-1.5 pl-2">At risk</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="s in stockListings" :key="s.name" class="border-b border-bm-border last:border-0">
                          <td class="py-1.5 pr-2 text-bm-text-hi">{{ s.name }}</td>
                          <td class="py-1.5 px-2 text-right" :class="s.daysLeft <= 6 ? 'text-red-600 font-semibold' : 'text-bm-text-mid'">{{ s.daysLeft }}</td>
                          <td class="py-1.5 px-2 text-right text-bm-text-mid">{{ s.velocity }}</td>
                          <td class="py-1.5 px-2 text-center text-bm-text-mid">{{ s.trend }}</td>
                          <td class="py-1.5 pl-2 text-right text-bm-text-mid">{{ s.atRisk }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Persist notice -->
                  <div v-if="msg.persistNotice" class="mt-2 bg-blue-50 border border-blue-200 rounded-bm p-2 flex items-center gap-2">
                    <svg class="w-3.5 h-3.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" /></svg>
                    <p class="text-[11px] text-blue-800">Insights persist independently from the chat transcript.</p>
                  </div>

                  <!-- Bullets -->
                  <ul v-if="msg.bullets?.length" class="mt-2 space-y-1">
                    <li v-for="bullet in msg.bullets" :key="bullet" class="flex items-start gap-1.5 text-xs text-bm-text-mid">
                      <span class="text-bm-text-muted mt-0.5 select-none">·</span>
                      <span>{{ bullet }}</span>
                    </li>
                  </ul>

                  <!-- Note -->
                  <p v-if="msg.note" class="mt-2 text-xs text-bm-text-mid leading-snug">{{ msg.note }}</p>

                  <!-- Based on -->
                  <p v-if="msg.basedOn" class="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-bm-text-muted">
                    <span>📄</span>
                    Based on: {{ msg.basedOn }}
                  </p>

                  <!-- CTA button -->
                  <div v-if="msg.ctaButton" class="mt-3">
                    <button
                      class="inline-flex items-center gap-2 px-3 py-1.5 bg-bm-text-hi text-white text-xs font-medium rounded-bm hover:opacity-90 transition-opacity"
                      @click="activeNavItem = msg.ctaButton!.navItem ?? 'Money'; drawerOpen = false"
                    >{{ msg.ctaButton.label }}</button>
                  </div>

                  <!-- Response pills -->
                  <div v-if="msg.responsePills?.length && !msg.responsePillsUsed" class="flex flex-wrap gap-2 mt-3">
                    <button
                      v-for="pill in msg.responsePills"
                      :key="pill.label"
                      :class="[
                        'h-auto py-1 px-2.5 text-xs rounded-full border transition-colors whitespace-nowrap',
                        pill.action === 'deal-submit'
                          ? 'bg-bm-text-hi text-white border-bm-text-hi hover:opacity-90'
                          : pill.action === 'deal-close' || pill.action.includes('dismiss')
                            ? 'text-bm-text-muted border-bm-border hover:bg-bm-gray-100'
                            : 'text-bm-text-hi bg-white border-bm-border-action hover:bg-bm-gray-100'
                      ]"
                      @click="pill.action === 'deal-submit' ? submitDeal() : handleResponsePill(msg, pill.action)"
                    >{{ pill.label }}</button>
                  </div>

                  <!-- Feedback -->
                  <div v-if="msg.showFeedback" class="mt-3 space-y-2">
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-bm-text-muted">Was this helpful?</span>
                      <button
                        @click="giveFeedback(msg, 'up')"
                        :class="['w-6 h-6 rounded-full border flex items-center justify-center transition-colors', msg.feedbackGiven === 'up' ? 'bg-bm-text-hi border-bm-text-hi text-white' : 'border-bm-border hover:border-bm-gray-400 text-bm-text-muted']"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.669A1.989 1.989 0 013.9 18h-.6a1.5 1.5 0 01-1.5-1.5v-6a1.5 1.5 0 011.5-1.5h.6a2 2 0 011.978 1.698c.088.504.13 1.022.13 1.552a11.92 11.92 0 01-.086 1.423L5.904 18.67z"/></svg>
                      </button>
                      <button
                        @click="giveFeedback(msg, 'down')"
                        :class="['w-6 h-6 rounded-full border flex items-center justify-center transition-colors', msg.feedbackGiven === 'down' ? 'bg-bm-text-hi border-bm-text-hi text-white' : 'border-bm-border hover:border-bm-gray-400 text-bm-text-muted']"
                      >
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384"/></svg>
                      </button>
                      <span v-if="msg.feedbackGiven" class="text-xs text-bm-text-muted">Thanks!</span>
                    </div>
                  </div>

                  </div>
                </div>
              </div>

            </template>

            <!-- Loading state -->
            <div v-if="chatLoading" class="flex gap-2">
              <div class="w-7 h-7 rounded-full bg-[#6B5CE7] flex items-center justify-center flex-shrink-0 mt-0.5">
                <img :src="`${baseHref}/bm-avatar.svg`" class="w-4 h-4 invert" alt="" />
              </div>
              <div class="flex-1">
                <p class="text-xs font-semibold text-bm-text-hi mb-1">Support AI</p>
                <div class="flex items-center gap-2 text-xs text-bm-text-muted">
                  <svg class="w-3.5 h-3.5 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/></svg>
                  Working on it...
                </div>
              </div>
            </div>

          </div>

          <!-- Input area -->
          <div class="border-t border-bm-border p-3 flex-shrink-0">
            <form @submit.prevent="sendMessage" class="flex gap-2">
              <input
                v-model="chatInput"
                type="text"
                placeholder="Ask me anything about your business"
                :disabled="chatLoading"
                class="flex-1 text-xs px-3 py-2 border border-bm-border rounded-bm focus:outline-none focus:border-bm-text-hi bg-static-default-low text-bm-text-hi placeholder-bm-text-muted disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                :disabled="!chatInput.trim() || chatLoading"
                class="w-8 h-8 bg-bm-text-hi text-white rounded-bm flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
              </button>
            </form>
            <p class="text-[10px] text-bm-text-muted mt-1.5">Support AI can make mistakes. Do not share personal details.</p>
          </div>

        </div>
      </Transition>

    </div>
  </div>
</template>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}
.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}
</style>
