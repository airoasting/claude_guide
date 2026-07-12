"""
링고브릿지 HRD 뉴스레터 자동화 파이프라인
오케스트레이터 — 4개 에이전트를 순차 실행하고 결과물을 저장한다.
"""

import json
import os
from datetime import datetime, timezone, timedelta
from pathlib import Path

from agents.researcher import run_researcher
from agents.writer import run_writer
from agents.designer import run_designer
from agents.reviewer import run_reviewer

ROOT = Path(__file__).parent
DATA_DIR = ROOT / "data"
OUTPUT_DIR = ROOT / "output"
OUTPUT_DIR.mkdir(exist_ok=True)


def get_kst_now() -> datetime:
    kst = timezone(timedelta(hours=9))
    return datetime.now(tz=kst)


def load_tracker() -> dict:
    tracker_path = DATA_DIR / "issue-tracker.json"
    if tracker_path.exists():
        return json.loads(tracker_path.read_text(encoding="utf-8"))
    return {"last_issue": 0, "issues": []}


def save_tracker(tracker: dict) -> None:
    path = DATA_DIR / "issue-tracker.json"
    path.write_text(json.dumps(tracker, ensure_ascii=False, indent=2), encoding="utf-8")


def pick_topic(tracker: dict) -> dict:
    """topic-bank.json에서 아직 발행되지 않은 다음 주제를 선택한다."""
    bank_path = DATA_DIR / "topic-bank.json"
    topics = json.loads(bank_path.read_text(encoding="utf-8"))
    used_ids = {i["topic_id"] for i in tracker["issues"]}
    for topic in topics:
        if topic["id"] not in used_ids:
            return topic
    raise ValueError("topic-bank가 소진됐습니다. 새 주제를 추가해주세요.")


def run_pipeline(dry_run: bool = False) -> None:
    now = get_kst_now()
    tracker = load_tracker()
    issue_num = tracker["last_issue"] + 1
    topic = pick_topic(tracker)

    print(f"\n{'='*50}")
    print(f"  링고브릿지 HRD 뉴스레터 파이프라인 시작")
    print(f"  호수: Vol.{issue_num:02d} | 날짜: {now.strftime('%Y.%m.%d')}")
    print(f"  주제: {topic['title']}")
    print(f"{'='*50}\n")

    # ── 에이전트 1: 리서치 ──────────────────────────
    print("[AGT 1] 리서치 에이전트 실행 중...")
    research = run_researcher(topic)
    print(f"  → 트렌드 {len(research['trends'])}건, 참고 자료 {len(research['references'])}건 수집 완료\n")

    # ── 에이전트 2: 라이터 ──────────────────────────
    print("[AGT 2] 라이터 에이전트 실행 중...")
    content = run_writer(issue_num, now, topic, research)
    print(f"  → 콘텐츠 초안 작성 완료 ({len(content['body'])}자)\n")

    # ── 에이전트 3: 디자이너 ────────────────────────
    print("[AGT 3] 디자이너 에이전트 실행 중...")
    html = run_designer(issue_num, now, content)
    html_path = OUTPUT_DIR / f"issue-{issue_num:02d}.html"
    if not dry_run:
        html_path.write_text(html, encoding="utf-8")
    print(f"  → HTML 생성 완료: {html_path.name}\n")

    # ── 에이전트 4: 리뷰어 ──────────────────────────
    print("[AGT 4] 리뷰어 에이전트 실행 중...")
    review = run_reviewer(issue_num, content, html)
    review_path = OUTPUT_DIR / f"review-{issue_num:02d}.md"
    if not dry_run:
        review_path.write_text(review, encoding="utf-8")
    print(f"  → 검수 완료: {review_path.name}\n")

    # ── 이슈 트래커 업데이트 ────────────────────────
    if not dry_run:
        tracker["last_issue"] = issue_num
        tracker["issues"].append({
            "issue_num": issue_num,
            "topic_id": topic["id"],
            "topic_title": topic["title"],
            "published_at": now.isoformat(),
            "html_file": html_path.name,
            "review_file": review_path.name,
        })
        save_tracker(tracker)

    print(f"{'='*50}")
    print(f"  파이프라인 완료")
    print(f"  HTML  → output/{html_path.name}")
    print(f"  리뷰  → output/{review_path.name}")
    print(f"  ⚠️  output/{review_path.name} 를 확인 후 발행하세요.")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true", help="파일 저장 없이 테스트 실행")
    args = parser.parse_args()
    run_pipeline(dry_run=args.dry_run)
