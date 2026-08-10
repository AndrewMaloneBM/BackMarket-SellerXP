<script setup lang="ts">
import type { TierStatusResponse, TierScenario } from '~/utils/mockTierApi'
import { tierLabel } from '~/utils/mockTierApi'

defineProps<{ seller: TierStatusResponse; scenario?: TierScenario }>()
const drawerOpen = ref(false)

const formatEur = (amount: number) => `€${amount.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`
const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const tierBadgeClass = (tier: number): string => ({
  1: 'bg-gray-200 text-gray-700',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-lime-100 text-lime-700',
  5: 'bg-green-100 text-green-700',
  6: 'bg-emerald-100 text-emerald-700',
}[tier] ?? 'bg-gray-200 text-gray-700')
const gapStatusStyle = (status: string): string => status === 'met' ? 'text-green-700 bg-green-50 border-green-200' : status === 'close' ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-red-700 bg-red-50 border-red-200'
const gapStatusLabel = (status: string): string => status === 'met' ? 'Met' : status === 'close' ? 'Almost there' : 'Needs improvement'
</script>

<template>
  <section id="concept-5-deferred-details" class="card p-6 scroll-mt-6">
    <div class="flex items-start justify-between gap-6">
      <div><div class="flex items-center gap-3"><h2 class="text-lg font-semibold text-bm-text-hi">Deferred payout</h2><span :class="['text-xs font-semibold rounded-full px-2 py-1', tierBadgeClass(seller.currentTier)]">{{ tierLabel(seller.currentTier) }}</span></div><p class="text-sm text-bm-text-mid leading-5 mt-2 max-w-2xl">The amount temporarily held from your Future Refunds amount under your current tier.</p></div>
      <div class="text-right whitespace-nowrap"><p class="text-xs text-bm-text-mid">Current amount held</p><p class="text-2xl font-bold text-bm-text-hi mt-1">{{ formatEur(seller.currentDpEur) }}</p></div>
    </div>
    <div class="grid grid-cols-4 gap-4 mt-5 border-t border-bm-border pt-5"><div><p class="text-xs text-bm-text-mid">Deposit policy</p><p class="text-sm font-semibold text-bm-text-hi mt-1">{{ seller.depositPolicyPct }}%</p></div><div><p class="text-xs text-bm-text-mid">Future Refunds</p><p class="text-sm font-semibold text-bm-text-hi mt-1">{{ formatEur(seller.futureRefundsEur) }}</p></div><div><p class="text-xs text-bm-text-mid">Target amount</p><p class="text-sm font-semibold text-bm-text-hi mt-1">{{ formatEur(seller.targetDpEur) }}</p></div><div><p class="text-xs text-bm-text-mid">Review cadence</p><p class="text-sm font-semibold text-bm-text-hi mt-1">Weekly</p></div></div>
    <div v-if="seller.adjustmentStatus !== 'none'" class="mt-5 rounded-bm-sm bg-green-50 border border-green-200 px-4 py-3"><p class="text-sm font-semibold text-green-800">Your payout amount is being adjusted</p><p class="text-xs text-green-700 mt-1">The change will happen gradually over approximately {{ seller.weeksUntilComplete }} weeks.</p></div>
    <button type="button" class="prototype-hotspot mt-5 text-sm font-semibold text-bm-success underline underline-offset-2" @click="drawerOpen = true">Show your tier history</button>
  </section>

  <Teleport to="body">
    <div v-if="drawerOpen" class="fixed inset-0 z-50 flex justify-end bg-black/30" role="presentation" @click.self="drawerOpen = false">
      <aside class="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="tier-drawer-title">
        <div class="sticky top-0 flex items-center justify-between border-b border-bm-border bg-white px-6 py-5"><div><p class="text-xs font-semibold uppercase tracking-widest text-bm-text-low">Deferred payout</p><h2 id="tier-drawer-title" class="text-xl font-bold text-bm-text-hi mt-1">Tier progress and history</h2></div><button type="button" class="flex h-8 w-8 items-center justify-center rounded-full text-bm-text-mid hover:bg-bm-gray-100 hover:text-bm-text-hi" aria-label="Close tier history" @click="drawerOpen = false"><RevIcon name="IconCross" class="h-4 w-4" /></button></div>
        <div class="p-6">
          <div class="rounded-bm border border-bm-border bg-bm-gray-50 p-5 mb-6"><div class="flex items-center justify-between"><p class="text-sm font-semibold text-bm-text-hi">Path to {{ seller.nextTier ? tierLabel(seller.nextTier) : 'the highest tier' }}</p><span class="text-xs text-bm-text-mid">Reviewed weekly</span></div><div class="flex flex-col gap-2.5 mt-4"><div v-for="metric in seller.gapToNextTier" :key="metric.key" :class="['flex items-center justify-between rounded-bm-sm border px-3 py-2.5', gapStatusStyle(metric.status)]"><div><p class="text-sm font-medium">{{ metric.label }}</p><p class="text-xs opacity-80">Current {{ metric.current }} · Required {{ metric.required }}</p></div><span class="text-xs font-semibold">{{ gapStatusLabel(metric.status) }}</span></div><p v-if="seller.gapToNextTier.length === 0" class="text-sm text-green-800">There are no further tier requirements.</p></div></div>
          <div><div class="flex items-center justify-between mb-4"><h3 class="text-base font-semibold text-bm-text-hi">Tier history</h3><span class="text-xs text-bm-text-low">Recent changes</span></div><div class="flex flex-col"><div v-for="(history, index) in seller.tierHistory" :key="index" class="flex items-start gap-4"><div class="flex flex-col items-center"><span class="w-2.5 h-2.5 rounded-full bg-bm-success mt-1.5" /><span v-if="index < seller.tierHistory.length - 1" class="w-px flex-1 bg-bm-border" /></div><div class="pb-4"><p class="text-sm font-semibold text-bm-text-hi">{{ history.fromTier ? `${tierLabel(history.fromTier)} to ` : '' }}{{ tierLabel(history.toTier) }}</p><p class="text-xs text-bm-text-low mt-0.5">{{ formatDate(history.date) }} · {{ history.reason }}</p></div></div></div></div>
        </div>
      </aside>
    </div>
  </Teleport>
</template>
