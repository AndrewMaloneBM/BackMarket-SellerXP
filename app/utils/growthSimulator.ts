// BackFunds Growth Simulator engine — implements the authoritative 8-step model
// from the Phase 1 PRD (June 2 2026). Pure functions, no Vue.
//
// Two deliberate departures from the raw PRD, agreed for credibility:
//   - REINVESTMENT_FRACTION dampens the PRD's 100%-reinvestment assumption.
//     Set it to 1.0 to reproduce the PRD's worked example exactly.
//   - workingCapitalFreed is surfaced as a tangible secondary metric.

export const BM_PAYOUT_DELAY = 7        // days BM takes to pay (weekly cycle baseline)
export const ACCEL_PAYOUT_DELAY = 1     // D+1 once BackFunds is active
export const REINVESTMENT_FRACTION = 0.7
export const DEFAULT_INVENTORY_CYCLE = 7
export const DEFAULT_GROSS_MARGIN = 0.40

export interface Provider {
  id: string
  name: string
  advanceRate: number        // decimal, e.g. 0.80
  feeRate: number            // effective annual rate, decimal, e.g. 0.008
  currencies: string[]
  financesDeposit: boolean
  minAnnualRevenue: number   // eligibility floor (EUR)
}

// Terms per the PRD's Growth Simulator inputs (effective annual fee rates,
// not the daily contractual rates from the detailed @BFF tool).
export const PROVIDERS: Provider[] = [
  { id: 'storfund', name: 'Storfund', advanceRate: 0.80, feeRate: 0.0080, currencies: ['EUR', 'GBP', 'USD', 'CAD'], financesDeposit: true, minAnnualRevenue: 240_000 },
  { id: 'unloq', name: 'Unloq', advanceRate: 0.80, feeRate: 0.0075, currencies: ['EUR', 'GBP'], financesDeposit: true, minAnnualRevenue: 1_200_000 },
  { id: 'hero', name: 'Hero', advanceRate: 0.70, feeRate: 0.0100, currencies: ['EUR'], financesDeposit: false, minAnnualRevenue: 240_000 },
]

export interface Assumptions {
  inventoryCycleDays: number
  grossMargin: number        // decimal
}

export interface SimResult {
  currentCashCycle: number
  acceleratedCashCycle: number
  rawMultiplier: number
  effectiveMultiplier: number
  acceleratedRevenue: number
  financingFee: number
  incrementalProfit: number
  roi: number
  workingCapitalFreed: number
}

export function runSimulation(annualRevenue: number, provider: Provider, a: Assumptions): SimResult {
  const currentCashCycle = a.inventoryCycleDays + BM_PAYOUT_DELAY
  const acceleratedCashCycle =
    a.inventoryCycleDays + provider.advanceRate * ACCEL_PAYOUT_DELAY + (1 - provider.advanceRate) * BM_PAYOUT_DELAY

  const rawMultiplier = currentCashCycle / acceleratedCashCycle
  const effectiveMultiplier = 1 + REINVESTMENT_FRACTION * (rawMultiplier - 1)

  const acceleratedRevenue = annualRevenue * effectiveMultiplier
  const financingFee = acceleratedRevenue * provider.advanceRate * provider.feeRate

  const grossProfitStandard = annualRevenue * a.grossMargin
  const grossProfitAccelerated = acceleratedRevenue * a.grossMargin
  const netProfitAccelerated = grossProfitAccelerated - financingFee
  const incrementalProfit = netProfitAccelerated - grossProfitStandard

  const roi = financingFee > 0 ? incrementalProfit / financingFee : 0
  const workingCapitalFreed = provider.advanceRate * (annualRevenue / 365) * (BM_PAYOUT_DELAY - ACCEL_PAYOUT_DELAY)

  return {
    currentCashCycle,
    acceleratedCashCycle,
    rawMultiplier,
    effectiveMultiplier,
    acceleratedRevenue,
    financingFee,
    incrementalProfit,
    roi,
    workingCapitalFreed,
  }
}

export function eligibleProviders(currency: string, annualRevenue: number): Provider[] {
  return PROVIDERS.filter((p) => p.currencies.includes(currency) && annualRevenue >= p.minAnnualRevenue)
}

export interface Recommendation {
  provider: Provider
  sim: SimResult
}

// Swap this comparator to rank by best net outcome instead of lowest fee:
//   (x, y) => y.sim.incrementalProfit - x.sim.incrementalProfit
const cheapestFirst = (x: Recommendation, y: Recommendation) => x.sim.financingFee - y.sim.financingFee

export function pickRecommendedProvider(
  annualRevenue: number,
  currency: string,
  a: Assumptions,
): Recommendation | null {
  const eligible = eligibleProviders(currency, annualRevenue)
  if (!eligible.length) return null

  const ranked = eligible.map((provider) => ({ provider, sim: runSimulation(annualRevenue, provider, a) }))
  ranked.sort(cheapestFirst)
  return ranked[0]
}
