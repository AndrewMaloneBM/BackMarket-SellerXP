<script setup lang="ts">
const props = withDefaults(defineProps<{ previewMode?: 'before' | 'after' }>(), { previewMode: 'after' })

const SELLER_NAME = 'TechRenew'
const NAV_ITEMS = ['Home', 'Insights', 'Customer Care', 'Listings', 'Orders', 'Opportunities', 'Money', 'Options', 'Seller Support']
const activeNavItem = ref('Opportunities')

const BEFORE_TABS = ['Pricing', 'Inventory'] as const
const AFTER_TABS = ['Deals', 'Pricing', 'Inventory'] as const
const activeTab = ref(props.previewMode === 'before' ? 'Pricing' : 'Deals')

watch(() => props.previewMode, (mode) => {
  if (mode === 'before' && !BEFORE_TABS.includes(activeTab.value as any)) activeTab.value = 'Pricing'
  if (mode === 'after' && !AFTER_TABS.includes(activeTab.value as any)) activeTab.value = 'Deals'
})

// ---- Accordion state (Pricing tab) ----
const expandedAccordions = ref<string[]>(['quick-wins', 'boost', 'trouble'])
function toggleAccordion(id: string) {
  if (expandedAccordions.value.includes(id)) expandedAccordions.value = expandedAccordions.value.filter(a => a !== id)
  else expandedAccordions.value = [...expandedAccordions.value, id]
}
function isExpanded(id: string) { return expandedAccordions.value.includes(id) }

// ---- Pricing data ----
interface QuickWin { id: string; thumb: string; name: string; grade: string; market: string; currentPrice: number; recommendedPrice: number; priceDiff: number; stock: number }
const quickWins: QuickWin[] = [
  { id: 'QW1', thumb: 'iphone-blue',   name: 'iPhone 16 - 128GB - Ultramarine',     grade: 'Excellent', market: 'FR', currentPrice: 465, recommendedPrice: 458, priceDiff: 1.5, stock: 50 },
  { id: 'QW2', thumb: 'samsung-s23',   name: 'Samsung Galaxy S24 - 128GB - Onyx',   grade: 'Excellent', market: 'FR', currentPrice: 430, recommendedPrice: 425, priceDiff: 1.2, stock: 50 },
  { id: 'QW3', thumb: 'iphone-13-mid', name: 'iPhone 14 - 128GB - Midnight',       grade: 'Excellent', market: 'DE', currentPrice: 390, recommendedPrice: 385, priceDiff: 1.3, stock: 30 },
]
interface TroubledListing { id: string; thumb: string; name: string; grade: string; market: string; currentPrice: number; recommendedPrice: number; priceDiff: number; stock: number }
const troubledListings: TroubledListing[] = [
  { id: 'TL1', thumb: 'samsung-s20', name: 'Samsung Galaxy S20 - 128GB - Cosmic Gray', grade: 'Good',      market: 'ES', currentPrice: 350, recommendedPrice: 230, priceDiff: 52, stock: 20 },
  { id: 'TL2', thumb: 'lg-g7',       name: 'LG G7 - 128GB - Midnight',                 grade: 'Excellent', market: 'IT', currentPrice: 280, recommendedPrice: 165, priceDiff: 70, stock: 15 },
]
interface BoostBackBox { id: string; thumb: string; name: string; grade: string; market: string; currentPrice: number; recommendedPrice: number; stock: number; competition: string }
const backBoxesToBoost: BoostBackBox[] = [
  { id: 'BB1', thumb: 'iphone-13-mid', name: 'iPhone 13 - 128GB - Midnight',       grade: 'Excellent', market: 'FR', currentPrice: 340, recommendedPrice: 315, stock: 40, competition: 'Medium' },
  { id: 'BB2', thumb: 'samsung-a7',   name: 'Samsung Galaxy A7 - 128GB - White',   grade: 'Excellent', market: 'FR', currentPrice: 200, recommendedPrice: 185, stock: 25, competition: 'Low' },
]
interface InventoryItem { id: string; thumb: string; name: string; grade: string; category: string; market: string; avgPrice: number; competition: 'Low' | 'Medium' | 'High' | 'Very low' | 'None'; volumePrediction: number; demand: 'High' | 'Medium' | 'Low' }
const inventoryItems: InventoryItem[] = [
  { id: 'INV1', thumb: 'iphone-blue',   name: 'iPhone 16 Pro - 256GB - Desert Titanium', grade: 'Excellent', category: 'Smartphones', market: 'FR', avgPrice: 720, competition: 'Low',      volumePrediction: 45, demand: 'High' },
  { id: 'INV2', thumb: 'iphone-blue',   name: 'iPhone 15 - 128GB - Blue',               grade: 'Good',      category: 'Smartphones', market: 'FR', avgPrice: 380, competition: 'Medium',   volumePrediction: 30, demand: 'High' },
  { id: 'INV3', thumb: 'samsung-s23',   name: 'Samsung Galaxy S25 - 128GB - Cream',    grade: 'Excellent', category: 'Smartphones', market: 'DE', avgPrice: 510, competition: 'Very low', volumePrediction: 20, demand: 'Medium' },
]

const competitionTagColor: Record<string, { bg: string; text: string }> = {
  'Low': { bg: '#FBDFB0', text: '#775811' }, 'Medium': { bg: '#FBDFB0', text: '#775811' },
  'Very low': { bg: '#D7E3FC', text: '#4A5E82' }, 'None': { bg: '#96F5BD', text: '#006D42' },
  'High': { bg: '#FFDAD8', text: '#B8102A' },
}

// ---- Deals data (from concept 1) ----
type DealStatus = 'starting-soon' | 'in-progress' | 'ending-soon' | 'ended'
interface VolumeTier { sales: number; commissionDiscount: number }
interface DealModel {
  id: string; thumb: string; name: string; grade: string; hasListing: boolean; listingAtDealPrice: boolean
  dealPrice: number; previousDealPrice?: number; yourPrice?: number; unitsSold?: number; market: string
  stock?: number
}
interface Deal {
  id: string; name: string; category: string; status: DealStatus; hasPriceUpdate?: boolean
  markets: string[]; startDate: string; endDate: string; countdown?: string
  daysUntilStart?: number; durationWeeks?: number; baseCommission: number
  volumeTiers: VolumeTier[]; currentSales: number; models: DealModel[]
}

const deals: Deal[] = [
  {
    id: 'D2', name: 'Apple iPhone 17 - exclusive deal', category: 'Smartphones', status: 'starting-soon',
    markets: ['FR', 'ES', 'DE'], startDate: '01 September 2026', endDate: '30 September 2026',
    countdown: '1 day', daysUntilStart: 1, durationWeeks: 3, baseCommission: 10,
    volumeTiers: [{ sales: 10, commissionDiscount: 2 }, { sales: 25, commissionDiscount: 3 }, { sales: 50, commissionDiscount: 5 }],
    currentSales: 0,
    models: [
      { id: 'M6', thumb: 'iphone-13-mid', name: 'iPhone 16 - 128GB - Ultramarine', grade: 'Excellent', hasListing: false, listingAtDealPrice: false, dealPrice: 580, market: 'FR', stock: 50 },
      { id: 'M7', thumb: 'iphone-blue',   name: 'iPhone 16 Pro - 256GB - Desert Titanium', grade: 'Excellent', hasListing: false, listingAtDealPrice: false, dealPrice: 720, market: 'FR', stock: 50 },
      { id: 'M8', thumb: 'iphone-13-mid', name: 'iPhone 15 - 128GB - Blue', grade: 'Excellent', hasListing: true, listingAtDealPrice: false, dealPrice: 450, yourPrice: 465, market: 'FR', stock: 50 },
      { id: 'M9', thumb: 'iphone-blue',   name: 'iPhone 15 Pro - 256GB - Natural Titanium', grade: 'Excellent', hasListing: true, listingAtDealPrice: false, dealPrice: 590, yourPrice: 610, market: 'FR', stock: 50 },
      { id: 'M10', thumb: 'iphone-13-mid', name: 'iPhone 14 - 128GB - Midnight', grade: 'Excellent', hasListing: true, listingAtDealPrice: false, dealPrice: 380, yourPrice: 385, market: 'FR', stock: 50 },
      { id: 'M11', thumb: 'iphone-13-mid', name: 'iPhone 13 - 128GB - Midnight', grade: 'Excellent', hasListing: true, listingAtDealPrice: false, dealPrice: 320, yourPrice: 340, market: 'FR', stock: 50 },
      { id: 'M12', thumb: 'iphone-blue',   name: 'iPhone 13 Pro - 128GB - Natural Titanium', grade: 'Good', hasListing: true, listingAtDealPrice: false, dealPrice: 350, yourPrice: 355, market: 'FR', stock: 50 },
    ],
  },
  {
    id: 'D1', name: 'Apple iPhones & Samsung Galaxies - selected models', category: 'Smartphones', status: 'in-progress',
    markets: ['FR', 'DE', 'ES', 'GB'], startDate: '13 August 2026', endDate: '26 August 2026',
    countdown: 'Ends in 5 days', baseCommission: 10,
    volumeTiers: [{ sales: 10, commissionDiscount: 2 }, { sales: 25, commissionDiscount: 3 }, { sales: 50, commissionDiscount: 5 }],
    currentSales: 27,
    models: [
      { id: 'M1', thumb: 'iphone-blue',   name: 'iPhone 16 - 128GB - Ultramarine', grade: 'Excellent', hasListing: true, listingAtDealPrice: true, dealPrice: 580, yourPrice: 579, unitsSold: 12, market: 'FR', stock: 50 },
      { id: 'M2', thumb: 'iphone-13-mid', name: 'iPhone 15 - 128GB - Blue', grade: 'Excellent', hasListing: true, listingAtDealPrice: false, dealPrice: 450, yourPrice: 465, unitsSold: 7, market: 'FR', stock: 50 },
      { id: 'M3', thumb: 'iphone-blue',   name: 'iPhone 14 - 128GB - Midnight', grade: 'Excellent', hasListing: false, listingAtDealPrice: false, dealPrice: 380, unitsSold: 0, market: 'FR', stock: 50 },
      { id: 'M4', thumb: 'samsung-s23',   name: 'Samsung Galaxy S25 - 128GB - Cream', grade: 'Excellent', hasListing: false, listingAtDealPrice: false, dealPrice: 510, unitsSold: 0, market: 'FR', stock: 50 },
      { id: 'M5', thumb: 'samsung-s23',   name: 'Samsung Galaxy S24 - 128GB - Onyx', grade: 'Excellent', hasListing: true, listingAtDealPrice: false, dealPrice: 420, yourPrice: 440, unitsSold: 5, market: 'FR', stock: 50 },
      { id: 'M13', thumb: 'samsung-s20',  name: 'Samsung Galaxy S23 - 128GB - Cosmic Gray', grade: 'Good', hasListing: true, listingAtDealPrice: true, dealPrice: 290, yourPrice: 289, unitsSold: 3, market: 'FR', stock: 50 },
    ],
  },
  {
    id: 'D4', name: 'Robot vacuums - all models', category: 'Home appliances', status: 'in-progress', hasPriceUpdate: true,
    markets: ['FR', 'DE', 'IT', 'ES'], startDate: '25 August 2026', endDate: '22 September 2026',
    countdown: 'Ends in 18 days', baseCommission: 10,
    volumeTiers: [{ sales: 5, commissionDiscount: 2 }, { sales: 15, commissionDiscount: 3 }, { sales: 30, commissionDiscount: 5 }],
    currentSales: 8,
    models: [
      { id: 'M14', thumb: 'iphone-blue', name: 'Roborock Q7 MaxV - Robot Vacuum', grade: 'Excellent', hasListing: false, listingAtDealPrice: false, dealPrice: 279, previousDealPrice: 299, unitsSold: 0, market: 'FR', stock: 50 },
      { id: 'M15', thumb: 'iphone-blue', name: 'iRobot Roomba i5+ - Robot Vacuum', grade: 'Excellent', hasListing: false, listingAtDealPrice: false, dealPrice: 349, unitsSold: 0, market: 'FR', stock: 50 },
      { id: 'M16', thumb: 'iphone-blue', name: 'Dyson 360 Vis Nav - Robot Vacuum', grade: 'Excellent', hasListing: false, listingAtDealPrice: false, dealPrice: 549, previousDealPrice: 599, unitsSold: 0, market: 'FR', stock: 50 },
    ],
  },
  {
    id: 'D3', name: 'Samsung Galaxy S24 - selected models', category: 'Smartphones', status: 'ending-soon',
    markets: ['FR', 'DE', 'ES'], startDate: '13 August 2026', endDate: '02 September 2026',
    countdown: 'Ends in 18 hours', baseCommission: 10,
    volumeTiers: [{ sales: 10, commissionDiscount: 2 }, { sales: 25, commissionDiscount: 3 }, { sales: 50, commissionDiscount: 5 }],
    currentSales: 52,
    models: [
      { id: 'M17', thumb: 'samsung-s23', name: 'Samsung Galaxy S24 - 128GB - Onyx', grade: 'Excellent', hasListing: true, listingAtDealPrice: true, dealPrice: 420, yourPrice: 419, unitsSold: 28, market: 'FR', stock: 50 },
      { id: 'M18', thumb: 'samsung-s23', name: 'Samsung Galaxy S24 Ultra - 256GB - Titanium', grade: 'Excellent', hasListing: false, listingAtDealPrice: false, dealPrice: 580, unitsSold: 0, market: 'FR', stock: 50 },
      { id: 'M19', thumb: 'samsung-s20', name: 'Samsung Galaxy S24 - 128GB - Amber', grade: 'Good', hasListing: true, listingAtDealPrice: false, dealPrice: 390, yourPrice: 410, unitsSold: 24, market: 'FR', stock: 50 },
    ],
  },
  {
    id: 'D5', name: 'Apple iPhone 14 - exclusive deal', category: 'Smartphones', status: 'ended',
    markets: ['FR', 'ES', 'DE'], startDate: '30 March 2026', endDate: '12 April 2026',
    baseCommission: 10,
    volumeTiers: [{ sales: 10, commissionDiscount: 2 }, { sales: 25, commissionDiscount: 3 }, { sales: 50, commissionDiscount: 5 }],
    currentSales: 22,
    models: [
      { id: 'M20', thumb: 'iphone-13-mid', name: 'iPhone 14 - 128GB - Midnight', grade: 'Excellent', hasListing: true, listingAtDealPrice: true, dealPrice: 380, yourPrice: 379, unitsSold: 15, market: 'FR', stock: 50 },
      { id: 'M21', thumb: 'iphone-13-mid', name: 'iPhone 14 Pro - 256GB - Deep Blue', grade: 'Excellent', hasListing: false, listingAtDealPrice: false, dealPrice: 520, unitsSold: 7, market: 'FR', stock: 50 },
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
  'starting-soon': { label: 'Starting soon', tagBg: '#E2F77E', tagText: '#121016' },
  'in-progress':   { label: 'Active', tagBg: '#96F5BD', tagText: '#006D42' },
  'ending-soon':   { label: 'Active', tagBg: '#96F5BD', tagText: '#006D42' },
  'ended':         { label: 'Ended', tagBg: '#ECEEF2', tagText: '#121016' },
}
const dealExtraTag: Record<DealStatus, { label: string | null; bg: string; text: string }> = {
  'starting-soon': { label: null, bg: '', text: '' },
  'in-progress':   { label: null, bg: '', text: '' },
  'ending-soon':   { label: 'Ending soon', bg: '#FBDFB0', text: '#775811' },
  'ended':         { label: null, bg: '', text: '' },
}
const priceUpdateTag = { label: 'Price update', bg: '#D7E3FC', text: '#4A5E82' }

// ---- Deals tab: list + detail view ----
const layoutVariants = [
  { key: 'drawer', label: 'Drawer' },
  { key: 'grid', label: 'Grid' },
  { key: 'table', label: 'Table' },
  { key: 'split', label: 'Split' },
]
const layoutVariant = ref('drawer')

const activeDealId = ref<string | null>(null)
const drawerOpen = ref(false)
const activeDeal = computed(() => deals.find(d => d.id === activeDealId.value) ?? null)
// Split view uses a separate select function that doesn't open the drawer
function selectDeal(dealId: string) {
  activeDealId.value = dealId
}

function openDeal(dealId: string) {
  activeDealId.value = dealId
  drawerOpen.value = true
}
function backToDeals() {
  drawerOpen.value = false
  activeDealId.value = null
}

watch(layoutVariant, (v) => {
  if (v === 'split' && !activeDealId.value) {
    const first = filteredDeals()[0]
    if (first) activeDealId.value = first.id
  }
})

// ---- Deals tab: filters ----
const filterSearch = ref('')
const filterMarket = ref('all')
const filterStatus = ref('all')
const filterCategory = ref('all')
const ALL_MARKETS = [...new Set(deals.flatMap(d => d.markets))].sort()
const ALL_CATEGORIES = [...new Set(deals.map(d => d.category))].sort()
const STATUS_OPTIONS: { key: DealStatus | 'all'; label: string }[] = [
  { key: 'all', label: 'All statuses' }, { key: 'starting-soon', label: 'Starting soon' },
  { key: 'in-progress', label: 'Active' }, { key: 'ending-soon', label: 'Ending soon' }, { key: 'ended', label: 'Ended' },
]
const STATUS_ORDER: Record<DealStatus, number> = { 'starting-soon': 0, 'in-progress': 1, 'ending-soon': 2, 'ended': 3 }
function filteredDeals(): Deal[] {
  return deals.filter((deal) => {
    if (filterSearch.value) {
      const q = filterSearch.value.toLowerCase()
      if (!deal.name.toLowerCase().includes(q) && !deal.category.toLowerCase().includes(q)) return false
    }
    if (filterMarket.value !== 'all' && !deal.markets.includes(filterMarket.value)) return false
    if (filterStatus.value !== 'all' && deal.status !== filterStatus.value) return false
    if (filterCategory.value !== 'all' && deal.category !== filterCategory.value) return false
    return true
  }).sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status])
}

// ---- Models table helpers ----
const modelSearch = ref('')
const modelMarket = ref('all')
const modelGrade = ref('all')
const modelStatus = ref('all')
const unitsSortDir = ref<'asc' | 'desc'>('desc')

function resetModelFilters() {
  modelSearch.value = ''; modelMarket.value = 'all'; modelGrade.value = 'all'; modelStatus.value = 'all'; unitsSortDir.value = 'desc'
}
function currentTierIndex(deal: Deal): number {
  let idx = -1; deal.volumeTiers.forEach((tier, i) => { if (deal.currentSales >= tier.sales) idx = i })
  return idx
}
function nextTier(deal: Deal): VolumeTier | null {
  const idx = currentTierIndex(deal)
  if (idx < 0) return deal.volumeTiers[0] ?? null
  return deal.volumeTiers[idx + 1] ?? null
}
function salesToNextTier(deal: Deal): number {
  const next = nextTier(deal); if (!next) return 0
  return Math.max(0, next.sales - deal.currentSales)
}
function volumeProgress(deal: Deal): number {
  const maxTier = deal.volumeTiers[deal.volumeTiers.length - 1]; if (!maxTier) return 0
  return Math.min(100, Math.round((deal.currentSales / maxTier.sales) * 100))
}
function formatPriceAmount(amount: number): { integer: string; cents: string } {
  const fixed = amount.toFixed(2); const [int, cents] = fixed.split('.')
  return { integer: parseInt(int).toLocaleString('en-US'), cents }
}
function priceDiffPercent(model: DealModel): number {
  if (!model.yourPrice || !model.dealPrice) return 0
  return Math.round(((model.yourPrice - model.dealPrice) / model.dealPrice) * 100)
}

const eligibilityMeta: Record<string, { label: string; tagBg: string; tagText: string }> = {
  'eligible':     { label: 'Eligible',     tagBg: '#96F5BD', tagText: '#006D42' },
  'near-target':  { label: 'Near target',  tagBg: '#FBDFB0', tagText: '#775811' },
  'not-eligible': { label: 'Not eligible', tagBg: '#FFDAD8', tagText: '#B8102A' },
  'not-listed':   { label: 'Not listed',    tagBg: '#ECEEF2', tagText: '#121016' },
}

function eligibility(model: DealModel): string {
  if (!model.hasListing) return 'not-listed'
  if (model.listingAtDealPrice) return 'eligible'
  if (model.yourPrice && model.dealPrice && Math.abs(model.yourPrice - model.dealPrice) / model.dealPrice <= 0.05) return 'near-target'
  return 'not-eligible'
}

function priceDiffAbs(model: DealModel): number {
  if (!model.yourPrice || !model.dealPrice) return 0
  return Math.round((model.yourPrice - model.dealPrice) * 100) / 100
}

function dealPayout(model: DealModel, deal: Deal): number {
  const price = model.yourPrice ?? model.dealPrice
  const commission = deal.baseCommission - (currentTierIndex(deal) >= 0 ? deal.volumeTiers[currentTierIndex(deal)].commissionDiscount : 0)
  return Math.round((price * (1 - commission / 100)) * 100) / 100
}

function standardPayout(model: DealModel, deal: Deal): number {
  const price = model.yourPrice ?? model.dealPrice
  return Math.round((price * (1 - deal.baseCommission / 100)) * 100) / 100
}

function profitPerUnit(model: DealModel, deal: Deal): number {
  return Math.round((dealPayout(model, deal) - standardPayout(model, deal)) * 100) / 100
}

function totalImpact(model: DealModel, deal: Deal): number {
  return Math.round(profitPerUnit(model, deal) * (model.stock ?? 0) * 100) / 100
}

function nextAction(model: DealModel): string {
  if (!model.hasListing) return 'Create listing'
  const elig = eligibility(model)
  if (elig === 'eligible') return 'See listing'
  if (elig === 'near-target') return 'Update price'
  return 'Review margin'
}

function dealEligibleCount(deal: Deal): number {
  return deal.models.filter(m => eligibility(m) === 'eligible').length
}
function dealNearTargetCount(deal: Deal): number {
  return deal.models.filter(m => eligibility(m) === 'near-target').length
}
function dealTotalImpact(deal: Deal): number {
  return Math.round(deal.models.reduce((sum, m) => sum + totalImpact(m, deal), 0) * 100) / 100
}
function dealEligibilityProgress(deal: Deal): number {
  return Math.round((dealEligibleCount(deal) / deal.models.length) * 100)
}

function filteredModels(): DealModel[] {
  if (!activeDeal.value) return []
  const filtered = activeDeal.value.models.filter((model) => {
    if (modelSearch.value) { const q = modelSearch.value.toLowerCase(); if (!model.name.toLowerCase().includes(q)) return false }
    if (modelMarket.value !== 'all' && model.market !== modelMarket.value) return false
    if (modelGrade.value !== 'all' && model.grade !== modelGrade.value) return false
    if (modelStatus.value === 'listed' && !model.hasListing) return false
    if (modelStatus.value === 'not-listed' && model.hasListing) return false
    if (modelStatus.value === 'at-deal-price' && !model.listingAtDealPrice) return false
    if (modelStatus.value === 'above-deal-price' && (!model.hasListing || model.listingAtDealPrice)) return false
    return true
  })
  if (activeDeal.value.status !== 'starting-soon') {
    filtered.sort((a, b) => { const diff = (a.unitsSold ?? 0) - (b.unitsSold ?? 0); return unitsSortDir.value === 'desc' ? -diff : diff })
  }
  return filtered
}
function toggleUnitsSort() { unitsSortDir.value = unitsSortDir.value === 'desc' ? 'asc' : 'desc' }
function modelMarkets(): string[] { return [...new Set(activeDeal.value?.models.map(m => m.market) ?? [])].sort() }
function modelGrades(): string[] { return [...new Set(activeDeal.value?.models.map(m => m.grade) ?? [])].sort() }

// ---- Pricing tab format helper ----
function formatPrice(price: number): string { return price.toFixed(2) }

// ---- Thumb backgrounds ----
function thumbBg(thumb: string): string {
  const map: Record<string, string> = {
    'iphone-blue':   'linear-gradient(135deg, hsl(225, 60%, 30%) 0%, hsl(215, 90%, 70%) 100%)',
    'iphone-13-mid': 'linear-gradient(135deg, hsl(220, 8%, 25%) 0%, hsl(220, 6%, 42%) 100%)',
    'samsung-s23':   'linear-gradient(135deg, hsl(220, 8%, 25%) 0%, hsl(220, 6%, 42%) 100%)',
    'samsung-s20':   'linear-gradient(135deg, hsl(220, 8%, 25%) 0%, hsl(220, 6%, 42%) 100%)',
    'samsung-a7':    'linear-gradient(135deg, hsl(220, 15%, 18%) 0%, hsl(220, 10%, 35%) 100%)',
    'lg-g7':         'linear-gradient(135deg, hsl(220, 15%, 18%) 0%, hsl(220, 10%, 35%) 100%)',
  }
  return map[thumb] ?? 'linear-gradient(135deg, hsl(220, 10%, 80%), hsl(220, 10%, 62%))'
}
</script>

<template>
  <BmShell
    :nav-items="NAV_ITEMS"
    :active-nav-item="activeNavItem"
    :seller-name="SELLER_NAME"
    page-title="Opportunities"
    :tabs="previewMode === 'before' ? BEFORE_TABS : AFTER_TABS"
    :active-tab="activeTab"
    @nav-item-click="activeNavItem = $event"
    @update:active-tab="activeTab = $event"
  >
    <div class="py-8">
      <div class="max-w-7xl mx-auto px-6">

        <!-- ========== DEALS TAB (after state) ========== -->
        <template v-if="previewMode === 'after' && activeTab === 'Deals'">
          <!-- Deal list view -->
          <div>
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-semibold text-bm-text-hi">All deals</h2>
              <!-- Layout variant selector -->
              <div class="flex items-center gap-3">
                <span class="text-[10px] font-semibold uppercase tracking-wider text-bm-text-low">Layout</span>
                <div class="flex items-center gap-1">
                  <button
                    v-for="v in layoutVariants"
                    :key="v.key"
                    :class="[
                      'h-7 px-2 rounded-bm-sm text-xs font-bold cursor-pointer transition-colors',
                      layoutVariant === v.key ? 'bg-bm-text-hi text-white' : 'bg-white border border-bm-border text-bm-text-mid hover:text-bm-text-hi hover:border-bm-text-hi',
                    ]"
                    @click="layoutVariant = v.key; backToDeals()"
                  >
                    {{ v.label }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Filters -->
            <div class="flex flex-wrap items-center gap-3 mb-6">
              <input v-model="filterSearch" type="text" placeholder="Search deals" class="h-12 px-3 rounded-bm-sm border border-[#D2D4DA] bg-white text-base text-bm-text-hi focus:outline-none focus:border-bm-text-hi flex-1 min-w-[200px]" />
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
            </div>

            <!-- Layout: Drawer (default - cards + drawer) -->
            <div v-if="layoutVariant === 'drawer'" class="flex flex-col gap-4">
              <div
                v-for="deal in filteredDeals()"
                :key="deal.id"
                :class="['rounded-xl bg-white overflow-hidden border', deal.status === 'ended' ? 'border-bm-border opacity-70' : 'border-bm-border']"
              >
                <div class="p-4">
                  <div class="flex items-center justify-between gap-2 mb-2.5">
                    <div class="flex items-center gap-1.5">
                      <span class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" :style="{ background: dealStatusMeta[deal.status].tagBg, color: dealStatusMeta[deal.status].tagText }">{{ dealStatusMeta[deal.status].label }}</span>
                      <span v-if="dealExtraTag[deal.status].label" class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" :style="{ background: dealExtraTag[deal.status].bg, color: dealExtraTag[deal.status].text }">{{ dealExtraTag[deal.status].label }}</span>
                      <span v-if="deal.hasPriceUpdate" class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" :style="{ background: priceUpdateTag.bg, color: priceUpdateTag.text }">{{ priceUpdateTag.label }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <span v-if="deal.countdown || deal.status === 'starting-soon'" class="inline-flex items-center gap-1 text-xs font-normal text-bm-text-mid">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                        <span v-if="deal.status === 'starting-soon'">Starts on {{ deal.startDate }}</span>
                        <span v-else>{{ deal.countdown }}</span>
                      </span>
                      <button type="button" class="prototype-hotspot inline-flex items-center gap-1.5 px-2.5 h-7 rounded-bm-sm border border-bm-text-mid text-bm-text-hi text-xs font-semibold hover:bg-bm-gray-50 transition-colors" @click="openDeal(deal.id)">
                        {{ deal.models.length }} models
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-semibold leading-6 text-bm-text-hi flex-1 min-w-0 truncate" style="font-family: 'BM Duplet DSP', sans-serif;">{{ deal.name }}</h3>
                    <div class="flex items-center gap-1 shrink-0">
                      <span v-for="m in deal.markets" :key="m" class="inline-flex items-center gap-1 px-1.5 h-5 rounded-full text-[10px] font-normal" style="background: #ECEEF2; color: #2F3136;"><FlagChip :code="m" :height="9" />{{ m }}</span>
                    </div>
                  </div>
                  <div v-if="deal.status === 'starting-soon'" class="inline-flex items-center gap-1.5 mt-2">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none"><path fill="#006D42" d="M12 2.5c.5 0 1 .3 1.2.8l1.5 3.6c.4 1 .6 2 .6 3.1v3l-1.5 2h-3.6L9 13v-3c0-1.1.2-2.1.6-3.1l1.5-3.6c.2-.5.7-.8 1.2-.8z"/><path fill="#006D42" d="M9 14l-2 1.5V18l2-1V14zm6 0l2 1.5V18l-2-1v-3z"/><path fill="#006D42" d="M11 19v2h2v-2h-2z"/><circle cx="12" cy="9" r="1.5" fill="#fff"/></svg>
                    <span class="text-xs font-semibold" style="color: #006D42;">Prepare your listings now to take advantage of the deal</span>
                  </div>
                  <div v-if="deal.status === 'ended'" class="inline-flex items-center gap-1.5 mt-2">
                    <svg class="w-4 h-4 text-bm-text-low" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                    <span class="text-xs text-bm-text-low">Deal ended {{ deal.endDate }}. You reached {{ deal.baseCommission - (currentTierIndex(deal) >= 0 ? deal.volumeTiers[currentTierIndex(deal)].commissionDiscount : 0) }}% commission on {{ deal.currentSales }} sales.</span>
                  </div>
                </div>
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
                    <span class="text-xs text-bm-text-low mr-2 shrink-0">Volume goals:</span>
                    <div class="flex items-center gap-1.5">
                      <div v-for="(tier, ti) in deal.volumeTiers" :key="ti" class="flex items-center gap-1.5">
                        <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style="background: #ECEEF2; color: #121016;">
                          <span>{{ deal.baseCommission - tier.commissionDiscount }}%</span>
                          <span class="w-px h-3" style="background: #A9ABB0;"></span>
                          <span>{{ tier.sales }}+ sales</span>
                        </span>
                        <svg v-if="ti < deal.volumeTiers.length - 1" class="w-3 h-3 text-bm-text-low shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="px-4 pb-4">
                  <div class="flex items-center gap-4">
                    <div class="flex items-center gap-1.5 flex-1 min-w-0 flex-wrap">
                      <span class="text-xs text-bm-text-low mr-1 shrink-0">Commission:</span>
                      <div v-for="(tier, ti) in deal.volumeTiers" :key="ti" class="flex items-center gap-1.5">
                        <span
                          class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors"
                          :style="{
                            background: deal.status === 'ended'
                              ? currentTierIndex(deal) >= ti ? '#ECEEF2' : 'transparent'
                              : ti === currentTierIndex(deal) ? '#96F5BD'
                              : ti < currentTierIndex(deal) ? '#ECEEF2'
                              : 'transparent',
                            color: deal.status === 'ended'
                              ? currentTierIndex(deal) >= ti ? '#0F1117' : '#5C5E63'
                              : ti === currentTierIndex(deal) ? '#006D42'
                              : ti < currentTierIndex(deal) ? '#006D42'
                              : '#5C5E63',
                            border: ti <= currentTierIndex(deal) || (deal.status === 'ended' && currentTierIndex(deal) >= ti) ? '1px solid ' + (deal.status === 'ended' ? '#A9ABB0' : ti === currentTierIndex(deal) ? '#37C27F' : '#006D42') : '1px solid #A9ABB0',
                          }"
                        >
                          <span>{{ deal.baseCommission - tier.commissionDiscount }}%</span>
                          <span class="w-px h-3" :style="{ background: ti <= currentTierIndex(deal) ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.15)' }"></span>
                          <span>{{ tier.sales }}+ sales</span>
                        </span>
                        <svg v-if="ti < deal.volumeTiers.length - 1" class="w-3 h-3 text-bm-text-low shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                      </div>
                    </div>
                    <div class="shrink-0 text-right">
                      <span class="text-sm font-semibold text-bm-text-hi">{{ deal.currentSales }}</span>
                      <span class="text-xs text-bm-text-low">/{{ deal.volumeTiers[deal.volumeTiers.length - 1].sales }} sold</span>
                    </div>
                  </div>
                  <div class="relative mt-3">
                    <div class="relative h-1.5 rounded-full overflow-hidden" style="background: #E0E2E8;">
                      <div class="h-full rounded-full transition-all duration-500" :style="{ width: `${volumeProgress(deal)}%`, background: deal.status === 'ending-soon' ? '#006D42' : deal.status === 'ended' ? '#8F9196' : '#121016' }" />
                    </div>
                    <span v-for="(tier, ti) in deal.volumeTiers" :key="ti" class="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" :style="{ left: `calc(${(tier.sales / deal.volumeTiers[deal.volumeTiers.length - 1].sales) * 100}% - 3px)`, background: currentTierIndex(deal) >= ti && (deal.status === 'ending-soon' || deal.status === 'ended') ? '#FFFFFF' : '#121016' }" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Layout: Grid (cards in a 2-column grid, click expands inline) -->
            <div v-else-if="layoutVariant === 'grid'" class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <template v-for="deal in filteredDeals()" :key="deal.id">
                <div :class="['rounded-xl bg-white overflow-hidden border', deal.status === 'ended' ? 'border-bm-border opacity-70' : 'border-bm-border']">
                  <div class="p-4 cursor-pointer" @click="openDeal(deal.id)">
                    <div class="flex items-center justify-between gap-2 mb-2">
                      <div class="flex items-center gap-1.5">
                        <span class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" :style="{ background: dealStatusMeta[deal.status].tagBg, color: dealStatusMeta[deal.status].tagText }">{{ dealStatusMeta[deal.status].label }}</span>
                        <span v-if="deal.hasPriceUpdate" class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" :style="{ background: priceUpdateTag.bg, color: priceUpdateTag.text }">{{ priceUpdateTag.label }}</span>
                      </div>
                      <span v-if="deal.countdown" class="text-xs text-bm-text-mid">{{ deal.countdown }}</span>
                    </div>
                    <h3 class="text-base font-semibold leading-6 text-bm-text-hi mb-1" style="font-family: 'BM Duplet DSP', sans-serif;">{{ deal.name }}</h3>
                    <div class="flex items-center gap-2 text-xs text-bm-text-low">
                      <span>{{ deal.models.length }} models</span>
                      <span class="text-bm-gray-300">|</span>
                      <div class="flex items-center gap-0.5">
                        <FlagChip v-for="m in deal.markets" :key="m" :code="m" :height="10" />
                      </div>
                      <span class="text-bm-gray-300">|</span>
                      <span>{{ deal.startDate }} - {{ deal.endDate }}</span>
                    </div>
                  <div v-if="deal.status !== 'starting-soon' && deal.status !== 'ended'" class="mt-3">
                    <div class="flex items-center gap-2 mb-1.5">
                      <div class="flex-1 h-1.5 rounded-full overflow-hidden" style="background: #E0E2E8;">
                        <div class="h-full rounded-full" :style="{ width: `${volumeProgress(deal)}%`, background: '#121016' }" />
                      </div>
                      <span class="text-xs font-semibold text-bm-text-hi">{{ deal.currentSales }}/{{ deal.volumeTiers[deal.volumeTiers.length - 1].sales }}</span>
                    </div>
                    <span class="text-xs text-bm-text-low">{{ deal.baseCommission - (currentTierIndex(deal) >= 0 ? deal.volumeTiers[currentTierIndex(deal)].commissionDiscount : 0) }}% commission earned</span>
                  </div>
                </div>
                </div>
              </template>
            </div>

            <!-- Layout: Table (all deals in a single table, click row to expand) -->
            <div v-else-if="layoutVariant === 'table'">
              <div class="bg-white rounded-xl overflow-hidden border border-bm-border">
                <table class="w-full border-collapse" style="font-family: 'BM Duplet TXT', sans-serif;">
                  <thead>
                    <tr style="border-bottom: 1px solid #E0E2E8; height: 48px;">
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Status</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Deal</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Markets</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Models</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Progress</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Commission</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Timeline</th>
                      <th style="padding: 10px 16px;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-for="deal in filteredDeals()" :key="deal.id">
                      <tr
                        style="border-bottom: 1px solid #E0E2E8; cursor: pointer;"
                        :style="{ opacity: deal.status === 'ended' ? 0.7 : 1 }"
                        @click="openDeal(deal.id)"
                      >
                        <td style="padding: 12px 16px; vertical-align: middle;">
                          <span class="inline-flex items-center px-1 h-4 rounded-[2px] text-[11px] font-semibold" :style="{ background: dealStatusMeta[deal.status].tagBg, color: dealStatusMeta[deal.status].tagText }">{{ dealStatusMeta[deal.status].label }}</span>
                        </td>
                        <td style="padding: 16px; vertical-align: middle;">
                          <p class="font-semibold" style="font-size: 14px; color: #0F1117;">{{ deal.name }}</p>
                        </td>
                        <td style="padding: 16px; vertical-align: middle;">
                          <div class="flex items-center gap-0.5">
                            <FlagChip v-for="m in deal.markets" :key="m" :code="m" :height="12" />
                          </div>
                        </td>
                        <td style="padding: 16px; vertical-align: middle;"><span style="font-size: 14px; color: #121016;">{{ deal.models.length }}</span></td>
                        <td style="padding: 16px; vertical-align: middle;">
                          <div v-if="deal.status !== 'starting-soon'" class="flex items-center gap-2">
                            <div class="w-24 h-1.5 rounded-full overflow-hidden" style="background: #E0E2E8;">
                              <div class="h-full rounded-full" :style="{ width: `${volumeProgress(deal)}%`, background: deal.status === 'ending-soon' ? '#006D42' : '#121016' }" />
                            </div>
                            <span class="text-xs text-bm-text-low">{{ deal.currentSales }}/{{ deal.volumeTiers[deal.volumeTiers.length - 1].sales }}</span>
                          </div>
                          <span v-else class="text-xs text-bm-text-low">Not started</span>
                        </td>
                        <td style="padding: 16px; vertical-align: middle;">
                          <span class="font-semibold" style="font-size: 14px; color: #0F1117;">{{ deal.baseCommission - (currentTierIndex(deal) >= 0 ? deal.volumeTiers[currentTierIndex(deal)].commissionDiscount : 0) }}%</span>
                        </td>
                        <td style="padding: 16px; vertical-align: middle;">
                          <span style="font-size: 12px; color: #5C5E63;">{{ deal.startDate }} - {{ deal.endDate }}</span>
                          <p v-if="deal.countdown" style="font-size: 11px; color: #5C5E63;">{{ deal.countdown }}</p>
                        </td>
                        <td style="padding: 16px; vertical-align: middle;">
                          <svg class="w-4 h-4 text-bm-text-low transition-transform" :class="activeDealId === deal.id ? 'rotate-90' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Layout: Split (deal list on left, models on right) -->
            <div v-else-if="layoutVariant === 'split'" class="flex gap-6">
              <!-- Deal list -->
              <div class="w-96 shrink-0 flex flex-col gap-3">
                <div
                  v-for="deal in filteredDeals()"
                  :key="deal.id"
                  :class="['rounded-xl bg-white overflow-hidden border cursor-pointer transition-colors', activeDealId === deal.id ? 'border-bm-text-hi' : 'border-bm-border', deal.status === 'ended' ? 'opacity-70' : '']"
                  @click="selectDeal(deal.id)"
                >
                  <div class="p-4">
                    <div class="flex items-center gap-1.5 mb-2">
                      <span class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" :style="{ background: dealStatusMeta[deal.status].tagBg, color: dealStatusMeta[deal.status].tagText }">{{ dealStatusMeta[deal.status].label }}</span>
                      <span v-if="deal.countdown" class="text-xs text-bm-text-mid ml-auto">{{ deal.countdown }}</span>
                    </div>
                    <h3 class="text-sm font-semibold leading-5 text-bm-text-hi mb-1" style="font-family: 'BM Duplet DSP', sans-serif;">{{ deal.name }}</h3>
                    <div class="flex items-center gap-2 text-xs text-bm-text-low">
                      <span>{{ deal.models.length }} models</span>
                      <span class="text-bm-gray-300">|</span>
                      <div class="flex items-center gap-0.5">
                        <FlagChip v-for="m in deal.markets" :key="m" :code="m" :height="10" />
                      </div>
                    </div>
                    <div v-if="deal.status !== 'starting-soon' && deal.status !== 'ended'" class="mt-2">
                      <div class="h-1 rounded-full overflow-hidden" style="background: #E0E2E8;">
                        <div class="h-full rounded-full" :style="{ width: `${volumeProgress(deal)}%`, background: '#121016' }" />
                      </div>
                      <p class="text-xs text-bm-text-low mt-1">{{ deal.baseCommission - (currentTierIndex(deal) >= 0 ? deal.volumeTiers[currentTierIndex(deal)].commissionDiscount : 0) }}% commission</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Models panel -->
              <div class="flex-1 min-w-0">
                <div v-if="activeDeal">
                  <div class="mb-4">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" :style="{ background: dealStatusMeta[activeDeal.status].tagBg, color: dealStatusMeta[activeDeal.status].tagText }">{{ dealStatusMeta[activeDeal.status].label }}</span>
                      <span v-if="activeDeal.countdown" class="text-xs text-bm-text-mid">{{ activeDeal.countdown }}</span>
                    </div>
                    <h2 class="text-xl font-semibold text-bm-text-hi mb-1">{{ activeDeal.name }}</h2>
                    <p class="text-sm text-bm-text-mid">{{ dealDescription[activeDeal.status] }}</p>
                  </div>
                  <p style="font-size: 12px; line-height: 16px; color: #5C5E63; margin-bottom: 12px;">Showing {{ filteredModels().length }} of {{ activeDeal.models.length }} models</p>
                  <div class="bg-white rounded-xl overflow-hidden border border-bm-border">
                    <table class="w-full border-collapse" style="font-family: 'BM Duplet TXT', sans-serif;">
                      <thead>
                        <tr style="border-bottom: 1px solid #E0E2E8; height: 48px;">
                          <th class="text-left" style="padding: 20px 12px; width: 64px;"></th>
                          <th class="text-left font-semibold" style="padding: 10px 12px; color: #0F1117; font-size: 14px;">Product</th>
                          <th class="text-left font-semibold" style="padding: 10px 12px; width: 90px; color: #0F1117; font-size: 14px;">Market</th>
                          <th v-if="activeDeal.status !== 'starting-soon'" class="text-left font-semibold" style="padding: 10px 12px; width: 90px; color: #0F1117; font-size: 14px; white-space: nowrap;">Units sold</th>
                          <th class="text-left font-semibold" style="padding: 10px 12px; width: 120px; color: #0F1117; font-size: 14px;">Deal price</th>
                          <th v-if="activeDeal.status !== 'ended'" class="text-left font-semibold" style="padding: 10px 12px; width: 120px; color: #0F1117; font-size: 14px;">Your price</th>
                          <th v-if="activeDeal.status !== 'ended'" style="padding: 10px 12px; width: 120px;"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="model in filteredModels()" :key="model.id" style="border-bottom: 1px solid #E0E2E8;">
                          <td style="padding: 16px 12px; vertical-align: middle;">
                            <div class="rounded-md overflow-hidden" :style="{ width: '40px', height: '40px', background: thumbBg(model.thumb) }" />
                          </td>
                          <td style="padding: 16px 12px; vertical-align: middle;">
                            <p class="font-semibold" style="font-size: 14px; color: #0F1117;">{{ model.name }}</p>
                            <span style="font-size: 11px; color: #5C5E63;">{{ model.grade }}</span>
                          </td>
                          <td style="padding: 16px 12px; vertical-align: middle;">
                            <span class="inline-flex items-center" style="gap: 6px; padding: 4px 10px; background: #ECEEF2; border-radius: 20px;">
                              <FlagChip :code="model.market" :height="14" />
                              <span style="font-size: 11px; color: #121016;">{{ model.market }}</span>
                            </span>
                          </td>
                          <td v-if="activeDeal.status !== 'starting-soon'" style="padding: 16px 12px; vertical-align: middle;"><span class="font-semibold" style="font-size: 14px; color: #0F1117;">{{ model.unitsSold ?? 0 }}</span></td>
                          <td style="padding: 16px 12px; vertical-align: middle;"><span style="font-size: 14px; color: #121016;">{{ formatPriceAmount(model.dealPrice).integer }}.{{ formatPriceAmount(model.dealPrice).cents }} €</span></td>
                          <td v-if="activeDeal.status !== 'ended'" style="padding: 16px 12px; vertical-align: middle;">
                            <span v-if="model.hasListing" style="font-size: 14px; color: #121016;">{{ formatPriceAmount(model.yourPrice!).integer }}.{{ formatPriceAmount(model.yourPrice!).cents }} €</span>
                            <span v-else class="italic" style="font-size: 12px; color: #5C5E63;">Not listed</span>
                          </td>
                          <td v-if="activeDeal.status !== 'ended'" style="padding: 16px 12px; vertical-align: middle;">
                            <span v-if="model.hasListing" class="text-xs font-semibold" :style="{ color: model.listingAtDealPrice ? '#006D42' : '#B54708' }">{{ model.listingAtDealPrice ? 'Included' : `${priceDiffPercent(model)}% above` }}</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ========== PRICING TAB ========== -->
        <template v-if="activeTab === 'Pricing'">
          <div class="flex flex-col gap-5">
            <!-- Quick wins -->
            <div class="bg-white overflow-hidden" style="border-radius: 6px; filter: drop-shadow(0px 2px 4px rgba(15, 17, 23, 0.05));">
              <div class="flex flex-col" style="padding: 24px; gap: 16px;">
                <button class="w-full flex items-start justify-between text-left" @click="toggleAccordion('quick-wins')">
                  <div class="flex-1" style="padding-right: 48px;">
                    <h3 style="font-family: 'BM Duplet DSP', sans-serif; font-weight: 600; font-size: 22px; line-height: 32px; color: #0F1117;">{{ quickWins.length }} quick wins</h3>
                    <p style="font-family: 'BM Duplet TXT', sans-serif; font-weight: 400; font-size: 16px; line-height: 24px; color: #5C5E63; margin-top: 4px;">Win these BackBoxes by dropping your prices a little.</p>
                  </div>
                  <svg class="shrink-0 transition-transform" :class="isExpanded('quick-wins') ? 'rotate-180' : ''" style="width: 24px; height: 24px; color: #5C5E63;" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                </button>
                <div class="relative" style="background: #D7E3FC; border-radius: 12px; padding: 8px 8px 20px 52px;">
                  <svg class="absolute" style="width: 24px; height: 24px; left: 16px; top: 16px;" fill="currentColor" viewBox="0 0 24 24"><path d="M16 3.55l2.01 4.94 4.94 2.01-4.94 2.01L16 17.45l-2.01-4.94-4.94-2.01 4.94-2.01L16 3.55z" fill="#0F1117" /></svg>
                  <p style="font-family: 'BM Duplet TXT', sans-serif; font-weight: 600; font-size: 14px; line-height: 20px; color: #2F3136; padding-top: 10px;">Win {{ quickWins.length }} BackBoxes by decreasing your prices by 2% or less.</p>
                </div>
              </div>
              <div v-if="isExpanded('quick-wins')" class="border-t border-bm-border">
                <table class="w-full border-collapse">
                  <thead>
                    <tr style="border-bottom: 1px solid #E0E2E8; height: 48px;">
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Product</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Market</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Current price</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Recommended price</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Difference</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Stock</th>
                      <th style="padding: 10px 16px;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in quickWins" :key="item.id" style="border-bottom: 1px solid #E0E2E8;">
                      <td style="padding: 16px; vertical-align: middle;">
                        <div class="flex items-center gap-3">
                          <div class="rounded-md overflow-hidden shrink-0" :style="{ width: '40px', height: '40px', background: thumbBg(item.thumb) }" />
                          <div>
                            <p class="font-semibold" style="font-size: 14px; line-height: 20px; color: #0F1117;">{{ item.name }}</p>
                            <span class="inline-flex items-center mt-1" style="gap: 4px; padding: 2px 6px; background: #ECEEF2; border-radius: 20px;"><span style="font-size: 11px; color: #121016;">{{ item.grade }}</span></span>
                          </div>
                        </div>
                      </td>
                      <td style="padding: 16px; vertical-align: middle;">
                        <span class="inline-flex items-center" style="gap: 6px; padding: 4px 10px; background: #ECEEF2; border-radius: 20px;"><FlagChip :code="item.market" :height="14" /><span style="font-size: 11px; color: #121016;">{{ item.market }}</span></span>
                      </td>
                      <td style="padding: 16px; vertical-align: middle;"><span style="font-size: 14px; color: #121016;">{{ formatPrice(item.currentPrice) }} €</span></td>
                      <td style="padding: 16px; vertical-align: middle;"><span style="font-size: 14px; color: #0F1117; font-weight: 600;">{{ formatPrice(item.recommendedPrice) }} €</span></td>
                      <td style="padding: 16px; vertical-align: middle;"><span class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" style="background: #FBDFB0; color: #775811;">+{{ item.priceDiff }}%</span></td>
                      <td style="padding: 16px; vertical-align: middle;"><span style="font-size: 14px; color: #121016;">{{ item.stock }}</span></td>
                      <td style="padding: 16px; vertical-align: middle; text-align: right;"><button type="button" class="prototype-hotspot cursor-pointer inline-flex items-center justify-center" style="height: 32px; padding: 0 12px; background: #0F1117; color: #FFFFFF; border-radius: 6px; font-size: 14px; font-weight: 600; font-family: 'BM Duplet TXT', sans-serif;">Get BackBox</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- BackBoxes to boost -->
            <div class="bg-white overflow-hidden" style="border-radius: 6px; filter: drop-shadow(0px 2px 4px rgba(15, 17, 23, 0.05));">
              <div class="flex flex-col" style="padding: 24px; gap: 16px;">
                <button class="w-full flex items-start justify-between text-left" @click="toggleAccordion('boost')">
                  <div class="flex-1" style="padding-right: 48px;">
                    <h3 style="font-family: 'BM Duplet DSP', sans-serif; font-weight: 600; font-size: 22px; line-height: 32px; color: #0F1117;">{{ backBoxesToBoost.length }} BackBoxes to boost</h3>
                    <p style="font-family: 'BM Duplet TXT', sans-serif; font-weight: 400; font-size: 16px; line-height: 24px; color: #5C5E63; margin-top: 4px;">You've won the BackBoxes, but these products still aren't selling. Drop your prices to start moving inventory.</p>
                  </div>
                  <svg class="shrink-0 transition-transform" :class="isExpanded('boost') ? 'rotate-180' : ''" style="width: 24px; height: 24px; color: #5C5E63;" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                </button>
                <div class="relative" style="background: #D7E3FC; border-radius: 12px; padding: 8px 8px 20px 52px;">
                  <svg class="absolute" style="width: 24px; height: 24px; left: 16px; top: 16px;" fill="currentColor" viewBox="0 0 24 24"><path d="M16 3.55l2.01 4.94 4.94 2.01-4.94 2.01L16 17.45l-2.01-4.94-4.94-2.01 4.94-2.01L16 3.55z" fill="#0F1117" /></svg>
                  <p style="font-family: 'BM Duplet TXT', sans-serif; font-weight: 600; font-size: 14px; line-height: 20px; color: #2F3136; padding-top: 10px;">Boost {{ backBoxesToBoost.length }} BackBoxes by decreasing your prices by 2% or less.</p>
                </div>
              </div>
              <div v-if="isExpanded('boost')" class="border-t border-bm-border">
                <table class="w-full border-collapse">
                  <thead>
                    <tr style="border-bottom: 1px solid #E0E2E8; height: 48px;">
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Product</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Market</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Current price</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Recommended price</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Stock</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Competition</th>
                      <th style="padding: 10px 16px;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in backBoxesToBoost" :key="item.id" style="border-bottom: 1px solid #E0E2E8;">
                      <td style="padding: 16px; vertical-align: middle;">
                        <div class="flex items-center gap-3">
                          <div class="rounded-md overflow-hidden shrink-0" :style="{ width: '40px', height: '40px', background: thumbBg(item.thumb) }" />
                          <div>
                            <p class="font-semibold" style="font-size: 14px; line-height: 20px; color: #0F1117;">{{ item.name }}</p>
                            <span class="inline-flex items-center mt-1" style="gap: 4px; padding: 2px 6px; background: #ECEEF2; border-radius: 20px;"><span style="font-size: 11px; color: #121016;">{{ item.grade }}</span></span>
                          </div>
                        </div>
                      </td>
                      <td style="padding: 16px; vertical-align: middle;"><span class="inline-flex items-center" style="gap: 6px; padding: 4px 10px; background: #ECEEF2; border-radius: 20px;"><FlagChip :code="item.market" :height="14" /><span style="font-size: 11px; color: #121016;">{{ item.market }}</span></span></td>
                      <td style="padding: 16px; vertical-align: middle;"><span style="font-size: 14px; color: #121016;">{{ formatPrice(item.currentPrice) }} €</span></td>
                      <td style="padding: 16px; vertical-align: middle;"><span style="font-size: 14px; color: #0F1117; font-weight: 600;">{{ formatPrice(item.recommendedPrice) }} €</span></td>
                      <td style="padding: 16px; vertical-align: middle;"><span style="font-size: 14px; color: #121016;">{{ item.stock }}</span></td>
                      <td style="padding: 16px; vertical-align: middle;"><span class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" :style="{ background: competitionTagColor[item.competition].bg, color: competitionTagColor[item.competition].text }">{{ item.competition }}</span></td>
                      <td style="padding: 16px; vertical-align: middle; text-align: right;"><button type="button" class="prototype-hotspot cursor-pointer inline-flex items-center justify-center" style="height: 32px; padding: 0 12px; background: #0F1117; color: #FFFFFF; border-radius: 6px; font-size: 14px; font-weight: 600; font-family: 'BM Duplet TXT', sans-serif;">Adjust price</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Listings in trouble -->
            <div class="bg-white overflow-hidden" style="border-radius: 6px; filter: drop-shadow(0px 2px 4px rgba(15, 17, 23, 0.05));">
              <div class="flex flex-col" style="padding: 24px; gap: 16px;">
                <button class="w-full flex items-start justify-between text-left" @click="toggleAccordion('trouble')">
                  <div class="flex-1" style="padding-right: 48px;">
                    <h3 style="font-family: 'BM Duplet DSP', sans-serif; font-weight: 600; font-size: 22px; line-height: 32px; color: #0F1117;">{{ troubledListings.length }} listings in trouble</h3>
                    <p style="font-family: 'BM Duplet TXT', sans-serif; font-weight: 400; font-size: 16px; line-height: 24px; color: #5C5E63; margin-top: 4px;">We get it, your goods are quality. But you need to drop these prices a lot to win BackBoxes.</p>
                  </div>
                  <svg class="shrink-0 transition-transform" :class="isExpanded('trouble') ? 'rotate-180' : ''" style="width: 24px; height: 24px; color: #5C5E63;" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
                </button>
                <div class="relative" style="background: #D7E3FC; border-radius: 12px; padding: 8px 8px 20px 52px;">
                  <svg class="absolute" style="width: 24px; height: 24px; left: 16px; top: 16px;" fill="currentColor" viewBox="0 0 24 24"><path d="M16 3.55l2.01 4.94 4.94 2.01-4.94 2.01L16 17.45l-2.01-4.94-4.94-2.01 4.94-2.01L16 3.55z" fill="#0F1117" /></svg>
                  <p style="font-family: 'BM Duplet TXT', sans-serif; font-weight: 600; font-size: 14px; line-height: 20px; color: #2F3136; padding-top: 10px;">Win {{ troubledListings.length }} BackBoxes by dropping your prices 30% or more.</p>
                </div>
              </div>
              <div v-if="isExpanded('trouble')" class="border-t border-bm-border">
                <table class="w-full border-collapse">
                  <thead>
                    <tr style="border-bottom: 1px solid #E0E2E8; height: 48px;">
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Product</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Market</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Current price</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Recommended price</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Difference</th>
                      <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Stock</th>
                      <th style="padding: 10px 16px;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in troubledListings" :key="item.id" style="border-bottom: 1px solid #E0E2E8;">
                      <td style="padding: 16px; vertical-align: middle;">
                        <div class="flex items-center gap-3">
                          <div class="rounded-md overflow-hidden shrink-0" :style="{ width: '40px', height: '40px', background: thumbBg(item.thumb) }" />
                          <div>
                            <p class="font-semibold" style="font-size: 14px; line-height: 20px; color: #0F1117;">{{ item.name }}</p>
                            <span class="inline-flex items-center mt-1" style="gap: 4px; padding: 2px 6px; background: #ECEEF2; border-radius: 20px;"><span style="font-size: 11px; color: #121016;">{{ item.grade }}</span></span>
                          </div>
                        </div>
                      </td>
                      <td style="padding: 16px; vertical-align: middle;"><span class="inline-flex items-center" style="gap: 6px; padding: 4px 10px; background: #ECEEF2; border-radius: 20px;"><FlagChip :code="item.market" :height="14" /><span style="font-size: 11px; color: #121016;">{{ item.market }}</span></span></td>
                      <td style="padding: 16px; vertical-align: middle;"><span style="font-size: 14px; color: #121016;">{{ formatPrice(item.currentPrice) }} €</span></td>
                      <td style="padding: 16px; vertical-align: middle;"><span style="font-size: 14px; color: #0F1117; font-weight: 600;">{{ formatPrice(item.recommendedPrice) }} €</span></td>
                      <td style="padding: 16px; vertical-align: middle;"><span class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" style="background: #FFDAD8; color: #B8102A;">+{{ item.priceDiff }}%</span></td>
                      <td style="padding: 16px; vertical-align: middle;"><span style="font-size: 14px; color: #121016;">{{ item.stock }}</span></td>
                      <td style="padding: 16px; vertical-align: middle; text-align: right;"><button type="button" class="prototype-hotspot cursor-pointer inline-flex items-center justify-center" style="height: 32px; padding: 0 12px; background: #0F1117; color: #FFFFFF; border-radius: 6px; font-size: 14px; font-weight: 600; font-family: 'BM Duplet TXT', sans-serif;">Adjust price</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </template>

        <!-- ========== INVENTORY TAB ========== -->
        <template v-if="activeTab === 'Inventory'">
          <div class="bg-white overflow-hidden" style="border-radius: 6px; filter: drop-shadow(0px 2px 4px rgba(15, 17, 23, 0.05));">
            <div class="p-6">
              <h3 class="text-lg font-semibold" style="font-family: 'BM Duplet DSP', sans-serif; color: #0F1117;">Sourcing opportunities</h3>
              <p class="text-sm mt-1" style="color: #5C5E63;">Top-selling products on Back Market by category. Stock these to meet demand.</p>
            </div>
            <div class="border-t border-bm-border">
              <table class="w-full border-collapse">
                <thead>
                  <tr style="border-bottom: 1px solid #E0E2E8; height: 48px;">
                    <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Product</th>
                    <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Category</th>
                    <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Market</th>
                    <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Avg. price</th>
                    <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Competition</th>
                    <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Volume prediction</th>
                    <th class="text-left font-semibold" style="padding: 10px 16px; color: #0F1117; font-size: 14px;">Demand</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in inventoryItems" :key="item.id" style="border-bottom: 1px solid #E0E2E8;">
                    <td style="padding: 16px; vertical-align: middle;">
                      <div class="flex items-center gap-3">
                        <div class="rounded-md overflow-hidden shrink-0" :style="{ width: '40px', height: '40px', background: thumbBg(item.thumb) }" />
                        <div>
                          <p class="font-semibold" style="font-size: 14px; line-height: 20px; color: #0F1117;">{{ item.name }}</p>
                          <span class="inline-flex items-center mt-1" style="gap: 4px; padding: 2px 6px; background: #ECEEF2; border-radius: 20px;"><span style="font-size: 11px; color: #121016;">{{ item.grade }}</span></span>
                        </div>
                      </div>
                    </td>
                    <td style="padding: 16px; vertical-align: middle;"><span style="font-size: 14px; color: #121016;">{{ item.category }}</span></td>
                    <td style="padding: 16px; vertical-align: middle;"><span class="inline-flex items-center" style="gap: 6px; padding: 4px 10px; background: #ECEEF2; border-radius: 20px;"><FlagChip :code="item.market" :height="14" /><span style="font-size: 11px; color: #121016;">{{ item.market }}</span></span></td>
                    <td style="padding: 16px; vertical-align: middle;"><span style="font-size: 14px; color: #121016;">{{ formatPrice(item.avgPrice) }} €</span></td>
                    <td style="padding: 16px; vertical-align: middle;"><span class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" :style="{ background: competitionTagColor[item.competition].bg, color: competitionTagColor[item.competition].text }">{{ item.competition }}</span></td>
                    <td style="padding: 16px; vertical-align: middle;"><span style="font-size: 14px; color: #0F1117; font-weight: 600;">{{ item.volumePrediction }}/month</span></td>
                    <td style="padding: 16px; vertical-align: middle;"><span class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" :style="{ background: item.demand === 'High' ? '#96F5BD' : item.demand === 'Medium' ? '#FBDFB0' : '#ECEEF2', color: item.demand === 'High' ? '#006D42' : item.demand === 'Medium' ? '#775811' : '#121016' }">{{ item.demand }}</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

      </div>
    </div>
  </BmShell>

  <!-- Deal models drawer -->
  <Teleport to="body">
    <Transition name="drawer-fade">
      <div v-if="drawerOpen && activeDeal" class="fixed inset-0 z-50 flex justify-end bg-black/30" role="presentation" @click.self="backToDeals">
        <aside class="h-full flex flex-col bg-bm-surface shadow-2xl" style="width: 976px; min-width: 976px; border-radius: 12px 0 0 12px;" role="dialog" aria-modal="true">
          <!-- Header -->
          <div class="relative flex items-center justify-center h-[68px] bg-bm-surface shrink-0" style="padding: 24px 72px 20px;">
            <button type="button" class="absolute w-8 h-8 flex items-center justify-center rounded-bm-sm text-bm-text-hi hover:bg-bm-gray-100 transition-colors" style="left: 24px; top: 50%; transform: translateY(-50%);" aria-label="Back to deals" @click="backToDeals">
              <svg class="w-5 h-5" viewBox="0 0 24 24"><path d="M8.427 7.53a.75.75 0 0 0-1.06-1.06L2.72 11.116a1.25 1.25 0 0 0 0 1.768l4.646 4.646a.75.75 0 0 0 1.06-1.06l-3.719-3.72h16.19a.75.75 0 0 0 0-1.5H4.706l3.72-3.72" fill="currentColor"/></svg>
            </button>
            <h2 class="text-base font-normal text-bm-text-hi">{{ activeDeal.name }}</h2>
            <button type="button" class="absolute inline-flex items-center gap-2 px-[11px] py-[5px] rounded-bm-sm border border-bm-text-mid text-bm-text-hi text-sm font-semibold hover:bg-bm-gray-50 transition-colors" style="right: 24px; top: 50%; transform: translateY(-50%);" aria-label="Export deal products">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
              Export CSV
            </button>
          </div>

          <div class="overflow-y-auto flex-1">
            <!-- Header content -->
            <div class="px-6 pt-6 pb-4 flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold" :style="{ background: dealStatusMeta[activeDeal.status].tagBg, color: dealStatusMeta[activeDeal.status].tagText }">{{ dealStatusMeta[activeDeal.status].label }}</span>
                <span class="inline-flex items-center gap-1.5 text-sm" :style="{ color: activeDeal.status === 'ending-soon' ? '#775811' : '#2F3136' }">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                  <span v-if="activeDeal.status === 'starting-soon'">Deal starts on: <span class="font-semibold text-bm-text-hi">{{ activeDeal.startDate }}</span></span>
                  <span v-else-if="activeDeal.status === 'ended'">Deal ended {{ activeDeal.endDate }}</span>
                  <span v-else>Ends in <span class="font-semibold" :style="{ color: activeDeal.status === 'ending-soon' ? '#775811' : 'inherit' }">{{ activeDeal.countdown?.replace('Ends in ', '') ?? '' }}</span></span>
                </span>
              </div>
              <h2 class="text-2xl font-semibold leading-8 text-bm-text-hi" style="font-family: 'BM Duplet DSP', sans-serif;">{{ activeDeal.name }}</h2>
              <p class="text-sm text-bm-text-hi">{{ dealDescription[activeDeal.status] }}</p>
              <div class="flex items-center gap-1">
                <span v-for="m in activeDeal.markets" :key="m" class="inline-flex items-center gap-1 pl-2.5 pr-2 h-7 rounded-full text-xs font-normal" style="background: #ECEEF2; color: #2F3136;">
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
              <p style="font-size: 12px; line-height: 16px; color: #5C5E63;">Showing {{ filteredModels().length }} of {{ activeDeal.models.length }} models</p>
            </div>

            <!-- Models table -->
            <div class="px-6 pb-6">
              <div class="bg-white rounded-xl overflow-hidden border border-bm-border">
                <table class="w-full border-collapse" style="font-family: 'BM Duplet TXT', sans-serif;">
                  <thead>
                    <tr style="border-bottom: 1px solid #E0E2E8; height: 48px;">
                      <th class="text-left font-semibold" style="padding: 10px 12px; color: #0F1117; font-size: 13px; line-height: 18px;">Product</th>
                      <th class="text-left font-semibold" style="padding: 10px 12px; width: 140px; color: #0F1117; font-size: 13px; line-height: 18px;">Your price</th>
                      <th class="text-left font-semibold" style="padding: 10px 12px; width: 130px; color: #0F1117; font-size: 13px; line-height: 18px;">Est. payout</th>
                      <th class="text-left font-semibold" style="padding: 10px 12px; width: 130px; color: #0F1117; font-size: 13px; line-height: 18px;">Est. impact</th>
                      <th v-if="activeDeal.status !== 'ended'" class="text-left font-semibold" style="padding: 10px 12px; width: 100px; color: #0F1117; font-size: 13px; line-height: 18px;">Status</th>
                      <th v-if="activeDeal.status !== 'ended'" class="text-left" style="padding: 10px 12px; width: 120px;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="model in filteredModels()" :key="model.id" style="border-bottom: 1px solid #E0E2E8;">
                      <!-- Product (image + name + grade + market pills) -->
                      <td style="padding: 12px; vertical-align: middle;">
                        <div class="flex items-center gap-3">
                          <div class="rounded-md overflow-hidden shrink-0" :style="{ width: '36px', height: '36px', background: thumbBg(model.thumb) }" />
                          <div>
                            <p class="font-semibold" style="font-size: 14px; line-height: 20px; color: #0F1117;">{{ model.name }}</p>
                            <div class="flex items-center gap-1.5 mt-1">
                              <span class="inline-flex items-center" style="gap: 4px; padding: 2px 6px; background: #ECEEF2; border-radius: 20px;">
                                <span style="font-size: 11px; line-height: 16px; color: #121016;">{{ model.grade }}</span>
                              </span>
                              <span class="inline-flex items-center" style="gap: 4px; padding: 2px 6px; background: #ECEEF2; border-radius: 20px;">
                                <FlagChip :code="model.market" :height="12" />
                                <span style="font-size: 11px; line-height: 16px; color: #121016;">{{ model.market }}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <!-- Your price + diff + deal target -->
                      <td style="padding: 12px; vertical-align: middle;">
                        <span v-if="model.hasListing" style="font-size: 14px; line-height: 20px; color: #121016;">{{ formatPriceAmount(model.yourPrice!).integer }}<span style="font-size: 12px;">.{{ formatPriceAmount(model.yourPrice!).cents }}</span> €</span>
                        <span v-else class="italic" style="font-size: 12px; line-height: 16px; color: #5C5E63;">Not listed</span>
                        <template v-if="model.hasListing && model.yourPrice && model.dealPrice">
                          <p v-if="model.yourPrice <= model.dealPrice" class="font-semibold" style="font-size: 11px; line-height: 16px; color: #006D42; margin-top: 2px;">
                            Eligible
                          </p>
                          <p v-else-if="eligibility(model) === 'near-target'" class="font-semibold" style="font-size: 11px; line-height: 16px; color: #775811; margin-top: 2px;">
                            €{{ formatPriceAmount(priceDiffAbs(model)).integer }}.{{ formatPriceAmount(priceDiffAbs(model)).cents }} above target
                          </p>
                          <p v-else class="font-semibold" style="font-size: 11px; line-height: 16px; color: #B8102A; margin-top: 2px;">
                            €{{ formatPriceAmount(priceDiffAbs(model)).integer }}.{{ formatPriceAmount(priceDiffAbs(model)).cents }} above target
                          </p>
                          <p style="font-size: 11px; line-height: 16px; color: #5C5E63; margin-top: 1px;">Target: {{ formatPriceAmount(model.dealPrice).integer }}.{{ formatPriceAmount(model.dealPrice).cents }} €</p>
                        </template>
                        <template v-else-if="!model.hasListing">
                          <p style="font-size: 11px; line-height: 16px; color: #5C5E63; margin-top: 2px;">Target: {{ formatPriceAmount(model.dealPrice).integer }}.{{ formatPriceAmount(model.dealPrice).cents }} €</p>
                        </template>
                      </td>
                      <!-- Est. payout (deal vs standard struck through) -->
                      <td style="padding: 12px; vertical-align: middle;">
                        <span style="font-size: 14px; line-height: 20px; color: #0F1117; font-weight: 600;">{{ formatPriceAmount(dealPayout(model, activeDeal)).integer }}<span style="font-size: 12px;">.{{ formatPriceAmount(dealPayout(model, activeDeal)).cents }}</span> €</span>
                        <p class="line-through" style="font-size: 11px; line-height: 16px; color: #5C5E63; margin-top: 2px;">{{ formatPriceAmount(standardPayout(model, activeDeal)).integer }}.{{ formatPriceAmount(standardPayout(model, activeDeal)).cents }} €</p>
                      </td>
                      <!-- Est. impact (profit/unit + total with units) -->
                      <td style="padding: 12px; vertical-align: middle;">
                        <span style="font-size: 14px; line-height: 20px; color: #006D42; font-weight: 600;">+{{ formatPriceAmount(profitPerUnit(model, activeDeal)).integer }}.{{ formatPriceAmount(profitPerUnit(model, activeDeal)).cents }} €<span style="font-size: 11px; font-weight: 400; color: #5C5E63;"> /unit</span></span>
                        <p style="font-size: 11px; line-height: 16px; color: #006D42; font-weight: 600; margin-top: 2px;">+{{ formatPriceAmount(totalImpact(model, activeDeal)).integer }}.{{ formatPriceAmount(totalImpact(model, activeDeal)).cents }} € <span style="font-weight: 400; color: #5C5E63;">({{ model.stock ?? 0 }})</span></p>
                      </td>
                      <!-- Status -->
                      <td v-if="activeDeal.status !== 'ended'" style="padding: 12px; vertical-align: middle;">
                        <span class="inline-flex items-center px-1 h-5 rounded-[2px] text-xs font-semibold w-fit" :style="{ background: eligibilityMeta[eligibility(model)].tagBg, color: eligibilityMeta[eligibility(model)].tagText }">
                          {{ eligibilityMeta[eligibility(model)].label }}
                        </span>
                      </td>
                      <!-- Action -->
                      <td v-if="activeDeal.status !== 'ended'" style="padding: 12px; vertical-align: middle;">
                        <div class="flex flex-col gap-2">
                          <button v-if="!model.hasListing" type="button" class="prototype-hotspot cursor-pointer whitespace-nowrap inline-flex items-center justify-center transition-colors w-full" style="height: 26px; padding: 5px 11px; background: #121016; color: #FFFFFF; border-radius: 6px; font-size: 12px; line-height: 16px; font-weight: 600; font-family: 'BM Duplet TXT', sans-serif;">Create listing</button>
                          <template v-else>
                            <button v-if="eligibility(model) === 'near-target'" type="button" class="prototype-hotspot cursor-pointer whitespace-nowrap inline-flex items-center justify-center transition-colors w-full" style="height: 26px; padding: 5px 11px; background: #121016; color: #FFFFFF; border-radius: 6px; font-size: 12px; line-height: 16px; font-weight: 600; font-family: 'BM Duplet TXT', sans-serif;">Update price</button>
                            <button v-else-if="eligibility(model) === 'not-eligible'" type="button" class="prototype-hotspot cursor-pointer whitespace-nowrap inline-flex items-center justify-center transition-colors w-full" style="height: 26px; padding: 5px 11px; background: #121016; color: #FFFFFF; border-radius: 6px; font-size: 12px; line-height: 16px; font-weight: 600; font-family: 'BM Duplet TXT', sans-serif;">Review margin</button>
                            <button type="button" class="prototype-hotspot cursor-pointer whitespace-nowrap inline-flex items-center justify-center transition-colors w-full" style="height: 26px; padding: 5px 11px; background: #FFFFFF; border: 1px solid #2F3136; color: #121016; border-radius: 6px; font-size: 12px; line-height: 16px; font-weight: 600; font-family: 'BM Duplet TXT', sans-serif;">{{ eligibility(model) === 'eligible' ? 'See listing' : 'View listing' }}</button>
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

.drawer-fade-enter-active aside {
  transition: transform 300ms cubic-bezier(0, 0, 0.2, 1);
  transition-delay: 50ms;
}
.drawer-fade-leave-active aside {
  transition: transform 220ms cubic-bezier(0.4, 0, 1, 1);
}
.drawer-fade-enter-from aside,
.drawer-fade-leave-to aside {
  transform: translateX(100%);
}
</style>
