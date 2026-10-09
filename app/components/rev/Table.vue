<script setup lang="ts" generic="T extends Record<string, any>">
/**
 * RevTable - Revolve data table.
 * Styles copied from @backmarket/design-system 129.13.0 (Table.vue), desktop layout.
 * Docs: design-system/components/data-display/RevTable.md
 *
 *   <RevTable :collection="rows" :columns="[{ key: 'product', label: 'Product' }]" striped-rows>
 *     <template #body-product="{ item }">{{ item.name }}</template>
 *   </RevTable>
 *
 * Expandable rows: give a row `expandable: true` and an `id`, then fill the
 * slot named `expand-<id>`. Call expandAll() / collapseAll() through a ref.
 */
import '~/assets/css/revolve.css'

export interface Column {
  key: string
  label: string
  align?: 'start' | 'center' | 'end'
  /** Right-aligned numbers with equal-width digits. */
  isTabular?: boolean
  /** Shows an info button next to the label with this text as a tooltip. */
  description?: string
}

const props = withDefaults(defineProps<{
  collection: T[]
  columns: Column[]
  stripedRows?: boolean
  transparentHeader?: boolean
  expandLabel?: string
  expandRowsByDefault?: boolean
  getCollectionItemId?: (item: T) => string | number
  /** Prototype extra (not in the real RevTable): inline style for a row, e.g. to flash it after an update. */
  rowStyle?: (item: T) => Record<string, string> | undefined
}>(), {
  stripedRows: false,
  transparentHeader: false,
  expandLabel: 'Expand',
  expandRowsByDefault: false,
  getCollectionItemId: (item: T) => (item && 'id' in item ? item.id : ''),
  rowStyle: undefined,
})

const emit = defineEmits<{
  'update:expandedRow': [id: string | number, expanded: boolean]
  'update:expandAll': [expanded: boolean]
}>()

const hasExpandableRows = computed(() => props.collection.some((item) => item.expandable !== undefined))

const expanded = ref<Record<string, boolean>>({})

function setAll(value: boolean) {
  const next: Record<string, boolean> = {}
  for (const item of props.collection) {
    if (item.expandable) next[String(props.getCollectionItemId(item))] = value
  }
  expanded.value = next
}
setAll(props.expandRowsByDefault)

function isExpanded(item: T) {
  return expanded.value[String(props.getCollectionItemId(item))] === true
}

function toggle(item: T) {
  const id = props.getCollectionItemId(item)
  const value = !isExpanded(item)
  expanded.value = { ...expanded.value, [String(id)]: value }
  emit('update:expandedRow', id, value)
}

defineExpose({
  expandAll: () => { setAll(true); emit('update:expandAll', true) },
  collapseAll: () => { setAll(false); emit('update:expandAll', false) },
})

function cellAlign(column: Column) {
  if (column.isTabular) return 'rev-table__cell--end rev-table__cell--tabular'
  if (column.align === 'center') return 'rev-table__cell--center'
  if (column.align === 'end') return 'rev-table__cell--end'
  return ''
}
</script>

<template>
  <div>
    <table class="rev-table">
      <thead :class="['rev-table__head', transparentHeader && 'rev-table__head--transparent']">
        <tr>
          <th v-for="column in columns" :id="column.key" :key="column.key" class="rev-table__th" scope="col">
            <div class="rev-table__th-inner">
              <span class="rev-table__th-label">{{ column.label }}</span>
              <RevTooltip v-if="column.description" :content="column.description" position="bottom">
                <RevButtonIcon icon="IconInfo" size="small" variant="ghost" :aria-label="column.description" />
              </RevTooltip>
            </div>
          </th>
          <th v-if="hasExpandableRows" class="rev-table__th rev-table__th--expand" scope="col">{{ expandLabel }}</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="item in collection" :key="getCollectionItemId(item)">
          <tr :class="['rev-table__row', stripedRows && 'rev-table__row--striped']" :style="rowStyle?.(item)">
            <td v-for="column in columns" :key="column.key" class="rev-table__td" :headers="column.key">
              <div :class="['rev-table__cell', cellAlign(column)]">
                <slot :name="`body-${column.key}`" :column="column" :item="item">{{ item?.[column.key] }}</slot>
              </div>
            </td>
            <td v-if="hasExpandableRows" class="rev-table__td">
              <div class="rev-table__cell rev-table__cell--end">
                <RevButtonIcon
                  v-if="item.expandable"
                  :icon="isExpanded(item) ? 'IconChevronUp' : 'IconChevronDown'"
                  size="small"
                  variant="ghost"
                  :aria-label="expandLabel || 'Expand'"
                  :aria-expanded="isExpanded(item)"
                  @click="toggle(item)"
                />
              </div>
            </td>
          </tr>
          <tr v-if="item.expandable" v-show="isExpanded(item)" class="rev-table__row">
            <td colspan="100">
              <slot :name="`expand-${getCollectionItemId(item)}`" :item="item" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.rev-table {
  width: 100%;
  border: 0;
  border-collapse: collapse;
  border-spacing: 0;
  font-family: BMDupletTXT, HelveticaTXT, sans-serif;
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 400;
  color: var(--rev-text-static-default-mid);
}
.rev-table__head {
  height: 3.5rem;
  border-bottom: 1px solid var(--rev-border-static-default-low);
  background-color: var(--rev-bg-static-default-hi);
  font-weight: 600;
}
.rev-table__head--transparent {
  background-color: transparent;
}
.rev-table__th {
  padding: 0 1rem;
  text-align: start;
  font-weight: 600;
}
.rev-table__th:first-child {
  padding-left: 1.5rem;
}
.rev-table__th--expand {
  text-align: end;
}
.rev-table__th-inner {
  display: flex;
  align-items: center;
}
.rev-table__th-label {
  margin-right: 0.5rem;
  text-align: left;
}

.rev-table__row {
  border-bottom: 1px solid var(--rev-border-static-default-low);
  background-color: var(--rev-bg-static-default-min);
  transition: background-color 1s;
}
.rev-table__row:last-child {
  border-bottom: 0;
}
.rev-table__row--striped:nth-child(even) {
  background-color: var(--rev-bg-static-default-mid);
}
.rev-table__cell {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 1.5rem 1rem;
}
.rev-table__td:first-of-type .rev-table__cell {
  padding-left: 1.5rem;
}
.rev-table__td:last-of-type .rev-table__cell {
  padding-right: 1.5rem;
}
.rev-table__cell--center { justify-content: center; }
.rev-table__cell--end { justify-content: flex-end; }
.rev-table__cell--tabular { font-variant-numeric: tabular-nums; }
</style>
