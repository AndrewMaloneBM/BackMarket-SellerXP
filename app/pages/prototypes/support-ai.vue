<script setup lang="ts">
import type { PrototypeConcept } from '~/composables/usePrototypeSidebar'

definePageMeta({ layout: false })

const NAV_ITEMS = ['Home', 'Insights', 'Customer Care', 'Listings', 'Orders', 'Opportunities', 'Money', 'Options', 'Seller Support'] as const
const SELLER_NAME = 'TechRenew GmbH'
const DROPPED_CONCEPTS: number[] = []

const activeNavItem = ref('Home')
const activeSubStateId = ref('')

const conceptMeta: readonly PrototypeConcept[] = [
  {
    name: 'Entry point + Chat',
    prdFeature: 'Support AI — Axon',
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
          'Clicking opens the Axon chat drawer from the right',
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

const activePageId = computed(() => activePages.value[activeConcept.value - 1] ?? '')

function setActivePage(id: string) {
  activePages.value[activeConcept.value - 1] = id
}
</script>

<template>
  <div class="flex h-screen overflow-hidden font-body">

    <!-- Sidebar -->
    <PrototypeSidebar
      title="Axon — Support AI"
      :concepts="conceptMeta"
      :active-concept="activeConcept"
      :preview-mode="previewMode"
      :sidebar-open="sidebarOpen"
      :active-page-id="activePageId"
      :active-sub-state-id="activeSubStateId"
      :dropped-concepts="DROPPED_CONCEPTS"
      @update:active-concept="activeConcept = $event"
      @update:preview-mode="previewMode = $event"
      @update:sidebar-open="sidebarOpen = $event"
      @update:active-page-id="setActivePage"
      @set-sub-state="(_, sub) => activeSubStateId = sub"
      @reset="() => {}"
    />

    <!-- Main -->
    <div class="flex-1 flex flex-col overflow-hidden">

      <!-- Header -->
      <div class="sticky top-0 z-30 bg-bm-surface flex-shrink-0">
        <header class="border-b border-bm-border">
          <div class="flex items-center px-8 h-14 gap-4">
            <img src="/bm-logo.svg" alt="Back Market" class="h-8 w-auto select-none" />
            <span class="ml-4 text-sm text-bm-text-mid">Hello <strong class="font-semibold text-bm-text-hi">{{ SELLER_NAME }}</strong></span>
            <div class="ml-auto flex items-center gap-2">
              <button class="inline-flex items-center gap-1.5 bg-bm-text-hi text-white text-sm font-medium px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity">
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

    </div>
  </div>
</template>
