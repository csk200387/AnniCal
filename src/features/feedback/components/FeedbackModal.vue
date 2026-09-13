<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { Anniversary } from '@/types/anniversary'

const props = defineProps<{ anniversary: Anniversary }>()
const emit = defineEmits<{ close: [] }>()

const type = ref<'error' | 'addition' | 'source' | 'deletion'>('error')
const message = ref('')
const sourceUrl = ref('')
const website = ref('')
const state = ref<'idle' | 'sending' | 'success' | 'error' | 'limited'>('idle')
const reference = ref<number | null>(null)
const canSubmit = computed(() => message.value.trim().length >= 20 && state.value !== 'sending')

function close() { emit('close') }
function onKeydown(event: KeyboardEvent) { if (event.key === 'Escape') close() }

async function submit() {
  if (!canSubmit.value) return
  state.value = 'sending'
  try {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        anniversaryId: props.anniversary.id,
        type: type.value,
        message: message.value,
        sourceUrl: sourceUrl.value,
        website: website.value,
      }),
    })
    if (response.status === 429) {
      state.value = 'limited'
      return
    }
    if (!response.ok) throw new Error('SUBMIT_FAILED')
    const result = await response.json() as { reference?: number }
    reference.value = result.reference ?? null
    state.value = 'success'
  } catch {
    state.value = 'error'
  }
}

onMounted(() => {
  document.body.style.overflow = 'hidden'
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <div class="feedback-backdrop" @mousedown.self="close">
      <section role="dialog" aria-modal="true" aria-labelledby="feedback-title" class="feedback-modal">
        <button type="button" class="feedback-close" aria-label="닫기" @click="close">×</button>

        <template v-if="state === 'success'">
          <div class="feedback-result">
            <span aria-hidden="true">✓</span>
            <h2 id="feedback-title">요청을 접수했어요</h2>
            <p>보내주신 내용을 확인한 뒤 기념일 정보에 반영할게요.</p>
            <small v-if="reference">접수 번호 #{{ reference }}</small>
            <button type="button" class="home-button home-button--dark" @click="close">확인</button>
          </div>
        </template>

        <form v-else @submit.prevent="submit">
          <p class="section-kicker"><span /> SEND A CORRECTION</p>
          <h2 id="feedback-title">정보 요청 보내기</h2>
          <p class="feedback-target">{{ anniversary.name }}</p>

          <fieldset>
            <legend>어떤 요청인가요?</legend>
            <div class="feedback-types">
              <label><input v-model="type" type="radio" value="error" /><span>정보 오류</span></label>
              <label><input v-model="type" type="radio" value="addition" /><span>내용 추가</span></label>
              <label><input v-model="type" type="radio" value="source" /><span>출처 요청</span></label>
              <label><input v-model="type" type="radio" value="deletion" /><span>삭제 요청</span></label>
            </div>
          </fieldset>

          <label class="feedback-field">
            <span>요청 내용 <small>{{ message.trim().length }}/2,000</small></span>
            <textarea v-model="message" maxlength="2000" rows="6" required placeholder="어떤 정보가 잘못됐거나 부족한지 구체적으로 적어주세요. (20자 이상)" />
          </label>
          <label class="feedback-field">
            <span>참고 링크 <small>선택</small></span>
            <input v-model="sourceUrl" type="url" maxlength="500" inputmode="url" placeholder="https://…" />
          </label>
          <label class="feedback-honeypot" aria-hidden="true">웹사이트<input v-model="website" type="text" tabindex="-1" autocomplete="off" /></label>

          <p v-if="state === 'error'" class="feedback-error">요청을 보내지 못했어요. 잠시 후 다시 시도해 주세요.</p>
          <p v-else-if="state === 'limited'" class="feedback-error">요청이 너무 많아요. 한 시간 뒤 다시 시도해 주세요.</p>
          <p class="feedback-privacy">이름이나 이메일을 받지 않으며, 요청 내용은 비공개 검토함에 저장됩니다.</p>
          <button type="submit" class="home-button home-button--dark feedback-submit" :disabled="!canSubmit">
            {{ state === 'sending' ? '보내는 중…' : '정보 요청 보내기' }} <span v-if="state !== 'sending'" aria-hidden="true">→</span>
          </button>
        </form>
      </section>
    </div>
  </Teleport>
</template>
