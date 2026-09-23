<script setup lang="ts">
const NAV_ITEMS = ['Home', 'Insights', 'Customer Care', 'Listings', 'Orders', 'Opportunities', 'Money', 'Options', 'Seller Support'] as const
const SELLER_NAME = 'Merchant'

const activeNavItem = ref<string>('Home')

// Only Home, Listings and Opportunities are in scope for this test. The
// disabled treatment (styling, tooltip, aria) lives in BmShell.
const ENABLED_NAV = ['Home', 'Listings', 'Opportunities']
const disabledNavItems = NAV_ITEMS.filter((item) => !ENABLED_NAV.includes(item))

import dealCampaignsJson from './deals-step-one/deal_campaigns.json'

/** Products above their Deal target price — the sellers who can still unlock reduced commission. */
const eligibleCount = dealCampaignsJson.campaigns.reduce(
  (sum, c) => sum + c.products.filter((p) => p.price != null && p.price > p.targetPrice).length,
  0,
)

const baseHref = useRuntimeConfig().app.baseURL

function iconSrc(name: string) {
  return `${baseHref}icons/${name}.svg`
}

const emit = defineEmits<{ navItemClick: [item: string] }>()

function onNavClick(item: string) {
  activeNavItem.value = item
  emit('navItemClick', item)
}

function onViewDeals() {
  emit('navItemClick', 'Opportunities')
}
</script>

<template>
  <BmShell
    :nav-items="NAV_ITEMS"
    :active-nav-item="activeNavItem"
    :seller-name="SELLER_NAME"
    :disabled-nav-items="disabledNavItems"
    @nav-item-click="onNavClick"
  >
    <template #custom>
      <div class="px-8 pb-12 font-body">
        <h1 class="text-3xl font-bold text-bm-text-hi mt-6 mb-6">Hello {{ SELLER_NAME }}!</h1>

        <div class="grid grid-cols-4 gap-6 mb-6">
          <div class="col-span-1 bg-white rounded-xl border border-bm-border p-5">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-bm-text-hi" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M4.25 5A1.25 1.25 0 0 1 5.5 3.75h2A1.25 1.25 0 0 1 8.75 5v2A1.25 1.25 0 0 1 7.5 8.25h-2A1.25 1.25 0 0 1 4.25 7V5m1.5.25v1.5h1.5v-1.5h-1.5M4.25 11A1.25 1.25 0 0 1 5.5 9.75h2A1.25 1.25 0 0 1 8.75 11v2a1.25 1.25 0 0 1-1.25 1.25h-2A1.25 1.25 0 0 1 4.25 13v-2m1.5.25v1.5h1.5v-1.5h-1.5M4.25 17a1.25 1.25 0 0 1 1.25-1.25h2A1.25 1.25 0 0 1 8.75 17v2a1.25 1.25 0 0 1-1.25 1.25h-2A1.25 1.25 0 0 1 4.25 19v-2m1.5.25v1.5h1.5v-1.5h-1.5M10.25 6A.75.75 0 0 1 11 5.25h8a.75.75 0 0 1 0 1.5h-8A.75.75 0 0 1 10.25 6m0 12A.75.75 0 0 1 11 17.25h8a.75.75 0 0 1 0 1.5h-8A.75.75 0 0 1 10.25 18m0-6A.75.75 0 0 1 11 11.25h8a.75.75 0 0 1 0 1.5h-8A.75.75 0 0 1 10.25 12" clip-rule="evenodd" fill="currentColor"/></svg>
              <span class="text-sm font-semibold text-bm-text-hi">Task list</span>
            </div>
            <div class="flex items-center gap-2 mt-1 mb-4">
              <svg class="w-3.5 h-3.5 text-bm-text-low" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M8.25 4a.75.75 0 0 0-1.5 0v1.25H4.5A2.25 2.25 0 0 0 2.25 7.5v11a2.25 2.25 0 0 0 2.25 2.25h15a2.25 2.25 0 0 0 2.25-2.25v-11a2.25 2.25 0 0 0-2.25-2.25h-2.25V4a.75.75 0 0 0-1.5 0v1.25h-7.5V4m12 5.75V7.5a.75.75 0 0 0-.75-.75h-2.25V8a.75.75 0 0 1-1.5 0V6.75h-7.5V8a.75.75 0 0 1-1.5 0V6.75H4.5A.75.75 0 0 0 3.75 7.5v2.25h16.5m-16.5 1.5h16.5v7.25a.75.75 0 0 1-.75.75h-15a.75.75 0 0 1-.75-.75v-7.25" clip-rule="evenodd" fill="currentColor"/></svg>
              <span class="text-xs text-bm-text-low">Monday, 31 August 2026</span>
            </div>
            <a href="#" class="flex items-center justify-between py-2 text-sm text-bm-text-hi hover:text-bm-text-mid border-t border-bm-gray-100">
              <span>You have <span class="font-semibold">196</span> orders to process</span>
              <span class="text-bm-text-low">›</span>
            </a>
            <a href="#" class="flex items-center justify-between py-2 text-sm text-bm-text-hi hover:text-bm-text-mid border-t border-bm-gray-100">
              <span>You have <span class="font-semibold">141</span> customer care task(s) to complete.</span>
              <span class="text-bm-text-low">›</span>
            </a>
          </div>

          <div class="col-span-3 bg-white rounded-xl border border-bm-border p-5">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-bm-text-hi" viewBox="0 0 24 24"><path d="M10.5 6.125a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-9M6 9.625a.5.5 0 0 0-.5.5v5a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5H6m-1.5 7.25a.75.75 0 0 0 0 1.5h15a.75.75 0 0 0 0-1.5h-15m11.5-5.25a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h2a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-2" fill="currentColor"/></svg>
                <span class="text-sm font-semibold text-bm-text-hi">Sale insights</span>
              </div>
              <div class="flex items-center gap-2">
                <button class="border border-bm-border rounded-md text-xs px-3 py-1 text-bm-text-hi hover:bg-bm-gray-50 flex items-center gap-1">Last 7 days <span class="text-bm-text-low">▾</span></button>
                <button class="border border-bm-border rounded-md text-xs px-3 py-1 text-bm-text-hi hover:bg-bm-gray-50">View details</button>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-4">
              <div class="bg-white rounded-lg border border-bm-border p-4">
                <p class="text-xs text-bm-text-low mb-3">Orders received</p>
                <div class="flex items-baseline justify-between mb-2">
                  <div class="flex items-baseline gap-2">
                    <span class="text-2xl font-bold text-bm-text-hi">1,291</span>
                    <span class="text-xs text-bm-success font-medium">↑ +11%</span>
                  </div>
                  <span class="text-xs text-bm-text-low">Aug 24 – 30, '26</span>
                </div>
                <div class="flex items-baseline justify-between mb-2">
                  <span class="text-sm text-bm-text-mid">1,163</span>
                  <span class="text-xs text-bm-text-low">Aug 17 – 23, '26</span>
                </div>
                <div class="flex items-baseline justify-between">
                  <div class="flex items-baseline gap-2">
                    <span class="text-sm text-bm-text-mid">1,015</span>
                    <span class="text-xs text-bm-success font-medium">↑ +27%</span>
                  </div>
                  <span class="text-xs text-bm-text-low">Aug 24 – 30, '25</span>
                </div>
              </div>

              <div class="bg-white rounded-lg border border-bm-border p-4">
                <p class="text-xs text-bm-text-low mb-3">Sales revenue from shipped orders (shipping incl.)</p>
                <div class="flex items-baseline justify-between mb-2">
                  <div class="flex items-baseline gap-2">
                    <span class="text-base font-bold text-bm-text-hi">€474,142.38</span>
                    <span class="text-xs text-bm-success font-medium">↑ +22.52%</span>
                  </div>
                  <span class="text-xs text-bm-text-low">Aug 24 – 30, '26</span>
                </div>
                <div class="flex items-baseline justify-between mb-2">
                  <span class="text-sm text-bm-text-mid">€387,001.76</span>
                  <span class="text-xs text-bm-text-low">Aug 17 – 23, '26</span>
                </div>
                <div class="flex items-baseline justify-between">
                  <div class="flex items-baseline gap-2">
                    <span class="text-sm text-bm-text-mid">€289,601.55</span>
                    <span class="text-xs text-bm-success font-medium">↑ +63.72%</span>
                  </div>
                  <span class="text-xs text-bm-text-low">Aug 24 – 30, '25</span>
                </div>
              </div>

              <div class="bg-white rounded-lg border border-bm-border p-4">
                <p class="text-xs text-bm-text-low mb-3">Total refunds (shipping incl.)</p>
                <div class="flex items-baseline justify-between mb-2">
                  <div class="flex items-baseline gap-2">
                    <span class="text-base font-bold text-bm-text-hi">€5,430.22</span>
                    <span class="text-xs text-bm-success font-medium">↓ -61.31%</span>
                  </div>
                  <span class="text-xs text-bm-text-low">Aug 24 – 30, '26</span>
                </div>
                <div class="flex items-baseline justify-between mb-2">
                  <span class="text-sm text-bm-text-mid">€14,036.00</span>
                  <span class="text-xs text-bm-text-low">Aug 17 – 23, '26</span>
                </div>
                <div class="flex items-baseline justify-between">
                  <div class="flex items-baseline gap-2">
                    <span class="text-sm text-bm-text-mid">€54,867.35</span>
                    <span class="text-xs text-bm-success font-medium">↓ -90.1%</span>
                  </div>
                  <span class="text-xs text-bm-text-low">Aug 24 – 30, '25</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-6 mb-6 items-stretch" style="grid-template-columns: 1fr 1fr 320px;">
          <div class="bg-white rounded-xl border border-bm-border p-5">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-bm-text-hi" viewBox="0 0 24 24"><path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75a.75.75 0 0 0-1.5 0 8.25 8.25 0 1 1-16.5 0 8.25 8.25 0 0 1 14.124-5.794l.042.044H16a.75.75 0 0 0 0 1.5h3a1.25 1.25 0 0 0 1.25-1.25V3a.75.75 0 0 0-1.5 0v1.964A9.72 9.72 0 0 0 12 2.25" fill="currentColor"/></svg>
                <span class="text-sm font-semibold text-bm-text-hi">Trade In</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs text-bm-text-low">Last 7 days</span>
                <button class="border border-bm-border rounded-md text-xs px-3 py-1 text-bm-text-hi hover:bg-bm-gray-50">View details</button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white rounded-lg border border-bm-border p-4">
                <p class="text-xs text-bm-text-low mb-3">Orders received</p>
                <div class="flex items-baseline justify-between mb-2">
                  <span class="text-2xl font-bold text-bm-text-hi">1158</span>
                  <span class="text-xs text-bm-text-low">shipped</span>
                </div>
                <div class="flex items-baseline justify-between">
                  <span class="text-sm text-bm-text-mid">771</span>
                  <span class="text-xs text-bm-text-low">delivered</span>
                </div>
              </div>
              <div class="bg-white rounded-lg border border-bm-border p-4">
                <p class="text-xs text-bm-text-low mb-3">Orders that require action</p>
                <div class="flex items-baseline justify-between mb-2">
                  <span class="text-2xl font-bold text-bm-text-hi">610</span>
                  <span class="text-xs text-bm-text-low">to process</span>
                </div>
                <div class="flex items-baseline justify-between">
                  <span class="text-sm text-bm-text-mid">413</span>
                  <span class="text-xs text-bm-text-low">to reply to</span>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-bm-border p-5">
            <div class="flex items-center gap-2 mb-4">
              <svg class="w-4 h-4 text-bm-text-hi" viewBox="0 0 24 24"><path d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75a.75.75 0 0 0-1.5 0 8.25 8.25 0 1 1-16.5 0 8.25 8.25 0 0 1 14.124-5.794l.042.044H16a.75.75 0 0 0 0 1.5h3a1.25 1.25 0 0 0 1.25-1.25V3a.75.75 0 0 0-1.5 0v1.964A9.72 9.72 0 0 0 12 2.25" fill="currentColor"/></svg>
              <span class="text-sm font-semibold text-bm-text-hi">Opportunities</span>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-bm-text-hi">Sales</span>
                  <button class="border border-bm-border rounded-md text-xs px-2.5 py-1 text-bm-text-hi hover:bg-bm-gray-50">View details</button>
                </div>
                <div class="space-y-2">
                  <div class="bg-white rounded-lg border border-bm-border p-3">
                    <a href="#" class="inline-block bg-blue-50 rounded px-2 py-0.5 text-xs text-blue-600 font-medium mb-1">924 quick wins</a>
                    <p class="text-xs text-bm-text-low">Listings ready to convert with a small nudge.</p>
                  </div>
                  <div class="bg-white rounded-lg border border-bm-border p-3">
                    <a href="#" class="inline-block bg-blue-50 rounded px-2 py-0.5 text-xs text-blue-600 font-medium mb-1">64 listings in trouble</a>
                    <p class="text-xs text-bm-text-low">Fix issues to restore visibility.</p>
                  </div>
                  <div class="bg-white rounded-lg border border-bm-border p-3">
                    <a href="#" class="inline-block bg-blue-50 rounded px-2 py-0.5 text-xs text-blue-600 font-medium mb-1">250 BackBoxes to boost</a>
                    <p class="text-xs text-bm-text-low">Increase exposure on high-potential BackBoxes.</p>
                  </div>
                </div>
              </div>
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-semibold text-bm-text-hi">Trade-in</span>
                  <button class="border border-bm-border rounded-md text-xs px-2.5 py-1 text-bm-text-hi hover:bg-bm-gray-50">View details</button>
                </div>
                <div class="bg-white rounded-lg border border-bm-border p-3">
                  <a href="#" class="inline-block bg-blue-50 rounded px-2 py-0.5 text-xs text-blue-600 font-medium mb-1">1955 sourcing opportunities</a>
                  <p class="text-xs text-bm-text-low">Devices available to source from Back Market customers.</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Deals card — dark navy, count of listings above deal target from deal_campaigns.json -->
          <div class="relative overflow-hidden rounded-xl p-5 flex flex-col" style="background: #1F2A4A;">
            <div class="relative flex items-center gap-2">
              <img :src="iconSrc('IconDealFilled')" alt="" class="w-5 h-5" style="filter: brightness(0) invert(1);" />
              <span class="text-sm font-semibold text-white">Deals</span>
            </div>

            <div class="relative mt-4">
              <p class="text-6xl font-extrabold leading-none" style="color: #DDF77A;">{{ eligibleCount }}</p>
              <p class="mt-2 text-xl font-bold leading-snug" style="color: #DDF77A;">
                {{ eligibleCount === 1 ? 'listing can' : 'listings can' }} unlock reduced commission
              </p>
              <p class="mt-3 text-sm leading-relaxed" style="color: #AEB8D6;">
                Meet the Deal target price to pay less commission on selected products.
              </p>
            </div>

            <div class="relative mt-auto pt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                class="cursor-pointer inline-flex items-center justify-center rounded-bm px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                style="background: #DDF77A; color: #1F2A4A;"
                @click="onViewDeals"
              >
                View eligible listings
              </button>
              <button
                type="button"
                class="text-sm font-semibold text-white underline underline-offset-2 cursor-not-allowed"
                aria-disabled="true"
                tabindex="-1"
                title="Not available in this test"
              >
                How Deals work
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-4 gap-6 mb-6">
          <div class="col-span-2 bg-white rounded-xl border border-bm-border p-5">
            <div class="flex items-center gap-2 mb-4">
              <svg class="w-4 h-4 text-bm-text-low" viewBox="0 0 24 24"><path d="M7 6.25a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5H7M6.25 10A.75.75 0 0 1 7 9.25h10a.75.75 0 0 1 0 1.5H7A.75.75 0 0 1 6.25 10M7 12.25a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5H7" fill="currentColor"/><path fill-rule="evenodd" d="M21.75 14.5v-9a3.25 3.25 0 0 0-3.25-3.25h-13A3.25 3.25 0 0 0 2.25 5.5v9a3.25 3.25 0 0 0 3.25 3.25h.75V21a.75.75 0 0 0 1.219.586l4.794-3.836H18.5a3.25 3.25 0 0 0 3.25-3.25m-1.5 0a1.75 1.75 0 0 1-1.75 1.75h-6.325a1.25 1.25 0 0 0-.78.274L7.75 19.439V17.5a1.25 1.25 0 0 0-1.25-1.25h-1a1.75 1.75 0 0 1-1.75-1.75v-9A1.75 1.75 0 0 1 5.5 3.75h13a1.75 1.75 0 0 1 1.75 1.75v9" clip-rule="evenodd" fill="currentColor"/></svg>
              <span class="text-xs text-bm-text-low">Share your feedback</span>
            </div>
            <h2 class="text-xl font-bold text-bm-text-hi mb-2">How do you like the Back Office?</h2>
            <p class="text-sm text-bm-text-mid mb-5">Help us improve your workspace. Take a minute to tell us what you think.</p>
            <button class="bg-bm-text-hi text-white rounded px-4 py-2 text-sm font-medium hover:bg-bm-gray-700">Give feedback</button>
          </div>

          <div class="col-span-2 bg-white rounded-xl border border-bm-border p-5">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-bm-text-hi" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M8.75 10.5a3.25 3.25 0 1 1 6.5 0 3.25 3.25 0 0 1-6.5 0M12 8.75a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5" clip-rule="evenodd" fill="currentColor"/><path fill-rule="evenodd" d="M21.75 5.5a1.25 1.25 0 0 0-1.25-1.25h-17A1.25 1.25 0 0 0 2.25 5.5v10a1.25 1.25 0 0 0 1.25 1.25h17a1.25 1.25 0 0 0 1.25-1.25v-10m-4.17.25H6.42a3.505 3.505 0 0 1-2.67 2.67v4.16a3.505 3.505 0 0 1 2.67 2.67h11.16a3.505 3.505 0 0 1 2.67-2.67V8.42a3.505 3.505 0 0 1-2.67-2.67" clip-rule="evenodd" fill="currentColor"/><path d="M5 18.25a.75.75 0 0 0 0 1.5h14a.75.75 0 0 0 0-1.5H5" fill="currentColor"/></svg>
                <span class="text-sm font-semibold text-bm-text-hi">Wallet</span>
              </div>
              <div class="flex items-center gap-2">
                <button class="border border-bm-border rounded-md text-xs px-3 py-1 text-bm-text-hi hover:bg-bm-gray-50 flex items-center gap-1">EUR <span class="text-bm-text-low">▾</span></button>
                <button class="border border-bm-border rounded-md text-xs px-3 py-1 text-bm-text-hi hover:bg-bm-gray-50">View details</button>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-white rounded-lg border border-bm-border p-4">
                <p class="text-xs text-bm-text-low mb-2">Total amount</p>
                <p class="text-2xl font-bold text-bm-text-hi">€13,227.85</p>
              </div>
              <div class="bg-white rounded-lg border border-bm-border p-4">
                <p class="text-sm font-semibold text-bm-text-hi">Next payout: 07/09/2026</p>
                <p class="text-xs text-bm-text-low mt-0.5 mb-2">Sales period: 24/08/2026 – 31/08/2026</p>
                <p class="text-xl font-bold text-green-600">€13,227.85</p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-6">
          <div class="col-span-3 bg-white rounded-xl border border-bm-border p-5">
            <div class="flex items-center gap-2 mb-3">
              <svg class="w-4 h-4 text-bm-text-low" viewBox="0 0 24 24"><path d="M13.154 3.65c-.427-1.026-1.881-1.026-2.308 0L8.838 8.478l-5.21.418C2.519 8.984 2.07 10.367 2.914 11.09l3.97 3.4-1.213 5.085c-.258 1.082.919 1.937 1.868 1.357l4.46-2.724 4.462 2.724c.949.58 2.125-.275 1.867-1.357l-1.212-5.084 3.97-3.4c.844-.724.394-2.107-.714-2.196l-5.21-.418-2.008-4.826" fill="currentColor"/></svg>
              <span class="text-xs text-bm-text-low">Customer reviews</span>
            </div>
            <div class="flex items-center justify-between flex-wrap gap-3">
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-1">
                  <svg v-for="n in 4" :key="`full-${n}`" class="w-5 h-5 text-yellow-400" viewBox="0 0 24 24"><path d="M13.154 3.65c-.427-1.026-1.881-1.026-2.308 0L8.838 8.478l-5.21.418C2.519 8.984 2.07 10.367 2.914 11.09l3.97 3.4-1.213 5.085c-.258 1.082.919 1.937 1.868 1.357l4.46-2.724 4.462 2.724c.949.58 2.125-.275 1.867-1.357l-1.212-5.084 3.97-3.4c.844-.724.394-2.107-.714-2.196l-5.21-.418-2.008-4.826" fill="currentColor"/></svg>
                  <svg class="w-5 h-5 text-yellow-400" viewBox="0 0 24 24"><path d="M13.154 3.65c-.427-1.026-1.881-1.026-2.308 0L8.838 8.478l-5.21.418C2.519 8.984 2.07 10.367 2.914 11.09l3.97 3.4-1.213 5.085c-.258 1.082.919 1.937 1.868 1.357l4.46-2.724 4.462 2.724c.949.58 2.125-.275 1.867-1.357l-1.212-5.084 3.97-3.4c.844-.724.394-2.107-.714-2.196l-5.21-.418-2.008-4.826" fill="currentColor" /></svg>
                </div>
                <span class="text-sm font-semibold text-bm-text-hi">4.8/5</span>
                <span class="text-xs text-bm-text-low">(2,193 reviews)</span>
              </div>
              <a href="#" class="text-sm text-bm-text-hi underline hover:text-bm-text-mid">View all reviews →</a>
            </div>
          </div>
        </div>

      </div>
    </template>
  </BmShell>
</template>
