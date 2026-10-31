# scripts/poems, 「시로 쓴 자화상」 시 관리

`docs/showcase-poems.html`의 시 목록을 만드는 곳이다. 후보 시 전체를 데이터로 두고, 기준표로 50편을 골라 페이지에 그린다.

## 왜

수업이 늘 때마다 시가 쌓인다. 페이지에 다 실으면 읽히지 않고, 손으로 고르면 기준이 매번 달라진다. 그래서 후보와 기준, 점수, 결과를 파일로 남기고, 같은 절차로 다시 고른다.

## 파일

| 파일 | 내용 |
|---|---|
| [선정-기준.md](선정-기준.md) | 50편을 고르는 기준(품질, 소재 다양성, 관점 다양성, 고정 시) |
| `poems-all.json` | 후보 시 전체. 2026-10-31 기준 98편(기존 44, Padlet 54). 실린 50편은 Roasting으로 고친 본문이 `stanzas`, 고치기 전 원고가 `stanzas_v0`, 점수가 `roasting`에 있다 |
| [roasting/](roasting/기준.md) | 50편 고쳐 쓰기. 기준(합격선 9.5), 회차 관리 `roast.py`, 회차별 점수와 원고(`state.json`), 최종본 `final.json`, 처음 보는 비평가의 검증 `audit-*.json` |
| `tags.tsv` | 시마다 묶음, 소재, 화자, 어조, 형식, 겹침군 |
| `score-silver.json`, `score-gold.json` | 평론가·독자 채점. 출처를 가린 채 서로 모르게 매겼다 |
| `selection.json`, [selection.md](selection.md) | 선정 결과와 선정·탈락 이유 |
| `fetch_padlet_poems.py` | Padlet 보드의 '시쓰기' 섹션을 받는다 |
| `import_padlet_poems.py` | 받은 글을 정리(이름 제거, 최종본만)해 `poems-all.json`에 더한다 |
| `select_poems.py` | 기준표를 실행해 50편을 고른다 |
| `render_poems.py` | 50편으로 페이지의 서브 메뉴와 시 목록을 다시 쓴다 |

## 새 차수의 시를 더할 때

```bash
python3 -I scripts/poems/fetch_padlet_poems.py /tmp/poems.json
python3 -I scripts/poems/import_padlet_poems.py /tmp/poems.json
```

1. 보드는 `fetch_padlet_poems.py`의 `BOARDS`에, 새 게시물의 제목과 태그는 `import_padlet_poems.py`의 `EDITS`에 더한다. 빠지면 스크립트가 멈추고 알려 준다.
2. 새로 더한 id마다 `tags.tsv`에 줄을 더한다.
3. 새 시만 평론가와 독자 두 관점으로 채점해 `score-*.json`에 더한다. 기준표 1번의 항목을 그대로 쓴다.
4. 고르고 그린다.

```bash
python3 -I scripts/poems/select_poems.py
python3 -I scripts/poems/render_poems.py
```

5. `selection.md`의 '채점자 의견이 크게 갈린 시'를 사람이 읽고 확인한다.

## 실린 시를 고쳐 쓸 때 (Roasting)

`roasting/기준.md`를 따른다. BLACK이 고치고 RED·SILVER·BLUE·GOLD가 채점해, 네 점수가 모두 9.5 이상이면 합격이다. 최대 네 번 고친다.

```bash
cd scripts/poems/roasting
python3 -I roast.py init            # selection.json의 50편으로 시작
python3 -I roast.py critic-input N  # 회차 N 채점 입력
python3 -I roast.py merge N         # 네 비평가 점수 합치기
python3 -I roast.py black-input N K # 불합격 시를 K묶음으로
python3 -I roast.py apply N         # 고친 원고 반영(행 수, 고정 행, 줄표 검사)
```

2026-10-31 회차에서 배운 점: 회차마다 새 비평가를 부르면 고친 곳 대신 새 흠을 찾아 점수가 맴돈다. 3회차부터 같은 비평가를 이어 쓰면 수렴하지만 점수가 부풀 수 있으니, 끝나면 처음 보는 비평가로 한 번 검증한다.

## 지킬 것

- 페이지의 `<!-- POEMS START -->`부터 `END`까지는 손으로 고치지 않는다. 시를 고칠 때는 `poems-all.json`을 고치고 다시 그린다.
- 슬라이드가 인용하는 8편은 `select_poems.py`의 `FIXED`에 있다. 슬라이드를 고치면 이 목록도 고친다.
- 편수(50편, 쉰 편)는 메타 설명, 헤더, 마지막 슬라이드 띠, CTA, `index.html`, README에도 적혀 있다. 50을 바꾸면 함께 고친다.
