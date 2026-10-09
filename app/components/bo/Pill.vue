<script setup lang="ts">
/**
 * BoPill - the small rounded pill the Seller Back Office uses for grade,
 * battery, SIM and market (flag + code). It is a Back Office component, not a
 * Revolve one: copied from front-apps
 * (apps/back-office-seller/.../ListingsTable/components/Pill/Pill.vue).
 *
 *   <BoPill tooltip-content="Grade"><RevIcon name="IconGrade" size="16" /><span>Good</span></BoPill>
 *   <BoPill><RevCountryFlag country-code="FR" size="extra-small" /><span>FR</span></BoPill>
 *
 * Icon sizes: small 16, medium 20, large 24. Flags: small = extra-small.
 * `tone` covers the coloured versions the Back Office uses.
 */
import '~/assets/css/revolve.css'

withDefaults(defineProps<{
  size?: 'small' | 'medium' | 'large'
  tooltipContent?: string
  /** default: grey. success / danger: market with / without BackBox. outline: bordered, no fill. */
  tone?: 'default' | 'success' | 'danger' | 'outline' | 'new-battery' | 'info'
}>(), {
  size: 'small',
  tooltipContent: undefined,
  tone: 'default',
})
</script>

<template>
  <RevTooltip v-if="tooltipContent" :content="tooltipContent">
    <span :class="['bo-pill', `bo-pill--${size}`, `bo-pill--${tone}`]"><slot /></span>
  </RevTooltip>
  <span v-else :class="['bo-pill', `bo-pill--${size}`, `bo-pill--${tone}`]"><slot /></span>
</template>

<style scoped>
.bo-pill {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1.25rem;
  background-color: var(--rev-bg-static-default-mid);
  color: var(--rev-text-static-default-hi);
  font-family: BMDupletTXT, HelveticaTXT, sans-serif;
  font-weight: 400;
  white-space: nowrap;
}
.bo-pill--small { font-size: 0.75rem; line-height: 1rem; }
.bo-pill--medium { font-size: 0.875rem; line-height: 1.25rem; }
.bo-pill--large { font-size: 1rem; line-height: 1.5rem; }

.bo-pill--success {
  border: 0.1rem solid var(--rev-border-static-success-mid);
  background-color: var(--rev-bg-static-success-low);
}
.bo-pill--danger {
  border: 0.1rem solid var(--rev-border-static-danger-hi);
  background-color: var(--rev-bg-static-danger-low);
}
.bo-pill--outline {
  border: 1px solid var(--rev-border-static-default-mid);
  background-color: transparent;
}
.bo-pill--new-battery {
  background-color: var(--rev-bg-static-success-low);
}
.bo-pill--info {
  background-color: var(--rev-bg-static-info-low);
}
</style>
