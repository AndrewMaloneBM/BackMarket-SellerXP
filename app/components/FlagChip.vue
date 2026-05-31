<script setup lang="ts">
const props = withDefaults(defineProps<{ code: string; height?: number }>(), {
  height: 8,
})

const runtimeConfig = useRuntimeConfig()
const baseHref = (runtimeConfig.app.baseURL ?? '/').replace(/\/$/, '')

const src = computed(() => `${baseHref}/flags/Flag${props.code}.svg`)
</script>

<template>
  <img
    :src="src"
    :alt="code"
    class="block flex-shrink-0 leading-none"
    :style="{ height: `${height}px`, width: 'auto' }"
  />
</template>
