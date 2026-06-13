# MEMORY.md: 변경 로그와 표준화 상태

이 파일은 페이지별 변경 이력과 표준화 진행 상황을 기록한다. 모든 작업 지침(코드 규약, 디자인 시스템, 한국어 작성 원칙, 페이지 인벤토리)은 [AGENTS.md](AGENTS.md)에 있다. 이 문서의 모든 문장도 AGENTS.md의 한국어 작성 원칙을 지킨다.

---

## 최근 세션 변경 로그

### 2026-06-13

| # | 명령 | 범위 | 결과 |
|---|---|---|---|
| 4 | `claude-design.html`(Claude Design) 인덱스 카드 제거 + `backups/`로 아카이브 (agent-design 선례 동일) | `index.html` 외 25개 파일, `AGENTS.md` | 사용자 요청("이 카드 빼고 파일은 backups로"). 사이트 전반 참조 27곳을 재연결한 뒤 파일 이동. ① 인덱스 디자인·시각화 갤러리 카드 삭제(4→3, 3-col) ② 로드맵 step-node `2` 대상 22개 파일 `claude-design.html`→`chrome-plugin.html`(2단계 트랙 첫 페이지) ③ 갤러리 트랙 내비에서 `클로드 디자인` 링크 제거(`eda-gallery`·`component-gallery`·`ui-design`, 4→3 메뉴, 700px 유지) ④ `multi-persona.html` next 카드를 `2단계: 크롬에서 Claude 사용`/`chrome-plugin.html`로 교체. 파일은 `git rm --cached` 후 `backups/claude-design.html`로 이동(gitignore 대상). 잔여 참조 0건, 인덱스 갤러리 3카드·step-node·내비 DOM 검증, 콘솔 에러 0. 인벤토리 33→32 |
| 3 | `security-guide.html`를 백과사전에서 분리해 `보안·법률` 섹션 신설 + `ai-basic-law.html`(인공지능기본법 안내) 신규 추가 | `ai-basic-law.html`(신규), `index.html`, `security-guide.html`, `file-types.html`, `license-compare.html`, `glossary.html`, `AGENTS.md` | 사용자 요청 2건("보안 카드 별도 분리" + "보안 법률 섹션 만들고 AI 기본법 FAQ 페이지 추가"). 인덱스에서 보안 카드를 백과사전에서 빼 `보안·법률` 섹션(참고 배지 #888)을 신설하고 카드 2개(`security-guide`·`ai-basic-law`)를 배치, 백과사전은 카드 3개(3-col)로 축소. 네비 그룹 재편(Rule 5·AGENTS 3.2): 백과사전 3개는 3-menu(940px→700px), 보안·법률 2개는 2-menu(490px). `ai-basic-law.html`은 `security-guide.html` 골격 클론(헤더 영상·sub-menu·SM-HAMBURGER·스크립트 그대로). 내용은 과기정통부·KOSA 지원데스크 사례집(20선)과 고영향·투명성 가이드라인 첨부 PDF에서 추출. 7섹션(한눈에 5대 의무+핵심사실 스탯 / 법의 탄생 타임라인·주요국 비교 / 핵심 개념 의무주체 3분류·고영향 / FAQ 누가의무 4문 / FAQ 표시의무 7문 / FAQ 고영향·운영 6문 / 자가점검·참고자료). FAQ 17문, `case-ledger` 재사용 타임라인 3개, 유권해석 아닌 참고 자료임 본문 명시. em dash 0, 콘솔 에러 0. 네비 폭·카드 수·링크를 DOM으로 검증(이 프리뷰 스크린샷은 상단만 캡처되어 inspect/eval로 확인) |
| 2 | `security-guide.html` Section 1(입력 보안·자격증명)에 GitHub 인증키 유출 실제 사고 추가 | `security-guide.html` | 사용자 요청("github에 인증키 박아서 사고 난 사례"). 새 리스크가 아니라 자격증명 카드가 다루는 위험의 실증이라 5대 리스크 표는 그대로 두고 Section 1 안에 배치. 기존 `case-ledger`/`case-entry` 컴포넌트 재사용, 사고용 라벨 `.kind-leak`(배경 `--c-input` #e74c3c) 1개 신설. 사례 2건(우버 2016: 비공개 GitHub 저장소의 AWS 키로 5,700만 명 유출·10만 달러 입막음·1.48억 달러 합의·CSO 형사 유죄 / 토요타 2022: T-Connect 소스 코드 GitHub 공개 5년·접속 키 노출·고객 29.6만 명 이메일), 출처 링크 FTC·BleepingComputer. 마무리 claude-tip에 봇 스캔 메커니즘 + `github-guide.html` 링크. em dash 0, 배지색·링크·렌더 검증 |
| 1 | 5단계 자동화 헤더 토글을 `스킬/실전` 2단에서 `하네스/도구/루프` 3단으로 전환 (Rule 5) | `harness-engineering.html`, `claude-tools.html`, `harness-workflows.html`, `claude-md-templates.html`, `skills.html`, `code-plugin.html`, `loop-engineering.html`, `routines.html` | 8개 페이지 공통. 기존 2단 토글(`tab-skill`/`tab-design`, `pages-skill`/`pages-design`)을 3단(`tab-harness`/`tab-tool`/`tab-loop`, `pages-harness`/`pages-tool`/`pages-loop`)으로 재배치. 묶음은 `index.html` 자동화 3트랙과 1:1: 하네스(하네스 엔지니어링·도구·멀티 에이전트 소환), 도구(CLAUDE.md·나만의 Skill·스킬·MCP 플러그인), 루프(루프 엔지니어링·Routines). 루프 2개 페이지는 토글이 아예 없던 상태라 토글+나머지 두 그룹을 새로 주입. `switchMode`를 `['harness','tool','loop']` 제네릭으로 통일하고, span 기반이던 3개 페이지(skills·code-plugin·claude-md-templates)는 `<button>`으로 바꾸며 `.mode-tab`에 `border:none; background:none; font-family:inherit` 리셋 추가(누락 시 회색 기본 배경 노출되던 버그 수정). 데스크톱·모바일(375px) 검증, 콘솔 에러 0 |

### 2026-06-11

| # | 명령 | 범위 | 결과 |
|---|---|---|---|
| 1 | `harness-workflows.html`를 `lge/harness-workflows.html` 기반으로 전면 교체 + 제목 변경 | `harness-workflows.html` | 페이지 주제를 `다이내믹 워크플로우`(단일 컨텍스트 3대 실패 + 6패턴)에서 `멀티 에이전트 소환`(`/goal` 한 줄로 에이전트 팀 소환)으로 바꿈. lge 버전을 베이스로 복사한 뒤 LG 브랜딩을 공개판으로 환원: 크림슨 팔레트(`#A50034`·`#C8123E`·`#7A0026`·`rgba(165,0,52,*)`·`#9C3A4F`·`#C97A8C`·`#E0708A`)를 오렌지 팔레트(`#D97757`·`#C4623F`·`#7A2E15`·`rgba(217,119,87,*)`·`#A0532E`·`#D49479`·`#E0997F`)로 치환, 헤더 그라데이션을 사이트 표준 `#B35535/#A04828/#7A2E15`로 복구, step-nav을 lge 3단계에서 공개판 5단계 로드맵으로 교체, 푸터를 lge 로고·뉴스레터형에서 형제 페이지 공통 `가이드 소개·라이선스` 모달형으로 교체, og/twitter·`/goal` 예시 문구의 `LG전자 최고경영자`를 `비즈니스 리더`로 변경. sub-menu 6섹션(한 세션의 한계·/goal 선언·팀 설계·실전 사례·직접 해보기·FAQ). 데스크톱·모바일(햄버거 드로어) 검증 완료, 콘솔 에러 0 |
| 2 | 내비 라벨 `다이내믹 워크플로우` → `멀티 에이전트 소환` 일괄 반영 (Rule 5) | `harness-engineering.html`, `claude-tools.html`, `claude-md-templates.html`, `code-plugin.html`, `skills.html`, `index.html`, `ai-levels.html`, `AGENTS.md` | `pages-design` 그룹 내비 라벨, 크로스링크(`「멀티 에이전트 소환」 장`)·CTA·인덱스 카드(아이콘 🔀 유지, 설명을 `/goal`·에이전트 팀 문구로 교체)·ai-levels 로드맵 항목 제목을 모두 갱신. 본문 안 개념어 `다이내믹 워크플로우`(하네스 한 벌)는 의도적으로 유지. AGENTS 인벤토리·`pages-design` 라벨·순서 설명 갱신 |

### 2026-06-08

| # | 명령 | 범위 | 결과 |
|---|---|---|---|
| 1 | 다이내믹 워크플로우 페이지 신규 추가 | `harness-workflows.html`, `index.html` | Anthropic 블로그 "A harness for every task: dynamic workflows in Claude Code" 기반. `harness-engineering.html` 골격을 클론해 CSS·햄버거·스크립트를 그대로 쓰고 메타·헤더·서브메뉴·본문만 교체. 4섹션(개념·왜 필요한가·6가지 패턴·실전 사용법). 단일 컨텍스트 3대 실패(게으름·자기편향·목표표류)와 6패턴(분류후실행·펼치고합치기·적대적검증·생성후거르기·토너먼트·끝까지반복) 정리. 인덱스 자동화 트랙 실전 묶음을 2열에서 3열로 바꾸고 `하네스 엔지니어링 실전 가이드` 카드 추가 |
| 2 | 자동화 실전(design) 헤더 내비를 3-menu로 확장 | `harness-engineering.html`, `harness-workflows.html`, `agent-design.html`, `claude-md-templates.html`, `code-plugin.html`, `skills.html` | `pages-design` 그룹에 `다이내믹 워크플로우` 링크(🔀) 추가. 6개 파일 모두 `하네스 엔지니어링 · 다이내믹 워크플로우 · 팀 설계` 3링크로 통일 |
| 3 | 개념 영역 10점 개선 (BLACK·PINK·GOLD 5-Color 진단 반영) | `harness-workflows.html` 개념 섹션 | "무슨 의미인지 애매" 피드백 해소. 상단에 `한 문장으로` 정의 박스 추가, 하네스를 페이지 안에서 정의(타 페이지 의존 제거), `보통의 사용 vs 다이내믹 워크플로우` 대비표 신설, 비유1을 맞춤 공구함에서 프로젝트 매니저로 교체(본질=팀 분담에 정렬), `agent()` 등 함수명을 큰 제목에서 회색 작은 주석으로 강등하고 평어 제목으로 교체, `용어 정리`로 하네스·워크플로우 관계 명시 |
| 4 | 6패턴 섹션에 원본 도식을 인라인 SVG로 재현 | `harness-workflows.html` 6가지 패턴 섹션 | 기존 단순 flow-diagram(작업분해→병렬→검증→합성)을 Anthropic "Six Workflow Patterns" 도식 그대로 재현한 인라인 SVG로 교체. 6카드(Classify-And-Act·Fanout-And-Synthesize·Adversarial Verification·Generate-And-Filter·Tournament·Loop Until Done), 주황 강조 경로·점선 discarded·양방향 검증 화살표 포함. 좁은 화면 가로 스크롤(min-width 840px), figcaption에 출처 표기 |
| 5 | 도구(Tools) 페이지 신규 추가 | `claude-tools.html`, `index.html`, `ai-levels.html` | "Claude에게 손발을 붙이는 다섯 갈래" 허브 레퍼런스. `harness-workflows.html` 골격 클론(CSS·햄버거·스크립트 그대로, 메타·헤더·서브메뉴·본문만 교체). 브레인스토밍으로 하이브리드 성격 확정(5갈래 개념 지도 + MCP vs 커넥터만 깊게). 6섹션(도구란·5갈래 지도·MCP와 커넥터·무엇을 고르나·연결하는 법·보안과 다음). 5갈래=내장도구·MCP·커넥터·스킬·플러그인, 각 카드는 기존 실전 페이지로 링크(중복 회피). 5갈래는 가로 5열 `.tool-map-grid`로 한 줄에 나열하고 각 카드 좌상단에 번호 Pill(1~5)을 둬 순서를 또렷하게 드러냈다(≤768px 2열, ≤460px 1열). 인덱스 자동화 실전 카드를 `하네스 엔지니어링 → 도구 → 다이내믹 워크플로우` 순서로 재배치, `ai-levels.html` 로드맵 3단계를 도구로 교체 |
| 6 | `agent-design.html`(팀 설계) 인덱스·전 페이지 링크 제거 | `index.html` 외 18개 파일 | 파일은 보존, 어디서도 링크하지 않는 아카이브 후보로 전환. `pages-design` 내비(harness-engineering·harness-workflows·claude-md-templates·code-plugin·skills 5개)에서 `팀 설계` 자리를 `도구`로 교체하고 순서를 하네스 엔지니어링·도구·다이내믹 워크플로우로 고정. 키보드 `5` 핸들러 14개 파일을 `claude-tools.html`로 리디렉트. CTA·next-layer 링크(harness-engineering·harness-workflows·code-plugin·skills·claude-md-templates)도 도구로 교체. 전수 검증: agent-design 잔여 참조 0 |
| 7 | `harness-workflows.html` 실전 예시 추가 + 호출 설명 정밀화 (5-Color @all 반영) | `harness-workflows.html` | 6패턴 섹션 끝에 `한 작업이 실제로 도는 모습` 카드 신설(경쟁사 40곳 조사 예시 4단계, 단계별 패턴 태그, "코드 작업도 똑같다" 팁). `어떻게 부르나`를 opt-in·토큰 과금·명시 신호 기준으로 정밀화 |
| 8 | `harness-workflows.html` 개념·왜 필요한가를 `개념` 한 섹션으로 통합 + 비유 제거 | `harness-workflows.html` | sec1(개념)과 sec2(왜 필요한가)를 하나의 `개념` 섹션으로 합침. 프로젝트 매니저·주문형 생산 라인 비유(cluster-box) 삭제. 개념 섹션 카드 순서: 정의 → 보통의 사용과 다른 점 → 일을 나누는 네 가지 방식 → 왜 굳이 나누나(단일 컨텍스트 3대 실패). 서브메뉴 4개에서 3개로(개념·6가지 패턴·실전 사용법), 섹션 id·번호 sec1~sec3로 재정렬 |
| 9 | 6패턴 도식과 설명을 패턴별 한 박스로 통합 (BLACK·PINK·GOLD 5-Color 반영) | `harness-workflows.html` 6가지 패턴 섹션 | 큰 통합 SVG 1개 + 별도 설명 카드 6개의 중복을 제거. `.pat-grid` 2열에 패턴별 카드 6개를 두고 각 카드 안에 [번호 배지 + 한국어 제목(영어 병기) + 미니 도식(인셋 박스) + 언제 + 설명]을 함께 담음. 도식 라벨을 한국어(영어) 병기로 전환(과제·분류기·종합·작업자·검증자·생성기·후보안·필터·채택·폐기·결승·최종·에이전트·완료 등). 마커·`.wf-*` 스타일을 섹션 상단 공용 `<style>`+숨김 `<svg><defs>`로 이전. 토너먼트 상단 라벨 겹침·반복 카드 긴 라벨 보정 |
| 10 | 개념 섹션 가시성 개선: 최상위 카드 7개 → 3개로 통합 | `harness-workflows.html` 개념 섹션 | "카드가 너무 많이 나누어져 가시성 저하" 피드백. 최상위 그림자 카드 7개(정의·대비·방식·왜·출처·역할그리드·핵심메시지)를 3카드(무엇/어떻게/왜)로 통합. 무엇=정의+한 문장+대비, 어떻게=네 가지 방식+용어, 왜=실패 3종+핵심 메시지+출처. h2를 무엇/어떻게/왜로 통일해 시선 닻 부여 |
| 11 | 평면 하어라인 시안 폐기, 뉴모피즘 컴포넌트로 복구 | `harness-workflows.html` 개념 섹션 | 10번에서 시도한 평면(하어라인 표·구분선 리스트) 디자인이 사이트 뉴모피즘 톤과 안 맞고 대비가 약해 "더 안 보임" 피드백. 3카드 구조는 유지하되 내부를 사이트 기본 raised 컴포넌트로 환원(대비=`compare-grid`, 네 가지 방식=`comp-grid`, 실패 3종=`role-grid`, 한 문장=`highlight-box`, 핵심=`key-message`, 용어=`tip-box`). 가시성·일관성 회복 |
| 12 | `claude-tools.html` 마감 + `agent-design.html` 아카이브 | `claude-tools.html`, `README.md`, `assets/about-modal.js`, `backups/` | 다섯 종류 카드를 번호 Pill 가로 5열 `.tool-map-grid`로 재배치, 서브에이전트 언급 전부 제거, 라벨 `5갈래 지도`→`다섯 종류의 도구`, 연결법 카드 3개를 `.comp-grid.cols-3` 한 줄로, `보안과 다음` 섹션(sec6)과 서브메뉴 항목 삭제(5섹션). README·소개 모달 CHANGELOG v1.5.0(2026-06-07) 부제를 `보안 가이드 · 하네스 엔지니어링 개념 설명 업데이트`로 갱신. `agent-design.html`을 `backups/`로 옮겨 git 추적 제외 |
| 13 | md 문서 현행화 (agent-design 아카이브 반영) | `README.md`, `AGENTS.md` | README `실전. AI 에이전트 설계` 목록에서 `팀 설계`(agent-design 링크) 행을 빼고 `하네스 엔지니어링 · Claude의 도구 · 다이내믹 워크플로우` 3행으로 교체. AGENTS 페이지 인벤토리 카운트 31→32(claude-tools·harness-workflows 추가, agent-design 아카이브 반영). MEMORY 과거 로그와 commit 연계 표준화 수치(29개 등)는 기록이라 보존 |

### 2026-06-07

| # | 명령 | 범위 | 결과 |
|---|---|---|---|
| 1 | 보안 가이드 페이지 신규 추가 | `security-guide.html`, `index.html` | 비개발자용 AI 협업 보안 가이드. overview 표(5대 리스크) + 5섹션(입력·데이터학습·연결·실행권한·사고대응) + 30초 체크리스트. file-types 골격 클론, sub-menu 6개. 인덱스 백과사전 섹션에 4번째 카드 추가. 카드 그리드를 3열에서 2열로 바꿔 2x2로 배치(카드 가로 폭 확대) |
| 2 | 백과사전 트랙을 4-menu로 확장 | `file-types.html`, `license-compare.html`, `glossary.html`, `security-guide.html` | `.header-pages` max-width 700px → 940px(기존 4-menu 표준과 정렬). 네 페이지 모두 `보안 가이드` 링크 추가. 용어 사전 라벨을 `용어 사전 46선`/`용어 사전 60선`에서 `용어 사전`으로 통일 |
| 3 | 페이지 인벤토리·4-menu 폭 표준 명문화 | `AGENTS.md` 2절·3.2절 | 백과사전 트랙 4개로 갱신, 3.2 폭 표에 4개 행(940px) 추가 |
| 4 | 푸터 `가이드 소개`를 페이지 내 팝업으로 전환 | 콘텐츠 31개 파일 | 기존엔 `index.html?about=1`로 이동했으나, 각 페이지에 가이드 소개 모달(스타일·마크업·자체 스크립트)을 `</body>` 직전 `<!-- ABOUT-MODAL-INJECTED -->` 블록으로 주입. 푸터 링크를 `data-about-open`·`data-license-open` 트리거로 교체해 그 자리에서 모달만 띄움. 모달 CTA는 `index.html#section-1`로 연결. `?about=1`/`?license=1` 쿼리 진입도 호환. 푸터에 해당 링크가 없는 `google-sheets-dashboard.html`은 대상 제외 |

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
