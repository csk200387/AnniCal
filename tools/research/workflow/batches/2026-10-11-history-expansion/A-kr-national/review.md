# A-kr-national — factual review (2026-10-11)

Scope: 9 entries in input.json. Drafts are in drafts.json. Evidence bodies were fetched with urllib and saved under evidence/. Every quote_original matches its saved file after whitespace normalization; the check was run programmatically and passed. law.go.kr texts come from the lsInfoR.do body endpoint, using the current version of each law.

| id | origin | anecdote | sourceUrl proposal |
|---|---|---|---|
| anv-fixed-03-01-march-1st-movement-day-kr | 459 | 463 | encykorea E0026772 |
| anv-fixed-08-15-liberation-day-kr | 457 | 403 | encykorea E0005138 |
| anv-fixed-07-17-constitution-day-kr | 458 | 437 | encykorea E0051513 |
| anv-fixed-10-03-national-foundation-day-kr | 461 | 427 | encykorea E0001734 |
| anv-fixed-10-09-hangul-day-kr | 464 | 487 | encykorea E0061511 |
| anv-fixed-06-06-memorial-day-kr | 472 | 439 | 국가기록원 현충일 |
| gov-54 | 493 | 455 | 국가기록원 순국선열의 날 |
| gov-11 | 461 | 457 | encykorea E0080590 |
| anv-fixed-08-29-national-humiliation-day-kr | 485 | 464 | encykorea E0061926 (was null) |

## Major corrections to existing text
1. **제헌절**: the old text calls it "the only one of the five national holidays that is not a day off." That is outdated. The 2026 amendments to the 공휴일에 관한 법률 and the 관공서 공휴일 규정 took effect on 2026-05-11, and 제헌절 became a public holiday again from 2026 (sources: law.go.kr, 외교부 공관 notice).
2. **경술국치일**: the old text says the 1965 Basic Treaty, Article 2, states the treaties were "void from the beginning." The actual wording is "already null and void." "From the beginning" is Korea's reading; Japan reads it as "no longer valid." The draft now presents both interpretations.
3. **3·1절**: only 29 of the 33 national representatives were at 태화관. The figure "about 200 places on that one day" could not be verified and was removed.
4. **현충일**: the old text presented the 망종 explanation and the burial custom as fact. The draft now frames them as "the commonly cited explanation," following 국가기록원.
5. **순국선열의 날**: the 조기 claim was removed because the 국기법 does not specify it. The definition of 애국지사 was corrected to match Article 4 of the 독립유공자예우법.
6. **임시정부**: the old text put the 임시의정원's formation and the naming of the country on 4/11. The source dates both to 4/10, with the 4/11 임시헌장 and government founding the next day. The text now uses this order. The stated reason for the 4/13→4/11 date change was unsourced and has been reduced to the documented chronology.

## Contested or attributed statements
- 한일병합조약 validity: the encykorea author's view (illegal and void from the start) is attributed. The Korea–Japan difference in interpreting "already" is attributed to press sources (동아일보, 한겨레). No 외교부 primary document was obtained.
- The 7/17 조선 founding-date link is attributed to 국가기록원, which itself uses "했다고 한다."
- The 단군 story is framed as a founding myth recorded in 『삼국유사』. 2333 BCE is given only as the traditional 단기 reckoning.

## Unresolved gaps / items for reviewer
- The promulgation of the constitution by 국회의장 이승만 was not verified and was omitted.
- North Korea's 1/15 Hangul commemoration is backed only by a 중앙일보 archive article. It was left out of the draft; the evidence is saved.
- 개천절 naming: 국가기록원 says 대종교 used "개천일," while encykorea says "개천절." The draft follows encykorea.
- 현충일 renaming month is inconsistent: 1975-01 (국가기록원, 정책브리핑) versus 1975-12 (encykorea). The draft gives only "1975."
- 순국선열의 날 1939 resolution: the quoted 회의록 text comes from a 2009 정책브리핑 article. The primary 회의록 was not consulted.
- 경술국치일 is not a statutory 기념일. This was confirmed by its absence from the 57-item list; it cannot be shown with a direct quote.
