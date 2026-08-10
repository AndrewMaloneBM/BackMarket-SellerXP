<script setup lang="ts">
import type { TierStatusResponse, TierScenario } from '~/utils/mockTierApi'
import { tierLabel } from '~/utils/mockTierApi'

withDefaults(defineProps<{ seller: TierStatusResponse; scenario?: TierScenario; showFasterBanner?: boolean; showDeferredSummary?: boolean }>(), { showFasterBanner: true, showDeferredSummary: true })

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
  <div class="max-w-6xl">
    <div class="flex items-end justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-bm-text-hi">Payouts</h1>
        <p class="text-sm text-bm-text-mid mt-2">See what is available, what is scheduled, and what is temporarily held.</p>
      </div>
      <button type="button" class="prototype-hotspot text-sm font-semibold text-bm-text-hi underline underline-offset-2">Payout settings</button>
    </div>

    <div :class="['grid gap-6 mb-6', showDeferredSummary === false ? 'grid-cols-2' : 'grid-cols-3']">
      <div class="card p-6">
        <p class="text-xs text-bm-text-mid mb-2">Available to pay out</p>
        <p class="text-2xl font-bold text-bm-text-hi">€301,556</p>
        <p class="text-xs text-bm-text-low mt-2">Current wallet balance</p>
      </div>
      <div class="card p-6">
        <div class="flex items-center justify-between gap-3"><p class="text-xs text-bm-text-mid">Next payout</p><span class="text-xs font-semibold rounded-full bg-blue-50 text-blue-700 px-2 py-1">Scheduled</span></div>
        <p class="text-2xl font-bold text-bm-text-hi mt-2">€13,700</p>
        <p class="text-xs text-bm-text-low mt-2">12 Aug 2026</p>
      </div>
      <div v-if="showDeferredSummary !== false" class="card p-6">
        <div class="flex items-center justify-between gap-3"><p class="text-xs text-bm-text-mid">Deferred payout</p><span :class="['text-xs font-semibold rounded-full px-2 py-1', tierBadgeClass(seller.currentTier)]">{{ tierLabel(seller.currentTier) }}</span></div>
        <p class="text-2xl font-bold text-bm-text-hi mt-2">{{ formatEur(seller.currentDpEur) }}</p>
        <p class="text-xs text-bm-text-low mt-2">Temporarily held from Future Refunds</p>
      </div>
    </div>

    <div v-if="showFasterBanner !== false" class="rounded-bm border border-blue-200 bg-blue-50 p-5 mb-6 flex items-center justify-between gap-6">
      <div>
        <p class="text-sm font-semibold text-blue-900">Get paid sooner</p>
        <p class="text-sm text-blue-800 mt-1">Some payouts can arrive sooner through an external provider. The amount already paid is shown separately from what remains to be paid.</p>
      </div>
      <button type="button" class="prototype-hotspot whitespace-nowrap rounded-full bg-bm-text-hi text-white text-sm font-semibold px-4 py-2 hover:bg-gray-800">Learn more</button>
    </div>

    <div class="card p-6 mb-8">
      <div class="flex items-center justify-between mb-5"><div><h2 class="text-lg font-semibold text-bm-text-hi">Upcoming payouts</h2><p class="text-sm text-bm-text-mid mt-1">Scheduled and earlier payouts in one place.</p></div><button type="button" class="prototype-hotspot text-sm font-semibold text-bm-text-hi underline underline-offset-2">View payout history</button></div>
      <div class="overflow-hidden rounded-bm-sm border border-bm-border">
        <div class="grid grid-cols-[1.2fr_1.1fr_1fr_0.8fr] gap-4 bg-bm-gray-50 px-4 py-3 text-xs font-semibold text-bm-text-mid"><span>Payout date</span><span>Sales period</span><span>Amount</span><span>Status</span></div>
        <div class="grid grid-cols-[1.2fr_1.1fr_1fr_0.8fr] gap-4 items-center border-t border-bm-border px-4 py-4 text-sm"><span class="text-bm-text-mid">11 Aug 2026</span><span class="text-bm-text-mid">08 Aug - 10 Aug</span><span class="font-semibold text-bm-text-hi">€4,250</span><span class="text-xs font-semibold text-green-700">Paid faster</span></div>
        <div class="grid grid-cols-[1.2fr_1.1fr_1fr_0.8fr] gap-4 items-center border-t border-bm-border px-4 py-4 text-sm"><span class="text-bm-text-mid">12 Aug 2026</span><span class="text-bm-text-mid">29 Jul - 05 Aug</span><span class="font-semibold text-bm-text-hi">€13,700</span><span class="text-xs font-semibold text-blue-700">Scheduled</span></div>
        <div class="grid grid-cols-[1.2fr_1.1fr_1fr_0.8fr] gap-4 items-center border-t border-bm-border px-4 py-4 text-sm"><span class="text-bm-text-mid">19 Aug 2026</span><span class="text-bm-text-mid">05 Aug - 12 Aug</span><span class="font-semibold text-bm-text-hi">€14,350</span><span class="text-xs font-semibold text-blue-700">Scheduled</span></div>
      </div>
      <p class="text-xs text-bm-text-low mt-4">When a payout is paid sooner through an external provider, the amount already paid is shown separately from what remains to be paid.</p>
    </div>


  </div>
</template>
