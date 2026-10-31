"""selection.json의 50편으로 docs/showcase-poems.html의 서브 메뉴와 시 목록을 다시 쓴다.

실행: python3 -I scripts/poems/render_poems.py
시 목록은 <!-- POEMS START --> ~ <!-- POEMS END --> 사이만, 서브 메뉴는 <nav class="sub-menu"> 안만 바꾼다.
"""
import html, json, re, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAGE = HERE.parent.parent / "docs" / "showcase-poems.html"
e = lambda s: html.escape(s, quote=False)


def card(p):
    if p.get("prose"):
        body = f'                <p class="prose">{e(p["stanzas"][0][0])}</p>'
    else:
        body = "\n".join(f"                <p>{'<br>'.join(e(l) for l in s)}</p>" for s in p["stanzas"])
    return ("        <article class=\"poem-card reveal\">\n"
            f"            <div class=\"poem-head\"><span class=\"poem-name\">{e(p['title'])}</span></div>\n"
            f"            <span class=\"poem-tag\">{e(p['tag'])}</span>\n"
            "            <div class=\"poem-text\">\n"
            f"{body}\n"
            "            </div>\n"
            "        </article>\n")


def main():
    poems = {p["id"]: p for p in json.load(open(HERE / "poems-all.json"))}
    sel = json.load(open(HERE / "selection.json"))
    total = sum(len(b["ids"]) for b in sel)

    blocks = []
    for i, b in enumerate(sel, 1):
        blocks.append(
            f"    <!-- ── 유형 {i} · {b['section']} ── -->\n"
            f"    <div class=\"cat-label reveal\" id=\"{b['sid']}\">\n"
            f"        <span class=\"cat-pill\"><span class=\"cat-sub\">{b['section']}</span><span class=\"cat-count\">{len(b['ids'])}</span></span>\n"
            f"    </div>    <div class=\"poem-list\" data-section=\"{b['sid']}\">\n\n"
            + "\n".join(card(poems[x]) for x in b["ids"])
            + "    </div>\n\n")
    nav = ('<nav class="sub-menu" id="subMenu" aria-label="유형 바로가기">\n' + "".join(
        f'    <a href="#{b["sid"]}" data-sec="{b["sid"]}">\n        <span class="sm-num">{i}</span>\n'
        f'        <span class="sm-title">{b["section"]}</span>\n'
        f'        <span class="sm-sub"><span class="sm-count">{len(b["ids"])}편</span></span>\n    </a>\n'
        for i, b in enumerate(sel, 1)))

    src = PAGE.read_text()
    a, z = "<!-- POEMS START -->", "<!-- POEMS END -->"
    if a not in src:
        sys.exit("POEMS 표지가 페이지에 없습니다.")
    src = re.sub(re.escape(a) + r".*?" + re.escape(z), lambda m: a + "\n" + "".join(blocks) + "    " + z, src, flags=re.S)
    src = re.sub(r'<nav class="sub-menu" id="subMenu"[^>]*>\n.*?(?=</nav>)', lambda m: nav, src, count=1, flags=re.S)
    PAGE.write_text(src)
    print("렌더", total, "편,", len(sel), "묶음")


if __name__ == "__main__":
    main()
