<script setup lang="ts">
const props = defineProps<{ name: string; class?: string }>()

const runtimeConfig = useRuntimeConfig()
const baseHref = (runtimeConfig.app.baseURL ?? '/').replace(/\/$/, '')
const src = computed(() => `${baseHref}/icons/${props.name}.svg`)
</script>

<template>
  <img :src="src" :class="$props.class" aria-hidden="true" />
</template>
