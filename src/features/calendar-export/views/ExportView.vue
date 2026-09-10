<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useCalendarExport } from '../composables/useCalendarExport'

const PREVIEW_INITIAL_COUNT = 12
const {
  isLoading,
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
  const labels = categoryOptions.value.filter((option) => isSelected(option.id)).map((option) => option.label)
  if (!labels.length) {
    const groups = groupOptions.value.filter((option) => isGroupSelected(option.id)).map((option) => option.label)
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
  <div class="home-page">
    <div class="home-container">
      <header class="page-hero" aria-labelledby="export-title">
        <p class="section-kicker"><span /> CALENDAR COLLECTION</p>
        <h1 id="export-title">좋아하는 날들을,<br /><em>한 권의 달력처럼.</em></h1>
        <p class="page-hero-description">관심 있는 주제를 골라 나만의 기념일 캘린더를 만드세요. 한 번 내려받거나, 살아 있는 링크로 계속 구독할 수 있어요.</p>
        <div class="page-hero-stats">
          <div><span>SELECTED</span><strong>{{ selectedCount }}<small>건</small></strong></div>
          <div><span>FORMAT</span><strong>.ics</strong></div>
        </div>
        <span class="page-hero-spark" aria-hidden="true">✳</span>
      </header>

      <p v-if="isLoading" class="page-note">기념일을 불러오는 중…</p>
      <p v-else-if="error" class="page-note">{{ error }}</p>

      <template v-else>
        <section class="home-section" aria-labelledby="curate-title">
          <div class="section-heading">
            <div>
              <p class="section-kicker"><em>01</em> CURATE</p>
              <h2 id="curate-title">어떤 기념일을 담을까요<span class="heading-dot">?</span></h2>
            </div>
            <div class="export-links">
              <button type="button" @click="selectAll">전체 선택</button>
              <button type="button" @click="selectNone">모두 해제</button>
            </div>
          </div>

          <div class="export-grid">
            <button
              v-for="opt in categoryOptions"
              :key="opt.id"
              type="button"
              class="export-chip"
              :aria-pressed="isSelected(opt.id)"
              @click="toggle(opt.id)"
            >
              <span class="export-emoji" aria-hidden="true">{{ opt.emoji }}</span>
              <strong>{{ opt.label }}</strong>
              <span>{{ opt.count }}</span>
            </button>
          </div>

          <div v-for="opt in groupOptions" :key="opt.id" class="export-group">
            <span class="export-emoji" aria-hidden="true">{{ opt.emoji }}</span>
            <div>
              <strong>{{ opt.label }}도 함께 담기</strong>
              <p>선택한 주제와 별개로, 이 묶음에 속한 {{ opt.count }}개 기념일을 더합니다.</p>
            </div>
            <button
              type="button"
              role="switch"
              class="export-switch"
              :aria-label="`${opt.label}도 함께 담기`"
              :aria-checked="isGroupSelected(opt.id)"
              @click="toggleGroup(opt.id)"
            ><i /></button>
          </div>

          <div class="export-summary">
            <strong>{{ selectedCount }}건<span>캘린더에 담길 예정</span></strong>
            <p>{{ selectionNote }}</p>
          </div>
        </section>

        <section class="home-section" aria-labelledby="export-step-title">
          <div class="section-heading">
            <div>
              <p class="section-kicker"><em>02</em> EXPORT</p>
              <h2 id="export-step-title">내 캘린더로 가져오기<span class="heading-dot">.</span></h2>
            </div>
          </div>

          <div class="export-cards">
            <article class="export-card export-card--dark">
              <p class="section-kicker"><span /> .ICS DOWNLOAD</p>
              <h3>한 번에 받아<br />직접 가져오기</h3>
              <p>Google Calendar, Apple Calendar 등 대부분의 캘린더에서 열 수 있는 표준 파일이에요.</p>
              <div class="export-card-foot">
                <button type="button" class="home-button home-button--light" :disabled="!selectedCount" @click="downloadIcs">
                  <template v-if="selectedCount">{{ selectedCount }}건 내려받기</template>
                  <template v-else>카테고리를 선택하세요</template>
                  <span aria-hidden="true">↓</span>
                </button>
              </div>
              <span class="export-card-ring" aria-hidden="true" />
            </article>

            <article class="export-card">
              <p class="section-kicker"><span /> SUBSCRIPTION LINK</p>
              <h3>새로운 날까지<br />계속 받아보기</h3>
              <p>링크를 구독하면 새로운 기념일이 추가될 때 캘린더도 자동으로 업데이트돼요.</p>
              <div class="export-card-foot">
                <div class="export-copy">
                  <input
                    :value="feedWebcalUrl ?? ''"
                    readonly
                    :placeholder="hasSelection ? '' : '카테고리를 선택하세요'"
                    aria-label="구독 URL"
                    :disabled="!hasSelection"
                    @focus="(e) => (e.target as HTMLInputElement).select()"
                  />
                  <button type="button" :disabled="!hasSelection" @click="copyFeedUrl">{{ copied ? '복사됨' : '복사' }}</button>
                </div>
                <div v-if="hasSelection" class="export-links">
                  <a :href="googleAddUrl!" target="_blank" rel="noopener noreferrer">Google Calendar →</a>
                  <a :href="feedWebcalUrl!">Apple · Other →</a>
                </div>
                <p v-else class="export-note">카테고리를 하나 이상 선택하면 구독 링크가 만들어져요.</p>
                <p class="export-note">※ 구독 피드는 배포된 사이트에서 동작해요.</p>
              </div>
            </article>
          </div>
        </section>

        <section class="home-section" aria-labelledby="calendar-preview-title">
          <div class="section-heading">
            <div>
              <p class="section-kicker"><em>03</em> CALENDAR PREVIEW</p>
              <h2 id="calendar-preview-title">담기는 기념일<span class="heading-dot">.</span></h2>
            </div>
            <span class="date-pill">{{ selectedCount }}건</span>
          </div>

          <ul v-if="visiblePreviewItems.length" id="calendar-preview-list" class="preview-list">
            <li v-for="item in visiblePreviewItems" :key="item.id">
              <time>{{ item.dateLabel }}</time><span>{{ item.name }}</span>
            </li>
          </ul>
          <p v-else class="day-panel-empty">카테고리를 하나 이상 선택하면 포함되는 기념일을 확인할 수 있어요.</p>

          <button
            v-if="hiddenPreviewCount"
            type="button"
            class="preview-more"
            :aria-expanded="isPreviewExpanded"
            aria-controls="calendar-preview-list"
            @click="isPreviewExpanded = !isPreviewExpanded"
          >{{ isPreviewExpanded ? '접기' : `더보기 · ${hiddenPreviewCount}건` }}</button>
        </section>
      </template>
    </div>
  </div>
</template>
