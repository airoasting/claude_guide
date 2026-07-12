# 트리거 평가셋 (franchise-consult)

`trigger_evalset.json` — 발동 10건 / 비발동 10건. 비발동에는 근접 케이스(본사 매뉴얼·상권 조회·계약 검토·본사 평가·채용 채점 등)를 넣어 description의 발동 정밀도를 시험한다.

## description 자동 최적화 실행법

skill-creator의 최적화 루프는 내부적으로 `claude -p`를 중첩 호출한다. **에이전트 세션 안에서는 401 인증 오류로 실패**하므로, **로그인된 일반 터미널**에서 직접 돌린다. Python 3.10+ 필요(`python3.11` 등).

```bash
SC="<skill-creator 스킬 경로>"   # skill-creator/SKILL.md 가 있는 폴더
cd "$SC"
python3.11 -m scripts.run_loop \
  --eval-set "<...>/skills/franchise-consult/evals/trigger_evalset.json" \
  --skill-path "<...>/skills/franchise-consult" \
  --model claude-opus-4-8 \
  --max-iterations 5 --verbose
```

끝나면 출력 JSON의 `best_description`을 `franchise-consult/SKILL.md`의 frontmatter `description:`에 반영한다(test 점수 기준 선택이라 과적합 방지). 점수가 기존과 같거나 낮으면 반영하지 않는다.

> 현재 description은 정성 감사에서 발동/비발동 문구를 모두 커버한 것으로 평가됨. 자동 튜닝은 선택 사항이다.
