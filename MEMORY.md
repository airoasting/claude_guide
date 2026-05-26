# MEMORY.md: 변경 로그와 표준화 상태

이 파일은 페이지별 변경 이력과 표준화 진행 상황을 기록한다. 모든 작업 지침(코드 규약, 디자인 시스템, 한국어 작성 원칙, 페이지 인벤토리)은 [AGENTS.md](AGENTS.md)에 있다. 이 문서의 모든 문장도 AGENTS.md의 한국어 작성 원칙을 지킨다.

---

## 최근 세션 변경 로그

### 2026-05-26

| # | 명령 | 범위 | 결과 |
|---|---|---|---|
| 1 | 실전 예제에 한국 법령 검색 MCP 페이지 신규 추가 | `korean-law-mcp.html`, `index.html` | Claude Desktop Customize 메뉴에서 커스텀 커넥터 등록 흐름, 법제처 OC 키 발급, 환각 검증·영향 그래프·단계별 안내 활용까지 5단계. 인덱스 실전 예제 카드 2x2 그리드로 재배치 |
| 2 | 4-menu 헤더 표준 정의 | `google-sheets-dashboard.html`, `stock-messenger.html`, `harness-book.html` | `.header-pages` max-width 940px + flex-wrap. 세 페이지 모두 4번째 링크 추가 |
| 3 | wf-step 연결선 동적 높이로 변경 | `korean-law-mcp.html` | 고정 18px `.wf-connector` div 대신 `.wf-step::before` 가상요소가 단계 높이에 맞춰 자동으로 늘어나도록 수정. 이미지가 포함된 단계에서도 선이 끊기지 않음 |
| 4 | 페이지 인벤토리 갱신 | `AGENTS.md` 2절 | 실전 예제 4페이지 체제로 업데이트 |

### 2026-05-17

| # | 명령 | 범위 | 결과 |
|---|---|---|---|
| 1 | 3-menu 페이지를 `ai-fluency.html`과 동일하게 통일 | 11개 파일 | `.header-pages` max-width 700px, 버튼 폭 약 224px로 정렬 |
| 2 | 2-menu 페이지를 `claude-orientation.html`과 동일하게 통일 | 3개 파일 | `.header-pages` max-width 490px, 버튼 폭 약 238px로 정렬 |
| 3 | `ai-levels.html` 헤더 배지 "5단계로 진단 · 10분 소요" 제거 | 1개 파일 | h1·hero-sub·header-pages만 남김 |
| 4 | 운영 문서 체계 정착 | `AGENTS.md`, `CLAUDE.md`, `MEMORY.md` | 모든 작업 지침을 AGENTS.md 한 곳으로 통합, CLAUDE.md는 진입점 8줄로 축소 |
| 5 | 한국어 작성 원칙 8가지 명문화 | `AGENTS.md` 4절 | em dash 금지, 주술 구조, 번역투 거두기, 자기해설 금지, 과장 어휘 절제, 영어 병기 최소화, 종결체 통일, AI 마무리 명언 금지 |
| 6 | `README.md`에 버전 히스토리 섹션 추가 | `README.md` | 첫 commit(2026-02-24)부터 v1.0.0까지 19개 버전 정리. 메이저는 앞 숫자, 마이너는 가운데, 패치는 끝 숫자 |

#### 세부: 3-menu 통일 (Rule 1)
변경된 파일과 핵심 diff:

| 파일 | 변경 전 → 후 |
|---|---|
| `chrome-plugin.html` | max-width 70% → 700px, min-width:130px 제거 |
| `claude-design.html` | max-width 70% → 700px, min-width:130px 제거 |
| `claude-plugin.html` | max-width 70% → 700px, min-width:130px 제거 |
| `component-gallery.html` | max-width 70% + width 64% → 700px, gap 12→14, padding 20→22 |
| `eda-gallery.html` | max-width 80% + width 76% → 700px, gap 10→14, padding 16→22 |
| `file-types.html` | max-width 70% + width 64% → 700px, gap 12→14, padding 16→22 |
| `glossary.html` | max-width 70% + width 64% → 700px, gap 12→14 |
| `google-sheets-dashboard.html` | max-width 960px → 700px, 버튼 max-width 320→280 |
| `license-compare.html` | max-width 70% + width 64% → 700px, gap 12→14 |
| `stock-messenger.html` | max-width 70% + 960px 중복 → 700px, 버튼 max-width 320→280 |
| `ui-design.html` | max-width 70% + width 64% → 700px, gap 12→14, padding 20→22 |

이미 기준에 부합하던 파일 (변경 없음): `project-intro.html`, `multi-persona.html`.

#### 세부: 2-menu 통일 (Rule 1)

| 파일 | 변경 전 → 후 |
|---|---|
| `ai-levels.html` | margin-top 20→22 (폭은 이미 동일) |
| `cowork-intro.html` | max-width 70% → 490px, min-width:150px 제거 |
| `cowork.html` | max-width 70% → 490px, min-width:150px 제거 |

### 이전 commit (참고)
- `02e1329`: `claude-design.html` '공식 갤러리에서 실제 예시 보기' 버튼 제거
- `97f4331`: 콘텐츠 페이지 29개 `.container` 폭 1080px로 통일
- `d324245`: `ai-fluency.html` 모바일 사이즈 정렬
- `3b5e9fd`: index 카드 타이틀 단축 되돌리기
- `7c7079c`: 모바일 카드/h1 타이틀 단축

---

## 표준화 상태

### 헤더 메뉴 폭 (메뉴 개수별)

| 메뉴 수 | 기준 페이지 | 통일 완료 | 상태 |
|---|---|---|---|
| 2개 | `claude-orientation.html` | `ai-levels.html`, `cowork-intro.html`, `cowork.html` | ✅ 4/4 |
| 3개 | `ai-fluency.html` | 13개 페이지 전체 | ✅ 13/13 |
| 5개 | 미정 | 없음 | ⏸ 미착수 |
| 7개 | 미정 | 없음 | ⏸ 미착수 |
| 9개 | 미정 | 없음 | ⏸ 미착수 |

### 컨테이너 폭 (`.container`)
- ✅ 29개 페이지 모두 `max-width: 1080px; padding: 32px 32px 80px;` (commit 97f4331)

### 모바일 햄버거 메뉴 (SM-HAMBURGER)
- ✅ 29개 페이지 모두 동일 블록 적용 (`<!-- ## SM-HAMBURGER START ## --> ~ END`)
- 브레이크포인트 768px, 드로어 320px, 토글 top14·right14 (29개 페이지 모두 공통)
- JS가 `nav.sub-menu` 링크를 자동 복제 → 페이지마다 별도 작업 불필요
- ⏸ 일부 갤러리/레퍼런스 페이지가 `nav.sub-menu` 자체를 가지지 않을 경우 드로어가 비는지 점검 필요

### 헤더 배지 (Rule 2)
- ✅ `ai-levels.html` 제거 완료
- ⏸ 다른 페이지 동일 패턴 점검 미실시

---

## 페이지별 특이사항

| 페이지 | 특이사항 |
|---|---|
| `ai-fluency.html` | 3-menu 기준. h1이 `.t-desktop`/`.t-mobile`로 분리 |
| `ai-levels.html` | header-badge 제거됨. `.hero-inner` 존재 |
| `claude-orientation.html` | 2-menu 기준. `.hero-inner` 존재 |
| `cowork-intro.html`, `cowork.html` | `.hero-inner` **없음** → `.header-pages`에 직접 절대 max-width 적용 |
| `claude-design.html` | "공식 갤러리에서 실제 예시 보기" 버튼 의도적 제거 (재추가 금지) |
| `google-sheets-dashboard.html`, `stock-messenger.html`, `harness-book.html` | 실전 예제 카드. index에서 골드 액센트(`#B8860B` left-border)로 표시한다 |

---

## 다음 액션 (Open Items)

1. 현재 세션 변경 분 commit 여부 결정 (사용자 컨펌 필요)
2. 5-menu / 7-menu / 9-menu 페이지의 헤더 폭 기준 페이지 선정 여부
3. 다른 페이지에서 헤더 배지 중복 노출 있는지 점검 (Rule 2 일관 적용)
4. 모바일 분기(`≤1160px`, `≤768px`)가 페이지마다 다르다. 통일이 필요한지 검토.
