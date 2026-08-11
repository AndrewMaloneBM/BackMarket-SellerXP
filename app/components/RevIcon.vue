<script setup lang="ts">
const props = defineProps<{ name: string; class?: string }>()

const runtimeConfig = useRuntimeConfig()
const baseHref = (runtimeConfig.app.baseURL ?? '/').replace(/\/$/, '')
const src = computed(() => `${baseHref}/icons/${props.name}.svg`)

const maskStyle = computed(() => ({
  maskImage: `url(${src.value})`,
  WebkitMaskImage: `url(${src.value})`,
  maskRepeat: 'no-repeat',
  WebkitMaskRepeat: 'no-repeat',
  maskPosition: 'center',
  WebkitMaskPosition: 'center',
  maskSize: 'contain',
  WebkitMaskSize: 'contain',
}))
</script>

<template>
  <span
    :class="['inline-block shrink-0 bg-current', $props.class]"
    :style="maskStyle"
    aria-hidden="true"
  />
</template>
