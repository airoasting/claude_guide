/* cover-fx.js · 인덱스 표지 연출 (2026-10-05)
 *
 * 세 가지를 한 루프에서 돌린다.
 *   1. 셰이더 배경   .cover-shader  구리가 녹아 일렁이는 바탕. hero-bg.mp4(2.2MB)를 대신한다
 *   2. 불씨 → 5단계  .cover-embers  배경 다이얼이 숫자 n에 착지하는 순간 n번째 점(소환·연결·계약·조합·자율)이 켜진다.
 *                    불씨는 그 순간에 닿도록 바닥에서 미리 출발한다. 켜질 때 아이콘이 그려진다. 다섯이 다 켜지면 멈춘다
 *   3. 커서          셰이더 광원이 커서를 따라간다
 *   0. 배경 다이얼   .cover-dial    표지 뒤에서 금속 다이얼이 1에서 5로 돌고 1로 풀리기를 반복한다
 *
 * 커서를 따라 표지가 기울던 연출은 주제와 아무 관련이 없어 2026-10-05에 뺐다.
 * 금박 반사광은 글자 굵기가 따로 움직이면 통째로 겹쳐 찍은 반사광 층과 어긋나서 키네틱 제목으로 바꾸며 뺐다.
 * 제목은 로딩할 때 한 번만 움직인다(CSS ch-in). 7초마다 지나가던 굵기 물결과 커서 반응은 사용자 결정으로 뺐다
 *
 * 지키는 선
 *   - 셰이더는 WCAG 상대 휘도를 0.155에서 자른다. 어느 픽셀에서도 흰 글자 대비가 5.07:1 아래로 내려가지 않는다.
 *     밝기를 올리지 않고 채도로 빛을 표현하는 이유가 이것이다.
 *     저자 이름 뒤만 더 낮추던 구역은 "그림자 같다"는 지적으로 뺐다. 소속 줄 글자 투명도를 0.86으로 올려 대비를 지킨다.
 *   - WebGL이 없으면 아무것도 하지 않는다. .hero의 CSS 그라디언트가 그대로 보인다.
 *   - 모션 줄이기 설정이면 셰이더 한 장만 그리고 멈춘다. 5단계 점은 모두 켜진 채로 둔다.
 *   - 표지가 화면 밖이거나 탭이 숨겨지면 루프를 멈춘다.
 */
(function () {
    var hero = document.querySelector('.hero');
    var front = document.querySelector('.jacket-front');
    if (!hero || !front) return;

    function mq(q) { try { return window.matchMedia(q).matches; } catch (e) { return false; } }
    var reduce = mq('(prefers-reduced-motion: reduce)');
    var mobile = mq('(max-width: 768px)');
    var finePointer = mq('(hover: hover) and (pointer: fine)') && !mobile;
    var stage = document.querySelector('.cover-stage') || hero;
    var title = document.querySelector('.cover-title .ct-main');

    // 커서 상태. hero 기준 0..1 좌표다. 커서가 없을 때 빛은 제목 근처를 천천히 돈다
    var ptr = { x: 0.42, y: 0.42, active: false };
    var sm = { x: 0.42, y: 0.42, light: 0.55 };

    /* ── 0. 배경 다이얼 ──
       표지 뒤에서 금속 다이얼이 1에서 5로 딸깍딸깍 돌고, 5에서 머문 뒤 전화 다이얼이 풀리듯 1로 돌아간다. 이를 반복한다.
       눈금과 숫자는 제목 위 빈 공간에 놓는다. 숫자 크기는 그 공간(앞표지 위 ~ 제목 위)에 맞춰 계산한다.
       움직이는 동안만 다시 그린다. 멈춰 있는 동안은 캔버스를 그대로 둔다 */
    // 공용 시간표. 다이얼과 불씨·5단계 점등이 같은 시계(coverClock, 표지 등장 뒤 루프가 돌 때만 흐른다)와 같은 박자를 본다.
    // 다이얼은 0에서 시작해 한 칸씩 돌고, 숫자 n에 착지하는 순간 n번째 단계(1 소환 … 5 자율)에 불이 들어온다.
    // 다이얼 속도가 기준이다. 점등이 다이얼을 끌던 때(점 간격 1.0초)는 "너무 빨리 이동해서 숨막힌다"는 평을 받았다.
    // 한 바퀴: 제목 등장 1.2초 뒤 → 0에서 0.9초 → 1.6초마다 한 칸(0.6초, 살짝 넘쳤다 돌아옴) → 5에서 5초 → 1.6초에 걸쳐 0으로 풀림
    var SEQ = { DELAY: 1200, REST: 900, GAP: 1600, MOVE: 600, HOLD: 5000, BACK: 1600 };
    // s번째 단계(0 소환 … 4 자율)에 불이 들어오는 시각. 다이얼이 숫자 s+1에 착지하는 순간이다(ms, coverClock 기준)
    function landAt(s) { return SEQ.DELAY + SEQ.REST + s * SEQ.GAP + SEQ.MOVE; }
    var coverClock = 0;
    var dial = (function () {
        var box = front.querySelector('.cover-dial');
        var sharp = box && box.querySelector('.dial-sharp');
        var blur = box && box.querySelector('.dial-blur');
        var ctx = sharp && sharp.getContext('2d');
        var bctx = blur && blur.getContext('2d');
        // 모바일은 배경 다이얼을 쓰지 않는다(CSS로도 숨긴다). 그리지도 않아 배터리를 아낀다
        if (!ctx || !bctx || mobile) return null;
        var titleEl = document.querySelector('.cover-title');
        var STEP = 14 * Math.PI / 180;
        var DPR = Math.min(window.devicePixelRatio || 1, 1.5);
        var W = 0, H = 0, titleTop = 0, titleBottom = 0, titleFs = 78;
        var mainEl = document.querySelector('.cover-title .ct-main');
        function measureTitle() {
            var fr = front.getBoundingClientRect();
            if (!titleEl) { titleTop = H * 0.3; titleBottom = H * 0.4; return; }
            var tr = titleEl.getBoundingClientRect();
            titleTop = tr.top - fr.top; titleBottom = tr.bottom - fr.top;
            if (mainEl) titleFs = parseFloat(getComputedStyle(mainEl).fontSize) || titleFs;
        }
        function size() {
            W = front.clientWidth; H = front.clientHeight;
            if (!W || !H) return;
            sharp.width = Math.round(W * DPR); sharp.height = Math.round(H * DPR);
            blur.width = Math.round(W * DPR / 2); blur.height = Math.round(H * DPR / 2);
            measureTitle();
            last = -1;
        }
        // 시간표는 위 SEQ를 쓴다. 5에서 머무는 시간은 2.4초였다가 "인터벌을 더 주자"는 요청으로 5초가 됐다
        var T_REST = SEQ.REST, T_GAP = SEQ.GAP, T_MOVE = SEQ.MOVE, T_HOLD = SEQ.HOLD, T_BACK = SEQ.BACK;
        var T_FWD = T_REST + 4 * T_GAP + T_MOVE;
        var T_CYCLE = T_FWD + T_HOLD + T_BACK;
        function easeOutBack(x) { var c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
        function easeInOut(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
        // 다이얼 위치. 0 = 숫자 0, 5 = 숫자 5. t가 음수(시작 전)면 0이다
        function pos(t) {
            if (t <= 0) return 0;
            t = t % T_CYCLE;
            if (t >= T_FWD + T_HOLD) return 5 * (1 - easeInOut((t - T_FWD - T_HOLD) / T_BACK));
            var p = 0;
            for (var k = 0; k < 5; k++) {
                var t0 = T_REST + k * T_GAP;
                if (t <= t0) break;
                p = k + easeOutBack(Math.min(1, (t - t0) / T_MOVE));
            }
            return p;
        }

        // 저울 눈금판 숫자는 좁고 단단한 산업용 고딕(DIN 계열)이다. 새 파일을 받지 않고 기기에 있는 글꼴을 쓴다
        var NUM_FONT = '"DIN Condensed", "DIN Alternate", Bahnschrift, "Arial Narrow", "Roboto Condensed", sans-serif-condensed, sans-serif';
        function draw(p) {
            var R = Math.max(H * 1.3, W * 1.1);
            // 세로로 긴 화면(태블릿 세로)은 원판이 너무 평평해 옆 숫자가 판면 밖으로 나가 '5' 하나만 보였다
            if (H > W * 1.8) R = W * 1.7;
            var top = Math.max(12, H * 0.03);
            var cx = W / 2, cy = top + R;
            var ring = -R * 0.985;
            // 숫자는 화면 높이의 20%(좁은 화면은 폭의 30%)까지 키운다. 제목 뒤에 걸쳐도 옅어서 큰 글자 대비는 지켜진다
            // 제목의 2.8배를 넘지 않는다. 태블릿에서 숫자(156px)가 제목(44px)의 3.5배가 되어 주인공이 뒤바뀌었다
            var fs = Math.max(48, Math.min(H * 0.2, W * 0.3, titleFs * 2.8));
            // 숫자는 제목 뒤에 걸쳐도 되지만 제목 아랫선 밑으로는 내려가지 않는다.
            // 낮은 화면(1280x720)에서 제목이 106px로 올라가자 144px 숫자가 구분선과 부제 뒤까지 내려왔다
            fs = Math.max(40, Math.min(fs, (titleBottom - 8 - top - R * 0.085) / 0.98));
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
            ctx.clearRect(0, 0, W, H);

            // 원판. 표지 색 위에 어둡게 얹어 판의 윤곽을 만든다. 아랫부분도 보이도록 14%에서 22%로 올렸다
            ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(30,8,3,0.22)'; ctx.fill();
            var rg = ctx.createLinearGradient(cx - R * 0.6, 0, cx + R * 0.6, 0);
            rg.addColorStop(0, 'rgba(255,214,186,0.06)'); rg.addColorStop(0.5, 'rgba(255,226,204,0.5)'); rg.addColorStop(1, 'rgba(255,214,186,0.06)');
            ctx.lineWidth = Math.max(3, R * 0.005); ctx.strokeStyle = rg; ctx.stroke();

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(-p * STEP);
            // 금속 결. 원판과 함께 도는 아주 옅은 동심원
            for (var rr = 0.58; rr < 0.9; rr += 0.012) {
                ctx.beginPath(); ctx.arc(0, 0, R * rr, -Math.PI * 0.9, -Math.PI * 0.1);
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(255,236,220,' + (0.018 + 0.02 * Math.abs(Math.sin(rr * 97))).toFixed(3) + ')';
                ctx.stroke();
            }
            // 바깥 눈금. 한 단계를 열 칸으로 나누고 가운데를 조금 길게 긋는다
            for (var d = -50; d <= 5 * 14 + 50; d += 1.4) {
                var major = Math.abs(d / 14 - Math.round(d / 14)) < 0.01 && d >= 0 && d <= 70;
                var mid = !major && Math.abs(d / 7 - Math.round(d / 7)) < 0.01;
                var len = major ? R * 0.085 : mid ? R * 0.055 : R * 0.03;
                ctx.save(); ctx.rotate(d * Math.PI / 180);
                ctx.beginPath(); ctx.moveTo(0, ring); ctx.lineTo(0, ring + len);
                ctx.lineWidth = major ? 3 : mid ? 1.6 : 1;
                ctx.strokeStyle = major ? 'rgba(255,236,220,0.7)' : mid ? 'rgba(255,236,220,0.45)' : 'rgba(255,236,220,0.3)';
                ctx.stroke();
                ctx.restore();
            }
            // 안쪽 링과 보조 눈금. 숫자 아래의 판이 비어 보이지 않게 한다
            var inner = R * 0.985 - R * 0.085 - fs * 1.18;
            ctx.beginPath(); ctx.arc(0, 0, inner, -Math.PI * 0.95, -Math.PI * 0.05);
            ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,236,220,0.22)'; ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, inner - R * 0.03, -Math.PI * 0.95, -Math.PI * 0.05);
            ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,236,220,0.12)'; ctx.stroke();
            for (var e = -50; e <= 5 * 14 + 50; e += 2.8) {
                ctx.save(); ctx.rotate(e * Math.PI / 180);
                ctx.beginPath(); ctx.moveTo(0, -inner); ctx.lineTo(0, -inner + R * 0.016);
                ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,236,220,0.2)'; ctx.stroke();
                ctx.restore();
            }
            ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
            ctx.font = '700 ' + Math.round(fs) + 'px ' + NUM_FONT;
            for (var k = 0; k <= 5; k++) {
                // 먼 숫자는 빨리 지운다. 두 칸 떨어진 '3'이 제목 'AI' 왼쪽에 남아 '3 AI 에이전트를'처럼 읽혔다
                var a = Math.max(0.04, 0.42 - Math.abs(k - p) * 0.17);
                ctx.save();
                ctx.rotate(k * STEP);
                ctx.translate(0, ring + R * 0.085 + fs * 0.98);
                ctx.fillStyle = 'rgba(255,236,220,' + a.toFixed(3) + ')';
                ctx.fillText(String(k), 0, 0);   // 0 = 시작, 1 소환 … 5 자율
                ctx.restore();
            }
            ctx.restore();

            // 고정 바늘선. 주방 저울처럼 도는 눈금판 위를 붉은 선 하나가 세로로 가로지른다
            // 바늘선은 숫자 아래까지 내려오되 제목 위 8px에서 멈춘다. 제목 글자를 가로지르지 않게 한다.
            // 예전 식은 눈금 링 오프셋(R*0.015)을 빠뜨려 바늘이 숫자 중간에서 끊겼다
            var nTop = Math.max(8, top - 14), nBot = Math.min(top + R * 0.015 + R * 0.085 + fs * 1.02, titleTop - 8);
            ctx.save();
            ctx.lineCap = 'round';
            ctx.beginPath(); ctx.moveTo(cx, nTop); ctx.lineTo(cx, nBot);
            ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(120,20,10,0.85)'; ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx + 1, nTop); ctx.lineTo(cx + 1, nBot);
            ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,190,160,0.35)'; ctx.stroke();
            ctx.fillStyle = 'rgba(120,20,10,0.9)';
            ctx.beginPath(); ctx.moveTo(cx - 7, nTop - 9); ctx.lineTo(cx + 7, nTop - 9); ctx.lineTo(cx, nTop + 2); ctx.closePath(); ctx.fill();
            ctx.restore();

            bctx.setTransform(1, 0, 0, 1, 0, 0);
            bctx.clearRect(0, 0, blur.width, blur.height);
            bctx.drawImage(sharp, 0, 0, blur.width, blur.height);
        }

        size();
        if (window.ResizeObserver) new ResizeObserver(size).observe(front);
        var last = -1, started = false;
        return {
            // c는 공용 시계 coverClock이다
            step: function (c) {
                if (!document.documentElement.classList.contains('cover-in')) return;
                if (!W || !H) { size(); if (!W || !H) return; }
                if (!started) { started = true; box.classList.add('is-on'); }
                var p = pos(c - SEQ.DELAY);
                // 멈춰 있으면 다시 그리지 않는다
                if (Math.abs(p - last) < 0.0005) return;
                last = p;
                // 등장 애니메이션 동안 제목 자리가 18px 움직이므로 처음 몇 초는 자주 다시 측정한다
                if (c < 3000) measureTitle();
                draw(p);
            },
            still: function () { size(); draw(5); box.classList.add('is-on'); }
        };
    })();

    /* ── 1. 셰이더 ── */
    var shader = (function () {
        var cv = hero.querySelector('.cover-shader');
        if (!cv) return null;
        var gl = null;
        try {
            gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: false, powerPreference: 'low-power' }) ||
                 cv.getContext('experimental-webgl');
        } catch (e) { gl = null; }
        if (!gl) return null;

        var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
        var FS = [
            '#ifdef GL_FRAGMENT_PRECISION_HIGH',
            'precision highp float;',
            '#else',
            'precision mediump float;',
            '#endif',
            'uniform vec2 u_res;uniform float u_time;uniform vec2 u_mouse;uniform float u_light;',
            'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
            'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
            '  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}',
            'float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);',
            '  for(int i=0;i<5;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}',
            'void main(){',
            '  vec2 st=gl_FragCoord.xy/u_res; st.y=1.-st.y;',            // CSS처럼 왼쪽 위가 원점
            '  float asp=u_res.x/u_res.y;',
            // 배경은 원래 표지 색(아래 그라디언트) 그대로이고, 그 위에 아주 옅은 결만 천천히(0.35배) 위로 흐른다.
            // 쨍한 주황 버전은 "과해서 유치하다", 어둡게 누른 갈색 버전은 "음산하다"는 지적을 받았다(2026-10-05)
            '  float t=u_time*.35;',
            '  vec2 p=vec2(st.x*asp,st.y+t*.08)*1.35;',
            '  vec2 q=vec2(fbm(p+vec2(0.,t*.06)),fbm(p+vec2(5.2,1.3)-vec2(t*.05,0.)));',
            '  vec2 r=vec2(fbm(p+2.8*q+vec2(1.7,9.2)+t*.08),fbm(p+2.8*q+vec2(8.3,2.8)-t*.07));',
            '  float f=fbm(p+2.4*r);',
            // CSS linear-gradient(150deg, #B35535 0%, #A04828 35%, #7A2E15 100%)을 그대로 옮긴다
            '  vec2 px=(st-.5)*u_res; float len=abs(u_res.x*.5)+abs(u_res.y*.866);',
            '  float g=clamp(dot(px,vec2(.5,.866))/len+.5,0.,1.);',
            '  vec3 c1=vec3(.702,.333,.208),c2=vec3(.627,.282,.157),c3=vec3(.478,.180,.082);',
            '  vec3 base=g<.35?mix(c1,c2,g/.35):mix(c2,c3,(g-.35)/.65);',
            // 결은 밝기 ±7% 안에서만 흔들린다. 원래 표지의 흐린 배경 영상(투명도 0.34) 정도의 존재감이다
            '  vec3 col=base*(.93+.14*smoothstep(.2,.8,f));',
            '  vec2 dm=(st-u_mouse)*vec2(asp,1.);',
            '  col+=vec3(.10,.045,.02)*exp(-dot(dm,dm)*3.)*u_light;',
            // 휘도 상한. 선형 공간에서 세 채널을 같은 비율로 줄이므로 색상과 채도는 남는다
            '  vec3 lin=pow(clamp(col,0.,1.),vec3(2.2));',
            '  float L=dot(lin,vec3(.2126,.7152,.0722));',
            // 저자 이름 뒤만 더 낮추던 구역은 "그림자 같다"는 지적으로 뺐다. 그 자리 대비는 글자 투명도를 올려 지킨다
            '  if(L>.155)lin*=.155/L;',
            '  gl_FragColor=vec4(pow(lin,vec3(1./2.2)),1.);',
            '}'
        ].join('\n');

        function sh(type, src) {
            var s = gl.createShader(type);
            gl.shaderSource(s, src); gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { try { console.warn('[cover-fx]', gl.getShaderInfoLog(s)); } catch (e) {} return null; }
            return s;
        }
        var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
        if (!vs || !fs) return null;
        var pg = gl.createProgram();
        gl.attachShader(pg, vs); gl.attachShader(pg, fs); gl.linkProgram(pg);
        if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) return null;
        gl.useProgram(pg);

        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        var loc = gl.getAttribLocation(pg, 'a');
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        var uRes = gl.getUniformLocation(pg, 'u_res');
        var uTime = gl.getUniformLocation(pg, 'u_time');
        var uMouse = gl.getUniformLocation(pg, 'u_mouse');
        var uLight = gl.getUniformLocation(pg, 'u_light');

        // 노이즈가 부드러워 해상도를 낮춰도 티가 나지 않는다. 픽셀 수를 줄여 배터리를 아낀다
        var SCALE = mobile ? 0.4 : 0.6;
        function resize() {
            var w = Math.max(1, Math.round(hero.clientWidth * SCALE));
            var h = Math.max(1, Math.round(hero.clientHeight * SCALE));
            if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
            gl.viewport(0, 0, cv.width, cv.height);
        }
        resize();
        if (window.ResizeObserver) new ResizeObserver(resize).observe(hero);
        else window.addEventListener('resize', resize);

        var shown = false;
        return {
            draw: function (t) {
                gl.uniform2f(uRes, cv.width, cv.height);
                // 한 시간마다 한 번 되감긴다. 값이 커지면 mediump 기기에서 노이즈가 계단처럼 깨진다
                gl.uniform1f(uTime, (t * 0.001) % 3600 + 40.0);
                gl.uniform2f(uMouse, sm.x, sm.y);
                gl.uniform1f(uLight, sm.light);
                // 등장 애니메이션과 창 크기 변화에 따라 자리가 바뀌므로 1초마다 다시 측정한다
                gl.drawArrays(gl.TRIANGLES, 0, 3);
                if (!shown) { shown = true; hero.classList.add('has-shader'); }
            }
        };
    })();

    if (reduce) {
        // 정지 화면 한 장. 움직이지 않아도 녹은 구리 질감은 남는다
        if (shader) shader.draw(12000);
        if (dial) dial.still();
        return;
    }

    /* ── 2. 불씨 → 5단계 ── */
    var embers = (function () {
        var cv = front.querySelector('.cover-embers');
        var list = document.querySelector('.cover-steps');
        if (!cv || !list) return null;
        var ctx = cv.getContext('2d');
        if (!ctx) return null;
        var items = Array.prototype.slice.call(list.querySelectorAll('li'));
        var dots = items.map(function (li) { return li.querySelector('.cs-dot'); });
        if (dots.length !== 5) return null;
        var DPR = Math.min(window.devicePixelRatio || 1, 2);
        var W = 0, H = 0;
        var nodes = dots.map(function () { return { x: 0, y: 0, glow: 0 }; });
        var parts = [];

        // 꺼진 채로 시작한다. 이 클래스가 없으면(JS 없음, 모션 줄이기) 다섯 점이 모두 켜져 있다
        list.classList.add('cs-anim');
        list.style.setProperty('--cs-progress', '0');

        // 빛 번짐은 미리 한 장 그려 두고 크기만 바꿔 찍는다. 매 프레임 그라디언트를 만들지 않는다
        var sprite = document.createElement('canvas');
        sprite.width = sprite.height = 64;
        var sc = sprite.getContext('2d');
        var gr = sc.createRadialGradient(32, 32, 0, 32, 32, 32);
        gr.addColorStop(0, 'rgba(255,236,206,1)');
        gr.addColorStop(0.18, 'rgba(255,190,128,0.85)');
        gr.addColorStop(0.45, 'rgba(240,120,60,0.28)');
        gr.addColorStop(1, 'rgba(220,90,40,0)');
        sc.fillStyle = gr; sc.fillRect(0, 0, 64, 64);

        function measure() {
            var fr = front.getBoundingClientRect();
            dots.forEach(function (d, i) {
                var r = d.getBoundingClientRect();
                nodes[i].x = r.left + r.width / 2 - fr.left;
                nodes[i].y = r.top + r.height / 2 - fr.top;
            });
        }
        function resize() {
            W = front.clientWidth; H = front.clientHeight;
            cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
            ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
            measure();
        }
        resize();
        if (window.ResizeObserver) new ResizeObserver(resize).observe(front);

        // 바닥 전체 폭에서 태어나 곡선을 그리며 목표 점으로 빨려 든다.
        // 가운데 저자 줄을 덜 지나가도록 출발점을 양옆에 조금 더 몰아 둔다
        function spawn(target, dur) {
            var u = Math.random() * 2 - 1;
            var x0 = W * (0.5 + Math.sign(u) * Math.pow(Math.abs(u), 0.7) * 0.46);
            parts.push({
                to: target,
                x0: x0, y0: H * (0.97 + Math.random() * 0.06),
                bend: (Math.random() - 0.5) * W * 0.22,
                dur: dur || (1.1 + Math.random() * 0.5),
                age: 0,
                r: 0.9 + Math.random() * 1.5,
                ph: Math.random() * 6.28
            });
        }

        // 점등은 다이얼 시간표를 따른다. 다이얼이 숫자 s+1에 착지하는 순간(landAt) s번째 점이 켜진다.
        // 불씨는 그 순간에 닿도록 비행 시간만큼 먼저 출발한다. 다이얼이 없는 모바일도 같은 시간표로 켜진다.
        // 다섯이 모두 켜지면 불씨는 더 보내지 않는다. 화면에 계속 움직이는 것이 많으면 유치해진다
        var PER = 5, litCount = 0, ambient = false, done = false;
        var plan = [];
        for (var s0 = 0; s0 < 5; s0++) {
            for (var q = 0; q < PER; q++) {
                var dur = 1.1 + Math.random() * 0.5;
                // 도착이 착지 순간 0~0.25초 앞에 흩어지게 한다. 착지와 함께 마지막 불씨가 빨려 든다
                var arrive = landAt(s0) / 1000 - Math.random() * 0.25;
                plan.push({ to: s0, at: arrive - dur, dur: dur });
            }
        }
        plan.sort(function (a, b) { return a.at - b.at; });
        var planIdx = 0;
        var on = false, measureAt = 0;

        return {
            // c는 공용 시계 coverClock이다(ms)
            step: function (dt, t, c) {
                if (!document.documentElement.classList.contains('cover-in')) return;
                if (!on) { on = true; measure(); }
                var sec = c / 1000;
                // 등장 애니메이션 동안 점이 18px 올라오므로 자리를 자주 다시 측정한다
                if (t - measureAt > (sec < 4 ? 120 : 1000)) { measureAt = t; measure(); }

                while (planIdx < plan.length && sec >= plan[planIdx].at) {
                    spawn(plan[planIdx].to, plan[planIdx].dur);
                    planIdx++;
                }
                while (litCount < 5 && c >= landAt(litCount)) {
                    items[litCount].classList.add('is-lit');
                    list.style.setProperty('--cs-progress', (litCount / 4).toFixed(3));
                    nodes[litCount].glow = 1;
                    litCount++;
                }
                if (litCount >= 5 && planIdx >= plan.length) ambient = true;
                // 다 끝났고 날던 불씨와 번짐도 사라졌으면 더 그리지 않는다
                if (ambient && !parts.length && !nodes.some(function (n) { return n.glow > 0; })) {
                    if (!done) { done = true; ctx.clearRect(0, 0, W, H); }
                    return;
                }

                ctx.clearRect(0, 0, W, H);
                ctx.globalCompositeOperation = 'lighter';
                for (var i = parts.length - 1; i >= 0; i--) {
                    var p = parts[i];
                    p.age += dt;
                    var k = Math.min(1, p.age / p.dur);
                    var n = nodes[p.to];
                    if (k >= 1) { parts.splice(i, 1); continue; }
                    // 점에 가까울수록 빨라져 빨려 든다. 처음엔 smoothstep(끝에서 감속)을 썼더니
                    // 불씨가 아이콘 자리 위에서 멈춘 듯 맴돌아 잔상처럼 보였다
                    var e = k * k;
                    var cx = p.x0 + (n.x - p.x0) * 0.25 + p.bend;
                    var cy = n.y + (p.y0 - n.y) * 0.3;
                    var a1 = 1 - e;
                    var x = a1 * a1 * p.x0 + 2 * a1 * e * cx + e * e * n.x;
                    var y = a1 * a1 * p.y0 + 2 * a1 * e * cy + e * e * n.y;
                    x += Math.sin(p.ph + p.age * 5) * 5 * (1 - e);
                    // 마지막 25%에서 흐려지며 점에 흡수된다
                    var alpha = Math.min(1, k * 6) * (1 - Math.max(0, (k - 0.75) / 0.25)) * 0.7;
                    var size = p.r * (1 - e * 0.6) * 7;
                    ctx.globalAlpha = alpha;
                    ctx.drawImage(sprite, x - size, y - size, size * 2, size * 2);
                }
                // 불씨가 닿은 점은 아주 잠깐 번졌다가 가라앉는다. 반경 8px까지라 아래 이름 글자에 닿지 않는다
                for (var j = 0; j < 5; j++) {
                    var nd = nodes[j];
                    if (nd.glow <= 0.01) { nd.glow = 0; continue; }
                    var gs = 4 + nd.glow * 4;
                    ctx.globalAlpha = nd.glow * 0.45;
                    ctx.drawImage(sprite, nd.x - gs, nd.y - gs, gs * 2, gs * 2);
                    nd.glow = Math.max(0, nd.glow - dt * 0.9);
                }
                ctx.globalAlpha = 1;
                ctx.globalCompositeOperation = 'source-over';
            }
        };
    })();

    /* ── 3. 커서 ── */
    if (finePointer) {
        front.addEventListener('pointermove', function (e) {
            if (e.pointerType && e.pointerType !== 'mouse') return;
            var hr = hero.getBoundingClientRect();
            ptr.x = (e.clientX - hr.left) / hr.width;
            ptr.y = (e.clientY - hr.top) / hr.height;
            ptr.active = true;
        }, { passive: true });
        front.addEventListener('pointerleave', function () {
            ptr.active = false;
        });
    }


    function lerp(a, b, k) { return a + (b - a) * k; }
    function updatePointer(t) {
        var tx, ty;
        if (ptr.active) { tx = ptr.x; ty = ptr.y; }
        else {
            // 커서가 없을 때 빛은 제목과 부제 사이를 천천히 돈다
            tx = 0.36 + Math.sin(t * 0.00011) * 0.16;
            ty = 0.44 + Math.sin(t * 0.00017 + 1.3) * 0.12;
        }
        sm.x = lerp(sm.x, tx, 0.06);
        sm.y = lerp(sm.y, ty, 0.06);
        sm.light = lerp(sm.light, ptr.active ? 1.0 : 0.6, 0.04);
    }

    /* ── 루프 ── */
    var raf = null, last = 0, lastShader = 0, visible = true;
    var SHADER_GAP = mobile ? 1000 / 24 : 1000 / 30;   // 일렁임이 느려 30fps면 충분하다
    function frame(t) {
        raf = requestAnimationFrame(frame);
        var dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016;
        last = t;
        updatePointer(t);
        if (shader && t - lastShader >= SHADER_GAP) { lastShader = t; shader.draw(t); }
        // 공용 시계는 표지 등장 뒤, 루프가 돌 때만 흐른다. 탭을 오가도 다이얼과 점등이 어긋나지 않는다
        if (document.documentElement.classList.contains('cover-in')) coverClock += dt * 1000;
        if (embers) embers.step(dt, t, coverClock);
        if (dial) dial.step(coverClock);
    }
    function start() { if (!raf && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = null; }

    if (window.IntersectionObserver) {
        new IntersectionObserver(function (es) {
            es.forEach(function (e) { visible = e.isIntersecting; visible ? start() : stop(); });
        }, { rootMargin: '80px 0px' }).observe(stage);
    }
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    // 뒤쪽 탭에서 열리면 requestAnimationFrame이 돌지 않는다. 첫 장은 바로 그려 두고 루프는 보일 때 시작한다
    if (shader) shader.draw(performance.now());
    start();
})();
