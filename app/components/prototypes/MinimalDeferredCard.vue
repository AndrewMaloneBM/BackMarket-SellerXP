<script setup lang="ts">
import type { TierStatusResponse, TierScenario } from '~/utils/mockTierApi'
import { tierLabel } from '~/utils/mockTierApi'

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
const gapStatusStyle = (status: string): string => status === 'met' ? 'border-green-200 bg-green-50 text-green-800' : status === 'close' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-red-200 bg-red-50 text-red-800'
const gapStatusIcon = (status: string): string => status === 'met' ? '✓' : status === 'close' ? '≈' : '!'
const gapStatusLabel = (status: string): string => status === 'met' ? 'On track' : status === 'close' ? 'Almost there' : 'Needs attention'
</script>

<template>
  <section id="concept-1-deferred-card" class="bg-white rounded-bm border border-bm-border shadow-sm p-6 mt-6 scroll-mt-6">
    <div class="flex items-center justify-between gap-6"><div><p class="text-3xl font-bold text-bm-text-hi">{{ formatEur(seller.currentDpEur) }}</p><p class="text-sm text-bm-text-mid mt-2">Deferred payout</p></div><span :class="['text-xs font-semibold rounded-full px-2.5 py-1', tierBadgeClass(seller.currentTier)]">{{ tierLabel(seller.currentTier) }}</span></div>
    <div class="flex items-center justify-between gap-4 mt-5 border-t border-bm-border pt-4"><p class="text-xs text-bm-text-mid">{{ seller.depositPolicyPct }}% of Future Refunds is currently held</p><button type="button" class="prototype-hotspot text-sm font-semibold text-bm-success underline underline-offset-2" @click="drawerOpen = true; drawerView = 'progress'">Show tier details</button></div>
  </section>

  <Teleport to="body">
    <div v-if="drawerOpen" class="fixed inset-0 z-50 flex justify-end bg-black/30" role="presentation" @click.self="drawerOpen = false">
      <aside class="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="minimal-tier-drawer-title">
        <div class="sticky top-0 flex items-center justify-between border-b border-bm-border bg-[#F7F7F9] px-6 py-5"><div><p class="text-xs font-semibold uppercase tracking-widest text-bm-text-low">Deferred payout</p><h2 id="minimal-tier-drawer-title" class="text-xl font-bold text-bm-text-hi mt-1">Tier 3 path and history</h2></div><button type="button" class="text-2xl leading-none text-bm-text-mid hover:text-bm-text-hi" aria-label="Close tier details" @click="drawerOpen = false">×</button></div>
        <div class="p-6"><div v-if="drawerView === 'progress'"><div class="rounded-bm border border-green-200 bg-green-50 p-5 mb-5"><div class="flex items-center gap-3"><span class="flex h-8 w-8 items-center justify-center rounded-full bg-green-200 text-green-800 font-bold">✓</span><div><p class="text-sm font-semibold text-green-900">Your tier is reviewed every week</p><p class="text-xs text-green-800 mt-1">Keep improving the metrics below to reach the next tier.</p></div></div></div><div class="rounded-bm border border-bm-border bg-[#F7F7F9] p-5 mb-6"><div class="flex items-center justify-between"><p class="text-sm font-semibold text-bm-text-hi">Path to {{ seller.nextTier ? tierLabel(seller.nextTier) : 'the highest tier' }}</p><span class="text-xs text-bm-text-mid">Reviewed weekly</span></div><div class="flex flex-col gap-2.5 mt-4"><div v-for="metric in seller.gapToNextTier" :key="metric.key" :class="['flex items-center justify-between rounded-bm-sm border px-3 py-2.5 transition-colors', gapStatusStyle(metric.status)]"><div class="flex items-center gap-3"><span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/80 border border-current text-sm font-bold">{{ gapStatusIcon(metric.status) }}</span><div><p class="text-sm font-medium">{{ metric.label }}</p><p class="text-xs opacity-80">Current {{ metric.current }} · Required {{ metric.required }}</p></div></div><span class="text-xs font-semibold whitespace-nowrap">{{ gapStatusLabel(metric.status) }}</span></div><p v-if="seller.gapToNextTier.length === 0" class="text-sm text-green-800">There are no further tier requirements.</p></div></div><div><div class="flex items-center justify-between mb-4"><h3 class="text-base font-semibold text-bm-text-hi">Tier history</h3><span class="text-xs text-bm-text-low">Recent changes</span></div><div class="flex flex-col"><div v-for="(history, index) in seller.tierHistory" :key="index" class="flex items-start gap-4"><div class="flex flex-col items-center"><span class="w-2.5 h-2.5 rounded-full bg-bm-success mt-1.5" /><span v-if="index < seller.tierHistory.length - 1" class="w-px flex-1 bg-bm-border" /></div><div class="pb-4"><p class="text-sm font-semibold text-bm-text-hi">{{ history.fromTier ? `${tierLabel(history.fromTier)} to ` : '' }}{{ tierLabel(history.toTier) }}</p><p class="text-xs text-bm-text-low mt-0.5">{{ formatDate(history.date) }} · {{ history.reason }}</p></div></div></div></div><button type="button" class="prototype-hotspot text-sm font-semibold text-bm-success underline underline-offset-2" @click="drawerView = 'tiers'">How tiers work</button></div><div v-else><button type="button" class="prototype-hotspot text-sm font-semibold text-bm-success underline underline-offset-2 mb-5" @click="drawerView = 'progress'">← Back to your progress</button><div class="rounded-bm border border-blue-200 bg-blue-50 p-5 mb-5"><p class="text-sm font-semibold text-blue-900">How tiers work</p><p class="text-sm text-blue-800 mt-2">Your tier determines how much of your Future Refunds amount is held as deferred payout. A higher tier means less money is held.</p></div><div class="space-y-2"><div v-for="tier in [{ name: 'Tier 1', policy: '100%' }, { name: 'Tier 2', policy: '75%' }, { name: 'Tier 3', policy: '50%' }, { name: 'Tier 4', policy: '25%' }, { name: 'Tier 5', policy: '10%' }, { name: 'Tier 6', policy: '0%' }]" :key="tier.name" :class="['flex items-center justify-between rounded-bm-sm border px-4 py-3', tier.name === tierLabel(seller.currentTier) ? 'border-green-300 bg-green-50' : 'border-bm-border bg-white']"><span class="text-sm font-semibold text-bm-text-hi">{{ tier.name }}<span v-if="tier.name === tierLabel(seller.currentTier)" class="ml-2 text-xs font-medium text-green-700">Your tier</span></span><span class="text-sm text-bm-text-mid">{{ tier.policy }} of Future Refunds held</span></div></div></div></div>
      </aside>
    </div>
  </Teleport>
</template>
