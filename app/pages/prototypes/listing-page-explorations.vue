<script setup lang="ts">
import type { PrototypeConcept } from '~/composables/usePrototypeSidebar'

definePageMeta({ layout: false })

const NAV_ITEMS = ['Home', 'Insights', 'Customer Care', 'Listings', 'Orders', 'Opportunities', 'Money', 'Options', 'Seller Support'] as const
const SELLER_NAME = 'Merchant'
const TABS = ['Active', 'Action needed', 'On hold', 'Archived'] as const

const conceptMeta: readonly PrototypeConcept[] = [
  {
    name: 'Baseline',
    prdFeature: 'Listings page — current state replica',
    prdMetric: 'Faithful starting point for upcoming explorations.',
    pros: ['Mirrors today\'s Back Office'],
    cons: ['No changes yet'],
    pages: [
      {
        id: 'listings',
        label: 'Listings',
        navItem: 'Listings',
        changes: ['Replica of today\'s Listings page — compact rows and one expanded row showing the per-market pricing table'],
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

const activeNavItem = ref<string>('Listings')
const activeTab = ref<string>('Active')

const showMoreFilters = ref(false)
const expandAll = ref(false)
const expandedRows = ref<Set<string>>(new Set(['L1']))

function toggleRow(id: string) {
  const next = new Set(expandedRows.value)
  next.has(id) ? next.delete(id) : next.add(id)
  expandedRows.value = next
}

function isExpanded(id: string) {
  return expandAll.value || expandedRows.value.has(id)
}

const anyExpanded = computed(() => {
  if (expandAll.value) return true
  return expandedRows.value.size > 0
})

interface Market {
  code: string
  flag: string
  active: boolean
}

interface PricingRow {
  country: string
  flag: string
  primary?: boolean
  currency: 'EUR' | 'GBP' | 'SEK'
  minPrice: number
  targetPrice: number
  backBox: { status: 'won' | 'opportunity' | 'offline'; price?: number; note?: string }
  strategy: { type: 'deal-included' | 'visibility-boosted' | 'deal-opportunity' | 'visibility-opportunity' | 'none-available' | 'none'; title?: string; line1?: string; line2?: string }
  actions: Array<{ label: string; variant: 'primary' | 'secondary' | 'flash' }>
}

interface Listing {
  id: string
  thumb: string
  title: string
  sku: string
  grade: string
  sim: string
  newBattery: boolean
  units: number
  markets: Market[]
  competition: 'None' | 'Very low' | 'Low' | 'Medium' | 'High'
  pricing?: PricingRow[]
}

const MARKET_DEFS: Array<[string, string]> = [
  ['AT', '🇦🇹'], ['BE', '🇧🇪'], ['FI', '🇫🇮'], ['FR', '🇫🇷'], ['DE', '🇩🇪'], ['GR', '🇬🇷'], ['IE', '🇮🇪'],
  ['IT', '🇮🇹'], ['NL', '🇳🇱'], ['PT', '🇵🇹'], ['SK', '🇸🇰'], ['ES', '🇪🇸'], ['SE', '🇸🇪'], ['UK', '🇬🇧'],
]

function mkMarkets(overrides: Partial<Record<string, boolean>> = {}): Market[] {
  return MARKET_DEFS.map(([code, flag]) => ({ code, flag, active: overrides[code] ?? true }))
}

const iphone13ProPricing: PricingRow[] = [
  { country: 'France', flag: '🇫🇷', primary: true, currency: 'EUR', minPrice: 475, targetPrice: 520,
    backBox: { status: 'won', price: 475 },
    strategy: { type: 'none-available', title: 'No sales strategy available' },
    actions: [] },
  { country: 'Belgium', flag: '🇧🇪', currency: 'EUR', minPrice: 468, targetPrice: 530,
    backBox: { status: 'won', price: 468 },
    strategy: { type: 'deal-included', title: 'Included in deal', line1: '470.00 € or less', line2: 'You\'re saving up to 5% on commission' },
    actions: [] },
  { country: 'Germany', flag: '🇩🇪', currency: 'EUR', minPrice: 470, targetPrice: 515,
    backBox: { status: 'won', price: 470 },
    strategy: { type: 'visibility-boosted', title: 'Visibility boosted', line1: 'Estimated sales: 200-250 units' },
    actions: [] },
  { country: 'Greece', flag: '🇬🇷', currency: 'EUR', minPrice: 486, targetPrice: 540,
    backBox: { status: 'won', price: 486 },
    strategy: { type: 'deal-opportunity', title: 'Deal opportunity', line1: '475.00 € or less', line2: 'Save up to 5% on commission' },
    actions: [{ label: 'Apply deal price', variant: 'primary' }] },
  { country: 'Ireland', flag: '🇮🇪', currency: 'EUR', minPrice: 507, targetPrice: 530,
    backBox: { status: 'opportunity', price: 493, note: 'Win BackBox to start selling' },
    strategy: { type: 'visibility-opportunity', title: 'Visibility boost', line1: '470.00 €', line2: 'Estimated sales: 200-250 units' },
    actions: [{ label: 'Win BackBox', variant: 'primary' }, { label: 'Visibility boost', variant: 'flash' }] },
  { country: 'Italy', flag: '🇮🇹', currency: 'EUR', minPrice: 501, targetPrice: 550,
    backBox: { status: 'opportunity', price: 481, note: 'Win BackBox to start selling' },
    strategy: { type: 'deal-opportunity', title: 'Deal opportunity', line1: '475.00 € or less', line2: 'Win BackBox to save on commission' },
    actions: [{ label: 'Win BackBox', variant: 'primary' }, { label: 'Apply deal price', variant: 'secondary' }] },
  { country: 'Spain', flag: '🇪🇸', currency: 'EUR', minPrice: 499, targetPrice: 535,
    backBox: { status: 'opportunity', price: 482, note: 'Win BackBox to start selling' },
    strategy: { type: 'none-available', title: 'No sales strategy available' },
    actions: [{ label: 'Win BackBox', variant: 'primary' }] },
  { country: 'Sweden', flag: '🇸🇪', currency: 'SEK', minPrice: 5950, targetPrice: 6900,
    backBox: { status: 'opportunity', price: 5850, note: 'You\'ve got another listing with the BackBox' },
    strategy: { type: 'none-available', title: 'No sales strategy available' },
    actions: [{ label: 'Win BackBox', variant: 'primary' }] },
  { country: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', minPrice: 410, targetPrice: 450,
    backBox: { status: 'offline' },
    strategy: { type: 'none' },
    actions: [] },
]

const listings: Listing[] = [
  { id: 'L1', thumb: 'iphone-blue', title: 'iPhone 13 Pro - 128GB - Natural titanium - Unlocked',
    sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: true, units: 50,
    markets: mkMarkets({ BE: false, IE: false, IT: false, NL: false, SK: false, UK: false }),
    competition: 'Low',
    pricing: iphone13ProPricing },
  { id: 'L2', thumb: 'samsung-s20', title: 'Samsung Galaxy S20 - 128GB - Cosmic Gray - Unlocked',
    sku: '12345-S-BL', grade: 'Excellent', sim: 'Dual SIM', newBattery: true, units: 50,
    markets: mkMarkets({ BE: false, IT: false, NL: false, SK: false, UK: false }),
    competition: 'Medium' },
  { id: 'L3', thumb: 'oneplus-7t', title: 'OnePlus 7T - 128GB - Glacier Blue - Unlocked',
    sku: '12345-S-BL', grade: 'Excellent', sim: 'eSIM', newBattery: true, units: 50,
    markets: mkMarkets({ BE: false, IT: false, NL: false, SK: false, UK: false }),
    competition: 'Medium' },
  { id: 'L4', thumb: 'sony-xperia', title: 'Sony Xperia 5 - 128GB - Black - Unlocked',
    sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: false, units: 0,
    markets: mkMarkets({ BE: false, NL: false, SK: false, UK: false }),
    competition: 'Very low' },
  { id: 'L5', thumb: 'xiaomi-9t', title: 'Xiaomi 9T - 128GB - Carbon Black - Unlocked',
    sku: '12345-S-BL', grade: 'Excellent', sim: 'Dual SIM', newBattery: true, units: 0,
    markets: mkMarkets({ BE: false, IT: false, NL: false, SK: false, UK: false }),
    competition: 'None' },
  { id: 'L6', thumb: 'iphone-13-mid', title: 'iPhone 13 - 128GB - Midnight - Unlocked',
    sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: false, units: 50,
    markets: mkMarkets({ BE: false, IT: false, UK: false }),
    competition: 'Medium' },
  { id: 'L7', thumb: 'samsung-a7', title: 'Samsung Galaxy A7 - 128GB - White - Unlocked',
    sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: true, units: 50,
    markets: mkMarkets({ BE: false, IT: false, UK: false }),
    competition: 'Medium' },
  { id: 'L8', thumb: 'lg-g7', title: 'LG G7 - 128GB - Midnight - Unlocked',
    sku: '12345-S-BL', grade: 'Excellent', sim: 'eSIM', newBattery: false, units: 50,
    markets: mkMarkets({ BE: false, IT: false, UK: false }),
    competition: 'Very low' },
  { id: 'L9', thumb: 'nokia-3310', title: 'Nokia 3310',
    sku: '12345-S-BL', grade: 'Excellent', sim: 'Dual SIM', newBattery: false, units: 50,
    markets: mkMarkets({ BE: false, IT: false, UK: false }),
    competition: 'Very low' },
  { id: 'L10', thumb: 'samsung-s23', title: 'Samsung Galaxy S23 - 128GB - Cosmic Gray - Unlocked',
    sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: true, units: 50,
    markets: mkMarkets({ BE: false, IT: false, UK: false }),
    competition: 'Medium' },
]

function competitionPill(c: Listing['competition']): string {
  switch (c) {
    case 'Low':       return 'bg-orange-100 text-orange-800'
    case 'Medium':    return 'bg-amber-100 text-amber-800'
    case 'Very low':  return 'bg-indigo-50 text-indigo-700'
    case 'None':      return 'bg-yellow-200 text-yellow-900'
    case 'High':      return 'bg-red-100 text-red-800'
  }
}

function thumbBg(thumb: string): string {
  const map: Record<string, string> = {
    'iphone-blue':   'linear-gradient(135deg, #1e3a8a 0%, #60a5fa 100%)',
    'samsung-s20':   'linear-gradient(135deg, #1f2937 0%, #4b5563 100%)',
    'oneplus-7t':    'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
    'sony-xperia':   'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
    'xiaomi-9t':     'linear-gradient(135deg, #831843 0%, #ec4899 100%)',
    'iphone-13-mid': 'linear-gradient(135deg, #111827 0%, #1e293b 100%)',
    'samsung-a7':    'linear-gradient(135deg, #e5e7eb 0%, #cbd5e1 100%)',
    'lg-g7':         'linear-gradient(135deg, #1f2937 0%, #475569 100%)',
    'nokia-3310':    'linear-gradient(135deg, #1c1917 0%, #44403c 100%)',
    'samsung-s23':   'linear-gradient(135deg, #374151 0%, #6b7280 100%)',
  }
  return map[thumb] || 'linear-gradient(135deg, #d1d5db, #9ca3af)'
}

function fmtMoney(amount: number, currency: PricingRow['currency']) {
  const f = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (currency === 'SEK') return `${f} SEK`
  if (currency === 'GBP') return `£${f}`
  return `${f} €`
}

function resetDismissedUi() {
  showMoreFilters.value = false
  expandAll.value = false
  expandedRows.value = new Set()
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

    <div class="flex-1 overflow-auto bg-white">
      <div v-show="activeConcept === 1">
        <BmShell
          :nav-items="NAV_ITEMS"
          :active-nav-item="activeNavItem"
          :seller-name="SELLER_NAME"
          page-title="Your listings"
          :tabs="TABS"
          :active-tab="activeTab"
          @nav-item-click="activeNavItem = $event"
          @update:active-tab="activeTab = $event"
        >
          <template #header-actions>
            <div class="flex items-center gap-2">
              <button class="px-4 py-2 text-sm font-medium text-bm-text-hi border border-bm-border rounded-bm-sm bg-white hover:bg-bm-gray-50 transition-colors">Import or export listings</button>
              <button class="px-4 py-2 text-sm font-medium text-bm-text-hi border border-bm-border rounded-bm-sm bg-white hover:bg-bm-gray-50 transition-colors">Manage price rules</button>
              <button class="px-4 py-2 text-sm font-medium text-white bg-bm-text-hi rounded-bm-sm hover:bg-black transition-colors">Create new listing</button>
            </div>
          </template>

          <div class="pt-6 pb-10">
            <div class="grid grid-cols-5 gap-3">
              <input type="text" placeholder="Title" class="px-3 py-2 text-sm border border-bm-border rounded-bm-sm bg-white placeholder:text-bm-text-low focus:outline-none focus:border-bm-text-mid" />
              <input type="text" placeholder="SKU" class="px-3 py-2 text-sm border border-bm-border rounded-bm-sm bg-white placeholder:text-bm-text-low focus:outline-none focus:border-bm-text-mid" />

              <template v-if="!showMoreFilters">
                <button class="flex items-center justify-between px-3 py-2 text-sm bg-white border border-bm-border rounded-bm-sm text-bm-text-low hover:bg-bm-gray-50 transition-colors">
                  <span>Market(s) <span class="text-bm-text-mid">All</span></span>
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                </button>
                <button class="flex items-center justify-between px-3 py-2 text-sm bg-white border border-bm-border rounded-bm-sm text-bm-text-low hover:bg-bm-gray-50 transition-colors">
                  <span class="truncate">BackBox price differe...</span>
                  <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                </button>
                <button class="flex items-center justify-between px-3 py-2 text-sm bg-white border border-bm-border rounded-bm-sm text-bm-text-low hover:bg-bm-gray-50 transition-colors">
                  <span>Pricing strategy</span>
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                </button>
              </template>

              <template v-else>
                <input type="text" placeholder="Product ID" class="px-3 py-2 text-sm border border-bm-border rounded-bm-sm bg-white placeholder:text-bm-text-low focus:outline-none focus:border-bm-text-mid" />
                <button class="flex items-center justify-between px-3 py-2 text-sm bg-white border border-bm-border rounded-bm-sm text-bm-text-low hover:bg-bm-gray-50 transition-colors">
                  <span>Market(s)</span>
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                </button>
                <button class="flex items-center justify-between px-3 py-2 text-sm bg-white border border-bm-border rounded-bm-sm text-bm-text-low hover:bg-bm-gray-50 transition-colors">
                  <span class="truncate">BackBox price...</span>
                  <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                </button>
              </template>
            </div>

            <div v-show="showMoreFilters" class="grid grid-cols-5 gap-3 mt-3">
              <button v-for="label in ['Appearance', 'Grade', 'Categories', 'Battery type', 'Inventory']" :key="label" class="flex items-center justify-between px-3 py-2 text-sm bg-white border border-bm-border rounded-bm-sm text-bm-text-low hover:bg-bm-gray-50 transition-colors">
                <span>{{ label }}</span>
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
              </button>
            </div>

            <div v-show="showMoreFilters" class="grid grid-cols-5 gap-3 mt-3">
              <button v-for="label in ['BackBox', 'Competition level', 'Pricing strategy']" :key="label" class="flex items-center justify-between px-3 py-2 text-sm bg-white border border-bm-border rounded-bm-sm text-bm-text-low hover:bg-bm-gray-50 transition-colors">
                <span>{{ label }}</span>
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
              </button>
            </div>

            <div class="flex items-center justify-between mt-4">
              <button
                class="px-3 py-1.5 text-sm text-bm-text-hi border border-bm-border rounded-bm-sm bg-white hover:bg-bm-gray-50 transition-colors"
                @click="showMoreFilters = !showMoreFilters"
              >
                {{ showMoreFilters ? 'See less filters' : 'See more filters' }}
              </button>
              <div class="flex items-center gap-3">
                <button class="px-5 py-2 text-sm font-medium text-white bg-bm-text-hi rounded-bm-sm hover:bg-black transition-colors">Apply filters</button>
                <button class="px-3 py-2 text-sm text-bm-text-hi underline hover:text-bm-text-mid transition-colors">Reset</button>
              </div>
            </div>

            <div class="flex items-center justify-between mt-8 mb-4">
              <div class="flex items-center gap-5">
                <h2 class="text-lg font-bold text-bm-text-hi">87 active listings</h2>
                <label class="flex items-center gap-2 cursor-pointer">
                  <button
                    :class="['relative w-9 h-5 rounded-full transition-colors flex-shrink-0', expandAll ? 'bg-bm-text-hi' : 'bg-bm-gray-300']"
                    @click="expandAll = !expandAll"
                  >
                    <span :class="['absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all', expandAll ? 'left-[18px]' : 'left-0.5']" />
                  </button>
                  <span class="text-sm text-bm-text-mid">Expand all</span>
                </label>
              </div>

              <div class="flex items-center gap-3">
                <div class="relative">
                  <span class="absolute -top-2 left-2 px-1 text-[10px] text-bm-text-low bg-white">Within last</span>
                  <button class="flex items-center justify-between gap-2 px-3 py-2 min-w-[150px] text-sm bg-white border border-bm-border rounded-bm-sm text-bm-text-hi hover:bg-bm-gray-50 transition-colors">
                    <span>7 days</span>
                    <svg class="w-3.5 h-3.5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                  </button>
                </div>
                <div class="relative">
                  <span class="absolute -top-2 left-2 px-1 text-[10px] text-bm-text-low bg-white">Displayed</span>
                  <button class="flex items-center justify-between gap-2 px-3 py-2 min-w-[150px] text-sm bg-white border border-bm-border rounded-bm-sm text-bm-text-hi hover:bg-bm-gray-50 transition-colors">
                    <span>10 listings</span>
                    <svg class="w-3.5 h-3.5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                  </button>
                </div>
                <div class="relative">
                  <span class="absolute -top-2 left-2 px-1 text-[10px] text-bm-text-low bg-white">Sort by</span>
                  <button class="flex items-center justify-between gap-2 px-3 py-2 min-w-[200px] text-sm bg-white border border-bm-border rounded-bm-sm text-bm-text-hi hover:bg-bm-gray-50 transition-colors">
                    <span>Inventory (descending)</span>
                    <svg class="w-3.5 h-3.5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                  </button>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 mb-4">
              <button class="px-3 py-1.5 text-sm text-bm-text-hi border border-bm-border rounded-full bg-white hover:bg-bm-gray-50 transition-colors">See all within 4.00 € of BackBox</button>
              <button class="px-3 py-1.5 text-sm text-bm-text-hi border border-bm-border rounded-full bg-white hover:bg-bm-gray-50 transition-colors">See all within 8.00 € of BackBox</button>
            </div>

            <div class="border border-bm-border rounded-bm-sm overflow-hidden bg-white">
              <div :class="['grid gap-4 px-5 py-3 border-b border-bm-border text-xs font-medium text-bm-text-low', anyExpanded ? 'grid-cols-[1fr_120px_280px_110px_90px_110px]' : 'grid-cols-[1fr_120px_280px_110px_40px]']">
                <div>Product</div>
                <div>Inventory</div>
                <div>Market(s)</div>
                <div>Competition</div>
                <div v-if="anyExpanded">Trade-in</div>
                <div />
              </div>

              <div>
                <template v-for="listing in listings" :key="listing.id">
                  <div :class="['grid gap-4 px-5 py-4 items-center border-b border-bm-border last:border-b-0', anyExpanded ? 'grid-cols-[1fr_120px_280px_110px_90px_110px]' : 'grid-cols-[1fr_120px_280px_110px_40px]']">
                    <div class="flex items-start gap-3 min-w-0">
                      <div class="w-12 h-12 rounded-bm-sm border border-bm-border flex-shrink-0" :style="{ background: thumbBg(listing.thumb) }" />
                      <div class="min-w-0 flex flex-col gap-1.5">
                        <a class="text-sm font-semibold text-bm-text-hi hover:underline cursor-pointer truncate">{{ listing.title }}</a>
                        <p class="text-xs text-bm-text-low">SKU: {{ listing.sku }}</p>
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">
                            <span class="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            {{ listing.grade }}
                          </span>
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-bm-gray-100 text-bm-text-mid border border-bm-border">
                            {{ listing.sim }}
                          </span>
                          <span v-if="listing.newBattery" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-800">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v2a1 1 0 1 1-2 0V6h-2v1a1 1 0 1 1-2 0V6H7v9h6v-3a1 1 0 1 1 2 0v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2V3a1 1 0 0 1 1-1z" /></svg>
                            Archive listing
                          </span>
                          <span v-else class="text-[11px] text-bm-text-low cursor-pointer hover:text-bm-text-mid">Archive listing</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div class="relative">
                        <span class="absolute -top-2 left-2 px-1 text-[10px] text-bm-text-low bg-white">Units</span>
                        <input :value="listing.units" type="text" class="w-full px-3 py-2 text-sm bg-white border border-bm-border rounded-bm-sm focus:outline-none focus:border-bm-text-mid" />
                      </div>
                    </div>

                    <div class="grid grid-cols-7 gap-1">
                      <span
                        v-for="m in listing.markets"
                        :key="m.code"
                        :class="['inline-flex items-center justify-center gap-0.5 px-1 py-0.5 rounded text-[10px] font-medium', m.active ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900']"
                      >
                        <span class="text-[11px] leading-none">{{ m.flag }}</span>
                        <span>{{ m.code }}</span>
                      </span>
                    </div>

                    <div>
                      <span :class="['inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium', competitionPill(listing.competition)]">{{ listing.competition }}</span>
                    </div>

                    <div v-if="anyExpanded" />

                    <div class="flex justify-end">
                      <button
                        v-if="isExpanded(listing.id)"
                        class="px-4 py-1.5 text-sm font-medium text-bm-text-hi border border-bm-border rounded-bm-sm bg-white hover:bg-bm-gray-50 transition-colors"
                      >
                        Edit listing
                      </button>
                      <button
                        v-else
                        class="w-8 h-8 flex items-center justify-center rounded hover:bg-bm-gray-100 transition-colors text-bm-text-low"
                        @click="toggleRow(listing.id)"
                      >
                        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                      </button>
                    </div>
                  </div>

                  <div v-if="isExpanded(listing.id) && listing.pricing" class="border-b border-bm-border bg-[#F4F5F8]">
                    <div class="px-6 py-4 flex items-center justify-between gap-4 border-b border-bm-border">
                      <div class="flex items-center gap-3 flex-wrap">
                        <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-bm-text-hi">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                          Pricing rule
                        </span>
                        <div class="flex items-center gap-1">
                          <span v-for="r in listing.pricing" :key="r.country" class="text-[12px]">{{ r.flag }}</span>
                        </div>
                        <a class="text-sm text-bm-text-hi underline cursor-pointer hover:text-bm-text-mid">View rules</a>
                      </div>
                      <button class="px-4 py-2 text-sm font-medium text-white bg-bm-text-hi rounded-bm-sm hover:bg-black transition-colors">Win all BackBoxes</button>
                    </div>

                    <div class="grid grid-cols-[180px_140px_140px_240px_1fr_160px] gap-4 px-6 py-3 border-b border-bm-border text-xs font-medium text-bm-text-low">
                      <div>Market</div>
                      <div>Minimum price</div>
                      <div>Target price</div>
                      <div class="flex items-center gap-1">
                        BackBox price
                        <svg class="w-3.5 h-3.5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2v-3a1 1 0 0 0-1-1H9Z" clip-rule="evenodd" /></svg>
                      </div>
                      <div class="flex items-center gap-1">
                        Sales strategy
                        <svg class="w-3.5 h-3.5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2v-3a1 1 0 0 0-1-1H9Z" clip-rule="evenodd" /></svg>
                      </div>
                      <div />
                    </div>

                    <div
                      v-for="row in listing.pricing"
                      :key="row.country"
                      class="grid grid-cols-[180px_140px_140px_240px_1fr_160px] gap-4 px-6 py-4 items-center border-b border-bm-border last:border-b-0 bg-white"
                    >
                      <div class="flex items-center gap-2">
                        <span class="text-xl leading-none">{{ row.flag }}</span>
                        <div class="flex flex-col">
                          <span class="text-sm font-medium text-bm-text-hi">{{ row.country }}</span>
                          <span v-if="row.primary" class="text-[11px] text-bm-text-low">Primary market</span>
                        </div>
                      </div>

                      <div class="relative">
                        <span class="absolute -top-2 left-2 px-1 text-[10px] text-bm-text-low bg-white">Min. ({{ row.currency === 'GBP' ? '£' : row.currency === 'SEK' ? 'SEK' : '€' }})</span>
                        <input :value="row.minPrice.toFixed(2)" class="w-full px-3 py-2 text-sm bg-white border border-bm-border rounded-bm-sm focus:outline-none focus:border-bm-text-mid" />
                      </div>

                      <div class="relative">
                        <span class="absolute -top-2 left-2 px-1 text-[10px] text-bm-text-low bg-white">Target ({{ row.currency === 'GBP' ? '£' : row.currency === 'SEK' ? 'SEK' : '€' }})</span>
                        <input :value="row.targetPrice.toFixed(2)" class="w-full px-3 py-2 text-sm bg-white border border-bm-border rounded-bm-sm focus:outline-none focus:border-bm-text-mid" />
                      </div>

                      <div>
                        <template v-if="row.backBox.status === 'won'">
                          <div class="flex items-center gap-1.5">
                            <span class="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" /></svg>
                            </span>
                            <div class="flex flex-col">
                              <span class="text-[11px] text-emerald-700 font-medium">BackBox won</span>
                              <span class="text-sm font-semibold text-bm-text-hi">{{ fmtMoney(row.backBox.price!, row.currency) }}</span>
                            </div>
                          </div>
                        </template>
                        <template v-else-if="row.backBox.status === 'opportunity'">
                          <div class="flex flex-col">
                            <span class="text-[11px] text-amber-700 font-medium">BackBox opportunity</span>
                            <span class="text-sm font-semibold text-bm-text-hi">{{ fmtMoney(row.backBox.price!, row.currency) }}</span>
                            <span v-if="row.backBox.note" class="text-[11px] text-bm-text-low">{{ row.backBox.note }}</span>
                          </div>
                        </template>
                        <template v-else-if="row.backBox.status === 'offline'">
                          <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bm-gray-100 border border-bm-border text-sm text-bm-text-mid">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path stroke-linecap="round" stroke-linejoin="round" d="M8 14s1.5-2 4-2 4 2 4 2M9 9h.01M15 9h.01" /></svg>
                            Listing offline
                          </span>
                        </template>
                      </div>

                      <div class="text-sm">
                        <template v-if="row.strategy.type === 'deal-included'">
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 mb-1">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.6 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z" /></svg>
                            {{ row.strategy.title }}
                          </span>
                          <p class="text-[12px] text-bm-text-hi font-medium">{{ row.strategy.line1 }}</p>
                          <p class="text-[11px] text-bm-text-low">{{ row.strategy.line2 }}</p>
                        </template>
                        <template v-else-if="row.strategy.type === 'visibility-boosted'">
                          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800 mb-1">
                            <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.05a.5.5 0 0 1 .58.61l-1.5 5.84h5.12a.5.5 0 0 1 .4.8l-8.7 11.65a.5.5 0 0 1-.88-.4l1.5-5.84H2.7a.5.5 0 0 1-.4-.8l8.7-11.66a.5.5 0 0 1 .3-.2Z" /></svg>
                            {{ row.strategy.title }}
                          </span>
                          <p class="text-[11px] text-bm-text-low">{{ row.strategy.line1 }}</p>
                        </template>
                        <template v-else-if="row.strategy.type === 'deal-opportunity'">
                          <span class="inline-flex items-center gap-1 text-[12px] font-medium text-bm-text-hi mb-0.5">{{ row.strategy.title }}</span>
                          <p class="text-[12px] text-bm-text-hi">{{ row.strategy.line1 }}</p>
                          <p class="text-[11px] text-bm-text-low">{{ row.strategy.line2 }}</p>
                        </template>
                        <template v-else-if="row.strategy.type === 'visibility-opportunity'">
                          <span class="inline-flex items-center gap-1 text-[12px] font-medium text-bm-text-hi mb-0.5">{{ row.strategy.title }}</span>
                          <p class="text-[12px] text-bm-text-hi">{{ row.strategy.line1 }}</p>
                          <p class="text-[11px] text-bm-text-low">{{ row.strategy.line2 }}</p>
                        </template>
                        <template v-else-if="row.strategy.type === 'none-available'">
                          <span class="text-[12px] text-bm-text-low">No sales strategy available</span>
                        </template>
                      </div>

                      <div class="flex flex-col gap-1 items-end">
                        <button
                          v-for="(a, idx) in row.actions"
                          :key="idx"
                          :class="[
                            'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-bm-sm whitespace-nowrap transition-colors w-full',
                            a.variant === 'primary' ? 'bg-bm-text-hi text-white hover:bg-black'
                              : a.variant === 'flash' ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                              : 'bg-white text-bm-text-hi border border-bm-border hover:bg-bm-gray-50',
                          ]"
                        >
                          <svg v-if="a.variant === 'flash'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.05a.5.5 0 0 1 .58.61l-1.5 5.84h5.12a.5.5 0 0 1 .4.8l-8.7 11.65a.5.5 0 0 1-.88-.4l1.5-5.84H2.7a.5.5 0 0 1-.4-.8l8.7-11.66a.5.5 0 0 1 .3-.2Z" /></svg>
                          {{ a.label }}
                        </button>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>

            <div class="flex items-center justify-center gap-2 mt-6">
              <button class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-bm-text-mid border border-bm-border rounded-full bg-white hover:bg-bm-gray-50 transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Previous
              </button>
              <button class="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-bm-text-hi border border-bm-border rounded-full bg-white hover:bg-bm-gray-50 transition-colors">
                Next
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </BmShell>
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
