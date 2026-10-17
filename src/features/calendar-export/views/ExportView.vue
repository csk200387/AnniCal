<script setup lang="ts">
import '@/assets/export.css'
import { computed, ref, watch } from 'vue'
import { useCalendarExport } from '../composables/useCalendarExport'

import PageHero from '@/components/ui/PageHero.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import UiButton from '@/components/ui/UiButton.vue'
import ChipGroup from '@/components/ui/ChipGroup.vue'
import UiChip from '@/components/ui/UiChip.vue'
import FieldShell from '@/components/ui/FieldShell.vue'
import ListGroup from '@/components/ui/ListGroup.vue'
import ListRow from '@/components/ui/ListRow.vue'
import ResultState from '@/components/ui/ResultState.vue'
import SkeletonRows from '@/components/ui/SkeletonRows.vue'

const PREVIEW_INITIAL_COUNT = 12
const {
  loading,
  error,
  categoryOptions,
  groupOptions,
  isSelected,
  toggle,
  isGroupSelected,
  toggleGroup,
  selectAll,
  selectNone,
  hasSelection,
  selectedCount,
  previewItems,
  downloadIcs,
  feedWebcalUrl,
  googleAddUrl,
  copied,
  copyFailed,
  copyFeedUrl,
} = useCalendarExport()

const isPreviewExpanded = ref(false)
const visiblePreviewItems = computed(() =>
  isPreviewExpanded.value ? previewItems.value : previewItems.value.slice(0, PREVIEW_INITIAL_COUNT),
)
const hiddenPreviewCount = computed(() =>
  Math.max(0, previewItems.value.length - PREVIEW_INITIAL_COUNT),
)
const selectionNote = computed(() => {
  const labels = categoryOptions.value
    .filter((option) => isSelected(option.id))
    .map((option) => option.label)
  if (!labels.length) {
    const groups = groupOptions.value
      .filter((option) => isGroupSelected(option.id))
      .map((option) => option.label)
    return groups.length ? `${groups.join(' · ')}만 담습니다.` : '카테고리를 선택해 주세요.'
  }
  return labels.length <= 3
    ? labels.join(' · ')
    : `${labels.slice(0, 3).join(' · ')} 외 ${labels.length - 3}개 주제`
})

watch(previewItems, () => {
  isPreviewExpanded.value = false
})
</script>

<template>
  <div class="home-page export-page">
    <div class="tool-container">
      <PageHero
        kicker="CALENDAR COLLECTION"
        title-id="export-title"
        description="관심 있는 주제를 골라 나만의 기념일 캘린더를 만드세요. 한 번 내려받거나, 살아 있는 링크로 계속 구독할 수 있어요."
      >
        <template #title
          >좋아하는 날들을, <br /><span class="heading-dot">한 권의 달력처럼.</span></template
        >
        <template #footer
          ><dl class="export-hero-summary">
            <div>
              <dt>SELECTED</dt>
              <dd>{{ selectedCount }}<small>건</small></dd>
            </div>
            <div>
              <dt>FORMAT</dt>
              <dd>.ics</dd>
            </div>
          </dl></template
        >
      </PageHero>
      <SkeletonRows v-if="loading" :rows="3" variant="card" label="기념일을 불러오는 중이에요" />
      <ResultState
        v-else-if="error"
        tone="error"
        title="기념일을 불러오지 못했어요"
        :description="error"
      />
      <div v-else class="export-content">
        <section class="tool-section" aria-labelledby="curate-title">
          <SectionHeader kicker="01 · CURATE" title-id="curate-title"
            ><template #title
              ><h2 id="curate-title">
                어떤 기념일을 담을까요<span class="heading-dot">?</span>
              </h2></template
            ><template #action
              ><div class="export-selection-actions">
                <UiButton variant="ghost" size="s" @click="selectAll">전체 선택</UiButton
                ><UiButton variant="ghost" size="s" @click="selectNone">모두 해제</UiButton>
              </div></template
            ></SectionHeader
          >
          <ChipGroup label="캘린더에 담을 주제">
            <UiChip
              v-for="opt in categoryOptions"
              :key="opt.id"
              :selected="isSelected(opt.id)"
              class="ui-chip--check"
              :count="opt.count"
              @click="toggle(opt.id)"
              ><span aria-hidden="true">{{ opt.emoji }}</span
              >{{ opt.label }}</UiChip
            >
          </ChipGroup>
          <div v-for="opt in groupOptions" :key="opt.id" class="export-group">
            <div>
              <strong>{{ opt.label }}도 함께 담기</strong>
              <p>선택한 주제와 별개로, 이 묶음에 속한 {{ opt.count }}개 기념일을 더합니다.</p>
            </div>
            <UiChip
              class="ui-chip--check"
              :selected="isGroupSelected(opt.id)"
              :count="opt.count"
              :aria-label="`${opt.label}도 함께 담기`"
              @click="toggleGroup(opt.id)"
              ><span aria-hidden="true">{{ opt.emoji }}</span
              >{{ isGroupSelected(opt.id) ? '함께 담아요' : '함께 담기' }}</UiChip
            >
          </div>
        </section>
        <div class="export-summary" role="status" aria-live="polite" aria-atomic="true">
          <strong>{{ selectedCount }}건<span>캘린더에 담길 예정</span></strong>
          <p>{{ selectionNote }}</p>
        </div>
        <section class="tool-section" aria-labelledby="export-step-title">
          <SectionHeader
            kicker="02 · EXPORT"
            title="내 캘린더로 가져오기"
            title-id="export-step-title"
          />
          <div class="export-cards">
            <article class="export-card">
              <p class="section-kicker"><span /> .ICS DOWNLOAD</p>
              <h3>한 번에 받아 <br />직접 가져오기</h3>
              <p>
                Google Calendar, Apple Calendar 등 대부분의 캘린더에서 열 수 있는 표준 파일이에요.
              </p>
              <div class="export-card-foot">
                <UiButton
                  variant="brand"
                  block
                  icon="down"
                  :disabled="!selectedCount"
                  @click="downloadIcs"
                  >{{
                    selectedCount ? `${selectedCount}건 내려받기` : '카테고리를 선택하세요'
                  }}</UiButton
                >
              </div>
            </article>
            <article class="export-card">
              <p class="section-kicker"><span /> SUBSCRIPTION LINK</p>
              <h3>새로운 날까지 <br />계속 받아보기</h3>
              <p>링크를 구독하면 새로운 기념일이 추가될 때 캘린더도 자동으로 업데이트돼요.</p>
              <div class="export-card-foot">
                <FieldShell for="export-feed-url" label="구독 URL"
                  ><div class="export-copy">
                    <input
                      id="export-feed-url"
                      :value="feedWebcalUrl ?? ''"
                      readonly
                      :placeholder="hasSelection ? '' : '카테고리를 선택하세요'"
                      :disabled="!hasSelection"
                      @focus="(e) => (e.target as HTMLInputElement).select()"
                    /><UiButton size="s" :disabled="!hasSelection" @click="copyFeedUrl">{{
                      copied ? '복사됨' : copyFailed ? '복사 실패' : '복사'
                    }}</UiButton>
                  </div></FieldShell
                >
                <p class="sr-only" role="status">
                  {{
                    copied
                      ? '구독 URL을 복사했어요.'
                      : copyFailed
                        ? '복사하지 못했어요. 주소를 길게 눌러 직접 복사해 주세요.'
                        : ''
                  }}
                </p>
                <div v-if="hasSelection" class="export-links">
                  <UiButton
                    variant="ghost"
                    size="s"
                    :href="googleAddUrl!"
                    target="_blank"
                    rel="noopener noreferrer"
                    icon="next"
                    >Google Calendar</UiButton
                  ><UiButton variant="ghost" size="s" :href="feedWebcalUrl!" icon="next"
                    >Apple · Other</UiButton
                  >
                </div>
                <p v-else class="export-note">
                  카테고리를 하나 이상 선택하면 구독 링크가 만들어져요.
                </p>
                <p class="export-note">※ 구독 피드는 배포된 사이트에서 동작해요.</p>
              </div>
            </article>
          </div>
        </section>
        <section class="tool-section" aria-labelledby="calendar-preview-title">
          <SectionHeader
            kicker="03 · CALENDAR PREVIEW"
            title="담기는 기념일"
            title-id="calendar-preview-title"
            ><template #action
              ><span class="date-pill">{{ selectedCount }}건</span></template
            ></SectionHeader
          >
          <ListGroup
            v-if="visiblePreviewItems.length"
            id="calendar-preview-list"
            as="ul"
            label="캘린더에 담기는 기념일"
            ><li v-for="item in visiblePreviewItems" :key="item.id">
              <ListRow
                ><template #prefix
                  ><time class="export-preview-date">{{ item.dateLabel }}</time></template
                ><template #title>{{ item.name }}</template></ListRow
              >
            </li></ListGroup
          >
          <ResultState
            v-else
            title="담을 기념일을 골라보세요"
            description="카테고리를 하나 이상 선택하면 포함되는 기념일을 확인할 수 있어요."
          />
          <div v-if="hiddenPreviewCount" class="export-preview-more">
            <UiButton
              variant="outline"
              :aria-expanded="isPreviewExpanded"
              aria-controls="calendar-preview-list"
              @click="isPreviewExpanded = !isPreviewExpanded"
              >{{ isPreviewExpanded ? '접기' : `더보기 · ${hiddenPreviewCount}건` }}</UiButton
            >
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
