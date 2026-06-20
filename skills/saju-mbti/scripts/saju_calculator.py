#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
만세력(사주팔자) 계산 엔진 — 순수 파이썬, 외부 라이브러리/네트워크 불필요.

핵심 원칙
---------
사주의 기둥은 '음력 날짜'가 아니라 '태양의 위치(24절기)'로 정해진다.
 - 연주(年柱)는 입춘(태양황경 315°)을 경계로 바뀐다. (양력 1/1, 음력 설날 아님)
 - 월주(月柱)는 12개의 '절(節)' 절기를 경계로 바뀐다.
 - 일주(日柱)는 60갑자 연속 순환(율리우스일 기반)으로 정해진다.
 - 시주(時柱)는 일간 + 진태양시(眞太陽時) 기준 시지로 정해진다.

검증 앵커
---------
 - 1901-01-01 일진 = 己卯 (60갑자 0-based index 15)  [한국민족문화대백과]
 - 연주는 입춘에 바뀜 (예: 2020 庚子年 입춘 = 2020-02-04 18:03)
 - 진태양시: 서울(동경 126.98°)은 표준시(동경 135°) 대비 약 -32분

사용
----
    from saju_calculator import calculate_saju
    result = calculate_saju(1990, 5, 17, hour=14, minute=30,
                            longitude=126.978, tz_offset=9.0,
                            time_known=True)
    print(result["report_text"])
"""

import math
from datetime import datetime, timedelta

# ----------------------------------------------------------------------------
# 상수
# ----------------------------------------------------------------------------
STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"]
STEMS_HJ = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"]
BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"]
BRANCHES_HJ = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"]
ANIMALS = ["쥐", "소", "호랑이", "토끼", "용", "뱀", "말", "양", "원숭이", "닭", "개", "돼지"]

# 오행: 천간
STEM_ELEMENT = ["목", "목", "화", "화", "토", "토", "금", "금", "수", "수"]
# 오행: 지지
BRANCH_ELEMENT = ["수", "토", "목", "목", "토", "화", "화", "토", "금", "금", "토", "수"]
# 음양: 천간 (양=True)
STEM_YANG = [True, False, True, False, True, False, True, False, True, False]
# 음양: 지지 (양=True)
BRANCH_YANG = [True, False, True, False, True, False, True, False, True, False, True, False]

# 지장간(地藏干) — 각 지지에 숨은 천간(여기/중기/정기). 0-based 천간 인덱스.
HIDDEN_STEMS = {
    0:  [9],            # 子: 癸
    1:  [9, 7, 5],      # 丑: 癸 辛 己
    2:  [4, 2, 0],      # 寅: 戊 丙 甲
    3:  [1],            # 卯: 乙
    4:  [1, 9, 4],      # 辰: 乙 癸 戊
    5:  [4, 6, 2],      # 巳: 戊 庚 丙
    6:  [3, 5],         # 午: 丁 己
    7:  [3, 1, 5],      # 未: 丁 乙 己
    8:  [4, 8, 6],      # 申: 戊 壬 庚
    9:  [7],            # 酉: 辛
    10: [7, 3, 4],      # 戌: 辛 丁 戊
    11: [4, 8],         # 亥: 戊 壬
}

ELEMENTS = ["목", "화", "토", "금", "수"]
# 상생: 목→화→토→금→수→목 / 상극: 목→토→수→화→금→목
ELEM_IDX = {e: i for i, e in enumerate(ELEMENTS)}


# ----------------------------------------------------------------------------
# 천문 계산 (태양 황경) — Meeus 약식
# ----------------------------------------------------------------------------
def _julian_day(dt_utc):
    """UTC datetime -> 율리우스일(JD)."""
    y, m = dt_utc.year, dt_utc.month
    d = (dt_utc.day + dt_utc.hour / 24.0 + dt_utc.minute / 1440.0
         + dt_utc.second / 86400.0)
    if m <= 2:
        y -= 1
        m += 12
    a = y // 100
    b = 2 - a + a // 4
    jd = (math.floor(365.25 * (y + 4716)) + math.floor(30.6001 * (m + 1))
          + d + b - 1524.5)
    return jd


def _jdn_noon(year, month, day):
    """정오 기준 율리우스일수(정수) — 일주 계산용."""
    y, m = year, month
    if m <= 2:
        y -= 1
        m += 12
    a = y // 100
    b = 2 - a + a // 4
    jdn = (math.floor(365.25 * (y + 4716)) + math.floor(30.6001 * (m + 1))
           + day + b - 1524)
    return jdn


def sun_longitude(jd):
    """겉보기 태양 황경(도, 0~360). 정밀도 ~0.01°."""
    T = (jd - 2451545.0) / 36525.0
    L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360
    M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
    Mr = math.radians(M)
    C = ((1.914602 - 0.004817 * T - 0.000014 * T * T) * math.sin(Mr)
         + (0.019993 - 0.000101 * T) * math.sin(2 * Mr)
         + 0.000289 * math.sin(3 * Mr))
    true_long = L0 + C
    omega = 125.04 - 1934.136 * T
    app_long = true_long - 0.00569 - 0.00478 * math.sin(math.radians(omega))
    return app_long % 360


def equation_of_time_minutes(jd):
    """균시차(분). 진태양시 = 평균태양시 + 균시차."""
    T = (jd - 2451545.0) / 36525.0
    eps = 23.439291 - 0.0130042 * T
    L0 = (280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360
    M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T
    e = 0.016708634 - 0.000042037 * T
    y = math.tan(math.radians(eps / 2)) ** 2
    L0r = math.radians(L0)
    Mr = math.radians(M)
    E = (y * math.sin(2 * L0r) - 2 * e * math.sin(Mr)
         + 4 * e * y * math.sin(Mr) * math.cos(2 * L0r)
         - 0.5 * y * y * math.sin(4 * L0r)
         - 1.25 * e * e * math.sin(2 * Mr))
    return math.degrees(E) * 4.0  # 라디안->도(*4분/도)


def _find_solar_term_jd(year, target_long):
    """주어진 해 부근에서 태양황경 = target_long 이 되는 순간의 JD(UTC)를 이분탐색."""
    # 대략 시작 추정: 입춘(315)~2/4, 황경 0(춘분)~3/20 ...
    # target_long 0~360을 기준으로 대략 날짜 추정 후 ±40일 탐색.
    approx_day_of_year = ((target_long + 80) % 360) / 360.0 * 365.25
    base = datetime(year, 1, 1) + timedelta(days=approx_day_of_year)
    lo = _julian_day(base - timedelta(days=25))
    hi = _julian_day(base + timedelta(days=25))

    def diff(jd):
        d = (sun_longitude(jd) - target_long + 180) % 360 - 180
        return d

    # 부호가 바뀌는 구간을 잡아 이분
    for _ in range(60):
        mid = (lo + hi) / 2
        if diff(lo) * diff(mid) <= 0:
            hi = mid
        else:
            lo = mid
    return (lo + hi) / 2


# ----------------------------------------------------------------------------
# 사주 계산
# ----------------------------------------------------------------------------
def _ganzhi(idx):
    """0-based 60갑자 index -> (천간idx, 지지idx)."""
    idx %= 60
    return idx % 10, idx % 12


def _pillar_dict(stem_i, branch_i):
    return {
        "stem": STEMS[stem_i], "stem_hj": STEMS_HJ[stem_i],
        "branch": BRANCHES[branch_i], "branch_hj": BRANCHES_HJ[branch_i],
        "ko": STEMS[stem_i] + BRANCHES[branch_i],
        "hj": STEMS_HJ[stem_i] + BRANCHES_HJ[branch_i],
        "stem_i": stem_i, "branch_i": branch_i,
    }


def _ten_god(day_stem_i, other_stem_i):
    """일간 대비 어떤 천간의 십성(十星)."""
    de = ELEM_IDX[STEM_ELEMENT[day_stem_i]]
    oe = ELEM_IDX[STEM_ELEMENT[other_stem_i]]
    same_yy = (STEM_YANG[day_stem_i] == STEM_YANG[other_stem_i])
    rel = (oe - de) % 5
    if rel == 0:      # 동일 오행: 비겁
        return "비견" if same_yy else "겁재"
    if rel == 1:      # 내가 생함(我生): 식상
        return "식신" if same_yy else "상관"
    if rel == 2:      # 내가 극함(我克): 재성
        return "편재" if same_yy else "정재"
    if rel == 3:      # 나를 극함(克我): 관성
        return "편관" if same_yy else "정관"
    return "편인" if same_yy else "정인"  # rel==4 나를 생함(生我): 인성


def calculate_saju(year, month, day, hour=None, minute=0,
                   longitude=126.978, tz_offset=9.0, time_known=True,
                   place="(미입력)"):
    """
    양력 생년월일시로 사주팔자를 계산한다.

    인자
      year, month, day : 양력 생년월일
      hour, minute     : 24시간제 출생 시각 (time_known=False면 무시)
      longitude        : 출생지 경도(동경 +). 기본 서울 126.978
      tz_offset        : 출생 당시 표준시 오프셋(시간). 한국 현재 +9.0
                         (1908~1911, 1954~1961.8은 +8.5 적용 필요)
      time_known       : 출생 시각을 아는가
      place            : 출생지 표기(문자열, 참고용)
    """
    out = {}

    # --- 1) 입력 시각을 UTC instant 로 ---
    if time_known and hour is not None:
        local_dt = datetime(year, month, day, hour, minute)
    else:
        local_dt = datetime(year, month, day, 12, 0)  # 시각 모름 -> 정오로 절기/연월만 판정
    utc_dt = local_dt - timedelta(hours=tz_offset)
    jd = _julian_day(utc_dt)

    # --- 2) 진태양시 (시주/일경계용) ---
    # 평균태양시 보정: 경도차(분) = (경도 - 표준자오선) * 4
    std_meridian = tz_offset * 15.0
    lon_corr_min = (longitude - std_meridian) * 4.0
    eot_min = equation_of_time_minutes(jd)
    true_solar_dt = local_dt + timedelta(minutes=lon_corr_min + eot_min)

    # --- 3) 연주(年柱): 입춘 경계 ---
    ipchun_jd = _find_solar_term_jd(year, 315.0)  # 그 해 입춘(UTC)
    saju_year = year if jd >= ipchun_jd else year - 1
    ys, yb = _ganzhi((saju_year - 4) % 60)  # 1984=甲子, (Y-4)%60
    year_pillar = _pillar_dict(ys, yb)

    # --- 4) 월주(月柱): 12절 경계 (태양황경) ---
    lam = sun_longitude(jd)
    m_idx = int(((lam - 315) % 360) // 30)      # 0=寅 ... 11=丑
    month_branch_i = (2 + m_idx) % 12            # 寅=2
    # 월간: 五虎遁 — 寅월 천간 = (연간*2+2)%10, 이후 +1씩
    month_stem_i = ((ys * 2 + 2) + m_idx) % 10
    month_pillar = _pillar_dict(month_stem_i, month_branch_i)

    # --- 5) 일주(日柱): 60갑자 연속순환 ---
    # 진태양시 자정 경계. 23:00~24:00(야자시)은 당일 유지.
    eff_date = true_solar_dt
    jdn = _jdn_noon(eff_date.year, eff_date.month, eff_date.day)
    # 앵커: 1901-01-01 = 己卯(index 15). JDN(1901,1,1 정오)=2415386
    anchor_jdn = _jdn_noon(1901, 1, 1)
    day_idx = (15 + (jdn - anchor_jdn)) % 60
    ds, db = _ganzhi(day_idx)
    day_pillar = _pillar_dict(ds, db)

    # --- 6) 시주(時柱) ---
    if time_known and hour is not None:
        th = true_solar_dt.hour
        tm = true_solar_dt.minute
        # 시지: 子 23:00~00:59, 丑 01~03 ...
        hb = ((th + 1) // 2) % 12
        # 시간(時干): 五鼠遁 — 子시 천간 = (일간*2)%10, 이후 +1씩
        hs = ((ds * 2) + hb) % 10
        hour_pillar = _pillar_dict(hs, hb)
    else:
        hour_pillar = None

    # --- 7) 오행 분포 / 십성 / 신강약 ---
    pillars = [year_pillar, month_pillar, day_pillar]
    if hour_pillar:
        pillars.append(hour_pillar)

    elem_count = {e: 0 for e in ELEMENTS}
    for p in pillars:
        elem_count[STEM_ELEMENT[p["stem_i"]]] += 1
        elem_count[BRANCH_ELEMENT[p["branch_i"]]] += 1

    # 십성 라벨
    def stem_god(i):
        return _ten_god(ds, i)

    gods = {
        "년간": stem_god(ys), "월간": stem_god(month_stem_i),
        "일간": "일간(나)", "시간": (stem_god(hs) if hour_pillar else None),
    }

    # 신강/신약 휴리스틱: 일간을 돕는 오행(같은오행=비겁, 일간을 생하는오행=인성)
    day_elem = STEM_ELEMENT[ds]
    de = ELEM_IDX[day_elem]
    support_elems = {ELEMENTS[de], ELEMENTS[(de - 1) % 5]}  # 비겁 + 인성(나를 생)
    support = sum(elem_count[e] for e in support_elems)
    total = sum(elem_count.values())
    strength_ratio = support / total if total else 0
    if strength_ratio >= 0.55:
        strength = "신강(身强) 경향"
    elif strength_ratio <= 0.35:
        strength = "신약(身弱) 경향"
    else:
        strength = "중화(中和)에 가까움"

    # --- 결과 구성 ---
    out["input"] = {
        "양력": f"{year}-{month:02d}-{day:02d}",
        "시각": (f"{hour:02d}:{minute:02d}" if time_known and hour is not None else "모름"),
        "출생지": place, "경도": longitude, "표준시offset": tz_offset,
        "진태양시": true_solar_dt.strftime("%Y-%m-%d %H:%M"),
        "경도보정(분)": round(lon_corr_min, 1), "균시차(분)": round(eot_min, 1),
    }
    out["pillars"] = {
        "년주": year_pillar, "월주": month_pillar,
        "일주": day_pillar, "시주": hour_pillar,
    }
    out["일간"] = {"천간": STEMS[ds], "한자": STEMS_HJ[ds],
                   "오행": day_elem, "음양": "양" if STEM_YANG[ds] else "음"}
    out["띠"] = ANIMALS[yb]
    out["오행분포"] = elem_count
    out["십성"] = {k: v for k, v in gods.items() if v}
    out["신강약"] = {"판정": strength, "지지율": round(strength_ratio, 2)}
    out["지장간"] = {
        p_name: [STEMS_HJ[h] for h in HIDDEN_STEMS[p["branch_i"]]]
        for p_name, p in [("년지", year_pillar), ("월지", month_pillar),
                          ("일지", day_pillar)]
        + ([("시지", hour_pillar)] if hour_pillar else [])
    }
    out["report_text"] = _format_report(out)
    return out


def _format_report(o):
    p = o["pillars"]
    lines = []
    lines.append("=" * 52)
    lines.append("  만세력 사주팔자 산출 결과")
    lines.append("=" * 52)
    i = o["input"]
    lines.append(f"  입력   : 양력 {i['양력']}  {i['시각']}  / 출생지 {i['출생지']}")
    lines.append(f"  진태양시: {i['진태양시']}  (경도보정 {i['경도보정(분)']}분, 균시차 {i['균시차(분)']}분)")
    lines.append("-" * 52)
    header = "          시주      일주      월주      년주"
    lines.append(header)

    def cell(pp):
        if pp is None:
            return "  --  "
        return f"{pp['hj']}({pp['ko']})"
    si = cell(p["시주"]); di = cell(p["일주"]); mi = cell(p["월주"]); yi = cell(p["년주"])
    lines.append(f"  천간지지  {si:<9}{di:<9}{mi:<9}{yi:<9}")
    lines.append("-" * 52)
    lines.append(f"  일간(나) : {o['일간']['한자']}({o['일간']['천간']}) "
                 f"· {o['일간']['오행']} · {o['일간']['음양']}   /   띠: {o['띠']}")
    ec = o["오행분포"]
    lines.append(f"  오행분포 : 목 {ec['목']} · 화 {ec['화']} · 토 {ec['토']} "
                 f"· 금 {ec['금']} · 수 {ec['수']}")
    lines.append(f"  신강약   : {o['신강약']['판정']} (지지율 {o['신강약']['지지율']})")
    gd = o["십성"]
    god_str = "  ".join(f"{k}={v}" for k, v in gd.items() if v and k != "일간")
    lines.append(f"  십성     : {god_str}")
    jz = o["지장간"]
    jz_str = "  ".join(f"{k}:{''.join(v)}" for k, v in jz.items())
    lines.append(f"  지장간   : {jz_str}")
    if p["시주"] is None:
        lines.append("  ※ 출생 시각 미상 → 시주 제외하고 해석합니다.")
    lines.append("  ※ 자시(23~01시) 경계·일주 전환은 유파에 따라 견해차가 있습니다.")
    lines.append("=" * 52)
    return "\n".join(lines)


# ----------------------------------------------------------------------------
# 자체 검증
# ----------------------------------------------------------------------------
if __name__ == "__main__":
    print(">>> 검증 1: 1901-01-01 일진 = 己卯 여야 함")
    r = calculate_saju(1901, 1, 1, hour=12, minute=0, time_known=False)
    print("   일주:", r["pillars"]["일주"]["hj"], r["pillars"]["일주"]["ko"])
    assert r["pillars"]["일주"]["hj"] == "己卯", "일주 앵커 실패"
    print("   OK")

    print(">>> 검증 2: 80년 주기 — 1981-01-01, 2061-01-01 도 己卯")
    for yy in (1981, 2061):
        rr = calculate_saju(yy, 1, 1, hour=12, time_known=False)
        print(f"   {yy}-01-01 일주:", rr["pillars"]["일주"]["hj"])
        assert rr["pillars"]["일주"]["hj"] == "己卯"
    print("   OK")

    print(">>> 검증 3: 연주 입춘 경계 — 2020-02-03(입춘前)=己亥年, 2020-02-05=庚子年")
    a = calculate_saju(2020, 2, 3, hour=12, time_known=False)
    b = calculate_saju(2020, 2, 5, hour=12, time_known=False)
    print("   2/3 년주:", a["pillars"]["년주"]["hj"], "| 2/5 년주:", b["pillars"]["년주"]["hj"])
    assert a["pillars"]["년주"]["hj"] == "己亥"
    assert b["pillars"]["년주"]["hj"] == "庚子"
    print("   OK")

    print(">>> 검증 4: 샘플 출력")
    s = calculate_saju(1990, 5, 17, hour=14, minute=30, place="서울")
    print(s["report_text"])
