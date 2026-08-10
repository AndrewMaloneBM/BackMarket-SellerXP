<script setup lang="ts">
import type { TierStatusResponse } from '~/utils/mockTierApi'

const props = withDefaults(defineProps<{ seller: TierStatusResponse; showDeferredPanel?: boolean }>(), { showDeferredPanel: true })
const formatEur = (amount: number) => `€${amount.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`
</script>

<template>
  <div class="grid grid-cols-4 gap-6">
    <div :class="[props.showDeferredPanel ? 'col-span-3' : 'col-span-4', 'card p-6']">
      <h2 class="text-xl font-bold text-bm-text-hi mb-5">Your wallet</h2>
      <div class="grid grid-cols-2 gap-6">
        <div class="rounded-bm border border-indigo-100 bg-indigo-50 p-6 min-h-48">
          <p class="text-base font-semibold text-gray-900 mb-2">Your wallet balance</p>
          <p class="text-sm text-gray-500 mb-4">This is the amount you currently have in your Back Market wallet.</p>
          <div class="flex items-baseline justify-between rounded bg-white px-3 py-2"><span class="text-sm text-gray-500">€</span><span class="text-lg font-semibold text-gray-900">301,556.33</span></div>
        </div>
        <div class="rounded-bm border border-bm-gray-200 bg-white p-6 min-h-48">
          <p class="text-base font-semibold text-gray-900 mb-2">Upcoming payouts</p>
          <p class="text-sm text-gray-500 mb-5">The amount in your wallet will be split between 2 upcoming payouts.</p>
          <div class="space-y-3 text-sm text-gray-600">
            <div class="flex justify-between border-b border-bm-border pb-3"><span>12/08/2026</span><span>€137,982.86</span></div>
            <div class="flex justify-between"><span>19/08/2026</span><span>€163,663.47</span></div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="props.showDeferredPanel" class="bg-bm-surface rounded-bm p-6 min-h-48">
      <h2 class="text-base font-semibold text-bm-text-hi mb-3">Deferred payout</h2>
      <p class="text-sm text-bm-text-mid leading-5">This is the amount Back Market holds for issues that might happen with products under warranty, such as repairs or refunds.</p>
      <button type="button" class="prototype-hotspot mt-3 text-sm font-semibold text-bm-text-hi underline underline-offset-2">Read this article for more details</button>
      <div class="mt-5 rounded bg-bm-gray-100 px-3 py-2 text-sm text-bm-text-hi">{{ formatEur(props.seller.currentDpEur) }}</div>
    </div>
  </div>
</template>
