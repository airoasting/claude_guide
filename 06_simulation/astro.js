// [8] ASTRO — 천문 좌표 변환 (순수 함수)
'use strict';

/**
 * 율리우스 일 계산
 * @param {number} year  UTC year
 * @param {number} month UTC month (1-12)
 * @param {number} day   UTC day
 * @param {number} utHours UTC decimal hours
 * @returns {number} Julian Day Number
 */
function dateToJD(year, month, day, utHours) {
  if (month <= 2) { year -= 1; month += 12; }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716))
       + Math.floor(30.6001 * (month + 1))
       + day + utHours / 24 + B - 1524.5;
}

/**
 * 그리니치 항성시 (GMST) in degrees
 * @param {number} jd Julian Day
 * @returns {number} GMST in degrees [0, 360)
 */
function jdToGMST(jd) {
  const T = (jd - 2451545.0) / 36525.0;
  let gmst = 280.46061837
           + 360.98564736629 * (jd - 2451545.0)
           + T * T * 0.000387933
           - T * T * T / 38710000.0;
  gmst = gmst % 360;
  if (gmst < 0) gmst += 360;
  return gmst;
}

/**
 * 지방 항성시 (LST) in degrees
 * @param {number} gmst GMST in degrees
 * @param {number} longitude observer longitude in degrees (east positive)
 * @returns {number} LST in degrees [0, 360)
 */
function gmstToLST(gmst, longitude) {
  let lst = (gmst + longitude) % 360;
  if (lst < 0) lst += 360;
  return lst;
}

/**
 * 적도좌표 → 지평좌표 변환
 * @param {number} ra  Right Ascension in degrees
 * @param {number} dec Declination in degrees
 * @param {number} lst Local Sidereal Time in degrees
 * @param {number} latitude Observer latitude in degrees (north positive)
 * @returns {{ alt: number, az: number }} altitude and azimuth in degrees
 */
function equatorialToHorizontal(ra, dec, lst, latitude) {
  const ha = ((lst - ra) % 360 + 360) % 360; // Hour angle [0,360)
  const hRad  = ha  * Math.PI / 180;
  const dRad  = dec * Math.PI / 180;
  const latRad = latitude * Math.PI / 180;

  const sinAlt = Math.sin(dRad) * Math.sin(latRad)
               + Math.cos(dRad) * Math.cos(latRad) * Math.cos(hRad);
  const alt = Math.asin(Math.max(-1, Math.min(1, sinAlt))) * 180 / Math.PI;

  const cosAltRad = Math.cos(alt * Math.PI / 180);
  let az;
  if (Math.abs(cosAltRad) < 1e-10) {
    az = 0;
  } else {
    const cosAz = (Math.sin(dRad) - Math.sin(latRad) * sinAlt)
                / (Math.cos(latRad) * cosAltRad);
    az = Math.acos(Math.max(-1, Math.min(1, cosAz))) * 180 / Math.PI;
    if (Math.sin(hRad) > 0) az = 360 - az;
  }
  return { alt, az };
}

/**
 * 지평좌표 → 화면좌표 변환 (등거리 방위 투영, azimuthal equidistant)
 * @param {number} alt  Star altitude in degrees
 * @param {number} az   Star azimuth in degrees
 * @param {number} viewAlt View center altitude in degrees
 * @param {number} viewAz  View center azimuth in degrees
 * @param {number} fov  Field of view in degrees
 * @param {number} cx   Canvas center X
 * @param {number} cy   Canvas center Y
 * @param {number} scale Canvas half-height (used as scale reference)
 * @returns {{ x: number, y: number, visible: boolean }}
 */
function horizontalToScreen(alt, az, viewAlt, viewAz, fov, cx, cy, scale) {
  const altR  = alt    * Math.PI / 180;
  const azR   = az     * Math.PI / 180;
  const vAltR = viewAlt * Math.PI / 180;
  const vAzR  = viewAz  * Math.PI / 180;

  // Great-circle angular distance from view center
  const cosC = Math.sin(vAltR) * Math.sin(altR)
             + Math.cos(vAltR) * Math.cos(altR) * Math.cos(azR - vAzR);
  const c = Math.acos(Math.max(-1, Math.min(1, cosC)));

  // Cull objects beyond FOV + margin
  const halfFovR = (fov / 2) * Math.PI / 180;
  if (c > halfFovR * 1.15) {
    return { x: 0, y: 0, visible: false };
  }

  // Azimuthal equidistant projection: radial distance proportional to angular distance c
  const pixScale = scale / halfFovR; // pixels per radian at view center
  const r = c * pixScale;

  // Direction: use standard azimuthal projection formulae
  const sinC = Math.sin(c);
  let dx, dy;
  if (sinC < 1e-10) {
    dx = 0; dy = 0;
  } else {
    const k = r / sinC;
    dx =  k * Math.cos(altR) * Math.sin(azR - vAzR);
    dy = -k * (Math.cos(vAltR) * Math.sin(altR)
             - Math.sin(vAltR) * Math.cos(altR) * Math.cos(azR - vAzR));
  }

  return {
    x: cx + dx,
    y: cy + dy,
    visible: true
  };
}
