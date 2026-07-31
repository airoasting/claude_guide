#!/usr/bin/env python3
"""엑싯 워터폴 계산기.

캡테이블과 우선주 조건을 받아 매각 금액대별 주주 분배액을 계산한다.
각 우선주가 우선권을 받을지, 포기하고 보통주로 전환할지는 서로 물고 물리므로
모든 조합을 계산해 아무도 자기 선택을 바꿔 더 받을 수 없는 상태를 찾는다.

이 계산을 손으로 하면 두 자리에서 틀린다.
  1. 참가적 우선주의 지분은 우선변제를 받든 안 받든 항상 잔여 배분 풀에 들어간다.
     이걸 빼면 배분 합계가 매각 대금을 넘는다.
  2. 참가 상한에 닿으면 초과분을 나머지 주주에게 다시 나눠야 하고,
     그 재배분이 다른 우선주의 전환 판단을 바꾼다.
두 경우 모두 합계 검산에서 걸리므로, 검산을 통과하지 못한 결과는 내지 않는다.

사용법
    python3 waterfall.py captable.json
    python3 waterfall.py captable.json --json
    python3 waterfall.py --selftest

입력 JSON 형식은 captable.example.json 참조.
"""

import argparse
import itertools
import json
import sys

TOLERANCE = 1.0  # 원 단위 검산 허용 오차


def _preference(p):
    return p["invested"] * p.get("multiple", 1.0)


def _pay_preferences(claims, proceeds):
    """우선순위(seniority) 순으로 우선변제. 같은 순위는 안분. 부족하면 하위는 0."""
    paid = {name: 0.0 for name, _, _ in claims}
    left = proceeds
    for tier in sorted({s for _, s, _ in claims}):
        tier_claims = [(n, amt) for n, s, amt in claims if s == tier]
        want = sum(a for _, a in tier_claims)
        if want <= 0:
            continue
        if left >= want:
            for n, a in tier_claims:
                paid[n] = a
            left -= want
        else:
            for n, a in tier_claims:
                paid[n] = left * (a / want)
            left = 0.0
            break
    return paid, left


def payout(cap, exit_amount, converted):
    """converted: 보통주 전환을 택한 우선주 이름 집합. 배분 결과 dict 반환."""
    common_shares = sum(c["shares"] for c in cap["common"])
    pref = cap["preferred"]

    # 잔여 배분 풀에 들어가는 지분:
    #   보통주 + 전환한 우선주 + 전환하지 않았지만 참가적인 우선주
    part_shares = common_shares
    for p in pref:
        if p["name"] in converted or p.get("participating"):
            part_shares += p["shares"]

    claims = [
        (p["name"], p.get("seniority", 1), _preference(p))
        for p in pref
        if p["name"] not in converted
    ]
    total_claim = sum(a for _, _, a in claims)
    if total_claim > exit_amount:
        # 우선변제만으로 소진. 잔여 배분 없음.
        paid, _ = _pay_preferences(claims, exit_amount)
        res = {c["name"]: 0.0 for c in cap["common"]}
        res.update({p["name"]: paid.get(p["name"], 0.0) for p in pref})
        return res, 0.0, set()

    paid, _ = _pay_preferences(claims, total_claim)
    capped = set()

    # 참가 상한을 넘는 우선주가 없어질 때까지 반복.
    # 상한에 닿은 쪽을 고정하고 남은 금액을 나머지에게 다시 나눈다.
    while True:
        fixed_total = sum(paid.get(p["name"], 0.0) for p in pref if p["name"] in capped)
        pref_total = sum(
            paid.get(p["name"], 0.0)
            for p in pref
            if p["name"] not in converted and p["name"] not in capped
        )
        pool_shares = part_shares - sum(
            p["shares"] for p in pref if p["name"] in capped
        )
        residual = exit_amount - fixed_total - pref_total
        if pool_shares <= 0:
            per_share = 0.0
            break
        per_share = residual / pool_shares

        over = None
        for p in pref:
            if p["name"] in capped or p.get("cap_multiple") is None:
                continue
            if p["name"] in converted:
                continue  # 전환하면 우선권도 상한도 사라진다
            if not p.get("participating"):
                continue
            total = paid[p["name"]] + p["shares"] * per_share
            limit = p["invested"] * p["cap_multiple"]
            if total > limit + TOLERANCE:
                over = (p, limit)
                break
        if over is None:
            break
        p, limit = over
        capped.add(p["name"])
        paid[p["name"]] = limit

    res = {}
    for c in cap["common"]:
        res[c["name"]] = c["shares"] * per_share
    for p in pref:
        n = p["name"]
        if n in capped:
            res[n] = paid[n]
        elif n in converted:
            res[n] = p["shares"] * per_share
        elif p.get("participating"):
            res[n] = paid[n] + p["shares"] * per_share
        else:
            res[n] = paid[n]
    return res, per_share, capped


def solve(cap, exit_amount):
    """아무도 자기 선택을 바꿔 더 받을 수 없는 조합을 찾는다."""
    names = [p["name"] for p in cap["preferred"]]
    valid = {}
    for r in range(len(names) + 1):
        for combo in itertools.combinations(names, r):
            conv = frozenset(combo)
            res, per, capped = payout(cap, exit_amount, conv)
            if abs(sum(res.values()) - exit_amount) <= TOLERANCE:
                valid[conv] = (res, per, capped)

    for conv, (res, per, capped) in sorted(valid.items(), key=lambda kv: len(kv[0])):
        stable = True
        for n in names:
            alt = frozenset(conv ^ {n})
            if alt in valid and valid[alt][0][n] > res[n] + TOLERANCE:
                stable = False
                break
        if stable:
            return {
                "exit": exit_amount,
                "converted": sorted(conv),
                "capped": sorted(capped),
                "per_share": per,
                "payout": res,
                "sum_check": sum(res.values()),
                "sum_ok": abs(sum(res.values()) - exit_amount) <= TOLERANCE,
            }
    return None


def breakeven(cap, name, lo, hi, key, iterations=90, scan=400):
    """key='convert'면 전환으로 돌아서는 매각가, 'cap'이면 참가 상한에 처음 닿는 매각가.

    전환은 한 번 유리해지면 계속 유리하므로 단조롭다. 그러나 참가 상한은
    구간에서만 걸린다. 상한에 닿았다가 더 오르면 전환이 유리해져 상한이 풀리기
    때문이다. 그래서 상한은 훑어서 구간을 먼저 찾은 뒤 그 안에서만 이분한다.
    """
    def hit(x):
        s = solve(cap, x)
        if s is None:
            return False
        return name in (s["converted"] if key == "convert" else s["capped"])

    if hit(lo):
        return None

    if key == "convert":
        if not hit(hi):
            return None
    else:
        step = (hi - lo) / scan
        found = None
        x = lo + step
        while x <= hi:
            if hit(x):
                found = x
                break
            x += step
        if found is None:
            return None
        lo, hi = found - step, found

    for _ in range(iterations):
        mid = (lo + hi) / 2
        if hit(mid):
            hi = mid
        else:
            lo = mid
    return hi


def common_first_payment(cap, lo, hi, iterations=90):
    """보통주가 처음 돈을 받기 시작하는 매각가. 범위 밖이면 None.

    상한에서 조건이 성립하는지 먼저 확인한다. 이 가드가 없으면 정답이 탐색 범위
    밖일 때 이분 탐색이 상한값으로 수렴해, 존재하지 않는 분기점을 사실처럼 찍는다.
    분기점은 배분 합계 검산에 걸리지 않으므로 이 오류는 다른 어디에서도 잡히지 않는다.
    """
    first = cap["common"][0]["name"]

    def hit(x):
        s = solve(cap, x)
        return bool(s) and s["payout"][first] > TOLERANCE

    if hit(lo):
        return None      # 하한에서 이미 받고 있으면 분기점이 범위 왼쪽 밖
    if not hit(hi):
        return None      # 상한에서도 못 받으면 분기점이 범위 오른쪽 밖
    for _ in range(iterations):
        mid = (lo + hi) / 2
        if hit(mid):
            hi = mid
        else:
            lo = mid
    return hi


def _fmt(v, unit=100_000_000):
    return f"{v / unit:,.2f}억"


def report(cap, unit=100_000_000):
    out = []
    for x in cap["scenarios"]:
        s = solve(cap, x)
        if s is None:
            out.append(f"Exit {_fmt(x, unit)}: 해를 찾지 못했습니다. 입력을 확인하세요.")
            continue
        out.append("")
        out.append(f"=== Exit {_fmt(x, unit)} · 잔여 주당 {s['per_share']:,.0f}원")
        out.append(f"    전환: {', '.join(s['converted']) or '없음'}"
                   f" · 상한 적용: {', '.join(s['capped']) or '없음'}")
        holders = [(c["name"], None) for c in cap["common"]]
        holders += [(p["name"], p["invested"]) for p in cap["preferred"]]
        for name, inv in holders:
            v = s["payout"][name]
            m = f"  {v / inv:>6.2f}배" if inv else " " * 9
            out.append(f"    {name:<12} {_fmt(v, unit):>12}  {v / x * 100:5.1f}%{m}")
        mark = "일치" if s["sum_ok"] else "불일치"
        out.append(f"    합계 {_fmt(s['sum_check'], unit)}  검산 {mark}")
        if not s["sum_ok"]:
            out.append("    !! 검산 불일치. 이 결과는 쓰지 마세요.")

    # 탐색 범위는 사용자가 물은 시나리오가 아니라 캡테이블에서 뽑는다.
    # 시나리오만 보고 범위를 잡으면 낮은 매각가만 물었을 때 분기점이 전부
    # 범위 밖으로 나가고, 그 사실이 출력에서 보이지 않는다.
    total_pref = sum(p["invested"] * p.get("multiple", 1.0) for p in cap["preferred"])
    hi = max(total_pref, max(cap["scenarios"])) * 12
    lo = min(p["invested"] for p in cap["preferred"]) / 100

    out.append("")
    out.append(f"=== 분기점  (탐색 범위 {_fmt(lo, unit)} ~ {_fmt(hi, unit)})")
    found = []
    cf = common_first_payment(cap, lo, hi)
    found.append(("보통주 첫 수령", cf))
    for p in cap["preferred"]:
        found.append((f"{p['name']} 전환", breakeven(cap, p["name"], lo, hi, "convert")))
        if p.get("cap_multiple"):
            found.append((f"{p['name']} 상한 도달",
                          breakeven(cap, p["name"], lo, hi, "cap")))

    for label, v in found:
        if v is None:
            out.append(f"    {label:<18} 탐색 범위 안에 없음")
        else:
            out.append(f"    {label:<18} {_fmt(v, unit):>12}")
    return "\n".join(out)


SELFTEST_CAP = {
    "common": [
        {"name": "창업팀", "shares": 4_500_000},
        {"name": "스톡옵션 풀", "shares": 1_500_000},
    ],
    "preferred": [
        {"name": "시드", "shares": 1_500_000, "invested": 1_500_000_000,
         "multiple": 1.0, "participating": False, "cap_multiple": None, "seniority": 3},
        {"name": "시리즈A", "shares": 2_500_000, "invested": 7_500_000_000,
         "multiple": 1.0, "participating": False, "cap_multiple": None, "seniority": 2},
        {"name": "시리즈B", "shares": 2_000_000, "invested": 12_000_000_000,
         "multiple": 1.0, "participating": True, "cap_multiple": 2.0, "seniority": 1},
    ],
    "scenarios": [40_000_000_000, 80_000_000_000, 150_000_000_000],
}

# sample.html에 실린 값. 손계산과 교차검증했다.
EXPECTED = {
    40_000_000_000: {"창업팀": 9.711e9, "스톡옵션 풀": 3.237e9, "시드": 3.237e9,
                     "시리즈A": 7.5e9, "시리즈B": 16.316e9},
    80_000_000_000: {"창업팀": 25.5e9, "스톡옵션 풀": 8.5e9, "시드": 8.5e9,
                     "시리즈A": 14.167e9, "시리즈B": 23.333e9},
    150_000_000_000: {"창업팀": 56.25e9, "스톡옵션 풀": 18.75e9, "시드": 18.75e9,
                      "시리즈A": 31.25e9, "시리즈B": 25.0e9},
}


def selftest():
    ok = True
    for x, exp in EXPECTED.items():
        s = solve(SELFTEST_CAP, x)
        if s is None:
            print(f"FAIL Exit {_fmt(x)}: 해 없음")
            ok = False
            continue
        if not s["sum_ok"]:
            print(f"FAIL Exit {_fmt(x)}: 합계 {_fmt(s['sum_check'])}")
            ok = False
        for name, want in exp.items():
            got = s["payout"][name]
            if abs(got - want) > max(want * 0.001, 1_000_000):
                print(f"FAIL Exit {_fmt(x)} {name}: 기대 {_fmt(want)} 실제 {_fmt(got)}")
                ok = False
    for name, want in (("시드", 29.0e9), ("시리즈A", 48.0e9), ("시리즈B", 144.0e9)):
        got = breakeven(SELFTEST_CAP, name, 5e9, 400e9, "convert")
        if got is None or abs(got - want) > want * 0.01:
            print(f"FAIL {name} 전환 분기점: 기대 {_fmt(want)} 실제 "
                  f"{_fmt(got) if got else '없음'}")
            ok = False
    capped_at = breakeven(SELFTEST_CAP, "시리즈B", 5e9, 400e9, "cap")
    if capped_at is None or abs(capped_at - 84.0e9) > 84.0e9 * 0.01:
        print(f"FAIL 시리즈B 상한 도달: 기대 840.00억 실제 "
              f"{_fmt(capped_at) if capped_at else '없음'}")
        ok = False
    cf = common_first_payment(SELFTEST_CAP, 5e9, 400e9)
    if cf is None or abs(cf - 21.0e9) > 0.3e9:
        print(f"FAIL 보통주 첫 수령: 기대 210.00억 실제 "
              f"{_fmt(cf) if cf else '없음'}")
        ok = False

    # 범위 밖 가드. 이 가드가 빠지면 이분 탐색이 상한값을 정답처럼 찍는다.
    # 정답 210억은 아래 상한 20억보다 크므로 반드시 None이어야 한다.
    if common_first_payment(SELFTEST_CAP, 1e9, 20e9) is not None:
        print("FAIL 보통주 첫 수령: 범위 밖인데 값을 반환했다")
        ok = False
    if breakeven(SELFTEST_CAP, "시드", 1e9, 20e9, "convert") is not None:
        print("FAIL 시드 전환: 범위 밖인데 값을 반환했다")
        ok = False
    # 시리즈B 상한 도달점은 840억이므로 상한 500억 범위에서는 잡히면 안 된다
    if breakeven(SELFTEST_CAP, "시리즈B", 1e9, 50e9, "cap") is not None:
        print("FAIL 시리즈B 상한: 범위 밖인데 값을 반환했다")
        ok = False
    print("PASS 자체 검증 통과" if ok else "FAIL 자체 검증 실패")
    return 0 if ok else 1


def main():
    ap = argparse.ArgumentParser(description="엑싯 워터폴 계산기")
    ap.add_argument("captable", nargs="?", help="캡테이블 JSON 경로")
    ap.add_argument("--json", action="store_true", help="JSON으로 출력")
    ap.add_argument("--selftest", action="store_true", help="자체 검증 실행")
    a = ap.parse_args()

    if a.selftest:
        return selftest()
    if not a.captable:
        ap.error("캡테이블 JSON 경로가 필요합니다. 또는 --selftest")

    with open(a.captable, encoding="utf-8") as f:
        cap = json.load(f)

    if a.json:
        res = [solve(cap, x) for x in cap["scenarios"]]
        print(json.dumps(res, ensure_ascii=False, indent=2))
        return 0 if all(r and r["sum_ok"] for r in res) else 1

    print(report(cap))
    return 0


if __name__ == "__main__":
    sys.exit(main())
