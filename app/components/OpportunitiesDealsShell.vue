<script setup lang="ts">
import dealCampaignsJson from './deals-step-one/deal_campaigns.json'

const SELLER_NAME = 'Merchant'
const NAV_ITEMS = ['Home', 'Insights', 'Customer Care', 'Listings', 'Orders', 'Opportunities', 'Money', 'Options', 'Seller Support'] as const
const TABS = ['Pricing', 'Deals'] as const

const activeNavItem = ref<string>('Opportunities')
const activeTab = ref<string>('Deals')

const emit = defineEmits<{ navItemClick: [item: string] }>()

function onNavClick(item: string) {
  activeNavItem.value = item
  emit('navItemClick', item)
}

type DealStatus = 'in-target' | 'near-target' | 'far-target' | 'not-listed'

// RevTag filled-variation tokens (Revolve): tinted bg + tone text, radius.xs
const DRAWER_STATUS: Record<DealStatus, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  'in-target': { label: 'In target', tone: 'success' },
  'near-target': { label: 'Near target', tone: 'warning' },
  'far-target': { label: 'Far target', tone: 'danger' },
  'not-listed': { label: 'Not listed', tone: 'neutral' },
}

const STATUS_TAG: Record<'success' | 'warning' | 'danger' | 'neutral', string> = {
  success: 'bg-[hsl(145,83%,77%)] text-[hsl(156,100%,21%)]',
  warning: 'bg-[hsl(38,90%,84%)] text-[hsl(42,75%,27%)]',
  danger: 'bg-[hsl(3,100%,92%)] text-[hsl(351,84%,39%)]',
  neutral: 'bg-[hsl(220,19%,94%)] text-[hsl(225,21%,7%)]',
}

const STATUS_TONE: Record<DealStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  'in-target': 'success',
  'near-target': 'warning',
  'far-target': 'danger',
  'not-listed': 'neutral',
}

interface DealModel {
  name: string
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

const campaigns: Campaign[] = dealCampaignsJson.campaigns.map((c) => ({
  id: c.id,
  name: c.name,
  currency: c.currency,
  timeLabel: daysLeftLabel(c.endDate),
  modelCount: c.products.length,
  markets: c.markets,
  models: c.products.map((p) => ({
    name: p.name,
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

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') closeDrawer()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <BmShell
    :nav-items="NAV_ITEMS"
    :active-nav-item="activeNavItem"
    :seller-name="SELLER_NAME"
    page-title="Opportunities"
    :tabs="TABS"
    :active-tab="activeTab"
    @nav-item-click="onNavClick"
    @update:active-tab="activeTab = $event"
  >
    <div class="py-8">
      <div class="max-w-7xl mx-auto px-6">
        <!-- ========== DEALS TAB ========== -->
        <template v-if="activeTab === 'Deals'">
          <div class="flex flex-col gap-4">
            <button
              v-for="campaign in campaigns"
              :key="campaign.id"
              type="button"
              class="card text-left px-6 py-5 flex items-center justify-between gap-6 hover:border-bm-border-action hover:shadow transition-all cursor-pointer"
              @click="openDrawer(campaign)"
            >
              <div class="min-w-0">
                <div class="flex items-center gap-3">
                  <h2 class="text-[15px] font-semibold text-bm-text-hi truncate">{{ campaign.name }}</h2>
                  <span :class="['inline-flex items-center rounded-[2px] px-2 py-0.5 text-xs font-semibold', STATUS_TAG.success]">Active</span>
                </div>
                <div class="mt-2 flex items-center gap-2 text-sm text-bm-text-mid">
                  <span>{{ campaign.timeLabel }}</span>
                  <span class="text-bm-border">|</span>
                  <span class="inline-flex items-center gap-1 font-medium text-bm-text-hi">
                    {{ campaign.modelCount }} models
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m9 5 7 7-7 7" /></svg>
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-1.5 shrink-0">
                <FlagChip v-for="code in campaign.markets" :key="code" :code="code" :height="10" />
              </div>
            </button>
          </div>
        </template>

        <!-- ========== PLACEHOLDER TABS ========== -->
        <template v-else>
          <div class="border border-dashed border-bm-border rounded-xl px-6 py-12 text-center">
            <h2 class="text-lg font-semibold text-bm-text-hi">{{ activeTab }}</h2>
            <p class="mt-2 text-sm text-bm-text-low">
              This is the Opportunities shell. Content for the {{ activeTab }} tab will be added in the next iteration.
            </p>
          </div>
        </template>
      </div>
    </div>

    <!-- ========== CAMPAIGN DETAILS DRAWER ========== -->
    <Transition name="drawer-fade">
      <div v-if="drawerOpen && activeCampaign" class="fixed inset-0 z-50 flex justify-end bg-black/30" role="presentation" @click.self="closeDrawer">
        <Transition name="drawer-slide" appear>
          <aside class="h-full w-[976px] min-w-[976px] max-w-[94vw] flex flex-col shadow-xl" style="background: #F8F9FC; border-radius: 12px 0 0 12px;" role="dialog" aria-modal="true" :aria-label="`Campaign details: ${activeCampaign.name}`">
            <div class="relative flex items-center justify-center h-[60px] border-b border-bm-border bg-white shrink-0" style="border-radius: 12px 0 0 0;">
              <h2 class="text-base font-semibold text-bm-text-hi">Campaign details</h2>
              <button type="button" class="absolute right-6 w-8 h-8 rounded-full flex items-center justify-center text-bm-text-muted hover:bg-bm-gray-100 transition-colors cursor-pointer" aria-label="Close" @click="closeDrawer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div class="flex-1 overflow-y-auto px-12 py-8">
              <div class="flex items-start justify-between gap-4">
                <span :class="['inline-flex items-center rounded-[2px] px-2 py-0.5 text-xs font-semibold', STATUS_TAG.success]">Active</span>
                <span class="inline-flex items-center gap-1.5 text-sm font-medium text-bm-text-mid">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" /><path stroke-linecap="round" stroke-linejoin="round" d="M12 7v5l3 2" /></svg>
                  {{ activeCampaign.timeLabel }}
                </span>
              </div>

              <h3 class="mt-2 text-2xl font-bold text-bm-text-hi leading-snug">{{ activeCampaign.name }}</h3>

              <p class="mt-3 text-sm text-bm-text-mid leading-relaxed">
                Price your eligible listings at the deal target price to qualify for reduced commission.
              </p>

              <div class="mt-4 flex items-center gap-1.5">
                <FlagChip v-for="code in activeCampaign.markets" :key="code" :code="code" :height="10" />
              </div>

              <div class="mt-8 overflow-x-auto rounded-bm-sm">
                <table class="w-full border-collapse">
                  <thead>
                    <tr class="bg-bm-gray-100">
                      <th class="text-left px-4 py-3 text-sm font-semibold text-bm-text-hi" style="width: 38%;">Product</th>
                      <th class="text-right px-4 py-3 text-sm font-semibold text-bm-text-hi" style="width: 22%;">Price</th>
                      <th class="text-left px-4 py-3 text-sm font-semibold text-bm-text-hi" style="width: 16%;">Status</th>
                      <th class="text-right px-4 py-3 text-sm font-semibold text-bm-text-hi" style="width: 24%;">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white">
                    <tr v-for="(model, i) in activeCampaign.models" :key="`${activeCampaign.id}-${i}`" class="border-b border-bm-border align-middle">
                      <td class="px-4 py-4">
                        <p class="text-sm font-semibold text-bm-text-hi leading-snug">{{ model.name }}</p>
                        <div class="mt-2 flex items-center gap-1.5 flex-wrap">
                          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-bm-gray-100 text-bm-text-mid">{{ model.grade }}</span>
                          <span v-if="model.offerType" class="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-bm-gray-100 text-bm-text-mid">{{ model.offerType }}</span>
                          <span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-bm-gray-100 text-bm-text-mid">
                            <FlagChip :code="model.market" :height="8" />
                            {{ model.market }}
                          </span>
                        </div>
                      </td>
                      <td class="px-4 py-4 text-right whitespace-nowrap">
                        <template v-if="model.price != null">
                          <p class="text-sm font-semibold text-bm-text-hi whitespace-nowrap">{{ formatPrice(model.price, activeCampaign.currency) }}</p>
                          <p class="mt-1 text-xs whitespace-nowrap" :class="model.price - model.targetPrice > 0 ? 'text-bm-warning' : 'text-bm-text-low'">
                            <template v-if="model.price - model.targetPrice > 0">{{ formatPrice(model.price - model.targetPrice, activeCampaign.currency) }} above target</template>
                            <template v-else>At target</template>
                          </p>
                          <p class="mt-1 text-xs text-bm-text-low whitespace-nowrap">Target: {{ formatPrice(model.targetPrice, activeCampaign.currency) }}</p>
                        </template>
                        <template v-else>
                          <p class="text-sm text-bm-text-low italic whitespace-nowrap">Not listed</p>
                          <p class="mt-1 text-xs text-bm-text-low whitespace-nowrap">Target: {{ formatPrice(model.targetPrice, activeCampaign.currency) }}</p>
                        </template>
                      </td>
                      <td class="px-4 py-4">
                        <span :class="['inline-flex items-center rounded-[2px] px-2 py-0.5 text-xs font-semibold', STATUS_TAG[STATUS_TONE[model.status]]]">
                          {{ DRAWER_STATUS[model.status].label }}
                        </span>
                      </td>
                      <td class="px-4 py-4">
                        <div class="flex flex-col items-end gap-2">
                          <button
                            v-if="model.status !== 'in-target'"
                            type="button"
                            class="cursor-pointer inline-flex items-center justify-center rounded-bm px-3 py-1.5 text-sm font-semibold bg-bm-text-hi text-white hover:bg-bm-gray-700 transition-colors"
                          >
                            {{ model.status === 'not-listed' ? 'Create listing' : 'Update price' }}
                          </button>
                          <button v-if="model.status !== 'not-listed'" type="button" class="cursor-pointer inline-flex items-center justify-center rounded-bm px-3 py-1.5 text-sm font-semibold bg-white border border-bm-border-action text-bm-text-hi hover:bg-bm-gray-50 transition-colors">
                            View listing
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </aside>
        </Transition>
      </div>
    </Transition>
  </BmShell>
</template>

<style scoped>
.drawer-fade-enter-active,
.drawer-fade-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-fade-enter-from,
.drawer-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active {
  transition: transform 0.25s ease;
}
.drawer-slide-leave-active {
  transition: transform 0.2s ease;
}
.drawer-slide-enter-from,
.drawer-slide-leave-to {
  transform: translateX(100%);
}
</style>
