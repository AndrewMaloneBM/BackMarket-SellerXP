<script setup lang="ts">
/**
 * Revolve icon. `name` is the Revolve icon name (a file in public/icons).
 * Size it with `size` (px: 12, 16, 20, 24, 32, 48 - Revolve's icon sizes) or
 * with width/height classes. The icon takes the current text colour.
 */
const props = defineProps<{ name: string; class?: string; size?: string | number }>()

const runtimeConfig = useRuntimeConfig()
const baseHref = (runtimeConfig.app.baseURL ?? '/').replace(/\/$/, '')
const src = computed(() => `${baseHref}/icons/${props.name}.svg`)

const maskStyle = computed(() => ({
  ...(props.size ? { width: `${props.size}px`, height: `${props.size}px` } : {}),
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
