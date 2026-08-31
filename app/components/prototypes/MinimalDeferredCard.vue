<script setup lang="ts">
import type { TierStatusResponse, TierScenario } from '~/utils/mockTierApi'
import { tierLabel } from '~/utils/mockTierApi'
import RevIcon from '~/components/RevIcon.vue'

const props = defineProps<{ seller: TierStatusResponse; scenario?: TierScenario }>()
const drawerOpen = ref(false)
const drawerView = ref<'progress' | 'tiers'>('progress')
const formatEur = (amount: number) => `€${amount.toLocaleString('en-GB', { maximumFractionDigits: 0 })}`
const formatDate = (date: string) => new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const formatDateOrdinal = (date: string) => {
  const d = new Date(date)
  const day = d.getDate()
  const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th'
  return `${day}${suffix} ${d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`
}
const formatDateRange = (entries: { date: string }[], index: number) => {
  const start = formatDateOrdinal(entries[index].date)
  if (index === 0) return `${start} - present`
  return `${start} - ${formatDateOrdinal(entries[index - 1].date)}`
}
const tierBadgeClass = (tier: number): string => ({
  1: 'bg-gray-200 text-gray-700',
  2: 'bg-amber-100 text-amber-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-lime-100 text-lime-700',
  5: 'bg-green-100 text-green-700',
  6: 'bg-emerald-100 text-emerald-700',
}[tier] ?? 'bg-gray-200 text-gray-700')
const gapStatusColor = (status: string): string => status === 'met' ? 'text-bm-green-700' : status === 'close' ? 'text-amber-700' : 'text-red-700'
const gapStatusLabel = (status: string): string => status === 'met' ? 'On track' : status === 'close' ? 'Almost there' : 'Needs attention'
const metricHelp: Record<string, { label: string; href: string }> = {
  defective_rate: { label: 'How to reduce your defective rate', href: '#' },
  refund_rate: { label: 'How to lower your refund rate', href: '#' },
  oow_rate: { label: 'How to improve OOW declarations', href: '#' },
  wrong_product_rate: { label: 'How to avoid wrong product listings', href: '#' },
  gmv: { label: 'How to grow your GMV', href: '#' },
  seniority: { label: 'How seller seniority works', href: '#' },
}
// Metrics where a higher value is better use "more than" / "over" phrasing.
// All other metrics (rates) use "less than" phrasing.
const HIGHER_IS_BETTER = new Set(['gmv', 'seniority'])
const formatCurrentValue = (metric: { unit: string; current: number | boolean }) => {
  if (metric.unit === 'eur') return formatEur(Number(metric.current))
  if (metric.unit === 'months') return `${metric.current} months`
  return `${metric.current}%`
}
const formatRequiredCopy = (metric: { key: string; unit: string; required: number | boolean }) => {
  const higherIsBetter = HIGHER_IS_BETTER.has(metric.key)
  if (metric.unit === 'eur') return `${higherIsBetter ? 'more than' : 'less than'} ${formatEur(Number(metric.required))}`
  if (metric.unit === 'months') return `${higherIsBetter ? 'over' : 'less than'} ${metric.required} months`
  return `less than ${metric.required}%`
}
const historyIcon = (history: { fromTier: number | null; toTier: number }): string | null => {
  if (history.fromTier === null) return null // dash, rendered as plain text
  if (history.toTier > history.fromTier) return 'IconArrowUpRight'
  if (history.toTier < history.fromTier) return 'IconArrowDownRight'
  return null
}
const formatEuropean = (amount: number) => amount.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
// Deferred payout GBP/SEK are independent reference amounts (not derived from the EUR
// figure, since refund/warranty exposure differs by currency). EUR stays tied to the
// seller's real tier-driven amount so it updates with the scenario.
const deferredBalances = computed(() => [
  { symbol: '€', amount: formatEuropean(props.seller.currentDpEur) },
  { symbol: '£', amount: '977,00' },
  { symbol: 'kr', amount: '13.254,00' },
])
const allTiers = [
  { name: 'Tier 1', policy: '100%' },
  { name: 'Tier 2', policy: '75%' },
  { name: 'Tier 3', policy: '50%' },
  { name: 'Tier 4', policy: '25%' },
  { name: 'Tier 5', policy: '10%' },
  { name: 'Tier 6', policy: '0%' },
]
</script>

<template>
  <section id="concept-1-deferred-card" class="card p-6 scroll-mt-6">
    <div class="flex items-center gap-2 mb-2">
      <h2 class="text-base font-semibold text-bm-text-hi">Deferred payout</h2>
      <span :class="['text-xs font-semibold rounded-full px-2.5 py-1', tierBadgeClass(seller.currentTier)]">{{ tierLabel(seller.currentTier) }}</span>
    </div>
    <p class="text-sm text-bm-text-mid mb-4">Money held in your wallet to cover refunds, warranties, and other seller obligations. <a href="#" class="prototype-hotspot text-bm-text-hi underline underline-offset-2">Learn more</a></p>
    <p class="text-sm text-bm-text-mid mb-4">{{ seller.depositPolicyPct }}% of future refunds is currently held</p>
    <div class="flex flex-col gap-3 mb-5">
      <div v-for="balance in deferredBalances" :key="balance.symbol" class="flex items-baseline justify-between rounded bg-bm-gray-100 px-3 py-2.5">
        <span class="text-sm text-bm-text-low">{{ balance.symbol }}</span>
        <span class="text-lg font-semibold text-bm-text-hi">{{ balance.amount }}</span>
      </div>
    </div>
    <button type="button" class="prototype-hotspot w-full text-center text-sm font-semibold text-bm-text-hi border border-bm-border rounded-bm px-4 py-2.5 hover:bg-bm-gray-50" @click="drawerOpen = true; drawerView = 'progress'">Show details</button>
  </section>

  <Teleport to="body">
    <div v-if="drawerOpen" class="fixed inset-0 z-50 flex justify-end bg-black/30" role="presentation" @click.self="drawerOpen = false">
      <aside class="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="minimal-tier-drawer-title">
        <div class="sticky top-0 flex items-center justify-center border-b border-bm-border bg-white px-6 py-5">
          <h2 id="minimal-tier-drawer-title" class="text-xl font-bold text-bm-text-hi">Tier details</h2>
          <button type="button" class="absolute right-6 flex h-8 w-8 items-center justify-center rounded-full text-bm-text-mid hover:bg-bm-gray-100 hover:text-bm-text-hi" aria-label="Close tier details" @click="drawerOpen = false">
            <RevIcon name="IconCross" class="h-4 w-4" />
          </button>
        </div>

        <div class="p-6">
          <div v-if="drawerView === 'progress'">
            <div class="mb-8">
              <h3 class="text-xl font-bold text-bm-text-hi">Path to the next tier</h3>
              <p class="text-sm text-bm-text-low mt-1">This information is reviewed every week</p>

              <div class="grid grid-cols-2 gap-4 mt-5">
                <div v-for="metric in seller.gapToNextTier" :key="metric.key" class="rounded-bm border border-bm-border bg-white p-5">
                  <p class="text-sm text-bm-text-hi mb-3">{{ metric.label }}</p>
                  <p :class="['text-3xl font-bold mb-2', gapStatusColor(metric.status)]">{{ formatCurrentValue(metric) }}</p>
                  <p class="text-xs text-bm-text-mid"><span class="font-semibold text-bm-text-hi">Required:</span> {{ formatRequiredCopy(metric) }}</p>
                  <a v-if="metric.status !== 'met' && metricHelp[metric.key]" :href="metricHelp[metric.key].href" class="prototype-hotspot mt-2 inline-block text-xs font-medium text-bm-text-low underline underline-offset-2 hover:text-bm-text-hi">{{ metricHelp[metric.key].label }}</a>
                </div>
                <div v-if="seller.gapToNextTier.length === 0" class="col-span-2 rounded-bm border border-bm-green-200 bg-bm-green-50 p-5 text-sm text-bm-green-700">There are no further tier requirements.</div>
              </div>

              <div v-if="seller.gapToNextTier.some(m => m.status !== 'met')" class="mt-4 rounded-bm-sm bg-bm-gray-50 border border-bm-border p-4">
                <p class="text-sm font-semibold text-bm-text-hi mb-2">Need help improving?</p>
                <p class="text-xs text-bm-text-mid mb-3">These resources can help you reach the next tier and release more cash from your Future Refunds.</p>
                <div class="flex flex-col gap-1.5">
                  <a href="#" class="prototype-hotspot text-xs font-medium text-bm-success underline underline-offset-2">Quality improvement guide</a>
                  <a href="#" class="prototype-hotspot text-xs font-medium text-bm-success underline underline-offset-2">Shipping best practices</a>
                  <a href="#" class="prototype-hotspot text-xs font-medium text-bm-success underline underline-offset-2">Contact seller support</a>
                </div>
              </div>
            </div>

            <div class="mb-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-xl font-bold text-bm-text-hi">Tier history</h3>
                <button type="button" class="prototype-hotspot text-sm font-semibold text-bm-text-hi underline underline-offset-2" @click="drawerView = 'tiers'">How tiers work</button>
              </div>
              <div class="flex flex-col gap-3">
                <div v-for="(history, index) in seller.tierHistory" :key="index" class="flex items-center justify-between gap-4 rounded-bm border border-bm-border bg-white px-5 py-4">
                  <div class="flex items-center gap-4">
                    <RevIcon v-if="historyIcon(history)" :name="historyIcon(history)!" class="h-4 w-4 text-bm-text-low shrink-0" />
                    <span v-else class="text-bm-text-low">—</span>
                    <div>
                      <p class="text-xs text-bm-text-low">{{ formatDateRange(seller.tierHistory, index) }}</p>
                      <p class="text-sm font-semibold text-bm-text-hi mt-0.5">{{ tierLabel(history.toTier) }}{{ history.reason ? ` (${history.reason})` : '' }}</p>
                    </div>
                  </div>
                  <span v-if="history.toTier === seller.currentTier && seller.currentTier === 6" class="flex items-center gap-1 text-xs font-semibold rounded-full bg-bm-green-100 text-bm-green-800 px-3 py-1.5 whitespace-nowrap">
                    <RevIcon name="IconTrophy" class="h-3.5 w-3.5" /> Top tier
                  </span>
                  <span v-else-if="history.toTier === seller.currentTier" class="text-xs font-semibold rounded-full bg-bm-green-100 text-bm-green-800 px-3 py-1.5 whitespace-nowrap">Current tier</span>
                </div>
              </div>
            </div>
          </div>

          <div v-else>
            <button type="button" class="prototype-hotspot text-sm font-semibold text-bm-success underline underline-offset-2 mb-5" @click="drawerView = 'progress'">
              <RevIcon name="IconArrowLeft" class="mr-1 inline h-3.5 w-3.5" /> Back to your progress
            </button>
            <div class="rounded-bm border border-bm-border bg-bm-surface p-5 mb-5">
              <p class="text-sm font-semibold text-bm-text-hi">How tiers work</p>
              <p class="text-sm text-bm-text-mid mt-2">Your tier determines how much of your Future Refunds amount is held as deferred payout. A higher tier means less money is held.</p>
            </div>
            <div class="space-y-2">
              <div v-for="tier in allTiers" :key="tier.name" :class="['flex items-center justify-between rounded-bm-sm border px-4 py-3', tier.name === tierLabel(seller.currentTier) ? 'border-bm-green-300 bg-bm-green-50' : 'border-bm-border bg-white']">
                <span class="text-sm font-semibold text-bm-text-hi">
                  {{ tier.name }}
                  <span v-if="tier.name === tierLabel(seller.currentTier)" class="ml-2 text-xs font-medium text-bm-green-700">Your tier</span>
                </span>
                <span class="text-sm text-bm-text-mid">{{ tier.policy }} of Future Refunds held</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </Teleport>
</template>
