#!/usr/bin/env python3
"""
분당구 아파트 실거래가 분석

- 동별/단지별 평당가 변동률 (전반기 vs 후반기)
- 이 달의 거래: 동 평균 대비 변동률 편차 최대 단지
- 단지 점수: 입지·학군·평형/구조·재건축·단지규모·동층조망
- 주목할 단지: 점수당가격 최저 (점수 대비 저평가)

사용법:
    python scripts/analyze.py
    python scripts/analyze.py --data data/
    python scripts/analyze.py --min-deals 3 --top-n 10
"""

import io
import os
import sys
import json
import glob
import argparse
import pandas as pd
from datetime import datetime

# Windows 터미널 CP949 환경에서 한글·유니코드 출력 보장 (이중 래핑 방지)
if hasattr(sys.stdout, "buffer") and getattr(sys.stdout, "encoding", "").lower() not in ("utf-8", "utf8"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "buffer") and getattr(sys.stderr, "encoding", "").lower() not in ("utf-8", "utf8"):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

# ─────────────────────────────────────────────────────────────────
# 상수 (PROJECT_SUMMARY.md 기준)
# ─────────────────────────────────────────────────────────────────

PYEONG_FACTOR = 3.3058  # 1평 = 3.3058㎡

FIRST_HALF_START  = "20250615"
FIRST_HALF_END    = "20251213"
SECOND_HALF_START = "20251214"
SECOND_HALF_END   = "20260614"

# 전년 동기비 기준 기간
YOY_CURR_START = "20250615"   # 당해 분석 시작
YOY_CURR_END   = "20260614"   # 당해 분석 끝
YOY_PREV_START = "20240615"   # 전년 동기 시작
YOY_PREV_END   = "20250614"   # 전년 동기 끝

BUNDANG_DONGS = [
    "정자동", "야탑동", "서현동", "구미동", "수내동",
    "이매동", "금곡동", "운중동", "분당동", "판교동",
    "삼평동", "백현동", "대장동",
]

# 동별 기준 점수 (입지 40점·학군 15점 만점)
# 판교권(삼평·백현·판교) > 정자·서현·수내 > 구미·이매 > 야탑·분당 > 운중·금곡 > 대장
DONG_BASE_SCORES = {
    "삼평동": {"입지": 37, "학군": 11},
    "백현동": {"입지": 36, "학군": 11},
    "정자동": {"입지": 36, "학군": 14},
    "서현동": {"입지": 35, "학군": 14},
    "수내동": {"입지": 35, "학군": 13},
    "판교동": {"입지": 35, "학군": 11},
    "이매동": {"입지": 33, "학군": 13},
    "구미동": {"입지": 32, "학군": 12},
    "운중동": {"입지": 31, "학군": 10},
    "야탑동": {"입지": 30, "학군": 11},
    "분당동": {"입지": 30, "학군": 11},
    "금곡동": {"입지": 29, "학군": 10},
    "대장동": {"입지": 27, "학군":  9},
}

CLUSTER_MAP = {
    "삼평동": "판교권", "백현동": "판교권", "판교동": "판교권",
    "정자동": "구분당", "서현동": "구분당", "수내동": "구분당",
    "분당동": "구분당", "구미동": "구분당",
    "이매동": "외곽",   "야탑동": "외곽",   "금곡동": "외곽",
    "운중동": "외곽",   "대장동": "외곽",
}

BASE_DIR             = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCORES_OVERRIDE_PATH = os.path.join(BASE_DIR, "scores_override.json")


# ─────────────────────────────────────────────────────────────────
# 1. 데이터 로드
# ─────────────────────────────────────────────────────────────────

def load_csv(data_dir: str) -> pd.DataFrame:
    """data/ 폴더의 국토부 실거래가 CSV를 모두 읽어 합산"""
    pattern = os.path.join(data_dir, "아파트(매매)_실거래가_*.csv")
    files   = sorted(glob.glob(pattern))
    if not files:
        sys.exit(
            f"[오류] CSV 없음: {pattern}\n"
            "  → rt.molit.go.kr에서 분당구 매매 실거래 CSV를 다운로드해 data/ 폴더에 저장하세요."
        )

    frames = []
    for path in files:
        loaded = False
        for enc in ("euc-kr", "cp949", "utf-8-sig"):
            try:
                df = pd.read_csv(path, skiprows=15, encoding=enc, dtype=str)
                frames.append(df)
                print(f"  ✓ {os.path.basename(path)}  [{enc}]  {len(df):,}행")
                loaded = True
                break
            except (UnicodeDecodeError, pd.errors.ParserError):
                continue
        if not loaded:
            print(f"  ✗ {os.path.basename(path)}  읽기 실패 — 인코딩을 확인하세요")

    if not frames:
        sys.exit("[오류] 읽을 수 있는 CSV가 없습니다.")

    return pd.concat(frames, ignore_index=True)


# ─────────────────────────────────────────────────────────────────
# 2. 전처리
# ─────────────────────────────────────────────────────────────────

def clean_data(raw: pd.DataFrame) -> pd.DataFrame:
    df = raw.copy()

    # 컬럼명 앞뒤 공백·따옴표 제거
    df.columns = [c.strip().strip('"') for c in df.columns]

    # ── 행정동 추출 ("경기도 성남시 분당구 정자동" → "정자동") ──
    if "시군구" not in df.columns:
        sys.exit("[오류] '시군구' 컬럼을 찾을 수 없습니다. CSV 헤더를 확인하세요.")
    df["행정동"] = (
        df["시군구"].astype(str)
        .str.split("분당구 ").str[-1]
        .str.strip()
    )
    df = df[df["행정동"].isin(BUNDANG_DONGS)].copy()

    # ── 거래금액 파싱 ("175,000" → 175000.0) ──
    df["거래금액_만원"] = (
        df["거래금액(만원)"].astype(str)
        .str.replace(",", "", regex=False)
        .str.strip()
        .pipe(pd.to_numeric, errors="coerce")
    )

    # ── 전용면적 ──
    df["전용면적_sqm"] = pd.to_numeric(
        df["전용면적(㎡)"].astype(str).str.strip(), errors="coerce"
    )

    # ── 계약일자 (YYYYMMDD 문자열) ──
    year_month = df["계약년월"].astype(str).str.strip().str.zfill(6)
    day        = df["계약일"].astype(str).str.strip().str.zfill(2)
    df["계약일자"] = year_month + day

    # ── 건축년도 ──
    df["건축년도"] = pd.to_numeric(
        df["건축년도"].astype(str).str.strip(), errors="coerce"
    )

    # ── 단지명 정리 ──
    df["단지명"] = df["단지명"].astype(str).str.strip()

    # ── 해제 거래 제외 ──
    if "거래상태" in df.columns:
        df = df[~df["거래상태"].astype(str).str.contains("해제", na=False)]

    # ── 필수값 결측 제거 ──
    df = df.dropna(subset=["거래금액_만원", "전용면적_sqm"])
    df = df[df["전용면적_sqm"] > 0]

    return df.reset_index(drop=True)


def calc_unit_price(df: pd.DataFrame) -> pd.DataFrame:
    """평당가(만원/평) = 거래금액(만원) / (전용면적(㎡) / 3.3058)"""
    df["평당가"] = (df["거래금액_만원"] / (df["전용면적_sqm"] / PYEONG_FACTOR)).round(0)
    return df


# ─────────────────────────────────────────────────────────────────
# 3. 변동률 계산 (전반기 vs 후반기)
# ─────────────────────────────────────────────────────────────────

def _split(df: pd.DataFrame):
    first  = df[(df["계약일자"] >= FIRST_HALF_START)  & (df["계약일자"] <= FIRST_HALF_END)]
    second = df[(df["계약일자"] >= SECOND_HALF_START) & (df["계약일자"] <= SECOND_HALF_END)]
    return first, second


def calc_change_rate(df: pd.DataFrame, group_cols: list) -> pd.DataFrame:
    """전반기→후반기 평당가 평균 변동률"""
    first, second = _split(df)

    avg1    = first.groupby(group_cols)["평당가"].mean().rename("평당가_전반기")
    avg2    = second.groupby(group_cols)["평당가"].mean().rename("평당가_후반기")
    cnt     = df.groupby(group_cols)["거래금액_만원"].count().rename("거래건수")
    avg_all = df.groupby(group_cols)["평당가"].mean().rename("평당가_전체평균")

    result = (
        pd.concat([avg1, avg2, cnt, avg_all], axis=1)
        .dropna(subset=["평당가_전반기", "평당가_후반기"])
    )
    result["변동률_%"] = (
        (result["평당가_후반기"] - result["평당가_전반기"])
        / result["평당가_전반기"] * 100
    ).round(1)

    return result.reset_index()


# ─────────────────────────────────────────────────────────────────
# 4. 이 달의 거래
# ─────────────────────────────────────────────────────────────────

def select_monthly_highlight(
    dong_rate: pd.DataFrame, complex_rate: pd.DataFrame
) -> pd.DataFrame:
    """동 평균 변동률 대비 편차(절댓값)가 가장 큰 단지를 동별로 선정"""
    dong_avg = dong_rate.set_index("행정동")["변동률_%"].to_dict()

    result = complex_rate.copy()
    result["동_평균변동률"] = result["행정동"].map(dong_avg)
    result["편차"]         = (result["변동률_%"] - result["동_평균변동률"]).abs()

    highlight = (
        result.sort_values("편차", ascending=False)
        .groupby("행정동", sort=False)
        .first()
        .reset_index()
    )[["행정동", "단지명", "변동률_%", "동_평균변동률", "편차", "거래건수"]]

    return highlight.sort_values("편차", ascending=False)


# ─────────────────────────────────────────────────────────────────
# 5. 단지 점수 계산
# ─────────────────────────────────────────────────────────────────

def load_score_overrides() -> dict:
    """
    scores_override.json 로드.
    형식: { "행정동_단지명": { "종합점수": 75 }, ... }
    파일이 없으면 빈 dict 반환.
    """
    if os.path.exists(SCORES_OVERRIDE_PATH):
        with open(SCORES_OVERRIDE_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {}


def _score_area(sqm: float) -> int:
    """평형/구조 (20점 만점) — 전용면적 기준"""
    if   sqm >= 135: return 18
    elif sqm >= 100: return 17
    elif sqm >= 85:  return 16
    elif sqm >= 60:  return 13
    else:            return 10  # 소형(~59㎡)


def _score_reconstruction(build_year) -> int:
    """재건축/개발호재 (10점 만점) — 건축년도 기준 (2026년 현재 기준 노후도)"""
    if pd.isna(build_year):
        return 5
    age = 2026 - int(build_year)
    if   age >= 35: return 10
    elif age >= 30: return 8
    elif age >= 25: return 6
    elif age >= 20: return 4
    elif age >= 10: return 2
    else:           return 0


def _score_size(deal_count: int) -> int:
    """단지 규모 (10점 만점) — 거래량 프록시 (대단지일수록 거래 빈번)"""
    if   deal_count >= 150: return 9
    elif deal_count >= 80:  return 8
    elif deal_count >= 40:  return 6
    elif deal_count >= 20:  return 4
    elif deal_count >= 10:  return 3
    else:                   return 2


def calc_complex_scores(
    df: pd.DataFrame,
    complex_rate: pd.DataFrame,
    overrides: dict,
) -> pd.DataFrame:
    """단지별 종합점수·점수당가격 계산"""
    meta = (
        df.groupby(["행정동", "단지명"])
        .agg(
            건축년도     =("건축년도",      "median"),
            면적_중위    =("전용면적_sqm",  "median"),
            거래건수_전체=("거래금액_만원", "count"),
        )
        .reset_index()
    )

    scored = complex_rate.merge(meta, on=["행정동", "단지명"], how="left")

    score_rows = []
    for _, row in scored.iterrows():
        key  = f"{row['행정동']}_{row['단지명']}"
        dong = row["행정동"]
        base = DONG_BASE_SCORES.get(dong, {"입지": 28, "학군": 9})

        s_입지     = base["입지"]
        s_학군     = base["학군"]
        s_평형     = _score_area(row.get("면적_중위", 60))
        s_재건축   = _score_reconstruction(row.get("건축년도"))
        s_단지규모 = _score_size(int(row.get("거래건수_전체", 0)))
        s_조망     = 3  # 개별 거래 데이터로 산정 불가, 기본값

        if key in overrides and isinstance(overrides[key], dict) and "종합점수" in overrides[key]:
            total = overrides[key]["종합점수"]
        else:
            total = min(s_입지 + s_학군 + s_평형 + s_재건축 + s_단지규모 + s_조망, 100)

        score_rows.append({
            "종합점수":     total,
            "점수_입지":   s_입지,
            "점수_학군":   s_학군,
            "점수_평형":   s_평형,
            "점수_재건축": s_재건축,
            "점수_단지규모": s_단지규모,
            "점수_조망":   s_조망,
        })

    _score_df = pd.DataFrame(score_rows, index=scored.index)
    for col in _score_df.columns:
        scored[col] = _score_df[col]

    scored["점수당가격"] = (scored["평당가_전체평균"] / scored["종합점수"]).round(1)
    return scored


# ─────────────────────────────────────────────────────────────────
# 6. 주목할 단지
# ─────────────────────────────────────────────────────────────────

def select_notable(
    scored: pd.DataFrame, min_deals: int = 5, top_n: int = 5
) -> tuple:
    """
    점수당가격 최저 단지를 '주목할 단지'로 선정.
    - dong_notable : 동별 1위
    - top_notable  : 분당구 전체 TOP N
    min_deals 미만 단지는 제외 (소량 거래 이상치 방지).
    """
    pool = scored[scored["거래건수"] >= min_deals].copy()
    cols = [
        "행정동", "단지명", "종합점수", "평당가_전체평균", "점수당가격", "변동률_%", "거래건수",
        "점수_입지", "점수_학군", "점수_평형", "점수_재건축", "점수_단지규모", "점수_조망",
    ]

    dong_notable = (
        pool.sort_values("점수당가격")
        .groupby("행정동")
        .first()
        .reset_index()
    )[cols]

    top_notable = (
        pool.nsmallest(top_n, "점수당가격")[cols]
        .reset_index(drop=True)
    )

    return dong_notable, top_notable


# ─────────────────────────────────────────────────────────────────
# 7. 월별 추이 & 변동 이유 분석
# ─────────────────────────────────────────────────────────────────

def calc_monthly_trend(df: pd.DataFrame) -> pd.DataFrame:
    """월별 분당구 전체 평균 평당가"""
    ym = df["계약년월"].astype(str).str.strip().str.zfill(6)
    monthly = (
        df.assign(ym=ym)
        .groupby("ym")
        .agg(평당가_평균=("평당가", "mean"), 거래건수=("평당가", "count"))
        .reset_index()
        .rename(columns={"ym": "계약년월"})
    )
    monthly["평당가_평균"] = monthly["평당가_평균"].round(0).astype(int)
    return monthly.sort_values("계약년월").reset_index(drop=True)


def calc_reason_tags(dong_rate: pd.DataFrame, df: pd.DataFrame) -> list:
    """동별 변동 이유 자동 분석 — 건축년도·입지·학군 기반"""
    dong_avg_year = df.groupby("행정동")["건축년도"].median().to_dict()

    result = []
    for _, row in dong_rate.iterrows():
        dong    = str(row["행정동"])
        rate    = float(row["변동률_%"])
        by      = dong_avg_year.get(dong)
        age     = int(2026 - by) if (by is not None and not pd.isna(by)) else 20
        base    = DONG_BASE_SCORES.get(dong, {"입지": 28, "학군": 9})
        cluster = CLUSTER_MAP.get(dong, "기타")

        tags: list = []
        if rate >= 10:
            if age >= 30:
                tags.append(f"재건축 기대 ({age}년)")
            if base["학군"] >= 13:
                tags.append("학군 수요 강세")
            if base["입지"] >= 35:
                tags.append("광역교통 수혜")
            if not tags:
                tags.append("저평가 해소 진행")
        elif rate >= 3:
            if age >= 25:
                tags.append("노후 단지 관심")
            if base["학군"] >= 12:
                tags.append("학군 선호 유지")
            tags.append("실수요 유입 지속")
        elif rate >= -3:
            tags.append("횡보 관망세")
            if base["입지"] >= 33:
                tags.append("실수요 방어")
        else:
            if base["입지"] < 32:
                tags.append("외곽 입지 약세")
            tags.append("공급 부담")
            tags.append("고금리 관망")

        result.append({
            "dong":     dong,
            "rate":     round(rate, 1),
            "age":      age,
            "cluster":  cluster,
            "location": base["입지"],
            "school":   base["학군"],
            "tags":     tags[:3],
        })

    return result


def calc_monthly_dong(df: pd.DataFrame) -> list:
    """월별 동별 평당가 가중평균·거래건수 (JS 기간 필터 재계산용, YYYY.MM 형식)"""
    ym = df["계약년월"].astype(str).str.strip().str.zfill(6)
    result = (
        df.assign(ym=ym)
        .groupby(["ym", "행정동"])
        .agg(price=("평당가", "mean"), count=("평당가", "count"))
        .reset_index()
        .rename(columns={"행정동": "dong"})
    )
    result["price"] = result["price"].round(0).astype(int)
    result["count"] = result["count"].astype(int)
    result["ym"]    = result["ym"].str[:4] + "." + result["ym"].str[4:]
    return result.sort_values(["ym", "dong"]).to_dict(orient="records")


def calc_monthly_complex(df: pd.DataFrame, min_total_deals: int = 5) -> list:
    """월별 단지별 평당가 평균·거래건수 (전체 기간 min_total_deals 이상 단지만, YYYY.MM 형식)"""
    total_cnt = (
        df.groupby(["행정동", "단지명"])["평당가"]
        .count()
        .reset_index(name="_n")
    )
    valid = total_cnt[total_cnt["_n"] >= min_total_deals][["행정동", "단지명"]]
    ym    = df["계약년월"].astype(str).str.strip().str.zfill(6)
    df2   = df.assign(ym=ym).merge(valid, on=["행정동", "단지명"], how="inner")
    result = (
        df2.groupby(["ym", "행정동", "단지명"])
        .agg(price=("평당가", "mean"), count=("평당가", "count"))
        .reset_index()
        .rename(columns={"행정동": "dong", "단지명": "complex"})
    )
    result["price"] = result["price"].round(0).astype(int)
    result["count"] = result["count"].astype(int)
    result["ym"]    = result["ym"].str[:4] + "." + result["ym"].str[4:]
    return result.sort_values(["ym", "dong", "complex"]).to_dict(orient="records")


def calc_yoy_rate(df: pd.DataFrame) -> pd.DataFrame:
    """전년 동기비 동별 평당가 변동률 (2024.06.15~2025.06.14 vs 2025.06.15~2026.06.14)"""
    curr = df[(df["계약일자"] >= YOY_CURR_START) & (df["계약일자"] <= YOY_CURR_END)]
    prev = df[(df["계약일자"] >= YOY_PREV_START) & (df["계약일자"] <= YOY_PREV_END)]

    avg_curr = curr.groupby("행정동")["평당가"].mean().rename("평당가_당해")
    avg_prev = prev.groupby("행정동")["평당가"].mean().rename("평당가_전년")
    cnt_curr = curr.groupby("행정동")["평당가"].count().rename("거래건수_당해")
    cnt_prev = prev.groupby("행정동")["평당가"].count().rename("거래건수_전년")

    result = (
        pd.concat([avg_curr, avg_prev, cnt_curr, cnt_prev], axis=1)
        .dropna(subset=["평당가_당해", "평당가_전년"])
        .reset_index()
    )
    result["전년동기비_%"] = (
        (result["평당가_당해"] - result["평당가_전년"])
        / result["평당가_전년"] * 100
    ).round(1)
    return result


# ─────────────────────────────────────────────────────────────────
# 8. 출력
# ─────────────────────────────────────────────────────────────────

SEP = "─" * 70


def _pct(v: float) -> str:
    return f"+{v:.1f}%" if v > 0 else f"{v:.1f}%"


def print_results(
    dong_rate: pd.DataFrame,
    highlight: pd.DataFrame,
    dong_notable: pd.DataFrame,
    top_notable: pd.DataFrame,
) -> None:

    # ── 동별 변동률 ──────────────────────────────────────────────
    print(f"\n{SEP}")
    print("  분당구 13개 동  평당가 변동률  (전반기→후반기)")
    print(f"  기준: {FIRST_HALF_START}~{FIRST_HALF_END}  vs  {SECOND_HALF_START}~{SECOND_HALF_END}")
    print(SEP)
    for _, r in dong_rate.sort_values("변동률_%", ascending=False).iterrows():
        arrow = "▲" if r["변동률_%"] > 0 else "▼"
        print(
            f"  {r['행정동']:6s}  "
            f"평당가 {r['평당가_전체평균']:6,.0f}만원  "
            f"{arrow} {_pct(r['변동률_%']):>7s}  "
            f"({r['거래건수']:.0f}건)"
        )

    # ── 이 달의 거래 ─────────────────────────────────────────────
    print(f"\n{SEP}")
    print("  이 달의 거래  (동 평균 대비 변동률 최대 편차 단지)")
    print(SEP)
    for _, r in highlight.iterrows():
        print(
            f"  [{r['행정동']}]  {r['단지명'][:26]:26s}  "
            f"{_pct(r['변동률_%']):>7s}  "
            f"(동 평균 {_pct(r['동_평균변동률'])} 대비 {r['편차']:.1f}%p,  {r['거래건수']:.0f}건)"
        )

    # ── 동별 주목할 단지 ─────────────────────────────────────────
    print(f"\n{SEP}")
    print("  동별 주목할 단지  (점수당가격 최저 = 점수 대비 저평가)")
    print(SEP)
    for _, r in dong_notable.sort_values("점수당가격").iterrows():
        print(
            f"  [{r['행정동']}]  {r['단지명'][:26]:26s}  "
            f"점수 {r['종합점수']:.0f}pt  "
            f"평당가 {r['평당가_전체평균']:,.0f}만원  "
            f"점수당가격 {r['점수당가격']:.1f}"
        )

    # ── 분당구 전체 TOP N ─────────────────────────────────────────
    print(f"\n{SEP}")
    print(f"  분당구 전체 주목할 단지  TOP {len(top_notable)}")
    print(SEP)
    for i, (_, r) in enumerate(top_notable.iterrows(), 1):
        print(
            f"  {i}위  [{r['행정동']}]  {r['단지명'][:26]:26s}  "
            f"점수 {r['종합점수']:.0f}pt  "
            f"평당가 {r['평당가_전체평균']:,.0f}만원  "
            f"점수당가격 {r['점수당가격']:.1f}  "
            f"({_pct(r['변동률_%'])})"
        )
    print()


# ─────────────────────────────────────────────────────────────────
# 9. run (CLI 없이 직접 호출 가능)
# ─────────────────────────────────────────────────────────────────

def run(data_dir: str, min_deals: int = 5, top_n: int = 5) -> dict:
    """dashboard.py / weekly_report.py 등 다른 스크립트에서 import해 쓸 수 있는 진입점."""
    print(f"\n[{datetime.now():%Y-%m-%d %H:%M}] 분당구 아파트 실거래 분석 시작")
    print(f"  data 폴더: {data_dir}\n")

    raw = load_csv(data_dir)
    df  = clean_data(raw)

    # ── 필터 후 빈 데이터 방어 ────────────────────────────────────
    # '해제' 거래·필수값 결측·분당구 외 지역 등으로 모든 행이 걸러지면
    # 이후 계산이 KeyError로 깨지므로, 여기서 명확히 중단한다.
    if df.empty:
        sys.exit(
            "[오류] 분석할 유효 거래가 없습니다.\n"
            "  → CSV가 분당구 매매 실거래인지, '해제' 거래만 들어있지 않은지,\n"
            "    거래금액·전용면적 등 필수값이 채워져 있는지 확인하세요."
        )

    df  = calc_unit_price(df)
    print(f"\n  유효 거래: {len(df):,}건 / {df['행정동'].nunique()}개 동")

    dong_rate    = calc_change_rate(df, ["행정동"])
    complex_rate = calc_change_rate(df, ["행정동", "단지명"])

    # 전반기·후반기 양쪽 거래가 있는 동이 하나도 없으면 변동률을 낼 수 없다.
    if dong_rate.empty:
        sys.exit(
            "[오류] 변동률을 계산할 거래가 없습니다.\n"
            "  → 분석 기간(전반기 2025.06.15~2025.12.13 / 후반기 2025.12.14~2026.06.14)\n"
            "    양쪽 모두에 거래가 있는 동이 없습니다. CSV의 계약년월·계약일을 확인하세요."
        )

    highlight    = select_monthly_highlight(dong_rate, complex_rate)

    overrides = load_score_overrides()
    scored    = calc_complex_scores(df, complex_rate, overrides)

    dong_notable, top_notable = select_notable(
        scored, min_deals=min_deals, top_n=top_n
    )

    monthly_trend   = calc_monthly_trend(df)
    monthly_dong    = calc_monthly_dong(df)
    monthly_complex = calc_monthly_complex(df, min_total_deals=min_deals)
    reasons         = calc_reason_tags(dong_rate, df)
    yoy_rate        = calc_yoy_rate(df)

    print_results(dong_rate, highlight, dong_notable, top_notable)

    # 전년 동기비 출력
    if not yoy_rate.empty:
        print(f"\n{SEP}")
        print(f"  전년 동기비  ({YOY_PREV_START}~{YOY_PREV_END} vs {YOY_CURR_START}~{YOY_CURR_END})")
        print(SEP)
        for _, r in yoy_rate.sort_values("전년동기비_%", ascending=False).iterrows():
            arrow = "▲" if r["전년동기비_%"] > 0 else "▼"
            print(
                f"  {r['행정동']:6s}  "
                f"당해 {int(r['평당가_당해']):,}만원 / 전년 {int(r['평당가_전년']):,}만원  "
                f"{arrow} {_pct(r['전년동기비_%']):>7s}  "
                f"(당해 {int(r['거래건수_당해'])}건 / 전년 {int(r['거래건수_전년'])}건)"
            )
        print()

    return {
        "df":               df,
        "dong_rate":        dong_rate,
        "complex_rate":     complex_rate,
        "highlight":        highlight,
        "scored":           scored,
        "dong_notable":     dong_notable,
        "top_notable":      top_notable,
        "monthly_trend":    monthly_trend,
        "monthly_dong":     monthly_dong,
        "monthly_complex":  monthly_complex,
        "reasons":          reasons,
        "yoy_rate":         yoy_rate,
    }


# ─────────────────────────────────────────────────────────────────
# 10. main (CLI 래퍼)
# ─────────────────────────────────────────────────────────────────

def main() -> dict:
    parser = argparse.ArgumentParser(description="분당구 아파트 실거래가 분석")
    parser.add_argument(
        "--data", default=os.path.join(BASE_DIR, "data"),
        help="CSV가 있는 data 폴더 경로 (기본: ../data)"
    )
    parser.add_argument(
        "--min-deals", type=int, default=5,
        help="주목할 단지 선정 최소 거래건수 (기본: 5)"
    )
    parser.add_argument(
        "--top-n", type=int, default=5,
        help="분당구 전체 주목할 단지 TOP N (기본: 5)"
    )
    args = parser.parse_args()
    return run(args.data, args.min_deals, args.top_n)


if __name__ == "__main__":
    main()
