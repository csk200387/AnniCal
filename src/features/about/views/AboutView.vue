<script setup lang="ts">
import '@/assets/article.css'
import PageHero from '@/components/ui/PageHero.vue'
import SectionHeader from '@/components/ui/SectionHeader.vue'
import { PAGE_META } from '@/seo/pages'
import { ABOUT_EMAIL, ABOUT_SECTIONS } from '../content'
</script>

<template>
  <div class="home-page">
    <div class="article-shell tool-container">
      <article>
        <PageHero
          variant="compact"
          title-id="about-title"
          title="기념일 도감 소개"
          :description="PAGE_META.about.description"
        />
        <div class="article-layout tool-section">
          <div class="article-body">
            <section
              v-for="s in ABOUT_SECTIONS"
              :key="s.id"
              :aria-labelledby="`about-${s.id}-title`"
            >
              <SectionHeader
                :kicker="s.kicker"
                :title="s.title"
                :title-id="`about-${s.id}-title`"
              />
              <p v-for="(p, i) in s.paragraphs" :key="i">{{ p }}</p>
            </section>
            <p class="article-source">
              연락 <a :href="`mailto:${ABOUT_EMAIL}`">{{ ABOUT_EMAIL }}</a>
            </p>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
