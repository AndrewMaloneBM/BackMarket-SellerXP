// Mock for PRD Feature 1.3:
//   GET /api/v1/sellers/{seller_id}/tier-status
// Shape follows the PRD example response. Values come from the PRD's 6-tier
// tables and threshold matrix (Indicators & Related Thresholds, Apr 2026 review).

export type ProductCategory = 'smartphone' | 'laptop' | 'other'

export interface TierPolicy {
  tier: number
  depositPolicyPct: number // % of Future Refunds retained as deposit
}

export const TIER_POLICIES: readonly TierPolicy[] = [
  { tier: 1, depositPolicyPct: 100 },
  { tier: 2, depositPolicyPct: 75 },
  { tier: 3, depositPolicyPct: 50 },
  { tier: 4, depositPolicyPct: 25 },
  { tier: 5, depositPolicyPct: 10 },
  { tier: 6, depositPolicyPct: 0 },
]

// Thresholds are per primary product category. Tier 1 is a catch-all:
// any seller not meeting Tier 2 conditions.
export interface TierThresholds {
  tier: number
  defectiveRatePct: Record<ProductCategory, number>
  refundRatePct: Record<ProductCategory, number>
  oowRatePct: number
  wrongProductRatePct: number
  kybUpdated: boolean
  vatNumber: boolean
  seniorityMonths: number
}

export const THRESHOLD_MATRIX: readonly TierThresholds[] = [
  { tier: 2, defectiveRatePct: { smartphone: 8, laptop: 9, other: 8.5 }, refundRatePct: { smartphone: 13, laptop: 14, other: 13.5 }, oowRatePct: 12, wrongProductRatePct: 1.5, kybUpdated: true, vatNumber: true, seniorityMonths: 3 },
  { tier: 3, defectiveRatePct: { smartphone: 6.5, laptop: 7.5, other: 7 }, refundRatePct: { smartphone: 11, laptop: 12, other: 11.5 }, oowRatePct: 10, wrongProductRatePct: 1, kybUpdated: true, vatNumber: true, seniorityMonths: 6 },
  { tier: 4, defectiveRatePct: { smartphone: 5, laptop: 6, other: 5.5 }, refundRatePct: { smartphone: 9, laptop: 10, other: 9.5 }, oowRatePct: 8, wrongProductRatePct: 0.5, kybUpdated: true, vatNumber: true, seniorityMonths: 6 },
  { tier: 5, defectiveRatePct: { smartphone: 3, laptop: 4, other: 4 }, refundRatePct: { smartphone: 6, laptop: 8, other: 7.5 }, oowRatePct: 6, wrongProductRatePct: 0.3, kybUpdated: true, vatNumber: true, seniorityMonths: 6 },
  // NOTE: PRD lists Tier 6 thresholds identical to Tier 4 - likely a typo. Flagged as an open question.
  { tier: 6, defectiveRatePct: { smartphone: 5, laptop: 6, other: 5.5 }, refundRatePct: { smartphone: 9, laptop: 10, other: 9.5 }, oowRatePct: 8, wrongProductRatePct: 0.5, kybUpdated: true, vatNumber: true, seniorityMonths: 6 },
]

export type AdjustmentStatus = 'none' | 'releasing' | 'collecting'
export type MetricStatus = 'met' | 'close' | 'needs_improvement'

export interface TierMetricGap {
  key: string
  label: string
  unit: '%' | 'months' | 'boolean'
  current: number | boolean
  required: number | boolean
  gap?: number // absolute distance from requirement (negative = improvement needed)
  status: MetricStatus
}

export interface UpcomingChange {
  direction: 'upgrade' | 'downgrade'
  tier: number
  effectiveDate: string
}

export interface TierHistoryEntry {
  date: string
  fromTier: number | null
  toTier: number
  reason: string
}

export interface TierStatusResponse {
  sellerId: string
  sellerName: string
  primaryCategory: ProductCategory
  currentTier: number
  depositPolicyPct: number
  futureRefundsEur: number
  targetDpEur: number
  currentDpEur: number
  adjustmentStatus: AdjustmentStatus
  weeksUntilComplete: number
  nextTier: number | null
  upcomingChange: UpcomingChange | null
  gapToNextTier: TierMetricGap[]
  tierHistory: TierHistoryEntry[]
}

export type TierScenario = 'upgrade-in-progress' | 'close-to-upgrade' | 'downgrade-notice' | 'top-tier' | 'stable'

function pct(n: number): number { return Math.round(n * 100) / 100 }

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  smartphone: 'Smartphone / Tablet / Apple Watch',
  laptop: 'Laptop / MacBook',
  other: 'Other categories',
}

const TIER_LABEL: Record<number, string> = {
  1: 'Tier 1',
  2: 'Tier 2',
  3: 'Tier 3',
  4: 'Tier 4',
  5: 'Tier 5',
  6: 'Tier 6',
}

export const tierLabel = (tier: number) => TIER_LABEL[tier] ?? `Tier ${tier}`
export const categoryLabel = (c: ProductCategory) => CATEGORY_LABEL[c]

// The PRD's mid-performing smartphone seller (defective 5.8%, refund 11.2%,
// monthly GMV €68K, FR €34K) is the base persona for the upgrade scenarios.
function scenarioUpgradeInProgress(): TierStatusResponse {
  const futureRefunds = 34000
  const targetDp = 25500 // Tier 2 = 75% of FR
  const currentDp = 28900 // Amount above target is being released gradually
  return {
    sellerId: 'TechRenew-EU-001',
    sellerName: 'TechRenew GmbH',
    primaryCategory: 'smartphone',
    currentTier: 2,
    depositPolicyPct: 75,
    futureRefundsEur: futureRefunds,
    targetDpEur: targetDp,
    currentDpEur: currentDp,
    adjustmentStatus: 'releasing',
    weeksUntilComplete: 2,
    nextTier: 3,
    upcomingChange: null,
    gapToNextTier: [
      { key: 'defective_rate', label: 'Defective rate', unit: '%', current: 5.8, required: 6.5, status: 'met' },
      { key: 'refund_rate', label: 'Refund rate', unit: '%', current: 11.2, required: 11, gap: 0.2, status: 'close' },
      { key: 'oow_rate', label: 'OOW declaration rate', unit: '%', current: 9.0, required: 10, status: 'met' },
      { key: 'wrong_product_rate', label: 'Wrong product rate', unit: '%', current: 0.4, required: 1, status: 'met' },
      { key: 'seniority', label: 'Seller seniority', unit: 'months', current: 5, required: 6, gap: 1, status: 'close' },
    ],
    tierHistory: [
      { date: '2026-05-01', fromTier: 1, toTier: 2, reason: 'Met Tier 2 thresholds: defective rate, refund rate, seniority' },
      { date: '2026-01-15', fromTier: null, toTier: 1, reason: 'Onboarded to Back Market' },
    ],
  }
}

function scenarioCloseToUpgrade(): TierStatusResponse {
  const futureRefunds = 24000
  return {
    sellerId: 'TechRenew-EU-001',
    sellerName: 'TechRenew GmbH',
    primaryCategory: 'smartphone',
    currentTier: 1,
    depositPolicyPct: 100,
    futureRefundsEur: futureRefunds,
    targetDpEur: 24000,
    currentDpEur: 24000,
    adjustmentStatus: 'none',
    weeksUntilComplete: 0,
    nextTier: 2,
    upcomingChange: null,
    gapToNextTier: [
      { key: 'defective_rate', label: 'Defective rate', unit: '%', current: 8.3, required: 8, gap: 0.3, status: 'close' },
      { key: 'refund_rate', label: 'Refund rate', unit: '%', current: 12.5, required: 13, status: 'met' },
      { key: 'oow_rate', label: 'OOW declaration rate', unit: '%', current: 10.8, required: 12, status: 'met' },
      { key: 'wrong_product_rate', label: 'Wrong product rate', unit: '%', current: 1.6, required: 1.5, gap: 0.1, status: 'close' },
      { key: 'seniority', label: 'Seller seniority', unit: 'months', current: 2.5, required: 3, gap: 0.5, status: 'close' },
    ],
    tierHistory: [
      { date: '2026-02-15', fromTier: null, toTier: 1, reason: 'Onboarded to Back Market' },
    ],
  }
}

function scenarioDowngradeNotice(): TierStatusResponse {
  const futureRefunds = 30000
  const currentDp = 15450 // Tier 3 = 50% of FR; collection toward Tier 2 target starts in 1 week
  return {
    sellerId: 'TechRenew-EU-001',
    sellerName: 'TechRenew GmbH',
    primaryCategory: 'smartphone',
    currentTier: 3,
    depositPolicyPct: 50,
    futureRefundsEur: futureRefunds,
    targetDpEur: 15000,
    currentDpEur: currentDp,
    adjustmentStatus: 'none',
    weeksUntilComplete: 0,
    nextTier: 4,
    upcomingChange: {
      direction: 'downgrade',
      tier: 2,
      effectiveDate: '2026-08-14',
    },
    gapToNextTier: [
      { key: 'defective_rate', label: 'Defective rate', unit: '%', current: 8.9, required: 5, gap: 3.9, status: 'needs_improvement' },
      { key: 'refund_rate', label: 'Refund rate', unit: '%', current: 12.0, required: 9, gap: 3, status: 'needs_improvement' },
      { key: 'oow_rate', label: 'OOW declaration rate', unit: '%', current: 11.4, required: 8, gap: 3.4, status: 'needs_improvement' },
      { key: 'wrong_product_rate', label: 'Wrong product rate', unit: '%', current: 0.8, required: 0.5, gap: 0.3, status: 'needs_improvement' },
      { key: 'seniority', label: 'Seller seniority', unit: 'months', current: 14, required: 6, status: 'met' },
    ],
    tierHistory: [
      { date: '2026-06-15', fromTier: 4, toTier: 3, reason: 'Downgraded: defective rate above Tier 4 threshold' },
      { date: '2026-03-01', fromTier: 3, toTier: 4, reason: 'Met Tier 4 thresholds: refund rate, wrong product rate' },
      { date: '2025-12-01', fromTier: null, toTier: 3, reason: 'Onboarded to Back Market' },
    ],
  }
}

function scenarioTopTier(): TierStatusResponse {
  const futureRefunds = 18000
  return {
    sellerId: 'TechRenew-EU-001',
    sellerName: 'TechRenew GmbH',
    primaryCategory: 'smartphone',
    currentTier: 6,
    depositPolicyPct: 0,
    futureRefundsEur: futureRefunds,
    targetDpEur: 0,
    currentDpEur: 0,
    adjustmentStatus: 'none',
    weeksUntilComplete: 0,
    nextTier: null,
    upcomingChange: null,
    gapToNextTier: [],
    tierHistory: [
      { date: '2026-07-01', fromTier: 5, toTier: 6, reason: 'Met Tier 6 thresholds across all quality metrics' },
      { date: '2026-04-01', fromTier: 4, toTier: 5, reason: 'Met Tier 5 thresholds: defective rate, refund rate' },
    ],
  }
}

function scenarioStable(): TierStatusResponse {
  const futureRefunds = 28000
  return {
    sellerId: 'TechRenew-EU-001',
    sellerName: 'TechRenew GmbH',
    primaryCategory: 'smartphone',
    currentTier: 4,
    depositPolicyPct: 25,
    futureRefundsEur: futureRefunds,
    targetDpEur: 7000,
    currentDpEur: 7000,
    adjustmentStatus: 'none',
    weeksUntilComplete: 0,
    nextTier: 5,
    upcomingChange: null,
    gapToNextTier: [
      { key: 'defective_rate', label: 'Defective rate', unit: '%', current: 4.1, required: 3, gap: 1.1, status: 'close' },
      { key: 'refund_rate', label: 'Refund rate', unit: '%', current: 7.4, required: 6, gap: 1.4, status: 'close' },
      { key: 'oow_rate', label: 'OOW declaration rate', unit: '%', current: 5.2, required: 6, status: 'met' },
      { key: 'wrong_product_rate', label: 'Wrong product rate', unit: '%', current: 0.35, required: 0.3, gap: 0.05, status: 'close' },
      { key: 'seniority', label: 'Seller seniority', unit: 'months', current: 20, required: 6, status: 'met' },
    ],
    tierHistory: [
      { date: '2026-05-01', fromTier: 5, toTier: 4, reason: 'Met Tier 4 thresholds: defective rate, refund rate, OOW rate' },
      { date: '2026-02-01', fromTier: 3, toTier: 4, reason: 'Met Tier 4 thresholds across all quality metrics' },
    ],
  }
}

const SCENARIOS: Record<TierScenario, () => TierStatusResponse> = {
  'upgrade-in-progress': scenarioUpgradeInProgress,
  'close-to-upgrade': scenarioCloseToUpgrade,
  'downgrade-notice': scenarioDowngradeNotice,
  'top-tier': scenarioTopTier,
  'stable': scenarioStable,
}

// MOCK - switch the scenario to test different seller states:
//   upgrade-in-progress | close-to-upgrade | downgrade-notice | top-tier | stable
export const getSellerTierStatus = (_sellerId: string, scenario: TierScenario = 'upgrade-in-progress'): TierStatusResponse =>
  SCENARIOS[scenario]()
