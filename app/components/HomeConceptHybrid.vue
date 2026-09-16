<script setup lang="ts">
import {
  SELLER_NAME, QUEUE_ITEMS, METRICS, AVAILABLE_METRICS, OPPORTUNITIES, SHORTCUTS,
} from '~/utils/mockHomeData'
import type { Metric } from '~/utils/mockHomeData'

/**
 * CONCEPT E: Bounded hybrid
 *
 * Bet: this is Shopify's actual model. A fixed spine that always leads with
 * work and money, plus narrowly bounded customisation: 4 swappable metric
 * slots (per user, not per account), dismissible non-work cards, collapsible
 * editorial sections.
 *
 * Deliberately NOT a drag-and-drop canvas. NN/g: "customization usually works
 * poorly: business professionals are busy and often see the need to mess with
 * UI preferences as an annoyance" and "many users will simply use the default".
 * You would still have to design the default, which is most of the work.
 *
 * Risk being tested: does a hybrid lead with nothing and become a compromise?
 */
const slots = ref<Metric[]>([...METRICS])
const pickerOpenFor = ref<string | null>(null)

const unusedMetrics = computed(() =>
  AVAILABLE_METRICS.filter(m => !slots.value.some(s => s.id === m.id)),
)

function openPicker(id: string) {
  pickerOpenFor.value = pickerOpenFor.value === id ? null : id
}

function swapSlot(oldId: string, next: Metric) {
  slots.value = slots.value.map(s => (s.id === oldId ? next : s))
  pickerOpenFor.value = null
}

const topOpportunity = computed(() => OPPORTUNITIES[0])
</script>

<template>
  <div class="px-8 pb-16 pt-6 font-body">
    <div class="max-w-[1200px] mx-auto space-y-4">

      <div class="flex items-center gap-4 flex-wrap mb-2">
        <h1 class="text-2xl font-semibold text-bm-text-hi">Hello {{ SELLER_NAME }}</h1>
        <HomeStatusChip />
      </div>

      <!-- FIXED SPINE 1: work -->
      <HomeSection title="Needs your attention" locked tone="critical">
        <HomeQueueRow
          v-for="item in QUEUE_ITEMS.slice(0, 3)"
          :key="item.id"
          :item="item"
          :show-rule="false"
        />
        <button class="w-full px-5 py-2.5 text-xs text-bm-text-muted hover:text-bm-text-hi hover:bg-bm-gray-50 transition-colors text-left border-t border-bm-border">
          Show {{ QUEUE_ITEMS.length - 3 }} more
        </button>
      </HomeSection>

      <!-- FIXED SPINE 2: money -->
      <HomeSection title="Money" action-label="View wallet" locked>
        <HomeMoneyPanel :show-tier="false" />
      </HomeSection>

      <!-- BOUNDED CUSTOMISATION: 4 swappable slots, per user -->
      <HomeSection title="Performance" meta="Last 7 days · your 4 metrics">
        <HomeMetricStrip :metrics="slots" editable @swap="openPicker" />

        <div v-if="pickerOpenFor" class="border-t border-bm-border px-5 py-4 bg-bm-gray-50">
          <p class="text-xs text-bm-text-low mb-2">
            Replace this metric. Your choice applies to you only, not your teammates.
          </p>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="m in unusedMetrics"
              :key="m.id"
              class="text-xs text-bm-text-hi bg-white border border-bm-border rounded-bm-sm px-2.5 py-1.5 hover:border-bm-border-action transition-colors"
              @click="swapSlot(pickerOpenFor!, m)"
            >
              {{ m.label }}
              <span v-if="m.status === 'partial'" class="text-bm-warning" title="Not confirmed as available">?</span>
            </button>
            <button
              class="text-xs text-bm-text-muted px-2 py-1.5 hover:text-bm-text-hi transition-colors"
              @click="pickerOpenFor = null"
            >Cancel</button>
          </div>
        </div>
      </HomeSection>

      <!-- DISMISSIBLE: one opportunity only, single banner rule -->
      <HomeSection v-if="topOpportunity" title="Recommended" dismissible>
        <div class="px-5 py-4">
          <h3 class="text-sm font-semibold text-bm-text-hi mb-1 leading-snug">{{ topOpportunity.headline }}</h3>
          <p class="text-sm text-bm-text-mid leading-relaxed mb-3">{{ topOpportunity.body }}</p>
          <button class="text-xs font-medium text-white bg-bm-text-hi rounded-bm px-3 py-1.5 hover:opacity-90 transition-opacity">
            {{ topOpportunity.cta }}
          </button>
        </div>
      </HomeSection>

      <!-- COLLAPSIBLE: shortcuts -->
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

      <!-- COLLAPSED BY DEFAULT: editorial, pinned last -->
      <HomeSection title="What's new" collapsible dismissible>
        <ul class="px-5 py-4 space-y-2.5">
          <li class="text-sm text-bm-text-mid leading-snug">
            <span class="text-bm-text-hi font-medium">Sales Maximizer Price</span> now refreshes every 24 hours on every listing.
          </li>
          <li class="text-sm text-bm-text-mid leading-snug">
            <span class="text-bm-text-hi font-medium">Deferred payout prediction</span> reduced amounts held by 20% on average.
          </li>
        </ul>
      </HomeSection>

    </div>
  </div>
</template>
