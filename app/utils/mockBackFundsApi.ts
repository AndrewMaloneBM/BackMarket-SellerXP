// Matches applicationStatus enum from:
//   GET /v2/onboarding/marketplaces/{mp}/stores/{id}/exists
//   GET /v2/stores/{storeId}
export type ApplicationStatus =
  | 'pending'              // applied, KYB redirect in progress
  | 'registration_complete' // KYB submitted, awaiting Storfund review
  | 'under_review'         // Storfund reviewing (~1 week)
  | 'approved'             // approved, awaiting agreement signing
  | 'agreement_signed'     // signed, awaiting Storfund activation
  | 'complete'             // activation complete, pre-funding
  | 'active'               // live — check fundingStatus for current state
  | 'rejected'             // application rejected

// Matches channels[].store.fundingStatus in GET /v2/stores/{storeId}
export type FundingStatus = 'inactive' | 'active' | 'terminated'

export interface BackFundsSellerData {
  storeExists: boolean                    // false = status: "not_found" from exists endpoint
  applicationStatus: ApplicationStatus | null  // null when storeExists is false
  fundingStatus: FundingStatus | null          // null until applicationStatus is 'active'
  sellerName: string
  dailyFee: number         // matches channels[].store.dailyFee (e.g. 0.11 = 0.11% per day)
  advanceRate: number      // matches channels[].store.advanceRate (e.g. 80 = 80% of GMV)
  maxAdvance: number       // matches channels[].store.maxAdvance (EUR)
  currency: string
  estimatedMonthlyAdvance: number  // derived from sales data — used for UI display
  lastPayoutAmount: number         // most recent BM payout (for seller context)
  daysAccelerated: number          // e.g. 6 = D+7 → D+1
  annualRevenue: number            // SUM(GMV_EUR) last 12 months — drives the growth simulator
  payoutDelayDays: number          // BM's current payout baseline (days from sale to payment)
  currentDeposit: number           // deferred-payout / security deposit held by BM (EUR)
}

export const getSellerBackFundsData = (_sellerId: string): BackFundsSellerData => {
  // MOCK — change these values to test different UI states:
  //
  // Not yet applied:  storeExists: false, applicationStatus: null,        fundingStatus: null
  // KYB in progress:  storeExists: true,  applicationStatus: 'pending',   fundingStatus: null
  // Under review:     storeExists: true,  applicationStatus: 'under_review', fundingStatus: null
  // Active:           storeExists: true,  applicationStatus: 'active',    fundingStatus: 'active'
  // Paused:           storeExists: true,  applicationStatus: 'active',    fundingStatus: 'inactive'
  // Rejected:         storeExists: true,  applicationStatus: 'rejected',  fundingStatus: null

  return {
    storeExists: false,
    applicationStatus: null,
    fundingStatus: null,
    sellerName: 'TechRenew GmbH',
    dailyFee: 0.11,
    advanceRate: 80,
    maxAdvance: 50000,
    currency: 'EUR',
    estimatedMonthlyAdvance: 18740,
    lastPayoutAmount: 23425,
    daysAccelerated: 6,
    annualRevenue: 500000,
    payoutDelayDays: 7,
    currentDeposit: 0,
  }
}
