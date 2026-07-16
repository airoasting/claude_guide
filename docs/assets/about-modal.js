/*
 * about-modal.js — 가이드 소개 모달 단일 소스
 * ─────────────────────────────────────────────
 * 모달의 콘텐츠(소개 카드·라이선스·업데이트 내역 CHANGELOG)는 이 파일에서만 수정한다.
 * 이 한 파일을 고치면 이 스크립트를 include 한 모든 페이지에 반영된다.
 *
 * 사용법:
 *   <script src="assets/about-modal.js"></script>
 *       → CSS + 모달 HTML + 동작을 모두 주입 (콘텐츠 페이지용)
 *   <script src="assets/about-modal.js" data-mode="markup"></script>
 *       → 모달 HTML 마크업만 주입. CSS·동작은 그 페이지가 자체적으로 보유 (index.html 용)
 */
(function () {
  var me = document.currentScript;
  var mode = (me && me.getAttribute('data-mode')) || 'full';

  var CSS = `        .about-overlay {
            display: none;
            position: fixed; inset: 0; z-index: 250;
            background: rgba(20,17,15,0.55);
            backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);
            opacity: 0; transition: opacity 0.25s;
            align-items: flex-start; justify-content: center;
            padding: 48px 20px;
            overflow-y: auto;
        }
        body.about-open .about-overlay { display: flex; opacity: 1; }
        body.about-open { overflow: hidden; }
        .about-modal {
            position: relative;
            background: #F6F2EC;
            border-radius: 24px;
            box-shadow: 0 24px 60px rgba(0,0,0,0.35);
            width: 100%; max-width: 920px;
            max-height: 700px;
            display: flex; flex-direction: column;
            overflow: hidden;
            transform: translateY(16px);
            opacity: 0;
            transition: transform 0.32s ease, opacity 0.32s ease;
        }
        body.about-open .about-modal { transform: translateY(0); opacity: 1; }
        .about-close {
            position: absolute; top: 14px; right: 14px; z-index: 5;
            width: 36px; height: 36px; border-radius: 10px;
            border: 1px solid rgba(0,0,0,0.08); background: #FFFFFF;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            cursor: pointer;
            color: #2D2622; transition: all 0.2s;
            display: flex; align-items: center; justify-content: center;
        }
        .about-close:hover { background: #F0EBE3; color: #1F1A17; }
        .about-close svg { width: 22px; height: 22px; }
        .about-modal-body {
            flex: 1 1 auto;
            overflow-y: auto;
            overscroll-behavior: contain;
            -webkit-overflow-scrolling: touch;
            padding: 26px 36px 20px;
        }
        .about-eyebrow {
            font-size: 12px; font-weight: 800; color: #A04828;
            letter-spacing: 3px; text-transform: uppercase;
            margin-bottom: 10px;
        }
        .about-quote {
            border-left: 4px solid #A04828;
            padding: 6px 0 6px 20px;
            margin-bottom: 18px;
        }
        .about-quote h1 {
            font-size: 24px; font-weight: 800; color: #2D2622;
            line-height: 1.4; margin: 0 0 8px; letter-spacing: -0.3px;
        }
        .about-quote p {
            font-size: 14px; color: #7A7570; line-height: 1.5; margin: 0;
        }
        .about-intro p {
            font-size: 15px; color: #3A3530; line-height: 1.7;
            margin-bottom: 10px;
        }
        .about-intro p:last-of-type { margin-bottom: 22px; }
        .about-intro strong { color: #1F1A17; font-weight: 800; }
        .about-cards-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 16px;
        }
        .about-card {
            background: #FFFFFF;
            border-radius: 16px;
            padding: 18px 22px;
            border: 1px solid rgba(74,53,7,0.10);
            box-shadow: 0 1px 0 rgba(0,0,0,0.04), 0 6px 18px rgba(74,53,7,0.05);
            transition: transform 0.25s ease, box-shadow 0.25s ease;
            cursor: default;
        }
        .about-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 2px 4px rgba(0,0,0,0.06), 0 12px 28px rgba(74,53,7,0.12);
        }
        .about-card-head {
            display: flex; align-items: center; gap: 12px;
            margin-bottom: 10px;
        }
        .about-card-num {
            width: 28px; height: 28px; border-radius: 50%;
            background: #A04828; color: #fff;
            display: flex; align-items: center; justify-content: center;
            font-size: 12px; font-weight: 800; letter-spacing: 0.5px;
            flex-shrink: 0;
        }
        .about-card.accent-2 .about-card-num { background: #B35535; }
        .about-card-title {
            font-size: 16px; font-weight: 800; color: #2D2622; letter-spacing: -0.2px;
        }
        .about-card p {
            font-size: 14px; color: #4A433D; line-height: 1.7;
            margin: 0 0 8px;
        }
        .about-card p:last-child { margin-bottom: 0; }
        .about-card strong { color: #1F1A17; font-weight: 800; }
        .about-card .about-lede {
            font-size: 13px; color: #7A7570; font-style: normal;
            margin-bottom: 10px;
        }
        .about-sublist {
            list-style: none; margin: 0; padding: 0;
        }
        .about-sublist li {
            display: flex; align-items: center; gap: 12px;
            padding: 5px 0;
            font-size: 14px; color: #3A3530; line-height: 1.5;
        }
        .about-sublist .ab-roman {
            display: flex; align-items: center; justify-content: center;
            width: 26px; height: 26px; border-radius: 50%;
            border: 1.5px solid #B35535; color: #A04828;
            font-size: 12px; font-weight: 800;
            flex-shrink: 0; font-family: 'Times New Roman', serif;
            font-style: normal;
        }
        .about-byline-name {
            font-size: 13px; font-weight: 700; color: #3A3530;
        }
        .about-byline-name span { color: #A04828; }
        .about-byline-meta {
            font-size: 12px; color: #7A7570; line-height: 1.4;
        }
        .about-byline-link {
            color: #A04828; font-weight: 700; text-decoration: none;
            border-bottom: 1px solid rgba(160,72,40,0.4);
            transition: border-color 0.2s;
        }
        .about-byline-link:hover { border-bottom-color: #A04828; }
        .about-byline-icons { display: flex; gap: 6px; flex-shrink: 0; }
        .about-byline-icons a {
            display: inline-flex; align-items: center; justify-content: center;
            width: 28px; height: 28px; border-radius: 7px;
            background: #B0AAA3; color: #fff;
            text-decoration: none; transition: background 0.2s, transform 0.15s;
        }
        .about-byline-icons a:hover { background: #0A66C2; transform: translateY(-2px); }
        .about-byline-icons a.fb:hover { background: #1877F2; }
        .about-byline-icons svg { width: 13px; height: 13px; fill: #fff; }
        .about-license-section {
            margin-top: 28px;
            padding-top: 28px;
            border-top: 1px solid rgba(0,0,0,0.08);
        }
        .about-cta-bar {
            flex-shrink: 0;
            padding: 12px 32px;
            background: #F0EBE3;
            border-top: 1px solid rgba(0,0,0,0.06);
            display: flex; align-items: center; justify-content: space-between;
            gap: 12px;
        }
        .about-cta-left {
            display: flex; align-items: center; gap: 10px;
        }
        .about-byline-logo {
            display: inline-flex; align-items: center; justify-content: center;
            width: 20px; height: 20px; border-radius: 50%;
            background: #fff;
            box-shadow: 0 0 0 0.5px rgba(58,53,48,0.18);
            flex-shrink: 0;
        }
        .about-byline-logo img {
            width: 20px; height: 20px; display: block; border-radius: 50%;
        }
        .about-cta-btn {
            display: inline-flex; align-items: center; gap: 8px;
            height: 40px;
            padding: 0 22px;
            background: #2D2622; color: #fff;
            border-radius: 999px;
            font-size: 14px; font-weight: 700;
            text-decoration: none; transition: all 0.2s;
            white-space: nowrap;
            box-sizing: border-box;
        }
        .about-cta-btn:hover { background: #A04828; transform: translateY(-1px); }
        /* ── 라이선스 (About 모달 내장) ── */
        .license-title {
            font-size: 22px; font-weight: 800; color: #2D2622;
            line-height: 1.3; margin: 0 0 18px; letter-spacing: -0.3px;
        }
        .license-text {
            margin: 0;
            font-family: inherit;
            font-size: 13.5px; color: #3A3530; line-height: 1.65;
            word-break: keep-all;
            background: #FFFFFF;
            border-radius: 12px;
            padding: 16px 22px 14px;
            border: 1px solid rgba(0,0,0,0.05);
        }
        .license-text .lic-meta { margin: 0 0 0.3em; line-height: 1.55; }
        .license-text h3 {
            margin: 0.9em 0 0.25em;
            font-size: 13.5px; font-weight: 700; color: #2D2622;
            line-height: 1.5;
        }
        .license-text h3:first-of-type { margin-top: 0.8em; }
        .license-text .lic-body { margin: 0 0 0.3em; padding-left: 1.4em; }
        .license-text ul {
            margin: 0.2em 0 0.5em;
            padding-left: 2.6em;
            list-style: disc;
        }
        .license-text ul li { margin: 0.1em 0; }
        .lic-copy {
            display: inline-flex; align-items: center; justify-content: center;
            width: 18px; height: 18px;
            margin-left: 4px; padding: 0;
            background: transparent;
            border: 1px solid rgba(0,0,0,0.18);
            border-radius: 4px;
            color: #7A7570; cursor: pointer;
            vertical-align: -3px;
            transition: all 0.15s;
        }
        .lic-copy:hover { background: rgba(0,0,0,0.05); color: #2D2622; border-color: rgba(0,0,0,0.35); }
        .lic-copy svg { width: 11px; height: 11px; }
        .lic-copy.copied { background: #2D8A4E; color: #fff; border-color: #2D8A4E; }
        /* ── 업데이트 내역 (About 모달 내장) ── */
        .about-changelog-section { margin-top: 22px; }
        .changelog-list {
            margin: 0; max-height: 300px; overflow-y: auto;
            background: #FFFFFF; border-radius: 12px;
            padding: 4px 22px; border: 1px solid rgba(0,0,0,0.05);
        }
        .changelog-item {
            display: grid; grid-template-columns: 96px 1fr; gap: 16px;
            padding: 13px 0; border-bottom: 1px solid rgba(0,0,0,0.06);
        }
        .changelog-item:last-child { border-bottom: none; }
        .changelog-meta { display: flex; flex-direction: column; gap: 4px; }
        .changelog-ver {
            align-self: flex-start; font-size: 12px; font-weight: 800; color: #B45309;
            background: rgba(217,119,6,0.10); border-radius: 6px; padding: 1px 8px; letter-spacing: 0.2px;
        }
        .changelog-date { font-size: 11.5px; color: #9A938C; }
        .changelog-title { font-size: 13.5px; font-weight: 700; color: #2D2622; margin: 0 0 3px; line-height: 1.4; }
        .changelog-desc { font-size: 12.5px; color: #6A645E; margin: 0; line-height: 1.55; word-break: keep-all; }
        @media (max-width: 768px) {
            .changelog-list { padding: 4px 18px; }
            .changelog-item { grid-template-columns: 1fr; gap: 6px; padding: 12px 0; }
            .changelog-meta { flex-direction: row; align-items: center; gap: 8px; }
        }
        .license-footnote {
            margin: 16px 0 0;
            font-size: 12.5px; color: #7A7570; line-height: 1.6;
        }
        @media (max-width: 768px) {
            .about-overlay {
                padding: max(20px, env(safe-area-inset-top)) 16px max(20px, env(safe-area-inset-bottom));
                align-items: center;
            }
            .about-modal {
                border-radius: 18px;
                max-height: calc(100vh - 40px);
                max-height: calc(100dvh - 40px);
                max-width: none;
            }
            .about-modal-body { padding: 44px 20px 16px; }
            .about-quote h1 { font-size: 21px; }
            .about-cards-grid { grid-template-columns: 1fr; gap: 10px; }
            .about-card { padding: 16px 18px; border-radius: 14px; }
            .about-intro p { font-size: 14px; }
            .about-cta-bar { padding: 10px 14px; justify-content: space-between; gap: 8px; }
            .about-cta-left { display: flex; align-items: center; gap: 7px; min-width: 0; }
            .about-cta-left .about-byline-logo { display: none; }
            .about-byline-name { font-size: 12px; white-space: nowrap; }
            .about-byline-icons { gap: 5px; }
            .about-byline-icons a { width: 26px; height: 26px; }
            .about-cta-btn { justify-content: center; flex-shrink: 0; padding: 0 16px; font-size: 13px; }
            .about-cta-btn .cta-prefix { display: none; }
            .license-title { font-size: 19px; }
            .license-text { font-size: 13px; padding: 16px 18px; }
            .lic-author { display: block; }
        }`;
  var HTML = `<div class="about-overlay" id="aboutOverlay" role="dialog" aria-modal="true" aria-labelledby="aboutTitle" aria-hidden="true">
    <article class="about-modal" role="document">
        <button class="about-close" id="aboutClose" aria-label="닫기" type="button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>
        </button>

        <div class="about-modal-body">
            <p class="about-eyebrow">ABOUT</p>

            <div class="about-quote">
                <h1 id="aboutTitle">"개발 말고, 비즈니스용으로는 Claude를 어떻게 써야 하나요?"</h1>
                <p>AI 이야기를 나누면서 가장 자주 받는 질문입니다.</p>
            </div>

            <div class="about-intro">
                <p>시중에 나와 있는 Claude 자료는 대부분 개발자를 대상으로 합니다. 그래서 이 가이드는 <strong>비즈니스 리더가 의사결정과 보고, 자동화에 바로 활용할 수 있도록</strong> 같은 도구를 비즈니스 관점으로 다시 정리한 자료입니다.</p>
                <p>코드를 한 줄도 모르는 리더도 진단부터 자동화까지 한 번에 따라올 수 있도록 전체 내용을 5단계로 구성했습니다.</p>
            </div>

            <div class="about-cards-grid">
                <section class="about-card" id="aboutWhy">
                    <div class="about-card-head">
                        <span class="about-card-num">01</span>
                        <span class="about-card-title">왜 만들었나요</span>
                    </div>
                    <p>AI 강의에서 가장 자주 받는 질문이 있습니다. "프롬프트는 어떻게 써야 잘 쓰나요?", "Claude Code는 어떻게 쓰나요?" 같은 질문입니다.<br><br>매번 같은 답을 반복하는 대신, <strong>한 권으로 정리된 표준 레퍼런스</strong>를 만들기로 했습니다. 이 가이드가 그 시작입니다.</p>
                </section>

                <section class="about-card accent-2">
                    <div class="about-card-head">
                        <span class="about-card-num">02</span>
                        <span class="about-card-title">선정 기준</span>
                    </div>
                    <p class="about-lede">모든 기능을 담지는 않았습니다. 다음 세 가지 기준을 모두 만족하는 내용만 골라 담았습니다.</p>
                    <ul class="about-sublist">
                        <li><span class="ab-roman">I</span><span>코드나 터미널 지식 없이도 바로 시작할 수 있을 것</span></li>
                        <li><span class="ab-roman">II</span><span>비즈니스 리더가 곧장 실무에 적용할 수 있을 것</span></li>
                        <li><span class="ab-roman">III</span><span>한국의 업무 환경(보고, 결재, 미팅, 문서)에 맞을 것</span></li>
                    </ul>
                </section>
            </div>

            <div id="aboutMaker" style="margin-top:24px;">
                <p class="about-eyebrow" style="margin-top:0;">BUILDER</p>
                <h2 class="license-title">만든 사람</h2>
                <div class="license-text">
                    <div style="display:flex; align-items:center; gap:14px; margin-bottom:14px;">
                        <span class="about-byline-logo" style="width:46px;height:46px;flex-shrink:0;"><img src="assets/logos/logo1-transparent.png" alt="AI ROASTING 로고" style="width:46px;height:46px;"></span>
                        <div style="flex:1; min-width:0;">
                            <p class="about-byline-name" style="font-size:16px; margin:0 0 3px;">강정구 <span>·</span> Jayden Kang</p>
                            <p style="margin:0; font-size:13px; color:#7A7570; line-height:1.5;">LINER AI 전략 총괄</p>
                        </div>
                        <div class="about-byline-icons" style="align-self:flex-start;">
                            <a href="https://www.linkedin.com/in/jayden-kang/" target="_blank" rel="noopener" aria-label="LinkedIn">
                                <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                            </a>
                            <a class="fb" href="https://www.facebook.com/jayden.kang" target="_blank" rel="noopener" aria-label="Facebook">
                                <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </a>
                        </div>
                    </div>
                    <p style="margin:0 0 14px; font-size:13.5px; color:#4A433D; line-height:1.65;">전략 컨설팅과 글로벌 사업 현장을 거치며 쌓은 경험을 바탕으로, 비즈니스 리더가 AI를 실무에 바로 적용하도록 이 가이드를 직접 만들고 매주 업데이트합니다.</p>
                    <ul style="list-style:none; margin:0; padding:14px 0 0; border-top:1px solid rgba(0,0,0,0.07);">
                        <li style="position:relative; padding:5px 0 5px 16px; font-size:13.5px; line-height:1.55;"><span style="position:absolute; left:2px; top:5px; color:#A04828;">•</span><strong style="color:#2D2622; font-weight:700;">LINER</strong><span style="color:#6A645E;"> · AI 전략 총괄</span></li>
                        <li style="position:relative; padding:5px 0 5px 16px; font-size:13.5px; line-height:1.55;"><span style="position:absolute; left:2px; top:5px; color:#A04828;">•</span><strong style="color:#2D2622; font-weight:700;">국민경제자문회의</strong><span style="color:#6A645E;"> · AI경제 정책자문단 위원</span></li>
                        <li style="position:relative; padding:5px 0 5px 16px; font-size:13.5px; line-height:1.55;"><span style="position:absolute; left:2px; top:5px; color:#A04828;">•</span><span style="color:#9A938C; font-weight:600;">전)</span> <strong style="color:#2D2622; font-weight:700;">카카오엔터테인먼트</strong><span style="color:#6A645E;"> · 글로벌사업 본부장</span></li>
                        <li style="position:relative; padding:5px 0 5px 16px; font-size:13.5px; line-height:1.55;"><span style="position:absolute; left:2px; top:5px; color:#A04828;">•</span><span style="color:#9A938C; font-weight:600;">전)</span> <strong style="color:#2D2622; font-weight:700;">미국 타파스엔터테인먼트</strong><span style="color:#6A645E;"> · 최고운영책임(COO)</span></li>
                        <li style="position:relative; padding:5px 0 5px 16px; font-size:13.5px; line-height:1.55;"><span style="position:absolute; left:2px; top:5px; color:#A04828;">•</span><span style="color:#9A938C; font-weight:600;">전)</span> <strong style="color:#2D2622; font-weight:700;">라인(LINE)</strong><span style="color:#6A645E;"> · 태국 사업 최고전략책임(CSO)</span></li>
                        <li style="position:relative; padding:5px 0 5px 16px; font-size:13.5px; line-height:1.55;"><span style="position:absolute; left:2px; top:5px; color:#A04828;">•</span><span style="color:#9A938C; font-weight:600;">전)</span> <strong style="color:#2D2622; font-weight:700;">Bain &amp; Company</strong><span style="color:#6A645E;"> · 이사</span></li>
                        <li style="position:relative; padding:5px 0 5px 16px; font-size:13.5px; line-height:1.55;"><span style="position:absolute; left:2px; top:5px; color:#A04828;">•</span><span style="color:#9A938C; font-weight:600;">전)</span> <strong style="color:#2D2622; font-weight:700;">Kearney</strong><span style="color:#6A645E;"> · 팀장</span></li>
                    </ul>
                </div>
            </div>

            <div class="about-changelog-section" id="aboutChangelog">
                <p class="about-eyebrow" style="margin-top:0;">CHANGELOG</p>
                <h2 class="license-title">업데이트 내역</h2>
                <div class="changelog-list">
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v3.0</span><span class="changelog-date">2026-07-12</span></div>
                        <div class="changelog-body"><p class="changelog-title">AI와 함께 일하는 7단계 신설과 사이트 개편</p><p class="changelog-desc">스킬 다섯 개(slide_library·casting·5color·korean·council)를 목표부터 검증까지 하나로 잇는 'AI와 함께 일하는 7단계' 실전 예제를 새로 만들었습니다. 예제 세 페이지(MCP 연결·7단계·책 쓰기)의 상단 메뉴를 통일하고, 일곱 단계는 키보드로도 펼치는 접근성 아코디언으로 담았습니다. 사이트 폴더 구조와 내비게이션을 정돈했고, 카드와 헤더 아이콘은 이모지에서 흰 타일 위 오렌지 라인 SVG로 전면 교체했습니다. 메인 '다른 콘텐츠'에 검색 스킬 Hound를 더하고, 하네스·루프 트랙의 도식과 인용 출처 표기도 보강했습니다.</p></div></div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v2.9</span><span class="changelog-date">2026-07-05</span></div>
                        <div class="changelog-body"><p class="changelog-title">다른 콘텐츠 개편과 앤트로픽 소개 최신화</p><p class="changelog-desc">메인 '다른 콘텐츠' 링크를 10선으로 다시 골라 한국어 윤문 스킬과 GPT 이미지 프롬프트 랩을 더했습니다. 실전 예제의 기본 예제 세 과제는 구성을 가볍게 하려 백업으로 내렸습니다. 앤트로픽 소개(엿보기)에는 6월 말 소네트 5와 클로드 사이언스 공개, 페이블 5의 수출통제 해제와 재공개까지 최신 소식을 반영하고, 히어로의 최신 모델 표기를 Fable 5·Opus 4.8·Sonnet 5로 갱신했습니다.</p></div></div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v2.8</span><span class="changelog-date">2026-06-28</span></div>
                        <div class="changelog-body"><p class="changelog-title">스킬 라이브러리 확장과 라이선스 정리</p><p class="changelog-desc">수강생이 직접 만든 스킬을 더해 스킬 쇼케이스를 21선으로 늘렸습니다. 전 스킬의 README와 라이선스를 MIT로 통일하고, 샘플에 노출된 실명과 연락처를 모두 익명화했습니다. 검증 트랙(동조·환각)에는 1차 출처로 교차검증한 실제 사례를 보강했고, 용어 사전에 PowerShell과 파이썬을 더해 73선으로 확장했습니다.</p></div></div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v2.7</span><span class="changelog-date">2026-06-21</span></div>
                        <div class="changelog-body"><p class="changelog-title">쇼케이스 보강</p><p class="changelog-desc">수강생들이 직접 만든 결과물을 모은 수강생 쇼케이스를 새로 정리했습니다. 전 세계 클로드 코드 해커톤 우승작 14선을 모은 쇼케이스도 함께 보강했습니다. 실제 사례로 무엇까지 가능한지 한눈에 보도록 구성했습니다.</p></div></div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v2.6</span><span class="changelog-date">2026-06-14</span></div>
                        <div class="changelog-body"><p class="changelog-title">루프 엔지니어링 트랙 신설</p><p class="changelog-desc">행동하고 검증해 다시 도는 피드백 루프를 다루는 '루프 엔지니어링' 트랙을 새로 열었습니다. 클로드 코드 /loop 페이지와 정해진 시각에 무인으로 실행되는 Routines 예약 페이지를 더했습니다. 프롬프트 작성법에는 위임 4요소(목표·채점·검증·멈춤)를 보강했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v2.5</span><span class="changelog-date">2026-06-07</span></div>
                        <div class="changelog-body"><p class="changelog-title">보안 가이드와 하네스 엔지니어링 보강</p><p class="changelog-desc">비즈니스 리더를 위한 AI 협업 보안 다섯 가지 원칙을 새로 정리했습니다. 하네스 엔지니어링 실전 트랙의 세 카드(하네스 엔지니어링·Claude의 도구·다이내믹 워크플로우)도 다시 다듬었습니다. 개념과 실습이 한 흐름으로 이어지도록 구성을 손봤습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v2.4</span><span class="changelog-date">2026-05-31</span></div>
                        <div class="changelog-body"><p class="changelog-title">한국 법령 MCP 예제 추가</p><p class="changelog-desc">Claude 데스크톱 커넥터로 법제처 Open API를 연결하는 한국 법령 MCP 예제를 더했습니다. 공공 데이터를 실무 흐름에 직접 붙이는 과정을 단계별로 담았습니다. 리더가 사례를 그대로 따라 할 수 있도록 구성했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v2.3</span><span class="changelog-date">2026-05-24</span></div>
                        <div class="changelog-body"><p class="changelog-title">용어 사전 6막 재구성</p><p class="changelog-desc">AI 70년의 흐름을 6막 60선으로 풀어낸 용어 사전을 새로 짰습니다. 개념이 등장한 배경과 맥락을 이야기처럼 잇도록 구성했습니다. 관련 외부 자산과의 연결도 함께 정비했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v2.2</span><span class="changelog-date">2026-05-17</span></div>
                        <div class="changelog-body"><p class="changelog-title">사이트 표준화</p><p class="changelog-desc">사이트 전반의 본문 폭과 헤더 메뉴를 하나의 기준으로 통일했습니다. 페이지마다 달랐던 레이아웃을 정돈해 읽기 흐름을 매끄럽게 했습니다. 이후 작업의 토대가 될 운영 문서 체계도 함께 자리 잡았습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v2.1</span><span class="changelog-date">2026-05-10</span></div>
                        <div class="changelog-body"><p class="changelog-title">공유 미리보기와 강의 자료 보강</p><p class="changelog-desc">링크를 공유할 때 표시되는 미리보기 정보(메타 태그)를 정리했습니다. 카카오톡이나 슬랙에서도 제목과 설명이 제대로 노출되도록 다듬었습니다. 강의에 바로 쓸 수 있게 슬라이드 흐름과 예시 자료도 보강했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v2.0</span><span class="changelog-date">2026-05-03</span></div>
                        <div class="changelog-body"><p class="changelog-title">모바일 최적화와 첫 화면 개편</p><p class="changelog-desc">모바일 사용성을 전면적으로 손봤습니다. 작은 화면에서도 단계 학습이 끊기지 않도록 내비게이션과 카드 배치를 다시 짰습니다. 첫 화면과 안내 모달도 새로 구성해 진입 인상을 정돈했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v1.9</span><span class="changelog-date">2026-04-26</span></div>
                        <div class="changelog-body"><p class="changelog-title">자동화 트랙 정비</p><p class="changelog-desc">자동화 트랙의 실습 흐름을 처음부터 끝까지 다시 점검했습니다. 따라 하다 막히는 지점을 줄이도록 단계를 촘촘히 나눴습니다. 관련 슬라이드 자료도 같은 기준으로 손봤습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v1.8</span><span class="changelog-date">2026-04-19</span></div>
                        <div class="changelog-body"><p class="changelog-title">진단 트랙 재설계</p><p class="changelog-desc">자율주행 1~5단계 비유를 바탕으로 진단 트랙을 다시 설계했습니다. 자신의 AI 활용 수준을 스스로 가늠하고 다음 단계를 찾도록 구성했습니다. 이 진단을 커리큘럼의 입구로 새로 잡았습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v1.7</span><span class="changelog-date">2026-04-12</span></div>
                        <div class="changelog-body"><p class="changelog-title">실습 자산 정리</p><p class="changelog-desc">흩어져 있던 실습 결과물과 부록 페이지를 한곳으로 모았습니다. 필요한 자료를 빠르게 찾도록 분류 기준을 정리했습니다. 앞으로 자산이 쌓일 구조를 미리 마련했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v1.6</span><span class="changelog-date">2026-04-05</span></div>
                        <div class="changelog-body"><p class="changelog-title">백과사전 보강</p><p class="changelog-desc">용어와 개념을 다루는 백과사전 페이지를 큰 폭으로 늘렸습니다. 본문에서 모르는 말을 만나면 바로 확인하도록 연결했습니다. 자동화와 에이전트 트랙으로 이어지는 동선도 정돈했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v1.5</span><span class="changelog-date">2026-03-29</span></div>
                        <div class="changelog-body"><p class="changelog-title">에이전트 설계 트랙 연결 강화</p><p class="changelog-desc">에이전트 설계 트랙을 Solo에서 Orchestra로 이어지는 성장 단계와 네 가지 도구에 맞춰 다시 연결했습니다. 각 도구 섹션에 다음 단계로 넘어가는 맥락을 더해 학습 흐름을 매끄럽게 다듬었습니다. 768·480px 모바일 반응형도 함께 보강했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v1.4</span><span class="changelog-date">2026-03-22</span></div>
                        <div class="changelog-body"><p class="changelog-title">앤트로픽 소개 작성</p><p class="changelog-desc">Claude를 만든 앤트로픽이 어떤 회사인지 소개하는 글을 새로 작성했습니다. 회사의 방향과 안전 중심 철학을 비즈니스 리더의 눈높이로 정리했습니다. 도구를 쓰기 전에 만든 곳부터 이해하도록 안내했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v1.3</span><span class="changelog-date">2026-03-15</span></div>
                        <div class="changelog-body"><p class="changelog-title">학습 동선 보강</p><p class="changelog-desc">처음 들어온 독자가 어디서 시작할지 헤매지 않도록 학습 동선을 보강했습니다. 단계별 안내 문구를 다듬어 다음 행동을 분명히 했습니다. 진입 페이지의 흐름을 한결 매끄럽게 만들었습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v1.2</span><span class="changelog-date">2026-03-08</span></div>
                        <div class="changelog-body"><p class="changelog-title">디자인 정체성 도입</p><p class="changelog-desc">뉴모피즘 기반의 시각 정체성을 도입해 사이트의 인상을 통일했습니다. 카드와 버튼의 질감을 일관되게 맞춰 가독성을 높였습니다. 실전 과제 트랙도 본격적으로 연결하기 시작했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v1.1</span><span class="changelog-date">2026-03-01</span></div>
                        <div class="changelog-body"><p class="changelog-title">비즈니스 리더 동선 보강</p><p class="changelog-desc">코드를 모르는 비즈니스 리더를 위한 진단 동선을 따로 마련했습니다. 전문 지식이 없어도 자신의 출발점을 찾도록 안내를 더했습니다. 모바일 환경을 위한 기본 안내도 함께 추가했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v1.0</span><span class="changelog-date">2026-02-24</span></div>
                        <div class="changelog-body"><p class="changelog-title">첫 공개</p><p class="changelog-desc">'Claude 완전 정복'의 첫 골격을 처음으로 공개했습니다. 비즈니스 리더를 위한 5단계 구성의 뼈대를 세웠습니다. 이후 매주 채워 나갈 출발점이 된 버전입니다.</p></div>
                    </div>
                </div>
                <p class="license-footnote">2026년 2월 첫 공개 이후 매주 일요일마다 업데이트하며 0.1씩 버전을 올리고 있습니다.</p>
            </div>

            <div class="about-license-section" id="aboutLicense">
                <p class="about-eyebrow" style="margin-top:0;">LICENSE</p>
                <h2 class="license-title" id="licenseTitle">저작권 안내 (Copyright Notice)</h2>
                <div class="license-text">
                    <p class="lic-meta">Copyright (c) 2026 AI ROASTING <span class="lic-author">(강정구 / jaydenjkang@gmail.com<button type="button" class="lic-copy" data-copy-text="jaydenjkang@gmail.com" aria-label="이메일 복사" title="이메일 복사"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>)</span><br>v1.0 · 2026-02-24</p>
                    <p class="lic-meta">본 가이드의 저작권은 작성자에게 있습니다. 인용된 Anthropic 콘텐츠와 사용된 외부 자산(Pretendard Variable, MIT/Apache 2.0 등 오픈소스 라이브러리)은 각 권리자에게 귀속되며 해당 라이선스가 적용됩니다.</p>

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
                    <p class="lic-body">상업적 사용이나 2차적 저작물 작성을 원하시면 jaydenjkang@gmail.com으로 사용 목적·범위·기간을 명시해 신청해 주십시오. 서면 회신으로 명시적 승인을 받은 경우에만 허가가 인정됩니다.</p>

                    <h3>4. 면책 및 준거법</h3>
                    <p class="lic-body">본 콘텐츠는 있는 그대로(as-is) 제공되며, 사용으로 발생한 손해에 대해 작성자는 책임을 지지 않습니다. 본 약관은 대한민국법에 따라 해석되며, 사전 고지 후 변경될 수 있습니다.</p>
                </div>
            </div>
        </div>

        <div class="about-cta-bar">
            <div class="about-cta-left">
                <span class="about-byline-logo"><img src="assets/logos/logo1-transparent.png" alt="AI ROASTING 로고"></span>
                <span class="about-byline-name">강정구 <span>·</span> Jayden Kang</span>
                <div class="about-byline-icons">
                    <a href="https://www.linkedin.com/in/jayden-kang/" target="_blank" rel="noopener" aria-label="LinkedIn">
                        <svg viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                    </a>
                    <a class="fb" href="https://www.facebook.com/jayden.kang" target="_blank" rel="noopener" aria-label="Facebook">
                        <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                </div>
            </div>
            <a href="index.html#section-1" class="about-cta-btn" data-about-cta><span class="cta-prefix">가이드</span>시작하기 →</a>
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

  // markup 모드: 페이지가 자체 동작 스크립트를 가지므로 여기서 종료
  if (mode === 'markup') return;

  // 3) 동작 (full 모드)
  var overlay = document.getElementById('aboutOverlay');
  if (!overlay) return;
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
        // 현재 페이지에 해당 섹션이 없으면 기본 이동(예: 콘텐츠 페이지 → index.html#section-1)
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
