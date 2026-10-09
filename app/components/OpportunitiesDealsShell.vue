<script setup lang="ts">
import dealCampaignsJson from './deals-step-one/deal_campaigns.json'
import dealCampaignsCsv from './deals-step-one/deal_campaigns_export.csv?raw'

const SELLER_NAME = 'Merchant'
const NAV_ITEMS = ['Home', 'Insights', 'Customer Care', 'Listings', 'Orders', 'Opportunities', 'Money', 'Options', 'Seller Support'] as const

const activeTab = ref<string>('Deals')

// Only Home, Listings and Opportunities are in scope for this test; Deals is
// the only sub-tab with content. Disabled items show "Not available in this
// test" on hover and are neither clickable nor keyboard-focusable.
// Layout and Revolve components are copied from front-apps
// (apps/back-office-seller/app/scopes/opportunities/pages/tabs/deals).
const ENABLED_NAV = ['Home', 'Listings', 'Opportunities']
const disabledNavItems = NAV_ITEMS.filter((item) => !ENABLED_NAV.includes(item))
const TABS = ['Deals', 'Pricing', 'Inventory'] as const
const disabledTabs = ['Pricing', 'Inventory']

const emit = defineEmits<{ navItemClick: [item: string] }>()

type DealStatus = 'in-target' | 'near-target' | 'far-target' | 'not-listed'

// Status -> RevTag label and variant, same mapping as the real Back Office
// (front-apps StatusCell.constants).
type TagVariant = 'success' | 'warning' | 'danger' | 'secondary'

const STATUS_TAG: Record<DealStatus, { label: string; variant: TagVariant }> = {
  'in-target': { label: 'In target', variant: 'success' },
  'near-target': { label: 'Near target', variant: 'warning' },
  'far-target': { label: 'Far target', variant: 'danger' },
  'not-listed': { label: 'Not listed', variant: 'secondary' },
}

const DISABLED_HINT = 'Not available in this test'

const COLUMNS = [
  { key: 'product', label: 'Product' },
  { key: 'price', label: 'Price' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions' },
]

interface DealModel {
  name: string
  sku: string | null
  grade: string
  offerType: string | null
  market: string
  price: number | null
  targetPrice: number
  status: DealStatus
}

interface Campaign {
  id: string
  name: string
  currency: string
  timeLabel: string
  modelCount: number
  markets: string[]
  models: DealModel[]
  /** Commission discount for every product in the campaign, in percent. */
  commissionSaving: number
}

/**
 * Real campaign data from deal_campaigns.json (the only data source).
 * Status, time label and price formatting are derived at render time
 * from the JSON's own `today` reference date.
 */
const DATA_TODAY = dealCampaignsJson.today

const NEAR_TARGET_THRESHOLD = 1.1

function computeStatus(price: number | null, targetPrice: number): DealStatus {
  if (price == null) return 'not-listed'
  if (price <= targetPrice) return 'in-target'
  if (price <= targetPrice * NEAR_TARGET_THRESHOLD) return 'near-target'
  return 'far-target'
}

function isoToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function daysLeftLabel(endDateIso: string): string {
  const today = isoToDate(DATA_TODAY)
  const end = isoToDate(endDateIso)
  const diffDays = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return '1 day left'
  return `${diffDays} days left`
}

const CURRENCY_SYMBOL: Record<string, string> = {
  EUR: '€',
  GBP: '£',
}

function formatPrice(value: number, currency: string) {
  const symbol = CURRENCY_SYMBOL[currency] ?? ''
  return `${symbol}${value.toFixed(2)}`
}

/**
 * Download CSV: serves the bundled deal_campaigns_export.csv (built from the
 * prototype's deal_campaigns.json, seller columns removed) as a real file
 * download, like the actual Back Office export.
 */
function onDownloadCsv() {
  const blob = new Blob([dealCampaignsCsv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'seller_deal_campaigns_aug_sep_2026.csv'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ASSUMPTION (not confirmed yet): a campaign has ONE commission discount that
// applies to every product in it, and campaigns differ from each other.
// If the discount turns out to differ per product, it needs its own column
// in the drawer table instead of the tag on the campaign.
// PLACEHOLDER figures: deal_campaigns.json has no commission data.
const CAMPAIGN_COMMISSION_SAVING = [3, 2, 4, 3]

const campaigns: Campaign[] = dealCampaignsJson.campaigns.map((c, campaignIndex) => ({
  id: c.id,
  name: c.name,
  currency: c.currency,
  timeLabel: daysLeftLabel(c.endDate),
  modelCount: c.products.length,
  markets: c.markets,
  commissionSaving: CAMPAIGN_COMMISSION_SAVING[campaignIndex % CAMPAIGN_COMMISSION_SAVING.length],
  models: c.products.map((p) => ({
    name: p.name,
    sku: p.sku,
    grade: p.grade,
    offerType: p.offerType,
    market: p.market,
    price: p.price,
    targetPrice: p.targetPrice,
    status: computeStatus(p.price, p.targetPrice),
  })),
}))

const activeCampaign = ref<Campaign | null>(null)
const drawerOpen = ref(false)

function openDrawer(campaign: Campaign) {
  activeCampaign.value = campaign
  drawerOpen.value = true
}

function closeDrawer() {
  drawerOpen.value = false
}

/**
 * Simulated "Update price" — prototype-only interaction, stored entirely in
 * this drawer's local state. After a 3s loading state the row behaves as if
 * the price had been set to the Deal target (In target). Overrides are keyed
 * by row index and reset when the drawer closes; pending timers are cancelled
 * so reopening any campaign shows the original data.
 */
const UPDATE_PRICE_DELAY_MS = 3000

type RowOverrideState = 'loading' | 'updated' | 'flash'

const rowOverrides = ref<Record<number, RowOverrideState>>({})
const overrideTimers = new Map<number, ReturnType<typeof setTimeout>>()
const flashTimers = new Map<number, ReturnType<typeof setTimeout>>()

function isRowLoading(i: number) {
  return rowOverrides.value[i] === 'loading'
}

function isRowUpdated(i: number) {
  return rowOverrides.value[i] === 'updated' || rowOverrides.value[i] === 'flash'
}

function isRowFlashing(i: number) {
  return rowOverrides.value[i] === 'flash'
}

function onUpdatePrice(i: number) {
  if (isRowLoading(i) || isRowUpdated(i)) return
  rowOverrides.value[i] = 'loading'
  const timer = setTimeout(() => {
    overrideTimers.delete(i)
    rowOverrides.value[i] = 'updated'
    // Pale-green flash that fades out over ~1s
    requestAnimationFrame(() => {
      rowOverrides.value[i] = 'flash'
      const flash = setTimeout(() => {
        flashTimers.delete(i)
        rowOverrides.value[i] = 'updated'
      }, 1000)
      flashTimers.set(i, flash)
    })
  }, UPDATE_PRICE_DELAY_MS)
  overrideTimers.set(i, timer)
}

function resetOverrides() {
  overrideTimers.forEach(clearTimeout)
  flashTimers.forEach(clearTimeout)
  overrideTimers.clear()
  flashTimers.clear()
  rowOverrides.value = {}
}

watch(drawerOpen, (open) => {
  if (!open) resetOverrides()
})

/** Table rows for the open campaign: each model plus its row index (the key the price simulation uses). */
const drawerRows = computed(() =>
  (activeCampaign.value?.models ?? []).map((model, index) => ({
    id: `${activeCampaign.value?.id}-${index}`,
    index,
    model,
  })),
)

/** Pale-green flash on the row that was just updated (fades out through RevTable's row transition). */
function rowStyle(row: { index: number }) {
  return isRowFlashing(row.index) ? { backgroundColor: 'var(--rev-bg-static-success-low)' } : undefined
}
</script>

<template>
  <BoShell
    active-nav-item="Opportunities"
    :seller-name="SELLER_NAME"
    :disabled-nav-items="disabledNavItems"
    @nav-item-click="emit('navItemClick', $event)"
  >
    <BoPage title="Opportunities">
      <!-- id: "View eligible listings" on Home scrolls here -->
      <RevTabs id="deals-section" class="mb-8 scroll-mt-4" label="Opportunities sections">
        <RevTabItem
          v-for="tab in TABS"
          :key="tab"
          :label="tab"
          :active="tab === activeTab"
          :disabled="disabledTabs.includes(tab)"
          :title="disabledTabs.includes(tab) ? DISABLED_HINT : undefined"
          @click="activeTab = tab"
        />
      </RevTabs>

      <!-- ========== DEALS TAB ========== -->
      <div v-if="activeTab === 'Deals'" class="p-6 md:p-8">
        <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 class="rev-heading-2">Active Deals</h2>
          <RevButton variant="secondary" size="small" icon="IconDownload" @click="onDownloadCsv">Download CSV</RevButton>
        </div>

        <div class="flex flex-col gap-4">
          <RevButtonCard
            v-for="campaign in campaigns"
            :key="campaign.id"
            class="w-full text-left"
            @click="openDrawer(campaign)"
          >
            <div class="flex flex-col gap-4 p-6">
              <div class="flex items-center justify-between gap-4">
                <div class="flex flex-wrap items-center gap-2">
                  <RevTag label="Active" variant="success" />
                  <RevTag :label="`${campaign.commissionSaving}% less commission`" variant="info" icon="IconDealFilled" />
                </div>

                <div class="flex items-center gap-2">
                  <RevIcon name="IconClock" size="16" />
                  <span class="rev-body-2">{{ campaign.timeLabel }}</span>

                  <span class="flex items-center gap-1 rounded-[1.25rem] border rev-border-static-default-mid px-2 py-1">
                    <span class="rev-body-2">{{ campaign.modelCount }} models</span>
                    <RevIcon name="IconChevronRight" size="16" />
                  </span>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-4">
                <h3 class="rev-heading-3 grow">{{ campaign.name }}</h3>

                <div class="flex flex-wrap gap-1.5">
                  <BoPill v-for="code in campaign.markets" :key="code">
                    <RevCountryFlag :country-code="code" size="extra-small" />
                    <span>{{ code }}</span>
                  </BoPill>
                </div>
              </div>
            </div>
          </RevButtonCard>
        </div>
      </div>

      <!-- ========== PLACEHOLDER TABS ========== -->
      <div v-else class="p-6 md:p-8">
        <RevCard class="px-6 py-12 text-center">
          <h2 class="rev-heading-2">{{ activeTab }}</h2>
          <p class="rev-body-1 rev-text-static-default-low mt-2">
            This is the Opportunities shell. Content for the {{ activeTab }} tab will be added in the next iteration.
          </p>
        </RevCard>
      </div>
    </BoPage>

    <!-- ========== CAMPAIGN DETAILS DRAWER ========== -->
    <RevDrawer :open="drawerOpen && activeCampaign !== null" title="Campaign details" size="large" @close="closeDrawer">
      <div v-if="activeCampaign" class="flex flex-col gap-4">
        <div class="flex items-center justify-between gap-4">
          <div class="flex flex-wrap items-center gap-2">
            <RevTag label="Active" variant="success" />
            <RevTag :label="`${activeCampaign.commissionSaving}% less commission`" variant="info" icon="IconDealFilled" />
          </div>

          <div class="flex items-center gap-2">
            <RevIcon name="IconClock" size="16" />
            <span class="rev-body-2">{{ activeCampaign.timeLabel }}</span>
          </div>
        </div>

        <h2 class="rev-heading-2">{{ activeCampaign.name }}</h2>
        <p class="rev-body-2 rev-text-static-default-low">
          Price your eligible listings at the deal target price to pay {{ activeCampaign.commissionSaving }}% less commission.
        </p>

        <div class="flex flex-wrap gap-1.5">
          <BoPill v-for="code in activeCampaign.markets" :key="code">
            <RevCountryFlag :country-code="code" size="extra-small" />
            <span>{{ code }}</span>
          </BoPill>
        </div>

        <RevTable :collection="drawerRows" :columns="COLUMNS" striped-rows :row-style="rowStyle">
          <template #body-product="{ item }">
            <div class="flex flex-col gap-1">
              <span class="rev-body-1-bold">{{ item.model.name }}</span>
              <span v-if="item.model.sku != null" class="rev-body-2 rev-text-static-default-low">SKU: {{ item.model.sku }}</span>
              <div class="flex flex-wrap items-center gap-1.5">
                <BoPill tooltip-content="Grade">
                  <RevIcon name="IconGrade" size="16" />
                  <span>{{ item.model.grade }}</span>
                </BoPill>
                <BoPill v-if="item.model.offerType === 'New battery'" tone="new-battery" tooltip-content="New battery">
                  <RevIcon name="IconBattery" size="16" />
                </BoPill>
                <BoPill>
                  <RevCountryFlag :country-code="item.model.market" size="extra-small" />
                  <span>{{ item.model.market }}</span>
                </BoPill>
              </div>
            </div>
          </template>

          <template #body-price="{ item }">
            <RevSpinner v-if="isRowLoading(item.index)" size="small" alternative-text="Updating price" />
            <div v-else class="flex flex-col gap-0.5 whitespace-nowrap">
              <template v-if="isRowUpdated(item.index)">
                <span class="rev-body-1-bold">{{ formatPrice(item.model.targetPrice, activeCampaign.currency) }}</span>
              </template>
              <template v-else-if="item.model.price != null">
                <span class="rev-body-1-bold">{{ formatPrice(item.model.price, activeCampaign.currency) }}</span>
                <span v-if="item.model.price - item.model.targetPrice > 0" class="rev-body-2 rev-text-static-warning-hi">
                  {{ formatPrice(item.model.price - item.model.targetPrice, activeCampaign.currency) }} above target
                </span>
              </template>
              <span v-else class="rev-body-2 rev-text-static-default-low italic">Not listed</span>
              <span class="rev-caption rev-text-static-default-low">Target: {{ formatPrice(item.model.targetPrice, activeCampaign.currency) }}</span>
            </div>
          </template>

          <template #body-status="{ item }">
            <RevSpinner v-if="isRowLoading(item.index)" size="small" alternative-text="Updating price" />
            <RevTag
              v-else
              :label="STATUS_TAG[isRowUpdated(item.index) ? 'in-target' : item.model.status].label"
              :variant="STATUS_TAG[isRowUpdated(item.index) ? 'in-target' : item.model.status].variant"
            />
          </template>

          <template #body-actions="{ item }">
            <div class="flex flex-col gap-1.5">
              <RevButton
                v-if="item.model.status === 'not-listed'"
                variant="primary"
                size="small"
                style="cursor: not-allowed;"
                aria-disabled="true"
                tabindex="-1"
                :title="DISABLED_HINT"
              >
                Create listing
              </RevButton>
              <RevButton
                v-else-if="!isRowUpdated(item.index) && item.model.status !== 'in-target'"
                variant="primary"
                size="small"
                :loading="isRowLoading(item.index)"
                @click="onUpdatePrice(item.index)"
              >
                Update price
              </RevButton>
              <RevButton
                v-if="!isRowLoading(item.index) && item.model.status !== 'not-listed'"
                variant="secondary"
                size="small"
              >
                View listing
              </RevButton>
            </div>
          </template>
        </RevTable>
      </div>
    </RevDrawer>
  </BoShell>
</template>
