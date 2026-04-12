// [12] UI — 사용자 입력 처리
'use strict';

const UI = (() => {
  let state, app;
  let infoPanelOpen = false;
  let miniMapOpen = false;

  // ─── Init ─────────────────────────────────────────────────────────
  function init(appState, appFns) {
    state = appState;
    app = appFns;

    wireTimeControls();
    wireToggleButtons();
    wireLightPollution();
    wireInfoPanel();
    wireMiniMap();
    wireDatePicker();
    wireLocationBtn();
  }

  // ─── Time Controls ────────────────────────────────────────────────
  function wireTimeControls() {
    const playBtn   = document.getElementById('playBtn');
    const speedBtn  = document.getElementById('speedBtn');
    const slider    = document.getElementById('timeSlider');

    playBtn.addEventListener('click', () => app.togglePlay());

    speedBtn.addEventListener('click', () => {
      const speeds = [1, 5, 30, 60];
      const labels = ['×1','×5','×30','×60'];
      const cur = speeds.indexOf(state.playSpeed);
      state.playSpeed = speeds[(cur + 1) % speeds.length];
      speedBtn.textContent = labels[(cur + 1) % speeds.length];
    });

    slider.addEventListener('input', () => {
      // Slider = minutes since 18:00 KST today (0-720 = 18:00 to 06:00 next day)
      const min = parseInt(slider.value);
      const base = getBaseDate();
      state.date = new Date(base.getTime() + min * 60000);
      app.updateJD();
      app.RENDERER.reproject(state);
      app.RENDERER.clearTrail(false);
      updateTimeDisplay();
    });
  }

  function getBaseDate() {
    const d = new Date(state.date);
    // Today 18:00 KST = 09:00 UTC
    const todayKST = new Date(d.getTime() + 9*3600000);
    todayKST.setUTCHours(9, 0, 0, 0);
    return new Date(todayKST.getTime() - 9*3600000);
  }

  function updateTimeDisplay() {
    const kst = new Date(state.date.getTime() + 9*3600000);
    const y = kst.getUTCFullYear();
    const mo = kst.getUTCMonth() + 1;
    const day = kst.getUTCDate();
    const h = String(kst.getUTCHours()).padStart(2,'0');
    const m = String(kst.getUTCMinutes()).padStart(2,'0');
    document.getElementById('timeDisplay').textContent =
      `${y}년 ${mo}월 ${day}일 ${h}:${m} KST`;
  }

  // ─── Toggle Buttons ───────────────────────────────────────────────
  function wireToggleButtons() {
    document.getElementById('btnLines').addEventListener('click', () => app.toggleLines());
    document.getElementById('btnNames').addEventListener('click', () => app.toggleNames());
    document.getElementById('btnGrid').addEventListener('click', () => app.toggleGrid());
    document.getElementById('btnMilky').addEventListener('click', () => app.toggleMilky());
    document.getElementById('btnMeteor').addEventListener('click', () => app.toggleMeteors());
    document.getElementById('btnTrail').addEventListener('click', () => app.toggleTrail());
    document.getElementById('btnAudio').addEventListener('click', () => app.toggleAudio());
    document.getElementById('todayBtn').addEventListener('click', () => {
      const now = new Date();
      const kst = new Date(now.getTime() + 9*3600000);
      kst.setUTCHours(13, 0, 0, 0); // 22:00 KST
      state.date = new Date(kst.getTime() - 9*3600000);
      app.updateJD();
      app.RENDERER.reproject(state);
      app.RENDERER.clearTrail(false);
      document.getElementById('timeSlider').value = 240; // 22:00 = 4h after 18:00 = 240min
      updateTimeDisplay();
    });
  }

  // ─── Light Pollution ──────────────────────────────────────────────
  function wireLightPollution() {
    const slider = document.getElementById('lpSlider');
    const label  = document.getElementById('lpLabel');
    const labels = ['도심','교외','시골','산간','완전 암흑'];

    slider.addEventListener('input', () => {
      const lp = parseInt(slider.value);
      state.lpLevel = lp;
      label.textContent = labels[lp - 1];
      app.RENDERER.reproject(state);
    });
  }

  // ─── Date Picker ─────────────────────────────────────────────────
  function wireDatePicker() {
    const dp = document.getElementById('datePicker');
    dp.addEventListener('change', () => {
      const [y, mo, d] = dp.value.split('-').map(Number);
      const kst = new Date(state.date.getTime() + 9*3600000);
      kst.setUTCFullYear(y, mo-1, d);
      state.date = new Date(kst.getTime() - 9*3600000);
      app.updateJD();
      app.RENDERER.reproject(state);
      updateTimeDisplay();
    });
  }

  // ─── Location Button ──────────────────────────────────────────────
  function wireLocationBtn() {
    document.getElementById('locationBtn').addEventListener('click', () => {
      if (miniMapOpen) closeMiniMap();
      else openMiniMap();
    });
  }

  // ─── Info Panel ───────────────────────────────────────────────────
  function openInfoPanel(con) {
    const panel = document.getElementById('infoPanel');
    const allIds = new Set();
    con.lines.forEach(([a,b]) => { allIds.add(a); allIds.add(b); });

    // Find stars in this constellation
    const conStars = DATA_STARS
      .filter(s => allIds.has(s[0]) && s[2]) // has English name
      .sort((a,b) => a[6] - b[6])            // sort by magnitude
      .slice(0, 8);

    // Populate panel
    document.getElementById('infoPanelTitle').textContent = con.name;
    document.getElementById('infoPanelSubtitle').textContent = `${con.nameEn} · ${con.abbr}`;
    document.getElementById('infoPanelMyth').textContent = con.myth || '';

    const tbody = document.getElementById('infoPanelStars');
    tbody.innerHTML = '';
    conStars.forEach(s => {
      const [,nameKo, nameEn,,,, mag, sp] = s;
      const spColors = {O:'🔵',B:'🔵',A:'⚪',F:'🟡',G:'🟡',K:'🟠',M:'🔴'};
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${nameKo || nameEn || '-'}</td>
        <td>${mag.toFixed(2)}</td>
        <td>${spColors[sp] || '⚪'}</td>
      `;
      tbody.appendChild(tr);
    });

    // Animate open
    if (!infoPanelOpen) {
      panel.classList.add('open');
      infoPanelOpen = true;
    } else {
      // Cross-fade content
      panel.style.opacity = '0.5';
      setTimeout(() => { panel.style.opacity = '1'; }, 150);
    }
  }

  function closeInfoPanel() {
    const panel = document.getElementById('infoPanel');
    panel.classList.remove('open');
    infoPanelOpen = false;
  }

  document.getElementById && document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('infoPanelClose');
    if (closeBtn) closeBtn.addEventListener('click', closeInfoPanel);
  });

  // ─── Mini Map ─────────────────────────────────────────────────────
  let mapCanvas, mapCtx;
  let currentPin = { x: 77, y: 37 }; // Default Seoul

  function openMiniMap() {
    const el = document.getElementById('miniMap');
    el.classList.add('open');
    miniMapOpen = true;
    if (!mapCanvas) {
      mapCanvas = document.getElementById('mapCanvas');
      mapCtx = mapCanvas.getContext('2d');
      wireMapInteractions();
    }
    drawMap();
  }

  function closeMiniMap() {
    document.getElementById('miniMap').classList.remove('open');
    miniMapOpen = false;
  }

  function latLngToMapXY(lat, lng) {
    return {
      x: (lng - 124.0) * 26,
      y: (38.5 - lat) * 40
    };
  }

  function mapXYToLatLng(x, y) {
    return {
      lat: 38.5 - y / 40,
      lng: x / 26 + 124.0
    };
  }

  function drawMap(hoverX, hoverY) {
    if (!mapCtx) return;
    const W = mapCanvas.width, H = mapCanvas.height;
    mapCtx.clearRect(0, 0, W, H);

    // Draw peninsula outline
    if (DATA_MAP && DATA_MAP.peninsulaPath) {
      mapCtx.beginPath();
      DATA_MAP.peninsulaPath.forEach(([x, y], i) => {
        if (i === 0) mapCtx.moveTo(x, y); else mapCtx.lineTo(x, y);
      });
      mapCtx.closePath();
      mapCtx.fillStyle = 'rgba(100, 149, 237, 0.05)';
      mapCtx.fill();
      mapCtx.strokeStyle = 'rgba(100, 149, 237, 0.3)';
      mapCtx.lineWidth = 1;
      mapCtx.stroke();
    }

    // Jeju Island
    if (DATA_MAP && DATA_MAP.jejuPath) {
      mapCtx.beginPath();
      DATA_MAP.jejuPath.forEach(([x, y], i) => {
        if (i === 0) mapCtx.moveTo(x, y); else mapCtx.lineTo(x, y);
      });
      mapCtx.closePath();
      mapCtx.fillStyle = 'rgba(100, 149, 237, 0.05)';
      mapCtx.fill();
      mapCtx.strokeStyle = 'rgba(100, 149, 237, 0.3)';
      mapCtx.lineWidth = 1;
      mapCtx.stroke();
    }

    // Ulleungdo dot
    if (DATA_MAP && DATA_MAP.ulleungdo) {
      const [ux, uy] = DATA_MAP.ulleungdo;
      mapCtx.fillStyle = 'rgba(100, 149, 237, 0.4)';
      mapCtx.beginPath();
      mapCtx.arc(ux, uy, 2, 0, Math.PI * 2);
      mapCtx.fill();
    }

    // Current location pin
    mapCtx.save();
    mapCtx.shadowColor = '#4a90d9';
    mapCtx.shadowBlur = 8;
    mapCtx.fillStyle = '#4a90d9';
    mapCtx.beginPath();
    mapCtx.arc(currentPin.x, currentPin.y, 5, 0, Math.PI * 2);
    mapCtx.fill();
    mapCtx.restore();

    // Hover crosshair and coords
    if (hoverX !== undefined) {
      mapCtx.save();
      mapCtx.strokeStyle = 'rgba(255,255,255,0.2)';
      mapCtx.lineWidth = 0.5;
      mapCtx.beginPath();
      mapCtx.moveTo(hoverX, 0); mapCtx.lineTo(hoverX, H);
      mapCtx.moveTo(0, hoverY); mapCtx.lineTo(W, hoverY);
      mapCtx.stroke();
      mapCtx.restore();

      const ll = mapXYToLatLng(hoverX, hoverY);
      const lat = ll.lat.toFixed(2);
      const lng = ll.lng.toFixed(2);
      const hemi = ll.lat >= 0 ? 'N' : 'S';
      document.getElementById('mapCoords').textContent =
        `${Math.abs(lat)}°${hemi}, ${lng}°E`;
    }
  }

  function wireMapInteractions() {
    mapCanvas.addEventListener('mousemove', e => {
      const rect = mapCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      drawMap(x, y);
    });
    mapCanvas.addEventListener('mouseleave', () => {
      drawMap();
      document.getElementById('mapCoords').textContent = '';
    });

    mapCanvas.addEventListener('click', e => {
      const rect = mapCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const ll = mapXYToLatLng(x, y);

      // Point-in-polygon check for peninsula
      if (!isInsideKorea(ll.lat, ll.lng)) return;

      currentPin = { x, y };
      const cityName = findNearestCity(ll.lat, ll.lng);
      app.setLocation(ll.lat, ll.lng, cityName);
      drawMap();
    });

    // Preset buttons
    document.getElementById('mapPresets').addEventListener('click', e => {
      const cityName = e.target.dataset.city;
      if (!cityName) return;
      const city = DATA_CITIES.find(c => c.name === cityName);
      if (!city) return;
      const xy = latLngToMapXY(city.lat, city.lng);
      currentPin = xy;
      app.setLocation(city.lat, city.lng, city.name);
      drawMap();
      if (city.name === '시드니' || city.name === '레이캬비크') {
        closeMiniMap();
      }
    });

    // Overseas preset buttons (outside mapPresets, below the divider)
    document.querySelectorAll('[data-city]').forEach(btn => {
      btn.addEventListener('click', e => {
        const cname = e.target.dataset.city;
        const city = DATA_CITIES.find(c => c.name === cname);
        if (!city) return;
        const xy = latLngToMapXY(city.lat, city.lng);
        currentPin = { x: Math.max(0,Math.min(208,xy.x)), y: Math.max(0,Math.min(220,xy.y)) };
        app.setLocation(city.lat, city.lng, city.name);
        closeMiniMap();
      });
    });

    // GPS button (if added)
    document.addEventListener('click', e => {
      if (e.target.id === 'gpsBtn') {
        navigator.geolocation?.getCurrentPosition(pos => {
          const { latitude: lat, longitude: lng } = pos.coords;
          const xy = latLngToMapXY(lat, lng);
          currentPin = { x: Math.max(0,Math.min(208,xy.x)), y: Math.max(0,Math.min(220,xy.y)) };
          const cityName = findNearestCity(lat, lng);
          app.setLocation(lat, lng, cityName);
          drawMap();
        }, () => {});
      }
    });
  }

  // ─── Point-in-polygon: rough Korea check ──────────────────────────
  function isInsideKorea(lat, lng) {
    if (!PENINSULA_POLYGON) return true; // fallback
    const poly = PENINSULA_POLYGON;
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [yi, xi] = poly[i];
      const [yj, xj] = poly[j];
      const intersect = ((xi > lng) !== (xj > lng)) &&
        (lat < (yj - yi) * (lng - xi) / (xj - xi) + yi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // ─── Find nearest city ────────────────────────────────────────────
  function findNearestCity(lat, lng) {
    if (!DATA_CITIES) return '알 수 없음';
    let best = DATA_CITIES[0], bestD = Infinity;
    DATA_CITIES.forEach(c => {
      const dlat = c.lat - lat, dlng = c.lng - lng;
      const d = dlat*dlat + dlng*dlng;
      if (d < bestD) { bestD = d; best = c; }
    });
    return best.name;
  }

  // ─── Constellation detection (for canvas click) ───────────────────
  function findConstellationAt(mx, my, starScreenPositions) {
    if (!starScreenPositions) return null;

    // Build map from star id to screen position
    const starById = {};
    starScreenPositions.forEach(sp => { if(sp) starById[sp.id] = sp; });

    let bestCon = null, bestDist = 60 * 60;

    DATA_CONST.forEach(con => {
      const allIds = new Set();
      con.lines.forEach(([a,b]) => { allIds.add(a); allIds.add(b); });
      let sumX = 0, sumY = 0, count = 0;
      allIds.forEach(id => {
        const sp = starById[id];
        if (sp && sp.screen && sp.screen.visible && sp.alt > 3) {
          sumX += sp.screen.x; sumY += sp.screen.y; count++;
        }
      });
      if (count < 2) return;
      const cx = sumX/count, cy = sumY/count;
      const d = (mx-cx)*(mx-cx) + (my-cy)*(my-cy);
      if (d < bestDist) {
        bestDist = d;
        bestCon = con;
      }
    });
    return bestCon;
  }

  // ─── Close panels on outside click ───────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', e => {
      const panel = document.getElementById('infoPanel');
      const map = document.getElementById('miniMap');
      const locBtn = document.getElementById('locationBtn');
      if (panel && infoPanelOpen && !panel.contains(e.target)) {
        closeInfoPanel();
      }
      if (map && miniMapOpen && !map.contains(e.target) && e.target !== locBtn) {
        closeMiniMap();
      }
    });

    document.getElementById('infoPanelClose')?.addEventListener('click', closeInfoPanel);
  });

  // ─── Public API ───────────────────────────────────────────────────
  return {
    init,
    openInfoPanel,
    closeInfoPanel,
    openMiniMap,
    closeMiniMap,
    findConstellationAt,
    updateTimeDisplay,
  };
})();
