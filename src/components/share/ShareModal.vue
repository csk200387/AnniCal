<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useTemplateRef, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useShareStore } from '@/stores/share'
import { useCopyToClipboard } from '@/composables/useCopyToClipboard'
import { SITE_URL } from '@/seo/meta'
import ShareCard from './ShareCard.vue'

// html-to-image 는 이미지를 만들 때만 필요하다. 모달을 열어 링크만 복사하는
// 사람에게는 받게 하지 않는다 — 한 번 받으면 모듈 캐시에 남아 재요청은 없다.
type ImageLib = typeof import('html-to-image')
let imageLibPromise: Promise<ImageLib> | null = null
function loadImageLib(): Promise<ImageLib> {
  if (!imageLibPromise) imageLibPromise = import('html-to-image')
  return imageLibPromise
}

// 폰트 임베딩 CSS(웹폰트 base64 인라인)는 카드 내용과 무관하게 항상 동일하므로
// 세션 동안 한 번만 계산해 재사용한다. 이게 캡처 시간의 대부분(특히 한글
// Noto Serif KR 임베딩)을 차지한다. 모달을 열자마자가 아니라 이미지 버튼에
// 손이 닿았을 때(hover/focus) 준비해, 링크만 복사하는 사람은 이 비용을 아예
// 치르지 않게 한다.
let fontEmbedCssCache: string | null = null
let fontEmbedCssPromise: Promise<string> | null = null
function ensureFontEmbedCss(node: HTMLElement): Promise<string> {
  if (fontEmbedCssCache) return Promise.resolve(fontEmbedCssCache)
  if (!fontEmbedCssPromise) {
    fontEmbedCssPromise = loadImageLib()
      .then(({ getFontEmbedCSS }) => getFontEmbedCSS(node))
      .then((css) => {
        fontEmbedCssCache = css
        return css
      })
      .catch((e) => {
        // 실패 시 캐시를 비워 다음 시도에서 재계산하도록 한다.
        fontEmbedCssPromise = null
        throw e
      })
  }
  return fontEmbedCssPromise
}

/** 이미지 버튼에 hover/focus 하면 라이브러리와 폰트를 미리 준비한다. */
function warmUpImage(): void {
  if (cardRootRef.value) ensureFontEmbedCss(cardRootRef.value).catch(() => {})
}

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

// 이 기념일의 상세 페이지 주소. 프리렌더된 정적 페이지라 링크를 받은 사람은
// 앱이 뜨기 전에도 본문을 볼 수 있고, 카카오톡·슬랙에서 OG 카드가 붙는다.
//
// 경로 매핑(routes.json)은 1,300여 건이라 137KB 다. ShareModal 은 AppShell 에
// 항상 붙어 있어 정적으로 import 하면 이 덩치가 메인 번들에 그대로 실린다.
// 모달을 처음 열 때만 동적으로 불러와 메인 번들을 가볍게 유지한다.
let routesPromise: Promise<typeof import('@/utils/anniversaryRoutes')> | null = null
function loadRoutes() {
  if (!routesPromise) routesPromise = import('@/utils/anniversaryRoutes')
  return routesPromise
}

const sharePath = ref<string | null>(null)
const shareUrl = computed(() => (sharePath.value ? `${SITE_URL}${sharePath.value}` : null))

// 화면에 보여줄 때는 스킴을 떼어 짧게 — 복사되는 값은 전체 URL 그대로다.
const shareUrlLabel = computed(() => shareUrl.value?.replace(/^https?:\/\//, '') ?? '')

const { copied, copy } = useCopyToClipboard()

async function handleCopyLink() {
  if (!shareUrl.value) return
  const ok = await copy(shareUrl.value)
  if (!ok) errorMsg.value = '링크 복사에 실패했어요. 주소를 직접 선택해 복사해 주세요.'
}

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

// 기념일이 바뀔 때마다 경로를 다시 해석한다. 모달이 닫혀 있으면 굳이 불러오지 않는다.
watch([isOpen, anniversary], async ([open, anv]) => {
  if (!open || !anv) {
    sharePath.value = null
    return
  }
  const { pathForId } = await loadRoutes()
  // 로딩 중에 다른 기념일로 바뀌었으면 늦게 도착한 결과는 버린다.
  if (shareStore.anniversary?.id === anv.id) sharePath.value = pathForId(anv.id)
})

watch(isOpen, (open) => {
  if (open) {
    document.body.style.overflow = 'hidden'
    // 모달 DOM 이 그려진 뒤에 측정/관찰해야 clientWidth 가 유효하다.
    nextTick(() => {
      dialogRef.value?.focus()
      recomputeScale()
      observePreview()
      // 폰트 임베딩 준비는 여기서 하지 않는다 — 이미지 버튼에 손이 닿을 때
      // warmUpImage() 가 맡는다(위 주석 참고).
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
    // 폰트 임베딩 CSS 를 미리(또는 즉석으로) 계산해 toPng 에 직접 넘기면,
    // html-to-image 가 매 호출마다 폰트를 다시 fetch/인코딩하는 단계를 건너뛴다.
    // 결과가 항상 동일하므로 미리보기와도 어긋나지 않아 워밍업용 2회 호출이 불필요.
    const [{ toPng }, fontEmbedCSS] = await Promise.all([
      loadImageLib(),
      ensureFontEmbedCss(cardRootRef.value),
    ])
    const dataUrl = await toPng(cardRootRef.value, {
      pixelRatio: 2, // 540 → 1080x1080
      backgroundColor: '#faf7f0',
      width: 540,
      height: 540,
      fontEmbedCSS,
    })
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

// navigator.share 만 있으면 링크 공유는 가능하다. 파일(이미지) 첨부는
// canShare({ files }) 가 참일 때만 되므로 둘을 따로 따진다.
const canNativeShare = computed(
  () => typeof navigator !== 'undefined' && typeof navigator.share === 'function',
)

const shareText = computed(() =>
  anniversary.value ? `${anniversary.value.name} · 기념일 만물상` : '기념일 만물상',
)

/** 사용자 취소(AbortError)는 오류가 아니므로 조용히 넘긴다. */
function reportShareError(e: unknown) {
  if (e instanceof Error && e.name !== 'AbortError') errorMsg.value = e.message
}

/** 링크만 공유. 네이티브 공유 시트가 없으면 클립보드 복사로 대체한다. */
async function handleShareLink() {
  if (!shareUrl.value) return
  if (!canNativeShare.value) {
    await handleCopyLink()
    return
  }
  try {
    await navigator.share({
      title: anniversary.value?.name,
      text: shareText.value,
      url: shareUrl.value,
    })
  } catch (e) {
    reportShareError(e)
  }
}

/** 이미지 공유. 링크가 있으면 함께 실어 보낸다. */
async function handleNativeShare() {
  const dataUrl = await generatePng()
  if (!dataUrl || !anniversary.value) return
  try {
    const blob = await (await fetch(dataUrl)).blob()
    const file = new File([blob], filename.value, { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      // url 을 files 와 함께 넘기면 무시하는 브라우저가 있어, 링크를 text 에도 넣는다.
      await navigator.share({
        files: [file],
        title: anniversary.value.name,
        text: shareUrl.value ? `${shareText.value}\n${shareUrl.value}` : shareText.value,
        ...(shareUrl.value ? { url: shareUrl.value } : {}),
      })
    } else {
      // 파일 공유가 안 되는 환경 — 이미지는 내려받고 링크는 따로 공유한다.
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = filename.value
      a.click()
    }
  } catch (e) {
    reportShareError(e)
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
              <p class="eyebrow">Share</p>
              <h2
                class="mt-2 font-display text-2xl font-medium tracking-tight text-ink-900"
              >
                공유하기
              </h2>
              <p class="mt-1 text-xs text-ink-400">
                이미지로 저장하거나 링크를 보내세요.
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

          <!-- 링크 -->
          <div v-if="shareUrl" class="flex flex-col gap-2">
            <p class="eyebrow !text-[0.6rem]">Link</p>
            <div class="flex items-stretch border hairline bg-paper-100/60">
              <input
                :value="shareUrl"
                readonly
                aria-label="기념일 페이지 주소"
                class="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-display text-[0.82rem] text-ink-600 outline-none"
                @focus="($event.target as HTMLInputElement).select()"
              />
              <button
                type="button"
                class="shrink-0 border-l hairline px-4 text-[0.68rem] font-medium uppercase tracking-[0.18em] transition"
                :class="copied
                  ? 'bg-ink-900 text-paper-50'
                  : 'text-ink-600 hover:bg-paper-200 hover:text-ink-900'"
                @click="handleCopyLink"
              >
                {{ copied ? '복사됨' : '복사' }}
              </button>
            </div>
            <p class="text-[0.7rem] leading-relaxed text-ink-400">
              {{ shareUrlLabel }} — 받는 사람은 앱을 열지 않아도 이 기념일의 유래를 바로 볼 수 있어요.
            </p>
          </div>

          <!-- 액션 -->
          <div class="flex flex-col gap-2.5 sm:flex-row sm:gap-3">
            <button
              type="button"
              class="flex-1 border border-ink-900 bg-ink-900 px-5 py-3 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-paper-50 transition hover:bg-ink-800 disabled:opacity-60"
              :disabled="isGenerating"
              @pointerenter="warmUpImage"
              @focus="warmUpImage"
              @click="handleDownload"
            >
              <span v-if="isGenerating">Generating…</span>
              <span v-else>Download · 이미지 저장</span>
            </button>
            <button
              v-if="shareUrl"
              type="button"
              class="flex-1 border border-ink-800 bg-paper-50 px-5 py-3 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-ink-800 transition hover:bg-paper-200"
              @click="handleShareLink"
            >
              {{ canNativeShare ? 'Share · 링크 공유' : 'Copy · 링크 복사' }}
            </button>
            <button
              v-if="canNativeShare"
              type="button"
              class="flex-1 border border-ink-800 bg-paper-50 px-5 py-3 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-ink-800 transition hover:bg-paper-200 disabled:opacity-60"
              :disabled="isGenerating"
              @pointerenter="warmUpImage"
              @focus="warmUpImage"
              @click="handleNativeShare"
            >
              Share · 이미지 공유
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
