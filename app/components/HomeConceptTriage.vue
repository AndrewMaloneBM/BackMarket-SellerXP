<script setup lang="ts">
import { SELLER_NAME, QUEUE_ITEMS, METRICS, SHORTCUTS, TOTALS } from '~/utils/mockHomeData'

/**
 * CONCEPT A: Triage
 *
 * Bet: 69% of integrator-using sellers still use the BO, because the API
 * cannot handle every case. They come for exceptions and for money. A named,
 * counted queue is at or near the top of all five benchmarked comparators.
 *
 * Risk being tested: what does the page do in a quiet week? Use the toggle.
 */
const queueEmpty = ref(false)

const visibleQueue = computed(() => (queueEmpty.value ? [] : QUEUE_ITEMS))
const totalExceptions = computed(() => visibleQueue.value.reduce((n, i) => n + i.count, 0))
</script>

<template>
  <div class="px-8 pb-16 pt-6 font-body">
    <div class="max-w-[1200px] mx-auto space-y-4">

      <!-- Page header: greeting, status, and the one control for critique -->
      <div class="flex items-center gap-4 flex-wrap mb-2">
        <h1 class="text-2xl font-semibold text-bm-text-hi">Hello {{ SELLER_NAME }}</h1>
        <HomeStatusChip />
        <label class="ml-auto flex items-center gap-2 text-xs text-bm-text-muted cursor-pointer">
          <input v-model="queueEmpty" type="checkbox" class="accent-bm-success">
          Simulate an empty queue
        </label>
      </div>

      <!-- 1. The queue. Work cannot be dismissed. -->
      <HomeSection
        title="Needs your attention"
        :meta="queueEmpty ? undefined : `${totalExceptions} items`"
        locked
        :tone="queueEmpty ? 'default' : 'critical'"
      >
        <template v-if="visibleQueue.length">
          <HomeQueueRow v-for="item in visibleQueue" :key="item.id" :item="item" />
        </template>

        <!-- A real empty state, not a shrug -->
        <div v-else class="px-5 py-8 text-center">
          <p class="text-sm font-medium text-bm-text-hi mb-1">Nothing needs your attention</p>
          <p class="text-xs text-bm-text-muted mb-4">
            All {{ TOTALS.ordersToProcess }} open orders are within their ship-by window and every message is answered.
          </p>
          <button class="text-xs font-medium text-bm-text-hi border border-bm-border rounded-bm-sm px-3 py-1.5 hover:bg-bm-gray-50 transition-colors">
            Review this week's opportunities
          </button>
        </div>
      </HomeSection>

      <!-- 2. Money. Also undismissible. -->
      <HomeSection title="Money" action-label="View wallet" locked>
        <HomeMoneyPanel :show-tier="false" />
      </HomeSection>

      <!-- 3. Performance, compressed to a strip -->
      <HomeSection title="Performance" meta="Last 7 days" action-label="View insights">
        <HomeMetricStrip :metrics="METRICS" />
      </HomeSection>

      <!-- 4. Shortcuts: recency and pinning, not duplicated nav -->
      <HomeSection title="Shortcuts" collapsible>
        <div class="px-5 py-4 flex flex-wrap gap-2">
          <button
            v-for="s in SHORTCUTS"
            :key="s.label"
            class="inline-flex items-center gap-1.5 text-xs text-bm-text-hi border border-bm-border rounded-bm-sm px-2.5 py-1.5 hover:bg-bm-gray-50 transition-colors"
          >
            <svg v-if="s.pinned" class="w-3 h-3 text-bm-text-muted" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.5 2a.5.5 0 00-.5.5v6.2L6.3 11.4a.5.5 0 00.35.85h2.85v5.25a.5.5 0 001 0V12.25h2.85a.5.5 0 00.35-.85L11 8.7V2.5a.5.5 0 00-.5-.5h-1z" />
            </svg>
            {{ s.label }}
          </button>
        </div>
      </HomeSection>

    </div>
  </div>
</template>
