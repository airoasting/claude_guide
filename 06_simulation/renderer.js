// [10] RENDERER — Canvas 렌더링 엔진
'use strict';

const RENDERER = (() => {
  // ─── Internal state ───────────────────────────────────────────────
  let mainCanvas, mainCtx, trailCanvas, trailCtx;
  let starScreenPos = [];      // Cached screen positions for DATA_STARS
  let dustScreenPos = [];      // Cached screen positions for DATA_STARDUST
  let planetScreenPos = [];    // Computed planet positions

  // Constellation line drawing animation state
  let constAnim = {
    active: false,
    startTime: 0,
    segments: [],  // [{x1,y1,x2,y2,delay,done}]
  };

  // Meteor state
  let meteors = [];
  let lastMeteorTime = 0;
  let nextMeteorInterval = 15000;

  // Star hover state
  let hoveredStarId = null;
  let hoveredStarAlpha = 0;

  // Focused constellation
  let focusedConst = null;
  let focusDimAlpha = 0;  // 0=none, 0.6=full

  // ─── Spectral color lookup ─────────────────────────────────────────
  const SPECTRAL_COLOR = {
    O: '#aaccff', B: '#aaccff', A: '#ffffff',
    F: '#ffffcc', G: '#ffee88', K: '#ffcc66', M: '#ff8844',
    default: '#ffffff'
  };

  function getStarColor(sp) {
    return SPECTRAL_COLOR[sp] || SPECTRAL_COLOR.default;
  }

  // ─── Star visual properties by magnitude ──────────────────────────
  function getStarSize(mag) {
    if (mag <= 0)   return { core: 5.5, glowR: 20, glowA: 0.18 };
    if (mag <= 1)   return { core: 4.5, glowR: 14, glowA: 0.12 };
    if (mag <= 2)   return { core: 3.5, glowR: 8,  glowA: 0.08 };
    if (mag <= 3)   return { core: 2.5, glowR: 5,  glowA: 0.04 };
    return              { core: 1.2, glowR: 0,  glowA: 0    };
  }

  // ─── Public init ──────────────────────────────────────────────────
  function init(mc, tc) {
    mainCanvas = mc;
    mainCtx    = mc.getContext('2d');
    trailCanvas = tc;
    trailCtx    = tc.getContext('2d');
  }

  // ─── Reproject all stars/dust to screen coords ────────────────────
  function reproject(state) {
    const { lat, lng, jd, viewAlt, viewAz, fov } = state;
    const W = mainCanvas.width, H = mainCanvas.height;
    const cx = W / 2, cy = H / 2;
    const scale = Math.min(W, H) / 2;

    const gmst = jdToGMST(jd);
    const lst  = gmstToLST(gmst, lng);

    // Stars
    starScreenPos = DATA_STARS.map(s => {
      const [id,,,, ra, dec] = s;
      const horiz = equatorialToHorizontal(ra, dec, lst, lat);
      const screen = horizontalToScreen(horiz.alt, horiz.az, viewAlt, viewAz, fov, cx, cy, scale);
      // Fade near horizon
      let horizFade = 1;
      if (horiz.alt < 5 && horiz.alt >= 0) horizFade = horiz.alt / 5;
      return { id, screen, alt: horiz.alt, az: horiz.az, horizFade };
    });

    // Stardust
    dustScreenPos = DATA_STARDUST.map(([ra, dec]) => {
      const horiz = equatorialToHorizontal(ra, dec, lst, lat);
      if (horiz.alt <= 0) return null;
      const screen = horizontalToScreen(horiz.alt, horiz.az, viewAlt, viewAz, fov, cx, cy, scale);
      let horizFade = 1;
      if (horiz.alt < 5) horizFade = horiz.alt / 5;
      return screen.visible ? { x: screen.x, y: screen.y, alpha: horizFade } : null;
    });

    // Planets
    const planets = computeAllPlanets(jd);
    planetScreenPos = planets.map(p => {
      const horiz = equatorialToHorizontal(p.ra, p.dec, lst, lat);
      if (horiz.alt <= 0) return null;
      const screen = horizontalToScreen(horiz.alt, horiz.az, viewAlt, viewAz, fov, cx, cy, scale);
      let horizFade = 1;
      if (horiz.alt < 5) horizFade = horiz.alt / 5;
      return screen.visible ? { ...p, x: screen.x, y: screen.y, horizFade } : null;
    }).filter(Boolean);
  }

  // ─── Draw background gradient ─────────────────────────────────────
  function drawBackground(state) {
    const { viewAlt, lpLevel } = state;
    const W = mainCanvas.width, H = mainCanvas.height;
    const ctx = mainCtx;

    // Brightness adjustments for light pollution
    const lpBright = [0.15, 0.08, 0, -0.05, -0.10][lpLevel - 1];
    const c1 = `hsl(225, 50%, ${8 + lpBright * 100}%)`;
    const c2 = `hsl(225, 45%, ${12 + lpBright * 100}%)`;

    const grad = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, Math.hypot(W, H)/2);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  // ─── Draw stardust ────────────────────────────────────────────────
  function drawStardust(state) {
    const { lpLevel } = state;
    const ctx = mainCtx;
    // Stardust visibility by light pollution: 0%,25%,50%,80%,100%
    const dustRatio = [0, 0.25, 0.5, 0.8, 1.0][lpLevel - 1];
    if (dustRatio === 0) return;

    const count = Math.floor(dustScreenPos.length * dustRatio);
    ctx.save();
    for (let i = 0; i < count; i++) {
      const d = dustScreenPos[i];
      if (!d) continue;
      const alpha = (0.08 + Math.random() * 0.07) * d.alpha;
      ctx.fillStyle = `rgba(180, 200, 240, ${alpha.toFixed(3)})`;
      ctx.fillRect(d.x - 0.5, d.y - 0.5, 1, 1);
    }
    ctx.restore();
  }

  // ─── Draw Milky Way band ──────────────────────────────────────────
  function drawMilkyWay(state) {
    if (!state.showMilky) return;
    const { lat, lng, jd, viewAlt, viewAz, fov } = state;
    const W = mainCanvas.width, H = mainCanvas.height;
    const cx = W/2, cy = H/2;
    const scale = Math.min(W, H) / 2;
    const gmst = jdToGMST(jd);
    const lst  = gmstToLST(gmst, lng);
    const ctx  = mainCtx;

    // Sample the galactic equator: l=0..360°, b=0 (galactic plane)
    // Galactic north pole: RA=192.86°, Dec=+27.13°, roll=122.93°
    // We'll trace two curves at b=±6° (band half-width)
    const cosNP = Math.cos(27.13 * Math.PI/180);
    const sinNP = Math.sin(27.13 * Math.PI/180);
    const npRA  = 192.86;

    function galToEq(l, b) {
      const lRad = (l + 33) * Math.PI / 180; // +33 for correct galactic pole direction
      const bRad = b * Math.PI / 180;
      // Convert galactic to equatorial
      const sinDec = Math.sin(bRad) * sinNP + Math.cos(bRad) * cosNP * Math.sin(lRad - Math.PI/2);
      const dec = Math.asin(Math.max(-1, Math.min(1, sinDec))) * 180 / Math.PI;
      const cosLHS = Math.cos(bRad) * Math.cos(lRad - Math.PI/2);
      const sinLHS = Math.cos(bRad) * sinNP * Math.sin(lRad - Math.PI/2) - Math.sin(bRad) * cosNP;
      let ra = (npRA - 90 + Math.atan2(sinLHS, cosLHS) * 180 / Math.PI + 360) % 360;
      return { ra, dec };
    }

    const steps = 60;
    const bandsB = [-9, -6, -3, 0, 3, 6, 9];
    const centerAlphas = [0.02, 0.04, 0.06, 0.07, 0.06, 0.04, 0.02];

    ctx.save();
    for (let bi = 0; bi < bandsB.length; bi++) {
      const points = [];
      for (let i = 0; i <= steps; i++) {
        const l = i * 360 / steps;
        const eq = galToEq(l, bandsB[bi]);
        const hz = equatorialToHorizontal(eq.ra, eq.dec, lst, lat);
        if (hz.alt <= 0) { points.push(null); continue; }
        const sc = horizontalToScreen(hz.alt, hz.az, viewAlt, viewAz, fov, cx, cy, scale);
        points.push(sc.visible ? { x: sc.x, y: sc.y } : null);
      }
      // Draw as poly-line with low alpha
      ctx.beginPath();
      ctx.strokeStyle = `rgba(200, 210, 240, ${centerAlphas[bi]})`;
      ctx.lineWidth = 18;
      ctx.lineCap = 'round';
      let drawing = false;
      for (const pt of points) {
        if (!pt) { drawing = false; continue; }
        if (!drawing) { ctx.moveTo(pt.x, pt.y); drawing = true; }
        else ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // ─── Draw coordinate grid ─────────────────────────────────────────
  function drawGrid(state) {
    if (!state.showGrid) return;
    const { lat, lng, jd, viewAlt, viewAz, fov } = state;
    const W = mainCanvas.width, H = mainCanvas.height;
    const cx = W/2, cy = H/2;
    const scale = Math.min(W, H) / 2;
    const gmst = jdToGMST(jd);
    const lst  = gmstToLST(gmst, lng);
    const ctx  = mainCtx;

    ctx.save();
    ctx.strokeStyle = 'rgba(80, 100, 160, 0.25)';
    ctx.lineWidth = 0.5;

    // RA lines every 15° (1h)
    for (let ra = 0; ra < 360; ra += 15) {
      ctx.beginPath();
      let started = false;
      for (let dec = -80; dec <= 80; dec += 5) {
        const hz = equatorialToHorizontal(ra, dec, lst, lat);
        if (hz.alt <= 0) { started = false; continue; }
        const sc = horizontalToScreen(hz.alt, hz.az, viewAlt, viewAz, fov, cx, cy, scale);
        if (!sc.visible) { started = false; continue; }
        if (!started) { ctx.moveTo(sc.x, sc.y); started = true; }
        else ctx.lineTo(sc.x, sc.y);
      }
      ctx.stroke();
    }

    // Dec lines every 15°
    for (let dec = -75; dec <= 75; dec += 15) {
      ctx.beginPath();
      let started = false;
      for (let ra = 0; ra <= 360; ra += 10) {
        const hz = equatorialToHorizontal(ra, dec, lst, lat);
        if (hz.alt <= 0) { started = false; continue; }
        const sc = horizontalToScreen(hz.alt, hz.az, viewAlt, viewAz, fov, cx, cy, scale);
        if (!sc.visible) { started = false; continue; }
        if (!started) { ctx.moveTo(sc.x, sc.y); started = true; }
        else ctx.lineTo(sc.x, sc.y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  // ─── Draw horizon mask (below horizon fade) ────────────────────────
  function drawHorizonMask(state) {
    const { viewAlt, viewAz, fov } = state;
    const W = mainCanvas.width, H = mainCanvas.height;
    const ctx = mainCtx;
    const cx = W/2, cy = H/2;
    const scale = Math.min(W, H) / 2;

    // Find approximate horizon screen position
    // Az=viewAz, alt=0 → screen y position of horizon
    const hz0 = horizontalToScreen(0, viewAz, viewAlt, viewAz, fov, cx, cy, scale);
    const hzY = hz0.visible ? hz0.y : H * 0.75;

    if (hzY >= H) return; // horizon below screen, nothing to mask

    // Draw gradient fade from hzY to bottom
    const grad = ctx.createLinearGradient(0, Math.max(0, hzY - 40), 0, Math.min(H, hzY + 80));
    grad.addColorStop(0, 'rgba(10, 14, 26, 0)');
    grad.addColorStop(0.5, 'rgba(10, 14, 26, 0.8)');
    grad.addColorStop(1, 'rgba(10, 14, 26, 1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, Math.max(0, hzY - 40), W, H);
  }

  // ─── Draw constellation lines ─────────────────────────────────────
  function drawConstellationLines(state, now) {
    if (!state.showLines) return;
    const ctx = mainCtx;
    const starById = {};
    starScreenPos.forEach((sp, i) => { starById[sp.id] = sp; });

    // Update animation
    if (constAnim.active) {
      const elapsed = now - constAnim.startTime;
      constAnim.segments.forEach(seg => {
        if (seg.done) return;
        const segElapsed = elapsed - seg.delay;
        if (segElapsed < 0) { seg.t = 0; return; }
        seg.t = Math.min(1, segElapsed / 300); // 300ms per segment
        if (seg.t >= 1) seg.done = true;
      });
      if (constAnim.segments.every(s => s.done)) constAnim.active = false;
    }

    ctx.save();
    DATA_CONST.forEach(con => {
      const isFocused = focusedConst && focusedConst.abbr === con.abbr;
      const isHovered = state.hoveredConst === con.abbr;
      const lineAlpha = isFocused ? 0.9 : isHovered ? 0.7 : 0.35;
      const lineWidth = isFocused ? 2.5 : isHovered ? 1.5 : 1;

      con.lines.forEach(([id1, id2]) => {
        const sp1 = starById[id1], sp2 = starById[id2];
        if (!sp1 || !sp2) return;
        if (!sp1.screen.visible || !sp2.screen.visible) return;
        if (sp1.alt <= 0 || sp2.alt <= 0) return;

        // Animation t value
        let t = 1;
        if (constAnim.active) {
          const segKey = `${id1}-${id2}`;
          const seg = constAnim.segments.find(s => s.key === segKey);
          if (seg) t = seg.t ?? 0;
        }
        if (t <= 0) return;

        const x1 = sp1.screen.x, y1 = sp1.screen.y;
        const x2 = sp2.screen.x, y2 = sp2.screen.y;
        const ex = x1 + (x2 - x1) * t;
        const ey = y1 + (y2 - y1) * t;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(100, 149, 237, ${lineAlpha})`;
        ctx.lineWidth = lineWidth;
        ctx.moveTo(x1, y1);
        ctx.lineTo(ex, ey);
        ctx.stroke();
      });
    });
    ctx.restore();
  }

  // ─── Draw constellation name labels ──────────────────────────────
  function drawConstellationNames(state) {
    if (!state.showNames) return;
    const ctx = mainCtx;
    const starById = {};
    starScreenPos.forEach(sp => { starById[sp.id] = sp; });

    ctx.save();
    ctx.font = '300 12px Pretendard, system-ui, sans-serif';
    ctx.letterSpacing = '1px';

    DATA_CONST.forEach(con => {
      // Find centroid of visible stars
      const visStars = [];
      const allIds = new Set();
      con.lines.forEach(([a, b]) => { allIds.add(a); allIds.add(b); });
      allIds.forEach(id => {
        const sp = starById[id];
        if (sp && sp.screen.visible && sp.alt > 5) visStars.push(sp.screen);
      });
      if (visStars.length < 2) return;

      const cx = visStars.reduce((s, p) => s + p.x, 0) / visStars.length;
      const cy = visStars.reduce((s, p) => s + p.y, 0) / visStars.length;

      // Fade in when animation done or no animation
      const nameAlpha = constAnim.active ? 0 : 0.6;
      if (nameAlpha <= 0) return;

      ctx.fillStyle = `rgba(180, 200, 240, ${nameAlpha})`;
      ctx.textAlign = 'center';
      ctx.fillText(con.name, cx, cy);
    });
    ctx.restore();
  }

  // ─── Draw a single star ────────────────────────────────────────────
  function drawStar(ctx, x, y, mag, color, glowMult, showHighlight, twinkleFactor, horizFade) {
    const { core, glowR, glowA } = getStarSize(mag);

    ctx.save();
    ctx.globalAlpha = horizFade;

    // Glow
    if (glowR > 0) {
      const hexToRgb = hex => {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return [r,g,b];
      };
      const [r,g,b] = hexToRgb(color.startsWith('#') ? color : '#ffffff');
      const gr2 = ctx.createRadialGradient(x, y, 0, x, y, glowR * glowMult);
      gr2.addColorStop(0, `rgba(${r},${g},${b},${glowA * twinkleFactor})`);
      gr2.addColorStop(1, `rgba(${r},${g},${b},0)`);
      ctx.fillStyle = gr2;
      ctx.beginPath();
      ctx.arc(x, y, glowR * glowMult, 0, Math.PI * 2);
      ctx.fill();
    }

    // Core
    ctx.fillStyle = color;
    ctx.globalAlpha = horizFade * twinkleFactor;
    ctx.beginPath();
    ctx.arc(x, y, core, 0, Math.PI * 2);
    ctx.fill();

    // Highlight (brightest stars)
    if (showHighlight && mag <= 0) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // ─── Draw all stars ────────────────────────────────────────────────
  function drawStars(state, now) {
    const { lpLevel } = state;
    // Limiting magnitudes by light pollution
    const magLimits = [2.0, 3.0, 3.8, 4.2, 4.5];
    const magLimit = magLimits[lpLevel - 1];
    // Glow strength by LP
    const glowMults = [0.5, 0.7, 1.0, 1.2, 1.5];
    const glowMult = glowMults[lpLevel - 1];

    const ctx = mainCtx;
    ctx.save();

    DATA_STARS.forEach((s, i) => {
      const [id, nameKo, nameEn, con, ra, dec, mag, sp] = s;
      if (mag > magLimit) return;
      const sp_data = starScreenPos[i];
      if (!sp_data || !sp_data.screen.visible) return;
      if (sp_data.alt <= 0) return;

      const { x, y } = sp_data.screen;
      const color = getStarColor(sp);

      // Twinkle for bright stars
      let twinkle = 1;
      if (mag <= 2) {
        // Each star has a stable twinkling based on its id
        const freq = 0.3 + (id % 13) * 0.04;
        const phase = (id * 137.508) % (Math.PI * 2);
        const amp = 0.15;
        twinkle = 1 + amp * Math.sin(now * freq * 0.001 * Math.PI * 2 + phase);
      }

      // Hover effect
      let hoverMult = 1;
      if (state.hoveredStarId === id) {
        hoverMult = 1.5 + 0.5 * (1 - Math.min(1, (now - state.hoverStartTime) / 200));
      }

      // Focus mode: dim stars not in focused constellation
      let focusFade = 1;
      if (focusedConst) {
        const inFocus = focusedConst.lines.some(([a,b]) => a === id || b === id);
        focusFade = inFocus ? 1 : 0.15;
      }

      ctx.globalAlpha = sp_data.horizFade * focusFade;

      // Opening animation alpha
      const openAlpha = state.starAlpha ? state.starAlpha(id, mag) : 1;
      ctx.globalAlpha *= openAlpha;

      if (mag > 3) {
        // Dark stars - just a point
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, 0.8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.restore();
        ctx.save();
        drawStar(ctx, x, y, mag, color, glowMult * hoverMult, mag <= 0, twinkle, sp_data.horizFade * focusFade * openAlpha);
      }
    });

    ctx.restore();

    // Draw hover label
    if (state.hoveredStarId !== null) {
      drawHoverLabel(state, now);
    }
  }

  // ─── Draw hover star label ─────────────────────────────────────────
  function drawHoverLabel(state, now) {
    const idx = DATA_STARS.findIndex(s => s[0] === state.hoveredStarId);
    if (idx < 0) return;
    const s = DATA_STARS[idx];
    const [id, nameKo, nameEn, ,,,mag] = s;
    const sp = starScreenPos[idx];
    if (!sp || !sp.screen.visible) return;

    const elapsed = now - state.hoverStartTime;
    const alpha = Math.min(0.9, elapsed / 150);
    if (alpha <= 0) return;

    const label = nameEn && nameKo ? `${nameEn} ${nameKo}` : (nameEn || nameKo || '');
    if (!label) return;

    const ctx = mainCtx;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = '11px Pretendard, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(200, 220, 255, 0.9)';
    ctx.fillText(label, sp.screen.x + 10, sp.screen.y - 8);
    ctx.restore();
  }

  // ─── Draw planets ─────────────────────────────────────────────────
  function drawPlanets(state) {
    if (!state.showPlanets) return;
    const ctx = mainCtx;
    ctx.save();

    planetScreenPos.forEach(p => {
      const size = getStarSize(p.mag);
      const r = Math.max(2, size.core);

      // No twinkle for planets
      if (size.glowR > 0) {
        const hexToRgb = hex => [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
        const [pr, pg, pb] = hexToRgb(p.color.startsWith('#') ? p.color : '#ffffff');
        const gr = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size.glowR);
        gr.addColorStop(0, `rgba(${pr},${pg},${pb},${size.glowA})`);
        gr.addColorStop(1, `rgba(${pr},${pg},${pb},0)`);
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size.glowR, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.horizFade;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();

      // Planet name label
      ctx.font = '11px Pretendard, system-ui, sans-serif';
      ctx.fillStyle = `rgba(200,220,255,0.8)`;
      ctx.globalAlpha = p.horizFade;
      ctx.fillText(p.name, p.x + r + 4, p.y + 4);
    });

    ctx.restore();
  }

  // ─── Draw horizon and compass ─────────────────────────────────────
  function drawHorizon(state) {
    const { viewAlt, viewAz, fov } = state;
    const W = mainCanvas.width, H = mainCanvas.height;
    const cx = W/2, cy = H/2;
    const scale = Math.min(W, H) / 2;
    const ctx = mainCtx;

    // Draw horizon arc
    const points = [];
    for (let az = 0; az <= 360; az += 3) {
      const sc = horizontalToScreen(0, az, viewAlt, viewAz, fov, cx, cy, scale);
      if (sc.visible) points.push({ x: sc.x, y: sc.y });
    }

    if (points.length > 2) {
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(60, 80, 120, 0.3)';
      ctx.lineWidth = 1;
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // Compass labels
    const compass = [
      { label: 'N', az: 0 }, { label: 'E', az: 90 },
      { label: 'S', az: 180 }, { label: 'W', az: 270 },
    ];

    ctx.save();
    ctx.font = '14px Pretendard, system-ui, sans-serif';
    ctx.fillStyle = 'rgba(150, 170, 210, 0.7)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    compass.forEach(({ label, az }) => {
      const sc = horizontalToScreen(-3, az, viewAlt, viewAz, fov, cx, cy, scale);
      if (sc.visible) ctx.fillText(label, sc.x, sc.y);
    });
    ctx.restore();
  }

  // ─── Draw meteors ─────────────────────────────────────────────────
  function drawMeteors(state, now) {
    if (!state.showMeteors) {
      meteors = [];
      return;
    }

    const W = mainCanvas.width, H = mainCanvas.height;
    const ctx = mainCtx;

    // Spawn new meteor
    if (now - lastMeteorTime > nextMeteorInterval && meteors.length === 0) {
      const angle = (Math.random() * 60 - 30 + 230) * Math.PI / 180; // mostly downward
      const len = 80 + Math.random() * 120;
      const x = Math.random() * W;
      const y = Math.random() * H * 0.6;
      meteors.push({
        x, y,
        vx: Math.cos(angle) * 4,
        vy: Math.sin(angle) * 4,
        len, life: 0, maxLife: 500,
        startX: x, startY: y
      });
      lastMeteorTime = now;
      nextMeteorInterval = 10000 + Math.random() * 20000;
    }

    ctx.save();
    meteors = meteors.filter(m => m.life < m.maxLife);
    meteors.forEach(m => {
      m.life += 16;
      const t = m.life / m.maxLife;
      const fade = t < 0.2 ? t / 0.2 : 1 - (t - 0.2) / 0.8;

      const tailLen = m.len * Math.min(1, t * 4);
      const cx2 = m.startX + m.vx * m.life * 0.1;
      const cy2 = m.startY + m.vy * m.life * 0.1;
      const dx = -m.vx / Math.hypot(m.vx, m.vy);
      const dy = -m.vy / Math.hypot(m.vx, m.vy);

      const grad = ctx.createLinearGradient(cx2, cy2, cx2 + dx * tailLen, cy2 + dy * tailLen);
      grad.addColorStop(0, `rgba(255, 255, 255, ${fade * 0.9})`);
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.beginPath();
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2 - t * 1.5;
      ctx.moveTo(cx2, cy2);
      ctx.lineTo(cx2 + dx * tailLen, cy2 + dy * tailLen);
      ctx.stroke();
    });
    ctx.restore();
  }

  // ─── Star Trail: accumulate on offscreen canvas ────────────────────
  function updateTrail(state) {
    if (!state.showTrail || !state.isPlaying || state.isDragging) return;

    const ctx = trailCtx;
    ctx.save();
    DATA_STARS.forEach((s, i) => {
      const [id,,,,,,mag] = s;
      if (mag > 2) return; // Only bright stars
      const sp = starScreenPos[i];
      if (!sp || !sp.screen.visible || sp.alt <= 0) return;
      const color = getStarColor(s[7]);
      const [r,g,b] = [
        parseInt(color.slice(1,3),16)||200,
        parseInt(color.slice(3,5),16)||200,
        parseInt(color.slice(5,7),16)||255
      ];
      ctx.fillStyle = `rgba(${r},${g},${b},0.03)`;
      ctx.fillRect(sp.screen.x - 0.5, sp.screen.y - 0.5, 1, 1);
    });
    ctx.restore();
  }

  function clearTrail(fadeOut = false) {
    if (fadeOut) {
      let alpha = 1;
      const fade = () => {
        trailCtx.globalAlpha = 0.1;
        trailCtx.fillStyle = 'rgba(0,0,0,0.1)';
        trailCtx.fillRect(0, 0, trailCanvas.width, trailCanvas.height);
        trailCtx.globalAlpha = 1;
        alpha -= 0.1;
        if (alpha > 0) requestAnimationFrame(fade);
        else trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      };
      requestAnimationFrame(fade);
    } else {
      trailCtx.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
    }
  }

  // ─── Polaris 북극성 항상 표시 ─────────────────────────────────────
  function drawPolarisIndicator() {
    const POLARIS_ID = 37;
    const polarisIdx = DATA_STARS.findIndex(s => s[0] === POLARIS_ID);
    if (polarisIdx < 0) return;

    const sp = starScreenPos[polarisIdx];
    if (!sp || sp.alt <= 0) return; // 지평선 아래면 표시 안 함

    const ctx = mainCtx;
    const W = mainCanvas.width, H = mainCanvas.height;
    const margin = 36;

    if (sp.screen.visible) {
      // ── 화면 안에 있을 때: 테두리 링 + "북극성" 라벨 ──
      const { x, y } = sp.screen;

      ctx.save();
      // 특별 링
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(140, 190, 255, 0.55)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 한국어 라벨 "북극성"
      ctx.font = '300 11px Pretendard, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(180, 210, 255, 0.95)';
      ctx.textAlign = 'left';
      ctx.fillText('북극성', x + 16, y + 4);
      ctx.restore();

    } else {
      // ── 화면 밖에 있을 때: 가장자리 방향 화살표 ──
      const cx = W / 2, cy = H / 2;
      const { x: ox, y: oy } = sp.screen;
      const angle = Math.atan2(oy - cy, ox - cx);

      // 화면 가장자리 교점 계산
      const cos = Math.cos(angle), sin = Math.sin(angle);
      let t = Infinity;
      if (cos > 0)  t = Math.min(t, (W - margin - cx) / cos);
      if (cos < 0)  t = Math.min(t, (margin - cx) / cos);
      if (sin > 0)  t = Math.min(t, (H - margin - cy) / sin);
      if (sin < 0)  t = Math.min(t, (margin - cy) / sin);

      const ex = cx + cos * t;
      const ey = cy + sin * t;

      ctx.save();
      // 화살표
      ctx.translate(ex, ey);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-5, -5);
      ctx.lineTo(-5, 5);
      ctx.closePath();
      ctx.fillStyle = 'rgba(140, 190, 255, 0.75)';
      ctx.fill();

      // 점선 원
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(140, 190, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 라벨
      ctx.rotate(-angle); // 텍스트는 항상 바로
      ctx.font = '300 10px Pretendard, system-ui, sans-serif';
      ctx.fillStyle = 'rgba(140, 190, 255, 0.85)';
      ctx.textAlign = 'center';
      ctx.fillText('북극성', 0, 26);
      ctx.restore();
    }
  }

  // ─── Focus mode dimming overlay ────────────────────────────────────
  function drawFocusDim(state) {
    if (!focusedConst) return;
    const W = mainCanvas.width, H = mainCanvas.height;
    const ctx = mainCtx;
    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${focusDimAlpha})`;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // ─── Start constellation drawing animation ─────────────────────────
  function startConstAnimation(now) {
    const segments = [];
    const starById = {};
    starScreenPos.forEach(sp => { starById[sp.id] = sp; });

    DATA_CONST.forEach(con => {
      con.lines.forEach(([id1, id2], idx) => {
        const sp1 = starById[id1], sp2 = starById[id2];
        if (!sp1 || !sp2 || !sp1.screen.visible || !sp2.screen.visible) return;
        segments.push({
          key: `${id1}-${id2}`,
          delay: idx * 50,
          t: 0, done: false
        });
      });
    });

    constAnim = { active: true, startTime: now, segments };
  }

  function stopConstAnimation() {
    constAnim.active = false;
    constAnim.segments.forEach(s => { s.t = 1; s.done = true; });
  }

  // ─── Set focus constellation ───────────────────────────────────────
  function setFocusConst(con, targetDimAlpha) {
    focusedConst = con;
    focusDimAlpha = targetDimAlpha;
  }

  // ─── Main render ───────────────────────────────────────────────────
  function render(state, now) {
    if (!mainCanvas) return;
    const W = mainCanvas.width, H = mainCanvas.height;
    mainCtx.clearRect(0, 0, W, H);

    // 1. Background
    drawBackground(state);
    // 2. Stardust
    drawStardust(state);
    // 3. Milky Way
    drawMilkyWay(state);
    // 4. Grid
    drawGrid(state);
    // 5. Star Trail (offscreen canvas drawn by app via trailCanvas CSS)
    updateTrail(state);
    // 6. Horizon mask
    drawHorizonMask(state);
    // 7+9. Stars (dark + bright)
    drawStars(state, now);
    // 8. Constellation lines
    drawConstellationLines(state, now);
    // 10. Planets
    drawPlanets(state);
    // 11. Constellation names
    drawConstellationNames(state);
    // 12+13. Horizon + compass
    drawHorizon(state);
    // 14. Meteors
    drawMeteors(state, now);
    // 15. 북극성 항상 표시
    drawPolarisIndicator();
    // Focus dim (P3)
    drawFocusDim(state);
  }

  // ─── Public API ────────────────────────────────────────────────────
  return {
    init,
    reproject,
    render,
    startConstAnimation,
    stopConstAnimation,
    clearTrail,
    setFocusConst,
    get constAnimActive() { return constAnim.active; },
  };
})();
