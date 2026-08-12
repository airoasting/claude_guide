#!/usr/bin/env python3
"""본문 바로가기 링크(SKIP-STD)를 콘텐츠 페이지에 주입하거나 제거한다.

WCAG 2.4.1(Bypass Blocks, Level A). 이 사이트는 페이지마다 상단 내비가 길어
키보드 사용자가 본문에 닿기까지 링크를 여러 번 지나야 한다.

블록 하나가 스타일·링크·스크립트를 모두 담는다. 페이지마다 <style> 이 따로라
공용 CSS 파일에 기댈 수 없어서 마커 안에 함께 넣는다.

    <!-- SKIP-STD -->  ...  <!-- /SKIP-STD -->   <body> 바로 뒤
    <main class="container" id="main" tabindex="-1">

이동을 해시에 맡기지 않는 이유는 index.html 의 표지가 380svh 라 해시 착지가
취소되는 일이 있고, tabindex="-1" 요소로 포커스가 따라가는지도 브라우저마다
다르기 때문이다. behavior 는 instant 로 못박는다. auto 는 CSS 의
scroll-behavior: smooth 로 풀려 본문까지 느리게 흘러간다.

사용법
    python3 assets/js/inject-skiplink.py            # 주입 (여러 번 돌려도 안전)
    python3 assets/js/inject-skiplink.py --remove   # 제거
    python3 assets/js/inject-skiplink.py --dry-run  # 대상만 확인
"""

import argparse
import re
import sys
from pathlib import Path

DOCS = Path(__file__).resolve().parent.parent.parent

OPEN_MARK, CLOSE_MARK = "<!-- SKIP-STD -->", "<!-- /SKIP-STD -->"
BLOCK_RE = re.compile(
    r"[ \t]*" + re.escape(OPEN_MARK) + r".*?" + re.escape(CLOSE_MARK) + r"\n?",
    re.DOTALL,
)
BODY_RE = re.compile(r"<body[^>]*>")
MAIN_RE = re.compile(r"<main(?![^>]*\bid=)([^>]*)>")
REFRESH_RE = re.compile(r'http-equiv=["\']refresh["\']', re.IGNORECASE)

BLOCK = """<!-- SKIP-STD -->
<style>
    /* 본문 바로가기 (WCAG 2.4.1 Level A). 평소엔 화면 위로 접히고 포커스 때만 내려온다 */
    .skip-link {
        position: fixed; left: 50%; top: 0; z-index: 999;
        transform: translate(-50%, -130%);
        padding: 12px 24px; border-radius: 0 0 14px 14px;
        background: #1A1917; color: #fff;
        font-size: 14px; font-weight: 700; text-decoration: none;
        transition: transform 0.18s ease;
    }
    .skip-link:focus { transform: translate(-50%, 0); }
    main:focus { outline: none; }
</style>
<a href="#main" class="skip-link">본문으로 건너뛰기</a>
<script>
    /* 해시에 맡기지 않고 직접 옮긴다. instant 로 못박아야 smooth 로 흘러가지 않는다 */
    (function () {
        var l = document.querySelector('.skip-link');
        if (!l) return;
        l.addEventListener('click', function (e) {
            var m = document.getElementById('main');
            if (!m) return;
            e.preventDefault();
            m.scrollIntoView({ behavior: 'instant', block: 'start' });
            m.focus({ preventScroll: true });
        });
    })();
</script>
<!-- /SKIP-STD -->
"""


def targets():
    return sorted(DOCS.glob("*.html"))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--remove", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    added, already, stubs, no_main, touched = 0, 0, [], [], 0

    for path in targets():
        text = original = path.read_text(encoding="utf-8")
        name = path.name

        if args.remove:
            text = BLOCK_RE.sub("", text)
            text = text.replace('<main class="container" id="main" tabindex="-1">',
                                '<main class="container">')
        else:
            if REFRESH_RE.search(text):
                stubs.append(name)
                continue
            if "skip-link" in text:
                already += 1
                continue
            if "<main" not in text:
                no_main.append(name)
                continue

            m = BODY_RE.search(text)
            if not m:
                print(f"  건너뜀(<body> 없음): {name}", file=sys.stderr)
                continue
            text = text[: m.end()] + "\n" + BLOCK + text[m.end():]
            # 착지점. 이미 id 가 있는 main 은 건드리지 않는다
            text = MAIN_RE.sub(r'<main\1 id="main" tabindex="-1">', text, count=1)
            added += 1

        if text != original:
            touched += 1
            if not args.dry_run:
                path.write_text(text, encoding="utf-8")

    verb = "제거" if args.remove else "주입"
    tail = " (dry-run)" if args.dry_run else ""
    print(f"{verb} {added}개{tail} · 손댄 파일 {touched}개")
    if already:
        print(f"  이미 있음 {already}개")
    if stubs:
        print(f"  리다이렉트 스텁 제외 {len(stubs)}개")
    if no_main:
        print(f"  <main> 없어 제외 {len(no_main)}개: {', '.join(no_main)}")


if __name__ == "__main__":
    main()
