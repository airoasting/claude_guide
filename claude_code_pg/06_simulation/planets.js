// [9] PLANETS — 행성 위치 계산 (케플러 방정식)
'use strict';

/**
 * 각도를 [0, 360) 범위로 정규화
 */
function normDeg(x) {
  x = x % 360;
  return x < 0 ? x + 360 : x;
}

/**
 * 케플러 방정식 풀기: E - e*sin(E) = M
 * Newton-Raphson iteration
 * @param {number} M Mean anomaly in radians
 * @param {number} e Eccentricity
 * @returns {number} Eccentric anomaly in radians
 */
function solveKepler(M, e) {
  let E = M + e * Math.sin(M) * (1 + e * Math.cos(M));
  for (let i = 0; i < 15; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-6) break;
  }
  return E;
}

/**
 * 행성의 적도좌표(RA, Dec) 계산
 * @param {string} planetKey  Key in PLANET_ELEMENTS (e.g. 'mars')
 * @param {number} jd         Julian Day
 * @returns {{ ra: number, dec: number, mag: number }} RA/Dec in degrees, estimated magnitude
 */
function computePlanetPosition(planetKey, jd) {
  const el = PLANET_ELEMENTS[planetKey];
  if (!el) return null;

  const T = (jd - 2451545.0) / 36525.0;

  // Compute orbital elements at epoch T
  const a = el.a[0] + el.a[1] * T;
  const e = el.e[0] + el.e[1] * T;
  const I = (el.I[0] + el.I[1] * T) * Math.PI / 180; // inclination rad
  const L = normDeg(el.L[0] + el.L[1] * T);           // mean longitude deg
  const w = normDeg(el.w[0] + el.w[1] * T);           // longitude of perihelion deg
  const O = normDeg(el.O[0] + el.O[1] * T);           // longitude of ascending node deg

  // Argument of perihelion and mean anomaly
  const omega = normDeg(w - O); // argument of perihelion
  const M = normDeg(L - w);     // mean anomaly

  // Solve Kepler's equation
  const Mrad = M * Math.PI / 180;
  const E = solveKepler(Mrad, e);

  // True anomaly
  const v = 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  ) * 180 / Math.PI;

  // Heliocentric distance
  const r = a * (1 - e * Math.cos(E));

  // Heliocentric ecliptic coordinates (planet)
  const omRad    = omega * Math.PI / 180;
  const ORad     = O     * Math.PI / 180;
  const IRad     = I;
  const vRad     = v     * Math.PI / 180;

  const xHelio = r * (Math.cos(ORad) * Math.cos(vRad + omRad)
                    - Math.sin(ORad) * Math.sin(vRad + omRad) * Math.cos(IRad));
  const yHelio = r * (Math.sin(ORad) * Math.cos(vRad + omRad)
                    + Math.cos(ORad) * Math.sin(vRad + omRad) * Math.cos(IRad));
  const zHelio = r * Math.sin(vRad + omRad) * Math.sin(IRad);

  // Earth's heliocentric position (simplified circular orbit)
  // Use Earth's mean longitude
  const earthL = normDeg(100.46457166 + 36000.77 * T);
  const earthLRad = earthL * Math.PI / 180;
  const rEarth = 1.00; // AU approximately
  const xEarth = rEarth * Math.cos(earthLRad);
  const yEarth = rEarth * Math.sin(earthLRad);
  const zEarth = 0;

  // Geocentric ecliptic coordinates
  const dx = xHelio - xEarth;
  const dy = yHelio - yEarth;
  const dz = zHelio - zEarth;
  const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);

  // Convert ecliptic to equatorial (obliquity of ecliptic)
  const eps = (23.4393 - 0.0130 * T) * Math.PI / 180;
  const xEq = dx;
  const yEq = dy * Math.cos(eps) - dz * Math.sin(eps);
  const zEq = dy * Math.sin(eps) + dz * Math.cos(eps);

  // RA and Dec
  let ra = Math.atan2(yEq, xEq) * 180 / Math.PI;
  if (ra < 0) ra += 360;
  const dec = Math.asin(Math.max(-1, Math.min(1, zEq / dist))) * 180 / Math.PI;

  // Approximate visual magnitude (very rough)
  const magTable = {
    mercury: -0.42, venus: -4.40, mars: -2.01, jupiter: -2.94, saturn: 0.67
  };
  const baseMag = magTable[planetKey] ?? 1.0;
  // Magnitude increases with distance from Earth
  const mag = baseMag + 5 * Math.log10(dist * r);

  return { ra, dec, mag: Math.min(mag, 6), dist, r };
}

/**
 * 모든 행성의 현재 위치 계산
 * @param {number} jd Julian Day
 * @returns {Array} array of {key, name, color, ra, dec, mag}
 */
function computeAllPlanets(jd) {
  const keys = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'];
  return keys.map(k => {
    const pos = computePlanetPosition(k, jd);
    if (!pos) return null;
    return {
      key: k,
      name: PLANET_ELEMENTS[k].name,
      color: PLANET_ELEMENTS[k].color,
      ra: pos.ra,
      dec: pos.dec,
      mag: pos.mag,
    };
  }).filter(Boolean);
}
