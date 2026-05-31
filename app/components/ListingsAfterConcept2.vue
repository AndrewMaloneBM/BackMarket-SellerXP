<script setup lang="ts">
const NAV_ITEMS = ['Home', 'Insights', 'Customer Care', 'Listings', 'Orders', 'Opportunities', 'Money', 'Options', 'Seller Support'] as const
const SELLER_NAME = 'Merchant'
const TABS = ['Active', 'On hold', 'Archived'] as const

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

type Currency = 'EUR' | 'SEK'
type BackBoxStatus = 'won' | 'opportunity'
type StrategyType = 'visibility-boost' | 'apply-deal' | 'none'
type PromoType = 'visibility-boost' | 'apply-deal' | 'none'
type RecommendationSide = 'backbox' | 'promo'

interface Market { code: string; active: boolean }

interface PricingRow {
  code: string
  country: string
  currency: Currency
  minPrice: number
  targetPrice: number
  backBox: { status: BackBoxStatus; price: number }
  strategy: { type: StrategyType; price?: number }
  bbMargin: number
  promoMargin?: number
  bbHigher: boolean
  recommendation: { side: RecommendationSide; reason: string }
}

interface Listing {
  id: string
  thumb: string
  title: string
  sku: string
  grade: 'Excellent' | 'Fair' | 'Good'
  sim: string
  newBattery: boolean
  units: number
  markets: Market[]
  competition: 'None' | 'Very low' | 'Low' | 'Medium' | 'High'
  basePrice: number
}

const MARKET_CODES = ['AT', 'BE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'NL', 'PT', 'SK', 'ES', 'SE'] as const

const COUNTRY: Record<string, { name: string; currency: Currency }> = {
  AT: { name: 'Austria',     currency: 'EUR' },
  BE: { name: 'Belgium',     currency: 'EUR' },
  FI: { name: 'Finland',     currency: 'EUR' },
  FR: { name: 'France',      currency: 'EUR' },
  DE: { name: 'Germany',     currency: 'EUR' },
  GR: { name: 'Greece',      currency: 'EUR' },
  IE: { name: 'Ireland',     currency: 'EUR' },
  IT: { name: 'Italy',       currency: 'EUR' },
  NL: { name: 'Netherlands', currency: 'EUR' },
  PT: { name: 'Portugal',    currency: 'EUR' },
  SK: { name: 'Slovakia',    currency: 'EUR' },
  ES: { name: 'Spain',       currency: 'EUR' },
  SE: { name: 'Sweden',      currency: 'SEK' },
}

const PROMO_BY_MARKET: Record<string, PromoType> = {
  FR: 'visibility-boost', AT: 'visibility-boost', DE: 'visibility-boost',
  GR: 'visibility-boost', PT: 'visibility-boost', FI: 'apply-deal',
  ES: 'none', SE: 'visibility-boost', BE: 'visibility-boost',
  IE: 'visibility-boost', IT: 'visibility-boost', NL: 'visibility-boost',
  SK: 'visibility-boost',
}

const BACKBOX_OPPORTUNITY_MARKETS = new Set(['SE'])

const BB_MARGIN_RATE: Record<string, number> = {
  FR: 0.136, AT: 0.131, FI: 0.140, DE: 0.126,
  GR: 0.122, PT: 0.124, ES: 0.128, SE: 0.132,
  BE: 0.130, IE: 0.130, IT: 0.134, NL: 0.128, SK: 0.124,
}

const PRICE_DELTA_FROM_BASE: Record<string, number> = {
  FR: -1, AT: -4, FI: -8, DE: -6, GR: -9, PT: -7,
  ES: -5, SE: -3, BE: -3, IE: -4, IT: -2, NL: -5, SK: -6,
}

function mkMarkets(overrides: Partial<Record<string, boolean>> = {}): Market[] {
  return MARKET_CODES.map(code => ({ code, active: overrides[code] ?? true }))
}

function recommendationFor(
  isOpportunity: boolean,
  promo: PromoType,
  bbHigher: boolean,
): { side: RecommendationSide; reason: string } {
  if (isOpportunity) {
    return { side: 'backbox', reason: 'Win the BackBox first to start selling in this market.' }
  }
  if (promo === 'none') {
    return { side: 'backbox', reason: 'No promotion available — match the BackBox price to stay competitive.' }
  }
  if (bbHigher) {
    return { side: 'backbox', reason: 'Winning the BackBox earns more here — the promotion trades margin for reach.' }
  }
  return { side: 'promo', reason: 'A deal earns more here — the commission saving beats the price cut.' }
}

function pricingFor(listing: Listing): PricingRow[] {
  return listing.markets.filter(m => m.active).map((m): PricingRow => {
    const { name, currency } = COUNTRY[m.code]
    const rate = BB_MARGIN_RATE[m.code] ?? 0.13
    const priceDelta = PRICE_DELTA_FROM_BASE[m.code] ?? -3
    const cf = currency === 'SEK' ? 11.7 : 1

    const bbMarginEur = listing.basePrice * rate
    const bbPriceEur = listing.basePrice + priceDelta + 0.45
    const promoPriceEur = bbPriceEur - listing.basePrice * 0.12
    const minPriceEur = listing.basePrice + priceDelta - 25 + 0.45
    const targetPriceEur = bbPriceEur + 5

    const bbMargin = bbMarginEur * cf
    const bbPrice = bbPriceEur * cf
    const promoPrice = promoPriceEur * cf
    const minPrice = minPriceEur * cf
    const targetPrice = targetPriceEur * cf

    const isOpportunity = BACKBOX_OPPORTUNITY_MARKETS.has(m.code)
    const promo = PROMO_BY_MARKET[m.code] ?? 'visibility-boost'

    let strategy: PricingRow['strategy'] = { type: 'none' }
    let promoMargin: number | undefined

    if (promo === 'visibility-boost') {
      promoMargin = (bbMarginEur - listing.basePrice * 0.028) * cf
      strategy = { type: 'visibility-boost', price: promoPrice }
    } else if (promo === 'apply-deal') {
      promoMargin = (bbMarginEur + listing.basePrice * 0.006) * cf
      strategy = { type: 'apply-deal', price: promoPrice }
    }

    const bbHigher = promoMargin === undefined ? true : bbMargin > promoMargin

    return {
      code: m.code,
      country: name,
      currency,
      minPrice,
      targetPrice,
      backBox: { status: isOpportunity ? 'opportunity' : 'won', price: bbPrice },
      strategy,
      bbMargin,
      promoMargin,
      bbHigher,
      recommendation: recommendationFor(isOpportunity, promo, bbHigher),
    }
  })
}

const listings: Listing[] = [
  { id: 'L1',  thumb: 'iphone-blue',    title: 'iPhone 13 Pro - 128GB - Natural titanium - Unlocked', sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: true,  units: 50, markets: mkMarkets({ BE: false, IE: false, IT: false, NL: false, SK: false }), competition: 'Low',      basePrice: 500 },
  { id: 'L2',  thumb: 'samsung-s20',    title: 'Samsung Galaxy S20 - 128GB - Cosmic Gray - Unlocked', sku: '12345-S-BL', grade: 'Excellent', sim: 'Dual SIM',           newBattery: true,  units: 50, markets: mkMarkets({ BE: false, IT: false, NL: false, SK: false }),              competition: 'Medium',   basePrice: 280 },
  { id: 'L3',  thumb: 'oneplus-7t',     title: 'OnePlus 7T - 128GB - Glacier Blue - Unlocked',       sku: '12345-S-BL', grade: 'Excellent', sim: 'eSIM',               newBattery: true,  units: 50, markets: mkMarkets({ BE: false, IT: false, NL: false, SK: false }),              competition: 'Medium',   basePrice: 220 },
  { id: 'L4',  thumb: 'sony-xperia',    title: 'Sony Xperia 5 - 128GB - Black - Unlocked',           sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: false, units: 0,  markets: mkMarkets({ BE: false, NL: false, SK: false }),                          competition: 'Very low', basePrice: 240 },
  { id: 'L5',  thumb: 'xiaomi-9t',      title: 'Xiaomi 9T - 128GB - Carbon Black - Unlocked',        sku: '12345-S-BL', grade: 'Excellent', sim: 'Dual SIM',           newBattery: true,  units: 0,  markets: mkMarkets({ BE: false, IT: false, NL: false, SK: false }),              competition: 'None',     basePrice: 180 },
  { id: 'L6',  thumb: 'iphone-13-mid',  title: 'iPhone 13 - 128GB - Midnight - Unlocked',            sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: false, units: 50, markets: mkMarkets({ BE: false, IT: false }),                                    competition: 'Medium',   basePrice: 430 },
  { id: 'L7',  thumb: 'samsung-a7',     title: 'Samsung Galaxy A7 - 128GB - White - Unlocked',       sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: true,  units: 50, markets: mkMarkets({ BE: false, IT: false }),                                    competition: 'Medium',   basePrice: 195 },
  { id: 'L8',  thumb: 'lg-g7',          title: 'LG G7 - 128GB - Midnight - Unlocked',                sku: '12345-S-BL', grade: 'Excellent', sim: 'eSIM',               newBattery: false, units: 50, markets: mkMarkets({ BE: false, IT: false }),                                    competition: 'Very low', basePrice: 165 },
  { id: 'L9',  thumb: 'nokia-3310',     title: 'Nokia 3310',                                          sku: '12345-S-BL', grade: 'Excellent', sim: 'Dual SIM',           newBattery: false, units: 50, markets: mkMarkets({ BE: false, IT: false }),                                    competition: 'Very low', basePrice: 55  },
  { id: 'L10', thumb: 'samsung-s23',    title: 'Samsung Galaxy S23 - 128GB - Cosmic Gray - Unlocked', sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: true,  units: 50, markets: mkMarkets({ BE: false, IT: false }),                                    competition: 'Medium',   basePrice: 510 },
]

function competitionTag(c: Listing['competition']): { bg: string; text: string; label: string } {
  switch (c) {
    case 'Low':       return { bg: 'bg-[hsl(38,90%,84%)]',  text: 'text-[hsl(42,75%,27%)]', label: 'Low' }
    case 'Medium':    return { bg: 'bg-[hsl(38,90%,84%)]',  text: 'text-[hsl(42,75%,27%)]', label: 'Medium' }
    case 'Very low':  return { bg: 'bg-[hsl(221,86%,92%)]', text: 'text-[hsl(219,27%,40%)]', label: 'Very low' }
    case 'None':      return { bg: 'bg-[hsl(145,83%,77%)]', text: 'text-[hsl(156,100%,21%)]', label: 'None' }
    case 'High':      return { bg: 'bg-[hsl(3,100%,92%)]',  text: 'text-[hsl(351,84%,39%)]', label: 'High' }
  }
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

function currencySymbol(c: Currency): string {
  return c === 'SEK' ? 'SEK' : '€'
}
function fmtMoney(amount: number, c: Currency): string {
  const f = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (c === 'SEK') return `${f} SEK`
  return `€${f}`
}
function fmtMargin(amount: number, c: Currency): string {
  const rounded = Math.round(amount)
  if (c === 'SEK') return `${rounded.toLocaleString('en-US')} SEK`
  return `€${rounded.toLocaleString('en-US')}`
}
</script>

<template>
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
      <div class="flex flex-col gap-3 md:flex-row md:gap-4">
        <button class="rounded-bm-sm px-[11px] py-[11px] min-w-20 cursor-pointer bg-white border border-bm-text-hi text-bm-text-hi text-base font-semibold hover:bg-bm-gray-50 transition-colors">Import or export listings</button>
        <button class="rounded-bm-sm px-[11px] py-[11px] min-w-20 cursor-pointer bg-white border border-bm-text-hi text-bm-text-hi text-base font-semibold hover:bg-bm-gray-50 transition-colors">Manage price rules</button>
        <button class="rounded-bm-sm p-3 min-w-20 cursor-pointer bg-bm-text-hi text-white text-base font-semibold hover:bg-bm-gray-700 transition-colors">Create new listing</button>
      </div>
    </template>

    <div class="py-8">
      <form class="md:flex md:items-start">
        <div class="grow">
          <div class="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
            <div class="relative">
              <input id="f-title-c2" type="text" placeholder=" " class="peer h-12 w-full px-3 pt-1 rounded-bm-sm border border-bm-border-action bg-white text-base text-bm-text-hi placeholder:text-transparent focus:outline-none focus:border-bm-text-hi" />
              <label for="f-title-c2" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 truncate text-base text-bm-text-hi transition-all
                                          peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-bm-text-low
                                          peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0
                                          peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-bm-text-low">Title</label>
            </div>

            <div class="relative">
              <input id="f-sku-c2" type="text" placeholder=" " class="peer h-12 w-full px-3 pt-1 rounded-bm-sm border border-bm-border-action bg-white text-base text-bm-text-hi placeholder:text-transparent focus:outline-none focus:border-bm-text-hi" />
              <label for="f-sku-c2" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 truncate text-base text-bm-text-hi transition-all
                                        peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-bm-text-low
                                        peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0
                                        peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-bm-text-low">SKU</label>
            </div>

            <button type="button" class="relative flex w-full items-center border border-bm-border-action rounded-bm-sm px-3 h-12 bg-white text-bm-text-hi hover:bg-bm-gray-50 transition-colors text-left">
              <span class="pointer-events-none absolute inset-x-3 top-1.5 text-xs text-bm-text-low">Market(s)</span>
              <span class="truncate pr-8 pt-4 text-base">All</span>
              <svg class="pointer-events-none absolute right-3 w-5 h-5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
            </button>

            <button type="button" class="relative flex w-full items-center border border-bm-border-action rounded-bm-sm px-3 h-12 bg-white text-bm-text-hi hover:bg-bm-gray-50 transition-colors text-left">
              <span class="truncate pr-8 text-base">BackBox price difference</span>
              <svg class="pointer-events-none absolute right-3 w-5 h-5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
            </button>

            <button type="button" class="relative flex w-full items-center border border-bm-border-action rounded-bm-sm px-3 h-12 bg-white text-bm-text-hi hover:bg-bm-gray-50 transition-colors text-left">
              <span class="pointer-events-none absolute inset-x-3 top-1.5 text-xs text-bm-text-low">Sales strategy</span>
              <span class="truncate pr-8 pt-4 text-base">All</span>
              <svg class="pointer-events-none absolute right-3 w-5 h-5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
            </button>
          </div>

          <div v-show="showMoreFilters" class="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
            <button v-for="label in ['Product ID', 'Appearance', 'Grade', 'Categories', 'Battery type']" :key="label" type="button" class="relative flex w-full items-center border border-bm-border-action rounded-bm-sm px-3 h-12 bg-white text-bm-text-hi hover:bg-bm-gray-50 transition-colors text-left">
              <span class="truncate pr-8 text-base">{{ label }}</span>
              <svg class="pointer-events-none absolute right-3 w-5 h-5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
            </button>
          </div>
          <div v-show="showMoreFilters" class="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
            <button v-for="label in ['Inventory', 'BackBox', 'Competition level']" :key="label" type="button" class="relative flex w-full items-center border border-bm-border-action rounded-bm-sm px-3 h-12 bg-white text-bm-text-hi hover:bg-bm-gray-50 transition-colors text-left">
              <span class="truncate pr-8 text-base">{{ label }}</span>
              <svg class="pointer-events-none absolute right-3 w-5 h-5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
            </button>
          </div>
        </div>

        <div class="ml-4 flex items-start gap-4 mt-4 md:mt-0">
          <button type="submit" class="rounded-bm-sm p-3 cursor-pointer bg-bm-text-hi text-white text-base font-semibold hover:bg-bm-gray-700 transition-colors whitespace-nowrap">Apply filters</button>
          <button type="button" class="rounded-bm-sm text-bm-text-hi text-base font-semibold underline hover:text-bm-text-mid transition-colors h-12 flex items-center whitespace-nowrap">Reset filters</button>
        </div>
      </form>

      <div class="mb-2">
        <button type="button" class="rounded-bm-sm px-[11px] py-[5px] cursor-pointer bg-white border border-bm-text-hi text-bm-text-hi text-sm font-semibold hover:bg-bm-gray-50 transition-colors" @click="showMoreFilters = !showMoreFilters">{{ showMoreFilters ? 'Show less filters' : 'Show more filters' }}</button>
      </div>

      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between mb-6 mt-6 md:mb-8 md:mt-8">
        <div class="flex flex-col gap-4 md:gap-2">
          <h2 class="text-[1.375rem] leading-8 font-semibold text-bm-text-hi">87 active listings</h2>
          <label class="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" class="peer sr-only" :checked="expandAll" @change="expandAll = !expandAll" />
            <span class="bg-white border border-bm-border-action rounded-full relative flex h-6 w-[46px] shrink-0 items-center peer-checked:bg-bm-success peer-checked:border-bm-success transition-colors">
              <span :class="['absolute w-5 h-5 rounded-full shadow transition-all', expandAll ? 'left-[24px] bg-white' : 'left-[2px] bg-bm-gray-400']" />
            </span>
            <span class="text-base text-bm-text-hi">Expand all</span>
          </label>
        </div>

        <div class="space-y-3 lg:flex lg:gap-3 lg:space-y-0">
          <div class="relative lg:min-w-[14rem]">
            <span class="relative flex w-full items-center border border-bm-border-action rounded-bm-sm px-3 h-12 bg-white text-bm-text-hi">
              <label class="pointer-events-none absolute inset-x-3 top-1.5 text-xs text-bm-text-low">Number of listings</label>
              <select class="w-full appearance-none truncate border-0 bg-transparent pl-0 pr-8 pt-4 outline-none text-base">
                <option>10</option><option>20</option><option>30</option><option>50</option>
              </select>
              <svg class="pointer-events-none absolute right-3 w-5 h-5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
            </span>
          </div>
          <div class="relative lg:min-w-[14rem]">
            <span class="relative flex w-full items-center border border-bm-border-action rounded-bm-sm px-3 h-12 bg-white text-bm-text-hi">
              <label class="pointer-events-none absolute inset-x-3 top-1.5 text-xs text-bm-text-low">Sort by</label>
              <select class="w-full appearance-none truncate border-0 bg-transparent pl-0 pr-8 pt-4 outline-none text-base">
                <option>Inventory (descending)</option>
                <option>Quantity (ascending)</option>
                <option>Alphabetical order (A-Z)</option>
                <option>Alphabetical order (Z-A)</option>
              </select>
              <svg class="pointer-events-none absolute right-3 w-5 h-5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
            </span>
          </div>
        </div>
      </div>

      <div class="mb-8 flex flex-col gap-3 md:flex-row md:flex-wrap md:justify-between md:gap-3">
        <div class="flex flex-col gap-3 md:flex-row">
          <button class="rounded-bm-sm px-[11px] py-[5px] cursor-pointer bg-white border border-bm-text-hi text-bm-text-hi text-sm font-semibold hover:bg-bm-gray-50 transition-colors">See all within €4.00 of BackBoxes</button>
          <button class="rounded-bm-sm px-[11px] py-[5px] cursor-pointer bg-white border border-bm-text-hi text-bm-text-hi text-sm font-semibold hover:bg-bm-gray-50 transition-colors">See all within €8.00 of BackBoxes</button>
        </div>
        <button class="rounded-bm-sm px-[11px] py-[5px] cursor-pointer bg-white border border-bm-text-hi text-bm-text-hi text-sm font-semibold hover:bg-bm-gray-50 transition-colors inline-flex items-center gap-2">
          See all deal opportunities
          <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <div class="bg-white rounded-bm-lg shadow-sm overflow-hidden">
        <table class="w-full border-collapse text-base text-bm-text-mid">
          <thead class="border-b border-bm-border h-14 bg-transparent">
            <tr>
              <th class="px-4 py-3 first:pl-6"></th>
              <th class="px-4 py-3 first:pl-6 text-left text-base font-semibold text-bm-text-hi">Product</th>
              <th class="px-4 py-3 first:pl-6 text-left text-base font-semibold text-bm-text-hi">Inventory</th>
              <th class="px-4 py-3 first:pl-6 text-left text-base font-semibold text-bm-text-hi">Market(s)</th>
              <th class="px-4 py-3 first:pl-6 text-left text-base font-semibold text-bm-text-hi">Competition (Last 7d average)</th>
              <th class="px-4 py-3 last:pr-6 text-right"></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(listing, idx) in listings" :key="listing.id">
              <tr :class="['bg-white', idx !== listings.length - 1 && 'border-b border-bm-border']">
                <td class="px-4 py-6 first:pl-6 align-middle">
                  <div class="h-12 w-12 rounded-bm-sm border border-bm-border" :style="{ background: thumbBg(listing.thumb) }" />
                </td>

                <td class="px-4 py-6 align-middle max-w-[320px]">
                  <div class="flex flex-col">
                    <button class="text-base font-semibold text-bm-text-hi underline hover:text-bm-text-mid text-left cursor-pointer">{{ listing.title }}</button>
                    <span class="mt-1 text-sm text-bm-text-low max-w-[256px] break-words">SKU: {{ listing.sku }}</span>
                    <div class="mt-3 flex flex-wrap items-center gap-3">
                      <span :class="['inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs', listing.grade === 'Fair' ? 'bg-[hsl(45,100%,85%)] text-[hsl(38,90%,28%)]' : 'bg-static-default-mid text-bm-text-hi']">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09" /></svg>
                        {{ listing.grade }}
                      </span>
                      <span class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs bg-static-default-mid text-bm-text-hi">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18" rx="2" /><path d="M9 17h6" /></svg>
                        {{ listing.sim }}
                      </span>
                      <span v-if="listing.newBattery" class="inline-flex items-center justify-center rounded-full px-2 py-1 text-xs" :style="{ background: 'hsl(145, 83%, 90%)', color: 'hsl(156, 100%, 21%)' }">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="8" width="16" height="10" rx="1.5" /><path d="M19 11v4" /><path stroke-linecap="round" stroke-linejoin="round" d="m8 13 2 2 4-4" /></svg>
                      </span>
                    </div>
                    <button class="mt-2 inline-flex items-center gap-1 text-sm text-bm-text-hi underline hover:text-bm-text-mid w-fit cursor-pointer">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>
                      Archive listing
                    </button>
                  </div>
                </td>

                <td class="px-4 py-6 align-middle">
                  <div class="relative max-w-[130px]">
                    <input :value="listing.units" type="text" class="peer h-12 w-full px-3 pr-10 pt-4 rounded-bm-sm border border-bm-border-action bg-white text-base text-bm-text-hi focus:outline-none focus:border-bm-text-hi" />
                    <label class="pointer-events-none absolute left-3 top-1.5 text-xs text-bm-text-low">Units</label>
                    <button class="absolute right-1 top-1 size-10 rounded-full flex items-center justify-center bg-white text-bm-text-low hover:bg-static-default-mid transition-colors">
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </td>

                <td class="px-4 py-6 align-middle">
                  <ul class="flex list-none flex-wrap gap-1 max-w-[320px]">
                    <li v-for="m in listing.markets" :key="m.code">
                      <span :class="['inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold border-[1.5px]', m.active ? 'bg-[hsl(145,83%,93%)] border-[hsl(145,60%,55%)] text-bm-text-hi' : 'bg-[hsl(3,100%,96%)] border-[hsl(3,80%,65%)] text-bm-text-hi']">
                        <FlagChip :code="m.code" :height="8" />
                        {{ m.code }}
                      </span>
                    </li>
                  </ul>
                </td>

                <td class="px-4 py-6 align-middle">
                  <span :class="['inline-block rounded-bm-xs px-1 text-sm font-semibold', competitionTag(listing.competition).bg, competitionTag(listing.competition).text]">{{ competitionTag(listing.competition).label }}</span>
                </td>

                <td class="px-4 py-6 last:pr-6 text-right align-middle">
                  <button class="size-8 rounded-full inline-flex items-center justify-center bg-white text-bm-text-hi hover:bg-static-default-mid transition-colors" @click="toggleRow(listing.id)">
                    <svg :class="['w-5 h-5 transition-transform', isExpanded(listing.id) && 'rotate-180']" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                  </button>
                </td>
              </tr>

              <tr v-if="isExpanded(listing.id)" :class="[idx !== listings.length - 1 && 'border-b border-bm-border']">
                <td colspan="6" class="p-0">
                  <div class="bg-static-default-mid flex justify-end gap-2 px-5 py-6">
                    <button class="rounded-bm-sm px-3 py-1.5 cursor-pointer bg-bm-text-hi text-white text-sm font-semibold hover:bg-bm-gray-700 transition-colors">Win all BackBoxes</button>
                    <button class="rounded-bm-sm px-[11px] py-[5px] cursor-pointer bg-white border border-bm-text-hi text-bm-text-hi text-sm font-semibold hover:bg-bm-gray-50 transition-colors">Maximize all sales</button>
                  </div>

                  <div class="bg-static-default-mid">
                    <table class="w-full border-collapse text-base">
                      <thead class="border-b border-bm-border h-14">
                        <tr>
                          <th class="px-4 py-3 first:pl-6 text-left text-base font-semibold text-bm-text-hi">Market</th>
                          <th class="px-4 py-3 text-left text-base font-semibold text-bm-text-hi">Minimum price</th>
                          <th class="px-4 py-3 text-left text-base font-semibold text-bm-text-hi">Target price</th>
                          <th class="px-4 py-3 text-left text-base font-semibold text-bm-text-hi">
                            <div class="flex items-center gap-1">
                              BackBox price
                              <span class="size-8 inline-flex items-center justify-center rounded-full bg-white text-bm-text-hi">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2v-3a1 1 0 0 0-1-1H9Z" clip-rule="evenodd" /></svg>
                              </span>
                            </div>
                          </th>
                          <th class="px-4 py-3 text-left text-base font-semibold text-bm-text-hi">
                            <div class="flex items-center gap-1">
                              Pricing strategy
                              <span class="size-8 inline-flex items-center justify-center rounded-full bg-white text-bm-text-hi">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2v-3a1 1 0 0 0-1-1H9Z" clip-rule="evenodd" /></svg>
                              </span>
                            </div>
                          </th>
                          <th class="px-4 py-3 last:pr-6"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, ri) in pricingFor(listing)" :key="row.code" :class="['bg-white', ri !== pricingFor(listing).length - 1 && 'border-b border-bm-border']">
                          <td class="px-4 py-6 first:pl-6 align-middle">
                            <button class="inline-flex items-center gap-2 text-base text-bm-text-hi hover:underline cursor-pointer">
                              <FlagChip :code="row.code" :height="12" />
                              {{ row.country }}
                            </button>
                          </td>

                          <td class="px-4 py-6 align-middle">
                            <div class="relative max-w-[130px]">
                              <input :value="row.minPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })" type="text" class="peer h-12 w-full px-3 pr-10 pt-4 rounded-bm-sm border border-bm-border-action bg-white text-base text-bm-text-hi focus:outline-none focus:border-bm-text-hi" />
                              <label class="pointer-events-none absolute left-3 top-1.5 text-xs text-bm-text-low">Min.({{ currencySymbol(row.currency) }})</label>
                              <button class="absolute right-1 top-1 size-10 rounded-full flex items-center justify-center bg-white text-bm-text-low hover:bg-static-default-mid transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          </td>

                          <td class="px-4 py-6 align-middle">
                            <div class="relative max-w-[130px]">
                              <input :value="row.targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })" type="text" class="peer h-12 w-full px-3 pr-10 pt-4 rounded-bm-sm border border-bm-border-action bg-white text-base text-bm-text-hi focus:outline-none focus:border-bm-text-hi" />
                              <label class="pointer-events-none absolute left-3 top-1.5 text-xs text-bm-text-low">Target ({{ currencySymbol(row.currency) }})</label>
                              <button class="absolute right-1 top-1 size-10 rounded-full flex items-center justify-center bg-white text-bm-text-low hover:bg-static-default-mid transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          </td>

                          <td class="px-4 py-6 align-middle">
                            <div v-if="row.backBox.status === 'won'" class="flex items-start gap-3" :style="{ color: 'hsl(156, 100%, 21%)' }">
                              <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" /></svg>
                              <div class="flex flex-col gap-0.5">
                                <div class="flex items-center gap-2 flex-wrap">
                                  <span class="rounded-bm-xs inline-block w-fit px-1 text-xs font-semibold" :style="{ background: 'hsl(145, 83%, 77%)', color: 'hsl(156, 100%, 21%)' }">You've won the BackBox</span>
                                  <span v-if="row.recommendation.side === 'backbox'" class="inline-flex items-center gap-1 text-xs font-medium" :style="{ color: 'hsl(156, 100%, 21%)' }">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" /></svg>
                                    Recommended
                                  </span>
                                </div>
                                <p class="text-base font-semibold text-bm-text-hi">{{ fmtMoney(row.backBox.price, row.currency) }}</p>
                                <p class="mt-1 text-xs font-medium text-bm-text-low flex items-center gap-1.5 flex-wrap">
                                  {{ fmtMargin(row.bbMargin, row.currency) }}/unit projected margin
                                  <span v-if="row.bbHigher && row.promoMargin !== undefined" class="inline-flex items-center gap-1 text-xs font-medium" :style="{ color: 'hsl(156, 100%, 21%)' }">
                                    <span class="inline-block size-1.5 rounded-full" :style="{ background: 'hsl(156, 100%, 21%)' }" />
                                    Higher margin
                                  </span>
                                </p>
                                <p v-if="row.recommendation.side === 'backbox'" class="text-xs text-bm-text-low leading-relaxed max-w-[360px]">{{ row.recommendation.reason }}</p>
                                <button class="inline-flex items-center gap-1 text-xs text-bm-text-hi underline hover:text-bm-text-mid cursor-pointer w-fit">
                                  How is this calculated?
                                  <svg class="w-3.5 h-3.5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2v-3a1 1 0 0 0-1-1H9Z" clip-rule="evenodd" /></svg>
                                </button>
                                <a v-if="row.code === 'FR'" class="inline-flex items-center gap-1 mt-1 text-xs text-bm-text-low underline hover:text-bm-text-mid cursor-pointer w-fit">
                                  Last time you won the BackBox here: 14 units sold in 7 days
                                  <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                                </a>
                                <button v-if="row.recommendation.side === 'backbox'" class="rounded-bm-sm px-3 py-1.5 mt-2 text-sm font-semibold cursor-pointer transition-colors inline-flex items-center justify-center gap-2 text-white self-start" :style="{ background: 'hsl(156, 100%, 21%)' }">
                                  Apply price
                                  <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.05a.5.5 0 0 1 .58.61l-1.5 5.84h5.12a.5.5 0 0 1 .4.8l-8.7 11.65a.5.5 0 0 1-.88-.4l1.5-5.84H2.7a.5.5 0 0 1-.4-.8l8.7-11.66a.5.5 0 0 1 .3-.2Z" /></svg>
                                </button>
                                <button v-else class="rounded-bm-sm px-[11px] py-[5px] mt-2 text-sm font-semibold cursor-pointer transition-colors inline-flex items-center justify-center gap-2 bg-white border border-bm-border-action text-bm-text-hi hover:bg-static-default-mid self-start">
                                  Apply price
                                </button>
                              </div>
                            </div>
                            <div v-else class="flex items-start gap-3" style="color: hsl(219, 27%, 40%)">
                              <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m21 8-9 4-9-4m18 0-9-4-9 4m18 0v8l-9 4m-9-12v8l9 4m0-12v12" /></svg>
                              <div class="flex flex-col gap-0.5">
                                <div class="flex items-center gap-2 flex-wrap">
                                  <span class="rounded-bm-xs inline-block w-fit px-1 text-xs font-semibold bg-static-default-hi text-bm-text-hi">BackBox</span>
                                  <span v-if="row.recommendation.side === 'backbox'" class="inline-flex items-center gap-1 text-xs font-medium" :style="{ color: 'hsl(156, 100%, 21%)' }">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" /></svg>
                                    Recommended
                                  </span>
                                </div>
                                <p class="text-base font-semibold text-bm-text-hi">{{ fmtMoney(row.backBox.price, row.currency) }}</p>
                                <p class="text-xs font-semibold text-bm-text-low">Win BackBox to start selling</p>
                                <p class="mt-1 text-xs font-medium text-bm-text-low flex items-center gap-1.5 flex-wrap">
                                  {{ fmtMargin(row.bbMargin, row.currency) }}/unit projected margin
                                  <span v-if="row.bbHigher && row.promoMargin !== undefined" class="inline-flex items-center gap-1 text-xs font-medium" :style="{ color: 'hsl(156, 100%, 21%)' }">
                                    <span class="inline-block size-1.5 rounded-full" :style="{ background: 'hsl(156, 100%, 21%)' }" />
                                    Higher margin
                                  </span>
                                </p>
                                <p v-if="row.recommendation.side === 'backbox'" class="text-xs text-bm-text-low leading-relaxed max-w-[360px]">{{ row.recommendation.reason }}</p>
                                <button class="inline-flex items-center gap-1 text-xs text-bm-text-hi underline hover:text-bm-text-mid cursor-pointer w-fit">
                                  How is this calculated?
                                  <svg class="w-3.5 h-3.5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2v-3a1 1 0 0 0-1-1H9Z" clip-rule="evenodd" /></svg>
                                </button>
                                <button v-if="row.recommendation.side === 'backbox'" class="rounded-bm-sm px-3 py-1.5 mt-2 text-sm font-semibold cursor-pointer transition-colors inline-flex items-center justify-center gap-2 text-white self-start" :style="{ background: 'hsl(156, 100%, 21%)' }">
                                  Apply price
                                  <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.05a.5.5 0 0 1 .58.61l-1.5 5.84h5.12a.5.5 0 0 1 .4.8l-8.7 11.65a.5.5 0 0 1-.88-.4l1.5-5.84H2.7a.5.5 0 0 1-.4-.8l8.7-11.66a.5.5 0 0 1 .3-.2Z" /></svg>
                                </button>
                              </div>
                            </div>
                          </td>

                          <td class="px-4 py-6 align-middle">
                            <div v-if="row.strategy.type === 'visibility-boost'" class="flex items-start gap-3 max-w-[400px]" :style="{ color: 'hsl(219, 27%, 40%)' }">
                              <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.05a.5.5 0 0 1 .58.61l-1.5 5.84h5.12a.5.5 0 0 1 .4.8l-8.7 11.65a.5.5 0 0 1-.88-.4l1.5-5.84H2.7a.5.5 0 0 1-.4-.8l8.7-11.66a.5.5 0 0 1 .3-.2Z" /></svg>
                              <div class="flex flex-col gap-0.5">
                                <div class="flex items-center gap-2 flex-wrap">
                                  <span class="rounded-bm-xs inline-block w-fit px-1 text-xs font-semibold bg-static-default-hi text-bm-text-hi">Visibility Boost</span>
                                  <span v-if="row.recommendation.side === 'promo'" class="inline-flex items-center gap-1 text-xs font-medium" :style="{ color: 'hsl(156, 100%, 21%)' }">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" /></svg>
                                    Recommended
                                  </span>
                                </div>
                                <p class="text-base font-semibold text-bm-text-hi">{{ fmtMoney(row.strategy.price!, row.currency) }}</p>
                                <p class="text-xs font-semibold" :style="{ color: 'hsl(156, 100%, 21%)' }">Higher visibility, more traffic</p>
                                <p class="mt-1 text-xs font-medium text-bm-text-low flex items-center gap-1.5 flex-wrap">
                                  {{ fmtMargin(row.promoMargin!, row.currency) }}/unit projected margin
                                  <span v-if="!row.bbHigher" class="inline-flex items-center gap-1 text-xs font-medium" :style="{ color: 'hsl(156, 100%, 21%)' }">
                                    <span class="inline-block size-1.5 rounded-full" :style="{ background: 'hsl(156, 100%, 21%)' }" />
                                    Higher margin
                                  </span>
                                </p>
                                <p v-if="row.recommendation.side === 'promo'" class="text-xs text-bm-text-low leading-relaxed max-w-[360px]">{{ row.recommendation.reason }}</p>
                                <button v-if="row.recommendation.side === 'promo'" class="rounded-bm-sm px-3 py-1.5 mt-2 text-sm font-semibold cursor-pointer transition-colors inline-flex items-center justify-center gap-2 text-white self-start" :style="{ background: 'hsl(156, 100%, 21%)' }">
                                  Apply price
                                  <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.05a.5.5 0 0 1 .58.61l-1.5 5.84h5.12a.5.5 0 0 1 .4.8l-8.7 11.65a.5.5 0 0 1-.88-.4l1.5-5.84H2.7a.5.5 0 0 1-.4-.8l8.7-11.66a.5.5 0 0 1 .3-.2Z" /></svg>
                                </button>
                                <button v-else class="rounded-bm-sm px-[11px] py-[5px] mt-2 text-sm font-semibold cursor-pointer transition-colors inline-flex items-center justify-center gap-2 bg-white border border-bm-border-action text-bm-text-hi hover:bg-static-default-mid self-start">
                                  Apply price
                                </button>
                              </div>
                            </div>
                            <div v-else-if="row.strategy.type === 'apply-deal'" class="flex items-start gap-3 max-w-[400px]" :style="{ color: 'hsl(219, 27%, 40%)' }">
                              <svg class="w-6 h-6 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.5 3A2.5 2.5 0 0 0 3 5.5v2.879a2.5 2.5 0 0 0 .732 1.767l6.5 6.5a2.5 2.5 0 0 0 3.536 0l2.878-2.878a2.5 2.5 0 0 0 0-3.536l-6.5-6.5A2.5 2.5 0 0 0 8.38 3H5.5ZM6 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" clip-rule="evenodd" /></svg>
                              <div class="flex flex-col gap-0.5">
                                <div class="flex items-center gap-2 flex-wrap">
                                  <span class="rounded-bm-xs inline-block w-fit px-1 text-xs font-semibold bg-static-default-hi text-bm-text-hi">Deal</span>
                                  <span v-if="row.recommendation.side === 'promo'" class="inline-flex items-center gap-1 text-xs font-medium" :style="{ color: 'hsl(156, 100%, 21%)' }">
                                    <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m5 13 4 4L19 7" /></svg>
                                    Recommended
                                  </span>
                                </div>
                                <p class="text-base font-semibold text-bm-text-hi">{{ fmtMoney(row.strategy.price!, row.currency) }} <span class="text-xs font-normal text-bm-text-low">or less</span></p>
                                <p class="text-xs font-semibold" :style="{ color: 'hsl(156, 100%, 21%)' }">~5% less commission, more margin</p>
                                <p class="mt-1 text-xs font-medium text-bm-text-low flex items-center gap-1.5 flex-wrap">
                                  {{ fmtMargin(row.promoMargin!, row.currency) }}/unit projected margin
                                  <span v-if="!row.bbHigher" class="inline-flex items-center gap-1 text-xs font-medium" :style="{ color: 'hsl(156, 100%, 21%)' }">
                                    <span class="inline-block size-1.5 rounded-full" :style="{ background: 'hsl(156, 100%, 21%)' }" />
                                    Higher margin
                                  </span>
                                </p>
                                <p v-if="row.recommendation.side === 'promo'" class="text-xs text-bm-text-low leading-relaxed max-w-[360px]">{{ row.recommendation.reason }}</p>
                                <button v-if="row.recommendation.side === 'promo'" class="rounded-bm-sm px-3 py-1.5 mt-2 text-sm font-semibold cursor-pointer transition-colors inline-flex items-center justify-center gap-2 text-white self-start" :style="{ background: 'hsl(156, 100%, 21%)' }">
                                  Apply price
                                  <svg class="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.05a.5.5 0 0 1 .58.61l-1.5 5.84h5.12a.5.5 0 0 1 .4.8l-8.7 11.65a.5.5 0 0 1-.88-.4l1.5-5.84H2.7a.5.5 0 0 1-.4-.8l8.7-11.66a.5.5 0 0 1 .3-.2Z" /></svg>
                                </button>
                                <button v-else class="rounded-bm-sm px-[11px] py-[5px] mt-2 text-sm font-semibold cursor-pointer transition-colors inline-flex items-center justify-center gap-2 bg-white border border-bm-border-action text-bm-text-hi hover:bg-static-default-mid self-start">
                                  Apply price
                                </button>
                              </div>
                            </div>
                          </td>

                          <td class="px-4 py-6 last:pr-6 align-middle" />
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <div class="flex items-center justify-around py-10">
        <div class="flex items-center gap-3">
          <button class="size-10 rounded-full inline-flex items-center justify-center bg-white border border-bm-border-action text-bm-text-hi hover:bg-static-default-mid transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <span class="text-bm-text-muted">Previous</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-bm-text-hi">Next</span>
          <button class="size-10 rounded-full inline-flex items-center justify-center bg-white border border-bm-border-action text-bm-text-hi hover:bg-static-default-mid transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  </BmShell>
</template>
