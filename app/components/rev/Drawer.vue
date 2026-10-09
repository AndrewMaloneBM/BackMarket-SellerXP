<script setup lang="ts">
/**
 * RevDrawer - Revolve side panel that slides in from the right.
 * Styles copied from @backmarket/design-system 129.13.0 (Drawer.vue + ModalBase.vue).
 * Docs: design-system/components/overlays/RevDrawer.md
 *
 * The real component opens by name (openModal). Here it is simpler:
 *   <RevDrawer :open="isOpen" title="Campaign details" size="large" @close="isOpen = false">
 *     ...body...
 *   </RevDrawer>
 */
import '~/assets/css/revolve.css'

const props = withDefaults(defineProps<{
  open: boolean
  title: string
  size?: 'small' | 'medium' | 'large'
  hasPadding?: boolean
  closeButtonLabel?: string
}>(), {
  size: 'small',
  hasPadding: true,
  closeButtonLabel: 'Close',
})

const emit = defineEmits<{ close: [] }>()

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.open) emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (import.meta.client) document.body.style.overflow = ''
})

// Lock the page behind the open drawer, like the real one does.
watch(() => props.open, (open) => {
  if (import.meta.client) document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="rev-drawer-fade">
      <div v-if="open" class="rev-drawer-backdrop" @click="emit('close')" />
    </Transition>
    <Transition name="rev-drawer-slide">
      <div
        v-if="open"
        :class="['rev-drawer', `rev-drawer--${size}`]"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="0"
      >
        <div class="rev-drawer__header">
          <h2 class="rev-drawer__title">{{ title }}</h2>
          <RevButtonIcon
            class="rev-drawer__close"
            icon="IconCross"
            variant="ghost"
            :aria-label="closeButtonLabel"
            @click="emit('close')"
          />
        </div>
        <div class="rev-drawer__body">
          <div :class="['rev-drawer__scroll', hasPadding && 'rev-drawer__scroll--padded']" tabindex="0">
            <slot />
          </div>
          <div v-if="$slots.footer" class="rev-drawer__footer">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.rev-drawer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  background-color: var(--rev-bg-overlay-low);
}
.rev-drawer {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 51;
  font-family: BMDupletTXT, HelveticaTXT, sans-serif;
  display: flex;
  width: 100%;
  height: 100%;
  max-height: 100dvh;
  flex-direction: column;
  justify-content: space-between;
  background-color: var(--rev-bg-surface-default-mid);
  color: var(--rev-text-static-default-hi);
  outline: none;
}
@media (min-width: 768px) {
  .rev-drawer {
    left: auto;
    right: 0;
    top: 0;
    border-radius: 0.75rem 0 0 0.75rem;
  }
  .rev-drawer--small { width: 23.75rem; }
  .rev-drawer--medium { width: 40rem; }
  .rev-drawer--large { width: 61rem; max-width: 100%; }
}

.rev-drawer__header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem 1.5rem 0;
  padding: 0.5rem 2.5rem 1.25rem;
  text-align: center;
}
.rev-drawer__header::after {
  content: '';
  position: absolute;
  left: -1.5rem;
  right: -1.5rem;
  bottom: 0;
  border-bottom: 1px solid var(--rev-border-static-default-low);
}
.rev-drawer__title {
  font-family: BMDupletTXT, HelveticaTXT, sans-serif;
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 400;
  color: var(--rev-text-static-default-hi);
}
.rev-drawer__close {
  position: absolute;
  right: 0;
  top: 0;
}

.rev-drawer__body {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
  overflow: hidden;
}
.rev-drawer__scroll {
  flex: 1 1 auto;
  overflow: auto;
  outline: none;
}
.rev-drawer__scroll--padded {
  padding: 1.5rem;
}
.rev-drawer__footer {
  width: 100%;
  padding: 0.75rem 1.5rem;
}

.rev-drawer-fade-enter-active { transition: opacity 0.3s; }
.rev-drawer-fade-leave-active { transition: opacity 0.2s; }
.rev-drawer-fade-enter-from,
.rev-drawer-fade-leave-to { opacity: 0; }

.rev-drawer-slide-enter-active { transition: transform 0.3s; }
.rev-drawer-slide-leave-active { transition: transform 0.2s; }
.rev-drawer-slide-enter-from,
.rev-drawer-slide-leave-to { transform: translateY(100%); }
@media (min-width: 768px) {
  .rev-drawer-slide-enter-from,
  .rev-drawer-slide-leave-to { transform: translateX(100%); }
}
@media (prefers-reduced-motion: reduce) {
  .rev-drawer-fade-enter-active,
  .rev-drawer-fade-leave-active,
  .rev-drawer-slide-enter-active,
  .rev-drawer-slide-leave-active { transition: none; }
}
</style>
