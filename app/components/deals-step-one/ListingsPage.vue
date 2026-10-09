<script setup lang="ts">
const NAV_ITEMS = ['Home', 'Insights', 'Customer Care', 'Listings', 'Orders', 'Opportunities', 'Money', 'Options', 'Seller Support'] as const
const SELLER_NAME = 'Merchant'
const TABS = ['Active', 'On hold', 'Archived'] as const

const activeTab = ref<string>('Active')
const DISABLED_HINT = 'Not available in this test'

// Listings page of the Deals Step One prototype. Layout and Revolve
// components are copied from front-apps
// (apps/back-office-seller/app/scopes/listings/pages/listingsV2).
//
// Only Home, Listings and Opportunities are in scope for this test. The
// disabled treatment (styling, tooltip, aria) lives in BoShell.
const ENABLED_NAV = ['Home', 'Listings', 'Opportunities']
const disabledNavItems = NAV_ITEMS.filter((item) => !ENABLED_NAV.includes(item))
const ENABLED_TABS = ['Active']
const disabledTabs = TABS.filter((tab) => !ENABLED_TABS.includes(tab))

const emit = defineEmits<{ navItemClick: [item: string]; viewDeals: [] }>()

// The page handles this: it opens Opportunities, then scrolls to the Deals section.
function onViewDeals() {
  emit('viewDeals')
}

import dealCampaignsJson from './deal_campaigns.json'

const showMoreFilters = ref(false)
const expandAll = ref(false)

// RevTable keeps track of which rows are open; "Expand all" drives it.
const tableRef = ref<{ expandAll: () => void; collapseAll: () => void } | null>(null)
watch(expandAll, (value) => {
  if (value) tableRef.value?.expandAll()
  else tableRef.value?.collapseAll()
})

// Filter and sorting fields (not wired to the data: this page is a baseline).
const filters = reactive({
  title: '',
  sku: '',
  markets: 'All',
  backboxRange: '',
  salesStrategy: 'All',
  productId: '',
})
const moreFilters = reactive<Record<string, string>>({})
const listingsPerPage = ref('10')
const sortBy = ref('Inventory (descending)')

type Currency = 'EUR' | 'SEK'
type BackBoxStatus = 'won' | 'opportunity'
type StrategyType = 'visibility-boost' | 'none'

interface Market { code: string; active: boolean }

interface PricingRow {
  code: string
  country: string
  currency: Currency
  minPrice: number
  targetPrice: number
  backBox: { status: BackBoxStatus; price: number }
  strategy: { type: StrategyType; price?: number }
}

const MAIN_COLUMNS = [
  { key: 'image', label: '' },
  { key: 'product', label: 'Product' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'markets', label: 'Market(s)' },
  { key: 'competition', label: 'Competition' },
]

const MARKET_COLUMNS = [
  { key: 'market', label: 'Market' },
  { key: 'minPrice', label: 'Minimum price' },
  { key: 'targetPrice', label: 'Target price' },
  { key: 'backBoxPrice', label: 'BackBox price', description: 'The price of the listing that currently has the BackBox.' },
  { key: 'pricingStrategy', label: 'Pricing strategy', description: 'Suggested prices to get more visibility or pay less commission.' },
  { key: 'cta', label: '' },
]

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

function mkMarkets(overrides: Partial<Record<string, boolean>> = {}): Market[] {
  return MARKET_CODES.map(code => ({ code, active: overrides[code] ?? true }))
}

// BackBox status and pricing strategy per market row. The buttons on each row follow from these.
const PRICING_PATTERN: Array<{ bb: BackBoxStatus; st: StrategyType }> = [
  { bb: 'won',         st: 'visibility-boost' },
  { bb: 'won',         st: 'visibility-boost' },
  { bb: 'won',         st: 'visibility-boost' },
  { bb: 'won',         st: 'visibility-boost' },
  { bb: 'won',         st: 'visibility-boost' },
  { bb: 'won',         st: 'visibility-boost' },
  { bb: 'won',         st: 'none' },
  { bb: 'opportunity', st: 'visibility-boost' },
  { bb: 'opportunity', st: 'visibility-boost' },
  { bb: 'opportunity', st: 'visibility-boost' },
  { bb: 'opportunity', st: 'none' },
  { bb: 'opportunity', st: 'none' },
  { bb: 'opportunity', st: 'none' },
]

function pricingFor(listing: Listing): PricingRow[] {
  const active = listing.markets.filter(m => m.active)
  return active.map((m, idx): PricingRow => {
    const { name, currency } = COUNTRY[m.code]
    const eurMin = listing.basePrice - 25 + ((idx * 7) % 19)
    const eurTarget = eurMin + 10
    const min = currency === 'SEK' ? Math.round(eurMin * 11.7 * 100) / 100 : eurMin + 0.45
    const target = currency === 'SEK' ? Math.round(eurTarget * 11.7 * 100) / 100 : eurTarget + 0.75
    const pattern = PRICING_PATTERN[Math.min(idx, PRICING_PATTERN.length - 1)]

    return {
      code: m.code,
      country: name,
      currency,
      minPrice: min,
      targetPrice: target,
      backBox: pattern.bb === 'won'
        ? { status: 'won', price: min + 10 }
        : { status: 'opportunity', price: min - 2 },
      strategy: pattern.st === 'visibility-boost'
        ? { type: 'visibility-boost', price: Math.round((min - 50) * 100) / 100 }
        : { type: 'none' },
    }
  })
}

// Deals shown in the "Pricing strategy" column of an open listing.
// Key = "<listing id>-<market code>". The markets match the active campaigns
// in deal_campaigns.json (phones in DE, iPhones in ES and FR).
//   above     = the listing price is above the Deal price: the seller can still apply it
//   in-target = the listing price already meets the Deal price: reduced commission is on
type DealState = 'above' | 'in-target'
// PLACEHOLDER: the real figure comes from the Deal campaign (maximumCommissionDecreasePercentage).
const DEAL_COMMISSION_SAVING_PERCENT = 3
const LISTING_DEALS: Record<string, DealState> = {
  'L1-DE': 'above',
  'L1-ES': 'above',
  'L1-FR': 'in-target',
  'L2-DE': 'above',
  'L6-DE': 'above',
  'L6-FR': 'in-target',
  'L10-DE': 'above',
}

/** Deal price for a market row: about 6% under the target price, or a little over it when already in target. */
function dealPriceFor(row: PricingRow, state: DealState): number {
  if (state === 'in-target') return Math.floor(row.targetPrice * 1.02) + 0.99
  return Math.floor(row.targetPrice * 0.94) - 0.01
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

// Competition level -> RevTag variant, same mapping as the real Back Office
// (front-apps CompetitionTag).
type TagVariant = 'primary' | 'info' | 'warning' | 'danger'
const COMPETITION_VARIANT: Record<Listing['competition'], TagVariant> = {
  'None': 'primary',
  'Very low': 'info',
  'Low': 'info',
  'Medium': 'warning',
  'High': 'danger',
}

function currencySymbol(c: Currency): string {
  return c === 'SEK' ? 'SEK' : '€'
}
function fmtMoney(amount: number, c: Currency): string {
  const f = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (c === 'SEK') return `${f} SEK`
  return `€${f}`
}

// Rows for RevTable: every listing can be expanded to show its markets.
const rows = listings.map((listing) => ({ ...listing, expandable: true }))

// Editable fields (stock per listing, min and target price per market).
const units = reactive<Record<string, string>>(
  Object.fromEntries(listings.map((listing) => [listing.id, String(listing.units)])),
)
function fmtInput(value: number) {
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
const pricingRows: Record<string, Array<PricingRow & { id: string }>> = Object.fromEntries(
  listings.map((listing) => [listing.id, pricingFor(listing).map((row) => ({ ...row, id: row.code }))]),
)
const prices = reactive<Record<string, string>>({})
for (const listing of listings) {
  for (const row of pricingRows[listing.id]) {
    prices[`${listing.id}-${row.code}-min`] = fmtInput(row.minPrice)
    prices[`${listing.id}-${row.code}-target`] = fmtInput(row.targetPrice)
  }
}

// ---------------------------------------------------------------------------
// What happens when a seller clicks a button in an open listing.
// Prototype only: nothing is saved. Each click shows a short loading state,
// then the row changes the way the real Back Office does after it refreshes
// (front-apps ExpandedListing.vue: handleGetBackbox, handleUnlockDeal,
// handleUpdatePricingStrategy, handleGetAllBackboxes, handleMaximizeAllSales).
// ---------------------------------------------------------------------------
const ACTION_DELAY_MS = 1200
const FLASH_MS = 1000

type RowAction = 'backbox' | 'deal' | 'strategy'
type BulkAction = 'backboxes' | 'sales'

/** Row key -> the button that is loading on that row. */
const rowLoading = reactive<Record<string, RowAction>>({})
/** Listing id -> the listing-wide button that is loading. */
const bulkLoading = reactive<Record<string, BulkAction>>({})
/** Rows that just changed: they get a pale-green flash. */
const rowFlash = reactive<Record<string, boolean>>({})
/** Rows where the seller unlocked the Deal. */
const unlockedDeals = reactive<Record<string, boolean>>({})
/** Rows where the seller applied the Visibility Boost price. */
const appliedStrategies = reactive<Record<string, boolean>>({})
/** Row key -> the price at which the seller now holds the BackBox. */
const wonBackBoxes = reactive<Record<string, number>>({})

const timers = new Set<ReturnType<typeof setTimeout>>()
function later(fn: () => void, ms: number) {
  const timer = setTimeout(() => {
    timers.delete(timer)
    fn()
  }, ms)
  timers.add(timer)
}

function rowKey(listingId: string, row: PricingRow) {
  return `${listingId}-${row.code}`
}

/** The Deal on a market row, if there is one. inTarget = the seller already has the Deal. */
function dealFor(listingId: string, row: PricingRow): { price: number; inTarget: boolean } | null {
  const key = rowKey(listingId, row)
  const state = LISTING_DEALS[key]
  if (!state) return null
  if (unlockedDeals[key]) return { price: dealPriceFor(row, 'above'), inTarget: true }
  return { price: dealPriceFor(row, state), inTarget: state === 'in-target' }
}
/** BackBox status of a row, after any button the seller clicked. */
function backBoxFor(listingId: string, row: PricingRow): PricingRow['backBox'] {
  const wonAt = wonBackBoxes[rowKey(listingId, row)]
  return wonAt == null ? row.backBox : { status: 'won', price: wonAt }
}
/** Visibility Boost on a row. A row with a Deal never shows one: the Deal always wins. */
function strategyFor(listingId: string, row: PricingRow): { price: number; applied: boolean } | null {
  if (LISTING_DEALS[rowKey(listingId, row)]) return null
  if (row.strategy.type !== 'visibility-boost') return null
  return { price: row.strategy.price!, applied: Boolean(appliedStrategies[rowKey(listingId, row)]) }
}

// Which buttons a row shows
function canWinBackBox(listingId: string, row: PricingRow) {
  return backBoxFor(listingId, row).status === 'opportunity'
}
function canUnlockDeal(listingId: string, row: PricingRow) {
  const deal = dealFor(listingId, row)
  return Boolean(deal && !deal.inTarget)
}
function canApplyStrategy(listingId: string, row: PricingRow) {
  const strategy = strategyFor(listingId, row)
  return Boolean(strategy && !strategy.applied)
}

/** True while the price fields of a row are being saved: they show a spinner, like the real Back Office. */
function isRowSaving(listingId: string, row: PricingRow) {
  const action = rowLoading[rowKey(listingId, row)]
  return Boolean(bulkLoading[listingId]) || action === 'backbox' || action === 'strategy'
}
function isRowBusy(listingId: string, row: PricingRow) {
  return Boolean(bulkLoading[listingId]) || Boolean(rowLoading[rowKey(listingId, row)])
}

function currentMinPrice(key: string) {
  return Number.parseFloat(prices[`${key}-min`].replace(/,/g, ''))
}
/** Lowers the minimum price to `price` if it was higher. */
function lowerMinPrice(key: string, price: number) {
  if (currentMinPrice(key) > price) prices[`${key}-min`] = fmtInput(price)
}

/** The result of a click, once the loading state is over. */
function applyRowAction(listingId: string, row: PricingRow, action: RowAction) {
  const key = rowKey(listingId, row)
  if (action === 'backbox') {
    // Price drops to the price needed to win the BackBox
    lowerMinPrice(key, row.backBox.price)
    wonBackBoxes[key] = row.backBox.price
  }
  if (action === 'deal') {
    // Price drops to the Deal price: the seller gets the Deal and sells at that price
    const dealPrice = dealPriceFor(row, 'above')
    prices[`${key}-target`] = fmtInput(dealPrice)
    lowerMinPrice(key, dealPrice)
    unlockedDeals[key] = true
    wonBackBoxes[key] = dealPrice
  }
  if (action === 'strategy') {
    // Price drops to the Visibility Boost price, which also wins the BackBox
    lowerMinPrice(key, row.strategy.price!)
    appliedStrategies[key] = true
    wonBackBoxes[key] = row.strategy.price!
  }
  rowFlash[key] = true
  later(() => delete rowFlash[key], FLASH_MS)
}

/** A button on one market row: Win BackBox, Unlock deal or Apply price. */
function runRowAction(listingId: string, row: PricingRow, action: RowAction) {
  if (isRowBusy(listingId, row)) return
  const key = rowKey(listingId, row)
  rowLoading[key] = action
  later(() => {
    delete rowLoading[key]
    applyRowAction(listingId, row, action)
  }, ACTION_DELAY_MS)
}

/** The two buttons above the markets: they act on every market of the listing that still can. */
function runBulkAction(listingId: string, action: BulkAction) {
  if (bulkLoading[listingId]) return
  if (pricingRows[listingId].some((row) => rowLoading[rowKey(listingId, row)])) return
  bulkLoading[listingId] = action
  later(() => {
    delete bulkLoading[listingId]
    for (const row of pricingRows[listingId]) {
      if (action === 'backboxes' && canWinBackBox(listingId, row)) applyRowAction(listingId, row, 'backbox')
      if (action === 'sales' && canApplyStrategy(listingId, row)) applyRowAction(listingId, row, 'strategy')
    }
  }, ACTION_DELAY_MS)
}
function showWinAllBackBoxes(listingId: string) {
  return pricingRows[listingId].some((row) => canWinBackBox(listingId, row))
}
function showMaximizeAllSales(listingId: string) {
  return pricingRows[listingId].some((row) => canApplyStrategy(listingId, row))
}

/** Pale-green flash on a row that just changed (fades through RevTable's row transition). */
function marketRowStyle(listingId: string, row: PricingRow) {
  return rowFlash[rowKey(listingId, row)] ? { backgroundColor: 'var(--rev-bg-static-success-low)' } : undefined
}

/** Puts every open listing back to its starting prices and states. */
function resetListingActions() {
  timers.forEach(clearTimeout)
  timers.clear()
  for (const state of [rowLoading, bulkLoading, rowFlash, unlockedDeals, appliedStrategies, wonBackBoxes]) {
    for (const key of Object.keys(state)) delete (state as Record<string, unknown>)[key]
  }
  for (const listing of listings) {
    for (const row of pricingRows[listing.id]) {
      prices[`${listing.id}-${row.code}-min`] = fmtInput(row.minPrice)
      prices[`${listing.id}-${row.code}-target`] = fmtInput(row.targetPrice)
    }
  }
}
onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  timers.clear()
})

defineExpose({
  resetState() {
    showMoreFilters.value = false
    expandAll.value = false
    tableRef.value?.collapseAll()
    resetListingActions()
  },
})
</script>

<template>
  <BoShell
    active-nav-item="Listings"
    :seller-name="SELLER_NAME"
    :disabled-nav-items="disabledNavItems"
    @nav-item-click="emit('navItemClick', $event)"
  >
    <BoPage title="Your listings">
      <template #actions>
        <div class="mb-3 flex flex-col space-y-4 md:mb-0 md:flex-row md:space-x-4 md:space-y-0">
          <RevButton variant="secondary" full-width="adaptive">Import or export listings</RevButton>
          <RevButton variant="secondary" full-width="adaptive">Manage price rules</RevButton>
          <RevButton variant="primary" full-width="adaptive">Create new listing</RevButton>
        </div>
      </template>

      <!-- Deals banner: a slim promo for Deals. Softer navy than the real
           Back Office banner (Revolve static-info-mid in the inverse mood)
           with a faint deal-icon silhouette, same treatment as the Deals card
           on Home. Copy is the real banner's; the button is this prototype's. -->
      <aside
        class="rev-mood-inverse rev-bg-static-info-mid rev-shadow-short relative my-6 overflow-hidden rounded-bm-lg"
        aria-label="Reduced commission deals"
      >
        <RevIcon
          name="IconDealFilled"
          size="300"
          class="pointer-events-none absolute -top-[110px] right-[120px]"
          style="color: var(--rev-bg-action-default-hi-disabled);"
        />

        <div class="rev-mood-tangaroa relative flex flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:gap-6">
          <div class="flex min-w-0 flex-1 items-start gap-3">
            <RevIcon name="IconDealFilled" size="24" class="rev-text-static-default-hi mt-0.5 shrink-0" />
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 class="rev-heading-3 rev-text-static-default-hi">Pay less, profit more with reduced commission deals</h2>
                <RevTag class="rev-mood-main" :label="`${dealCampaignsJson.campaigns.length} active`" variant="success" />
              </div>
              <p class="rev-body-2 rev-text-static-default-low">Lock in limited-time reduced commission rates on selected products.</p>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-6">
            <RevLink class="rev-mood-inverse rev-body-2">See how it works</RevLink>
            <RevButton variant="primary" size="small" icon="IconArrowRight" @click="onViewDeals">View deals</RevButton>
          </div>
        </div>
      </aside>

      <RevTabs class="mb-8" label="Listings">
        <RevTabItem
          v-for="tab in TABS"
          :key="tab"
          :label="tab"
          :active="tab === activeTab"
          :disabled="disabledTabs.includes(tab)"
          :title="disabledTabs.includes(tab) ? DISABLED_HINT : undefined"
          @click="activeTab = tab"
        />
      </RevTabs>

      <!-- Filters -->
      <div class="mb-8">
        <form class="md:flex md:items-start" @submit.prevent>
          <div class="grow">
            <!-- Five columns; the fourth is wider so "BackBox price difference" fits on one line -->
            <div class="mb-4 grid flex-1 grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.3fr)_minmax(0,1fr)]">
              <RevInputText id="filter-title" v-model="filters.title" label="Title" />
              <RevInputText id="filter-sku" v-model="filters.sku" label="SKU" />
              <RevInputSelect id="filter-markets" v-model="filters.markets" label="Market(s)" :options="['All', ...MARKET_CODES]" />
              <RevInputSelect
                id="filter-backbox-range"
                v-model="filters.backboxRange"
                label="BackBox price difference"
                :options="['With BackBox', 'Without BackBox']"
              />
              <RevInputSelect
                id="filter-sales-strategy"
                v-model="filters.salesStrategy"
                label="Sales strategy"
                :options="['All', 'Visibility Boost', 'Deals', 'None']"
              />
              <template v-if="showMoreFilters">
                <RevInputText id="filter-product-id" v-model="filters.productId" label="Product ID" />
                <RevInputSelect
                  v-for="label in ['Appearance', 'Grade', 'Categories', 'Battery type', 'Inventory', 'BackBox', 'Competition level']"
                  :id="`filter-${label}`"
                  :key="label"
                  v-model="moreFilters[label]"
                  :label="label"
                  :options="['All']"
                />
              </template>
            </div>
          </div>
          <div class="ml-4 flex items-center">
            <RevButton variant="primary" type="submit">Apply filters</RevButton>
            <RevLink class="ml-4 whitespace-nowrap">Reset filters</RevLink>
          </div>
        </form>

        <div class="mb-2">
          <RevButton variant="secondary" size="small" @click="showMoreFilters = !showMoreFilters">
            {{ showMoreFilters ? 'Show less filters' : 'Show more filters' }}
          </RevButton>
        </div>
      </div>

      <!-- Count, expand toggle and sorting -->
      <div class="my-6 flex flex-col gap-6 md:my-8 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-col gap-4 md:gap-2">
          <h2 class="rev-heading-2">87 active listings</h2>
          <RevToggle id="toggle-listing-display" v-model="expandAll" label="Expand all" />
        </div>

        <div class="space-y-3 lg:flex lg:gap-3 lg:space-y-0">
          <div class="lg:min-w-[14rem]">
            <RevInputSelect id="number-of-listing-per-page" v-model="listingsPerPage" label="Number of listings" :options="['10', '20', '30', '50']" />
          </div>
          <div class="lg:min-w-[14rem]">
            <RevInputSelect
              id="sortBy"
              v-model="sortBy"
              label="Sort by"
              :options="['Inventory (descending)', 'Quantity (ascending)', 'Alphabetical order (A-Z)', 'Alphabetical order (Z-A)']"
            />
          </div>
        </div>
      </div>

      <!-- Quick filters -->
      <div class="mb-8 flex flex-col justify-between gap-3 md:flex-row md:flex-wrap">
        <div class="flex flex-col gap-3 md:flex-row">
          <RevButton variant="secondary" size="small">See all within €4.00 of BackBoxes</RevButton>
          <RevButton variant="secondary" size="small">See all within €8.00 of BackBoxes</RevButton>
        </div>
      </div>

      <!-- Listings table -->
      <RevTable
        ref="tableRef"
        class="rev-bg-float-default-low rev-shadow-short overflow-hidden rounded-bm-lg"
        :collection="rows"
        :columns="MAIN_COLUMNS"
        expand-label=""
        transparent-header
      >
        <template #body-image="{ item }">
          <div class="h-12 min-h-[48px] w-12 min-w-[48px] overflow-hidden">
            <ProductThumb :thumb="item.thumb" />
          </div>
        </template>

        <template #body-product="{ item }">
          <div class="flex flex-col text-start">
            <RevLink class="rev-body-1-bold">{{ item.title }}</RevLink>
            <span class="rev-body-2 rev-text-static-default-low mt-1 max-w-[256px] break-words">SKU: {{ item.sku }}</span>
            <div class="mt-3 flex flex-wrap items-center gap-3">
              <BoPill tooltip-content="Grade">
                <RevIcon name="IconGrade" size="16" />
                <span>{{ item.grade }}</span>
              </BoPill>
              <BoPill tooltip-content="SIM">
                <RevIcon name="IconSim" size="16" />
                <span>{{ item.sim }}</span>
              </BoPill>
              <BoPill v-if="item.newBattery" tone="new-battery" tooltip-content="New battery">
                <RevIcon name="IconBattery" size="16" />
              </BoPill>
              <span class="rev-body-2">
                <RevLink>Archive listing</RevLink>
              </span>
            </div>
          </div>
        </template>

        <template #body-inventory="{ item }">
          <RevInputText :id="`stock-input-${item.id}`" v-model="units[item.id]" class="max-w-[130px]" label="Units" type="number" />
        </template>

        <template #body-markets="{ item }">
          <!-- From 1360px wide, the list holds seven pills per line so all 13 markets fit on two lines.
               Below that there is no room without squeezing the Product column, so it stays narrower. -->
          <ul class="flex max-w-[320px] list-none flex-wrap gap-1 min-[1360px]:w-[368px] min-[1360px]:max-w-[368px]">
            <li v-for="market in item.markets" :key="market.code">
              <BoPill :tone="market.active ? 'success' : 'danger'" :tooltip-content="COUNTRY[market.code].name">
                <RevCountryFlag :country-code="market.code" size="extra-small" />
                <span>{{ market.code }}</span>
              </BoPill>
            </li>
          </ul>
        </template>

        <template #body-competition="{ item }">
          <RevTag :label="item.competition" size="medium" :variant="COMPETITION_VARIANT[item.competition]" />
        </template>

        <!-- Expanded listing: one row per market -->
        <template v-for="listing in listings" :key="listing.id" #[`expand-${listing.id}`]>
          <div class="rev-bg-static-default-mid flex flex-col justify-between gap-2 px-3 py-6 md:flex-row md:justify-end md:pr-5">
            <RevButton
              v-if="showWinAllBackBoxes(listing.id)"
              variant="primary"
              size="small"
              :loading="bulkLoading[listing.id] === 'backboxes'"
              :disabled="bulkLoading[listing.id] === 'sales'"
              @click="runBulkAction(listing.id, 'backboxes')"
            >
              Win all BackBoxes
            </RevButton>
            <RevButton
              v-if="showMaximizeAllSales(listing.id)"
              variant="secondary"
              size="small"
              :loading="bulkLoading[listing.id] === 'sales'"
              :disabled="bulkLoading[listing.id] === 'backboxes'"
              @click="runBulkAction(listing.id, 'sales')"
            >
              Maximize all sales
            </RevButton>
          </div>

          <RevTable
            class="rev-bg-static-default-mid"
            :collection="pricingRows[listing.id]"
            :columns="MARKET_COLUMNS"
            :row-style="(row: PricingRow) => marketRowStyle(listing.id, row)"
            transparent-header
          >
            <template #body-market="{ item }">
              <RevLink class="rev-body-1 flex items-center gap-2" :underlined="false" style="font-weight: 400; color: var(--rev-text-static-default-mid);">
                <RevCountryFlag :country-code="item.code" size="small" />
                {{ item.country }}
              </RevLink>
            </template>

            <template #body-minPrice="{ item }">
              <!-- Same footprint as the field, so the columns do not jump while saving -->
              <div v-if="isRowSaving(listing.id, item)" class="flex h-12 w-[130px] items-center">
                <RevSpinner size="small" alternative-text="Saving price" />
              </div>
              <RevInputText
                v-else
                :id="`min-price-${item.code}-${listing.id}`"
                v-model="prices[`${listing.id}-${item.code}-min`]"
                class="max-w-[130px]"
                :label="`Min.(${currencySymbol(item.currency)})`"
              />
            </template>

            <template #body-targetPrice="{ item }">
              <!-- Same footprint as the field, so the columns do not jump while saving -->
              <div v-if="isRowSaving(listing.id, item)" class="flex h-12 w-[130px] items-center">
                <RevSpinner size="small" alternative-text="Saving price" />
              </div>
              <RevInputText
                v-else
                :id="`target-price-${item.code}-${listing.id}`"
                v-model="prices[`${listing.id}-${item.code}-target`]"
                class="max-w-[130px]"
                :label="`Target (${currencySymbol(item.currency)})`"
              />
            </template>

            <template #body-backBoxPrice="{ item }">
              <div v-if="backBoxFor(listing.id, item).status === 'won'" class="rev-text-static-success-hi flex items-center gap-3">
                <RevIcon name="IconCheckInCircleFilled" size="24" />
                <div class="flex flex-col gap-0.5">
                  <RevTag class="w-fit" label="You've won the BackBox" size="small" variant="success" />
                  <p class="rev-body-1-bold">{{ fmtMoney(backBoxFor(listing.id, item).price, item.currency) }}</p>
                  <p class="rev-caption-bold">Your product's got eyes on it</p>
                </div>
              </div>
              <div v-else class="rev-text-static-info-hi flex w-full max-w-[400px] items-center gap-3">
                <RevIcon name="IconFireFilled" size="24" />
                <div class="flex flex-col gap-0.5">
                  <RevTag class="w-fit" label="BackBox" size="small" variant="secondary" style="background-color: var(--rev-bg-static-default-hi);" />
                  <p class="rev-body-1-bold rev-text-static-default-hi">{{ fmtMoney(backBoxFor(listing.id, item).price, item.currency) }}</p>
                  <p class="rev-caption-bold">Win BackBox to start selling</p>
                </div>
              </div>
            </template>

            <template #body-pricingStrategy="{ item }">
              <!-- Only one pricing strategy is shown per market. A Deal always wins over a Visibility Boost.
                   Deal wording is the same as the real Back Office (front-apps PricingStrategyCell). -->
              <template v-if="dealFor(listing.id, item)">
                <div v-if="dealFor(listing.id, item)!.inTarget" class="rev-text-static-success-hi flex items-center gap-3">
                  <RevIcon name="IconDealFilled" size="24" />
                  <div class="flex flex-col gap-0.5">
                    <RevTag class="w-fit" label="You've got the deal" size="small" variant="success" />
                    <p class="rev-body-1-bold">{{ fmtMoney(dealFor(listing.id, item)!.price, item.currency) }} or less</p>
                    <p class="rev-caption-bold">Commission rate is up to {{ DEAL_COMMISSION_SAVING_PERCENT }}% less</p>
                  </div>
                </div>
                <div v-else class="rev-text-static-info-hi flex w-full max-w-[400px] items-center gap-3">
                  <RevIcon name="IconDealFilled" size="24" />
                  <div class="flex flex-col gap-0.5">
                    <RevTag class="w-fit" label="Deal opportunity" size="small" variant="secondary" style="background-color: var(--rev-bg-static-default-hi);" />
                    <p class="rev-body-1-bold rev-text-static-default-hi">{{ fmtMoney(dealFor(listing.id, item)!.price, item.currency) }} or less</p>
                    <p class="rev-caption-bold">Save up to {{ DEAL_COMMISSION_SAVING_PERCENT }}% on commission rate</p>
                  </div>
                </div>
              </template>
              <template v-else-if="strategyFor(listing.id, item)">
                <div v-if="strategyFor(listing.id, item)!.applied" class="rev-text-static-success-hi flex items-center gap-3">
                  <RevIcon name="IconBoltFilled" size="24" />
                  <div class="flex flex-col gap-0.5">
                    <RevTag class="w-fit" label="Price applied" size="small" variant="success" />
                    <p class="rev-body-1-bold">{{ fmtMoney(strategyFor(listing.id, item)!.price, item.currency) }}</p>
                    <p class="rev-caption-bold">Now getting higher visibility</p>
                  </div>
                </div>
                <div v-else class="rev-text-static-info-hi flex w-full max-w-[400px] items-center gap-3">
                  <RevIcon name="IconBoltFilled" size="24" />
                  <div class="flex flex-col gap-0.5">
                    <RevTag class="w-fit" label="Visibility Boost" size="small" variant="secondary" style="background-color: var(--rev-bg-static-default-hi);" />
                    <p class="rev-body-1-bold rev-text-static-default-hi">{{ fmtMoney(strategyFor(listing.id, item)!.price, item.currency) }}</p>
                    <p class="rev-caption-bold rev-text-static-success-hi">Higher visibility, more traffic</p>
                  </div>
                </div>
              </template>
            </template>

            <template #body-cta="{ item }">
              <!-- Same buttons and order as the real Back Office: Win BackBox, Unlock deal, Apply price.
                   A button disappears once its action is done. -->
              <div class="flex w-full flex-col gap-2">
                <RevButton
                  v-if="canWinBackBox(listing.id, item)"
                  size="small"
                  variant="primary"
                  :loading="isRowSaving(listing.id, item)"
                  @click="runRowAction(listing.id, item, 'backbox')"
                >
                  Win BackBox
                </RevButton>
                <RevButton
                  v-if="canUnlockDeal(listing.id, item)"
                  size="small"
                  variant="secondary"
                  icon="IconDealFilled"
                  :loading="isRowBusy(listing.id, item)"
                  @click="runRowAction(listing.id, item, 'deal')"
                >
                  Unlock deal
                </RevButton>
                <RevButton
                  v-if="canApplyStrategy(listing.id, item)"
                  size="small"
                  variant="secondary"
                  icon="IconBoltFilled"
                  :loading="isRowSaving(listing.id, item)"
                  @click="runRowAction(listing.id, item, 'strategy')"
                >
                  Apply price
                </RevButton>
              </div>
            </template>
          </RevTable>
        </template>
      </RevTable>

      <!-- Pagination -->
      <div class="flex items-center justify-around py-10">
        <div class="flex items-center gap-3">
          <RevButtonIcon icon="IconChevronLeft" variant="secondary" aria-label="Previous" disabled />
          <span class="rev-text-static-default-hi-disabled">Previous</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="rev-text-static-default-hi">Next</span>
          <RevButtonIcon icon="IconChevronRight" variant="secondary" aria-label="Next" />
        </div>
      </div>
    </BoPage>
  </BoShell>
</template>
