<script setup lang="ts">
const SELLER_NAME = 'Merchant'
const NAV_ITEMS = ['Home', 'Insights', 'Customer Care', 'Listings', 'Orders', 'Opportunities', 'Money', 'Options', 'Seller Support'] as const
const TABS = ['Deals', 'Pricing', 'Inventory'] as const

const activeNavItem = ref<string>('Opportunities')
const activeTab = ref<string>('Deals')

const emit = defineEmits<{ navItemClick: [item: string] }>()

function onNavClick(item: string) {
  activeNavItem.value = item
  emit('navItemClick', item)
}
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
        <div class="border border-dashed border-bm-border rounded-xl px-6 py-12 text-center">
          <h2 class="text-lg font-semibold text-bm-text-hi">{{ activeTab }}</h2>
          <p class="mt-2 text-sm text-bm-text-low">
            This is the Opportunities shell. Content for the {{ activeTab }} tab will be added in the next iteration.
          </p>
        </div>
      </div>
    </div>
  </BmShell>
</template>
