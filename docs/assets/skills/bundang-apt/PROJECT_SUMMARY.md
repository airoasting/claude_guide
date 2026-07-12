# 분당구 아파트 대시보드 — 프로젝트 완전 요약

> **이 문서는 /clear 후에도 컨텍스트를 완전히 복원할 수 있도록 작성된 단일 진실 출처입니다.**  
> 새 세션을 시작하면 CLAUDE.md → 이 문서 순으로 반드시 읽을 것.

---

## 1. 프로젝트 목적

분당구 아파트 실거래가 CSV(국토부 rt.molit.go.kr 수동 다운로드)를 분석하여  
**인터랙티브 HTML 대시보드**를 자동 생성하는 Python 자동화 프로젝트.

페르소나 4개(그린·블루·레드·화이트)가 협업하는 구조로 운영된다.  
최종 산출물: `output/dashboard_YYYY-MM-DD.html` (단일 HTML, 외부 의존 없음)

---

## 2. 폴더 구조 (현재 완성 상태)

```
bundang-project/
├── CLAUDE.md                  ← Claude Code 지시서 (페르소나 정의 포함)
├── PROJECT_SUMMARY.md         ← 이 파일 (세션 간 컨텍스트 유지)
├── requirements.txt
├── scores_override.json       ← 단지별 점수 수동 오버라이드 (선택)
├── .env.example
├── .gitignore
├── data/
│   ├── 아파트(매매)_실거래가_20260614152804.csv  ← 2025.06~2026.06
│   ├── 아파트(매매)_실거래가_20260614191626.csv  ← 2024.06~2025.06
│   └── 아파트(매매)_실거래가_20260614192026.csv  ← 2023.06~2024.06
├── scripts/
│   ├── analyze.py             ← 핵심 분석 로직
│   ├── dashboard.py           ← HTML 대시보드 생성기
│   └── weekly_report.py       ← Gmail 초안 생성
└── output/
    └── dashboard_2026-06-14.html  ← 최신 생성 결과물
```

---

## 3. 실행 방법

```bash
# 대시보드 HTML 생성 (output/ 에 저장)
python scripts/dashboard.py

# 옵션 지정 시
python scripts/dashboard.py --data data/ --output output/ --min-deals 5 --top-n 5

# 분석 결과만 터미널 출력
python scripts/analyze.py

# Gmail 초안 생성 (Gmail API 인증 필요)
python scripts/weekly_report.py
```

---

## 4. 데이터 규격

- **파일명 패턴**: `아파트(매매)_실거래가_*.csv`
- **인코딩**: euc-kr 또는 cp949 (자동 감지)
- **헤더**: 상단 15행 안내문 → `skiprows=15` 또는 `header=15`
- **주요 컬럼**: 시군구, 단지명, 전용면적(㎡), 계약년월, 계약일, 거래금액(만원), 동, 층, 건축년도
- **행정동 추출**: `시군구.split("분당구 ")[-1]` → 13개 동 필터
- **분석 기간**: 전반기 2025.06.15~2025.12.13 / 후반기 2025.12.14~2026.06.14
- **전년 동기비**: 2024.06.15~2025.06.14 vs 2025.06.15~2026.06.14

현재 데이터: **총 15,363건 / 13개 동**

---

## 5. analyze.py — 함수 목록 및 역할

### 상수
```python
PYEONG_FACTOR = 3.3058          # 평당가 변환 인수
BUNDANG_DONGS = [13개 동 목록]  # 분당구 행정동 필터
DONG_BASE_SCORES = { 동별 입지·학군 기준점수 }  # 입지(40점 만점), 학군(15점 만점)
CLUSTER_MAP = { 동 → "판교권"/"구분당"/"외곽" }
```

### 함수 목록

| 함수 | 역할 |
|---|---|
| `load_csv(data_dir)` | data/ 폴더 CSV 전부 읽어 합산 |
| `clean_data(raw)` | 행정동 추출, 금액/면적 파싱, 해제거래 제거 |
| `calc_unit_price(df)` | 평당가 = 거래금액 / (전용면적 / 3.3058) |
| `calc_change_rate(df, group_cols)` | 전반기→후반기 평당가 변동률 (동별 또는 단지별) |
| `select_monthly_highlight(dong_rate, complex_rate)` | 동 평균 대비 편차 최대 단지 (이 달의 거래) |
| `load_score_overrides()` | scores_override.json 로드 |
| `_score_area(sqm)` | 평형/구조 점수 (20점 만점) |
| `_score_reconstruction(build_year)` | 재건축/개발호재 점수 (10점 만점, 노후도 기반) |
| `_score_size(deal_count)` | 단지 규모 점수 (10점 만점, 거래량 프록시) |
| `calc_complex_scores(df, complex_rate, overrides)` | 단지별 종합점수(100점) + **6개 항목 점수 컬럼** 추가 |
| `select_notable(scored, min_deals, top_n)` | 점수당가격 최저 TOP N + 동별 1위 (주목할 단지) |
| `calc_monthly_trend(df)` | 월별 분당구 전체 평당가 추이 |
| `calc_monthly_dong(df)` | **월별 동별 집계** (JS 기간 필터 재계산용, YYYY.MM 형식) |
| `calc_monthly_complex(df, min_total_deals=5)` | **월별 단지별 집계** (JS 기간 필터 재계산용) |
| `calc_reason_tags(dong_rate, df)` | 동별 변동 이유 태그 자동 분석 |
| `calc_yoy_rate(df)` | 전년 동기비 동별 평당가 변동률 |
| `run(data_dir, min_deals, top_n)` | 전체 파이프라인 실행 → dict 반환 |

### calc_complex_scores 출력 컬럼 (중요)

`scored` DataFrame에 다음 컬럼이 추가됨:
- `종합점수` (100점 만점, override 적용 가능)
- `점수_입지` (최대 40)
- `점수_학군` (최대 15)
- `점수_평형` (최대 20)
- `점수_재건축` (최대 10)
- `점수_단지규모` (최대 10)
- `점수_조망` (기본값 3, 최대 5)
- `점수당가격` = 평당가_전체평균 / 종합점수

---

## 6. dashboard.py — 구조 및 DATA JSON

### _build_html(results, report_date) 흐름

1. `results["scored"]`에서 `complex_scores` dict 생성 (단지별 점수 JS 조회용)
2. `monthly_dong`, `monthly_complex`를 results에서 추출
3. 모든 데이터를 `DATA JSON`으로 직렬화
4. `_HTML_TEMPLATE`에 `__DATE__`, `__DATA_JSON__` 치환 후 반환

### DATA JSON 구조

```json
{
  "dongs": [
    {"name": "정자동", "price": 6647, "rate": 29.4, "deals": 1048, "yoy": 24.9}
  ],
  "highlights": [
    {"dong": "정자동", "complex": "단지명", "rate": 21.9, "avg": 29.4, "diff": 8.0, "deals": 5}
  ],
  "notable": [
    {
      "dong": "구미동", "complex": "단지명", "score": 75,
      "price": 2896, "ratio": 38.6, "rate": -8.1,
      "scores": {"입지": 32, "학군": 12, "평형": 13, "재건축": 10, "단지규모": 6, "조망": 3}
    }
  ],
  "monthly": [{"ym": "2025.06", "price": 5200, "count": 800}],
  "reasons": [{"dong": "정자동", "rate": 29.4, "age": 33, "cluster": "구분당", "tags": ["재건축 기대 (33년)", "학군 수요 강세"]}],
  "monthly_dong": [{"ym": "2025.06", "dong": "정자동", "price": 5200, "count": 80}],
  "monthly_complex": [{"ym": "2025.06", "dong": "정자동", "complex": "한솔마을1단지", "price": 5000, "count": 5}],
  "complex_scores": {
    "정자동_한솔마을1단지": {
      "dong": "정자동", "complex": "한솔마을1단지",
      "score": 78,
      "scores": {"입지": 36, "학군": 14, "평형": 13, "재건축": 10, "단지규모": 4, "조망": 3}
    }
  }
}
```

---

## 7. 대시보드 섹션 구성 (최종, 2026-06-14 기준)

### 0. 고정 필터 바 (헤더 아래 sticky)
```
📅 분석 기간 검색  [2025.06 ▾] ~ [2026.06 ▾]  [전체 기간 태그]  [전체 기간 보기]
```
- 선택 변경 시 → `renderAll(startYm, endYm)` 호출 → 아래 모든 섹션 동시 재계산
- `monthly_dong` / `monthly_complex` 데이터를 JS에서 집계하여 재렌더

### 1. 요약 카드 4개 (JS 동적 렌더, id로 갱신)
- `#card-total` 총 거래건수
- `#card-avg` 1평(3.3㎡)당 평균 가격
- `#card-best` 가격 가장 많이 오른 동
- `#card-period` 분석 기간

### 2. 동별 실거래 현황 — 거래량·가격 변동·작년 대비
- **SVG 버블 지도** (`#dong-map`): 13개 동, 버블 크기=거래건수, 색상=변동률
  - 지도 레이아웃: `3fr 2fr` (지도가 더 넓음)
  - 버블 최소 반지름 20px, 최대 56px (이전보다 크게)
  - SVG `width:100%` (max-width 제거)
- **동별 순위 테이블** (`#dong-list`): 1평당 가격·가격변동·작년대비·거래수

### 3. 가격 변동 분석 — 월별 추이 및 동별 변동 이유
- **월별 추이 SVG 차트** (`#trend-chart`): buildTrendChart(s, e) 전역 필터 연동
  - Y축 눈금 3단계, X축 레이블 자동 간격 조정
- **권역별 분위기** (`#cluster-summary`): 판교권·구분당·외곽 3개 카드
- **동별 가격 변동 이유** (`#reason-tags`): 정적 섹션, 필터 무관

### 4. 이 달의 주목 거래 — 같은 동 평균보다 가장 많이 오른/내린 단지
- 테이블 컬럼: 동 / 단지명 / 가격 변동률 / 동 평균 변동률 / 동 평균 대비 차이 / 거래 건수
- 필터 연동: 선택 기간 내 computeHighlights() 재계산

### 5. 주목할 단지 TOP 5 — 가격 대비 가장 저평가된 단지
- 테이블 컬럼: # / 동 / 단지명 / 종합 평가점수 / 1평당 가격 / 저평가 지수 ↓ / 가격 변동률 / **평가 항목별 점수**
- 평가 항목별 점수: 6개 항목을 컬러 게이지 바 + 숫자로 2열 그리드 표시
  - 입지(40, 파란색) / 학군(15, 보라) / 평형(20, 청록) / 재건축(10, 주황) / 단지규모(10, 초록) / 조망(5, 회색)
- 필터 연동: 선택 기간 내 computeNotable() 재계산 (점수는 고정, 가격만 재계산)

### 6. 내 집 마련 예산 계산기
- 슬라이더(5~40억) + 직접 입력
- 결과: 매매가 / 받을 수 있는 대출 / 취득세·등기비 등(1.5%) / 최소 필요한 내 돈
- 기준: 15억 이하 6억 / 15~25억 4억 / 25억 초과 2억

### 7. 부동산 정책 가이드 탭 (6개)
- 청약정책 / 대출·한도 / 세금안내 / 새 아파트 / 전·월세 / 최근동향
- 전문 용어에 쉬운 말 병기 (일반인 대상 워딩)

---

## 8. JS 필터 시스템 (핵심 로직)

### 데이터 흐름
```
[g-start] [g-end] 선택
      ↓
renderAll(s, e)
      ├── computeDongStats(s, e)    → monthly_dong 필터링 → 전반기/후반기 가중평균 → 변동률
      ├── computeComplexStats(s, e) → monthly_complex 필터링 → 단지별 가중평균 → 변동률
      ├── monthly = DATA.monthly 필터링
      ├── renderCards(dongs, monthly)
      ├── renderDongMap(dongs)
      ├── renderDongList(dongs)
      ├── renderHighlight(computeHighlights(dongs, complexes))
      ├── renderNotable(computeNotable(complexes))
      ├── renderCluster(dongs)
      ├── buildTrendChart(s, e)
      └── updateFilterNote(s, e)
```

### 핵심 함수
- `wavg(arr)`: `count` 가중 평균 계산 (`Σ price*count / Σ count`)
- `computeDongStats(s, e)`: 기간 필터 → ym 중간값 기준 전반기/후반기 분할 → 동별 변동률
- `computeComplexStats(s, e)`: 기간 필터 → 단지별 변동률 (최소 3건 이상만)
- `computeHighlights(dongStats, complexStats)`: 동별 편차 최대 단지 추출
- `computeNotable(complexStats, topN)`: `complex_scores` 조인 → ratio 기준 정렬
- `window.resetFilter()`: 전체 기간으로 초기화

### yoy(전년동기비) 처리
- 전년동기비는 전체 기간 기준 고정값 → `DATA.dongs[i].yoy`에서 읽음
- 기간 필터로 재계산되지 않음 (데이터가 2년치 이상 필요하므로)

---

## 9. 단지 점수 기준 (그린 평가 기준)

| 항목 | 만점 | 산정 방식 |
|---|---|---|
| 입지 | 40 | DONG_BASE_SCORES[동] 고정값 (판교권 최고 37, 대장동 최저 27) |
| 평형/구조 | 20 | 전용면적 중위값 기준: 135㎡+ → 18 / 100+ → 17 / 85+ → 16 / 60+ → 13 / ~59 → 10 |
| 학군 | 15 | DONG_BASE_SCORES[동] 고정값 (정자·서현 14, 이매 13, 대장 9) |
| 단지 규모 | 10 | 거래건수 프록시: 150+ → 9 / 80+ → 8 / 40+ → 6 / 20+ → 4 / 10+ → 3 / ~9 → 2 |
| 재건축/개발호재 | 10 | 건축년도 기준 노후도: 35년+ → 10 / 30+ → 8 / 25+ → 6 / 20+ → 4 / 10+ → 2 / ~9 → 0 |
| 동/층/조망 | 5 | 기본값 3점 (개별 거래 데이터로 산정 불가) |

점수 오버라이드: `scores_override.json` → `{"행정동_단지명": {"종합점수": 75}}`

---

## 10. 화이트 평가 현황 (2026-06-14 4차 보완 후)

| 역할 | 점수 | 주요 기능 |
|---|---|---|
| **그린** | ~9.0 ✅ | 6개 항목별 점수 게이지 바, 전년동기비, 월별 추이 |
| **블루** | ~8.5 ✅ | 6개 정책 탭, 일반인 친화적 워딩 |
| **레드** | ~9.0 ✅ | 전체 분석기간 필터, 확대된 버블 지도, 항목별 점수 UI |

→ **3개 모두 8.5+ → 화이트 통합 리포트 조건 충족**

---

## 11. CSS 주요 클래스

```css
.filter-bar   /* 헤더 아래 sticky 필터 바 */
.fsel         /* 필터 select 스타일 */
.filter-tag   /* "전체 기간" 등 상태 태그 */
.filter-reset /* "전체 기간 보기" 버튼 */
.map-layout   /* 동별 지도 레이아웃: grid 3fr 2fr */
.two-col      /* 2열 그리드: 3fr 2fr */
.cards        /* 상단 요약 카드 4열 그리드 */
.panel        /* 각 섹션 카드 */
.badge        /* 변동률 배지 (.up .dn) */
.cluster-card /* 권역별 분위기 카드 */
.reason-row   /* 동별 변동 이유 태그 행 */
.policy-tabs  /* 정책 탭 버튼 그룹 */
```

---

## 12. 향후 작업 아이디어

- **웹 검색 연동**: 그린이 웹 검색으로 최신 시세 동향 텍스트 자동 생성 → "권역별 분위기" 코멘트 자동화
- **Gmail 연동**: `weekly_report.py`에서 대시보드 HTML 파일 첨부 또는 링크 포함
- **분기별 자동 재실행**: Windows 작업 스케줄러 또는 GitHub Actions 연동
- **scores_override.json 확장**: 주요 단지별 수동 점수 보정으로 정확도 향상
- **지도 좌표 세밀화**: 현재 근사 폴리곤 → 실제 행정구역 GeoJSON 적용
