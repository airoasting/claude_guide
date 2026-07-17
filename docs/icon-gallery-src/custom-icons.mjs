// 커스텀 로고 아이콘 (한국·인기 서비스) — icon-data.mjs 가 병합해서 갤러리에 넣는다.
// 목적: icon-source 외부 저장소(git pull 로 갱신)를 건드리지 않고,
//       한국형/인기 서비스 로고를 이 파일 한 곳에서 관리하기 위함.
// 규칙: 24×24 viewBox, 색은 currentColor 상속(버튼 안에서 글자색 따라감).
//       상징이 뚜렷하면 path, 워드마크형이면 브랜드 글자마크(text).
// 주의: 공식 브랜드 에셋의 픽셀 정본이 아니라 "알아볼 수 있는 표현"이다.
//       실제 서비스 배포 시엔 각 사 브랜드 가이드의 공식 로고를 쓰는 걸 권장.
// 카테고리: 전부 "kservice"(한국·서비스) 탭으로 들어간다.

// 워드마크형 로고용 글자마크 헬퍼.
// 왜곡(가로 찌부러짐) 없이 자연 비율을 유지하면서, 글자 수에 맞춰 폰트 크기만
// 조절해 박스(24×24)에 최대한 크게 담는다. textLength 강제 폭맞춤은 쓰지 않는다.
// (두 번째 이후 인자는 예전 호출과의 호환을 위해 받되 무시한다.)
const LM_FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Apple SD Gothic Neo',sans-serif";

function lettermark(text) {
  const chars = [...text];
  const n = chars.length;
  const korean = /[가-힣]/.test(text);

  // 한글 4글자 이상은 한 줄이면 너무 작아지므로 두 줄로 쌓아 크게 표시.
  if (korean && n >= 4) {
    const half = Math.ceil(n / 2);
    const l1 = chars.slice(0, half).join("");
    const l2 = chars.slice(half).join("");
    const maxLine = Math.max(l1.length, l2.length);
    const size = Math.min(11, 21 / maxLine).toFixed(1);
    return (
      `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">` +
      `<text x="12" text-anchor="middle" font-size="${size}" font-weight="800" font-family="${LM_FONT}">` +
      `<tspan x="12" y="10.6">${l1}</tspan><tspan x="12" y="20.6">${l2}</tspan>` +
      `</text></svg>`
    );
  }

  // 한 줄: 자연 비율 유지(왜곡 없음), 글자 수에 맞춰 폰트 크기만 조절.
  const perChar = korean ? 1.0 : 0.62; // 글자당 자연 가로폭 계수(폰트 크기 대비)
  const maxW = 21;  // 24 박스에서 좌우 여백 확보
  const maxH = 16;  // 세로로 지나치게 커지지 않게 상한
  const size = Math.min(maxH, maxW / (n * perChar));
  const y = (12 + size * 0.35).toFixed(1); // 대략 세로 중앙 정렬
  return (
    `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">` +
    `<text x="12" y="${y}" font-size="${size.toFixed(1)}" font-weight="800" ` +
    `text-anchor="middle" font-family="${LM_FONT}">` +
    `${text}</text></svg>`
  );
}

export const customIcons = [
  // ── 검색·포털·메신저 ──────────────────────────────
  {
    name: "naver-icon",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 3.5h6.4L15 12.1V3.5H21v17h-6.4L9 11.9v8.6H3z"/></svg>`,
  },
  {
    name: "kakaotalk-icon",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 3.6C6.6 3.6 2.3 7 2.3 11.2c0 2.7 1.8 5.1 4.6 6.4-.2.7-.8 2.8-.9 3.2-.1.5.2.5.4.3.2-.1 2.9-2 4-2.7.5.1 1 .1 1.6.1 5.4 0 9.7-3.4 9.7-7.6S17.4 3.6 12 3.6z"/></svg>`,
  },
  {
    name: "line-icon",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" xmlns="http://www.w3.org/2000/svg"><path d="M5 2.2h14A2.8 2.8 0 0 1 21.8 5v14A2.8 2.8 0 0 1 19 21.8H5A2.8 2.8 0 0 1 2.2 19V5A2.8 2.8 0 0 1 5 2.2Zm7 3.6c-3.9 0-7 2.5-7 5.6 0 2.8 2.5 5.1 5.8 5.6.3 0 .5.1.5.4l-.1 1.5c0 .3.2.5.6.3.4-.2 4.8-3 6-4.9.5-.7.7-1.6.7-2.4 0-3.1-3.1-5.6-6.5-5.6Z"/></svg>`,
  },
  {
    name: "band-icon",
    svg: lettermark("BAND", 5.4, { spacing: 0 }),
  },
  {
    name: "daum-icon",
    svg: lettermark("Daum", 6, { spacing: -0.4 }),
  },
  {
    name: "wechat-icon",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9 4C4.9 4 1.6 6.9 1.6 10.4c0 2 1.1 3.8 2.9 5.1L3.7 18l2.9-1.5c.7.2 1.4.3 2.1.3h.4a5.6 5.6 0 0 1-.2-1.5c0-3.4 3.3-6.1 7.2-6.1h.5C15.6 6.1 12.6 4 9 4ZM6.5 7.4a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Zm5 0a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"/><path d="M22.4 15.2c0-2.9-2.9-5.3-6.4-5.3s-6.4 2.4-6.4 5.3 2.9 5.3 6.4 5.3c.7 0 1.4-.1 2.1-.3l2.3 1.2-.6-1.9c1.6-1 2.6-2.5 2.6-4.3Zm-8.5-1.4a.9.9 0 1 1 0 1.9.9.9 0 0 1 0-1.9Zm4.2 0a.9.9 0 1 1 0 1.9.9.9 0 0 1 0-1.9Z"/></svg>`,
  },

  // ── 배달·커머스 ──────────────────────────────────
  {
    name: "baemin-icon",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="17.5" r="2.3"/><circle cx="17.5" cy="17.5" r="2.3"/><path d="M8.3 17.5h6.9"/><path d="m6 15 2.4-6H12l2 4"/><path d="M12.5 9H16l1.5 6.3"/><rect x="14" y="5.4" width="4.2" height="4" rx=".6"/><path d="M8.4 9H6.6"/></svg>`,
  },
  {
    name: "coupang-rocket-icon",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.8 3.2c-3.4-.5-6.8.6-9.2 3.1l-1 1-2.9-.6c-.5-.1-1.1.1-1.5.5L4 10.4c-.5.5-.3 1.3.4 1.5l2.2.5 3.5 3.5.5 2.2c.2.7 1 .9 1.5.4l2.2-2.2c.4-.4.6-1 .5-1.5l-.6-2.9 1-1c2.5-2.4 3.6-5.8 3.1-9.2-.1-.4-.4-.7-.8-.8ZM14.9 9.1a1.7 1.7 0 1 1 2.4-2.4 1.7 1.7 0 0 1-2.4 2.4Z"/><path d="M6.5 16.2c-1.4.2-2.6 1.4-2.8 2.8l-.2 1.5 1.5-.2c1.4-.2 2.6-1.4 2.8-2.8l.1-.9-.9.1c-.2.1-.3.1-.5.2Z"/></svg>`,
  },
  {
    name: "gmarket-icon",
    svg: lettermark("G", 13, { spacing: 0, y: 16.5 }),
  },
  {
    name: "eleven-st-icon",
    svg: lettermark("11st", 6.6, { spacing: -0.3 }),
  },
  {
    name: "ably-icon",
    svg: lettermark("ably", 6.4, { spacing: -0.3 }),
  },

  // ── 콘텐츠·미디어 ────────────────────────────────
  {
    name: "netflix-icon",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6 3h3.6l4.8 13.2V3H18v18h-3.6L9.6 7.8V21H6z"/></svg>`,
  },
  {
    name: "disney-plus-icon",
    svg: lettermark("Disney+", 4, { spacing: -0.2, weight: 700 }),
  },
  {
    name: "tiktok-icon",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M13.2 2.8h3.1c.3 2 1.7 3.6 3.7 3.9v3.1c-1.4 0-2.8-.4-3.8-1.1v6c0 3.4-2.8 6.1-6.1 6.1s-6.1-2.7-6.1-6.1 2.8-6.1 6.1-6.1c.3 0 .7 0 1 .1v3.2c-.3-.1-.7-.2-1-.2-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3V2.8Z"/></svg>`,
  },
  {
    name: "tving-icon",
    svg: lettermark("TVING", 4.8, { spacing: -0.1 }),
  },
  {
    name: "melon-icon",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M9.2 17.4a2.6 2.6 0 1 1-1.7-2.4V6.2l9-2v8.9a2.6 2.6 0 1 1-1.7-2.4V6.6L9.2 8.1z"/></svg>`,
  },

  // ── 모빌리티·지도 ────────────────────────────────
  {
    name: "tmap-icon",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.2c-4.4 0-8 3.4-8 7.7 0 5.3 8 12 8 12s8-6.7 8-12c0-4.3-3.6-7.7-8-7.7Zm-3 5.3h6v1.7h-2.1v5.5h-1.8V9.2H9V7.5Z"/></svg>`,
  },
  {
    name: "socar-icon",
    svg: lettermark("SOCAR", 4.9, { spacing: -0.1 }),
  },

  // ── 대기업·제조 로고 ─────────────────────────────
  {
    name: "hyundai-icon",
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" xmlns="http://www.w3.org/2000/svg"><ellipse cx="12" cy="12" rx="10" ry="5.6"/><path d="M8.5 9.2c-.8.6-1.2 1.5-1.2 2.8 0 1.8 2.1 2.9 4.7 2.9M15.5 14.8c.8-.6 1.2-1.5 1.2-2.8 0-1.8-2.1-2.9-4.7-2.9" stroke-linecap="round"/></svg>`,
  },
  {
    name: "tesla-icon",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 6C6.4 4.7 9.1 4 12 4s5.6.7 7.5 2l-1.4 2.1C16.4 7.1 14.3 6.5 12 6.5s-4.4.6-6.1 1.6L4.5 6z"/><path d="M11.1 7.3h1.8V20h-1.8z"/></svg>`,
  },

  // ── 소셜·커뮤니티 ────────────────────────────────
  {
    name: "amazon-icon",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3.6 15.4c3.6 2.8 8.7 4 13.9 2.2 1.1-.4 2.2-.9 3.2-1.5.5-.3 0-.9-.4-.7-4 1.7-9.3 2.3-14 .6-1.2-.4-2.4-1-3.4-1.7-.4-.3-.8.3-.3.6z"/><path d="M19.4 14c-.6-.7-3.6-.4-4.4-.2-.2 0-.3.1-.1.2 1.6-.1 3.4-.2 3.8.3.3.5-.4 2.3-.7 3.1-.1.2.1.3.3.1 1.2-1 1.5-3.2 1.2-3.5z"/><path d="M14.8 8.4c0-1-.1-1.8-.6-2.5-.4-.6-1.3-1-2.1-1-1.6 0-2.8 1-3.1 2.4l1.8.2c.1-.7.6-1 1.2-1 .4 0 .8.2 1 .6.1.3.1.7.1 1v.4c-1.2 0-2.5.1-3.5.6-1.2.6-2 1.8-2 3.5 0 2.2 1.4 3.3 3.2 3.3 1.5 0 2.3-.4 3.4-1.5.4.5.5.8 1.2 1.3l1.5-1.5c-.4-.4-.9-.9-.9-1.9V8.4zm-2.6 3.1c-.3.6-.9 1-1.5 1-.8 0-1.3-.6-1.3-1.6 0-1.8 1.6-2.1 3.1-2.1v.5c0 .9 0 1.6-.3 2.2z"/></svg>`,
  },

  // ── 지도·모빌리티 (추가) ─────────────────────────
  {
    name: "kakaomap-icon",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.2c-4.4 0-7.9 3.3-7.9 7.5 0 5.2 7.9 12 7.9 12s7.9-6.8 7.9-12c0-4.2-3.5-7.5-7.9-7.5Zm0 4.7a2.8 2.8 0 1 1 0 5.6 2.8 2.8 0 0 1 0-5.6Z"/></svg>`,
  },
  {
    name: "naver-map-icon",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.2c-4.4 0-7.9 3.3-7.9 7.5 0 5.2 7.9 12 7.9 12s7.9-6.8 7.9-12c0-4.2-3.5-7.5-7.9-7.5Zm-3 3.6h2.3l2 3.1V5.8h2.3v7.6h-2.3l-2-3.1v3.1H9V5.8Z"/></svg>`,
  },

  // ── 글로벌 브랜드 (추가) ─────────────────────────
  {
    name: "nike-icon",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M24 7.8 6.442 15.276c-1.456.616-2.679.925-3.668.925-1.12 0-1.933-.392-2.437-1.177-.317-.504-.475-1.16-.475-1.965 0-.28.028-.588.084-.924.28-1.176 1.008-2.716 2.184-4.62-.28.756-.42 1.428-.42 2.016 0 1.4.868 2.1 2.604 2.1.868 0 1.848-.196 2.94-.588L24 7.8Z"/></svg>`,
  },
  {
    name: "adidas-icon",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3 20 5.4 20 7.05 15 4.65 15z"/><path d="M8.3 20 10.7 20 13.67 11 11.27 11z"/><path d="M13.6 20 16 20 20.6 6 18.2 6z"/></svg>`,
  },
  {
    name: "mcdonalds-icon",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6 20V7.5C6 4.8 9.5 4.2 10.7 6.6L12 9l1.3-2.4C14.5 4.2 18 4.8 18 7.5V20h-3V10l-3 5-3-5v10z"/></svg>`,
  },
  {
    name: "mastercard-icon",
    svg: `<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="9.5" cy="12" r="6"/><circle cx="14.5" cy="12" r="6" fill-opacity=".5"/></svg>`,
  },
  { name: "visa-icon", svg: lettermark("VISA", 5.6, { spacing: 0 }) },
  { name: "uber-icon", svg: lettermark("Uber", 6.4, { spacing: -0.3 }) },
  { name: "google-pay-icon", svg: lettermark("GPay", 6) },
  { name: "aliexpress-icon", svg: lettermark("Ali", 8) },
  { name: "temu-icon", svg: lettermark("Temu", 6.2, { spacing: -0.3 }) },

  // ── 한국 금융·페이 (추가) ────────────────────────
  { name: "kb-bank-icon", svg: lettermark("KB", 9, { spacing: 0.2 }) },
  { name: "hana-bank-icon", svg: lettermark("하나", 8.5, { spacing: -0.5 }) },
  { name: "nh-bank-icon", svg: lettermark("NH", 9, { spacing: 0.2 }) },
  { name: "samsung-pay-icon", svg: lettermark("SPay", 6.2, { spacing: -0.3 }) },

  // ── 한국 커머스·여가 (추가) ──────────────────────
  { name: "ohouse-icon", svg: lettermark("오늘의집", 4.8, { spacing: -0.3 }) },

  // ── 일반 아이콘 보충 (브랜드 삭제분 대체, 각 카테고리) ─────────────
  // 소스 아이콘과 같은 선(stroke) 스타일: 24×24, currentColor, 라운드 캡.
  // 자연·음식·여행
  { name: "sun-icon", cat: "life", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.3 17.7-1.4 1.4"/><path d="m19.1 4.9-1.4 1.4"/></svg>` },
  { name: "tree-icon", cat: "life", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 3 7 10h10z"/><path d="M12 8 5 16h14z"/><path d="M10 16h4v5h-4z"/></svg>` },
  { name: "mountain-icon", cat: "life", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="m8 3 4 8 5-5 5 15H2z"/></svg>` },
  { name: "umbrella-icon", cat: "life", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 4a8 8 0 0 1 8 8H4a8 8 0 0 1 8-8z"/><path d="M12 12v6a2 2 0 0 0 4 0"/><path d="M12 2v2"/></svg>` },
  { name: "gift-icon", cat: "life", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/></svg>` },
  // 인터페이스·편집
  { name: "grid-icon", cat: "ui", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>` },
  { name: "scissors-icon", cat: "ui", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.12 15.88"/><path d="M14.47 14.48 20 20"/><path d="M8.12 8.12 12 12"/></svg>` },
  { name: "clipboard-icon", cat: "ui", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>` },
  { name: "crop-icon", cat: "ui", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>` },
  // 상태·기호
  { name: "plus-circle-icon", cat: "symbol", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>` },
  { name: "minus-circle-icon", cat: "symbol", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>` },
  { name: "percent-icon", cat: "symbol", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>` },
  { name: "ban-icon", cat: "symbol", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>` },
  // 쇼핑·금융
  { name: "tag-icon", cat: "commerce", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><path d="M7 7h.01"/></svg>` },
  { name: "banknote-icon", cat: "commerce", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01"/><path d="M18 12h.01"/></svg>` },
  { name: "shopping-bag-icon", cat: "commerce", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>` },
  // 미디어·기기
  { name: "headphones-icon", cat: "media", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a9 9 0 0 1 18 0v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/></svg>` },
  { name: "mic-icon", cat: "media", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><path d="M12 19v3"/></svg>` },
  { name: "tv-icon", cat: "media", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="7" width="20" height="15" rx="2"/><path d="m17 2-5 5-5-5"/></svg>` },
  // 파일·개발·데이터
  { name: "folder-icon", cat: "data", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/></svg>` },
  { name: "server-icon", cat: "data", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01"/><path d="M6 18h.01"/></svg>` },
  // 사람·감정
  { name: "smile-icon", cat: "people", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><path d="M9 9h.01"/><path d="M15 9h.01"/></svg>` },

  // 삭제 브랜드(신한·당근·네이버웹툰·애플페이) 대체 보충 (일반 아이콘, 300개 유지)
  { name: "calendar-icon", cat: "ui", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>` },
  { name: "printer-icon", cat: "media", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8" rx="1"/></svg>` },
  { name: "share-icon", cat: "network", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4"/><path d="m15.4 6.5-6.8 4"/></svg>` },
  { name: "key-icon", cat: "symbol", svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>` },
];
