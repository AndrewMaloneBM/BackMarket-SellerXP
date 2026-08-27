<script setup lang="ts">
import type { TierStatusResponse, TierScenario } from '~/utils/mockTierApi'
import { tierLabel } from '~/utils/mockTierApi'
import RevIcon from '~/components/RevIcon.vue'

defineProps<{ seller: TierStatusResponse; scenario?: TierScenario }>()
const drawerOpen = ref(false)
const drawerView = ref<'progress' | 'tiers'>('progress')
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
const gapStatusColor = (status: string): string => status === 'met' ? 'text-bm-green-700' : status === 'close' ? 'text-amber-700' : 'text-red-700'
const gapStatusDot = (status: string): string => status === 'met' ? 'bg-bm-green-500' : status === 'close' ? 'bg-amber-500' : 'bg-red-500'
const gapStatusLabel = (status: string): string => status === 'met' ? 'On track' : status === 'close' ? 'Almost there' : 'Needs attention'
const formatMetricValue = (metric: { unit: string; current: number | boolean; required: number | boolean }) => {
  if (metric.unit === 'eur') return { current: formatEur(Number(metric.current)), required: formatEur(Number(metric.required)) }
  if (metric.unit === 'months') return { current: `${metric.current} months`, required: `${metric.required} months` }
  return { current: `${metric.current}%`, required: `≤ ${metric.required}%` }
}
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
  <section id="concept-1-deferred-card" class="card p-6 mt-6 scroll-mt-6">
    <div class="flex items-center justify-between gap-6">
      <div>
        <p class="text-3xl font-bold text-bm-text-hi">{{ formatEur(seller.currentDpEur) }}</p>
        <p class="text-sm text-bm-text-mid mt-2">Deferred payout</p>
      </div>
      <span :class="['text-xs font-semibold rounded-full px-2.5 py-1', tierBadgeClass(seller.currentTier)]">{{ tierLabel(seller.currentTier) }}</span>
    </div>
    <div class="flex items-center justify-between gap-4 mt-5 border-t border-bm-border pt-4">
      <p class="text-xs text-bm-text-mid">{{ seller.depositPolicyPct }}% of Future Refunds is currently held</p>
      <button type="button" class="prototype-hotspot text-sm font-semibold text-bm-success underline underline-offset-2" @click="drawerOpen = true; drawerView = 'progress'">Show tier details</button>
    </div>
  </section>

  <Teleport to="body">
    <div v-if="drawerOpen" class="fixed inset-0 z-50 flex justify-end bg-black/30" role="presentation" @click.self="drawerOpen = false">
      <aside class="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="minimal-tier-drawer-title">
        <div class="sticky top-0 flex items-center justify-between border-b border-bm-border bg-white px-6 py-5">
          <h2 id="minimal-tier-drawer-title" class="text-xl font-bold text-bm-text-hi">{{ tierLabel(seller.currentTier) }} path and history</h2>
          <button type="button" class="flex h-8 w-8 items-center justify-center rounded-full text-bm-text-mid hover:bg-bm-gray-100 hover:text-bm-text-hi" aria-label="Close tier details" @click="drawerOpen = false">
            <RevIcon name="IconCross" class="h-4 w-4" />
          </button>
        </div>

        <div class="p-6">
          <div v-if="drawerView === 'progress'">
            <div class="mb-8">
              <p class="text-sm font-semibold text-bm-text-hi">Your tier is reviewed every week</p>
              <p class="text-sm text-bm-text-mid mt-1">Currently on {{ tierLabel(seller.currentTier) }}. Keep improving the metrics below to reach the next tier.</p>
            </div>

            <div class="mb-8">
              <div class="flex items-center justify-between mb-1">
                <h3 class="text-base font-semibold text-bm-text-hi">Path to the next tier</h3>
              </div>
              <p class="text-xs text-bm-text-low mb-4">This information is reviewed every week</p>
              <div class="overflow-hidden rounded-bm-sm border border-bm-border">
                <div class="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] gap-3 bg-bm-gray-50 px-4 py-3 text-xs font-semibold text-bm-text-mid">
                  <span>Metric</span>
                  <span>Required</span>
                  <span>Current</span>
                  <span>Status</span>
                </div>
                <div v-for="metric in seller.gapToNextTier" :key="metric.key" class="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] gap-3 items-center border-t border-bm-border px-4 py-3 text-sm">
                  <span class="text-bm-text-hi">{{ metric.label }}</span>
                  <span class="text-bm-text-mid">{{ formatMetricValue(metric).required }}</span>
                  <span :class="['font-semibold', gapStatusColor(metric.status)]">{{ formatMetricValue(metric).current }}</span>
                  <span :class="['flex items-center gap-1.5 text-xs font-semibold', gapStatusColor(metric.status)]">
                    <span :class="['w-1.5 h-1.5 rounded-full', gapStatusDot(metric.status)]" />
                    {{ gapStatusLabel(metric.status) }}
                  </span>
                </div>
                <div v-if="seller.gapToNextTier.length === 0" class="border-t border-bm-border px-4 py-3 text-sm text-bm-green-700">There are no further tier requirements.</div>
              </div>
            </div>

            <div class="mb-6">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-semibold text-bm-text-hi">Tier history</h3>
                <span class="text-xs text-bm-text-low">Recent changes</span>
              </div>
              <div class="flex flex-col">
                <div v-for="(history, index) in seller.tierHistory" :key="index" class="flex items-start gap-4">
                  <div class="flex flex-col items-center">
                    <span class="w-2.5 h-2.5 rounded-full bg-bm-success mt-1.5" />
                    <span v-if="index < seller.tierHistory.length - 1" class="w-px flex-1 bg-bm-border" />
                  </div>
                  <div class="pb-4">
                    <p class="text-sm font-semibold text-bm-text-hi">{{ history.fromTier ? `${tierLabel(history.fromTier)} to ` : '' }}{{ tierLabel(history.toTier) }}</p>
                    <p class="text-xs text-bm-text-low mt-0.5">{{ formatDate(history.date) }} · {{ history.reason }}</p>
                  </div>
                </div>
              </div>
            </div>

            <button type="button" class="prototype-hotspot text-sm font-semibold text-bm-success underline underline-offset-2" @click="drawerView = 'tiers'">How tiers work</button>
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
