# Phase 3 설계: Agent Teams + MCP

> F&B 프랜차이즈 본사 매뉴얼 시스템의 다음 단계. 1차 PoC(44 챕터 작성)에서 검증된 3-에이전트 하네스를 **다중 팀 협업 + 외부 시스템 통합**으로 확장.
>
> 작성: 2026-05-08 / 기반: Phase 2 PoC 결과(`shared/eval_report.json` 9 라운드 41 pass)

---

## 0. Phase 진화 한눈에 보기

| 항목 | Phase 1 (이전) | Phase 2 (PoC, 완료) | Phase 3 (제안) |
|---|---|---|---|
| 범위 | 매뉴얼 **작성** | 매뉴얼 **작성·검증** | 매뉴얼 **작성·검증·배포·갱신·모니터링** |
| 시간 | 부서별 1주 = 7주 | 반나절~3일 (44 챕터) | 상시 운영 (실시간) |
| 인력 | 부서당 담당자 1명 | 사람 1명 + 5 에이전트 (5-Agent Harness) | 사람 1명 + 5 팀(25+ 에이전트) |
| 트리거 | 사람이 시작 | 사람이 시작 | 시스템 이벤트 자동 트리거 |
| 산출물 | .docx 매뉴얼 | .md 챕터 + 검증 리포트 | + .pptx/.pdf + LMS 등록 + Slack 공지 + Jira 이슈 |
| 외부 시스템 | 없음 | 없음 | MCP 통합 (8+ 시스템) |
| 처리량 | 7 챕터/7주 = 1/주 | 44 챕터/1일 | 무제한 (이벤트 기반) |

---

## 1. 목표

### 1.1 기능 목표

1. **상시 매뉴얼 갱신 사이클**: 정기 트리거(분기·연간) + 이벤트 트리거(법령·계약·이슈) 모두에 자동 대응
2. **자동 배포 파이프라인**: 작성 → 검증 → 변환(.md → .pptx → .pdf) → 본사 ERP/교육 LMS 등록 → 카카오톡 공지 → 가맹점주 단체방까지 1-click
3. **실시간 KPI 모니터링**: POS 시스템·본사 ERP 데이터를 시간 단위로 수집하여 매뉴얼이 정의한 KPI 임계값 위반 시 즉시 알림
4. **연속 개선 루프**: 가맹점 피드백·SV 일지·외부 검색 결과를 매뉴얼 개정 제안으로 자동 변환
5. **컴플라이언스 자동화**: 노무·세무·계약 법령 갱신 시 영향받는 챕터 자동 탐지 + 개정 제안

### 1.2 비기능 목표

- **신뢰성**: 매뉴얼 변경 사항은 항상 Evaluator 게이트 통과 후 배포 (Phase 2 검증 그대로 유지)
- **추적성**: 모든 자동 행동은 Jira 이슈 + Notion 페이지로 영구 기록
- **권한 분리**: 자동 배포는 사람 승인 필수 (배포 전 Slack에 미리보기 게시 → 24h 내 거부 없으면 진행)
- **가역성**: 모든 배포는 git 커밋으로 롤백 가능
- **사람 in the loop**: 중대 변경(법령·예산 1억 초과·계약)은 항상 사람 결재

---

## 2. 아키텍처

### 2.1 5-팀 구조

```
                      ┌─────────────────────┐
                      │   Orchestrator      │  ← 사람 명령 또는 이벤트 트리거
                      │   (총괄 조정자)     │
                      └──────────┬──────────┘
                                 │
        ┌────────────┬───────────┼───────────┬────────────┐
        ▼            ▼           ▼           ▼            ▼
  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐
  │ Authoring│ │Distribution│ │Monitoring│ │Compliance│ │Feedback  │
  │   Team   │ │   Team    │ │  Team    │ │  Team    │ │  Team    │
  │  (5 ag)  │ │  (4 ag)   │ │  (4 ag)  │ │  (3 ag)  │ │  (4 ag)  │
  └──────────┘ └──────────┘ └────────┘ └──────────┘ └──────────┘
        │            │           │           │            │
        └────────────┴─── shared memory ──────┴────────────┘
                  (feature_list / progress / kpi_state /
                   compliance_watch / feedback_queue)
```

### 2.2 팀별 역할

#### Team 1: Authoring (Phase 2 계승)
| 에이전트 | 모델 | 역할 |
|---|---|---|
| `benchmark-analyst` | opus | 외부 사례·reference 톤 정량 분석 (Phase 2 도입) |
| `hq-strategist` | opus | 챕터 분해, design_spec 갱신 (Phase 2의 planner 계승) |
| `sop-writer-1~7` | sonnet | 부서별 챕터 작성 (Phase 2의 generator 계승) |
| `qsc-auditor` | sonnet | design_spec 자동 검증 (Phase 2의 evaluator 계승) |
| `field-sv` | sonnet | PPTX/PDF 변환 + 배포 계획 (Phase 2 도입) |
| **`revisor`** ⭐신규 | sonnet | 기존 챕터 부분 개정 (변경 사유 발생 시) |

→ **변경점**: revisor 추가. Phase 2는 처음부터 작성, Phase 3은 부분 패치도 지원.

#### Team 2: Distribution
| 에이전트 | 도구 | 역할 |
|---|---|---|
| builder-pptx | 매뉴얼 v4 빌더 (CLI 래퍼) | .md → .pptx 자동 변환 |
| builder-pdf | LibreOffice/wkhtmltopdf | .pptx → .pdf 변환 |
| publisher-baljugo | 본사 ERP API (or web 자동화) | 본사 ERP [매뉴얼관리] 업로드 |
| publisher-academy | 교육 LMS LMS API | 강의 등록·이수 추적 활성 |
| notifier-kakao | 카카오톡 비즈니스 채널 API | 가맹점주 단체방 공지 |

#### Team 3: Monitoring
| 에이전트 | 데이터 소스 | 역할 |
|---|---|---|
| kpi-collector | POS 시스템 API + 본사 ERP API | 시간 단위 KPI 수집 |
| anomaly-detector | kpi_state 시계열 | KPI 임계값 위반·이상치 탐지 (G/Y/R 등급) |
| alerter | Slack MCP + 카카오톡 | R 등급 발생 시 SV·팀장 즉시 알림 |
| jira-tracker | Atlassian MCP | 위반 건당 자동 Jira 이슈 생성·추적 |

#### Team 4: Compliance
| 에이전트 | 데이터 소스 | 역할 |
|---|---|---|
| law-watcher | 정부24·법제처 RSS / 웹 | 노동법·세법·식품위생법 개정 모니터링 |
| impact-analyzer | chapters/ + law diff | 영향받는 챕터·STEP·임계값 식별 |
| revision-proposer | impact 결과 → revisor 호출 | 개정 PR 제안 (사람 승인 후 적용) |

#### Team 5: Feedback
| 에이전트 | 데이터 소스 | 역할 |
|---|---|---|
| sv-log-parser | SV 방문일지 (본사 ERP) + Fireflies 미팅 녹취 | 현장 의견·이슈 추출 |
| franchise-pulse | Pendo / Amplitude | 매뉴얼 사용 패턴 (이수율·체류 시간) |
| pattern-finder | 누적 피드백 → 매뉴얼 결함 패턴 탐지 | 개정 후보 챕터 도출 |
| improvement-proposer | pattern → revisor 호출 | 개정 PR 제안 (Compliance Team과 동일 흐름) |

### 2.3 Shared Memory 확장

Phase 2는 4개 파일(`design_spec`·`feature_list`·`progress`·`eval_report`)였음. Phase 3에 신규 추가:

| 파일 | 책임 팀 | 갱신 주기 |
|---|---|---|
| **kpi_state.json** | Monitoring | 매시간 (KPI 시계열·등급) |
| **compliance_watch.json** | Compliance | 일 1회 (법령 변동 큐) |
| **feedback_queue.json** | Feedback | 실시간 (피드백 인박스) |
| **deployment_log.json** | Distribution | 배포 시 (본사 ERP/LMS/카카오톡 이력) |
| **revision_proposals.md** | Compliance + Feedback | PR 제안마다 (사람 승인 대기) |

기존 4개 파일은 **모든 팀이 read-only 참조**, 갱신은 Authoring 팀만.

---

## 3. MCP 통합

Phase 3은 외부 시스템과 직접 연동. 사용 가능한 MCP 서버 매핑:

### 3.1 핵심 MCP 통합 (필수)

| MCP 서버 | 용도 | 사용 팀 | 권한 수준 |
|---|---|---|---|
| **Slack** | 가맹점주·SV·임원 알림 채널 | Monitoring·Distribution·Compliance | write (사람 승인 후) |
| **Atlassian (Jira)** | 이슈·개정 PR 트래킹 | Monitoring·Compliance·Feedback | write |
| **Notion** | 사내 위키·매뉴얼 색인 | Distribution·Authoring | write |
| **Gmail** | 외부 노무사·세무사 협력 | Compliance | read + draft only |
| **Calendar** | 정기 점검 트리거 (월·분기·연간) | Orchestrator | read |
| **Google Drive (file/copy/search)** | PPTX/PDF 클라우드 저장 | Distribution | write |

### 3.2 보조 MCP 통합 (선택)

| MCP 서버 | 용도 | 사용 팀 |
|---|---|---|
| **Fireflies** | SV 가맹점주 미팅 녹취 → 피드백 추출 | Feedback |
| **Pendo / Amplitude** | 매뉴얼 사용 분석 (이수율·체류) | Feedback |
| **Figma** | BI 가이드 자산(로고·컬러·아이콘) 동기화 | Authoring (마케팅 Ch04) |
| **Intercom** | 가맹점주 인바운드 문의 → 피드백 큐 | Feedback |
| **Monday / ClickUp** | (대안 PM 도구, Jira 미사용 시) | Monitoring·Compliance |

### 3.3 자체 구축 필요 (MCP 미보유)

| 시스템 | 대안 | 비고 |
|---|---|---|
| **POS 시스템** | 외부 API + Python 래퍼 | 시간 단위 매출·KPI 폴링 |
| **본사 ERP** | 웹 자동화(Playwright) 또는 백엔드 직접 연동 | 가맹점 데이터·정산·재고 |
| **교육 LMS LMS** | LMS 벤더 API | 강의 등록·이수 추적 |
| **카카오톡 비즈채널** | 카카오 i 비즈니스 API | 가맹점주 단체방 공지 |
| **콜드체인 GPS·CCTV** | 벤더 API | 해산물물류 Ch05·Ch07용 |
| **홈택스** | 별도 (RPA 또는 회계 ERP 미들웨어) | 재무·정산 Ch02 자동화 |

---

## 4. 핵심 워크플로 5개

### 4.1 워크플로 A: 신규 챕터 → 배포까지 (Phase 2 + Distribution Team)

```
[사람] "마케팅 신규 챕터 추가: Ch06 디지털광고"
   │
   ▼
[Orchestrator] feature_list.json에 T045 추가
   │
   ├─→ [hq-strategist] design_spec 보강 (필요 시)
   │
   ├─→ [sop-writer-5] T045 작성 (Phase 2 sop-writer 그대로)
   │       │
   │       ▼
   ├─→ [qsc-auditor] 검증 → pass
   │
   ├─→ [builder-pptx] T045.md → T045.pptx
   ├─→ [builder-pdf] T045.pptx → T045.pdf
   │
   ├─→ [Slack #manuals-preview] 미리보기 게시 (24h 사람 승인 대기)
   │
   ▼ (사람 승인 또는 24h 무이의)
[publisher-baljugo] 본사 ERP [매뉴얼관리] 업로드
[publisher-academy] 교육 LMS 강의 자동 등록
[notifier-kakao] 가맹점주 단체방 공지
   │
   ▼
[deployment_log.json] 이력 기록
[Notion] 색인 페이지 자동 갱신
```

**소요 시간**: 챕터당 ~2시간 (Phase 2의 챕터 작성 + Phase 3 배포 자동화)

### 4.2 워크플로 B: KPI 임계값 위반 → 즉시 알림 + 개선 트리거

```
[kpi-collector] 매시간 POS 시스템 데이터 수집
   │
   ▼
[anomaly-detector] 가맹점 X의 원가율 38% 검출 (KPI 임계값 33% 초과 → R 등급)
   │
   ├─→ [alerter → Slack] SV 채널에 즉시 알림 + Y/R 등급 매장 리스트
   ├─→ [alerter → 카카오톡] 가맹점주 단체방에 컨설팅 일정 안내
   ├─→ [jira-tracker] Atlassian에 자동 이슈 생성 ("재무·정산 Ch04 STEP 3 KPI 위반: 매장 X")
   │       │ Assignee: 담당 SV
   │       │ Linked chapter: chapters/재무정산/Ch04_원가관리.md (STEP 3)
   │
   ▼ (담당 SV가 가맹운영지원 Ch02 슈퍼바이징 Ch03 QSC 점검 SOP 따라 방문)
[sv-log-parser] 방문일지에서 개선과제 추출
   │
   ▼ (이슈 종결 또는 가맹운영지원 Ch07 이슈관리로 escalation)
[jira-tracker] 이슈 상태 갱신
[kpi_state.json] 시계열 추가 (등급 변화 추적)
```

**검출 시간**: 위반 발생 후 **최대 1시간 이내**

### 4.3 워크플로 C: 법령 개정 → 자동 영향 분석 + 개정 PR

```
[law-watcher] 매일 06:00 정부24·법제처 RSS 수집
   │
   ▼
근로기준법 개정 검출 (예: 주 52시간 → 주 48시간 예외 추가)
   │
   ▼
[impact-analyzer] chapters/ 전수 grep
   │  발견: 인사·교육 Ch06 노무관리 STEP 2 "주 52시간 준수" 영향
   │       재무·정산 Ch04 원가관리 STEP 4 인건비 KPI 영향
   │
   ▼
[revision-proposer] 개정 초안 작성 → revisor 에이전트 호출
[revisor] 영향받는 STEP 부분 패치 (전체 재작성 X, 패치 diff)
   │
   ▼
[qsc-auditor] 패치 후 챕터 재검증
   │
   ▼
[revision_proposals.md] 사람 검토 PR 게시
[Slack #compliance] 알림: "법령 개정 → 2개 챕터 패치 제안 ($PR_LINK)"
   │
   ▼ (사람 승인)
[publisher-*] 워크플로 A 동일
```

**개정 사이클**: 법령 검출 → 배포까지 **48시간 이내**

### 4.4 워크플로 D: 가맹점 피드백 누적 → 매뉴얼 패턴 결함 발견

```
[franchise-pulse] Pendo로 매뉴얼 사용 데이터 분석
   │  발견: 조리 Ch05 주방동선 챕터 평균 체류 12분 (다른 챕터 평균 4분)
   │       → 사용자가 이해 어려워 반복 열람 추정
   │
[sv-log-parser] Fireflies SV 미팅 녹취 분석
   │  키워드: "주방동선이 복잡해서 신입이 헷갈린다" 빈도 증가
   │
   ▼
[pattern-finder] 두 신호 결합 → 결함 후보: "조리 Ch05 STEP 2 신규 매장 동선 감리"
   │  근거 데이터:
   │    - Pendo 체류 12분 (전체 평균 대비 3배)
   │    - SV 미팅 5건/월 동일 키워드 발견
   │    - 가맹점 컴플레인 큐(Intercom) 동선 관련 3건/월
   │
   ▼
[improvement-proposer] 개정 제안 작성 → revision_proposals.md
   │  "조리 Ch05 STEP 2 시각 자료 추가 + 단계별 사진 5컷 첨부 제안"
   │
   ▼ (사람 승인)
[revisor] 패치 → [qsc-auditor] 검증 → [publisher-*] 배포
```

**개선 사이클**: 패턴 검출 → 배포까지 **1주 이내**

### 4.5 워크플로 E: 분기 정기 점검 (캘린더 트리거)

```
[Calendar] 분기 첫째 영업일 09:00 트리거
   │
   ▼
[Orchestrator] 분기 점검 시퀀스 시작
   │
   ├─→ [Compliance] 분기 법령 갱신 차이 분석 → revision_proposals
   ├─→ [Monitoring] 전 분기 KPI 회고 → kpi_state 차이 리포트
   ├─→ [Feedback] 전 분기 피드백 통계 → pattern-finder 재실행
   ├─→ [Authoring (hq-strategist)] 분기 챕터 갱신 후보 평가
   │
   ▼ (병렬)
[shared/quarterly_report.md] 자동 생성:
   - 법령 변동 N건 → 챕터 X개 영향 → 패치 제안 PR
   - KPI 위반 N건 → 매장 Y개 → 매뉴얼 결함 후보 Z개
   - 피드백 N건 → 패턴 발견 N개 → 개정 후보
   - 분기 챕터 갱신 권장 리스트
   │
   ▼
[Slack #manuals-quarterly] 분기 리포트 + 액션 아이템 → 임원 검토 회의 input
```

**소요**: 자동 생성 ~30분 (수면 후 출근 전 완료)

---

## 5. 마이그레이션 (Phase 2 → 3)

### 5.1 단계별 도입

| 마일스톤 | 기간 | 산출물 | 검증 게이트 |
|---|---|---|---|
| **M1: Distribution Team 가동** | 2주 | builder-pptx + builder-pdf + publisher-baljugo 1개 매장 파일럿 | 5개 챕터 자동 배포 |
| **M2: Monitoring Team 가동** | 3주 | kpi-collector + anomaly-detector + Slack alerter | KPI 1개 도메인(원가율) 실시간 추적 |
| **M3: Compliance Team 가동** | 4주 | law-watcher + impact-analyzer + revisor | 법령 1건 자동 패치 PR 검증 |
| **M4: Feedback Team 가동** | 4주 | sv-log-parser + franchise-pulse + pattern-finder | 1개 패턴 검출 → 개정 제안 |
| **M5: Orchestrator 통합** | 2주 | 5팀 통합 + 분기 정기 점검 자동화 | 워크플로 E 무인 1회 |

총 **15주** (약 4개월) 안에 5팀 모두 운영. 그동안 Phase 2 하네스는 그대로 운영(이중화).

### 5.2 점진적 권한 부여

| 단계 | 자동 행동 | 사람 승인 |
|---|---|---|
| 초기 (M1~M2) | 미리보기 생성·알림만 | 모든 배포·패치 |
| 중기 (M3~M4) | 챕터 1개·매장 1개 한정 자동 배포 | 다수 챕터·전사 배포 |
| 후기 (M5+) | 분기 정기·법령 자동 패치 | 매뉴얼 신규 추가·아키텍처 변경 |

### 5.3 코드/설정 변경

```
manual-harness/
├── .claude/agents/
│   ├── benchmark-analyst.md ← Phase 2 그대로
│   ├── hq-strategist.md     ← Phase 2 그대로 (이전 planner)
│   ├── sop-writer.md        ← Phase 2 그대로 (이전 generator)
│   ├── qsc-auditor.md       ← Phase 2 그대로 (이전 evaluator)
│   ├── field-sv.md          ← Phase 2 그대로
│   ├── revisor.md        ⭐ 신규
│   ├── orchestrator.md   ⭐ 신규
│   ├── builder-pptx.md   ⭐ 신규
│   ├── ...               ⭐ 18개 추가
├── shared/
│   ├── design_spec.md    ← Phase 2 그대로
│   ├── feature_list.json ← Phase 2 그대로
│   ├── progress.md       ← Phase 2 그대로
│   ├── eval_report.json  ← Phase 2 그대로
│   ├── kpi_state.json    ⭐ 신규
│   ├── compliance_watch.json ⭐ 신규
│   ├── feedback_queue.json ⭐ 신규
│   ├── deployment_log.json ⭐ 신규
│   └── revision_proposals.md ⭐ 신규
├── workflows/            ⭐ 신규 (5개 워크플로 정의)
│   ├── A_new_chapter.md
│   ├── B_kpi_alert.md
│   ├── C_compliance.md
│   ├── D_feedback.md
│   └── E_quarterly.md
├── integrations/         ⭐ 신규
│   ├── mate_pos_client.py
│   ├── baljugo_client.py
│   ├── academy_client.py
│   ├── kakao_biz_client.py
│   └── builder_wrapper.py
└── settings.json         ⭐ MCP 서버 권한 + cron 정의
```

---

## 6. 리스크 + 완화

| 리스크 | 영향 | 완화책 |
|---|---|---|
| **자동 배포 오류로 잘못된 매뉴얼 전사 공지** | 가맹점 혼선·신뢰 하락 | (1) 미리보기 게시 → 24h 사람 승인 의무 (2) 모든 배포는 git 커밋 → 1-click 롤백 |
| **법령 잘못 해석으로 위법 매뉴얼 생성** | 노동청·국세청 점검 불이익 | impact-analyzer 결과는 외부 노무사·세무사 검토 필수 (Compliance Team의 Gmail draft only 권한) |
| **MCP 서버 인증 토큰 유출** | 외부 시스템 무단 접근 | (1) settings.json에 토큰 직접 저장 금지 → 환경 변수 (2) 분기 1회 토큰 로테이션 |
| **알림 폭주(R 등급 30개 매장 동시 발생)** | SV 응답 마비 | anomaly-detector에 batch 알림 + 우선순위 큐 도입 (예: 매출 큰 매장·식품안전 사고 우선) |
| **에이전트 무한 루프** (revisor → qsc-auditor → revisor) | 비용 폭주·매뉴얼 손상 | revisor 호출 횟수 챕터당 최대 3회 제한 + 사람 escalation |
| **가맹점 개인정보 외부 시스템 유출** | 개인정보보호법 위반 | publisher-* 에이전트는 가맹점 식별 정보 마스킹 후 송신 |

---

## 7. 성공 지표

### 7.1 정량 지표 (12개월 목표)

| 지표 | 현재 (Phase 2) | 목표 (Phase 3 M5) |
|---|---|---|
| 매뉴얼 신규 작성 시간 | 챕터당 ~3분 (Generator) | 챕터당 ~3분 + 배포 자동화 ~10분 |
| 매뉴얼 갱신 주기 | 분기 1회 (수동) | 법령 시 48h, 정기 분기 무인 |
| KPI 위반 검출 시간 | 월 1회 SV 방문 | 1시간 이내 |
| 가맹점 매뉴얼 이수율 | 90% (수동 추적) | 95% (자동 추적·독려) |
| 컴플레인 → 매뉴얼 개정 사이클 | 분기 (사람 회의) | 1주 이내 (패턴 검출 자동) |
| 외부 시스템 통합 수 | 0 | 8+ (Slack·Jira·Notion·Gmail·Calendar·Drive·Fireflies·Pendo) |

### 7.2 정성 지표

- **운영 인건비**: SV 1인이 담당 매장 30→50개로 확장 가능 (자동화로 단순 작업 대체)
- **컴플라이언스 사고**: 노동청·식약처 점검 무지적 100% 유지
- **가맹점 만족도**: 본사 매뉴얼 활용도(Pendo) 분기 +5%p

---

## 8. 로드맵

```
2026 Q3 (7~9월) ─┬── M1 Distribution Team (2주)
                 │
                 ├── M2 Monitoring Team (3주)
                 │   └─ KPI 1개 도메인 파일럿 (원가율)
                 │
2026 Q4 (10~12월)┼── M3 Compliance Team (4주)
                 │   └─ 법령 1건 자동 패치 검증
                 │
                 ├── M4 Feedback Team (4주)
                 │   └─ 1개 패턴 검출 → 개정 제안
                 │
2027 Q1 (1~3월) ─┴── M5 Orchestrator 통합 (2주)
                     └─ 분기 정기 점검 무인 1회 → 정식 가동

2027 Q2~ ── 운영 + 신규 부서 추가 (예: 신사업·해외 진출)
```

---

## 9. 다음 액션 (M1 즉시 시작 가능 항목)

1. **builder-pptx 에이전트 정의** (`/.claude/agents/builder-pptx.md`)
   - 매뉴얼 v4 빌더 HTML을 headless Chrome으로 호출하는 Python 래퍼 작성
   - chapters/{부서}/Ch*.md → output/{부서}/Ch*.pptx 일괄 변환
2. **publisher-baljugo PoC** (`integrations/baljugo_client.py`)
   - 본사 ERP [매뉴얼관리] 업로드 자동화 (1개 챕터 파일럿)
3. **Slack MCP 권한 설정** (`settings.json`에 슬랙 워크스페이스 추가)
4. **kpi-collector 시작** (POS 시스템 외부 API 키 확보 → 1개 KPI 1시간 폴링)

---

*Phase 2 PoC가 검증한 "benchmark-analyst → hq-strategist → sop-writer → qsc-auditor → field-sv" 5-에이전트 패턴은 Phase 3 Authoring Team(+revisor)에 그대로 계승된다. Phase 3은 그 위에 배포·모니터링·컴플라이언스·피드백 4개 팀을 더해 매뉴얼을 단발성 산출물에서 상시 운영 가능한 시스템으로 전환한다.*
