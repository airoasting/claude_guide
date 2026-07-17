// icon-source 아이콘(.tsx) → 정적 SVG 갤러리(icon-gallery.html) · 뉴모피즘(AI ROASTING) 스타일
// 클로드 가이드의 component-gallery.html 포맷을 그대로 가져온다:
//   오렌지 그라데이션 헤더 + 스티키 서브메뉴(스크롤 스파이) + 뉴모피즘 카드
//   + 알약형 카테고리 구분선 + 검색/인기태그. 카드를 누르면 SVG 코드가 복사된다.
// 아이콘 추출·분류·정렬·라벨 로직은 icon-data.mjs 단일 출처. 이 파일은 HTML 렌더만.
// 사용법: node build-icon-gallery.mjs
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { collectItems, CATEGORIES } from "./icon-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
// 이 소스 폴더는 docs/icon-gallery-src/ 안에 있고, 산출물은 그 상위(docs)로 내보낸다.
const OUT = join(__dirname, "..", "icon-gallery.html");

const { items, counts, failed } = collectItems();

// ── 카테고리 색 시스템 (OKLCH 단일 스케일) ──
// 밝기(L)와 채도(C)를 고정하고 색상(H)만 돌린다 → 11색이 한 가족으로 보인다.
//  · tint   = 설명 영역 배경. 아주 옅은 워시(L 0.965). 300장이 깔려도 차분하다.
//  · strong = 슬러그·구분선 알약·서브메뉴 번호. 같은 채도의 주얼톤(L 0.55).
// 색상은 스펙트럼에 고르게 배치해 인접 카테고리끼리 헷갈리지 않게 했다.
const CATS = CATEGORIES.filter((c) => c.key !== "all");
const SHORT = {
  arrow: "화살표", ui: "편집·UI", brand: "브랜드", comm: "소통", people: "사람",
  media: "미디어", commerce: "쇼핑·금융", network: "연결", data: "데이터",
  life: "생활", symbol: "기호",
};
const HUES = {
  arrow: 248, ui: 292, brand: 28, comm: 158, people: 50,
  media: 336, commerce: 95, network: 196, data: 224, life: 132, symbol: 250,
};
const THEME = Object.fromEntries(
  Object.entries(HUES).map(([k, h]) => {
    const neutral = k === "symbol";
    const ct = neutral ? 0.005 : 0.038; // 틴트 채도(옅게)
    const cs = neutral ? 0.010 : 0.108; // 강조 채도(주얼톤)
    return [k, {
      tint: `oklch(0.965 ${ct} ${h})`,
      strong: `oklch(0.55 ${cs} ${h})`,
      short: SHORT[k],
    }];
  }),
);

// 인기 태그(검색어). 클릭하면 검색창에 넣어 필터.
const POPULAR_TAGS = [
  { term: "화살표", cat: "arrow" },
  { term: "복사", cat: "ui" },
  { term: "사용자", cat: "people" },
  { term: "하트", cat: "people" },
  { term: "naver", cat: "brand" },
  { term: "kakao", cat: "brand" },
  { term: "체크", cat: "symbol" },
  { term: "차트", cat: "data" },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// ── 카테고리별 CSS ──
// 카드 자체엔 색을 넣지 않는다(설명 영역은 중립색). 카테고리 색은 길찾기 요소에만:
//  · 섹션 구분선 알약(제목/카운트)
//  · 서브메뉴 번호 원
const catCss = CATS.map((c, i) => {
  const t = THEME[c.key];
  return (
    `#sec-${c.key} .cat-sub, #sec-${c.key} .cat-count-n{ color:${t.strong}; }\n` +
    `  #sec-${c.key} .cat-count{ background:${t.strong}; color:#fff; }\n` +
    `  .sm-item[data-sec="${c.key}"] .sm-num{ background:${t.strong}; }`
  );
}).join("\n  ");

// ── 서브메뉴(카테고리 점프 + 스크롤 스파이) ──
const subMenu = CATS.map(
  (c, i) =>
    `    <a href="#sec-${c.key}" class="sm-item${i === 0 ? " active" : ""}" data-sec="${c.key}">\n` +
    `      <span class="sm-num">${i + 1}</span>\n` +
    `      <span class="sm-title">${THEME[c.key].short}</span>\n` +
    `      <span class="sm-sub">${c.label} <span class="sm-count">(${counts[c.key] || 0})</span></span>\n` +
    `    </a>`,
).join("\n");

// ── 인기 태그 ──
const popularTags = POPULAR_TAGS.map(
  (t) =>
    `      <a class="popular-tag" data-term="${esc(t.term)}"><span class="tag-dot" style="background:${THEME[t.cat].strong}"></span>${esc(t.term)}</a>`,
).join("\n");

// ── 카테고리 섹션(구분선 + 카드 그리드) ──
const sections = CATS.map((c) => {
  const catItems = items.filter((it) => it.cat === c.key);
  const cards = catItems
    .map(
      (it) =>
        `        <button class="comp-card" data-cat="${it.cat}" data-keywords="${esc(it.name)} ${esc(it.ko)}" title="클릭하면 SVG 복사: ${esc(it.ko)} (${it.name})" onclick="copyIcon(this)">\n` +
        `          <div class="cp-wrap"><span class="cp-ico">${it.svg}</span></div>\n` +
        `          <div class="comp-body">\n` +
        `            <span class="comp-name">${esc(it.ko)}</span>\n` +
        `            <span class="comp-slug">${esc(it.name)}</span>\n` +
        `            <span class="comp-copy"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>SVG 복사</span>\n` +
        `          </div>\n` +
        `        </button>`,
    )
    .join("\n");
  return (
    `    <div class="cat-label" id="sec-${c.key}">\n` +
    `      <div class="cat-pill">\n` +
    `        <span class="cat-sub">${c.label}</span>\n` +
    `        <span class="cat-count"><span class="cat-count-n">${counts[c.key] || 0}</span></span>\n` +
    `      </div>\n` +
    `    </div>\n` +
    `    <div class="comp-list" data-section="sec-${c.key}">\n${cards}\n    </div>`
  );
}).join("\n\n");

console.log(
  "카테고리 분포:",
  CATS.map((c) => `${THEME[c.key].short} ${counts[c.key] || 0}`).join(" · "),
);

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<link rel="icon" type="image/png" href="assets/logos/logo1-transparent.png" />
<link rel="apple-touch-icon" href="assets/logos/logo1-transparent.png" />
<title>SVG 아이콘 갤러리 ${items.length} | AI ROASTING</title>
<style>
  /* 폰트: 클로드 가이드 다른 페이지(component-gallery 등)와 동일하게 로컬 Pretendard 사용 */
  @font-face {
    font-family: 'Pretendard';
    src: url('assets/fonts/PretendardVariable.ttf') format('truetype');
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }
  :root{
    --nm-bg:#EDEAE4; --nm-dark:#CECAC3; --nm-light:#FFFFFF;
    --nm-shadow:6px 6px 14px #CECAC3, -6px -6px 14px #FFFFFF;
    --nm-shadow-sm:4px 4px 8px #CECAC3, -4px -4px 8px #FFFFFF;
    --nm-inset:inset 4px 4px 10px #CECAC3, inset -4px -4px 10px #FFFFFF;
    --ant-orange:#D97757; --ant-dark:#1A1917;
    --sans:'Pretendard','Helvetica Neue',Arial,-apple-system,system-ui,sans-serif;
    --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
  }
  *{ margin:0; padding:0; box-sizing:border-box; }
  html{ scroll-behavior:smooth; }
  body{ word-break:keep-all; font-family:var(--sans); background:var(--nm-bg);
        color:#3A3530; line-height:1.7; -webkit-font-smoothing:antialiased; }

  /* ── Header (클로드 가이드 component-gallery.html 와 동일) ── */
  header{ background:linear-gradient(150deg,#B35535 0%,#A04828 35%,#7A2E15 100%);
          padding:28px 40px 40px; border-radius:0 0 32px 32px; text-align:center;
          position:relative; overflow:hidden; isolation:isolate; }
  header::before{ content:''; position:absolute; top:-80px; right:-40px; width:400px; height:400px;
          background:radial-gradient(circle,rgba(196,98,63,.18) 0%,transparent 60%); pointer-events:none; }
  /* 헤더 배경 루프 영상 (원래 색 위에 빛의 움직임만 얹는다) */
  .hero-video{ position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
          object-position:center; z-index:-1; opacity:.6;
          filter:grayscale(1) contrast(1.05) brightness(1.08); mix-blend-mode:soft-light;
          pointer-events:none; border-radius:inherit; }
  @media (prefers-reduced-motion: reduce){ .hero-video{ display:none; } }
  .back-link{ display:inline-block; color:rgba(255,255,255,.65); text-decoration:none;
          font-size:14px; font-weight:600; margin-bottom:20px; transition:color .2s;
          position:relative; z-index:1; }
  .back-link:hover{ color:#fff; }
  header h1{ font-size:44px; font-weight:800; color:#fff; text-shadow:0 2px 8px rgba(0,0,0,.15);
          letter-spacing:-1px; margin-bottom:8px; position:relative; z-index:1; }
  header p{ font-size:16px; color:rgba(255,255,255,.8); position:relative; z-index:1;
          text-shadow:0 1px 4px rgba(0,0,0,.1); }
  .header-pages{ max-width:700px; margin:22px auto 0; display:flex; justify-content:center;
          gap:14px; position:relative; z-index:1; }
  .header-page-link{ flex:1 1 0; min-width:0; max-width:280px; gap:8px; font-size:14px;
          padding:12px 22px; border-radius:16px; display:flex; align-items:center; justify-content:center;
          text-decoration:none; color:rgba(255,255,255,.7); font-weight:700;
          background:rgba(255,255,255,.07);
          box-shadow:5px 5px 12px rgba(0,0,0,.35), -5px -5px 12px rgba(255,255,255,.06);
          transition:all .25s; white-space:nowrap; }
  .header-page-link:hover{ background:rgba(255,255,255,.13); color:#fff; transform:translateY(-1px); }
  .header-page-link.active{ background:rgba(255,255,255,.14); color:#fff;
          box-shadow:inset 3px 3px 8px rgba(0,0,0,.35), inset -3px -3px 8px rgba(255,255,255,.06); }

  /* ── Sub Menu (sticky, scroll-spy) ── */
  .sub-menu{ position:sticky; top:0; z-index:100; background:#F0EDE8;
          box-shadow:0 4px 16px rgba(0,0,0,.06); border-bottom:1px solid #E0DDD7;
          border-radius:0 0 32px 32px; padding:12px 12px; display:flex; justify-content:flex-start;
          gap:0; overflow-x:auto; scrollbar-width:none; }
  .sub-menu::-webkit-scrollbar{ display:none; }
  .sm-inner{ display:flex; gap:0; margin:0 auto; }
  .sm-item{ display:flex; flex-direction:column; align-items:center; gap:5px; text-decoration:none;
          padding:8px 15px; transition:all .2s; flex:none; min-width:90px; }
  .sm-item:hover .sm-num{ transform:scale(1.1); }
  .sm-item:hover .sm-title{ color:var(--ant-dark); }
  .sm-item.active{ background:rgba(217,119,87,.10); border-radius:14px; }
  .sm-item.active .sm-title{ color:var(--ant-dark); font-weight:800; }
  .sm-num{ width:28px; height:28px; border-radius:50%; background:#C8C3BA; display:flex;
          align-items:center; justify-content:center; font-size:13px; font-weight:700; color:#fff;
          transition:all .2s; }
  .sm-item.active .sm-num{ box-shadow:0 2px 8px rgba(0,0,0,.18); }
  .sm-title{ font-size:13.5px; font-weight:600; color:#7A756E; transition:color .2s; white-space:nowrap; }
  .sm-sub{ font-size:11px; color:#aaa; transition:color .2s; white-space:nowrap; }

  /* ── Container ── */
  .container{ max-width:1080px; margin:0 auto; padding:32px 32px 80px; }

  /* ── Search ── */
  .search-wrap{ margin-bottom:30px; }
  .search-input-wrap{ position:relative; }
  .search-icon{ position:absolute; left:18px; top:50%; transform:translateY(-50%); z-index:1;
          color:#b9b3aa; pointer-events:none; display:flex; }
  .search-input{ width:100%; padding:14px 44px 14px 48px; border:none; border-radius:14px;
          background:var(--nm-bg); box-shadow:var(--nm-inset); font-family:inherit; font-size:15px;
          color:#3A3530; outline:none; transition:box-shadow .2s; }
  .search-input::placeholder{ color:#b3ada4; }
  .search-input:focus{ box-shadow:var(--nm-inset), 0 0 0 2px rgba(217,119,87,.25); }
  .search-clear{ position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none;
          border:none; font-size:20px; color:#bbb; cursor:pointer; display:none; padding:4px 8px; }
  .search-clear.show{ display:block; }
  .popular-tags{ display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-top:12px; }
  .popular-tag{ display:inline-flex; align-items:center; gap:6px; padding:6px 14px; border-radius:20px;
          background:var(--nm-bg); box-shadow:var(--nm-shadow-sm); font-size:12px; font-weight:600;
          color:#7A756E; text-decoration:none; cursor:pointer;
          transition:transform .2s cubic-bezier(.34,1.56,.64,1), box-shadow .2s, color .2s, background .2s; }
  .popular-tag:hover{ color:var(--ant-dark); transform:translateY(-2px) scale(1.04); }
  .popular-tag.active-filter{ background:var(--ant-orange); color:#fff;
          box-shadow:0 2px 8px rgba(217,119,87,.35); }
  .popular-tag.active-filter .tag-dot{ background:#fff !important; }
  .tag-dot{ width:6px; height:6px; border-radius:50%; }

  /* ── No Result ── */
  .search-no-result{ display:none; text-align:center; padding:48px 20px; }
  .no-result-icon{ display:flex; justify-content:center; margin-bottom:12px; color:#c4bdb2; }
  .search-no-result p{ font-size:14px; color:#aaa; line-height:1.7; }

  /* ── Category Label (pill-on-line) ── */
  .cat-label{ display:flex; align-items:center; justify-content:center; margin:48px 0 20px;
          position:relative; scroll-margin-top:134px; }
  .cat-label:first-of-type{ margin-top:8px; }
  .cat-label.is-hidden{ display:none; }
  .cat-label::before{ content:''; position:absolute; top:50%; left:0; right:0; height:1px; background:#D8D4CE; }
  .cat-pill{ display:inline-flex; align-items:center; gap:0; padding:11px 30px; border-radius:40px;
          background:var(--nm-bg); box-shadow:var(--nm-shadow-sm); position:relative; z-index:1; }
  .cat-sub{ font-size:14px; font-weight:800; letter-spacing:.3px; }
  .cat-count{ display:inline-flex; align-items:center; justify-content:center; font-size:12px;
          font-weight:700; width:22px; height:22px; border-radius:50%; margin-left:10px; }
  .cat-count-n{ color:#fff !important; }

  /* ── Icon Grid ── */
  .comp-list{ display:grid; grid-template-columns:repeat(4,1fr); gap:14px; }
  .comp-list.is-hidden{ display:none; }

  .comp-card{ all:unset; box-sizing:border-box; cursor:pointer; display:flex; flex-direction:column;
          background:var(--nm-bg); border-radius:16px; box-shadow:var(--nm-shadow-sm);
          transition:transform .3s cubic-bezier(.22,1,.36,1), box-shadow .25s, opacity .4s ease;
          overflow:hidden; text-align:center; }
  .comp-card:hover{ transform:translateY(-3px); box-shadow:var(--nm-shadow); }
  .comp-card:active{ transform:translateY(-1px); box-shadow:var(--nm-shadow-sm); }
  .comp-card:focus-visible{ box-shadow:var(--nm-shadow), 0 0 0 2px rgba(217,119,87,.4); }
  .comp-card.search-hidden{ display:none; }

  /* 아이콘 영역 = 카드 원래 박스 색(nm-bg). 아래 설명 영역과 톤을 구분한다. */
  .cp-wrap{ width:100%; height:106px; display:flex; align-items:center; justify-content:center;
          overflow:hidden; background:var(--nm-bg); }
  .cp-ico{ display:grid; place-items:center; color:#3A3530; transition:transform .3s ease; }
  .cp-ico svg{ width:40px; height:40px; }
  .comp-card:hover .cp-ico{ transform:scale(1.12); }
  .comp-card:hover .cp-ico svg .wheel{ animation:spin 1.1s linear infinite; transform-box:fill-box; transform-origin:center; }

  /* 설명 영역 = 중립색(카테고리 색 없음). 위 아이콘 영역보다 살짝 밝은 플레이트로 구분. */
  .comp-body{ padding:14px 12px 16px; display:flex; flex-direction:column; align-items:center; gap:4px;
          background:#f5f3ee; border-top:1px solid rgba(0,0,0,.05); }
  .comp-name{ font-size:13.5px; font-weight:700; color:#2e2a26; line-height:1.3;
          letter-spacing:-.01em; word-break:break-word; max-width:100%; }
  .comp-slug{ font:500 10.5px/1.2 var(--mono); color:#9a948b; letter-spacing:.02em;
          word-break:break-all; max-width:100%; }
  .comp-copy{ display:inline-flex; align-items:center; gap:5px; margin-top:6px; padding:5px 11px;
          border-radius:8px; background:rgba(28,25,23,.05); font-size:11px; font-weight:600; color:#8a857c;
          transition:background .2s, color .2s; }
  .comp-copy svg{ width:12px; height:12px; }
  .comp-card:hover .comp-copy{ background:var(--ant-orange); color:#fff; }
  .comp-card.copied .comp-copy{ background:#4f9440; color:#fff; }

  /* ── Toast ── */
  .toast{ position:fixed; left:50%; bottom:28px; transform:translateX(-50%) translateY(12px);
          display:flex; align-items:center; gap:10px; background:var(--ant-dark); color:#fff;
          padding:11px 17px; border-radius:12px; font:600 13px var(--sans);
          box-shadow:0 12px 30px -12px rgba(0,0,0,.5); opacity:0; pointer-events:none;
          transition:opacity .18s, transform .18s; z-index:200; }
  .toast::before{ content:''; width:6px; height:6px; border-radius:2px; background:var(--ant-orange); }
  .toast.show{ opacity:1; transform:translateX(-50%) translateY(0); }

  /* ── Footer (component-gallery.html 와 동일) ── */
  footer{ background:var(--ant-dark); text-align:center; padding:36px 32px 28px; }
  .footer-brand{ font-size:13px; font-weight:700; color:var(--ant-orange); letter-spacing:2px; text-transform:uppercase; margin-bottom:5px; }
  .footer-text{ font-size:12px; color:rgba(255,255,255,.6); }
  .footer-about-link{ display:inline-block; margin-top:8px; color:rgba(255,255,255,.75); text-decoration:none;
          font-size:12px; font-weight:600; border-bottom:1px solid rgba(255,255,255,.3); padding-bottom:1px; transition:all .2s; }
  .footer-about-link:hover{ color:#fff; border-color:#fff; }
  .footer-link-row{ display:inline-flex; align-items:center; gap:10px; margin-top:8px; }
  .footer-link-row .footer-about-link{ margin-top:0; }
  .footer-link-sep{ color:rgba(255,255,255,.35); font-size:12px; }

  ${catCss}

  @keyframes spin{ to{ transform:rotate(360deg); } }

  /* ── 페이지 로드 인트로 애니메이션 (.js 있을 때만; 없으면 항상 보임) ── */
  @keyframes gFadeDown{ from{ opacity:0; transform:translateY(-14px); } to{ opacity:1; transform:none; } }
  @keyframes gFadeUp{ from{ opacity:0; transform:translateY(14px); } to{ opacity:1; transform:none; } }
  .js header .back-link{ animation:gFadeDown .55s ease both; }
  .js header h1{ animation:gFadeDown .6s .06s ease both; }
  .js header p{ animation:gFadeDown .6s .13s ease both; }
  .js .header-pages{ animation:gFadeUp .6s .2s ease both; }
  .js .search-wrap{ animation:gFadeUp .55s .32s ease both; }
  .js .popular-tag{ opacity:0; animation:gFadeUp .5s ease both; }
  .js .popular-tag:nth-child(1){ animation-delay:.42s; }
  .js .popular-tag:nth-child(2){ animation-delay:.48s; }
  .js .popular-tag:nth-child(3){ animation-delay:.54s; }
  .js .popular-tag:nth-child(4){ animation-delay:.60s; }
  .js .popular-tag:nth-child(5){ animation-delay:.66s; }
  .js .popular-tag:nth-child(6){ animation-delay:.72s; }
  .js .popular-tag:nth-child(n+7){ animation-delay:.78s; }
  /* 카드: 뷰포트 진입 시 나타남(스크롤 리빌). 첫 화면은 로드 즉시 재생. */
  .js .comp-card{ opacity:0; transform:translateY(16px); }
  .js .comp-card.in{ opacity:1; transform:none; }

  /* ── Responsive ── */
  @media (max-width:900px){ .comp-list{ grid-template-columns:repeat(3,1fr); } }
  @media (max-width:768px){
    header{ padding:24px 22px 34px; }
    header h1{ font-size:32px; }
    /* 헤더 페이지 버튼: 모바일에서 세로 배치(component-gallery 와 동일) */
    .header-pages{ flex-direction:column; flex-wrap:nowrap; max-width:100%; gap:8px; align-items:stretch; }
    .header-page-link{ flex:none; max-width:none; width:100%; white-space:normal; word-break:keep-all;
            font-size:13px; padding:11px 14px; border-radius:12px; }
    .container{ padding:24px 18px 64px; }
    .cat-label{ margin:36px 0 14px; }
  }
  @media (max-width:560px){ .comp-list{ grid-template-columns:repeat(2,1fr); gap:11px; } }

  @media (prefers-reduced-motion: reduce){
    *{ transition:none !important; animation:none !important; } html{ scroll-behavior:auto; }
    /* 모션 최소화 시 인트로 애니메이션 없이 즉시 표시(요소가 숨은 채 남지 않도록) */
    .js header .back-link, .js header h1, .js header p, .js .header-pages,
    .js .search-wrap, .js .popular-tag, .js .comp-card{ opacity:1 !important; transform:none !important; }
  }
</style>
</head>
<body>
<script>document.documentElement.classList.add('js');</script>

<header>
  <video class="hero-video" autoplay muted loop playsinline poster="assets/media/hero-poster.webp" aria-hidden="true">
    <source src="assets/media/hero-bg.mp4" type="video/mp4">
  </video>
  <a href="index.html" class="back-link">&larr; 목록으로</a>
  <h1>SVG 아이콘 ${items.length}</h1>
  <p>버튼·카드에 바로 붙여 쓰는 라인 아이콘 · 카드를 누르면 SVG 코드가 복사됩니다</p>
  <div class="header-pages">
    <a href="eda-gallery.html" class="header-page-link">EDA 차트</a>
    <a href="ui-design.html" class="header-page-link">UI 디자인</a>
    <a href="component-gallery.html" class="header-page-link">UI 컴포넌트</a>
    <a href="icon-gallery.html" class="header-page-link active">SVG 아이콘</a>
  </div>
</header>

<!-- 서브 메뉴: 카테고리 점프 + 스크롤 스파이 -->
<nav class="sub-menu" id="subMenu">
  <div class="sm-inner">
${subMenu}
  </div>
</nav>

<main class="container">

  <div class="search-wrap">
    <div class="search-input-wrap">
      <span class="search-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></span>
      <input type="text" class="search-input" id="searchInput" placeholder="아이콘을 검색하세요 (예: 화살표, 사용자, 하트, naver)" autofocus />
      <button class="search-clear" id="searchClear" aria-label="검색 초기화">&times;</button>
    </div>
    <div class="popular-tags" id="popularTags">
${popularTags}
    </div>
  </div>

  <div class="search-no-result" id="noResult">
    <div class="no-result-icon"><svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg></div>
    <p>검색 결과가 없습니다.<br>다른 키워드로 검색해보세요.</p>
  </div>

${sections}

</main>

<footer>
  <p class="footer-brand">AI ROASTING</p>
  <p class="footer-text">비즈니스 리더를 위한 Claude 완전 정복</p>
  <span class="footer-link-row">
    <a href="#" class="footer-about-link" data-about-open>가이드 소개</a>
    <span class="footer-link-sep" aria-hidden="true">·</span>
    <a href="#" class="footer-about-link" data-license-open>라이선스</a>
  </span>
  <p class="footer-text" style="margin-top:10px;opacity:0.7;">© 2026 AI ROASTING. All rights reserved.</p>
</footer>

<div class="toast" id="toast"></div>

<script>
  const searchInput = document.getElementById('searchInput');
  const searchClear = document.getElementById('searchClear');
  const noResult = document.getElementById('noResult');
  const cards = [...document.querySelectorAll('.comp-card')];
  const sections = [...document.querySelectorAll('.comp-list')];
  const labels = [...document.querySelectorAll('.cat-label')];
  const smItems = [...document.querySelectorAll('.sm-item')];
  const popularTags = [...document.querySelectorAll('.popular-tag')];

  /* ── 검색 필터 ── */
  function applyFilter(){
    const t = searchInput.value.trim().toLowerCase();
    searchClear.classList.toggle('show', t.length > 0);
    let total = 0;
    for (const c of cards){
      const hit = !t || (c.dataset.keywords || '').toLowerCase().includes(t);
      c.classList.toggle('search-hidden', !hit);
      // 검색 중일 때 매칭 카드는 즉시 노출(리빌 대기로 안 보이는 일 없게)
      if (hit && t) c.classList.add('in');
      if (hit) total++;
    }
    // 카드가 하나도 없는 카테고리 섹션(구분선+그리드)은 숨김
    sections.forEach((sec, i) => {
      const anyVisible = [...sec.querySelectorAll('.comp-card')].some(c => !c.classList.contains('search-hidden'));
      sec.classList.toggle('is-hidden', !anyVisible);
      if (labels[i]) labels[i].classList.toggle('is-hidden', !anyVisible);
    });
    noResult.style.display = total === 0 ? 'block' : 'none';
    // 인기 태그 활성 표시
    popularTags.forEach(tag => tag.classList.toggle('active-filter',
      t && tag.dataset.term.toLowerCase() === t));
  }
  searchInput.addEventListener('input', applyFilter);
  searchClear.addEventListener('click', () => { searchInput.value = ''; applyFilter(); searchInput.focus(); });
  popularTags.forEach(tag => tag.addEventListener('click', () => {
    const term = tag.dataset.term;
    searchInput.value = searchInput.value.trim().toLowerCase() === term.toLowerCase() ? '' : term;
    applyFilter();
  }));

  /* ── 클릭하면 SVG 복사 ── */
  function copyIcon(btn){
    const svg = btn.querySelector('.cp-ico svg');
    if(!svg) return;
    const code = svg.outerHTML;
    const name = btn.querySelector('.comp-name')?.textContent || '';
    const done = () => { showToast('복사됨 · ' + name); flash(btn); };
    if (navigator.clipboard?.writeText){
      navigator.clipboard.writeText(code).then(done, () => fallbackCopy(code, done));
    } else {
      fallbackCopy(code, done);
    }
  }
  window.copyIcon = copyIcon;
  function flash(btn){
    btn.classList.add('copied');
    clearTimeout(btn.__ct);
    btn.__ct = setTimeout(() => btn.classList.remove('copied'), 1100);
  }
  function fallbackCopy(text, done){
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch(e){}
    document.body.removeChild(ta);
  }
  function showToast(msg){
    const el = document.getElementById('toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(window.__tt);
    window.__tt = setTimeout(() => el.classList.remove('show'), 1300);
  }

  /* ── 서브메뉴 스크롤 스파이 ── */
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting){
        const id = e.target.id.replace('sec-', '');
        smItems.forEach(s => s.classList.toggle('active', s.dataset.sec === id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
  labels.forEach(l => spy.observe(l));
  // 서브메뉴 클릭: 섹션 제목(구분선 알약)이 스티키 서브메뉴 바로 아래에 보이게 한다.
  //  · 세로 스크롤은 브라우저 기본 앵커 점프(href="#sec-…")에 맡기고, 제목이 가리지
  //    않도록 .cat-label 의 scroll-margin-top 을 서브메뉴 높이에 맞춰 둔다(=CSS).
  //  · preventDefault 하지 않는다(하면 기본 점프가 막혀 스크롤이 안 됨).
  //  · 스티키 요소에 scrollIntoView 를 쓰면 창이 끌려 올라가므로, 가로 탭 센터링은
  //    nav 자체 scrollLeft 로만 처리(세로 영향 없음).
  const subMenuEl = document.querySelector('.sub-menu');
  smItems.forEach(s => s.addEventListener('click', () => {
    smItems.forEach(x => x.classList.toggle('active', x === s));
    const navRect = subMenuEl.getBoundingClientRect();
    const sRect = s.getBoundingClientRect();
    const left = subMenuEl.scrollLeft + (sRect.left - navRect.left) - subMenuEl.clientWidth / 2 + sRect.width / 2;
    subMenuEl.scrollTo({ left, behavior: 'smooth' });
  }));

  /* ── 카드 스크롤 리빌(로드 시 첫 화면은 즉시 재생) ── */
  if ('IntersectionObserver' in window) {
    const cardIO = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 });
    cards.forEach(c => cardIO.observe(c));
  } else {
    cards.forEach(c => c.classList.add('in'));  // 폴백: 항상 보이게
  }
</script>

<!-- 헤더 배경 영상: 자동재생 보장 + reduced-motion 시 정지 (component-gallery 와 동일) -->
<script>
(function () {
  var v = document.querySelector('.hero-video');
  if (!v) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { try { v.pause(); } catch (e) {} return; }
  v.muted = true;
  var tryPlay = function () { var p = v.play(); if (p && typeof p.catch === 'function') p.catch(function () {}); };
  tryPlay();
  v.addEventListener('canplay', tryPlay, { once: true });
  v.addEventListener('loadeddata', tryPlay, { once: true });
  document.addEventListener('visibilitychange', function () { if (!document.hidden) tryPlay(); });
  var onFirst = function () { tryPlay(); window.removeEventListener('pointerdown', onFirst); window.removeEventListener('keydown', onFirst); };
  window.addEventListener('pointerdown', onFirst);
  window.addEventListener('keydown', onFirst);
})();
</script>

<!-- 푸터 '가이드 소개'·'라이선스' 모달 (component-gallery 와 동일 단일 소스) -->
<script src="assets/about-modal.js"></script>

</body>
</html>`;

writeFileSync(OUT, html);
console.log(`✓ ${items.length}개 아이콘 → icon-gallery.html (실패 ${failed}개)`);
