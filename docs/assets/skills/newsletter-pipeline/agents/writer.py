"""
AGT 2 — 라이터 에이전트
리서치 결과 + 스킬 문서를 바탕으로 뉴스레터 콘텐츠 초안을 작성한다.
"""

import anthropic
import json
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).parent.parent
SKILL_PATH = ROOT.parent / "skill-newsletter.md"
TOPIC_BANK_PATH = ROOT / "data" / "topic-bank.json"

client = anthropic.Anthropic()


def load_skill_doc() -> str:
    return SKILL_PATH.read_text(encoding="utf-8")


WRITER_PROMPT = """당신은 링고브릿지 HRD 대표 한서영입니다.
기업 HRD 담당자에게 보내는 주간 뉴스레터 콘텐츠를 작성해주세요.

[스킬 문서]
{skill_doc}

[이번 호 정보]
- 호수: Vol.{issue_num:02d}
- 발행일: {date}
- 고민 해결소 주제: {topic_title}
- 링고브릿지 연결 포인트: {brand_connection}

[리서치 결과]
{research_json}

[작성 규칙]
1. 한서영 대표 1인칭 시점, "동료 전문가" 톤
2. 전체 5분 이내, 섹션당 3~5문장
3. 본문 100% 한국어 (영어 표현 섹션 제외)
4. 링고브릿지 직접 언급은 고민 해결소 마지막 1문장에만
5. 임원 지칭 시 반드시 존경어 사용 (임원께서, 임원분들, ~하시는)
6. 링고브릿지 수치 임의 생성 금지 — [수치 확인 필요: 설명] 형식으로 빈칸 표시
7. 외부 통계 인용 시 출처 명시 필수

[출력 형식 — 반드시 JSON으로만 응답]
{{
  "subject_candidates": [
    {{"formula": "공식 번호 (1~5)", "title": "제목", "recommended": true/false}}
  ],
  "greeting": "인사말 (2문장 이내)",
  "trend": {{
    "section_title": "섹션 제목 (Barlow 헤드라인 스타일)",
    "accent_word": "타이틀에서 골드로 강조할 단어",
    "body": "트렌드 본문 (3~4문장)",
    "cards": [
      {{"num": "Trend 01", "title": "카드 제목", "body": "카드 본문 (2~3문장)"}},
      {{"num": "Trend 02", "title": "카드 제목", "body": "카드 본문 (2~3문장)"}},
      {{"num": "Trend 03", "title": "카드 제목", "body": "카드 본문 (2~3문장)"}},
      {{"num": "Trend 04", "title": "카드 제목", "body": "카드 본문 (2~3문장)"}}
    ],
    "closing": "한국 기업 시사점 (1~2문장)",
    "source": "출처 표기"
  }},
  "worry": {{
    "section_title": "섹션 제목 (Barlow 헤드라인 스타일)",
    "accent_word": "타이틀에서 골드로 강조할 단어",
    "quote": "HRD 담당자의 목소리로 된 인용문 (담당자가 혼자 삭히던 고민)",
    "intro": "공감 도입 (1~2문장)",
    "reasons": [
      {{"num": "01", "title": "원인 제목", "body": "원인 설명 (2~3문장, 임원 존경어 포함)"}},
      {{"num": "02", "title": "원인 제목", "body": "원인 설명 (2~3문장, 임원 존경어 포함)"}},
      {{"num": "03", "title": "원인 제목", "body": "원인 설명 (2~3문장, 임원 존경어 포함)"}}
    ],
    "solution_intro": "솔루션 박스 도입 (1문장)",
    "solution_bullets": ["실천 항목 1", "실천 항목 2"],
    "solution_closing": "솔루션 마무리 (1문장)",
    "brand_connect": "링고브릿지 자연스러운 연결 (1문장, 수치 없이)",
    "review_needed": []
  }},
  "english": {{
    "section_title": "섹션 제목",
    "phrase": "영어 표현",
    "meaning_ko": "한국어 뜻",
    "intro": "도입 설명 (2문장)",
    "examples": [
      {{"situation": "상황", "en": "영어 예문", "ko": "한국어 번역"}},
      {{"situation": "상황", "en": "영어 예문", "ko": "한국어 번역"}},
      {{"situation": "상황", "en": "영어 예문", "ko": "한국어 번역"}}
    ],
    "tip": "핵심 팁"
  }},
  "body": "전체 본문 텍스트 (글자 수 계산용)",
  "editor_notes": ["편집자 노트 1", "편집자 노트 2"]
}}"""


def run_writer(issue_num: int, date: datetime, topic: dict, research: dict) -> dict:
    skill_doc = load_skill_doc()

    prompt = WRITER_PROMPT.format(
        skill_doc=skill_doc[:3000],  # 토큰 절약: 핵심 부분만
        issue_num=issue_num,
        date=date.strftime("%Y.%m.%d"),
        topic_title=topic["title"],
        brand_connection=topic.get("brand_connection", ""),
        research_json=json.dumps(research, ensure_ascii=False, indent=2),
    )

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=8192,
        messages=[{"role": "user", "content": prompt}],
    )

    text = response.content[0].text.strip()
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()

    return json.loads(text)
