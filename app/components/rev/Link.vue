<script setup lang="ts">
/**
 * RevLink - Revolve inline text link.
 * Styles copied from @backmarket/design-system 129.13.0 (Link.vue).
 * Docs: design-system/components/actions/RevLink.md
 * Renders an <a> when given href, otherwise a <button>.
 */
import '~/assets/css/revolve.css'

withDefaults(defineProps<{
  href?: string
  underlined?: boolean
}>(), {
  href: undefined,
  underlined: true,
})

defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="href ? undefined : 'button'"
    :class="['rev-link rev-focus', underlined ? 'rev-link--underlined' : 'rev-link--plain']"
    @click="$emit('click', $event)"
  >
    <slot />
  </component>
</template>

<style scoped>
.rev-link {
  border-radius: 0.375rem;
  color: var(--rev-text-action-default-hi);
  font-weight: 600;
  text-align: inherit;
  cursor: pointer;
}
.rev-link:hover {
  color: var(--rev-text-action-default-hi-hover);
}
.rev-link--underlined {
  text-decoration: underline;
}
.rev-link--plain {
  text-decoration: none;
}
.rev-link--plain:hover {
  text-decoration: underline;
}
</style>
