# newsletter-pipeline

링고브릿지 HRD 주간 뉴스레터를 리서치, 작성, 디자인, 검수 4개 에이전트로 자동 생성하는 멀티에이전트 파이프라인입니다.

## 이 스킬이 하는 일

오케스트레이터(`pipeline.py`)가 주제 뱅크에서 아직 발행하지 않은 다음 주제를 고르고, 4개 에이전트를 순서대로 실행해 발행 직전 상태의 뉴스레터 한 호를 만듭니다.

1. 리서처가 글로벌 HRD 트렌드, 이번 주 고민 배경, 비즈니스 영어 표현 자료를 웹 검색으로 수집합니다.
2. 라이터가 Leona Kim 대표 1인칭 톤으로 콘텐츠 초안을 작성합니다.
3. 디자이너가 콘텐츠를 브랜드 디자인 시스템이 적용된 HTML 이메일로 변환합니다.
4. 리뷰어가 9개 체크리스트로 검수하고, 사람이 발행 전 확인해야 할 항목을 정리합니다.

매주 월요일 오전 9시(KST)에 GitHub Actions가 같은 흐름을 자동으로 돌려 검수용 Pull Request를 만듭니다. 사람은 결과물을 검토하고 승인만 하면 됩니다.

## 언제 쓰나

다음 같은 요청에서 발동합니다.

- "뉴스레터 자동 생성", "주간 뉴스레터 파이프라인 돌려줘"
- "HRD 뉴스레터 만들어줘", "이번 주 뉴스레터 초안 뽑아줘"
- 정기 발행용 HRD 뉴스레터 한 호 전체를 생성해 달라는 요청

단발성 메일 한 통, 일반 블로그 글, 뉴스 요약만 필요한 경우에는 적합하지 않습니다.

## 입력과 출력

입력은 다음 세 가지입니다.

- `data/topic-bank.json` 고민 해결소 주제 24개
- `data/issue-tracker.json` 발행 이력(다음 호 번호와 미발행 주제 판단)
- 환경변수 `ANTHROPIC_API_KEY`

한 번 실행하면 `output/`에 두 파일이 생깁니다.

- `output/issue-{N}.html` 발행용 HTML 이메일
- `output/review-{N}.md` 검수 리포트(자동 체크 결과 + 사람 확인 항목)

## 산출물 예시

`sample.html`을 브라우저에서 열면 이 스킬을 실제로 돌렸을 때 나오는 발행 준비 상태의 뉴스레터와 그 아래 검수 리포트 블록을 함께 확인할 수 있습니다. 링고브릿지 HRD Brief Vol.02 예시로 채워져 있습니다.

## 사용법

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 환경 변수 설정

`.env` 파일을 만들거나 셸에 등록합니다.

```bash
export ANTHROPIC_API_KEY=your_api_key_here
```

### 3. 로컬 실행

```bash
# 파일 저장 없이 테스트
python pipeline.py --dry-run

# 실제 실행
python pipeline.py
```

실행이 끝나면 `output/issue-{N}.html`을 이메일 클라이언트에서 열어 디자인을 확인하고, `output/review-{N}.md`에서 확인 필요 항목을 점검합니다.

### 4. GitHub Actions 자동화

`.github/workflows/generate-newsletter.yml`이 매주 월요일 00:00 UTC(= 09:00 KST)에 자동 실행됩니다. 수동 실행도 가능합니다. 실행 결과는 `newsletter/{날짜}` 브랜치로 커밋되고 검수용 Pull Request가 자동 생성됩니다. Leona 대표가 PR을 검토하고 승인하면 발행 준비가 끝납니다.

### 5. GitHub Secrets 등록

| Secret 이름 | 설명 |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API 키 |

등록 경로는 `Settings → Secrets and variables → Actions → New repository secret`입니다.

## 폴더 구성

```
newsletter-pipeline/
├── .github/
│   └── workflows/
│       └── generate-newsletter.yml   # GitHub Actions 자동화
├── agents/
│   ├── __init__.py
│   ├── researcher.py                 # AGT 1: 웹 검색·트렌드 수집
│   ├── writer.py                     # AGT 2: 콘텐츠 초안 작성
│   ├── designer.py                   # AGT 3: 브랜드 HTML 생성
│   └── reviewer.py                   # AGT 4: 품질 검수
├── data/
│   ├── topic-bank.json               # 고민 해결소 주제 24개
│   └── issue-tracker.json            # 발행 이력 추적
├── output/                           # 생성된 HTML + 검수 리포트
├── pipeline.py                       # 메인 오케스트레이터
├── requirements.txt
├── SKILL.md
├── sample.html                       # 산출물 예시
└── README.md
```

## 환각 방지

라이터는 링고브릿지의 실적, 만족도 같은 내부 수치를 임의로 만들지 않습니다. 확인이 필요한 자리는 `[수치 확인 필요: 설명]` 형태로 비워 둡니다. 링고브릿지 직접 언급은 고민 해결소 마지막 1문장으로만 제한하고, 외부 통계는 출처를 반드시 표기합니다. 검수 리포트가 통과로 차 있어도 자동 발행하지 않으며, 마지막 승인은 사람이 합니다.

## 라이선스

이 스킬은 MIT 라이선스로 배포됩니다. 자세한 내용은 [LICENSE](LICENSE)를 참고하세요. © 2026 Leona.
