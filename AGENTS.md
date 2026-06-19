# AGENTS.md: AI ROASTING · Claude 완전 정복

이 파일은 이 프로젝트에서 AI가 일할 때 따라야 할 모든 작업 지침을 담는다. 코드 규약, 디자인 시스템, 한국어 작성 원칙, 페이지 인벤토리가 모두 여기에 있다. 변경 이력은 [MEMORY.md](MEMORY.md)에 따로 둔다.

새 규약을 추가하거나 기존 규약을 고칠 때는 이 파일만 수정한다.

## 한 줄 원칙 (글쓰기)

> 자연스러운 한국어로, 주술 구조 맞추어서, 이해하기 쉽게, 번역투 거두어내고 em dash는 절대 쓰지 마.

이 한 줄이 모든 한국어 문장의 뿌리다. 이 문서, 콘텐츠 페이지의 본문, commit 메시지, AI 응답까지 모두 같은 기준으로 쓴다.

---

## 1. 프로젝트 정체성

- **이름**: AI ROASTING · Claude 완전 정복
- **URL**: https://airoasting.github.io/claude_guide/
- **타깃**: 비즈니스 리더와 지식 노동자 (비개발자 포함)
- **포맷**: 단일 폴더 정적 HTML (Vanilla HTML + CSS + 약간의 JS), GitHub Pages 호스팅
- **디자인**: 뉴모피즘(Neumorphism), Pretendard Variable, 오렌지 액센트(`--orange: #D97757`)
- **분류**: Core Asset (계속 키워야 할 대표 자산)

## North Star

진단 → 기본기 → 디자인/플러그인 → 코워크 → 클로드 코드 → 자동화. 이 5단계 학습 동선을 단일 사이트에서 완성한다. 각 페이지는 "다음 행동"이 선명해야 한다.

---

## 2. 페이지 인벤토리 (42개)

`index.html`이 라우팅 허브다. 콘텐츠 페이지는 모두 동일한 구조 골격을 공유한다(header → step-nav → header-pages → sticky sub-menu → container → SM-HAMBURGER).

### 진단 트랙 (header-pages: 2개)
| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `claude-orientation.html` | 5분 | 입문 | 2-menu 기준 페이지. `.hero-inner` 700px + `.header-pages` 70% (=490px) |
| `ai-levels.html` | 5분 | 입문 | 자율주행 1~5단계 비유. 헤더에 별도 배지 없이 h1과 p, header-pages만 있다 |

### 1단계 · 기본기 + 검증 (header-pages: 기본기/검증 2탭 토글, 5개 페이지)
2026-06-19에 1단계를 한 섹션 안 두 묶음으로 재구성했다(5단계 자동화 스타일). 인덱스 1단계 섹션은 `🌱 기본기`(track-label, 3카드: `ai-fluency`·`project-intro`·`multi-persona`) + `🔍 검증`(track-label, 2카드: `ai-sycophancy`·`ai-hallucination`)을 담고, 이 섹션은 진단과 2단계 사이에 둔다. 5개 페이지는 모두 헤더에 `기본기 | 검증` 2탭 토글을 단다(`mode-tabs` + `switchMode(['basic','verify'])`, `pages-basic` 3링크 / `pages-verify` 2링크, `.header-pages` 700px). 기본기 페이지는 `tab-basic` 기본 active, 검증 페이지는 `tab-verify` 기본 active. track-label 배지 색은 `.basic #3a7a5a`·`.verify #B35535`. 검증 2페이지 상세는 아래 `검증 묶음` 표 참고.

| 페이지 | 묶음 | 시간 | 난이도 | 특성 |
|---|---|---|---|---|
| `ai-fluency.html` | 기본기 | 10분 | 입문 | 3-menu 기준 페이지. Anthropic 9,830건 대화 분석. 데스크톱 h1과 모바일 h1이 다르다 (`.t-desktop` / `.t-mobile`) |
| `project-intro.html` | 기본기 | 20분 | 입문 | 프로젝트 셋업, 시스템 프롬프트 |
| `multi-persona.html` | 기본기 | 10분 | 중급 | 5인 페르소나 토론 (5-Color Harness와 연결) |

### 2단계 · 디자인·플러그인 (header-pages: 2개)
| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `chrome-plugin.html` | 10분 | 입문 | 크롬에서 Claude 사용. 2단계 트랙의 첫 페이지이자 로드맵 step-node `2`의 대상 |
| `claude-plugin.html` | 10분 | 입문 | 엑셀, 파워포인트, 워드 3종 플러그인 |

`claude-design.html`(Claude Design)은 2026-06-13에 인덱스 갤러리 카드·전 페이지 로드맵 step-node `2`·갤러리 트랙 내비·multi-persona next 버튼에서 제거하고 `backups/claude-design.html`로 옮겨 git 추적에서 뺐다(`backups/`는 gitignore 대상). 되살리려면 파일을 루트로 되돌린 뒤 step-node `2` 대상(현재 `chrome-plugin.html`), 갤러리 트랙 내비(`eda-gallery`·`component-gallery`·`ui-design`), `index.html` 갤러리 카드, `multi-persona.html` next 카드를 함께 복원한다.

### 3단계 · 클로드 코워크 (header-pages: 2개)
| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `cowork-intro.html` | 10분 | 입문 | 로컬 파일과 Gmail, Calendar, Drive 연결. `.hero-inner` 없음. `.header-pages`에 직접 max-width 490px 적용 |
| `cowork.html` | 과제별 | 중급 | 실전 과제 8가지. `.hero-inner` 없음 동일 처리 |

### 4단계 · 클로드 코드 (header-pages: 노코드 3 + CLI 2 + 비법 1, 3탭 토글)
헤더는 `노코드`/`CLI`/`비법` 세 그룹을 `switchMode`로 토글한다(`pages-nocode` 3링크, `pages-cli` 2링크, `pages-tip` 1링크). `switchMode`는 `['nocode','cli','tip']` 3-way이고 표준 토글 5개 페이지(`claude-code-tasks`·`github-guide`·`checklist`·`cheatsheet`·`claude-code-best-practices`)가 공유한다. `claude-code-best-practices.html`만 `비법` 탭이 기본 active다. `claude-code-101.html`은 예외로, 표준 토글 헤더 대신 `track-toggle-btn` 방식의 커스텀 입구 헤더를 쓴다(`비법` 버튼 포함, `pages-*` 그룹 없음).

| 페이지 | 트랙 | 시간 | 난이도 | 특성 |
|---|---|---|---|---|
| `claude-code-101.html` | 노코드 | 10분 | 입문 | 노코드 트랙 입구. Claude Desktop. 커스텀 헤더(track-toggle-btn) |
| `claude-code-tasks.html` | 노코드 | 과제별 | 중급 | 바이브코딩 7단계 |
| `github-guide.html` | 노코드 | 20분 | 중급 | GitHub과 Vercel 배포 |
| `checklist.html` | CLI | 단계별 | 고급 | CLI 트랙 20단계 체크리스트 |
| `cheatsheet.html` | CLI | 레퍼런스 | 참고 | 슬래시 명령어와 단축키 |
| `claude-code-best-practices.html` | CLI | 15분 | 고급 | 클로드 코드 베스트 프랙티스 9원칙. `cheatsheet.html` 골격 클론. code.claude.com/docs best-practices 한국어판(예시는 개발 코드가 아니라 비즈니스 리더·지식 노동자 사례로 번안: 매출 분석·제안서·대시보드·뉴스 브리핑 등). **헤더 토글이 2탭(노코드·CLI)→3탭(노코드·CLI·비법)으로 확장됨**: 표준 토글 5개 페이지(claude-code-tasks·github·checklist·cheatsheet·이 페이지)에 `id="tab-tip"` `비법` 탭 + `id="pages-tip"` 그룹(이 페이지 링크 1개) 추가, `switchMode`는 `['nocode','cli','tip']` 3-way. claude-code-101은 track-toggle-btn에 `비법` 버튼 추가. 이 페이지는 비법 탭 기본 active. index에서는 4단계 CLI 트랙 **아래**에 `🎓 비법 · 노코드·CLI 공통 원칙` track-label + 풀폭 featured 카드(CLI 트랙은 checklist·cheatsheet 2장). 본문 sub-menu(스크롤스파이) 5섹션(컨텍스트 뿌리 + 3카테고리 + 체크리스트). 본문 9원칙을 3카테고리로 묶는다: `#basics` 기본기(원칙 1~3 검증·탐색계획·구체적지시), `#ops` 환경과 운영(4~6 환경설정·소통·세션관리), `#mastery` 숙련(7~9 자동화확장·실패패턴·직관). 각 카테고리는 `.content-section`(스크롤스파이 단위), 그 안에 `.cat-banner`(오렌지 그라데이션 배너)+`.principle` 9개. 원칙 한 줄은 `.tip`, 본문은 `.nm-card`(산문·Before/After 표 `td.ba-before/.ba-after`·`.code-example`). 끝에 `#checklist` 섹션(9원칙 한 줄 점검, `.bp-check` 체크박스 9개, 진행바, localStorage 키 `ccbp-checklist` 저장) + `.next-links`(하네스·루프 크로스링크). 키보드 `5`→`claude-tools.html` |

### 5단계 · 자동화 (8개)
세 묶음(하네스·도구·루프)으로 나뉜다. 8개 페이지는 헤더에 공통 3단 토글을 달고, sub-menu는 모두 6섹션이다.

| 페이지 | 묶음 | 시간 | 난이도 | 특성 |
|---|---|---|---|---|
| `harness-engineering.html` | 하네스 | 15분 | 고급 | 하네스 6가지 구성 요소 |
| `claude-tools.html` | 하네스 | 20분 | 중급 | 도구 다섯 종류(내장·MCP·커넥터·스킬·플러그인). `harness-workflows.html` 골격 클론. MCP vs 커넥터를 깊게 다룬다. sub-menu 5섹션(도구란·다섯 종류의 도구·MCP와 커넥터·무엇을 고르나·연결하는 법). 다섯 종류는 번호 Pill 가로 5열 |
| `harness-workflows.html` | 하네스 | 15분 | 고급 | 멀티 에이전트 소환. `/goal` 한 줄로 목표를 선언하면 Claude가 에이전트 팀을 직접 설계해 끝까지 실행한다. sub-menu 6섹션(한 세션의 한계·/goal 선언·팀 설계·실전 사례·직접 해보기·FAQ). 본문에는 하네스/다이내믹 워크플로우를 개념어로 유지한다. `harness-engineering.html` 골격 클론 |
| `claude-md-templates.html` | 도구 | 10분 | 중급 | CLAUDE.md 작성법 |
| `skills.html` | 도구 | 20분 | 중급 | 나만의 Skill 만들기 |
| `code-plugin.html` | 도구 | 20분 | 중급 | 스킬·MCP를 플러그인 한 패키지로 묶어 배포 |
| `loop-engineering.html` | 루프 | 14분 | 고급 | 루프 다섯 요소와 클로드 코드 `/loop`. 행동·관찰·조정을 목표에 닿을 때까지 반복 |
| `routines.html` | 루프 | 12분 | 중급 | 정해진 시각에 클라우드에서 무인으로 도는 예약형 에이전트 |

자동화 5단계 8개 페이지는 헤더에 공통 3단 토글(`하네스 · 도구 · 루프`)을 단다. 토글은 `index.html` 자동화 섹션의 3묶음과 1:1로 맞춘다. 묶음·그룹 id·구성은 다음과 같다.

| 토글 탭 | 그룹 id | 링크 (순서 고정) |
|---|---|---|
| 하네스 | `pages-harness` | 하네스 엔지니어링(`harness-engineering.html`) · 도구(`claude-tools.html`) · 멀티 에이전트 소환(`harness-workflows.html`) |
| 도구 | `pages-tool` | CLAUDE.md(`claude-md-templates.html`) · 나만의 Skill 만들기(`skills.html`) · 스킬·MCP 플러그인(`code-plugin.html`) |
| 루프 | `pages-loop` | 루프 엔지니어링(`loop-engineering.html`) · Routines 예약 실행(`routines.html`) |

규칙:
- 토글 순서는 하네스 → 도구 → 루프로 고정한다(index 트랙 순서와 동일).
- 각 페이지는 자기 묶음의 탭을 기본 active로 두고, 해당 그룹만 표시한다(나머지 두 그룹은 `style="display:none;"`).
- 탭은 `<button class="mode-tab" id="tab-{harness|tool|loop}" role="tab">`, `switchMode(mode)`는 `['harness','tool','loop']`를 순회하며 `tab-`/`pages-` 접두사로 토글한다(8개 페이지 공통).
- `.mode-tab`은 `<button>`이라 `border:none; background:none; font-family:inherit` 리셋이 반드시 들어가야 한다(누락 시 브라우저 기본 회색 배경이 보인다).
- 페이지 제목과 내비 라벨은 `멀티 에이전트 소환`이고, 본문 안에서는 `다이내믹 워크플로우`를 하네스 한 벌을 가리키는 개념어로 계속 쓴다.

`agent-design.html`(팀 설계)은 2026-06-08에 인덱스와 전 페이지 내비·링크·키보드 핸들러에서 제거했다. 파일은 `backups/agent-design.html`로 옮겨 git 추적에서 뺐다(`backups/`는 gitignore 대상 로컬 아카이브). 되살리려면 파일을 루트로 되돌린 뒤 `pages-design` 내비, index 자동화 카드, `ai-levels.html` 로드맵, 키보드 `5` 핸들러를 함께 복원한다. 그 자리는 `claude-tools.html`이 대신한다.

### 실전 예제 (골드 액센트, 좌측 보더 `#B8860B`)
인덱스의 실전 예제 섹션은 세 묶음으로 나뉜다. `글 다듬기`(AI 티 없이 사람 글로 만들기, 맨 앞) → `기본 예제`(바로 써먹는 실무 자동화) → `MCP 연결`(외부 도구와 연동하는 워크플로우). `기본 예제`·`MCP 연결` 6개 페이지는 같은 6링크 header-pages 내비를 공유한다(`기본 예제` 3 + `MCP 연결` 3). `글 다듬기`는 인덱스에서 `ai-writing.html` 카드 1개만 둔다(2026-06-18 `ai-sycophancy.html`를 맨 하단 `AI 제대로 검증하기` 섹션으로 옮김). mode-tabs는 없다. 2026-06-18 `ai-sycophancy.html`의 header-pages 짝을 `ai-writing`에서 `ai-hallucination`으로 바꿨다(2링크 `동조 줄이기`·`환각 줄이기`, 490px). 그래서 `ai-writing`의 header-pages는 여전히 `동조 줄이기 → ai-sycophancy`를 갖지만 단방향이다(ai-sycophancy는 ai-writing으로 되돌아가지 않는다. 추후 정리 후보). 기본 예제 그룹은 뉴스 클리핑 → 구글 시트 대시보드 → 책 쓰기 순서로 고정한다.

| 페이지 | 묶음 | 시간 | 난이도 | 특성 |
|---|---|---|---|---|
| `ai-writing.html` | 글 다듬기 | 12분 | 중급 | AI가 쓴 티를 지우는 법. `news-clipping.html` 골격 클론(mode-tabs 제거, header-pages 2링크: 쓴 티 지우기·동조 줄이기 → `ai-sycophancy.html`). sub-menu 8섹션(한눈에·말버릇·교묘한 패턴·장면으로·버릇 차단·사람의 몫·참고자료·다음 행동). AI 한국어 말버릇 8개(번역투·형용사·접속사·문장길이 + 명언공장·보편위로·판단회피·부풀리기), Before/After 표 3개, 금지어 프롬프트 2개(2026-06-18 프롬프트 박스 빈 줄 제거·규칙을 한 줄씩 붙임), 8 대 2 원칙. 2026-06-18 공개 연구 4건 인용: INTRO에 Jones &amp; Bergen(2024, arXiv:2405.08007 튜링 테스트 GPT-4 54%·판단 근거는 문체/정서)·Doshi &amp; Hauser(2024, Science Advances 10.7% 더 비슷=균질화), STEP1에 GPTZero 버스티니스·Kobak 외(2025, Science Advances 과잉어휘 13.5%) tip-box, 끝 `#refs` 참고자료 섹션(ref-link 4개, 영어 연구지만 한국어에도 동일 원리 단서). 워크플로 step의 "당신"은 4.10 따라 "사람/자기"로 교체(예시 인용문 안 "당신"은 유지). 2026-06-19 스타일을 `ai-hallucination.html` idiom으로 정렬: 왼쪽 컬러 띠지 전면 제거(h2·tip-box border-left 삭제 [[no-left-color-bar-cliche]]), 색은 라벨 점(dot ::before 7px)으로 이동(tip-label·inset-label), 카드·박스에 hairline 테두리(`--hairline:#D4CEC4`) 추가, 그림자 토큰을 ai-hallucination 수준으로 약화(2px 소프트), step-badge shimmer 애니메이션 제거(정적 뱃지), h2는 weight 800·#2A2520. 강조색은 페이지 정체성 위해 테라코타(`#B35535`) 유지(ai-hallucination의 본문 주황 `#D97757`은 미적용, 헤더 그라데이션은 두 페이지 동일). [[korean]] 스킬·`multi-persona.html` 크로스링크. 글 다듬기 묶음의 단독 카드(인덱스) |
| `news-clipping.html` | 기본 예제 | 15분 | 중급 | 뉴스 클리핑 자동화. `google-sheets-dashboard.html` 골격 클론. 테마→Tier1 매체→주기→포맷→스킬→루틴 6단계. 철강(steel-brief) 예시로 끝까지 관통. sub-menu 8섹션, STEP5·6은 `skills.html`·`routines.html`로 연결. 기본 예제 그룹의 첫 카드 |
| `google-sheets-dashboard.html` | 기본 예제 | 12분 | 중급 | 골드 액센트 카드 |
| `harness-book.html` | 기본 예제 | 20분 | 고급 | 책쓰기 실전, 자체 sub-menu 최다 |
| `playmcp-kakao.html` | MCP 연결 | 12분 | 중급 | Claude Desktop **왼쪽 사이드바 Customize(사용자 지정)→커넥터→커넥터 둘러보기**에서 `playmcp` 검색→PlayMCP 추가→연결→카카오 로그인→권한 동의(URL 직접 입력·터미널 방식 아님. 진입은 `설정`이 아니라 `Customize(사용자 지정)`). 5단계(도구함·커넥터·첫 테스트·루틴으로 만들기·운영+트러블슈팅, 옛 STEP1 준비 제거). STEP1 도구함에 카카오톡 `+ 도구함에 추가` 다크 카드(노란 TALK 인라인 SVG, max-width 460px) + PlayMCP 공식 링크(skill-preview, INTRO에서 이동). STEP2에 6컷 연결 스크린샷 `assets/kakaotalk.webp`(사용자 제공, 2048px). STEP4 루틴(id `step-routine`)은 7시 57분 Routines 예약(첫 테스트에서 분리). STEP5는 운영 기준 카드+트러블슈팅 FAQ 카드 2장 병합(옛 `#faq` 구분선·앵커 제거). 나와의 채팅방 전송 + Routines 매일 7시 57분 응원(정각 회피=예약 지연 최대 30분). 면책 박스는 `주의 사항`(좌측 컬러 띠지 제거, [[no-left-color-bar-cliche]]). 참고자료는 PlayMCP·카카오 발표 2개만(Anthropic·MCP 링크 삭제). 주의: sub-menu/roadmap 표시 번호 1~4지만 섹션 id는 `step2`~`step5` 유지(앵커 깨짐 방지) |
| `korean-law-mcp.html` | MCP 연결 | 10분 | 중급 | Claude Desktop Customize 커넥터 추가. 법제처 Open API |
| `stock-messenger.html` | MCP 연결 | 15분 | 고급 | 기업 공시 데이터 분석. DART 스킬 + 텔레그램 봇 |

### AI 백과사전 (header-pages: 3개)
| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `file-types.html` | 필요할 때 | 참고 | 파일 8종 비교. AI가 읽고 쓰는 관점으로 재편한 리더 우선(reader-first) 카탈로그. 본문에서 "당신" 금지 (4.10) |
| `license-compare.html` | 필요할 때 | 참고 | 오픈소스 라이선스 5종. 상단에 제약 수위 신호등 모델(초록 MIT·Apache / 노랑 LGPL / 빨강 GPL·AGPL). sub-menu 5섹션(신호등·비교표·허용적·카피레프트·선택 가이드) |
| `glossary.html` | 필요할 때 | 참고 | AI 용어 사전 68선(6막 구성). 6막 하네스·운영에 `피지컬 AI` 추가 |

2026-06-13에 `security-guide.html`을 백과사전에서 빼서 아래 `보안·법률` 섹션으로 옮겼다. 그래서 백과사전은 3-menu(700px)로 내렸다. 같은 날 섹션 이름을 `하네스 엔지니어링 백과사전`에서 `AI 백과사전`으로 바꿨다. 2026-06-18에 인덱스에서 `디자인·시각화 갤러리` 섹션을 `AI 백과사전` 섹션 위로 올렸다. 2026-06-19에 인덱스 `AI 제대로 검증하기` 섹션을 1단계 안 검증 묶음으로 옮기고, `AI 백과사전`을 맨 하단으로 내렸다(하단 순서: 후기 → 쇼케이스 → 갤러리 → 보안·법률 → AI 백과사전).

### 보안·법률 (header-pages: 2개)
2026-06-18에 `ai-hallucination.html`을 추가하면서 트랙이 한때 3-menu(700px)로 올라갔다가, 2026-06-19에 다시 2-menu(490px)로 정리됐다. 현재 `security-guide`·`ai-basic-law` 두 페이지가 2링크 내비(`보안 가이드`·`인공지능기본법`, 490px)를 공유한다. `ai-hallucination`은 1단계 검증 묶음으로 옮겨 `기본기 | 검증` 토글을 쓰므로, 보안·법률 두 페이지 내비에서 `환각 줄이기` 링크를 빼 단방향 참조를 없앴다.

| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `ai-hallucination.html` | 필요할 때 | 참고 | AI 환각을 벗어나는 법. `ai-basic-law.html` 골격 클론. 사건 케이스(빅4 가짜 각주: EY 27개 중 16개·KPMG 45개 중 5개 정확·법정 판례 1,450건+, GPTZero 조사)를 거울 삼아 실전 검증법으로 전개. sub-menu 7섹션(한눈에·무슨 일이·왜 생기나·벗어나는 법·Claude로·점검표·참고자료). 환각 4유형 overview 표, case-ledger 3건(kind-fail·kind-spread 신규), 원인 2층(모델·조직), 5가지 습관(topic-card+예시), Claude 연결(웹검색·검증프롬프트·`multi-persona.html`·`claude-tools.html`·`harness-workflows.html` 크로스링크), 납품 전 check-list 8개. 끝 CTA는 `security-guide.html`로 크로스링크. 공개 보도 기반 참고 자료임 명시 |
| `security-guide.html` | 필요할 때 | 참고 | 비개발자용 AI 협업 보안. overview 표 + 5섹션 + 판례. sub-menu 7개. 끝 CTA는 `ai-basic-law.html`로 크로스링크 |
| `ai-basic-law.html` | 필요할 때 | 참고 | 인공지능기본법 안내. 히스토리 타임라인 + 주요국 비교 + 의무 주체 3분류 + 5대 의무 표 + 고영향 카드 하단 법 제2조 제4호 원문(가~차) 블록 + FAQ 17문 + 자가점검·참고자료(지원데스크 + 사례집 직접 링크 2개). sub-menu 7개. `security-guide.html` 골격 클론. 끝 CTA는 `security-guide.html`로 크로스링크. 출처는 과기정통부·KOSA 지원데스크 사례집과 가이드라인. 유권해석 아닌 참고 자료임을 본문에 명시 |

### 검증 묶음 (1단계 안 `🔍 검증` track-label, 카드 배지 색 `#B35535`)
2026-06-18 신설(옛 인덱스 맨 하단 `AI 제대로 검증하기` 섹션). 2026-06-19에 1단계 안 두 번째 묶음(`🔍 검증`)으로 흡수했다. `AI가 그럴듯하게 동의하거나 지어낼 때, 답을 그대로 믿지 않고 검증하는 법`이라는 한 주제로 동조와 환각을 묶었다. 인덱스 카드 2장은 평범한 `.card`(왼쪽 띠지 없음, 시간·난이도 배지 있음: 동조 8분 입문 / 환각 12분 중급)다. 두 페이지 모두 헤더에 `기본기 | 검증` 토글을 달고 `tab-verify` 기본 active다.

| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `ai-sycophancy.html` | 8분 | 입문 | AI의 동조(sycophancy)를 줄이는 법(옛 `ai-skepticism.html`, 2026-06-18 개명·전면 재작성). `news-clipping` 골격 클론. 2026-06-19 헤더를 `기본기 | 검증` 2탭 토글로 교체(pages-basic 3링크 / pages-verify 2링크, 700px, `tab-verify` 기본 active). 공개 연구 5건 인용(Anthropic 2310.13548 · DeepMind 2308.03958 · SycEval 2502.08177 · ELEPHANT 2505.13995 · OpenAI GPT-4o 2025.4 롤백). sub-menu 6섹션(한눈에·동조란·왜 생기나·줄이는 법·점검표·참고자료. STEP4 `Claude로` 크로스링크 섹션은 2026-06-18 삭제). 동조 두 유형(진보/퇴행·사회적), 원인(RLHF·스케일·단기 피드백), 줄이는 법 5(결론 숨기기·비판 허락·점수·"다시"·역할 분리), 점검표 5(키워드+한 줄·경어), 참고자료 ref-link 5(읽는 법 박스 삭제). SycEval 수치(58.19%·퇴행 14.66%·지속 78.5%)를 본문에 인용. 왼쪽 띠지(h2·tip-box border-left) 제거 [[no-left-color-bar-cliche]] |
| `ai-hallucination.html` | 12분 | 중급 | 본문 상세는 위 `보안·법률` 표 행 참고. 2026-06-19 헤더를 `기본기 | 검증` 토글로 교체(`tab-verify` 기본 active)하고 보안·법률 트랙에서 검증 묶음으로 옮겼다. 인덱스 카드도 1단계 검증 묶음에 둔다 |

### 디자인·시각화 갤러리 (header-pages: 3개)
| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `eda-gallery.html` | 참고 | 참고 | EDA 차트 갤러리 21종 |
| `component-gallery.html` | 참고 | 참고 | UI 컴포넌트 40종 |
| `ui-design.html` | 참고 | 참고 | UI 디자인 트렌드 30종 |

### 수강생 쇼케이스 (header-pages: 2개)
| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `showcase.html` | 참고 | 참고 | 수강생 결과물 모음. 9개 스탑워치 iframe 라이브 임베드, 3유형 분류. 헤더에 `시로 쓴 자화상`·`스탑워치 쇼케이스` 2개 토글(아이콘 없는 텍스트 링크) |
| `showcase-poems.html` | 참고 | 참고 | 멀티 페르소나 실습으로 완성한 시 23편 모음(`AI 시대, 일하는 사람들의 하루`). `showcase.html`과 같은 2개 토글로 연동. CTA는 `multi-persona.html`로 크로스링크 |

---

## 3. 디자인 시스템과 코딩 규약

### 3.1 콘텐츠 영역 사이즈 (`.container`)

모든 콘텐츠 페이지(33개)는 공통 규격을 따른다 (commit 97f4331에서 29개 통일, 이후 증가).

```css
.container {
    max-width: 1080px;
    margin: 0 auto;
    padding: 32px 32px 80px;
}
```

원칙:
- 데스크톱 시각적 폭 상한은 1080px이다. 더 넓게 쓰지 않는다.
- 좌우 패딩 32px과 하단 80px은 고정값이다. 페이지별로 임의 조정하지 않는다.
- 본문 내부의 카드, 표, 이미지, 코드블록은 이 `.container` 안에서 100% 폭을 기본으로 한다.
- 갤러리와 다단 그리드도 `.container`를 넘어가지 않는다. 필요하면 내부에서 padding을 0으로 둔다.
- 본문 폰트 크기와 줄간격은 페이지별로 다르게 잡지 않고 사이트 공통 토큰을 따른다.

### 3.2 헤더 메뉴 폭 (`.header-pages`, `.header-page-link`)

원칙: 메뉴 개수별로 기준 페이지를 하나 정하고, 같은 개수의 모든 페이지는 그 폭에 정렬한다.

**아이콘 단일 출처 원칙**: 서브 메뉴 링크(`.header-page-link` 안 `.hpl-icon`)의 아이콘은 `index.html`의 해당 페이지 카드 아이콘(`.card-icon`)과 항상 같아야 한다. 정답은 언제나 `index.html`이다. 어떤 페이지의 아이콘을 바꾸려면 `index.html` 카드 아이콘을 먼저 고치고, 그 페이지를 가리키는 모든 서브 메뉴의 `.hpl-icon`을 같은 값으로 맞춘다. 한 페이지를 여러 곳에서 링크하므로 한 군데만 고치면 어긋난다. `href` 기준으로 `index.html` 카드 아이콘 → 전 페이지 `.hpl-icon`을 치환하는 방식으로 일괄 동기화할 수 있다(멱등).

| 메뉴 수 | 기준 페이지 | `.header-pages` max-width | 각 버튼 폭 | 총합 |
|---|---|---|---|---|
| 2개 | `claude-orientation.html` | 490px | 약 238px | 490px |
| 3개 | `ai-fluency.html`, 백과사전 트랙(`file-types`·`license-compare`·`glossary`), 보안·법률 트랙(`ai-hallucination`·`security-guide`·`ai-basic-law`) | 700px | 약 224px | 700px |
| 4개 | 실전 예제 트랙 공통 | 940px | 약 217px | 940px |
| 5개 | 미정 | 미정 | 미정 | 미정 |
| 7개 | 미정 | 미정 | 미정 | 미정 |
| 9개 | 미정 | 미정 | 미정 | 미정 |

버튼(`.header-page-link`) 공통 토큰:
```css
.header-page-link {
    flex: 1 1 0;
    min-width: 0;
    max-width: 280px;
    padding: 12px 22px;
    border-radius: 16px;
    font-size: 14px;
    font-weight: 700;
    gap: 8px;
    white-space: nowrap;
    color: rgba(255,255,255,0.7);
    background: rgba(255,255,255,0.07);
    box-shadow: 5px 5px 12px rgba(0,0,0,0.35), -5px -5px 12px rgba(255,255,255,0.06);
}
.header-page-link.active {
    background: rgba(255,255,255,0.14);
    box-shadow: inset 3px 3px 8px rgba(0,0,0,0.35), inset -3px -3px 8px rgba(255,255,255,0.06);
    color: #fff;
}
```

컨테이너(`.header-pages`) 공통:
```css
.header-pages {
    margin: 22px auto 0;
    display: flex;
    justify-content: center;
    gap: 14px;
    position: relative;
    z-index: 1;
}
```

`.hero-inner` 유무에 따른 폭 적용:
- `.hero-inner` (max-width: 700px)가 있는 페이지는 `.header-pages`에 `max-width: 100%` (상위 700px 상속) 또는 비율(`70%` 등)을 써도 된다.
- `.hero-inner`가 없는 페이지(`cowork-intro.html`, `cowork.html` 같은 경우)는 `.header-pages`에 직접 절대값(`700px` 또는 `490px`)을 적용한다. 비율(`70%`)을 쓰면 헤더 전체 폭의 70%가 되어 다른 페이지와 어긋난다.

금지 사항:
- 페이지별 임의 폭(`70%`, `64%`, `960px` 같은 값)을 그대로 두지 않는다.
- 버튼별 `min-width: 130~200px` 같은 잔여 값으로 균등 분배를 깨뜨리지 않는다.
- `gap`은 `14px`로 고정한다.

### 3.3 모바일 햄버거 메뉴

원칙: 햄버거는 사이트 공통의 단일 패턴이다. 페이지별로 다르게 만들지 않는다.

적용 범위:
- 33개 콘텐츠 페이지 전부에 동일한 코드가 들어 있다.
- 마커 주석으로 구역을 명확히 한다. `<!-- ## SM-HAMBURGER START ## -->`와 `<!-- ## SM-HAMBURGER END ## -->` 사이만 수정하거나 교체한다.

브레이크포인트와 동작 전환:
- 데스크톱(`>768px`)에서는 상단 sticky `nav.sub-menu`가 보이고 햄버거 버튼은 숨겨진다.
- 모바일(`≤768px`)에서는 다음이 동시에 일어난다.
  - `nav.sub-menu { display: none !important; }` (가로 sub-menu 숨김)
  - `.sm-menu-toggle { display: inline-flex; }` (우상단 햄버거 버튼 노출)
  - `.header-pages`가 세로 스택으로 바뀐다.

세로 스택 변형:
```css
.header-pages {
    flex-direction: column !important;
    max-width: 100% !important;
    gap: 8px !important;
    align-items: stretch !important;
}
.header-page-link {
    flex: none !important;
    max-width: none !important;
    width: 100% !important;
    white-space: normal !important;
    word-break: keep-all !important;
    font-size: 13px !important;
    padding: 11px 14px !important;
    border-radius: 12px !important;
}
```

햄버거 UI 구성:

| 요소 | 역할 | 핵심 스펙 |
|---|---|---|
| `.sm-menu-toggle` | 토글 버튼 | `position: fixed; top: 14px; right: 14px; 44×44; border-radius: 12px;` 흐림 효과 배경, z-index 1200 |
| `.sm-menu-backdrop` | 배경 오버레이 | 전체 화면, `rgba(0,0,0,0.45)`, z-index 1150 |
| `.sm-drawer` | 우측 드로어 | `width: 78%; max-width: 320px;` 100dvh, 우측에서 슬라이드 인 (`transform: translateX`), z-index 1160 |
| `.sm-drawer-heading` | 현재 페이지 제목 | active `.header-page-link` 텍스트 (아이콘 제거) > `h1` > `document.title` 순서로 자동 채운다 |
| `.sm-drawer-back` | "← 목록으로" | 항상 `index.html`로 이동한다 |
| `.sm-drawer-list` | 섹션 메뉴 | `nav.sub-menu`의 `<a>`를 JS가 복제해 `.sm-drawer-item`으로 렌더한다 |
| `.sm-drawer-item` | 한 줄 항목 | `.sm-drawer-num` (원형 번호), `.sm-drawer-title`, 그리고 있으면 `.sm-drawer-sub` |

JS 동작 (단일 IIFE, 외부 의존 없음):
1. `nav.sub-menu`의 모든 `<a>`를 `.sm-drawer-list`에 1:1로 복제한다 (번호, 제목, 서브타이틀 유지).
2. 드로어 항목을 클릭하면 드로어가 자동으로 닫힌다.
3. `body.sm-menu-open` 클래스로 상태를 토글한다 (`overflow: hidden` 동반).
4. 닫기 트리거는 세 가지다. 토글 버튼, 배경(backdrop), ESC 키.
5. MutationObserver로 `nav.sub-menu`의 active 변경을 드로어에 동기화한다 (스크롤 스파이 대응).
6. 접근성을 위해 `aria-label`("메뉴 열기/닫기")과 `aria-expanded`를 토글한다.

유지보수 규칙:
- 햄버거 블록은 사이트 공통 자산이다. 한 페이지에서 수정하면 전 페이지에 동일하게 반영해야 한다.
- 페이지가 `nav.sub-menu`를 가지지 않으면(일부 레퍼런스 페이지) 드로어 리스트가 비어 보일 수 있다. 그 페이지에서도 sub-menu 골격은 유지하는 것을 권장한다.
- 드로어 폭(320px), 버튼 위치(top 14, right 14), 브레이크포인트(768px)는 변경하지 않는다. 바꾸려면 30개 전체를 일괄 수정해야 한다.

### 3.4 중간 분기 (`≤1160px`, 비-모바일 축소)
- `.header-page-link`의 폰트는 12px, padding은 8px 14px, border-radius는 12px로 줄어든다.
- `flex: 1 1 0` 균등 분배는 유지된다 (햄버거로 전환되지 않는다).

### 3.5 색상 토큰
- 메인 컬러: `--orange: #D97757`
- 헤더 그라데이션: `linear-gradient(150deg, #B35535, #A04828, #7A2E15)`
- 실전 예제 골드: `#B8860B` (좌측 보더 3px, index 카드 한정)

---

## 4. 한국어 작성 원칙

이 프로젝트의 모든 한국어 글은 다음 규칙을 지킨다. 콘텐츠 페이지의 본문, 카드 설명, 헤더 문구, 운영 문서, commit 메시지, AI 응답 모두 같다.

### 4.1 em dash 절대 금지

`—` 기호는 어디에도 쓰지 않는다. 본문, 표 안, 주석, 제목, 어디에서도 등장하지 않는다.

대체 수단:
- 두 생각이 이어지면 마침표로 끊고 새 문장으로 쓴다.
- 부연 설명이면 괄호나 콜론을 쓴다.
- 표의 빈 칸은 그냥 비우거나 '없음', '미정'으로 적는다.

예시:
- 잘못된 표기: 햄버거 메뉴는 공통 자산 (`—` 사용) 한 페이지만 수정 금지.
- 올바른 표기: 햄버거 메뉴는 공통 자산이다. 한 페이지만 수정하면 안 된다.

### 4.2 주술 구조 맞추기

주어와 서술어가 같은 격으로 끝나야 한다. 주어가 멀어지면 문장을 끊는다.

- 잘못된 표기: 이 페이지의 목적은 사용자가 빠르게 따라할 수 있도록 만든다.
- 올바른 표기: 이 페이지의 목적은 사용자가 빠르게 따라가게 만드는 것이다.

### 4.3 번역투 거두기

| 번역투 | 자연스러운 표기 |
|---|---|
| ~을/를 통해 | ~으로, ~을 써서 |
| ~에 대해서 | ~에 관해, ~을 |
| ~로 인해 | ~ 때문에 |
| ~에 위치한 | ~에 있는 |
| ~을 제공한다 | ~을 준다, ~을 보여준다 |
| ~이 가능하다 | ~을 할 수 있다 |
| ~이 요구된다 | ~이 필요하다 |
| ~의 경우 | ~일 때, ~이면 |
| ~한 것이 아니라 | ~이 아니라 |
| 보다 빠른 | 더 빠른 |
| 다음과 같이 | 다음처럼 |
| 함에 있어 | 할 때 |
| 이를 통해 | 이것으로, 이걸 써서 |
| 부분에 있어서는 | ~ 부분은 |
| ~에 다름 아니다 | ~이다 |
| 매우 중요한 역할을 한다 | 핵심이다, 결정적이다 |
| ~라고 할 수 있다 | ~이다 |

### 4.4 자기해설 금지

글이 자기 자신을 설명하지 않는다.

- 잘못된 표기: 이 섹션에서는 헤더 메뉴의 구성 방식을 설명합니다.
- 올바른 표기: 헤더 메뉴는 다음 구성을 따른다.

### 4.5 과장 어휘 절제

다음 단어는 정말 그럴 때만 쓴다.

혁신적, 획기적, 완벽한, 강력한, 손쉽게, 누구나, 단 한 번에, 게임 체인저.

대신 관찰과 근거로 쓴다. "혁신적인 도구" 대신 "9,830건 대화를 분석해 만든 도구"라고 쓴다.

### 4.6 영어 병기 최소화

한국어로 잘 통하는 단어 옆에 굳이 영어를 붙이지 않는다. 다만 코드 식별자, 라이브러리 이름, 기술 용어(CSS, HTML, flex, padding 같은 것)는 그대로 둔다.

- 잘못된 표기: 사용자(user)는 카드(card)를 클릭(click)할 수 있습니다.
- 올바른 표기: 사용자는 카드를 클릭할 수 있다.

### 4.7 종결체 통일

한 문서 안에서 종결체를 섞지 않는다.

- 운영 문서(AGENTS.md, MEMORY.md, README의 일부)는 평어("~다", "~한다")로 쓴다.
- 사용자에게 보여주는 콘텐츠 본문은 경어("~합니다", "~입니다")로 쓴다.
- 한 페이지 안에서 평어와 경어를 섞지 않는다.

### 4.8 AI 마무리 명언 금지

문단 끝에 일반화된 격언이나 다짐을 붙이지 않는다.

- 잘못된 표기: 결국 좋은 글은 독자를 향한 배려에서 나온다.
- 올바른 표기: (그냥 끝낸다.)

### 4.9 글의 흐름

- 두 문장이 이어지면 접속사 없이도 자연스러운지 살핀다.
- "그리고", "하지만", "따라서"를 남발하지 않는다.
- 한 문단에는 한 주제만 담는다.
- 표나 목록으로 분해할 수 있으면 분해한다.
- 한 문장이 두 줄을 넘으면 잘라본다.

### 4.10 2인칭 호칭 "당신" 절대 금지

콘텐츠 본문에서 독자를 "당신"으로 부르지 않는다. 번역투로 들리고 거리감을 준다. 독자를 직접 부르는 대신 행위나 대상 중심으로 문장을 쓴다.

- 잘못된 표기: 당신이 직접 여는 파일은 2개뿐입니다.
- 올바른 표기: 직접 여는 파일은 2개뿐입니다. / 사용자가 직접 여는 파일은 2개입니다.

### 4.11 마지막 점검

글을 마치기 전에 스스로 묻는다.

1. em dash가 한 개라도 남아 있는가.
2. 주어와 서술어가 어긋난 문장이 있는가.
3. 번역투 표현이 남아 있는가.
4. 같은 문서에서 평어와 경어가 섞였는가.
5. 자기해설 문장이 있는가.
6. 끝에 군더더기 다짐이나 격언이 붙어 있는가.
7. "당신" 같은 2인칭 호칭이 본문에 남아 있는가.

하나라도 해당하면 그 자리에서 고친다.

---

## 5. Working Rules (사용자 명령 누적 정책)

### Rule 1. 사이즈 통일은 메뉴 개수별 기준 페이지를 따른다
- 3-menu는 `ai-fluency.html`을 기준으로 한다.
- 2-menu는 `claude-orientation.html`을 기준으로 한다.
- 새 메뉴 카운트(5, 7, 9)는 별도 기준 페이지를 정의하기 전까지 손대지 않는다.

### Rule 2. 헤더에서 중복되는 배지는 제거한다
- 예시: `ai-levels.html`의 "5단계로 진단 · 10분 소요"는 본문과 index 메타데이터로 충분해서 헤더에서 뺐다.
- 새 페이지를 만들 때 `header-badge`는 본문이 강하게 요구할 때만 쓴다.

### Rule 3. 기존 디자인 토큰을 깨지 않는다
- 폰트, 색, 뉴모피즘 그림자는 페이지 간 일관성을 유지한다.
- 페이지별 특수 액센트는 실전 예제 골드 보더 같은 명시적 신호일 때만 허용한다.

### Rule 4. 변경은 데스크톱과 모바일 모두 확인하고 보고한다
- `≤1160px` 분기와 모바일(`≤768px`) 분기에 같은 변경이 필요할 수 있다.
- 데스크톱만 수정하고 끝내지 않는다.
- 모바일 분기에서는 `.header-pages` 세로 스택과 `nav.sub-menu` 숨김(햄버거 대체)이 함께 동작하는지 확인한다.

### Rule 5. 사이트 공통 블록은 일괄 수정한다
- 햄버거 메뉴(SM-HAMBURGER START~END), `.container` 폭, 헤더 메뉴 토큰처럼 전 페이지가 공유하는 구성 요소는 한 페이지만 손대지 않는다.
- 부득이 단일 페이지에만 적용해야 하면 사유를 [MEMORY.md](MEMORY.md)에 기록한다.

### Rule 6. 운영 문서는 AGENTS.md 한 곳에서 관리한다
- 코드 규약, 디자인 시스템, 한국어 작성 원칙, 페이지 인벤토리는 모두 이 파일에 있다.
- 새 규약은 이 파일에 추가하고, 변경 이력은 MEMORY.md에 남긴다.

---

## 6. 버전 관리

GitHub 첫 커밋은 2026-02-24에 올렸다. 모든 릴리스는 [README.md](README.md)의 "버전 히스토리" 섹션에 기록한다.

### 6.1 버전 번호 규칙 (semver)

`MAJOR.MINOR.PATCH` 형식을 따른다.

- **메이저 (앞 숫자)**: 사이트 전체 표준화나 큰 방향 전환. 예: v1.0.0 (운영 문서 체계 정착과 헤더 메뉴 통일).
- **마이너 (가운데 숫자)**: 새 페이지 추가, 새 기능 도입, 큰 디자인 변경.
- **패치 (끝 숫자)**: 작은 수정, 문구 정리, 부분 보강.

### 6.2 언제 버전을 올리는가

- 기본 리듬은 **매주 일요일**이다. 그 주(월~일)에 들어온 commit을 묶어 일요일 날짜로 한 버전을 부여한다.
- 활동이 없는 주는 건너뛴다. 버전 번호도 한 단계 비워 둔다(예: v0.3.0 → 건너뛰는 주 → v0.5.0).
- 메이저 버전(앞 숫자) 부여는 사용자가 선언한다. AI가 임의로 메이저로 올리지 않는다.
- 한 commit이 한 버전과 1:1로 일치할 필요는 없다. 한 주간 단위로 묶는다.

### 6.3 릴리스 노트 형식

README.md의 버전 히스토리는 단일 표로 정리한다. 각 행은 다음 네 칸으로 구성된다.

| 칸 | 내용 |
|---|---|
| 버전 | `vX.Y.Z` 형식. semver를 따른다 (6.1 참고). |
| 날짜 (일) | 그 주의 일요일 날짜. `YYYY-MM-DD` 형식. |
| 부제 | 그 주의 큰 주제를 2~5단어로 잡는다. 예: '표준화', '모바일 햄버거 + 첫 진입점 리뉴얼'. |
| 핵심 변경 | 의도와 영향 중심으로 쉼표로 묶어 한 셀에 정리한다. 신규 페이지나 파일은 백틱으로 표시한다 (예: ``stock-messenger.html``). |

규칙:
- 표 위에 첫 commit 날짜와 매주 일요일 리듬을 짧게 설명하는 도입 문단을 둔다.
- 표 위에 버전 규칙 3종(메이저·마이너·패치) 설명을 글머리표로 둔다.
- 표 안에서는 동작 중심 서술("~를 통일했습니다")이 아니라 명사구로 압축한다 ("본문 폭 1080px 통일").
- 문체는 도입 문단까지 경어로 통일한다. 표 셀은 명사구라 종결체가 따로 없다.
- 표가 길어져도 별도 헤딩이나 메이저 도입 문단을 더하지 않는다. 표 하나가 곧 히스토리다.

### 6.4 어디에 기록하는가

- [README.md](README.md): 공식 릴리스 노트. 사용자가 보는 버전 히스토리.
- [MEMORY.md](MEMORY.md): 세션별 작업 로그. 버전이 부여되지 않은 중간 작업도 여기에 남는다.
- commit 메시지: `vX.Y.Z: 부제 (핵심 변경)` 형식을 쓰면 git 이력과 README 버전이 맞아 들어간다.

### 6.5 commit 메시지 규칙

- 릴리스 commit: 첫 줄에 버전과 부제를 적고, 본문에 변경 항목을 짧은 글머리표로 나열한다.
- 일반 commit: 변경 대상 파일이나 영역으로 시작해 무엇을 했는지 한 줄로 적는다 (예: `ai-fluency.html 모바일 사이즈를 다른 페이지와 동일하게 정렬`).
- 한국어로 쓰되 4절의 한국어 작성 원칙을 그대로 지킨다.

---

## 7. Anti-Patterns

- `.container` 폭을 1080px 외의 값으로 바꾸지 않는다.
- 페이지마다 `.header-pages max-width`를 임의 값(70%, 64%, 960px 같은 값)으로 두지 않는다. 메뉴 개수별 기준 폭으로 통일한다.
- `.hero-inner` 유무를 확인하지 않고 폭을 비율(`70%`)로 두지 않는다. 헤더 풀폭의 70%가 되어 다른 페이지와 어긋난다.
- 햄버거 메뉴 블록(SM-HAMBURGER START~END)을 한 페이지만 수정하고 나머지를 그대로 두지 않는다. 이 블록은 사이트 공통 자산이다.
- 햄버거 드로어 폭, 위치, 브레이크포인트(320px, top14·right14, 768px)를 페이지별로 다르게 두지 않는다.
- 모바일에서 `.header-pages`를 가로로 유지하려고 `flex-direction: column`을 깨지 않는다.
- 본문 메타데이터로 알 수 있는 정보를 헤더 배지에 중복으로 노출하지 않는다.
- 새 페이지를 만들 때 기존 골격(`header → step-nav → header-pages → sticky sub-menu → container → SM-HAMBURGER`)을 따르지 않는 일이 없도록 한다.

---

## 8. Default Output Pattern

페이지 수정 요청을 받으면 다음 순서로 답한다.

1. 변경 대상 파일 목록과 분류 (기준 페이지인지, 통일 대상인지).
2. 변경 전과 후의 CSS 핵심 값을 비교한 표.
3. 데스크톱과 모바일에 미치는 영향 범위.
4. 다음 액션 (commit 여부 등).
