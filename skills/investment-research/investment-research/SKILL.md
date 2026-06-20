---
name: investment-research
description: >
  Data-driven investment research, analysis, and due diligence on a specific company
  (ticker or name) or an industry/market. Use whenever the user names a stock, company,
  sector, or market in an investment context — including casual phrasing like "look into X",
  "what do you think of Y", "X 분석해줘", "X 조사해줘", "X 투자 어때?", "전력기기 시장 분석해줘",
  or pasting a ticker/company name on its own when the conversation is about investing.
  Handles both named-company queries (full diligence) and industry-only queries (market view,
  no company-specific financials). Do NOT use for: executing trades or moving money, portfolio
  allocation/tax advice, personal "should I buy?" financial advice (give research, not a
  buy/sell recommendation), reading an already-finished report, or non-investment company
  questions (e.g. "X 고객센터 번호"). Output is text only — no files created.
  NOT the 'dart' skill: if the user asks for a DART/실적 HTML report, dashboard, file, or
  uses "/dart" / "리포트 만들어줘" / "대시보드" (i.e. wants a generated HTML artifact from
  DART API data), route to 'dart' instead — that skill writes an HTML file with 13-persona
  scoring. This skill answers in chat with a research write-up and creates no file.
---

# Investment Research Skill

투자 검토 대상(회사 또는 산업)에 대해 데이터 기반의 간결한 리서치를 제공한다. 사용자는 보통 이미 투자 중이거나 검토 중인 종목/시장을 묻는다. 목표는 매수/매도 추천이 아니라, 스스로 판단할 수 있게 **사실과 수치를 정리해 주는 것**이다. 어려운 제품/사업 내용은 비전문가도 이해할 언어로 푼다.

## When to use / not use

- **Use**: "테슬라 분석해줘", "ENPH 어때?", "원자력 발전 밸류체인 조사해줘", "이 회사 유상증자 위험 있어?", 티커/회사명 단독 입력(투자 맥락).
- **Skip**: 매매 실행·송금, 포트폴리오 배분/세무 자문, "내가 사야 해?"식 개인 투자권유(추천 대신 리서치 제공), 이미 완성된 리포트 요약, 투자와 무관한 회사 문의.

### `dart` 스킬과 구분 (필수)

`dart`와 트리거가 겹친다("○○ 분석", "○○ 실적"). 산출물 형태로 가른다.

| 신호 | 발동 스킬 |
|---|---|
| "DART 리포트", "실적 리포트/HTML/대시보드 만들어줘", "/dart", 파일·시각화 산출물 요구 | **dart** (HTML 파일 + DART API + 13인 페르소나, `output/`에 저장) |
| 채팅 답변으로 사실·수치 정리, 글로벌/미국 종목, 산업·시장 리서치, 파일 불필요 | **investment-research** (텍스트 전용, 파일 없음) |

- 애매하면(예: "삼성전자 분석해줘") 한 문장으로 확인: "채팅으로 정리해 드릴까요, 아니면 DART HTML 리포트로 만들까요?"
- 한국 상장사 + "리포트/대시보드/파일" → `dart`. 한국 상장사라도 "채팅으로 정리"면 이 스킬.

## Workflow

순서대로 실행한다. WHY를 알아야 생략 판단이 가능하므로 각 단계에 이유를 붙였다.

1. **대상·범위 판정.** 입력에서 (a) 특정 회사/티커가 있는지, (b) 산업/시장만 있는지 구분한다. 둘 다 모호하면 한 문장으로 되묻는다(예: "엔비디아 종목 분석인가요, AI 반도체 시장 분석인가요?"). 판정 결과가 이후 어떤 섹션을 쓸지 결정한다.
   - **회사 모드**: 전 섹션 실행(아래 출력 템플릿).
   - **산업 모드**: 회사 고유 섹션(핵심 경쟁력·경쟁사·실적·현금·유상증자·CEO) 생략, 개요/시장규모/성장드라이버/최근이슈/종합판단만 작성.
2. **데이터 수집.** 웹 검색을 적극 사용해 최신 1차 자료를 우선 확보한다(공시·IR·실적발표, 그다음 신뢰도 높은 매체·리서치). 시장 규모 수치는 **반드시 복수 출처로 교차 확인**한다 — 단일 출처 추정치는 편차가 크기 때문이다. 한국 상장사면 DART, 미국 상장사면 10-K/10-Q·earnings call을 우선한다.
3. **산업별 핵심 경쟁 요인 먼저 파악(회사 모드).** 섹션 3을 쓰기 전에 "이 산업에서 실제로 승부를 가르는 요인"을 먼저 정한 뒤 그 축으로 평가한다. 일반론(매출·점유율)만 나열하면 신호가 약하다.
   - 반도체 → 공정 기술·고객 집중도·CAPEX 효율
   - DNA 합성 → 단가·처리속도·오류율·특허
   - 방산 → 수주잔고·정부 계약·수출 규제
4. **수치 규율 적용.** 모든 증감은 **절대값 + 비율**을 함께 적는다. "크게 늘었다"는 금지. 데이터를 못 찾으면 추정하지 말고 `데이터 확인 불가`로 표기한다.
5. **출력 작성.** 아래 출력 템플릿/순서로 작성한다. 상세 섹션 사양·표 형식·별점 기준은 `references/report-template.md`를 참조한다(토큰 절약을 위해 본문에서 분리).
6. **자가 점검.** 출력 전 아래 Self-check를 통과시킨다. 통과 못 하면 고친 뒤 출력한다.

## Output template

텍스트로만 출력한다(파일 생성 금지). 회사 모드 기준 섹션 순서는 아래. *(회사)* 표시는 회사 모드 전용 — 산업 모드는 생략한다. 각 섹션의 표 형식·작성 규칙·예시는 `references/report-template.md`에 있으니 작성 시 반드시 참조한다.

1. 회사/산업 개요
2. TAM / 전방시장 규모·전망
3. 성장 드라이버 *(산업 모드도 포함)*
4. 핵심 경쟁력 *(회사)*
5. 경쟁사 비교 *(회사)*
6. 최근 8분기 실적 *(회사)*
7. 현금 보유·현금흐름 *(회사)*
8. 유상증자 가능성 *(회사)*
9. CEO 프로필 *(회사, 조건부 — 사용자가 CEO/거버넌스를 명시 요청했을 때만)*
10. 최근 주요 이슈
11. 종합 판단 요약 — 별점표(★5단계) + 모니터링 포인트 1~3개. **매수/매도 추천이 아니라 관점 정리로 끝낸다.**

## Writing principles

- 문장은 짧게. 수식어 최소화, 데이터로 말한다.
- 전문 용어는 첫 등장 시 괄호로 설명.
- 숫자 증감은 절대값 + 비율 병기.
- 표 적극 활용. 웹 검색으로 최신 데이터 우선.
- 모든 시장 규모/핵심 수치는 출처를 밝힌다.

## Edge cases

- **산업만 언급** → 산업 모드. 회사 고유 섹션 생략, 시장/드라이버/이슈 중심.
- **비상장·상장폐지(delisted)·자료 부족** → 확보 가능한 만큼만, 결측은 `데이터 확인 불가`로 명시. 추정으로 메우지 않는다. 데이터 출처 우선순위(위에서부터 시도):
  1. 마지막 정기공시 — 비상장도 외부감사 대상이면 한국은 DART 감사보고서, 미국은 상장폐지 직전 마지막 10-K/10-Q(SEC EDGAR에 잔존).
  2. 채권 발행사면 신용평가사 리포트·채권 투자설명서.
  3. 투자 라운드 공시·VC/PE 발표·언론 보도(단가·밸류에이션은 추정치임을 명시).
  4. 산업 평균·동종 상장사 비교치로 맥락 제공(해당 회사 수치가 아님을 분명히 표기).
  - 위 어디서도 못 구하면 해당 섹션을 `데이터 확인 불가`로 두고, 어떤 출처를 시도했는지 한 줄로 남긴다.
- **회사·산업 둘 다 모호** → 1단계에서 한 문장으로 확인.
- **출처 간 시장 규모 편차 큼** → 범위로 제시하고 편차를 명시("$8B~$14B, 출처별 정의 상이").
- **"사야 해?"식 권유 요청** → 리서치는 제공하되, 마지막에 매수/매도 단정 대신 모니터링 포인트로 마무리.

## Stop conditions

- 매매 실행·송금·계좌 행위 요청 → 거절하고, 사용자가 증권사 앱 등에서 직접 수행하도록 안내. 이 스킬은 행위를 대신하지 않는다.
- 핵심 수치를 신뢰 가능한 출처로 확인 못 함 → 단정 금지, 결측 표기.
- 투자와 무관한 일반 회사 문의(예: 고객센터 번호, 채용 문의) → 이 스킬을 발동하지 않는다. 투자 의도가 모호하면 한 문장으로 의도를 확인하고(예: "투자 검토 목적인가요?"), 투자와 무관함이 분명하면 다른 스킬로 라우팅하지 말고 일반 답변으로 간단히 처리하거나 정중히 답변 범위를 안내한다.

## Self-check (출력 전)

- [ ] 사용자가 HTML 리포트/대시보드/파일을 원한 게 아닌가(맞으면 `dart`로 라우팅)
- [ ] 회사/산업 모드를 맞게 골랐고 해당 섹션만 썼는가
- [ ] 모든 증감에 절대값 + 비율이 있는가("크게 늘었다" 없음)
- [ ] 시장 규모가 복수 출처로 교차 확인됐는가
- [ ] 추정한 수치를 사실처럼 적지 않았는가(결측은 표기)
- [ ] 종합 판단이 매수/매도 추천이 아니라 관점 정리인가
- [ ] 별도 파일을 만들지 않았는가

## Example invocations

- "엔페이즈(ENPH) 투자 검토 중인데 분석해줘" → 회사 모드, 전 섹션. CEO 명시 요청 없음 → 섹션 9(CEO) **생략**.
- "전력기기 시장 분석해줘" → 산업 모드, 개요·TAM·드라이버·이슈·종합판단만.
- "엔페이즈 분석해줘, **CEO도 봐줘**" / "이 회사 **경영진/거버넌스**는 어때?" / "**대표이사 이력**도 정리해줘" → 회사 모드 + 섹션 9(CEO) 포함. (CEO·대표이사·경영진·거버넌스를 직접 언급하면 "명시 요청"으로 본다. 단순 회사 분석 요청에는 포함하지 않는다.)
- "삼성전자 실적 HTML 리포트로 만들어줘" → 이 스킬 아님. `dart`로 라우팅(파일 산출물).

## Worked example (품질 기준)

완성된 출력이 어떤 모습·밀도여야 하는지 회사 모드 한 건을 끝까지 작성한 예시가 `references/worked-example.md`에 있다. 새 리포트의 형식·수치 규율(절대값+비율)·결측 표기·종합 판단 톤을 그 예시에 맞춘다.
