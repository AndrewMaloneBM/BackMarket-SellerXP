/**
 * Mock data for the seller Back Office Home page explorations.
 *
 * Every signal below is traceable to internal documentation surfaced via Dust
 * (Sep 2026 research pass). Windows and thresholds are the REAL documented ones,
 * so concepts can be judged against what the data actually supports.
 *
 * Status legend:
 *   'real'    = confirmed available in the BO today
 *   'partial' = metric exists but not confirmed as a seller-facing widget
 *   'missing' = not available; do NOT design a dependency on this
 */

export type SignalStatus = 'real' | 'partial' | 'missing'
export type Tone = 'critical' | 'warning' | 'success' | 'neutral'

export const SELLER_NAME = 'Merchant'
export const TODAY = 'Monday, 31 August 2026'

/* ------------------------------------------------------------------ *
 * Exception queue
 * Counts are scoped exceptions, not raw totals. Etsy's discipline:
 * every count needs a window and an exclusion rule.
 * ------------------------------------------------------------------ */

export interface QueueItem {
  id: string
  count: number
  label: string
  /** The scoping rule that makes this an exception rather than a total. */
  rule: string
  cta: string
  destination: string
  tone: Tone
  status: SignalStatus
  /** Documented consequence of not acting. */
  consequence?: string
}

export const QUEUE_ITEMS: QueueItem[] = [
  {
    id: 'past-ship-by',
    count: 11,
    label: 'orders past their ship-by date',
    rule: 'Not validated or shipped, past carrier pickup',
    cta: 'Ship now',
    destination: 'Orders',
    tone: 'critical',
    status: 'real',
    consequence: 'Suspension risk if unresolved within 1 business day',
  },
  {
    id: 'late-messages',
    count: 7,
    label: 'messages unanswered over 24 hours',
    rule: 'Back Market agent requests, excl. weekends',
    cta: 'Reply now',
    destination: 'Customer Care',
    tone: 'critical',
    status: 'real',
    consequence: 'Back Market acts on your behalf and you bear the cost',
  },
  {
    id: 'appearance-breach',
    count: 1,
    label: 'quality metric above its limit',
    rule: 'Appearance rate 1.7% vs 1.5% limit, 30 days',
    cta: 'Review grading',
    destination: 'Insights',
    tone: 'warning',
    status: 'real',
    consequence: '7-day category suspension if sustained',
  },
  {
    id: 'listings-trouble',
    count: 64,
    label: 'listings priced well above the BackBox',
    rule: '30% or more above current BackBox price',
    cta: 'Review prices',
    destination: 'Opportunities',
    tone: 'warning',
    status: 'real',
  },
  {
    id: 'blocked-listings',
    count: 4,
    label: 'listings blocked from publishing',
    rule: 'Missing shipping method or compliance data',
    cta: 'Fix listings',
    destination: 'Listings',
    tone: 'warning',
    // Not confirmed as a seller-facing count. Flagged so it is not assumed.
    status: 'partial',
  },
]

/* ------------------------------------------------------------------ *
 * Money
 * Fees and payouts are the #1 voluntary churn driver (21% of churners).
 * ------------------------------------------------------------------ */

export const MONEY = {
  nextPayoutAmount: '€13,227.85',
  nextPayoutDate: '07/09/2026',
  salesPeriod: '24/08/2026 – 31/08/2026',
  walletBalance: '€13,227.85',
  deferredAmount: '€4,182.40',
  deferredNote: 'Held to cover future refunds and warranties',
  payoutGuarantee: '95%',
  tier: 2,
  tierMax: 3,
  tierLabel: 'Tier 2',
  tierDeferredRate: '50% of estimated future refunds',
  tierNextRate: '25% of estimated future refunds',
  /** Documented Tier 3 gates. */
  tierNextCriteria: [
    { label: 'Defective rate under 5%', value: '4.1%', met: true },
    { label: 'Refund rate under 10%', value: '11.2%', met: false },
    { label: 'Active over 6 months', value: '3 years', met: true },
  ],
} as const

/* ------------------------------------------------------------------ *
 * Performance, in seller language
 * Sellers care about turnover, revenue and sell-through, not GMV.
 * (Competitive Benchmark, Seller XP Q4 2024, Ana Boman)
 * ------------------------------------------------------------------ */

export interface Metric {
  id: string
  label: string
  value: string
  delta?: string
  deltaTone?: Tone
  window: string
  status: SignalStatus
}

export const METRICS: Metric[] = [
  { id: 'revenue', label: 'Revenue', value: '€289,601', delta: '-25.2%', deltaTone: 'critical', window: 'Last 7 days', status: 'real' },
  { id: 'orders', label: 'Orders', value: '845', delta: '-27%', deltaTone: 'critical', window: 'Last 7 days', status: 'real' },
  { id: 'refunds', label: 'Refunds', value: '€5,430', delta: '-61.3%', deltaTone: 'success', window: 'Last 7 days', status: 'real' },
  { id: 'sell-through', label: 'Sell-through', value: '38%', delta: '+4pts', deltaTone: 'success', window: 'Last 7 days', status: 'partial' },
]

/** Additional slots a seller could swap in (Shopify's model: 4 slots, user-scoped). */
export const AVAILABLE_METRICS: Metric[] = [
  ...METRICS,
  { id: 'aov', label: 'Average order value', value: '€343', delta: '+2.1%', deltaTone: 'success', window: 'Last 7 days', status: 'partial' },
  { id: 'backbox', label: 'BackBox win rate', value: '61%', delta: '-3pts', deltaTone: 'critical', window: 'Last 7 days', status: 'real' },
  { id: 'cancellation', label: 'Cancellation rate', value: '4.2%', delta: '+0.8pts', deltaTone: 'critical', window: 'Last 7 days', status: 'real' },
  { id: 'active-listings', label: 'Active listings', value: '2,418', delta: '-64', deltaTone: 'critical', window: 'Today', status: 'real' },
]

/* ------------------------------------------------------------------ *
 * Quality
 * Real thresholds with real suspension consequences. No composite score
 * exists, so these stay as individual KPIs.
 * ------------------------------------------------------------------ */

export interface QualityKpi {
  id: string
  label: string
  value: string
  limit: string
  window: string
  tone: Tone
  consequence: string
}

export const QUALITY_KPIS: QualityKpi[] = [
  { id: 'defective', label: 'Defective rate', value: '4.1%', limit: 'under 5%', window: '90 days', tone: 'success', consequence: '30-day suspension at model level' },
  { id: 'appearance', label: 'Appearance rate', value: '1.7%', limit: 'under 1.5%', window: '30 days', tone: 'critical', consequence: '7-day suspension at category level' },
  { id: 'otd', label: 'On-time delivery', value: '94%', limit: '90% or above', window: '30 days', tone: 'success', consequence: 'Listings suspended if in bottom 10%' },
  { id: 'cancellation', label: 'Cancellation rate', value: '4.2%', limit: 'no fixed limit', window: '7 days', tone: 'warning', consequence: 'Suspension if it rises sharply' },
]

/** Overall status derived from the KPIs above. */
export const QUALITY_STATUS = {
  tone: 'warning' as Tone,
  label: 'At risk',
  detail: 'Appearance rate is above its limit',
}

/* ------------------------------------------------------------------ *
 * Opportunities
 * All four are real and live under Opportunities today.
 * ------------------------------------------------------------------ */

export interface Opportunity {
  id: string
  headline: string
  body: string
  cta: string
  destination: string
  /** Why the seller is seeing this, shown to build trust in the ranking. */
  basedOn: string
  /** Estimated value, where the mechanic supports a claim. */
  estimate?: string
  status: SignalStatus
}

export const OPPORTUNITIES: Opportunity[] = [
  {
    id: 'quick-wins',
    headline: '924 listings are within 2% of winning the BackBox',
    body: 'A price cut under 2% would win the BackBox on these listings. This is the fastest lever you have this week.',
    cta: 'Review quick wins',
    destination: 'Opportunities',
    basedOn: 'BackBox price gap, your active listings',
    estimate: 'Smallest price move for the largest visibility gain',
    status: 'real',
  },
  {
    id: 'backbox-boost',
    headline: '250 BackBoxes are not converting',
    body: 'You hold the BackBox on these listings but they are not selling, which usually means the price is above what the market will pay.',
    cta: 'Review pricing',
    destination: 'Opportunities',
    basedOn: 'BackBox status, sales over the last 30 days',
    status: 'real',
  },
  {
    id: 'sourcing',
    headline: '1,955 devices available to source from customers',
    body: 'Trade-in stock matching categories you already sell. Sellers active in trade-in retain better than those who are not.',
    cta: 'View sourcing',
    destination: 'Opportunities',
    basedOn: 'Your categories, trade-in availability',
    status: 'real',
  },
]

/* ------------------------------------------------------------------ *
 * Suppression rules for the opportunity feed
 * Copied from Shopify's published model. Without these, a feed becomes
 * a promo rail and sellers learn to skip it.
 * ------------------------------------------------------------------ */

export const FEED_RULES = {
  eligibility: 'Seller averages 10 or more orders per week over 6 months',
  cap: 'Maximum 3 shown per day',
  ttl: 'Each expires after 24 hours',
  dismissal: 'Dismissible, with an optional reason',
} as const

/* ------------------------------------------------------------------ *
 * Shortcuts
 * Recency and pinning beat static nav tiles, which duplicate the sidebar.
 * ------------------------------------------------------------------ */

export const SHORTCUTS = [
  { label: 'Orders to process', pinned: true },
  { label: 'Quick wins', pinned: true },
  { label: 'Weekly invoice', pinned: false },
  { label: 'Bulk price upload', pinned: false },
]

export const TOTALS = {
  ordersToProcess: 196,
  careTasks: 141,
  reviewScore: '4.8/5',
  reviewCount: '2,193',
}
