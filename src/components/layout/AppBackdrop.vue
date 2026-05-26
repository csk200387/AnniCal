<script setup lang="ts">
/**
 * 페이지 뒤에 깔리는 매거진 풍 배경 장식.
 * - fixed inset-0 + pointer-events-none 으로 콘텐츠를 절대 가리지 않음
 * - 콘텐츠 폭(max-w-3xl) 양옆 여백을 채우는 코너 도형 중심
 * - opacity 0.04~0.18 사이로 가독성에 영향 없음
 */
</script>

<template>
  <div
    aria-hidden="true"
    class="pointer-events-none fixed inset-0 z-0 overflow-hidden"
  >
    <!-- 우상단 액센트 글로우 -->
    <div
      class="absolute -right-40 -top-40 h-[600px] w-[600px] rounded-full"
      style="background: radial-gradient(circle, rgba(139,44,44,0.09) 0%, rgba(139,44,44,0.02) 45%, transparent 75%);"
    />
    <!-- 좌하단 잉크 글로우 -->
    <div
      class="absolute -bottom-48 -left-48 h-[700px] w-[700px] rounded-full"
      style="background: radial-gradient(circle, rgba(47,44,40,0.07) 0%, rgba(47,44,40,0.02) 50%, transparent 80%);"
    />

    <!-- 우상단 큰 동심원 (반쯤 잘려 보임) -->
    <svg
      class="absolute -right-32 -top-32 h-[480px] w-[480px]"
      viewBox="0 0 400 400"
    >
      <g stroke="#2f2c28" fill="none">
        <circle cx="200" cy="200" r="80" stroke-width="0.8" stroke-opacity="0.16" />
        <circle cx="200" cy="200" r="140" stroke-width="0.7" stroke-opacity="0.1" />
        <circle cx="200" cy="200" r="200" stroke-width="0.6" stroke-opacity="0.06" />
      </g>
      <!-- 중앙 작은 액센트 도트 -->
      <circle cx="200" cy="200" r="2.4" fill="#8b2c2c" fill-opacity="0.6" />
    </svg>

    <!-- 좌하단 동심원 (버건디 톤) -->
    <svg
      class="absolute -left-40 -bottom-40 h-[520px] w-[520px]"
      viewBox="0 0 400 400"
    >
      <g stroke="#8b2c2c" fill="none">
        <circle cx="200" cy="200" r="90" stroke-width="0.7" stroke-opacity="0.14" />
        <circle cx="200" cy="200" r="160" stroke-width="0.6" stroke-opacity="0.08" />
        <circle cx="200" cy="200" r="230" stroke-width="0.5" stroke-opacity="0.05" />
      </g>
    </svg>

    <!-- 좌상단 코너 마커 (네비 아래쪽) -->
    <svg
      class="absolute left-4 top-32 h-28 w-28 sm:left-8 lg:left-16"
      viewBox="0 0 100 100"
    >
      <g fill="#2f2c28" fill-opacity="0.3">
        <circle cx="12" cy="12" r="2.2" />
        <circle cx="26" cy="16" r="1.4" fill-opacity="0.22" />
        <circle cx="16" cy="26" r="1.4" fill-opacity="0.22" />
      </g>
      <g stroke="#2f2c28" stroke-opacity="0.2" stroke-width="0.8" stroke-linecap="round">
        <line x1="48" y1="58" x2="58" y2="58" />
        <line x1="53" y1="53" x2="53" y2="63" />
      </g>
      <!-- 짧은 대각 hash -->
      <g stroke="#2f2c28" stroke-opacity="0.16" stroke-width="0.7" stroke-linecap="round">
        <line x1="74" y1="14" x2="86" y2="2" />
        <line x1="80" y1="20" x2="92" y2="8" />
      </g>
    </svg>

    <!-- 우상단 코너 작은 도트 클러스터 (네비 아래) -->
    <svg
      class="absolute right-4 top-32 h-24 w-24 sm:right-8 lg:right-16"
      viewBox="0 0 100 100"
    >
      <g fill="#8b2c2c">
        <circle cx="20" cy="80" r="2.8" fill-opacity="0.55" />
        <circle cx="34" cy="92" r="1.4" fill-opacity="0.32" />
        <circle cx="8" cy="92" r="1.4" fill-opacity="0.32" />
      </g>
      <!-- 작은 사각형 outline -->
      <rect
        x="68" y="20" width="14" height="14"
        fill="none" stroke="#2f2c28" stroke-width="0.7" stroke-opacity="0.18"
      />
    </svg>

    <!-- 좌측 마진 라인 (콘텐츠보다 살짝 바깥) -->
    <div
      class="absolute top-40 bottom-40 hidden w-px lg:block"
      style="left: calc(50% - 480px); background: linear-gradient(to bottom, transparent, rgba(47,44,40,0.12), transparent);"
    />
    <div
      class="absolute top-40 bottom-40 hidden w-px lg:block"
      style="right: calc(50% - 480px); background: linear-gradient(to bottom, transparent, rgba(47,44,40,0.12), transparent);"
    />

    <!-- 중앙 가로지르는 가는 곡선 -->
    <svg
      class="absolute left-0 top-1/2 h-[300px] w-full -translate-y-1/2"
      viewBox="0 0 1440 300"
      preserveAspectRatio="xMidYMid slice"
    >
      <path
        d="M -100 150 Q 360 40 720 160 T 1540 130"
        fill="none" stroke="#2f2c28" stroke-opacity="0.06" stroke-width="0.7"
      />
      <path
        d="M -100 200 Q 360 280 720 200 T 1540 230"
        fill="none" stroke="#2f2c28" stroke-opacity="0.04" stroke-width="0.6"
      />
    </svg>

    <!-- 우하단 코너 + 마커 (푸터 위) -->
    <svg
      class="absolute right-4 bottom-32 h-28 w-28 sm:right-8 lg:right-16"
      viewBox="0 0 100 100"
    >
      <g stroke="#2f2c28" stroke-opacity="0.2" stroke-width="0.8" stroke-linecap="round">
        <line x1="20" y1="30" x2="30" y2="30" />
        <line x1="25" y1="25" x2="25" y2="35" />
      </g>
      <g fill="#2f2c28" fill-opacity="0.28">
        <circle cx="80" cy="70" r="2.2" />
        <circle cx="90" cy="82" r="1.4" fill-opacity="0.2" />
        <circle cx="68" cy="82" r="1.4" fill-opacity="0.2" />
      </g>
      <!-- 다이아몬드 outline -->
      <rect
        x="56" y="36" width="10" height="10"
        fill="none" stroke="#2f2c28" stroke-width="0.6" stroke-opacity="0.16"
        transform="rotate(45 61 41)"
      />
    </svg>

    <!-- 좌하단 코너 작은 그룹 (푸터 위) -->
    <svg
      class="absolute left-4 bottom-40 h-24 w-24 sm:left-8 lg:left-16"
      viewBox="0 0 100 100"
    >
      <g fill="#8b2c2c">
        <circle cx="20" cy="20" r="2.4" fill-opacity="0.5" />
        <circle cx="34" cy="32" r="1.4" fill-opacity="0.28" />
      </g>
      <g stroke="#2f2c28" stroke-opacity="0.16" stroke-width="0.6" stroke-linecap="round">
        <line x1="60" y1="70" x2="72" y2="58" />
        <line x1="66" y1="76" x2="78" y2="64" />
      </g>
    </svg>
  </div>
</template>
