<script setup lang="ts">
const props = withDefaults(defineProps<{ code: string; height?: number }>(), {
  height: 8,
})

const runtimeConfig = useRuntimeConfig()
const baseHref = (runtimeConfig.app.baseURL ?? '/').replace(/\/$/, '')

const src = computed(() => `${baseHref}/flags/Flag${props.code}.svg`)
</script>

<template>
  <img :src="src" :alt="code" :height="height" class="h-auto max-h-full max-w-full leading-none" />
</template>
