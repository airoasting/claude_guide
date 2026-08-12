/* ============================================================
   ANALYTICS-STD · 트래픽 측정 단일 출처 (2026-08-12 신설)

   측정 ID는 아래 GA_ID 한 곳에서만 고친다.
   각 페이지에는 <!-- ANALYTICS-STD --> 마커로 감싼 script 한 줄만 들어간다.
   페이지 주입과 제거는 assets/js/inject-analytics.py 로 한다.

   수집을 멈추려면 GA_ID 를 'G-XXXXXXXXXX' 로 되돌리면 된다.
   페이지를 다시 손댈 필요가 없다.
   ============================================================ */
(function () {
    'use strict';

    /* GA4 측정 ID. analytics.google.com > 관리 > 데이터 스트림 에서 발급받는다.
       기본값(G-XXXXXXXXXX)이면 아무것도 수집하지 않는다. */
    var GA_ID = 'G-CXV10TSXZ5';

    /* 실제 배포 도메인에서만 수집한다. localhost 와 file:// 은 자동 제외된다. */
    var HOSTS = ['airoasting.github.io'];

    if (GA_ID === 'G-XXXXXXXXXX' || GA_ID.indexOf('G-') !== 0) return;
    if (HOSTS.indexOf(location.hostname) === -1) return;

    /* iframe 안에서 열린 경우는 세지 않는다. 쇼케이스 임베드 중복 집계를 막는다. */
    try { if (window.top !== window.self) return; } catch (e) { return; }

    var tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(tag);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_ID);
})();
