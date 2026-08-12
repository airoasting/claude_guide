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

    /* 실제 배포 도메인에서만 수집한다. localhost 와 file:// 은 자동 제외된다.
       이 사이트는 여러 주소로 같은 내용이 떠 있다.
         airoasting.github.io/claude_guide/  GitHub Pages (main/docs)
         airoasting.com                      Vercel 커스텀 도메인, 루트로 서빙
         airoasting.vercel.app               Vercel 기본 주소, 같은 배포
       한쪽만 적으면 다른 쪽 방문자가 통째로 안 잡힌다. 배포처를 늘리면 여기도 늘린다.
       미리보기 배포(airoasting-git-*.vercel.app 등)는 이름이 달라 자동으로 빠진다.
       와일드카드를 쓰지 않는 이유가 이것이다. 시험 배포가 실제 통계를 더럽히면 안 된다. */
    var HOSTS = [
        'airoasting.github.io',
        'airoasting.com',
        'www.airoasting.com',
        'airoasting.vercel.app'
    ];

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
