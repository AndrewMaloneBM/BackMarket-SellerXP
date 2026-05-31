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
        changes: ['Replica of today\'s Listings page. Click any chevron to expand a row and reveal its per-market pricing table.'],
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
const anyExpanded = computed(() => expandAll.value || expandedRows.value.size > 0)

type Currency = 'EUR' | 'GBP' | 'SEK'
type BackBoxStatus = 'won' | 'opportunity' | 'offline'
type StrategyType = 'none-available' | 'none' | 'deal-included' | 'visibility-boosted' | 'deal-opportunity' | 'visibility-opportunity'

interface Market {
  code: string
  active: boolean
}

interface PricingRow {
  code: string
  country: string
  primary?: boolean
  currency: Currency
  minPrice: number
  targetPrice: number
  backBox: { status: BackBoxStatus; price?: number; note?: string }
  strategy: { type: StrategyType; title?: string; line1?: string; line2?: string }
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
  basePrice: number
  primaryCode: string
}

const MARKET_CODES = ['AT', 'BE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'NL', 'PT', 'SK', 'ES', 'SE', 'UK'] as const

const COUNTRY: Record<string, { name: string; currency: Currency }> = {
  AT: { name: 'Austria',        currency: 'EUR' },
  BE: { name: 'Belgium',        currency: 'EUR' },
  FI: { name: 'Finland',        currency: 'EUR' },
  FR: { name: 'France',         currency: 'EUR' },
  DE: { name: 'Germany',        currency: 'EUR' },
  GR: { name: 'Greece',         currency: 'EUR' },
  IE: { name: 'Ireland',        currency: 'EUR' },
  IT: { name: 'Italy',          currency: 'EUR' },
  NL: { name: 'Netherlands',    currency: 'EUR' },
  PT: { name: 'Portugal',       currency: 'EUR' },
  SK: { name: 'Slovakia',       currency: 'EUR' },
  ES: { name: 'Spain',          currency: 'EUR' },
  SE: { name: 'Sweden',         currency: 'SEK' },
  UK: { name: 'United Kingdom', currency: 'GBP' },
}

function mkMarkets(overrides: Partial<Record<string, boolean>> = {}): Market[] {
  return MARKET_CODES.map(code => ({ code, active: overrides[code] ?? true }))
}

function strategyFor(type: StrategyType): PricingRow['strategy'] {
  switch (type) {
    case 'deal-included':
      return { type, title: 'Included in deal', line1: '470.00 € or less', line2: 'You\'re saving up to 5% on commission' }
    case 'visibility-boosted':
      return { type, title: 'Visibility boosted', line1: 'Estimated sales: 200-250 units' }
    case 'deal-opportunity':
      return { type, title: 'Deal opportunity', line1: '475.00 € or less', line2: 'Save up to 5% on commission' }
    case 'visibility-opportunity':
      return { type, title: 'Visibility boost', line1: '470.00 €', line2: 'Estimated sales: 200-250 units' }
    case 'none-available':
      return { type, title: 'No sales strategy available' }
    case 'none':
      return { type }
  }
}

function pricingFor(listing: Listing): PricingRow[] {
  const STATE_PATTERN: Array<{ bb: BackBoxStatus; st: StrategyType; actions: PricingRow['actions'] }> = [
    { bb: 'won',         st: 'none-available',          actions: [] },
    { bb: 'won',         st: 'deal-included',           actions: [] },
    { bb: 'won',         st: 'visibility-boosted',      actions: [] },
    { bb: 'won',         st: 'deal-opportunity',        actions: [{ label: 'Apply deal price', variant: 'primary' }] },
    { bb: 'opportunity', st: 'visibility-opportunity',  actions: [{ label: 'Win BackBox', variant: 'primary' }, { label: 'Visibility boost', variant: 'flash' }] },
    { bb: 'opportunity', st: 'deal-opportunity',        actions: [{ label: 'Win BackBox', variant: 'primary' }, { label: 'Apply deal price', variant: 'secondary' }] },
    { bb: 'opportunity', st: 'none-available',          actions: [{ label: 'Win BackBox', variant: 'primary' }] },
    { bb: 'opportunity', st: 'none-available',          actions: [{ label: 'Win BackBox', variant: 'primary' }] },
    { bb: 'offline',     st: 'none',                    actions: [] },
  ]

  const active = listing.markets.filter(m => m.active)
  return active.slice(0, 9).map((m, idx): PricingRow => {
    const { name, currency } = COUNTRY[m.code]
    const seed = (listing.basePrice + idx * 4) % 25
    const minPriceEUR = listing.basePrice - 25 + seed
    const targetPriceEUR = minPriceEUR + 45 + (idx % 3) * 5
    const min = currency === 'GBP' ? Math.round(minPriceEUR * 0.86) : currency === 'SEK' ? Math.round(minPriceEUR * 11.7) : minPriceEUR
    const target = currency === 'GBP' ? Math.round(targetPriceEUR * 0.86) : currency === 'SEK' ? Math.round(targetPriceEUR * 11.7) : targetPriceEUR
    const pattern = STATE_PATTERN[Math.min(idx, STATE_PATTERN.length - 1)]
    const bbPrice = pattern.bb === 'won' ? min : pattern.bb === 'opportunity' ? min - 8 : undefined
    const note = pattern.bb === 'opportunity' ? (idx === 7 ? 'You\'ve got another listing with the BackBox' : 'Win BackBox to start selling') : undefined

    return {
      code: m.code,
      country: name,
      primary: m.code === listing.primaryCode,
      currency,
      minPrice: min,
      targetPrice: target,
      backBox: pattern.bb === 'offline'
        ? { status: 'offline' }
        : { status: pattern.bb, price: bbPrice!, note },
      strategy: strategyFor(pattern.st),
      actions: pattern.actions,
    }
  })
}

const listings: Listing[] = [
  { id: 'L1',  thumb: 'iphone-blue',    title: 'iPhone 13 Pro - 128GB - Natural titanium - Unlocked', sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: true,  units: 50, markets: mkMarkets({ BE: false, IE: false, IT: false, NL: false, SK: false, UK: false }), competition: 'Low',       basePrice: 500, primaryCode: 'FR' },
  { id: 'L2',  thumb: 'samsung-s20',    title: 'Samsung Galaxy S20 - 128GB - Cosmic Gray - Unlocked', sku: '12345-S-BL', grade: 'Excellent', sim: 'Dual SIM',           newBattery: true,  units: 50, markets: mkMarkets({ BE: false, IT: false, NL: false, SK: false, UK: false }),              competition: 'Medium',    basePrice: 280, primaryCode: 'FR' },
  { id: 'L3',  thumb: 'oneplus-7t',     title: 'OnePlus 7T - 128GB - Glacier Blue - Unlocked',       sku: '12345-S-BL', grade: 'Excellent', sim: 'eSIM',               newBattery: true,  units: 50, markets: mkMarkets({ BE: false, IT: false, NL: false, SK: false, UK: false }),              competition: 'Medium',    basePrice: 220, primaryCode: 'FR' },
  { id: 'L4',  thumb: 'sony-xperia',    title: 'Sony Xperia 5 - 128GB - Black - Unlocked',           sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: false, units: 0,  markets: mkMarkets({ BE: false, NL: false, SK: false, UK: false }),                          competition: 'Very low',  basePrice: 240, primaryCode: 'FR' },
  { id: 'L5',  thumb: 'xiaomi-9t',      title: 'Xiaomi 9T - 128GB - Carbon Black - Unlocked',        sku: '12345-S-BL', grade: 'Excellent', sim: 'Dual SIM',           newBattery: true,  units: 0,  markets: mkMarkets({ BE: false, IT: false, NL: false, SK: false, UK: false }),              competition: 'None',      basePrice: 180, primaryCode: 'FR' },
  { id: 'L6',  thumb: 'iphone-13-mid',  title: 'iPhone 13 - 128GB - Midnight - Unlocked',            sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: false, units: 50, markets: mkMarkets({ BE: false, IT: false, UK: false }),                                    competition: 'Medium',    basePrice: 430, primaryCode: 'FR' },
  { id: 'L7',  thumb: 'samsung-a7',     title: 'Samsung Galaxy A7 - 128GB - White - Unlocked',       sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: true,  units: 50, markets: mkMarkets({ BE: false, IT: false, UK: false }),                                    competition: 'Medium',    basePrice: 195, primaryCode: 'FR' },
  { id: 'L8',  thumb: 'lg-g7',          title: 'LG G7 - 128GB - Midnight - Unlocked',                sku: '12345-S-BL', grade: 'Excellent', sim: 'eSIM',               newBattery: false, units: 50, markets: mkMarkets({ BE: false, IT: false, UK: false }),                                    competition: 'Very low',  basePrice: 165, primaryCode: 'FR' },
  { id: 'L9',  thumb: 'nokia-3310',     title: 'Nokia 3310',                                          sku: '12345-S-BL', grade: 'Excellent', sim: 'Dual SIM',           newBattery: false, units: 50, markets: mkMarkets({ BE: false, IT: false, UK: false }),                                    competition: 'Very low',  basePrice: 55,  primaryCode: 'FR' },
  { id: 'L10', thumb: 'samsung-s23',    title: 'Samsung Galaxy S23 - 128GB - Cosmic Gray - Unlocked', sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: true,  units: 50, markets: mkMarkets({ BE: false, IT: false, UK: false }),                                    competition: 'Medium',    basePrice: 510, primaryCode: 'FR' },
]

function competitionTag(c: Listing['competition']): { variant: 'warning' | 'info' | 'success' | 'danger' | 'secondary'; label: string } {
  switch (c) {
    case 'Low':       return { variant: 'warning', label: 'Low' }
    case 'Medium':    return { variant: 'warning', label: 'Medium' }
    case 'Very low':  return { variant: 'info',    label: 'Very low' }
    case 'None':      return { variant: 'success', label: 'None' }
    case 'High':      return { variant: 'danger',  label: 'High' }
  }
}

const TAG_FILL: Record<'warning' | 'info' | 'success' | 'danger' | 'secondary', string> = {
  warning:   'bg-[hsl(38,90%,84%)] text-[hsl(42,75%,27%)]',
  info:      'bg-[hsl(221,86%,92%)] text-[hsl(219,27%,40%)]',
  success:   'bg-[hsl(145,83%,77%)] text-[hsl(156,100%,21%)]',
  danger:    'bg-[hsl(3,100%,92%)]  text-[hsl(351,84%,39%)]',
  secondary: 'bg-static-default-mid text-bm-text-hi',
}

function thumbBg(thumb: string): string {
  const map: Record<string, string> = {
    'iphone-blue':   'linear-gradient(135deg, hsl(225, 60%, 30%) 0%, hsl(215, 90%, 70%) 100%)',
    'samsung-s20':   'linear-gradient(135deg, hsl(220, 15%, 18%) 0%, hsl(220, 10%, 35%) 100%)',
    'oneplus-7t':    'linear-gradient(135deg, hsl(200, 90%, 45%) 0%, hsl(195, 85%, 65%) 100%)',
    'sony-xperia':   'linear-gradient(135deg, hsl(220, 25%, 10%) 0%, hsl(220, 15%, 25%) 100%)',
    'xiaomi-9t':     'linear-gradient(135deg, hsl(335, 70%, 30%) 0%, hsl(330, 80%, 60%) 100%)',
    'iphone-13-mid': 'linear-gradient(135deg, hsl(220, 25%, 12%) 0%, hsl(220, 20%, 22%) 100%)',
    'samsung-a7':    'linear-gradient(135deg, hsl(220, 15%, 90%) 0%, hsl(220, 10%, 80%) 100%)',
    'lg-g7':         'linear-gradient(135deg, hsl(220, 15%, 18%) 0%, hsl(220, 10%, 35%) 100%)',
    'nokia-3310':    'linear-gradient(135deg, hsl(25, 15%, 15%) 0%, hsl(25, 10%, 28%) 100%)',
    'samsung-s23':   'linear-gradient(135deg, hsl(220, 8%, 25%) 0%, hsl(220, 6%, 42%) 100%)',
  }
  return map[thumb] ?? 'linear-gradient(135deg, hsl(220, 10%, 80%), hsl(220, 10%, 62%))'
}

function currencyPrefix(c: Currency): string {
  return c === 'GBP' ? '£' : c === 'SEK' ? 'SEK' : '€'
}
function fmtMoney(amount: number, c: Currency): string {
  const f = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (c === 'SEK') return `${f} SEK`
  if (c === 'GBP') return `£${f}`
  return `${f} €`
}

interface FlagStripe { kind: 'h' | 'v' | 'd' | 'cross' | 'tri'; colors: string[] }

const FLAG: Record<string, FlagStripe> = {
  AT: { kind: 'h', colors: ['#ED2939', '#FFFFFF', '#ED2939'] },
  BE: { kind: 'v', colors: ['#000000', '#FAE042', '#ED2939'] },
  FI: { kind: 'cross', colors: ['#FFFFFF', '#003580'] },
  FR: { kind: 'v', colors: ['#0055A4', '#FFFFFF', '#EF4135'] },
  DE: { kind: 'h', colors: ['#000000', '#DD0000', '#FFCE00'] },
  GR: { kind: 'h', colors: ['#0D5EAF', '#FFFFFF', '#0D5EAF', '#FFFFFF', '#0D5EAF'] },
  IE: { kind: 'v', colors: ['#169B62', '#FFFFFF', '#FF883E'] },
  IT: { kind: 'v', colors: ['#008C45', '#F4F5F0', '#CD212A'] },
  NL: { kind: 'h', colors: ['#AE1C28', '#FFFFFF', '#21468B'] },
  PT: { kind: 'tri', colors: ['#006600', '#FF0000'] },
  SK: { kind: 'h', colors: ['#FFFFFF', '#0B4EA2', '#EE1C25'] },
  ES: { kind: 'tri', colors: ['#AA151B', '#F1BF00', '#AA151B'] },
  SE: { kind: 'cross', colors: ['#006AA7', '#FECC00'] },
  UK: { kind: 'cross', colors: ['#012169', '#FFFFFF'] },
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

    <div class="flex-1 overflow-auto bg-bm-surface">
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
              <button class="px-4 py-2.5 text-sm font-semibold text-bm-text-hi border border-bm-border-action rounded-bm-sm bg-static-default-low hover:bg-static-default-mid transition-colors">Import or export listings</button>
              <button class="px-4 py-2.5 text-sm font-semibold text-bm-text-hi border border-bm-border-action rounded-bm-sm bg-static-default-low hover:bg-static-default-mid transition-colors">Manage price rules</button>
              <button class="px-4 py-2.5 text-sm font-semibold text-white bg-bm-text-hi rounded-bm-sm hover:bg-bm-gray-700 transition-colors">Create new listing</button>
            </div>
          </template>

          <div class="pt-6 pb-10">
            <div class="grid grid-cols-5 gap-3">
              <input type="text" placeholder="Title" class="px-4 py-3 text-sm bg-static-default-low border border-bm-border-action rounded-bm-sm placeholder:text-bm-text-low focus:outline-none focus:border-bm-text-hi" />
              <input type="text" placeholder="SKU" class="px-4 py-3 text-sm bg-static-default-low border border-bm-border-action rounded-bm-sm placeholder:text-bm-text-low focus:outline-none focus:border-bm-text-hi" />

              <template v-if="!showMoreFilters">
                <button class="flex items-center justify-between px-4 py-3 text-sm bg-static-default-low border border-bm-border-action rounded-bm-sm text-bm-text-low hover:bg-static-default-mid transition-colors">
                  <span>Market(s) <span class="text-bm-text-hi">All</span></span>
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                </button>
                <button class="flex items-center justify-between px-4 py-3 text-sm bg-static-default-low border border-bm-border-action rounded-bm-sm text-bm-text-low hover:bg-static-default-mid transition-colors">
                  <span class="truncate">BackBox price differe...</span>
                  <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                </button>
                <button class="flex items-center justify-between px-4 py-3 text-sm bg-static-default-low border border-bm-border-action rounded-bm-sm text-bm-text-low hover:bg-static-default-mid transition-colors">
                  <span>Pricing strategy</span>
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                </button>
              </template>

              <template v-else>
                <input type="text" placeholder="Product ID" class="px-4 py-3 text-sm bg-static-default-low border border-bm-border-action rounded-bm-sm placeholder:text-bm-text-low focus:outline-none focus:border-bm-text-hi" />
                <button class="flex items-center justify-between px-4 py-3 text-sm bg-static-default-low border border-bm-border-action rounded-bm-sm text-bm-text-low hover:bg-static-default-mid transition-colors">
                  <span>Market(s)</span>
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                </button>
                <button class="flex items-center justify-between px-4 py-3 text-sm bg-static-default-low border border-bm-border-action rounded-bm-sm text-bm-text-low hover:bg-static-default-mid transition-colors">
                  <span class="truncate">BackBox price...</span>
                  <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                </button>
              </template>
            </div>

            <div v-show="showMoreFilters" class="grid grid-cols-5 gap-3 mt-3">
              <button v-for="label in ['Appearance', 'Grade', 'Categories', 'Battery type', 'Inventory']" :key="label" class="flex items-center justify-between px-4 py-3 text-sm bg-static-default-low border border-bm-border-action rounded-bm-sm text-bm-text-low hover:bg-static-default-mid transition-colors">
                <span>{{ label }}</span>
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
              </button>
            </div>

            <div v-show="showMoreFilters" class="grid grid-cols-5 gap-3 mt-3">
              <button v-for="label in ['BackBox', 'Competition level', 'Pricing strategy']" :key="label" class="flex items-center justify-between px-4 py-3 text-sm bg-static-default-low border border-bm-border-action rounded-bm-sm text-bm-text-low hover:bg-static-default-mid transition-colors">
                <span>{{ label }}</span>
                <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
              </button>
            </div>

            <div class="flex items-center justify-between mt-4">
              <button
                class="px-3 py-1.5 text-sm font-semibold text-bm-text-hi border border-bm-border-action rounded-bm-sm bg-static-default-low hover:bg-static-default-mid transition-colors"
                @click="showMoreFilters = !showMoreFilters"
              >
                {{ showMoreFilters ? 'See less filters' : 'See more filters' }}
              </button>
              <div class="flex items-center gap-3">
                <button class="px-5 py-2.5 text-sm font-semibold text-white bg-bm-text-hi rounded-bm-sm hover:bg-bm-gray-700 transition-colors">Apply filters</button>
                <button class="px-3 py-2 text-sm font-semibold text-bm-text-hi underline hover:text-bm-text-mid transition-colors">Reset</button>
              </div>
            </div>

            <div class="flex items-center justify-between mt-8 mb-4">
              <div class="flex items-center gap-5">
                <h2 class="text-lg font-semibold text-bm-text-hi">87 active listings</h2>
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
                  <span class="absolute -top-2 left-3 px-1 text-[11px] text-bm-text-low bg-bm-surface">Within last</span>
                  <button class="flex items-center justify-between gap-2 px-3 py-2.5 min-w-[160px] text-sm bg-static-default-low border border-bm-border-action rounded-bm-sm text-bm-text-hi hover:bg-static-default-mid transition-colors">
                    <span>7 days</span>
                    <svg class="w-3.5 h-3.5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                  </button>
                </div>
                <div class="relative">
                  <span class="absolute -top-2 left-3 px-1 text-[11px] text-bm-text-low bg-bm-surface">Displayed</span>
                  <button class="flex items-center justify-between gap-2 px-3 py-2.5 min-w-[160px] text-sm bg-static-default-low border border-bm-border-action rounded-bm-sm text-bm-text-hi hover:bg-static-default-mid transition-colors">
                    <span>10 listings</span>
                    <svg class="w-3.5 h-3.5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                  </button>
                </div>
                <div class="relative">
                  <span class="absolute -top-2 left-3 px-1 text-[11px] text-bm-text-low bg-bm-surface">Sort by</span>
                  <button class="flex items-center justify-between gap-2 px-3 py-2.5 min-w-[220px] text-sm bg-static-default-low border border-bm-border-action rounded-bm-sm text-bm-text-hi hover:bg-static-default-mid transition-colors">
                    <span>Inventory (descending)</span>
                    <svg class="w-3.5 h-3.5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                  </button>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 mb-4">
              <button class="px-3 py-1.5 text-sm font-semibold text-bm-text-hi border border-bm-border-action rounded-full bg-static-default-low hover:bg-static-default-mid transition-colors">See all within 4.00 € of BackBox</button>
              <button class="px-3 py-1.5 text-sm font-semibold text-bm-text-hi border border-bm-border-action rounded-full bg-static-default-low hover:bg-static-default-mid transition-colors">See all within 8.00 € of BackBox</button>
            </div>

            <div class="border border-bm-border rounded-bm-sm overflow-hidden bg-static-default-low">
              <div :class="['grid gap-4 px-5 py-3 border-b border-bm-border text-sm font-semibold text-bm-text-hi bg-static-default-mid', anyExpanded ? 'grid-cols-[1fr_120px_280px_110px_90px_160px]' : 'grid-cols-[1fr_120px_280px_110px_60px]']">
                <div>Product</div>
                <div>Inventory</div>
                <div>Market(s)</div>
                <div>Competition</div>
                <div v-if="anyExpanded">Trade-in</div>
                <div />
              </div>

              <template v-for="listing in listings" :key="listing.id">
                <div :class="['grid gap-4 px-5 py-4 items-center border-b border-bm-border last:border-b-0', anyExpanded ? 'grid-cols-[1fr_120px_280px_110px_90px_160px]' : 'grid-cols-[1fr_120px_280px_110px_60px]']">
                  <div class="flex items-start gap-3 min-w-0">
                    <div class="w-12 h-12 rounded-bm-sm border border-bm-border flex-shrink-0" :style="{ background: thumbBg(listing.thumb) }" />
                    <div class="min-w-0 flex flex-col gap-1.5">
                      <a class="text-sm font-semibold text-bm-text-hi hover:underline cursor-pointer truncate">{{ listing.title }}</a>
                      <p class="text-xs text-bm-text-low">SKU: {{ listing.sku }}</p>
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span :class="['inline-flex items-center px-1 py-0.5 rounded-bm-xs text-[11px] font-semibold', TAG_FILL.success]">{{ listing.grade }}</span>
                        <span :class="['inline-flex items-center px-1 py-0.5 rounded-bm-xs text-[11px] font-semibold', TAG_FILL.secondary]">{{ listing.sim }}</span>
                        <button class="inline-flex items-center gap-1 px-1 py-0.5 text-[11px] font-semibold text-bm-text-hi underline hover:text-bm-text-mid transition-colors">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
                          Archive listing
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div class="relative">
                      <span class="absolute -top-2 left-3 px-1 text-[11px] text-bm-text-low bg-static-default-low">Units</span>
                      <input :value="listing.units" type="text" class="w-full px-3 py-2.5 text-sm bg-static-default-low border border-bm-border-action rounded-bm-sm focus:outline-none focus:border-bm-text-hi" />
                    </div>
                  </div>

                  <div class="grid grid-cols-7 gap-1">
                    <span
                      v-for="m in listing.markets"
                      :key="m.code"
                      :class="['inline-flex items-center justify-center gap-1 px-1 py-0.5 rounded-bm-xs text-[10px] font-semibold', m.active ? 'bg-[hsl(145,83%,77%)] text-[hsl(156,100%,21%)]' : 'bg-[hsl(3,100%,92%)] text-[hsl(351,84%,39%)]']"
                    >
                      <FlagChip :code="m.code" :stripe="FLAG[m.code]" />
                      <span>{{ m.code }}</span>
                    </span>
                  </div>

                  <div>
                    <span :class="['inline-flex items-center px-2 py-0.5 rounded-bm-xs text-[11px] font-semibold', TAG_FILL[competitionTag(listing.competition).variant]]">{{ competitionTag(listing.competition).label }}</span>
                  </div>

                  <div v-if="anyExpanded" />

                  <div class="flex justify-end items-center gap-2">
                    <button
                      v-if="isExpanded(listing.id)"
                      class="px-3 py-1.5 text-xs font-semibold text-bm-text-hi border border-bm-border-action rounded-bm-sm bg-static-default-low hover:bg-static-default-mid transition-colors"
                    >
                      Edit listing
                    </button>
                    <button
                      class="w-8 h-8 flex items-center justify-center rounded-bm-sm hover:bg-static-default-mid transition-colors text-bm-text-mid"
                      @click="toggleRow(listing.id)"
                    >
                      <svg :class="['w-4 h-4 transition-transform', isExpanded(listing.id) && 'rotate-180']" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                    </button>
                  </div>
                </div>

                <div v-if="isExpanded(listing.id)" class="border-b border-bm-border bg-bm-surface">
                  <div class="px-6 py-4 flex items-center justify-between gap-4 border-b border-bm-border">
                    <div class="flex items-center gap-3 flex-wrap">
                      <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-bm-text-hi">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
                        Pricing rule
                      </span>
                      <div class="flex items-center gap-1">
                        <FlagChip v-for="r in pricingFor(listing)" :key="r.code" :code="r.code" :stripe="FLAG[r.code]" size="md" />
                      </div>
                      <a class="text-sm font-semibold text-bm-text-hi underline cursor-pointer hover:text-bm-text-mid">View rules</a>
                    </div>
                    <button class="px-4 py-2 text-sm font-semibold text-white bg-bm-text-hi rounded-bm-sm hover:bg-bm-gray-700 transition-colors">Win all BackBoxes</button>
                  </div>

                  <div class="grid grid-cols-[180px_140px_140px_240px_1fr_180px] gap-4 px-6 py-3 border-b border-bm-border text-sm font-semibold text-bm-text-hi">
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
                    v-for="row in pricingFor(listing)"
                    :key="row.code"
                    class="grid grid-cols-[180px_140px_140px_240px_1fr_180px] gap-4 px-6 py-4 items-center border-b border-bm-border last:border-b-0 bg-static-default-low"
                  >
                    <div class="flex items-center gap-3">
                      <FlagChip :code="row.code" :stripe="FLAG[row.code]" size="lg" />
                      <div class="flex flex-col">
                        <span class="text-sm font-semibold text-bm-text-hi">{{ row.country }}</span>
                        <span v-if="row.primary" class="text-[11px] text-bm-text-low">Primary market</span>
                      </div>
                    </div>

                    <div class="relative">
                      <span class="absolute -top-2 left-3 px-1 text-[11px] text-bm-text-low bg-static-default-low">Min. ({{ currencyPrefix(row.currency) }})</span>
                      <input :value="row.minPrice.toFixed(2)" class="w-full px-3 py-2.5 text-sm bg-static-default-low border border-bm-border-action rounded-bm-sm focus:outline-none focus:border-bm-text-hi" />
                    </div>

                    <div class="relative">
                      <span class="absolute -top-2 left-3 px-1 text-[11px] text-bm-text-low bg-static-default-low">Target ({{ currencyPrefix(row.currency) }})</span>
                      <input :value="row.targetPrice.toFixed(2)" class="w-full px-3 py-2.5 text-sm bg-static-default-low border border-bm-border-action rounded-bm-sm focus:outline-none focus:border-bm-text-hi" />
                    </div>

                    <div>
                      <template v-if="row.backBox.status === 'won'">
                        <div class="flex items-center gap-1.5">
                          <span class="w-4 h-4 rounded-full text-white flex items-center justify-center flex-shrink-0" :style="{ background: 'hsl(156, 100%, 21%)' }">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" /></svg>
                          </span>
                          <div class="flex flex-col">
                            <span class="text-[11px] font-semibold" :style="{ color: 'hsl(156, 100%, 21%)' }">BackBox won</span>
                            <span class="text-sm font-semibold text-bm-text-hi">{{ fmtMoney(row.backBox.price!, row.currency) }}</span>
                          </div>
                        </div>
                      </template>
                      <template v-else-if="row.backBox.status === 'opportunity'">
                        <div class="flex flex-col">
                          <span class="text-[11px] font-semibold" :style="{ color: 'hsl(42, 75%, 27%)' }">BackBox opportunity</span>
                          <span class="text-sm font-semibold text-bm-text-hi">{{ fmtMoney(row.backBox.price!, row.currency) }}</span>
                          <span v-if="row.backBox.note" class="text-[11px] text-bm-text-low">{{ row.backBox.note }}</span>
                        </div>
                      </template>
                      <template v-else-if="row.backBox.status === 'offline'">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-static-default-mid border border-bm-border text-sm text-bm-text-mid">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path stroke-linecap="round" stroke-linejoin="round" d="M8 14s1.5-2 4-2 4 2 4 2M9 9h.01M15 9h.01" /></svg>
                          Listing offline
                        </span>
                      </template>
                    </div>

                    <div class="text-sm">
                      <template v-if="row.strategy.type === 'deal-included'">
                        <span class="inline-flex items-center gap-1 px-1 py-0.5 rounded-bm-xs text-[11px] font-semibold mb-1" :class="TAG_FILL.success">
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm3.7-9.3a1 1 0 0 0-1.4-1.4L9 10.6 7.7 9.3a1 1 0 0 0-1.4 1.4l2 2a1 1 0 0 0 1.4 0l4-4Z" /></svg>
                          {{ row.strategy.title }}
                        </span>
                        <p class="text-[12px] text-bm-text-hi font-semibold">{{ row.strategy.line1 }}</p>
                        <p class="text-[11px] text-bm-text-low">{{ row.strategy.line2 }}</p>
                      </template>
                      <template v-else-if="row.strategy.type === 'visibility-boosted'">
                        <span class="inline-flex items-center gap-1 px-1 py-0.5 rounded-bm-xs text-[11px] font-semibold mb-1" :class="TAG_FILL.success">
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.05a.5.5 0 0 1 .58.61l-1.5 5.84h5.12a.5.5 0 0 1 .4.8l-8.7 11.65a.5.5 0 0 1-.88-.4l1.5-5.84H2.7a.5.5 0 0 1-.4-.8l8.7-11.66a.5.5 0 0 1 .3-.2Z" /></svg>
                          {{ row.strategy.title }}
                        </span>
                        <p class="text-[11px] text-bm-text-low">{{ row.strategy.line1 }}</p>
                      </template>
                      <template v-else-if="row.strategy.type === 'deal-opportunity'">
                        <span class="text-[12px] font-semibold text-bm-text-hi block mb-0.5">{{ row.strategy.title }}</span>
                        <p class="text-[12px] text-bm-text-hi">{{ row.strategy.line1 }}</p>
                        <p class="text-[11px] text-bm-text-low">{{ row.strategy.line2 }}</p>
                      </template>
                      <template v-else-if="row.strategy.type === 'visibility-opportunity'">
                        <span class="text-[12px] font-semibold text-bm-text-hi block mb-0.5">{{ row.strategy.title }}</span>
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
                          'inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-bm-sm whitespace-nowrap transition-colors w-full',
                          a.variant === 'primary' ? 'bg-bm-text-hi text-white hover:bg-bm-gray-700'
                            : a.variant === 'flash' ? 'text-white'
                            : 'bg-static-default-low text-bm-text-hi border border-bm-border-action hover:bg-static-default-mid',
                        ]"
                        :style="a.variant === 'flash' ? { background: 'hsl(156, 100%, 21%)' } : undefined"
                      >
                        <svg v-if="a.variant === 'flash'" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.05a.5.5 0 0 1 .58.61l-1.5 5.84h5.12a.5.5 0 0 1 .4.8l-8.7 11.65a.5.5 0 0 1-.88-.4l1.5-5.84H2.7a.5.5 0 0 1-.4-.8l8.7-11.66a.5.5 0 0 1 .3-.2Z" /></svg>
                        {{ a.label }}
                      </button>
                    </div>
                  </div>
                </div>
              </template>
            </div>

            <div class="flex items-center justify-center gap-2 mt-6">
              <button class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-bm-text-mid border border-bm-border-action rounded-full bg-static-default-low hover:bg-static-default-mid transition-colors">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Previous
              </button>
              <button class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-semibold text-bm-text-hi border border-bm-border-action rounded-full bg-static-default-low hover:bg-static-default-mid transition-colors">
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
