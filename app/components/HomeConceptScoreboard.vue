<script setup lang="ts">
import { SELLER_NAME, METRICS, QUALITY_KPIS, QUEUE_ITEMS } from '~/utils/mockHomeData'

/**
 * CONCEPT C: Scoreboard
 *
 * Bet: a direct answer to the documented complaint that "we display metrics
 * important to our business but they don't mean much to sellers" and that
 * "sellers care about turnover, sales and revenue rather than GMV".
 * Every metric here is in seller language, with the window in the label.
 *
 * Risk being tested: scoreboards decay into wallpaper fastest. Does anything
 * here actually change behaviour?
 */
const RANGES = ['Last 7 days', 'Last 30 days', 'Last 90 days'] as const
const activeRange = ref<typeof RANGES[number]>('Last 7 days')

const criticalCount = computed(() =>
  QUEUE_ITEMS.filter(i => i.tone === 'critical').reduce((n, i) => n + i.count, 0),
)

function toneText(tone: string) {
  switch (tone) {
    case 'critical': return 'text-bm-danger'
    case 'warning':  return 'text-bm-warning'
    case 'success':  return 'text-bm-success'
    default:         return 'text-bm-text-hi'
  }
}
function toneLabel(tone: string) {
  switch (tone) {
    case 'critical': return 'Over limit'
    case 'warning':  return 'Watch'
    default:         return 'On track'
  }
}
</script>

<template>
  <div class="px-8 pb-16 pt-6 font-body">
    <div class="max-w-[1200px] mx-auto space-y-4">

      <div class="flex items-center gap-4 flex-wrap mb-2">
        <h1 class="text-2xl font-semibold text-bm-text-hi">Hello {{ SELLER_NAME }}</h1>
        <HomeStatusChip />
      </div>

      <!-- 1. Trading performance, seller language, range selector -->
      <HomeSection title="Trading" action-label="Export CSV">
        <template #header-actions>
          <div class="flex items-center gap-1">
            <button
              v-for="r in RANGES"
              :key="r"
              class="text-xs px-2 py-1 rounded-bm-sm transition-colors"
              :class="activeRange === r ? 'bg-bm-gray-100 text-bm-text-hi font-medium' : 'text-bm-text-muted hover:text-bm-text-hi'"
              @click="activeRange = r"
            >{{ r.replace('Last ', '') }}</button>
          </div>
        </template>
        <HomeMetricStrip :metrics="METRICS" />
      </HomeSection>

      <!-- 2. Quality against real documented limits, with consequences -->
      <HomeSection title="Quality" meta="Against your programme limits" action-label="View details">
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left border-b border-bm-border">
              <th class="px-5 py-2.5 text-xs font-medium text-bm-text-muted">Metric</th>
              <th class="px-5 py-2.5 text-xs font-medium text-bm-text-muted">Yours</th>
              <th class="px-5 py-2.5 text-xs font-medium text-bm-text-muted">Limit</th>
              <th class="px-5 py-2.5 text-xs font-medium text-bm-text-muted">Window</th>
              <th class="px-5 py-2.5 text-xs font-medium text-bm-text-muted">If exceeded</th>
              <th class="px-5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="k in QUALITY_KPIS"
              :key="k.id"
              class="border-b border-bm-border last:border-b-0 hover:bg-bm-gray-50 transition-colors"
            >
              <td class="px-5 py-3 text-bm-text-hi">{{ k.label }}</td>
              <td class="px-5 py-3 font-semibold tabular-nums" :class="toneText(k.tone)">{{ k.value }}</td>
              <td class="px-5 py-3 text-bm-text-low tabular-nums">{{ k.limit }}</td>
              <td class="px-5 py-3 text-bm-text-muted text-xs">{{ k.window }}</td>
              <td class="px-5 py-3 text-bm-text-muted text-xs">{{ k.consequence }}</td>
              <td class="px-5 py-3 text-right">
                <span
                  class="text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded-bm-xs border"
                  :class="k.tone === 'critical' ? 'text-bm-danger border-bm-danger/40' : k.tone === 'warning' ? 'text-bm-warning border-bm-warning/40' : 'text-bm-success border-bm-success/40'"
                >{{ toneLabel(k.tone) }}</span>
              </td>
            </tr>
          </tbody>
        </table>
      </HomeSection>

      <!-- 3. Money, compressed -->
      <HomeSection title="Money" action-label="View wallet" locked>
        <HomeMoneyPanel :show-tier="false" />
      </HomeSection>

      <!-- 4. Work, demoted to a single line: the honest weakness of this concept -->
      <HomeSection title="Open work" locked>
        <button class="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-bm-gray-50 transition-colors group">
          <span class="text-xl font-semibold text-bm-danger tabular-nums">{{ criticalCount }}</span>
          <span class="flex-1 text-sm text-bm-text-hi">items need action today</span>
          <span class="inline-flex items-center gap-1 text-sm font-medium text-bm-text-hi">
            Review
            <svg class="w-3.5 h-3.5 text-bm-text-muted transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </HomeSection>

    </div>
  </div>
</template>
