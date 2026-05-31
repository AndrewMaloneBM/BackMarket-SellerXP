<script setup lang="ts">
interface Stripe {
  kind: 'h' | 'v' | 'd' | 'cross' | 'tri'
  colors: string[]
}

const props = withDefaults(defineProps<{ code: string; stripe?: Stripe; size?: 'sm' | 'md' | 'lg' }>(), {
  size: 'sm',
  stripe: undefined,
})

const dim = computed(() => props.size === 'lg' ? 'w-6 h-4' : props.size === 'md' ? 'w-4 h-3' : 'w-3.5 h-2.5')
</script>

<template>
  <span :class="['inline-block overflow-hidden rounded-[1px] border border-black/10 align-middle flex-shrink-0', dim]" :aria-label="code">
    <span v-if="stripe?.kind === 'h'" class="flex flex-col w-full h-full">
      <span v-for="(c, i) in stripe.colors" :key="i" :style="{ background: c, flex: '1 1 0' }" />
    </span>
    <span v-else-if="stripe?.kind === 'v'" class="flex w-full h-full">
      <span v-for="(c, i) in stripe.colors" :key="i" :style="{ background: c, flex: '1 1 0' }" />
    </span>
    <span v-else-if="stripe?.kind === 'cross'" class="relative w-full h-full" :style="{ background: stripe.colors[0] }">
      <span class="absolute inset-y-0 left-[35%] w-[14%]" :style="{ background: stripe.colors[1] }" />
      <span class="absolute inset-x-0 top-[40%] h-[20%]" :style="{ background: stripe.colors[1] }" />
    </span>
    <span v-else-if="stripe?.kind === 'tri'" class="flex flex-col w-full h-full">
      <span :style="{ background: stripe.colors[0], flex: '1 1 0' }" />
      <span v-if="stripe.colors[2]" :style="{ background: stripe.colors[1] ?? stripe.colors[0], flex: '1 1 0' }" />
      <span v-if="stripe.colors[2]" :style="{ background: stripe.colors[2], flex: '1 1 0' }" />
      <span v-else :style="{ background: stripe.colors[1], flex: '1 1 0' }" />
    </span>
    <span v-else class="block w-full h-full bg-bm-gray-300" />
  </span>
</template>
