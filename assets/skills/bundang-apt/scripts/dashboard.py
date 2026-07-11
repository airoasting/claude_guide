#!/usr/bin/env python3
"""
분당구 아파트 주간 대시보드 HTML 생성기

Usage:
    python scripts/dashboard.py
    python scripts/dashboard.py --data data/ --output output/
    python scripts/dashboard.py --min-deals 3 --top-n 10
"""

import io
import os
import sys
import json
import argparse
from datetime import datetime

if hasattr(sys.stdout, "buffer") and getattr(sys.stdout, "encoding", "").lower() not in ("utf-8", "utf8"):
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "buffer") and getattr(sys.stderr, "encoding", "").lower() not in ("utf-8", "utf8"):
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8", errors="replace")

sys.path.insert(0, os.path.dirname(__file__))
from analyze import run as run_analysis

BASE_DIR   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")



def _build_html(results: dict, report_date: str) -> str:
    df            = results["df"]
    dong_rate     = results["dong_rate"]
    highlight     = results["highlight"]
    top_notable   = results["top_notable"]
    scored        = results.get("scored")
    monthly_trend = results.get("monthly_trend")
    reasons       = results.get("reasons", [])
    yoy_rate_df   = results.get("yoy_rate")

    yoy_dict: dict = {}
    if yoy_rate_df is not None and not yoy_rate_df.empty:
        for _, yr in yoy_rate_df.iterrows():
            yoy_dict[str(yr["행정동"])] = round(float(yr["전년동기비_%"]), 1)

    # complex_scores: 단지별 종합점수+항목점수 (JS 기간 필터용)
    complex_scores: dict = {}
    if scored is not None:
        pool = scored[scored["거래건수"] >= 5]
        for _, r in pool.iterrows():
            key = f"{r['행정동']}_{r['단지명']}"
            complex_scores[key] = {
                "dong":    str(r["행정동"]),
                "complex": str(r["단지명"]),
                "score":   int(r["종합점수"]),
                "scores": {
                    "입지":     int(r.get("점수_입지",   0)),
                    "학군":     int(r.get("점수_학군",   0)),
                    "평형":     int(r.get("점수_평형",   0)),
                    "재건축":   int(r.get("점수_재건축", 0)),
                    "단지규모": int(r.get("점수_단지규모", 0)),
                    "조망":     int(r.get("점수_조망",   0)),
                },
            }

    dongs = []
    for _, r in dong_rate.iterrows():
        name = str(r["행정동"])
        dongs.append({
            "name":  name,
            "price": int(r["평당가_전체평균"]),
            "rate":  round(float(r["변동률_%"]), 1),
            "deals": int(r["거래건수"]),
            "yoy":   yoy_dict.get(name),
        })

    highlights = [
        {
            "dong":    str(r["행정동"]),
            "complex": str(r["단지명"]),
            "rate":    round(float(r["변동률_%"]), 1),
            "avg":     round(float(r["동_평균변동률"]), 1),
            "diff":    round(float(r["편차"]), 1),
            "deals":   int(r["거래건수"]),
        }
        for _, r in highlight.iterrows()
    ]

    notable = [
        {
            "dong":    str(r["행정동"]),
            "complex": str(r["단지명"]),
            "score":   int(r["종합점수"]),
            "price":   int(r["평당가_전체평균"]),
            "ratio":   round(float(r["점수당가격"]), 1),
            "rate":    round(float(r["변동률_%"]), 1),
            "scores": {
                "입지":     int(r["점수_입지"]),
                "학군":     int(r["점수_학군"]),
                "평형":     int(r["점수_평형"]),
                "재건축":   int(r["점수_재건축"]),
                "단지규모": int(r["점수_단지규모"]),
                "조망":     int(r["점수_조망"]),
            },
        }
        for _, r in top_notable.iterrows()
    ]

    monthly = []
    if monthly_trend is not None:
        for _, r in monthly_trend.iterrows():
            ym = str(r["계약년월"])
            monthly.append({
                "ym":    ym[:4] + "." + ym[4:6],
                "price": int(r["평당가_평균"]),
                "count": int(r["거래건수"]),
            })

    data_json = json.dumps(
        {
            "dongs":           dongs,
            "highlights":      highlights,
            "notable":         notable,
            "monthly":         monthly,
            "reasons":         reasons,
            "monthly_dong":    results.get("monthly_dong",    []),
            "monthly_complex": results.get("monthly_complex", []),
            "complex_scores":  complex_scores,
        },
        ensure_ascii=False,
    )

    html = _HTML_TEMPLATE
    html = html.replace("__DATE__",      report_date)
    html = html.replace("__DATA_JSON__", data_json)
    return html


_HTML_TEMPLATE = r"""<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>분당구 아파트 주간 대시보드 — __DATE__</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Segoe UI',Malgun Gothic,sans-serif;background:#f0f4f8;color:#1e293b;font-size:14px}
header{background:linear-gradient(135deg,#1e3a5f 0%,#2563eb 100%);color:#fff;padding:22px 32px}
header h1{font-size:22px;font-weight:700;margin-bottom:4px}
header .sub{opacity:.75;font-size:13px}
.container{max-width:1200px;margin:0 auto;padding:24px 20px}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.card{background:#fff;border-radius:10px;padding:16px 20px;box-shadow:0 1px 4px rgba(0,0,0,.08)}
.card .label{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.6px;margin-bottom:6px}
.card .value{font-size:22px;font-weight:700;color:#1e293b}
.card .value.up{color:#16a34a}
.two-col{display:grid;grid-template-columns:3fr 2fr;gap:16px;margin-bottom:16px}
.panel{background:#fff;border-radius:10px;padding:20px;box-shadow:0 1px 4px rgba(0,0,0,.08);margin-bottom:16px}
.panel h2{font-size:14px;font-weight:700;color:#334155;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid #e2e8f0;letter-spacing:.3px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{background:#f8fafc;color:#475569;font-weight:600;padding:9px 12px;text-align:left;border-bottom:2px solid #e2e8f0;white-space:nowrap}
td{padding:8px 12px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
tr:last-child td{border-bottom:none}
tr:hover td{background:#fafbfc}
.up{color:#16a34a;font-weight:600}
.dn{color:#dc2626;font-weight:600}
.badge{display:inline-block;padding:2px 9px;border-radius:12px;font-size:11px;font-weight:700}
.badge.up{background:#dcfce7;color:#15803d}
.badge.dn{background:#fee2e2;color:#dc2626}
#bar-chart svg{width:100%;display:block}
#map-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.map-cell{border-radius:8px;padding:10px 8px;cursor:default;transition:transform .15s,box-shadow .15s;min-height:72px;display:flex;flex-direction:column;justify-content:center}
.map-cell:not(.empty):hover{transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.15)}
.map-cell .dname{font-size:12px;font-weight:800;color:#fff;margin-bottom:2px}
.map-cell .drate{font-size:15px;font-weight:800;color:#fff}
.map-cell .dprice{font-size:10px;color:rgba(255,255,255,.8);margin-top:2px}
.map-cell.empty{background:transparent;pointer-events:none}
.map-layout{display:grid;grid-template-columns:2fr 3fr;gap:20px;align-items:start}
.calc{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start}
.calc-inputs label{display:block;margin-bottom:6px;font-size:12px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:.4px}
.calc-inputs input[type=range]{width:100%;margin:8px 0;accent-color:#2563eb}
.price-display{font-size:26px;font-weight:800;color:#2563eb;margin:8px 0 16px}
.price-manual{width:100%;padding:9px 12px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:14px;outline:none;transition:border-color .2s}
.price-manual:focus{border-color:#2563eb}
.calc-result{background:#f8fafc;border-radius:10px;padding:20px}
.calc-result .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:13px}
.calc-result .row:last-child{border:none;font-weight:800;font-size:15px;color:#1e3a5f;padding-top:12px}
.calc-result .row .lbl{color:#64748b}
.calc-result .row .val{font-weight:700;color:#1e293b}
.calc-result .row:last-child .val{color:#dc2626}
.note{font-size:11px;color:#94a3b8;margin-top:10px;line-height:1.6}
.sub-title{font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.5px;margin-bottom:8px}
.cluster-card{background:#f8fafc;border-radius:8px;padding:12px 14px;margin-bottom:8px}
.cluster-name{font-weight:800;font-size:13px;color:#1e3a5f}
.cluster-dongs{font-size:11px;color:#64748b;margin-top:2px}
.cluster-rate{font-size:18px;font-weight:800}
.reason-row{display:flex;align-items:center;gap:8px;padding:7px 10px;background:#f8fafc;border-radius:8px;flex-wrap:wrap}
.tag{display:inline-block;padding:2px 7px;border-radius:10px;font-size:10px;background:#e2e8f0;color:#475569;margin:1px 2px}
.policy-tabs{display:flex;gap:6px;margin-bottom:14px;flex-wrap:wrap}
.ptab{padding:6px 14px;border:1.5px solid #e2e8f0;border-radius:8px;cursor:pointer;font-size:12px;font-weight:600;background:#fff;color:#475569;transition:all .15s}
.ptab.active,.ptab:hover{background:#2563eb;color:#fff;border-color:#2563eb}
.policy-content{background:#f8fafc;border-radius:8px;padding:18px}
.policy-title{font-size:13px;font-weight:700;color:#1e3a5f;margin-bottom:14px;padding-bottom:10px;border-bottom:2px solid #e2e8f0}
.policy-item{margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #e2e8f0}
.policy-item:last-of-type{margin:0;padding:0;border:none}
.policy-item h3{font-size:12px;color:#334155;margin-bottom:4px;font-weight:700}
.policy-item p{font-size:12px;color:#64748b;line-height:1.7}
.policy-alert{background:#fef9c3;border-left:3px solid #eab308;padding:8px 12px;border-radius:0 6px 6px 0;margin-top:14px;font-size:11px;color:#713f12;line-height:1.6}
.filter-bar{background:#fff;border-bottom:2px solid #e2e8f0;padding:10px 32px;position:sticky;top:0;z-index:200;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.filter-inner{max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.fsel{padding:5px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:13px;outline:none;cursor:pointer;color:#334155;background:#f8fafc;transition:border-color .2s}
.fsel:focus,.fsel:hover{border-color:#2563eb;background:#fff}
.filter-tag{display:inline-block;padding:3px 12px;border-radius:12px;font-size:11px;font-weight:700;background:#eff6ff;color:#2563eb;transition:all .2s}
.filter-reset{margin-left:auto;padding:5px 14px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12px;cursor:pointer;background:#fff;color:#64748b;transition:all .15s}
.filter-reset:hover{background:#f1f5f9;border-color:#94a3b8}
@media(max-width:1000px){.map-layout{grid-template-columns:1fr}}
@media(max-width:900px){.cards{grid-template-columns:repeat(2,1fr)}.two-col{grid-template-columns:1fr}.calc{grid-template-columns:1fr}}
@media(max-width:480px){.cards{grid-template-columns:1fr}}
</style>
</head>
<body>
<header>
  <h1>🏢 분당구 아파트 주간 대시보드</h1>
  <div class="sub">분당구 아파트 실거래 분석 · 2025.6.15 ~ 2026.6.14 기준 &nbsp;|&nbsp; 생성일: __DATE__</div>
</header>

<div class="filter-bar">
  <div class="filter-inner">
    <span style="font-size:13px;font-weight:700;color:#1e3a5f">📅 분석 기간 검색</span>
    <select class="fsel" id="g-start"></select>
    <span style="color:#94a3b8;font-size:13px">~</span>
    <select class="fsel" id="g-end"></select>
    <span class="filter-tag" id="filter-note">전체 기간</span>
    <button class="filter-reset" onclick="resetFilter()">전체 기간 보기</button>
  </div>
</div>

<div class="container">

  <div class="cards">
    <div class="card">
      <div class="label">총 거래건수</div>
      <div class="value" id="card-total">—</div>
    </div>
    <div class="card">
      <div class="label">1평(3.3㎡)당 평균 가격</div>
      <div class="value" id="card-avg">—</div>
    </div>
    <div class="card">
      <div class="label">가격 가장 많이 오른 동</div>
      <div class="value up" id="card-best">—</div>
    </div>
    <div class="card">
      <div class="label">분석 기간</div>
      <div class="value" id="card-period" style="font-size:15px;padding-top:4px">—</div>
    </div>
  </div>

  <div class="panel">
    <h2>동별 실거래 현황 — 거래량 · 가격 변동 · 작년 대비</h2>
    <div class="map-layout">
      <div id="dong-map"></div>
      <div>
        <div class="sub-title" style="margin-bottom:10px">가격 변동률 순위 (2025 하반기 → 2026 상반기)</div>
        <div id="dong-list"></div>
      </div>
    </div>
  </div>

  <div class="panel">
    <h2>가격 변동 분석 — 월별 추이 및 동별 변동 이유</h2>
    <div class="two-col" style="align-items:start">
      <div>
        <div class="sub-title">월별 1평당 가격 추이 (분당구 전체)</div>
        <div id="trend-chart"></div>
      </div>
      <div>
        <div class="sub-title">권역별 분위기</div>
        <div id="cluster-summary"></div>
      </div>
    </div>
    <div style="margin-top:16px">
      <div class="sub-title">동별 가격 변동 이유</div>
      <div id="reason-tags" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:6px;margin-top:8px"></div>
    </div>
  </div>

  <div class="panel">
    <h2>이 달의 주목 거래 — 같은 동 평균보다 가장 많이 오른/내린 단지</h2>
    <table>
      <thead>
        <tr>
          <th>동</th>
          <th>단지명</th>
          <th>가격 변동률</th>
          <th>동 평균 변동률</th>
          <th>동 평균 대비 차이</th>
          <th>거래 건수</th>
        </tr>
      </thead>
      <tbody id="highlight-tbody"></tbody>
    </table>
  </div>

  <div class="panel">
    <h2>주목할 단지 TOP 5 — 가격 대비 가장 저평가된 단지 <span style="font-size:11px;font-weight:400;color:#94a3b8">(점수당 가격이 낮을수록 같은 돈으로 더 좋은 단지)</span></h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>동</th>
          <th>단지명</th>
          <th>종합 평가점수</th>
          <th>1평당 가격</th>
          <th>저평가 지수 ↓</th>
          <th>가격 변동률</th>
          <th>평가 항목별 점수</th>
        </tr>
      </thead>
      <tbody id="notable-tbody"></tbody>
    </table>
  </div>

  <div class="panel">
    <h2>내 집 마련 예산 계산기 <span style="font-size:11px;font-weight:400;color:#94a3b8">(투기과열지구·토지거래허가구역 기준)</span></h2>
    <div class="calc">
      <div class="calc-inputs">
        <label>매매가 슬라이더 (억원)</label>
        <input type="range" id="price-slider" min="5" max="40" step="0.5" value="15">
        <div class="price-display" id="price-display">15.0억원</div>
        <label>또는 직접 입력 (만원)</label>
        <input type="number" class="price-manual" id="price-input" placeholder="예: 150000">
      </div>
      <div class="calc-result">
        <div class="row"><span class="lbl">매매가</span><span class="val" id="r-price">—</span></div>
        <div class="row"><span class="lbl">받을 수 있는 대출</span><span class="val" id="r-loan">—</span></div>
        <div class="row"><span class="lbl">취득세·등기비 등 (약 1.5%)</span><span class="val" id="r-extra">—</span></div>
        <div class="row"><span class="lbl">최소 필요한 내 돈</span><span class="val" id="r-equity">—</span></div>
        <div class="note">
          ※ 집값 15억 이하: 대출 최대 6억 / 15~25억: 최대 4억 / 25억 초과: 최대 2억<br>
          ※ 필요한 내 돈 = 매매가 − 대출한도 + 부대비용(취득세·등기비 약 1.5%)<br>
          ※ 투기과열지구·토지거래허가구역 기준 (2025.10.16~). 은행별 실제 한도 다를 수 있음
        </div>
      </div>
    </div>
  </div>

  <div class="panel">
    <h2>부동산 정책 가이드 — 분당구 기준 (2026년 상반기)</h2>
    <div class="policy-tabs" id="policy-tabs"></div>
    <div class="policy-content" id="policy-content"></div>
  </div>

</div>

<script>
const DATA = __DATA_JSON__;

// ── 유틸 ──────────────────────────────────────────────────────────
function rateBg(r){if(r>=15)return'#15803d';if(r>=10)return'#16a34a';if(r>=5)return'#22c55e';if(r>=0)return'#4ade80';if(r>=-5)return'#f87171';return'#dc2626'}
function rateClass(r){return r>=0?'up':'dn'}
function pct(v){return(v>=0?'+':'')+v.toFixed(1)+'%'}
function won(v){return v.toLocaleString()+'만원'}
function wavg(arr){const t=arr.reduce((s,r)=>s+r.count,0);return t?arr.reduce((s,r)=>s+r.price*r.count,0)/t:null}

// ── 데이터 계산 (기간 필터 기반) ──────────────────────────────────
function computeDongStats(s,e){
  let rows=DATA.monthly_dong||[];
  if(s)rows=rows.filter(r=>r.ym>=s);
  if(e)rows=rows.filter(r=>r.ym<=e);
  const yms=[...new Set(rows.map(r=>r.ym))].sort();
  if(!yms.length)return[];
  const mid=yms[Math.floor(yms.length/2)];
  const yoyMap={};DATA.dongs.forEach(d=>yoyMap[d.name]=d.yoy);
  const map={};
  rows.forEach(r=>{
    if(!map[r.dong])map[r.dong]={f:[],s2:[],all:[]};
    if(r.ym<mid)map[r.dong].f.push(r);else map[r.dong].s2.push(r);
    map[r.dong].all.push(r);
  });
  return Object.entries(map).map(([name,{f,s2,all}])=>{
    const a1=wavg(f),a2=wavg(s2),aAll=wavg(all);
    const rate=(a1&&a2)?+(((a2-a1)/a1)*100).toFixed(1):0;
    return{name,price:Math.round(aAll||0),rate,deals:all.reduce((s,r)=>s+r.count,0),yoy:yoyMap[name]??null};
  }).filter(d=>d.deals>0).sort((a,b)=>b.rate-a.rate);
}

function computeComplexStats(s,e){
  let rows=DATA.monthly_complex||[];
  if(s)rows=rows.filter(r=>r.ym>=s);
  if(e)rows=rows.filter(r=>r.ym<=e);
  const yms=[...new Set(rows.map(r=>r.ym))].sort();
  if(!yms.length)return[];
  const mid=yms[Math.floor(yms.length/2)];
  const map={};
  rows.forEach(r=>{
    const k=r.dong+'|'+r.complex;
    if(!map[k])map[k]={dong:r.dong,complex:r.complex,f:[],s2:[],all:[]};
    if(r.ym<mid)map[k].f.push(r);else map[k].s2.push(r);
    map[k].all.push(r);
  });
  return Object.values(map).map(({dong,complex,f,s2,all})=>{
    const a1=wavg(f),a2=wavg(s2),aAll=wavg(all);
    const rate=(a1&&a2)?+(((a2-a1)/a1)*100).toFixed(1):0;
    return{dong,complex,price:Math.round(aAll||0),rate,count:all.reduce((s,r)=>s+r.count,0)};
  }).filter(c=>c.count>=3);
}

function computeHighlights(dongStats,complexStats){
  const drMap={};dongStats.forEach(d=>drMap[d.name]=d.rate);
  const grp={};
  complexStats.forEach(c=>{if(!grp[c.dong])grp[c.dong]=[];grp[c.dong].push(c);});
  const res=[];
  Object.entries(grp).forEach(([dong,cs])=>{
    const avg=drMap[dong]??0;
    let best=null,maxDev=-1;
    cs.forEach(c=>{const dev=Math.abs(c.rate-avg);if(dev>maxDev){maxDev=dev;best=c;}});
    if(best)res.push({dong,complex:best.complex,rate:best.rate,avg:+avg.toFixed(1),diff:+maxDev.toFixed(1),deals:best.count});
  });
  return res.sort((a,b)=>b.diff-a.diff);
}

function computeNotable(complexStats,topN){
  topN=topN||5;
  const scores=DATA.complex_scores||{};
  return complexStats.map(c=>{
    const k=c.dong+'_'+c.complex,m=scores[k];
    if(!m||!c.price)return null;
    return{dong:c.dong,complex:c.complex,score:m.score,price:c.price,rate:c.rate,
           ratio:+(c.price/m.score).toFixed(1),scores:m.scores,deals:c.count};
  }).filter(Boolean).sort((a,b)=>a.ratio-b.ratio).slice(0,topN);
}

// ── 렌더링 함수 ──────────────────────────────────────────────────
function renderCards(dongs,monthly){
  const totCnt=monthly.reduce((s,m)=>s+m.count,0);
  const avgPrice=totCnt?Math.round(monthly.reduce((s,m)=>s+m.price*m.count,0)/totCnt):0;
  const best=dongs.length?dongs.reduce((a,b)=>b.rate>a.rate?b:a):null;
  document.getElementById('card-total').textContent=totCnt.toLocaleString()+'건';
  document.getElementById('card-avg').textContent=avgPrice.toLocaleString()+'만원';
  if(best){document.getElementById('card-best').textContent=best.name+' '+pct(best.rate);}
  const s=document.getElementById('g-start')?.value||'';
  const e=document.getElementById('g-end')?.value||'';
  document.getElementById('card-period').textContent=(s&&e)?`${s} ~ ${e}`:'2025.06~2026.06';
}

function renderDongMap(dongs){
  const W=385,H=500;
  const POS={"정자동":[80,80],"수내동":[104,160],"서현동":[192,98],"이매동":[258,118],"야탑동":[310,80],"분당동":[188,178],"구미동":[252,184],"금곡동":[310,174],"운중동":[92,302],"판교동":[142,350],"삼평동":[218,334],"백현동":[280,312],"대장동":[60,432]};
  const OUTLINE="M 42,50 L 192,28 L 332,40 L 352,185 L 316,374 L 248,454 L 158,454 L 80,426 L 22,462 L 20,382 L 40,248 Z";
  const dm={};dongs.forEach(d=>dm[d.name]=d);
  const deals=dongs.map(d=>d.deals);
  const maxD=Math.max(...deals)||1,minD=Math.min(...deals)||0;
  const R=n=>20+((n-minD)/((maxD-minD)||1))*36;
  let svg=`<svg viewBox="0 0 ${W} ${H}" font-family="'Segoe UI',Malgun Gothic,sans-serif" style="width:100%">`;
  svg+=`<path d="${OUTLINE}" fill="#edf2f7" stroke="#b0bec5" stroke-width="2"/>`;
  svg+=`<clipPath id="bc"><path d="${OUTLINE}"/></clipPath><g clip-path="url(#bc)">`;
  for(let x=80;x<W-10;x+=80)svg+=`<line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#d1dbe8" stroke-width="0.8" stroke-dasharray="4,6"/>`;
  for(let y=80;y<H;y+=80)svg+=`<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#d1dbe8" stroke-width="0.8" stroke-dasharray="4,6"/>`;
  svg+=`</g><path d="${OUTLINE}" fill="none" stroke="#8da5c0" stroke-width="1.8"/>`;
  const entries=Object.entries(POS).filter(([n])=>dm[n]).sort(([a],[b])=>dm[b].deals-dm[a].deals);
  entries.forEach(([n,[cx,cy]])=>{const r=R(dm[n].deals);svg+=`<circle cx="${cx+2}" cy="${cy+2}" r="${r}" fill="rgba(0,0,0,0.07)"/>`;});
  entries.forEach(([n,[cx,cy]])=>{
    const d=dm[n],r=R(d.deals);
    svg+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${rateBg(d.rate)}" opacity="0.85"/>`;
    svg+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(255,255,255,0.55)" stroke-width="1.5"/>`;
    svg+=`<text x="${cx}" y="${cy-1}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#1e293b" paint-order="stroke" stroke="#fff" stroke-width="2.5">${n}</text>`;
    svg+=`<text x="${cx}" y="${cy+12}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#fff">${pct(d.rate)}</text>`;
    if(d.yoy!=null)svg+=`<text x="${cx}" y="${cy+23}" text-anchor="middle" font-size="8.5" fill="rgba(255,255,255,0.88)">전년비 ${pct(d.yoy)}</text>`;
  });
  const LGD=[[-10,'#dc2626'],[0,'#86efac'],[10,'#22c55e'],[20,'#16a34a'],[28,'#14532d']];
  LGD.forEach(([v,c],i)=>{const lx=42+i*66;svg+=`<circle cx="${lx}" cy="${H-22}" r="8" fill="${c}" opacity="0.85"/>`;svg+=`<text x="${lx}" y="${H-10}" text-anchor="middle" font-size="8.5" fill="#64748b">${v>=0?'+':''}${v}%</text>`;});
  svg+=`<text x="42" y="${H-42}" font-size="9" fill="#94a3b8">원 크기 = 거래건수  |  색상 = 기간 내 변동률</text>`;
  document.getElementById('dong-map').innerHTML=svg+'</svg>';
}

function renderDongList(dongs){
  const sorted=[...dongs].sort((a,b)=>b.rate-a.rate);
  const maxAbs=Math.max(...sorted.map(d=>Math.abs(d.rate)))||1;
  let html='<table style="width:100%;font-size:13px;border-collapse:collapse">';
  html+=`<tr style="background:#f8fafc">
    <th style="text-align:center;padding:10px 8px;font-size:11px;font-weight:600;color:#64748b;border-bottom:2px solid #e2e8f0;width:26px">#</th>
    <th style="text-align:left;padding:10px 10px;font-size:11px;font-weight:600;color:#64748b;border-bottom:2px solid #e2e8f0;white-space:nowrap">동</th>
    <th style="text-align:left;padding:10px 10px;font-size:11px;font-weight:600;color:#64748b;border-bottom:2px solid #e2e8f0">가격 변동률</th>
    <th style="text-align:right;padding:10px 10px;font-size:11px;font-weight:600;color:#64748b;border-bottom:2px solid #e2e8f0;white-space:nowrap">1평당가</th>
    <th style="text-align:right;padding:10px 10px;font-size:11px;font-weight:600;color:#7c3aed;border-bottom:2px solid #e2e8f0;white-space:nowrap">작년비</th>
    <th style="text-align:right;padding:10px 8px;font-size:11px;font-weight:600;color:#64748b;border-bottom:2px solid #e2e8f0;white-space:nowrap">거래</th>
  </tr>`;
  sorted.forEach((d,i)=>{
    const yoyHtml=(d.yoy!=null)?`<span style="color:${d.yoy>=0?'#7c3aed':'#dc2626'};font-weight:700">${pct(d.yoy)}</span>`:'<span style="color:#94a3b8">—</span>';
    const barW=Math.round(Math.abs(d.rate)/maxAbs*110);
    const barColor=d.rate>=0?'#22c55e':'#ef4444';
    const bar=`<div style="display:flex;align-items:center;gap:8px"><div style="background:#f1f5f9;border-radius:3px;width:110px;height:8px;overflow:hidden;flex-shrink:0"><div style="background:${barColor};width:${barW}px;height:100%;border-radius:3px"></div></div><span class="badge ${rateClass(d.rate)}" style="white-space:nowrap">${pct(d.rate)}</span></div>`;
    html+=`<tr>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:center;color:#94a3b8;font-size:11px;font-weight:700">${i+1}</td>
      <td style="padding:10px 10px;border-bottom:1px solid #f1f5f9;font-weight:700;color:#334155">${d.name}</td>
      <td style="padding:10px 10px;border-bottom:1px solid #f1f5f9">${bar}</td>
      <td style="padding:10px 10px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:12px;color:#475569">${(d.price/10000).toFixed(1)}억</td>
      <td style="padding:10px 10px;border-bottom:1px solid #f1f5f9;text-align:right">${yoyHtml}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f1f5f9;text-align:right;color:#94a3b8;font-size:11px">${d.deals}</td>
    </tr>`;
  });
  const avg=sorted.length?+(sorted.reduce((s,d)=>s+d.rate,0)/sorted.length).toFixed(1):0;
  html+=`<tr style="background:#f8fafc">
    <td colspan="2" style="padding:10px 10px;font-size:11px;color:#64748b;font-weight:700">분당구 전체 평균</td>
    <td style="padding:10px 10px"><span class="badge ${rateClass(avg)}">${pct(avg)}</span></td>
    <td colspan="3" style="padding:10px 10px;font-size:10px;color:#94a3b8;text-align:right">총 ${sorted.length}개 동 · 전·후반기 평균가 비교</td>
  </tr>`;
  document.getElementById('dong-list').innerHTML=html+'</table>';
}

function renderHighlight(highlights){
  const tbody=document.getElementById('highlight-tbody');
  tbody.innerHTML='';
  if(!highlights.length){tbody.innerHTML='<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:20px">선택한 기간에 데이터가 부족합니다.</td></tr>';return;}
  highlights.forEach(h=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td><strong>${h.dong}</strong></td><td>${h.complex}</td><td><span class="badge ${rateClass(h.rate)}">${pct(h.rate)}</span></td><td class="${rateClass(h.avg)}">${pct(h.avg)}</td><td style="color:#7c3aed;font-weight:700">${h.diff.toFixed(1)}%p</td><td style="color:#64748b">${h.deals}건</td>`;
    tbody.appendChild(tr);
  });
}

function renderNotable(notable){
  const tbody=document.getElementById('notable-tbody');
  tbody.innerHTML='';
  if(!notable.length){tbody.innerHTML='<tr><td colspan="8" style="text-align:center;color:#94a3b8;padding:20px">선택한 기간에 데이터가 부족합니다.</td></tr>';return;}
  const SM=[{key:'입지',max:40,color:'#2563eb'},{key:'학군',max:15,color:'#7c3aed'},{key:'평형',max:20,color:'#0891b2'},{key:'재건축',max:10,color:'#d97706'},{key:'단지규모',max:10,color:'#16a34a'},{key:'조망',max:5,color:'#64748b'}];
  notable.forEach((n,i)=>{
    const tr=document.createElement('tr');
    const bar=`<div style="display:flex;align-items:center;gap:6px"><div style="background:#e2e8f0;border-radius:3px;width:50px;height:7px;overflow:hidden"><div style="background:#2563eb;width:${n.score}%;height:100%"></div></div><span style="font-weight:700">${n.score}점</span></div>`;
    const sh=SM.map(({key,max,color})=>{const v=(n.scores&&n.scores[key]!=null)?n.scores[key]:0,bw=Math.round(v/max*100);return`<div style="display:flex;align-items:center;gap:4px"><span style="font-size:10px;color:#64748b;min-width:46px;white-space:nowrap">${key}(${max})</span><div style="background:#e2e8f0;border-radius:2px;width:52px;height:6px;overflow:hidden;flex-shrink:0"><div style="background:${color};width:${bw}%;height:100%"></div></div><span style="font-size:10px;font-weight:700;color:${color};min-width:16px;text-align:right">${v}</span></div>`;}).join('');
    tr.innerHTML=`<td style="color:#64748b;font-weight:700">${i+1}</td><td>${n.dong}</td><td><strong>${n.complex}</strong></td><td>${bar}</td><td>${won(n.price)}</td><td style="color:#7c3aed;font-weight:800">${n.ratio.toFixed(1)}</td><td><span class="badge ${rateClass(n.rate)}">${pct(n.rate)}</span></td><td><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px 12px">${sh}</div></td>`;
    tbody.appendChild(tr);
  });
}

function renderCluster(dongs){
  const clusters={'판교권':['삼평동','백현동','판교동'],'구분당':['정자동','서현동','수내동','분당동','구미동'],'외곽':['이매동','야탑동','금곡동','운중동','대장동']};
  const desc={'판교권':'IT 기업 집적 · 판교테크노밸리 수요','구분당':'재건축 기대 · 우수 학군 선호','외곽':'상대적 저평가 · 교통 개선 기대'};
  const rm={};dongs.forEach(d=>rm[d.name]=d.rate);
  const el=document.getElementById('cluster-summary');el.innerHTML='';
  Object.entries(clusters).forEach(([name,ds])=>{
    const rates=ds.map(d=>rm[d]).filter(r=>r!=null);
    const avg=rates.length?rates.reduce((a,b)=>a+b,0)/rates.length:0;
    const div=document.createElement('div');div.className='cluster-card';
    div.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:start"><div><div class="cluster-name">${name}</div><div class="cluster-dongs">${ds.join(' · ')}</div><div style="font-size:11px;color:#94a3b8;margin-top:3px">${desc[name]||''}</div></div><div class="cluster-rate ${rateClass(avg)}">${pct(avg)}</div></div>`;
    el.appendChild(div);
  });
}

function buildTrendChart(filterStart,filterEnd){
  let data=DATA.monthly||[];
  if(!data.length)return;
  if(filterStart)data=data.filter(d=>d.ym>=filterStart);
  if(filterEnd)data=data.filter(d=>d.ym<=filterEnd);
  const el=document.getElementById('trend-chart');
  if(data.length<2){el.innerHTML='<p style="color:#94a3b8;font-size:12px;padding:16px 0">선택한 기간에 데이터가 부족합니다.</p>';return;}
  const W=490,H=155,PL=72,PR=16,PT=14,PB=36,CW=W-PL-PR,CH=H-PT-PB;
  const prices=data.map(d=>d.price);
  const mn=Math.min(...prices)*0.97,mx=Math.max(...prices)*1.03;
  const px=i=>PL+i*(data.length>1?CW/(data.length-1):0);
  const py=v=>PT+CH-(v-mn)/(mx-mn)*CH;
  const yTicks=[mn,mn+(mx-mn)/2,mx];
  let svg=`<svg viewBox="0 0 ${W} ${H}" font-family="'Segoe UI',Malgun Gothic,sans-serif" style="width:100%">`;
  svg+=`<defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#2563eb" stop-opacity=".18"/><stop offset="100%" stop-color="#2563eb" stop-opacity="0"/></linearGradient></defs>`;
  yTicks.forEach(v=>{const y=py(v).toFixed(1);svg+=`<line x1="${PL}" y1="${y}" x2="${W-PR}" y2="${y}" stroke="#e2e8f0" stroke-width="0.8"/>`;svg+=`<text x="${PL-4}" y="${parseFloat(y)+3}" text-anchor="end" font-size="9" fill="#94a3b8">${(v/10000).toFixed(1)}억</text>`;});
  const area=`M${PL},${PT+CH} `+data.map((d,i)=>`L${px(i).toFixed(1)},${py(d.price).toFixed(1)}`).join(' ')+` L${px(data.length-1).toFixed(1)},${PT+CH} Z`;
  const path=data.map((d,i)=>`${i?'L':'M'}${px(i).toFixed(1)},${py(d.price).toFixed(1)}`).join(' ');
  svg+=`<path d="${area}" fill="url(#tg)"/>`;
  svg+=`<path d="${path}" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-linejoin="round"/>`;
  const step=data.length>10?Math.ceil(data.length/8):1;
  data.forEach((d,i)=>{
    const cx=px(i).toFixed(1),cy=py(d.price).toFixed(1);
    svg+=`<circle cx="${cx}" cy="${cy}" r="3.5" fill="#2563eb"/>`;
    if(i%step===0||i===data.length-1)svg+=`<text x="${cx}" y="${H-5}" text-anchor="middle" font-size="9" fill="#94a3b8">${d.ym.replace(/^20/,'')}</text>`;
    if(i===0||i===data.length-1){const side=i===0?'start':'end',ox=i===0?6:-6;svg+=`<text x="${(parseFloat(cx)+ox).toFixed(1)}" y="${(parseFloat(cy)-8).toFixed(1)}" text-anchor="${side}" font-size="10" font-weight="700" fill="#2563eb">${(d.price/10000).toFixed(1)}억</text>`;}
  });
  el.innerHTML=svg+'</svg>';
}

function updateFilterNote(s,e){
  const note=document.getElementById('filter-note');
  if(!note)return;
  const allYms=(DATA.monthly_dong||[]).map(r=>r.ym);
  const first=allYms[0],last=allYms[allYms.length-1];
  if(s&&e&&(s!==first||e!==last)){note.textContent=`${s} ~ ${e}`;note.style.background='#fef9c3';note.style.color='#713f12';}
  else{note.textContent='전체 기간';note.style.background='#eff6ff';note.style.color='#2563eb';}
}

// ── 전체 재렌더 ────────────────────────────────────────────────
function renderAll(s,e){
  const dongs=computeDongStats(s,e);
  const complexes=computeComplexStats(s,e);
  const monthly=DATA.monthly.filter(m=>(!s||m.ym>=s)&&(!e||m.ym<=e));
  renderCards(dongs,monthly);
  renderDongMap(dongs);
  renderDongList(dongs);
  renderHighlight(computeHighlights(dongs,complexes));
  renderNotable(computeNotable(complexes));
  renderCluster(dongs);
  buildTrendChart(s,e);
  updateFilterNote(s,e);
}

// ── 정적 섹션 (필터 무관) ──────────────────────────────────────
(function(){
  const el=document.getElementById('reason-tags');
  [...DATA.reasons].sort((a,b)=>b.rate-a.rate).forEach(r=>{
    const div=document.createElement('div');div.className='reason-row';
    div.innerHTML=`<span style="min-width:54px;font-size:13px;font-weight:700;color:#334155">${r.dong}</span><span class="badge ${rateClass(r.rate)}">${pct(r.rate)}</span><span style="color:#94a3b8;font-size:11px">${r.age}년</span><div style="flex:1">${r.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>`;
    el.appendChild(div);
  });
})();

// ── 대출 계산기 ────────────────────────────────────────────────
function calcLoan(priceMan){
  if(!priceMan||priceMan<=0)return;
  const eok=priceMan/10000;
  const loan=eok<=15?60000:eok<=25?40000:20000;
  const extra=Math.round(priceMan*0.015);
  document.getElementById('r-price').textContent=won(priceMan);
  document.getElementById('r-loan').textContent=won(loan);
  document.getElementById('r-extra').textContent=won(extra);
  document.getElementById('r-equity').textContent=won(priceMan-loan+extra);
}
const slider=document.getElementById('price-slider'),display=document.getElementById('price-display'),manual=document.getElementById('price-input');
slider.addEventListener('input',()=>{const eok=parseFloat(slider.value);display.textContent=eok.toFixed(1)+'억원';manual.value='';calcLoan(Math.round(eok*10000));});
manual.addEventListener('input',()=>{const man=parseInt(manual.value,10);if(man>0){const eok=man/10000;display.textContent=eok.toFixed(1)+'억원';slider.value=Math.min(Math.max(eok,5),40);calcLoan(man);}});
calcLoan(150000);

// ── 정책 가이드 ────────────────────────────────────────────────────
(function buildPolicyGuide() {
  const P={
    '청약':{t:'청약정책 (분당구 = 투기과열지구)',items:[
      {h:'1순위 청약 조건',p:'청약통장 가입 24개월 이상 + 집 없는 세대구성원. 85㎡ 이하는 가점제 75% 적용 (가점이 높을수록 유리)'},
      {h:'재당첨 제한',p:'투기과열지구에서 당첨되면 10년간 다른 청약에 당첨될 수 없음'},
      {h:'특별공급 비율',p:'신혼부부 25% / 생애최초 구매자 15% / 다자녀 10% / 노부모 부양 3% / 기관추천 7%'},
    ],a:'분당구 전역 투기과열지구(정부가 집값 안정을 위해 규제를 강화한 지역) — 2025.10.16 재지정. 청약홈(applyhome.co.kr) 공식 안내 필수'},
    '대출':{t:'대출정책 (투기과열지구 기준)',items:[
      {h:'집값 대비 대출 비율(LTV)',p:'집 없는 분 50% / 1주택자 처분 조건부 40% / 다주택자 0%'},
      {h:'소득 대비 전체 대출 한도(DSR)',p:'매달 내는 모든 대출 원리금 합계가 연소득의 40% 이내 — 2025.09부터 강화된 기준 적용'},
      {h:'15억 초과 집은 대출 불가',p:'주택담보대출 자체가 불가능. 분당구 주요 단지 상당수 해당'},
      {h:'실제 대출 한도 요약',p:'집값 15억 이하 → 최대 6억 / 15~25억 → 최대 4억 / 25억 초과 → 최대 2억'},
    ],a:'금리·한도는 은행마다 다름. 대출 실행 전 반드시 해당 금융기관에서 직접 확인하세요'},
    '세금':{t:'세금 안내 (2026년 기준)',items:[
      {h:'살 때 내는 세금 (취득세)',p:'1주택: 집값 6억 이하 1% / 6~9억 1~3% / 9억 초과 3% | 2주택 8% / 3주택 이상 12%'},
      {h:'팔 때 내는 세금 (양도소득세)',p:'1세대 1주택 비과세: 2년 보유 + 2년 거주 (분당구 기준). 집값 12억까지 세금 없음'},
      {h:'매년 내는 세금 (종합부동산세)',p:'1주택자 12억 공제 / 그 외 9억 공제. 과세 기준 초과분에 0.5~2.7% 세율'},
      {h:'오래 보유·거주 시 세금 혜택',p:'10년 이상 보유 + 실거주 시 양도세 최대 80% 감면 (1주택 실거주자)'},
    ],a:'취득세 중과 한시 배제 여부는 계약 시점에 따라 다름 — 계약 전 반드시 세무사 확인 필수'},
    '공급':{t:'새 아파트 공급 정책 (분당 재정비)',items:[
      {h:'1기 신도시 특별법',p:'2024.12 시행. 분당을 선도지구로 지정 추진 — 용적률 완화와 재건축 규제 특례 적용'},
      {h:'재건축 안전진단 면제',p:'준공 30년 이상 단지는 안전진단 없이 재건축 추진 가능. 분당 1991~1996년 입주 단지 해당'},
      {h:'선도지구 현황',p:'야탑동 매화마을·정자동 한솔마을 등 1단계 선도지구 지정 추진 (2025년)'},
      {h:'신규 공급량',p:'성남시 분당구 기준 연 1,500~2,000세대 새 아파트 공급 예정'},
    ],a:'재건축 선도지구로 지정된 단지는 사업 속도에 따라 가격 프리미엄 차이 날 수 있음'},
    '임대':{t:'전·월세 관련 정책',items:[
      {h:'임대차 3법',p:'계약 갱신 청구권(최대 2+2년 거주) / 전·월세 인상 상한 5% / 전·월세 계약 의무 신고 유지'},
      {h:'임대사업자 규정',p:'아파트 단기임대(4년) 폐지 — 장기(10년)만 신규 등록 가능. 의무기간 중 마음대로 팔 수 없음'},
      {h:'전세사기 피해자 지원',p:'경매 낙찰금 우선 변제 · 공공임대 우선 공급 · 긴급 주거 지원 (전세사기피해자법)'},
      {h:'분당구 전세 참고 시세',p:'전용 84㎡ 기준: 정자·서현동 6~8억 / 수내·구미동 5~7억 / 판교권 8~10억 (2026년 상반기)'},
    ],a:'전·월세 계약 미신고 시 과태료 부과 (2024.6~). 확정일자는 정부24 또는 주민센터에서 무료로 받을 수 있음'},
    '동향':{t:'최근 주요 정책 변화 (2025~2026)',items:[
      {h:'투기과열지구 재지정 (2025.10.16)',p:'분당구 전역 포함. 대출 한도 축소·청약 규제 강화·전매 제한 10년 재적용'},
      {h:'대출 규제 강화 (2025.09)',p:'변동금리 대출에 1.5%p 추가 가산 → 실질 대출 한도 10~15% 줄어듦'},
      {h:'토지거래허가구역',p:'강남 3구+용산 계속 유지. 분당구 일부(판교권 등) 추가 지정 논의 중 — 동향 주시 필요'},
      {h:'1기 신도시 재정비 일정',p:'2025 선도지구 지정 → 2026 사업시행인가 목표 → 실제 이주·착공은 2027년 이후 예상'},
      {h:'대출 더 조여질 수 있음',p:'정부가 가계부채 관리를 강화하는 추세 — 추가 대출 규제 가능성 있음'},
    ],a:'부동산 정책은 수시로 바뀝니다. 매입·청약 전 국토교통부(molit.go.kr) 공식 공지를 반드시 확인하세요'},
  };
  const keys=Object.keys(P);
  const tabs=document.getElementById('policy-tabs');
  const content=document.getElementById('policy-content');
  function show(k){
    tabs.querySelectorAll('.ptab').forEach(t=>t.classList.toggle('active',t.dataset.k===k));
    const d=P[k];
    content.innerHTML=`<div class="policy-title">${d.t}</div>`+
      d.items.map(it=>`<div class="policy-item"><h3>${it.h}</h3><p>${it.p}</p></div>`).join('')+
      `<div class="policy-alert">⚠ ${d.a}</div>`;
  }
  const lblMap={'청약':'청약정책','대출':'대출·한도','세금':'세금안내','공급':'새 아파트','임대':'전·월세','동향':'최근동향'};
  keys.forEach((k,i)=>{
    const btn=document.createElement('button');btn.className='ptab'+(i===0?' active':'');btn.dataset.k=k;
    btn.textContent=lblMap[k]||k;btn.onclick=()=>show(k);tabs.appendChild(btn);
  });
  show(keys[0]);
})();

// ── 기간 필터 초기화 + 최초 렌더 ─────────────────────────────────
(function initFilter(){
  const allYms=[...new Set((DATA.monthly_dong||[]).map(r=>r.ym))].sort();
  if(!allYms.length){renderAll('','');return;}
  const gs=document.getElementById('g-start'),ge=document.getElementById('g-end');
  allYms.forEach(ym=>{gs.appendChild(new Option(ym,ym));ge.appendChild(new Option(ym,ym));});
  ge.selectedIndex=allYms.length-1;
  const onChange=()=>renderAll(gs.value,ge.value);
  gs.onchange=onChange;ge.onchange=onChange;
  window.resetFilter=()=>{gs.selectedIndex=0;ge.selectedIndex=allYms.length-1;renderAll(allYms[0],allYms[allYms.length-1]);};
  renderAll(allYms[0],allYms[allYms.length-1]);
})();
</script>
</body>
</html>
"""


def main():
    parser = argparse.ArgumentParser(description="분당구 아파트 주간 대시보드 HTML 생성기")
    parser.add_argument(
        "--data", default=os.path.join(BASE_DIR, "data"),
        help="CSV 폴더 경로 (기본: data/)"
    )
    parser.add_argument(
        "--output", default=OUTPUT_DIR,
        help="HTML 저장 폴더 (기본: output/)"
    )
    parser.add_argument(
        "--min-deals", type=int, default=5,
        help="주목할 단지 최소 거래건수 (기본: 5)"
    )
    parser.add_argument(
        "--top-n", type=int, default=5,
        help="주목할 단지 TOP N (기본: 5)"
    )
    args = parser.parse_args()

    results     = run_analysis(args.data, args.min_deals, args.top_n)
    report_date = datetime.now().strftime("%Y-%m-%d")
    html        = _build_html(results, report_date)

    os.makedirs(args.output, exist_ok=True)
    out_path = os.path.join(args.output, f"dashboard_{report_date}.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"\n[완료] 대시보드 저장 → {out_path}")
    return out_path


if __name__ == "__main__":
    main()
