#!/usr/bin/env python3
"""feature_list.json 게이트 검증.

언제 쓰나 (SKILL.md §2.5·§6·§9):
- hq-strategist가 사람 검토를 요청하기 직전 (STEP 2.5)
- sop-writer·qsc-auditor가 feature_list를 갱신할 때마다
- field-sv 배포(STEP 6) 진입 직전
- 사이클 완주 자가 점검(§9)

두 가지를 확인한다.
1) SCHEMA: shared/feature_list.json이 schema/feature_list.schema.json(Draft 7)을 통과하는가
2) STATS: stats.total == len(tasks) == 상태 버킷 합계(done+in_progress+eval_pending+rework+pending+failed)

둘 다 PASS여야 다음 단계로 간다. 하나라도 FAIL이면 종료 코드 1로 끝나므로
'사람 검토 요청 금지' 게이트로 그대로 쓸 수 있다 (||로 후속 명령을 막을 수 있음).

사용법 (레포 루트 = franchise-manual/ 에서):
    python3 scripts/validate_feature_list.py
경로를 바꾸려면:
    python3 scripts/validate_feature_list.py --schema schema/feature_list.schema.json --data shared/feature_list.json

의존성: jsonschema (없으면 `python3 -m pip install jsonschema`).
"""
import argparse
import json
import sys

STATUS_BUCKETS = ["done", "in_progress", "eval_pending", "rework", "pending", "failed"]


def main() -> int:
    ap = argparse.ArgumentParser(description="feature_list.json 스키마 + 합계 정합 검증")
    ap.add_argument("--schema", default="schema/feature_list.schema.json")
    ap.add_argument("--data", default="shared/feature_list.json")
    args = ap.parse_args()

    try:
        from jsonschema import Draft7Validator
    except ImportError:
        print("FAIL: jsonschema 미설치 — `python3 -m pip install jsonschema` 후 재실행", file=sys.stderr)
        return 1

    try:
        with open(args.schema, encoding="utf-8") as f:
            schema = json.load(f)
        with open(args.data, encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError as e:
        print(f"FAIL: 파일 없음 — {e.filename}", file=sys.stderr)
        return 1
    except json.JSONDecodeError as e:
        print(f"FAIL: JSON 파싱 불가 — {e}", file=sys.stderr)
        return 1

    ok = True

    # 1) 스키마
    errors = sorted(Draft7Validator(schema).iter_errors(data), key=lambda x: list(x.path))
    if errors:
        ok = False
        print("SCHEMA: FAIL")
        for x in errors:
            print(f"  - {list(x.path)}: {x.message}")
    else:
        print("SCHEMA: PASS")

    # 2) 합계 정합
    stats = data.get("stats", {})
    n = len(data.get("tasks", []))
    bucket_sum = sum(stats.get(k, 0) for k in STATUS_BUCKETS)
    total = stats.get("total")
    if total == n == bucket_sum:
        print("STATS: PASS")
    else:
        ok = False
        print(f"STATS: FAIL  total={total} len(tasks)={n} buckets_sum={bucket_sum}")
        # 어느 버킷이 비었는지 힌트
        missing = [k for k in STATUS_BUCKETS if k not in stats]
        if missing:
            print(f"  - stats에 없는 상태 키: {missing}")

    return 0 if ok else 1


if __name__ == "__main__":
    sys.exit(main())
