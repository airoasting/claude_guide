#!/usr/bin/env python3
"""가이드 소개 모달 CSS 동기화.

about-modal.js가 CSS 단일 출처다. index.html은 이 스크립트를 include 할 때
data-mode="markup"으로 마크업만 받고 CSS는 자체 <style>에 사본을 둔다.
그 사본을 원본과 글자까지 같게 맞춘다.

    python3 docs/assets/js/sync-about-css.py

index.html의 ABOUT-MODAL-STD:START ~ END 사이만 바뀐다.
"""
import io
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.abspath(os.path.join(HERE, '..', '..'))
SRC = os.path.join(HERE, 'about-modal.js')
DST = os.path.join(DOCS, 'index.html')

START = '/* ABOUT-MODAL-STD:START'
END = '/* ABOUT-MODAL-STD:END */'


def main():
    js = io.open(SRC, encoding='utf-8').read()
    m = re.search(r'var CSS = `(.*?)`;\n', js, re.S)
    if not m:
        sys.exit('about-modal.js에서 CSS 템플릿 리터럴을 찾지 못했다')
    css = m.group(1)

    html = io.open(DST, encoding='utf-8').read()
    si = html.find(START)
    ei = html.find(END)
    if si < 0 or ei < 0 or ei < si:
        sys.exit('index.html에서 ABOUT-MODAL-STD 마커를 찾지 못했다')
    head = html[:si]
    tail = html[ei + len(END):]
    block = (START + ' — assets/js/about-modal.js의 CSS 사본. '
             '손으로 고치지 말고 sync-about-css.py로 맞춘다 */\n'
             + css + '\n        ' + END)
    out = head + block + tail
    if out == html:
        print('이미 같음. 바꾼 것 없음')
        return
    io.open(DST, 'w', encoding='utf-8').write(out)
    print('index.html 갱신. CSS %d자' % len(css))


if __name__ == '__main__':
    main()
