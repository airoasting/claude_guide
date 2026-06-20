#!/usr/bin/env python3
"""
분당구 아파트 매매 요약보고서 PDF 생성기

Usage:
    python scripts/pdf_report.py
    python scripts/pdf_report.py --data data/ --output output/ --top-n 5

한글 폰트: OS 자동 탐지 (macOS: AppleGothic / Windows: 맑은 고딕 / Linux: Nanum·Noto)
          상단 FONT_REG·FONT_BOLD에 .ttf 절대경로를 직접 넣으면 수동 지정도 가능.
"""

from __future__ import annotations

import io
import os
import sys
import glob
import platform
import argparse
import subprocess
from datetime import datetime

if hasattr(sys.stdout, "buffer") and getattr(sys.stdout, "encoding", "").lower() not in ("utf-8", "utf8"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "buffer") and getattr(sys.stderr, "encoding", "").lower() not in ("utf-8", "utf8"):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

sys.path.insert(0, os.path.dirname(__file__))
from analyze import run as run_analysis

BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

# ── 한글 폰트 경로 ───────────────────────────────────────────────────
# 수동 지정(override): 아래 두 값을 직접 한글 .ttf 절대경로로 채우면
# OS 자동 탐지를 건너뛰고 그 폰트를 그대로 쓴다. 비워 두면(None) OS별로
# 적절한 기본 폰트를 자동으로 찾는다(_resolve_fonts 참고).
#   예) FONT_REG = "/Users/me/Library/Fonts/NanumGothic.ttf"
FONT_REG  = None
FONT_BOLD = None

# ── 색상 팔레트 (트렌디 2025) ─────────────────────────────────────────
C_DARKEST = (0.047, 0.075, 0.141)   # #0c1324
C_DARK    = (0.082, 0.122, 0.220)   # #151f38
C_NAVY    = (0.118, 0.227, 0.373)   # #1e3a5f
C_BLUE    = (0.145, 0.388, 0.922)   # #2563eb
C_BLUE_LT = (0.608, 0.776, 0.988)   # #9bc6fc
C_INDIGO  = (0.376, 0.310, 0.957)   # #604ff4
C_GREEN   = (0.047, 0.671, 0.353)   # #0cab5a
C_RED     = (0.918, 0.220, 0.220)   # #eb3838
C_PURPLE  = (0.506, 0.247, 0.957)   # #813ff4
C_AMBER   = (0.949, 0.682, 0.118)   # #f2ae1e
C_SLATE   = (0.200, 0.318, 0.427)   # #334155
C_MUTED   = (0.420, 0.502, 0.588)   # #6b8096
C_GRAY    = (0.565, 0.627, 0.706)   # #90a0b4
C_LGRAY   = (0.882, 0.910, 0.941)   # #e2e8f0
C_XLGRAY  = (0.957, 0.969, 0.984)   # #f4f7fb
C_WHITE   = (1.0, 1.0, 1.0)
C_BG      = (0.969, 0.980, 0.996)   # #f7fafe
C_UP_BG   = (0.882, 0.988, 0.933)   # #e1fcee
C_DN_BG   = (0.996, 0.902, 0.902)   # #ffe6e6


# OS별 한글 폰트 후보. (regular_경로, bold_경로) 튜플 목록을 위에서부터 시도한다.
# bold가 따로 없으면 regular와 같은 경로를 넣어 굵은 글씨도 같은 폰트로 렌더한다.
_FONT_CANDIDATES = {
    "Darwin": [   # macOS
        ("/System/Library/Fonts/Supplemental/AppleGothic.ttf",
         "/System/Library/Fonts/Supplemental/AppleGothic.ttf"),
        ("/Library/Fonts/NanumGothic.ttf", "/Library/Fonts/NanumGothicBold.ttf"),
        (os.path.expanduser("~/Library/Fonts/NanumGothic.ttf"),
         os.path.expanduser("~/Library/Fonts/NanumGothicBold.ttf")),
    ],
    "Windows": [
        (r"C:\Windows\Fonts\malgun.ttf", r"C:\Windows\Fonts\malgunbd.ttf"),
        (r"C:\Windows\Fonts\NanumGothic.ttf", r"C:\Windows\Fonts\NanumGothicBold.ttf"),
    ],
    "Linux": [
        ("/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
         "/usr/share/fonts/truetype/nanum/NanumGothicBold.ttf"),
        ("/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
         "/usr/share/fonts/truetype/nanum/NanumGothic.ttf"),
        ("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
         "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc"),
    ],
}


def _fc_list_korean() -> str | None:
    """Linux 등에서 fc-list로 설치된 한글 .ttf 경로를 한 개 찾아 반환."""
    try:
        out = subprocess.run(
            ["fc-list", ":lang=ko", "file"],
            capture_output=True, text=True, timeout=5,
        ).stdout
    except (FileNotFoundError, subprocess.SubprocessError):
        return None
    for line in out.splitlines():
        path = line.split(":")[0].strip()
        if path.lower().endswith(".ttf") and os.path.exists(path):
            return path
    # .ttf가 없으면 .ttc라도 (subfontIndex로 처리 가능)
    for line in out.splitlines():
        path = line.split(":")[0].strip()
        if path.lower().endswith(".ttc") and os.path.exists(path):
            return path
    return None


def _resolve_fonts() -> tuple[str, str]:
    """
    OS별로 사용할 (regular, bold) 한글 폰트 경로를 결정한다.
    1) 모듈 상단 FONT_REG/FONT_BOLD 수동 지정값이 있으면 그것을 최우선.
    2) 없으면 현재 OS 후보 목록에서 실제 존재하는 첫 경로.
    3) 그래도 없으면 fc-list(주로 Linux)로 탐색.
    하나도 못 찾으면 설치 안내와 함께 중단.
    """
    if FONT_REG and FONT_BOLD:
        for p in (FONT_REG, FONT_BOLD):
            if not os.path.exists(p):
                sys.exit(f"[오류] 수동 지정 한글 폰트 없음: {p}\n  → FONT_REG/FONT_BOLD 경로를 확인하세요.")
        return FONT_REG, FONT_BOLD

    system = platform.system()
    for reg, bold in _FONT_CANDIDATES.get(system, []):
        if os.path.exists(reg):
            bold = bold if os.path.exists(bold) else reg
            return reg, bold

    found = _fc_list_korean()
    if found:
        return found, found

    hint = {
        "Darwin":  "macOS 기본 폰트(AppleGothic)를 찾지 못했습니다. NanumGothic.ttf를 설치하거나 FONT_REG/FONT_BOLD를 직접 지정하세요.",
        "Linux":   "한글 폰트가 없습니다. 'sudo apt install fonts-nanum' 후 재시도하거나 FONT_REG/FONT_BOLD를 직접 지정하세요.",
        "Windows": "맑은 고딕(malgun.ttf)을 찾지 못했습니다. FONT_REG/FONT_BOLD를 한글 .ttf 경로로 직접 지정하세요.",
    }.get(system, "한글 폰트를 찾지 못했습니다. FONT_REG/FONT_BOLD를 한글 .ttf 경로로 직접 지정하세요.")
    sys.exit(f"[오류] 한글 폰트를 찾을 수 없습니다 (OS: {system}).\n  → {hint}")


def _make_ttfont(name: str, path: str):
    """
    TTFont 생성. .ttc(폰트 컬렉션)는 subfontIndex 없이 못 읽으므로
    subfontIndex=0으로 첫 폰트를 쓰고, 실패하면 명확한 오류로 중단한다.
    """
    from reportlab.pdfbase.ttfonts import TTFont, TTFError
    is_ttc = path.lower().endswith(".ttc")
    try:
        if is_ttc:
            return TTFont(name, path, subfontIndex=0)
        return TTFont(name, path)
    except TTFError as e:
        if is_ttc:
            sys.exit(
                f"[오류] 폰트 컬렉션(.ttc) '{path}' 로드 실패: {e}\n"
                "  → .ttc는 subfontIndex가 필요합니다. 단일 .ttf 폰트 경로를 "
                "FONT_REG/FONT_BOLD에 직접 지정하는 것을 권장합니다."
            )
        sys.exit(f"[오류] 폰트 '{path}' 로드 실패: {e}")


def _register_fonts():
    from reportlab.pdfbase import pdfmetrics
    reg, bold = _resolve_fonts()
    pdfmetrics.registerFont(_make_ttfont("Malgun", reg))
    pdfmetrics.registerFont(_make_ttfont("MalgunBd", bold))
    print(f"  ✓ 한글 폰트: {os.path.basename(reg)} / {os.path.basename(bold)}")


def _pct(v: float) -> str:
    return f"+{v:.1f}%" if v >= 0 else f"{v:.1f}%"


def _rate_colors(rate: float):
    return (C_GREEN, C_UP_BG) if rate >= 0 else (C_RED, C_DN_BG)


def _dong_rate_prose(dong_rate) -> list[str]:
    """동별 변동률을 줄글 문장으로 반환."""
    sdf  = dong_rate.sort_values("변동률_%", ascending=False)
    avg  = dong_rate["변동률_%"].mean()
    all_pos = dong_rate["변동률_%"].min() >= 0

    high = sdf[sdf["변동률_%"] >= 20]
    mid  = sdf[(sdf["변동률_%"] >= 10) & (sdf["변동률_%"] < 20)]
    low  = sdf[(sdf["변동률_%"] >= 0)  & (sdf["변동률_%"] < 10)]
    neg  = sdf[sdf["변동률_%"] < 0]

    def fmt(sub, n=None):
        rows = list(sub.iterrows())
        if n:
            rows = rows[:n]
        return "·".join(f"{r['행정동']}({_pct(r['변동률_%'])})" for _, r in rows)

    lines = []
    suffix = " 13개 동 모두 상승했다." if all_pos else ""
    lines.append(
        f"분석 기간(2025 하반기 → 2026 상반기) 분당구 평균 변동률은 {_pct(avg)}였다.{suffix}"
    )
    if not high.empty:
        lines.append(f"20% 이상 급등: {fmt(high)} — 재건축 기대와 학군 수요가 상승을 견인했다.")
    if not mid.empty:
        lines.append(f"10~20% 상승: {fmt(mid)}.")
    if not low.empty:
        lines.append(f"한 자릿수 상승: {fmt(low)} — 상대적 저평가 구간 진입 여부 점검이 필요하다.")
    if not neg.empty:
        lines.append(f"하락 기록: {fmt(neg)} — 단지별 편차가 크므로 개별 확인 권장.")
    return lines


def _insight_paragraphs(dong_rate, top_notable) -> list[str]:
    rising  = dong_rate[dong_rate["변동률_%"] >= 10].sort_values("변동률_%", ascending=False)
    falling = dong_rate[dong_rate["변동률_%"] < 0]
    paras = []
    if not rising.empty:
        names = "·".join(rising["행정동"].tolist()[:4])
        paras.append(
            f"강세 권역 — {names} 등 {len(rising)}개 동이 후반기 평당가 +10% 이상 상승했다. "
            "판교권 IT 수요 집중과 구분당 1기 신도시 재건축 기대감이 주요 배경으로 읽힌다."
        )
    if not falling.empty:
        names = "·".join(falling["행정동"].tolist())
        paras.append(
            f"조정 동향 — {names}은 후반기 평당가가 소폭 하락했다. "
            "동 내 단지별 편차가 크므로 개별 단지 거래 데이터 확인이 필요하다."
        )
    if not top_notable.empty:
        t = top_notable.iloc[0]
        paras.append(
            f"저평가 포인트 — {t['행정동']} {t['단지명']}(종합 {int(t['종합점수'])}점, "
            f"평당 {int(t['평당가_전체평균']):,}만원)이 점수당가격 {t['점수당가격']:.1f}으로 "
            "같은 점수대 대비 가격 우위를 보인다."
        )
    paras.append(
        "대출 기준 (투기과열지구·토지거래허가구역, 2025.10.16~) — "
        "매매가 15억 이하 최대 6억 / 15~25억 4억 / 25억 초과 2억. "
        "최소 자기자본 = 매매가 − 대출한도 + 부대비용(약 1.5%)."
    )
    return paras


# ── PDF 빌더 ────────────────────────────────────────────────────────

def build_pdf(results: dict, out_path: str, report_date: str):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.pdfgen import canvas

    _register_fonts()

    dong_rate   = results["dong_rate"]
    highlight   = results["highlight"]
    top_notable = results["top_notable"]
    df          = results["df"]

    W, H = A4
    M    = 18 * mm
    CW   = W - 2 * M

    cv = canvas.Canvas(out_path, pagesize=A4)
    cv.setTitle(f"분당 아파트 매매 요약보고서 {report_date}")
    cv.setAuthor("분당구 아파트 대시보드 자동 분석")

    y = H

    # ── 공통 헬퍼 ──────────────────────────────────────────────────

    def need_page(pt: float):
        nonlocal y
        if y - pt < 16 * mm:
            cv.showPage()
            _page_footer()
            y = H - 12 * mm

    def fr(*rgb):
        cv.setFillColorRGB(*rgb)

    def sr(*rgb):
        cv.setStrokeColorRGB(*rgb)

    def rect(x, ty, w, h, fill, stroke=None, r=2, lw=0.4):
        cv.saveState()
        cv.setFillColorRGB(*fill)
        if stroke:
            cv.setStrokeColorRGB(*stroke)
            cv.setLineWidth(lw)
        else:
            cv.setStrokeColorRGB(*fill)
        cv.roundRect(x, ty - h, w, h, r, fill=1, stroke=1 if stroke else 0)
        cv.restoreState()

    def txt(x, ty, s, font="Malgun", sz=10, col=C_SLATE):
        cv.saveState()
        cv.setFont(font, sz)
        cv.setFillColorRGB(*col)
        cv.drawString(x, ty, s)
        cv.restoreState()

    def txt_r(x, ty, s, font="Malgun", sz=10, col=C_SLATE):
        cv.saveState()
        cv.setFont(font, sz)
        cv.setFillColorRGB(*col)
        cv.drawRightString(x, ty, s)
        cv.restoreState()

    def txt_c(x, ty, s, font="Malgun", sz=10, col=C_SLATE):
        cv.saveState()
        cv.setFont(font, sz)
        cv.setFillColorRGB(*col)
        cv.drawCentredString(x, ty, s)
        cv.restoreState()

    def sw(s, font="Malgun", sz=10) -> float:
        return cv.stringWidth(s, font, sz)

    def wrap_lines(s: str, font: str, sz: float, max_w: float) -> list[str]:
        """한글 포함 텍스트를 max_w 이하로 자른 줄 목록 반환."""
        lines = []
        while s:
            i = 1
            while i <= len(s) and cv.stringWidth(s[:i], font, sz) <= max_w:
                i += 1
            i -= 1
            if i == 0:
                i = 1
            lines.append(s[:i])
            s = s[i:]
        return lines

    def draw_wrapped(x, ty, s, font, sz, col, max_w, leading=14) -> float:
        """줄바꿈 텍스트 렌더 후 최종 y 반환. 줄마다 페이지 경계 체크."""
        nonlocal y
        for ln in wrap_lines(s, font, sz, max_w):
            need_page(leading + 4)
            ty = y
            txt(x, ty, ln, font, sz, col)
            ty -= leading
            y = ty
        return ty

    def hline(ty, col=C_LGRAY, lw=0.5):
        cv.saveState()
        cv.setStrokeColorRGB(*col)
        cv.setLineWidth(lw)
        cv.line(M, ty, M + CW, ty)
        cv.restoreState()

    def badge(cx, ty, label, fg, bg, w=52, h=14, r=7):
        rect(cx, ty, w, h, bg, r=r)
        txt_c(cx + w / 2, ty - h + 3.5, label, "MalgunBd", 8.5, fg)

    def section_head(ty, label_en, label_ko, col=C_BLUE):
        # 영문 소제목 + 가로선
        txt(M, ty, label_en, "Malgun", 7.5, C_GRAY)
        lx = M + sw(label_en, "Malgun", 7.5) + 6
        cv.saveState()
        cv.setStrokeColorRGB(*C_LGRAY)
        cv.setLineWidth(0.5)
        cv.line(lx, ty + 2.5, M + CW, ty + 2.5)
        cv.restoreState()
        ty -= 13
        # 한글 섹션 제목
        rect(M, ty, 3, 13, col, r=1)
        txt(M + 7, ty - 9.5, label_ko, "MalgunBd", 11, C_DARK)
        return ty - 18

    def _page_footer():
        cv.saveState()
        cv.setFont("Malgun", 7.5)
        cv.setFillColorRGB(*C_GRAY)
        cv.drawString(M, 9, "분당구 아파트 대시보드 — 자동 생성 보고서")
        cv.drawRightString(W - M, 9, f"발행일: {report_date}")
        cv.restoreState()

    # ── 1. 다크 헤더 배너 ─────────────────────────────────────────
    BANNER_H = 64 * mm

    # 배경
    rect(0, H, W, BANNER_H, C_DARKEST, r=0)

    # 오른쪽 장식 원
    cv.saveState()
    cv.setFillColorRGB(0.145, 0.388, 0.922, )
    cv.setFillAlpha(0.10)
    cv.circle(W - 18 * mm, H - 18 * mm, 56, fill=1, stroke=0)
    cv.setFillAlpha(0.06)
    cv.circle(W - 8 * mm, H - 40 * mm, 80, fill=1, stroke=0)
    cv.restoreState()

    # 파란 액센트 수직선
    rect(M, H - 10 * mm, 3, 40, C_BLUE, r=1)

    # 상단 서브레이블
    txt(M + 10, H - 12 * mm, "BUNDANG-GU  REAL ESTATE REPORT", "Malgun", 7.5, C_BLUE_LT)

    # 메인 타이틀
    txt(M + 10, H - 22 * mm, "분당구 아파트 매매 요약보고서", "MalgunBd", 19, C_WHITE)

    # 날짜 서브
    period_str = f"2025.6.15 ~ 2026.6.14 기준  ·  발행일 {report_date}"
    txt(M + 10, H - 31 * mm, period_str, "Malgun", 8.5, C_GRAY)

    # 얇은 구분선
    cv.saveState()
    cv.setStrokeColorRGB(*C_BLUE)
    cv.setLineWidth(0.7)
    cv.line(M + 10, H - 35 * mm, M + CW - 10, H - 35 * mm)
    cv.restoreState()

    # 헤드라인 (2줄로 분리)
    avg_rate = dong_rate["변동률_%"].mean()
    best_row = dong_rate.loc[dong_rate["변동률_%"].idxmax()]
    worst_row= dong_rate.loc[dong_rate["변동률_%"].idxmin()]
    direction = "상승" if avg_rate >= 0 else "하락"

    hl1 = f"분당구 전체 평균  {_pct(avg_rate)}  {direction}"
    hl2 = f"{best_row['행정동']} {_pct(best_row['변동률_%'])} 최고  ·  {worst_row['행정동']} {_pct(worst_row['변동률_%'])} 최저"

    txt(M + 10, H - 43 * mm, hl1, "MalgunBd", 12.5, C_WHITE)
    txt(M + 10, H - 52 * mm, hl2, "Malgun", 9, C_BLUE_LT)

    y = H - BANNER_H - 6 * mm

    # ── 2. KPI 요약 카드 (3칸) ───────────────────────────────────
    total_deals = len(df)
    avg_price   = int(df["평당가"].mean())

    card_gap = 5
    card_w   = (CW - card_gap * 2) / 3
    kpis = [
        ("총 거래건수",   f"{total_deals:,}건",                        C_BLUE,   C_XLGRAY),
        ("평균 1평당가",  f"{avg_price:,}만원",                         C_SLATE,  C_XLGRAY),
        ("최고 상승 동",  f"{best_row['행정동']} {_pct(best_row['변동률_%'])}", C_GREEN, C_UP_BG),
    ]
    KPI_H = 34
    for i, (lbl, val, vcol, bg) in enumerate(kpis):
        cx = M + i * (card_w + card_gap)
        rect(cx, y, card_w, KPI_H, bg, stroke=C_LGRAY, r=4, lw=0.4)
        # 상단 컬러 바
        rect(cx, y, card_w, 3, vcol, r=2)
        txt(cx + 7, y - 11, lbl, "Malgun", 7.5, C_MUTED)
        txt(cx + 7, y - 26, val, "MalgunBd", 12, vcol)
    y -= KPI_H + 12

    # ── 3. 동별 거래 동향 — 줄글 + 수평 바차트 ───────────────────
    need_page(220)
    y = section_head(y, "DONG RATE OVERVIEW", "동별 거래 동향  —  전반기 → 후반기 평당가 변동률", C_BLUE)

    # 줄글 prose
    prose_lines = _dong_rate_prose(dong_rate)
    for sent in prose_lines:
        need_page(30)
        new_y = draw_wrapped(M, y, sent, "Malgun", 9, C_SLATE, CW, leading=13)
        y = new_y - 3

    y -= 8

    # 수평 바차트
    sdf  = dong_rate.sort_values("변동률_%", ascending=False)
    max_abs = max(abs(sdf["변동률_%"].max()), abs(sdf["변동률_%"].min()), 1)

    NAME_W  = 52
    BAR_MAX = CW - NAME_W - 96   # badge(52) + gap(8) + price(36) = 96
    ROW_H   = 19

    for _, r in sdf.iterrows():
        need_page(ROW_H + 2)
        rate  = float(r["변동률_%"])
        rc, bg = _rate_colors(rate)
        bar_w = max(2, abs(rate) / max_abs * BAR_MAX)
        price_str = f"{int(r['평당가_전체평균']):,}만원"

        # 동 이름
        txt(M, y - 13, r["행정동"], "MalgunBd", 9, C_SLATE)

        # 배경 트랙
        rect(M + NAME_W, y - 5, BAR_MAX, ROW_H - 10, C_XLGRAY, r=2)
        # 컬러 바
        rect(M + NAME_W, y - 5, bar_w, ROW_H - 10, rc, r=2)

        # 변동률 배지
        bx = M + NAME_W + BAR_MAX + 4
        badge(bx, y - 2, _pct(rate), rc, bg, w=52, h=15, r=7)

        # 평당가 (오른쪽 끝)
        txt_r(M + CW, y - 8, price_str, "Malgun", 8, C_MUTED)

        y -= ROW_H

    y -= 8

    # ── 4. 이 달의 주목 거래 ──────────────────────────────────────
    need_page(110)
    y = section_head(y, "HIGHLIGHT TRADES", "이 달의 주목 거래  TOP 5  —  동 평균 대비 최대 편차", C_PURPLE)

    for _, r in highlight.head(5).iterrows():
        need_page(32)
        rate    = float(r["변동률_%"])
        rc, bg  = _rate_colors(rate)
        dev_str = f"편차  {r['편차']:.1f}%p"

        rect(M, y, CW, 28, C_XLGRAY, stroke=C_LGRAY, r=4, lw=0.4)
        rect(M, y, 3, 28, rc, r=2)           # 왼쪽 컬러 바

        txt(M + 9, y - 9,  r["행정동"], "Malgun", 8, C_MUTED)
        txt(M + 9, y - 21, r["단지명"], "MalgunBd", 10, C_DARK)

        badge(M + CW - 110, y - 7, _pct(rate), rc, bg, w=54, h=15, r=7)
        txt(M + CW - 52, y - 9,  dev_str, "MalgunBd", 8.5, C_PURPLE)
        txt(M + CW - 52, y - 21, f"{int(r['거래건수'])}건", "Malgun", 8, C_MUTED)

        y -= 33

    y -= 6

    # ── 5. 주목할 단지 TOP 5 ─────────────────────────────────────
    need_page(110)
    y = section_head(y, "UNDERVALUED COMPLEXES", "주목할 단지  TOP 5  —  점수 대비 저평가 (점수당가격↓)", C_GREEN)

    # 헤더
    rect(M, y, CW, 16, C_XLGRAY, r=2)
    NW = [CW * p for p in [0.04, 0.16, 0.34, 0.14, 0.16, 0.16]]
    nc = [M]
    for w in NW[:-1]:
        nc.append(nc[-1] + w)
    for j, (h_, col_) in enumerate(zip(["#","동","단지명","종합점수","평당가","저평가지수↓"], nc)):
        fn_ = "MalgunBd"
        sz_ = 8
        if j <= 2:
            txt(col_ + 3, y - 11, h_, fn_, sz_, C_MUTED)
        else:
            txt_r(col_ + NW[j] - 3, y - 11, h_, fn_, sz_, C_MUTED)
    y -= 17

    for i, (_, r) in enumerate(top_notable.head(5).iterrows(), 1):
        need_page(22)
        row_bg = C_XLGRAY if i % 2 == 0 else C_WHITE
        rect(M, y, CW, 19, row_bg, r=2)

        txt_c(nc[0] + NW[0] / 2, y - 13, str(i), "MalgunBd", 9, C_MUTED)
        txt(nc[1] + 3, y - 13, r["행정동"], "Malgun", 9, C_SLATE)
        txt(nc[2] + 3, y - 13, r["단지명"], "MalgunBd", 9, C_DARK)
        txt_r(nc[3] + NW[3] - 3, y - 13, f"{int(r['종합점수'])}점", "Malgun", 9, C_SLATE)
        txt_r(nc[4] + NW[4] - 3, y - 13, f"{int(r['평당가_전체평균']):,}만원", "Malgun", 8.5, C_SLATE)

        ratio_str = f"{r['점수당가격']:.1f}"
        rw = sw(ratio_str, "MalgunBd", 10) + 12
        rx = nc[5] + NW[5] - 3 - rw
        rect(rx, y - 5, rw, 14, C_XLGRAY, stroke=C_PURPLE, r=3, lw=0.6)
        txt_r(nc[5] + NW[5] - 9, y - 13, ratio_str, "MalgunBd", 10, C_PURPLE)

        y -= 20

    y -= 8

    # ── 6. 매매 관점 인사이트 ─────────────────────────────────────
    need_page(90)
    y = section_head(y, "INVESTMENT INSIGHTS", "매매 관점 인사이트", C_AMBER)

    for para in _insight_paragraphs(dong_rate, top_notable):
        need_page(36)
        # 불릿 점
        cv.saveState()
        cv.setFillColorRGB(*C_AMBER)
        cv.circle(M + 4, y - 6, 2.5, fill=1, stroke=0)
        cv.restoreState()

        new_y = draw_wrapped(M + 12, y, para, "Malgun", 9, C_SLATE, CW - 12, leading=13)
        y = new_y - 7

    y -= 4

    # ── 7. 고지사항 ───────────────────────────────────────────────
    need_page(28)
    rect(M, y, CW, 26, (0.996, 0.988, 0.949), stroke=(0.949, 0.831, 0.329), r=4, lw=0.5)
    notice = (
        "⚠  본 보고서는 국토교통부 실거래가 공개시스템 데이터 기반 자동 분석 결과입니다. "
        "투자 결정은 반드시 공인중개사·세무사와 추가 검토 후 진행하십시오."
    )
    nlines = wrap_lines(notice, "Malgun", 8, CW - 14)
    for ni, nl in enumerate(nlines[:2]):
        txt(M + 7, y - 9 - ni * 11, nl, "Malgun", 8, (0.502, 0.384, 0.047))

    # ── 8. 푸터 ───────────────────────────────────────────────────
    _page_footer()
    cv.save()


# ── 메인 ────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="분당구 아파트 매매 요약보고서 PDF 생성")
    parser.add_argument("--data",      default=os.path.join(BASE_DIR, "data"))
    parser.add_argument("--output",    default=OUTPUT_DIR)
    parser.add_argument("--min-deals", type=int, default=5)
    parser.add_argument("--top-n",     type=int, default=5)
    args = parser.parse_args()

    # ── data/ 폴더 자동 생성 + 안내 ───────────────────────────────
    # 폴더 자체가 없으면 만들어 주고, CSV를 넣을 위치를 명확히 알린다.
    if not os.path.isdir(args.data):
        os.makedirs(args.data, exist_ok=True)
        sys.exit(
            f"[안내] data 폴더를 새로 만들었습니다: {args.data}\n"
            "  → rt.molit.go.kr에서 분당구 매매 실거래 CSV를 받아\n"
            f"    '{args.data}' 안에 '아파트(매매)_실거래가_*.csv' 형태로 저장한 뒤 다시 실행하세요."
        )

    results     = run_analysis(args.data, args.min_deals, args.top_n)

    # ── 필터 후 빈 데이터 방어 ────────────────────────────────────
    # 모든 행이 '해제'·결측·기간외 등으로 걸러져 분석 결과가 비면
    # 깨진 빈 PDF 대신 명확한 중단 메시지를 낸다.
    if results["df"].empty or results["dong_rate"].empty:
        sys.exit(
            "[오류] 분석할 유효 거래가 없습니다.\n"
            "  → CSV가 분당구 매매 실거래인지, '해제' 거래만 들어있지 않은지,\n"
            "    분석 기간(2025.06.15~2026.06.14) 내 거래가 있는지 확인하세요."
        )

    report_date = datetime.now().strftime("%Y%m%d")

    os.makedirs(args.output, exist_ok=True)
    out_path = os.path.join(args.output, f"분당 아파트 매매_요약보고서_{report_date}.pdf")

    print(f"\n[PDF 생성 중] {out_path}")
    build_pdf(results, out_path, report_date)
    print(f"[완료] → {out_path}")
    return out_path


if __name__ == "__main__":
    main()
