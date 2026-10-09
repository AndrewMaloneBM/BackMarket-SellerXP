<script setup lang="ts">
/**
 * Back Office Home for the Deals Step One prototype.
 * Layout and Revolve components copied from front-apps
 * (apps/back-office-seller/app/scopes/home/boarded/pages). The Deals card is
 * the only block that does not exist in the real Back Office yet.
 */
import dealCampaignsJson from './deals-step-one/deal_campaigns.json'

const NAV_ITEMS = ['Home', 'Insights', 'Customer Care', 'Listings', 'Orders', 'Opportunities', 'Money', 'Options', 'Seller Support'] as const
const SELLER_NAME = 'Merchant'
const DISABLED_HINT = 'Not available in this test'

// Only Home, Listings and Opportunities are in scope for this test. The
// disabled treatment (styling, tooltip, aria) lives in BoShell.
const ENABLED_NAV = ['Home', 'Listings', 'Opportunities']
const disabledNavItems = NAV_ITEMS.filter((item) => !ENABLED_NAV.includes(item))

/** Products above their Deal target price — the sellers who can still unlock reduced commission. */
const eligibleCount = dealCampaignsJson.campaigns.reduce(
  (sum, c) => sum + c.products.filter((p) => p.price != null && p.price > p.targetPrice).length,
  0,
)

const timePeriod = ref('Last 7 days')
const walletCurrency = ref('EUR')

interface Insight {
  icon: string
  title: string
  current: { value: string; kpi: string | null; range: string }
  previous: { value: string; range: string }
  yearOverYear: { value: string; kpi: string | null; range: string }
}

const INSIGHTS: Insight[] = [
  {
    icon: 'IconShoppingBag',
    title: 'Orders received',
    current: { value: '1,211', kpi: '4', range: "Aug 24 – 30, '26" },
    previous: { value: '1,163', range: "Aug 17 – 23, '26" },
    yearOverYear: { value: '1,092', kpi: '11', range: "Aug 24 – 30, '25" },
  },
  {
    icon: 'IconMoney',
    title: 'Sales revenue from shipped orders (shipping incl.)',
    current: { value: '€412,380.50', kpi: '4.34', range: "Aug 24 – 30, '26" },
    previous: { value: '€395,210.75', range: "Aug 17 – 23, '26" },
    yearOverYear: { value: '€371,640.20', kpi: '10.96', range: "Aug 24 – 30, '25" },
  },
  {
    icon: 'IconRefund',
    title: 'Total refunds (shipping incl.)',
    current: { value: '€5,430.22', kpi: null, range: "Aug 24 – 30, '26" },
    previous: { value: '€5,812.40', range: "Aug 17 – 23, '26" },
    yearOverYear: { value: '€6,120.00', kpi: null, range: "Aug 24 – 30, '25" },
  },
]

const SALES_OPPORTUNITIES = [
  { tag: '924 quick wins', description: 'Listings ready to convert with a small nudge.' },
  { tag: '64 listings in trouble', description: 'Fix issues to restore visibility.' },
  { tag: '250 BackBoxes to boost', description: 'Increase exposure on high-potential BackBoxes.' },
]

const emit = defineEmits<{ navItemClick: [item: string]; viewDeals: [] }>()

// The page handles this: it opens Opportunities, then scrolls to the Deals section.
function onViewDeals() {
  emit('viewDeals')
}
</script>

<template>
  <BoShell
    active-nav-item="Home"
    :seller-name="SELLER_NAME"
    :disabled-nav-items="disabledNavItems"
    @nav-item-click="emit('navItemClick', $event)"
  >
    <BoPage :title="`Hello ${SELLER_NAME}!`">
      <div class="space-y-6">
        <div class="md:grid md:grid-cols-4 md:gap-6">
          <!-- Task list -->
          <RevCard class="col-span-1 mb-6 p-6 md:mb-0">
            <div class="mb-6 flex flex-wrap items-center justify-between gap-2">
              <div class="rev-heading-2 flex items-center gap-2">
                <RevIcon name="IconListView1" size="24" />
                Task list
              </div>
              <div class="flex items-center gap-2">
                <RevIcon name="IconCalendar" size="24" />
                Monday, 31 August 2026
              </div>
            </div>
            <RevList :has-external-borders="false">
              <RevListItemAction has-chevron href="#">
                <template #label>You have 196 orders to process</template>
              </RevListItemAction>
              <RevListItemAction has-chevron href="#">
                <template #label>You have 141 customer care task(s) to complete.</template>
              </RevListItemAction>
            </RevList>
          </RevCard>

          <!-- Sale insights -->
          <div class="col-span-3 space-y-6">
            <RevCard class="h-full p-6">
              <div class="mb-6 flex flex-wrap items-center justify-between gap-6">
                <div class="rev-heading-2 flex items-center gap-2">
                  <RevIcon name="IconShoppingBag" size="24" />
                  Sale insights
                </div>
                <div class="flex items-center gap-6">
                  <div class="w-[140px]">
                    <RevInputSelect
                      id="sales-metrics-time-period"
                      v-model="timePeriod"
                      label="Time period"
                      size="small"
                      :options="['Last 7 days', 'Last 30 days', 'Last 90 days']"
                    />
                  </div>
                  <RevButton variant="secondary" size="small">View details</RevButton>
                </div>
              </div>

              <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div
                  v-for="insight in INSIGHTS"
                  :key="insight.title"
                  class="flex w-full flex-col justify-between gap-3 rounded-bm-sm border rev-border-static-default-mid p-6"
                >
                  <p class="rev-body-1 flex min-h-[52px] items-start gap-2">
                    <RevIcon :name="insight.icon" size="24" />
                    {{ insight.title }}
                  </p>
                  <div class="mb-auto">
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-baseline gap-1">
                        <span class="rev-heading-2">{{ insight.current.value }}</span>
                        <span v-if="insight.current.kpi" class="flex items-center text-[0.75rem] rev-text-static-success-hi">
                          <RevIcon name="IconArrowUp" size="16" />{{ insight.current.kpi }}%
                        </span>
                      </div>
                      <span class="text-[0.75rem] rev-text-static-default-low">{{ insight.current.range }}</span>
                    </div>
                    <div class="-mt-1.5 flex items-center justify-between gap-2">
                      <span class="text-[0.75rem] rev-text-static-default-low">{{ insight.previous.value }}</span>
                      <span class="text-[0.75rem] rev-text-static-default-low">{{ insight.previous.range }}</span>
                    </div>
                    <RevDivider class="my-2" />
                    <div class="flex items-center justify-between gap-2">
                      <div class="flex items-center gap-1">
                        <span class="rev-heading-2">{{ insight.yearOverYear.value }}</span>
                        <span v-if="insight.yearOverYear.kpi" class="rev-caption-bold flex items-center rev-text-static-success-hi">
                          <RevIcon name="IconArrowUp" size="12" />{{ insight.yearOverYear.kpi }}%
                        </span>
                      </div>
                      <span class="text-[0.75rem] rev-text-static-default-low">{{ insight.yearOverYear.range }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </RevCard>
          </div>
        </div>

        <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_320px]">
          <!-- Trade In -->
          <RevCard class="p-6">
            <div class="mb-6 flex items-start justify-between gap-4">
              <div>
                <div class="rev-heading-2 flex items-center gap-2">
                  <RevIcon name="IconTradeIn" size="24" />
                  Trade In
                </div>
                <p class="rev-body-2 rev-text-static-default-low">Last 7 days</p>
              </div>
              <RevButton variant="secondary" size="small">View details</RevButton>
            </div>
            <!-- xl and up: this card is the narrow column of the row, so its two tiles stack -->
            <div class="grid grid-cols-2 gap-6 xl:grid-cols-1">
              <div class="flex w-full flex-col justify-between gap-3 rounded-bm-sm border rev-border-static-default-mid p-6">
                <div class="rev-body-1 flex items-start gap-2">
                  <RevIcon name="IconTruck" size="24" />
                  Orders received
                </div>
                <div class="mt-3">
                  <div><span class="rev-heading-2 mr-1">1158</span> shipped</div>
                  <div><span class="rev-heading-2 mr-1">771</span> delivered</div>
                </div>
              </div>
              <div class="flex w-full flex-col justify-between gap-3 rounded-bm-sm border rev-border-static-default-mid p-6">
                <p class="rev-body-1 flex items-start gap-2">
                  <RevIcon name="IconInfo" size="24" />
                  Orders that require action
                </p>
                <div class="mt-3">
                  <div><span class="rev-heading-2 mr-1">610</span> to process</div>
                  <div><span class="rev-heading-2 mr-1">413</span> to reply to</div>
                </div>
              </div>
            </div>
          </RevCard>

          <!-- Opportunities -->
          <RevCard class="p-6">
            <div class="rev-heading-2 mb-6 flex items-center gap-2">
              <RevIcon name="IconGrowth" size="24" />
              Opportunities
            </div>
            <!-- Sales and Trade-in side by side once the card is wide enough -->
            <div class="grid grid-cols-1 gap-6 min-[1440px]:grid-cols-2">
              <div>
                <div class="mb-4 flex items-center justify-between">
                  <div class="rev-heading-2 flex items-center gap-2">
                    <RevIcon name="IconShoppingBag" size="24" />
                    Sales
                  </div>
                  <RevButton variant="secondary" size="small">View details</RevButton>
                </div>
                <div class="space-y-3">
                  <div
                    v-for="opportunity in SALES_OPPORTUNITIES"
                    :key="opportunity.tag"
                    class="w-full rounded-bm-sm border rev-border-static-default-mid p-4"
                  >
                    <RevTag :label="opportunity.tag" size="large" variant="info" />
                    <div>{{ opportunity.description }}</div>
                  </div>
                </div>
              </div>
              <div>
                <div class="mb-4 flex items-center justify-between">
                  <div class="rev-heading-2 flex items-center gap-2">
                    <RevIcon name="IconTradeIn" size="24" />
                    Trade-in
                  </div>
                  <RevButton variant="secondary" size="small">View details</RevButton>
                </div>
                <div class="space-y-3">
                  <div class="w-full rounded-bm-sm border rev-border-static-default-mid p-4">
                    <RevTag label="1955 sourcing opportunities" size="large" variant="info" />
                    <p>Devices available to source from Back Market customers.</p>
                  </div>
                </div>
              </div>
            </div>
          </RevCard>

          <!-- Deals: new in this prototype. A softer navy than the Listings
               banner (Revolve static-info-mid in the inverse mood), with a large
               deal icon as a faint silhouette behind the content. The text and
               button keep the tangaroa mood. The number is the count of listings
               above their deal target in deal_campaigns.json. -->
          <div class="rev-mood-inverse rev-bg-static-info-mid rev-shadow-short relative overflow-hidden rounded-bm-lg">
            <RevIcon
              name="IconDealFilled"
              size="550"
              class="pointer-events-none absolute -right-[202px] -top-[89px]"
              style="color: var(--rev-bg-action-default-hi-disabled);"
            />

            <div class="rev-mood-tangaroa relative flex h-full flex-col p-6">
              <div class="rev-heading-2 rev-text-static-default-hi flex items-center gap-2">
                <RevIcon name="IconDealFilled" size="24" />
                Deals
              </div>

              <div class="mt-4">
                <p class="rev-punchline rev-text-static-default-hi">{{ eligibleCount }}</p>
                <p class="rev-heading-2 rev-text-static-default-hi">
                  {{ eligibleCount === 1 ? 'listing can' : 'listings can' }} unlock reduced commission
                </p>
                <p class="rev-body-1 rev-text-static-default-low mt-3">
                  Meet the Deal target price to pay less commission on selected products.
                </p>
              </div>

              <!-- Button spans the card, link centred under it. When the card is
                   full page width (below xl) the pair is capped so the button
                   does not stretch across the whole page. -->
              <div class="mt-auto flex max-w-sm flex-col gap-3 pt-6 xl:max-w-none">
                <RevButton variant="primary" size="small" full-width="always" @click="onViewDeals">View eligible listings</RevButton>
                <RevLink
                  class="rev-mood-inverse rev-body-2 self-center"
                  style="cursor: not-allowed;"
                  aria-disabled="true"
                  tabindex="-1"
                  :title="DISABLED_HINT"
                >
                  How Deals work
                </RevLink>
              </div>
            </div>
          </div>
        </div>

        <div class="md:grid md:grid-cols-2 md:gap-6">
          <!-- Feedback -->
          <RevCard class="p-6">
            <div class="mb-6 flex items-center justify-between">
              <div class="rev-body-1 flex items-center gap-2">
                <RevIcon name="IconRecommendation" size="24" />
                Share your feedback
              </div>
            </div>
            <div class="space-y-3">
              <div class="rev-heading-1">How do you like the Back Office?</div>
              <div>Help us improve your workspace. Take a minute to tell us what you think.</div>
              <RevButton variant="primary" size="small">Give feedback</RevButton>
            </div>
          </RevCard>

          <!-- Wallet -->
          <RevCard class="p-6">
            <div class="mb-6 flex items-center justify-between">
              <div class="rev-heading-2 flex items-center gap-2">
                <RevIcon name="IconMoney" size="24" />
                Wallet
              </div>
              <div class="flex items-center gap-6">
                <div class="w-[88px]">
                  <RevInputSelect id="currencies" v-model="walletCurrency" label="Currency" size="small" :options="['EUR', 'GBP', 'SEK']" />
                </div>
                <RevButton variant="secondary" size="small">View details</RevButton>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-6">
              <div class="flex w-full flex-col justify-between gap-3 rounded-bm-sm border rev-border-static-default-mid p-6">
                <div class="rev-body-1 flex items-start gap-2">Total amount</div>
                <div class="rev-heading-1">€13,227.85</div>
              </div>
              <div class="flex w-full flex-col justify-between gap-3 rounded-bm-sm border rev-border-static-default-mid p-6">
                <div>
                  <div class="rev-heading-2 rev-text-static-default-hi">Next payout: 07/09/2026</div>
                  <div class="rev-text-static-default-low">Sales period: 24/08/2026 – 31/08/2026</div>
                </div>
                <div class="rev-heading-2 rev-text-static-success-hi mt-6">€13,227.85</div>
              </div>
            </div>
          </RevCard>
        </div>

        <!-- Customer reviews -->
        <RevCard class="p-6">
          <div class="mb-6 flex items-center justify-between">
            <div class="rev-body-1 flex items-center gap-2">
              <RevIcon name="IconStarOutlined" size="24" />
              Customer reviews
            </div>
          </div>
          <div class="space-y-3">
            <RevRating :score="4.8" size="medium" />
            <div>Customer reviews over the last 6 months.</div>
            <RevButton variant="secondary" size="small">See all reviews</RevButton>
          </div>
        </RevCard>
      </div>
    </BoPage>
  </BoShell>
</template>
