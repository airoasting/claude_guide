"""
AGT 1 — 리서치 에이전트
글로벌 HRD 트렌드와 이번 주 고민 주제 관련 자료를 웹 검색으로 수집한다.
"""

import anthropic
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
SKILL_PATH = ROOT.parent / "skill-newsletter.md"

client = anthropic.Anthropic()


RESEARCHER_PROMPT = """당신은 링고브릿지 HRD 뉴스레터를 위한 리서치 전문가입니다.

이번 주 뉴스레터의 주제와 섹션에 필요한 자료를 수집해주세요.

[이번 주 주제]
카테고리: {category}
고민 해결소 주제: {title}
링고브릿지 연결 포인트: {brand_connection}

[수집 목표]
1. 글로벌 HRD 트렌드 1개: 최신 글로벌 기업교육·어학교육·HR 동향
   - 구체적인 수치나 연구 결과 포함
   - 출처 명시 필수
   - 한국 기업 HRD 담당자에게 유용한 인사이트

2. 이번 주 고민 관련 배경 자료: 위 주제의 원인·해결책을 뒷받침하는 정보

3. 비즈니스 영어 표현 1개: 임원 보고·해외 미팅·이메일에서 쓸 수 있는 실용 표현

[출력 형식 — 반드시 JSON으로만 응답]
{{
  "trends": [
    {{
      "headline": "트렌드 제목 (한 줄)",
      "summary": "3~4문장 요약. 수치 포함.",
      "source": "출처명",
      "source_year": "연도",
      "korea_implication": "한국 기업 HRD 담당자에게 주는 시사점 1~2문장"
    }}
  ],
  "topic_background": {{
    "causes": ["원인 1", "원인 2", "원인 3"],
    "solution_hints": ["해결 힌트 1", "해결 힌트 2"],
    "references": ["참고 내용 1", "참고 내용 2"]
  }},
  "english_expression": {{
    "phrase": "영어 표현",
    "meaning_ko": "한국어 뜻",
    "situation": "사용 상황 설명",
    "examples": [
      {{"situation": "상황 설명", "en": "영어 예문", "ko": "한국어 번역"}},
      {{"situation": "상황 설명", "en": "영어 예문", "ko": "한국어 번역"}},
      {{"situation": "상황 설명", "en": "영어 예문", "ko": "한국어 번역"}}
    ],
    "tip": "핵심 팁 한 줄"
  }},
  "references": ["출처 URL 또는 자료명 목록"]
}}"""


def run_researcher(topic: dict) -> dict:
    prompt = RESEARCHER_PROMPT.format(
        category=topic.get("category", ""),
        title=topic["title"],
        brand_connection=topic.get("brand_connection", ""),
    )

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        tools=[{
            "type": "web_search_20250305",
            "name": "web_search",
            "max_uses": 5,
        }],
        messages=[{"role": "user", "content": prompt}],
    )

    # 마지막 text 블록에서 JSON 추출
    for block in reversed(response.content):
        if block.type == "text":
            text = block.text.strip()
            # JSON 블록 추출
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].split("```")[0].strip()
            return json.loads(text)

    raise ValueError("리서치 에이전트: JSON 응답을 파싱할 수 없습니다.")
