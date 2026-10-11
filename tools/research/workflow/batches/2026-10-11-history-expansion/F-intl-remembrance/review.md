# F-intl-remembrance — history expansion drafts (review)

Status: **DRAFT ONLY**. Nothing in `src/` was touched. Not approved and not published.

Files:
- `drafts.json`: 9/9 ids, each with origin, anecdote, sourceUrl, evidence[], corrections_to_existing[] and notes
- `build_drafts.py`: generates drafts.json
- `validate.py`: checks ids, control chars and `</script`, lengths, https sourceUrl, and quote presence
- `evidence/*.txt`: saved source bodies (HTML stripped to text; UN resolutions converted from PDF with pdftotext; law.go.kr DRF XML with tags stripped). Accessed 2026-10-11.

Validation (`python3 validate.py`): ALL OK. There are 128 evidence quotes, and all of them appear in the saved bodies. The quotes from UN resolution PDFs (60/7, 62/122, 71/125, 65/209) match only after whitespace is normalized, because pdftotext wraps lines. Each of those quotes is a single contiguous passage, so no non-adjacent sentences were joined. Quotes from Yonhap and law.go.kr keep the source's CJK compatibility ideograph (女 = U+F981) as it appears in the original.

## Char counts (origin / anecdote / total; previous total)
| id | origin | anecdote | total | was |
|---|---|---|---|---|
| 01-27 holocaust | 539 | 474 | 1013 | 313 |
| 03-25 slavery/transatlantic | 537 | 473 | 1010 | 351 |
| 12-02 abolition of slavery | 539 | 512 | 1051 | 319 |
| 12-10 human rights day | 555 | 517 | 1072 | 301 |
| 04-26 chernobyl | 546 | 481 | 1027 | 348 |
| 04-29 chemical warfare | 546 | 490 | 1036 | 325 |
| 08-30 enforced disappearances | 542 | 518 | 1060 | 330 |
| gov-20 어린이날 | 570 | 475 | 1045 | 302 |
| gov-103 여권통문의 날 | 531 | 474 | 1005 | 316 |

## Reviewer attention (high priority)
1. **Chemical warfare date.** The data uses `04-29`, which was the rule from 2005 (CSP-10, C-10/5) until 2015. **Since CSP-20 (decision C-20/DEC.10, 3 Dec 2015), the day is 30 November**, or the first day of the regular CSP session when appropriate. Both UN and OPCW now point to November. The date field was **not** changed. Moving it needs separate approval plus an id/route check, since the id contains `04-29`. The draft explains the date history, so the text stays accurate whichever date the entry sits on.
2. **Enforced disappearances.** The existing text claimed the Convention was adopted by resolution 65/209. That is wrong. The Convention was adopted by resolution 61/177 (20 Dec 2006) and entered into force on 23 Dec 2010. Resolution 65/209 (21 Dec 2010) welcomed the Convention and declared 30 August.
3. **Chernobyl.** The claim that resolution 71/125 was adopted at the 30th-anniversary special meeting is unsupported: it was adopted at the 57th plenary on 8 Dec 2016, so the claim was removed. INES level 7, the 30 km zone and Korean civic-group events could not be verified (IAEA/NEA returned 403), so they were removed.
4. **Unverified figures removed:** Holocaust "104 co-sponsors"; slavery "1,200만 명"; 12-02 "organized by UNGA since 1986"; chemical "most stockpiles destroyed / Syria-Iraq investigations"; disappearances "white scarf / Plaza de Mayo"; 여권통문 "real names still unknown"; 어린이날 "world-early child-rights movement" evaluation.
5. **Human Rights Day.** The sourceUrl pointed to a US commercial site (nationaldaycalendar). Replaced with un.org. Added the observance's formal basis, resolution 423(V) of 4 Dec 1950.
6. **어린이날.** Both founding versions are now presented: 1922 천도교소년회 '어린이의 날' and 1923 색동회 '어린이날'. Added the 1927 change to the first Sunday of May. "1946년" is softened to "광복 이후" because the source gives no year. The year the substitute-holiday rule started differs between sources (백과 2018 vs 2014), so the draft describes the current rule only.
7. **여권통문.** Sources disagree on when 순성학교 opened (1898.12 / 1899.2 / 1899.4, all within 한국민족문화대백과), so the draft says the records differ. 소사 is now explained more precisely as the Joseon term for commoner married women (양반 used '씨'). The 2019-10-31 National Assembly passage is from 연합뉴스, and the current legal basis is 양성평등기본법 제38조②. The promulgation date (likely 2019-11-26, 법률 제16623호) was not confirmed from the historical text, so it is not stated.

## Proposed sourceUrl changes
- 01-27: wikipedia → https://www.un.org/en/holocaustremembrance/observance
- 03-25: unchanged (un.org)
- 12-02: wikipedia → https://www.un.org/en/observances/slavery-abolition-day
- 12-10: nationaldaycalendar → https://www.un.org/en/observances/human-rights-day
- 04-26: null → https://www.un.org/en/observances/chernobyl-remembrance-day
- 04-29: null → https://www.un.org/en/observances/chemical-warfare-victims-day
- 08-30: null → https://www.un.org/en/observances/victims-enforced-disappearance
- gov-20: ko.wikipedia → https://encykorea.aks.ac.kr/Article/E0035938
- gov-103: law.go.kr (whole statute) → https://encykorea.aks.ac.kr/Article/E0079698 (keeping law.go.kr is also acceptable)

## Gaps / time-sensitive text
- 08-30 anecdote mentions the 2026 20th-anniversary slogan. It will need updating after 2026.
- 12-02 uses the ILO 2021 estimates as cited by UN. Update this if ILO publishes newer figures.
- 08-30 name field says "세계 …의 날", while the UN name is "International Day …". The name was not changed and is flagged for the reviewer.
- 03-25 (and other entries): UN press releases (press.un.org) are behind a bot challenge, so the co-sponsor and vote-count details were not retrievable.
