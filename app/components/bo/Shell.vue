<script setup lang="ts">
/**
 * BoShell - the Seller Back Office frame: header, main navigation and the
 * page container. Built from Revolve components, copied from front-apps
 * (apps/back-office-seller: TheHeader.vue, TabsSales.vue, layouts/default.vue).
 *
 *   <BoShell active-nav-item="Listings" seller-name="Merchant" @nav-item-click="...">
 *     <BoPage title="Your listings"> ... </BoPage>
 *   </BoShell>
 */
import '~/assets/css/revolve.css'

const NAV_ITEMS = ['Home', 'Insights', 'Customer Care', 'Listings', 'Orders', 'Opportunities', 'Money', 'Options', 'Seller Support'] as const

const props = withDefaults(defineProps<{
  activeNavItem: string
  sellerName: string
  /** Nav items shown greyed out and not clickable. */
  disabledNavItems?: readonly string[]
  /** Tooltip on anything that is switched off in this prototype. */
  disabledHint?: string
}>(), {
  disabledNavItems: () => [],
  disabledHint: 'Not available in this test',
})

const emit = defineEmits<{ navItemClick: [item: string] }>()

const boType = ref('Sales')
const language = ref('English (Ireland)')

function isDisabled(item: string) {
  return props.disabledNavItems.includes(item)
}
</script>

<template>
  <div class="bo-shell min-h-screen rev-bg-surface-default-mid rev-text-static-default-hi">
    <header>
      <div class="flex items-center border-b rev-border-static-default-mid px-3 py-2">
        <img src="/bm-logo.svg" alt="Back Market" width="63" height="32" class="h-8 w-auto select-none" />

        <span class="rev-body-1-bold ml-5 hidden md:block">Hello {{ sellerName }}</span>

        <div class="ml-5 hidden md:block">
          <RevButton variant="secondary" size="small">Leave seller view</RevButton>
        </div>

        <div class="flex flex-1 items-center justify-end space-x-3">
          <div class="w-[105px]">
            <RevInputSelect id="select-bo-type" v-model="boType" label="Back Office type" size="small" :options="['Sales', 'Buyback']" />
          </div>

          <RevButton
            variant="primary"
            size="small"
            style="border-radius: 624.938rem; cursor: not-allowed;"
            aria-disabled="true"
            tabindex="-1"
            :title="disabledHint"
          >
            <span class="flex items-center gap-1 whitespace-nowrap">
              <RevIcon name="IconSparklesFilled" size="16" />
              Seller Guide
            </span>
          </RevButton>

          <div class="w-[216px]">
            <RevInputSelect
              id="select-language"
              v-model="language"
              label="Language"
              size="small"
              :options="['English (Ireland)', 'English (United Kingdom)', 'Français', 'Deutsch', 'Español', 'Italiano']"
            />
          </div>

          <RevButtonIcon icon="IconAvatar" variant="ghost" aria-label="Account" />
        </div>
      </div>

      <!-- Main navigation: the grey line runs the full width of the page -->
      <div class="relative px-3">
        <div class="pointer-events-none absolute inset-x-0 bottom-2 border-b rev-border-static-default-low" />
        <RevTabs label="Main navigation">
          <RevTabItem
            v-for="item in NAV_ITEMS"
            :key="item"
            :label="item"
            :active="item === activeNavItem"
            :disabled="isDisabled(item)"
            :title="isDisabled(item) ? disabledHint : undefined"
            @click="emit('navItemClick', item)"
          />
        </RevTabs>
      </div>
    </header>

    <!-- bo-shell__content: the part that moves in page transitions -->
    <div class="bo-shell__content flex justify-center px-6 py-8 md:px-8">
      <div class="min-w-[320px] max-w-[1920px] grow">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.bo-shell {
  font-family: BMDupletTXT, HelveticaTXT, sans-serif;
  font-size: 1rem;
  line-height: 1.5rem;
}
</style>
