<script setup lang="ts">
const props = withDefaults(defineProps<{
  label: string
  tone?: 'success' | 'info' | 'warning' | 'danger' | 'neutral'
  dot?: boolean
}>(), { tone: 'neutral', dot: false })

const toneClass = computed(() => ({
  success: 'bg-bm-green-100 text-bm-green-700',
  info: 'bg-blue-50 text-blue-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  neutral: 'bg-bm-gray-100 text-bm-gray-700',
}[props.tone]))
const dotClass = computed(() => ({
  success: 'bg-bm-green-500',
  info: 'bg-blue-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  neutral: 'bg-bm-gray-500',
}[props.tone]))
</script>

<template>
  <span :class="['badge gap-1.5 font-semibold', toneClass]"><span v-if="dot" :class="['h-1.5 w-1.5 rounded-full', dotClass]" />{{ label }}</span>
</template>
