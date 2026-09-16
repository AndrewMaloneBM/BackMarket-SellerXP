<script setup lang="ts">
import { SELLER_NAME, OPPORTUNITIES, FEED_RULES, QUEUE_ITEMS, METRICS } from '~/utils/mockHomeData'

/**
 * CONCEPT D: Next best action
 *
 * Bet: 58% of SSAT Q4 2023 respondents discovered BO features they did not
 * know existed, via the survey itself. Organic discoverability is failing,
 * and 2026 carries a "100% tools adoption" target. Home is the natural lever.
 *
 * Risk being tested: this becomes an ignored promo rail. So the suppression
 * machinery is built in and made visible: eligibility gate, daily cap, TTL,
 * and dismissal with a reason.
 */
const dismissed = ref<string[]>([])
const dismissingId = ref<string | null>(null)

const DISMISS_REASONS = [
  'Not relevant to my business',
  'I have already done this',
  'I do not understand it',
  'Not a priority right now',
]

const visible = computed(() =>
  OPPORTUNITIES.filter(o => !dismissed.value.includes(o.id)).slice(0, 3),
)

const criticalCount = computed(() =>
  QUEUE_ITEMS.filter(i => i.tone === 'critical').reduce((n, i) => n + i.count, 0),
)

function confirmDismiss(id: string) {
  dismissed.value = [...dismissed.value, id]
  dismissingId.value = null
}

function resetFeed() {
  dismissed.value = []
  dismissingId.value = null
}
</script>

<template>
  <div class="px-8 pb-16 pt-6 font-body">
    <div class="max-w-[1200px] mx-auto space-y-4">

      <div class="flex items-center gap-4 flex-wrap mb-2">
        <h1 class="text-2xl font-semibold text-bm-text-hi">Hello {{ SELLER_NAME }}</h1>
        <HomeStatusChip />
      </div>

      <!-- Work still comes first, but compressed to one row -->
      <HomeSection title="Needs your attention" locked tone="critical">
        <button class="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-bm-gray-50 transition-colors group">
          <span class="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-bm-danger" />
          <span class="text-xl font-semibold text-bm-danger tabular-nums">{{ criticalCount }}</span>
          <span class="flex-1 text-sm text-bm-text-hi">orders and messages past their deadline</span>
          <span class="inline-flex items-center gap-1 text-sm font-medium text-bm-text-hi">
            Review
            <svg class="w-3.5 h-3.5 text-bm-text-muted transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </HomeSection>

      <!-- The ranked feed -->
      <HomeSection title="Recommended this week" :meta="`${visible.length} of 3 shown`">
        <template #header-actions>
          <button
            v-if="dismissed.length"
            class="text-xs text-bm-text-muted hover:text-bm-text-hi transition-colors"
            @click="resetFeed"
          >Restore dismissed</button>
        </template>

        <div v-if="visible.length">
          <article
            v-for="(o, i) in visible"
            :key="o.id"
            class="px-5 py-4 border-b border-bm-border last:border-b-0"
          >
            <div class="flex items-start gap-3">
              <span class="flex-shrink-0 text-xs text-bm-text-muted tabular-nums mt-1 w-4">{{ i + 1 }}</span>

              <div class="flex-1 min-w-0">
                <h3 class="text-sm font-semibold text-bm-text-hi mb-1 leading-snug">{{ o.headline }}</h3>
                <!-- Explanatory prose is allowed here: the sentence IS the product -->
                <p class="text-sm text-bm-text-mid leading-relaxed mb-2">{{ o.body }}</p>

                <p class="text-xs text-bm-text-muted mb-3">Based on {{ o.basedOn }}</p>

                <div class="flex items-center gap-2 flex-wrap">
                  <button class="text-xs font-medium text-white bg-bm-text-hi rounded-bm px-3 py-1.5 hover:opacity-90 transition-opacity">
                    {{ o.cta }}
                  </button>
                  <button
                    class="text-xs text-bm-text-muted hover:text-bm-text-hi transition-colors px-2 py-1.5"
                    @click="dismissingId = dismissingId === o.id ? null : o.id"
                  >Not useful</button>
                </div>

                <!-- Dismissal with a reason: this is how you learn what is noise -->
                <div v-if="dismissingId === o.id" class="mt-3 pt-3 border-t border-bm-border">
                  <p class="text-xs text-bm-text-low mb-2">Why is this not useful?</p>
                  <div class="flex flex-wrap gap-1.5">
                    <button
                      v-for="r in DISMISS_REASONS"
                      :key="r"
                      class="text-xs text-bm-text-hi border border-bm-border rounded-bm-sm px-2 py-1 hover:bg-bm-gray-50 transition-colors"
                      @click="confirmDismiss(o.id)"
                    >{{ r }}</button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div v-else class="px-5 py-8 text-center">
          <p class="text-sm font-medium text-bm-text-hi mb-1">No recommendations right now</p>
          <p class="text-xs text-bm-text-muted">New ones appear as your data changes. Maximum 3 per day.</p>
        </div>
      </HomeSection>

      <!-- The rules, surfaced for critique. Would not ship visible like this. -->
      <HomeSection title="Feed rules" collapsible dismissible>
        <dl class="px-5 py-4 grid grid-cols-2 gap-x-6 gap-y-2.5">
          <div v-for="(v, k) in FEED_RULES" :key="k" class="flex flex-col">
            <dt class="text-[10px] uppercase tracking-wider text-bm-text-muted">{{ k }}</dt>
            <dd class="text-xs text-bm-text-hi">{{ v }}</dd>
          </div>
        </dl>
        <p class="px-5 pb-4 text-xs text-bm-text-muted leading-relaxed">
          Shown here for critique only. Without an eligibility gate, a daily cap and a TTL,
          a feed like this becomes a promo rail and sellers learn to skip the page.
        </p>
      </HomeSection>

      <!-- Money and performance, both demoted -->
      <HomeSection title="Money" action-label="View wallet" locked>
        <HomeMoneyPanel :show-tier="false" />
      </HomeSection>

      <HomeSection title="Performance" meta="Last 7 days" collapsible>
        <HomeMetricStrip :metrics="METRICS" />
      </HomeSection>

    </div>
  </div>
</template>
