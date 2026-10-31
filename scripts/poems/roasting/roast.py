"""시 Roasting 회차 관리. 기준은 같은 폴더의 기준.md.

python3 -I roast.py init                # selection.json의 50편으로 state.json을 만든다 (v0 = 현재 본문)
python3 -I roast.py critic-input N      # 회차 N에 채점할 시(미합격)를 r{N}-input.txt로 쓴다 (출처·회차 정보 없음)
python3 -I roast.py merge N             # r{N}-RED.json 등 넷을 합쳐 판정한다
python3 -I roast.py black-input N K     # 회차 N 불합격 시를 K개 묶음으로 나눠 r{N}-black-{k}.json으로 쓴다
python3 -I roast.py apply N             # r{N}-black-out-*.json의 고쳐 쓴 본문을 다음 버전으로 넣는다 (길이·고정 행 검사)
python3 -I roast.py status
"""
import json, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
POEMS = HERE.parent
STATE = HERE / "state.json"
ROLES = ["RED", "SILVER", "BLUE", "GOLD"]
PASS, NEAR = 9.5, 9.2

LOCKED = {
    "서명란": ["책임자", "커서가", "깜빡였다.", "오래.", "나는", "내 이름을 썼다."],  # 앞부분은 고치고 슬라이드 4장을 맞춘다
    "처음 듣는 목소리": ["질문을 입력했다", "0.3초", "사흘 걸려 쓴 것이 화면 위로 밀려 올라갔다"],
    "보고서_최종": ["보고서_최종.hwp", "보고서_최종_진짜최종.hwp", "보고서_최종_진짜최종_수정.hwp",
                 "바뀐 내용을 저장할까요", "저장 안 함", "파일명이 길어질수록", "나는 짧아졌다"],
    "명단(名單)": ["생일은 어느 칸에도 없다", "결재란은 비어 있다", "이 빈칸을 채우면", "저 책상들이 빈다",
                "잉크가 나오지 않는다", "귀퉁이에 두 번 긋고", "내 이름을 쓴다"],
    "수신 확인 1": ["저희가 책임지고 하겠습니다", "아홉 시 이 분에 보낸다", "대표자 나", "담당자 나", "연대보증인 나",
                 "나는 자유롭고", "나는 괜찮고", "나는"],
    "반사": ["부장님 하고 부르면 안경을 올리고, 아빠 하고 부르면 티브이 소리를 줄인다.",
           "아무도 부르지 않는 세 시에는 의자가 유리문 쪽으로 돌아가 있다.",
           "결재판 밑판에 이름 석 자가 뒤집혀 배었다."],
    "몰래": ["아빠가 무릎을 꿇어요", "어깨가 내 책가방만 해요", "내 이름을 세 번 불러요", "아빠 이름은 한 번도 안 불러요",
           "나는 소원 빌 때 아빠 이름을 안 넣었어요", "아빠 건 아빠가 빌면 되잖아요", "그냥요"],
}


def load():
    return json.load(open(STATE))


def save(st):
    json.dump(st, open(STATE, "w"), ensure_ascii=False, indent=1)


def text(stanzas):
    return "\n\n".join("\n".join(s) for s in stanzas)


def nlines(p, stanzas):
    return len(" ".join(stanzas[0][0].split(". ")).split(". ")) if p.get("prose") else sum(len(s) for s in stanzas)


def locked_ok(title, stanzas, orig):
    rule = LOCKED.get(title)
    if not rule:
        return []
    if rule == "ALL":
        return [] if stanzas == orig else ["전체 고정인데 바뀜"]
    body = "\n".join("\n".join(s) for s in stanzas)
    if title == "반사":
        return [l for l in rule if l not in body]
    lines = [l for s in stanzas for l in s]
    return [l for l in rule if l not in lines]


def cur(p):
    return p["versions"][-1]["stanzas"]


def init():
    allp = {p["id"]: p for p in json.load(open(POEMS / "poems-all.json"))}
    sel = json.load(open(POEMS / "selection.json"))
    st = {}
    for b in sel:
        for i in b["ids"]:
            p = allp[i]
            st[i] = {"title": p["title"], "tag": p["tag"], "section": b["section"], "prose": bool(p.get("prose")),
                     "lines0": nlines(p, p["stanzas"]), "versions": [{"v": 0, "stanzas": p["stanzas"]}],
                     "scores": {}, "status": "pending", "locked": LOCKED.get(p["title"]) == "ALL" and "ALL" or bool(LOCKED.get(p["title"]))}
    save(st)
    print("init", len(st))


def todo(st):
    return [i for i, p in st.items() if p["status"] in ("pending", "revise")]


def critic_input(n):
    st = load()
    ids = todo(st)
    out = []
    for i in ids:
        p = st[i]
        out.append(f"=== {i} 「{p['title']}」\n{text(cur(p))}\n")
    (HERE / f"r{n}-input.txt").write_text("\n".join(out))
    print(f"r{n}-input.txt", len(ids), "편")


def merge(n):
    st = load()
    sc = {r: {x["id"]: x for x in json.load(open(HERE / f"r{n}-{r}.json"))} for r in ROLES}
    ids = todo(st)
    miss = [(r, i) for r in ROLES for i in ids if i not in sc[r]]
    if miss:
        sys.exit(f"점수 빠짐: {miss[:10]}")
    passed, near, low = [], [], []
    for i in ids:
        p = st[i]
        s = {r: sc[r][i] for r in ROLES}
        p["scores"][f"r{n}"] = {"v": p["versions"][-1]["v"], **{r: {"score": s[r]["score"], "weak": s[r].get("weak", ""), "fix": s[r].get("fix", "")} for r in ROLES}}
        vals = [s[r]["score"] for r in ROLES]
        if min(vals) >= PASS:
            p["status"] = "pass"; passed.append(i)
        elif p["locked"] == "ALL":
            p["status"] = "locked-fail"; low.append(i)
        else:
            p["status"] = "revise"; (near if min(vals) >= NEAR else low).append(i)
    save(st)
    print(f"r{n}: 합격 {len(passed)} / 부분 수정 {len(near)} / 다시 쓰기 {len(low)} / 누적 합격 {sum(p['status']=='pass' for p in st.values())}")
    for i in ids:
        p = st[i]; r = p["scores"][f"r{n}"]
        print(f"  {i} {p['status']:<11} {' '.join(f'{x[0]}{r[x]['score']}' for x in ROLES)} 「{p['title']}」")


def black_input(n, k):
    st = load()
    ids = [i for i in st if st[i]["status"] == "revise"]
    groups = [ids[j::k] for j in range(k)]
    for g, gids in enumerate(groups, 1):
        items = []
        for i in gids:
            p = st[i]; r = p["scores"][f"r{n}"]
            mode = "부분 수정" if min(r[x]["score"] for x in ROLES) >= NEAR else "다시 쓰기"
            lk = LOCKED.get(p["title"])
            items.append({"id": i, "title": p["title"], "form": "산문시(한 단락)" if p["prose"] else "행 구분 시",
                          "lines_original": p["lines0"],
                          "lines_allowed": [max(1, round(p["lines0"] * 0.6)), max(p["lines0"], round(p["lines0"] * 1.4))] if p["lines0"] > 6 else [1, 6],
                          "mode": mode, "locked_lines": lk or [],
                          "original_v0": text(p["versions"][0]["stanzas"]), "current": text(cur(p)),
                          "critics": {x: r[x] for x in ROLES},
                          # 이전 회차 지적: 이미 고친 흠이 되살아나지 않게 참고만 한다
                          "earlier_critics": {k: {x: v[x]["weak"] for x in ROLES if v[x]["weak"]}
                                              for k, v in p["scores"].items() if k != f"r{n}"}})
        json.dump(items, open(HERE / f"r{n}-black-{g}.json", "w"), ensure_ascii=False, indent=1)
        print(f"r{n}-black-{g}.json", len(items))


def apply(n):
    st = load()
    outs = sorted(HERE.glob(f"r{n}-black-out-*.json"))
    got = {}
    for f in outs:
        for x in json.load(open(f)):
            got[x["id"]] = x
    need = [i for i in st if st[i]["status"] == "revise"]
    miss = [i for i in need if i not in got]
    if miss:
        sys.exit(f"고쳐 쓴 본문 빠짐: {miss}")
    errs = []
    for i in need:
        p = st[i]; x = got[i]
        stanzas = [[l.strip() for l in s if l.strip()] for s in x["stanzas"]]
        stanzas = [s for s in stanzas if s]
        if p["prose"] and (len(stanzas) != 1 or len(stanzas[0]) != 1):
            errs.append(f"{i} 산문시가 한 단락이 아님")
        n_l = sum(len(s) for s in stanzas)
        if not p["prose"]:
            lo, hi = ([1, 6] if p["lines0"] <= 6 else [max(1, round(p["lines0"] * 0.6)), max(p["lines0"], round(p["lines0"] * 1.4))])
            if not lo <= n_l <= hi:
                errs.append(f"{i} 행 수 {n_l} (허용 {lo}~{hi})")
        bad = locked_ok(p["title"], stanzas, p["versions"][0]["stanzas"])
        if bad:
            errs.append(f"{i} 고정 행 빠짐 {bad}")
        if "—" in text(stanzas) and "—" not in text(p["versions"][0]["stanzas"]):
            errs.append(f"{i} 줄표 새로 들어감")
        p["versions"].append({"v": len(p["versions"]), "round": n, "stanzas": stanzas, "note": x.get("note", "")})
    save(st)
    print(f"apply r{n}: {len(need)}편 새 버전")
    if errs:
        print("검사 경고:"); [print(" ", e) for e in errs]


def status():
    st = load()
    from collections import Counter
    print(Counter(p["status"] for p in st.values()))


if __name__ == "__main__":
    cmd = sys.argv[1]
    {"init": init, "status": status}.get(cmd, lambda: None)()
    if cmd == "critic-input": critic_input(int(sys.argv[2]))
    if cmd == "merge": merge(int(sys.argv[2]))
    if cmd == "black-input": black_input(int(sys.argv[2]), int(sys.argv[3]))
    if cmd == "apply": apply(int(sys.argv[2]))
