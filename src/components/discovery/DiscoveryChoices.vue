<script setup lang="ts">
import type { Anniversary } from '@/types/anniversary'
import ListGroup from '@/components/ui/ListGroup.vue'
import ListRow from '@/components/ui/ListRow.vue'
import ChipGroup from '@/components/ui/ChipGroup.vue'
import UiChip from '@/components/ui/UiChip.vue'
import { displayName } from '@/seo/meta'
defineProps<{ items: Anniversary[]; modelValue: string; label: string; year?: number; featureId: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
<template>
  <div class="discovery-choice-desktop">
    <h3>{{ label }}</h3><p>마음에 드는 이야기를 골라보세요.</p>
    <ListGroup single :label="label">
      <ListRow v-for="(item, index) in items" :key="item.id" radio :selected="modelValue === item.id" :aria-controls="featureId" @click="emit('update:modelValue', item.id)">
        <template #prefix>{{ String(index + 1).padStart(2, '0') }}</template>
        <template #title>{{ displayName(item.name) }}</template>
        <template #detail>{{ year ? item.dateType === 'annual-fixed' ? '매년 같은 날이에요' : `${year}년 기준이에요` : item.tags[0] }}</template>
        <template #suffix><span aria-hidden="true">{{ modelValue === item.id ? '✓' : '→' }}</span></template>
      </ListRow>
    </ListGroup>
  </div>
  <ChipGroup class="discovery-choice-mobile" single scrollable :label="label">
    <UiChip v-for="item in items" :key="item.id" radio variant="solid" :selected="modelValue === item.id" :aria-controls="featureId" @click="emit('update:modelValue', item.id)">{{ displayName(item.name) }}</UiChip>
  </ChipGroup>
</template>
