<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AnnicalMark from '@/components/common/AnnicalMark.vue'
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer-inner">
      <div class="footer-top">
        <div><RouterLink to="/" class="brand" aria-label="AnniCal 기념일 도감 홈"><AnnicalMark class="brand-mark" /><span class="brand-wordmark">Anni<span>Cal</span></span></RouterLink><p class="footer-description">기념일 도감<br />평범한 날짜에서 발견하는, 조금 특별한 이야기.</p></div>
        <nav class="footer-links" aria-label="하단 메뉴"><RouterLink to="/">오늘의 발견</RouterLink><RouterLink to="/calendar">기념일 달력</RouterLink><RouterLink to="/export">캘린더 연동 ↗</RouterLink></nav>
      </div>
      <div class="footer-wordmark" aria-hidden="true">every day matters.</div>
      <div class="footer-bottom"><span>© {{ year }} ANNICAL · 기념일 도감</span><span>A LITTLE REASON TO CELEBRATE. EVERY SINGLE DAY.</span></div>
    </div>
  </footer>
</template>
