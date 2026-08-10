<script setup lang="ts">
import type { TierStatusResponse } from '~/utils/mockTierApi'
import { tierLabel } from '~/utils/mockTierApi'

defineProps<{ seller: TierStatusResponse; showDetailsLink?: boolean }>()
const emit = defineEmits<{ 'view-details': [] }>()
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
  <div class="bg-white rounded-bm border border-bm-border shadow-sm p-6">
    <div class="flex items-start justify-between gap-6">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <h2 class="text-lg font-semibold text-bm-text-hi">Your deferred payout</h2>
          <span :class="['text-xs font-semibold rounded-full px-2.5 py-1', tierBadgeClass(seller.currentTier)]">{{ tierLabel(seller.currentTier) }}</span>
        </div>
        <p class="text-sm text-bm-text-mid max-w-2xl">Your tier determines the deposit Back Market temporarily holds from your Future Refunds amount.</p>
      </div>
      <div class="text-right whitespace-nowrap">
        <p class="text-xs text-bm-text-low">Current deferred payout amount</p>
        <p class="text-2xl font-bold text-bm-text-hi">{{ formatEur(seller.currentDpEur) }}</p>
      </div>
    </div>
    <div class="grid grid-cols-3 gap-4 mt-5 border-t border-bm-border pt-5">
      <div><p class="text-xs text-bm-text-low">Deposit policy</p><p class="text-sm font-semibold text-bm-text-hi mt-1">{{ seller.depositPolicyPct }}% of Future Refunds</p></div>
      <div><p class="text-xs text-bm-text-low">Future Refunds amount</p><p class="text-sm font-semibold text-bm-text-hi mt-1">{{ formatEur(seller.futureRefundsEur) }}</p></div>
      <div><p class="text-xs text-bm-text-low">Next review</p><p class="text-sm font-semibold text-bm-text-hi mt-1">Weekly</p></div>
    </div>
    <div v-if="seller.adjustmentStatus !== 'none'" class="mt-5 rounded-bm-sm bg-green-50 border border-green-200 px-4 py-3">
      <p class="text-sm font-semibold text-green-800">Your deposit adjustment is in progress</p>
      <p class="text-xs text-green-700 mt-1">{{ formatEur(Math.abs(seller.currentDpEur - seller.targetDpEur)) }} will be {{ seller.adjustmentStatus === 'releasing' ? 'released' : 'collected' }} over approximately {{ seller.weeksUntilComplete }} weeks.</p>
    </div>
    <div v-else-if="seller.upcomingChange?.direction === 'downgrade'" class="mt-5 rounded-bm-sm bg-amber-50 border border-amber-200 px-4 py-3">
      <p class="text-sm font-semibold text-amber-800">Your deposit policy will change to {{ tierLabel(seller.upcomingChange.tier) }}</p>
      <p class="text-xs text-amber-700 mt-1">This change takes effect on {{ new Date(seller.upcomingChange.effectiveDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) }}. Review your tier details to understand what happens next.</p>
    </div>
    <button v-if="showDetailsLink !== false" type="button" class="prototype-hotspot mt-5 text-sm font-semibold text-bm-success underline underline-offset-2" @click="emit('view-details')">View deferred payout details →</button>
  </div>
</template>
