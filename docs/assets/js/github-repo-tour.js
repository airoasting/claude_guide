/* Coordinates live in the markup and scale with the original screenshot. */
(function () {
    'use strict';
    var tour = document.getElementById('repo-menu-guide');
    if (!tour) return;
    var viewport = tour.querySelector('.repo-tour-viewport');
    var controls = Array.from(tour.querySelectorAll('[data-repo-menu]'));
    function select(key, pan) {
        controls.forEach(function (control) {
            var active = control.dataset.repoMenu === key;
            control.classList.toggle('is-active', active);
            control.setAttribute('aria-pressed', String(active));
        });
        if (pan && viewport.scrollWidth > viewport.clientWidth) {
            var target = tour.querySelector('.repo-tour-hotspot[data-repo-menu="' + key + '"]');
            var left = target.offsetLeft + target.offsetWidth / 2 - viewport.clientWidth / 2;
            viewport.scrollTo({ left: Math.max(0, left), behavior: 'auto' });
        }
    }
    controls.forEach(function (control) {
        control.addEventListener('pointerenter', function (event) {
            if (event.pointerType !== 'touch') select(control.dataset.repoMenu, control.classList.contains('repo-tour-item'));
        });
        control.addEventListener('focus', function () { select(control.dataset.repoMenu, true); });
        control.addEventListener('click', function () {
            select(control.dataset.repoMenu, true);
            if (window.matchMedia('(max-width: 768px)').matches && control.classList.contains('repo-tour-item')) {
                viewport.scrollIntoView({ block: 'center', behavior: 'auto' });
            }
        });
    });
    select('code', false);
})();
