# AGENTS.md: AI ROASTING · AI 에이전트를 고용하라

이 파일은 이 프로젝트에서 AI가 일할 때 따라야 할 모든 작업 지침을 담는다. 코드 규약, 디자인 시스템, 한국어 작성 원칙, 페이지 인벤토리가 모두 여기에 있다. 변경 이력은 [MEMORY.md](MEMORY.md)에 따로 둔다.

새 규약을 추가하거나 기존 규약을 고칠 때는 이 파일만 수정한다.

## 한 줄 원칙 (글쓰기)

> 자연스러운 한국어로, 주술 구조 맞추어서, 이해하기 쉽게, 번역투 거두어내고 em dash는 절대 쓰지 마.

**금지 표현.** `갈립니다`·`갈리는`·`갈린다`·`가르는` 계열은 절대 쓰지 않는다(사용자가 두 번 지적). `A와 B는 X에서 갈립니다` → `A와 B의 차이는 X입니다`. `내가 마련한 자리` 같은 멋부린 추상 표현도 금지한다. `헷갈리다`는 다른 말이라 해당 없다.

`물려`(A를 B에 물려)와 `흐름`도 쓰지 않는다(2026-07-26 지적). `법제처 API에 물려` → `법제처 API에 연결해`, `실습 흐름` → `실습 단계`, `슬라이드 흐름` → `슬라이드 순서`, `하나의 흐름으로 잇는` → `하나로 잇는`. 문장에서 그냥 빼도 뜻이 남는 경우가 많으니 먼저 삭제를 시도한다.

`갈래`는 절대 쓰지 않는다(2026-07-26 기록, 2026-08-04 재지적). 앞의 `가르다` 계열 금지의 연장이다. 세는 말이면 `가지`·`종류`·`둘`·`셋`으로, 묶음이면 `묶음`·`분야`로, 그 밖에는 `방식`·`답`으로 바꾼다. `다섯 갈래` → `다섯 가지`, `두 갈래로 나눴습니다` → `둘로 나눴습니다`, `네 갈래로 검색합니다` → `네 분야로 검색합니다`, `또 다른 갈래입니다` → `또 다른 방식입니다`, `여러 갈래 가운데 하나` → `여러 답 가운데 하나`. **본문뿐 아니라 CSS 주석, 소개 모달의 업데이트 내역, commit 메시지에도 쓰지 않는다.** 2026-08-04에 본문 페이지 12곳과 `about-modal.js`를 정리했다. 남은 곳은 손대지 않는 자산뿐이다(`cases/lge/` 납품본, `assets/stopwatch/` 수강생 작품, `assets/skills/*/sample.html` 스킬 산출물).

`재다` 계열도 쓰지 않는다(2026-08-26 지적). `재기`·`재야 합니다`·`재고`·`잽니다`는 전부 `측정`으로 바꾼다. `줄이기 전에 재야 합니다` → `줄이기 전에 측정해야 합니다`, 섹션명 `먼저 재기` → `먼저 측정`. 길이나 양을 확인하는 뜻이면 예외 없이 `측정하다`를 쓴다. `헤아리다`·`세다`도 대체어로 쓰지 않는다.

`다시 짜다`·`새로 짜다`·`새로 깔다` 같은 비유형 동사도 쓰지 않는다(2026-07-26 지적). 한 일을 그대로 말하는 동사를 쓴다. `표를 다시 짰습니다` → `표를 업데이트했습니다`, `페이지를 새로 깔았습니다` → `페이지를 신설했습니다`, `더했습니다` → `추가했습니다`. 변경 로그는 `업데이트·추가·신설·정리·교체`로 적는다.

이 한 줄이 모든 한국어 문장의 뿌리다. 이 문서, 콘텐츠 페이지의 본문, commit 메시지, AI 응답까지 모두 같은 기준으로 쓴다.

---

## 1. 프로젝트 정체성

- **이름**: AI ROASTING · AI 에이전트를 고용하라 (2026-08-02 개칭, 이전 이름 `모두의 Claude 완전 정복`·`비즈니스 리더를 위한 Claude 완전 정복`)
- **표지 3단 구성** (2026-08-12): 세 줄이 각각 다른 일을 한다. 늘려야 할 말이 생기면 제목을 늘리지 말고 해당 단에 넣는다
  1. 대제목 `AI 에이전트를 고용하라`. 주장을 맡는다. `.ct-main`은 `white-space: nowrap`이고 `5.4vw`는 이 13자에 맞춘 값이다. 1440px에서 판면(`.cover-mid`) 691px을 정확히 채운다. 제목을 바꾸면 폭을 다시 재고 `vw`를 고쳐야 한다
  2. 부제 윗단 `비즈니스 리더를 위한 Claude·ChatGPT 완전 정복`. 대상과 범위를 맡는다. `.cover-sub`, 데스크톱 25px 600, 모바일 16.5px
  3. 부제 아랫단 `프롬프트에서 하네스·루프까지, 대화를 실행으로 바꾸는 5단계`. 방법과 구조를 맡는다. `.cover-sub2`, **테두리 알약**, 데스크톱 16px 500 한 줄, 모바일 13px 두 줄
- **아랫단은 검은 투명 알약으로 감싼다.** 세 단이 모두 가운데 정렬한 흰 글씨라 크기 차이만으로는 한 문단처럼 붙어 읽힌다. 형태가 달라져야 갈라진다.

  ```css
  border-radius: 100px;
  background: rgba(0,0,0,0.20);
  ```

  **여기서 시험했다가 버린 것 넷.** 같은 길을 다시 걷지 않도록 적어 둔다.

  | 시도 | 버린 이유 |
  |---|---|
  | 채운 알약 | 표지에 실제 단추가 하나도 없어 혼자 단추로 보인다. 눌러도 반응이 없어 오해가 된다 |
  | 볼록 뉴모피즘 | 튀어나온 형태는 누르라는 신호라 위와 같은 문제가 더 세다 |
  | 크림색 뉴모피즘 | 화면에서 가장 밝은 덩어리가 되어 제목보다 먼저 눈에 들어온다. 3단 위계가 뒤집힌다 |
  | 눌림 뉴모피즘(inset) | 안팎 그림자가 두 겹 들어가 글자 주변이 뭉개진다. 표지는 인쇄된 자켓이라 입체 그림자 자체가 겉돈다 |

  **고정 색 대신 검은 투명을 쓴다.** 표지 배경이 그라디언트라 고정 색은 한 지점에서만 맞고 나머지에서 뜬다. 검은 투명은 어느 자리에서도 그 자리 색을 그대로 따라간다.

  **0.20인 이유.** 0.07은 알약 형태가 거의 안 보이고(표지와 1.12:1), 0.26부터는 단추처럼 무거워진다. 0.20이면 형태는 분명하면서 제목과 다투지 않는다(1.37:1). 데스크톱 432×46px 한 줄, 모바일 217×62px 두 줄이다. 알약 폭이 부제 윗단(504px)보다 좁아야 위계가 유지된다.

- **부제 두 단의 글자 대비 하한.** 윗단 0.93, 아랫단 0.92를 쓴다. 아랫단이 민무늬였을 때는 한 단 물러서게 0.84까지 내렸지만, 알약이 영역을 나눠 주므로 글자까지 흐릴 이유가 없어 0.92로 올렸다. 눌린 알약 안쪽 색은 `rgb(153,70,40)`이고 흰 0.92 글자의 대비는 5.72:1이다. 부제2 자리의 실제 배경(`.hero` 그라디언트에서 뽑은 값)은 `rgb(163,74,42)`이고 알파별 대비는 아래와 같다. 16px 500은 large text가 아니라 3:1 완화를 못 받는다.

  | 알파 | 대비 | AA(4.5:1) |
  |---|---|---|
  | 0.93 | 5.32:1 | 통과 |
  | 0.88 | 4.95:1 | 통과 |
  | 0.84 | 4.66:1 | 통과 (민무늬일 때의 하한) |
  | 0.80 | 4.38:1 | 미달 |

  색을 더 바꾸려면 눈대중 대신 그 자리 배경을 다시 뽑아 계산한다. 배경이 그라디언트라 위치마다 값이 다르다.

- **구분선(`.cover-sub2::before`)은 폐기했다.** 두 단을 갈라 주는 일을 알약 테두리가 대신한다. 선과 알약을 같이 쓰면 경계가 둘이 되어 번잡하다.

- **데스크톱은 아래 정렬, 모바일은 위아래 고정에 가운데가 늘어나는 방식이다.** 두 화면의 제약이 달라 같은 규칙을 쓸 수 없다.

  **데스크톱**은 `.cover-mid { justify-content: flex-end }`. 세로 여유가 넉넉해 아래로 붙여도 제목이 위와 부딪히지 않는다. 1440x900에서 이름 위 81px, 소속에서 마스코트까지 34px.

  **모바일은 아래 정렬을 쓰면 안 된다.** 아래로만 붙이면 제목 위 여백이 화면 높이에 그대로 비례한다. 실측하면 600px 화면에서 햄버거 단추와 10px까지 붙고 812px에서는 197px로 벌어졌다. Safari 주소창과 하단 툴바가 화면을 먹기 때문에 실제 기기는 테스트보다 훨씬 짧다. iPhone에서 제목이 햄버거에 거의 닿는다는 제보로 찾은 문제다.

  ```css
  @media (max-width: 768px) {
      .cover-mid { justify-content: flex-start; padding: 62px 0 14px; }
      .cover-sub2 { margin-bottom: 24px; }
      .cover-title  { margin-top: auto; }   /* 남는 높이를 */
      .cover-author { margin-top: auto; }   /* 위아래가 반씩 나눠 갖는다 */
  }
  ```

  `auto` 를 위아래 둘에 거는 것이 핵심이다. 저자 쪽에만 걸면 900px 화면에서 가운데가 284px 벌어져 표지가 비어 보인다. 둘에 걸면 아래 표처럼 균형이 잡히고, 자리가 없을 때는 `padding-top: 62px` 이 최소 30px 을 보장한다.

  | 화면 높이 | 햄버거~제목 | 이름 위 | 소속~마스코트 |
  |---|---|---|---|
  | 600px | 30px (최소 보장) | 24px | 28px |
  | 660px (실기기 상당) | 55px | 49px | 28px |
  | 812px | 122px | 116px | 28px |
  | 900px | 160px | 154px | 28px |

  **모바일 표지 간격을 만질 때는 실제 기기 높이로 재라.** 375x812 로만 보면 문제가 안 보인다. 브라우저 크롬을 뺀 393x660 정도가 실전 조건이다.

- **모바일 표지 높이(`.jacket-front { min-height: 84svh }`)가 제목의 세로 위치를 정한다.** `.cover-mid`가 `flex-end`라 내용은 늘 바닥에 붙는다. 표지가 낮으면 내용이 통째로 올라와 제목이 오른쪽 위 햄버거 단추에 가까워진다. 78svh에서는 거리가 79px뿐이었다. 84svh면 375x812에서 제목이 177px에 서고 햄버거와 119px 떨어진다. 더 키우면 아래 섹션이 안 보여 스크롤할 곳이 있다는 신호가 약해진다. 지금은 130px이 남아 다음 섹션의 제목 줄이 걸쳐 보인다. **제목을 더 내리고 싶으면 여백이 아니라 이 값을 만진다.** 내용이 이미 바닥 정렬이라 여백을 늘리면 오히려 제목이 올라간다
- **`docs/google<해시>.html`은 지우지 않는다.** Search Console 소유 확인 파일이다. 지우면 확인이 풀려 검색 데이터가 끊긴다. 한 줄짜리 평문이라 `inject-analytics.py`가 건드리지 않도록 `VERIFY_RE`로 대상에서 뺐다
- **모바일 줄바꿈은 `.cs-keep`으로 잡는다.** 그냥 두면 `완전 / 정복`처럼 한 낱말이 갈라진다. 부제 두 단 모두 뒤쪽 덩어리를 `<span class="cs-keep">`(nowrap)으로 묶어 절 단위로 끊기게 했다. 데스크톱은 `.cover-sub`가 이미 nowrap이라 영향이 없다
- **meta description은 부제 두 단을 합친 문장이다.** 39개 파일 79건이 같은 문자열을 쓴다. 부제를 고치면 이 문자열도 같이 고친다. 한쪽만 고치면 어긋난다
- **URL**: https://airoasting.github.io/claude_guide/
- **타깃**: 코드를 쓰지 않는 지식 노동자 전반 (비즈니스 리더 포함). 2026-08-01 `모두의`로 확장
- **포맷**: 정적 HTML (Vanilla HTML + CSS + 약간의 JS), GitHub Pages 호스팅
- **디자인**: 뉴모피즘(Neumorphism), Pretendard Variable, 오렌지 액센트(`--orange: #D97757`)
- **분류**: Core Asset (계속 키워야 할 대표 자산)

### 리포지토리 레이아웃 (2026-07-12 재편)

사이트 전체가 **`docs/` 폴더** 안에 있다. 모든 HTML 페이지, `docs/assets/`, `docs/cases/`, `docs/server.js`가 여기 있다. 프로젝트 루트에는 운영 문서만 둔다: `README.md`·`AGENTS.md`·`CLAUDE.md`·`MEMORY.md`·`LICENSE`(+ `.git`/`.gitignore`/`.claude`). 파일 경로를 말하거나 편집할 때 웹 페이지는 항상 `docs/…` 아래에 있다는 점을 전제한다.

- **배포**: GitHub Pages Source = `main` 브랜치 **`/docs`** 폴더. (`.gitignore`는 `/docs/`를 더 이상 무시하지 않는다. 내부 비공개 문서만 `docs/assets/...` 경로로 개별 무시.) 페이지 URL은 예전과 동일(`airoasting.github.io/claude_guide/<page>.html`)하므로 HTML 안 canonical·og:url은 그대로 유효하다.
- **로컬 서빙/검증**: `cd docs && node server.js`(포트 3000, `root=__dirname`) 또는 `cd docs && python3 -m http.server`. 루트에서 서빙하면 index가 없어 깨진다.
- **생성 자산의 소스**: 스크립트로 만든 이미지 자산은 만드는 코드를 옆에 둔다. 아이콘 갤러리는 `docs/icon-gallery-src/`, 표지 마스코트 프레임은 `docs/assets/logos/robotseq-src/`(3.9).
- **아카이브**: 사이트에서 뺀 오펀·구버전은 `backups/`(gitignore 대상). 2026-07-12 `human-agent-teams.html` 이동. 되살리려면 `docs/`로 되돌린다. `git-guide.html`은 같은 날 함께 빼기로 했으나 실제로는 `docs/`에 남아 어디에서도 링크되지 않는 오펀으로 있었고, 2026-08-01 `git rm`으로 삭제했다(git 이력에 남아 있다).

## North Star

진단 → 멀티 페르소나 → 확장 프로그램 → 클로드 코드 → 에이전트 설계 → 루프 자동화. 이 학습 동선을 단일 사이트에서 완성한다(클로드 코워크 트랙은 2026-07-11 제거). 각 페이지는 "다음 행동"이 선명해야 한다.

---

## 2. 페이지 인벤토리 (인덱스가 링크하는 콘텐츠 페이지 50개, 2026-08-26 기준)

`index.html`이 라우팅 허브다. 콘텐츠 페이지는 모두 동일한 구조 골격을 공유한다(header → step-nav → header-pages → sticky sub-menu → container → SM-HAMBURGER).

### 상단 step-nav (전 콘텐츠 페이지 공통)
2026-06-21에 상단 `step-nav`를 32개 모든 콘텐츠 페이지에 통일했다. `진단 → 1 → 2 → 3 → 4 → 5 → 예제` 7노드이며, 인덱스 `guide-btn-row`의 단계 순서와 각 단계 대표(첫) 페이지로 링크한다.

| 노드 | 링크 | 클래스 |
|---|---|---|
| 진단 | `orientation.html` | `sn-diag` |
| 1 | `ai-fluency.html` | |
| 2 | `chrome-plugin.html` | |
| 3 | `claude-code-101.html` | |
| 4 | `harness-engineering.html` | |
| 5 | `loop-engineering.html` | |
| 예제 | `ai-writing.html` | `sn-final` |

각 페이지는 자기가 속한 단계 노드를 `active`로 둔다(active 배경 흰색 `rgba(255,255,255,0.95)`, 글자 `#1A1917`). 단계별 소속은 인덱스 섹션 기준이다(1단계: ai-fluency·project-intro·multi-persona·ai-sycophancy·ai-hallucination / 2단계: chrome-plugin·claude-plugin / 3단계: claude-code-101·claude-code-tasks·github-guide·checklist·cheatsheet·cli-best-practices / 4단계: harness-engineering·claude-tools·harness-workflows·agents-md-templates·skills·code-plugin / 5단계: loop-engineering·routines·hermes-agent / 예제: ai-writing·news-clipping·google-sheets-dashboard·mcp-examples·harness-book·company-brain).

`mcp-examples.html`(MCP 연결 실전)은 2026-07-12에 만든 **자기완결형 MCP 연결 허브**다. 인덱스 실전 예제의 'MCP 연결' 카드 3개(playmcp-kakao·korean-law-mcp·stock-messenger)를 카드 1개(→mcp-examples.html)로 합쳤고, 상세 3페이지는 `backups/`로 보냈다(사이트에서 제거, 복구 가능). 본문은 `claude-code-tasks.html`의 `.task-card` 아코디언 패턴으로 **다섯 예제**를 담고, 각 카드는 링크 없이 그 자리에서 완결한다(연결 경로 브레드크럼 `.conn-path` + 핵심 스텝 `.mcp-steps` + 복사용 주소·명령어 `.prompt-box` + 필요한 것 `.mcp-chip`). 순서는 Claude Desktop 커넥터(1~3) → Claude Code/CLI(4~5)로 묶는다. 다섯 카드: `#mcp-kakao`(카카오 PlayMCP, **playmcp.kakao.com 회원가입→도구함에 도구 먼저 추가→그 다음** 사용자 지정→커넥터→커넥터 둘러보기→playmcp 연결, 도구함에 카카오톡 나챗방·네이버검색·카카오맵·YouTube Data·OpenDART·법률절차 길잡이 반드시 추가 `.mcp-must` 박스를 STEP 2 바로 밑에 두려고 핵심 스텝 `<ol>`을 1~2/3~5로 분할, 둘째 `<ol>`은 `style="counter-reset: mcp 2"`로 번호 이어 붙임), `#mcp-law`(법령 커스텀 커넥터, 주소 `https://korean-law-mcp.fly.dev/mcp?oc=YOUR_OC_KEY`), `#mcp-drive`(구글 드라이브, 커넥터 둘러보기에서 Google Drive 추가+Google 로그인, 별도 URL 없는 공식 커넥터), `#mcp-stock`(Claude Code+DART, `git clone .../airoasting/dart ~/.claude/skills/dart`·OpenDART 40자 키 `.env`·`/dart`), `#mcp-telegram`(**Claude Desktop 불가, 반드시 터미널/Claude Code**, telegram 플러그인 `@BotFather`/`/telegram:configure`·`/telegram:access`, 카드 상단에 CLI 전용 경고 `.highlight-box`). 해시로 들어오면 해당 카드 자동 펼침. 예제 페이지 헤더 토글의 `pages-mcp` 그룹은 5개 파일(harness-book·company-brain + 백업 간 3파일)과 이 페이지에서 3링크→허브 단일 링크(→mcp-examples.html)로 통일했다. **전 페이지 공통 step-nav의 `sn-final`(예제) 노드는 playmcp-kakao.html→mcp-examples.html로 일괄 교체**했다(28개 파일). 상세 페이지로 향하던 본문 링크(claude-tools·cases/lge·cases/posco)도 mcp-examples.html#앵커로 수정했다. 되살리려면 `backups/`의 3파일을 루트로 되돌리고 위 링크들을 원복한다.

함정 두 가지. ① 옛 step-nav는 `<nav class="step-nav header-animate-1">`이나 `load-anim load-d1`처럼 클래스가 더 붙어 있어 `class="step-nav"` 정확 매칭에 안 걸린다. 일괄 수정 시 `class="step-nav[^"]*"`로 잡고 중복 nav를 막는다. ② 모바일에서 `.sm-menu-toggle`(우상단 `position:fixed`)과 7번째 노드가 겹치므로 `@media (max-width:768px) .step-nav`에 `padding: 0 50px 0 0 !important`로 우측 공간을 비운다.

주의: 아래 인벤토리의 `단계` 섹션 제목은 인덱스 재구성 이전 옛 구분(2단계 디자인·플러그인, 3단계 코워크, 4단계 클로드 코드, 5단계 자동화)을 아직 쓴다. step-nav 노드 번호는 위 인덱스 기준 매핑을 따르므로 둘이 어긋난다(예: step-node `3`=인덱스 클로드 코드=`claude-code-101`, `4`=에이전트 설계=`harness-engineering`, `5`=루프 자동화=`loop-engineering`). 인벤토리 제목 정렬은 추후 과제.

### 진단 트랙 (header-pages: 2개)
| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `orientation.html` | 5분 | 입문 | 2-menu 기준 페이지. `.hero-inner` 700px + `.header-pages` 70% (=490px). 2026-08-02 `claude-orientation.html`에서 개칭 |
| `ai-levels.html` | 5분 | 입문 | 자율주행 1~5단계 비유. 헤더에 별도 배지 없이 h1과 p, header-pages만 있다 |

**`orientation.html`은 Claude 단독 소개가 아니라 Claude·ChatGPT 비교 페이지다(2026-08-02).** 제목(h1·`<title>`·인덱스 카드)은 `5분 오리엔테이션`이고 sub-menu는 8노드다(이름의 유래·기능별 런칭 시점·왜 Claude인가?·소득 분포별 사용 AI·기업 AI 도입률·모델 발전 타임라인·벤치마크 비교·가격 비교). 파일명을 바꿀 때 손댄 곳은 루트 `docs/*.html` 34개와 `README.md`·`AGENTS.md`이고, `docs/cases/lge/`의 동명 납품본은 별도 사본이라 건드리지 않는다.

- **이름의 유래 섹션은 두 장 카드 비교다.** 옛 3카드(섀넌·발음·Anthropic)는 2026-08-02에 지웠고, `.nc-card` 두 장(Claude·ChatGPT)이 그 자리를 대신한다. 왼쪽은 사람 이름 계열(섀넌·발음·anthropos), 오른쪽은 기술 이름 계열(Chat+GPT 세 낱말 분해·OpenAI)이다. `openAnthropicIntro()` 모달 버튼은 왼쪽 카드 안에 둔다.
- **함정: 두 카드의 회사 줄(`.nc-co`) 높이를 맞추는 장치가 세 개다.** ① 회사 블록을 `.nc-foot`로 감싸 `margin-top: auto`로 바닥에 붙인다. ② 그 안 마지막 `.nc-line`에 `min-height: 43px`를 준다(한쪽만 세 줄로 늘어나면 어긋난다). ③ 왼쪽 카드에만 있는 버튼 높이만큼 오른쪽 카드에 `.nc-cta--hold` 빈 자리를 둔다. 카드 안 문장을 고칠 때 이 세 가지를 함께 확인한다.
- **`왜 Claude인가?`(`#sec-launches`)는 카드 4장 + 뉴스 박스 1개다.** 01 MCP(2024.11 공개, 2025.12.09 리눅스 재단 산하 Agentic AI Foundation 기부) · 02 Claude Code · 03 Skills · 04 Cowork · 05 크리에이티브 커넥터. 다섯 장 모두 같은 `.launch-step` 포맷이고(번호·날짜·아이콘·제목·설명·태그 상자·ChatGPT 줄), 05만 태그 아래 `.launch-step-logos` 파트너 알약 8개가 더 붙는다. 04와 05는 `.launch-bottom` 2열 래퍼에 나란히 둔다(≤900px에서 1열). 옛 `.csc-news` 뉴스 박스는 2026-08-02에 이 카드로 흡수했고 CSS만 죽은 채로 남아 있다. 카드마다 `.launch-vs` 한 줄로 ChatGPT 쪽 대응 시점을 적는다. 위 3장은 태그 상자 `min-height: 118px`와 설명 줄 `1fr` 행으로 상자·ChatGPT 줄 높이를 맞춘다(옛 `height: 170px` 고정값은 아래 여백이 남아 2026-08-02에 뺐다).
- **옛 주소 `claude-orientation.html`은 리다이렉트 문서로 남긴다.** 본문 없이 canonical·`noindex, follow`·meta refresh·`location.replace`만 담은 한 장이다. 파일명을 다시 바꿀 때도 같은 방식으로 옛 주소를 살려 둔다.
- **모델 타임라인(`#sec-timeline`)은 2025 Q1부터 현재 분기까지 분기 단위다.** `DOMAINS`의 `a`/`b`와 `ticks` 배열만 고치면 범위가 바뀌고, 범위 밖 모델은 렌더 단계에서 걸러진다. 새 분기가 시작되면 `b`와 마지막 눈금을 같이 올린다.
- **기능별 런칭 시점 비교(`#sec-race`)는 두 번째 섹션이고 4열 그리드다.** 기능 258px · Claude 1fr · 가운데 104px · ChatGPT 1fr이고 10행이다(채팅·스마트폰 앱·프로젝트·도구 연결 표준·예약 실행·코딩 에이전트 CLI·클라우드 실행·재사용 도구·코딩 에이전트 데스크톱 앱·업무 위임). 재사용 도구 행의 ChatGPT 칸은 GPTs가 아니라 **2025년 12월 SKILL.md 규격 채택**을 적는다(OpenAI가 같은 규격을 받아들였으므로 GPTs는 각주로 내린다). 행 순서는 두 날짜 중 이른 쪽 기준 오름차순이라, 날짜를 고치면 행 위치도 다시 본다. 코딩 에이전트 데스크톱 앱 행은 채팅용 앱이 아니라 **코딩 에이전트 CLI가 창으로 나온 시점**을 적는다(사용자 지시). Claude는 Claude 앱 Code 탭 2025.11.24(Opus 4.5 발표에 포함. 앤트로픽이 운영체제를 나눠 발표한 기록이 없어 `맥 · 윈도우`로만 적는다), ChatGPT는 Codex 앱 2026.02.02 맥·2026.03.04 윈도우다. 운영체제 구분은 `.race-os` 알약에 적고, 채팅용 앱 날짜(2024.10.31·2024.05.13)는 같은 칸 각주로 남긴다. 먼저 낸 쪽 칸에 `.is-first`와 `먼저` 알약을 붙이고, 가운데 `.race-mid`에는 양쪽 화살표와 간격을 둔다. 날짜 20개에는 각각 공식 발표 페이지로 가는 `.race-link` 우상향 아이콘을 붙인다(칸마다 출처가 다르므로 새 행을 넣을 때 링크도 함께 찾는다). 헤더 줄은 Claude·ChatGPT 두 칸만 두고 `기능`·`차이` 라벨과 색 띠는 넣지 않는다. 두 칸의 첫 줄이 같은 높이에서 시작해야 하므로 `.race-cell`은 `justify-content: flex-start`다. 핵심 다섯 가지(채팅·도구 연결 표준·코딩 에이전트 CLI·코딩 에이전트 데스크톱 앱·업무 위임)는 `.race-row.is-key`로 왼쪽 칸을 금색(`#9A6B0F`)으로 물들이고 `핵심` 알약을 단다. 구성은 섹션명 → h2 → 표가 전부다. 출처는 표 아래 알약 목록이 아니라 날짜마다 붙은 링크 아이콘으로만 단다(알약 목록은 중복이라 2026-08-02에 지웠다). 부제(`section-subtitle`), 하단 요약 카드, 색을 깐 결론 띠는 모두 사용자 지시로 뺐으니 다시 넣지 않는다.
- **날짜는 각 사 공식 발표를 1차 출처로 확인해 적고 `.race-src` 알약으로 링크한다.** 사이트 안 다른 페이지와 어긋나면 안 된다. 채팅·코드·코워크·Work 날짜는 `claude-cowork.html`·`chatgpt-work.html`의 `공식 출시일` 행, 예약 실행은 `routines.html`과 같은 값을 쓴다.
- **함정: sub-menu가 8노드라 769~1120px 구간에서 가로로 넘친다.** `@media (max-width: 1120px) and (min-width: 769px)`에서 부제(`.sm-sub`)를 감추고 `flex-wrap: wrap`으로 두 줄로 접는다. 노드를 더 늘리면 이 구간을 다시 확인한다.

### 1단계 · 멀티 페르소나 (기본기 + 검증, header-pages: 기본기/검증 2탭 토글, 5개 페이지)
2026-08-02에 섹션명을 `기본기부터` → `멀티 페르소나`로 바꿨다(index guide-btn·section-title·부제, ai-levels L1 7곳 동시). 근거는 멀티 페르소나가 동조·환각을 막는 수단이라 한 섹션 안 두 묶음이 인과로 이어진다는 것이다. **섹션명과 track-label은 다른 층위다**: 섹션명만 `멀티 페르소나`이고, 안쪽 track-label 배지(`기본기`/`검증`)와 5개 페이지 헤더 mode-tab은 그대로 `기본기 | 검증`을 쓴다.

2026-06-19에 1단계를 한 섹션 안 두 묶음으로 재구성했다(5단계 자동화 스타일). 인덱스 1단계 섹션은 `🌱 기본기`(track-label, 3카드: `ai-fluency`·`project-intro`·`multi-persona`) + `🔍 검증`(track-label, 2카드: `ai-sycophancy`·`ai-hallucination`)을 담고, 이 섹션은 진단과 2단계 사이에 둔다. 5개 페이지는 모두 헤더에 `기본기 | 검증` 2탭 토글을 단다(`mode-tabs` + `switchMode(['basic','verify'])`, `pages-basic` 3링크 / `pages-verify` 2링크, `.header-pages` 700px). 기본기 페이지는 `tab-basic` 기본 active, 검증 페이지는 `tab-verify` 기본 active. track-label 배지 색은 `.basic #3a7a5a`·`.verify #B35535`. 검증 2페이지 상세는 아래 `검증 묶음` 표 참고.

| 페이지 | 묶음 | 시간 | 난이도 | 특성 |
|---|---|---|---|---|
| `ai-fluency.html` | 기본기 | 10분 | 입문 | 3-menu 기준 페이지. 데스크톱 h1과 모바일 h1이 다르다 (`.t-desktop` / `.t-mobile`). sub-menu 5섹션(프롬프트 공식·과거 vs 지금·단발→위임·최신 가이드·한 장 요약). **2026-08-01 최신 가이드 섹션 신설**: OpenAI `GPT-5.6 프롬프트 작성 안내`, Anthropic `Prompting Claude Opus 5`·`Prompting Claude Fable 5` 세 공식 문서를 1차 출처로 확인해 `.guide-card` 3장 + `지워도 되는 문장` pc-table 6행 + 공통 결론 3가지로 정리했다. 세 가이드의 공통 결론은 "프롬프트는 채우는 것이 아니라 덜어내는 것"이고, 이에 맞춰 위임 4요소의 `검증` 카드를 "다시 확인해" 지시 대신 **대조할 대상 지정**으로 고쳤다(Opus 5는 시키지 않아도 자체 검증한다). 하단 `.source-box`는 단일 출처 문단 → `.source-list` 참고 문서 3건으로 교체(옛 `Prompting best practices` 링크는 사용자 지시로 제거, 재추가 금지) |
| `project-intro.html` | 기본기 | 20분 | 입문 | 프로젝트 셋업, 시스템 프롬프트 |
| `multi-persona.html` | 기본기 | 10분 | 중급 | 5인 페르소나 토론 (5-Color Harness와 연결) |

### 2단계 · 확장과 위임 (2026-08-02 세 트랙 6개 페이지)

2단계는 한 묶음이 아니라 **세 트랙**이다. 인덱스에서도 `track-label` 세 개로 나뉘고, 페이지 헤더에서도 `track-toggle`로 갈아탄다. 트랙 순서는 확장 프로그램 → 업무 맡기기 → 스마트폰 앱이며, 인덱스와 `track-toggle`이 같은 순서를 쓴다.

**확장 프로그램** (`track-label-badge ext` · 쓰던 화면에 AI를 붙이기)

| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `chrome-plugin.html` | 15분 | 입문 | 크롬에서 Claude·ChatGPT 사용. 2단계 트랙의 첫 페이지이자 로드맵 step-node `2`의 대상 |
| `office-plugin.html` | 10분 | 입문 | 엑셀, 파워포인트, 워드 3종. 구 `claude-plugin.html`에서 개칭 |

**업무 맡기기** (`track-label-badge work` · 목표만 주고 자리 비우기)

2026-08-02 신설. 코드를 쓰지 않는 사람이 AI에게 일을 맡겨 결과물을 파일로 받는 트랙이다. 2026-07-11에 뺐던 클로드 코워크가 이 자리로 돌아왔고, 이번에는 ChatGPT Work와 짝을 이룬다.

| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `claude-cowork.html` | 12분 | 입문 | Claude Cowork로 업무 맡기기. `claude-mobile.html` 골격 클론 |
| `chatgpt-work.html` | 12분 | 입문 | ChatGPT Work로 업무 맡기기. 같은 골격 |
| `cowork-tasks.html` | 과제별 | 입문 | 코워크 실전 과제 8가지. 2026-08-02에 `backups/cowork.html`을 되살린 페이지로, 본문(task-card 아코디언 8개)은 그대로 두고 헤더·내비·링크만 현재 규약에 맞췄다 |

`header-pages`(`pages-work`)는 세 페이지 모두 Claude Cowork · ChatGPT Work · 실전 과제 3링크다.

**제품이 짝으로 대비되는 카드는 브랜드 마크로 가른다 (2026-08-02).** 업무 맡기기 트랙은 같은 일을 Claude와 ChatGPT로 각각 하는 구조라, 인덱스 카드 아이콘을 제품 마크로 갈랐다. `claude-cowork`는 Claude 별 마크, `chatgpt-work`는 오픈AI 매듭이다. 자산 출처와 변환 규칙은 3.14를 따른다.

**스마트폰 앱 트랙은 브랜드 마크를 쓰지 않는다.** 트랙 성격이 기기라 두 카드 모두 같은 스마트폰 아이콘이고, 제품 구분은 카드 제목이 한다(2026-08-02 사용자 결정). 두 카드 아이콘이 같아지는 것을 알고 택한 것이니 "중복이니 갈라야 한다"고 되돌리지 않는다.

**헤더 CSS는 6개 페이지가 규칙 단위로 동일하다 (2026-08-02 통일).** 어긋났던 `office-plugin.html`을 나머지 다섯 기준으로 맞췄다. 자세한 점검 방법은 3.2의 "한 트랙의 헤더는 CSS 규칙 단위로 같아야 한다" 참고. `header-pages` 폭은 메뉴 수를 따른다. 확장 프로그램·스마트폰 앱은 2링크라 490px, 업무 맡기기는 3링크라 700px이다.

sub-menu는 앞의 두 페이지 모두 4노드다. `#sec-compare` 세 가지 기능 비교 · `#sec-start` 시작하는 법 · `#sec-task` 맡길 일 고르기 · `#sec-caution` 확인 사항. `#sec-task`만 두 페이지가 같은 내용이고 나머지는 제품별로 다르다. 한쪽 본문을 고치면 다른 쪽도 같이 본다.

**시작 순서와 화면 배치.** 단계 목록(`ol.step-list`)이 먼저 오고 화면 목업은 목록 **밖에** 전폭으로 둔다. 목업을 `li` 안에 넣으면 번호 칸 폭에 눌린다. 설치 안내 박스처럼 단계 안에 넣어야 하는 블록은 `li > div` 안에 두고 `margin-left: -42px; width: calc(100% + 42px)`로 당긴다(번호 28px + 간격 14px). `flex-wrap: wrap`으로 푸는 방식은 번호와 제목이 갈라져 쓰지 않는다.

**함정: `.nm-card ul, .nm-card ol { padding-left: 20px }`가 `.step-list`까지 먹는다.** 단계 목록만 20px 안쪽으로 밀려 화면·예시 프롬프트와 어긋난다. `.step-list { padding: 0 !important }`로 무른다.

**승인 모드는 두 페이지 모두 같은 자리에 같은 규격으로 넣는다.** 목업 안에서 권한 메뉴를 펼친 상태로 그리고, 목업 바로 아래 `.perm-note`에 각 모드를 설명한다. 이름은 지어내지 말고 실제 화면을 따른다.

| 페이지 | 여는 자리 | 모드 |
|---|---|---|
| `claude-cowork` | 입력창 아래 `설명서`(손 아이콘) | 수동 승인 · 자동 승인 · 모든 승인 건너뛰기 (3개) |
| `chatgpt-work` | 입력창 안 권한 칩 | 승인 요청 · 나 대신 승인 · 전체 권한 · 사용자 지정(config.toml) (4개) |

두 페이지 모두 **가장 안전한 모드를 선택된 상태로** 그린다(수동 승인 / 승인 요청). 실제 화면이 전체 권한으로 되어 있더라도 가이드 목업은 권장 설정을 보여 준다. 선택 표시는 파란 체크(`#2F6FED`)다. `chatgpt-work` 쪽은 행이 두 줄(`gm-perm-t` 이름 + `gm-perm-d` 설명)이고 머리말 `ChatGPT 액션은 어떻게 승인할까요?`까지 재현한다.

**체크리스트는 눌러서 체크된다.** `.check-list li`는 기본이 빈 상자이고, 누르면 `.is-done`이 붙어 오렌지 체크로 바뀐다. 상태는 `localStorage`에 `checklist:<파일명>` 키로 저장하고 항목 식별자는 `목록순번-항목순번`이다. 항목 안 링크를 누르면 체크되지 않는다(`e.target.closest('a')` 확인). 키보드는 `role="checkbox"`·`tabindex="0"`·Enter/Space를 지원한다.

**출처는 문장으로 쓰지 않는다.** `.src-links`에 링크 알약만 건조하게 나열한다(`출처` 라벨 + 링크들). 확인 날짜나 "자주 바뀌므로 다시 확인하세요" 같은 문장은 넣지 않는다.

**보안 질문에는 `.q-warn` 알약을 단다.** 붉은색 `#B3271E`로, 오렌지 액센트와 구분한다. 두 페이지 FAQ에 보안 항목이 각각 4개·3개 있다. Cowork 쪽 답의 핵심은 **폴더 연결은 접근 범위를 정하는 일이고 폴더 전체가 업로드되지는 않지만, Claude가 실제로 연 파일의 내용은 앤트로픽 서버에서 처리된다**는 구분이다. 근거는 헬프센터 `Use Claude Cowork safely`.

**개요 섹션은 두지 않는다.** 처음에는 `#sec-what`(묻기와 맡기기)로 시작했는데, 바로 뒤 비교표가 같은 내용을 이미 담고 있어 2026-08-02에 통째로 뺐다. 페이지는 비교표로 바로 시작한다. 앞으로도 표가 답하는 내용을 산문으로 다시 쓰지 않는다.

**비교표는 두 제품이 아니라 같은 회사 세 모드를 견준다.** `claude-cowork`는 채팅 · 코워크 · 클로드 코드, `chatgpt-work`는 채팅 · Work · Codex다. 사용자가 실제로 헷갈리는 지점이 회사 사이가 아니라 한 앱 안의 모드 사이이기 때문이다. 레일 9개(`선택하는 위치`·`사전 준비`·`주요 용도`·`결과물이 남는 곳`·`내 파일 접근`·`요금제`·`한계`·`선택 기준`·`공식 출시일`)에 `.cmp-board cols-3`을 쓴다. 행마다 종결 형태를 맞춘다. 문장 행은 `~합니다/됩니다`로 닫고, 경로 행과 선택 기준 행만 명사구로 둔다.

**함정: `.cmp-board`의 `grid-template-rows` 행 수는 레일 개수와 반드시 같아야 한다.** `grid-auto-flow: column`이라 어긋나면 칸이 다음 열로 밀려 표 전체가 뒤섞인다. 지금은 `cols-3`이 `auto repeat(9, auto)`다. 레일을 더하거나 빼면 이 값도 같이 고친다. 검산은 `셀 개수 == 레일 개수 × 열 개수`다.

**시작 화면 목업.** 두 페이지의 `#sec-start`에는 스크린샷 대신 HTML·CSS로 다시 그린 화면이 들어간다(`project-screen-mockups`와 같은 방침: 사용자 계정 화면에는 실제 프로젝트명이 노출된다). 창 껍데기 `.appmock`과 사이드바 `.am-*`은 두 페이지가 공유하고, 본문만 `.cm-*`(Claude)과 `.gm-*`(ChatGPT)으로 나뉜다. 둘 다 라이트 화면이다.

**목업 폭은 940px로 고정한다.** 가변 폭이면 가운데 정렬된 권한 메뉴와 칩 사이 거리가 화면마다 달라져 연결선 좌표가 어긋난다. 좁은 화면은 `.mock-scroll` 가로 스크롤로 넘긴다. 연결선은 칩에서 오른쪽으로 나간 뒤 직각으로 꺾여 메뉴 왼쪽 위에 닿는 ㄱ 자이고, 좌표는 눈대중이 아니라 브라우저 실측값을 쓴다.

**번호 배지는 녹색 `#2E7D5B`다.** 표적 링이 오렌지라 배지까지 오렌지면 구분되지 않는다. 배지에는 `padding: 0; flex: none`을 반드시 넣는다. `.cm-seg span`·`.gm-seg span`의 padding을 물려받아 알약처럼 늘어난다.

**표적과 설명은 마우스 오버로 잇는다.** 번호가 같은 `.mock-target`과 `.perm-item`에 `is-hot`을 함께 붙이는 양방향 방식이고, `prefers-reduced-motion`에서는 애니메이션을 끈다.

목업은 **두 자리를 순서대로 짚는다**. 왼쪽 위에서 `홈`(또는 `ChatGPT`)을 고르고, 그다음 입력창의 `Cowork`(또는 화면 위 `Work`)를 고른다. 왼쪽 위가 `Code`나 `Codex`로 되어 있으면 해당 메뉴가 아예 보이지 않는다는 점이 이 트랙에서 가장 많이 막히는 지점이다. 표시는 `.mock-target`(오렌지 링) + `.mock-num`(번호 배지)로 하고, 설명은 화면 밖 `.mock-steps` legend에 둔다. 말풍선을 화면 안에 띄우면 아래 줄을 덮으므로 쓰지 않는다.

**준비물은 데스크톱 앱 하나다.** Git·Node.js·터미널은 클로드 코드와 Codex 쪽 준비물이라 이 트랙에서는 필요 없고, 두 페이지 모두 `#sec-start`에 이를 못 박는 `tip-box`를 둔다. 내려받는 곳은 `claude.ai/download`와 `chatgpt.com/download`다.

**사실 출처.** 앤트로픽 `claude.com/product/cowork`·헬프센터 `Get started with Claude Cowork`, OpenAI `openai.com/chatgpt-work`를 1차 출처로 확인해 적고 본문 하단 `.src-note`에 확인 날짜와 함께 표기한다. 주의: OpenAI의 **워크스페이스 에이전트**는 ChatGPT Work와 다른 제품이다(기사에서 자주 섞인다). 이 구분은 `chatgpt-work.html`의 `헷갈리기 쉬운 이름` 박스에 적혀 있다. `openai.com`은 WebFetch를 403으로 막으므로 이 도메인 확인은 브라우저로 직접 연다.

**스마트폰 앱** (`track-label-badge mobile` · 책상 밖에서도 이어서 쓰기)

| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `claude-mobile.html` | 10분 | 입문 | 스마트폰에서 Claude 쓰기(2026-07-26 신설). sub-menu 6노드(앱 메뉴 구성·네 개 메뉴 비교·코드·Dispatch·코워크·실행 순서). 앱 캡처는 `assets/img/ui/claude_app_site.jpeg`. 앤트로픽 공식 문서 3건을 1차 출처로 확인해 적고 본문 하단에 출처를 표기한다 |
| `chatgpt-mobile.html` | 10분 | 입문 | 스마트폰에서 ChatGPT 쓰기(2026-08-02 신설). claude-mobile 골격 클론. sub-menu 5노드(앱 메뉴 구성·네 가지 비교·원격·예약·실행 순서). ChatGPT 앱 캡처가 없어 화면을 직접 그렸다(3.13 참조). OpenAI 공식 문서를 1차 출처로 확인해 적는다 |

2단계 섹션 제목은 `확장과 위임`(2026-08-02 `확장 프로그램`에서 개칭), 부제는 `내가 있는 자리에서 바로 씁니다. 브라우저, 오피스 문서, 스마트폰, 그리고 내 컴퓨터 통째로`이고, 인덱스 카드는 세 트랙 모두 `cards col-2`로 콘텐츠 폭을 채운다. 개칭 지점은 index.html 네 곳이다(band-card·guide-btn·section-title·section-subtitle). step-nav 노드는 숫자만 쓰므로 다른 페이지는 손대지 않아도 된다.

`header-pages` 그룹은 **지금 선택된 트랙의 페이지만** 담는다. 확장 프로그램 쪽은 `pages-ext`에 Chrome · MS Office 2링크, 스마트폰 앱 쪽은 `pages-ext`에 Claude · ChatGPT 2링크, 업무 맡기기 쪽은 `pages-work`에 Claude Cowork · ChatGPT Work · 실전 과제 3링크다. 트랙을 넘나드는 것은 `header-pages`가 아니라 `track-toggle`의 일이다(3.12 참조). `track-toggle`의 `업무 맡기기` 버튼은 트랙 대표인 `claude-cowork.html`로 간다.

`claude-design.html`(Claude Design)은 2026-06-13에 인덱스 갤러리 카드·전 페이지 로드맵 step-node `2`·갤러리 트랙 내비·multi-persona next 버튼에서 제거하고 `backups/claude-design.html`로 옮겨 git 추적에서 뺐다(`backups/`는 gitignore 대상). 되살리려면 파일을 루트로 되돌린 뒤 step-node `2` 대상(현재 `chrome-plugin.html`), 갤러리 트랙 내비(`eda-gallery`·`component-gallery`·`ui-design`), `index.html` 갤러리 카드, `multi-persona.html` next 카드를 함께 복원한다.

### 옛 클로드 코워크 페이지 (2026-07-11 제거, 되살리지 않음)
2026-08-02에 코워크는 `claude-cowork.html`로 새로 만들었으므로 아래 두 파일은 되살릴 이유가 없다. 이력으로만 남긴다. `cowork-intro.html`·`cowork.html`은 인덱스 2단계에서 빠지고 `backups/`로 옮겨졌다. 되살리려면 두 파일을 루트로 되돌린 뒤 인덱스 2단계에 서브섹션 카드와 히어로 바로가기를 다시 넣고, chrome-plugin·claude-plugin 헤더에 `확장 프로그램 | 클로드 코워크` mode-tabs 토글(`switchMode(['ext','cowork'])`)을 복원한다. 그 토글과 죽은 CSS(`.mode-tabs`/`.mode-tab`)는 제거된 상태이고, chrome-plugin·claude-plugin 상단은 이제 Chrome/MS Office 링크만 남는다.

### 4단계 · 클로드 코드 (header-pages: 노코드 3 + CLI 2 + 비법 1, 3탭 토글)
헤더는 `노코드`/`CLI`/`비법` 세 그룹을 `switchMode`로 토글한다(`pages-nocode` 3링크, `pages-cli` 2링크, `pages-tip` 1링크). `switchMode`는 `['nocode','cli','tip']` 3-way이고 표준 토글 5개 페이지(`claude-code-tasks`·`github-guide`·`checklist`·`cheatsheet`·`cli-best-practices`)가 공유한다. `cli-best-practices.html`만 `비법` 탭이 기본 active다. `claude-code-101.html`은 예외로, 표준 토글 헤더 대신 `track-toggle-btn` 방식의 커스텀 입구 헤더를 쓴다(`비법` 버튼 포함, `pages-*` 그룹 없음).

| 페이지 | 트랙 | 시간 | 난이도 | 특성 |
|---|---|---|---|---|
| `claude-code-101.html` | 노코드 | 10분 | 입문 | 노코드 트랙 입구. Claude Desktop. 커스텀 헤더(track-toggle-btn) |
| `claude-code-tasks.html` | 노코드 | 과제별 | 중급 | 바이브코딩 7단계 |
| `github-guide.html` | 노코드 | 20분 | 중급 | GitHub과 Vercel 배포 |
| `checklist.html` | CLI | 단계별 | 고급 | CLI 트랙 20단계 체크리스트 |
| `cheatsheet.html` | CLI | 레퍼런스 | 참고 | 슬래시 명령어와 단축키 |
| `cli-best-practices.html` | CLI | 15분 | 고급 | 도구 중립 베스트 프랙티스 5원칙(2026-08-02 파일명 `claude-code-best-practices.html`→현재명, 제목에서 도구 이름 제거, 본문 도구 이름은 "에이전트"로 중립화하고 Claude Code·Codex 차이는 `.side-note`로 병기). `cheatsheet.html` 골격 클론. code.claude.com/docs best-practices 한국어판(예시는 개발 코드가 아니라 비즈니스 리더·지식 노동자 사례로 번안: 매출 분석·제안서·대시보드·뉴스 브리핑 등). **헤더 토글이 2탭(노코드·CLI)→3탭(노코드·CLI·비법)으로 확장됨**: 표준 토글 5개 페이지(claude-code-tasks·github·checklist·cheatsheet·이 페이지)에 `id="tab-tip"` `비법` 탭 + `id="pages-tip"` 그룹(이 페이지 링크 1개) 추가, `switchMode`는 `['nocode','cli','tip']` 3-way. claude-code-101은 track-toggle-btn에 `비법` 버튼 추가. 이 페이지는 비법 탭 기본 active. index에서는 4단계 CLI 트랙 **아래**에 `🎓 비법 · 노코드·CLI 공통 원칙` track-label + 풀폭 featured 카드(CLI 트랙은 checklist·cheatsheet 2장). 본문 sub-menu(스크롤스파이) **7섹션**(컨텍스트 뿌리 + 원칙 5개 + 체크리스트). **2026-07-25 대개편: 9원칙 3카테고리 → 5원칙 평면 구조**로 압축하고, 이모지 아이콘을 전부 인라인 SVG 라인아이콘으로 교체했다. 미지수(Thariq 'A Field Guide to Fable: Finding Your Unknowns', 지도≠영토·아는것/모르는것 4분면 Johari)를 **원칙 1로 승격**. 5원칙: `#unknowns`(1 미지수·핵심) · `#plan`(2 탐색·계획+구체적 지시 병합·핵심) · `#verify`(3 검증·핵심) · `#environment`(4 환경설정+맥락관리+실패패턴 병합) · `#mastery`(5 자동화·확장+직관 병합). 옛 소통 원칙은 해체(인터뷰→미지수, 자료 질문→탐색). 각 원칙은 `<section class="content-section" id>` 안에 `.principle` 래핑(번호 gradient 숫자 헤더·`.tip` 원칙 줄·`.nm-card` 본문). cat-banner 3개 제거(CSS는 dead로 잔존). AI 티 제거: 4분면 `.quad`에서 대문자 영어 라벨(`.q-en`) 삭제하고 `→ 이렇게 좁힙니다` 액션 줄(`.q-move`)로 4분면↔기법 연결, 단계 라벨(`.stage-label`)을 채운 오렌지 알약→오렌지 점+진한 글자+헤어라인. 2026-07-25 디자인 2차: 4분면에 번호 뱃지 `.q-no`(1~4, 22px 라운드 오렌지 14%) 추가하고 본문 지칭을 '위/아래 두 칸'→'1번과 2번'/'3번과 4번'으로 연결, `.q-name` 14.5→15.5px로 본문(14px)과 위계 분리, 카드 안 소단락 `h3:not(:first-child)`에 헤어라인 구분선. 출처는 문장형 각주→`.source-pill` 알약 버튼(외부링크 SVG+원문 라벨+제목+저자, 4.10-4). 아이콘 SVG: 서브메뉴 7노드 `.sm-num svg`(16px 흰 라인, layers·magnifier·compass·shield-check·sliders·trending-up·check-circle), `#context`·`#checklist` 헤더 `.section-num svg`(30px 오렌지). 히어로·`<title>`·index·ai-levels의 '9가지 원칙'→'5가지 원칙'. 끝에 `#checklist` 섹션(5원칙 한 줄 점검, `.bp-check` 체크박스 5개, 진행바 0/5, localStorage 키 `ccbp-checklist` 저장) + `.next-links`(하네스·루프 크로스링크). 키보드 `5`→`claude-tools.html` |

### 5단계 · 자동화 (9개)

인덱스의 `#section-5`에는 페이지 카드 3장 아래에 **도구 트랙**이 하나 더 있다(2026-08-01). `5color.airoasting.com`(5 Color)·`50agents.airoasting.com`(50 에이전트 팀 빌더)·`council.airoasting.com`(25인 자문단) 세 외부 사이트를 `외부 사이트` 배지와 함께 상설로 건다. 5단계까지 읽은 사람이 실제로 쓰는 도구라 이 자리에 둔다. 표지 띠지에는 걸지 않는다. 띠지는 가이드 안으로 들여보내는 일만 한다. 하단 `AI ROASTING의 다른 콘텐츠` 아코디언에도 같은 3개가 있고, 그쪽은 다 읽고 내려온 사람을 위한 회수 지점이라 중복을 유지한다.

세 묶음(하네스·도구·루프)으로 나뉜다. sub-menu는 모두 6섹션이다. 헤더 토글은 2026-06-21에 바뀌었다(아래 토글 규칙 참고): 하네스·도구 6개 페이지는 `하네스 | 도구` 2탭 토글을 달고, 루프 3개 페이지(`loop-engineering`·`routines`·`hermes-agent`)는 토글 없이 `pages-loop` 서브메뉴 버튼 3개만 단독으로 둔다. sub-menu 섹션 수는 루프·하네스·도구 6개 페이지가 6섹션, `hermes-agent`만 7섹션이다.

| 페이지 | 묶음 | 시간 | 난이도 | 특성 |
|---|---|---|---|---|
| `harness-engineering.html` | 하네스 | 15분 | 고급 | 하네스 6가지 구성 요소 |
| `claude-tools.html` | 하네스 | 20분 | 중급 | 도구 다섯 종류(내장·MCP·커넥터·스킬·플러그인). `harness-workflows.html` 골격 클론. MCP vs 커넥터를 깊게 다룬다. sub-menu 5섹션(도구란·다섯 종류의 도구·MCP와 커넥터·무엇을 고르나·연결하는 법). 다섯 종류는 번호 Pill 가로 5열 |
| `harness-workflows.html` | 하네스 | 15분 | 고급 | 멀티 에이전트 소환. `/goal` 한 줄로 목표를 선언하면 Claude가 에이전트 팀을 직접 설계해 끝까지 실행한다. sub-menu 6섹션(한 세션의 한계·/goal 선언·팀 설계·실전 사례·직접 해보기·FAQ). 본문에는 하네스/다이내믹 워크플로우를 개념어로 유지한다. `harness-engineering.html` 골격 클론 |
| `agents-md-templates.html` | 도구 | 10분 | 중급 | CLAUDE.md 작성법 |
| `skills.html` | 도구 | 20분 | 중급 | 나만의 Skill 만들기 |
| `code-plugin.html` | 도구 | 20분 | 중급 | 스킬·MCP를 플러그인 한 패키지로 묶어 배포 |
| `loop-engineering.html` | 루프 | 14분 | 고급 | 루프 다섯 요소와 클로드 코드 `/loop`. 행동·관찰·조정을 목표에 닿을 때까지 반복 |
| `routines.html` | 루프 | 12분 | 중급 | 정해진 시각에 클라우드에서 무인으로 도는 예약형 에이전트 |
| `hermes-agent.html` | 루프 | 18분 | 고급 | 헤르메스 에이전트(Hermes Agent, Nous Research, MIT, 2026-03 첫 공개). `routines.html` 골격 클론 + **페이지 전용 컴포넌트 다수**. sub-menu **8섹션**(헤르메스란·만든 곳·설치하기·모델 연결·메신저 연결·늘 켜 두기·서버 호스팅·고르는 기준) + 하단 부록 `용어 설명`. `#sec1` `.brand-hero`(**#0000F2**, 공식 사이트 브랜드 컬러 + 공식 워드마크) · `.fact-strip` 4칸(만든 곳 칸은 nousresearch.com 링크 `a.fact-item`) · role-card 3 · **기억 흐름 SVG 도식**(`.mem-flow`, 3박스 + 하단 피드백 아크, 공식 문서 근거) · key-message, `#sec2` 만든 곳(Nous Research 2023 뉴욕 · 이름 유래 · ☤ · **오픈클로 비교** compare-grid: Warelay→CLAWDIS→Clawdbot→Moltbot→OpenClaw 이름 이력), `#sec3` **데스크톱 앱 우선**: `.os-cards` 2장(Mac OS macOS 12+ / Windows 10·11) → `.sub-head` 2 터미널 설치(설치 명령 한 줄씩만), `#sec4` **연결 두 방법 병렬**(구독 로그인 vs API 키) + 제공사별 키 발급 4단계 + 발급 콘솔 링크 4종 + `.file-list` 8행 + 공식 대시보드 Models 캡처, `#sec5` **메신저 연결**(텔레그램 4단계 + 27개 채널 + 다른 메신저 role-grid 3 + 공식 Channels 캡처 + 허용 목록 경고), `#sec6` 늘 켜 두기(launchd 4단계, 상태 확인 명령), `#sec7` VPS 도커 + **호스팅 업체 4곳 요금**(2026-07 기준, 출처 범위 명시), `#sec8` 비교·안전장치 3·FAQ 7. CTA도 **#0000F2**(히어로와 북엔드). `.highlight-box` 3단 위계(`.hl-title::before` 점: 기본 회색 / `.is-warn` 주황 / `.is-tip` 녹색). `.nm-card h2` 22px. `.role-card`는 flex column + `.role-example { margin-top:auto }`로 하단 정렬. **`scroll-margin-top` 158px**(sticky 서브메뉴 121px + 37px 여유), 모바일 20px. `prompt-block` 8개(installMac·installWin·modelSetup·telegramEnv·gatewayMac·dockerSetup·dockerRun·dockerUp). **`copyPrompt`가 이 페이지만 다르다**: 주석 `.cm`을 제거하고 빈 줄을 접어 실행할 줄만 복사. 브랜드 자산은 `assets/img/brand/`(워드마크·Nous 로고·대시보드 캡처 2장) + `assets/media/hermes-desktop.mp4`(공식 데모 21MB→720p 1.5MB 재인코딩, 자동재생·무음·반복). 사실은 전부 공개 저장소·공식 문서·각 사 공식 페이지를 1차 출처로 확인해 적었다 |

2026-06-21 이전에는 8개 페이지 공통 `하네스 · 도구 · 루프` 3단 토글이었으나, 4단계 토글에서 `루프` 탭과 `pages-loop` 그룹을 뺐다. 현재 하네스·도구 6개 페이지만 `하네스 | 도구` 2탭 토글을 달고, 루프 3개 페이지는 `pages-loop` 버튼 묶음(3링크)만 단독으로 보여 준다(토글 없음). 그룹 id·구성은 다음과 같다(참고).

| 묶음 | 그룹 id | 링크 (순서 고정) | 토글 |
|---|---|---|---|
| 하네스 | `pages-harness` | 하네스 엔지니어링(`harness-engineering.html`) · 도구(`claude-tools.html`) · 멀티 에이전트 소환(`harness-workflows.html`) | `하네스\|도구` 토글 |
| 도구 | `pages-tool` | CLAUDE.md(`agents-md-templates.html`) · 나만의 Skill 만들기(`skills.html`) · 스킬·MCP 플러그인(`code-plugin.html`) | `하네스\|도구` 토글 |
| 루프 | `pages-loop` | 루프 엔지니어링(`loop-engineering.html`) · Routines 예약 실행(`routines.html`) · 헤르메스 에이전트(`hermes-agent.html`) | 토글 없음, 버튼만 |

규칙:
- 토글 순서는 하네스 → 도구로 고정한다. 루프 그룹은 토글 탭에서 빠졌고, `loop-engineering`·`routines`·`hermes-agent` 세 페이지에서 `pages-loop` 버튼 묶음만 단독 표시한다.
- 하네스·도구 각 페이지는 자기 묶음의 탭을 기본 active로 두고, 해당 그룹만 표시한다(다른 한 그룹은 `style="display:none;"`).
- 탭은 `<button class="mode-tab" id="tab-{harness|tool}" role="tab">`이고 `switchMode(mode)`를 부른다(하네스·도구 6개 페이지). 루프 3개 페이지는 `switchMode`/`mode-tabs` 없이 `pages-loop`만 둔다(주의: `agents-md-templates`의 header-pages에는 `load-anim` 클래스가 더 붙어 있다).
- **토글을 누르면 그 묶음의 첫 페이지로 이동한다(2026-08-02).** 아래 3.11 참고.
- `.mode-tab`은 `<button>`이라 `border:none; background:none; font-family:inherit` 리셋이 반드시 들어가야 한다(누락 시 브라우저 기본 회색 배경이 보인다).
- 페이지 제목과 내비 라벨은 `멀티 에이전트 소환`이고, 본문 안에서는 `다이내믹 워크플로우`를 하네스 한 벌을 가리키는 개념어로 계속 쓴다.

`agent-design.html`(팀 설계)은 2026-06-08에 인덱스와 전 페이지 내비·링크·키보드 핸들러에서 제거했다. 파일은 `backups/agent-design.html`로 옮겨 git 추적에서 뺐다(`backups/`는 gitignore 대상 로컬 아카이브). 되살리려면 파일을 루트로 되돌린 뒤 `pages-design` 내비, index 자동화 카드, `ai-levels.html` 로드맵, 키보드 `5` 핸들러를 함께 복원한다. 그 자리는 `claude-tools.html`이 대신한다.

### 실전 예제 (골드 액센트, 좌측 보더 `#B8860B`)
인덱스의 실전 예제 섹션은 세 묶음으로 나뉜다. `글 다듬기`(AI 티 없이 사람 글로 만들기, 맨 앞) → `기본 예제`(바로 써먹는 실무 자동화) → `MCP 연결`(외부 도구와 연동하는 워크플로우). 2026-06-21에 7개 실전 예제 페이지(`ai-writing` + `기본 예제` 3 + `MCP 연결` 3)에 `글 다듬기 | 기본 예제 | MCP 연결` 3탭 토글과 상단 step-nav(`예제` 노드 active)를 달았다. `mode-tabs` + `switchMode(['writing','basic','mcp'])`, `pages-writing` 1링크(`✍️ 쓴 티 지우기`=ai-writing) / `pages-basic` 3링크 / `pages-mcp` 3링크. `글 다듬기`(ai-writing)는 `tab-writing`, 기본 예제 3페이지는 `tab-basic`, MCP 3페이지는 `tab-mcp` 기본 active. `harness-book`는 제너릭 `switchMode`(배열 순회형)라 일괄 수정 시 명시형 5개 페이지와 패턴이 다르다. 인덱스 실전 예제 섹션은 2026-06-21에 재배치했다. `기본 예제`(바로 써먹는 실무 자동화) → `MCP 연결`(외부 도구와 연동) → `심화 예제`(에이전트 팀으로 한 권 완성하기, 하네스 엔지니어링으로 책 쓰기 단독 카드) 순서다. 기본 예제 그룹은 `AI가 쓴 티를 지우는 법`(ai-writing, 첫 카드로 승격) → 뉴스 클리핑 → 구글 시트 대시보드, MCP 그룹은 PlayMCP → 법령 → 공시 순서로 고정한다. 옛 `글 다듬기` 묶음(ai-writing 단독 카드, 맨 앞)은 인덱스에서 없앴고 ai-writing은 기본 예제 첫 카드로 옮겼다. `harness-book`(책 쓰기)은 인덱스에서 `심화 예제` 라벨 아래 단독 풀폭 카드(`grid-template-columns: 1fr`)로 맨 하단에 둔다. 단, 7개 실전 예제 페이지 자체의 헤더 3탭 토글(`글 다듬기 | 기본 예제 | MCP 연결`)은 그대로다(인덱스 카드 배치만 바뀜). 2026-06-21에 MCP 3페이지의 `pages-basic`에 빠져 있던 뉴스 클리핑 링크를 채워 3링크로 통일한 것은 유지. 이전 `ai-writing`의 2링크 단방향 header-pages(`ai-sycophancy` 짝)는 3탭 토글로 대체됐다.

`seven-steps.html`(AI와 함께 일하는 7단계)은 2026-07-12에 만든 **실전 예제 캡스톤**이다. slide_library·casting·5color·korean·council 다섯 스킬을 순서대로 엮은 7단계 방법론을 서사로 푼다(`mcp-examples.html` 골격 클론, scroll-spy·task-card 아코디언 CSS/JS 재사용). sub-menu 4섹션(한눈에·7단계·무게추의 이동·다음 행동), 본문은 `content-section` 4개. `s-intro`(한눈에)는 nm-card 2장(대화 vs 일 + 결과물이 아니라 절차, 옛 s-why 합침), `s-steps`(7단계)는 **`task-card` 클릭 아코디언 7개**(`toggleTask`, step-1만 `open` 기본, /goal prompt-box는 step-1 안)+각 스킬 skill-pill 5, `s-shift`(무게추의 이동)는 nm-card 2장(무게추 role-grid 3 + 7번이 핵심 council/multi-persona 크로스링크·인용구, 옛 s-seventh 합침), `s-next`(다음 행동)는 ref-section 스킬5+CTA→harness-workflows(2026-07-12 "이 흐름을 직접 써 보기" 도입 카드 삭제). 섹션 병합으로 s-why·s-seventh id와 "암묵지를 절차로"·"판단의 자리" step-divider는 제거됨. `/goal` 한 줄 프롬프트 `prompt-box`(id `p-oneline`)는 별도 섹션이 아니라 **아코디언 step-1(목표를 정한다) 본문 안**에 있다(2026-07-12 사용자 "1단계 밑으로"). 옛 독립 "한 줄로" 섹션은 제거하고 연결 문장은 무게추 섹션 도입부로 흡수했다. step-nav `sn-final`은 자기 자신(seven-steps.html)을 가리킨다. GitHub 링크는 `github.com/airoasting/<folder>`이고 폴더는 실재(`slide_library`는 underscore). **예제 4페이지(mcp-examples·seven-steps·harness-book·company-brain)의 상단 헤더는 2026-07-12에 통일됐다: mode-tabs 토글을 전부 없애고 동일한 평탄 4링크 `.header-pages`(940px 4-menu 규격)를 쓴다: `MCP 연결`(grid, →mcp-examples) · `7단계`(체크리스트, →seven-steps) · `책 쓰기`(book, →harness-book) · `컴퍼니 브레인`(brain, →company-brain)**. 각 페이지는 자기 링크만 `active`. 아이콘 단일 출처는 index.html 각 카드. `.mode-tabs`/`switchMode`는 세 형제 페이지에서 미사용 dead로 남는다(제거 안 함). 인덱스에선 실전 예제의 MCP 연결 카드 바로 다음, 심화 예제 앞에 track-label `일하는 방식` + 풀폭 단독 카드로 둔다.

| 페이지 | 묶음 | 시간 | 난이도 | 특성 |
|---|---|---|---|---|
| `seven-steps.html` | 일하는 방식 | 10분 | 중급 | AI와 함께 일하는 7단계 방법론 캡스톤. 헤더 평탄 3링크·7단계 아코디언(위 문단 참고) |
| `ai-writing.html` | 글 다듬기 | 12분 | 중급 | AI가 쓴 티를 지우는 법. `news-clipping.html` 골격 클론. 2026-06-21에 헤더를 `글 다듬기 | 기본 예제 | MCP 연결` 3탭 토글로 교체(`tab-writing` 기본 active, `pages-writing` 1링크 `쓴 티 지우기`. 옛 2링크 단방향 header-pages는 폐기). sub-menu 8섹션(한눈에·말버릇·교묘한 패턴·장면으로·버릇 차단·사람의 몫·참고자료·다음 행동). AI 한국어 말버릇 8개(번역투·형용사·접속사·문장길이 + 명언공장·보편위로·판단회피·부풀리기), Before/After 표 3개, 금지어 프롬프트 2개(2026-06-18 프롬프트 박스 빈 줄 제거·규칙을 한 줄씩 붙임), 8 대 2 원칙. 2026-06-18 공개 연구 4건 인용: INTRO에 Jones &amp; Bergen(2024, arXiv:2405.08007 튜링 테스트 GPT-4 54%·판단 근거는 문체/정서)·Doshi &amp; Hauser(2024, Science Advances 10.7% 더 비슷=균질화), STEP1에 GPTZero 버스티니스·Kobak 외(2025, Science Advances 과잉어휘 13.5%) tip-box, 끝 `#refs` 참고자료 섹션(ref-link 4개, 영어 연구지만 한국어에도 동일 원리 단서). 워크플로 step의 "당신"은 4.10 따라 "사람/자기"로 교체(예시 인용문 안 "당신"은 유지). 2026-06-19 스타일을 `ai-hallucination.html` idiom으로 정렬: 왼쪽 컬러 띠지 전면 제거(h2·tip-box border-left 삭제 [[no-left-color-bar-cliche]]), 색은 라벨 점(dot ::before 7px)으로 이동(tip-label·inset-label), 카드·박스에 hairline 테두리(`--hairline:#D4CEC4`) 추가, 그림자 토큰을 ai-hallucination 수준으로 약화(2px 소프트), step-badge shimmer 애니메이션 제거(정적 뱃지), h2는 weight 800·#2A2520. 강조색은 페이지 정체성 위해 테라코타(`#B35535`) 유지(ai-hallucination의 본문 주황 `#D97757`은 미적용, 헤더 그라데이션은 두 페이지 동일). [[korean]] 스킬·`multi-persona.html` 크로스링크. 인덱스에선 `기본 예제` 그룹 첫 카드(2026-06-21 옛 `글 다듬기` 단독 묶음에서 이동). 단 페이지 헤더 토글은 여전히 `글 다듬기` 탭(`tab-writing`) |
| `news-clipping.html` | 기본 예제 | 15분 | 중급 | 뉴스 클리핑 자동화. `google-sheets-dashboard.html` 골격 클론. 테마→Tier1 매체→주기→포맷→스킬→루틴 6단계. 철강(steel-brief) 예시로 끝까지 관통. sub-menu 8섹션, STEP5·6은 `skills.html`·`routines.html`로 연결. 인덱스 기본 예제 그룹 둘째 카드(ai-writing 다음) |
| `google-sheets-dashboard.html` | 기본 예제 | 12분 | 중급 | 골드 액센트 카드 |
| `harness-book.html` | 기본 예제 | 20분 | 고급 | 책쓰기 실전, 자체 sub-menu 최다. 인덱스에선 `심화 예제`(에이전트 팀으로 한 권 완성하기) 라벨 아래 단독 풀폭 카드(`grid-template-columns: 1fr`)로 실전 예제 맨 하단(2026-06-21 기본 예제 그룹에서 분리). 페이지 헤더 토글은 여전히 `기본 예제` 탭 |
| `playmcp-kakao.html` | MCP 연결 | 12분 | 중급 | Claude Desktop **왼쪽 사이드바 Customize(사용자 지정)→커넥터→커넥터 둘러보기**에서 `playmcp` 검색→PlayMCP 추가→연결→카카오 로그인→권한 동의(URL 직접 입력·터미널 방식 아님. 진입은 `설정`이 아니라 `Customize(사용자 지정)`). 5단계(도구함·커넥터·첫 테스트·루틴으로 만들기·운영+트러블슈팅, 옛 STEP1 준비 제거). STEP1 도구함에 카카오톡 `+ 도구함에 추가` 다크 카드(노란 TALK 인라인 SVG, max-width 460px) + PlayMCP 공식 링크(skill-preview, INTRO에서 이동). STEP2에 6컷 연결 스크린샷 `assets/kakaotalk.webp`(사용자 제공, 2048px). STEP4 루틴(id `step-routine`)은 7시 57분 Routines 예약(첫 테스트에서 분리). STEP5는 운영 기준 카드+트러블슈팅 FAQ 카드 2장 병합(옛 `#faq` 구분선·앵커 제거). 나와의 채팅방 전송 + Routines 매일 7시 57분 응원(정각 회피=예약 지연 최대 30분). 면책 박스는 `주의 사항`(좌측 컬러 띠지 제거, [[no-left-color-bar-cliche]]). 참고자료는 PlayMCP·카카오 발표 2개만(Anthropic·MCP 링크 삭제). 주의: sub-menu/roadmap 표시 번호 1~4지만 섹션 id는 `step2`~`step5` 유지(앵커 깨짐 방지) |
| `korean-law-mcp.html` | MCP 연결 | 10분 | 중급 | Claude Desktop Customize 커넥터 추가. 법제처 Open API |
| `stock-messenger.html` | MCP 연결 | 15분 | 고급 | 기업 공시 데이터 분석. DART 스킬 + 텔레그램 봇 |

### AI 백과사전 (header-pages: 4개 · 940px)
| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `file-types.html` | 필요할 때 | 참고 | 파일 10종 비교. AI가 읽고 쓰는 관점으로 재편한 리더 우선(reader-first) 카탈로그. 본문에서 "당신" 금지 (4.10). **2026-07-25 개편**: sub-menu 6섹션(비교표·마크다운·설정데이터·웹·스크립트·한글문서). 5번 `#s5` 한글 문서 섹션 신설(.hwp 이진 CFB+zlib vs .hwpx zip+XML, hwpx가 AI에 유리한 이유 3카드, 저장법 `note-panel`). 비교표 10행 + `rel-badge` 3종(ai-read·ai-gen·ai-conv). **파일 카드 10장 각각에 `.origin-block`**(이 형식의 내력: 언제·누가·왜 + hairline 아래 이름의 유래) + 헤더 우측 `.file-year` 연도. 유래를 하단 별도 섹션으로 모으지 않고 해당 확장자 카드 안에 두는 것이 확정된 구조다. 이모지 전량 인라인 라인 SVG 교체(3.x 규격), 페이지 전용 애니메이션(reveal·stagger·load-anim·hover rotate) 제거 |
| `license-compare.html` | 필요할 때 | 참고 | 오픈소스 라이선스 5종. 상단에 제약 수위 신호등 모델(초록 MIT·Apache / 노랑 LGPL / 빨강 GPL·AGPL). sub-menu 5섹션(신호등·비교표·허용적·카피레프트·선택 가이드) |
| `glossary.html` | 필요할 때 | 참고 | AI 용어 사전 68선(6막 구성). 6막 하네스·운영에 `피지컬 AI` 추가 |
| `token-saving.html` | 15분 | 참고 | 토큰 아껴 쓰는 법(2026-08-26 신설). `file-types.html` 골격 클론. sub-menu 6섹션(구성과 단가·먼저 측정·대화 정리·모델과 깊이·캐시 지키기·증상별 처방). 비용을 `대화의 크기 × 캐시 적중률` 두 변수로 환원하는 것이 페이지의 뼈대다. 요청 3계층 표 + 단가 막대 4행(`.rate-list`, 캐시 읽기 0.1배·표준 1.0배·5분 쓰기 1.25배·1시간 쓰기 2.0배) + 모델별 100만 토큰 단가 표 + 캐시 TTL 표 + 증상별 처방 표 7행 + 적용 순서 5단 + 체크리스트 6개(localStorage 키 `token-saving-checklist`). 캐시를 깨는 행동·지키는 행동은 `.compare-grid` 2열 대조. 수치·명령·설정값은 전부 code.claude.com/docs/en/costs, /prompt-caching, platform.claude.com 단가표를 1차 출처로 대조해 적었다(Rule 9). 페이지 전용 컴포넌트: `.tk-grid`/`.tk-card`/`.cmd`/`.tk-tag`/`.rate-*`/`.order-list`/`.tk-snippet`. 인라인 `code`에 `overflow-wrap: anywhere`를 걸어야 한다(`CLAUDE_CODE_SUBAGENT_PROMPT_CACHE_TTL` 같은 긴 이름이 375px에서 판면을 밀어낸다). 2026-08-29에 인덱스 카드가 `AI 백과사전`에서 `참고 · 비용·보안·법률` 섹션 첫 카드로 옮겨졌다. 그에 맞춰 header-pages도 940px 4-menu에서 700px 3-menu(`토큰 아껴 쓰기`·`보안 가이드`·`인공지능기본법`)로 내렸고, 백과사전 세 페이지는 3링크(`file-types`·`license-compare`·`glossary`)로 되돌렸다 |

2026-08-26에 `token-saving.html`을 추가하며 백과사전을 4-menu(940px)로 올렸다가, 2026-08-29 인덱스 재배치로 `token-saving`이 비용·보안·법률 섹션으로 옮겨져 백과사전은 다시 3-menu(700px, `file-types`·`license-compare`·`glossary`)로 돌아왔다.

2026-06-13에 `security-guide.html`을 백과사전에서 빼서 아래 `보안·법률` 섹션으로 옮겼다. 그래서 백과사전은 3-menu(700px)로 내렸다. 같은 날 섹션 이름을 `하네스 엔지니어링 백과사전`에서 `AI 백과사전`으로 바꿨다. 2026-06-18에 인덱스에서 `디자인·시각화 갤러리` 섹션을 `AI 백과사전` 섹션 위로 올렸다. 2026-06-19에 인덱스 `AI 제대로 검증하기` 섹션을 1단계 안 검증 묶음으로 옮기고, `AI 백과사전`을 맨 하단으로 내렸다(하단 순서: 후기 → 쇼케이스 → 갤러리 → 보안·법률 → AI 백과사전). 2026-06-20에 인덱스 `수강생 쇼케이스` 섹션에 있던 `해커톤 위너` 카드를 별도 `클로드 해커톤 쇼케이스` 섹션(`#section-hackathon`)으로 분리했다. 수강생 쇼케이스는 시·스탑워치 2카드(`1fr 1fr`), 해커톤 쇼케이스는 카드 1개라 1열 풀폭(`grid-template-columns: 1fr`). 하단 순서: 후기 → 수강생 쇼케이스 → 해커톤 쇼케이스 → 갤러리 → 보안·법률 → AI 백과사전.

### 비용·보안·법률 (header-pages: 3개 · 700px)
2026-06-18에 `ai-hallucination.html`을 추가하면서 트랙이 한때 3-menu(700px)로 올라갔다가, 2026-06-19에 다시 2-menu(490px)로 정리됐다. 현재 `security-guide`·`ai-basic-law` 두 페이지가 2링크 내비(`보안 가이드`·`인공지능기본법`, 490px)를 공유한다. `ai-hallucination`은 1단계 검증 묶음으로 옮겨 `기본기 | 검증` 토글을 쓰므로, 보안·법률 두 페이지 내비에서 `환각 줄이기` 링크를 빼 단방향 참조를 없앴다.

| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `ai-hallucination.html` | 필요할 때 | 참고 | AI 환각을 벗어나는 법. `ai-basic-law.html` 골격 클론. 사건 케이스(빅4 가짜 각주: EY 27개 중 16개·KPMG 45개 중 5개 정확·법정 판례 1,450건+, GPTZero 조사)를 거울 삼아 실전 검증법으로 전개. sub-menu 7섹션(한눈에·무슨 일이·왜 생기나·벗어나는 법·Claude로·점검표·참고자료). 환각 4유형 overview 표, case-ledger 8건(컨설팅 EY·KPMG·Deloitte + 법정 Air Canada·미국 2023 Mata v. Avianca/코언·미국 2024 Hancock·한국 2026 법원 대응 + 산업 확산, kind-fail·kind-spread·kind-pass 사용, 한국·미국·세계 영역별·1차 출처), 원인 2층(모델·조직), 5가지 습관(topic-card+예시), Claude 연결(웹검색·검증프롬프트·`multi-persona.html`·`claude-tools.html`·`harness-workflows.html` 크로스링크), 납품 전 check-list 8개. 끝 CTA는 `security-guide.html`로 크로스링크. 공개 보도 기반 참고 자료임 명시 |
| `security-guide.html` | 필요할 때 | 참고 | 비개발자용 AI 협업 보안. overview 표 + 5섹션 + 판례. sub-menu 7개. 끝 CTA는 `ai-basic-law.html`로 크로스링크 |
| `ai-basic-law.html` | 필요할 때 | 참고 | 인공지능기본법 안내. 히스토리 타임라인 + 주요국 비교 + 의무 주체 3분류 + 5대 의무 표 + 고영향 카드 하단 법 제2조 제4호 원문(가~차) 블록 + FAQ 17문 + 자가점검·참고자료(지원데스크 + 사례집 직접 링크 2개). sub-menu 7개. `security-guide.html` 골격 클론. 끝 CTA는 `security-guide.html`로 크로스링크. 출처는 과기정통부·KOSA 지원데스크 사례집과 가이드라인. 유권해석 아닌 참고 자료임을 본문에 명시 |

### 부록 · 컴퍼니 브레인 (header-pages: 2개 · 490px)
2026-08-26 신설. 인덱스 맨 끝 `#section-brain`(배지 `부록`)에 두 장을 둔다. 전략 컨설턴트 워크샵용으로 만든 묶음이라 다른 트랙과 청중이 다르다. **부록 트랙이므로 step-nav를 넣지 않는다**(`glossary`·`security-guide`·`file-types`와 같은 규약). 두 페이지는 `pages-brain` 2링크 내비를 공유한다.

두 장의 역할이 겹치지 않게 나뉘어 있다. `company-brain`은 위키 한 벌을 처음부터 끝까지 **짓는 법**이고, `company-brain-tasks`는 지은 것을 **재는 법과 쓰는 법**이다. 새 내용을 넣을 때 어느 쪽에 속하는지 먼저 판정한다.

**카드 페이지의 무게 중심은 측정이다 (2026-08-26 사용자 지적).** 처음에는 `실습 카드 7가지`라는 이름으로 만들었는데, 일곱 장 중 넷이 측정이고 셋이 아니어서 이름이 내용과 어긋났다. `점검과 운영 7가지`로 바꾸고 카드 순서도 **측정 넷을 앞으로** 옮겼다(01 정확도 전후 비교 · 02 부패 저항 · 03 재식별 위험 · 04 위키 건강검진 → 05 코드 없이 쓰기 · 06 사실과 판단 분리 · 07 동결과 승계). 카드를 더할 때 이 둘 중 어디에 속하는지 먼저 정하고 해당 묶음 안에 넣는다.

| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `company-brain.html` | 25분 | 중급 | 2026-07-12에 `backups/`로 뺐다가 2026-08-26에 되살렸다. **INTRO 첫 블록은 `.def-box` 용어 정의다**(2026-08-26 사용자 지적: 제목에만 있고 본문에서 한 번도 정의되지 않았다). 정의 → 이 사이트가 예시 → 이름의 출처 → 대응표 → 도식 순서를 지킨다. INTRO → 4역할 설계(정리가·편집자·사서·안내데스크) → 갱신 루프(증분, `memory/` 처리 이력) → 폴더·파일 구조 → Claude Code 실행 4단계 → 검증 6항목 → 지식 그래프 보너스. **되살리면서 고친 곳 다섯이다.** ① 구조의 정본이 Karpathy `llm-wiki`(2026-04-04 gist)임을 명시하고 `raw·wiki·schema` 세 층, `ingest·query·lint` 세 동작을 이 실습 용어에 잇는 대응표를 넣었다. ② `wiki-config.md` 6칸을 **7칸**으로 늘렸다(03 자기완결 규칙 신설, 이후 번호 밀림). ③ `lint`가 이 페이지에 없다는 사실을 검증 섹션에서 인정하고 실습 카드 06번으로 보낸다. ④ og·twitter 메타를 현행 표준 문자열로 교체하고 `assets/js/analytics.js`를 넣었다(빠져 있었다). ⑤ `assets/about-modal.js` → `assets/js/about-modal.js` 경로 교정(이 페이지만 옛 경로였다). 지식 그래프 샘플 주소는 `blog.airoasting.com/insights/graph.html`(2026-08-26 vercel 주소에서 변경) |
| `company-brain-tasks.html` | 과제별 | 중급 | 2026-08-26 신설. `cowork-tasks.html` 골격 클론(`.task-card` 아코디언). 카드 7장을 두 묶음으로 나눈다. **믿어도 되는지 재보기**(01 사전 한 장으로 재보기 `여기부터 시작`, 02 틀린 한 줄 심어 보기, 03 마스킹 뚫어 보기, 04 위키 건강검진) · **쓰고 남기기**(05 코드 없이 한 주 써 보기, 06 사실과 판단을 나눠 쓰기, 07 끝난 프로젝트를 얼려서 남기기). 카드 id는 `task-01`~`task-07`이고 서브메뉴 `data-sec`가 각 묶음 첫 카드(`task-01`·`task-05`)를 가리킨다. 01번은 arXiv 2604.25149(4KB 마크다운 한 장이 프런티어 모델 3종 정확도를 45%대→68%대로) 실험을 자기 자료로 축소 재현하는 설계다 |

**함정 셋.** ① 서브메뉴 스크롤 스파이는 `data-sec`가 **카드 id**를 가리켜야 돈다. `step-divider`에 id를 달면 `sectionTop()`이 previousElementSibling에서 배지를 못 찾아 착지가 어긋난다. ② `.task-command`는 원래 한 줄 프롬프트용이라 줄바꿈이 죽는다. 이 페이지 프롬프트는 여러 줄이라 `white-space: pre-wrap`을 더했다(`word-break: keep-all` + `overflow-wrap: anywhere` 동반). ③ `company-brain.html`은 백업에서 되살린 파일이라 스크립트 경로가 옛 관행(`assets/about-modal.js`)이었고 `analytics.js`가 아예 없었다. **백업에서 페이지를 되살릴 때는 head의 `ANALYTICS-STD` 블록과 `assets/js/` 경로를 현행 페이지와 대조한다.**

### 검증 묶음 (1단계 안 `🔍 검증` track-label, 카드 배지 색 `#B35535`)
2026-06-18 신설(옛 인덱스 맨 하단 `AI 제대로 검증하기` 섹션). 2026-06-19에 1단계 안 두 번째 묶음(`🔍 검증`)으로 흡수했다. `AI가 그럴듯하게 동의하거나 지어낼 때, 답을 그대로 믿지 않고 검증하는 법`이라는 한 주제로 동조와 환각을 묶었다. 인덱스 카드 2장은 평범한 `.card`(왼쪽 띠지 없음, 시간·난이도 배지 있음: 동조 8분 입문 / 환각 12분 중급)다. 두 페이지 모두 헤더에 `기본기 | 검증` 토글을 달고 `tab-verify` 기본 active다.

| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `ai-sycophancy.html` | 8분 | 입문 | AI의 동조(sycophancy)를 줄이는 법(옛 `ai-skepticism.html`, 2026-06-18 개명·전면 재작성). `news-clipping` 골격 클론. 2026-06-19 헤더를 `기본기 | 검증` 2탭 토글로 교체(pages-basic 3링크 / pages-verify 2링크, 700px, `tab-verify` 기본 active). 공개 연구 6건 인용(Anthropic 2310.13548 · DeepMind 2308.03958 · SycEval 2502.08177 · ELEPHANT 2505.13995 · OpenAI GPT-4o 2025.4 롤백 · Mass General Brigham npj Digital Medicine 2025 DOI:10.1038/s41746-025-02008-z). sub-menu 6섹션(한눈에·동조란·왜 생기나·줄이는 법·점검표·참고자료 sm-sub `논문 여섯`. STEP4 `Claude로` 크로스링크 섹션은 2026-06-18 삭제). 동조 두 유형(진보/퇴행·사회적), 원인(RLHF·스케일·단기 피드백), 줄이는 법 5(결론 숨기기·비판 허락·점수·"다시"·역할 분리), 점검표 5(키워드+한 줄·경어), 참고자료 ref-link 6(읽는 법 박스 삭제). SycEval 수치(58.19%·퇴행 14.66%·지속 78.5%)를 본문에 인용. 2026-06-25 STEP2(왜 생기나)에 검증된 fact 3건을 스토리텔링으로 추가: ① Anthropic 선호 데이터 finding(사람·보상 모델 모두 잘 쓰인 동조 답을 정답보다 더 자주 선호), ② GPT-4o 인셋에 정확한 날짜(4/25 업데이트→4/29 롤백)·올트먼 인정·원인(단기 피드백+"사용자 분위기에 맞추라" 시스템 프롬프트) 보강, ③ 신규 인셋 `실제 연구 · 2025년 10월` Mass General Brigham 의료 동조(GPT·Llama 5모델, 약물 대체 illogical 요청 50개, GPT 100% 가짜 안내문). 이 의료 연구는 STEP3 prompt #2(비판 허락)에서 콜백으로 효과 증명("거절해도 된다+사실부터 확인" 한 줄로 GPT 올바른 거절 94%, 파인튜닝 99~100%). 왼쪽 띠지(h2·tip-box border-left) 제거 [[no-left-color-bar-cliche]] |
| `ai-hallucination.html` | 12분 | 중급 | 본문 상세는 위 `보안·법률` 표 행 참고. 2026-06-19 헤더를 `기본기 | 검증` 토글로 교체(`tab-verify` 기본 active)하고 보안·법률 트랙에서 검증 묶음으로 옮겼다. 인덱스 카드도 1단계 검증 묶음에 둔다 |

### 디자인·시각화 갤러리 (header-pages: 3개)
| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `eda-gallery.html` | 참고 | 참고 | EDA 차트 갤러리 28종 |
| `component-gallery.html` | 참고 | 참고 | UI 컴포넌트 40종 |
| `ui-design.html` | 참고 | 참고 | UI 디자인 트렌드 30종 |
| `icon-gallery.html` | 참고 | 참고 | SVG 라인 아이콘 300종, 11개 분류. 발행본은 `icon-gallery-src/`가 빌드한다 |

**갤러리는 카드 제목에서 "갤러리"를 빼고 페이지 제목에 넣는다 (2026-08-02 `icon-gallery` 적용).** 인덱스 카드는 좁아서 긴 제목이 서너 줄로 깨진다. 카드는 `SVG 아이콘 300`, 페이지 `h1`과 `<title>`은 `SVG 아이콘 갤러리 300`이다. **`icon-gallery.html`의 `h1`은 `icon-gallery-src/build-icon-gallery.mjs`가 생성하므로 발행본만 고치면 다음 빌드에서 되돌아간다.** 빌더 템플릿을 같이 고친다.

아이콘 개수는 `comp-card` 수 · 분류 배지(`cat-count-n`) 합 · `data-cat` 집계 세 곳이 모두 같아야 한다(현재 300으로 일치). 소스 `icon-data.mjs`의 `CATEGORIES`는 12개인데 첫 항목이 필터 탭 `all 전체`라 실제 분류는 11개다.

### 경영 시뮬레이션 (header-pages: 2개, 360px)
2026-08-01에 클라이언트 강의 납품본(`cases/lge`·`cases/guess`의 `sim-dashboard.html`)을 공개용으로 옮겨 만든 한 쌍이다. **인덱스에서는 링크하지 않는다.** 같은 날 `section-gallery`에 카드 두 장을 넣었다가 사용자 지시로 도로 뺐다. 두 페이지는 서로의 `가전 ↔ 의류` 헤더 토글로만 오간다(갤러리 4페이지 토글과는 공유하지 않는다). back-link는 둘 다 `index.html#section-gallery`로 남겨 뒀다. 되살리려면 인덱스 갤러리 섹션에 카드 두 장을 다시 넣고 섹션 부제를 대시보드까지 포함하는 문장으로 바꾼다.

| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `cost-sim-appliance.html` | 참고 | 참고 | 가전 원가 시뮬레이션. 지표 6종(환율·구리·유가·철강·알루미늄·SCFI) EDA + 가상 제품 3종 원가 시나리오. 원가 가중치는 국내 대형 가전사 공시를 참고한 교육용 가정이며 실명은 전부 익명화 |
| `cost-sim-apparel.html` | 참고 | 참고 | 의류 원가 시뮬레이션. 지표 6종(환율·유가·SCFI·면화·양모·가죽) EDA + 가상 제품 3종. 회사 설정 자체가 가상이고, 원본에 있던 실명 비상장사 감사보고서 수치는 업종 일반 구조로 다시 씀 |

**원자재 시계열은 실측 공개 데이터이고, 회사와 제품과 가중치는 가정이다.** 이 경계가 페이지 안 세 곳(히어로 설명, 가중치 노트, 하단 고지·출처)에 모두 적혀 있어야 한다. 한 곳만 고치면 다른 곳이 실명 시절 문구로 남는다.

### 수강생 쇼케이스 (header-pages: 3개, 700px)
2026-06-20에 `hackathon.html`을 추가하면서 헤더 토글이 2개에서 3개로 늘었다(`시로 쓴 자화상`·`스탑워치 쇼케이스`·`해커톤 위너`, 아이콘 없는 텍스트 링크). 3개 페이지가 같은 토글을 공유하므로 `.header-pages` max-width를 560px→700px로 올렸다. 토글 링크 추가·폭 변경은 세 페이지(`showcase`·`showcase-poems`·`hackathon`)를 함께 고친다.

| 페이지 | 시간 | 난이도 | 특성 |
|---|---|---|---|
| `showcase-stopwatch.html` | 참고 | 참고 | 수강생 결과물 모음(2026-07-11 `showcase.html`에서 리네임). 41개 스탑워치 iframe 라이브 임베드(`assets/stopwatch/*.html`, 파일 번호는 01~49에서 삭제분을 뺀 값이라 개수와 다르다), 7유형 분류(캐릭터 4·여름 4·명화&럭셔리 8·클래식 시계 6·스포츠&오락실 10·우주 3·컴퍼니 6). 카운트 동기화 7지점: 헤더 부제·intro h2·CTA 한글 수사·sub-menu `sm-count` 3곳·`cat-count` 3곳, 그리고 바깥 `index.html` 카드 설명과 `README.md` 표 |
| `showcase-poems.html` | 참고 | 참고 | 멀티 페르소나 실습으로 완성한 시 23편 모음(`AI 시대, 일하는 사람들의 하루`). CTA는 `multi-persona.html`로 크로스링크 |
| `hackathon.html` | 참고 | 참고 | 클로드 코드 해커톤 우승작 모음. 인덱스에서는 별도 `클로드 해커톤 쇼케이스` 섹션 카드로 진입. 소제목은 `Opus 시리즈 · 전 세계가 클로드 코드로 만든 우승작`(2026-06-20 `Built with` 제거). `showcase-stopwatch.html` 골격 클론(iframe 무대 대신 `.hk-card` 텍스트 카드). Opus 4.6(5선)·4.7(6선)·4.8 Build Day(3선) 세 시리즈를 sub-menu 3노드(s1·s2·s3) + 시리즈별 카드로 구성. 각 카드는 서비스명·인물·직업·설명 불릿, 수상 배지(`.hk-award`), 데모 영상 링크(`.hk-links` 안 `.hk-video`, 빨강 ▶ pill), 시리즈마다 공식 발표 원문 링크(`.series-meta`). 데이터·링크 출처는 claude.com/blog 해커톤 발표 3건. 수상 배지 5개: 4.6 TARA=Keep Thinking 상·Conductr=Creative Exploration 상, 4.7 Virtual Puppet Theater=Most Creative Use of Opus 4.7·MaestrIA=Keep Thinking 상·ARIA=Best Use of Claude Managed Agents(슬라이드엔 4.7만 있었지만 블로그 기준 4.6 특별상 2개 추가). 데모 영상은 14개 우승작 전부 연결(4.6 5 + 4.7 6 + 4.8 3). 사용자가 4.7·4.8 영상 URL을 제공, WebFetch로 영상 제목 확인해 서비스명에 매칭. 서비스명 자체는 프로젝트 URL을 안 걸고 텍스트로 둠. `.hk-award`는 모바일에서 `.hk-id { min-width:62% }`로 밀어내 자기 줄로 내림(긴 배지 우측 넘침 방지) |

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

**아이콘 표현 = 박스 없는 인라인 SVG 라인아이콘 (2026-07-11 이모지 전면 교체)**: 카드·서브 메뉴 아이콘은 더 이상 이모지가 아니라 24×24 viewBox 인라인 `<svg>`(`stroke="currentColor" stroke-width="1.9" 라운드 캡`)를 `.card-icon`/`.hpl-icon` 안에 직접 넣는다. 처음엔 흰 타일 버튼이었으나, 뉴모피즘 카드와 어울리지 않아 **타일(배경·그림자)을 전부 없애고 라인아이콘만 남기는 것으로 확정**했다. 크기는 옆 글자에 맞춘다.
- `.card-icon`(밝은 콘텐츠 카드): 배경·그림자 없음, `color:var(--ant-orange)`, svg 21×21(모바일 19). 호버 시 `scale(1.08)`. 다운로드/외부 카드의 기존 SVG 10종은 그대로 두고 이모지만 교체했다.
- `.hpl-icon`(어두운 헤더): 배경 없음, `color:#fff`(흰 라인아이콘), svg 16×16(모바일 14).
- `.newsletter-section .card-icon`(인덱스 하단 어두운 카드): 배경 없음, `color:#f3d3b4`(피치, 호버 `#ffe8d2`), svg 19×19.
- `.card-title-row`: `gap:7px`(아이콘↔제목), `margin-bottom:13px`(제목 아래).
- 새 카드 추가 시 같은 규격(24 viewBox·1.9 stroke)의 라인아이콘을 그려 넣고 단일 출처 원칙대로 전 페이지 `.hpl-icon`에 전파한다.

| 메뉴 수 | 기준 페이지 | `.header-pages` max-width | 각 버튼 폭 | 총합 |
|---|---|---|---|---|
| 2개 | `orientation.html`, 2단계 확장 프로그램(`chrome-plugin`·`office-plugin`)·스마트폰 앱(`claude-mobile`·`chatgpt-mobile`) | 490px | 약 238px | 490px |
| 3개 | `ai-fluency.html`, 백과사전 트랙(`file-types`·`license-compare`·`glossary`), 비용·보안·법률 트랙(`token-saving`·`security-guide`·`ai-basic-law`) | 700px | 약 224px | 700px |
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
- `.hero-inner`가 없는 페이지(`ai-levels.html` 같은 경우)는 `.header-pages`에 직접 절대값(`700px` 또는 `490px`)을 적용한다. 비율(`70%`)을 쓰면 헤더 전체 폭의 70%가 되어 다른 페이지와 어긋난다.

금지 사항:
- 페이지별 임의 폭(`70%`, `64%`, `960px` 같은 값)을 그대로 두지 않는다.
- 버튼별 `min-width: 130~200px` 같은 잔여 값으로 균등 분배를 깨뜨리지 않는다.
- `gap`은 `14px`로 고정한다.

**한 트랙의 헤더는 CSS 규칙 단위로 같아야 한다 (2026-08-02).** 마크업 구조가 같아도 페이지마다 다른 계보의 CSS가 섞여 들어오면 모바일에서만 어긋난다. 2단계 6개 페이지가 그랬다. 다섯 개는 규칙이 완전히 같은데 `office-plugin.html` 하나만 `header` 패딩(`24px 18px 26px` + 하단 라운드), 모바일 `h1`(26/22px), 모바일 `header p` 축소(14/13px), `back-link` 여백(12px), `header-pages` `flex-wrap: wrap` + `gap: 6px`, `step-nav` 여백, 진입 애니메이션 곡선(`0.7s cubic-bezier`), `header::after` 글로우 부재까지 달랐다. 데스크톱에서는 우연히 같아 보여 눈으로는 못 잡는다.

점검 방법: 눈이나 마크업 비교가 아니라 **CSS 규칙 집합을 미디어 쿼리 단위로 뽑아 차집합을 낸다**. `header`·`h1`·`back-link`·`header-pages`·`header-page-link`·`step-nav`·`track-toggle`·`hero-video` 선택자를 `(top)` / `@media` 컨텍스트별로 모아 비교하면 어느 페이지가 튀는지 바로 나온다. 통일 후 차집합이 0이어야 한다.

애니메이션을 기준에 맞출 때 함께 볼 것: 기준 계보는 `opacity: 0` + `forwards`로 시작한다. 그 페이지에만 `@media (prefers-reduced-motion: reduce)`가 헤더에 `animation: none`을 걸고 있으면 모션을 끈 환경에서 헤더가 통째로 사라진다. 그런 페이지에는 같은 규칙에 `opacity: 1`을 함께 넣는다.

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
- 실전 예제 골드: `#B8860B` (좌측 보더 3px, index 카드 한정). **글자에는 쓰지 않는다.** 12% 틴트 위에서 2.4:1이라 글자는 `#7F5807`(4.68:1)을 쓴다

**인덱스 배지 세 층위 (2026-08-02 확정).** 배지가 세 종류인데 서로 색이 겹치면 무엇이 상위인지 읽히지 않는다. 층위별로 역할을 나눈다. 셋 다 `index.html`의 CSS 한 줄이 단일 출처이므로 그 줄만 고치면 전부 바뀐다.

| 층위 | 선택자 | 색 | 원칙 |
|---|---|---|---|
| 섹션 배지 | `.section-num` | 진단 청록 `#3E7D77`(4.77:1) · 단계 `--accent-aa #A84726`(5.84:1) · 예제 골드 `#8B6914`(5.09:1) · 후기/쇼케이스 보라 `#6A4A86`(7.15:1) · 그 밖 `--ink-faint #6E6760`(5.57:1) | 색을 갖는 유일한 층. 흰 글자 |
| 트랙 배지 | `.track-label-badge.*` (11종 공용) | 바탕 `#DAD5CC` · 글자 `#423D37` | 섹션 배지보다 **연하다**. 무채색 한 가지로 통일하고 색은 갖지 않는다 |
| 난이도 배지 | `.badge-level.beginner/intermediate/advanced` | `#E4EBF1`/`#3C5A70` · `#C2D5E3`/`#1F4056` · `#3F6D8C`/`#FFF` | 순서가 있는 값이라 **한 색상(슬레이트 블루)의 명도 3단계**로 서열을 만든다 |

- 트랙 배지 바탕을 밝히면 원래의 흰 글자가 읽히지 않는다. 바탕과 글자를 항상 같이 바꾼다.
- 난이도를 색상 셋으로 나누지 않는다(초록/노랑/빨강 식). 순서형 값이므로 색상을 바꾸면 서열이 사라진다. 웜톤 카드 배경에서 유일한 쿨톤이라 난이도만 눈에 들어오고, 주황(섹션)·회색(트랙)과 겹치지 않는다.
- `.badge-level.reference`(참고, `#E8E1D6`)와 `.selfhost`(별도 설치형, 청록)는 난이도가 아니라 분류·제공 방식이므로 척도 밖 색으로 남긴다.
- 모든 배지 조합은 자기 바탕 위에서 4.5:1 이상 대비를 지킨다(현재 4.62~7.35:1).
- **단계 배지에 `--ant-orange`를, 그 밖 배지에 `#888`을 쓰지 않는다** (2026-08-12 감사에서 교정). 흰 글자를 얹으면 각각 3.12:1과 3.54:1로 AA에 못 미친다. 이 두 값은 위 표가 만들어진 뒤에 재검증 없이 들어와 "4.62~7.30:1"이라는 위 문장과 어긋나 있었다. 배지 색을 새로 추가하거나 바꿀 때는 반드시 흰 글자 대비를 다시 재고 이 표의 괄호 값을 갱신한다. 자세한 절차는 3.16에 있다.

**ChatGPT·Codex 식별색은 블루다 (2026-08-02 확정).** 사이트 전체에서 앤트로픽 계열은 주황, 오픈AI 계열(ChatGPT·Codex)은 블루로 나눈다. 값은 표지 마스코트 로봇(`assets/logos/robots.png` 왼쪽)의 몸체 색에서 뽑았다. 이전에 쓰던 초록(`#0F8A6C`·`#10A37F`)은 전부 걷어냈으니 다시 쓰지 않는다.

**원본은 브랜드가 등장하는 순간에만 쓰고, 본문에는 채도를 낮춘 값을 쓴다.** 마스코트 블루는 채도가 88%인데 사이트 주황은 63%다. 원본을 본문에 그대로 깔면 웜 베이지 배경(`#EDEAE4`, 색상 37°) 위에서 혼자 튀어 같은 디자인 시스템으로 읽히지 않는다. 색상은 212°로 두고 채도만 주황에 맞춘 값을 본문용으로 파생시킨다.

**블루는 네 값이 전부다.** 사이트 어디서든 이 표 밖의 파랑을 새로 만들지 않는다. 주황과 역할이 1대 1로 대응하므로, 파랑을 고를 때는 "같은 자리에 주황이라면 무엇을 썼을까"를 먼저 보면 된다.

| 역할 | 블루 | 대응하는 주황 | 비고 |
|---|---|---|---|
| 도구 스위치 버튼 | `#3890F2` → `#1F6FD0` 그라데이션 | `#D97757` → `#C4613E` | 마스코트 원본. **이 한 자리에서만 쓴다** |
| 면 채움 · 아이콘 · 배지 (`--ant-orange`) | `#4C8DD6` (rgb `76,141,214`) | `#D97757` | 212° / 63% / 57%. 주황과 채도가 같다. 흰 글자 3.45:1 |
| 그라데이션 끝 · 채운 면의 hover (`--ant-orange-2`) | `#2A6EBB` | `#C4613E` | |
| 밝은 바탕 위 글자 (`--ant-orange-text`) | `#1A5FBF` | `#B0522F` | 본문 대비 5.09:1 (주황 4.27:1) |
| 연한 바탕 · 테두리 | `rgba(76,141,214,α)` | `rgba(217,119,87,α)` | α 값을 주황 쪽과 맞춘다 |

- **원본 `#3890F2`는 도구 스위치 버튼 밖으로 나가지 않는다.** 마스코트 블루는 채도가 88%인데 사이트 주황은 63%다. 원본을 본문에 그대로 깔면 웜 베이지 배경(`#EDEAE4`, 색상 37°) 위에서 혼자 튀어 같은 디자인 시스템으로 읽히지 않는다. 색상 212°는 지키고 채도만 주황에 맞춘 `#4C8DD6`이 본문용이다.
- **폐기한 값**: `#2276DE`(옛 면 채움), `#0F8A6C`·`#0B6E56`·`#10A37F`·`#3E9078`·`#5BB39E`(옛 초록·청록). 새로 쓰지 않는다.
- **작은 글자에 면 채움용 값을 쓰지 않는다.** 10~12px 라벨을 `--ant-orange`로 칠하면 대비가 3:1 아래로 떨어진다. 글자는 `--ant-orange-text`를 쓴다. 이 구분은 주황 모드에서도 같다.
- **내비게이션 비활성 원은 강조색을 따라가지 않는다.** `--nav-idle: #7C7568`(웜 중립 회색, 흰 아이콘 대비 4.56:1) 하나로 두 모드가 공통이다. 비활성까지 강조색 계열로 칠하면 활성과 구분되지 않고, 헤더의 테라코타와 본문 사이 경계에서 온도 차가 세게 부딪힌다. 색은 활성 하나만 갖는다.
- **서브메뉴 활성 표시는 색 틴트를 유지한다.** `rgba(var(--ant-orange-rgb),0.10)`이다. 2026-08-02에 흰 융기면으로 바꿔 봤다가 원복했다. 알약이 주변보다 너무 밝아 혼자 떠 보인다. 다시 시도하지 않는다.
- **도구를 바꿀 때 색이 튀지 않게 0.25초를 준다.** CSS 변수 자체는 전환되지 않으므로 실제 속성에 건다. 특정도 0인 `:where(main.container *, .sub-menu *, .page-nav a, footer *)`로 깔면, 개별 규칙에 이미 `transition`이 있는 요소는 그쪽이 그대로 이긴다.
- **적용 범위 (2026-08-02 기준 8개 파일)**: `cheatsheet`·`checklist`(도구 토글, `.tool-note.codex`), `chrome-plugin`(`.tt-gpt`, `.acc-gpt` 번호, `.task-num.tn-gpt`, 다운로드 CTA 2개), `office-plugin`(`.install-btn.gpt`, `.tt-gpt`, `.sup-y.gpt`, `.inset-box.gpt`), `vibe-coding-101`(`.install-btn.gpt`, `.sg-tool-label.codex`, 유래 타임라인 `is-key`), `project-intro`(ChatGPT 목업 6곳), `orientation`(`.nc-card--o`, `.race-cell--o`, `.launch-vs b`, 점유율 차트), `assets/slides/claude-orientation-slides`(점, 표 머리).
- **새 페이지에 ChatGPT·Codex 요소를 넣을 때**는 위 표에서 역할에 맞는 값을 고른다. 도구 토글이 없는 페이지라도 값은 같다. 페이지마다 다른 파랑을 새로 만들면 이번처럼 색값 검색에 걸리지 않아 다음 정리 때 반드시 빠진다.
- **`orientation.html` 점유율 꺾은선은 회사 여섯 곳을 나란히 그리는 범주형 팔레트다.** 앤트로픽과 오픈AI 두 선이 주인공이라 사이트 정체성 색을 그대로 쓴다. 앤트로픽은 메인 오렌지 `#D97757`(라벨 `#B0522F`), 오픈AI는 블루 `#3890F2`(라벨 `#1A5FBF`). 오픈AI가 블루를 가져가면서 원래 블루였던 구글은 청록(`#4F9E86`, 라벨 `#2F7A63`)으로 자리를 옮겼다. 나머지는 Overall 회색 점선 `#B5AFA3`, xAI `#98A0A8`, DeepSeek `#6E63D6`다. 여섯 선은 서로 다른 색상이어야 읽히므로, 새 회사를 넣을 때는 이 여섯과 색상환에서 겹치지 않는 값을 고른다. 색은 SVG 안 `stroke`·`fill`과 스크립트의 `lineMeta` 두 곳에 있으니 함께 고친다.
- **`cheatsheet.html`·`checklist.html`은 도구 선택에 따라 본문 강조색이 통째로 바뀐다.** `:root[data-active-tool="codex"]`가 `--ant-orange`·`--ant-orange-2`·`--ant-orange-rgb`·`--ant-orange-mute`를 블루로 덮어쓴다. 속성은 기존 `switchTool()`이 달아 주고, `<head>`에 저장값(`localStorage` `cli-tool`)을 미리 읽는 스크립트가 있어야 첫 프레임에 주황이 비쳤다 튀지 않는다. 값은 `:root`에 있으므로 새 요소는 하드코딩 대신 이 변수를 쓴다. 도구 토글이 있는 페이지를 새로 만들면 같은 체계를 옮겨 심는다.
- **도구 색을 따라가면 안 되는 것 넷.** ① 도구 스위치 버튼 자신(`.tool-btn.active[data-tool-btn=...]`)과 ② 도구별 보충 설명(`.tool-note.claude`·`.codex`)은 각 도구 고유색이라 하드코딩을 지킨다. ③ 푸터 브랜드는 아래 항목대로 늘 주황이다. ④ 다른 축의 척도, 예컨대 `checklist.html`의 OS 태그(`.os-win` 파랑 · `.os-mac` 회색 · `.os-common` 주황)는 운영체제 분류라 도구와 무관하다. 강조색을 토큰화할 때 이 넷은 먼저 봉인하고 나머지를 치환한다.
- **푸터의 `AI ROASTING`(`.footer-brand`)은 도구와 무관하게 늘 주황 `#D97757`이다.** 사이트 브랜드이지 도구 색이 아니다.
- **`docs/cases/` 납품본은 이 규칙 밖이다.** `cases/lge/claude-orientation.html`은 납품 시점 그대로 두므로 옛 청록을 유지한다. 다른 파일명 개칭·표준화에서도 같은 원칙을 썼다.
- **ChatGPT와 무관한 초록은 건드리지 않는다.** 성공·통과 상태(`#22C55E`), 스킬 토큰(`--skill-green`), 좋음/나쁨 대비 카드, 진단 청록(`#3E7D77`)은 의미가 다르다. 색값만 보고 일괄 치환하지 말고 선택자 이름과 쓰임을 확인한다.
- **찾을 때는 색값이 아니라 선택자 이름으로 훑는다.** 이 통일 작업에서 `orientation.html`을 한 번 놓쳤다. 이 페이지만 오픈AI 쪽을 또 다른 청록(`#3E9078`·`#2F7A63`)으로 쓰고 있어서 `#0F8A6C` 검색에 걸리지 않았다. 색은 페이지마다 값이 다를 수 있지만 이름은 남는다. 아래 두 명령을 함께 돌려 교차 확인한다.

```bash
grep -rn "0F8A6C\|10A37F\|3E9078\|5BB39E" --include="*.html" docs   # 알려진 옛 값
grep -rniE "class=\"[^\"]*(gpt|codex|openai|--o)\b" --include="*.html" docs | head -40   # 선택자 이름
```

### 3.6 박스 왼쪽·위쪽 컬러 띠 금지 (no-edge-color-bar)

박스·카드·콜아웃의 **가장자리 컬러 띠**는 쓰지 않는다. **왼쪽 세로 띠**(`border-left: Npx solid <accent>`)뿐 아니라 **위쪽 가로 띠**(`border-top: Npx solid <accent>`)도 금지다. `::before`로 만든 좌측·상단 스트라이프도 같다. 한쪽 모서리에만 색 테두리를 두르는 패턴은 AI가 찍어낸 듯한 인상을 준다. 사용자가 이 스타일을 쓰지 않는다고 명시했다(2026-07-02). 콘텐츠 페이지(`ai-hallucination`·`ai-sycophancy`·`ai-writing` 등)는 왼쪽 띠 규칙을 이미 따르고, 2026-06-24에 `skills/` 폴더(2026-07-11 `assets/skills/`로 이동) HTML도 정렬했다. 2026-07-02에 `git-guide.html`의 `.why-card` 상단 띠(`border-top`)와 `.step` 좌측 띠(`border-left`)를 제거했다.

원칙:
- **색은 라벨로 옮긴다.** 박스 정체성을 나타내는 색은 라벨 태그(`.tone`·`.qwho`·`.tag`), 라벨 점(`::before` 7px dot), 또는 본문 강조색(`b`/`h`)이 갖는다. 가장자리 띠로 색을 표현하지 않는다.
- **윤곽은 띠가 아닌 것으로 만든다.** 박스는 ① 은은한 full hairline 테두리(`border:1px solid var(--line)`, 네 변 동일), ② 배경 틴트, ③ 약한 그림자 중 하나로 구분한다. 셋 다 없을 때만 hairline을 새로 더한다.
- **모서리는 대칭으로.** `border-radius:0 8px 8px 0` 같은 비대칭 값은 네 모서리 동일값(`border-radius:8px`)으로 되돌린다.
- **예외(손대지 않음)**: 중립 회색의 얇은 인용 들여쓰기(`border-left:2px solid <gray>`), 사이드 내비 active 인디케이터(`transparent` ↔ 컬러 토글), 섹션 구분용 중립 회색 가로선(`.step-divider::before` 같은 full-width hairline)은 기능성 패턴이라 유지한다. 금지 대상은 콘텐츠 박스의 **장식용 accent 컬러 띠**다.

작은 라벨 점·태그·불릿(`::before`로 만든 4~8px dot/square)은 권장 패턴이므로 유지한다. [[no-left-color-bar-cliche]]

### 3.7 Windows·Mac 안내는 완전히 분리한다 (os-split)

설치·실행처럼 운영체제별로 방법이 다른 안내는 **Windows와 Mac을 한 문장·한 코드블록에 섞지 않는다.** 각 OS를 별도 문단(또는 카드)과 별도 코드블록으로 완전히 나눈다. 사용자가 명시했다(2026-07-02): "Windows는 'Git Bash'나 명령 프롬프트, Mac은 '터미널'을 열고 아래 한 줄을 입력합니다."처럼 한 문장에 두 OS를 묶고 코드블록 하나를 공유하던 패턴을 금지하고, `git-guide.html`에서 Windows 전용 문단+코드블록 / Mac 전용 문단+코드블록으로 분리했다.

원칙:
- **문단 단위 분리.** "Windows는 A, Mac은 B입니다" 한 문장을 쓰지 않는다. `🪟 Windows` 소제목 + 문단, `🍎 Mac` 소제목 + 문단으로 나눈다(이모지는 기존 관례, `claude-code-101.html` 등에서 이미 쓰는 방식).
- **코드블록도 OS별로 따로.** 명령어가 두 OS에서 완전히 같더라도(예: `git --version`) 코드블록 자체를 복제해 각 OS 문단 아래 각각 둔다. "Windows·Mac 공통" 같은 표기로 코드블록 하나를 공유하지 않는다.
- **표에서도 같은 원칙.** 한 셀에 "Win: ~ / Mac: ~"처럼 붙여 쓰지 않고, OS를 행이나 열로 분리한다.
- **예외**: OS와 무관한 일반 안내이거나, 단순 병기("Windows·Mac 모두 지원됩니다" 한 줄로 끝나고 구체적 명령·경로가 이어지지 않는 경우)는 분리하지 않아도 된다. 분리 대상은 **구체적 절차·명령어·경로가 OS별로 달라지는 안내**다.

이 규칙은 전 페이지에 적용한다. 새로 OS별 설치·설정 안내를 쓸 때는 처음부터 분리된 구조로 작성한다.

### 3.8 섹션명 공통 규격 (section-title-std)

콘텐츠 페이지의 **섹션명은 전 페이지가 같은 모양이다.** 가운데 정렬 알약(pill)이 좌우 hairline 위에 놓인 형태 하나만 쓴다. 좌측 정렬 헤더 박스, 페이지별 폰트 크기, 섹션별 색상 같은 변형은 만들지 않는다(2026-07-26 통일).

각 페이지의 `<style>` 뒤에 마커 블록이 들어 있다. **고칠 때는 이 블록만 고치고 41개 페이지에 함께 반영한다.**

```
/* ## SECTION-TITLE-STD START ## */ ... /* ## SECTION-TITLE-STD END ## */
```

값:

| 항목 | 데스크톱 | 모바일(≤768px) |
|---|---|---|
| 폰트 크기 | 13px | 12px |
| 굵기 | 800 | 800 |
| 자간 | 0.5px | 0.5px |
| 대문자 변환 | 없음 | 없음 |
| 색 | `var(--ant-orange, #D97757)` | 같음 |
| 알약 padding | 9px 24px (높이 36px) | 8px 16px |
| 알약 radius | 24px | 20px |
| 알약 배경 | `var(--nm-bg, #EDEAE4)` | 같음 |
| 알약 그림자 | `4px 4px 8px #CECAC3, -4px -4px 8px #FFFFFF` | 같음 |
| 좌우 hairline | 1px `#DDD8D0` | 같음 |
| 구분선 여백 | 70px 0 22px | 52px 0 16px |
| 첫 섹션 구분선 위 여백 | 0 | 0 |

**첫 섹션 위 여백은 컨테이너 패딩만 남긴다(2026-08-02).** 페이지 맨 위 구분선까지 위 여백 70px을 그대로 주면 서브메뉴와 첫 섹션 사이가 102px로 벌어진다. 섹션 사이 간격이지 페이지 시작 간격이 아니므로, 마커 블록 안의 다음 규칙으로 첫 구분선만 0으로 만든다. 결과는 전 페이지 32px(모바일 24px)로 같다.

```css
main.container > .step-divider:first-child,          /* 구분선이 컨테이너 첫 자식 */
main.container > :first-child > .step-divider:first-child,  /* section 래퍼 안 첫 자식 */
main.container > :empty:first-child + .step-divider,        /* 빈 앵커 div 다음 */
... { margin-top: 0; }
```

세 가지 형태를 모두 잡아야 한다. 페이지마다 구분선이 컨테이너 직속인 곳, `<section class="content-section">`으로 감싼 곳(마진 겹침으로 70px이 밖으로 새어 나온다), 앞에 빈 앵커 `<div class="content-section" id="..."></div>`를 둔 곳(ai-sycophancy·skills)이 섞여 있다. `.cat-label`·`.chapter-divider`·`.design-cat`도 같은 규칙에 넣는다.

구성 요소:

- 알약 클래스는 페이지마다 `.step-badge`, `.step-divider-badge`, `.chapter-badge`, `.cat-pill`(안에 `.cat-sub`) 중 하나다. 넷 다 위 값으로 같게 렌더된다. 새 페이지는 `.step-badge`를 쓴다.
- `.sd-num` 앞머리 번호·아이콘. 오렌지 원형 배지(18×18, radius 9px, 흰 글자 11px). 갤러리의 `.cat-count`도 같은 규격이다.
- `.sd-text` 섹션 제목 본문.
- `.sd-tag` 뒤따르는 부가 정보(개수, "핵심" 같은 꼬리표). 11px `#9A948C`. `ax-public-cases`의 `.dv-count`도 같다.
- 알약 안의 `svg`는 16px, `.sd-num` 안의 `svg`는 13px에 흰 stroke.

금지 사항:

- **이모지 금지.** 섹션명 아이콘은 24 viewBox 인라인 라인 SVG만 쓴다(`stroke="currentColor"`, `stroke-width="1.9"`, 라운드 캡). 3.2의 아이콘 규격과 같다. 2026-07-26에 `cheatsheet`(↓⌨💡⚙!), `agents-md-templates`(→), `glossary`(▼), `ui-design`(🪟📷📱🫧✨)를 전부 SVG로 교체했다.
- 페이지별 폰트 크기·색·padding을 새로 잡지 않는다. 알약 배경에 shimmer 같은 애니메이션 그라데이션을 넣지 않는다.
- 섹션별 컬러(`--c1`~`--c6`, oklch 팔레트)로 섹션명을 물들이지 않는다. 색 구분이 필요하면 카드 안쪽에서 한다.
- 좌측 정렬 헤더 박스(`.section-header`, `.level-header`)를 새로 만들지 않는다.

적용 범위: 콘텐츠 41개 페이지. `index.html`은 허브라서 자체 섹션 헤더 규격(21px 좌측 정렬 + 부제)을 유지한다. `mcp-examples.html`과 `claude-code-tasks.html`은 섹션명 띠가 없다.

### 3.9 표지 마스코트 프레임 시퀀스 (2026-08-01)

인덱스 표지 발치의 로봇 애니메이션은 `<video>`가 아니라 **배경을 지운 프레임 이미지 재생**이다. 표지 배경이 갈색이라 영상을 그대로 얹으면 사각형이 드러난다.

| 항목 | 값 |
|---|---|
| 원본 | `docs/assets/logos/robots.mp4`(1280×720, 24fps, 10초), `robots.png` |
| 산출 | `docs/assets/logos/robotseq/r000~r119.webp`(560×351, 12fps, 합계 약 2MB), 스틸 `robots-cut.webp` |
| 생성 스크립트 | `docs/assets/logos/robotseq-src/build_robots.py`(배경 제거는 `cutout2.py`) |
| 재생 | `index.html` 하단 IIFE. 캔버스 + IntersectionObserver, 6장씩 순차 로딩, 16장 모이면 시작, 화면 밖으로 나가면 정지 |
| 표시 크기 | `.mascot-stage { height: clamp(62px, 12svh, 118px) }`, `aspect-ratio: 560 / 351` |

배경 제거 규칙:

- 테두리에서 배경색을 추정하고, 그 색과 **거리 18 이내**인 픽셀만 후보로 둔 뒤 인접 색차가 작을 때만 번지는 영역 성장으로 칠한다.
- **허용치를 키우면 팔다리가 사라진다.** 배경은 기준색에서 6 이상 벗어나지 않는데 그늘진 주황 다리는 37~41밖에 떨어져 있지 않다. 60쯤으로 잡으면 다리와 팔이 통째로 배경으로 딸려 나간다(2026-08-01 실제로 그렇게 나갔다).
- 가장자리는 2px 깎고 바깥을 가장 가까운 속 색으로 덮은 뒤 알파만 흐린다. 이 단계를 빼면 배경색 테두리가 남는다.
- 크롭은 전 프레임 공통 박스를 쓴다. 프레임마다 다르면 재생 중에 흔들린다. 프레임 크기가 바뀌면 `aspect-ratio`와 `width`/`height` 속성도 함께 고친다.
- 원본이 바뀌면 **반드시 실제 배치될 배경색 위에 합성해 눈으로 확인한 뒤** 전체를 돌린다.

### 3.9-1 표지 띠지 먹색 스킨 (2026-08-01)

표지 오른쪽 띠지(`.cover-band`)는 먹색이다. 크림이던 시절에는 본문과 같은 색이라 표지 옆에 종이 한 장이 더 붙은 것으로만 보였다. 먹색으로 내리면 주황 표지와 크림 본문 사이에서 띠지가 제 층으로 선다.

| 요소 | 값 |
|---|---|
| 바탕 | `linear-gradient(90deg, #2E211B 0px, #241A15 34px, #1E1613 88px)`. 왼쪽 34px은 접힌 면이 빛을 받는 자리 |
| 종이 결 | `::after`는 `mix-blend-mode: screen`, opacity 0.16. 어두운 바탕에 multiply를 깔면 뭉갠 얼룩이 된다 |
| 본문 글자 | `#F1E7DF`(14.6:1), 보조 `#BFAE9F`(8.3:1), 설명 `#B2A296`(7.2:1) |
| 라벨·강조 | `#E9A279`(8.4:1). 크림 배경용 `--accent-aa`는 먹색 위에서 읽히지 않는다 |
| 진입 카드 | `rgba(255,255,255,0.055)` + 1px `rgba(255,255,255,0.09)`. 뉴모피즘 그림자는 쓰지 않는다 |
| 주 동작(`.cover-cue`) | 크림 채움 `#F3EAE1`에 글자 `#2B1B13`. 먹색 위에서는 채운 주황보다 크림이 앞선다. `.cue-rail`·`.cue-dot`도 어두운 색으로 뒤집는다 |

띠지 안의 색을 새로 잡을 때는 먹색 바탕(`#1E1613`) 기준 대비 4.5:1을 넘는지 확인한다. 크림 본문용 토큰(`--ink-muted`, `--ink-faint`, `--accent-aa`)을 그대로 가져오지 않는다.

**띠지는 오른쪽에서 감겨 들어온다**(`band-slide-in`, 1.6초, 데스크톱 전용). 표지 등장 전체는 `hero-rise` 1.3초에 0.2초씩 계단으로 늦춘다. 여기서 중요한 것은 시작 시점이다. **표지는 인트로 뒤에 있어 로드 시점에 애니메이션을 돌리면 아무도 보지 못한다.** 그래서 `.cover-stage`를 IntersectionObserver로 지켜보다가 화면에 들어올 때 `.band-in`을 붙여 한 번만 돌린다. JS가 없으면 `.band-anim`이 붙지 않아 띠지는 그냥 보인다. 모바일은 표지가 첫 화면이라 기존 등장을 그대로 쓴다.

### 3.10 모바일 인트로와 스크롤 (2026-08-01)

`index.html` 모바일(≤768px)은 데스크톱과 다른 첫 화면을 쓴다.

- **로고 인트로는 숨긴다**(`.intro { display: none }`). 화면 세 배 높이를 스크롤해야 표지가 나오는 구간은 손에 쥐고 보는 화면에서 그대로 이탈이 된다. 인트로 스크립트도 같은 조건으로 빠져나가 프레임 69장을 받지 않는다.
- 표지 띠지(`.cover-band`) 아래는 `border-bottom: 1px solid var(--ant-dark)`. 띠지와 본문이 둘 다 크림이라 경계가 보이지 않는다.
- `Anthropic 엿보기`(`.flap-peek`)는 숨기고, `5단계 가이드 시작하기`(`.cover-cue`)는 판면 전체 폭으로 늘린다.

**스크롤이 멈추는 원인은 세 가지다.** 제보가 오면 이 순서로 확인한다.

| # | 원인 | 대응 |
|---|---|---|
| 1 | 자동으로 움직이는 내부 가로 스크롤러 | 캐로우절이 스스로 `scrollLeft`를 움직이는 동안 손가락 세로 스크롤이 취소된다. `(max-width: 768px), (pointer: coarse)`에서는 자동 넘김을 켜지 않는다 |
| 2 | `body`에 남은 스크롤 잠금 | 메뉴·모달이 거는 `overflow: hidden`이 뒤로가기(bfcache)로 되살아나면 스크롤이 죽는다. `pageshow`·`visibilitychange`에서 열린 오버레이가 없으면 잠금 클래스를 걷어낸다 |
| 3 | 스크롤을 가로채는 스크립트 | 인트로의 `window.scrollTo`, 반복 호출되는 `scrollIntoView`. 사용자가 먼저 움직이면 즉시 손을 뗀다 |
| 4 | 화면에 붙어 있는(sticky) 구간 | 스크롤은 먹는데 화면이 그대로라 멈춘 것처럼 보인다. 표지의 200svh 트랙이 그랬다 |

가로 스냅은 `mandatory` 대신 `proximity`를 쓴다. `mandatory`는 세로 스크롤을 물고 놓지 않는다.

**표지가 붙어 있는 구간은 짧게 잡는다(2026-08-01).** 데스크톱은 `.cover-track { height: 140svh }` + `.cover-stage { position: sticky; top: 0; height: 100svh }`다. 0.4화면만 머물렀다가 올라간다. 예전 200svh는 한 화면을 통째로 붙잡아 휠을 굴려도 화면이 그대로라 스크롤이 안 먹는 것처럼 보였다. 모바일은 붙이지 않는다(`height: auto`, `position: relative`).

### 3.11 헤더 토글은 그 묶음의 첫 페이지로 이동한다 (2026-08-02)

헤더 토글(`.mode-tab`)은 표시만 바꾸는 장치가 아니라 **트랙을 갈아타는 장치**다. 누르면 그 묶음(`#pages-<mode>`)의 **첫 링크로 이동한다.** 예전에는 아래 버튼 묶음만 바뀌어서, 다른 트랙으로 넘어가려면 토글을 누른 뒤 버튼을 한 번 더 눌러야 했다. `claude-code-101.html`의 `track-toggle-btn`이 이미 `<a href>`로 이 동작을 하고 있었고, 나머지 페이지를 여기에 맞췄다.

`switchMode(mode)`는 16개 토글 페이지가 같은 본문을 쓴다. 모드 배열을 하드코딩하지 않으므로 2탭·3탭 어디에나 그대로 붙는다.

```js
function switchMode(mode) {
    var group = document.getElementById('pages-' + mode);
    var first = group ? group.querySelector('a.header-page-link') : null;
    if (first) { /* 지금 페이지가 아니면 first.href로 이동하고 끝낸다 */ }
    /* 이미 첫 페이지면 탭 active와 그룹 display만 바꾼다 */
}
```

- 이동 판정은 파일 이름만 비교한다(`href`에서 `#앵커`와 경로를 떼고 `location.pathname`의 끝과 대조). 이미 그 첫 페이지면 이동하지 않고 표시만 바꾸므로 쓸데없는 새로고침이 없다.
- 묶음 안 두 번째 이후 페이지에서 자기 트랙 탭을 눌러도 첫 페이지로 돌아간다. 트랙 입구로 데려가는 것이 토글의 일이고, 개별 페이지 이동은 아래 버튼 묶음이 맡는다.
- 묶음 링크 순서가 곧 착지 지점이다. `pages-*` 첫 링크를 바꾸면 토글 목적지도 함께 바뀐다.
- `harness-book`·`seven-steps`·`mcp-examples`·`loop-engineering`에는 `.mode-tab` 없이 `switchMode`만 dead로 남아 있다. 함수는 통일해 두었으니 나중에 토글을 붙이면 그대로 작동한다.

### 3.12 2단계 트랙 토글: 확장 프로그램 / 스마트폰 앱 (2026-08-02)

2단계 네 페이지(`chrome-plugin` · `office-plugin` · `claude-mobile` · `chatgpt-mobile`) 헤더에는 `h1` 부제 바로 아래 `track-toggle`이 붙는다. `claude-code-101.html`의 노코드/CLI 토글과 **같은 CSS를 쓴다**(복제하지 말고 그 블록을 그대로 가져온다).

```html
<div class="track-toggle">
    <a href="chrome-plugin.html" class="track-toggle-btn active">확장 프로그램</a>
    <a href="claude-mobile.html" class="track-toggle-btn">스마트폰 앱</a>
</div>
```

- 토글은 `<a href>`다. 3.11 규칙대로 **그 갈래의 첫 페이지로 이동한다.** 확장 프로그램은 `chrome-plugin.html`, 스마트폰 앱은 `claude-mobile.html`이 입구다.
- 지금 페이지가 속한 갈래의 버튼에만 `active`를 준다.
- 토글 아래 `header-pages`에는 **선택된 갈래의 페이지만** 넣는다. 두 갈래를 한 줄에 섞지 않는다. 갈래 이동은 토글, 갈래 안 이동은 `header-pages`로 역할을 나눈다.
- CSS는 `.hpl-icon svg` 규칙 바로 뒤에 넣는다. `≤560px`에서 글자 12.5px, 패딩 `7px 18px`로 줄이는 분기를 함께 둔다.

### 3.13 캡처가 없으면 화면 목업을 직접 그린다 (2026-08-02)

앱 화면을 설명해야 하는데 캡처 파일이 없으면, 이미지를 붙이지 말고 **HTML과 CSS로 화면을 그린다.** `chatgpt-mobile.html`의 `.pm-phone`이 기준 구현이다.

- 상태바, 헤더, 메뉴 줄, 최근 목록, 하단 버튼까지 실제 화면의 구조 순서를 그대로 따른다. 없는 메뉴를 지어내지 않는다.
- 하이라이트는 좌표를 퍼센트로 겹치는 방식(`.map-mark`)이 아니라 **그린 줄 자체에 클래스를 붙인다**(`.pm-row.is-on`). 화면 비율이 바뀌어도 어긋나지 않는다.
- 오른쪽 설명(`.map-item[data-key]`)과 목업 줄(`.pm-row[data-key]`)의 `data-key`를 1:1로 맞춘다. 마우스 오버와 터치 클릭 둘 다 처리한다.
- 목업 전체에 `role="img"`와 `aria-label`을 주어 스크린리더에 메뉴 순서를 전달한다.

캡처 파일이 있으면 기존 `.map-split` + `.map-mark` 방식을 그대로 쓴다(`claude-mobile.html`). 목업은 캡처가 없을 때의 대체 수단이지 캡처를 밀어내는 수단이 아니다.

### 3.13-1 이모지 금지, 아이콘은 SVG만 쓴다 (2026-08-02 사용자 지시)

**화면에 보이는 자리에는 이모지를 쓰지 않는다.** 카드 아이콘, 섹션명, 라벨, 알약, 목록 머리, 버튼 어디에도 넣지 않는다. 아이콘이 필요하면 인라인 SVG를 쓴다.

- **1차 출처는 [icon-gallery.html](docs/icon-gallery.html)이다.** 필요한 모양을 먼저 갤러리에서 찾고, 없을 때만 같은 규격으로 새로 그린다. 브랜드 로고는 3.14를 따른다.
- 규격은 24 viewBox, `fill="none"`, `stroke="currentColor"`, `stroke-width="1.9"`, 라운드 캡이다. 색은 반드시 `currentColor`로 받아 부모 글자색을 따르게 한다.
- 크기는 쓰는 자리에 맞춘다. 카드 아이콘 타일 24px, 본문 알약 13~15px, 헤더 메뉴 16px(모바일 14px).
- 이모지를 SVG로 바꿀 때 타일 배경과 여백은 그대로 두고 글자 크기 지정(`font-size`)만 색 지정(`color`)으로 바꾼다.
- 2026-08-02 `orientation.html`에서 카드 아이콘 4개(🔌⌨️🧩🗂)와 가격 요약 라벨 3개(💎⚖💰)를 SVG로 교체했다. 파트너 알약 8개도 PNG 이미지에서 SVG 라인 아이콘으로 바꿨다.
- 실제 브랜드 마크가 필요한 자리에 임의로 비슷한 모양을 그리지 않는다. 갤러리에 없으면 먼저 갤러리에 추가한다.

### 3.14 브랜드 로고는 icon-gallery.html을 단일 출처로 쓴다 (2026-08-02)

서비스 로고가 필요하면 먼저 [icon-gallery.html](docs/icon-gallery.html)의 `brand-*` 아이콘을 찾는다. 외부에서 새로 받아 오는 것은 갤러리에 없을 때만이다.

- ChatGPT 링크는 갤러리의 `brand-openai-icon`(24×24 라인, `stroke="currentColor"`)을 쓴다.
- Claude 링크는 갤러리에 전용 아이콘이 없다. 갤러리의 `brand-anthropic-icon`은 Anthropic 사명 마크(A·I 글자꼴)이지 Claude 제품 마크가 아니다. 그래서 Claude는 별 모양 제품 마크(단일 path, `fill="currentColor"`)를 쓴다. 정본은 `assets/logos/anthropic_logo.svg`이고, `ui-design.html`이 `claude-burst`로 같은 자산을 쓴다. 원본은 `fill="#D97757"` 고정에 248 박스를 꽉 채우므로, 가져올 때 `fill="currentColor"`로 바꾸고 `viewBox="-24 -24 296 296"`으로 여백을 줘 다른 24 박스 아이콘과 크기를 맞춘다.
- **A자 마크를 Claude 자리에 넣지 않는다.** 갤러리에서 `anthropic`으로 검색하면 A자 마크가 먼저 나와 그대로 쓰기 쉽다. Claude를 가리키는 자리에는 항상 별 마크다.
- 색은 반드시 `currentColor`로 받는다. 헤더에서 흰색, 활성 상태에서도 어긋나지 않는다.
- `<use>`와 `id`로 회전 복제하는 SVG는 그대로 넣지 않는다. 모바일 드로어 스크립트가 `.hpl-icon`을 복제하면 `id`가 중복된다. `<path transform="rotate(...)">`로 펼쳐서 넣는다.

### 3.15 트래픽 측정은 ANALYTICS-STD 마커 한 줄로만 넣는다 (2026-08-12)

GitHub Pages는 서버 로그를 주지 않는다. GitHub Insights의 Traffic 수치는 `github.com/airoasting/claude_guide` 저장소를 들여다본 조회수이지 발행 사이트 방문자가 아니다. 사이트 트래픽을 알려면 페이지에 측정 스크립트를 넣는 수밖에 없다.

**단일 출처는 [analytics.js](docs/assets/js/analytics.js) 하나다.** GA4 측정 ID는 그 파일의 `GA_ID` 한 곳에만 적는다. 페이지에는 마커로 감싼 script 한 줄만 들어간다.

```html
    <!-- ANALYTICS-STD -->
    <script defer src="assets/js/analytics.js"></script>
    <!-- /ANALYTICS-STD -->
```

**쿠키 고지는 페이지 푸터에 두지 않는다.** 소개 모달의 저작권 섹션 `5. 방문 통계`가 그 자리다. 정본은 [about-modal.js](docs/assets/js/about-modal.js)의 `#aboutLicense` 안이고, 푸터의 `라이선스` 링크가 그리로 데려간다. 50개 푸터에 같은 문장을 흩뿌리는 대신 저작권 조항 옆에 한 번만 둔다. 고지 성격의 글이 모여 있어야 읽는 사람이 찾는다.

고지 문구를 고칠 때 `.ab-colophon` 안의 CSS까지 손대면 [sync-about-css.py](docs/assets/js/sync-about-css.py)를 반드시 다시 돌린다. `index.html`은 CSS 사본을 자체 `<style>`에 들고 있어 동기화하지 않으면 소개 페이지만 스타일이 어긋난다. 마크업만 고쳤으면 동기화는 필요 없다.

`cases/lge`는 자기 `about-modal.js` 사본을 쓴다. 측정 대상이 아니므로 그 사본에는 고지를 넣지 않는다.

주입과 제거는 [inject-analytics.py](docs/assets/js/inject-analytics.py)로 한다. 여러 번 돌려도 안전하고, `--remove`로 50개 페이지에서 한 번에 걷어낼 수 있다. 측정 도구를 바꿀 때도 페이지를 다시 손대지 않는다. `analytics.js`만 고친다.

```bash
python3 assets/js/inject-analytics.py            # 주입
python3 assets/js/inject-analytics.py --remove   # 제거
```

**대상은 docs 루트의 콘텐츠 페이지 50개다.** 나머지를 뺀 이유는 각각 다르다.

- **리다이렉트 스텁 8개 제외.** `claude-tools.html` 같은 옛 주소 페이지는 `<head>` 안에서 `location.replace()`를 즉시 부른다. 태그를 넣어도 발사되기 전에 페이지가 떠난다.
- **`assets/` 하위 전부 제외.** 두 가지 이유가 겹친다. 첫째, `assets/claudecode`와 `assets/skills`는 수강생이 복사해 가는 완성 샘플이다. 태그가 딸려 가면 남의 사이트 조회수가 우리 속성에 섞인다. 둘째, `assets/stopwatch` 41개는 `showcase-stopwatch.html`에 iframe으로 박혀 있어 한 번 열 때마다 41건이 중복 집계된다.
- **`cases/` 하위 제외.** 클라이언트 납품본이다. 재려면 `inject-analytics.py`의 `INCLUDE_CASES`를 `True`로 바꾼다.

**`analytics.js`가 스스로 거르는 것 세 가지.** ID가 기본값이면 아무것도 하지 않는다. `HOSTS`에 없는 주소(localhost, `file://`)에서는 수집하지 않아 로컬 작업이 통계를 더럽히지 않는다. iframe 안에서 열린 경우도 세지 않는다.

**이 사이트는 두 곳에 떠 있다. `HOSTS`에 둘 다 적는다.**

| 주소 | 호스팅 | 경로 |
|---|---|---|
| `airoasting.github.io/claude_guide/` | GitHub Pages (`main`/`docs`) | 하위 경로 |
| `airoasting.com` | Vercel, 같은 저장소 | 루트 |

두 주소는 같은 파일을 서빙한다(index 해시 일치 확인). 푸시 한 번으로 양쪽이 함께 갱신된다. `www.airoasting.com`은 `airoasting.com`으로 넘어간다.

`HOSTS`에 한쪽만 적으면 **다른 쪽 방문자가 통째로 안 잡힌다.** 에러도 경고도 없이 숫자만 0이라 알아채기 어렵다. 실제로 2026-08-12 첫 배포 때 `airoasting.github.io` 하나만 적어 `airoasting.com` 방문이 전부 빠졌다. 배포처를 늘리거나 도메인을 바꾸면 `HOSTS`를 같이 고친다. `vercel.app` 미리보기 주소는 일부러 뺐다.

**GA4 데이터 스트림의 URL 칸은 라벨이지 필터가 아니다.** 수집 범위는 측정 ID로 정해지므로 그 칸을 잘못 적어도 데이터는 들어온다. 다만 이탈 클릭 판정과 Search Console 연결이 어긋나고, 나중에 `airoasting.com` 블로그에도 태그를 붙이면 두 사이트가 한 덩어리로 섞인다. 블로그를 재게 되면 속성을 따로 만든다.

### 3.16 접근성 하한선과 디자인 토큰 (2026-08-12 감사)

메인 페이지를 전수 감사해 대비 미달 20건과 24px 미만 표적 15건을 잡았다. 앞으로 같은 것이 새지 않게 규칙으로 못박는다.

**흰 글자 배지에 `--ant-orange`를 쓰지 않는다.** 크림 위 `#D97757`은 2.56:1, 흰 글자를 얹으면 3.12:1이다. 둘 다 AA(4.5:1) 미달이다. 토큰 주석에 이미 적혀 있었지만 `.guide-btn-num`과 `.section-num`이 그 규칙 밖에 있었다.

| 쓰임 | 토큰 | 대비 |
|---|---|---|
| 본문·제목 | `--ink` `#3A3530` | 10.9:1 |
| 설명문 | `--ink-muted` `#67625C` | 4.72:1 |
| 라벨 | `--ink-faint` `#6E6760` | 4.56:1 (흰 글자 배지 배경으로 쓰면 5.57:1) |
| 강조·흰 글자 배지 배경 | `--accent-aa` `#A84726` | 4.79:1 (흰 글자 얹으면 5.84:1) |
| 브랜드 오렌지 | `--ant-orange` `#D97757` | 2.56:1, **글자와 배지에 못 쓴다.** 큰 장식과 아이콘 전용 |

트랙 고유색도 같은 검사를 거친다. 예제 트랙 금색은 `#B8860B`가 12% 틴트 위에서 2.4:1이라 글자에는 `#7F5807`(4.68:1)을 쓴다. 띠와 아이콘에는 원래 금색을 그대로 쓴다.

**클릭·터치 표적은 24px 이상이다** (WCAG 2.5.8 AA). 시각 크기를 키우기 싫으면 `::after`로 누를 수 있는 넓이만 넓힌다. 후기 캐로우절 점이 7×7px이었다.

```css
.voices-dots button::after { content: ''; position: absolute; inset: -8.5px; }   /* 7 → 24px */
.footer-about-link::after { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 24px; transform: translateY(-50%); }
```

**점이 여러 개면 상자만 키우지 말고 중심 간격을 먼저 벌린다.** 11개를 각각 44px 상자로 만들면 서로 겹쳐 옆 점이 눌린다. 중심 간격 24px을 확보하면 표적이 작아도 2.5.8을 통과한다.

**값의 계단을 지킨다.** 0.5px 차이는 눈에 안 보이면서 다음 작업자가 아무거나 베끼게 만든다. 감사 시점에 폰트 15종(14/14.5, 12/12.5, 13/13.5 중복), 라운드 10종(알약에 100px·999px 혼용)이었다.

- 폰트: `10 · 11 · 12 · 13 · 14 · 15 · 17 · 18 · 31.5(모바일 제목)` 9단
- 알약 반경: `100px` 하나만 쓴다
- 새 값을 넣기 전에 이 계단에 맞는 값이 있는지 먼저 본다

**본문 바로가기(`.skip-link`)를 첫 요소로 둔다** (WCAG 2.4.1 Level A). 제목 72개에 8137px 페이지라 키보드 사용자가 매번 내비 전체를 탭으로 지나야 했다. 평소엔 화면 위로 접혀 있고 포커스를 받을 때만 내려온다.

이동은 해시(`#main`)에 맡기지 말고 스크립트로 직접 옮긴다. 이 문서는 표지가 380svh라 해시 착지가 취소되는 일이 있고, `tabindex="-1"` 요소로 포커스가 따라가는지도 브라우저마다 다르다. 스크롤과 포커스를 둘 다 손으로 맞춘다. **`behavior`는 `instant`로 못박는다.** `auto`는 CSS의 `scroll-behavior: smooth`로 풀려 1260px을 느리게 흘려보낸다.

지금은 `index.html`에만 있다. 나머지 콘텐츠 페이지에도 같은 규격으로 넣어야 한다.

**주황 면 위 강조는 흰색이 아니라 검은 투명으로 준다.** 흰색을 덧씌우면 밝아지는 대신 채도가 깎인다. 채도 57%인 주황이 흰 0.13에서 42%까지 떨어져 뿌옇게 탁해진다. 검은 투명은 세 채널을 같은 비율로 낮추므로 채도가 57% 그대로 남고 흰 글자 대비도 함께 오른다.

| 상태 | 값 | 혼합 결과 | 채도 | 밝기 |
|---|---|---|---|---|
| 기본 | `rgba(255,255,255,0.08)` | `rgb(175,92,63)` | 47% | 47% |
| 호버 | `rgba(0,0,0,0.14)` | `rgb(144,67,40)` | 57% | 36% |
| 펼침 | `rgba(0,0,0,0.20)` | `rgb(134,62,37)` | 57% | 34% |

기본 채움은 흰 0.08 그대로 둔다. 2026-08-12에 이것까지 검정으로 바꿨다가 되돌렸다. 카드가 바탕에서 떠 보이는 정도가 원래 의도였다. **바꿀 것은 호버와 펼침뿐이다.** 밝은 톤의 주황(`rgba(236,138,95,α)`)도 시험했지만 채도 손실이 7pt 남아 검은 투명만 못했다.

**이모지를 셀 때는 리터럴과 HTML 엔티티를 함께 본다.** 2026-08-12에 `⏱` 28건을 지웠는데 `&#x23F1;` 로 쓰인 5건이 남아 있었다. 리터럴 문자만 찾으면 놓친다. 그리고 `grep -c` 는 줄 수를 세므로 이 저장소처럼 한 줄이 긴 파일에서는 `grep -o … | wc -l` 로 세어야 한다.

**값을 새로 넣기 전에 이미 있는 토큰을 먼저 본다.** 2026-08-12 감사에서 색 52종 중 상당수가 "이미 체계가 있는데 그 밖에서 만들어진 값"이었다. 배지는 `--accent-aa`가 있는데 `--ant-orange`를 썼고, 보조 텍스트는 `--ink-muted`가 있는데 웜그레이 8종이 따로 생겼다. 다음 순서로 고른다.

1. `:root` 토큰에 역할이 맞는 것이 있는가 → 그것을 쓴다
2. 문서화된 척도(난이도 `--lv*`, 트랙 배지 `--trackbadge-*`, 트랙 고유색 `--track-*`)에 속하는가 → 그 토큰을 쓴다
3. 둘 다 아니면 새 값을 쓰되, 흰 글자·작은 글자면 대비를 재고 그 수치를 주석에 남긴다

**눈에 안 보이는 근접 중복은 합친다.** 0.5px 폰트 차이, 명도 0.002 차이의 회색 두 개는 구분이 아니라 사고다. 다음 작업자가 아무거나 베낀다. 다만 **층을 쌓는 값은 합치지 않는다.** 크림 표면 6종은 카드 위 배지처럼 깊이를 만드는 값이라 합치면 층이 사라진다.

**감사 재실행.** 대비와 표적은 브라우저 콘솔에서 잰다. 그라디언트 위 글자(`.jacket` 표지)는 평면 색으로 못 재므로 조상에 `gradient`가 있으면 건너뛰고, 그 면은 배경을 캔버스로 그려 그 자리 픽셀을 뽑아 따로 잰다.

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
| 세 층으로 쌓입니다 (layer) | 세 가지가 담깁니다, 세 부분으로 나뉩니다 |
| 앞에서부터 일치하는 만큼만 재사용됩니다 (prefix match) | 처음부터 맞춰 보다가 다른 데가 나오면 거기서 멈춥니다 |
| 캐시 열쇠 (cache key) | 캐시를 따로 나누는 기준 |
| 마찰 요소 (friction points) | 어디서 막혔는지 |
| 별도의 ~를 유지합니다 | 각자 ~를 씁니다 |
| 값을 치릅니다 | 비용이 듭니다, 손해를 봅니다 |
| ~로 되돌아갑니다 (reduces to) | 원인은 ~입니다 |
| 고정 투자입니다 | 한 번 해 두면 계속 효과가 있습니다 |
| ~으로 돌아옵니다 (pays off as) | ~해집니다 |
| 이력 | 대화, 기록 |

**영어 UI 문구를 그대로 옮기지 않는다 (2026-08-26 지적).** `Behavior flags`를 `행동 플래그`로 옮기면 뜻이 안 통한다. 화면에 뜨는 영어는 `<code>`로 그대로 보여 주고, 한국어로는 그것이 무엇인지 풀어 쓴다(`많이 쓴 원인`). `layer`·`prefix`·`cache key`처럼 개념을 직역한 말도 같은 규칙을 따른다. `턴`은 개발자 용어라 본문에서는 `주고받을 때마다`로 푼다.

### 4.4 자기해설 금지

글이 자기 자신을 설명하지 않는다.

- 잘못된 표기: 이 섹션에서는 헤더 메뉴의 구성 방식을 설명합니다.
- 올바른 표기: 헤더 메뉴는 다음 구성을 따른다.

### 4.5 과장 어휘 절제

다음 단어는 정말 그럴 때만 쓴다.

혁신적, 획기적, 완벽한, 강력한, 손쉽게, 누구나, 단 한 번에, 게임 체인저.

대신 관찰과 근거로 쓴다. "혁신적인 도구" 대신 "9,830건 대화를 분석해 만든 도구"라고 쓴다.

**`완전 정복`의 경계** (2026-08-12). 이 표현은 표지 부제와 meta description에만 쓴다. 본문, 카드 설명, 섹션 제목, 헤더 문구에는 쓰지 않는다. 2026-08-02에 과장 어휘라는 이유로 표지에서 걷어냈다가 2026-08-12에 사용자 결정으로 부제 자리에 되돌렸다. 브랜드 문구와 본문의 기준이 다르다는 뜻이지, 금지가 풀린 것이 아니다. 같은 판단을 다시 반복하지 않도록 여기에 적어 둔다.

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

### 4.10-1 영문 고유명사 뒤 조사는 실제 발음을 따른다

영문 이름 뒤 조사는 그 이름의 한글 발음 끝소리에 맞춘다. 특히 **GitHub(깃허브)**는 받침이 없는 모음(ㅡ)으로 끝나므로 받침 없는 조사를 쓴다. 사용자가 명시한 규칙이다(2026-07-02).

- GitHub: 는·가·란·를·로 (○) / 은·이·이란·을·으로 (✗). 예: `GitHub는`, `GitHub가`, `GitHub란?`, `GitHub를`. `GitHub이란?`은 쓰지 않는다.
- Git(깃)은 받침(ㅅ)으로 끝나므로 받침 있는 조사를 쓴다. 예: `Git은`, `Git이`, `Git이란?`, `Git을`, `Git과`.

### 4.10-2 구어체 비유 관용구 절대 금지

블로그나 유튜브 말투에서 온 비유 관용구를 본문에 쓰지 않는다. 사실을 그대로 쓴다. 사용자가 명시했다(2026-07-24). 이런 표현은 내용을 더하지 않으면서 문장의 격만 떨어뜨리고, 글쓴이가 데이터가 아니라 인상을 말하고 있다는 신호를 준다.

금지 표현(모두 같은 부류다):

- 갈리는 지점, 갈린다, 판가름 나는 대목, 승부처, 관건은, 핵심 포인트는, 백미는
- 여기서부터가 진짜다, 판이 바뀐다, 게임이 끝난다, 차원이 다르다
- 진짜 실력이 드러나는 곳, 뚜껑을 열어보면, 결정적 한 방

대신 무엇이 어떻게 다른지 수치와 항목명으로 쓴다.

- 잘못된 표기: 실제로 갈리는 지점은 모르는 것을 모른다고 하는가입니다.
- 올바른 표기: 차이가 가장 큰 항목은 환각 억제율입니다. Opus 4.8이 64%, GPT-5.6 Sol이 11%입니다.
- 잘못된 표기: 관건은 속도가 아니라 정확도입니다.
- 올바른 표기: 속도보다 정확도 차이가 큽니다.

같은 원리로 "~하는 셈이다", "~라고 보면 된다", "~인 셈"처럼 결론을 흐리는 마무리도 쓰지 않는다. 단정할 수 있으면 단정하고, 못 하면 조건을 밝힌다.

### 4.10-3 추상 명사와 문어체 동사 금지 (2026-07-25 사용자 지시)

내용을 더하지 않으면서 글을 붕 뜨게 만드는 단어를 쓰지 않는다. 사용자가 작업 중 반복해서 지적했다. 손에 잡히는 말로 바꾼다.

금지어와 대체 표현:

| 금지 | 왜 | 대신 |
|---|---|---|
| 감각, 감을 잡다 | 무엇을 익히는지 불명확하다 | 요령, 직접 해 보며 익히는 것, 몸에 익은 것 |
| 흐름 (일의 흐름, 흐름 자체) | 지칭이 모호하다 | 단계, 순서, 맥락 |
| 갈라 보다, 가르다, 갈립니다 | 문어체라 읽다 멈춘다 | 정리하다, 나누다, 나뉘다 |
| 지도와 영토 | 비유가 겉돌아 이해를 막는다 | 사실 그대로 쓴다 |

비유는 새로 보게 만들지 못하면 아예 쓰지 않는다. 억지 비유보다 사실 서술이 낫다.

- 잘못된 표기: 프롬프트는 지도이고 원본 자료는 영토입니다. 그렇게 쌓인 감각은 대신 담아 주지 못합니다.
- 올바른 표기: 내가 건네는 지시에는 일의 전부가 담기지 않습니다. 그렇게 몸에 익은 것은 어떤 가이드도 대신 알려 주지 못합니다.

### 4.10-4 출처는 pill 버튼으로, 직함은 확인된 것만 (2026-07-25 사용자 지시)

외부 글을 옮겨 실을 때 출처를 문장형 각주로 늘어놓지 않고 `.source-pill`(알약형 링크 버튼)로 넣는다. 구성은 외부 링크 SVG + `원문` 라벨 + 제목 + 저자·소속이다. 구현은 `cli-best-practices.html` 참고.

저자의 실명과 직함은 1차 출처(공식 프로필, GitHub, 회사 페이지)에서 확인한 것만 쓴다. 확인되지 않은 직함(예: Engineer)을 추정해 붙이지 않는다. 프로필에 팀·제품명만 있으면 그대로 쓴다.

- 확인된 표기 예: `Thariq Shihipar, Anthropic Claude Code 팀` (X·GitHub bio 모두 `Claude Code @anthropics`, 직함 표기 없음)

### 4.10-5 감성적·캐주얼 서술 금지 (2026-08-02 사용자 지시)

교재 본문은 **프로페셔널하고 명료한 설명문**이다. 장면을 연출하거나 독자의 기분을 묘사하지 않는다. 구어체로 말을 걸지 않는다.

**장면·감정 묘사 금지**

| 쓰지 않는다 | 이렇게 쓴다 |
|---|---|
| 회의 50분, 스마트폰은 주머니 속 | 회의 진행 50분 |
| 화요일 아침, 회의 5분 전 | 회의 시작 5분 전 |
| 떠오른 것을 붙잡아 둘 때, 기억이 살아 있을 때 | 이동 중에 메모를 남길 때 |
| 스마트폰이 내 컴퓨터의 리모컨이 됩니다 | 스마트폰에서 지시하고 컴퓨터가 실행합니다 |

**구어체·권유형 금지**

| 쓰지 않는다 | 이렇게 쓴다 |
|---|---|
| ~보세요, ~두세요, ~누르세요 | ~합니다 |
| 헷갈릴 때 세 가지만 물어보세요 | 고를 때 확인할 세 가지 / 선택 기준 |
| 오늘 무엇부터 해 볼까 | 실행 순서 |
| 감이 잡힙니다 | 파악됩니다 |
| 그냥 대화가 낫습니다 | 대화가 적합합니다 |
| 앱을 깔고 | 앱을 설치하고 |
| QR을 찍습니다 | QR 코드를 인식합니다 |
| 결과가 쌓입니다 | 결과가 누적됩니다 |
| 손이 많이 가는 반복 작업 | 수작업이 많은 반복 업무 |
| 내 컴퓨터 폴더는 못 엽니다 | 컴퓨터 폴더에는 접근하지 못합니다 |

**핵심 어휘 축 네 개.** 한 페이지 안에서 일관되게 밀어붙인다.

- `일` → `작업`
- `돌다 / 도는 / 돕니다` → `실행되다 / 실행 중인 / 실행됩니다`
- `맡기다`(실행 위치를 말할 때) → `~에서 실행하다`
- `쓰다 / 씁니다` → `사용합니다 / 제공됩니다 / 지원합니다`

**제목과 라벨도 같은 기준을 받는다.** `한 판에`, `한 눈에`, `이렇게 생겼습니다`, `자주 묻는 것`, `~해 볼 것` 같은 표현은 `비교`, `화면 구성`, `자주 묻는 질문`, `실행 순서`로 바꾼다. 섹션 배지, `sub-menu`의 `sm-title`·`sm-sub`, `cmp-rail`, `cmp-head-role`까지 함께 고친다. 본문만 고치고 라벨을 남겨 두면 같은 페이지 안에서 톤이 어긋난다.

**손대지 않는 것.** 프롬프트 입력 예시와 대화 말풍선은 사용자가 실제로 입력하는 문장이므로 구어체 그대로 둔다.

### 4.10-6 출처 각주에 확인 날짜 꼬리를 붙이지 않는다 (2026-08-02 사용자 지시)

`src-note`에는 출처 문서와 그 문서의 발행일까지만 적는다. `2026년 8월 2일 확인.` 같은 열람일 꼬리는 붙이지 않는다. 문서가 오래되면 꼬리가 먼저 낡아 신뢰를 깎는다.

### 4.10-7 인덱스 카드 설명 (2026-08-02 사용자 지시로 65개 전면 재작성)

4.10-5의 감성·캐주얼 금지를 카드 설명에 적용한 것이다. 카드 설명은 광고 문구가 아니라 **그 페이지에 무엇이 들어 있는지 알려 주는 한 줄**이다. 4.10-5가 다루지 않는, 카드에서만 나오는 패턴은 다음 셋이다.

| 유형 | 쓰지 않는 예 | 고쳐 쓰는 예 |
|---|---|---|
| 질문형 낚시 | 매번 이 설명을 반복하고 계신가요 / 무엇부터 봐야 할까요 / 헷갈리셨다면 | 프로젝트에 지침과 파일을 한 번 설정하면 대화마다 다시 설명하지 않아도 됩니다 |
| 겸양 서술 | 짚어 드립니다 / 알려 드립니다 / 보여 드립니다 | 정리했습니다 / 비교합니다 |
| 비유 도입부 | 아무리 좋은 말도 마구가 없으면 / Claude의 책상이 어질러질수록 | 모델을 감싸는 환경 설계가 결과를 바꾸는 이유를 정리했습니다 |

분량은 카드당 두 문장 이내다. 항목명과 숫자는 빼지 말고 남긴다(`모달, 토스트`, `슬래시 명령어 60개`). 검색어 역할을 하고 4.5의 "관찰과 근거로 쓴다"에도 맞는다. `.card p`가 `-webkit-line-clamp: 3`이라 길면 잘린다(재작성 후 평균 60.7자 → 52.0자).

**설명에 적힌 숫자는 대상 페이지에서 세어 대조한다.** 문체만 고치려다 두 건이 어긋나 있는 것을 찾았다. 시 쇼케이스가 `39편`인데 실제 `poem-card`는 47개였고, `cli-best-practices`가 `아홉 가지 원칙`인데 실제 원칙은 5개(제목도 `5가지 원칙`)였다. 그 페이지의 카드 클래스를 직접 세는 것이 가장 정확하다.

### 4.11 마지막 점검

글을 마치기 전에 스스로 묻는다.

1. em dash가 한 개라도 남아 있는가.
2. 주어와 서술어가 어긋난 문장이 있는가.
3. 번역투 표현이 남아 있는가.
4. 같은 문서에서 평어와 경어가 섞였는가.
5. 자기해설 문장이 있는가.
6. 끝에 군더더기 다짐이나 격언이 붙어 있는가.
7. "당신" 같은 2인칭 호칭이 본문에 남아 있는가.
8. 금지어(감각·흐름·갈라 보다·지도와 영토)가 남아 있는가. (4.10-3)
8. "갈리는 지점", "관건은", "승부처" 같은 구어체 비유 관용구가 있는가.

하나라도 해당하면 그 자리에서 고친다.

---

## 5. Working Rules (사용자 명령 누적 정책)

### Rule 1. 사이즈 통일은 메뉴 개수별 기준 페이지를 따른다
- 3-menu는 `ai-fluency.html`을 기준으로 한다.
- 2-menu는 `orientation.html`을 기준으로 한다.
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

### Rule 7. 짝을 이루는 페이지는 구조와 문체를 함께 맞춘다 (2026-08-02)
- 같은 갈래 안에서 나란히 놓이는 페이지(`claude-mobile` ↔ `chatgpt-mobile`, `chrome-plugin` ↔ `office-plugin`)는 독자가 토글로 바로 비교한다.
- 섹션 구성, 배지·서브메뉴 라벨, 비교표 레일 이름, 종결 톤을 같은 기준으로 맞춘다.
- 한쪽에서 섹션을 빼거나 문체를 고쳤으면 다른 쪽도 같이 본다. 한쪽만 고치고 끝내지 않는다.
- 다만 **사실이 다르면 문장도 달라야 한다.** 대칭을 맞추려고 없는 기능을 지어내지 않는다.

### Rule 8. 삭제 지시는 지목한 범위에만 적용한다 (2026-08-02)
- 사용자가 화면 하나를 보여 주며 "삭제"라고 하면 그 페이지의 그 블록만 지운다.
- 짝 페이지에 같은 블록이 있으면 지우지 말고 **있다는 사실을 보고하고 물어본다.** 삭제는 되돌리기 어렵다.
- 두 페이지 모두를 뜻할 때 사용자는 "둘 다", "모두"라고 말한다. 그 말이 없으면 확대 적용하지 않는다.

### Rule 9. 사실은 1차 출처로 확인하고 쓴다 (2026-08-02)
- 제품 기능·요금제·공개일은 기억으로 쓰지 않는다. 공식 문서나 신뢰할 수 있는 매체로 확인한다.
- 출처끼리 값이 어긋나면(예: 지원 언어 11개 vs 18개) **더 신뢰할 수 있는 쪽을 택하고**, 어느 쪽도 확실하지 않으면 그 숫자를 쓰지 않는다.
- 요금제 금액처럼 출처마다 값이 갈리는 항목은 아예 적지 않는다. 플랜 이름과 제공 여부까지만 쓴다.
- 확인한 출처는 본문 하단 `src-note`에 남긴다(형식은 4.10-6).

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
- 배경을 지운 이미지를 눈으로 확인하지 않고 전체 프레임을 돌리지 않는다. 허용치를 넉넉히 잡으면 캐릭터 팔다리가 배경으로 딸려 나간다(3.9).
- 터치 화면에서 캐로우절 자동 넘김을 켜 두지 않는다. 세로 스크롤이 멈춘 것처럼 보인다(3.10).
- 모달이나 메뉴가 거는 `body` 스크롤 잠금을 해제 경로 없이 두지 않는다.

---

## 8. Default Output Pattern

페이지 수정 요청을 받으면 다음 순서로 답한다.

1. 변경 대상 파일 목록과 분류 (기준 페이지인지, 통일 대상인지).
2. 변경 전과 후의 CSS 핵심 값을 비교한 표.
3. 데스크톱과 모바일에 미치는 영향 범위.
4. 다음 액션 (commit 여부 등).
