"""
AGT 4 - 리뷰어 에이전트
생성된 콘텐츠를 품질 체크리스트 기준으로 검수하고
사람이 반드시 확인해야 할 항목을 추출한다.
"""

import anthropic
import json

client = anthropic.Anthropic()

REVIEWER_PROMPT = """당신은 링고브릿지 HRD 뉴스레터 품질 관리자입니다.
아래 콘텐츠를 검수하고 결과를 마크다운으로 작성해주세요.

[콘텐츠 JSON]
{content_json}

[체크리스트]
콘텐츠:
1. 추천 제목이 20자 이내인가
2. 링고브릿지 직접 언급이 고민 해결소 끝 1회뿐인가
3. CTA 문구가 "이 고민, 우리 회사 얘기 같으시다면 이 메일에 바로 답장 주세요. Leona가 직접 읽습니다." 인가
4. 임원 관련 표현에 존경어가 사용되었는가 (임원께서, 임원분들, ~하시는)
5. 링고브릿지 수치/사례에 검수 필요 표시가 있는가

디자인:
6. 트렌드 카드가 4개인가
7. 고민 원인이 3개인가
8. 솔루션 불릿이 2개 이상인가
9. 영어 예문이 3개인가

[출력 형식]
# Vol.{issue_num:02d} 검수 리포트

## 체크리스트
| 번호 | 항목 | 결과 |
|---|---|---|
(각 항목을 통과 / 확인필요 / 문제 로 표시)

## 발행 전 확인 항목
(사람이 직접 확인해야 하는 항목 목록)

## 편집 제안
(선택적 개선 제안 2가지)

## 종합 의견
(한 줄)
"""


def run_reviewer(issue_num: int, content: dict, html: str) -> str:
    prompt = REVIEWER_PROMPT.format(
        content_json=json.dumps(content, ensure_ascii=False, indent=2)[:4000],
        issue_num=issue_num,
    )

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )

    return response.content[0].text
