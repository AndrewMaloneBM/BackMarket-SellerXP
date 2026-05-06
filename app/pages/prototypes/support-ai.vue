<script setup lang="ts">
import type { PrototypeConcept } from '~/composables/usePrototypeSidebar'

definePageMeta({ layout: false })

const NAV_ITEMS = ['Home', 'Insights', 'Customer Care', 'Listings', 'Orders', 'Opportunities', 'Money', 'Options', 'Seller Support'] as const
const SELLER_NAME = 'TechRenew GmbH'
const CHAT_USER_NAME = 'TechRenew GmbH'
const DROPPED_CONCEPTS: number[] = []

const activeNavItem = ref('Home')
const activeSubStateId = ref('')

const drawerOpen = ref(false)
const chatInput = ref('')
const chatLoading = ref(false)

interface ChatMessage {
  role: 'ai' | 'user'
  text: string
  bullets?: string[]
  source?: string
  showFeedback?: boolean
  feedbackGiven?: 'up' | 'down' | null
  learnMore?: boolean
  showContactSupport?: boolean
  isError?: boolean
}

const GREETING: ChatMessage = {
  role: 'ai',
  text: `Hi, I'm Support AI 👋\n\nGot a question about Back Market's policies, orders, listings, or more? I can help by searching the Seller Support Center for answers.`,
  learnMore: true,
}

const SCRIPTED_RESPONSES: Array<{ match: (t: string) => boolean; response: ChatMessage }> = [
  {
    match: (t) => /error/i.test(t),
    response: {
      role: 'ai',
      text: 'Something went wrong while processing your request. Please try again.',
      isError: true,
    },
  },
  {
    match: (t) => /suspend/i.test(t),
    response: {
      role: 'ai',
      text: `I'm sorry to hear that. Account suspension with pending orders is urgent and needs immediate attention from our support team. This isn't something I can resolve directly, but they can help you right away.`,
      showContactSupport: true,
    },
  },
  {
    match: (t) => /grade|cracked|screen|damaged/i.test(t),
    response: {
      role: 'ai',
      text: `A phone with a cracked screen should be graded D (Damaged) on Back Market.\n\nThe quality charter defines a cracked screen as a visible structural defect that affects the product's appearance beyond normal wear and tear. Even if the screen is still functional, a crack disqualifies the product from grades A, B, and C.\n\nKey points to keep in mind:`,
      bullets: [
        'The crack must be clearly disclosed in the listing description',
        'Photos showing the damage are required',
        'The device must still be fully functional to be listed at all',
      ],
      source: 'Back Market Quality Charter — Grading Definitions',
      showFeedback: true,
      feedbackGiven: null,
    },
  },
]

const chatMessages = ref<ChatMessage[]>([GREETING])

async function sendMessage() {
  const text = chatInput.value.trim()
  if (!text || chatLoading.value) return
  chatMessages.value.push({ role: 'user', text })
  chatInput.value = ''
  chatLoading.value = true
  await new Promise(r => setTimeout(r, 1500))
  const scripted = SCRIPTED_RESPONSES.find(s => s.match(text))
  chatMessages.value.push(scripted ? { ...scripted.response } : {
    role: 'ai',
    text: `I wasn't able to find a relevant answer for that in the Seller Support Center. Our support team will be able to help you directly.`,
    showContactSupport: true,
  })
  chatLoading.value = false
}

function retryLastMessage() {
  const errorIdx = chatMessages.value.findLastIndex(m => m.isError)
  if (errorIdx === -1) return
  const prev = chatMessages.value[errorIdx - 1]
  if (prev?.role === 'user') {
    chatInput.value = prev.text
    chatMessages.value.splice(errorIdx - 1, 2)
  } else {
    chatMessages.value.splice(errorIdx, 1)
  }
}

function clearChat() {
  chatMessages.value = [GREETING]
  chatInput.value = ''
  chatLoading.value = false
}

function giveFeedback(msg: ChatMessage, vote: 'up' | 'down') {
  msg.feedbackGiven = vote
}

const conceptMeta: readonly PrototypeConcept[] = [
  {
    name: 'In development',
    prdFeature: 'Support AI',
    prdMetric: 'Sellers find answers without leaving the back office.',
    pros: ['Persistent entry point — always one click away from any page'],
    cons: ['Header real estate is limited'],
    pages: [
      {
        id: 'home',
        label: 'Home',
        navItem: 'Home',
        changes: [
          '✦ Support AI chip added to the back office header',
          'Clicking opens the Support AI chat drawer from the right',
        ],
        subStates: [
          { id: 'drawer-greeting',      label: 'Drawer — greeting' },
          { id: 'drawer-loading',       label: 'Drawer — loading' },
          { id: 'drawer-q-and-a',       label: 'Drawer — Q&A response' },
          { id: 'drawer-feedback-up',   label: 'Drawer — positive feedback' },
          { id: 'drawer-feedback-down', label: 'Drawer — negative feedback' },
          { id: 'drawer-no-answer',     label: 'Drawer — no answer' },
          { id: 'drawer-error',         label: 'Drawer — error state' },
        ],
      },
    ],
  },
  {
    name: 'Where we want to be',
    prdFeature: 'Support AI — Future vision',
    prdMetric: 'Sellers resolve issues end-to-end without contacting support.',
    pros: ['Deeper integration with seller workflows', 'Proactive suggestions based on seller context'],
    cons: ['Requires more back-end data access', 'Higher implementation complexity'],
    pages: [
      {
        id: 'future-home',
        label: 'Home',
        navItem: 'Home',
        changes: ['Coming soon — future vision TBD'],
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

const activePageId = computed(() => activePages.value[activeConcept.value - 1] ?? '')

function setActivePage(id: string) {
  activePages.value[activeConcept.value - 1] = id
  drawerOpen.value = false
  chatMessages.value = [{ ...GREETING }]
  chatLoading.value = false
  activeSubStateId.value = ''
}

function handleReset() {
  drawerOpen.value = false
  chatMessages.value = [{ ...GREETING }]
  chatLoading.value = false
  chatInput.value = ''
  activeSubStateId.value = ''
}

const CRACKED_Q = 'What grade do I need to give a phone that has a cracked screen?'
const SUSPENDED_Q = 'My account has been suspended and I have 200 orders to process today.'

function applySubState(subId: string) {
  activeSubStateId.value = subId
  chatLoading.value = false

  const crackedResponse = SCRIPTED_RESPONSES.find(s => s.match(CRACKED_Q))!.response
  const suspendedResponse = SCRIPTED_RESPONSES.find(s => s.match(SUSPENDED_Q))!.response

  switch (subId) {
    case 'drawer-greeting':
      drawerOpen.value = true
      chatMessages.value = [{ ...GREETING }]
      break

    case 'drawer-loading':
      drawerOpen.value = true
      chatMessages.value = [{ ...GREETING }, { role: 'user', text: CRACKED_Q }]
      chatLoading.value = true
      setTimeout(() => {
        chatMessages.value.push({ ...crackedResponse, feedbackGiven: null })
        chatLoading.value = false
      }, 1500)
      break

    case 'drawer-q-and-a':
      drawerOpen.value = true
      chatMessages.value = [{ ...GREETING }, { role: 'user', text: CRACKED_Q }, { ...crackedResponse, feedbackGiven: null }]
      break

    case 'drawer-feedback-up':
      drawerOpen.value = true
      chatMessages.value = [{ ...GREETING }, { role: 'user', text: CRACKED_Q }, { ...crackedResponse, feedbackGiven: 'up' }]
      break

    case 'drawer-feedback-down':
      drawerOpen.value = true
      chatMessages.value = [{ ...GREETING }, { role: 'user', text: CRACKED_Q }, { ...crackedResponse, feedbackGiven: 'down' }]
      break

    case 'drawer-no-answer':
      drawerOpen.value = true
      chatMessages.value = [{ ...GREETING }, { role: 'user', text: SUSPENDED_Q }, { ...suspendedResponse }]
      break

    case 'drawer-error':
      drawerOpen.value = true
      chatMessages.value = [
        { ...GREETING },
        { role: 'user', text: CRACKED_Q },
        { role: 'ai', text: 'Something went wrong while processing your request. Please try again.', isError: true },
      ]
      break
  }
}
</script>

<template>
  <div class="flex h-screen overflow-hidden font-body">

    <!-- Sidebar -->
    <PrototypeSidebar
      title="Support AI"
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
            <img src="/bm-logo.svg" alt="Back Market" class="h-8 w-auto select-none" />
            <span class="ml-4 text-sm text-bm-text-mid">Hello <strong class="font-semibold text-bm-text-hi">{{ SELLER_NAME }}</strong></span>
            <div class="ml-auto flex items-center gap-2">
              <button @click="drawerOpen = true" class="inline-flex items-center gap-1.5 bg-bm-text-hi text-white text-sm font-medium px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                <svg class="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11l-1.5-3.5L3 6l3.5-1.5L8 1z"/>
                  <path d="M13 10l.8 1.8 1.8.8-1.8.8-.8 1.8-.8-1.8-1.8-.8 1.8-.8L13 10z"/>
                </svg>
                Support AI
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

            <!-- Dashboard grid -->
            <div class="grid grid-cols-3 gap-4">

              <!-- Task list -->
              <div class="bg-white rounded-bm-lg border border-bm-border p-5">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2 text-sm font-semibold text-bm-text-hi">
                    <svg class="w-4 h-4 text-bm-text-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>
                    Task list
                  </div>
                  <span class="text-xs text-bm-text-muted flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 9v7.5" /></svg>
                    Tuesday, 7 Nov
                  </span>
                </div>
                <ul class="divide-y divide-bm-border">
                  <li v-for="task in [
                    { label: 'Orders to process', count: 126 },
                    { label: 'Cancelled orders', count: 26 },
                    { label: 'Returns to process', count: 19 },
                    { label: 'After sales tasks', count: 13 },
                    { label: 'Trade-in tasks', count: 22 },
                    { label: 'Matched products', count: 10 },
                  ]" :key="task.label" class="flex items-center justify-between py-2.5 text-sm">
                    <span class="text-bm-text-mid">{{ task.label }}</span>
                    <div class="flex items-center gap-2 text-bm-text-muted">
                      <span class="font-medium text-bm-text-hi">{{ task.count }}</span>
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </div>
                  </li>
                </ul>
              </div>

              <!-- Sale insights -->
              <div class="col-span-2 bg-white rounded-bm-lg border border-bm-border p-5">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2 text-sm font-semibold text-bm-text-hi">
                    <svg class="w-4 h-4 text-bm-text-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                    Sale Insights
                  </div>
                  <div class="flex items-center gap-2">
                    <button class="flex items-center gap-1 text-xs px-2.5 py-1 bg-bm-gray-100 hover:bg-bm-gray-200 rounded-bm border border-bm-border transition-colors text-bm-text-mid">
                      Last 7 days
                      <svg class="w-3.5 h-3.5 text-bm-text-muted" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
                    </button>
                    <button class="text-xs px-2.5 py-1 bg-bm-gray-100 hover:bg-bm-gray-200 rounded-bm border border-bm-border transition-colors text-bm-text-mid">View details</button>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-3">
                  <div v-for="metric in [
                    { label: 'Orders shipped', value: '100,000', change: '+9.5%', period: 'Nov 1–8, 2025' },
                    { label: 'Revenue from shipped orders', value: '10,000 €', change: '+9.5%', period: 'Nov 1–8, 2025' },
                    { label: 'Total refunds (shipping incl.)', value: '10,000 €', change: '+9.5%', period: 'Nov 1–8, 2025' },
                  ]" :key="metric.label" class="bg-bm-surface rounded-bm p-3">
                    <p class="text-xs text-bm-text-muted mb-2">{{ metric.label }}</p>
                    <div class="flex items-baseline gap-2 mb-1">
                      <span class="text-lg font-semibold text-bm-text-hi">{{ metric.value }}</span>
                      <span class="text-xs text-bm-success font-medium">↑ {{ metric.change }}</span>
                    </div>
                    <p class="text-xs text-bm-text-muted">{{ metric.period }}</p>
                  </div>
                </div>
              </div>

              <!-- Trade-in -->
              <div class="bg-white rounded-bm-lg border border-bm-border p-5">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2 text-sm font-semibold text-bm-text-hi">
                    <svg class="w-4 h-4 text-bm-text-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                    Trade-in
                  </div>
                  <div class="flex items-center gap-2">
                    <button class="flex items-center gap-1 text-xs px-2.5 py-1 bg-bm-gray-100 hover:bg-bm-gray-200 rounded-bm border border-bm-border transition-colors text-bm-text-mid">
                      Last 7 days
                      <svg class="w-3.5 h-3.5 text-bm-text-muted" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
                    </button>
                    <button class="text-xs px-2.5 py-1 bg-bm-gray-100 hover:bg-bm-gray-200 rounded-bm border border-bm-border transition-colors text-bm-text-mid">View details</button>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-bm-surface rounded-bm p-3">
                    <p class="text-xs text-bm-text-muted mb-1">Orders received</p>
                    <p class="text-2xl font-semibold text-bm-text-hi">1,158</p>
                    <p class="text-xs text-bm-text-muted mt-1">shipped <span class="font-medium text-bm-text-hi">771</span></p>
                  </div>
                  <div class="bg-bm-surface rounded-bm p-3">
                    <p class="text-xs text-bm-text-muted mb-1">Orders requiring action</p>
                    <p class="text-2xl font-semibold text-bm-text-hi">610</p>
                    <p class="text-xs text-bm-text-muted mt-1">to reply <span class="font-medium text-bm-text-hi">413</span></p>
                  </div>
                </div>
              </div>

              <!-- Wallet -->
              <div class="col-span-2 bg-white rounded-bm-lg border border-bm-border p-5">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2 text-sm font-semibold text-bm-text-hi">
                    <svg class="w-4 h-4 text-bm-text-muted" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18-3a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3m18 0V6" /></svg>
                    Wallet
                  </div>
                  <div class="flex items-center gap-2">
                    <button class="flex items-center gap-1 text-xs px-2.5 py-1 bg-bm-gray-100 hover:bg-bm-gray-200 rounded-bm border border-bm-border transition-colors text-bm-text-mid">
                      Euro
                      <svg class="w-3.5 h-3.5 text-bm-text-muted" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" /></svg>
                    </button>
                    <button class="text-xs px-2.5 py-1 bg-bm-gray-100 hover:bg-bm-gray-200 rounded-bm border border-bm-border transition-colors text-bm-text-mid">View details</button>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-3">
                  <div v-for="wallet in [
                    { label: 'Balance', value: '€24,310.50', sub: 'Available to withdraw' },
                    { label: 'Pending payout', value: '€18,740.00', sub: 'Expected D+7' },
                    { label: 'Next payout date', value: 'Nov 14', sub: 'In 7 days' },
                  ]" :key="wallet.label" class="bg-bm-surface rounded-bm p-3">
                    <p class="text-xs text-bm-text-muted mb-2">{{ wallet.label }}</p>
                    <p class="text-xl font-semibold text-bm-text-hi">{{ wallet.value }}</p>
                    <p class="text-xs text-bm-text-muted mt-1">{{ wallet.sub }}</p>
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
          <div class="flex items-center px-6 py-4 border-b border-bm-border flex-shrink-0">
            <button @click="clearChat" class="text-sm text-bm-text-muted hover:text-bm-text-hi transition-colors">Clear chat</button>
            <span class="flex-1 text-center text-sm font-semibold text-bm-text-hi">Support AI</span>
            <button @click="drawerOpen = false" class="w-8 h-8 flex items-center justify-center rounded-bm hover:bg-bm-gray-100 text-bm-text-muted hover:text-bm-text-hi transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>

          <!-- Messages -->
          <div class="flex-1 overflow-y-auto p-6 space-y-5">

            <template v-for="(msg, i) in chatMessages" :key="i">

              <!-- User message -->
              <div v-if="msg.role === 'user'" class="bg-static-default-low rounded-bm-lg p-4">
                <div class="flex items-center gap-2.5 mb-1.5">
                  <div class="w-8 h-8 rounded-full bg-bm-gray-300 flex items-center justify-center flex-shrink-0">
                    <span class="text-sm font-semibold text-bm-text-mid">{{ CHAT_USER_NAME[0] }}</span>
                  </div>
                  <span class="text-sm font-semibold text-bm-text-hi">{{ CHAT_USER_NAME }}</span>
                </div>
                <p class="text-sm text-bm-text-mid leading-relaxed pl-10">{{ msg.text }}</p>
              </div>

              <!-- AI message -->
              <div v-else class="flex gap-3">
                <div class="w-9 h-9 rounded-full bg-[#6B5CE7] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <img src="/bm-avatar.svg" class="w-5 h-5 invert" alt="" />
                </div>
                <div class="flex-1">
                  <p class="text-sm font-semibold text-bm-text-hi mb-2">Support AI</p>
                  <div class="bg-static-default-low rounded-bm-lg p-4">
                  <p class="text-sm text-bm-text-mid leading-relaxed whitespace-pre-line">{{ msg.text }}</p>
                  <p v-if="msg.learnMore" class="text-sm font-semibold text-bm-text-hi mt-3">I can't provide legal, financial, or professional advice. <a href="#" class="underline hover:opacity-75">Learn more</a></p>
                  <!-- Bullets -->
                  <ul v-if="msg.bullets?.length" class="mt-3 space-y-1.5">
                    <li v-for="bullet in msg.bullets" :key="bullet" class="flex items-start gap-2 text-sm text-bm-text-mid">
                      <span class="text-bm-text-muted mt-0.5 select-none">·</span>
                      <span>{{ bullet }}</span>
                    </li>
                  </ul>
                  <!-- Source -->
                  <a v-if="msg.source" href="#" class="mt-4 flex items-center gap-1.5 text-sm font-medium text-bm-text-hi underline underline-offset-2 hover:opacity-75 transition-opacity">
                    <span>📄</span>
                    Source: {{ msg.source }}
                  </a>
                  <!-- Try again (error state) -->
                  <div v-if="msg.isError" class="mt-4">
                    <button @click="retryLastMessage" class="px-4 py-2 bg-bm-text-hi text-white text-sm font-medium rounded-bm hover:opacity-90 transition-opacity">
                      Try again
                    </button>
                  </div>
                  <!-- Contact support (no-answer state) -->
                  <div v-if="msg.showContactSupport" class="mt-4">
                    <button class="inline-flex items-center gap-2 px-4 py-2 bg-bm-gray-100 hover:bg-bm-gray-200 rounded-full text-sm font-medium text-bm-text-hi border border-bm-border transition-colors">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"/></svg>
                      Contact support
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                  <!-- Feedback -->
                  <div v-if="msg.showFeedback" class="mt-4 space-y-3">
                    <div class="flex items-center gap-2">
                      <span class="text-sm text-bm-text-muted">Was this helpful?</span>
                      <button
                        @click="giveFeedback(msg, 'up')"
                        :class="['w-8 h-8 rounded-full border flex items-center justify-center transition-colors', msg.feedbackGiven === 'up' ? 'bg-bm-text-hi border-bm-text-hi text-white' : 'border-bm-border hover:border-bm-gray-400 text-bm-text-muted']"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.669A1.989 1.989 0 013.9 18h-.6a1.5 1.5 0 01-1.5-1.5v-6a1.5 1.5 0 011.5-1.5h.6a2 2 0 011.978 1.698c.088.504.13 1.022.13 1.552a11.92 11.92 0 01-.086 1.423L5.904 18.67z"/></svg>
                      </button>
                      <button
                        @click="giveFeedback(msg, 'down')"
                        :class="['w-8 h-8 rounded-full border flex items-center justify-center transition-colors', msg.feedbackGiven === 'down' ? 'bg-bm-text-hi border-bm-text-hi text-white' : 'border-bm-border hover:border-bm-gray-400 text-bm-text-muted']"
                      >
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 00.303-.54m.023-8.25H16.48a4.5 4.5 0 01-1.423-.23l-3.114-1.04a4.5 4.5 0 00-1.423-.23H6.504c-.618 0-1.217.247-1.605.729A11.95 11.95 0 002.25 12c0 .434.023.863.068 1.285C2.427 14.306 3.346 15 4.372 15h3.126c.618 0 .991.724.725 1.282A7.471 7.471 0 007.5 19.5a2.25 2.25 0 002.25 2.25.75.75 0 00.75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 002.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384"/></svg>
                      </button>
                      <span v-if="msg.feedbackGiven" class="text-sm text-bm-text-muted">Thanks! Your feedback helps us improve.</span>
                    </div>
                    <!-- Still need help — thumbs down only -->
                    <div v-if="msg.feedbackGiven === 'down'" class="flex items-center gap-3">
                      <span class="text-sm text-bm-text-muted">Still need help?</span>
                      <button class="inline-flex items-center gap-2 px-4 py-2 bg-bm-gray-100 hover:bg-bm-gray-200 rounded-full text-sm font-medium text-bm-text-hi border border-bm-border transition-colors">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"/></svg>
                        Contact support
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  </div>
                  </div>
                </div>
              </div>

            </template>

            <!-- Loading state -->
            <div v-if="chatLoading" class="flex gap-3">
              <div class="w-9 h-9 rounded-full bg-[#6B5CE7] flex items-center justify-center flex-shrink-0 mt-0.5">
                <img src="/bm-avatar.svg" class="w-5 h-5 invert" alt="" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-bm-text-hi mb-2">Support AI</p>
                <div class="flex items-center gap-2 text-sm text-bm-text-muted">
                  <svg class="w-4 h-4 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"/></svg>
                  Reading up...
                </div>
              </div>
            </div>

          </div>

          <!-- Input area -->
          <div class="border-t border-bm-border p-4 flex-shrink-0">
            <form @submit.prevent="sendMessage" class="flex gap-2">
              <input
                v-model="chatInput"
                type="text"
                placeholder="Describe your issue"
                class="flex-1 text-sm px-4 py-2.5 border border-bm-border rounded-bm focus:outline-none focus:border-bm-text-hi bg-static-default-low text-bm-text-hi placeholder-bm-text-muted"
              />
              <button
                type="submit"
                :disabled="!chatInput.trim() || chatLoading"
                class="w-10 h-10 bg-bm-text-hi text-white rounded-bm flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>
              </button>
            </form>
            <p class="text-xs text-bm-text-muted mt-2">Support AI can make mistakes. Do not share personal details (e.g., identification, bank codes, passwords).</p>
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
