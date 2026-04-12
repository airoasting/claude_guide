// [13] APP — 초기화, 오프닝 시퀀스, 메인 루프
'use strict';

// ─── Application State ─────────────────────────────────────────────
const STATE = {
  // Location
  lat: 37.5088,
  lng: 127.0631,
  cityName: '서울',

  // Time
  date: new Date(),
  timeOffsetMin: 0,   // minutes offset from 18:00
  jd: 0,

  // Viewport
  viewAlt: 45,
  viewAz: 180,
  fov: 90,

  // Playback
  isPlaying: false,
  playSpeed: 1,  // 1,5,30,60

  // Toggles
  showLines:   true,
  showNames:   true,
  showGrid:    false,
  showMilky:   false,
  showMeteors: false,
  showTrail:   false,
  showPlanets: true,
  audioOn:     true,

  // Light pollution (1-5)
  lpLevel: 3,

  // Interaction
  isDragging: false,
  dragStartX: 0, dragStartY: 0,
  dragStartAlt: 0, dragStartAz: 0,
  hoveredStarId: null,
  hoverStartTime: 0,
  hoveredConst: null,

  // Opening sequence
  introPhase: 0,  // 0..6 (6=COMPLETE)
  introStartTime: 0,

  // Opening star animation
  brightStarAlphas: {},  // id -> {alpha, scale}
  allStarAlpha: 0,

  // Focus mode
  focusedConst: null,
  savedViewAlt: 45,
  savedViewAz: 180,
  savedFov: 90,
};

// ─── Constants ─────────────────────────────────────────────────────
const INTRO_COMPLETE = 6;
const PLAY_SPEEDS = [1, 5, 30, 60];

// ─── DOM references ────────────────────────────────────────────────
let mainCanvas, trailCanvas;
let audioModule;

// ─── Initialization ────────────────────────────────────────────────
function init() {
  mainCanvas  = document.getElementById('mainCanvas');
  trailCanvas = document.getElementById('trailCanvas');

  resizeCanvases();
  window.addEventListener('resize', resizeCanvases);

  RENDERER.init(mainCanvas, trailCanvas);

  // Set initial time (today at 22:00 KST)
  const now = new Date();
  const kst = new Date(now.getTime() + 9 * 3600 * 1000);
  kst.setUTCHours(13, 0, 0, 0); // 22:00 KST = 13:00 UTC
  STATE.date = kst;
  STATE.timeOffsetMin = 0;
  updateJD();

  // Set date picker
  const dp = document.getElementById('datePicker');
  const d = new Date(now.getTime() + 9*3600000);
  dp.value = d.toISOString().slice(0,10);

  // Start IP geolocation (parallel to opening)
  fetchIPLocation();

  // Start opening sequence
  STATE.introStartTime = performance.now();
  STATE.introPhase = 0;
  showOpeningEmoji();

  // Register event listeners
  registerEvents();

  // Start main loop
  requestAnimationFrame(mainLoop);
}

function resizeCanvases() {
  const W = window.innerWidth, H = window.innerHeight;
  [mainCanvas, trailCanvas].forEach(c => {
    c.width  = W;
    c.height = H;
  });
}

// ─── Julian Day calculation ────────────────────────────────────────
function updateJD() {
  const d = STATE.date;
  const utH = d.getUTCHours() + d.getUTCMinutes()/60 + d.getUTCSeconds()/3600;
  STATE.jd = dateToJD(d.getUTCFullYear(), d.getUTCMonth()+1, d.getUTCDate(), utH);
}

// ─── IP Geolocation (async, non-blocking) ─────────────────────────
function fetchIPLocation() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  // district = 구 단위 (송파구), city = 시 단위 (서울), lang=ko → 한국어
  fetch('http://ip-api.com/json/?fields=lat,lon,city,district&lang=ko', { signal: controller.signal })
    .then(r => r.json())
    .then(data => {
      clearTimeout(timeout);
      if (data && data.lat && data.lon) {
        // 구 단위 우선, 없으면 시 단위
        const locationName = data.district || data.city || '감지된 위치';
        setLocation(data.lat, data.lon, locationName);
      }
    })
    .catch(() => { /* Use default Samsung Station */ });
}

// ─── Location setting ─────────────────────────────────────────────
function setLocation(lat, lng, cityName, animate = false) {
  const prevLat = STATE.lat;
  const bigChange = Math.abs(lat - prevLat) > 10;

  STATE.lat = lat;
  STATE.lng = lng;
  STATE.cityName = cityName;

  // Default view direction by hemisphere
  if (lat < 0) {
    STATE.viewAz = 0; // Southern hemisphere faces north
  } else {
    STATE.viewAz = 180; // Northern hemisphere faces south
  }

  updateJD();
  RENDERER.reproject(STATE);
  RENDERER.clearTrail(false);

  // Update UI
  document.getElementById('locationBtn').textContent = `📍 ${cityName}`;
  document.getElementById('headerText').textContent = `🌌 ${cityName}의 밤하늘`;

  if (bigChange && STATE.introPhase >= INTRO_COMPLETE) {
    // Fade transition for big location changes
    const overlay = document.getElementById('fadeOverlay');
    overlay.style.transition = 'background 0.4s';
    overlay.style.background = 'rgba(0,0,0,0.9)';
    setTimeout(() => {
      RENDERER.reproject(STATE);
      if (STATE.showLines) RENDERER.startConstAnimation(performance.now());
      overlay.style.transition = 'background 0.6s';
      overlay.style.background = 'rgba(0,0,0,0)';
    }, 400);
  }
}

// ─── Opening sequence ─────────────────────────────────────────────
function showOpeningEmoji() {
  const emoji = document.getElementById('openingEmoji');
  emoji.style.animation = 'emojiPulse 1s ease-in-out infinite';
  emoji.style.opacity = '0.3';
}

function skipIntro() {
  STATE.introPhase = INTRO_COMPLETE;
  finishIntro();
}

function finishIntro() {
  document.getElementById('openingEmoji').classList.add('hidden');
  document.getElementById('header').classList.add('visible');
  document.getElementById('controlBar').classList.add('visible');
  STATE.allStarAlpha = 1;
  Object.keys(STATE.brightStarAlphas).forEach(id => {
    STATE.brightStarAlphas[id] = { alpha: 1, scale: 1 };
  });
  RENDERER.reproject(STATE);
  RENDERER.stopConstAnimation();
  // Start ambient sound
  if (STATE.audioOn && audioModule) audioModule.start(true);
}

function updateIntroPhase(now) {
  if (STATE.introPhase >= INTRO_COMPLETE) return;
  const t = now - STATE.introStartTime;

  if (STATE.introPhase === 0 && t >= 200) {
    // Fade out emoji
    document.getElementById('openingEmoji').classList.add('hidden');
    STATE.introPhase = 1;
    // Begin stardust fade-in (handled in render via allStarAlpha)
    STATE.allStarAlpha = 0;
  }

  if (STATE.introPhase === 1 && t >= 600) {
    STATE.introPhase = 2;
    // Begin bright star pop-in
    RENDERER.reproject(STATE);
  }

  if (STATE.introPhase === 2 && t >= 1400) {
    STATE.introPhase = 3;
    STATE.allStarAlpha = 1;
    // Begin ambient sound
    if (STATE.audioOn && audioModule) audioModule.start(false);
  }

  if (STATE.introPhase === 3 && t >= 1900) {
    STATE.introPhase = 4;
    // Start constellation line drawing
    RENDERER.startConstAnimation(now);
  }

  if (STATE.introPhase === 4 && t >= 3000) {
    STATE.introPhase = 5;
    // Show header + control bar
    document.getElementById('header').classList.add('visible');
  }

  if (STATE.introPhase === 5 && t >= 3500) {
    STATE.introPhase = INTRO_COMPLETE;
    document.getElementById('controlBar').classList.add('visible');
    startIdleTimer();
  }

  // Animate stardust alpha (phase 1: 200ms-1200ms)
  if (STATE.introPhase >= 1 && STATE.introPhase < 3) {
    STATE.allStarAlpha = Math.min(0.3, (t - 200) / 1000 * 0.3);
  }
}

// ─── Star alpha callback for opening animation ─────────────────────
STATE.starAlpha = function(id, mag) {
  if (STATE.introPhase >= INTRO_COMPLETE) return 1;

  if (STATE.introPhase < 2) {
    return STATE.allStarAlpha;
  }

  const t = performance.now() - STATE.introStartTime;

  if (mag <= 1 && STATE.introPhase >= 2) {
    // Bright stars pop in sequentially
    const brightIds = DATA_STARS.filter(s => s[6] <= 1).map(s => s[0]).sort();
    const idx = brightIds.indexOf(id);
    if (idx < 0) return 0;
    const delay = 600 + idx * 40;
    const elapsed = t - delay;
    if (elapsed < 0) return 0;
    const a = Math.min(1, elapsed / 200);
    return a;
  }

  if (STATE.introPhase >= 3) return 1;
  return STATE.allStarAlpha;
};

// ─── Idle timer for control bar ────────────────────────────────────
let idleTimer = null;
function resetIdle() {
  const bar = document.getElementById('controlBar');
  bar.classList.remove('idle');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => bar.classList.add('idle'), 5000);
}
function startIdleTimer() {
  document.addEventListener('mousemove', resetIdle, { passive: true });
  resetIdle();
}

// ─── Main animation loop ───────────────────────────────────────────
let lastTimestamp = 0;
function mainLoop(now) {
  requestAnimationFrame(mainLoop);

  const dt = now - lastTimestamp;
  lastTimestamp = now;

  // Update intro
  updateIntroPhase(now);

  // Advance time if playing
  if (STATE.isPlaying && STATE.introPhase >= INTRO_COMPLETE) {
    const simDt = dt * STATE.playSpeed / 1000; // seconds of simulation time
    STATE.date = new Date(STATE.date.getTime() + simDt * 1000);
    updateJD();

    // Update slider position
    const slider = document.getElementById('timeSlider');
    const base = getBaseDate();
    const elapsedMin = (STATE.date - base) / 60000;
    slider.value = Math.max(0, Math.min(720, elapsedMin));
    updateTimeDisplay();

    RENDERER.reproject(STATE);
  }

  RENDERER.render(STATE, now);
}

// ─── Time helpers ──────────────────────────────────────────────────
function getBaseDate() {
  // Returns today 18:00 KST = 09:00 UTC
  const d = new Date(STATE.date);
  const kst = new Date(d.getTime() + 9*3600000);
  kst.setUTCHours(9, 0, 0, 0); // 18:00 KST
  return new Date(kst.getTime() - 9*3600000);
}

function updateTimeDisplay() {
  const kst = new Date(STATE.date.getTime() + 9*3600000);
  const y = kst.getUTCFullYear();
  const mo = kst.getUTCMonth() + 1;
  const day = kst.getUTCDate();
  const h = String(kst.getUTCHours()).padStart(2,'0');
  const m = String(kst.getUTCMinutes()).padStart(2,'0');
  document.getElementById('timeDisplay').textContent = `${y}년 ${mo}월 ${day}일 ${h}:${m} KST`;
}

// ─── Event listeners ───────────────────────────────────────────────
function registerEvents() {
  const canvas = mainCanvas;

  // Drag to rotate view
  canvas.addEventListener('mousedown', e => {
    if (STATE.introPhase < INTRO_COMPLETE) { skipIntro(); return; }
    STATE.isDragging = true;
    STATE.dragStartX = e.clientX;
    STATE.dragStartY = e.clientY;
    STATE.dragStartAlt = STATE.viewAlt;
    STATE.dragStartAz  = STATE.viewAz;
  });

  canvas.addEventListener('mousemove', e => {
    if (STATE.introPhase < INTRO_COMPLETE) return;
    resetIdle();

    if (STATE.isDragging) {
      const dx = e.clientX - STATE.dragStartX;
      const dy = e.clientY - STATE.dragStartY;
      STATE.viewAz  = (STATE.dragStartAz  - dx * 0.3 + 360) % 360;
      STATE.viewAlt = Math.max(-90, Math.min(90, STATE.dragStartAlt + dy * 0.3));
      RENDERER.reproject(STATE);
    } else {
      // Star hover detection
      updateStarHover(e.clientX, e.clientY);
      // Constellation hover
      updateConstHover(e.clientX, e.clientY);
    }
  });

  canvas.addEventListener('mouseup', () => { STATE.isDragging = false; });
  canvas.addEventListener('mouseleave', () => {
    STATE.isDragging = false;
    STATE.hoveredStarId = null;
    STATE.hoveredConst = null;
  });

  // Wheel to zoom
  canvas.addEventListener('wheel', e => {
    if (STATE.introPhase < INTRO_COMPLETE) return;
    e.preventDefault();
    STATE.fov = Math.max(30, Math.min(150, STATE.fov + (e.deltaY > 0 ? 5 : -5)));
    RENDERER.reproject(STATE);
  }, { passive: false });

  // Double click to center + constellation focus
  canvas.addEventListener('dblclick', e => {
    if (STATE.introPhase < INTRO_COMPLETE) return;
    // Check if clicking a constellation
    const con = findConstellationAt(e.clientX, e.clientY);
    if (con) {
      enterFocusMode(con);
    } else {
      // Center view on click point
      // (simplified: just center on approximate direction)
    }
  });

  // Single click for constellation info panel
  canvas.addEventListener('click', e => {
    if (STATE.introPhase < INTRO_COMPLETE) { skipIntro(); return; }
    if (STATE.isDragging) return;
    const con = findConstellationAt(e.clientX, e.clientY);
    if (con) {
      UI.openInfoPanel(con);
    } else {
      UI.closeInfoPanel();
    }
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', e => {
    if (STATE.introPhase < INTRO_COMPLETE) { skipIntro(); return; }
    resetIdle();
    const key = e.key.toUpperCase();
    switch(key) {
      case ' ': e.preventDefault(); togglePlay(); break;
      case 'T': if(STATE.isPlaying) toggleTrail(); break;
      case 'C': toggleLines(); break;
      case 'N': toggleNames(); break;
      case 'G': toggleGrid(); break;
      case 'M': toggleMilky(); break;
      case 'S': toggleMeteors(); break;
      case 'A': toggleAudio(); break;
      case 'L': cycleLightPollution(); break;
      case 'I': replayIntro(); break;
      case 'R': resetView(); break;
      case 'ESCAPE':
        if (STATE.focusedConst) exitFocusMode();
        else if (document.getElementById('infoPanel').classList.contains('open')) UI.closeInfoPanel();
        else if (document.getElementById('miniMap').classList.contains('open')) UI.closeMiniMap();
        break;
    }
  });
}

// ─── Star hover detection ──────────────────────────────────────────
function updateStarHover(mx, my) {
  let bestId = null, bestDist = 15 * 15;
  DATA_STARS.forEach((s, i) => {
    const [id,,,,,,mag] = s;
    if (mag > 2) return;
    const sp = RENDERER._starScreenPos ? RENDERER._starScreenPos[i] : null;
    // Access via reproject state - we'll use a workaround
    // Actually starScreenPos is internal. Let's check distances from the last render.
  });
  // Simplified: use exposed API or just skip for now
  // (Will be wired properly in UI.js)
}

// ─── Constellation detection ───────────────────────────────────────
function findConstellationAt(mx, my) {
  // Find closest constellation centroid
  // (Simplified: check if click is within 50px of any star in the constellation)
  // Return the constellation object or null
  return null; // To be implemented in UI.js
}

function updateConstHover(mx, my) {
  // To be implemented in UI.js
}

// ─── Toggle functions ─────────────────────────────────────────────
function togglePlay() {
  STATE.isPlaying = !STATE.isPlaying;
  document.getElementById('playBtn').textContent = STATE.isPlaying ? '⏸' : '▶';
}

function toggleLines() {
  STATE.showLines = !STATE.showLines;
  const btn = document.getElementById('btnLines');
  btn.classList.toggle('active', STATE.showLines);
  if (STATE.showLines) RENDERER.startConstAnimation(performance.now());
}

function toggleNames() {
  STATE.showNames = !STATE.showNames;
  document.getElementById('btnNames').classList.toggle('active', STATE.showNames);
}

function toggleGrid() {
  STATE.showGrid = !STATE.showGrid;
  document.getElementById('btnGrid').classList.toggle('active', STATE.showGrid);
}

function toggleMilky() {
  STATE.showMilky = !STATE.showMilky;
  document.getElementById('btnMilky').classList.toggle('active', STATE.showMilky);
}

function toggleMeteors() {
  STATE.showMeteors = !STATE.showMeteors;
  document.getElementById('btnMeteor').classList.toggle('active', STATE.showMeteors);
}

function toggleTrail() {
  STATE.showTrail = !STATE.showTrail;
  document.getElementById('btnTrail').classList.toggle('active', STATE.showTrail);
  if (!STATE.showTrail) RENDERER.clearTrail(true);
}

function toggleAudio() {
  STATE.audioOn = !STATE.audioOn;
  document.getElementById('btnAudio').textContent = STATE.audioOn ? '🔊' : '🔇';
  document.getElementById('btnAudio').classList.toggle('active', STATE.audioOn);
  if (audioModule) {
    if (STATE.audioOn) audioModule.start(true);
    else audioModule.stop();
  }
}

function cycleLightPollution() {
  STATE.lpLevel = (STATE.lpLevel % 5) + 1;
  document.getElementById('lpSlider').value = STATE.lpLevel;
  const labels = ['도심','교외','시골','산간','완전 암흑'];
  document.getElementById('lpLabel').textContent = labels[STATE.lpLevel-1];
}

function replayIntro() {
  STATE.introPhase = 0;
  STATE.introStartTime = performance.now();
  STATE.allStarAlpha = 0;
  STATE.brightStarAlphas = {};
  document.getElementById('header').classList.remove('visible');
  document.getElementById('controlBar').classList.remove('visible');
  showOpeningEmoji();
}

function resetView() {
  STATE.viewAlt = 45;
  STATE.viewAz = STATE.lat < 0 ? 0 : 180;
  STATE.fov = 90;
  RENDERER.reproject(STATE);
}

// ─── Focus mode ────────────────────────────────────────────────────
function enterFocusMode(con) {
  STATE.focusedConst = con;
  STATE.savedViewAlt = STATE.viewAlt;
  STATE.savedViewAz  = STATE.viewAz;
  STATE.savedFov     = STATE.fov;
  RENDERER.setFocusConst(con, 0.6);

  // Show focus label
  const label = document.getElementById('focusLabel');
  label.textContent = `${con.name} ${con.nameEn}`;
  label.classList.add('visible');

  document.getElementById('focusOverlay').classList.add('active');
}

function exitFocusMode() {
  STATE.focusedConst = null;
  STATE.viewAlt = STATE.savedViewAlt;
  STATE.viewAz  = STATE.savedViewAz;
  STATE.fov     = STATE.savedFov;
  RENDERER.setFocusConst(null, 0);
  RENDERER.reproject(STATE);

  document.getElementById('focusLabel').classList.remove('visible');
  document.getElementById('focusOverlay').classList.remove('active');
}

// ─── Wire up UI module ─────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  // AUDIO module
  try {
    if (typeof AUDIO !== 'undefined') {
      audioModule = AUDIO;
    }
  } catch(e) {}

  init();

  // Wire up UI controls (defined in ui.js)
  if (typeof UI !== 'undefined') {
    UI.init(STATE, {
      setLocation, togglePlay, toggleLines, toggleNames, toggleGrid,
      toggleMilky, toggleMeteors, toggleTrail, toggleAudio,
      cycleLightPollution, replayIntro, resetView, updateJD,
      RENDERER
    });
  }
});
