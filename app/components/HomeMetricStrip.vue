<script setup lang="ts">
import type { Metric } from '~/utils/mockHomeData'

/**
 * Metric strip: a divided row of KPI tiles, each carrying one number,
 * one delta badge and one sparkline.
 *
 * Dividers rather than card borders, following Shopify's geometry. Removes
 * a lot of non-data ink compared with a grid of bordered cards.
 */
withDefaults(defineProps<{
  metrics: Metric[]
  /** Show the pencil affordance for swapping a slot. */
  editable?: boolean
}>(), {
  editable: false,
})

const emit = defineEmits<{ swap: [id: string] }>()
</script>

<template>
  <div class="flex flex-wrap divide-x divide-bm-border">
    <div v-for="m in metrics" :key="m.id" class="flex-1 min-w-[200px]">
      <VizKpiTile :metric="m" :editable="editable" @swap="emit('swap', $event)" />
    </div>
  </div>
</template>
