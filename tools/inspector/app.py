"""
기념일 데이터 검수기 (Gradio UI)

- src/data/anniversaries.json 을 좌측 리스트로 보고,
  우측 폼에서 한 건씩 수정/추가/삭제한다.
- 저장 시 동일 파일을 그대로 덮어쓴다 (2-space indent, UTF-8, ensure_ascii=False).
- 상단에 검수 결과 (중복 id, 알 수 없는 카테고리, 필수 누락, 날짜 포맷) 요약.

실행:
    cd tools/inspector
    pip install -r requirements.txt
    python app.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any

import gradio as gr

import naver_news

ROOT = Path(__file__).resolve().parents[2]
DATA_PATH = ROOT / "src" / "data" / "anniversaries.json"
CATEGORIES_PATH = ROOT / "src" / "data" / "categories.json"

DATE_TYPES = [
    "annual-fixed",
    "annual-floating",
    "annual-nth-weekday",
    "annual-relative-to-holiday",
    "one-time",
]
# annual-nth-weekday: "MM-N-DOW" (N=1~5 또는 L, DOW=SUN..SAT)
NTH_WEEKDAY_RE = r"\d{2}-(?:[1-5]|L)-(?:SUN|MON|TUE|WED|THU|FRI|SAT)"
# annual-relative-to-holiday: "{anchorId}:{offsetDays}" (offsetDays 는 +/- 정수)
RELATIVE_TO_HOLIDAY_RE = r"[a-zA-Z0-9_\-]+:-?\d+"
COLS = ["날짜", "유형", "이름", "카테고리", "id"]
NEWS_COLS = ["제목", "날짜", "링크"]


# ---------- IO ----------

def load_anniversaries() -> list[dict[str, Any]]:
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


def load_categories() -> list[dict[str, Any]]:
    return json.loads(CATEGORIES_PATH.read_text(encoding="utf-8"))


def save_anniversaries(items: list[dict[str, Any]]) -> None:
    DATA_PATH.write_text(
        json.dumps(items, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


# ---------- 표시용 변환 ----------

def sort_key(a: dict[str, Any]) -> tuple[str, str]:
    d = a.get("date", "") or ""
    if a.get("dateType") == "annual-fixed":
        # MM-DD 를 0000-MM-DD 로 정규화해 YYYY-MM-DD 와 같이 정렬
        return ("0000-" + d, a.get("name", "") or "")
    return (d, a.get("name", "") or "")


def to_rows(items: list[dict[str, Any]]) -> list[list[str]]:
    return [
        [
            a.get("date", "") or "",
            a.get("dateType", "") or "",
            a.get("name", "") or "",
            a.get("category", "") or "",
            a.get("id", "") or "",
        ]
        for a in sorted(items, key=sort_key)
    ]


def filter_rows(items: list[dict[str, Any]], query: str | None) -> list[list[str]]:
    if not query:
        return to_rows(items)
    q = query.lower().strip()

    def hit(a: dict[str, Any]) -> bool:
        if q in (a.get("name", "") or "").lower():
            return True
        if q in (a.get("id", "") or "").lower():
            return True
        if q in (a.get("category", "") or "").lower():
            return True
        if q in (a.get("date", "") or "").lower():
            return True
        for t in a.get("tags") or []:
            if q in (t or "").lower():
                return True
        return False

    return to_rows([a for a in items if hit(a)])


# ---------- 검수 ----------

def validate(items: list[dict[str, Any]], categories: list[dict[str, Any]]) -> dict[str, list[str]]:
    valid_cat_ids = {c["id"] for c in categories}
    valid_anv_ids = {a.get("id") for a in items}

    counts: dict[str, int] = {}
    for a in items:
        aid = a.get("id", "") or ""
        counts[aid] = counts.get(aid, 0) + 1
    duplicate_ids = [f"{i} ({n}회)" for i, n in counts.items() if n > 1]

    unknown_cats: list[str] = []
    missing_fields: list[str] = []
    bad_dates: list[str] = []

    for a in items:
        aid = a.get("id") or "(no-id)"

        cat = a.get("category")
        if cat not in valid_cat_ids:
            unknown_cats.append(f"{aid}: '{cat}'")

        missing: list[str] = []
        for f in ("id", "name", "date", "dateType", "category"):
            if not a.get(f):
                missing.append(f)
        st = a.get("storytelling") or {}
        if not st.get("origin"):
            missing.append("storytelling.origin")
        if not st.get("anecdote"):
            missing.append("storytelling.anecdote")
        if not a.get("tags"):
            missing.append("tags")
        if missing:
            missing_fields.append(f"{aid}: {', '.join(missing)}")

        dt = a.get("dateType")
        d = a.get("date", "") or ""
        if dt == "annual-fixed":
            if not re.fullmatch(r"\d{2}-\d{2}", d):
                bad_dates.append(f"{aid}: '{d}' (annual-fixed → MM-DD)")
        elif dt == "annual-nth-weekday":
            if not re.fullmatch(NTH_WEEKDAY_RE, d):
                bad_dates.append(f"{aid}: '{d}' (annual-nth-weekday → MM-N-DOW)")
        elif dt == "annual-relative-to-holiday":
            if not re.fullmatch(RELATIVE_TO_HOLIDAY_RE, d):
                bad_dates.append(
                    f"{aid}: '{d}' (annual-relative-to-holiday → anchorId:offsetDays)"
                )
            else:
                anchor_id = d.rsplit(":", 1)[0]
                if anchor_id not in valid_anv_ids:
                    bad_dates.append(f"{aid}: anchor id '{anchor_id}' 를 찾을 수 없음")
        elif dt in ("annual-floating", "one-time"):
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", d):
                bad_dates.append(f"{aid}: '{d}' ({dt} → YYYY-MM-DD)")
        elif dt:
            bad_dates.append(f"{aid}: dateType '{dt}' 알 수 없음")

    return {
        "duplicate_ids": duplicate_ids,
        "unknown_categories": unknown_cats,
        "missing_fields": missing_fields,
        "bad_dates": bad_dates,
    }


def format_issues_md(issues: dict[str, list[str]]) -> str:
    labels = [
        ("duplicate_ids", "중복 id"),
        ("unknown_categories", "categories.json 에 없는 카테고리"),
        ("missing_fields", "필수 필드 누락/빈 값"),
        ("bad_dates", "날짜 포맷 오류"),
    ]
    total = sum(len(issues[k]) for k, _ in labels)
    header = "## 검수 결과 " + ("✅ 모두 통과" if total == 0 else f"⚠️ {total}건 발견")
    lines = [header]
    for key, label in labels:
        items = issues[key]
        if not items:
            lines.append(f"- ✅ **{label}**: 0건")
        else:
            lines.append(f"- ⚠️ **{label}** — {len(items)}건")
            for item in items[:25]:
                lines.append(f"    - {item}")
            if len(items) > 25:
                lines.append(f"    - … 외 {len(items) - 25}건")
    return "\n".join(lines)


# ---------- 이벤트 핸들러 ----------

def on_row_select(
    rows: list[list[str]] | Any,
    items: list[dict[str, Any]],
    evt: gr.SelectData,
):
    # rows 가 None 이거나 비어있으면 무시
    if rows is None:
        return (gr.update(),) * 10
    try:
        rows_list = rows.values.tolist() if hasattr(rows, "values") else list(rows)
    except Exception:
        rows_list = []
    if not rows_list:
        return (gr.update(),) * 10

    idx = evt.index[0] if isinstance(evt.index, (list, tuple)) else evt.index
    if idx is None or idx < 0 or idx >= len(rows_list):
        return (gr.update(),) * 10

    target_id = rows_list[idx][4]
    a = next((x for x in items if x.get("id") == target_id), None)
    if a is None:
        return (gr.update(),) * 10

    # memes 는 dict 리스트 그대로 State 에 들어감
    memes_loaded = [
        {
            "type": (m.get("type") or "text"),
            "url": m.get("url"),
            "caption": m.get("caption") or "",
        }
        for m in (a.get("memes") or [])
    ]

    return (
        a.get("id", "") or "",
        a.get("dateType", "annual-fixed") or "annual-fixed",
        a.get("date", "") or "",
        a.get("name", "") or "",
        a.get("category", "") or "",
        ", ".join(a.get("tags", []) or []),
        (a.get("storytelling") or {}).get("origin", "") or "",
        (a.get("storytelling") or {}).get("anecdote", "") or "",
        memes_loaded,
        a.get("sourceUrl", "") or "",
    )


def clear_form():
    return ("", "annual-fixed", "", "", "", "", "", "", [], "")


def _normalize_memes(memes_list: list[dict[str, Any]] | None) -> tuple[list[dict[str, Any]], list[str]]:
    """폼에서 들어온 메메 리스트를 정규화하고 오류 메시지를 함께 반환."""
    errors: list[str] = []
    normalized: list[dict[str, Any]] = []
    for i, m in enumerate(memes_list or []):
        if not isinstance(m, dict):
            errors.append(f"밈 #{i + 1}: 잘못된 항목")
            continue
        mtype = (m.get("type") or "").strip()
        caption = (m.get("caption") or "").strip()
        url = (m.get("url") or "").strip() or None
        if mtype not in ("text", "image"):
            errors.append(f"밈 #{i + 1}: type 은 'text' 또는 'image'")
            continue
        if not caption:
            errors.append(f"밈 #{i + 1}: caption 필수")
            continue
        if mtype == "image" and not url:
            errors.append(f"밈 #{i + 1}: image 타입은 url 필수")
            continue
        if mtype == "text":
            url = None
        normalized.append({"type": mtype, "url": url, "caption": caption})
    return normalized, errors


def save_entry(
    items: list[dict[str, Any]],
    categories: list[dict[str, Any]],
    eid: str,
    date_type: str,
    date: str,
    name: str,
    category: str,
    tags_str: str,
    origin: str,
    anecdote: str,
    memes_list: list[dict[str, Any]],
    source_url: str,
    query: str,
):
    errors: list[str] = []
    eid = (eid or "").strip()
    if not re.fullmatch(r"[a-zA-Z0-9_\-]+", eid):
        errors.append("id 는 영문/숫자/하이픈/언더스코어만 사용 가능합니다.")
    if date_type not in DATE_TYPES:
        errors.append("dateType 이 잘못되었습니다.")
    elif date_type == "annual-fixed":
        if not re.fullmatch(r"\d{2}-\d{2}", date or ""):
            errors.append("annual-fixed 는 MM-DD 형식이어야 합니다.")
    elif date_type == "annual-nth-weekday":
        if not re.fullmatch(NTH_WEEKDAY_RE, date or ""):
            errors.append("annual-nth-weekday 는 MM-N-DOW 형식이어야 합니다 (예: 05-2-SUN, 10-L-TUE).")
    elif date_type == "annual-relative-to-holiday":
        if not re.fullmatch(RELATIVE_TO_HOLIDAY_RE, date or ""):
            errors.append(
                "annual-relative-to-holiday 는 anchorId:offsetDays 형식이어야 합니다 (예: anv-nth-11-4-thu-thanksgiving-day-us:1)."
            )
        else:
            anchor_id = (date or "").rsplit(":", 1)[0]
            if not any(x.get("id") == anchor_id for x in items):
                errors.append(f"anchor id '{anchor_id}' 를 찾을 수 없습니다.")
    else:
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date or ""):
            errors.append(f"{date_type} 는 YYYY-MM-DD 형식이어야 합니다.")
    if not (name or "").strip():
        errors.append("name 은 필수입니다.")
    if not (category or "").strip():
        errors.append("category 는 필수입니다.")

    memes, memes_errs = _normalize_memes(memes_list)
    errors.extend(memes_errs)

    if errors:
        return (
            items,
            filter_rows(items, query),
            "❌ " + " · ".join(errors),
            format_issues_md(validate(items, categories)),
        )

    entry = {
        "id": eid,
        "date": date,
        "dateType": date_type,
        "name": name.strip(),
        "category": category.strip(),
        "tags": [t.strip() for t in (tags_str or "").split(",") if t.strip()],
        "storytelling": {"origin": origin.strip(), "anecdote": anecdote.strip()},
        "memes": memes or [],
        "sourceUrl": (source_url or "").strip() or None,
    }

    idx = next((i for i, x in enumerate(items) if x.get("id") == eid), -1)
    if idx >= 0:
        items[idx] = entry
        msg = f"✅ 수정 저장: `{eid}`"
    else:
        items.append(entry)
        msg = f"✅ 신규 추가: `{eid}`"

    save_anniversaries(items)
    return (
        items,
        filter_rows(items, query),
        msg,
        format_issues_md(validate(items, categories)),
    )


def delete_entry(
    items: list[dict[str, Any]],
    categories: list[dict[str, Any]],
    eid: str,
    query: str,
):
    eid = (eid or "").strip()
    if not eid:
        return (
            items,
            filter_rows(items, query),
            "❌ 삭제할 id 가 비어 있습니다.",
            format_issues_md(validate(items, categories)),
        )
    idx = next((i for i, x in enumerate(items) if x.get("id") == eid), -1)
    if idx < 0:
        return (
            items,
            filter_rows(items, query),
            f"❌ 존재하지 않는 id: `{eid}`",
            format_issues_md(validate(items, categories)),
        )
    del items[idx]
    save_anniversaries(items)
    return (
        items,
        filter_rows(items, query),
        f"🗑️ 삭제 완료: `{eid}`",
        format_issues_md(validate(items, categories)),
    )


def reload_all(query: str):
    items = load_anniversaries()
    cats = load_categories()
    return (
        items,
        cats,
        filter_rows(items, query),
        format_issues_md(validate(items, cats)),
        f"🔄 재로드 완료 — 항목 {len(items)}개 / 카테고리 {len(cats)}개",
    )


# ---------- 네이버 뉴스 ----------

def search_news_handler(query: str, sort: str, name_fallback: str):
    """검색어(없으면 name)로 네이버 뉴스 검색 → State + 표 + 상태."""
    q = (query or "").strip() or (name_fallback or "").strip()
    if not q:
        return [], [], "❌ 검색어가 비어 있습니다 (이름을 입력하거나 좌측 항목 선택)."
    try:
        results = naver_news.search_news_dicts(q, display=10, sort=sort or "sim")
    except naver_news.NaverAuthError as e:
        return [], [], f"🔑 {e}"
    except naver_news.NaverApiError as e:
        return [], [], f"⚠️ {e}"
    if not results:
        return [], [], f"검색 결과 없음: '{q}'"
    rows = [
        [r["title"], r["pub_date"], (r["link"] or r["originallink"])]
        for r in results
    ]
    return results, rows, f"🔎 '{q}' — {len(results)}건"


def on_news_select(news_items: list[dict[str, Any]], evt: gr.SelectData):
    """뉴스 표 행 선택 → 선택 인덱스 + 미리보기."""
    if not news_items:
        return None, ""
    idx = evt.index[0] if isinstance(evt.index, (list, tuple)) else evt.index
    if idx is None or idx < 0 or idx >= len(news_items):
        return None, ""
    n = news_items[idx]
    link = n.get("link") or n.get("originallink") or ""
    preview = f"**{n.get('title', '')}**\n\n{n.get('description', '')}\n\n🔗 {link}"
    return idx, preview


def news_to_source(news_items: list[dict[str, Any]], sel_idx):
    """선택 뉴스 링크 → sourceUrl 필드."""
    if news_items and sel_idx is not None and 0 <= sel_idx < len(news_items):
        n = news_items[sel_idx]
        return n.get("link") or n.get("originallink") or ""
    return gr.update()


def news_to_anecdote(news_items: list[dict[str, Any]], sel_idx, current_anecdote: str):
    """선택 뉴스 요약을 anecdote 끝에 덧붙임."""
    if not (news_items and sel_idx is not None and 0 <= sel_idx < len(news_items)):
        return gr.update()
    n = news_items[sel_idx]
    snippet = n.get("description") or n.get("title") or ""
    base = (current_anecdote or "").strip()
    return (base + ("\n" if base else "") + snippet).strip()


# ---------- UI ----------

def build_ui() -> gr.Blocks:
    initial_items = load_anniversaries()
    initial_cats = load_categories()

    cat_choices = sorted(
        {c["id"] for c in initial_cats}
        | {a.get("category", "") for a in initial_items if a.get("category")}
    )

    with gr.Blocks(title="기념일 데이터 검수기", theme=gr.themes.Soft()) as demo:
        gr.Markdown(
            "# 🗓️ 기념일 데이터 검수기\n"
            f"편집 대상: `{DATA_PATH.relative_to(ROOT)}` "
            f"(총 {len(initial_items)}건)"
        )

        items_state = gr.State(initial_items)
        cats_state = gr.State(initial_cats)

        issues_md = gr.Markdown(format_issues_md(validate(initial_items, initial_cats)))

        with gr.Row():
            # 좌측: 리스트
            with gr.Column(scale=1):
                gr.Markdown("### 목록")
                with gr.Row():
                    search = gr.Textbox(
                        placeholder="이름 / 태그 / id / 카테고리 / 날짜 검색",
                        show_label=False,
                        scale=4,
                    )
                    reload_btn = gr.Button("🔄 재로드", scale=1)
                rows_df = gr.Dataframe(
                    value=to_rows(initial_items),
                    headers=COLS,
                    type="array",
                    interactive=False,
                    wrap=True,
                    row_count=(15, "dynamic"),
                    col_count=(5, "fixed"),
                )

            # 우측: 폼
            with gr.Column(scale=1):
                gr.Markdown("### 편집 / 추가\n좌측 행을 클릭하면 폼에 로드됩니다. id 가 일치하면 수정, 새 id 면 추가.")
                status = gr.Markdown("")

                with gr.Row():
                    f_id = gr.Textbox(label="id", placeholder="anv-fixed-MM-DD-slug")
                    f_dateType = gr.Dropdown(
                        choices=DATE_TYPES, label="dateType", value="annual-fixed"
                    )
                    f_date = gr.Textbox(label="date", placeholder="MM-DD 또는 YYYY-MM-DD")
                f_name = gr.Textbox(label="name")
                with gr.Row():
                    f_category = gr.Dropdown(
                        choices=cat_choices,
                        label="category",
                        allow_custom_value=True,
                    )
                    f_tags = gr.Textbox(label="tags (쉼표 구분)")
                f_origin = gr.Textbox(label="storytelling.origin", lines=3)
                f_anecdote = gr.Textbox(label="storytelling.anecdote", lines=3)

                # --- memes 동적 폼 ---
                f_memes = gr.State([])  # 폼 ↔ 저장 사이의 단일 진실 출처
                with gr.Group():
                    with gr.Row():
                        gr.Markdown("**memes**")
                        add_meme_btn = gr.Button("➕ 밈 추가", size="sm", scale=0)

                    @gr.render(inputs=f_memes)
                    def render_memes(memes: list[dict[str, Any]]):
                        if not memes:
                            gr.Markdown(
                                "_등록된 밈이 없습니다. 위의 **➕ 밈 추가** 버튼으로 추가하세요._"
                            )
                            return
                        for i, m in enumerate(memes):
                            with gr.Group():
                                with gr.Row():
                                    type_dd = gr.Dropdown(
                                        choices=["text", "image"],
                                        value=(m.get("type") or "text"),
                                        label=f"#{i + 1} type",
                                        interactive=True,
                                        scale=1,
                                        min_width=120,
                                    )
                                    url_tb = gr.Textbox(
                                        value=(m.get("url") or ""),
                                        label="url (image 일 때만)",
                                        placeholder="https://...",
                                        interactive=True,
                                        scale=3,
                                    )
                                    del_btn = gr.Button(
                                        "🗑️", size="sm", scale=0, min_width=50
                                    )
                                caption_tb = gr.Textbox(
                                    value=(m.get("caption") or ""),
                                    label="caption",
                                    interactive=True,
                                )

                            def make_field_updater(idx: int, field: str):
                                def fn(value, current):
                                    if not current or idx >= len(current):
                                        return current
                                    new_list = [dict(x) for x in current]
                                    new_list[idx][field] = value
                                    return new_list
                                return fn

                            type_dd.change(
                                make_field_updater(i, "type"),
                                inputs=[type_dd, f_memes],
                                outputs=f_memes,
                            )
                            url_tb.change(
                                make_field_updater(i, "url"),
                                inputs=[url_tb, f_memes],
                                outputs=f_memes,
                            )
                            caption_tb.change(
                                make_field_updater(i, "caption"),
                                inputs=[caption_tb, f_memes],
                                outputs=f_memes,
                            )

                            def make_deleter(idx: int):
                                def fn(current):
                                    return [x for j, x in enumerate(current) if j != idx]
                                return fn

                            del_btn.click(
                                make_deleter(i),
                                inputs=f_memes,
                                outputs=f_memes,
                            )

                    def add_meme(current: list[dict[str, Any]]):
                        return list(current or []) + [
                            {"type": "text", "url": None, "caption": ""}
                        ]

                    add_meme_btn.click(add_meme, inputs=f_memes, outputs=f_memes)

                f_source = gr.Textbox(label="sourceUrl", placeholder="https://...")

                # --- 네이버 뉴스 검색 (storytelling / sourceUrl 수집 보조) ---
                with gr.Accordion("📰 네이버 뉴스 검색", open=False):
                    news_state = gr.State([])
                    news_sel = gr.State(None)
                    with gr.Row():
                        f_news_query = gr.Textbox(
                            placeholder="검색어 (비우면 위 name 사용)",
                            show_label=False, scale=3,
                        )
                        f_news_sort = gr.Dropdown(
                            choices=["sim", "date"], value="sim",
                            label="정렬", scale=1, min_width=110,
                        )
                        news_search_btn = gr.Button("🔎 검색", scale=0, min_width=80)
                    news_status = gr.Markdown("")
                    news_df = gr.Dataframe(
                        headers=NEWS_COLS, type="array", interactive=False,
                        wrap=True, row_count=(5, "dynamic"), col_count=(3, "fixed"),
                    )
                    news_preview = gr.Markdown("")
                    with gr.Row():
                        news_to_source_btn = gr.Button("→ sourceUrl 채우기", size="sm")
                        news_to_anecdote_btn = gr.Button("→ anecdote 에 추가", size="sm")

                with gr.Row():
                    save_btn = gr.Button("💾 저장 (추가/수정)", variant="primary")
                    delete_btn = gr.Button("🗑️ 이 id 삭제", variant="stop")
                    new_btn = gr.Button("➕ 새로 작성")

        # --- wiring ---
        search.change(
            fn=lambda q, items: filter_rows(items, q),
            inputs=[search, items_state],
            outputs=rows_df,
        )
        rows_df.select(
            fn=on_row_select,
            inputs=[rows_df, items_state],
            outputs=[
                f_id, f_dateType, f_date, f_name, f_category,
                f_tags, f_origin, f_anecdote, f_memes, f_source,
            ],
        )
        save_btn.click(
            fn=save_entry,
            inputs=[
                items_state, cats_state,
                f_id, f_dateType, f_date, f_name, f_category,
                f_tags, f_origin, f_anecdote, f_memes, f_source,
                search,
            ],
            outputs=[items_state, rows_df, status, issues_md],
        )
        delete_btn.click(
            fn=delete_entry,
            inputs=[items_state, cats_state, f_id, search],
            outputs=[items_state, rows_df, status, issues_md],
        )
        new_btn.click(
            fn=clear_form,
            inputs=[],
            outputs=[
                f_id, f_dateType, f_date, f_name, f_category,
                f_tags, f_origin, f_anecdote, f_memes, f_source,
            ],
        )
        reload_btn.click(
            fn=reload_all,
            inputs=[search],
            outputs=[items_state, cats_state, rows_df, issues_md, status],
        )

        # --- 뉴스 검색 wiring ---
        news_search_btn.click(
            fn=search_news_handler,
            inputs=[f_news_query, f_news_sort, f_name],
            outputs=[news_state, news_df, news_status],
        )
        news_df.select(
            fn=on_news_select,
            inputs=[news_state],
            outputs=[news_sel, news_preview],
        )
        news_to_source_btn.click(
            fn=news_to_source,
            inputs=[news_state, news_sel],
            outputs=f_source,
        )
        news_to_anecdote_btn.click(
            fn=news_to_anecdote,
            inputs=[news_state, news_sel, f_anecdote],
            outputs=f_anecdote,
        )

    return demo


if __name__ == "__main__":
    build_ui().launch()
