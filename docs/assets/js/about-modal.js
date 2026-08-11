/*
 * about-modal.js — 가이드 소개 모달 단일 소스
 * ─────────────────────────────────────────────
 * 모달의 콘텐츠(소개·만든이·업데이트 내역·저작권)는 이 파일에서만 수정한다.
 * 이 한 파일을 고치면 이 스크립트를 include 한 모든 페이지에 반영된다.
 *
 * 디자인 기준 — 표지 자켓을 펼친 면.
 *   index.html의 표지는 왼쪽 주황 앞표지 + 오른쪽 먹색 띠지로 짜여 있고,
 *   이 모달은 그 띠지 안에서 열린다. 그래서 같은 조판을 그대로 이어받는다.
 *   왼쪽 레일은 앞표지와 같은 주황 판(책등), 오른쪽 지면은 띠지와 같은 먹색이다.
 *   색·질감(종이 결)·자간은 .hero / .cover-band에서 가져온 값이다.
 *   자간 규칙도 표지를 따른다. 양수 트래킹은 라틴 대문자 전용, 한글은 -0.03em ~ +0.02em.
 *
 * 사용법:
 *   <script src="assets/js/about-modal.js"></script>
 *       → CSS + 모달 HTML + 동작을 모두 주입 (콘텐츠 페이지용)
 *   <script src="assets/js/about-modal.js" data-mode="markup"></script>
 *       → 모달 HTML 마크업만 주입. CSS·동작은 그 페이지가 자체적으로 보유 (index.html 용)
 *
 * index.html은 같은 CSS를 자체 <style>에 복사해 둔다.
 * ABOUT-MODAL-STD:START ~ END 마커 사이가 그 자리이고, 아래 CSS와 글자까지 같아야 한다.
 * 동기화는 assets/js/sync-about-css.py 로 한다.
 */
(function () {
  var me = document.currentScript;
  var mode = (me && me.getAttribute('data-mode')) || 'full';

  var CSS = `        /* ── 가이드 소개 모달 — 표지 자켓을 펼친 면 ── */
        .about-overlay {
            /* 표지에서 가져온 색. 먹색 지면 위 대비는 표지 띠지 기준을 그대로 지킨다
               (본문 #F1E7DF 13:1, 보조 #BFAE9F 7:1, 흐린 글 #AE9E91 5.8:1) */
            --ab-ink: #1E1613;
            --ab-ink-2: #241A15;
            --ab-ink-3: #2E211B;
            --ab-cream: #F1E7DF;
            --ab-cream-2: #BFAE9F;
            --ab-dim: #AE9E91;
            --ab-faint: #8E8076;
            --ab-tan: #E9A279;
            --ab-tan-hi: #F0B392;
            --ab-line: rgba(255,255,255,0.11);
            --ab-surface: rgba(255,255,255,0.055);
            --ab-surface-line: rgba(255,255,255,0.09);
            display: none;
            position: fixed; inset: 0; z-index: 250;
            background: rgba(20,10,5,0.62);
            backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
            opacity: 0; transition: opacity 0.25s;
            align-items: flex-start; justify-content: center;
            padding: 44px 20px;
            overflow-y: auto;
        }
        body.about-open .about-overlay { display: flex; opacity: 1; }
        body.about-open { overflow: hidden; }
        /* 먹색 지면과 주황 책등에서는 본문의 강조 주황(#A84726) 테가 바탕에 묻는다.
           표지 앞면(.jacket-front)과 같은 규칙으로 흰 테를 쓴다 */
        .about-overlay :where(a, button, summary, [tabindex]):focus-visible {
            outline: 3px solid #fff;
            outline-offset: 3px;
            border-radius: 4px;
        }
        /* 날개는 책등을 축으로 펴진다. 이 모달에서 움직임은 이 한 번뿐이다 */
        .about-modal {
            position: relative;
            width: 100%; max-width: 980px;
            max-height: 720px;
            display: flex;
            background: var(--ab-ink);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 30px 70px rgba(20,7,2,0.55), 0 0 0 1px rgba(255,255,255,0.06);
            transform-origin: left center;
            transform: perspective(1400px) rotateY(-6deg) translateY(10px);
            opacity: 0;
            transition: transform 0.42s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.3s ease;
        }
        body.about-open .about-modal {
            transform: perspective(1400px) rotateY(0deg) translateY(0);
            opacity: 1;
        }

        /* ── 책등 레일 — 앞표지와 같은 주황 판 ── */
        .ab-rail {
            flex: 0 0 132px;
            position: relative; z-index: 2;
            display: flex; flex-direction: column;
            padding: 22px 16px 18px;
            background: linear-gradient(165deg, #B35535 0%, #A04828 42%, #7A2E15 100%);
            box-shadow: inset -1px 0 0 rgba(255,255,255,0.16), 8px 0 26px rgba(30,10,3,0.5);
        }
        /* 표지의 인쇄 그레인을 레일에도 이어 붙인다 */
        .ab-rail::after {
            content: ''; position: absolute; inset: 0; pointer-events: none;
            opacity: 0.40; mix-blend-mode: soft-light;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='nr'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.62' numOctaves='2'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23nr)' opacity='0.42'/%3E%3C/svg%3E");
        }
        .ab-rail > * { position: relative; z-index: 1; }
        .ab-rail-note {
            margin: 0;
            font-size: 12px; font-weight: 800; letter-spacing: 0.02em; line-height: 1.45;
            color: #fff;
        }
        .ab-nav {
            margin: 20px 0 0; padding: 14px 0 0;
            display: flex; flex-direction: column; gap: 1px;
            border-top: 1px solid rgba(255,255,255,0.22);
        }
        .ab-nav a {
            position: relative; display: block;
            padding: 7px 0 7px 11px;
            font-size: 12.5px; font-weight: 700; letter-spacing: -0.01em;
            color: rgba(255,255,255,0.80); text-decoration: none;
            transition: color 0.18s ease, padding-left 0.2s ease;
        }
        .ab-nav a::before {
            content: ''; position: absolute; left: 0; top: 50%;
            width: 2px; height: 0; background: #fff;
            transform: translateY(-50%);
            transition: height 0.2s ease;
        }
        .ab-nav a:hover, .ab-nav a:focus-visible { color: #fff; padding-left: 15px; }
        .ab-nav a.is-on { color: #fff; }
        .ab-nav a.is-on::before { height: 15px; }
        /* 책등 각인. 실제 책등처럼 세로로 세운다 */
        .ab-spine { margin-top: auto; padding-top: 18px; display: flex; justify-content: center; }
        .ab-spine span {
            writing-mode: vertical-rl; text-orientation: mixed;
            font-size: 10px; font-weight: 800; letter-spacing: 0.26em;
            text-transform: uppercase; color: rgba(255,255,255,0.66);
        }

        /* ── 지면 — 띠지와 같은 먹색. 왼쪽 34px은 접힌 면의 반사광 ── */
        .ab-sheet {
            /* min-height: 0이 없으면 flex 아이템 기본값(auto) 탓에 내용 높이만큼 늘어나
               .about-modal의 max-height를 넘고, 안쪽 .about-modal-body의 overflow-y도 죽는다 */
            flex: 1; min-width: 0; min-height: 0; position: relative;
            display: flex; flex-direction: column;
            background: linear-gradient(90deg, #2E211B 0px, #241A15 34px, #1E1613 96px);
        }
        /* 어두운 바탕에서 종이 결은 screen으로 얹는다. multiply는 뭉갠 얼룩이 된다 */
        .ab-sheet::after {
            content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none;
            opacity: 0.16; mix-blend-mode: screen;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='ns'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.62' numOctaves='2'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23ns)' opacity='0.42'/%3E%3C/svg%3E");
        }
        .about-close {
            position: absolute; top: 15px; right: 16px; z-index: 5;
            width: 36px; height: 36px; border-radius: 50%;
            border: none; padding: 0; cursor: pointer;
            background: rgba(255,255,255,0.10);
            box-shadow: inset 0 0 0 1px rgba(255,255,255,0.24);
            color: rgba(255,255,255,0.88);
            display: flex; align-items: center; justify-content: center;
            transition: background 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
        }
        .about-close:hover {
            background: rgba(255,255,255,0.22);
            box-shadow: inset 0 0 0 1px rgba(255,255,255,0.46);
            color: #fff;
        }
        /* FOCUS-STD가 모든 단추에 4px 테를 걸어 둔다. 둥근 단추는 둥근 테를 받아야 한다 */
        .about-close:focus-visible { border-radius: 50%; }
        .about-close svg { width: 20px; height: 20px; }
        .about-modal-body {
            position: relative; z-index: 1;
            flex: 1 1 auto;
            overflow-y: auto;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
            padding: 34px 40px 30px;
            scrollbar-width: thin;
            scrollbar-color: rgba(255,255,255,0.18) transparent;
        }
        .about-modal-body::-webkit-scrollbar { width: 9px; }
        .about-modal-body::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.16); border-radius: 99px;
            border: 3px solid transparent; background-clip: padding-box;
        }

        /* ── 속표지 ── */
        .ab-eyebrow {
            margin: 0 0 11px;
            font-size: 11.5px; font-weight: 800; letter-spacing: 0.02em;
            color: var(--ab-tan);
        }
        /* 양수 트래킹은 라틴 대문자에만 건다 */
        .ab-eyebrow.ab-latin { letter-spacing: 0.16em; text-transform: uppercase; }
        .ab-quote h1 {
            margin: 0;
            font-size: clamp(21px, 2.3vw, 27px); font-weight: 850; color: #fff;
            letter-spacing: -0.028em; line-height: 1.4;
        }
        /* 표지의 흰 규칙선을 그대로 가져온다 */
        .ab-rule {
            width: 64px; height: 2px; background: rgba(255,255,255,0.8);
            margin: 20px 0 22px;
        }
        .ab-intro p {
            margin: 0 0 12px;
            font-size: 14.5px; color: var(--ab-cream-2); line-height: 1.78;
        }
        .ab-intro p:last-child { margin-bottom: 0; }
        .ab-intro strong { color: var(--ab-cream); font-weight: 700; }

        /* ── 구획 ── */
        .ab-sec { margin-top: 34px; padding-top: 30px; border-top: 1px solid var(--ab-line); }
        .ab-sec-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 16px; }
        .ab-sec-title {
            margin: 0;
            font-size: 17px; font-weight: 800; color: var(--ab-cream); letter-spacing: -0.022em;
        }
        .ab-sec-note { font-size: 12px; color: var(--ab-faint); line-height: 1.5; }

        /* ── 목적 · 기준 두 판 ── */
        .ab-cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
        .ab-card {
            background: var(--ab-surface);
            border: 1px solid var(--ab-surface-line);
            border-radius: 14px;
            padding: 18px 20px;
            transition: background 0.2s ease, border-color 0.2s ease;
        }
        .ab-card:hover { background: rgba(255,255,255,0.085); border-color: rgba(255,255,255,0.16); }
        .ab-card-tag {
            display: block; margin-bottom: 6px;
            font-size: 11px; font-weight: 800; letter-spacing: 0.02em; color: var(--ab-tan);
        }
        .ab-card-title {
            display: block; margin-bottom: 10px;
            font-size: 15.5px; font-weight: 800; color: var(--ab-cream); letter-spacing: -0.022em;
        }
        .ab-card p { margin: 0 0 10px; font-size: 13.5px; color: var(--ab-dim); line-height: 1.72; }
        .ab-card p:last-child { margin-bottom: 0; }
        .ab-card strong { color: var(--ab-cream); font-weight: 700; }
        /* 세 기준. 왼쪽 낱말이 그 기준이 무엇을 거르는지 말한다 */
        .ab-crit { list-style: none; margin: 12px 0 0; padding: 0; }
        .ab-crit li {
            display: grid; grid-template-columns: 40px 1fr; gap: 10px; align-items: baseline;
            padding: 9px 0; border-top: 1px solid var(--ab-line);
        }
        .ab-crit li:last-child { border-bottom: 1px solid var(--ab-line); }
        .ab-crit b { font-size: 11.5px; font-weight: 800; color: var(--ab-tan); letter-spacing: 0.02em; }
        .ab-crit span { font-size: 13px; color: var(--ab-cream-2); line-height: 1.6; }

        /* ── 책날개 · 만든이 ── */
        .ab-panel {
            background: var(--ab-surface);
            border: 1px solid var(--ab-surface-line);
            border-radius: 14px;
            padding: 20px 22px;
        }
        .ab-maker-head { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
        .ab-avatar {
            display: inline-flex; align-items: center; justify-content: center;
            width: 46px; height: 46px; border-radius: 50%; flex-shrink: 0;
            background: rgba(253,246,240,0.94);
            box-shadow: 0 0 0 0.5px rgba(255,255,255,0.55);
        }
        .ab-avatar img { width: 46px; height: 46px; border-radius: 50%; display: block; }
        .ab-maker-id { flex: 1; min-width: 0; }
        .ab-maker-name {
            margin: 0 0 3px;
            font-size: 16px; font-weight: 800; color: var(--ab-cream); letter-spacing: -0.018em;
        }
        .ab-maker-name span { color: var(--ab-tan); font-weight: 600; }
        .ab-maker-role { margin: 0; font-size: 12.5px; color: var(--ab-dim); line-height: 1.5; }
        .ab-social { display: flex; gap: 6px; flex-shrink: 0; align-self: flex-start; }
        .ab-social a {
            display: inline-flex; align-items: center; justify-content: center;
            width: 28px; height: 28px; border-radius: 8px;
            background: rgba(255,255,255,0.10); color: #fff; text-decoration: none;
            transition: background 0.2s ease, transform 0.15s ease;
        }
        .ab-social a:hover { background: #0A66C2; transform: translateY(-2px); }
        .ab-social a.fb:hover { background: #1877F2; }
        .ab-social svg { width: 13px; height: 13px; fill: currentColor; }
        .ab-maker-bio { margin: 0; font-size: 13.5px; color: var(--ab-cream-2); line-height: 1.72; }
        .ab-cv { list-style: none; margin: 14px 0 0; padding: 0; }
        .ab-cv li {
            display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px;
            padding: 8px 0; border-top: 1px solid var(--ab-line);
            font-size: 13px; line-height: 1.5;
        }
        .ab-cv b { color: var(--ab-cream); font-weight: 700; }
        .ab-cv .ab-past { font-size: 11px; font-weight: 700; color: var(--ab-faint); }
        .ab-cv .ab-role { color: var(--ab-dim); }

        /* ── 쇄 이력 ── */
        .ab-log { margin: 0; }
        .ab-log-item {
            display: grid; grid-template-columns: 92px 1fr; gap: 16px;
            padding: 14px 0; border-top: 1px solid var(--ab-line);
        }
        .ab-log-meta { display: flex; flex-direction: column; gap: 5px; }
        .ab-ver {
            align-self: flex-start;
            font-size: 11.5px; font-weight: 800; color: var(--ab-tan);
            background: rgba(233,162,121,0.12); border-radius: 6px; padding: 2px 8px;
        }
        .ab-date { font-size: 11.5px; color: var(--ab-faint); }
        .ab-log-title { margin: 0 0 4px; font-size: 13.5px; font-weight: 700; color: var(--ab-cream); line-height: 1.45; }
        .ab-log-desc { margin: 0; font-size: 12.5px; color: var(--ab-dim); line-height: 1.65; word-break: keep-all; }
        .ab-more { border-top: 1px solid var(--ab-line); }
        .ab-more > summary {
            list-style: none; cursor: pointer;
            padding: 13px 0 0;
            display: flex; align-items: center; gap: 8px;
            font-size: 12.5px; font-weight: 700; color: var(--ab-cream-2);
            transition: color 0.18s ease;
        }
        .ab-more > summary::-webkit-details-marker { display: none; }
        .ab-more > summary:hover { color: var(--ab-tan-hi); }
        .ab-more > summary::after {
            content: ''; width: 7px; height: 7px;
            border-right: 1.6px solid currentColor; border-bottom: 1.6px solid currentColor;
            transform: translateY(-2px) rotate(45deg);
            transition: transform 0.2s ease;
        }
        .ab-more[open] > summary::after { transform: translateY(1px) rotate(-135deg); }
        .ab-note { margin: 14px 0 0; font-size: 12.5px; color: var(--ab-faint); line-height: 1.6; }

        /* ── 판권면 ── */
        .ab-colophon {
            background: var(--ab-surface);
            border: 1px solid var(--ab-surface-line);
            border-radius: 14px;
            padding: 18px 22px 16px;
            font-size: 13px; color: var(--ab-cream-2); line-height: 1.7;
            word-break: keep-all;
        }
        .ab-colophon p { margin: 0 0 6px; }
        .ab-colophon .ab-meta { font-size: 12.5px; color: var(--ab-dim); }
        .ab-colophon h3 {
            margin: 15px 0 6px; padding-top: 14px;
            border-top: 1px solid var(--ab-line);
            font-size: 12.5px; font-weight: 800; letter-spacing: 0.02em; color: var(--ab-tan);
        }
        .ab-colophon ul { list-style: none; margin: 0; padding: 0; }
        .ab-colophon li { position: relative; padding: 3px 0 3px 14px; }
        .ab-colophon li::before {
            content: ''; position: absolute; left: 0; top: 11px;
            width: 4px; height: 4px; background: var(--ab-tan); opacity: 0.8;
        }
        .ab-copy {
            display: inline-flex; align-items: center; justify-content: center;
            width: 19px; height: 19px; margin-left: 5px; padding: 0;
            background: transparent; border: 1px solid rgba(255,255,255,0.24);
            border-radius: 5px; color: var(--ab-dim); cursor: pointer;
            vertical-align: -4px;
            transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
        }
        .ab-copy:hover { background: rgba(255,255,255,0.10); color: #fff; border-color: rgba(255,255,255,0.44); }
        .ab-copy svg { width: 11px; height: 11px; }
        .ab-copy.copied { background: #3E8A5B; color: #fff; border-color: #3E8A5B; }

        /* ── 발치 띠 ── */
        .about-cta-bar {
            flex-shrink: 0; position: relative; z-index: 2;
            display: flex; align-items: center; justify-content: space-between; gap: 12px;
            padding: 12px 22px 12px 28px;
            background: #171110;
            border-top: 1px solid var(--ab-line);
        }
        .ab-cta-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
        .ab-mini {
            display: inline-flex; align-items: center; justify-content: center;
            width: 22px; height: 22px; border-radius: 50%; flex-shrink: 0;
            background: rgba(253,246,240,0.92);
        }
        .ab-mini img { width: 22px; height: 22px; border-radius: 50%; display: block; }
        .ab-cta-name { font-size: 12.5px; font-weight: 700; color: var(--ab-cream-2); white-space: nowrap; }
        .ab-cta-name span { color: var(--ab-tan); }
        /* 먹색 위에서 주 동작은 채운 주황이 아니라 크림이다. 표지 띠지의 시작 단추와 같은 규격 */
        .about-cta-btn {
            display: inline-flex; align-items: center; gap: 8px;
            height: 40px; padding: 0 20px;
            border-radius: 100px;
            background: #F3EAE1; color: #2B1B13;
            font-size: 13px; font-weight: 700; text-decoration: none; white-space: nowrap;
            box-sizing: border-box;
            box-shadow: 0 6px 18px rgba(0,0,0,0.30);
            transition: background 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
        }
        .about-cta-btn:hover {
            background: #FFFFFF; transform: translateY(-1px);
            box-shadow: 0 8px 22px rgba(0,0,0,0.36);
        }

        @media (prefers-reduced-motion: reduce) {
            .about-modal,
            body.about-open .about-modal { transform: none; transition: opacity 0.2s ease; }
            .ab-nav a, .ab-card, .ab-social a, .about-cta-btn, .about-close, .ab-more > summary::after { transition: none; }
        }

        @media (max-width: 860px) {
            /* 모달이 열린 동안 페이지 햄버거 단추가 머리띠 위에 겹친다. 같은 z-index 250이라 순서로는 못 피한다 */
            body.about-open .sm-menu-toggle,
            body.about-open .menu-toggle { display: none !important; }
            .about-overlay {
                padding: max(16px, env(safe-area-inset-top)) 14px max(16px, env(safe-area-inset-bottom));
                align-items: center;
            }
            .about-modal {
                flex-direction: column;
                border-radius: 16px; max-width: none;
                max-height: calc(100vh - 32px);
                max-height: calc(100dvh - 32px);
            }
            /* 책등은 모바일에서 머리띠가 된다. 섹션 이동은 그대로 남긴다 */
            .ab-rail {
                flex: 0 0 auto;
                flex-direction: row; align-items: center; gap: 10px;
                padding: 10px 56px 10px 14px;
                box-shadow: inset 0 -1px 0 rgba(255,255,255,0.16);
            }
            .ab-rail-note { margin: 0; font-size: 12px; white-space: nowrap; }
            .ab-spine { display: none; }
            .ab-nav {
                margin: 0; padding: 0 0 0 12px; gap: 2px;
                flex-direction: row; align-items: center;
                border-top: none; border-left: 1px solid rgba(255,255,255,0.22);
                overflow-x: auto; scrollbar-width: none;
            }
            .ab-nav::-webkit-scrollbar { display: none; }
            .ab-nav a { padding: 5px 10px; border-radius: 100px; font-size: 12px; white-space: nowrap; }
            .ab-nav a::before { display: none; }
            .ab-nav a:hover, .ab-nav a:focus-visible { padding-left: 10px; }
            .ab-nav a.is-on { background: rgba(255,255,255,0.20); }
            .about-close { top: 9px; right: 12px; width: 32px; height: 32px; }
            .about-modal-body { padding: 24px 18px 22px; }
            .ab-rule { margin: 16px 0 18px; }
            .ab-cards { grid-template-columns: 1fr; gap: 12px; }
            .ab-sec { margin-top: 28px; padding-top: 24px; }
            .ab-panel, .ab-colophon { padding: 16px 18px; }
            .ab-log-item { grid-template-columns: 1fr; gap: 7px; padding: 13px 0; }
            .ab-log-meta { flex-direction: row; align-items: center; gap: 8px; }
            .about-cta-bar { padding: 10px 14px; gap: 8px; }
            .ab-cta-left { gap: 7px; }
            .ab-cta-left .ab-mini { display: none; }
            .ab-cta-name { font-size: 12px; }
            .about-cta-btn { height: 38px; padding: 0 16px; font-size: 12.5px; }
            .about-cta-btn .cta-prefix { display: none; }
            .ab-lic-author { display: block; }
        }`;

  var HTML = `<div class="about-overlay" id="aboutOverlay" role="dialog" aria-modal="true" aria-labelledby="aboutTitle" aria-hidden="true">
    <article class="about-modal" role="document">

        <!-- 책등 — 앞표지와 같은 주황 판 -->
        <aside class="ab-rail">
            <p class="ab-rail-note">가이드 소개</p>
            <nav class="ab-nav" aria-label="소개 항목">
                <a href="#aboutTop" data-about-nav="aboutTop" class="is-on">소개</a>
                <a href="#aboutMaker" data-about-nav="aboutMaker">만든이</a>
                <a href="#aboutChangelog" data-about-nav="aboutChangelog">업데이트</a>
                <a href="#aboutLicense" data-about-nav="aboutLicense">저작권</a>
            </nav>
            <p class="ab-spine"><span>AI Roasting</span></p>
        </aside>

        <!-- 지면 — 띠지와 같은 먹색 -->
        <div class="ab-sheet">
            <button class="about-close" id="aboutClose" aria-label="닫기" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
            </button>

            <div class="about-modal-body">
                <div id="aboutTop">
                    <p class="ab-eyebrow">강의에서 가장 많이 받는 질문</p>
                    <div class="ab-quote">
                        <h1 id="aboutTitle">"개발 말고, 비즈니스용으로는 Claude를 어떻게 써야 하나요?"</h1>
                    </div>
                    <div class="ab-rule" aria-hidden="true"></div>
                    <div class="ab-intro">
                        <p>시중에 나와 있는 Claude 자료는 대부분 개발자를 대상으로 합니다. 그래서 이 가이드는 <strong>코드를 쓰지 않는 사람이 기획과 보고, 분석과 자동화에 바로 활용할 수 있도록</strong> 같은 도구를 실무 관점으로 다시 정리한 자료입니다.</p>
                        <p>코드를 한 줄도 모르는 사람도 진단부터 자동화까지 한 번에 따라올 수 있도록 전체 내용을 5단계로 구성했습니다.</p>
                    </div>
                </div>

                <section class="ab-sec" id="aboutWhy" aria-label="만든 이유와 선정 기준">
                    <div class="ab-cards">
                        <div class="ab-card">
                            <span class="ab-card-tag">목적</span>
                            <span class="ab-card-title">왜 만들었나요</span>
                            <p>강의마다 같은 질문이 돌아왔습니다. 프롬프트는 어떻게 써야 잘 쓰는지, Claude Code는 어떻게 쓰는지.</p>
                            <p>매번 같은 답을 반복하는 대신 <strong>한 권으로 정리된 표준 레퍼런스</strong>를 만들기로 했습니다. 이 가이드가 그 시작입니다.</p>
                        </div>
                        <div class="ab-card">
                            <span class="ab-card-tag">기준</span>
                            <span class="ab-card-title">무엇을 담았나요</span>
                            <p>모든 기능을 담지는 않았습니다. 다음 세 가지를 모두 만족하는 내용만 골랐습니다.</p>
                            <ul class="ab-crit">
                                <li><b>진입</b><span>코드나 터미널 지식 없이도 바로 시작할 수 있을 것</span></li>
                                <li><b>실무</b><span>읽는 사람이 곧장 실무에 적용할 수 있을 것</span></li>
                                <li><b>환경</b><span>한국의 업무 환경(보고, 결재, 미팅, 문서)에 맞을 것</span></li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section class="ab-sec" id="aboutMaker">
                    <p class="ab-eyebrow ab-latin">Builder</p>
                    <div class="ab-sec-head">
                        <h2 class="ab-sec-title">만든이</h2>
                    </div>
                    <div class="ab-panel">
                        <div class="ab-maker-head">
                            <span class="ab-avatar"><img src="assets/logos/logo1-transparent.png" alt="AI ROASTING 로고"></span>
                            <div class="ab-maker-id">
                                <p class="ab-maker-name">강정구 <span>·</span> Jayden Kang</p>
                                <p class="ab-maker-role">LINER AI 전략 총괄</p>
                            </div>
                            <div class="ab-social">
                                <a href="https://www.linkedin.com/in/jayden-kang/" target="_blank" rel="noopener" aria-label="LinkedIn">
                                    <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                                </a>
                                <a class="fb" href="https://www.facebook.com/jayden.kang" target="_blank" rel="noopener" aria-label="Facebook">
                                    <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                </a>
                            </div>
                        </div>
                        <p class="ab-maker-bio">전략 컨설팅과 글로벌 사업 현장을 거치며 쌓은 경험을 바탕으로, AI를 누구나 실무에 바로 쓸 수 있도록 매주 업데이트 하고 있습니다.</p>
                        <ul class="ab-cv">
                            <li><b>LINER</b><span class="ab-role">AI 전략 총괄</span></li>
                            <li><b>국민경제자문회의</b><span class="ab-role">AI경제 정책자문단</span></li>
                            <li><span class="ab-past">전)</span><b>카카오엔터테인먼트</b><span class="ab-role">글로벌사업 본부장(VP)</span></li>
                            <li><span class="ab-past">전)</span><b>미국 타파스엔터테인먼트</b><span class="ab-role">최고운영책임(COO)</span></li>
                            <li><span class="ab-past">전)</span><b>라인(LINE)</b><span class="ab-role">태국 사업 최고전략책임(CSO)</span></li>
                            <li><span class="ab-past">전)</span><b>Bain &amp; Company</b><span class="ab-role">이사</span></li>
                            <li><span class="ab-past">전)</span><b>Kearney</b><span class="ab-role">팀장</span></li>
                        </ul>
                    </div>
                </section>

                <section class="ab-sec" id="aboutChangelog">
                    <p class="ab-eyebrow ab-latin">Changelog</p>
                    <div class="ab-sec-head">
                        <h2 class="ab-sec-title">업데이트 내역</h2>
                        <span class="ab-sec-note">최신순 · 전체 25건</span>
                    </div>
                    <div class="ab-log">
                        <div class="ab-log-item">
                            <div class="ab-log-meta"><span class="ab-ver">v3.4</span><span class="ab-date">2026-08-09</span></div>
                            <div><p class="ab-log-title">스마트폰 앱 트랙 이동과 5단계 토글 신설</p><p class="ab-log-desc">스마트폰 앱 두 페이지는 2단계에서 5단계로 옮기고, 5단계 다섯 페이지에 루프 자동화와 스마트폰 앱을 오가는 토글을 달았습니다. 메인은 '80 에이전트 고용 실전' 띠와 외부 사이트 카드 세 장을 실전 예제 아래로 옮겨 정리했습니다. 플러그인 페이지에는 Claude Code와 Codex의 차이를 자리마다 보여 주는 토글을 넣었습니다.</p></div>
                        </div>
                        <div class="ab-log-item">
                            <div class="ab-log-meta"><span class="ab-ver">v3.3</span><span class="ab-date">2026-08-02</span></div>
                            <div><p class="ab-log-title">2단계를 확장 프로그램과 스마트폰 앱으로 나눔</p><p class="ab-log-desc">2단계를 '확장 프로그램'(크롬·MS Office)과 '스마트폰 앱'(Claude·ChatGPT) 둘로 나눴습니다. '스마트폰에서 ChatGPT 쓰기'를 새로 만들어 대화·프로젝트·예약 작업·Codex 리모트·음성을 정리하고, Claude 앱과 무엇이 다른지 비교했습니다.</p></div>
                        </div>
                        <div class="ab-log-item">
                            <div class="ab-log-meta"><span class="ab-ver">v3.2</span><span class="ab-date">2026-07-26</span></div>
                            <div><p class="ab-log-title">Opus 5 최신화와 스마트폰 페이지 신설</p><p class="ab-log-desc">7월 24일 나온 Claude Opus 5에 맞춰 오리엔테이션의 벤치마크 표와 가격 표, 모델 타임라인을 고쳤습니다. 5단계에는 '헤르메스 에이전트' 페이지를 넣었습니다. 2단계에는 '스마트폰에서 Claude 쓰기'를 새로 만들어 앱 메뉴 여섯 개와 폰에서 일을 맡기는 법을 정리했습니다.</p></div>
                        </div>
                        <div class="ab-log-item">
                            <div class="ab-log-meta"><span class="ab-ver">v3.1</span><span class="ab-date">2026-07-19</span></div>
                            <div><p class="ab-log-title">디자인·시각화 갤러리 4종 재편</p><p class="ab-log-desc">디자인·시각화 갤러리를 EDA 차트, UI 디자인, UI 컴포넌트, SVG 아이콘 네 개로 나눴습니다. 버튼과 카드에 바로 붙여 쓰는 라인 아이콘 300개를 모아 SVG 아이콘 갤러리를 새로 만들고, 네 페이지 상단에는 서로 오가는 서브 메뉴를 같은 모양으로 달았습니다. 메인 갤러리 카드는 네 장으로 맞췄습니다. EDA 차트 개수도 28종으로 고쳤습니다.</p></div>
                        </div>
                        <div class="ab-log-item">
                            <div class="ab-log-meta"><span class="ab-ver">v3.0</span><span class="ab-date">2026-07-12</span></div>
                            <div><p class="ab-log-title">AI와 함께 일하는 7단계 신설</p><p class="ab-log-desc">스킬 다섯 개(slide_library·casting·5color·korean·council)를 목표부터 검증까지 하나로 잇는 'AI와 함께 일하는 7단계' 실전 예제를 새로 만들었습니다. 예제 세 페이지(MCP 연결·7단계·책 쓰기)는 상단 메뉴를 하나로 맞추고, 일곱 단계는 키보드로도 펼칠 수 있는 아코디언에 담았습니다. 사이트 폴더 구조와 내비게이션도 정돈했습니다. 카드와 헤더 아이콘은 이모지에서 흰 타일 위 오렌지 라인 SVG로 모두 바꾸고, 메인 '다른 콘텐츠'에는 검색 스킬 Hound를 더했습니다.</p></div>
                        </div>
                        <div class="ab-log-item">
                            <div class="ab-log-meta"><span class="ab-ver">v2.9</span><span class="ab-date">2026-07-05</span></div>
                            <div><p class="ab-log-title">다른 콘텐츠 개편과 앤트로픽 소개 최신화</p><p class="ab-log-desc">메인 '다른 콘텐츠' 링크를 10선으로 다시 골라 한국어 윤문 스킬과 GPT 이미지 프롬프트 랩을 넣었습니다. 실전 예제의 기본 예제 세 과제는 구성을 가볍게 하려고 백업으로 내렸습니다. 앤트로픽 소개(엿보기)에는 6월 말 소네트 5와 클로드 사이언스 공개, 페이블 5의 수출통제 해제와 재공개 소식을 반영했고, 히어로의 최신 모델 표기는 Fable 5·Opus 4.8·Sonnet 5로 고쳤습니다.</p></div>
                        </div>
                        <details class="ab-more">
                            <summary>이전 기록 19건 더 보기</summary>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v2.8</span><span class="ab-date">2026-06-28</span></div>
                                <div><p class="ab-log-title">스킬 라이브러리 확장과 라이선스 정리</p><p class="ab-log-desc">수강생이 직접 만든 스킬을 더해 스킬 쇼케이스를 21선으로 늘렸습니다. 모든 스킬의 README와 라이선스는 MIT로 통일하고, 샘플에 드러난 실명과 연락처는 전부 익명으로 바꿨습니다. 검증 트랙(동조·환각)에는 1차 출처로 교차검증한 실제 사례를 더했습니다. 용어 사전에는 PowerShell과 파이썬을 넣어 73선으로 늘렸습니다.</p></div>
                            </div>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v2.7</span><span class="ab-date">2026-06-21</span></div>
                                <div><p class="ab-log-title">쇼케이스 보강</p><p class="ab-log-desc">수강생들이 직접 만든 결과물을 모아 수강생 쇼케이스를 새로 정리했습니다. 전 세계 클로드 코드 해커톤 우승작 14선을 모은 쇼케이스도 함께 손봤습니다. 어디까지 가능한지 실제 사례로 바로 확인할 수 있습니다.</p></div>
                            </div>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v2.6</span><span class="ab-date">2026-06-14</span></div>
                                <div><p class="ab-log-title">루프 엔지니어링 트랙 신설</p><p class="ab-log-desc">'루프 엔지니어링' 트랙을 새로 열었습니다. 행동하고 검증해 다시 도는 피드백 루프를 다룹니다. 클로드 코드 /loop 페이지와 정해진 시각에 사람 없이 실행되는 Routines 예약 페이지를 더했고, 프롬프트 작성법에는 위임 4요소(목표·채점·검증·멈춤)를 보강했습니다.</p></div>
                            </div>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v2.5</span><span class="ab-date">2026-06-07</span></div>
                                <div><p class="ab-log-title">보안 가이드와 하네스 엔지니어링 보강</p><p class="ab-log-desc">비즈니스 리더를 위한 AI 협업 보안 다섯 가지 원칙을 새로 정리했습니다. 하네스 엔지니어링 실전 트랙의 세 카드(하네스 엔지니어링·Claude의 도구·다이내믹 워크플로우)도 다시 다듬어, 개념을 읽고 바로 실습으로 넘어가게 했습니다.</p></div>
                            </div>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v2.4</span><span class="ab-date">2026-05-31</span></div>
                                <div><p class="ab-log-title">한국 법령 MCP 예제 추가</p><p class="ab-log-desc">Claude 데스크톱 커넥터로 법제처 Open API를 연결하는 한국 법령 MCP 예제를 더했습니다. 공공 데이터를 실무에 붙이는 과정을 단계별로 담아, 리더가 사례를 그대로 따라 할 수 있게 했습니다.</p></div>
                            </div>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v2.3</span><span class="ab-date">2026-05-24</span></div>
                                <div><p class="ab-log-title">용어 사전 6막 재구성</p><p class="ab-log-desc">AI 70년을 6막 60선으로 풀어낸 용어 사전을 새로 정리했습니다. 개념이 나온 배경과 맥락을 이야기처럼 이어 붙였습니다. 관련 외부 자산으로 넘어가는 링크도 함께 손봤습니다.</p></div>
                            </div>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v2.2</span><span class="ab-date">2026-05-17</span></div>
                                <div><p class="ab-log-title">사이트 표준화</p><p class="ab-log-desc">사이트 전체의 본문 폭과 헤더 메뉴를 한 기준으로 맞췄습니다. 페이지마다 달랐던 레이아웃을 정돈해 어디서나 읽기 편해졌습니다. 이후 작업의 토대가 되는 운영 문서 체계도 이때 자리 잡았습니다.</p></div>
                            </div>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v2.1</span><span class="ab-date">2026-05-10</span></div>
                                <div><p class="ab-log-title">공유 미리보기와 강의 자료 보강</p><p class="ab-log-desc">링크를 공유할 때 뜨는 미리보기 정보(메타 태그)를 정리했습니다. 카카오톡과 슬랙에서도 제목과 설명이 제대로 나옵니다. 강의에 바로 쓰도록 슬라이드 순서와 예시 자료도 보강했습니다.</p></div>
                            </div>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v2.0</span><span class="ab-date">2026-05-03</span></div>
                                <div><p class="ab-log-title">모바일 최적화와 첫 화면 개편</p><p class="ab-log-desc">모바일 사용성을 처음부터 다시 손봤습니다. 작은 화면에서도 단계 학습이 끊기지 않도록 내비게이션과 카드 배치를 모두 바꿨습니다. 첫 화면과 안내 모달도 새로 만들어 첫인상을 정돈했습니다.</p></div>
                            </div>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v1.9</span><span class="ab-date">2026-04-26</span></div>
                                <div><p class="ab-log-title">자동화 트랙 정비</p><p class="ab-log-desc">자동화 트랙의 실습 단계를 처음부터 끝까지 다시 점검했습니다. 따라 하다 막히는 자리를 줄이려고 단계를 더 촘촘히 나눴습니다. 관련 슬라이드 자료도 같은 기준으로 손봤습니다.</p></div>
                            </div>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v1.8</span><span class="ab-date">2026-04-19</span></div>
                                <div><p class="ab-log-title">진단 트랙 재설계</p><p class="ab-log-desc">자율주행 1~5단계 비유를 빌려 진단 트랙을 다시 설계했습니다. 자기 AI 활용 수준을 스스로 가늠하고 다음 단계를 찾게 했습니다. 이 진단이 커리큘럼의 새 입구입니다.</p></div>
                            </div>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v1.7</span><span class="ab-date">2026-04-12</span></div>
                                <div><p class="ab-log-title">실습 자산 정리</p><p class="ab-log-desc">흩어져 있던 실습 결과물과 부록 페이지를 한곳에 모았습니다. 필요한 자료를 빨리 찾도록 분류 기준을 세웠습니다. 앞으로 자산이 쌓일 자리도 미리 마련했습니다.</p></div>
                            </div>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v1.6</span><span class="ab-date">2026-04-05</span></div>
                                <div><p class="ab-log-title">백과사전 보강</p><p class="ab-log-desc">용어와 개념을 다루는 백과사전 페이지를 크게 늘렸습니다. 본문에서 모르는 말을 만나면 바로 확인하도록 연결했습니다. 자동화와 에이전트 트랙으로 넘어가는 동선도 정돈했습니다.</p></div>
                            </div>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v1.5</span><span class="ab-date">2026-03-29</span></div>
                                <div><p class="ab-log-title">에이전트 설계 트랙 연결 강화</p><p class="ab-log-desc">에이전트 설계 트랙을 Solo에서 Orchestra로 이어지는 성장 단계와 네 가지 도구에 맞춰 다시 연결했습니다. 도구마다 다음 단계로 넘어가는 맥락을 더해 무엇을 먼저 볼지 분명해졌습니다. 768·480px 모바일 반응형도 함께 보강했습니다.</p></div>
                            </div>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v1.4</span><span class="ab-date">2026-03-22</span></div>
                                <div><p class="ab-log-title">앤트로픽 소개 작성</p><p class="ab-log-desc">Claude를 만든 앤트로픽이 어떤 회사인지 소개하는 글을 새로 썼습니다. 회사의 방향과 안전 중심 철학을 비즈니스 리더의 눈높이로 정리했습니다. 도구보다 만든 곳을 먼저 보게 하는 글입니다.</p></div>
                            </div>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v1.3</span><span class="ab-date">2026-03-15</span></div>
                                <div><p class="ab-log-title">학습 동선 보강</p><p class="ab-log-desc">처음 들어온 독자가 어디서 시작할지 헤매지 않도록 학습 동선을 보강했습니다. 단계별 안내 문구를 다듬어 다음 행동을 분명히 하고, 진입 페이지도 한결 읽기 쉽게 만들었습니다.</p></div>
                            </div>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v1.2</span><span class="ab-date">2026-03-08</span></div>
                                <div><p class="ab-log-title">디자인 정체성 도입</p><p class="ab-log-desc">뉴모피즘 시각 정체성을 입혀 사이트 인상을 하나로 맞췄습니다. 카드와 버튼의 질감을 고르게 맞추니 읽기도 쉬워졌습니다. 실전 과제 트랙도 이때부터 본격적으로 연결했습니다.</p></div>
                            </div>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v1.1</span><span class="ab-date">2026-03-01</span></div>
                                <div><p class="ab-log-title">비즈니스 리더 동선 보강</p><p class="ab-log-desc">코드를 모르는 비즈니스 리더를 위한 진단 동선을 따로 마련했습니다. 전문 지식이 없어도 자기 출발점을 찾도록 안내를 더했습니다. 모바일에서 먼저 읽는 사람을 위한 기본 안내도 함께 넣었습니다.</p></div>
                            </div>
                            <div class="ab-log-item">
                                <div class="ab-log-meta"><span class="ab-ver">v1.0</span><span class="ab-date">2026-02-24</span></div>
                                <div><p class="ab-log-title">첫 공개</p><p class="ab-log-desc">'Claude 완전 정복'의 첫 골격을 공개했습니다. 비즈니스 리더를 위한 5단계 구성의 뼈대를 세웠습니다. 이후 매주 채워 나간 출발점입니다.</p></div>
                            </div>
                        </details>
                    </div>
                    <p class="ab-note">2026년 2월 첫 공개 이후 매주 업데이트하고 있습니다.</p>
                </section>

                <section class="ab-sec" id="aboutLicense">
                    <p class="ab-eyebrow ab-latin">License</p>
                    <div class="ab-sec-head">
                        <h2 class="ab-sec-title" id="licenseTitle">저작권 안내</h2>
                        <span class="ab-sec-note">Copyright Notice</span>
                    </div>
                    <div class="ab-colophon">
                        <p class="ab-meta">Copyright (c) 2026 AI ROASTING <span class="ab-lic-author">(강정구 / jaydenjkang@gmail.com<button type="button" class="ab-copy" data-copy-text="jaydenjkang@gmail.com" aria-label="이메일 복사" title="이메일 복사"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>)</span><br>v1.0 · 2026-02-24</p>
                        <p>본 가이드의 저작권은 작성자에게 있습니다. 인용된 Anthropic 콘텐츠와 사용된 외부 자산(Pretendard Variable, MIT/Apache 2.0 등 오픈소스 라이브러리)은 각 권리자에게 귀속되며 해당 라이선스가 적용됩니다.</p>

                        <h3>1. 금지되는 행위</h3>
                        <ul>
                            <li>사전 서면 동의 없는 복제, 배포, 전송, 2차적 저작물 작성</li>
                            <li>상업적 활용 (강의, 교육 자료, 출판, 컨설팅, 사내 교육 포함)</li>
                            <li>저작권 표시·출처 정보의 제거나 변형</li>
                            <li>기계학습·생성형 AI 모델의 학습 데이터로 수집·사용</li>
                        </ul>

                        <h3>2. 허용되는 사용</h3>
                        <ul>
                            <li>개인 학습 목적의 열람과 참고</li>
                            <li>저작권법 제28조에 따른 정당한 인용 (출처 URL과 작성자 명시)</li>
                        </ul>

                        <h3>3. 사용 허가 신청</h3>
                        <p>상업적 사용이나 2차적 저작물 작성을 원하시면 jaydenjkang@gmail.com으로 사용 목적·범위·기간을 명시해 신청해 주십시오. 서면 회신으로 명시적 승인을 받은 경우에만 허가가 인정됩니다.</p>

                        <h3>4. 면책 및 준거법</h3>
                        <p>본 콘텐츠는 있는 그대로(as-is) 제공되며, 사용으로 발생한 손해에 대해 작성자는 책임을 지지 않습니다. 본 약관은 대한민국법에 따라 해석되며, 사전 고지 후 변경될 수 있습니다.</p>
                    </div>
                </section>
            </div>

            <div class="about-cta-bar">
                <div class="ab-cta-left">
                    <span class="ab-mini"><img src="assets/logos/logo1-transparent.png" alt="AI ROASTING 로고"></span>
                    <span class="ab-cta-name">강정구 <span>·</span> Jayden Kang</span>
                    <div class="ab-social">
                        <a href="https://www.linkedin.com/in/jayden-kang/" target="_blank" rel="noopener" aria-label="LinkedIn">
                            <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                        </a>
                        <a class="fb" href="https://www.facebook.com/jayden.kang" target="_blank" rel="noopener" aria-label="Facebook">
                            <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                    </div>
                </div>
                <a href="index.html#section-0" class="about-cta-btn" data-about-cta><span class="cta-prefix">가이드</span>시작하기 →</a>
            </div>
        </div>
    </article>
</div>`;

  // 1) CSS 주입 (full 모드에서만, 중복 방지)
  if (mode === 'full' && !document.getElementById('about-modal-style')) {
    var st = document.createElement('style');
    st.id = 'about-modal-style';
    st.textContent = CSS;
    document.head.appendChild(st);
  }

  // 2) 모달 HTML 주입 (이미 있으면 건너뜀)
  if (!document.getElementById('aboutOverlay')) {
    var wrap = document.createElement('div');
    wrap.innerHTML = HTML;
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
  }

  var overlay = document.getElementById('aboutOverlay');
  if (!overlay) return;
  var modalBody = overlay.querySelector('.about-modal-body');

  // 3) 책등 레일 — 섹션 이동과 현재 위치 표시.
  //    두 모드 모두에서 돌아야 하므로 markup 모드 조기 반환보다 앞에 둔다
  (function () {
    var links = [].slice.call(overlay.querySelectorAll('[data-about-nav]'));
    if (!links.length || !modalBody) return;
    var sections = links.map(function (a) {
      return { link: a, node: document.getElementById(a.getAttribute('data-about-nav')) };
    }).filter(function (s) { return s.node; });

    function mark(active) {
      sections.forEach(function (s) {
        var on = s.link === active;
        s.link.classList.toggle('is-on', on);
        if (on) s.link.setAttribute('aria-current', 'true');
        else s.link.removeAttribute('aria-current');
      });
    }
    sections.forEach(function (s) {
      s.link.addEventListener('click', function (e) {
        e.preventDefault();
        var top = s.node.getBoundingClientRect().top - modalBody.getBoundingClientRect().top + modalBody.scrollTop;
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        modalBody.scrollTo({ top: Math.max(0, top - 18), behavior: reduce ? 'auto' : 'smooth' });
        mark(s.link);
      });
    });
    var ticking = false;
    modalBody.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        var edge = modalBody.getBoundingClientRect().top + 90;
        var current = sections[0].link;
        sections.forEach(function (s) {
          if (s.node.getBoundingClientRect().top <= edge) current = s.link;
        });
        // 끝까지 내리면 마지막 항목을 켠다. 짧은 섹션은 임계선에 닿지 않는다
        if (modalBody.scrollTop + modalBody.clientHeight >= modalBody.scrollHeight - 4) {
          current = sections[sections.length - 1].link;
        }
        mark(current);
      });
    }, { passive: true });
  })();

  // markup 모드: 페이지가 자체 여닫기 스크립트를 가지므로 여기서 종료
  if (mode === 'markup') return;

  // 4) 동작 (full 모드)
  var closeBtn = document.getElementById('aboutClose');

  function setOpen(open) {
    document.body.classList.toggle('about-open', open);
    overlay.setAttribute('aria-hidden', open ? 'false' : 'true');
    if (open) {
      // 열려 있던 햄버거 메뉴(레거시/표준 둘 다)를 닫는다
      document.body.classList.remove('menu-open');
      document.body.classList.remove('sm-menu-open');
    }
  }
  function scrollToLicense() {
    setOpen(true);
    setTimeout(function () {
      var lic = document.getElementById('aboutLicense');
      if (lic) lic.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  }

  document.querySelectorAll('[data-about-open]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); setOpen(true); });
  });
  document.querySelectorAll('[data-license-open]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); scrollToLicense(); });
  });
  if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false); });

  document.querySelectorAll('[data-about-cta]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var href = el.getAttribute('href') || '';
      var hi = href.indexOf('#');
      setOpen(false);
      if (hi >= 0) {
        var target = document.querySelector(href.slice(hi));
        if (target) {
          e.preventDefault();
          setTimeout(function () { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
        }
        // 현재 페이지에 해당 섹션이 없으면 기본 이동(예: 콘텐츠 페이지 → index.html#section-0)
      }
    });
  });

  overlay.addEventListener('click', function (e) { if (e.target === overlay) setOpen(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && document.body.classList.contains('about-open')) setOpen(false);
  });

  // 이메일 복사 버튼
  document.querySelectorAll('[data-copy-text]').forEach(function (btn) {
    var originalHtml = btn.innerHTML;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy-text');
      var done = function () {
        btn.classList.add('copied');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
        setTimeout(function () { btn.classList.remove('copied'); btn.innerHTML = originalHtml; }, 1400);
      };
      var fallback = function () {
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (_) {}
        document.body.removeChild(ta);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else { fallback(); }
    });
  });

  // 진입 시 ?about=1 / ?license=1 지원
  var params = new URLSearchParams(window.location.search);
  if (params.has('license')) { scrollToLicense(); }
  else if (params.has('about')) { setOpen(true); }
})();
