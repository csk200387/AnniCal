// 정적 페이지의 문구는 라우터·프리렌더·봇 폴백이 이곳만 참조한다.
import { ogImageUrl, type StaticPage } from './og.js'
export const PAGE_META = {
  home: {
    title: '오늘의 기념일 · 세계 기념일 캘린더',
    description: '오늘은 무슨 날? 세계 곳곳의 특이한 기념일과 이색 기념일을 모아 기록하는 도감',
    keywords:
      '오늘의 기념일,기념일 캘린더,세계 기념일,세계의 날,이색 기념일,특이한 기념일,월별 기념일,음식 기념일,기념일 모음,기념일 도감,기념일 만물상',
  },
  birthday: {
    title: '내 생일은 무슨 날? · 생일 기념일 찾기',
    description:
      '내 생일과 같은 날의 기념일을 발견하고, 마음에 드는 이야기로 생일 카드를 만들어보세요. 친구의 생일도 함께 알아보세요.',
    keywords: '생일 기념일,내 생일은 무슨 날,생일 카드,생일 공유,기념일 도감,기념일 만물상',
  },
  calendar: {
    title: '기념일 캘린더·검색',
    description:
      '월별 달력에서 모든 기념일을 한눈에. 이름·태그로 검색하고 날짜별 기념일을 확인하세요.',
    keywords:
      '기념일 캘린더,기념일 달력,기념일 검색,오늘의 기념일,월별 기념일,기념일 도감,기념일 만물상',
  },
  export: {
    title: '기념일 캘린더 구독·.ics 다운로드',
    description:
      '관심 기념일을 .ics로 내려받아 구글·애플 캘린더에 추가하거나, 구독 링크로 새 기념일을 자동 업데이트 받으세요.',
    keywords:
      '기념일 캘린더 구독,기념일 ics,ics 다운로드,구글 캘린더 기념일,애플 캘린더,기념일 도감,기념일 만물상',
  },
  popular: {
    title: '많이 읽은 기념일 · 월별 관심도 순위',
    description:
      '이번 달 가장 많이 읽은 기념일 TOP 20과 지난달 관심도 순위를 살펴보세요. 월별 기록과 전체 누적 순위를 함께 볼 수 있어요.',
    keywords: '기념일 순위,인기 기념일,많이 읽은 기념일,기념일 관심도,기념일 도감,기념일 만물상',
  },
  together: {
    title: '우리 N주년은 무슨 날? · 우리의 날 찾기',
    description:
      '처음 만난 날·사귄 날·결혼한 날부터 다가오는 100일과 N주년을 계산하고, 그날의 기념일을 카드와 링크로 함께 나눠보세요.',
    keywords: '100일 계산,주년 계산,우리의 날,커플 기념일,결혼 기념일,기념일 도감',
  },
} satisfies Record<StaticPage, { title: string; description: string; keywords: string }>
export function staticPageMeta(page: StaticPage) {
  return { ...PAGE_META[page], ogImage: ogImageUrl(page) }
}
