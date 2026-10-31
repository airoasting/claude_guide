"""Padlet 보드의 '시쓰기' 섹션 게시물을 JSON으로 받는다.

사용: python3 -I scripts/poems/fetch_padlet_poems.py OUT.json
보드를 늘리려면 BOARDS에 (라벨, wall_id, wall_hashid)를 추가한다.
섹션은 제목에 '시쓰기'가 들어간 것을 고른다.
"""
import json, sys, urllib.request, urllib.parse, re
from html.parser import HTMLParser

BOARDS = [
    ("1차수 · 10/16, 18", 272286607, "board_ljNYn6looD23y7Go"),
    ("파트너·임원급 2차수 · 10/24, 31", 272800191, "board_l5Q9AkGJpMDrAGJ4"),
    ("중급 2차수 · 10/30, 11/7", 273142280, "board_Bx8Pv0oKr86wyGZl"),
]

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0", "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read().decode("utf-8"))

class P(HTMLParser):
    """<p> 단위로 줄을 모은다. <br>은 줄바꿈, 빈 <p>는 연 구분."""
    def __init__(self):
        super().__init__(); self.paras = []; self.cur = None; self.bold = False
    def handle_starttag(self, t, a):
        if t == "p": self.cur = [""]
        elif t == "br" and self.cur is not None: self.cur.append("")
    def handle_endtag(self, t):
        if t == "p" and self.cur is not None:
            self.paras.append([s.strip() for s in self.cur if s.strip()]); self.cur = None
    def handle_data(self, d):
        if self.cur is not None: self.cur[-1] += d

def stanzas(body):
    p = P(); p.feed(body or "")
    paras = p.paras
    if any(len(x) == 0 for x in paras):
        out, cur = [], []
        for x in paras:
            if not x:
                if cur: out.append(cur); cur = []
            else: cur.extend(x)
        if cur: out.append(cur)
        return out
    return [x for x in paras if x]

def wishes(hashid):
    allw, start = [], ""
    for _ in range(30):
        j = get(f"https://padlet.com/api/10/wishes?wall_hashid={hashid}&page_start={urllib.parse.quote(start)}")
        allw += j.get("data", [])
        nxt = (j.get("meta") or {}).get("next") or (j.get("links") or {}).get("next")
        if not nxt: break
        m = re.search(r"page_start=([^&]+)", str(nxt))
        start = urllib.parse.unquote(m.group(1)) if m else ""
        if not start: break
    return [w["attributes"] for w in allw]

out = []
for label, wid, hashid in BOARDS:
    secs = get(f"https://padlet.com/api/5/wall_sections?wall_id={wid}&")
    secs = secs.get("data", secs)
    sec = [s for s in secs if "시쓰기" in (s.get("title") or s.get("attributes", {}).get("title") or "")]
    sid = int(sec[0]["id"]); stitle = sec[0].get("title") or sec[0]["attributes"]["title"]
    posts = sorted([w for w in wishes(hashid) if w["wall_section_id"] == sid], key=lambda a: a["created_at"])
    for a in posts:
        out.append({"board": label, "section": stitle, "headline": a.get("headline") or "",
                    "created": a["created_at"], "permalink": a["permalink"],
                    "has_attachment": bool(a.get("attachment")), "stanzas": stanzas(a.get("body"))})
    print(label, stitle, len(posts), file=sys.stderr)

json.dump(out, open(sys.argv[1], "w"), ensure_ascii=False, indent=1)
