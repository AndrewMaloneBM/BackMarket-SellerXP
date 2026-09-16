<script setup lang="ts">
import { MONEY } from '~/utils/mockHomeData'

/**
 * Money module. For a refurbisher with working-capital pressure this is
 * arguably the highest-value tile on the page: next payout amount, date,
 * and what is being held back. Fees and payouts are the top churn driver.
 *
 * Naming follows Shopify's "Payout balance" rename: avoid ambiguous labels.
 */
withDefaults(defineProps<{
  /** Show the tier progression detail. Heavier, but it is the cash unlock. */
  showTier?: boolean
  layout?: 'row' | 'stack'
}>(), {
  showTier: true,
  layout: 'row',
})
</script>

<template>
  <div>
    <div
      class="flex flex-wrap divide-bm-border"
      :class="layout === 'row' ? 'divide-x' : 'flex-col divide-y'"
    >
      <div class="flex-1 min-w-[180px] px-5 py-4">
        <p class="text-xs text-bm-text-low mb-1.5">Next payout</p>
        <p class="text-2xl font-semibold text-bm-success tabular-nums">{{ MONEY.nextPayoutAmount }}</p>
        <p class="text-xs text-bm-text-muted mt-1">{{ MONEY.nextPayoutDate }}</p>
      </div>

      <div class="flex-1 min-w-[180px] px-5 py-4">
        <p class="text-xs text-bm-text-low mb-1.5">Payout balance</p>
        <p class="text-2xl font-semibold text-bm-text-hi tabular-nums">{{ MONEY.walletBalance }}</p>
        <p class="text-xs text-bm-text-muted mt-1">{{ MONEY.payoutGuarantee }} guaranteed weekly</p>
      </div>

      <div class="flex-1 min-w-[180px] px-5 py-4">
        <p class="text-xs text-bm-text-low mb-1.5">Held back</p>
        <p class="text-2xl font-semibold text-bm-text-hi tabular-nums">{{ MONEY.deferredAmount }}</p>
        <p class="text-xs text-bm-text-muted mt-1">{{ MONEY.deferredNote }}</p>
      </div>
    </div>

    <!-- Tier progression: the actual cash unlock, so it earns its space -->
    <div v-if="showTier" class="border-t border-bm-border px-5 py-4 bg-bm-gray-50">
      <div class="flex items-center gap-3 mb-3">
        <span class="text-xs font-semibold text-bm-text-hi">{{ MONEY.tierLabel }} of {{ MONEY.tierMax }}</span>
        <span class="text-xs text-bm-text-muted">{{ MONEY.tierDeferredRate }} held</span>
        <span class="ml-auto text-xs text-bm-text-muted">Tier 3 holds {{ MONEY.tierNextRate }}</span>
      </div>

      <!-- Progress as segments, not a gauge -->
      <div class="flex gap-1 mb-3">
        <span
          v-for="n in MONEY.tierMax"
          :key="n"
          class="h-1.5 flex-1 rounded-bm-xs"
          :class="n <= MONEY.tier ? 'bg-bm-success' : 'bg-bm-gray-200'"
        />
      </div>

      <ul class="space-y-1.5">
        <li
          v-for="c in MONEY.tierNextCriteria"
          :key="c.label"
          class="flex items-center gap-2 text-xs"
        >
          <svg v-if="c.met" class="w-3.5 h-3.5 text-bm-success flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <svg v-else class="w-3.5 h-3.5 text-bm-danger flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
          </svg>
          <span :class="c.met ? 'text-bm-text-low' : 'text-bm-text-hi font-medium'">{{ c.label }}</span>
          <span class="text-bm-text-muted tabular-nums">{{ c.value }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
