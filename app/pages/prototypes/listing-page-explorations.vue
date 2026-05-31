<script setup lang="ts">
import type { PrototypeConcept } from '~/composables/usePrototypeSidebar'

definePageMeta({ layout: false })

const NAV_ITEMS = ['Home', 'Insights', 'Customer Care', 'Listings', 'Orders', 'Opportunities', 'Money', 'Options', 'Seller Support'] as const
const SELLER_NAME = 'TechRenew GmbH'

const conceptMeta: readonly PrototypeConcept[] = [
  {
    name: 'Baseline',
    prdFeature: 'Listings page — current state replica',
    prdMetric: 'Starting point for exploring listing management improvements.',
    pros: ['Mirrors current Back Office experience'],
    cons: ['No changes yet — pure replica'],
    pages: [
      {
        id: 'listings',
        label: 'Listings',
        navItem: 'Listings',
        changes: ['Faithful copy of the current Listings page'],
      },
    ],
  },
]

const {
  sidebarOpen,
  previewMode,
  activeConcept,
  activePages,
  flashHotspots,
  showHotspots,
} = usePrototypeSidebar(conceptMeta)

const activePageId = computed(() => activePages.value[activeConcept.value - 1] ?? '')
function setActivePage(id: string) {
  activePages.value[activeConcept.value - 1] = id
}

const activeNavItem = ref<string>('Listings')
const activeTab = ref<string>('All listings')

const tabs = ['All listings', 'Online', 'Offline', 'Drafts', 'Inactive'] as const

const search = ref('')
const selectedIds = ref<Set<string>>(new Set())

type ListingStatus = 'Online' | 'Offline' | 'Draft' | 'In review' | 'Rejected'

interface Listing {
  id: string
  image: string
  title: string
  sku: string
  category: string
  condition: 'Excellent' | 'Good' | 'Fair' | 'New'
  price: number
  stock: number
  status: ListingStatus
  updated: string
}

const listings: Listing[] = [
  { id: 'L-10421', image: '📱', title: 'iPhone 13 Pro 256GB Graphite — Unlocked', sku: 'IP13P-256-GR', category: 'Smartphones', condition: 'Excellent', price: 699, stock: 24, status: 'Online', updated: '2 hours ago' },
  { id: 'L-10422', image: '💻', title: 'MacBook Air M2 13" 256GB Midnight 2022', sku: 'MBA-M2-256-MN', category: 'Laptops', condition: 'Good', price: 849, stock: 11, status: 'Online', updated: '5 hours ago' },
  { id: 'L-10423', image: '📱', title: 'Samsung Galaxy S22 Ultra 128GB Phantom Black', sku: 'SGS22U-128-BK', category: 'Smartphones', condition: 'Good', price: 489, stock: 7, status: 'Online', updated: 'Yesterday' },
  { id: 'L-10424', image: '🎧', title: 'AirPods Pro (2nd Gen) — MagSafe Charging Case', sku: 'APP2-MAG', category: 'Audio', condition: 'Excellent', price: 179, stock: 32, status: 'Online', updated: 'Yesterday' },
  { id: 'L-10425', image: '⌚', title: 'Apple Watch Series 8 GPS 45mm Aluminium', sku: 'AW8-45-AL', category: 'Wearables', condition: 'Good', price: 269, stock: 4, status: 'Offline', updated: '2 days ago' },
  { id: 'L-10426', image: '📱', title: 'Google Pixel 7 128GB Obsidian', sku: 'GP7-128-OB', category: 'Smartphones', condition: 'Fair', price: 309, stock: 9, status: 'In review', updated: '2 days ago' },
  { id: 'L-10427', image: '💻', title: 'Dell XPS 13 9310 Core i7 16GB 512GB', sku: 'DXP13-i7-512', category: 'Laptops', condition: 'Good', price: 759, stock: 3, status: 'Online', updated: '3 days ago' },
  { id: 'L-10428', image: '📱', title: 'iPhone 12 64GB Blue — Unlocked', sku: 'IP12-64-BL', category: 'Smartphones', condition: 'Fair', price: 329, stock: 18, status: 'Online', updated: '4 days ago' },
  { id: 'L-10429', image: '🎮', title: 'Sony PlayStation 5 Disc Edition Console', sku: 'PS5-DISC', category: 'Gaming', condition: 'Excellent', price: 449, stock: 6, status: 'Online', updated: '5 days ago' },
  { id: 'L-10430', image: '📱', title: 'OnePlus 10 Pro 128GB Volcanic Black', sku: 'OP10P-128-VB', category: 'Smartphones', condition: 'Good', price: 419, stock: 2, status: 'Offline', updated: '1 week ago' },
  { id: 'L-10431', image: '📷', title: 'Sony Alpha A7 III Mirrorless Body Only', sku: 'A7III-BODY', category: 'Cameras', condition: 'Good', price: 1199, stock: 1, status: 'Draft', updated: '1 week ago' },
  { id: 'L-10432', image: '🖥️', title: 'iMac 24" M1 8GB 256GB Silver 2021', sku: 'IMAC-M1-24-SL', category: 'Desktops', condition: 'Excellent', price: 999, stock: 5, status: 'Rejected', updated: '2 weeks ago' },
]

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  let rows = listings
  if (activeTab.value !== 'All listings') {
    rows = rows.filter(l => l.status === (activeTab.value === 'Inactive' ? 'Rejected' : activeTab.value))
  }
  if (q) {
    rows = rows.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.sku.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q),
    )
  }
  return rows
})

const allFilteredSelected = computed(() => filtered.value.length > 0 && filtered.value.every(l => selectedIds.value.has(l.id)))
function toggleAll() {
  const next = new Set(selectedIds.value)
  if (allFilteredSelected.value) {
    filtered.value.forEach(l => next.delete(l.id))
  } else {
    filtered.value.forEach(l => next.add(l.id))
  }
  selectedIds.value = next
}
function toggleOne(id: string) {
  const next = new Set(selectedIds.value)
  next.has(id) ? next.delete(id) : next.add(id)
  selectedIds.value = next
}

function statusClasses(s: ListingStatus): string {
  switch (s) {
    case 'Online':    return 'bg-bm-success/10 text-bm-success'
    case 'Offline':   return 'bg-bm-gray-200 text-bm-text-mid'
    case 'Draft':     return 'bg-amber-100 text-amber-800'
    case 'In review': return 'bg-blue-50 text-blue-700'
    case 'Rejected':  return 'bg-red-50 text-red-700'
  }
}

function conditionClasses(c: Listing['condition']): string {
  switch (c) {
    case 'New':       return 'text-bm-text-hi'
    case 'Excellent': return 'text-bm-success'
    case 'Good':      return 'text-bm-text-mid'
    case 'Fair':      return 'text-bm-text-low'
  }
}

function priceFmt(n: number) {
  return new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function resetDismissedUi() {
  selectedIds.value = new Set()
  search.value = ''
  activeTab.value = 'All listings'
}
</script>

<template>
  <div :class="['flex h-screen overflow-hidden font-body', showHotspots ? 'prototype-hotspots' : '']" @click="flashHotspots">
    <PrototypeSidebar
      title="Listing Page explorations"
      :concepts="conceptMeta"
      :active-concept="activeConcept"
      :preview-mode="previewMode"
      :sidebar-open="sidebarOpen"
      :active-page-id="activePageId"
      @update:active-concept="activeConcept = $event"
      @update:preview-mode="previewMode = $event"
      @update:sidebar-open="sidebarOpen = $event"
      @update:active-page-id="setActivePage"
      @reset="resetDismissedUi"
    />

    <div class="flex-1 overflow-auto">
      <div v-show="activeConcept === 1">
        <BmShell
          :nav-items="NAV_ITEMS"
          :active-nav-item="activeNavItem"
          :seller-name="SELLER_NAME"
          page-title="My catalog"
          :tabs="tabs"
          :active-tab="activeTab"
          @nav-item-click="activeNavItem = $event"
          @update:active-tab="activeTab = $event"
        >
          <div class="py-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="relative flex-1 max-w-md">
                <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bm-text-low" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="m21 21-4.35-4.35M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" /></svg>
                <input
                  v-model="search"
                  type="text"
                  placeholder="Search by title, SKU or category"
                  class="w-full pl-9 pr-3 py-2 text-sm bg-white border border-bm-border rounded-bm-sm focus:outline-none focus:border-bm-text-mid placeholder:text-bm-text-low"
                />
              </div>

              <button class="inline-flex items-center gap-2 px-3 py-2 text-sm border border-bm-border rounded-bm-sm bg-white text-bm-text-hi hover:bg-bm-gray-50 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 4h18M6 12h12M10 20h4" /></svg>
                Filters
              </button>

              <button class="inline-flex items-center gap-2 px-3 py-2 text-sm border border-bm-border rounded-bm-sm bg-white text-bm-text-hi hover:bg-bm-gray-50 transition-colors">
                Category
                <svg class="w-3.5 h-3.5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
              </button>

              <button class="inline-flex items-center gap-2 px-3 py-2 text-sm border border-bm-border rounded-bm-sm bg-white text-bm-text-hi hover:bg-bm-gray-50 transition-colors">
                Condition
                <svg class="w-3.5 h-3.5 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06z" clip-rule="evenodd" /></svg>
              </button>

              <div class="ml-auto flex items-center gap-2">
                <button class="inline-flex items-center gap-2 px-3 py-2 text-sm border border-bm-border rounded-bm-sm bg-white text-bm-text-hi hover:bg-bm-gray-50 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                  Export
                </button>
                <button class="inline-flex items-center gap-2 px-3 py-2 text-sm bg-bm-text-hi text-white rounded-bm-sm hover:bg-black transition-colors font-medium">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  New listing
                </button>
              </div>
            </div>

            <div v-if="selectedIds.size > 0" class="flex items-center gap-3 mb-3 px-4 py-2 bg-bm-gray-100 border border-bm-border rounded-bm-sm">
              <span class="text-sm font-medium text-bm-text-hi">{{ selectedIds.size }} selected</span>
              <span class="h-4 w-px bg-bm-border" />
              <button class="text-sm text-bm-text-mid hover:text-bm-text-hi transition-colors">Activate</button>
              <button class="text-sm text-bm-text-mid hover:text-bm-text-hi transition-colors">Deactivate</button>
              <button class="text-sm text-bm-text-mid hover:text-bm-text-hi transition-colors">Edit price</button>
              <button class="text-sm text-bm-text-mid hover:text-bm-text-hi transition-colors">Edit stock</button>
              <button class="text-sm text-red-600 hover:text-red-700 transition-colors">Delete</button>
              <button class="ml-auto text-xs text-bm-text-low hover:text-bm-text-mid transition-colors" @click="selectedIds = new Set()">Clear</button>
            </div>

            <div class="border border-bm-border rounded-bm-sm overflow-hidden bg-white">
              <table class="w-full text-sm">
                <thead class="bg-bm-gray-50 border-b border-bm-border">
                  <tr class="text-left text-xs font-medium text-bm-text-low uppercase tracking-wide">
                    <th class="w-10 px-3 py-3">
                      <input type="checkbox" :checked="allFilteredSelected" class="rounded border-bm-border" @change="toggleAll" />
                    </th>
                    <th class="px-3 py-3">Product</th>
                    <th class="px-3 py-3">SKU</th>
                    <th class="px-3 py-3">Category</th>
                    <th class="px-3 py-3">Condition</th>
                    <th class="px-3 py-3 text-right">Price</th>
                    <th class="px-3 py-3 text-right">Stock</th>
                    <th class="px-3 py-3">Status</th>
                    <th class="px-3 py-3">Updated</th>
                    <th class="w-10 px-3 py-3" />
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="l in filtered"
                    :key="l.id"
                    class="border-b border-bm-border last:border-b-0 hover:bg-bm-gray-50/60 transition-colors"
                  >
                    <td class="px-3 py-3">
                      <input type="checkbox" :checked="selectedIds.has(l.id)" class="rounded border-bm-border" @change="toggleOne(l.id)" />
                    </td>
                    <td class="px-3 py-3">
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="w-10 h-10 rounded-bm-sm bg-bm-gray-100 border border-bm-border flex items-center justify-center text-xl flex-shrink-0">{{ l.image }}</div>
                        <div class="min-w-0">
                          <p class="text-sm font-medium text-bm-text-hi truncate">{{ l.title }}</p>
                          <p class="text-xs text-bm-text-low">{{ l.id }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-3 py-3 font-mono text-xs text-bm-text-mid">{{ l.sku }}</td>
                    <td class="px-3 py-3 text-bm-text-mid">{{ l.category }}</td>
                    <td class="px-3 py-3" :class="conditionClasses(l.condition)">{{ l.condition }}</td>
                    <td class="px-3 py-3 text-right font-medium text-bm-text-hi">{{ priceFmt(l.price) }}</td>
                    <td class="px-3 py-3 text-right" :class="l.stock <= 3 ? 'text-amber-700 font-medium' : 'text-bm-text-mid'">{{ l.stock }}</td>
                    <td class="px-3 py-3">
                      <span :class="['inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', statusClasses(l.status)]">{{ l.status }}</span>
                    </td>
                    <td class="px-3 py-3 text-bm-text-low text-xs">{{ l.updated }}</td>
                    <td class="px-3 py-3 text-right">
                      <button class="p-1 rounded hover:bg-bm-gray-100 transition-colors">
                        <svg class="w-4 h-4 text-bm-text-low" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM10 12a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM10 18a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z" /></svg>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="filtered.length === 0">
                    <td colspan="10" class="px-3 py-10 text-center text-sm text-bm-text-low">No listings match your filters.</td>
                  </tr>
                </tbody>
              </table>

              <div class="flex items-center justify-between px-4 py-3 border-t border-bm-border bg-bm-gray-50">
                <p class="text-xs text-bm-text-low">Showing <span class="font-medium text-bm-text-mid">{{ filtered.length }}</span> of <span class="font-medium text-bm-text-mid">{{ listings.length }}</span> listings</p>
                <div class="flex items-center gap-1">
                  <button class="px-2 py-1 text-xs text-bm-text-low border border-bm-border rounded-bm-xs bg-white hover:bg-bm-gray-100 transition-colors" disabled>Previous</button>
                  <button class="px-2.5 py-1 text-xs font-medium text-bm-text-hi border border-bm-border rounded-bm-xs bg-white">1</button>
                  <button class="px-2.5 py-1 text-xs text-bm-text-mid border border-bm-border rounded-bm-xs bg-white hover:bg-bm-gray-100 transition-colors">2</button>
                  <button class="px-2.5 py-1 text-xs text-bm-text-mid border border-bm-border rounded-bm-xs bg-white hover:bg-bm-gray-100 transition-colors">3</button>
                  <button class="px-2 py-1 text-xs text-bm-text-mid border border-bm-border rounded-bm-xs bg-white hover:bg-bm-gray-100 transition-colors">Next</button>
                </div>
              </div>
            </div>
          </div>
        </BmShell>
      </div>
    </div>
  </div>
</template>

<style>
.prototype-hotspot {
  position: relative;
}

.prototype-hotspot::before {
  content: '';
  position: absolute;
  inset: 0;
  background-color: rgba(13, 153, 255, 0.25);
  border-radius: 0;
  pointer-events: none;
  opacity: 0;
  z-index: 10;
}

.prototype-hotspots .prototype-hotspot::before {
  animation: figmaHotspotFlash 1000ms ease-out forwards;
}

@keyframes figmaHotspotFlash {
  0%   { opacity: 0; }
  15%  { opacity: 1; }
  70%  { opacity: 1; }
  100% { opacity: 0; }
}
</style>
