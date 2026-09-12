# orientation.html 벤치마크 재검증

검증일: 2026-09-12. 대상: 벤치마크 표 18행 × 5모델 = 90칸, 표의 설명과 각주.

표의 23개 칸을 업데이트했다. 이 중 22개는 기존 숫자 변경, 1개는 미측정에서 공개 점수로 변경이다. 현재 원자료와 반올림 규칙으로 90칸을 다시 계산해 대조했다.

## 검증 기준

- 모델 순서: Fable 5.1, Opus 5, Sonnet 5, GPT-6 Astra, Gemini 3.8 Flash.
- 기본 추론 설정: Claude와 Astra max, Gemini high. ARC-AGI-3의 Opus만 high.
- AA Fable은 기본 fallback 포함. 코딩 에이전트는 Claude Code·Codex·Antigravity SDK 조합.
- 지수는 소수 첫째 자리, Elo는 정수, 백분율은 기존 행의 표시 정밀도를 기본으로 사용했다. Astra FrontierMath는 97.6%로 표시했다. 강조는 반올림 전 최댓값이다.
- 미측정은 해당 공개 목록에 결과가 없다는 뜻이다. 기관 내부에서 측정하지 않았다는 단정은 아니다.

## 전체 대조 결과

| 평가 | Fable 5.1 | Opus 5 | Sonnet 5 | Astra | Gemini | 출처 |
|---|---:|---:|---:|---:|---:|---|
| AA Intelligence Index v4.3 | 53.4 | 50.7 | 38.4 | 52.8 | 41.2 | AA 모델 원자료 |
| GDPval-AA v2 | 1764 | 1735 | 1501 | 1580 | 1464 | AA 모델 원자료 |
| AA-Briefcase | 1662 | 1645 | 1355 | 1562 | 1202 | AA 모델 원자료 |
| GDP.pdf | 26% | 22% | 13% | 31% | 21% | AA 모델 원자료 |
| AA-LCR v1.1 | 85% | 79% | 82% | 81% | 81% | AA 모델 원자료 |
| 𝜏³-Banking | 47% | 42% | 37% | 41% | 45% | AA 모델 원자료 |
| ARC-AGI-3 · ARC Prize 검증 | 미측정 | 30.2% | 미측정 | 62.7% | 미측정 | ARC v3 |
| Terminal-Bench v2.1 | 91% | 89% | 81% | 88% | 88% | AA 모델 원자료 |
| Terminal-Bench 4.0 · 공식 리더보드 | 57.9% | 51.8% | 12.4% | 58.2% | 19.1% | Terminal-Bench 공식 |
| AA Coding Agent Index v1.5 | 62.2 | 59.7 | 미측정 | 61.6 | 41.9 | AA 에이전트 원자료 |
| SciCode | 63% | 56% | 54% | 56% | 57% | AA 모델 원자료 |
| ARC-AGI-2 · ARC Prize 검증 | 90.0% | 90.4% | 미측정 | 95.0% | 미측정 | ARC v2 |
| Humanity's Last Exam | 59.1% | 54.9% | 41.3% | 54.7% | 47.8% | AA 모델 원자료 |
| GPQA Diamond | 94% | 93% | 91% | 96% | 95% | AA 모델 원자료 |
| CritPt | 30% | 29% | 17% | 32% | 18% | AA 모델 원자료 |
| FrontierMath Tier 4 v2 · Epoch AI | 88% | 73% | 29% | 97.6% | 22% | Epoch 원자료 |
| AA-Omniscience 정답률 | 67% | 61% | 40% | 63% | 55% | AA 모델 원자료 |
| AA-Omniscience 환각 억제율 | 27% | 39% | 61% | 49% | 45% | AA 모델 원자료 |

## 중요한 변경

- 종합 지수 v4.2 → v4.3. AutomationBench-AA를 포함하고 Terminal-Bench를 v4.0으로 업데이트한 현재 지수를 사용했다.
- 코딩 에이전트 지수 v1.4 → v1.5. Opus xhigh → max, Gemini Opencode → Antigravity SDK로 현재 공개 구성에 맞췄다. 이전 점수와 직접 비교하지 않는다.
- GDPval-AA v2와 AA-Briefcase Elo 10개를 현재 원자료로 업데이트했다.
- GDP.pdf: Astra 33% → 31%, Gemini 19% → 21%.
- FrontierMath: Astra max 95% → 97.6%, Gemini high 미측정 → 22%. medium만 97.6%라는 기존 설명을 삭제했다.
- ARC-AGI-2·3, 공식 Terminal-Bench 4.0 점수는 모두 일치했다. ARC 99.9%는 Provider Adapter high이며, 표준 하네스 max 62.7%와 조건이 다르다.
- 공식 Terminal-Bench의 신뢰구간: Astra ±2.79%포인트, Fable ±3.76%포인트. 구간이 겹친다는 사실은 동등성이 입증됐다는 뜻이 아니다.
- HLE는 텍스트 전용 2,158문항·도구 미사용 조건을 명시했다.
- 환각 억제는 1 − hallucinationRate로 재계산했다. 전체 답변의 정확도와 구분했다.
- 과거 지수·출처를 확인하지 않은 fallback 토큰 비율 4%·모델 선정에 관한 오래된 날짜 설명을 정리했다.
- Terminal-Bench 옛 링크는 홈페이지로 리다이렉트되어 현재 리더보드 주소로 교체했다.

## 재현 가능한 원자료

- [Claude Fable 5.1 (max with fallback)](https://artificialanalysis.ai/models/claude-fable-5-1): HTML에 포함된 `currentModel`의 지수·개별 평가값. `briefcaseBreakdown.overall.elo`, `omniscienceBreakdown` 포함.
- [Claude Opus 5 (max)](https://artificialanalysis.ai/models/claude-opus-5): HTML에 포함된 `currentModel`의 지수·개별 평가값. `briefcaseBreakdown.overall.elo`, `omniscienceBreakdown` 포함.
- [Claude Sonnet 5 (max)](https://artificialanalysis.ai/models/claude-sonnet-5): HTML에 포함된 `currentModel`의 지수·개별 평가값. `briefcaseBreakdown.overall.elo`, `omniscienceBreakdown` 포함.
- [GPT-6 Astra (max)](https://artificialanalysis.ai/models/gpt-6-astra): HTML에 포함된 `currentModel`의 지수·개별 평가값. `briefcaseBreakdown.overall.elo`, `omniscienceBreakdown` 포함.
- [Gemini 3.8 Flash (high)](https://artificialanalysis.ai/models/gemini-3-8-flash): HTML에 포함된 `currentModel`의 지수·개별 평가값. `briefcaseBreakdown.overall.elo`, `omniscienceBreakdown` 포함.
- [AA Coding Agent Index](https://artificialanalysis.ai/agents/coding-agents): HTML의 공개 `rows`, `indexScore` 및 에이전트 구성.
- [AA 지수 방법론](https://artificialanalysis.ai/methodology/intelligence-benchmarking), [코딩 에이전트 방법론](https://artificialanalysis.ai/methodology/coding-agents-benchmarking).
- [ARC-AGI-2 JSON](https://arcprize.org/media/data/leaderboard/v2.json), [ARC-AGI-3 JSON](https://arcprize.org/media/data/leaderboard/v3.json): 정확한 modelId와 score.
- [Astra ARC 결과](https://arcprize.org/results/openai-gpt-6-astra): 표준·어댑터 하네스 구분.
- [Epoch 평가 CSV](https://epoch.ai/data/benchmarks.csv): task=FrontierMath-Tier-4-v2-Private, 모델별 추론 설정의 mean_score. 모델별 최고값만 합친 processed_data_for_eci.csv는 설정 검증에 사용하지 않았다.
- [Epoch 방법론](https://epoch.ai/benchmarks/frontiermath-tier-4-v2): 비공개 41문항, 이해충돌 공개.
- [Terminal-Bench 공식 리더보드](https://www.tbench.ai/): HTML의 metadata와 metrics에서 추론 설정·accuracy·accuracy_ci95_half_width 확인.

## 범위와 한계

평가를 직접 실행한 결과가 아니라 평가 기관이 공개한 점수를 원자료와 대조한 결과다. 실시간 리더보드는 이후 변경될 수 있다. 벤치마크 표 밖의 가격·출시 타임라인·기업 도입률은 이번 검증 대상에 포함하지 않았다. CSS와 페이지 공통 구조는 변경하지 않았다.

## 화면 확인

Chrome headless의 1440×900·393×900 화면에서 확인했다. 18행·90칸 렌더링, 셀 내부 가로 넘침 없음, 페이지 전체 가로 넘침 없음. 모바일 표는 기존 720px 최소 폭과 가로 스크롤을 유지한다. CSS 변경은 없다.
