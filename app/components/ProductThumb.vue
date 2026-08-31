<script setup lang="ts">
const props = defineProps<{ thumb: string }>()

interface PhoneStyle {
  body: string
  bodyDark: string
  screen: string
  hasNotch: boolean
  hasCamera: boolean
  cameraLayout: 'top-left' | 'center' | 'triple'
  shape: 'notch' | 'island' | 'flat'
}

const phoneStyles: Record<string, PhoneStyle> = {
  'iphone-blue': {
    body: '#4A5260', bodyDark: '#3A4048', screen: '#1A1C20',
    hasNotch: true, hasCamera: true, cameraLayout: 'top-left', shape: 'notch',
  },
  'samsung-s20': {
    body: '#2D2F36', bodyDark: '#1E2028', screen: '#0F1014',
    hasNotch: true, hasCamera: true, cameraLayout: 'top-left', shape: 'island',
  },
  'oneplus-7t': {
    body: '#5B8FB5', bodyDark: '#4A7BA0', screen: '#1A2838',
    hasNotch: true, hasCamera: true, cameraLayout: 'center', shape: 'island',
  },
  'sony-xperia': {
    body: '#1A1C20', bodyDark: '#0F1014', screen: '#0A0B0E',
    hasNotch: true, hasCamera: true, cameraLayout: 'top-left', shape: 'flat',
  },
  'xiaomi-9t': {
    body: '#1F2024', bodyDark: '#151618', screen: '#0E0F12',
    hasNotch: true, hasCamera: true, cameraLayout: 'top-left', shape: 'flat',
  },
  'iphone-13-mid': {
    body: '#2C2E36', bodyDark: '#1E2028', screen: '#161820',
    hasNotch: true, hasCamera: true, cameraLayout: 'top-left', shape: 'notch',
  },
  'samsung-a7': {
    body: '#E8E8E0', bodyDark: '#D0D0C8', screen: '#1A1A18',
    hasNotch: true, hasCamera: true, cameraLayout: 'top-left', shape: 'island',
  },
  'lg-g7': {
    body: '#1E2028', bodyDark: '#151618', screen: '#0E0F12',
    hasNotch: true, hasCamera: true, cameraLayout: 'top-left', shape: 'flat',
  },
  'nokia-3310': {
    body: '#2B3A4F', bodyDark: '#1F2A3A', screen: '#5C8F5C',
    hasNotch: false, hasCamera: false, cameraLayout: 'center', shape: 'flat',
  },
  'samsung-s23': {
    body: '#2D2F36', bodyDark: '#1E2028', screen: '#0F1014',
    hasNotch: true, hasCamera: true, cameraLayout: 'triple', shape: 'island',
  },
}

const style = computed(() => phoneStyles[props.thumb] ?? phoneStyles['iphone-blue'])
</script>

<template>
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
    <defs>
      <linearGradient :id="`body-${thumb}`" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" :stop-color="style.body" />
        <stop offset="100%" :stop-color="style.bodyDark" />
      </linearGradient>
    </defs>

    <rect x="8" y="2" width="32" height="44" rx="6" :fill="`url(#body-${thumb})`" stroke="rgba(0,0,0,0.15)" stroke-width="0.5" />

    <rect x="10" y="4" width="28" height="40" rx="4" :fill="style.screen" opacity="0.9" />

    <template v-if="style.hasNotch">
      <rect v-if="style.shape === 'notch'" x="18" y="5" width="12" height="3" rx="1.5" :fill="style.bodyDark" />
      <rect v-else-if="style.shape === 'island'" x="21" y="5.5" width="6" height="3" rx="1.5" :fill="style.bodyDark" />
    </template>

    <template v-if="style.hasCamera">
      <template v-if="style.cameraLayout === 'top-left'">
        <circle cx="14" cy="8" r="2" :fill="style.bodyDark" stroke="rgba(255,255,255,0.05)" stroke-width="0.5" />
        <circle cx="14" cy="8" r="1" fill="rgba(0,0,0,0.4)" />
      </template>
      <template v-else-if="style.cameraLayout === 'triple'">
        <circle cx="13" cy="8" r="1.5" :fill="style.bodyDark" />
        <circle cx="13" cy="12" r="1.5" :fill="style.bodyDark" />
        <circle cx="13" cy="16" r="1.5" :fill="style.bodyDark" />
      </template>
    </template>

    <template v-if="thumb === 'nokia-3310'">
      <rect x="14" y="8" width="20" height="12" rx="1" fill="#4A6A4A" opacity="0.6" />
      <rect x="16" y="10" width="16" height="8" rx="0.5" fill="#5C8F5C" opacity="0.4" />
      <rect x="14" y="24" width="20" height="16" rx="1" fill="#3A4A3A" opacity="0.5" />
      <circle cx="18" cy="28" r="0.8" fill="rgba(255,255,255,0.15)" />
      <circle cx="22" cy="28" r="0.8" fill="rgba(255,255,255,0.15)" />
      <circle cx="26" cy="28" r="0.8" fill="rgba(255,255,255,0.15)" />
      <circle cx="30" cy="28" r="0.8" fill="rgba(255,255,255,0.15)" />
      <circle cx="18" cy="32" r="0.8" fill="rgba(255,255,255,0.15)" />
      <circle cx="22" cy="32" r="0.8" fill="rgba(255,255,255,0.15)" />
      <circle cx="26" cy="32" r="0.8" fill="rgba(255,255,255,0.15)" />
      <circle cx="30" cy="32" r="0.8" fill="rgba(255,255,255,0.15)" />
    </template>

    <rect x="22" y="44" width="4" height="1.5" rx="0.75" :fill="style.bodyDark" opacity="0.5" />
  </svg>
</template>
