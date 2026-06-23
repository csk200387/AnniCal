<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { toPng } from 'html-to-image'
import { useShareStore } from '@/stores/share'
import ShareCard from './ShareCard.vue'

const shareStore = useShareStore()
const { isOpen, anniversary, dDay } = storeToRefs(shareStore)

// ShareCard root element 참조 — 캡처 대상.
const cardRootRef = ref<HTMLElement | null>(null)
// 미리보기 폭 측정용 풀폭 래퍼 — 스케일 계산 기준.
const previewWrapRef = ref<HTMLElement | null>(null)
const dialogRef = useTemplateRef<HTMLDivElement>('dialogRef')

const isGenerating = ref(false)
const errorMsg = ref<string | null>(null)

const filename = computed(() => {
  if (!anniversary.value) return 'anniversarium.png'
  // 파일명에 부적합한 문자 제거
  const safe = anniversary.value.name.replace(/[\\/:*?"<>|]/g, '')
  return `anniversarium-${safe}.png`
})

// 미리보기 스케일 — 실제 사용 가능한 컨테이너 폭(래퍼 clientWidth)에 카드(540px)가
// 들어가도록 동적 조정. window 폭 추정 대신 실측해 패딩/max-width 변화를 정확히 반영한다.
const previewScale = ref(1)
function recomputeScale() {
  const available = previewWrapRef.value?.clientWidth ?? 0
  if (available > 0) {
    previewScale.value = Math.min(1, available / 540)
  }
}

// 래퍼 크기 변화(뷰포트·회전·패딩 변화 포함)를 ResizeObserver 로 추적.
let resizeObserver: ResizeObserver | null = null
function observePreview() {
  if (typeof ResizeObserver === 'undefined' || !previewWrapRef.value) return
  resizeObserver?.disconnect()
  resizeObserver = new ResizeObserver(recomputeScale)
  resizeObserver.observe(previewWrapRef.value)
}
function unobservePreview() {
  resizeObserver?.disconnect()
  resizeObserver = null
}

watch(isOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
    // 모달 DOM 이 그려진 뒤에 측정/관찰해야 clientWidth 가 유효하다.
    nextTick(() => {
      dialogRef.value?.focus()
      recomputeScale()
      observePreview()
    })
  } else {
    document.body.style.overflow = ''
    unobservePreview()
    errorMsg.value = null
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  unobservePreview()
})

function close() {
  shareStore.close()
}

function onBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) close()
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

async function generatePng(): Promise<string | null> {
  if (!cardRootRef.value) return null
  isGenerating.value = true
  errorMsg.value = null
  try {
    // 미리보기와 동일한 서체로 캡처되도록 웹폰트 로딩을 먼저 보장한다.
    // (Fraunces·Inter·Noto Serif KR 는 Google Fonts 에서 비동기 로드됨)
    if (typeof document !== 'undefined' && document.fonts?.ready) {
      await document.fonts.ready
    }
    const options = {
      pixelRatio: 2, // 540 → 1080x1080
      cacheBust: true,
      backgroundColor: '#faf7f0',
      width: 540,
      height: 540,
    }
    // html-to-image 는 첫 렌더에서 폰트 임베딩이 끝나기 전에 반환되는 경우가 있어
    // 미리보기와 결과가 어긋난다. 한 번 워밍업한 뒤 두 번째 결과를 사용해 일관성 확보.
    await toPng(cardRootRef.value, options)
    const dataUrl = await toPng(cardRootRef.value, options)
    return dataUrl
  } catch (e) {
    errorMsg.value =
      e instanceof Error ? e.message : '이미지 생성에 실패했어요.'
    return null
  } finally {
    isGenerating.value = false
  }
}

async function handleDownload() {
  const url = await generatePng()
  if (!url) return
  const a = document.createElement('a')
  a.href = url
  a.download = filename.value
  document.body.appendChild(a)
  a.click()
  a.remove()
}

const canNativeShare = computed(() => {
  if (typeof navigator === 'undefined') return false
  // canShare with files 가능한 브라우저만
  return typeof navigator.share === 'function' &&
    typeof navigator.canShare === 'function'
})

async function handleNativeShare() {
  const url = await generatePng()
  if (!url || !anniversary.value) return
  try {
    const blob = await (await fetch(url)).blob()
    const file = new File([blob], filename.value, { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: anniversary.value.name,
        text: `${anniversary.value.name} · 기념일 만물상`,
      })
    } else {
      // fallback: 다운로드
      const a = document.createElement('a')
      a.href = url
      a.download = filename.value
      a.click()
    }
  } catch (e) {
    // 사용자 취소는 무시
    if (e instanceof Error && e.name !== 'AbortError') {
      errorMsg.value = e.message
    }
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen && anniversary"
        ref="dialogRef"
        tabindex="-1"
        role="dialog"
        aria-modal="true"
        aria-label="기념일 공유 이미지"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-ink-900/55 px-4 py-8 backdrop-blur-sm focus:outline-none"
        @click="onBackdropClick"
        @keydown="onKeydown"
      >
        <div
          class="relative flex w-full max-w-xl flex-col gap-6 border hairline bg-paper-50 px-6 py-7 shadow-[0_30px_80px_-30px_rgba(10,9,8,0.5)] sm:px-8 sm:py-9"
        >
          <!-- 헤더 -->
          <header class="flex items-start justify-between gap-4">
            <div>
              <p class="eyebrow">Share as Image</p>
              <h2
                class="mt-2 font-display text-2xl font-medium tracking-tight text-ink-900"
              >
                공유 이미지
              </h2>
              <p class="mt-1 text-xs text-ink-400">
                1080 × 1080 px · 인스타·카카오 등 어디서나 잘 어울려요.
              </p>
            </div>
            <button
              type="button"
              class="grid h-8 w-8 place-items-center border border-rule font-display text-base leading-none text-ink-500 transition hover:border-ink-800 hover:text-ink-900"
              aria-label="닫기"
              @click="close"
            >
              ×
            </button>
          </header>

          <!-- 미리보기 -->
          <div ref="previewWrapRef" class="w-full">
            <div
              class="mx-auto overflow-hidden border hairline shadow-[0_18px_45px_-25px_rgba(10,9,8,0.35)]"
              :style="{
                width: `${540 * previewScale}px`,
                height: `${540 * previewScale}px`,
              }"
            >
              <div
                :style="{
                  width: '540px',
                  height: '540px',
                  transform: `scale(${previewScale})`,
                  transformOrigin: 'top left',
                }"
              >
                <div ref="cardRootRef">
                  <ShareCard
                    :anniversary="anniversary"
                    :d-day="dDay"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- 액션 -->
          <div class="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
            <button
              type="button"
              class="flex-1 border border-ink-900 bg-ink-900 px-5 py-3 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-paper-50 transition hover:bg-ink-800 disabled:opacity-60"
              :disabled="isGenerating"
              @click="handleDownload"
            >
              <span v-if="isGenerating">Generating…</span>
              <span v-else>Download · 이미지 저장</span>
            </button>
            <button
              v-if="canNativeShare"
              type="button"
              class="flex-1 border border-ink-800 bg-paper-50 px-5 py-3 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-ink-800 transition hover:bg-paper-200 disabled:opacity-60"
              :disabled="isGenerating"
              @click="handleNativeShare"
            >
              Share · 공유하기
            </button>
          </div>

          <p
            v-if="errorMsg"
            class="text-center text-xs text-accent-600"
          >
            {{ errorMsg }}
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
