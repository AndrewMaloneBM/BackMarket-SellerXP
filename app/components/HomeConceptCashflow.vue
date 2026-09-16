<script setup lang="ts">
import { SELLER_NAME, MONEY, QUEUE_ITEMS, METRICS } from '~/utils/mockHomeData'

/**
 * CONCEPT B: Cash flow
 *
 * Bet: fees and payouts are the #1 voluntary churn driver (21% of voluntary
 * churners). 44% of sellers called the payout process too long or complex.
 * Lead with money and the page becomes the reason to log in.
 *
 * Risk being tested: is money alone enough to carry a whole page, or does
 * this end up narrow?
 */

// Only the exceptions that actually move cash, to keep the page on-message
const CASH_RELEVANT = ['appearance-breach', 'past-ship-by']
const cashQueue = computed(() => QUEUE_ITEMS.filter(i => CASH_RELEVANT.includes(i.id)))

const PAYOUT_TIMELINE = [
  { date: '31/08/2026', label: 'Sales period closes', amount: '€13,227.85', state: 'now' },
  { date: '02/09/2026', label: 'Refund estimate applied', amount: '-€4,182.40', state: 'next' },
  { date: '07/09/2026', label: 'Payout to your bank', amount: '€13,227.85', state: 'next' },
]
</script>

<template>
  <div class="px-8 pb-16 pt-6 font-body">
    <div class="max-w-[1200px] mx-auto space-y-4">

      <div class="flex items-center gap-4 flex-wrap mb-2">
        <h1 class="text-2xl font-semibold text-bm-text-hi">Hello {{ SELLER_NAME }}</h1>
        <HomeStatusChip />
      </div>

      <!-- 1. Money, expanded and leading, with the tier unlock -->
      <HomeSection title="Your money" action-label="View wallet" locked>
        <HomeMoneyPanel show-tier />
      </HomeSection>

      <!-- 2. What happens next to this cash -->
      <HomeSection title="What happens next" meta="Current sales period">
        <ol class="px-5 py-4 space-y-0">
          <li
            v-for="(step, i) in PAYOUT_TIMELINE"
            :key="step.date"
            class="flex items-center gap-4 py-3"
            :class="i < PAYOUT_TIMELINE.length - 1 ? 'border-b border-bm-border' : ''"
          >
            <span
              class="flex-shrink-0 w-2 h-2 rounded-full"
              :class="step.state === 'now' ? 'bg-bm-success' : 'bg-bm-gray-300'"
            />
            <span class="flex-shrink-0 text-xs text-bm-text-muted tabular-nums w-24">{{ step.date }}</span>
            <span class="flex-1 text-sm text-bm-text-hi">{{ step.label }}</span>
            <span
              class="text-sm font-medium tabular-nums"
              :class="step.amount.startsWith('-') ? 'text-bm-danger' : 'text-bm-text-hi'"
            >{{ step.amount }}</span>
          </li>
        </ol>
      </HomeSection>

      <!-- 3. Only the exceptions that cost money -->
      <HomeSection title="Risks to your next payout" locked tone="critical">
        <HomeQueueRow v-for="item in cashQueue" :key="item.id" :item="item" />

        <!-- Refund rate is the gate on the next tier, so it earns a limit bar -->
        <div class="border-t border-bm-border">
          <VizLimitBar
            label="Refund rate"
            :value="11.2"
            :limit="10"
            unit="%"
            window="Blocks Tier 3, which would halve the amount held"
            :lower-is-better="true"
            headroom="Needs to drop 1.2 points to unlock Tier 3"
          />
        </div>
      </HomeSection>

      <!-- 4. Faster access to cash. Provider named only in the CTA. -->
      <HomeSection title="Get paid daily instead of weekly" dismissible>
        <div class="px-5 py-4">
          <p class="text-sm text-bm-text-mid leading-relaxed mb-1">
            You are eligible for daily payouts. Based on your current balance that is
            <strong class="text-bm-text-hi">{{ MONEY.nextPayoutAmount }}</strong> available tomorrow rather than
            {{ MONEY.nextPayoutDate }}.
          </p>
          <p class="text-xs text-bm-text-muted mb-4">
            Requires Tier 2 or above, which you already meet.
          </p>
          <button class="text-sm font-medium text-white bg-bm-text-hi rounded-bm px-4 py-2 hover:opacity-90 transition-opacity">
            Verify with Storfund
          </button>
        </div>
      </HomeSection>

      <!-- 5. Performance, demoted -->
      <HomeSection title="Performance" meta="Last 7 days" collapsible action-label="View insights">
        <HomeMetricStrip :metrics="METRICS" />
      </HomeSection>

    </div>
  </div>
</template>
