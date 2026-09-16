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
  window: string
  status: SignalStatus
  /** Signed change vs the comparison period. */
  deltaValue?: number
  /** 'pct' for volumes, 'pts' for rates. A rate change in % is ambiguous. */
  deltaUnit?: 'pct' | 'pts' | 'abs'
  /** Sentiment is set per metric, never derived from the sign. */
  increaseIsGood?: boolean
  comparison?: string
  /** Trailing series for the sparkline. Needs 7+ points to render. */
  series?: number[]
  /** Zero-baselined area fill: use for volume metrics. */
  sparkArea?: boolean
  /** Fixed scale: use for rate metrics so tiles stay comparable day to day. */
  sparkMin?: number
  sparkMax?: number
  sparkTone?: 'neutral' | 'critical' | 'warning'
}

const COMPARISON = 'previous 7 days'

export const METRICS: Metric[] = [
  {
    id: 'revenue', label: 'Revenue', value: '€289,601', window: 'Last 7 days', status: 'real',
    deltaValue: -25.2, deltaUnit: 'pct', increaseIsGood: true, comparison: COMPARISON,
    series: [387, 401, 372, 358, 341, 318, 296, 302, 289, 294, 276, 289], sparkArea: true,
  },
  {
    id: 'orders', label: 'Orders', value: '845', window: 'Last 7 days', status: 'real',
    deltaValue: -27, deltaUnit: 'pct', increaseIsGood: true, comparison: COMPARISON,
    series: [1163, 1140, 1098, 1041, 986, 934, 902, 878, 861, 852, 849, 845], sparkArea: true,
  },
  {
    id: 'refunds', label: 'Refunds', value: '€5,430', window: 'Last 7 days', status: 'real',
    // Refunds falling is good, so sentiment is inverted
    deltaValue: -61.3, deltaUnit: 'pct', increaseIsGood: false, comparison: COMPARISON,
    series: [14036, 12980, 11420, 10310, 9180, 8040, 7220, 6610, 6120, 5810, 5590, 5430], sparkArea: true,
  },
  {
    id: 'sell-through', label: 'Sell-through', value: '38%', window: 'Last 7 days', status: 'partial',
    deltaValue: 4, deltaUnit: 'pts', increaseIsGood: true, comparison: COMPARISON,
    // Rate metric: fixed scale so today is comparable to yesterday
    series: [31, 32, 30, 33, 34, 33, 35, 36, 35, 37, 37, 38], sparkMin: 0, sparkMax: 60,
  },
]

/** Additional slots a seller could swap in (Shopify's model: 4 slots, user-scoped). */
export const AVAILABLE_METRICS: Metric[] = [
  ...METRICS,
  {
    id: 'aov', label: 'Average order value', value: '€343', window: 'Last 7 days', status: 'partial',
    deltaValue: 2.1, deltaUnit: 'pct', increaseIsGood: true, comparison: COMPARISON,
    series: [329, 331, 336, 334, 338, 337, 340, 339, 342, 341, 344, 343], sparkMin: 250, sparkMax: 400,
  },
  {
    id: 'backbox', label: 'BackBox win rate', value: '61%', window: 'Last 7 days', status: 'real',
    deltaValue: -3, deltaUnit: 'pts', increaseIsGood: true, comparison: COMPARISON,
    series: [64, 65, 64, 63, 63, 62, 62, 61, 62, 61, 61, 61], sparkMin: 0, sparkMax: 100,
  },
  {
    id: 'cancellation', label: 'Cancellation rate', value: '4.2%', window: 'Last 7 days', status: 'real',
    deltaValue: 0.8, deltaUnit: 'pts', increaseIsGood: false, comparison: COMPARISON,
    series: [3.1, 3.2, 3.4, 3.3, 3.6, 3.7, 3.6, 3.9, 4.0, 4.1, 4.0, 4.2],
    sparkMin: 0, sparkMax: 6, sparkTone: 'warning',
  },
  {
    id: 'active-listings', label: 'Active listings', value: '2,418', window: 'Today', status: 'real',
    deltaValue: -64, deltaUnit: 'abs', increaseIsGood: true, comparison: 'last week',
    series: [2482, 2478, 2470, 2461, 2455, 2444, 2439, 2431, 2428, 2422, 2420, 2418], sparkArea: true,
  },
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

/* ------------------------------------------------------------------ *
 * Compliance limits, structured for the bullet-graph / limit-bar viz
 *
 * This is Few's named case: "the display of defects in a manufacturing
 * process, which we want to remain below some defined threshold".
 * Headroom is expressed in the seller's unit of action, borrowing
 * Datadog's SLO error-budget framing.
 * ------------------------------------------------------------------ */

export interface ComplianceLimit {
  id: string
  label: string
  value: number
  limit: number
  unit: string
  window: string
  lowerIsBetter: boolean
  /** Projected end-of-period value at the current rate. */
  projected?: number
  /** Remaining allowance, in something the seller can act on. */
  headroom?: string
  consequence: string
}

export const COMPLIANCE_LIMITS: ComplianceLimit[] = [
  {
    id: 'appearance',
    label: 'Appearance rate',
    value: 1.7, limit: 1.5, unit: '%', window: 'Last 30 days',
    lowerIsBetter: true,
    consequence: '7-day suspension at category level',
  },
  {
    id: 'defective',
    label: 'Defective rate',
    value: 4.1, limit: 5, unit: '%', window: 'Last 90 days',
    lowerIsBetter: true,
    // Projected past the limit: this is the state the number alone hides,
    // because 4.1% against a 5% limit looks fine right up until it isn't.
    projected: 5.2,
    headroom: 'About 12 more defects allowed this period',
    consequence: '30-day suspension at model level',
  },
  {
    id: 'cancellation',
    label: 'Cancellation rate',
    value: 4.2, limit: 6, unit: '%', window: 'Last 7 days',
    lowerIsBetter: true,
    headroom: 'About 15 more cancellations allowed',
    consequence: 'Suspension if it rises sharply',
  },
  {
    id: 'otd',
    label: 'On-time delivery',
    value: 94, limit: 90, unit: '%', window: 'Last 30 days',
    lowerIsBetter: false,
    headroom: '4 points of headroom',
    consequence: 'Listings suspended if in bottom 10%',
  },
]

/* ------------------------------------------------------------------ *
 * Queue shape, for glanceable exception visualisation
 *
 * Layer 1: counts on a shared length scale, so "which is worst" is a
 *          pop-out judgement rather than three separate reads.
 * Layer 2: ageing profile as binned bars, answering "and how late?"
 *          on a quantity axis rather than a time axis.
 * Layer 3: one named worst case as the escape hatch to action.
 * ------------------------------------------------------------------ */

export const QUEUE_SHAPE = [
  { id: 'past-ship-by', label: 'Orders past ship-by', value: 11, note: 'oldest 6 days', breach: true },
  { id: 'late-messages', label: 'Messages over 24h', value: 7, note: 'oldest 26 hours', breach: true },
  { id: 'blocked-listings', label: 'Listings blocked', value: 4, note: 'oldest 3 days' },
  { id: 'open-claims', label: 'Open claims', value: 3, note: 'oldest 2 days' },
]

/** Bins carry SLA meaning. The breach bin is marked, not just coloured. */
export const LATENESS_BINS = [
  { id: 'b1', label: '1 day late', value: 6 },
  { id: 'b2', label: '2 to 3 days', value: 3 },
  { id: 'b3', label: '4 to 7 days', value: 2, breach: true },
  { id: 'b4', label: '8 days or more', value: 0, breach: true },
]

export const WORST_CASE = {
  reference: 'BM-48213',
  detail: '6 days past ship-by',
  value: '€1,284',
}

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
