/* ====================================================================
   LGE 실습 미니 사이트 공유 스크립트
   1) 스크롤 reveal  2) sub-menu 스크롤스파이  3) 모바일 햄버거  4) 헤더 영상 자동재생
   ==================================================================== */

/* ── 1) 스크롤 reveal 애니메이션 ── */
(function () {
    var revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
})();

/* ── 2) sub-menu 스크롤스파이 ── */
(function () {
    var subMenu = document.getElementById('subMenu');
    if (!subMenu) return;
    var links = document.querySelectorAll('.sub-menu a[data-sec]');
    var sections = [];
    links.forEach(function (l) { var s = document.getElementById(l.dataset.sec); if (s) sections.push({ el: s, link: l }); });

    function docOffsetTop(el) {
        var top = 0;
        while (el) { top += el.offsetTop; el = el.offsetParent; }
        return top;
    }
    links.forEach(function (link) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            var id = link.getAttribute('href').substring(1);
            var target = document.getElementById(id);
            if (!target) return;
            target.classList.add('visible');
            var sib = target.nextElementSibling;
            if (sib && sib.classList.contains('reveal')) sib.classList.add('visible');
            var subMenuHeight = subMenu.offsetHeight;
            var gap = 4;
            var top = docOffsetTop(target) - subMenuHeight - gap;
            links.forEach(function (l) { l.classList.remove('active'); });
            link.classList.add('active');
            window.scrollTo({ top: top, behavior: 'smooth' });
            history.replaceState(null, '', '#' + id);
        });
    });

    function update() {
        var scrollY = window.scrollY + subMenu.offsetHeight + 16;
        var current = sections[0];
        for (var i = 0; i < sections.length; i++) { if (sections[i].el.offsetTop <= scrollY) current = sections[i]; }
        links.forEach(function (l) { l.classList.remove('active'); });
        if (current) current.link.classList.add('active');
        var al = document.querySelector('.sub-menu a.active');
        if (al) {
            var nav = subMenu;
            var lr = al.getBoundingClientRect(), nr = nav.getBoundingClientRect();
            if (lr.left < nr.left || lr.right > nr.right) {
                // 가로 서브메뉴만 스크롤한다. sticky 컨테이너 안에서 scrollIntoView를 부르면
                // 브라우저가 창을 서브메뉴의 원래(고정 전) 위치로 끌어올려 하단을 못 보게 만든다.
                var target = al.offsetLeft - (nav.clientWidth - al.clientWidth) / 2;
                nav.scrollTo({ left: target, behavior: 'smooth' });
            }
        }
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
})();

/* ── 3) 모바일 햄버거 메뉴 ── */
(function () {
    var src = document.querySelector('nav.sub-menu');
    var list = document.getElementById('smDrawerList');
    var toggle = document.getElementById('smMenuToggle');
    var backdrop = document.getElementById('smMenuBackdrop');
    var heading = document.getElementById('smDrawerHeading');
    if (heading) {
        var pageTitle = '';
        var activeLink = document.querySelector('.header-page-link.active');
        if (activeLink) { pageTitle = activeLink.textContent.trim(); }
        if (!pageTitle) { var h1 = document.querySelector('header h1'); if (h1) pageTitle = h1.textContent.trim(); }
        if (!pageTitle && document.title) { pageTitle = document.title.split('|')[0].trim(); }
        heading.textContent = pageTitle;
    }
    var srcLinks = src ? src.querySelectorAll('a') : [];
    var drawerItems = [];
    if (src && list) srcLinks.forEach(function (a) {
        var num = a.querySelector('.sm-num');
        var title = a.querySelector('.sm-title');
        var sub = a.querySelector('.sm-sub');
        var item = document.createElement('a');
        item.href = a.getAttribute('href');
        item.className = 'sm-drawer-item' + (a.classList.contains('active') ? ' active' : '');
        var html = '<span class="sm-drawer-num">' + (num ? num.textContent : '') + '</span>' +
            '<span class="sm-drawer-text">' +
            '<span class="sm-drawer-title">' + (title ? title.textContent : a.textContent.trim()) + '</span>';
        if (sub && sub.textContent.trim()) html += '<span class="sm-drawer-sub">' + sub.textContent + '</span>';
        html += '</span>';
        item.innerHTML = html;
        item.addEventListener('click', function () { setOpen(false); });
        list.appendChild(item);
        drawerItems.push(item);
    });
    function setOpen(open) {
        document.body.classList.toggle('sm-menu-open', open);
        if (toggle) {
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
        }
    }
    if (toggle) toggle.addEventListener('click', function () { setOpen(!document.body.classList.contains('sm-menu-open')); });
    if (backdrop) backdrop.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.body.classList.contains('sm-menu-open')) setOpen(false);
    });
    if (src) {
        var observer = new MutationObserver(function () {
            srcLinks.forEach(function (a, i) {
                if (drawerItems[i]) drawerItems[i].classList.toggle('active', a.classList.contains('active'));
            });
        });
        observer.observe(src, { subtree: true, attributes: true, attributeFilter: ['class'] });
    }
})();

/* ── 5) 진행 일정 카드 접기/펼치기 ── */
(function () {
    var block = document.getElementById('scheduleBlock');
    if (!block) return;
    var card = document.getElementById('scheduleToggle');
    var btn = block.querySelector('.sched-toggle');
    function setOpen(open) {
        block.classList.toggle('open', open);
        if (btn) {
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            btn.setAttribute('aria-label', open ? '진행 순서 접기' : '진행 순서 펼치기');
        }
    }
    if (card) card.addEventListener('click', function () {
        setOpen(!block.classList.contains('open'));
    });
})();

/* ── 4) 헤더 배경 영상 자동재생 보장 ── */
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

/* ── 5) 프롬프트 박스 복사 버튼 ── */
(function () {
    var btns = document.querySelectorAll('.pb-copy');
    if (!btns.length) return;
    function fallback(text, done) {
        try {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            done();
        } catch (e) {}
    }
    btns.forEach(function (btn) {
        var box = btn.closest('.prompt-box');
        var pre = box && box.querySelector('pre');
        if (!pre) return;
        var labelEl = btn.querySelector('.pb-copy-text');
        var original = labelEl ? labelEl.textContent : '';
        btn.addEventListener('click', function () {
            var text = pre.innerText;
            var done = function () {
                btn.classList.add('copied');
                if (labelEl) labelEl.textContent = '복사됨';
                setTimeout(function () {
                    btn.classList.remove('copied');
                    if (labelEl) labelEl.textContent = original;
                }, 1600);
            };
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(done, function () { fallback(text, done); });
            } else {
                fallback(text, done);
            }
        });
    });
})();
