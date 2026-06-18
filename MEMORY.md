# MEMORY.md: 변경 로그와 표준화 상태

이 파일은 페이지별 변경 이력과 표준화 진행 상황을 기록한다. 모든 작업 지침(코드 규약, 디자인 시스템, 한국어 작성 원칙, 페이지 인벤토리)은 [AGENTS.md](AGENTS.md)에 있다. 이 문서의 모든 문장도 AGENTS.md의 한국어 작성 원칙을 지킨다.

---

## 최근 세션 변경 로그

### 2026-06-18

| # | 명령 | 범위 | 결과 |
|---|---|---|---|
| 5 | 실전 예제 맨 앞에 `글 다듬기` 묶음 신설 + `ai-writing.html`·`ai-skepticism.html` 2개 페이지 제작 | `ai-writing.html`(신규), `ai-skepticism.html`(신규), `index.html`, `AGENTS.md`, `MEMORY.md` | 사용자 `/goal`(AI가 쓴 글 티 지우는 법 글 기반, 실전 예제 첫 묶음, 별도 페이지 2개·새 하위 묶음 맨 앞·~입니다 체). 계획 확정 후 착수. ① 두 페이지 모두 `news-clipping.html` 골격 클론(전체 CSS·hero-video·SM-HAMBURGER·드로어 동기화·copy·scroll-spy 그대로). mode-tabs 제거, header-pages를 글 다듬기 2링크(쓴 티 지우기·착해지면 의심하라)로 교체, switchMode 스크립트 삭제. `<main>`만 파이썬 splice로 교체(CSS 무손실). ② `ai-writing.html`(005, 12분 중급) sub-menu 7섹션: 한눈에·말버릇·교묘한 패턴·장면으로·버릇 차단·사람의 몫·다음 행동. AI 한국어 말버릇 8개(단어 4: 번역투·형용사·접속사·문장길이 / 단락 4: 명언공장·보편위로·판단회피·부풀리기), Before/After 표 3개(말버릇·부풀리기·장면), 금지어 프롬프트 2개(내 글 먹이기·금지어 목록), 8 대 2 wf-steps 4단계. [[korean]] skill-preview + `multi-persona.html` 크로스링크. ③ `ai-skepticism.html`(004, 8분 입문) sub-menu 5섹션: 한눈에·질문이 허락한다·착해지는 신호·리셋 프롬프트·다음 행동. 점수 프롬프트·리셋 프롬프트("다시")·Before/After 표 2개. 끝 CTA→`ai-writing.html`. ④ index 실전 예제 `기본 예제` 앞에 `✍️ 글 다듬기` track-label + 골드 카드 2장(ai-writing→ai-skepticism), 기본 예제에 `margin-top:32px`. ai-skepticism은 beginner지만 인라인 골드 `#B8860B`로 `:has(.beginner)` 초록 보더 오버라이드. ⑤ AGENTS 인벤토리 40→42·콘텐츠 31→33, 실전 예제 2묶음→3묶음 갱신. 검증: 두 페이지 200·title·anchor 전부 resolve·드로어 7/5 복제·heading 추출·em dash 0·콘솔 0, ai-skepticism 데스크톱 렌더 캡처, index 카드 순서 ai-writing→ai-skepticism→news-clipping·첫 카드 inspect(골드 #B8860B·380px). index 스크롤 후 스샷 상단 글리치라 elementFromPoint·inspect 병행 확인 |
| 4 | `ai-hallucination.html` maily.so 출처 제거 + 1차 출처로 교체 + 딜로이트 사건 추가 + 자신 없는 표현 삭제 | `ai-hallucination.html`, `MEMORY.md` | 사용자 4건. ① maily.so 링크 전부 제거(s6 ref 1개). ② s6 참고자료를 1차 출처로 재구성(GPTZero EY·GPTZero KPMG·Financial Times·Fortune 딜로이트·Damien Charlotin 판례 DB 5개). ③ 딜로이트 case-entry 신설(KPMG와 산업전반 사이): Fortune(2025.11) 확인해 캐나다 뉴펀들랜드래브라도 주정부 보건 보고서 약 160만 달러·526쪽·존재하지 않는 학술 논문/가짜 공저자, 호주 보고서 부분 환불, kind-fail `가짜 인용`, 출처 Fortune. case-entry 3→4(EY·KPMG·Deloitte·산업전반, `빅4 중 3곳` 타이틀과 일치). ④ note-box의 `사건의 세부 수치는 보도 시점 기준이며 이후 정정될 수 있습니다`(자신 없는 표현) 삭제, `모든 수치에 1차 출처를 달았습니다…직접 확인할 수 있습니다`로 단정 교체. 검증: maily 0(href·텍스트), 자신없는 문구 0, case 4·ref 5·딜로이트 출처 href, em dash 0, 콘솔 0, 딜로이트 카드 렌더 캡처 |
| 3 | `ai-hallucination.html` 사건 카드 하단에 1차 출처 명시 + 참고자료 보강 | `ai-hallucination.html`, `MEMORY.md` | 사용자 "이거 하단에 출처 명확히 달아줘"(케이스 카드 가리킴). 환각 페이지 특성상 검증 안 된 URL 금지 원칙으로 원문(maily.so) 재확인해 1차 출처 추출. `.case-source` 컴포넌트 신설(점선 상단 보더·오렌지 `출처` 라벨·밑줄 링크·`.cs-sep`). 각 case-entry 하단에 추가: EY=GPTZero EY 조사, KPMG=GPTZero KPMG+Financial Times+TechCrunch, 산업전반=Canadian Lawyer(설리번)+Fortune(NeurIPS)+Damien Charlotin 판례 DB. s6 참고자료의 GPTZero 홈 링크를 EY 조사 페이지로 교체하고 판례 DB(ref 2→3) 추가. 검증: case-source 3개·링크 href 정확, ref 3개, em dash 0, 콘솔 0, 데스크톱 렌더 캡처. 연도 정정(사용자 "2026으로 정정" 선택): 출처 보도일 기준으로 EY·KPMG case-month 2025→2026, 산업 전반 2025→`2025~26`(Deloitte 2025.11 포함), lead `2025년`→`2026년`. 단 법정 판례 통계 `90%가 2025년에 몰렸습니다`는 사건 발생 시점이라 2025 유지(Damien Charlotin DB). 렌더 확인 완료 |
| 2 | `ai-hallucination.html` 본문 한국어 윤문(korean 스킬) | `ai-hallucination.html`, `MEMORY.md` | 사용자 "em dash 빼고 자연스러운 한국어로, 주술 구조 맞추어서". BLACK 외과 교정 9곳(의미·숫자·고유명사 100% 보존): 주술 깨짐 `신뢰를 파는 회사들이 신뢰를 깎였습니다`→`정작 신뢰를 잃었습니다`, 어색 주술 `막는 쪽은 사람의 절차입니다`→`막아 내는 일은 사람의 절차에 달려 있습니다`, 번역투 `404를 반환하거나`→`404로 뜨거나`(case+표 2곳), 주어 모호 `무더기로 무너졌습니다`→`거짓이 무더기로 드러났습니다`, 딱딱한 `중복·모순되게 제시하는`→`여러 곳에서 서로 다르게 적어 놓은`, 종결 미완 fact-desc 3곳 완결(`…가짜.`→`…가짜였습니다`), topic-eg 평어 2곳 경어로 통일(말투 이탈 해소, 인용 프롬프트 반말은 보존). 검증: em dash 0·당신 0·content-section 7, 콘솔 0, 렌더 innerText에서 교정 반영 확인 |
| 1 | 보안·법률 섹션 첫 카드로 `ai-hallucination.html`(AI의 환각을 벗어나는 법) 신설 | `ai-hallucination.html`(신규), `index.html`, `security-guide.html`, `ai-basic-law.html`, `AGENTS.md`, `MEMORY.md` | 사용자 `/goal`(maily.so 빅4 가짜 각주 글 기반, 인덱스 맨 하단 섹션 첫 카드, 10점). 브레인스토밍으로 각도 확정(실전 기법 + Claude 연결). ① `ai-basic-law.html` 골격 클론(CSS·hero-video·SM-HAMBURGER·about-modal·스크롤스파이·reveal 그대로). meta/canonical/og·title 갱신, h1 `AI의 환각을 벗어나는 법`. sub-menu 7섹션(한눈에·무슨 일이·왜 생기나·벗어나는 법·Claude로·점검표·참고자료). 본문: 환각 4유형 overview 표, fact-row 3(EY 27중16·KPMG 45중5·판례 1,450건+), case-ledger 3건(EY·KPMG·산업확산, `.kind-fail`#c0392b·`.kind-spread`#8a5a2b 신규), 원인 2층(모델 3+조직 3 topic-card), 벗어나는 5가지 습관(topic-card+예시), Claude 연결 4카드(`.topic-link` 신규, `claude-tools`·`multi-persona`·`harness-workflows` 크로스링크), 납품 전 check-list 8개, ref 2개(원문·GPTZero). 끝 CTA→`security-guide.html`. ② 섹션 2-menu(490px)→3-menu(700px) 승격: `ai-hallucination`·`security-guide`·`ai-basic-law` 3링크 내비(`환각 줄이기`·`보안 가이드`·`인공지능기본법`) 공유, 세 파일 `.header-pages` max-width 490→700. ③ index 보안·법률 섹션 첫 카드로 추가(🧭·참고), 카드 2→3이라 인라인 `grid-template-columns:1fr 1fr` 제거(기본 `.cards` 3열). ④ AGENTS 인벤토리 39→40·콘텐츠 30→31, 보안·법률 섹션(2개→3개)·§3.2 폭 표(보안·법률을 2개행→3개행) 갱신. 검증: em dash 0·"당신" 0, content-section 7·sub-menu 7 정합, `<main>` 1쌍, 콘솔 0, 크로스링크 5개 파일 실재, 데스크톱 헤더·3-menu·lead·fact 렌더 스샷, 모바일 375px 오버플로 0(docW=375)·햄버거 노출·sub-menu 숨김·header-pages 세로 스택·드로어 7항목 복제(heading `환각 줄이기`), index 섹션 3카드 첫 카드 환각. 스샷은 스크롤 상태에서 상단 고정 글리치(DOM eval 병행 확인) |

### 2026-06-17

| # | 명령 | 범위 | 결과 |
|---|---|---|---|
| 1 | md 운영 문서 현행화 (비법 트랙 드리프트 정리) | `README.md`, `AGENTS.md`, `MEMORY.md` | 사용자 요청("md 파일 모두 업데이트"). 2026-06-16 비법 트랙(`claude-code-best-practices` 3탭화)이 사이트와 AGENTS 카탈로그 행에는 반영됐으나 README·AGENTS 구조 설명에 드리프트가 남아 정리. **README**: 4단계에 `비법 트랙` 표 신설(노코드·CLI 트랙 뒤, `고수처럼 쓰는 9가지 원칙` 1링크), 버전 히스토리에 `v1.8 · 2026-06-16 — 고수처럼 쓰는 9가지 원칙(비법 트랙)` 추가. **AGENTS**: 4단계 섹션 헤더·토글 설명을 2탭(노코드 3 + CLI 3, `switchMode` 2-way)에서 3탭(노코드 3 + CLI 2 + 비법 1, `switchMode` 3-way `['nocode','cli','tip']`, `pages-tip` 1링크, 101은 비법 버튼)으로 교정. **MEMORY**: 이 행 추가. 비고: 이번 세션의 `cases/` 클라이언트 대시보드 작업(LGE 시뮬 대시보드를 게스 코리아·의류로 전환, `posco`·`guess`를 `cases/`로 이동, 헤더 게스 로고·카드 호버·줄바꿈 보정)은 공개 가이드 사이트 페이지가 아니라 강의 실습 자료라 운영 문서 인벤토리 범위 밖으로 보존(`lge`·`posco` 선례 동일). 인벤토리 카운트(39개/콘텐츠 30개) 불변 |

### 2026-06-16

| # | 명령 | 범위 | 결과 |
|---|---|---|---|
| 6 | 4단계 헤더 토글 2탭→3탭(노코드·CLI·**비법**), index 비법 카드는 CLI 아래로 | `claude-code-101/tasks/github/checklist/cheatsheet/best-practices.html`, `index.html`, `AGENTS.md`, `MEMORY.md` | 사용자: "위치를 CLI 밑으로, 서브메뉴(토글) 모두 수정, CLI 오른쪽에 '비법' 탭 카드 하나". 조치: ① 표준 토글 5개 페이지에 `tab-tip`(비법) + `pages-tip`(best-practices 1링크) 추가, `pages-cli`에서 best-practices 링크 제거(→checklist·cheatsheet 2장), `switchMode`를 `['nocode','cli','tip']` 3-way로 교체. 활성: tasks·github=nocode, checklist·cheatsheet=cli, best-practices=tip. ② claude-code-101(track-toggle-btn 방식)엔 `비법` 버튼 추가. ③ index는 직전의 4단계 맨 위 featured를 제거하고 CLI 트랙 **아래**에 `🎓 비법` track-label + 풀폭 featured 카드로 이동. 검증: best-practices 토글 초기 비법 active·pages-tip 표시, 3-way 전환 OK, index 트랙 순서 노코드→CLI(2)→비법(featured 1177px), 콘솔 0, 모바일 375px 3탭 한 줄·오버플로 0. github mode-tabs는 `load-anim` 클래스라 정규식 보정(여는 태그 보존) |
| 5 | `claude-code-best-practices.html` index 카드를 CLI 트랙 막내 → 4단계 맨 위 featured로 승격 | `index.html`, `AGENTS.md`, `MEMORY.md` | 사용자: "내용이 좋은데 묻혀 있다, 위치 추천". 진단: 원칙 콘텐츠가 CLI '고급 실전' 트랙 막내에 있어 ① 노코드 독자는 못 봄 ② 명령어 레퍼런스 카드들과 성격 불일치. 조치: 4단계 맨 위(노코드/CLI 갈래·설명 카드 전)에 `📍 먼저 읽기 · 노코드·CLI 공통 원칙` track-label + 풀폭 `card featured` 카드로 이동, CLI 트랙은 3열→2열(checklist·cheatsheet)로 환원(중복 제거). 페이지 최상단/히어로 승격은 반려(내용이 Plan모드·/clear 등 클로드 코드 기능 중심이라 1~3단계 안 거친 독자에겐 이름). 검증: 4단계 첫 카드=best-practices(featured, 풀폭 1177px), 배지 "📍 먼저 읽기", CLI 2장, 접은 화면 캡처로 배치 확인 |
| 4 | `claude-code-best-practices.html` 본문 한국어 윤문(korean 스킬) + 체크리스트 번호↔체크박스 순서 교체 + "다음 단계" 카드 삭제 | `claude-code-best-practices.html`, `MEMORY.md` | 사용자 `/goal`(비즈니스 리더용 프로페셔널·자연스러운 한국어·주술 호응 10점). ① 본문 전체 윤문: 번역투 "X의 가장 큰 제약은"→"X에는 큰 제약이 하나 따릅니다", "중요한 점은 ~다는 것입니다"→직설 단정, "긴 보고서 한 번 자료 더미 한 번 분석에"→주술 정합 문장으로, "합격과 불합격을 돌려주는"→"맞고 틀림을 가려 주는" 등 9원칙·tip·체크리스트 문장 전반 응축·주술 호응·경어체 통일(의미·고유명사·구조 100% 보존, em dash 0·"당신" 0). ② 체크리스트 항목 순서 `[번호][체크박스]`→`[체크박스][번호]`(input+ck-box 인접 유지해 :checked·:focus-visible CSS 보존). ③ 본문 끝 "다음 단계" 크로스링크 카드 삭제(체크리스트가 마지막), 죽은 `.next-links` CSS도 제거. 검증: content-section 5·principle 9·번호 9·태그 균형, next-links/「다음 단계」 잔재 0, 콘솔 0, 데스크톱 체크리스트 순서 캡처 확인, 모바일 375px 오버플로 0 |
| 3 | `claude-code-best-practices.html` 본문 예시를 개발자용 → 비즈니스 리더용으로 전면 교체 | `claude-code-best-practices.html`, `MEMORY.md` | 사용자 지적("사례가 개발자 대상, 비즈니스 리더용이어야"). 사이트 타깃(비즈니스 리더·지식 노동자, AGENTS §1)에 맞춰 9원칙의 구조·디자인은 그대로 두고 **모든 구체 예시를 지식노동 시나리오로** 교체. validateEmail·OAuth·src/auth·ExecutionFactory git·HotDogWidget·React→Vue·rate limiter·`claude -p`·`--output-format`·gh/aws/gcloud·`.claude/agents`·코드베이스·CI 등 개발 용어 0건(grep 확인). 바뀐 사례: 검증=3분기 매출 합계 재계산·대시보드 시안 비교·보고서 성장률 분모, 탐색계획=사업계획서/신사업 제안서, 구체지시=보고서 검토·원본 시트 계산식·통과된 제안서 틀, 환경설정=프로젝트 지침(회사 용어·보고서 형식·말투)+커넥터(노션·드라이브)+스킬+서브에이전트(훅·CLI도구 항목 제거), 소통=보고서 논리·데이터 추세·계약서 3조 질문+기획 메모, 세션=경쟁사 5곳 조사 서브에이전트, 자동화=Routines 아침 뉴스 브리핑·작성자/검토자·여러 지점 보고서 일괄·점검하는 눈, 체크리스트 9항목도 동일 재서술. Plan모드·/clear·/rewind·서브에이전트·Routines 같은 Claude Code 조작어는 유지(이 페이지가 클로드 코드 트랙이므로). 디자인 구조(섹션·배너·표·코드블록·체크리스트) 100% 보존, splice로 본문만 교체. 검증: 콘솔 0, content-section 5·principle 9·배너 4·체크박스 9·태그 균형, em dash 0·"당신" 0, 데스크톱 접은 화면 캡처로 표·헤더 렌더 확인, 모바일 375px 오버플로 0 |
| 2 | `claude-code-best-practices.html` 디자인 세련화 (web-builder BLACK/RED 9.5 루프) | `claude-code-best-practices.html`, `output/claude-code-best-practices/EVALUATION.md`(신규) | 사용자 피드백("디자인 밋밋", `/goal` 10점 수준). 디자인 시스템(뉴모피즘·오렌지·Pretendard) 유지하며 비주얼만 끌어올림. **R1(9.1)**: 배경 radial 그라데이션 깊이, 히어로 eyebrow(`BEST PRACTICES · 9 PRINCIPLES`), 원칙 헤더를 카드형 바→큰 그라데이션 번호(42px,`-webkit-background-clip:text`)+제목 20.5px, 카테고리 배너 아이콘 타일·광택(`::after` radial)·입체 그림자, 본문 카드 라운드 22px·부드러운 그림자, tip 그라데이션, 표 헤더 그라데이션+지브라, 코드블록 macOS 윈도우 크롬(신호등 `::before`+구분선 `::after`+padding-top 46px), 카테고리 내 구분선 헤어라인 그라데이션, 스크롤 등장(`.reveal-on`+IntersectionObserver, reduced-motion·미지원 폴백). **R2(9.4)**: RED가 체크박스 `display:none`→키보드 불가 지적, `position:absolute;opacity:0`+`:focus-visible` 링으로 수정(접근성), 원칙 카드 hover 리프트, 번호 tabular-nums. **R3(9.5 합격)**: `#context` 서론 헤더를 원칙과 동일 에디토리얼로 통일(그라데이션 ✦ 34px+제목 20.5px), 서브메뉴 활성 하단 인디케이터 바. 검증: 콘솔 0, 토글·스크롤스파이·체크리스트 저장·reveal `.in`·키보드 포커스 모두 OK, 모바일 375px 가로 오버플로 0. 메모: 이 서버 세션 스크린샷이 스크롤 상태에서 빈 프레임만 내서, 헤더·서론을 임시로 접어 본문을 y≈0으로 올려 캡처+DOM eval 병행 확인. EVALUATION.md에 R1~R3 누적 |
| 1 | 4단계 CLI 트랙에 `claude-code-best-practices.html`(고수처럼 쓰는 9가지 원칙) 신설 | `claude-code-best-practices.html`(신규), `claude-code-tasks.html`, `github-guide.html`, `checklist.html`, `cheatsheet.html`, `index.html`, `AGENTS.md`, `MEMORY.md` | 사용자 요청(code.claude.com/docs best-practices 기반 페이지 제작). ① `cheatsheet.html` 골격 클론(노코드/CLI mode-tabs 헤더·스크롤스파이·SM-HAMBURGER·hero-video·about-modal·키보드 `5`→claude-tools 그대로). title/canonical/og·twitter url 갱신, h1 `클로드 코드, 고수처럼 쓰는 9가지 원칙`. sub-menu는 처음 10섹션(컨텍스트+원칙 1~9)으로 만들었으나 "10개라 직관적이지 않다"는 피드백으로 **4섹션 3카테고리**로 재구성: 컨텍스트(✦ 서론) + 기본기(`#basics` 원칙 1~3) + 환경과 운영(`#ops` 4~6) + 숙련(`#mastery` 7~9). 본문 9원칙은 3개 `.content-section`(스크롤스파이 단위)으로 묶고 각 앞에 `.cat-banner`(오렌지 그라데이션), 원칙은 `.principle` div 9개. 추가 피드백("마지막에 체크리스트")으로 끝에 5번째 섹션 `#checklist` 신설: 9원칙을 한 줄 질문으로 점검하는 `.bp-check` 체크박스 9개 + 진행바, 체크 상태는 localStorage(`ccbp-checklist`)에 저장·복원. `.nm-card ul li::before` 오렌지 점이 새어 들어와 `.bp-check li::before{content:none}`로 차단. 본문은 best-practices 문서 9개 H2를 한국어판으로(경어체, em dash 0, "당신" 0). 신규 CSS: `.tip`(원칙 한 줄 콜아웃), `.nm-card` 산문/리스트, `td.ba-before/.ba-after`(Before/After 표), `.next-links`(하네스·루프 크로스링크). code-example 3개. ② 4단계 표준 토글 4개 페이지 `pages-cli`에 `🎓 고수처럼 쓰기` 링크 추가(checklist·cheatsheet·tasks·github), CLI 2→3링크(노코드도 3이라 폭 대칭, 새 폭 정의 불필요). `claude-code-101.html`은 커스텀 헤더라 제외. ③ index CLI 트랙 grid 2→3열, 카드 추가(🎓·15분·고급). ④ AGENTS 인벤토리 38→39, 4단계 표 재작성(트랙 컬럼·토글 구조 설명), 콘텐츠 페이지 29→30. 검증: 콘솔 0, 토글 nocode/cli display 전환 OK, 스크롤스파이 `검증` 활성, 본문 산문·Before/After 표 elementFromPoint로 렌더 확인, index 카드 3·3열, 모바일(375px) sub-menu 숨김·햄버거 노출·header-pages 세로 스택·드로어 10항목 복제·heading `고수처럼 쓰기`·목록으로 index. 스크린샷은 스크롤 상태에서 빈 프레임 글리치(DOM eval로 대체 확정) |

### 2026-06-14

| # | 명령 | 범위 | 결과 |
|---|---|---|---|
| 11 | `news-clipping.html` 다이내믹 멀티에이전트 리뷰로 전문성 강화 + 사실 교정 | `news-clipping.html`, `MEMORY.md` | 사용자 요청("다이내믹 워크플로우로 작업, em dash 삭제, 프로페셔널하게"). Workflow 도구로 5렌즈(RED 이성·SILVER 분야전문가·BLUE 공감·GOLD 실독자·EDITOR 한국어문체) 병렬 리뷰 → 종합 편집자가 18개 편집 계획 합성(46건 지적 dedup). 적용: ① 누적 스킬화 서사 복원: STEP3에 수집 주기 프롬프트 신설(직전 24~48시간·평일), STEP5 스킬 프롬프트 빈 괄호 4줄을 완성형 철강 한 벌로 채움, STEP6에 루틴 예약 프롬프트 신설(prompt-box 4→6). ② 따라 하다 막힘 해소: STEP1에 "프롬프트 어디에 붙여넣나"(Claude Desktop 채팅) 안내, STEP5에 성공 판정선+산업 전환법 highlight-box, RESULT에 "결과가 이상할 때 점검표"(빈 브리핑·미달·깨진 링크·맹탕 시사점→해당 STEP). ③ 사실 교정(SILVER): `Metal Bulletin`→`Fastmarkets(구 Metal Bulletin)`+`CRU` 추가+`S&P Global(Platts)`, 소스 프롬프트에 날짜 강제·규제 교차검증, "링크 붙이면 환각 크게 준다" 단정을 "추적 가능+링크 실재는 눌러 확인"으로 정정, 10건 고정→"최대 10건(없는 날 적게)"+시사점 사실/추측 구분. ④ 문체(EDITOR/BLUE): `So what`·`TL;DR` 병기 전부 제거(시사점 한국어 통일, 첫 등장 1회만 풀이), STEP2·4 평어 제목을 경어로 종결체 통일(4.7), 232조·CBAM·IRA 첫 등장 괄호 풀이(4.6), flow-row(5칸)가 6단계 압축본임 명시. 검증: HTML unclosed 0, 본문 em dash 0(렌더 innerText 0), prompt-box 6·overflow 0, So what/TL;DR 잔재 0, 철강 셀 교정 확인, 콘솔 0. 디자인 토큰·구조 골격 불변(본문 카피·정보설계만). 워크플로우 비용: 6에이전트·604k토큰·약 10분 |
| 10 | 실전 예제 `기본 예제` 맨 앞에 `뉴스 클리핑` 예제 신설 | `news-clipping.html`(신규), `index.html`, `google-sheets-dashboard.html`, `harness-book.html`, `AGENTS.md`, `MEMORY.md` | 사용자 요청(`/goal` 비즈니스 리더가 바로 따라할 뉴스 클리핑 예제). ① `news-clipping.html` 신설: `google-sheets-dashboard.html` 골격 클론(CSS·반응형·SM-HAMBURGER·hero-video·reveal·switchMode 동일 유지). 6단계(STEP1 테마 설정 3축[산업·경쟁/공급망·규제]+예시 메뉴, STEP2 Tier1 매체 지정[Reuters·Bloomberg·WSJ·FT·Nikkei + 테마별 전문지 매핑 테이블], STEP3 수집 주기[데일리/위클리/이벤트 테이블], STEP4 정리 포맷[사실+시사점(So what)+출처+3줄 요약], STEP5 스킬화[`skills.html`], STEP6 루틴 예약[`routines.html`, wf-step 4단계]). 철강(steel-brief) 임원 예시로 끝까지 관통, prompt-box 4개. RESULT에 형식 예시 브리핑(실제 사건 아님 명시)+남는 것 4가지. sub-menu 8섹션, 스크롤스파이 `step6` 추가. ② index 기본 예제 첫 카드로 뉴스 클리핑 추가(📰·15분·중급), 카드 2→3이라 `grid-template-columns:1fr 1fr` 인라인 제거(기본 `.cards` 3열). ③ 기본 예제 header-pages 그룹(google-sheets·harness-book)에 뉴스 클리핑 링크 맨 앞 추가(6링크 공통). ④ AGENTS 인벤토리 37→38, 실전 예제 `5개 공통`→`6개 공통`+행·그룹 순서 규칙. 검증: HTML unclosed 0, 앵커 8쌍 정합, 테이블 2·prompt-box 4·copy-btn 4·wf-step 4·skill-preview 2 렌더, prompt 가로 오버플로 0, 모바일/데스크톱 스샷 확인, em dash 0, 콘솔 0 |
| 9 | 수강생 `갤러리`→`쇼케이스` 명칭 통일 + index 스크롤스파이 수정 + 쇼케이스 헤더 아이콘 제거 + md 운영문서 현행화 | `index.html`, `showcase.html`, `showcase-poems.html`, `README.md`, `AGENTS.md`, `MEMORY.md` | 사용자 요청("md 파일 모두 업데이트")로 누적 드리프트 정리. ① 명칭 통일: `수강생 갤러리`→`수강생 쇼케이스`, `스탑워치 갤러리`→`스탑워치 쇼케이스`(index 섹션 제목·section-num, showcase/showcase-poems `<title>`·h1·헤더 토글·CTA 버튼). 디자인·시각화 `갤러리`(EDA·UI 컴포넌트·UI 디자인)는 그대로 유지(범위 밖). ② index 스크롤스파이: `section-voices` 이후(수강생 영역)부터 sub-menu 활성 제거(`afterGuide` 가드 추가, 예제 메뉴 고정 방지). 수강생 쇼케이스 섹션 상단 `border-top` 제거. ③ showcase/showcase-poems 헤더 토글에서 이모지 아이콘(`.hpl-icon` ✍️·🏆) 제거해 텍스트 링크로 정리. ④ md 현행화: README 섹션 `수강생 갤러리`→`수강생 쇼케이스` + `showcase-poems.html` 행 추가(시 23편), AGENTS 인벤토리 36→37(`showcase-poems.html` 누락분 추가, 최근 커밋 44a2f26 신설분), `### 수강생 갤러리`→`### 수강생 쇼케이스 (header-pages: 2개)`, showcase 행에 2토글·아이콘 제거 반영. 비고: playmcp-kakao 변경(이번 세션 #1~8)은 직전 턴들에 이미 로그·AGENTS 카탈로그 반영 완료 |
| 8 | `playmcp-kakao.html` 주황 테두리 전부 제거 + Routines 문구 수정 + 모바일 최적화·디자인 클린업 | `playmcp-kakao.html`, `MEMORY.md` | 사용자 피드백. ① 남은 주황 테두리 제거: `.highlight-box` `border:1.5px rgba(179,85,53,.25)` 삭제 + `borderGlow` 맥동 애니메이션(`.highlight-box.visible`) 삭제(과한 주황 테두리 정체), INTRO 콜아웃 박스 인라인 `border:1.5px rgba(179,85,53,.3)` 삭제(배경 그라데이션만 유지). ② STEP4 Routines 문구 `…예약형 에이전트로, claude.ai 화면에서 예약합니다`→`…예약형 에이전트입니다`. ③ 모바일 최적화: `.step-badge` 모바일 `white-space:normal`+`max-width:70%`(긴 배지 가로 오버플로 해소, 이전 전 MCP 공통 이슈를 이 페이지에서 해결), `.step-divider`·`.nm-card h2`·`.highlight-box`·`.prompt-box` 모바일 폰트/패딩 축소, 480px서 배지 추가 축소. 검증: highlight/intro border 0px, 모바일 375px 가로 오버플로 0(bodyScrollW=375), 카카오 카드 우측 341<375, 배지 줄바꿈, 모바일 스샷 확인, em dash 0, 콘솔 0. 비고: 카피·구조는 다회 반복으로 이미 비즈니스 리더용으로 정제됨→이번엔 디자인/모바일 위주 |
| 7 | `playmcp-kakao.html` 좌측 컬러 띠지 전부 제거 + STEP2 부제 삭제 + PlayMCP 박스를 밝은 링크로 | `playmcp-kakao.html`, `MEMORY.md` | 사용자 피드백 3건([[no-left-color-bar-cliche]] 적용). ① 좌측 띠지 2곳 제거: `.nm-card h2`(`border-left:4px`+`padding-left:16px`→삭제, 제목 평문화)·`.tip-box`(`border-left:4px`→삭제). 정렬 위해 `.card-subtitle` `padding-left:20px`도 제거. **이 페이지 전용 변경**(다른 28개 페이지의 `.nm-card h2`/`.tip-box`는 좌측 바 유지 중, Rule 5 단일 페이지 디비에이션). ② STEP2 부제 `주소를 직접 붙일 필요 없습니다…` 삭제. ③ STEP1 어두운 PlayMCP `.skill-preview` 다크 박스(`#1A1917`)가 "너무 까매서 어색"→`.ref-link` 밝은 스타일(nm-bg + nm-shadow-sm)로 교체해 링크 affordance 부여(`Kakao PlayMCP 바로가기 … playmcp.kakao.com →`). 검증: h2/tip border-left 0px, 링크 bg=nm-bg, skill-preview 사용 0, em dash 0, 스크린샷 확인 |
| 6 | `playmcp-kakao.html` 루틴 단계(STEP4) 신설 + 운영·트러블슈팅 병합(STEP5) + PlayMCP 링크 STEP1 이동 + 배지/부제 정리 | `playmcp-kakao.html`, `AGENTS.md` | 사용자 피드백 6건. ① 첫 테스트(STEP3)에 섞여 있던 Routines 7시 57분 블록(설명·prompt-routine·정각회피 tip·routines.html 링크)을 분리해 **새 STEP4 `루틴으로 만들기`**(id `step-routine`) 신설. ② **운영 기준(STEP4→5) + 트러블슈팅 FAQ 병합**: FAQ 자체 구분선·`#faq` 앵커 제거, 운영 카드 뒤 FAQ 카드(`margin-top:24px`)로 한 STEP 안에 2카드. ③ INTRO 하단 `Kakao PlayMCP` skill-preview 링크를 **STEP1 도구함 끝으로 이동**(중복 없이 1개). ④ STEP2 배지 `커넥터에서 PlayMCP 찾아 연결`→`커넥터에서 PlayMCP 연결`(로드맵 카드2도 `찾아`→`` 정리). ⑤ STEP1 부제 `PlayMCP 도구함에 카카오톡 나와의 채팅방 도구 하나만 넣으면 됩니다` 삭제. ⑥ 로드맵 4번 카드 `운영 기준`→`Routines로 매일 자동 발송`(href `#step-routine`), 운영은 로드맵에서 빠지고 STEP5 최종 섹션으로. sub-menu 6항목(소개·도구함·커넥터 연결·첫 테스트·루틴으로 만들기·운영·점검), `?` 트러블슈팅 제거. 검증: content-section id=data-sec 6쌍 정합(intro·step2·step3·step4·step-routine·step5), 깨진 앵커 0, 스크롤스파이 누락 0, 배지 STEP1~5, skill-preview 1개, em dash 0, 콘솔 0. 미리보기 스크롤 고정 이슈로 STEP4/5 스샷 생략·DOM으로 확정 |
| 5 | `playmcp-kakao.html` STEP2 6컷 스크린샷 연결(`kakaotalk.webp`) + 진입 경로 `설정`→`Customize(사용자 지정)` 교정 + `playmcp 검색` 강조 | `playmcp-kakao.html`, `AGENTS.md` | 사용자 피드백. ① 지난 턴 placeholder `assets/playmcp-connect-steps.png`를 사용자가 저장한 실제 파일 `assets/kakaotalk.webp`(6컷 연결 흐름, 2048px)로 교체. img src·alt·figcaption 갱신. ② 진입 경로를 `설정 → 커넥터`에서 **`왼쪽 사이드바 Customize(사용자 지정) → 커넥터`**로 교정(사용자 명시). STEP2 intro·wf-step1 라벨/설명·figcaption 모두 반영. ③ "커넥터 둘러보기에서 `playmcp` 검색해 나온 PlayMCP 추가" 동작 강조(intro + wf-step2 라벨 `playmcp 검색해 추가`). 검증: 이미지 naturalWidth 2048 로드 OK, Pretendard 적용 확인(`document.fonts.check('16px Pretendard')`=true, body/h1 모두 Pretendard), 스크린샷 렌더 OK, 콘솔 0. 메모: 사용자가 별도로 보여준 `디렉터리 playmcp 검색` 단독 스크린샷은 assets에 없음→kakaotalk.webp 2번째 패널이 같은 단계 포함하여 그것으로 대체(원하면 별도 파일 저장 시 추가 가능) |
| 4 | `playmcp-kakao.html` 커넥터 연결 방식을 실제 흐름(커넥터 둘러보기→PlayMCP→연결→카카오 로그인)으로 교정 + 6컷 스크린샷 자리 + 정리 다수 | `playmcp-kakao.html`, `AGENTS.md` | 사용자 피드백 8건(스크린샷 동반). ① 참고자료에서 `Claude 커넥터 연결 안내`(Anthropic)·`Model Context Protocol 공식 문서`(MCP) 2개 링크 삭제, CTA 보조 버튼(같은 Anthropic 링크)도 제거. ② 면책 박스 첫 문장(`이 가이드는 2026년 5월 30일 기준…참고 자료입니다`) 삭제. ③ 라벨 `면책 고지`→`주의 사항`. ④ 그 박스 좌측 컬러 띠지 제거(`border-left:none`, [[no-left-color-bar-cliche]]). ⑤ STEP2를 URL 붙여넣기(Customize·Add custom connector·prompt-mcp-url)에서 **실제 커넥터 흐름**으로 전면 재작성: 설정→커넥터→커넥터 둘러보기→PlayMCP 찾아 +→연결→카카오 로그인→`모두 동의 후 계속하기`(5스텝). 사용자 제공 6컷 스크린샷 자리 `assets/playmcp-connect-steps.png`를 `<figure>`로 삽입(인라인 첨부라 파일 저장 불가→사용자가 직접 저장해야 표시, 현재 naturalWidth 0). ⑥ flow-row에서 `도구함 만들기`(PlayMCP 노드) 제거→`나챗방 추가`, 끝에 `루틴 설정/매일 예약`(⏰) 노드 추가, 중복 카카오톡 노드 정리(4노드 유지). ⑦ 카드 가로 축소(max-width 460px, 아이콘 72→58, 폰트·패딩 축소). ⑧ `터미널`·`터미널 없이`·`Customize`·URL 붙여넣기 표현 전부 제거(meta·헤더 부제·INTRO 블루박스·CTA·STEP1 URL획득 wf-step·FAQ Q1~Q3 갱신). STEP1은 카드만 남겨 간결화(도구함 생성·MCP URL 확인 wf-step 삭제). roadmap STEP1·2 제목에서 URL·Customize 제거. sub-menu STEP2 `커넥터 추가/Customize`→`커넥터 연결/PlayMCP`. DOM 검증: flow 4노드·카드폭 460·STEP2 커넥터 둘러보기·주의사항 좌측보더 0·이미지 자리·sub-menu 1~4, em dash 0, 콘솔 0. 미해결: 6컷 이미지 파일 미저장(사용자 액션 필요) |
| 3 | `playmcp-kakao.html` STEP1(준비) 제거 + 카카오톡 `도구함에 추가` 그래픽 + 7시 57분 이유 추가 | `playmcp-kakao.html`, `AGENTS.md` | 사용자 요청 3건. ① "Step 1 필요 없어": 준비 섹션(`#step1`) 전체와 sub-menu·roadmap 항목 삭제, 표시 번호를 1~4로 재정렬(STEP 배지·sm-num·roadmap-num·label·`실습 5단계`→`4단계`·교차참조 `STEP 2에서`→`STEP 1에서`). 섹션 id는 `step2`~`step5` 그대로 두고 앵커도 유지해 깨짐 0(표시번호와 id 오프셋 1, 의도적). ② 첨부 이미지(카카오톡 나챗방 `+ 도구함에 추가` 위젯)를 도구함 단계 본문에 다크 카드로 재현(노란 #FEE500 타일 + 갈색 말풍선 `TALK` 인라인 SVG + 흰 테두리 pill 버튼), 위에 "이 카드를 찾아 + 도구함에 추가를 누르세요" 안내, wf-step2 문구도 버튼 누르기로 갱신. 원본 PNG는 인라인 첨부라 경로 없음→HTML/CSS 재현(scalable·테마 일치). Notion 참고 페이지는 JS 렌더라 WebFetch로 본문·이미지 추출 불가. ③ Routines 블록에 `왜 8시 정각이 아니라 7시 57분` tip-box 추가(예약 몰림 시 실행 최대 30분 지연 → 정각 회피해 일찍 예약). DOM 검증: sub-menu 6개(0·1~4·?), 깨진 앵커 0, TALK 카드·tip·안내 렌더 확인, 콘솔 0, em dash 0. 모바일: 카드 미오버플로(우측 341<375). 기존 이슈: step-badge nowrap이 모바일 가로 오버플로(전 MCP 페이지 공통, 범위 밖 미수정) |
| 2 | `playmcp-kakao.html`를 클로드 코드(터미널) 기준에서 Claude Desktop 커넥터 기준으로 전면 전환 | `playmcp-kakao.html`, `AGENTS.md` | 사용자 요청("클로드 데스크탑으로, 터미널 열지 않고"). STEP 3을 `claude mcp add`·`.mcp.json`·`--transport`·`/mcp` CLI 흐름에서 `korean-law-mcp.html`과 동일한 Desktop 패턴(왼쪽 사이드바 Customize → Connectors → Add custom connector → URL 붙여넣기 → 카카오 OAuth 로그인 승인)으로 재작성. CLI prompt-box 3개(prompt-add·prompt-add-auth·prompt-json) 제거, URL prompt-box 1개(prompt-mcp-url)로 대체. 서브메뉴 STEP3 라벨 `클로드 코드/mcp add`→`커넥터 추가/Customize`, 로드맵·flow-node·헤더 부제·INTRO·면책·CTA·참고링크(claude-code/mcp 문서→Claude 커넥터 연결 안내)까지 Desktop으로 통일. STEP5의 `always allow`→`자동 허용`, `CLAUDE.md`→`Projects 지침/대화 첫머리`로 환원. FAQ 5문 중 CLI 의존 Q1~Q3을 Desktop(메뉴 안 보임·URL 위치·OAuth/도구 토글)으로 교체. Routines 7시 57분 예시는 claude.ai 클라우드 예약(터미널 불필요)임을 명시해 유지. 본문 `클로드 코드` 잔재 0(og/twitter 공통 설명만 보존), em dash 0. DOM 검증·콘솔 에러 0, STEP3 렌더 스크린샷 확인 |
| 1 | `playmcp-kakao.html` 본문 군더더기 정리 + Routines 매일 7시 57분 응원 메시지 예시 추가 | `playmcp-kakao.html` | 사용자 요청("너무 어렵고 말이 많아, 비즈니스 리더 대상 명료하게" + Routines 응원 메시지). INTRO 장황한 도입부 압축, 범위 안내문 1문장으로 축약, STEP4 중복 역할카드 3개 제거. STEP4에 🌅 매일 아침 7시 57분 응원 메시지 블록 + 예약 prompt-box(prompt-routine) + `routines.html` 링크 추가. CTA·되는 일 카드에 자동 발송 반영. 구조·디자인 토큰·공통 블록 불변(Rule 5 위반 없음) |

### 2026-06-13

| # | 명령 | 범위 | 결과 |
|---|---|---|---|
| 8 | md 운영 문서 현행화 (사이트 현재 상태 반영) | `README.md`, `AGENTS.md`, `MEMORY.md` | 사용자 요청("모든 md 파일 업데이트"). 누적된 드리프트 정리. README: 2단계에서 `claude-design` 행 제거(아카이브 반영)·`확장 프로그램`으로 개명, 5단계 자동화를 `하네스/도구/루프` 3묶음 8페이지로 재구성(`harness-workflows` 라벨 `다이내믹 워크플로우`→`멀티 에이전트 소환`, `loop-engineering`·`routines` 추가), 실전 예제에 `playmcp-kakao`·`korean-law-mcp` 추가(기본/MCP 2묶음), 백과사전→`AI 백과사전`, 갤러리 카운트(EDA 12→21·UI 트렌드 12→30), `보안·법률`·`수강생 갤러리(showcase)` 섹션 신설, v1.6 릴리스 노트에 이번 주 개편 보강. AGENTS: 인벤토리 32→36, 5단계 표를 8페이지 전부로 완성(code-plugin·loop-engineering·routines 추가), `AI 백과사전`·`수강생 갤러리` 반영, 갤러리 카운트 수정. 운영 외 하위 프로젝트 md(`lge/README.md`·`SKILL.md`·`assets/cases/07_ceo/plan.md`)는 범위 밖으로 보존 |
| 7 | `index.html` `백과사전` 명칭 변경 + 참고 카드 시간 배지 제거 | `index.html` | `하네스 엔지니어링 백과사전` 섹션 제목을 `AI 백과사전`으로 개명. 참고(reference) 성격 카드 8개(백과사전 3·갤러리 3·보안·법률 2)에서 `⏱ 필요할 때` 시간 배지를 제거해 `참고` 레벨 배지만 남김(시간 표기가 무의미한 참고 페이지 정리) |
| 6 | `file-types.html` 리더 우선(reader-first) 카탈로그로 재편 | `file-types.html` | 비개발자 카탈로그를 AI 관점(AI가 읽음/생성)으로 재편. 본문 "당신" 호칭 제거(AGENTS 4.10), 행위·대상 중심 서술로 전환. 파일 8종 구성은 유지하되 설명 틀을 사람이 직접 다루는 파일 vs AI가 읽고 쓰는 파일로 재배치 |
| 5 | `glossary.html` 68선 확장 + `license-compare.html` 신호등 모델 + AGENTS 4.10 신설 | `glossary.html`, `license-compare.html`, `AGENTS.md` | glossary: 6막 하네스·운영에 `피지컬 AI`(Physical AI, 화면 밖 현실에서 몸으로 일하는 AI) 추가, 67→68선(타이틀·h1·서브카운트·CTA 수치 일괄 갱신, 루틴 항목 `마지막으로`→`~단계도 생겼습니다`로 다듬어 흐름 정리). license-compare: 상단에 제약 수위 3색 신호등 모델 섹션 신설(초록 MIT·Apache / 노랑 LGPL / 빨강 GPL·AGPL), sub-menu 4→5섹션(신호등 추가), intro 문구를 세 단계 분류 안내로 교체, 라이선스 카드에 `.lic-signal` 배지 도입. AGENTS: 4.10 `2인칭 호칭 "당신" 절대 금지` 규칙과 4.11 마지막 점검 7번 항목 추가 |
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
| 3개 | `ai-fluency.html` | 13개 페이지 + 보안·법률 트랙 3개(`ai-hallucination`·`security-guide`·`ai-basic-law`, 2026-06-18 승격) | ✅ 16/16 |
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
