<script setup lang="ts">
import { QUALITY_STATUS } from '~/utils/mockHomeData'

/**
 * Quality reduced to a single status chip, following Amazon's treatment of
 * account health: status lives in the header, the scoreboard lives on its
 * own page. Breaches here cause real suspensions, so a wall of red on the
 * landing page reads as surveillance rather than support.
 */
const toneClasses = computed(() => {
  switch (QUALITY_STATUS.tone) {
    case 'critical': return 'text-bm-danger border-bm-danger/40 bg-bm-danger/5'
    case 'warning':  return 'text-bm-warning border-bm-warning/40 bg-bm-warning/5'
    default:         return 'text-bm-success border-bm-success/40 bg-bm-success/5'
  }
})
</script>

<template>
  <button
    class="inline-flex items-center gap-2 border rounded-bm-sm px-2.5 py-1.5 text-xs transition-opacity hover:opacity-80"
    :class="toneClasses"
  >
    <svg class="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.19-1.458-1.516-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
    </svg>
    <span class="font-semibold">Quality: {{ QUALITY_STATUS.label }}</span>
    <span class="opacity-80">{{ QUALITY_STATUS.detail }}</span>
  </button>
</template>
