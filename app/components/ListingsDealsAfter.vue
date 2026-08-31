<script setup lang="ts">
const NAV_ITEMS = ['Home', 'Insights', 'Customer Care', 'Listings', 'Orders', 'Opportunities', 'Money', 'Options', 'Seller Support'] as const
const SELLER_NAME = 'Merchant'
const TABS = ['Active', 'On hold', 'Archived'] as const

const activeNavItem = ref<string>('Listings')
const activeTab = ref<string>('Active')

const showMoreFilters = ref(false)
const expandAll = ref(false)
const expandedRows = ref<Set<string>>(new Set())

const activeDrawer = ref<'deals' | 'models' | null>(null)
const activeDealId = ref<string | null>(null)
const isTransitioning = ref(false)

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
type StrategyType = 'visibility-boost' | 'deal-opportunity' | 'none'

interface Market { code: string; active: boolean }

interface PricingRow {
  code: string
  country: string
  currency: Currency
  minPrice: number
  targetPrice: number
  backBox: { status: BackBoxStatus; price: number }
  strategy: { type: StrategyType; price?: number; commissionDiscount?: number }
  actions: Array<{ label: string; variant: 'primary' | 'flash' }>
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
  inDeal?: string
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

const PRICING_PATTERN: Array<{ bb: BackBoxStatus; st: StrategyType; actions: PricingRow['actions'] }> = [
  { bb: 'won',         st: 'deal-opportunity',  actions: [{ label: 'Set deal price', variant: 'primary' }] },
  { bb: 'won',         st: 'none',             actions: [] },
  { bb: 'opportunity', st: 'deal-opportunity', actions: [{ label: 'Win BackBox', variant: 'primary' }, { label: 'Set deal price', variant: 'flash' }] },
  { bb: 'opportunity', st: 'none',             actions: [{ label: 'Win BackBox', variant: 'primary' }] },
  { bb: 'won',         st: 'visibility-boost', actions: [{ label: 'Apply price', variant: 'flash' }] },
  { bb: 'opportunity', st: 'deal-opportunity', actions: [{ label: 'Win BackBox', variant: 'primary' }, { label: 'Set deal price', variant: 'flash' }] },
  { bb: 'won',         st: 'none',             actions: [] },
  { bb: 'opportunity', st: 'none',             actions: [{ label: 'Win BackBox', variant: 'primary' }] },
  { bb: 'won',         st: 'visibility-boost', actions: [{ label: 'Apply price', variant: 'flash' }] },
  { bb: 'opportunity', st: 'none',             actions: [{ label: 'Win BackBox', variant: 'primary' }] },
  { bb: 'won',         st: 'none',             actions: [] },
  { bb: 'opportunity', st: 'visibility-boost', actions: [{ label: 'Win BackBox', variant: 'primary' }, { label: 'Apply price', variant: 'flash' }] },
  { bb: 'won',         st: 'visibility-boost', actions: [{ label: 'Apply price', variant: 'flash' }] },
]

function pricingFor(listing: Listing): PricingRow[] {
  const active = listing.markets.filter(m => m.active)
  return active.map((m, idx): PricingRow => {
    const { name, currency } = COUNTRY[m.code]
    const variation = ((idx * 7) % 19) - 9
    const eurMin = Math.round((listing.basePrice + variation) * 100) / 100
    const eurTarget = Math.round((eurMin + 30) * 100) / 100
    const eurBBWon = Math.round((listing.basePrice * 0.94 + variation) * 100) / 100
    const eurBBOpp = Math.round((listing.basePrice * 0.90 + variation) * 100) / 100
    const eurVisBoost = Math.round((listing.basePrice * 0.88 + variation) * 100) / 100
    const eurDealOpp = Math.round((listing.basePrice * 0.88 + variation) * 100) / 100

    const toLocal = (eur: number) => currency === 'SEK' ? Math.round(eur * 11.7 * 100) / 100 : Math.round(eur * 100) / 100

    const min = toLocal(eurMin)
    const target = toLocal(eurTarget)
    const pattern = PRICING_PATTERN[Math.min(idx, PRICING_PATTERN.length - 1)]

    return {
      code: m.code,
      country: name,
      currency,
      minPrice: min,
      targetPrice: target,
      backBox: pattern.bb === 'won'
        ? { status: 'won', price: toLocal(eurBBWon) }
        : { status: 'opportunity', price: toLocal(eurBBOpp) },
      strategy: pattern.st === 'visibility-boost'
        ? { type: 'visibility-boost', price: toLocal(eurVisBoost) }
        : pattern.st === 'deal-opportunity'
          ? { type: 'deal-opportunity', price: toLocal(eurDealOpp), commissionDiscount: 5 }
          : { type: 'none' },
      actions: pattern.actions,
    }
  })
}

const listings: Listing[] = [
  { id: 'L1',  thumb: 'iphone-blue',    title: 'iPhone 16 - 128GB - Ultramarine - Unlocked', sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: true,  units: 50, markets: mkMarkets({ BE: false, IE: false, IT: false, NL: false, SK: false }), competition: 'Low',      basePrice: 500, inDeal: 'D1' },
  { id: 'L2',  thumb: 'samsung-s20',    title: 'Samsung Galaxy S20 - 128GB - Cosmic Gray - Unlocked', sku: '12345-S-BL', grade: 'Excellent', sim: 'Dual SIM',           newBattery: true,  units: 50, markets: mkMarkets({ BE: false, IT: false, NL: false, SK: false }),              competition: 'Medium',   basePrice: 280 },
  { id: 'L3',  thumb: 'oneplus-7t',     title: 'OnePlus 7T - 128GB - Glacier Blue - Unlocked',       sku: '12345-S-BL', grade: 'Excellent', sim: 'eSIM',               newBattery: true,  units: 50, markets: mkMarkets({ BE: false, IT: false, NL: false, SK: false }),              competition: 'Medium',   basePrice: 220 },
  { id: 'L4',  thumb: 'sony-xperia',    title: 'Sony Xperia 5 - 128GB - Black - Unlocked',           sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: false, units: 0,  markets: mkMarkets({ BE: false, NL: false, SK: false }),                          competition: 'Very low', basePrice: 240 },
  { id: 'L5',  thumb: 'xiaomi-9t',      title: 'Xiaomi 9T - 128GB - Carbon Black - Unlocked',        sku: '12345-S-BL', grade: 'Excellent', sim: 'Dual SIM',           newBattery: true,  units: 0,  markets: mkMarkets({ BE: false, IT: false, NL: false, SK: false }),              competition: 'None',     basePrice: 180 },
  { id: 'L6',  thumb: 'iphone-13-mid',  title: 'iPhone 15 - 128GB - Blue - Unlocked',                 sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: false, units: 50, markets: mkMarkets({ BE: false, IT: false }),                                    competition: 'Medium',   basePrice: 430, inDeal: 'D2' },
  { id: 'L7',  thumb: 'samsung-a7',     title: 'Samsung Galaxy A7 - 128GB - White - Unlocked',       sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: true,  units: 50, markets: mkMarkets({ BE: false, IT: false }),                                    competition: 'Medium',   basePrice: 195 },
  { id: 'L8',  thumb: 'lg-g7',          title: 'LG G7 - 128GB - Midnight - Unlocked',                sku: '12345-S-BL', grade: 'Excellent', sim: 'eSIM',               newBattery: false, units: 50, markets: mkMarkets({ BE: false, IT: false }),                                    competition: 'Very low', basePrice: 165 },
  { id: 'L9',  thumb: 'nokia-3310',     title: 'Nokia 3310',                                          sku: '12345-S-BL', grade: 'Excellent', sim: 'Dual SIM',           newBattery: false, units: 50, markets: mkMarkets({ BE: false, IT: false }),                                    competition: 'Very low', basePrice: 55  },
  { id: 'L10', thumb: 'samsung-s23',    title: 'Samsung Galaxy S24 - 128GB - Onyx - Unlocked',       sku: '12345-S-BL', grade: 'Excellent', sim: 'Physical SIM + eSIM', newBattery: true,  units: 50, markets: mkMarkets({ BE: false, IT: false }),                                    competition: 'Medium',   basePrice: 510, inDeal: 'D3' },
]

function competitionTag(c: Listing['competition']): { bg: string; text: string; label: string } {
  switch (c) {
    case 'Low':       return { bg: 'bg-[#FBDFB0]', text: 'text-[#775811]', label: 'Low' }
    case 'Medium':    return { bg: 'bg-[#FBDFB0]', text: 'text-[#775811]', label: 'Medium' }
    case 'Very low':  return { bg: 'bg-[#D7E3FC]', text: 'text-[#4A5E82]', label: 'Very low' }
    case 'None':      return { bg: 'bg-[#96F5BD]', text: 'text-[#006D42]', label: 'None' }
    case 'High':      return { bg: 'bg-[#FFDAD8]', text: 'text-[#B8102A]', label: 'High' }
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

type DealStatus = 'starting-soon' | 'in-progress' | 'ending-soon' | 'ended'

interface VolumeTier {
  sales: number
  commissionDiscount: number
}

interface DealModel {
  id: string
  thumb: string
  name: string
  grade: string
  hasListing: boolean
  listingAtDealPrice: boolean
  dealPrice: number
  previousDealPrice?: number
  yourPrice?: number
  unitsSold?: number
  market: string
}

interface Deal {
  id: string
  name: string
  category: string
  status: DealStatus
  hasPriceUpdate?: boolean
  markets: string[]
  startDate: string
  endDate: string
  countdown?: string
  daysUntilStart?: number
  durationWeeks?: number
  baseCommission: number
  volumeTiers: VolumeTier[]
  currentSales: number
  models: DealModel[]
}

const deals: Deal[] = [
  {
    id: 'D2',
    name: 'Apple iPhone 17 - exclusive deal',
    category: 'Smartphones',
    status: 'starting-soon',
    markets: ['FR', 'ES', 'DE'],
    startDate: '01 September 2026',
    endDate: '30 September 2026',
    countdown: '1 day',
    daysUntilStart: 1,
    durationWeeks: 3,
    baseCommission: 10,
    volumeTiers: [
      { sales: 10, commissionDiscount: 2 },
      { sales: 25, commissionDiscount: 3 },
      { sales: 50, commissionDiscount: 5 },
    ],
    currentSales: 0,
    models: [
      { id: 'M6',  thumb: 'iphone-13-mid', name: 'iPhone 16 - 128GB - Ultramarine',        grade: 'Excellent', hasListing: false, listingAtDealPrice: false, dealPrice: 580, market: 'FR' },
      { id: 'M7',  thumb: 'iphone-blue',   name: 'iPhone 16 Pro - 256GB - Desert Titanium', grade: 'Excellent', hasListing: false, listingAtDealPrice: false, dealPrice: 720, market: 'FR' },
      { id: 'M8',  thumb: 'iphone-13-mid', name: 'iPhone 15 - 128GB - Blue',                 grade: 'Excellent', hasListing: true,  listingAtDealPrice: false, dealPrice: 450, yourPrice: 465, market: 'FR' },
      { id: 'M9',  thumb: 'iphone-blue',   name: 'iPhone 15 Pro - 256GB - Natural Titanium',  grade: 'Excellent', hasListing: true,  listingAtDealPrice: false, dealPrice: 590, yourPrice: 610, market: 'FR' },
      { id: 'M10', thumb: 'iphone-13-mid', name: 'iPhone 14 - 128GB - Midnight',              grade: 'Excellent', hasListing: true,  listingAtDealPrice: false, dealPrice: 380, yourPrice: 385, market: 'FR' },
      { id: 'M11', thumb: 'iphone-13-mid', name: 'iPhone 13 - 128GB - Midnight',              grade: 'Excellent', hasListing: true,  listingAtDealPrice: false, dealPrice: 320, yourPrice: 340, market: 'FR' },
      { id: 'M12', thumb: 'iphone-blue',   name: 'iPhone 13 Pro - 128GB - Natural Titanium',   grade: 'Good',      hasListing: true,  listingAtDealPrice: false, dealPrice: 350, yourPrice: 355, market: 'FR' },
    ],
  },
  {
    id: 'D1',
    name: 'Apple iPhones & Samsung Galaxies - selected models',
    category: 'Smartphones',
    status: 'in-progress',
    markets: ['FR', 'DE', 'ES', 'GB'],
    startDate: '13 August 2026',
    endDate: '26 August 2026',
    countdown: 'Ends in 5 days',
    baseCommission: 10,
    volumeTiers: [
      { sales: 10, commissionDiscount: 2 },
      { sales: 25, commissionDiscount: 3 },
      { sales: 50, commissionDiscount: 5 },
    ],
    currentSales: 27,
    models: [
      { id: 'M1', thumb: 'iphone-blue',   name: 'iPhone 16 - 128GB - Ultramarine',          grade: 'Excellent', hasListing: true,  listingAtDealPrice: true,  dealPrice: 580, yourPrice: 579, unitsSold: 12, market: 'FR' },
      { id: 'M2', thumb: 'iphone-13-mid', name: 'iPhone 15 - 128GB - Blue',                  grade: 'Excellent', hasListing: true,  listingAtDealPrice: false, dealPrice: 450, yourPrice: 465, unitsSold: 7,  market: 'FR' },
      { id: 'M3', thumb: 'iphone-blue',   name: 'iPhone 14 - 128GB - Midnight',              grade: 'Excellent', hasListing: false, listingAtDealPrice: false, dealPrice: 380, unitsSold: 0,  market: 'FR' },
      { id: 'M4', thumb: 'samsung-s23',   name: 'Samsung Galaxy S25 - 128GB - Cream',         grade: 'Excellent', hasListing: false, listingAtDealPrice: false, dealPrice: 510, unitsSold: 0,  market: 'FR' },
      { id: 'M5', thumb: 'samsung-s23',   name: 'Samsung Galaxy S24 - 128GB - Onyx',          grade: 'Excellent', hasListing: true,  listingAtDealPrice: false, dealPrice: 420, yourPrice: 440, unitsSold: 5,  market: 'FR' },
      { id: 'M13', thumb: 'samsung-s20',  name: 'Samsung Galaxy S23 - 128GB - Cosmic Gray',   grade: 'Good',      hasListing: true,  listingAtDealPrice: true,  dealPrice: 290, yourPrice: 289, unitsSold: 3,  market: 'FR' },
    ],
  },
  {
    id: 'D4',
    name: 'Robot vacuums - all models',
    category: 'Home appliances',
    status: 'in-progress',
    hasPriceUpdate: true,
    markets: ['FR', 'DE', 'IT', 'ES'],
    startDate: '25 August 2026',
    endDate: '22 September 2026',
    countdown: 'Ends in 18 days',
    baseCommission: 10,
    volumeTiers: [
      { sales: 5, commissionDiscount: 2 },
      { sales: 15, commissionDiscount: 3 },
      { sales: 30, commissionDiscount: 5 },
    ],
    currentSales: 8,
    models: [
      { id: 'M14', thumb: 'iphone-blue', name: 'Roborock Q7 MaxV - Robot Vacuum',   grade: 'Excellent', hasListing: false, listingAtDealPrice: false, dealPrice: 279, previousDealPrice: 299, unitsSold: 0, market: 'FR' },
      { id: 'M15', thumb: 'iphone-blue', name: 'iRobot Roomba i5+ - Robot Vacuum',   grade: 'Excellent', hasListing: false, listingAtDealPrice: false, dealPrice: 349, unitsSold: 0, market: 'FR' },
      { id: 'M16', thumb: 'iphone-blue', name: 'Dyson 360 Vis Nav - Robot Vacuum',   grade: 'Excellent', hasListing: false, listingAtDealPrice: false, dealPrice: 549, previousDealPrice: 599, unitsSold: 0, market: 'FR' },
    ],
  },
  {
    id: 'D3',
    name: 'Samsung Galaxy S24 - selected models',
    category: 'Smartphones',
    status: 'ending-soon',
    markets: ['FR', 'DE', 'ES'],
    startDate: '13 August 2026',
    endDate: '02 September 2026',
    countdown: 'Ends in 18 hours',
    baseCommission: 10,
    volumeTiers: [
      { sales: 10, commissionDiscount: 2 },
      { sales: 25, commissionDiscount: 3 },
      { sales: 50, commissionDiscount: 5 },
    ],
    currentSales: 52,
    models: [
      { id: 'M17', thumb: 'samsung-s23', name: 'Samsung Galaxy S24 - 128GB - Onyx',          grade: 'Excellent', hasListing: true,  listingAtDealPrice: true,  dealPrice: 420, yourPrice: 419, unitsSold: 28, market: 'FR' },
      { id: 'M18', thumb: 'samsung-s23', name: 'Samsung Galaxy S24 Ultra - 256GB - Titanium', grade: 'Excellent', hasListing: false, listingAtDealPrice: false, dealPrice: 580, unitsSold: 0,  market: 'FR' },
      { id: 'M19', thumb: 'samsung-s20', name: 'Samsung Galaxy S24 - 128GB - Amber',          grade: 'Good',      hasListing: true,  listingAtDealPrice: false, dealPrice: 390, yourPrice: 410, unitsSold: 24, market: 'FR' },
    ],
  },
  {
    id: 'D5',
    name: 'Apple iPhone 14 - exclusive deal',
    category: 'Smartphones',
    status: 'ended',
    markets: ['FR', 'ES', 'DE'],
    startDate: '30 March 2026',
    endDate: '12 April 2026',
    baseCommission: 10,
    volumeTiers: [
      { sales: 10, commissionDiscount: 2 },
      { sales: 25, commissionDiscount: 3 },
      { sales: 50, commissionDiscount: 5 },
    ],
    currentSales: 22,
    models: [
      { id: 'M20', thumb: 'iphone-13-mid', name: 'iPhone 14 - 128GB - Midnight',    grade: 'Excellent', hasListing: true,  listingAtDealPrice: true,  dealPrice: 380, yourPrice: 379, unitsSold: 15, market: 'FR' },
      { id: 'M21', thumb: 'iphone-13-mid', name: 'iPhone 14 Pro - 256GB - Deep Blue', grade: 'Excellent', hasListing: false, listingAtDealPrice: false, dealPrice: 520, unitsSold: 7,  market: 'FR' },
    ],
  },
]

const dealDescription: Record<DealStatus, string> = {
  'starting-soon': 'Price your eligible listings at the deal target price before the deal starts to unlock commission discounts. The more you sell, the bigger the discount.',
  'in-progress':   'Price your eligible listings at the deal target price to unlock commission discounts. The more you sell, the bigger the discount.',
  'ending-soon':   'This deal is ending soon. Keep your listings at the deal target price to maximise your commission discount before it closes.',
  'ended':          'Here is how your listings performed during this deal. Commission discounts were applied based on the tiers you reached.',
}

const dealStatusMeta: Record<DealStatus, { label: string; tagBg: string; tagText: string }> = {
  'starting-soon': { label: 'Starting soon',  tagBg: '#E2F77E', tagText: '#121016' },
  'in-progress':   { label: 'Active',         tagBg: '#96F5BD', tagText: '#006D42' },
  'ending-soon':   { label: 'Active',         tagBg: '#96F5BD', tagText: '#006D42' },
  'ended':          { label: 'Ended',          tagBg: '#ECEEF2', tagText: '#121016' },
}

const dealExtraTag: Record<DealStatus, { label: string | null; bg: string; text: string }> = {
  'starting-soon': { label: null, bg: '', text: '' },
  'in-progress':   { label: null, bg: '', text: '' },
  'ending-soon':   { label: 'Ending soon', bg: '#FBDFB0', text: '#775811' },
  'ended':          { label: null, bg: '', text: '' },
}

const priceUpdateTag = { label: 'Price update', bg: '#D7E3FC', text: '#4A5E82' }

const filterSearch = ref('')
const filterMarket = ref('all')
const filterStatus = ref('all')
const filterCategory = ref('all')
const cardVariants = [
  { key: '0', label: '0' },
  { key: '0.5', label: '1' },
  { key: '2', label: '2' },
]
const cardVariant = ref('0.5')

const modelSearch = ref('')
const modelMarket = ref('all')
const modelGrade = ref('all')
const modelStatus = ref('all')
const unitsSortDir = ref<'asc' | 'desc'>('desc')

const ALL_MARKETS = [...new Set(deals.flatMap(d => d.markets))].sort()
const ALL_CATEGORIES = [...new Set(deals.map(d => d.category))].sort()
const STATUS_OPTIONS: { key: DealStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All statuses' },
  { key: 'starting-soon', label: 'Starting soon' },
  { key: 'in-progress', label: 'Active' },
  { key: 'ending-soon', label: 'Ending soon' },
  { key: 'ended', label: 'Ended' },
]

function resetFilters() {
  filterSearch.value = ''
  filterMarket.value = 'all'
  filterStatus.value = 'all'
  filterCategory.value = 'all'
}

const STATUS_ORDER: Record<DealStatus, number> = {
  'starting-soon': 0,
  'in-progress': 1,
  'ending-soon': 2,
  'ended': 3,
}

function filteredDeals(): Deal[] {
  return deals
    .filter((deal) => {
      if (filterSearch.value) {
        const q = filterSearch.value.toLowerCase()
        if (!deal.name.toLowerCase().includes(q) && !deal.category.toLowerCase().includes(q)) return false
      }
      if (filterMarket.value !== 'all' && !deal.markets.includes(filterMarket.value)) return false
      if (filterStatus.value !== 'all' && deal.status !== filterStatus.value) return false
      if (filterCategory.value !== 'all' && deal.category !== filterCategory.value) return false
      return true
    })
    .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
}

function activeDeal(): Deal | undefined {
  return deals.find(d => d.id === activeDealId.value)
}

function openModelsDrawer(dealId: string) {
  if (isTransitioning.value) return
  isTransitioning.value = true
  activeDealId.value = dealId
  resetModelFilters()
  activeDrawer.value = 'models'
  setTimeout(() => { isTransitioning.value = false }, 600)
}

function backToDeals() {
  if (isTransitioning.value) return
  isTransitioning.value = true
  resetModelFilters()
  activeDrawer.value = 'deals'
  setTimeout(() => { isTransitioning.value = false }, 600)
}

function resetModelFilters() {
  modelSearch.value = ''
  modelMarket.value = 'all'
  modelGrade.value = 'all'
  modelStatus.value = 'all'
  unitsSortDir.value = 'desc'
}

function closeDrawer() {
  resetModelFilters()
  activeDrawer.value = null
}

function volumeProgress(deal: Deal): number {
  const maxTier = deal.volumeTiers[deal.volumeTiers.length - 1]
  if (!maxTier) return 0
  return Math.min(100, Math.round((deal.currentSales / maxTier.sales) * 100))
}

function currentTierIndex(deal: Deal): number {
  let idx = -1
  deal.volumeTiers.forEach((tier, i) => {
    if (deal.currentSales >= tier.sales) idx = i
  })
  return idx
}

function nextTier(deal: Deal): VolumeTier | null {
  const idx = currentTierIndex(deal)
  if (idx < 0) return deal.volumeTiers[0] ?? null
  return deal.volumeTiers[idx + 1] ?? null
}

function salesToNextTier(deal: Deal): number {
  const next = nextTier(deal)
  if (!next) return 0
  return Math.max(0, next.sales - deal.currentSales)
}

function formatPrice(amount: number): { integer: string; cents: string } {
  const fixed = amount.toFixed(2)
  const [int, cents] = fixed.split('.')
  return { integer: parseInt(int).toLocaleString('en-US'), cents }
}

function priceDiffPercent(model: DealModel): number {
  if (!model.yourPrice || !model.dealPrice) return 0
  return Math.round(((model.yourPrice - model.dealPrice) / model.dealPrice) * 100)
}

function filteredModels(): DealModel[] {
  const deal = activeDeal()
  if (!deal) return []
  const filtered = deal.models.filter((model) => {
    if (modelSearch.value) {
      const q = modelSearch.value.toLowerCase()
      if (!model.name.toLowerCase().includes(q)) return false
    }
    if (modelMarket.value !== 'all' && model.market !== modelMarket.value) return false
    if (modelGrade.value !== 'all' && model.grade !== modelGrade.value) return false
    if (modelStatus.value === 'listed' && !model.hasListing) return false
    if (modelStatus.value === 'not-listed' && model.hasListing) return false
    if (modelStatus.value === 'at-deal-price' && !model.listingAtDealPrice) return false
    if (modelStatus.value === 'above-deal-price' && (!model.hasListing || model.listingAtDealPrice)) return false
    return true
  })
  if (deal.status !== 'starting-soon') {
    filtered.sort((a, b) => {
      const diff = (a.unitsSold ?? 0) - (b.unitsSold ?? 0)
      return unitsSortDir.value === 'desc' ? -diff : diff
    })
  }
  return filtered
}

function toggleUnitsSort() {
  unitsSortDir.value = unitsSortDir.value === 'desc' ? 'asc' : 'desc'
}

function modelMarkets(): string[] {
  return [...new Set(activeDeal()?.models.map(m => m.market) ?? [])].sort()
}

function modelGrades(): string[] {
  return [...new Set(activeDeal()?.models.map(m => m.grade) ?? [])].sort()
}

defineExpose({
  resetState() {
    showMoreFilters.value = false
    expandAll.value = false
    expandedRows.value = new Set()
    activeDrawer.value = null
    activeDealId.value = null
    isTransitioning.value = false
    resetFilters()
  },
})
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
        <button class="rounded-bm-sm px-3 py-1.5 text-sm font-semibold cursor-pointer bg-white border border-bm-border-action text-bm-text-hi hover:bg-bm-gray-50 transition-colors">Import or export listings</button>
        <button class="rounded-bm-sm px-3 py-1.5 text-sm font-semibold cursor-pointer bg-white border border-bm-border-action text-bm-text-hi hover:bg-bm-gray-50 transition-colors">Manage price rules</button>
        <button
          class="prototype-hotspot inline-flex items-center px-3 py-1.5 gap-2 rounded-bm-sm bg-[#0A1740] hover:opacity-90 transition-opacity cursor-pointer"
          @click="activeDrawer = 'deals'"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24"><path d="M12 4L9.5 9.5L4 12L9.5 14.5L12 20L14.5 14.5L20 12L14.5 9.5Z" fill="#E2F77E" /></svg>
          <span class="inline-flex items-center gap-1 text-sm font-semibold text-[#E2F77E]">
            See all deals
            <span class="inline-flex items-center justify-center min-w-[15px] h-4 px-1 rounded-full text-xs font-bold bg-[#59DE99] text-[#121016]">{{ deals.filter(d => d.status === 'in-progress' || d.status === 'ending-soon').length }}</span>
          </span>
        </button>
        <button class="rounded-bm-sm px-3 py-1.5 text-sm font-semibold cursor-pointer bg-bm-text-hi text-white hover:bg-bm-gray-700 transition-colors">Create new listing</button>
      </div>
    </template>

    <div class="py-8">
      <form class="md:flex md:items-start">
        <div class="grow">
          <div class="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
            <div class="relative">
              <input id="f-title" type="text" placeholder=" " class="peer h-12 w-full px-3 pt-1 rounded-bm-sm border border-bm-border-action bg-white text-base text-bm-text-hi placeholder:text-transparent focus:outline-none focus:border-bm-text-hi" />
              <label for="f-title" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 truncate text-base text-bm-text-hi transition-all
                                          peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-bm-text-low
                                          peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0
                                          peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-bm-text-low">Title</label>
            </div>

            <div class="relative">
              <input id="f-sku" type="text" placeholder=" " class="peer h-12 w-full px-3 pt-1 rounded-bm-sm border border-bm-border-action bg-white text-base text-bm-text-hi placeholder:text-transparent focus:outline-none focus:border-bm-text-hi" />
              <label for="f-sku" class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 truncate text-base text-bm-text-hi transition-all
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
      </div>

      <div class="bg-white rounded-bm-lg shadow-sm overflow-hidden">
        <table class="w-full border-collapse text-base text-bm-text-mid">
          <thead class="border-b border-bm-border h-14 bg-transparent">
            <tr>
              <th class="px-4 py-3 first:pl-6"></th>
              <th class="px-4 py-3 first:pl-6 text-left text-base font-semibold text-bm-text-hi">Product</th>
              <th class="px-4 py-3 first:pl-6 text-left text-base font-semibold text-bm-text-hi">Inventory</th>
              <th class="px-4 py-3 first:pl-6 text-left text-base font-semibold text-bm-text-hi">Market(s)</th>
              <th class="px-4 py-3 first:pl-6 text-left text-base font-semibold text-bm-text-hi">
                <div class="flex flex-col gap-0.5">
                  <span>Competition</span>
                  <span class="text-xs font-normal text-bm-text-low">Last 7 days</span>
                </div>
              </th>
              <th class="px-4 py-3 last:pr-6 text-right"></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(listing, idx) in listings" :key="listing.id">
              <tr :class="['bg-white', idx !== listings.length - 1 && 'border-b border-bm-border']">
                <td class="px-4 py-6 first:pl-6 align-middle">
                  <div class="h-12 w-12 rounded-bm-sm border border-bm-border bg-white overflow-hidden">
                    <ProductThumb :thumb="listing.thumb" />
                  </div>
                </td>

                <td class="px-4 py-6 align-middle max-w-[320px]">
                  <div class="flex flex-col">
                    <div class="flex items-center gap-2">
                      <button class="text-base font-semibold text-bm-text-hi underline hover:text-bm-text-mid text-left cursor-pointer">{{ listing.title }}</button>
                    </div>
                    <span class="mt-1 text-sm text-bm-text-low max-w-[256px] break-words">SKU: {{ listing.sku }}</span>
                    <div class="mt-3 flex flex-wrap items-center gap-1.5">
                      <span class="inline-flex items-center gap-1 rounded-full px-1.5 py-1 text-xs font-normal bg-bm-gray-100 text-bm-text-mid">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09" /></svg>
                        {{ listing.grade }}
                      </span>
                      <span class="inline-flex items-center gap-1 rounded-full px-1.5 py-1 text-xs font-normal bg-bm-gray-100 text-bm-text-mid">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="6" y="3" width="12" height="18" rx="2" /><path d="M9 17h6" /></svg>
                        {{ listing.sim }}
                      </span>
                      <span v-if="listing.newBattery" class="inline-flex items-center gap-1 rounded-full px-1.5 py-1 text-xs font-normal bg-bm-gray-100 text-bm-text-mid">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="8" width="16" height="10" rx="1.5" /><path d="M19 11v4" /><path stroke-linecap="round" stroke-linejoin="round" d="m8 13 2 2 4-4" /></svg>
                        New battery
                      </span>
                      <span v-if="listing.inDeal" class="prototype-hotspot inline-flex items-center gap-1 rounded-full px-1.5 py-1 text-xs font-semibold shrink-0" style="background: #0A1740; color: #E2F77E;" :title="deals.find(d => d.id === listing.inDeal)?.name">
                        <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><path d="M12 4L9.5 9.5L4 12L9.5 14.5L12 20L14.5 14.5L20 12L14.5 9.5Z" fill="#E2F77E" /></svg>
                        In deal
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
                  <div class="flex justify-end gap-2 px-5 py-6" style="background: #ECEEF2;">
                    <button class="rounded-bm-sm px-3 py-1.5 cursor-pointer bg-bm-text-hi text-white text-sm font-semibold hover:bg-bm-gray-700 transition-colors">Win all BackBoxes</button>
                  </div>

                  <div style="background: #ECEEF2;">
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
                              Sales strategy
                              <span class="size-8 inline-flex items-center justify-center rounded-full bg-white text-bm-text-hi">
                                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a1 1 0 0 0 0 2v3a1 1 0 0 0 1 1h1a1 1 0 1 0 0-2v-3a1 1 0 0 0-1-1H9Z" clip-rule="evenodd" /></svg>
                              </span>
                            </div>
                          </th>
                          <th class="px-4 py-3 last:pr-6"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(row, ri) in pricingFor(listing)" :key="row.code" :class="[ri !== pricingFor(listing).length - 1 && 'border-b border-bm-border']">
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
                            <div v-if="row.backBox.status === 'won'" class="flex items-center gap-2">
                              <svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24" style="color: #006D42;"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" /></svg>
                              <div class="flex flex-col gap-0.5">
                                <span class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold w-fit" style="background: #96F5BD; color: #006D42;">BackBox won</span>
                                <p class="text-base font-semibold text-bm-text-hi">{{ fmtMoney(row.backBox.price, row.currency) }}</p>
                              </div>
                            </div>
                            <div v-else class="flex items-center gap-2">
                              <svg class="w-5 h-5 flex-shrink-0 text-bm-text-hi" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c-.3 2.5-1.8 4.2-3.5 5.9C6.8 9.6 5.5 11.5 5.5 14a6.5 6.5 0 0 0 13 0c0-1.7-.6-3-1.5-4.2.1 1 0 2-.6 2.8-.5.7-1.3 1.1-1.9.7-.5-.3-.6-1-.4-1.6.5-1.3.5-2.8-.2-4.1C13 5.8 12.3 4 12 2z" /></svg>
                              <div class="flex flex-col gap-0.5">
                                <span class="text-xs font-semibold text-bm-text-hi">BackBox opportunity</span>
                                <p class="text-base font-semibold text-bm-text-hi">{{ fmtMoney(row.backBox.price, row.currency) }}</p>
                                <p class="text-xs text-bm-text-low">Win BackBox to start selling</p>
                              </div>
                            </div>
                          </td>

                          <td class="px-4 py-6 align-middle">
                            <div v-if="row.strategy.type === 'visibility-boost'" class="flex items-center gap-3 max-w-[400px]" :style="{ color: 'hsl(219, 27%, 40%)' }">
                              <svg class="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.05a.5.5 0 0 1 .58.61l-1.5 5.84h5.12a.5.5 0 0 1 .4.8l-8.7 11.65a.5.5 0 0 1-.88-.4l1.5-5.84H2.7a.5.5 0 0 1-.4-.8l8.7-11.66a.5.5 0 0 1 .3-.2Z" /></svg>
                              <div class="flex flex-col gap-0.5">
                                <span class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold w-fit" style="background: #ECEEF2; color: #121016;">Visibility boost</span>
                                <p class="text-base font-semibold text-bm-text-hi">{{ fmtMoney(row.strategy.price!, row.currency) }}</p>
                                <p class="text-xs font-semibold" style="color: #4A5E82;">Higher visibility, more traffic</p>
                              </div>
                            </div>
                            <div v-else-if="row.strategy.type === 'deal-opportunity'" class="flex items-center gap-3 max-w-[400px]">
                              <svg class="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24"><path d="M12 4L9.5 9.5L4 12L9.5 14.5L12 20L14.5 14.5L20 12L14.5 9.5Z" fill="#0A1740" /></svg>
                              <div class="flex flex-col gap-0.5">
                                <span class="inline-flex items-center h-5 rounded-[2px] text-xs font-semibold w-fit" style="background: #0A1740; color: #E2F77E; padding-left: 4px; padding-right: 4px;">Deal opportunity</span>
                                <p class="text-base font-semibold text-bm-text-hi">{{ fmtMoney(row.strategy.price!, row.currency) }} <span class="text-xs font-normal text-bm-text-low">or less</span></p>
                                <p class="text-xs font-semibold" style="color: #4A5A82;">Save up to {{ row.strategy.commissionDiscount }}% on commission</p>
                              </div>
                            </div>
                            <div v-else class="flex items-center gap-2">
                              <span class="text-sm text-bm-text-low italic">No sales strategy available</span>
                            </div>
                          </td>

                          <td class="px-4 py-6 last:pr-6 align-middle">
                            <div class="flex w-full flex-col gap-2">
                              <button
                                v-for="(a, ai) in row.actions"
                                :key="ai"
                                :class="[
                                  'rounded-bm-sm whitespace-nowrap text-sm font-semibold cursor-pointer transition-colors inline-flex items-center justify-center gap-2',
                                  a.variant === 'primary'
                                    ? 'px-3 py-1.5 bg-bm-text-hi text-white hover:bg-bm-gray-700'
                                    : 'px-[11px] py-[5px] bg-white border border-bm-text-hi text-bm-text-hi hover:bg-bm-gray-50',
                                ]"
                              >
                                {{ a.label }}
                              </button>
                            </div>
                          </td>
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

  <Teleport to="body">
    <Transition name="drawer-fade">
    <div v-if="activeDrawer !== null" class="fixed inset-0 z-50 flex justify-end bg-black/30" role="presentation" @click.self="closeDrawer">
      <Transition name="drawer-replace" mode="out-in" appear>
        <!-- DEALS DRAWER -->
        <aside v-if="activeDrawer === 'deals'" key="deals" class="h-full flex flex-col bg-bm-surface shadow-2xl" style="width: 976px; min-width: 976px; border-radius: 12px 0 0 12px;" role="dialog" aria-modal="true" aria-labelledby="deals-drawer-title">
          <div class="relative flex items-center justify-center h-[68px] bg-bm-surface shrink-0" style="padding: 24px 72px 20px;">
            <!-- Left: back button + style selector -->
            <div class="absolute flex items-center gap-3" style="left: 24px; top: 50%; transform: translateY(-50%);">
              <button type="button" class="w-8 h-8 flex items-center justify-center rounded-bm-sm text-bm-text-hi hover:bg-bm-gray-100 transition-colors" aria-label="Close" @click="closeDrawer">
                <svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M8.427 7.53a.75.75 0 0 0-1.06-1.06L2.72 11.116a1.25 1.25 0 0 0 0 1.768l4.646 4.646a.75.75 0 0 0 1.06-1.06l-3.719-3.72h16.19a.75.75 0 0 0 0-1.5H4.706l3.72-3.72" fill="currentColor"/></svg>
              </button>
              <span class="text-[10px] font-semibold uppercase tracking-wider text-bm-text-low">Style</span>
              <div class="flex items-center gap-1">
                <button
                  v-for="v in cardVariants"
                  :key="v.key"
                  :class="[
                    'h-7 px-2 rounded-bm-sm text-xs font-bold cursor-pointer transition-colors',
                    cardVariant === v.key ? 'bg-bm-text-hi text-white' : 'bg-white border border-bm-border text-bm-text-mid hover:text-bm-text-hi hover:border-bm-text-hi',
                  ]"
                  @click="cardVariant = v.key"
                >
                  {{ v.label }}
                </button>
              </div>
            </div>
            <h2 id="deals-drawer-title" class="text-base font-normal text-bm-text-hi">Deals</h2>
            <!-- Right: Export CSV -->
            <button type="button" class="absolute inline-flex items-center gap-2 px-[11px] py-[5px] rounded-bm-sm border border-bm-text-mid text-bm-text-hi text-sm font-semibold hover:bg-bm-gray-50 transition-colors" style="right: 24px; top: 50%; transform: translateY(-50%);" aria-label="Export all deals">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
              Export CSV
            </button>
          </div>

          <div class="overflow-y-auto p-6 flex-1">
            <!-- Header content -->
            <div class="flex flex-col gap-6 mb-6">
              <div class="flex flex-col gap-2">
                <h2 class="text-[28px] font-semibold leading-10 text-black" style="font-family: 'BM Duplet DSP', sans-serif;">Limited-time commission discounts</h2>
                <p class="text-sm font-normal leading-5 text-bm-text-hi">Price your eligible listings at the deal target price to unlock commission discounts. The more you sell, the bigger the discount.</p>
                <button type="button" class="inline-flex items-center gap-1 w-fit text-sm font-semibold underline text-bm-text-mid hover:text-bm-text-hi transition-colors">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
                  How deals work
                </button>
              </div>

              <!-- Filters -->
              <div class="flex flex-wrap items-center gap-3">
                <div class="relative" style="width: 250px;">
                  <input v-model="filterSearch" type="text" placeholder="Search deals" class="w-full h-12 px-3 pr-10 rounded-bm-sm border border-[#D2D4DA] bg-white text-base text-bm-text-hi focus:outline-none focus:border-bm-text-hi" />
                  <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-bm-text-low" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                </div>
                <select v-model="filterMarket" class="h-12 px-3 pr-9 rounded-bm-sm border border-[#D2D4DA] bg-white text-base text-bm-text-hi focus:outline-none focus:border-bm-text-hi cursor-pointer appearance-none" style="min-width: 152px; background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 stroke=%22%235C5E63%22 stroke-width=%222%22 viewBox=%220 0 24 24%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 12px center; background-size: 20px;">
                  <option value="all">All markets</option>
                  <option v-for="m in ALL_MARKETS" :key="m" :value="m">{{ m }}</option>
                </select>
                <select v-model="filterStatus" class="h-12 px-3 pr-9 rounded-bm-sm border border-[#D2D4DA] bg-white text-base text-bm-text-hi focus:outline-none focus:border-bm-text-hi cursor-pointer appearance-none" style="min-width: 152px; background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 stroke=%22%235C5E63%22 stroke-width=%222%22 viewBox=%220 0 24 24%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 12px center; background-size: 20px;">
                  <option v-for="opt in STATUS_OPTIONS" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
                </select>
                <select v-model="filterCategory" class="h-12 px-3 pr-9 rounded-bm-sm border border-[#D2D4DA] bg-white text-base text-bm-text-hi focus:outline-none focus:border-bm-text-hi cursor-pointer appearance-none" style="min-width: 152px; background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 stroke=%22%235C5E63%22 stroke-width=%222%22 viewBox=%220 0 24 24%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 12px center; background-size: 20px;">
                  <option value="all">All categories</option>
                  <option v-for="c in ALL_CATEGORIES" :key="c" :value="c">{{ c }}</option>
                </select>
                <div class="flex items-center gap-3 ml-auto">
                  <button type="button" class="h-12 px-4 rounded-bm-sm bg-bm-text-hi text-white text-base font-semibold hover:bg-bm-gray-700 transition-colors">Apply</button>
                  <button type="button" class="text-base font-semibold underline text-bm-text-hi hover:text-bm-text-mid transition-colors" @click="resetFilters">Reset</button>
                </div>
              </div>
            </div>

            <!-- Deal cards -->
            <div class="space-y-4">

              <!-- ============ VARIANT 0: Figma original ============ -->
              <template v-if="cardVariant === '0'">
                <div
                  v-for="deal in filteredDeals()"
                  :key="deal.id"
                  class="flex flex-col gap-6 p-6 rounded-xl bg-white"
                  style="box-shadow: 0px 8px 16px rgba(15, 17, 23, 0.12);"
                >
                  <!-- Product info -->
                  <div class="flex flex-col gap-3">
                    <!-- Header -->
                    <div class="flex flex-col gap-2">
                      <!-- Tags row -->
                      <div class="flex flex-wrap items-center justify-between gap-2">
                        <!-- Status tags -->
                        <div class="flex items-center gap-2">
                          <span class="inline-flex items-center px-1 h-5 rounded-[2px] text-sm font-semibold" :style="{ background: dealStatusMeta[deal.status].tagBg, color: dealStatusMeta[deal.status].tagText }">
                            {{ dealStatusMeta[deal.status].label }}
                          </span>
                          <span v-if="dealExtraTag[deal.status].label" class="inline-flex items-center px-1 h-5 rounded-[2px] text-sm font-semibold" :style="{ background: dealExtraTag[deal.status].bg, color: dealExtraTag[deal.status].text }">
                            {{ dealExtraTag[deal.status].label }}
                          </span>
                          <span v-if="deal.hasPriceUpdate" class="inline-flex items-center gap-1 px-1 h-5 rounded-[2px] text-sm font-semibold" :style="{ background: priceUpdateTag.bg, color: priceUpdateTag.text }">
                            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.293-.241.438-.613.43-.992a6.759 6.759 0 0 1 0-.255c.008-.378-.137-.75-.43-.991l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                            {{ priceUpdateTag.label }}
                          </span>
                        </div>

                        <div class="flex items-center gap-5">
                          <span v-if="deal.countdown" class="inline-flex items-center gap-1 text-sm text-bm-text-mid">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                            <span class="text-bm-text-mid">Ends in</span>
                            <span class="font-semibold text-bm-text-hi">{{ deal.countdown }}</span>
                          </span>
                          <button
                            type="button"
                            class="prototype-hotspot inline-flex items-center gap-2 px-3 h-8 rounded-bm-sm border border-bm-text-mid text-bm-text-hi text-sm font-semibold hover:bg-bm-gray-50 transition-colors"
                            @click="openModelsDrawer(deal.id)"
                          >
                            Selected models
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                          </button>
                        </div>
                      </div>

                      <!-- Title -->
                      <h3 class="text-lg font-semibold leading-6 text-bm-text-hi" style="font-family: 'BM Duplet DSP', sans-serif;">{{ deal.name }}</h3>

                      <!-- Rocket progress message -->
                      <div v-if="deal.status === 'starting-soon'" class="inline-flex items-center gap-1.5 w-fit">
                        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none"><path fill="#006D42" d="M12 2.5c.5 0 1 .3 1.2.8l1.5 3.6c.4 1 .6 2 .6 3.1v3l-1.5 2h-3.6L9 13v-3c0-1.1.2-2.1.6-3.1l1.5-3.6c.2-.5.7-.8 1.2-.8z"/><path fill="#006D42" d="M9 14l-2 1.5V18l2-1V14zm6 0l2 1.5V18l-2-1v-3z"/><path fill="#006D42" d="M11 19v2h2v-2h-2z"/><circle cx="12" cy="9" r="1.5" fill="#fff"/></svg>
                        <span class="text-base font-semibold" style="color: #006D42;">Prepare your listings now to take advantage of the deal</span>
                      </div>
                      <div v-else-if="deal.status !== 'ended'" class="inline-flex items-center gap-1.5 w-fit">
                        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none"><path fill="#006D42" d="M12 2.5c.5 0 1 .3 1.2.8l1.5 3.6c.4 1 .6 2 .6 3.1v3l-1.5 2h-3.6L9 13v-3c0-1.1.2-2.1.6-3.1l1.5-3.6c.2-.5.7-.8 1.2-.8z"/><path fill="#006D42" d="M9 14l-2 1.5V18l2-1V14zm6 0l2 1.5V18l-2-1v-3z"/><path fill="#006D42" d="M11 19v2h2v-2h-2z"/><circle cx="12" cy="9" r="1.5" fill="#fff"/></svg>
                        <span class="text-base font-semibold" style="color: #006D42;">
                          <template v-if="nextTier(deal)">{{ salesToNextTier(deal) }} more sales to unlock {{ deal.baseCommission - nextTier(deal)!.commissionDiscount }}% commission</template>
                          <template v-else>Max tier reached at {{ deal.baseCommission - deal.volumeTiers[deal.volumeTiers.length - 1].commissionDiscount }}% commission</template>
                        </span>
                      </div>
                      <div v-else class="inline-flex items-center gap-1.5 w-fit">
                        <svg class="w-4 h-4 text-bm-text-low" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                        <span class="text-sm text-bm-text-low">Deal ended {{ deal.endDate }}</span>
                      </div>
                    </div>

                    <!-- Flags -->
                    <div class="flex flex-wrap items-center gap-1">
                      <span v-for="m in deal.markets" :key="m" class="inline-flex items-center gap-1.5 pl-2.5 pr-2 h-7 rounded-full text-xs font-normal" style="background: #ECEEF2; color: #2F3136;">
                        <FlagChip :code="m" :height="12" />
                        {{ m }}
                      </span>
                    </div>
                  </div>

                  <!-- Deal details -->
                  <div class="flex flex-col gap-4">
                    <!-- Metrics row -->
                    <div class="flex items-end gap-6">
                      <div class="flex flex-col">
                        <span
                          class="text-[42px] font-semibold leading-[48px]"
                          :style="{ color: deal.status === 'ending-soon' ? '#006D42' : deal.status === 'ended' ? '#5C5E63' : '#121016', fontFamily: 'BM Duplet DSP, sans-serif' }"
                        >{{ deal.baseCommission - (currentTierIndex(deal) >= 0 ? deal.volumeTiers[currentTierIndex(deal)].commissionDiscount : 0) }}%</span>
                        <span class="text-xs" :style="{ color: deal.status === 'ended' ? '#5C5E63' : '#5C5E63' }">Current commission</span>
                      </div>
                      <div class="w-px h-16 self-stretch" style="background: #E0E2E8;" />
                      <div class="flex flex-col">
                        <span class="text-base" :style="{ color: deal.status === 'ended' ? '#5C5E63' : deal.status === 'ending-soon' ? '#006D42' : '#121016' }">{{ nextTier(deal) ? `${nextTier(deal)!.sales}` : `${deal.volumeTiers[deal.volumeTiers.length - 1].sales}` }}</span>
                        <span class="text-xs text-bm-text-low">{{ nextTier(deal) ? 'Next tier at' : 'Max tier' }}</span>
                      </div>
                      <div class="flex flex-col">
                        <span class="text-base" :style="{ color: deal.status === 'ended' ? '#5C5E63' : '#121016' }">{{ deal.baseCommission }}%</span>
                        <span class="text-xs text-bm-text-low">Base commission</span>
                      </div>
                      <div class="flex flex-col">
                        <span class="text-base" :style="{ color: deal.status === 'ended' ? '#5C5E63' : '#121016' }">{{ deal.models.length }}</span>
                        <span class="text-xs text-bm-text-low">Models</span>
                      </div>
                    </div>

                    <!-- Progress bar -->
                    <div v-if="deal.status !== 'starting-soon'" class="flex flex-col gap-1">
                      <div class="flex items-center justify-between text-xs text-bm-text-low">
                        <span class="inline-flex items-center gap-0.5">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>
                          Sales progress
                        </span>
                        <span class="font-semibold text-bm-text-hi">{{ deal.currentSales }} sold</span>
                      </div>
                      <div class="relative h-[15px] rounded-full overflow-hidden" style="background: #E0E2E8;">
                        <div
                          class="h-full rounded-full transition-all duration-500"
                          :style="{
                            width: `${volumeProgress(deal)}%`,
                            background: deal.status === 'ending-soon' ? '#006D42' : deal.status === 'ended' ? '#8F9196' : '#121016'
                          }"
                        />
                        <span
                          v-for="(tier, ti) in deal.volumeTiers"
                          :key="ti"
                          class="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                          :style="{
                            left: `calc(${(tier.sales / deal.volumeTiers[deal.volumeTiers.length - 1].sales) * 100}% - 4px)`,
                            background: currentTierIndex(deal) >= ti && (deal.status === 'ending-soon' || deal.status === 'ended') ? '#FFFFFF' : '#121016'
                          }"
                        />
                      </div>
                      <div class="flex justify-between text-xs">
                        <span v-for="(tier, ti) in deal.volumeTiers" :key="ti" :class="currentTierIndex(deal) >= ti ? 'text-bm-text-hi font-semibold' : 'text-bm-text-low'">{{ tier.sales }}</span>
                      </div>
                    </div>
                    <div v-else class="flex items-center gap-2 rounded-bm-sm bg-bm-gray-100 px-3 py-2">
                      <svg class="w-4 h-4 text-bm-text-low shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                      <p class="text-xs text-bm-text-mid">Starts {{ deal.startDate }}. Get your stock ready to participate.</p>
                    </div>
                  </div>
                </div>
              </template>

              <!-- ============ VARIANT 0.5: Improved Figma (compact, explicit ladder) ============ -->
              <template v-else-if="cardVariant === '0.5'">
                <div
                  v-for="deal in filteredDeals()"
                  :key="deal.id"
                  class="rounded-xl bg-white overflow-hidden border border-bm-border"
                  :class="deal.status === 'ended' ? 'opacity-70' : ''"
                >
                  <!-- Top section: identity -->
                  <div class="p-4">
                    <!-- Row 1: tags + countdown + models -->
                    <div class="flex items-center justify-between gap-2 mb-2.5">
                      <div class="flex items-center gap-1.5">
                        <span class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" :style="{ background: dealStatusMeta[deal.status].tagBg, color: dealStatusMeta[deal.status].tagText }">
                          {{ dealStatusMeta[deal.status].label }}
                        </span>
                        <span v-if="dealExtraTag[deal.status].label" class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" :style="{ background: dealExtraTag[deal.status].bg, color: dealExtraTag[deal.status].text }">
                          {{ dealExtraTag[deal.status].label }}
                        </span>
                        <span v-if="deal.hasPriceUpdate" class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" :style="{ background: priceUpdateTag.bg, color: priceUpdateTag.text }">
                          {{ priceUpdateTag.label }}
                        </span>
                      </div>
                      <div class="flex items-center gap-3">
                        <span v-if="deal.countdown || deal.status === 'starting-soon'" class="inline-flex items-center gap-1 text-xs font-normal text-bm-text-mid">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                          <span v-if="deal.status === 'starting-soon'">Starts on {{ deal.startDate }}</span>
                          <span v-else>{{ deal.countdown }}</span>
                        </span>
                        <button
                          type="button"
                          class="prototype-hotspot inline-flex items-center gap-1.5 px-2.5 h-7 rounded-bm-sm border border-bm-text-mid text-bm-text-hi text-xs font-semibold hover:bg-bm-gray-50 transition-colors"
                          @click="openModelsDrawer(deal.id)"
                        >
                          {{ deal.models.length }} models
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>
                    </div>

                    <!-- Row 2: title + flags inline -->
                    <div class="flex items-center gap-2">
                      <h3 class="text-base font-semibold leading-6 text-bm-text-hi flex-1 min-w-0 truncate" style="font-family: 'BM Duplet DSP', sans-serif;">{{ deal.name }}</h3>
                      <div class="flex items-center gap-1 shrink-0">
                        <span v-for="m in deal.markets" :key="m" class="inline-flex items-center gap-1 px-1.5 h-5 rounded-full text-[10px] font-normal" style="background: #ECEEF2; color: #2F3136;">
                          <FlagChip :code="m" :height="9" />{{ m }}
                        </span>
                      </div>
                    </div>

                    <!-- Row 3: incentive message (starting-soon + ended only) -->
                    <div v-if="deal.status === 'starting-soon'" class="inline-flex items-center gap-1.5 mt-2">
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"><path fill="#006D42" d="M12 2.5c.5 0 1 .3 1.2.8l1.5 3.6c.4 1 .6 2 .6 3.1v3l-1.5 2h-3.6L9 13v-3c0-1.1.2-2.1.6-3.1l1.5-3.6c.2-.5.7-.8 1.2-.8z"/><path fill="#006D42" d="M9 14l-2 1.5V18l2-1V14zm6 0l2 1.5V18l-2-1v-3z"/><path fill="#006D42" d="M11 19v2h2v-2h-2z"/><circle cx="12" cy="9" r="1.5" fill="#fff"/></svg>
                      <span class="text-xs font-semibold" style="color: #006D42;">Prepare your listings now to take advantage of the deal</span>
                    </div>
                    <div v-if="deal.status === 'ended'" class="inline-flex items-center gap-1.5 mt-2">
                      <svg class="w-4 h-4 text-bm-text-low" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                      <span class="text-xs text-bm-text-low">Deal ended {{ deal.endDate }}. You reached {{ deal.baseCommission - (currentTierIndex(deal) >= 0 ? deal.volumeTiers[currentTierIndex(deal)].commissionDiscount : 0) }}% commission on {{ deal.currentSales }} sales.</span>
                    </div>
                  </div>

                  <!-- Bottom section -->
                  <div v-if="deal.status === 'starting-soon'" class="px-4 pb-4 flex items-center gap-4">
                    <div class="flex flex-col shrink-0">
                      <span class="text-[32px] font-semibold leading-[36px] text-bm-text-hi" style="font-family: 'BM Duplet DSP', sans-serif;">{{ deal.daysUntilStart }} day{{ deal.daysUntilStart === 1 ? '' : 's' }}</span>
                      <span class="text-xs text-bm-text-low">until the deal starts</span>
                    </div>
                    <div class="w-px h-10 self-center shrink-0" style="background: #E0E2E8;" />
                    <div class="flex flex-col shrink-0">
                      <span class="text-sm font-semibold text-bm-text-hi">{{ deal.durationWeeks }} weeks to participate</span>
                      <span class="text-xs text-bm-text-low">{{ deal.startDate }} - {{ deal.endDate }}</span>
                    </div>
                    <div class="w-px h-10 self-center shrink-0" style="background: #E0E2E8;" />
                    <div class="flex items-center gap-1 flex-wrap flex-1 min-w-0">
                      <span class="text-xs text-bm-text-low mr-1.5 shrink-0">Volume goals:</span>
                      <div
                        v-for="(tier, ti) in deal.volumeTiers"
                        :key="ti"
                        class="flex items-center gap-1"
                      >
                        <div class="flex flex-col px-2 py-1 rounded-bm-xs bg-white border border-bm-border">
                          <span class="text-xs font-semibold text-bm-text-mid leading-tight">{{ deal.baseCommission - tier.commissionDiscount }}%</span>
                          <span class="text-[11px] text-bm-text-low leading-tight">{{ tier.sales }}+ sales</span>
                        </div>
                        <svg v-if="ti < deal.volumeTiers.length - 1" class="w-3 h-3 text-bm-text-low shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  </div>
                  <div v-else class="px-4 pb-4">
                    <div class="flex items-center gap-4">
                      <!-- Tier ladder -->
                      <div class="flex items-center gap-1 flex-1 min-w-0 flex-wrap">
                        <div
                          v-for="(tier, ti) in deal.volumeTiers"
                          :key="ti"
                          class="flex items-center gap-1"
                        >
                          <div
                            :class="[
                              'flex flex-col px-2 py-1 rounded-bm-xs transition-colors',
                              deal.status === 'ended'
                                ? currentTierIndex(deal) >= ti
                                  ? 'bg-bm-gray-200 border border-bm-gray-300'
                                  : 'bg-white border border-bm-border'
                                : currentTierIndex(deal) >= ti
                                  ? 'bg-bm-gray-100 border border-bm-gray-200'
                                  : 'bg-white border border-bm-border'
                            ]"
                          >
                            <span :class="['text-xs font-semibold leading-tight', currentTierIndex(deal) >= ti ? 'text-bm-text-hi' : 'text-bm-text-mid']">
                              {{ deal.baseCommission - tier.commissionDiscount }}%
                            </span>
                            <span class="text-[11px] text-bm-text-low leading-tight">{{ tier.sales }}+ sales</span>
                          </div>
                          <svg v-if="ti < deal.volumeTiers.length - 1" class="w-3 h-3 text-bm-text-low shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </div>
                      </div>

                      <!-- Sales count -->
                      <div class="shrink-0 text-right">
                        <span class="text-sm font-semibold text-bm-text-hi">{{ deal.currentSales }}</span>
                        <span class="text-xs text-bm-text-low">/{{ deal.volumeTiers[deal.volumeTiers.length - 1].sales }} sold</span>
                      </div>
                    </div>

                    <!-- Progress bar -->
                    <div class="relative mt-3">
                      <div class="relative h-1.5 rounded-full overflow-hidden" style="background: #E0E2E8;">
                        <div
                          class="h-full rounded-full transition-all duration-500"
                          :style="{
                            width: `${volumeProgress(deal)}%`,
                            background: deal.status === 'ending-soon' ? '#006D42' : deal.status === 'ended' ? '#8F9196' : '#121016'
                          }"
                        />
                      </div>
                      <span
                        v-for="(tier, ti) in deal.volumeTiers"
                        :key="ti"
                        class="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                        :style="{
                          left: `calc(${(tier.sales / deal.volumeTiers[deal.volumeTiers.length - 1].sales) * 100}% - 3px)`,
                          background: currentTierIndex(deal) >= ti && (deal.status === 'ending-soon' || deal.status === 'ended') ? '#FFFFFF' : '#121016'
                        }"
                      />
                    </div>
                  </div>
                </div>
              </template>

              <!-- ============ VARIANT 1: Current (sectioned card) ============ -->
              <template v-else-if="cardVariant === '1'">
                <div
                  v-for="deal in filteredDeals()"
                  :key="deal.id"
                  :class="['rounded-bm-lg border overflow-hidden transition-all', deal.status === 'ended' ? 'border-bm-border bg-bm-gray-50' : 'border-bm-border bg-white shadow-sm hover:shadow-md']"
                >
                  <div :class="['px-5 py-4 flex items-start justify-between gap-4 border-b', deal.status === 'ended' ? 'border-bm-border bg-bm-gray-50' : 'border-bm-border']">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-2">
                        <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" :style="{ background: dealStatusMeta[deal.status].tagBg, color: dealStatusMeta[deal.status].tagText }">
                          {{ dealStatusMeta[deal.status].label }}
                        </span>
                        <span v-if="deal.countdown" class="text-xs font-semibold text-bm-text-low">{{ deal.countdown }}</span>
                        <span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-bm-gray-100 text-bm-text-mid">{{ deal.category }}</span>
                      </div>
                      <h3 class="text-base font-semibold text-bm-text-hi leading-snug">{{ deal.name }}</h3>
                    </div>
                    <div class="shrink-0 text-right">
                      <p class="text-xs text-bm-text-low">Commission</p>
                      <p class="text-2xl font-bold text-bm-text-hi leading-tight">
                        {{ deal.baseCommission - (currentTierIndex(deal) >= 0 ? deal.volumeTiers[currentTierIndex(deal)].commissionDiscount : 0) }}<span class="text-base">%</span>
                      </p>
                      <p v-if="currentTierIndex(deal) >= 0" class="text-xs font-semibold text-bm-success">-{{ deal.volumeTiers[currentTierIndex(deal)].commissionDiscount }}% off base</p>
                      <p v-else class="text-xs font-semibold text-bm-text-low">{{ deal.baseCommission }}% base</p>
                    </div>
                  </div>
                  <div class="px-5 py-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-bm-text-mid border-b border-bm-border bg-bm-surface">
                    <span class="inline-flex items-center gap-1.5">
                      <svg class="w-4 h-4 text-bm-text-low" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0V11.25m18 7.5V11.25m-18 0A2.25 2.25 0 0 0 5.25 9h13.5A2.25 2.25 0 0 0 21 11.25m-18 0h18" /></svg>
                      {{ deal.startDate }} - {{ deal.endDate }}
                    </span>
                    <span class="inline-flex items-center gap-1.5">
                      <svg class="w-4 h-4 text-bm-text-low" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5A7.5 7.5 0 1 1 19.5 10.5Z" /></svg>
                      {{ deal.markets.join(', ') }}
                    </span>
                    <span class="inline-flex items-center gap-1.5 ml-auto">
                      <svg class="w-4 h-4 text-bm-text-low" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                      {{ deal.models.length }} model{{ deal.models.length === 1 ? '' : 's' }}
                    </span>
                  </div>
                  <div v-if="deal.status !== 'ended'" class="px-5 py-4">
                    <div class="flex items-baseline justify-between mb-3">
                      <p class="text-sm font-semibold text-bm-text-hi">Volume bonus</p>
                      <p class="text-xs text-bm-text-low">{{ deal.currentSales }} sold so far</p>
                    </div>
                    <div class="relative mb-4">
                      <div class="h-2.5 rounded-full bg-bm-gray-100 overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500" :style="{ width: `${volumeProgress(deal)}%`, background: 'linear-gradient(90deg, hsl(145,83%,55%), hsl(156,100%,21%))' }" />
                      </div>
                      <div class="absolute inset-0 flex items-center pointer-events-none">
                        <div v-for="(tier, ti) in deal.volumeTiers.slice(0, -1)" :key="ti" class="w-0.5 h-4 bg-bm-gray-200 rounded-full" :style="{ marginLeft: `calc(${(tier.sales / deal.volumeTiers[deal.volumeTiers.length - 1].sales) * 100}% - 1px)` }" />
                      </div>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      <div v-for="(tier, ti) in deal.volumeTiers" :key="ti" :class="['flex items-center gap-2 rounded-bm-sm px-3 py-2 text-xs transition-colors', currentTierIndex(deal) >= ti ? 'bg-[hsl(145,83%,95%)] border border-bm-success' : 'bg-bm-gray-50 border border-bm-border']">
                        <span :class="['w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0', currentTierIndex(deal) >= ti ? 'bg-bm-success text-white' : 'bg-bm-gray-200 text-bm-text-low']">
                          <svg v-if="currentTierIndex(deal) >= ti" class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                          <template v-else>{{ ti + 1 }}</template>
                        </span>
                        <div class="flex flex-col">
                          <span :class="['font-semibold', currentTierIndex(deal) >= ti ? 'text-bm-success' : 'text-bm-text-mid']">{{ tier.sales }}+ sold</span>
                          <span class="text-bm-text-low">{{ deal.baseCommission - tier.commissionDiscount }}% commission</span>
                        </div>
                      </div>
                    </div>
                    <div class="mt-3 flex items-center gap-2 rounded-bm-sm bg-[hsl(145,83%,95%)] px-3 py-2">
                      <svg class="w-4 h-4 text-bm-success shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.503-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.022-3.092 3 3 0 0 0-5.704 0 7.454 7.454 0 0 1-.022 3.092m-3.146-3.092A3.375 3.375 0 0 1 9.497 9.75h5.006a3.375 3.375 0 0 1 3.146 1.918" /></svg>
                      <p v-if="nextTier(deal)" class="text-xs font-semibold text-[hsl(156,100%,21%)]">{{ salesToNextTier(deal) }} more sale{{ salesToNextTier(deal) === 1 ? '' : 's' }} to unlock {{ deal.baseCommission - nextTier(deal)!.commissionDiscount }}% commission</p>
                      <p v-else class="text-xs font-semibold text-[hsl(156,100%,21%)]">Max tier reached. You're earning {{ deal.baseCommission - deal.volumeTiers[deal.volumeTiers.length - 1].commissionDiscount }}% commission.</p>
                    </div>
                  </div>
                  <div v-else class="px-5 py-4">
                    <div class="flex items-center gap-2 rounded-bm-sm bg-bm-gray-100 px-3 py-2">
                      <svg class="w-4 h-4 text-bm-text-low shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                      <p class="text-xs font-semibold text-bm-text-mid">{{ deal.currentSales }} sales at {{ deal.baseCommission - (deal.volumeTiers.find((t, i) => deal.currentSales >= t.sales && i === currentTierIndex(deal))?.commissionDiscount ?? 0) }}% commission</p>
                    </div>
                  </div>
                  <div class="px-5 py-3 border-t border-bm-border bg-bm-surface flex items-center justify-between">
                    <p class="text-xs text-bm-text-low">View all models in this deal</p>
                    <button type="button" class="prototype-hotspot rounded-bm-sm px-3 py-2 text-sm font-semibold cursor-pointer transition-colors inline-flex items-center gap-2" :class="deal.status === 'ended' ? 'bg-bm-gray-100 text-bm-text-mid hover:bg-bm-gray-200' : 'bg-bm-text-hi text-white hover:bg-bm-gray-700'" @click="openModelsDrawer(deal.id)">
                      Selected models
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                </div>
              </template>

              <!-- ============ VARIANT 2: Compact horizontal ============ -->
              <template v-else-if="cardVariant === '2'">
                <div
                  v-for="deal in filteredDeals()"
                  :key="deal.id"
                  :class="['rounded-bm-lg border bg-white p-4 transition-all', deal.status === 'ended' ? 'border-bm-border opacity-70' : 'border-bm-border shadow-sm hover:shadow-md']"
                >
                  <!-- Top row: status tags + title + commission + CTA -->
                  <div class="flex items-center gap-4 mb-3">
                    <div class="flex items-center gap-1.5 shrink-0">
                      <span class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" :style="{ background: dealStatusMeta[deal.status].tagBg, color: dealStatusMeta[deal.status].tagText }">
                        {{ dealStatusMeta[deal.status].label }}
                      </span>
                      <span v-if="deal.hasPriceUpdate" class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" style="background: #D7E3FC; color: #4A5E82;">
                        Price update
                      </span>
                    </div>
                    <h3 class="text-sm font-semibold text-bm-text-hi flex-1 min-w-0 truncate">{{ deal.name }}</h3>
                    <div class="shrink-0 flex items-baseline gap-1">
                      <span class="text-xl font-bold text-bm-text-hi">{{ deal.baseCommission - (currentTierIndex(deal) >= 0 ? deal.volumeTiers[currentTierIndex(deal)].commissionDiscount : 0) }}%</span>
                      <span class="text-xs text-bm-text-low">commission</span>
                    </div>
                    <button type="button" class="prototype-hotspot shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-bm-sm border border-bm-text-mid text-bm-text-hi text-xs font-semibold hover:bg-bm-gray-50 transition-colors" @click="openModelsDrawer(deal.id)">
                      {{ deal.models.length }} models
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>

                  <!-- Meta row -->
                  <div class="flex items-center gap-3 text-xs text-bm-text-low mb-3">
                    <span>{{ deal.startDate }} - {{ deal.endDate }}</span>
                    <span class="text-bm-gray-300">|</span>
                    <div class="flex items-center gap-1">
                      <FlagChip v-for="m in deal.markets" :key="m" :code="m" :height="10" />
                    </div>
                    <span v-if="deal.countdown" class="ml-auto font-semibold text-bm-text-mid">{{ deal.countdown }}</span>
                  </div>

                  <!-- Compact progress -->
                  <div v-if="deal.status !== 'ended'" class="flex items-center gap-3">
                    <div class="flex-1 h-1.5 rounded-full bg-bm-gray-100 overflow-hidden">
                      <div class="h-full rounded-full transition-all duration-500" :style="{ width: `${volumeProgress(deal)}%`, background: 'linear-gradient(90deg, hsl(145,83%,55%), hsl(156,100%,21%))' }" />
                    </div>
                    <span class="text-xs font-semibold text-bm-text-mid shrink-0">
                      <template v-if="nextTier(deal)">{{ salesToNextTier(deal) }} to next tier</template>
                      <template v-else>Max tier</template>
                    </span>
                    <div class="flex items-center gap-1 shrink-0">
                      <span v-for="(tier, ti) in deal.volumeTiers" :key="ti" :class="['w-1.5 h-1.5 rounded-full', currentTierIndex(deal) >= ti ? 'bg-bm-success' : 'bg-bm-gray-200']" />
                    </div>
                  </div>
                  <div v-else class="text-xs text-bm-text-low">{{ deal.currentSales }} sales at {{ deal.baseCommission - (deal.volumeTiers.find((t, i) => deal.currentSales >= t.sales && i === currentTierIndex(deal))?.commissionDiscount ?? 0) }}% commission</div>
                </div>
              </template>

              <!-- ============ VARIANT 3: Minimal / scannable ============ -->
              <template v-else>
                <div
                  v-for="deal in filteredDeals()"
                  :key="deal.id"
                  :class="['rounded-bm-lg border bg-white transition-all cursor-pointer', deal.status === 'ended' ? 'border-bm-border opacity-60' : 'border-bm-border hover:border-bm-text-mid hover:shadow-sm']"
                  @click="deal.status !== 'ended' && openModelsDrawer(deal.id)"
                >
                  <div class="flex items-center gap-4 p-4">
                    <!-- Left: status dot + title -->
                    <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ background: dealStatusMeta[deal.status].tagBg }" />
                    <div class="flex-1 min-w-0">
                      <h3 class="text-sm font-semibold text-bm-text-hi truncate">{{ deal.name }}</h3>
                      <p class="text-xs text-bm-text-low mt-0.5">
                        {{ dealStatusMeta[deal.status].label }}
                        <span v-if="deal.countdown" class="font-semibold"> - {{ deal.countdown }}</span>
                        <span> - {{ deal.markets.join(', ') }}</span>
                      </p>
                    </div>

                    <!-- Middle: progress dots -->
                    <div v-if="deal.status !== 'ended'" class="flex items-center gap-1.5 shrink-0">
                      <div class="flex items-center gap-1">
                        <span v-for="(tier, ti) in deal.volumeTiers" :key="ti" :class="['w-2 h-2 rounded-full transition-colors', currentTierIndex(deal) >= ti ? 'bg-bm-success' : 'bg-bm-gray-200']" />
                      </div>
                      <span class="text-xs text-bm-text-low ml-1">{{ deal.currentSales }}/{{ deal.volumeTiers[deal.volumeTiers.length - 1].sales }}</span>
                    </div>

                    <!-- Right: commission -->
                    <div class="shrink-0 text-right">
                      <span class="text-lg font-bold text-bm-text-hi">{{ deal.baseCommission - (currentTierIndex(deal) >= 0 ? deal.volumeTiers[currentTierIndex(deal)].commissionDiscount : 0) }}%</span>
                    </div>
                    <svg class="w-5 h-5 text-bm-text-low shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              </template>

            <div v-if="filteredDeals().length === 0" class="py-16 text-center">
              <svg class="w-12 h-12 mx-auto text-bm-gray-300 mb-3" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
              <p class="text-sm text-bm-text-low">No deals match your filters.</p>
            </div>
            </div>
          </div>
        </aside>

        <!-- MODELS DRAWER -->
        <aside v-else-if="activeDrawer === 'models' && activeDeal()" key="models" class="h-full flex flex-col bg-bm-surface shadow-2xl" style="width: 976px; min-width: 976px; border-radius: 12px 0 0 12px;" role="dialog" aria-modal="true" aria-labelledby="models-drawer-title">
          <div class="relative flex items-center justify-center h-[68px] bg-bm-surface shrink-0" style="padding: 24px 72px 20px;">
            <!-- Left: back button -->
            <button type="button" class="absolute w-8 h-8 flex items-center justify-center rounded-bm-sm text-bm-text-hi hover:bg-bm-gray-100 transition-colors" style="left: 24px; top: 50%; transform: translateY(-50%);" aria-label="Back to deals" @click="backToDeals">
              <svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M8.427 7.53a.75.75 0 0 0-1.06-1.06L2.72 11.116a1.25 1.25 0 0 0 0 1.768l4.646 4.646a.75.75 0 0 0 1.06-1.06l-3.719-3.72h16.19a.75.75 0 0 0 0-1.5H4.706l3.72-3.72" fill="currentColor"/></svg>
            </button>
            <h2 id="models-drawer-title" class="text-base font-normal text-bm-text-hi">{{ activeDeal()!.name }}</h2>
            <!-- Right: Export CSV -->
            <button type="button" class="absolute inline-flex items-center gap-2 px-[11px] py-[5px] rounded-bm-sm border border-bm-text-mid text-bm-text-hi text-sm font-semibold hover:bg-bm-gray-50 transition-colors" style="right: 24px; top: 50%; transform: translateY(-50%);" aria-label="Export deal products">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
              Export CSV
            </button>
          </div>

          <div class="overflow-y-auto flex-1">
            <!-- Header -->
            <div class="px-6 pt-6 pb-4 flex flex-col gap-3">
              <!-- Status + countdown -->
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" :style="{ background: dealStatusMeta[activeDeal()!.status].tagBg, color: dealStatusMeta[activeDeal()!.status].tagText }">
                  {{ dealStatusMeta[activeDeal()!.status].label }}
                </span>
                <span class="inline-flex items-center gap-1.5 text-sm" style="color: #2F3136;">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                  <span v-if="activeDeal()!.status === 'starting-soon'">Deal starts on: <span class="font-semibold text-bm-text-hi">{{ activeDeal()!.startDate }}</span></span>
                  <span v-else-if="activeDeal()!.status === 'ended'">Deal ended {{ activeDeal()!.endDate }}</span>
                  <span v-else>Ends in <span class="font-semibold text-bm-text-hi">{{ activeDeal()!.countdown?.replace('Ends in ', '') ?? '' }}</span></span>
                </span>
              </div>

              <!-- Title -->
              <h2 class="text-2xl font-semibold leading-8 text-bm-text-hi" style="font-family: 'BM Duplet DSP', sans-serif;">{{ activeDeal()!.name }}</h2>

              <!-- Description -->
              <p class="text-sm text-bm-text-hi">{{ dealDescription[activeDeal()!.status] }}</p>

              <!-- Flags -->
              <div class="flex items-center gap-1">
                <span v-for="m in activeDeal()!.markets" :key="m" class="inline-flex items-center gap-1 pl-2.5 pr-2 h-7 rounded-full text-xs font-normal" style="background: #ECEEF2; color: #2F3136;">
                  <FlagChip :code="m" :height="12" />
                  {{ m }}
                </span>
              </div>
            </div>

            <!-- Filters -->
            <div class="px-6 py-3 flex items-center gap-3">
              <input v-model="modelSearch" type="text" placeholder="Search models" class="h-12 px-3 rounded-bm-sm border border-[#D2D4DA] bg-white text-base text-bm-text-hi focus:outline-none focus:border-bm-text-hi flex-1" />
              <select v-model="modelMarket" class="h-12 px-3 pr-9 rounded-bm-sm border border-[#D2D4DA] bg-white text-base text-bm-text-hi focus:outline-none focus:border-bm-text-hi cursor-pointer flex-1 appearance-none" style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 stroke=%22%235C5E63%22 stroke-width=%222%22 viewBox=%220 0 24 24%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 12px center; background-size: 20px;">
                <option value="all">All markets</option>
                <option v-for="m in modelMarkets()" :key="m" :value="m">{{ m }}</option>
              </select>
              <select v-model="modelGrade" class="h-12 px-3 pr-9 rounded-bm-sm border border-[#D2D4DA] bg-white text-base text-bm-text-hi focus:outline-none focus:border-bm-text-hi cursor-pointer flex-1 appearance-none" style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 stroke=%22%235C5E63%22 stroke-width=%222%22 viewBox=%220 0 24 24%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 12px center; background-size: 20px;">
                <option value="all">All grades</option>
                <option v-for="g in modelGrades()" :key="g" :value="g">{{ g }}</option>
              </select>
              <select v-model="modelStatus" class="h-12 px-3 pr-9 rounded-bm-sm border border-[#D2D4DA] bg-white text-base text-bm-text-hi focus:outline-none focus:border-bm-text-hi cursor-pointer flex-1 appearance-none" style="background-image: url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 stroke=%22%235C5E63%22 stroke-width=%222%22 viewBox=%220 0 24 24%22%3E%3Cpath stroke-linecap=%22round%22 stroke-linejoin=%22round%22 d=%22M19 9l-7 7-7-7%22/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 12px center; background-size: 20px;">
                <option value="all">All statuses</option>
                <option value="listed">Listed</option>
                <option value="not-listed">Not listed</option>
                <option value="at-deal-price">At deal price</option>
                <option value="above-deal-price">Above deal price</option>
              </select>
            </div>

            <!-- Model count -->
            <div class="px-6 pb-2">
              <p style="font-size: 12px; line-height: 16px; color: #5C5E63;">Showing {{ filteredModels().length }} of {{ activeDeal()?.models.length ?? 0 }} models</p>
            </div>

            <!-- Table -->
            <div class="px-6 pb-6">
              <div class="bg-white rounded-xl overflow-hidden" style="box-shadow: 0px 8px 16px rgba(15, 17, 23, 0.12);">
                <table class="w-full border-collapse" style="font-family: 'BM Duplet TXT', sans-serif;">
                  <thead>
                    <tr style="border-bottom: 1px solid #E0E2E8; height: 56px;">
                      <th class="text-left" style="padding: 20px 12px; width: 64px;"></th>
                      <th class="text-left font-semibold" style="padding: 10px 12px; color: #0F1117; font-size: 14px; line-height: 20px;">Product</th>
                      <th class="text-left font-semibold" style="padding: 10px 12px; width: 90px; color: #0F1117; font-size: 14px; line-height: 20px;">Market</th>
                      <th v-if="activeDeal()?.status && activeDeal()!.status !== 'starting-soon'" class="text-left font-semibold" style="padding: 10px 12px; width: 90px; color: #0F1117; font-size: 14px; line-height: 20px; white-space: nowrap;">
                        <span class="inline-flex items-center" style="gap: 4px;">Units sold
                          <button type="button" @click="toggleUnitsSort" class="inline-flex items-center justify-center cursor-pointer hover:bg-black/5 transition-colors" style="width: 20px; height: 20px; border: 1px solid #2F3136; border-radius: 2px; color: #0F1117;">
                            <svg style="width: 12px; height: 12px;" viewBox="0 0 24 24"><path d="M15.116 3.823 12.47 6.47a.75.75 0 0 0 1.06 1.06l1.72-1.72V17a.75.75 0 0 0 1.5 0V5.81l1.72 1.72a.75.75 0 1 0 1.06-1.06l-2.646-2.647a1.25 1.25 0 0 0-1.768 0M8.75 7a.75.75 0 0 0-1.5 0v11.19l-1.72-1.72a.75.75 0 1 0-1.06 1.06l2.646 2.647a1.25 1.25 0 0 0 1.768 0l2.646-2.647a.75.75 0 0 0-1.06-1.06l-1.72 1.72V7" fill="currentColor"/></svg>
                          </button>
                        </span>
                      </th>
                      <th class="text-left font-semibold" style="padding: 10px 12px; width: 130px; color: #0F1117; font-size: 14px; line-height: 20px;">Deal price</th>
                      <th v-if="activeDeal()?.status !== 'ended'" class="text-left font-semibold" style="padding: 10px 12px; width: 130px; color: #0F1117; font-size: 14px; line-height: 20px;">Your price</th>
                      <th v-if="activeDeal()?.status !== 'ended'" class="text-left" style="padding: 10px 12px; width: 130px;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="model in filteredModels()" :key="model.id" style="border-bottom: 1px solid #E0E2E8;">
                      <!-- Image -->
                      <td style="padding: 16px 12px; vertical-align: middle;">
                        <div class="rounded-md bg-white overflow-hidden" style="width: 40px; height: 40px;">
                          <ProductThumb :thumb="model.thumb" />
                        </div>
                      </td>

                      <!-- Product -->
                      <td style="padding: 16px 12px; vertical-align: middle;">
                        <p class="font-semibold" style="font-size: 14px; line-height: 20px; color: #0F1117;">{{ model.name }}</p>
                        <span class="inline-flex items-center mt-1.5" style="gap: 4px; padding: 2px 6px; background: #ECEEF2; border-radius: 20px;">
                          <svg style="width: 12px; height: 12px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09" /></svg>
                          <span style="font-size: 11px; line-height: 16px; color: #121016;">{{ model.grade }}</span>
                        </span>
                      </td>

                      <!-- Market -->
                      <td style="padding: 16px 12px; vertical-align: middle;">
                        <span class="inline-flex items-center" style="gap: 6px; padding: 4px 10px; background: #ECEEF2; border-radius: 20px;">
                          <FlagChip :code="model.market" :height="14" />
                          <span style="font-size: 11px; line-height: 16px; color: #121016;">{{ model.market }}</span>
                        </span>
                      </td>

                      <!-- Units sold (active / ending-soon / ended, before deal price) -->
                      <td v-if="activeDeal()?.status && activeDeal()!.status !== 'starting-soon'" style="padding: 16px 12px; vertical-align: middle; white-space: nowrap;">
                        <span class="font-semibold" style="font-size: 14px; line-height: 20px; color: #0F1117; white-space: nowrap;">{{ model.unitsSold ?? 0 }}</span>
                      </td>

                      <!-- Deal price -->
                      <td style="padding: 16px 12px; vertical-align: middle;">
                        <template v-if="model.previousDealPrice && activeDeal()?.hasPriceUpdate">
                          <div class="mb-1.5"><span class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" style="background: #D7E3FC; color: #4A5E82;">Price update</span></div>
                          <span style="font-size: 14px; line-height: 20px; color: #121016;">{{ formatPrice(model.dealPrice).integer }}<span style="font-size: 12px; color: #121016;">.{{ formatPrice(model.dealPrice).cents }}</span> €</span>
                          <p style="font-size: 11px; line-height: 16px; color: #5C5E63;">or less</p>
                        </template>
                        <template v-else>
                          <span style="font-size: 14px; line-height: 20px; color: #121016;">{{ formatPrice(model.dealPrice).integer }}<span style="font-size: 12px; color: #121016;">.{{ formatPrice(model.dealPrice).cents }}</span> €</span>
                          <p style="font-size: 11px; line-height: 16px; color: #5C5E63;">or less</p>
                        </template>
                      </td>

                      <!-- Your price -->
                      <td v-if="activeDeal()?.status !== 'ended'" style="padding: 16px 12px; vertical-align: middle;">
                        <template v-if="model.hasListing">
                          <span style="font-size: 14px; line-height: 20px; color: #121016;">{{ formatPrice(model.yourPrice!).integer }}<span style="font-size: 12px; color: #121016;">.{{ formatPrice(model.yourPrice!).cents }}</span> €</span>
                          <p v-if="model.listingAtDealPrice" class="font-semibold" style="font-size: 11px; line-height: 16px; color: #006D42; margin-top: 2px;">Included in deal</p>
                          <p v-else class="font-semibold" style="font-size: 11px; line-height: 16px; color: #B54708; margin-top: 2px;">{{ priceDiffPercent(model) }}% above deal price</p>
                        </template>
                        <span v-else class="italic" style="font-size: 12px; line-height: 16px; color: #5C5E63;">Not listed</span>
                      </td>

                      <!-- Actions -->
                      <td v-if="activeDeal()?.status !== 'ended'" style="padding: 16px 12px; vertical-align: middle;">
                        <div class="flex flex-col gap-2">
                          <button
                            v-if="!model.hasListing"
                            type="button"
                            class="prototype-hotspot cursor-pointer whitespace-nowrap inline-flex items-center justify-center transition-colors w-full"
                            style="height: 26px; padding: 5px 11px; background: #121016; color: #FFFFFF; border-radius: 6px; font-size: 12px; line-height: 16px; font-weight: 600; font-family: 'BM Duplet TXT', sans-serif;"
                          >
                            Create listing
                          </button>
                          <template v-else>
                            <button
                              v-if="!model.listingAtDealPrice"
                              type="button"
                              class="prototype-hotspot cursor-pointer whitespace-nowrap inline-flex items-center justify-center transition-colors w-full"
                              style="height: 26px; padding: 5px 11px; background: #121016; color: #FFFFFF; border-radius: 6px; font-size: 12px; line-height: 16px; font-weight: 600; font-family: 'BM Duplet TXT', sans-serif;"
                            >
                              Set deal price
                            </button>
                            <button
                              type="button"
                              class="prototype-hotspot cursor-pointer whitespace-nowrap inline-flex items-center justify-center transition-colors w-full"
                              style="height: 26px; padding: 5px 11px; background: #FFFFFF; border: 1px solid #2F3136; color: #121016; border-radius: 6px; font-size: 12px; line-height: 16px; font-weight: 600; font-family: 'BM Duplet TXT', sans-serif;"
                            >
                              View listing
                            </button>
                          </template>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </aside>
      </Transition>
    </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 200ms ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-replace-enter-active {
  transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
  transition-delay: 50ms;
}
.drawer-replace-leave-active {
  transition: transform 220ms cubic-bezier(0.4, 0, 1, 1);
}
.drawer-replace-enter-from {
  transform: translateX(100%);
}
.drawer-replace-leave-to {
  transform: translateX(100%);
}

@media (prefers-reduced-motion: reduce) {
  .drawer-replace-enter-active,
  .drawer-replace-leave-active {
    transition: none;
    transition-delay: 0ms;
  }
  .drawer-replace-enter-from,
  .drawer-replace-leave-to {
    transform: none;
  }
}
</style>
