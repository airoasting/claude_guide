#!/usr/bin/env python3
"""token-saving.html의 'OpenRouter 주간 토큰 처리량' 차트를 weekly.json으로 다시 그린다.

갱신 순서
1. 브라우저에서 https://openrouter.ai/rankings 를 열고, 콘솔에서
   fetch('/api/frontend/v1/rankings/model-rankings-chart').then(r=>r.json())
   로 주별 모델 내역을 받는다. 주 합계 = ys 값의 합(10억 단위로 반올림).
2. weekly.json의 weeks에 끝난 주만 추가한다. 진행 중인 이번 주는 넣지 않는다.
   최근 52주만 그리므로 오래된 주는 지워도 된다.
3. 강조 막대를 바꾸면 highlights(툴팁 모델 내역)와 axis(x축 라벨)도 고친다.
4. python3 docs/_ops/openrouter/build.py 실행.
5. 본문 리드 문단과 하단 출처 알약의 숫자는 손으로 고친다(문장이라 자동화하지 않는다).
"""
import json
import math
import re
from datetime import date
from pathlib import Path

HERE = Path(__file__).resolve().parent
HTML = HERE.parents[1] / "token-saving.html"
DATA = json.loads((HERE / "weekly.json").read_text(encoding="utf-8"))

X0, X1, BASE, TOP = 40, 980, 248.0, 26.0
MAX_WEEKS = 52


def jo(v):
    return f"{v / 1000:.1f}조"


def build_svg(weeks, highlights, axis):
    n = len(weeks)
    step = (X1 - X0) / n
    bw = round(step * 0.89, 1)
    top_val = max(v for _, v in weeks)
    grid_step = 25000 if top_val <= 100000 else 50000
    ymax = math.ceil(top_val / grid_step) * grid_step
    scale = (BASE - TOP) / ymax

    out = ['<svg viewBox="0 0 980 270" role="img" aria-label="OpenRouter 주간 토큰 처리량 추이">']
    for g in range(0, ymax + 1, grid_step):
        y = BASE - g * scale
        label = "0" if g == 0 else f"{g // 1000}조"
        out.append(f'<line class="orc-grid" x1="{X0}" y1="{y:.1f}" x2="{X1}" y2="{y:.1f}"/>'
                   f'<text class="orc-axis" x="34" y="{y + 3:.1f}" text-anchor="end">{label}</text>')
    caps, labels = [], []
    for i, (d, v) in enumerate(weeks):
        x = X0 + i * step
        h = v * scale
        cx = x + bw / 2
        if d in highlights:
            out.append(f'<rect class="orc-bar hi" data-d="{d}" x="{x:.1f}" y="{BASE - h:.1f}" width="{bw}" '
                       f'height="{h:.1f}" rx="1.5"><title>{d} · {jo(v)}</title></rect>')
            caps.append(f'<text class="orc-cap" x="{cx:.1f}" y="{BASE - h - 7:.1f}" text-anchor="middle">{jo(v)}</text>')
        else:
            out.append(f'<rect class="orc-bar" x="{x:.1f}" y="{BASE - h:.1f}" width="{bw}" '
                       f'height="{h:.1f}" rx="1.5"><title>{d} · {jo(v)}</title></rect>')
        if d in axis:
            labels.append(f'<text class="orc-axis" x="{cx:.1f}" y="264" text-anchor="middle">{axis[d]}</text>')
    out += caps + labels
    out.append("</svg>")
    return "".join(out)


def main():
    weeks = sorted(DATA["weeks"].items())[-MAX_WEEKS:]
    totals = dict(weeks)
    highlights = {d: h for d, h in DATA["highlights"].items() if d in totals}
    svg = build_svg(weeks, highlights, DATA["axis"])

    tip = {d: {"label": h["label"], "total": totals[d], "models": h["models"]} for d, h in highlights.items()}
    for d, h in tip.items():
        s = sum(v for _, v in h["models"])
        if abs(s - h["total"]) > 10:
            raise SystemExit(f"{d}: 모델 내역 합 {s}이 주 합계 {h['total']}와 맞지 않는다")

    first, last = (date.fromisoformat(weeks[0][0]), date.fromisoformat(weeks[-1][0]))
    foot = f"{first.year}년 {first.month}월 {first.day}일 ~ {last.year}년 {last.month}월 {last.day}일, 주 단위 합계."

    html = HTML.read_text(encoding="utf-8")
    subs = [
        (r'(<div class="orc-wrap">)<svg .*?</svg>', lambda m: m.group(1) + svg),
        (r'(<div class="orc-foot">)[^<]*?주 단위 합계\.', lambda m: m.group(1) + foot),
        (r'(<script type="application/json" id="orcData">).*?(</script>)',
         lambda m: m.group(1) + json.dumps(tip, ensure_ascii=False) + m.group(2)),
    ]
    for pat, rep in subs:
        html, k = re.subn(pat, rep, html, count=1, flags=re.S)
        if k != 1:
            raise SystemExit(f"패턴을 찾지 못했다: {pat}")
    HTML.write_text(html, encoding="utf-8")
    print(f"{len(weeks)}주 {weeks[0][0]} ~ {weeks[-1][0]}, 최고 {jo(max(totals.values()))}, 강조 {', '.join(highlights)}")


if __name__ == "__main__":
    main()
