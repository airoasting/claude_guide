# F&B 프랜차이즈 매뉴얼 자동 작성 하네스 — 안내설명서

> 처음 사용하는 분을 위한 단계별 가이드. 본 안내서는 매뉴얼 작성 경험이 없는 사용자도 따라할 수 있도록 작성되었습니다.

---

## 1. 누가 이 스킬을 써야 하나요?

다음 중 **하나라도 해당**되면 이 스킬을 쓰면 좋습니다.

- F&B 프랜차이즈 본사의 운영기획·인사·재무·마케팅 담당자
- 부서별로 흩어진 SOP를 한 번에 정리해야 하는 상황
- 신규 가맹점 오픈을 앞두고 표준 매뉴얼이 부족
- 정기 매뉴얼 개정(분기·반기) 시기인데 손이 많이 가는 경우
- 본사·가맹점 양쪽에서 동일한 표준이 필요
- QSC 점검 결과를 매뉴얼에 환류하고 싶은 경우

## 2. 이 스킬로 무엇이 가능한가요?

### 1) 자동 분석
`reference/` 폴더에 기존 매뉴얼을 넣으면, **벤치마크 분석가** 에이전트가 톤·구조·KPI 패턴을 정량 추출합니다.

### 2) 자동 분해
**운영기획본부장** 에이전트가 7부서 × 평균 6.3챕터 = 약 44개 작업으로 분해합니다.

### 3) 자동 작성
**부서별 SOP 라이터** 에이전트 7명이 동시에 챕터를 작성합니다. (한 부서가 다른 부서 작업을 방해하지 않음)

### 4) 자동 검증
**QSC 검수관** 에이전트가 design_spec 기준 4-카테고리로 자동 채점합니다.
- 구조 / 톤 / 실전성 / 디자인 호환성

### 5) 자동 배포 준비
**현장 배포 슈퍼바이저** 에이전트가 PPTX 변환 절차 + 가맹점 공지문 + 채널별 배포 계획서를 작성합니다.

## 3. 사전 준비 (10분)

### 3-1. Claude Code 설치

이미 설치되어 있으면 생략. 없으면:
- macOS/Linux: `curl -fsSL https://claude.ai/install.sh | bash`
- Windows PowerShell: `irm https://claude.ai/install.ps1 | iex`

확인:
```bash
claude --version
```

### 3-2. 본 레포 복제

```bash
git clone https://github.com/lfsgkim-droid/manual-harness.git
cd manual-harness
```

### 3-3. 본인 도메인 자료 배치 (선택)

기본 제공 `reference/_text/` 17개 평문 파일을 그대로 써도 되고, 본인 회사 매뉴얼로 교체해도 됩니다.

**교체 방법**:
```bash
# 기존 일반화 자료 백업 또는 삭제
rm reference/_text/*.txt

# 본인 매뉴얼(.txt 평문)을 복사
cp /path/to/내회사_매뉴얼*.txt reference/_text/
```

> **권장 형식**: docx → txt 변환본 또는 직접 작성한 평문. 표·번호·헤딩 그대로 유지된 형태.

### 3-4. Git 체크포인트 (강력 권장)

```bash
git init
git add .
git commit -m "내 회사 매뉴얼 하네스 시작"
```

이렇게 하면 중간에 잘못돼도 `git reset --hard` 한 줄로 복구 가능.

## 4. 단계별 실행 (반나절~3일 코스)

### STEP 1. 벤치마크 분석 (30분)

```bash
claude
```

```
> 벤치마크 분석가로 시작해. reference/_text 폴더 분석해서 톤·구조 패턴 추출.
```

**예상 결과**: `shared/benchmark_report.md` 생성. 6개 카테고리(구조/헤더/톤/수치/체크리스트/디자인) 정량 패턴.

**확인 포인트**: 보고서가 본인 도메인 패턴을 잘 포착했는지 1회 검토.

### STEP 2. 운영기획 (30분)

```
> 운영기획본부장으로 진행. benchmark_report 기반으로 design_spec.md와
> feature_list.json 작성. 부서·챕터 분해 검토 요청.
```

**예상 결과**:
- `shared/design_spec.md` — 검증 기준 (7요소 구조 + 4-카테고리 평가 게이트)
- `shared/feature_list.json` — 7부서 ~44개 task 마스터

**중요 ⚠️ 사용자 검토 게이트**: 본부장이 작성한 design_spec과 feature_list를 직접 검토. 부서 구성·챕터 목록·검증 기준이 본인 회사에 맞는지 확인.

승인:
```
> 운영기획 결과 OK. SOP 라이터 단계로 진행해.
```

### STEP 3. SOP 라이터 7병렬 작성 (2~3시간)

```
> sop-writer-1부터 sop-writer-7까지 모두 가동.
> 각자 자기 부서 첫 챕터(pending 중 의존성 없는 항목) 작성 시작.
> 작성 완료되면 status: eval_pending으로.
```

**확인 포인트**:
- `chapters/` 각 부서 폴더에 .md 파일이 7개 생성되었는가?
- `shared/progress.md`의 "마지막 작업"이 갱신되었는가?
- `shared/feature_list.json`의 stats에 eval_pending 7개가 표시되는가?

### STEP 4. QSC 검수관 검증 (1시간)

```
> QSC 검수관 호출. 현재 eval_pending 상태인 7개 모두 검증.
```

**확인 포인트**: `shared/eval_report.json`에 7개 결과가 기록되었는가?
- pass: feature_list.json에서 done으로 변경
- fail: rework로 변경 + fail_reasons 명시

### STEP 5. 재작업 라운드 (필요 시, 30분~1시간)

```
> rework 상태인 항목들 다시 sop-writer에 보내서 재작업.
> 재작업 후 다시 QSC 검수관 호출.
```

이 사이클을 모든 항목이 done이 될 때까지 반복.
**Phase 2 PoC 결과** (참고): 8 라운드 만에 44개 챕터 100% 완주, 첫 시도 통과율 97.7%.

### STEP 6. 현장 배포 준비 (30분)

```
> 현장 배포 슈퍼바이저 호출. 모든 챕터 done 확인 후
> 배포 계획서 + 부서별 공지문 초안 작성.
```

**예상 결과**:
- `shared/distribution_plan.md` — 채널별 배포 일정·담당
- `output/notices/` — 가맹점주 단체방 공지문 N개
- `output/conversion_log.md` — PPTX 변환 이력 (빌더 보유 시)

### STEP 7. PPTX 변환 (사용자가 빌더 보유한 경우, 30분)

매뉴얼 v4 빌더(`인생푸드_매뉴얼_자동생성기_v4.html` 등 본인 보유 HTML)로 .md → .pptx 일괄 변환.
절차는 `output/README.md` 참조.

## 5. 핵심 명령어 치트시트

| 명령 | 용도 |
|---|---|
| `cat shared/progress.md` | 현재 진행 상황 빠르게 확인 |
| `cat shared/feature_list.json \| jq .stats` | 통계만 보기 |
| `git diff shared/feature_list.json` | 마지막 커밋 이후 변경 확인 |
| `git log --oneline` | 작업 이력 확인 |
| `/agents` (Claude Code 내부) | 에이전트 목록 |
| `/clear` | 컨텍스트 정리 (긴 세션 후) |

## 6. 흔한 함정 + 대응

| 함정 | 대응 |
|---|---|
| 분석가·본부장 없이 바로 SOP 라이터 가동 → 톤 불일치 폭증 | 반드시 1·2단계 사람 검토 |
| 병렬 SOP 라이터가 같은 파일 수정 → 충돌 | 각 라이터는 자기 부서 폴더만 |
| 컨텍스트 폭주 (한 세션 너무 김) | `/clear` 후 progress.md만 다시 읽혀서 재시작 |
| QSC 검수관이 통과 기준 완화 → 품질 저하 | design_spec.md 수정으로 기준 강화 |
| 작업 중 노트북 종료 → 진행 상실 | feature_list.json + git이 모든 상태 보유, 그대로 재시작 가능 |

## 7. 커스터마이징 가이드

### 부서 추가/삭제
`shared/feature_list.json`의 `tasks` 배열 직접 수정 또는 본부장에 요청:
```
> 운영기획본부장에게: "조리 부서에 'Ch09 알러지대응' 추가해줘"
```

### 디자인 스펙 변경
`shared/design_spec.md` 수정 → 다음 QSC 라운드부터 자동 반영.

### 톤 금지어 추가
`shared/design_spec.md` §3.1 표에 금지 표현 행 추가.

### 에이전트 모델 변경
각 에이전트 `.md` 파일의 `model:` 항목 수정.
- `opus` → 품질 우선 (느림, 비용 ↑)
- `sonnet` → 균형 (현재 SOP 라이터·QSC 검수관·현장 SV 기본)
- `haiku` → 속도/비용 우선 (대량 단순 작업)

## 8. 트러블슈팅

**Q. `feature_list.json`이 손상됐어요**
A. `git checkout shared/feature_list.json`으로 마지막 커밋 시점으로 복원.

**Q. SOP 라이터가 이상한 챕터를 만들어요**
A. `design_spec.md`가 모호할 가능성. 금지 표현 목록과 실전성 기준을 더 구체화하세요.

**Q. QSC 검수관이 너무 깐깐/너그러워요**
A. `design_spec.md`의 임계값 조정. 예: "추상 표현 3건 이상 fail" → "5건 이상 fail" 또는 "1건 이상 fail".

**Q. 한 부서만 다시 작업하고 싶어요**
A. `feature_list.json`에서 해당 부서 task들의 status를 모두 pending으로 변경 후 sop-writer 재호출.

**Q. 벤치마크 분석가가 만든 보고서가 부정확해요**
A. `reference/_text/` 폴더의 자료가 부족하거나 형식이 일관되지 않을 가능성. 평문 매뉴얼 5개 이상 + 동일 형식 권장.

**Q. 5명 에이전트가 다 있는데 진행이 안 돼요**
A. 호출 순서 확인:
1. benchmark-analyst (1회) → 2. hq-strategist (사용자 OK 대기) → 3. sop-writer (병렬) → 4. qsc-auditor → 5. field-sv
중간 단계 건너뛰면 후속 에이전트가 입력 파일을 찾지 못함.

## 9. 성공 기준 (체크리스트)

- [ ] `shared/benchmark_report.md` 생성됨
- [ ] `shared/design_spec.md`가 사용자 검토 후 OK 받음
- [ ] `chapters/` 각 부서 폴더에 챕터 파일 생성됨
- [ ] `shared/eval_report.json`에 검증 결과 누적됨
- [ ] 모든 챕터 `status: done` 처리됨
- [ ] `shared/distribution_plan.md` 작성됨
- [ ] `output/notices/` 공지문 초안 생성됨

7개 모두 체크되면 **매뉴얼 작성 사이클 1회 완주**입니다.

## 10. 다음 단계

- **PPTX 변환**: 매뉴얼 v4 빌더(HTML) 사용 (별도 보유)
- **Phase 3 확장**: `phase3_design.md` 참조 — Distribution / Monitoring / Compliance / Feedback 4팀 추가
- **품질 강화**: `shared/glossary.md` + `shared/cross_reference_matrix.md` + `shared/kpi_audit.md`로 부서 간 정합성 감사

---

## 부록 A. 5-에이전트 직책 매핑 한눈에

| 영문 ID | 한글 직책 | 실제 F&B 직책 비유 |
|---|---|---|
| `benchmark-analyst` | 벤치마크 분석가 | 외부 컨설팅 분석가, 사례연구 매니저 |
| `hq-strategist` | 운영기획본부장 | 본사 운영기획부장, 매뉴얼 편집 책임자 |
| `sop-writer` | SOP 라이터 | 부서별 매뉴얼 작성 실무자 |
| `qsc-auditor` | QSC 검수관 | 본사 QSC 점검 담당, 표준 감사관 |
| `field-sv` | 현장 배포 슈퍼바이저 | 영업팀 SV(Supervisor), 가맹점 운영지원 |

## 부록 B. 워크플로 비교

| 단계 | 사람 직접 작성 | 5-에이전트 하네스 |
|---|---|---|
| 사전 분석 | 1주 (수동 읽기) | 30분 (벤치마크 분석가) |
| 작업 분해 | 1주 (회의·문서) | 30분 (운영기획본부장) |
| 챕터 작성 | 부서별 1주 = 7주 | 2~3시간 (SOP 라이터 7병렬) |
| 검증 | 작성자 셀프 + 임원 회람 1주 | 1시간 (QSC 검수관 자동) |
| 재작업 | 추가 1~2주 | 30분~1시간 (rework 라운드) |
| 배포 준비 | 1주 (담당자 수동) | 30분 (현장 배포 SV) |
| **총** | **약 12주** | **반나절~3일** |

## 부록 C. 자주 묻는 질문 (FAQ)

**Q1. 우리 회사는 F&B가 아닌데 쓸 수 있나요?**
A. 가능합니다. 에이전트 명칭은 F&B 직책을 차용했지만, 실제 동작은 도메인 무관입니다. 다만 `design_spec.md`의 일부 용어(QSC, 가맹점 등)는 본인 도메인에 맞게 수정 권장.

**Q2. 가맹점 직접 배포 자동화도 되나요?**
A. Phase 3에서 가능합니다. Phase 2(현재)는 "배포 계획서·공지문 초안" 단계까지. 실제 발주고/LMS/카카오톡 등록은 사람이 진행.

**Q3. 에이전트가 잘못된 정보를 넣으면 어떻게 하나요?**
A. QSC 검수관이 1차 필터. 그래도 누락된 경우 사용자가 직접 챕터를 편집하고 `git commit`. 다음 검증 라운드에서 자동 재평가.

**Q4. 비용은 얼마나 드나요?**
A. 모델 사용량에 따라 다름. opus 2개(분석가·본부장) + sonnet 3개(라이터·검수관·SV) 평균 사용. PoC(44챕터 8라운드) 기준 약 $30~$50 추정.

**Q5. 한국어 외 다른 언어도 가능한가요?**
A. 에이전트는 다국어 가능. 다만 design_spec.md의 톤 규칙(금지 표현 목록)은 언어별로 별도 수립 필요.

---

*본 안내서는 manual-harness v1 PoC 기준. 이슈 발견 시 GitHub 이슈로 보고 부탁드립니다.*
