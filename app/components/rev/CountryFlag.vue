<script setup lang="ts">
/**
 * RevCountryFlag - Revolve country flag image.
 * Sizes copied from @backmarket/design-system 129.13.0 (CountryFlag.vue).
 * Docs: design-system/components/media/RevCountryFlag.md
 * Flags are the files in public/flags (Flag<CODE>.svg).
 */
const props = withDefaults(defineProps<{
  countryCode: string
  size?: 'extra-small' | 'small' | 'medium' | 'large' | 'extra-large'
}>(), {
  size: 'medium',
})

const runtimeConfig = useRuntimeConfig()
const baseHref = (runtimeConfig.app.baseURL ?? '/').replace(/\/$/, '')
const src = computed(() => `${baseHref}/flags/Flag${props.countryCode}.svg`)
const width = computed(() => ({ 'extra-small': 12, small: 18, medium: 24, large: 30, 'extra-large': 36 })[props.size])
</script>

<template>
  <img
    :src="src"
    :alt="countryCode"
    class="rev-country-flag"
    :style="{ width: `${width}px`, height: `${(width * 2) / 3}px` }"
  />
</template>

<style scoped>
.rev-country-flag {
  display: block;
  flex-shrink: 0;
  object-fit: cover;
}
</style>
