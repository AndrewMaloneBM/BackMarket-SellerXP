<script setup lang="ts">
/**
 * RevListItemAction - a clickable row inside RevList.
 * Styles copied from @backmarket/design-system 129.13.0 (ListItemAction.vue + ListItemBase.vue).
 *
 *   <RevListItemAction has-chevron href="#"><template #label>You have 3 orders</template></RevListItemAction>
 */
import '~/assets/css/revolve.css'

withDefaults(defineProps<{
  href?: string
  hasChevron?: boolean
}>(), {
  href: undefined,
  hasChevron: false,
})

defineEmits<{ click: [event: MouseEvent] }>()
</script>

<template>
  <li class="rev-list-item">
    <component
      :is="href ? 'a' : 'button'"
      :href="href"
      :type="href ? undefined : 'button'"
      class="rev-list-item__action rev-focus-inset"
      @click="$emit('click', $event)"
    >
      <span class="rev-list-item__label"><slot name="label" /></span>
      <RevIcon v-if="hasChevron" name="IconChevronRight" size="24" class="rev-list-item__chevron" />
    </component>
  </li>
</template>

<style scoped>
.rev-list-item {
  position: relative;
  list-style: none;
}
.rev-list-item__action {
  display: flex;
  width: 100%;
  align-items: flex-start;
  padding: 1.25rem 1.5rem;
  border: 0;
  background-color: var(--rev-bg-static-default-min);
  color: var(--rev-text-static-default-hi);
  text-align: left;
  text-decoration: none;
  transition: all 0.2s;
}
.rev-list-item__action:hover {
  background-color: var(--rev-bg-static-default-min-hover);
}
.rev-list-item__label {
  flex-grow: 1;
  font-family: BMDupletTXT, HelveticaTXT, sans-serif;
  font-size: 1rem;
  line-height: 1.5rem;
}
.rev-list-item__chevron {
  flex-shrink: 0;
  align-self: center;
  color: var(--rev-text-action-default-hi);
}
</style>
