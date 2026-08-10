<script setup lang="ts">
import type { TierStatusResponse, TierScenario } from '~/utils/mockTierApi'
import { tierLabel } from '~/utils/mockTierApi'

defineProps<{ seller: TierStatusResponse; scenario?: TierScenario }>()

const formatEur = (amount: number) => `€${amount.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`
const tierBadgeClass = (tier: number): string => ({
  1: 'bg-gray-200 text-gray-700',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-lime-100 text-lime-700',
  5: 'bg-green-100 text-green-700',
  6: 'bg-emerald-100 text-emerald-700',
}[tier] ?? 'bg-gray-200 text-gray-700')
</script>

<template>
  <div id="concept-5-wallet" class="max-w-6xl">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-bm-text-hi">Your wallet</h1>
      <p class="text-sm text-bm-text-mid mt-2">See your balance, next payout, and deferred payout at a glance.</p>
    </div>

    <div class="card p-6 mb-4">
      <div class="flex items-end justify-between">
        <div><p class="text-sm font-semibold text-bm-text-hi">Your wallet balance</p><p class="text-sm text-bm-text-mid mt-2">The amount currently available in your Back Market wallet.</p></div>
        <p class="text-3xl font-bold text-bm-text-hi">€301,556.33</p>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <div class="card p-5">
        <div class="flex items-center justify-between gap-3"><p class="text-xs text-bm-text-mid">Next payout</p><span class="text-xs font-semibold rounded-full bg-green-50 text-green-700 px-2 py-1">BackFunds enabled</span></div>
        <p class="text-2xl font-bold text-bm-text-hi mt-2">€13,700</p>
        <p class="text-xs text-bm-text-low mt-2">12 Aug 2026 · Scheduled</p>
        <p class="text-xs text-bm-text-mid mt-3">Paid sooner through your payout provider.</p>
      </div>
      <div id="concept-5-deferred-payout" class="card p-5 scroll-mt-6">
        <div class="flex items-center justify-between gap-3"><p class="text-xs text-bm-text-mid">Deferred payout</p><span :class="['text-xs font-semibold rounded-full px-2 py-1', tierBadgeClass(seller.currentTier)]">{{ tierLabel(seller.currentTier) }}</span></div>
        <p class="text-2xl font-bold text-bm-text-hi mt-2">{{ formatEur(seller.currentDpEur) }}</p>
        <p class="text-xs text-bm-text-low mt-2">Currently held from Future Refunds</p>
        <p class="text-xs text-bm-text-mid mt-3">{{ seller.depositPolicyPct }}% of Future Refunds · Reviewed weekly</p>
      </div>
    </div>
  </div>
</template>
