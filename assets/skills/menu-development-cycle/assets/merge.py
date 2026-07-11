#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
merge.py — _shell.html + 페이즈/스테이지 조각 + 산출물 조각 → 단일 결과 HTML 병합

사용법:
  python3 merge.py [--frag-dir DIR] [--shell PATH] [--out PATH] [--stages 1-1,2-1,...]

기본 동작:
  - --stages 미지정 시: fragments 폴더에 존재하는 stage_*.html 전체를 번호 순으로 병합
  - 페이즈 헤더(phase_N.html)는 해당 페이즈의 첫 스테이지 앞에 자동 삽입
  - 산출물(_outputs.html)은 모든 스테이지 뒤에 삽입
  - _shell.html 의 <!-- @@STAGES@@ --> 위치에 끼워 넣는다

스킬 실행 흐름:
  1) build_fragments.py 로 빈 조각 생성(최초 1회)
  2) 각 스테이지 완료 시 해당 stage_*.html 의 {{...}}를 실제 내용으로 채워 outputs 작업본에 저장
  3) merge.py 로 지금까지 완료된 스테이지만 병합 → {{브랜드}}_{{메뉴}}_개발사이클.html 생성
  4) present_files 로 전달
"""
import argparse, os, re

PHASE_OF = {  # 스테이지 → 페이즈
    "1-1":1,"2-1":2,"2-2":2,"3-1":3,"3-2":3,
    "4-1":4,"4-2":4,"5-1":5,"5-2":5,"6-1":6,
}
ORDER = ["1-1","2-1","2-2","3-1","3-2","4-1","4-2","5-1","5-2","6-1"]

def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()

def main():
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser()
    ap.add_argument("--frag-dir", default=os.path.join(here, "fragments"))
    ap.add_argument("--shell", default=os.path.join(here, "_shell.html"))
    ap.add_argument("--out", default=os.path.join(here, "merged.html"))
    ap.add_argument("--stages", default="")
    args = ap.parse_args()

    if args.stages.strip():
        stages = [s.strip() for s in args.stages.split(",") if s.strip()]
    else:
        stages = [s for s in ORDER
                  if os.path.exists(os.path.join(args.frag_dir, f"stage_{s}.html"))]
    stages.sort(key=lambda s: ORDER.index(s) if s in ORDER else 99)

    blocks, seen_phase = [], set()
    for s in stages:
        ph = PHASE_OF.get(s)
        if ph and ph not in seen_phase:
            ph_path = os.path.join(args.frag_dir, f"phase_{ph}.html")
            if os.path.exists(ph_path):
                blocks.append(read(ph_path))
            seen_phase.add(ph)
        sp = os.path.join(args.frag_dir, f"stage_{s}.html")
        blocks.append(read(sp))

    out_path = os.path.join(args.frag_dir, "_outputs.html")
    if os.path.exists(out_path):
        blocks.append(read(out_path))

    shell = read(args.shell)
    # 툴바 JS 주입 (있으면)
    tb_path = os.path.join(here, "doc_toolbar.js")
    if os.path.exists(tb_path) and "/*__DOC_TOOLBAR_JS__*/" in shell:
        shell = shell.replace("/*__DOC_TOOLBAR_JS__*/", read(tb_path))
    body = "\n".join(blocks)
    # @@STAGES@@ 주석 자리에 삽입
    merged = re.sub(r"<!--\s*@@STAGES@@.*?-->", body, shell, count=1, flags=re.S)

    with open(args.out, "w", encoding="utf-8") as f:
        f.write(merged)
    print(f"merged {len(stages)} stage(s) -> {args.out}")
    print("stages:", ", ".join(stages))

if __name__ == "__main__":
    main()
