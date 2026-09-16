<script setup lang="ts">
import {
  SELLER_NAME, METRICS, COMPLIANCE_LIMITS, QUEUE_SHAPE,
} from '~/utils/mockHomeData'

/**
 * CONCEPT C: Scoreboard, visualised
 *
 * Bet: a direct answer to the documented complaint that "we display metrics
 * important to our business but they don't mean much to sellers" and that
 * "sellers care about turnover, sales and revenue rather than GMV".
 *
 * The data-viz upgrade: the quality table of numbers becomes a block of
 * limit bars, grouped so they share one scale-reading convention and can be
 * scanned as small multiples. Every row answers "am I safe?" by shape, not
 * by arithmetic.
 *
 * Colour discipline: healthy rows are neutral grey, not green. If every
 * healthy metric were green the page becomes a wall of green and the one
 * amber row loses its pop-out advantage.
 *
 * Risk being tested: scoreboards decay into wallpaper fastest.
 */
const RANGES = ['7 days', '30 days', '90 days'] as const
const activeRange = ref<typeof RANGES[number]>('7 days')

const criticalCount = computed(() =>
  QUEUE_SHAPE.filter(i => i.breach).reduce((n, i) => n + i.value, 0),
)
</script>

<template>
  <div class="px-8 pb-16 pt-6 font-body">
    <div class="max-w-[1200px] mx-auto space-y-4">

      <div class="flex items-center gap-4 flex-wrap mb-2">
        <h1 class="text-2xl font-semibold text-bm-text-hi">Hello {{ SELLER_NAME }}</h1>
        <HomeStatusChip />
      </div>

      <!-- 1. Trading, seller language, one sparkline + one delta per tile -->
      <HomeSection title="Trading" action-label="Export CSV">
        <template #header-actions>
          <div class="flex items-center gap-1">
            <button
              v-for="r in RANGES"
              :key="r"
              class="text-xs px-2 py-1 rounded-bm-sm transition-colors"
              :class="activeRange === r ? 'bg-bm-gray-100 text-bm-text-hi font-medium' : 'text-bm-text-muted hover:text-bm-text-hi'"
              @click="activeRange = r"
            >{{ r }}</button>
          </div>
        </template>

        <div class="flex flex-wrap divide-x divide-bm-border">
          <div v-for="m in METRICS" :key="m.id" class="flex-1 min-w-[200px]">
            <VizKpiTile :metric="m" />
          </div>
        </div>
      </HomeSection>

      <!-- 2. Account health as small multiples of the same limit bar -->
      <HomeSection
        title="Account health"
        meta="Each metric against its suspension limit"
        action-label="View details"
        locked
      >
        <div class="divide-y divide-bm-border">
          <VizLimitBar
            v-for="l in COMPLIANCE_LIMITS"
            :key="l.id"
            :label="l.label"
            :value="l.value"
            :limit="l.limit"
            :unit="l.unit"
            :window="l.window"
            :lower-is-better="l.lowerIsBetter"
            :projected="l.projected"
            :headroom="l.headroom"
            :consequence="l.consequence"
          />
        </div>

        <!-- The consequences, stated once rather than repeated per row -->
        <div class="border-t border-bm-border px-5 py-3 bg-bm-gray-50">
          <p class="text-[11px] text-bm-text-muted leading-relaxed">
            <span class="text-bm-text-hi font-medium">If a limit is exceeded:</span>
            appearance rate triggers a 7-day category suspension, defective rate a 30-day
            suspension at model level, and on-time delivery suspends listings if you fall
            into the bottom 10% of your market.
          </p>
        </div>
      </HomeSection>

      <HomeSection title="Money" action-label="View wallet" locked>
        <HomeMoneyPanel :show-tier="false" />
      </HomeSection>

      <!-- 3. Work, demoted but now showing shape rather than one number -->
      <HomeSection title="Open work" locked>
        <VizBarList :data="QUEUE_SHAPE" />
        <p class="px-5 py-2.5 text-xs text-bm-text-muted border-t border-bm-border">
          {{ criticalCount }} items are past their deadline.
        </p>
      </HomeSection>

    </div>
  </div>
</template>
