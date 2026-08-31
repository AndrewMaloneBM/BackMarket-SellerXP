<script setup lang="ts">
import type { TierStatusResponse } from '~/utils/mockTierApi'
import RevIcon from '~/components/RevIcon.vue'

defineProps<{ seller: TierStatusResponse }>()

const walletBalances = [
  { symbol: '€', amount: '183.937,00' },
  { symbol: '£', amount: '12.577,00' },
  { symbol: 'kr', amount: '138.254,00' },
]

const upcomingPayouts = [
  { payoutDate: '16/11/2026', periodStart: '12/08/2026', periodEnd: '19/08/2026', eur: '94,193.00 €', gbp: '£ 7.563,00', sek: '73,236.00 SEK' },
  { payoutDate: '26/11/2026', periodStart: '19/08/2026', periodEnd: '26/08/2026', eur: '89,744.00 €', gbp: '£ 5.014,00', sek: '65,018.00 SEK' },
  { payoutDate: '05/12/2026', periodStart: '26/08/2026', periodEnd: '01/09/2026', eur: '85,120.00 €', gbp: '£ 4.892,00', sek: '62,150.00 SEK' },
  { payoutDate: '15/12/2026', periodStart: '01/09/2026', periodEnd: '08/09/2026', eur: '91,450.00 €', gbp: '£ 5.230,00', sek: '66,890.00 SEK' },
  { payoutDate: '26/12/2026', periodStart: '08/09/2026', periodEnd: '15/09/2026', eur: '78,325.00 €', gbp: '£ 4.510,00', sek: '57,200.00 SEK' },
]
</script>

<template>
  <div class="grid grid-cols-3 gap-6">
    <div class="col-span-1 flex flex-col gap-6">
      <div class="rounded-bm border border-indigo-100 bg-indigo-50 p-6">
        <p class="text-base font-semibold text-bm-text-hi mb-2">Your wallet balance</p>
        <p class="text-sm text-bm-text-mid mb-4">This is the amount you currently have in your Back Market wallet.</p>
        <div class="flex flex-col gap-3">
          <div v-for="balance in walletBalances" :key="balance.symbol" class="flex items-baseline justify-between rounded bg-white px-3 py-2.5">
            <span class="text-sm text-bm-text-low">{{ balance.symbol }}</span>
            <span class="text-lg font-semibold text-bm-text-hi">{{ balance.amount }}</span>
          </div>
        </div>
      </div>

      <slot name="deferred" />
    </div>

    <div class="col-span-2 card p-6">
      <h2 class="text-lg font-semibold text-bm-text-hi mb-1">Upcoming payouts</h2>
      <p class="text-sm text-bm-text-mid mb-5">The amount in your wallet will be split between {{ upcomingPayouts.length }} upcoming payouts.</p>
      <div class="overflow-hidden rounded-bm-sm border border-bm-border">
        <div class="grid grid-cols-[0.9fr_1.3fr_0.9fr_0.9fr_0.9fr_auto] gap-4 bg-bm-gray-50 px-4 py-3 text-xs font-semibold text-bm-text-mid">
          <span>Payout date</span>
          <span>Sales period</span>
          <span>Amount in €</span>
          <span>Amount in £</span>
          <span>Amount in SEK</span>
          <span></span>
        </div>
        <div v-for="payout in upcomingPayouts" :key="payout.payoutDate" class="grid grid-cols-[0.9fr_1.3fr_0.9fr_0.9fr_0.9fr_auto] gap-4 items-center border-t border-bm-border px-4 py-4 text-sm">
          <span class="text-bm-text-mid">{{ payout.payoutDate }}</span>
          <span class="text-bm-text-mid">{{ payout.periodStart }} - {{ payout.periodEnd }}</span>
          <span class="font-semibold text-bm-text-hi">{{ payout.eur }}</span>
          <span class="font-semibold text-bm-text-hi">{{ payout.gbp }}</span>
          <span class="font-semibold text-bm-text-hi">{{ payout.sek }}</span>
          <RevIcon name="IconInfo" class="h-4 w-4 text-bm-text-low justify-self-end" />
        </div>
      </div>
    </div>
  </div>
</template>
