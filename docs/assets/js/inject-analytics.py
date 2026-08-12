#!/usr/bin/env python3
"""트래픽 측정 배선을 콘텐츠 페이지에 주입하거나 제거한다.

블록 두 개를 한 스크립트가 함께 관리한다.

  ANALYTICS-STD  </head> 앞. assets/js/analytics.js 를 부르는 script 한 줄.
  PRIVACY-STD    </footer> 앞. 쿠키 사용 고지 한 줄.

둘을 묶어 두는 이유는 측정을 걷어내면 고지도 함께 사라져야 하기 때문이다.
--remove 는 두 블록을 같이 제거한다.

측정 ID를 바꿀 때 이 스크립트를 다시 돌릴 필요는 없다.
assets/js/analytics.js 의 GA_ID 만 고치면 된다.

사용법
    python3 assets/js/inject-analytics.py           # 주입 (여러 번 돌려도 안전)
    python3 assets/js/inject-analytics.py --remove  # 두 블록 모두 제거
    python3 assets/js/inject-analytics.py --dry-run # 대상만 확인

대상 규칙
    포함: docs 루트의 *.html
    제외: 리다이렉트 스텁(meta refresh), assets/ 하위 전부, cases/ 하위 전부

    assets/ 를 빼는 이유는 두 가지다.
      1. assets/claudecode, assets/skills 는 수강생이 복사해 가는 샘플이다.
         태그가 딸려 가면 남의 사이트 조회수가 우리 속성에 섞인다.
      2. assets/stopwatch 는 쇼케이스에 iframe 으로 박혀 있어 중복 집계된다.
    cases/ 를 빼는 이유는 클라이언트 납품본이기 때문이다.
    납품본까지 재려면 아래 INCLUDE_CASES 를 True 로 바꾼다.
"""

import argparse
import re
import sys
from pathlib import Path

DOCS = Path(__file__).resolve().parent.parent.parent
INCLUDE_CASES = False

REFRESH_RE = re.compile(r'http-equiv=["\']refresh["\']', re.IGNORECASE)
# google<해시>.html 은 Search Console 소유 확인 파일이다. 한 줄짜리 평문이라 건드리면 확인이 깨진다
VERIFY_RE = re.compile(r"^google[0-9a-f]{16}\.html$")
HEAD_RE = re.compile(r"([ \t]*)</head>", re.IGNORECASE)
FOOTER_RE = re.compile(r"([ \t]*)</footer>", re.IGNORECASE)

# 푸터는 클래스형(48개)과 인라인 스타일형(2개) 두 종류다.
# 어느 쪽에 들어가도 같게 보이도록 고지 블록은 스타일을 자기 안에 갖는다.
PRIVACY_TEXT = (
    "이 사이트는 어느 페이지가 읽히는지 확인하기 위해 Google Analytics를 사용합니다. "
    "이 과정에서 쿠키가 저장되며, 브라우저 설정이나 "
    '<a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener" '
    'style="color:rgba(255,255,255,0.62);text-decoration:underline;white-space:nowrap;">'
    "구글 차단 도구</a>"
    "로 거부할 수 있습니다."
)
PRIVACY_STYLE = (
    "max-width:660px;margin:16px auto 0;padding:0 20px;"
    "font-size:11px;line-height:1.75;color:rgba(255,255,255,0.4);"
)


def marker(name):
    return f"<!-- {name} -->", f"<!-- /{name} -->"


def block_re(name):
    open_m, close_m = marker(name)
    return re.compile(
        r"[ \t]*" + re.escape(open_m) + r".*?" + re.escape(close_m) + r"\n?",
        re.DOTALL,
    )


def analytics_block(path, indent):
    """페이지 깊이에 맞는 상대 경로로 마커 블록을 만든다."""
    open_m, close_m = marker("ANALYTICS-STD")
    depth = len(path.relative_to(DOCS).parts) - 1
    href = "../" * depth + "assets/js/analytics.js"
    pad = indent + "    "
    return (
        f"{pad}{open_m}\n"
        f'{pad}<script defer src="{href}"></script>\n'
        f"{pad}{close_m}\n"
    )


def privacy_block(indent):
    open_m, close_m = marker("PRIVACY-STD")
    pad = indent + "    "
    return (
        f"{pad}{open_m}\n"
        f'{pad}<p style="{PRIVACY_STYLE}">{PRIVACY_TEXT}</p>\n'
        f"{pad}{close_m}\n"
    )


def targets():
    files = [p for p in sorted(DOCS.glob("*.html")) if not VERIFY_RE.match(p.name)]
    if INCLUDE_CASES:
        files += sorted(DOCS.glob("cases/**/*.html"))
    return files


def insert(text, anchor_re, builder):
    """anchor 바로 앞에 블록을 끼운다. anchor 가 없으면 None 을 준다."""
    m = anchor_re.search(text)
    if not m:
        return None
    return text[: m.start()] + builder(m.group(1)) + text[m.start():]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--remove", action="store_true", help="두 블록 모두 제거")
    ap.add_argument("--dry-run", action="store_true", help="파일을 고치지 않고 대상만 출력")
    args = ap.parse_args()

    stats = {"analytics": 0, "privacy": 0}
    touched, stubs, no_footer = set(), [], []

    for path in targets():
        text = original = path.read_text(encoding="utf-8")
        name = path.relative_to(DOCS).as_posix()

        if args.remove:
            for key in ("ANALYTICS-STD", "PRIVACY-STD"):
                new = block_re(key).sub("", text)
                if new != text:
                    stats["analytics" if key.startswith("ANALYTICS") else "privacy"] += 1
                    text = new
        else:
            if REFRESH_RE.search(text):
                stubs.append(name)
                continue

            if "<!-- ANALYTICS-STD -->" not in text:
                new = insert(text, HEAD_RE, lambda ind: analytics_block(path, ind))
                if new is None:
                    print(f"  건너뜀(</head> 없음): {name}", file=sys.stderr)
                else:
                    text = new
                    stats["analytics"] += 1

            # 쿠키 고지는 페이지 푸터가 아니라 소개 모달의 저작권 섹션에 둔다.
            # about-modal.js 의 "5. 방문 통계"가 그 자리다. 여기서는 주입하지 않고,
            # 옛 PRIVACY-STD 블록이 남아 있으면 --remove 로 걷어내기만 한다.
            pass

        if text != original:
            touched.add(name)
            if not args.dry_run:
                path.write_text(text, encoding="utf-8")

    verb = "제거" if args.remove else "주입"
    tail = " (dry-run, 파일 안 고침)" if args.dry_run else ""
    print(f"{verb} 완료{tail}")
    print(f"  ANALYTICS-STD {stats['analytics']}개")
    print(f"  PRIVACY-STD   {stats['privacy']}개")
    print(f"  손댄 파일 {len(touched)}개")
    if stubs:
        print(f"  리다이렉트 스텁 제외 {len(stubs)}개")
    if no_footer:
        print(f"  </footer> 없어 고지 못 넣음 {len(no_footer)}개: {', '.join(no_footer)}")


if __name__ == "__main__":
    main()
