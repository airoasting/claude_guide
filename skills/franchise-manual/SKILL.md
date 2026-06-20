---
name: franchise-manual
description: F&B 프랜차이즈 본사·가맹점의 전 부서 운영 매뉴얼(SOP)을 5-에이전트 협업으로 분석·기획·작성·검증·배포 준비까지 한 번에 처리한다. 운영 SOP가 7~10개 부서로 흩어져 있고 부서마다 6~8개 챕터가 필요하며 톤·구조·디자인을 일관되게 맞춰야 하는 상황에서 사용. 사용자가 "프랜차이즈 매뉴얼", "본사 SOP", "가맹점 매뉴얼", "F&B 운영 매뉴얼", "QSC 매뉴얼", "부서별 표준작업절차", "운영 매뉴얼 자동 작성"을 요청하거나 여러 부서 매뉴얼을 한꺼번에 만들어 달라고 하면 발동한다. 단발 챕터 1개 윤문·번역·요약, 이미 완성된 매뉴얼의 단순 평가, 비(非)매뉴얼 일반 문서 작성에는 발동하지 않는다.
---

# F&B 프랜차이즈 매뉴얼 자동 작성 스킬 (5-Agent Harness)

> 5개 전문 에이전트가 협업해 40개 이상 매뉴얼 챕터를 반나절~3일 만에 작성·검증·배포 준비까지 끝낸다. 사람이 부서별로 직접 쓰면 약 12주 걸리는 작업이다.

---

## 0. 발동 / 비발동 경계

**발동한다** (아래 부서 규모 기준을 **발동 임계값**으로 본다)
- **부서 5개 이상**(권장 7~10개)의 운영 매뉴얼·SOP를 일괄 작성·개정해야 할 때 — 이 "여러 부서" 기준은 **≥5개 부서**를 뜻한다(5-에이전트 병렬·정합 관리의 손익분기). 2~4개 부서면 라이터 인스턴스를 줄여 축소 운영하거나(7→해당 수) 단발 편집으로 처리한다.
- 신규 가맹점 오픈·정기 개정 시 표준 매뉴얼 세트가 필요할 때
- 부서별로 흩어진 SOP를 일관된 톤·구조로 통합해야 할 때

**발동하지 않는다** (다른 방식으로 처리)
- 챕터 1개 단순 윤문/번역/요약 → 일반 편집으로 처리(5-에이전트 사이클 불필요)
- 이미 완성된 매뉴얼의 점수 평가만 요청 → 5-에이전트 사이클을 돌리지 말고 `qsc-auditor` 1개만 단독 호출(스킬 전체 발동 아님)
- 매뉴얼이 아닌 일반 비즈니스 문서(이메일·보고서 등) → 해당 도메인 스킬 사용

이 스킬은 **반복 가능한 운영체계**를 남기는 것이 목적이다. 단발 산출물 1건이면 과한 도구다.

---

## 1. 이 스킬이 해결하는 문제

- **톤 일관성 부재**: 부서별로 따로 쓰면 표현·구조가 제각각
- **객관 검증 부재**: 작성자가 자기 글을 스스로 검증하기 어려움
- **반복 작업 폭증**: 부서 N × 챕터 M = 사람이 직접 쓰면 수 주
- **부서 간 정합성 누락**: KPI 값·용어·연계 절차가 부서마다 어긋남
- **배포 채널 분산**: 본사 ERP / 교육 LMS / 카카오톡 단체방 수동 등록

---

## 2. 5-에이전트 구성 (F&B 직책 매핑)

각 에이전트의 전체 정의·금지사항·출력 포맷은 해당 `.md` 파일에 있다. 호출 전 반드시 그 파일을 읽는다.

| 에이전트 ID | 한글명 | 역할 | 정의 파일 | 호출 시점 |
|---|---|---|---|---|
| `benchmark-analyst` | 벤치마크 분석가 | `reference/` 톤·구조 정량 추출 | `.claude/agents/benchmark-analyst.md` | 1회, 프로젝트 시작 |
| `hq-strategist` | 운영기획본부장 | `design_spec` + `feature_list` 작성 | `.claude/agents/hq-strategist.md` | 분석가 직후, **사람 승인 게이트** |
| `sop-writer` | 부서별 SOP 라이터 | 챕터 작성 (부서별 1~N 인스턴스 병렬) | `.claude/agents/sop-writer.md` | 본부장 승인 후 |
| `qsc-auditor` | QSC 검수관 | 4-카테고리 자동 검증 | `.claude/agents/qsc-auditor.md` | SOP 라이터 작성 직후 |
| `field-sv` | 현장 배포 슈퍼바이저 | PPTX/PDF + 배포 계획서 작성 | `.claude/agents/field-sv.md` | 모든 챕터 done 후 |

**왜 5개로 나누나**: 작성자와 검증자를 분리해야 객관 검증이 가능하고(작성자는 자기 글의 결함을 못 본다), 부서별 라이터를 병렬로 돌려야 N주 작업이 N시간으로 압축된다. 분석·기획을 앞단에 두는 이유는 톤·구조 기준을 먼저 못 박아야 병렬 산출물이 한 방향으로 모이기 때문이다.

---

## 3. 데이터 흐름 (입력 → 에이전트 → 산출물)

```
사용자: "프랜차이즈 매뉴얼 시작"
        │
        ▼
[benchmark-analyst]  입력: reference/_text/*.txt
        │            출력: shared/benchmark_report.md
        ▼
[hq-strategist]      입력: benchmark_report.md, schema/feature_list.schema.json
        │            출력: shared/design_spec.md, shared/feature_list.json
        │  ◀── 사람 검토 게이트 (OK 사인 필수) ──
        ▼
[sop-writer ×N 병렬] 입력: design_spec.md, 같은 부서 기존 chapters/*, reference/_text/,
        │                  shared/glossary.md(용어 통일), shared/cross_reference_matrix.md(연계 절차)
        │            출력: chapters/{부서}/Ch*.md  + feature_list.json 상태 갱신
        ▼
[qsc-auditor]        입력: eval_pending 챕터들, design_spec.md
        │            출력: shared/eval_report.json + feature_list.json 상태 갱신
        │  fail → 해당 sop-writer 재호출(rework)   pass → 다음 라운드
        ▼
[field-sv]           입력: 전 챕터(done), shared/kpi_audit.md(핵심 KPI 추출), output/README.md
                     출력: shared/distribution_plan.md, output/notices/, output/conversion_log.md
```

**상태는 전부 `shared/feature_list.json` + git에 보관된다.** 세션이 끊겨도 이 파일만 다시 읽으면 그대로 이어서 작업한다.

---

## 4. 번들 리소스 지도 (어떤 파일이 무엇에 쓰이나)

표는 두 묶음이다. **A. 사전 번들**은 레포에 이미 존재하며 실행 전부터 읽을 수 있다(없으면 레포 손상). **B. 런타임 산출**은 해당 에이전트가 실행되며 처음 생성한다(실행 전에는 부재가 정상 — 부재 ≠ 끊긴 포인터). 에이전트는 자기 입력 파일을 호출 직전 반드시 읽는다(§2 규칙).

### A. 사전 번들 (실행 전부터 존재)

| 경로 | 종류 | 누가 사용 | 용도 |
|---|---|---|---|
| `schema/feature_list.schema.json` | 입력(계약) | hq-strategist | `feature_list.json` 구조 검증용 JSON Schema. 생성·수정 시 이 스키마를 따른다 |
| `scripts/validate_feature_list.py` | 검증 도구 | hq-strategist, sop-writer, qsc-auditor, field-sv | `feature_list.json`의 스키마 + 합계 정합을 한 줄로 검사하는 게이트(§2.5·§6·§9). FAIL 시 종료 코드 1 |
| `reference/_text/*.txt` | 입력(학습) | benchmark-analyst, sop-writer(첫 챕터) | 톤·구조 학습용 평문 매뉴얼 17개(원본 .docx의 텍스트 추출본). 본인 도메인 자료로 교체 권장 |
| `reference/README.md` | 가이드 | 사용자 | reference/ 폴더 사용법 |
| `shared/design_spec.md` | 검증 기준 | hq-strategist 갱신 → sop-writer, qsc-auditor | 7요소 구조 + 4-카테고리 게이트 기준. 모든 작성·검증의 단일 기준 |
| `shared/feature_list.json` | 상태 마스터 | 전원 | 작업·상태 추적. git과 함께 진실의 원천 |
| `shared/progress.md` | 현황 | sop-writer, qsc-auditor | 사람이 한눈에 보는 진행 현황. 자동 갱신 |
| `shared/eval_report.json` | 검증 이력 | qsc-auditor → sop-writer | 라운드별 pass/fail + fail_reasons |
| `shared/glossary.md` | 정합성 | sop-writer | 표준 용어집. 신규 챕터는 이 표를 우선 참조해 용어 통일 |
| `shared/cross_reference_matrix.md` | 정합성 | sop-writer, qsc-auditor | 부서 간 연계 절차. 다른 부서를 호출하는 챕터는 여기에 정합 |
| `shared/kpi_audit.md` | 정합성 | sop-writer, field-sv | KPI 값 일관성(예: 원가율 33%). 부서마다 값 어긋나지 않게 |
| `output/README.md` | 가이드 | field-sv | PPTX 변환 절차(외부 v4 빌더 필요) |
| `docs/USAGE_GUIDE.md` | 가이드 | 사용자(처음) | 단계별 안내·치트시트·FAQ |
| `README.md` | 가이드 | 사용자 | 시스템 개요·트러블슈팅 |
| `phase3_design.md` | 확장 설계 | (선택) | 5팀 + MCP 라이프사이클 자동화 |

### B. 런타임 산출 (해당 STEP에서 처음 생성 — 실행 전 부재가 정상)

| 경로 | 생성 주체(STEP) | 소비자 | 용도 |
|---|---|---|---|
| `shared/benchmark_report.md` | benchmark-analyst (STEP 1) | hq-strategist | 정량 패턴 보고서 |
| `chapters/{부서}/Ch*.md` | sop-writer (STEP 3) | qsc-auditor, field-sv | 매뉴얼 챕터 본문 |
| `shared/distribution_plan.md` | field-sv (STEP 6) | 사용자 | 채널별 배포 계획서 |
| `output/notices/` | field-sv (STEP 6) | 사용자 | 가맹점 공지문 초안 |
| `output/conversion_log.md` | field-sv (STEP 7) | 사용자 | PPTX/PDF 변환 이력 + 검증 결과 |
| `output/{부서}/Ch*.pptx` | field-sv (STEP 7, 외부 빌더) | 사용자 | 배포용 슬라이드 |

> `shared/design_spec.md`·`feature_list.json`·`progress.md`·`eval_report.json`은 레포에 시드(예시) 버전이 있어 A에 둔다. 실제 실행에서는 hq-strategist/sop-writer/qsc-auditor가 이를 덮어쓴다.

진행 상세·치트시트·FAQ는 `docs/USAGE_GUIDE.md`와 `README.md`에 있다. SKILL.md는 실행에 필요한 최소만 담는다(점진적 공개).

### 4.1 상태 파일 포맷 (progress.md · eval_report.json)

두 파일은 에이전트가 자동 갱신한다. 최소 필수 형식은 다음과 같다(추가 필드는 허용).

**`shared/progress.md`** (sop-writer·qsc-auditor가 작업 후 갱신 — 사람이 한눈에 보는 현황):
```markdown
# 매뉴얼 작성 진행 현황

## 전체 진행률
N/총 (NN%)   ← stats.done / stats.total

## 부서별 현황
| 부서 | done/총 | 마지막 라운드 | 챕터 |
|---|---|---|---|

## 최종 작업
- 시각: YYYY-MM-DD HH:MM
- 작업: [어느 에이전트가 어느 task를]
- 결과: [pass/fail/완주]

## 검증 라운드 이력
| 라운드 | 시각 | 검증 대상 | pass | fail | 비고 |
|---|---|---|---|---|---|
```
규칙: 진행률 수치는 항상 `feature_list.json`의 `stats`에서 가져와 일치시킨다(progress.md가 진실의 원천이 아니다 — feature_list가 마스터).

**`shared/eval_report.json`** (qsc-auditor가 라운드마다 누적 기록):
```json
{
  "evaluated_at": "ISO8601",
  "round": 1,
  "results": [
    {
      "task_id": "T0NN",
      "file": "chapters/부서/Ch..md",
      "status": "pass" | "fail",
      "checks": { "structure": "pass|fail", "tone": "pass|fail",
                  "practicality": "pass|fail", "design_compat": "pass|fail" },
      "metrics": { "step_count": 0, "warning_count": 0, "checklist_rows": 0,
                   "forbidden_word_hits": 0, "numeric_thresholds": 0 },
      "fail_reasons": ["L23: 제2조 5호(보고방식) 누락"]
    }
  ],
  "summary": { "total": 0, "pass": 0, "fail": 0 }
}
```
규칙: `fail_reasons`는 반드시 줄 번호 + 구체 표현을 인용한다(모호 금지). `status:"fail"`인 task는 feature_list에서 `rework`로, `pass`는 `done`으로 동기화한다(§6 STEP 4·5).

---

## 5. 검증 기준 (qsc-auditor가 자동 체크 — 단일 기준은 design_spec.md)

아래는 요약이다. **임계값의 단일 진실의 원천은 항상 `shared/design_spec.md` §6(평가 게이트)다.** 아래 요약과 design_spec이 다르면 design_spec을 따른다. design_spec을 고치면 다음 검증 라운드부터 자동 반영된다.

> **임계값 표기 규칙(혼선 방지)**: 본 §5와 design_spec §6은 모두 **fail 조건(언제 떨어지는가)** 으로 통일해 적는다. "통과 조건"으로 뒤집어 쓰지 않는다. 예) "누락 ≤2면 pass"(X) → "누락 ≥3이면 fail"(O).

**A. 구조 (7요소 필수, 1개라도 누락 시 fail)**
1. 헤더 4행 (상위 매뉴얼명·챕터 제목·부제·메타)
2. `[매뉴얼 목적]` + 제1·2·3조
3. `[업무 순서도]` + STEP 흐름 표 + 요약 박스
4. `[업무 상세작성]` + STEP 5~7, 각 STEP에 ①② 하위 + ※ 주의
5. `[부록]` (선택)
6. `[체크리스트]` 4컬럼 + 점검 10개 이상
7. L1은 평문 (h1 `#`은 L3 챕터 제목 1개만)

**B. 톤** — 금지 표현(`잘`·`원활히`·`적절히`·`꼼꼼히`·`대체로`·`일반적으로`·`필요에 따라`·`가급적`·`최대한`·`신속하게`)이 본문 누적 **3건 이상이면 fail**(목적문 1단락 내 1회 허용). ※ 주의 라인 **6건 미만이면 fail**.

**C. 실전성** — 한 STEP에서 4요소(담당자/시점·트리거/도구/체크포인트) 중 **3개 이상 누락된 STEP이 1개라도 있으면 fail**. 수치·임계값 **3건 미만이면 fail**. 결재 라인 미명시면 fail. (design_spec §4.1·§6 C와 동일 기준.)

**D. 디자인 호환성** — 표 문법·헤딩 레벨 오류, 깨진 문자 발견 시 fail. v4 빌더 변환 가능해야 한다.

---

## 6. 실행 절차 (Claude Code에서)

### 사전 준비
1. 작업 디렉터리를 이 레포 루트(`franchise-manual/`)로 둔다.
2. `reference/_text/`에 본인 도메인 평문 매뉴얼을 배치한다(또는 제공된 17개 그대로 사용).
3. `git init && git add . && git commit -m "harness 시작"` — 체크포인트 확보(중간에 틀어지면 `git reset --hard`로 복구).

### 단계별 명령

**STEP 1 — 벤치마크 분석 (1회)**
```
벤치마크 분석가로 시작해. reference/_text 폴더 분석해서 shared/benchmark_report.md 작성.
```

**STEP 2 — 운영기획 (사람 검토 게이트)**
```
운영기획본부장으로 진행. benchmark_report 기반으로 shared/design_spec.md와
shared/feature_list.json(schema/feature_list.schema.json 준수) 작성. 부서·챕터 분해 검토 요청.
```

**STEP 2.5 — 스키마 검증 (자동 게이트, 사람 검토 직전)**
`feature_list.json`을 생성·수정한 hq-strategist가 **사람에게 검토를 요청하기 전에** 반드시 검증을 통과시킨다. 번들 스크립트 한 줄로 확인한다(스키마 + 합계 정합을 한 번에 검사):
```bash
python3 scripts/validate_feature_list.py
```
`SCHEMA: PASS` + `STATS: PASS`(종료 코드 0)가 나와야 다음 단계로 간다. FAIL이면 스크립트가 종료 코드 1로 끝나므로 게이트로 그대로 묶을 수 있다:
```bash
python3 scripts/validate_feature_list.py && echo "검토 요청 OK" || echo "먼저 고칠 것 — 사람 검토 요청 금지"
```
(`jsonschema` 미설치 시 스크립트가 안내한다: `python3 -m pip install jsonschema`. 스키마 위반 또는 합계 불일치면 **사람 검토 요청 금지** — 먼저 고친다. 이후 sop-writer·qsc-auditor가 feature_list를 쓸 때마다, 그리고 STEP 6 진입 직전에도 이 스크립트를 통과해야 한다. 임계값·필드를 바꿔도 스크립트 한 곳만 고치면 전 호출 지점에 반영된다.)

→ 스키마 통과 후, 본부장이 만든 design_spec·feature_list를 **직접 검토**한다. 부서 구성·챕터 목록·검증 기준이 맞으면:
```
운영기획 결과 OK. SOP 라이터 단계로 진행해.
```

**STEP 3 — SOP 라이터 병렬 작성**
```
SOP 라이터 전원 가동. 각자 자기 부서의 첫 pending 챕터 작성.
design_spec·glossary·cross_reference_matrix·kpi_audit 정합 유지. 완료 시 status: eval_pending.
```

**STEP 4 — QSC 검증**
```
QSC 검수관 호출. eval_pending 전부 design_spec 기준으로 검증. 결과를 shared/eval_report.json에 기록.
```

**STEP 5 — 재작업 라운드 (fail 발생 시 반복)**

fail이 난 task는 `eval_report.json`에서 `assigned_to`로 담당 라이터를 식별해, **그 라이터만** 콕 집어 재호출한다(부서 전원 재가동 아님). 명령 패턴:
```
{assigned_to} 재호출 — rework 처리.
대상 task: {task_id} ({부서}/{Ch제목}).
shared/eval_report.json에서 본인 항목의 fail_reasons를 읽고 해당 사유만 해소한 뒤
status를 rework → eval_pending으로 바꾸고 progress.md 갱신.
다른 부서·다른 task는 건드리지 말 것.
```
구체 예 (T034가 design_compat fail일 때):
```
sop-writer-6 재호출 — rework 처리.
대상 task: T034 (인사교육/Ch01 채용).
eval_report.json의 T034 fail_reasons(예: "L1 h1 중복") 해소 후 status를 eval_pending으로.
```
→ 라이터가 `eval_pending`으로 되돌리면 STEP 4(qsc-auditor)로 다시 검증한다. 모든 챕터가 `done`이 될 때까지 STEP 4↔5 반복.

**STEP 6 — 배포 준비**
```
현장 배포 슈퍼바이저 호출. 전 챕터 done 확인 후 배포 계획서 + 가맹점 공지문 초안 작성.
```

**STEP 7 — PPTX 변환 (선택)** — 외부 v4 빌더 보유 시. 절차: `output/README.md`.

---

## 7. 산출물

| 위치 | 내용 |
|---|---|
| `chapters/{부서}/Ch*.md` | 부서별 매뉴얼 챕터 |
| `shared/benchmark_report.md` | 벤치마크 분석 결과 |
| `shared/design_spec.md` | 검증 기준(단일 기준) |
| `shared/feature_list.json` | 작업·상태 마스터 |
| `shared/progress.md` | 진행 현황 |
| `shared/eval_report.json` | 검증 이력 |
| `shared/glossary.md` | 표준 용어집 |
| `shared/cross_reference_matrix.md` | 부서 간 연계 매트릭스 |
| `shared/kpi_audit.md` | KPI 정합성 감사 |
| `shared/distribution_plan.md` | 배포 계획서 |
| `output/notices/` | 가맹점 공지문 초안 |
| `output/conversion_log.md` | PPTX/PDF 변환 이력 + 검증 결과 |
| `output/{부서}/Ch*.pptx` | PPTX (외부 빌더 필요) |

---

## 8. 엣지 케이스 · 중단 조건

| 상황 | 대응 |
|---|---|
| 분석가·본부장 없이 바로 SOP 라이터 호출 | **중단**. 후속 에이전트가 입력 파일을 못 찾는다. STEP 1·2 먼저 |
| 본부장 결과를 사람 검토 없이 진행 | **중단**. STEP 2 OK 사인 필수(승인 게이트) |
| 병렬 라이터가 같은 파일 수정 | 각 라이터는 자기 부서 폴더만. feature_list에서 자기 할당 외 task 변경 금지 |
| `feature_list.json` 상태와 실제 `chapters/` 파일 불일치 (status는 done인데 .md 부재 등) | field-sv 사전 검증에서 **중단** + 사용자 보고. 해당 task를 pending으로 되돌려 재생성 |
| KPI 값이 부서마다 어긋남(예: 원가율 33% vs 35%) | `kpi_audit.md`로 일관성 감사 → 어긋난 챕터를 rework |
| 용어가 부서마다 다름 | `glossary.md`를 단일 기준으로 통일 |
| QSC가 너무 깐깐/너그러움 | `design_spec.md` 임계값 조정. 이미 done은 영향 없음(재검증하려면 status를 eval_pending으로) |
| 컨텍스트 폭주 | `/clear` 후 `progress.md` + `feature_list.json`만 다시 읽혀 재시작 |
| 노트북 종료로 진행 상실 | feature_list.json + git이 전 상태 보유. 그대로 재개 |
| 모든 라운드가 done인데 fail이 남음 | design_spec 기준 충돌 가능성. 기준 정합 후 재검증 |

**진행 중단 기준**: feature_list.json이 스키마 위반으로 파싱 불가, 또는 design_spec이 비어 있으면 더 진행하지 말고 사용자에게 보고한다.

---

## 9. 자기 점검 (사이클 1회 완주 체크리스트)

작업을 마치기 전 다음을 확인한다.
- [ ] `shared/benchmark_report.md` 생성됨
- [ ] `shared/design_spec.md`가 사람 검토 후 OK 받음
- [ ] `python3 scripts/validate_feature_list.py`가 `SCHEMA: PASS` + `STATS: PASS`(종료 코드 0)로 통과. 이 한 줄이 스키마 + 합계 정합(`stats.total == len(tasks) == done+in_progress+eval_pending+rework+pending+failed`)을 동시에 보증한다
- [ ] 모든 task `status: done`이며, 각 `output_file`이 실제로 `chapters/`에 존재. **하나라도 부재면 §8의 "status는 done인데 .md 부재" 가드레일로 — 사용자 보고 후 해당 task를 pending으로 되돌려 재생성**(임의 생성·체크 통과 처리 금지)
- [ ] `eval_report.json`에 라운드별 결과 누적
- [ ] `glossary.md`·`kpi_audit.md`·`cross_reference_matrix.md` 정합 확인(용어·KPI 충돌 0)
- [ ] `distribution_plan.md` + `output/notices/` + `output/conversion_log.md` 생성됨

전부 체크되면 매뉴얼 작성 사이클 1회 완주다. 하나라도 실패하면 완주로 보고하지 말고 해당 항목의 STEP으로 되돌아간다.

---

## 10. 커스터마이징

- **부서 추가/삭제**: `hq-strategist`에 요청 — "운영기획본부장에게: '신사업본부' 추가, 5개 챕터". feature_list.json·design_spec에 반영.
- **디자인 스펙 변경**: `shared/design_spec.md` 직접 수정 → 다음 검증 라운드부터 자동 반영(이미 done은 영향 없음).
- **에이전트 모델 변경**: 각 에이전트 `.md` frontmatter `model:` 수정 — `opus`(품질, 분석가·본부장 기본) / `sonnet`(균형, 라이터·검수관·SV 기본) / `haiku`(속도).
- **타 도메인 적용**: 에이전트명은 F&B 직책 차용이나 동작은 도메인 무관. `reference/_text/`와 design_spec의 도메인 용어(QSC·가맹점 등)만 교체.

---

## 11. 확장 · 책임 분리

- **Phase 3 확장(선택)**: `phase3_design.md` 참조. 5팀(Authoring/Distribution/Monitoring/Compliance/Feedback) + MCP(Slack·Jira·Notion·Gmail·Calendar·Drive) 통합으로 매뉴얼 라이프사이클 전체 자동화.
- 본 스킬은 Anthropic의 multi-agent harness 패턴을 F&B 도메인에 적용한 구현이다.
- `reference/_text/`는 일반화 톤 학습용 평문 — 본인 자료로 교체 권장.
- **가맹점 배포 전 사람의 법무·인사·세무 검토 필수**(특히 노무·세무·계약 챕터). field-sv는 외부 시스템(ERP/LMS/카카오톡)에 자동 업로드하지 않는다.
