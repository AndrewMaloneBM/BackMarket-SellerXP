<script setup lang="ts">
import type { TierStatusResponse, TierScenario } from '~/utils/mockTierApi'
import { tierLabel, categoryLabel } from '~/utils/mockTierApi'
import RevIcon from '~/components/RevIcon.vue'

const props = defineProps<{ seller: TierStatusResponse; scenario?: TierScenario }>()
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
const gapStatusIcon = (status: string): string => status === 'met' ? 'IconCheckSmall' : status === 'close' ? 'IconInfo' : 'IconWarning'
const gapStatusLabel = (status: string): string => status === 'met' ? 'Met' : status === 'close' ? 'Almost there' : 'Needs improvement'
const adjustmentProgress = computed(() => props.seller.adjustmentStatus === 'none' ? 100 : Math.max(20, Math.min(90, 100 - props.seller.weeksUntilComplete * 15)))
const nextTier = computed(() => props.seller.nextTier ? tierLabel(props.seller.nextTier) : 'the next tier')
</script>

<template>
  <div class="max-w-6xl">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-4"><h1 class="text-3xl font-bold text-bm-text-hi">Deferred payout</h1><span :class="['text-sm font-semibold rounded-full px-3 py-1', tierBadgeClass(seller.currentTier)]">{{ tierLabel(seller.currentTier) }}</span></div>
      <span class="text-xs text-bm-text-low">{{ categoryLabel(seller.primaryCategory) }}</span>
    </div>
    <div class="grid grid-cols-3 gap-6 mb-6">
      <div class="col-span-2 card p-6">
        <h2 class="text-base font-semibold text-bm-text-hi mb-3">Deferred payout</h2>
        <p class="text-sm text-bm-text-mid leading-5">This is the amount Back Market holds for issues that might happen with your products under warranty, such as repairs or refunds.</p>
        <button type="button" class="prototype-hotspot mt-3 text-sm font-semibold text-bm-text-hi underline underline-offset-2">Read this article for more details</button>
      </div>
      <div class="bg-bm-surface rounded-bm p-6">
        <p class="text-xs text-bm-text-mid mb-2">Current deferred payout amount</p>
        <p class="text-2xl font-bold text-bm-text-hi">{{ formatEur(seller.currentDpEur) }}</p>
        <p class="text-xs text-bm-text-low mt-2">{{ seller.depositPolicyPct }}% of Future Refunds</p>
      </div>
    </div>
    <p class="text-sm text-bm-text-mid mb-6 max-w-3xl">Your tier determines the deposit Back Market temporarily holds from your Future Refunds amount. A weekly review can change your tier and the amount held.</p>

    <div v-if="seller.upcomingChange?.direction === 'downgrade'" class="rounded-bm border border-amber-200 bg-amber-50 p-5 mb-6">
      <p class="text-sm font-semibold text-amber-900">Your deposit policy will change to {{ tierLabel(seller.upcomingChange.tier) }}</p>
      <p class="text-sm text-amber-800 mt-1">This change takes effect on {{ formatDate(seller.upcomingChange.effectiveDate) }}. We will collect the difference gradually so the change is predictable.</p>
      <button type="button" class="prototype-hotspot mt-3 text-sm font-semibold text-amber-900 underline underline-offset-2">Learn more about this change</button>
    </div>
    <div v-else-if="seller.adjustmentStatus === 'releasing'" class="rounded-bm border border-green-200 bg-green-50 p-5 mb-6">
      <div class="flex items-center justify-between mb-3"><p class="text-sm font-semibold text-green-900">Your deposit adjustment is in progress</p><p class="text-xs text-green-800">About {{ seller.weeksUntilComplete }} weeks left</p></div>
      <div class="h-2 bg-green-100 rounded-full overflow-hidden"><div class="h-full bg-bm-success rounded-full" :style="{ width: `${adjustmentProgress}%` }" /></div>
      <p class="text-xs text-green-800 mt-3">{{ formatEur(Math.abs(seller.currentDpEur - seller.targetDpEur)) }} will be released gradually. We release 10% of the adjustment each week.</p>
    </div>
    <div v-else-if="seller.nextTier && props.scenario === 'close-to-upgrade'" class="rounded-bm border border-blue-200 bg-blue-50 p-5 mb-6">
      <p class="text-sm font-semibold text-blue-900">You are close to {{ nextTier }}</p><p class="text-sm text-blue-800 mt-1">Review the metrics below to see what could help you reach the next tier.</p>
    </div>
    <div v-else-if="seller.currentTier === 6" class="rounded-bm border border-green-200 bg-green-50 p-5 mb-6">
      <p class="text-sm font-semibold text-green-900">You are at the highest tier</p><p class="text-sm text-green-800 mt-1">No deposit is currently held from your Future Refunds amount.</p>
    </div>

    <div class="grid grid-cols-3 gap-6 mb-6">
      <div class="card p-6"><p class="text-xs text-bm-text-mid mb-2">Future Refunds amount</p><p class="text-2xl font-bold text-bm-text-hi">{{ formatEur(seller.futureRefundsEur) }}</p><p class="text-xs text-bm-text-low mt-1">Predicted refund exposure on orders under warranty</p></div>
      <div class="card p-6"><p class="text-xs text-bm-text-mid mb-2">Target deferred payout amount</p><p class="text-2xl font-bold text-bm-text-hi">{{ formatEur(seller.targetDpEur) }}</p><p class="text-xs text-bm-text-low mt-1">{{ seller.depositPolicyPct }}% of Future Refunds</p></div>
      <div class="card p-6"><p class="text-xs text-bm-text-mid mb-2">Current deferred payout amount</p><p class="text-2xl font-bold text-bm-text-hi">{{ formatEur(seller.currentDpEur) }}</p><p class="text-xs text-bm-text-low mt-1">Current amount held as deposit</p></div>
    </div>

    <div class="card p-6 mb-6">
      <div class="flex items-center justify-between mb-4"><h2 class="text-base font-semibold text-bm-text-hi">Your path to {{ nextTier }}</h2><span class="text-xs text-bm-text-mid">Reviewed weekly</span></div>
      <div class="flex flex-col gap-2.5">
        <div v-for="metric in seller.gapToNextTier" :key="metric.key" :class="['flex items-center justify-between rounded-bm-sm border px-4 py-3', gapStatusStyle(metric.status)]">
          <div class="flex items-center gap-3"><span class="w-5 h-5 rounded-full bg-white border border-current flex items-center justify-center text-xs font-bold"><RevIcon :name="gapStatusIcon(metric.status)" class="h-3.5 w-3.5" /></span><div><p class="text-sm font-medium">{{ metric.label }}</p><p class="text-xs opacity-80">Current: {{ metric.unit === 'months' ? `${metric.current} months` : `${metric.current}%` }} · Required: {{ metric.unit === 'months' ? `${metric.required} months` : `≤ ${metric.required}%` }}</p></div></div>
          <span class="text-xs font-semibold whitespace-nowrap">{{ gapStatusLabel(metric.status) }}</span>
        </div>
        <div v-if="seller.gapToNextTier.length === 0" class="rounded-bm-sm bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">There are no further tier requirements.</div>
      </div>
    </div>

    <div class="card p-6">
      <div class="flex items-center justify-between mb-4"><h2 class="text-base font-semibold text-bm-text-hi">Your tier history</h2><span class="text-xs text-bm-text-low">Recent changes</span></div>
      <div class="flex flex-col"><div v-for="(history, index) in seller.tierHistory" :key="index" class="flex items-start gap-4"><div class="flex flex-col items-center"><span class="w-2.5 h-2.5 rounded-full bg-bm-success mt-1.5" /><span v-if="index < seller.tierHistory.length - 1" class="w-px flex-1 bg-bm-border" /></div><div class="pb-4"><p class="text-sm font-semibold text-bm-text-hi">{{ history.fromTier ? `${tierLabel(history.fromTier)} to ` : '' }}{{ tierLabel(history.toTier) }}</p><p class="text-xs text-bm-text-low mt-0.5">{{ formatDate(history.date) }} · {{ history.reason }}</p></div></div></div>
      <button type="button" class="prototype-hotspot mt-2 text-sm font-semibold text-bm-success underline underline-offset-2">Learn more about deferred payout</button>
    </div>
  </div>
</template>
