<script setup lang="ts">
import {
  SELLER_NAME, QUEUE_ITEMS, METRICS, TOTALS,
  QUEUE_SHAPE, LATENESS_BINS, WORST_CASE, COMPLIANCE_LIMITS,
} from '~/utils/mockHomeData'

/**
 * CONCEPT A: Triage, visualised
 *
 * Bet: 69% of integrator-using sellers still use the BO, because the API
 * cannot handle every case. They come for exceptions and for money.
 *
 * The data-viz upgrade over a list of numbers, in three layers:
 *   1. counts on ONE shared length scale, so "which is worst" is a pop-out
 *      judgement (detected in under 250ms) rather than three separate reads
 *   2. an ageing profile as binned bars, answering "and how late?"
 *   3. one named worst case, as the escape hatch to action
 *
 * Risk being tested: what does the page do in a quiet week? Use the toggle.
 */
const queueEmpty = ref(false)
const showRules = ref(false)

const visibleQueue = computed(() => (queueEmpty.value ? [] : QUEUE_SHAPE))
const totalExceptions = computed(() => visibleQueue.value.reduce((n, i) => n + i.value, 0))

/** Only limits that need attention reach Home. The rest live on the detail page. */
const attentionLimits = computed(() =>
  COMPLIANCE_LIMITS.filter(l =>
    l.lowerIsBetter
      ? l.value > l.limit || (l.projected ?? 0) > l.limit
      : l.value < l.limit,
  ),
)
</script>

<template>
  <div class="px-8 pb-16 pt-6 font-body">
    <div class="max-w-[1200px] mx-auto space-y-4">

      <div class="flex items-center gap-4 flex-wrap mb-2">
        <h1 class="text-2xl font-semibold text-bm-text-hi">Hello {{ SELLER_NAME }}</h1>
        <HomeStatusChip />
        <label class="ml-auto flex items-center gap-2 text-xs text-bm-text-muted cursor-pointer">
          <input v-model="queueEmpty" type="checkbox" class="accent-bm-success">
          Simulate an empty queue
        </label>
      </div>

      <!-- LAYER 1 + 2: shape of the queue, then the ageing profile -->
      <HomeSection
        title="Needs your attention"
        :meta="queueEmpty ? undefined : `${totalExceptions} items`"
        locked
        :tone="queueEmpty ? 'default' : 'critical'"
      >
        <template v-if="visibleQueue.length">
          <VizBarList :data="visibleQueue" />

          <div class="grid grid-cols-2 gap-0 border-t border-bm-border">
            <!-- Ageing: a distribution over a quantity axis, not a time axis -->
            <div class="border-r border-bm-border py-3">
              <p class="px-5 text-xs font-medium text-bm-text-low mb-1">
                Orders by how late they are
              </p>
              <VizBarList :data="LATENESS_BINS" :sorted="false" label-width="w-32" compact />
            </div>

            <!-- LAYER 3: the named worst case -->
            <div class="py-3 px-5 flex flex-col justify-center">
              <p class="text-xs font-medium text-bm-text-low mb-2">Oldest open item</p>
              <p class="text-sm text-bm-text-hi mb-0.5">
                <span class="font-semibold">{{ WORST_CASE.reference }}</span>
                <span class="text-bm-text-muted"> · {{ WORST_CASE.value }}</span>
              </p>
              <p class="text-xs text-bm-danger mb-3">{{ WORST_CASE.detail }}</p>
              <button class="self-start text-xs font-medium text-white bg-bm-text-hi rounded-bm px-3 py-1.5 hover:opacity-90 transition-opacity">
                Open this order
              </button>
            </div>
          </div>
        </template>

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

      <!-- Compliance: only what is breached or projected to breach -->
      <HomeSection
        v-if="attentionLimits.length"
        title="Approaching a limit"
        meta="Breach causes suspension"
        locked
        tone="critical"
      >
        <div class="divide-y divide-bm-border">
          <VizLimitBar
            v-for="l in attentionLimits"
            :key="l.id"
            :label="l.label"
            :value="l.value"
            :limit="l.limit"
            :unit="l.unit"
            :window="l.window"
            :lower-is-better="l.lowerIsBetter"
            :projected="l.projected"
            :headroom="l.headroom"
          />
        </div>
        <p class="px-5 py-2.5 text-xs text-bm-text-muted border-t border-bm-border">
          Metrics within their limits are not shown here.
          <button class="text-bm-text-hi underline">See all quality metrics</button>
        </p>
      </HomeSection>

      <HomeSection title="Money" action-label="View wallet" locked>
        <HomeMoneyPanel :show-tier="false" />
      </HomeSection>

      <!-- Trend carried by sparklines, so no hero chart is needed -->
      <HomeSection title="Performance" meta="Last 7 days" action-label="View insights">
        <div class="flex flex-wrap divide-x divide-bm-border">
          <div v-for="m in METRICS" :key="m.id" class="flex-1 min-w-[200px]">
            <VizKpiTile :metric="m" />
          </div>
        </div>
      </HomeSection>

      <!-- Kept for critique: the scoping rules behind every count -->
      <HomeSection title="How these counts are scoped" collapsible dismissible>
        <ul class="px-5 py-4 space-y-2">
          <li v-for="item in QUEUE_ITEMS" :key="item.id" class="text-xs leading-snug">
            <span class="text-bm-text-hi font-medium">{{ item.count }} {{ item.label }}</span>
            <span class="text-bm-text-muted"> · {{ item.rule }}</span>
          </li>
        </ul>
        <p class="px-5 pb-4 text-xs text-bm-text-muted leading-relaxed">
          Every count is a scoped exception, not a raw total. "196 orders" is a fact;
          "11 past ship-by" is a task.
        </p>
      </HomeSection>

    </div>
  </div>
</template>
