"""선정-기준.md를 실행한다. 98편 → 50편.

입력 (이 폴더): poems-all.json, tags.tsv, score-silver.json, score-gold.json
출력 (이 폴더): selection.json (실을 시와 묶음 순서), selection.md (선정·탈락 이유)
실행: python3 -I scripts/poems/select_poems.py
"""
import csv, json, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
TOTAL = 50

# 묶음: (이름, 섹션 id, 정원). 페이지에 이 순서로 나온다.
SECTIONS = [
    ("계절", "s5", 8),
    ("AI와 나", "s1", 7),
    ("일과 돈", "s2", 12),
    ("아이를 키우며", "s3", 6),
    ("부모님과 나", "s4", 4),
    ("사람 사이", "s7", 5),
    ("혼자 있는 시간", "s6", 8),
]
assert sum(q for _, _, q in SECTIONS) == TOTAL

FIXED = ["처음 듣는 목소리", "서명란", "보고서_최종", "반사", "심사역", "수신 확인 1", "명단(名單)", "몰래"]

CLUSTER_CAP = {"결론부터": 2, "한여름": 2}  # 나머지 겹침군은 1

# 시월·늦가을이 배경인 시
AUTUMN = {"P01", "P02", "P03", "P04", "P05", "P06", "P07", "P09", "P11", "P12", "P13", "P14", "P19",
          "P22", "P23", "P30", "P33", "P34", "P36", "P39", "P41", "P43", "P63"}
AUTUMN_CAP = 12

# 계절 묶음 안의 순서: 봄 → 여름 → 가을 → 겨울 → 사계절
SEASON_ORDER = ["P55", "P56", "P57", "P58", "P59", "P60", "P61", "P62", "P22", "P39", "P09", "P63", "P02",
                "P06", "P01", "P11", "P64", "P34", "P48", "P65"]

NONHUMAN = {"AI", "아이", "동물", "석상"}
LEADER = {"임원", "컨설팅 임원", "심사역", "결재권자", "팀장", "부장이자 아빠"}
EXPERIMENT = {"산문시", "시간표", "로그 형식", "번호 붙인 연", "코드 섞인 시", "숫자 시", "파일명 목록",
              "프롬프트 형식", "한 줄씩 끊은 시", "산문 한 연", "우화", "말장난"}

FLOORS = [
    ("사람이 아닌 화자", 3, lambda p: p["화자"] in NONHUMAN),
    ("20대·신입 화자", 2, lambda p: any(k in p["화자"] for k in ("스무", "스물", "20대", "신입"))),
    ("리더 화자", 3, lambda p: p["화자"] in LEADER),
    ("워킹맘·여성 화자", 3, lambda p: any(k in p["화자"] for k in ("워킹맘", "여성"))),
    ("유머·풍자", 5, lambda p: p["어조"] in ("유머", "풍자")),
    ("형식 실험", 4, lambda p: p["형식"] in EXPERIMENT),
    ("짧은 시(6행 이하)", 5, lambda p: p["lines"] <= 6),
]


def load():
    poems = {p["id"]: p for p in json.load(open(HERE / "poems-all.json"))}
    for row in csv.DictReader(open(HERE / "tags.tsv"), delimiter="\t"):
        p = poems[row["id"]]
        p.update({k: v for k, v in row.items() if k != "id"})
        p["clusters"] = [c for c in (row["겹침군"] or "").split("|") if c]
        p["lines"] = sum(len(s) for s in p["stanzas"]) if not p.get("prose") else 99
    silver = {r["id"]: r for r in json.load(open(HERE / "score-silver.json"))}
    gold = {r["id"]: r for r in json.load(open(HERE / "score-gold.json"))}
    missing = [i for i in poems if i not in silver or i not in gold]
    if missing:
        sys.exit(f"점수 없음: {missing}")
    for i, p in poems.items():
        p["silver"], p["gold"] = silver[i]["total"], gold[i]["total"]
        p["score"] = round((p["silver"] + p["gold"]) / 2, 2)
        p["silver_note"], p["gold_note"] = silver[i].get("note", ""), gold[i].get("note", "")
        p["best_line"] = gold[i].get("best_line", "")
    return poems


def main():
    poems = load()
    by_title = {p["title"]: i for i, p in poems.items()}
    fixed = [by_title[t] for t in FIXED]
    quota = {name: q for name, _, q in SECTIONS}
    why_out = {}

    def ok(pid, chosen, ignore=None):
        p = poems[pid]
        rest = [c for c in chosen if c != ignore]
        for c in p["clusters"]:
            if sum(c in poems[x]["clusters"] for x in rest) >= CLUSTER_CAP.get(c, 1):
                return f"겹침군 `{c}` 상한"
        if pid in AUTUMN and sum(x in AUTUMN for x in rest) >= AUTUMN_CAP:
            return "시월 배경 상한"
        return None

    chosen = list(fixed)
    for name, _, q in SECTIONS:
        cands = sorted((i for i, p in poems.items() if p["묶음"] == name and i not in chosen),
                       key=lambda i: -poems[i]["score"])
        for i in cands:
            if sum(poems[x]["묶음"] == name for x in chosen) >= q:
                why_out.setdefault(i, f"`{name}` 정원 {q}편 밖 (점수 순)")
                continue
            r = ok(i, chosen)
            if r:
                why_out[i] = r
                continue
            chosen.append(i)

    # 관점 하한
    swaps = []
    for label, need, f in FLOORS:
        while sum(f(poems[x]) for x in chosen) < need:
            pool = sorted((i for i in poems if i not in chosen and f(poems[i])), key=lambda i: -poems[i]["score"])
            done = False
            for cand in pool:
                sec = poems[cand]["묶음"]
                outs = sorted((x for x in chosen if poems[x]["묶음"] == sec and x not in fixed),
                              key=lambda x: poems[x]["score"])
                for out in outs:
                    trial = [x for x in chosen if x != out] + [cand]
                    if ok(cand, trial, ignore=cand):
                        continue
                    if any(sum(g(poems[x]) for x in trial) < n and sum(g(poems[x]) for x in chosen) >= n
                           for _, n, g in FLOORS):
                        continue
                    chosen = trial
                    swaps.append((label, cand, out))
                    why_out[out] = f"관점 하한 `{label}`을 채우려고 「{poems[cand]['title']}」과 바꿈"
                    why_out.pop(cand, None)
                    done = True
                    break
                if done:
                    break
            if not done:
                print(f"하한을 못 채움: {label}", file=sys.stderr)
                break

    assert len(chosen) == TOTAL, len(chosen)
    for name, _, q in SECTIONS:
        assert sum(poems[x]["묶음"] == name for x in chosen) == q, name

    # 출력
    order = []
    for name, sid, _ in SECTIONS:
        ids = [x for x in chosen if poems[x]["묶음"] == name]
        if name == "계절":
            ids.sort(key=lambda x: SEASON_ORDER.index(x) if x in SEASON_ORDER else 99)
        else:
            ids.sort(key=lambda x: -poems[x]["score"])
        order.append({"section": name, "sid": sid, "ids": ids})
    json.dump(order, open(HERE / "selection.json", "w"), ensure_ascii=False, indent=1)

    src = lambda p: "기존" if p["source"] == "기존" else p["source"].replace("padlet-", "Padlet ")
    L = ["# 50편 선정 결과", "",
         f"기준은 [선정-기준.md](선정-기준.md). 품질 점수 = (SILVER + GOLD) / 2. 생성: `select_poems.py`.", ""]
    n_new = sum(poems[x]["source"] != "기존" for x in chosen)
    L += [f"- 실은 시 {TOTAL}편: 기존 {TOTAL - n_new}편, Padlet {n_new}편",
          f"- 시월 배경 {sum(x in AUTUMN for x in chosen)}편 (상한 {AUTUMN_CAP})", ""]
    L += ["## 관점 하한 확인", "", "| 관점 | 하한 | 실은 수 |", "|---|---|---|"]
    for label, need, f in FLOORS:
        L.append(f"| {label} | {need} | {sum(f(poems[x]) for x in chosen)} |")
    if swaps:
        L += ["", "하한 때문에 바꾼 시:", ""]
        L += [f"- {lab}: 「{poems[c]['title']}」({poems[c]['score']}) 넣고 「{poems[o]['title']}」({poems[o]['score']}) 뺌" for lab, c, o in swaps]
    split = [i for i in poems if abs(poems[i]["silver"] - poems[i]["gold"]) >= 2.5]
    if split:
        L += ["", "## 채점자 의견이 크게 갈린 시 (사람이 다시 볼 것)", ""]
        L += [f"- {i} 「{poems[i]['title']}」 SILVER {poems[i]['silver']} / GOLD {poems[i]['gold']} ({'실음' if i in chosen else '뺌'})" for i in split]
    for blk in order:
        L += ["", f"## {blk['section']} ({len(blk['ids'])}편)", "", "| 시 | 출처 | 점수 | S | G | 근거 |", "|---|---|---|---|---|---|"]
        for x in blk["ids"]:
            p = poems[x]
            mark = " (고정)" if x in fixed else ""
            L.append(f"| 「{p['title']}」{mark} | {src(p)} | {p['score']} | {p['silver']} | {p['gold']} | {p['silver_note']} |")
    L += ["", "## 뺀 시", "", "| 시 | 묶음 | 출처 | 점수 | 뺀 이유 |", "|---|---|---|---|---|"]
    for i in sorted((i for i in poems if i not in chosen), key=lambda i: (poems[i]["묶음"], -poems[i]["score"])):
        p = poems[i]
        L.append(f"| 「{p['title']}」 | {p['묶음']} | {src(p)} | {p['score']} | {why_out.get(i, '')} |")
    (HERE / "selection.md").write_text("\n".join(L) + "\n")
    for blk in order:
        print(blk["section"], len(blk["ids"]), [poems[x]["title"] for x in blk["ids"]])


if __name__ == "__main__":
    main()
