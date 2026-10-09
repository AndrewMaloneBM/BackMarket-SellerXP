<script setup lang="ts">
/**
 * BoPage - page title row of the Seller Back Office (title left, actions right).
 * Copied from front-apps (apps/back-office-seller/app/components/ThePage/ThePage.vue).
 */
import '~/assets/css/revolve.css'

defineProps<{ title: string }>()
</script>

<template>
  <section>
    <div class="md:flex md:items-center">
      <h1 class="rev-heading-1 mb-4 md:flex-1">{{ title }}</h1>
      <div v-if="$slots.actions">
        <slot name="actions" />
      </div>
    </div>
    <slot />
  </section>
</template>
