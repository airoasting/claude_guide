#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
데일리 투자 브리핑 → 신문형 PDF 생성기.

사용법:
    from generate_pdf import build_pdf
    build_pdf(briefing_dict, "/path/to/output.pdf")

`briefing_dict` 구조는 파일 하단 SAMPLE 참고. Claude는 매 브리핑마다
검증된 데이터로 이 dict를 채운 뒤 build_pdf를 호출하면 된다.

의존성:
    pip install weasyprint matplotlib --break-system-packages
한글 폰트:
    시스템에 Noto Sans CJK(또는 NanumGothic)가 있으면 자동 사용한다.
    matplotlib는 .ttc에서 'Noto Sans CJK JP' 패밀리명으로 잡히지만
    이 폰트는 한글 글리프를 포함하므로 한국어가 정상 렌더링된다.
"""
import base64
import io
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib import font_manager as fm

RED, BLUE = "#D24B4A", "#378ADD"  # 상승 빨강 / 하락 파랑 (한국 관례)


def _register_korean_font():
    """가용한 한글 폰트를 matplotlib에 등록하고 패밀리명을 반환."""
    candidates = [
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
    ]
    for path in candidates:
        try:
            fm.fontManager.addfont(path)
            name = fm.FontProperties(fname=path).get_name()
            plt.rcParams["font.family"] = name
            plt.rcParams["axes.unicode_minus"] = False
            return name
        except Exception:
            continue
    # 폰트를 못 찾으면 한글이 깨질 수 있음 — 호출부에서 폰트 설치 권장.
    plt.rcParams["axes.unicode_minus"] = False
    return None


def _make_chart_b64(chart):
    """가로 막대 차트 PNG를 base64로 반환. chart = {labels, changes, notes, title}."""
    labels = chart["labels"]
    changes = chart["changes"]
    notes = chart.get("notes", [""] * len(labels))
    colors = [RED if c >= 0 else BLUE for c in changes]
    y = list(range(len(labels)))[::-1]

    lo, hi = min(changes), max(changes)
    pad = max(0.4, (hi - lo) * 0.18)
    fig, ax = plt.subplots(figsize=(7.4, 0.5 * len(labels) + 1.0))
    ax.barh(y, changes, color=colors, height=0.62)
    ax.axvline(0, color="#888", linewidth=0.8)
    ax.set_yticks(y)
    ax.set_yticklabels(labels, fontsize=11)
    ax.set_xlim(lo - pad * 1.6, hi + pad * 1.6)
    ax.set_xlabel("등락률 (%)", fontsize=9)
    ax.tick_params(axis="x", labelsize=8)
    for spine in ["top", "right", "left"]:
        ax.spines[spine].set_visible(False)
    for yi, c, n in zip(y, changes, notes):
        off = pad * 0.12 if c >= 0 else -pad * 0.12
        ha = "left" if c >= 0 else "right"
        ax.text(c + off, yi, f"{c:+.2f}%{n}", va="center", ha=ha,
                fontsize=9.5, color="#222")
    ax.set_title(chart.get("title", ""), fontsize=10, loc="left", pad=8)
    fig.tight_layout()
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=170, bbox_inches="tight")
    plt.close(fig)
    return base64.b64encode(buf.getvalue()).decode()


def _news_html(items):
    out = []
    for it in items:
        var = f" <span class='var'>{it['var']}</span>" if it.get("var") else ""
        imp_label = it.get("imp_label", "💡 시사점")
        out.append(
            f"<div class='news'><span class='h'>{it['h']}</span> — {it['body']}"
            f"<span class='imp'><b>{imp_label}</b> — {it['imp']}{var}</span></div>"
        )
    return "\n".join(out)


def build_pdf(b, out_path):
    """briefing dict `b`로 신문형 PDF를 생성한다."""
    _register_korean_font()
    chart_b64 = _make_chart_b64(b["chart"])
    checkpoints = "\n".join(f"<li>{c}</li>" for c in b["checkpoints"])

    html = f"""
<html><head><meta charset='utf-8'><style>
@page {{ size: A4; margin: 16mm 15mm; }}
* {{ box-sizing: border-box; }}
body {{ font-family: 'Noto Sans CJK KR','Noto Sans CJK JP','NanumGothic',sans-serif;
        color:#16160f; line-height:1.62; font-size:10.5px; margin:0; }}
.masthead {{ border-top:3px solid #16160f; border-bottom:1px solid #16160f;
            padding:8px 0 6px; margin-bottom:10px; display:flex;
            justify-content:space-between; align-items:flex-end; }}
.title {{ font-family:'Noto Serif CJK KR','Noto Serif CJK JP',serif; font-size:26px;
          font-weight:700; letter-spacing:-0.5px; }}
.dateline {{ font-size:10px; color:#555; text-align:right; }}
.headline {{ font-family:'Noto Serif CJK KR','Noto Serif CJK JP',serif; font-size:15.5px;
             font-weight:700; line-height:1.45; border-left:4px solid #16160f;
             padding:6px 0 6px 10px; margin:4px 0 12px; }}
h2 {{ font-family:'Noto Serif CJK KR','Noto Serif CJK JP',serif; font-size:12.5px;
      font-weight:700; border-bottom:1.5px solid #16160f; padding-bottom:3px;
      margin:14px 0 7px; break-after:avoid; }}
.chartwrap {{ text-align:center; margin:4px 0 6px; }}
.chartwrap img {{ width:96%; }}
.cap {{ font-size:9px; color:#555; margin:2px 0 0; }}
.cols {{ column-count:2; column-gap:16px; }}
.news {{ break-inside:avoid; margin-bottom:9px; }}
.news .h {{ font-weight:700; }}
.imp {{ display:block; background:#f4f2ec; border-left:3px solid #b8860b;
        padding:5px 7px; margin-top:3px; font-size:10px; }}
.imp b {{ color:#8a6400; }}
.var {{ color:#8a6400; }}
ul {{ margin:4px 0 0; padding-left:16px; }} li {{ margin-bottom:4px; }}
.src {{ font-size:8.5px; color:#777; border-top:0.5px solid #ccc;
        margin-top:12px; padding-top:5px; }}
.disclaimer {{ font-size:9px; color:#777; border-top:1px solid #16160f;
               margin-top:8px; padding-top:6px; }}
</style></head><body>
<div class='masthead'>
  <div class='title'>데일리 투자 브리핑</div>
  <div class='dateline'>{b['date_label']}</div>
</div>
<div class='headline'>{b['headline']}</div>

<h2>시장 한눈에 보기</h2>
<div class='chartwrap'>
  <img src='data:image/png;base64,{chart_b64}'/>
  <p class='cap'>{b['chart'].get('caption','')}</p>
</div>
<p>{b['snapshot_note']}</p>

<h2>주요 뉴스 &amp; 시사점</h2>
<div class='cols'>{_news_html(b['news'])}</div>

<h2>관심 종목 &amp; 테마 체크</h2>
<div class='cols'>{_news_html(b['watchlist'])}</div>

<h2>오늘/내일 체크포인트</h2>
<ul>{checkpoints}</ul>

<p class='src'>{b.get('sources','')}</p>
<p class='disclaimer'>※ 본 브리핑은 정보 제공 목적이며 투자 자문이 아닙니다.
특정 종목의 매수·매도를 권유하지 않으며, 투자 판단과 책임은 본인에게 있습니다.</p>
</body></html>"""

    from weasyprint import HTML
    HTML(string=html).write_pdf(out_path)
    return out_path


# --------------------------------------------------------------------------
# SAMPLE: dict 구조 예시 (실행 시 sample.pdf 생성)
# --------------------------------------------------------------------------
SAMPLE = {
    "date_label": "2026년 6월 18일 (목)<br>오전 발행 · 한국+미국 시장",
    "headline": "워시 체제 첫 FOMC '매파적 동결'에 간밤 뉴욕증시 1%대 하락 — "
                "그러나 한국은 반도체 강세로 코스피 9,000선 노크",
    "chart": {
        "labels": ["코스피", "다우", "S&P 500", "나스닥", "원/달러", "금"],
        "changes": [0.93, -0.98, -1.21, -1.34, 0.37, -1.79],
        "notes": [" (장중)", "", "", "", "", ""],
        "title": "간밤 미 증시 마감(6/17) · 한국 18일 오전 장중",
        "caption": "상승=빨강, 하락=파랑. 한국 수치는 6/18 오전 장중. 출처: Yahoo Finance, 헤럴드경제",
    },
    "snapshot_note": "코스피는 18일 오전 0.93% 올라 8,946선에서 거래되며 9,000선에 근접. "
                     "원/달러는 1,510원 안팎. (출처: 헤럴드경제, Trading Economics)",
    "news": [
        {"h": "① 워시 의장 첫 FOMC, '매파적 동결'",
         "body": "점도표상 2026년 말 금리 중간값이 3.4%→3.8%로 올라 연내 1회 인상 가능성 반영. (출처: TheStreet, CNBC)",
         "imp": "강세는 '선반영·유가하락 완충', 약세는 '인상 재부상·원화약세'.",
         "var": "갈리는 변수: 9월 실제 인상 여부."},
        {"h": "② 한국 증시, 매파 FOMC에도 견조",
         "body": "키움증권은 하락 출발하나 반도체 주도주가 하방을 지지할 것으로 전망. (출처: 헤럴드경제)",
         "imp": "반도체 쏠림이 곧 지수 변동성. 외국인 순매수 전환이 9,000선 안착 관건."},
    ],
    "watchlist": [
        {"h": "SK하이닉스",
         "body": "18일 장중 약 268만원으로 사상 최고가. (출처: Investing.com)",
         "imp_label": "🎯 타이밍 관점",
         "imp": "UBS, HBM4 루빈 점유율 약 70% 추산. 촉매는 7/29 실적."},
    ],
    "checkpoints": [
        "<b>오늘 밤(미 6/18)</b> — FOMC 후속·국채금리.",
        "<b>6/19(금) 미국 휴장</b> — 준틴스.",
        "<b>다음 주 수요일 마이크론 실적</b> — 메모리 업황 가늠자.",
    ],
    "sources": "종합 출처: Yahoo Finance, CNBC, TheStreet, 헤럴드경제, Trading Economics, Investing.com.",
}

if __name__ == "__main__":
    import os
    out = os.path.join(os.path.dirname(__file__), "sample.pdf")
    build_pdf(SAMPLE, out)
    print("Wrote", out)
