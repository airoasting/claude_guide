#!/usr/bin/env python3
"""Claude Code 세션 기록(.jsonl)의 토큰을 집계하고 API 단가로 환산한다."""
import json, sys, os, glob, re
from collections import defaultdict

# 100만 토큰당 달러 (Anthropic 공식 API 정가)
RATE = {
    "opus":   {"in": 5.00, "out": 25.00, "read": 0.50, "w5": 6.25, "w60": 10.00},
    "sonnet": {"in": 3.00, "out": 15.00, "read": 0.30, "w5": 3.75, "w60":  6.00},
    "haiku":  {"in": 1.00, "out":  5.00, "read": 0.10, "w5": 1.25, "w60":  2.00},
}
def fam(m):
    m = (m or "").lower()
    for k in ("opus", "sonnet", "haiku"):
        if k in k and k in m: return k
    for k in ("opus", "sonnet", "haiku"):
        if k in m: return k
    return "opus"

def collect(path):
    agg = defaultdict(lambda: dict(inp=0, out=0, read=0, w5=0, w60=0, think=0, n=0))
    seen = set()
    with open(path, encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line: continue
            try: rec = json.loads(line)
            except Exception: continue
            msg = rec.get("message") or {}
            u = msg.get("usage") or rec.get("usage")
            if not isinstance(u, dict): continue
            mid = msg.get("id") or rec.get("requestId")
            if mid:
                if mid in seen: continue
                seen.add(mid)
            model = msg.get("model") or rec.get("model") or "unknown"
            a = agg[model]
            a["n"]   += 1
            a["inp"] += u.get("input_tokens", 0) or 0
            a["out"] += u.get("output_tokens", 0) or 0
            a["think"] += (u.get("output_tokens_details") or {}).get("thinking_tokens", 0) or 0
            a["read"]+= u.get("cache_read_input_tokens", 0) or 0
            cc = u.get("cache_creation_input_tokens", 0) or 0
            det = u.get("cache_creation") or {}
            e5  = det.get("ephemeral_5m_input_tokens")
            e60 = det.get("ephemeral_1h_input_tokens")
            if e5 is not None or e60 is not None:
                a["w5"]  += e5 or 0
                a["w60"] += e60 or 0
            else:
                a["w5"] += cc            # 세부가 없으면 5분으로 본다
    return agg

def money(agg):
    rows, tot = [], 0.0
    for model, a in sorted(agg.items(), key=lambda kv: -sum(kv[1][k] for k in ("inp","out","read","w5","w60"))):
        r = RATE[fam(model)]
        c = (a["inp"]*r["in"] + a["out"]*r["out"] + a["read"]*r["read"]
             + a["w5"]*r["w5"] + a["w60"]*r["w60"]) / 1_000_000
        tot += c
        rows.append((model, a, c))
    return rows, tot

def human(n):
    for unit, d in (("B",1_000_000_000),("M",1_000_000),("k",1_000)):
        if n >= d: return f"{n/d:.2f}{unit}"
    return str(n)

def main():
    args = sys.argv[1:]
    if not args:
        slug = re.sub(r"[^A-Za-z0-9]", "-", os.getcwd())
        d = os.path.expanduser("~/.claude/projects/" + slug)
        c = sorted(glob.glob(os.path.join(d, "*.jsonl")), key=os.path.getmtime)
        if not c:
            print("이 폴더의 세션 기록을 찾지 못했습니다. 경로를 직접 주세요."); sys.exit(1)
        args = [c[-1]]
        print(f"세션: {os.path.basename(args[0])[:8]}  (가장 최근)\n")
    paths = []
    for a in args:
        paths.extend(sorted(glob.glob(os.path.join(a, "*.jsonl"))) if os.path.isdir(a) else [a])
    agg = defaultdict(lambda: dict(inp=0, out=0, read=0, w5=0, w60=0, think=0, n=0))
    for p in paths:
        for m, a in collect(p).items():
            for k in a: agg[m][k] += a[k]
    rows, tot = money(agg)
    if not rows:
        print("사용량 기록을 찾지 못했습니다."); return
    print(f"{'모델':<26}{'요청':>6}{'입력':>10}{'출력':>10}{'캐시읽기':>12}{'캐시쓰기':>12}{'API 환산':>12}")
    print("-"*88)
    T = dict(inp=0,out=0,read=0,w=0,n=0)
    for model, a, c in rows:
        w = a["w5"] + a["w60"]
        print(f"{model[:25]:<26}{a['n']:>6}{human(a['inp']):>10}{human(a['out']):>10}{human(a['read']):>12}{human(w):>12}{'$'+format(c,'.2f'):>12}")
        T["inp"]+=a["inp"]; T["out"]+=a["out"]; T["read"]+=a["read"]; T["w"]+=w; T["n"]+=a["n"]
    print("-"*88)
    print(f"{'합계':<26}{T['n']:>6}{human(T['inp']):>10}{human(T['out']):>10}{human(T['read']):>12}{human(T['w']):>12}{'$'+format(tot,'.2f'):>12}")
    total_tok = T["inp"]+T["out"]+T["read"]+T["w"]
    w5 = sum(a["w5"] for _, a, _ in rows); w60 = sum(a["w60"] for _, a, _ in rows)
    th = sum(a["think"] for _, a, _ in rows)
    if total_tok:
        print(f"\n총 토큰 {human(total_tok)} · 캐시 적중률 {T['read']/total_tok*100:.1f}%")
        print(f"캐시 쓰기 내역: 5분 {human(w5)} · 1시간 {human(w60)}")
        if th: print(f"출력 중 사고 토큰: {human(th)} ({th/max(T['out'],1)*100:.0f}%)")
    print("API 정가 기준 환산액입니다. 구독 플랜은 달러가 아니라 사용량 한도로 계산합니다.")

main()
