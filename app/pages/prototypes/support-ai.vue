<script setup lang="ts">
const meta = {
  title: 'Support Ai',
  description: '',
  author: 'Andrew Malone',
  date: '2026-05-06',
  status: 'draft' as 'draft' | 'review' | 'done',
}
</script>

<template>
  <div class="min-h-screen">
    <div class="bg-bm-gray-100 border-b border-bm-gray-200 px-6 py-2 flex items-center gap-3 text-xs text-bm-gray-500">
      <NuxtLink to="/" class="hover:text-bm-black transition-colors">← Hub</NuxtLink>
      <span>/</span>
      <span class="text-bm-black font-medium">{{ meta.title }}</span>
      <span class="ml-auto">{{ meta.date }}</span>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Your prototype here -->
    </div>
  </div>
</template>
