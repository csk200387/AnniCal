// Vercel 조건에는 /i 플래그를 줄 수 없어 ASCII 대소문자를 명시한다.
const names = ['Twitterbot', 'facebookexternalhit', 'Facebot', 'kakaotalk-scrap',
  'Slackbot', 'Discordbot', 'TelegramBot', 'LinkedInBot', 'WhatsApp', 'Line/',
  'Pinterest', 'redditbot', 'Bluesky', 'Mastodon', 'Iframely', 'Embedly',
  'SkypeUriPreview', 'Applebot']
export const PREVIEW_BOT_PATTERN = `.*(?:${names.map(name => name.replace(/[a-z]/gi, c => `[${c.toUpperCase()}${c.toLowerCase()}]`)).join('|')}).*`
export const isPreviewBot = (ua: string): boolean => new RegExp(PREVIEW_BOT_PATTERN).test(ua)
