/*
 * about-modal.js: 가이드 소개 모달 단일 소스
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
            font-size: 12px; font-weight: 800; color: #A50034;
            letter-spacing: 3px; text-transform: uppercase;
            margin-bottom: 10px;
        }
        .about-quote {
            padding: 6px 0;
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
            background: #A50034; color: #fff;
            display: flex; align-items: center; justify-content: center;
            font-size: 12px; font-weight: 800; letter-spacing: 0.5px;
            flex-shrink: 0;
        }
        .about-card.accent-2 .about-card-num { background: #C8123E; }
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
            border: 1.5px solid #C8123E; color: #A50034;
            font-size: 12px; font-weight: 800;
            flex-shrink: 0; font-family: 'Times New Roman', serif;
            font-style: normal;
        }
        .about-byline-name {
            font-size: 13px; font-weight: 700; color: #3A3530;
        }
        .about-byline-name span { color: #A50034; }
        .about-byline-meta {
            font-size: 12px; color: #7A7570; line-height: 1.4;
        }
        .about-byline-link {
            color: #A50034; font-weight: 700; text-decoration: none;
            border-bottom: 1px solid rgba(165,0,52,0.4);
            transition: border-color 0.2s;
        }
        .about-byline-link:hover { border-bottom-color: #A50034; }
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
        .about-cta-btn:hover { background: #A50034; transform: translateY(-1px); }
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
            .about-cta-bar { padding: 10px 16px; justify-content: center; }
            .about-cta-left { display: none; }
            .about-cta-btn { justify-content: center; flex: 1; }
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
                <section class="about-card">
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

            <div class="about-license-section" id="aboutLicense">
                <p class="about-eyebrow" style="margin-top:0;">LICENSE</p>
                <h2 class="license-title" id="licenseTitle">저작권 안내 (Copyright Notice)</h2>
                <div class="license-text">
                    <p class="lic-meta">Copyright (c) 2026 AI ROASTING <span class="lic-author">(강정구 / jaydenjkang@gmail.com<button type="button" class="lic-copy" data-copy-text="jaydenjkang@gmail.com" aria-label="이메일 복사" title="이메일 복사"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></button>)</span><br>v1.0 · 2026-02-15</p>
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

            <div class="about-changelog-section">
                <p class="about-eyebrow" style="margin-top:0;">CHANGELOG</p>
                <h2 class="license-title">업데이트 내역</h2>
                <div class="changelog-list">
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v1.5.0</span><span class="changelog-date">2026-06-07</span></div>
                        <div class="changelog-body"><p class="changelog-title">보안 가이드 · 하네스 엔지니어링 개념 설명 업데이트</p><p class="changelog-desc">비즈니스 리더용 AI 협업 보안 5가지 가이드라인을 추가했습니다. 하네스 엔지니어링 실전 트랙의 카드 3개(하네스 엔지니어링·Claude의 도구·멀티 에이전트 소환)도 새로 정비했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v1.4.0</span><span class="changelog-date">2026-05-31</span></div>
                        <div class="changelog-body"><p class="changelog-title">한국 법령 MCP 예제 추가</p><p class="changelog-desc">Claude Desktop 커넥터로 법제처 Open API를 연결하는 실전 흐름을 더했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v1.3.0</span><span class="changelog-date">2026-05-24</span></div>
                        <div class="changelog-body"><p class="changelog-title">용어 사전 6막 재구성</p><p class="changelog-desc">AI 70년사를 6막 60선 흐름으로 풀어낸 용어 사전을 새로 짜고 외부 자산 연결을 정비했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v1.2.0</span><span class="changelog-date">2026-05-17</span></div>
                        <div class="changelog-body"><p class="changelog-title">표준화</p><p class="changelog-desc">사이트 전반의 본문 폭과 헤더 메뉴를 통일하고 운영 문서 체계를 정착시켰습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v1.1.0</span><span class="changelog-date">2026-05-10</span></div>
                        <div class="changelog-body"><p class="changelog-title">공유 미리보기 + 강의 자료 보강</p><p class="changelog-desc">링크를 공유할 때 보이는 미리보기 정보(메타 태그)를 정리하고, 강의에 바로 쓸 수 있도록 슬라이드 흐름과 예시 자료를 보강했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v1.0.0</span><span class="changelog-date">2026-05-03</span></div>
                        <div class="changelog-body"><p class="changelog-title">모바일 최적화 + 첫 화면 리뉴얼</p><p class="changelog-desc">모바일 사용성을 전면 보강하고 첫 화면과 안내 모달을 새로 짰습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v0.8.0</span><span class="changelog-date">2026-04-26</span></div>
                        <div class="changelog-body"><p class="changelog-title">자동화 트랙 정비</p><p class="changelog-desc">자동화 트랙의 실습 흐름과 슬라이드 자료를 다듬었습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v0.7.0</span><span class="changelog-date">2026-04-19</span></div>
                        <div class="changelog-body"><p class="changelog-title">진단 트랙 재설계</p><p class="changelog-desc">자율주행 비유 기반 5단계 진단 트랙으로 커리큘럼 입구를 다시 설계했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v0.6.0</span><span class="changelog-date">2026-04-12</span></div>
                        <div class="changelog-body"><p class="changelog-title">자산 정리</p><p class="changelog-desc">실습 결과물과 부록 페이지를 한곳으로 정리했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v0.5.0</span><span class="changelog-date">2026-04-05</span></div>
                        <div class="changelog-body"><p class="changelog-title">백과사전 보강</p><p class="changelog-desc">백과사전 페이지를 늘리고 자동화·에이전트 트랙 연결을 정돈했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v0.4.0</span><span class="changelog-date">2026-03-22</span></div>
                        <div class="changelog-body"><p class="changelog-title">학습 동선 보강</p><p class="changelog-desc">진입 페이지의 학습 동선과 안내 문구를 보강했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v0.3.0</span><span class="changelog-date">2026-03-15</span></div>
                        <div class="changelog-body"><p class="changelog-title">시각적 정체성 + 실습 연결</p><p class="changelog-desc">뉴모피즘 디자인 시스템을 도입하고 실전 과제 트랙을 본격 연결했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v0.2.0</span><span class="changelog-date">2026-03-01</span></div>
                        <div class="changelog-body"><p class="changelog-title">비개발자 동선 보강</p><p class="changelog-desc">비개발자 독자를 위한 진단 동선과 모바일 안내를 추가했습니다.</p></div>
                    </div>
                    <div class="changelog-item">
                        <div class="changelog-meta"><span class="changelog-ver">v0.1.0</span><span class="changelog-date">2026-02-24</span></div>
                        <div class="changelog-body"><p class="changelog-title">첫 공개</p><p class="changelog-desc">'Claude 완전 정복' 첫 골격을 GitHub에 공개했습니다.</p></div>
                    </div>
                </div>
                <p class="license-footnote">매주 일요일을 기준 날짜로 그 주의 작업을 묶어 버전을 부여합니다. 메이저(전체 표준화·방향 전환), 마이너(새 페이지·기능·큰 디자인 변경), 패치(작은 수정·문구 정리) 순으로 자릿수를 올립니다.</p>
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
            <a href="index.html#section-1" class="about-cta-btn" data-about-cta>가이드 시작하기 →</a>
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
