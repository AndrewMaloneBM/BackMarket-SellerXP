<script setup lang="ts">
import BmStatusBadge from '~/components/prototypes/BmStatusBadge.vue'

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

interface DealModel {
  id: string
  name: string
  conditions: string[]
  market: string
  price: number | null
  target: number
  status: DealStatus
}

interface Campaign {
  id: string
  name: string
  timeLabel: string
  modelCount: number
  markets: string[]
  models: DealModel[]
}

const campaigns: Campaign[] = [
  {
    id: 'apple-samsung',
    name: 'Apple iPhones & Samsung Galaxies - selected models',
    timeLabel: 'Today',
    modelCount: 6,
    markets: ['FR', 'DE', 'ES', 'GB'],
    models: [
      { id: 'm1', name: 'Apple iPhone 14 Pro 128GB', conditions: ['Very Good'], market: 'FR', price: 749.99, target: 699.99, status: 'in-target' },
      { id: 'm2', name: 'Apple iPhone 13 256GB', conditions: ['Eco'], market: 'DE', price: 479.99, target: 449.99, status: 'near-target' },
      { id: 'm3', name: 'Samsung Galaxy S23 Ultra 512GB', conditions: ['Premium', 'Outlet'], market: 'ES', price: 999.99, target: 899.99, status: 'far-target' },
      { id: 'm4', name: 'Samsung Galaxy A54 5G 128GB', conditions: ['Flawless'], market: 'GB', price: null, target: 299.99, status: 'not-listed' },
    ],
  },
  {
    id: 'google-pixel',
    name: 'Google Pixel 8 & 9 - reduced commission',
    timeLabel: '8 days left',
    modelCount: 12,
    markets: ['FR', 'DE', 'IT'],
    models: [
      { id: 'm1', name: 'Apple iPhone 14 Pro 128GB', conditions: ['Very Good'], market: 'FR', price: 749.99, target: 689.99, status: 'in-target' },
      { id: 'm2', name: 'Apple iPhone 13 256GB', conditions: ['Eco'], market: 'DE', price: 479.99, target: 449.99, status: 'near-target' },
      { id: 'm3', name: 'Samsung Galaxy S23 Ultra 512GB', conditions: ['Premium', 'Outlet'], market: 'ES', price: 999.99, target: 899.99, status: 'far-target' },
      { id: 'm4', name: 'Samsung Galaxy A54 5G 128GB', conditions: ['Flawless'], market: 'GB', price: null, target: 299.99, status: 'not-listed' },
    ],
  },
  {
    id: 'macbook-air',
    name: 'MacBook Air M3 - back to school promo',
    timeLabel: '3 days left',
    modelCount: 4,
    markets: ['FR', 'ES', 'BE', 'NL', 'GB'],
    models: [
      { id: 'm1', name: 'Apple iPhone 14 Pro 128GB', conditions: ['Very Good'], market: 'FR', price: 749.99, target: 689.99, status: 'in-target' },
      { id: 'm2', name: 'Apple iPhone 13 256GB', conditions: ['Eco'], market: 'DE', price: 479.99, target: 449.99, status: 'near-target' },
      { id: 'm3', name: 'Samsung Galaxy S23 Ultra 512GB', conditions: ['Premium', 'Outlet'], market: 'ES', price: 999.99, target: 899.99, status: 'far-target' },
      { id: 'm4', name: 'Samsung Galaxy A54 5G 128GB', conditions: ['Flawless'], market: 'GB', price: null, target: 299.99, status: 'not-listed' },
    ],
  },
]

const DRAWER_STATUS: Record<DealStatus, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  'in-target': { label: 'In target', tone: 'success' },
  'near-target': { label: 'Near target', tone: 'warning' },
  'far-target': { label: 'Far target', tone: 'danger' },
  'not-listed': { label: 'Not listed', tone: 'neutral' },
}

function formatPrice(value: number) {
  return `€${value.toFixed(2)}`
}

function aboveTarget(model: DealModel) {
  if (model.price == null) return null
  return `€${(model.price - model.target).toFixed(2)} above target`
}

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
                  <BmStatusBadge label="Active" tone="success" />
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
          <aside class="h-full w-[560px] max-w-[92vw] bg-white shadow-xl flex flex-col" role="dialog" aria-modal="true" :aria-label="`Campaign details: ${activeCampaign.name}`">
            <div class="flex items-center justify-between px-6 h-14 border-b border-bm-border shrink-0">
              <h2 class="text-base font-semibold text-bm-text-hi">Campaign details</h2>
              <button type="button" class="w-8 h-8 rounded-full flex items-center justify-center text-bm-text-muted hover:bg-bm-gray-100 transition-colors cursor-pointer" aria-label="Close" @click="closeDrawer">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div class="flex-1 overflow-y-auto px-6 py-6">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <BmStatusBadge label="Active" tone="success" />
                  <h3 class="mt-2 text-xl font-bold text-bm-text-hi leading-snug">{{ activeCampaign.name }}</h3>
                </div>
                <span class="shrink-0 text-sm font-medium text-bm-text-mid">{{ activeCampaign.timeLabel }}</span>
              </div>

              <p class="mt-3 text-sm text-bm-text-mid leading-relaxed">
                Price your eligible listings at the deal target price to qualify for reduced commission.
              </p>

              <div class="mt-4 flex items-center gap-1.5">
                <FlagChip v-for="code in activeCampaign.markets" :key="code" :code="code" :height="10" />
              </div>

              <div class="mt-6 overflow-x-auto">
                <table class="w-full border-collapse">
                  <thead>
                    <tr class="border-b border-bm-border">
                      <th class="text-left px-4 py-3 text-sm font-semibold text-bm-text-hi">Product</th>
                      <th class="text-left px-4 py-3 text-sm font-semibold text-bm-text-hi">Price</th>
                      <th class="text-left px-4 py-3 text-sm font-semibold text-bm-text-hi">Status</th>
                      <th class="text-left px-4 py-3 text-sm font-semibold text-bm-text-hi">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="model in activeCampaign.models" :key="model.id" class="border-b border-bm-border align-top">
                      <td class="px-4 py-4">
                        <p class="text-sm font-semibold text-bm-text-hi leading-snug">{{ model.name }}</p>
                        <div class="mt-2 flex items-center gap-1.5 flex-wrap">
                          <span v-for="condition in model.conditions" :key="condition" class="inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-bm-gray-100 text-bm-text-mid">{{ condition }}</span>
                          <span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-bm-gray-100 text-bm-text-mid">
                            <FlagChip :code="model.market" :height="8" />
                            {{ model.market }}
                          </span>
                        </div>
                      </td>
                      <td class="px-4 py-4">
                        <template v-if="model.price != null">
                          <p class="text-sm font-semibold text-bm-text-hi">{{ formatPrice(model.price) }}</p>
                          <p class="mt-1 text-xs text-bm-danger">{{ aboveTarget(model) }}</p>
                          <p class="mt-1 text-xs text-bm-text-low">Target: {{ formatPrice(model.target) }}</p>
                        </template>
                        <template v-else>
                          <p class="text-sm text-bm-text-low">Not listed</p>
                          <p class="mt-1 text-xs text-bm-text-low">Target: {{ formatPrice(model.target) }}</p>
                        </template>
                      </td>
                      <td class="px-4 py-4">
                        <BmStatusBadge :label="DRAWER_STATUS[model.status].label" :tone="DRAWER_STATUS[model.status].tone" />
                      </td>
                      <td class="px-4 py-4">
                        <div class="flex flex-col items-start gap-2">
                          <button
                            v-if="model.status !== 'in-target'"
                            type="button"
                            class="cursor-pointer inline-flex items-center justify-center h-[26px] px-3 rounded-md text-xs font-semibold bg-bm-text-hi text-white hover:opacity-90 transition-opacity"
                          >
                            {{ model.status === 'not-listed' ? 'Create listing' : 'Update price' }}
                          </button>
                          <button type="button" class="cursor-pointer inline-flex items-center justify-center h-[26px] px-3 rounded-md text-xs font-semibold bg-white border border-bm-text-hi text-bm-text-hi hover:bg-bm-gray-100 transition-colors">
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
