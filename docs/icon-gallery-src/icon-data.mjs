// 아이콘 데이터 파이프라인 (단일 출처)
// icon-source/icons 의 .tsx 아이콘 + custom-icons 를 읽어
//   1) 정적 SVG 로 변환  2) 카테고리 분류(MECE)  3) 인기순 정렬  4) 한국어 라벨
// 을 붙인 items 배열을 만든다. 렌더 템플릿(build-icon-gallery.mjs)은
// 이 모듈의 collectItems() 결과만 소비한다 → 아이콘 로직은 여기 한 곳만 고친다.
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { customIcons } from "./custom-icons.mjs";
import { koLabels } from "./ko-labels.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = join(__dirname, "icon-source", "icons");

// attr={ ... } 형태를 중괄호 매칭으로 제거 (중첩 {{}} 대응)
function stripJsxBraceAttr(s, attrName) {
  const re = new RegExp(`\\s${attrName}=\\{`, "g");
  let m;
  while ((m = re.exec(s))) {
    const start = m.index;
    let i = m.index + m[0].length; // 첫 '{' 다음
    let depth = 1;
    while (i < s.length && depth > 0) {
      if (s[i] === "{") depth++;
      else if (s[i] === "}") depth--;
      i++;
    }
    s = s.slice(0, start) + s.slice(i);
    re.lastIndex = start;
  }
  return s;
}

// {[ "d1", "d2", ... ].map((d,i) => (<path d={d} .../>))} 형태(동적 path 생성)를
// 정적 <path d="..."/> 들로 펼친다. 중괄호 깊이로 표현식 끝을 찾는다.
function expandPathArrayMap(s) {
  let idx;
  while ((idx = s.indexOf("{[")) !== -1) {
    let depth = 0,
      j = idx;
    for (; j < s.length; j++) {
      if (s[j] === "{") depth++;
      else if (s[j] === "}") {
        depth--;
        if (depth === 0) break;
      }
    }
    const expr = s.slice(idx, j + 1); // {[ ... ].map(...)}
    const arrEnd = expr.indexOf("].map");
    const arrPart = arrEnd !== -1 ? expr.slice(0, arrEnd) : expr;
    const ds = [...arrPart.matchAll(/"([^"]+)"|'([^']+)'/g)].map(
      (m) => m[1] || m[2],
    );
    const paths = ds.map((d) => `<path d="${d}"/>`).join("");
    s = s.slice(0, idx) + paths + s.slice(j + 1);
  }
  return s;
}

export function extractSvg(tsx) {
  // <motion.svg> 또는 일반 <svg> 루트 모두 지원
  let startIdx = tsx.indexOf("<motion.svg");
  let endTag = "</motion.svg>";
  let endIdx = tsx.indexOf(endTag);
  if (startIdx === -1) {
    startIdx = tsx.indexOf("<svg");
    endTag = "</svg>";
    endIdx = tsx.lastIndexOf(endTag);
  }
  if (startIdx === -1 || endIdx === -1) return null;
  let svg = tsx.slice(startIdx, endIdx + endTag.length);

  // JSX 주석 {/* ... */} 제거 (정적 SVG로 새어나가면 안 됨)
  svg = svg.replace(/\{\/\*[\s\S]*?\*\/\}/g, "");

  // motion.X → X
  svg = svg.replace(/motion\./g, "");

  // 평소(rest 상태) 숨겨진 요소 제거: initial 에 opacity:0 인 도형은
  // hover 애니메이션 때만 나타나는 장식이므로 정적 아이콘에선 빼야 깔끔하다.
  svg = svg.replace(
    /<(\w+)\b[^>]*?\binitial=\{\{[^{}]*opacity:\s*0[^{}]*\}\}[^>]*?(?:\/>|>[\s\S]*?<\/\1>)/g,
    "",
  );
  // 숨김 장식 2: opacity={0} prop 로 숨긴 hover 장식 (예: facebook 👍, filter 입자)
  svg = svg.replace(
    /<(\w+)\b[^>]*?\bopacity=\{0\}[^>]*?(?:\/>|>[\s\S]*?<\/\1>)/g,
    "",
  );
  // 색상 하드코딩 장식 제거: icon-source 아이콘은 단색(currentColor/none)이므로
  // #FFD700 같은 hex 컬러가 박힌 요소는 hover 색종이 등 장식이다 (예: trophy).
  svg = svg.replace(
    /<(\w+)\b[^>]*?\bfill="#[0-9A-Fa-f]{3,6}"[^>]*?(?:\/>|>[\s\S]*?<\/\1>)/g,
    "",
  );
  // 이모지가 든 <text> 제거 (정적 아이콘에 이모지가 새면 안 됨)
  svg = svg.replace(/<text\b[^>]*>[\s\S]*?<\/text>/g, (m) =>
    /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/u.test(m) ? "" : m,
  );

  // {...props} 같은 스프레드 표현식 제거
  svg = svg.replace(/\{\s*\.\.\.[^}]*\}/g, "");

  // 동적 path 배열(.map) → 정적 <path> 들로 펼치기 (예: brand-openai)
  svg = expandPathArrayMap(svg);

  // <defs>…</defs> 제거: 런타임 id(useId)에 의존하는 clipPath 등은 정적에선 무효
  svg = svg.replace(/<defs>[\s\S]*?<\/defs>/g, "");

  // 드롭할 JSX 전용 표현식 속성들 (중괄호 매칭)
  for (const a of [
    "ref", "onHoverStart", "onHoverEnd", "onTap", "onTapStart",
    "initial", "animate", "exit", "variants", "transition",
    "whileHover", "whileTap", "whileInView", "custom",
  ]) {
    svg = stripJsxBraceAttr(svg, a);
  }

  // 동적 바인딩 → 고정값
  svg = svg.replace(/width=\{[^}]*\}/g, 'width="24"');
  svg = svg.replace(/height=\{[^}]*\}/g, 'height="24"');
  svg = svg.replace(/stroke=\{[^}]*\}/g, 'stroke="currentColor"');
  svg = svg.replace(/strokeWidth=\{[^}]*\}/g, 'strokeWidth="2"');
  svg = svg.replace(/fill=\{[^}]*\}/g, 'fill="currentColor"');

  // className: 템플릿 리터럴/표현식 → class 로, 단순 문자열 유지
  svg = svg.replace(/className=\{`[^`]*`\}/g, ""); // svg 루트의 cursor-pointer 등 제거
  svg = svg.replace(/className=/g, "class=");

  // 남은 템플릿 리터럴 동적 속성을 가진 요소 제거 (className 정리 후 실행 — 예: stripe hover clip 오버레이)
  svg = svg.replace(/<(\w+)\b[^>]*`[^>]*?(?:\/>|>[\s\S]*?<\/\1>)/g, "");

  // style={{ transformOrigin: "..." }} → style="transform-origin:..."
  svg = svg.replace(/style=\{\{([^}]*)\}\}/g, (_, body) => {
    const css = body
      .split(",")
      .map((kv) => {
        const idx = kv.indexOf(":");
        if (idx === -1) return "";
        let k = kv.slice(0, idx).trim().replace(/['"]/g, "");
        let v = kv.slice(idx + 1).trim().replace(/['"]/g, "");
        k = k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
        return `${k}:${v}`;
      })
      .filter(Boolean)
      .join(";");
    return css ? `style="${css}"` : "";
  });

  // 남은 camelCase SVG 속성 → kebab-case
  const attrMap = {
    strokeWidth: "stroke-width", strokeLinecap: "stroke-linecap",
    strokeLinejoin: "stroke-linejoin", strokeDasharray: "stroke-dasharray",
    strokeDashoffset: "stroke-dashoffset", strokeOpacity: "stroke-opacity",
    fillRule: "fill-rule", clipRule: "clip-rule", clipPath: "clip-path",
    fillOpacity: "fill-opacity",
  };
  for (const [k, v] of Object.entries(attrMap)) {
    svg = svg.replace(new RegExp(k, "g"), v);
  }

  // 남은 표현식 속성 {..} 정리 + 빈 줄/공백 정리
  svg = svg.replace(/\s+[a-zA-Z-]+=\{[^}]*\}/g, "");
  // 줄바꿈+들여쓰기(태그 내부 포함)를 단일 공백으로 — d="..." 등 따옴표 값엔 줄바꿈이 없어 안전
  svg = svg.replace(/\s*\n\s*/g, " ");
  svg = svg.replace(/>\s+</g, "><");   // 태그 사이 공백 제거
  svg = svg.replace(/\s+>/g, ">");     // 여는 태그 끝의 잉여 공백 제거
  svg = svg.replace(/\s{2,}/g, " ");   // 속성 사이 다중 공백 → 1칸
  return svg.trim();
}

// ── 카테고리 정의 (MECE: 상호 배타 + 전체 포괄) ─────────────────────────
// 분류 기준: "무엇을 그리고 있나"(대상)가 아니라 "무엇을 찾으러 왔나"(용도).
// 아래 순서대로 먼저 걸리는 규칙이 이긴다 → 한 아이콘은 정확히 한 카테고리.
// 순서 = 웹/버튼에서 실제로 많이 쓰는 순. (방향·UI·브랜드·로그인이 최상단)
export const CATEGORIES = [
  { key: "all",      label: "전체" },
  { key: "arrow",    label: "방향·화살표" },
  { key: "ui",       label: "인터페이스·편집" },
  { key: "brand",    label: "브랜드·로고" },
  { key: "comm",     label: "커뮤니케이션" },
  { key: "people",   label: "사람·감정" },
  { key: "media",    label: "미디어·기기" },
  { key: "commerce", label: "쇼핑·금융" },
  { key: "network",  label: "연결·네트워크" },
  { key: "data",     label: "파일·개발·데이터" },
  { key: "life",     label: "자연·음식·여행" },
  { key: "symbol",   label: "상태·기호" },
];

// 우선순위 순(먼저 걸리는 규칙이 이김) → 한 아이콘은 정확히 한 카테고리(MECE).
function categorize(n) {
  const has = (...subs) => subs.some((s) => n.includes(s));
  const is = (...names) => names.includes(n);

  // 브랜드·로고: 회사/서비스/언어 마크 (kservice 는 별도 preset)
  if (
    n.startsWith("brand-") ||
    is(
      "apple-brand-logo", "github-icon", "github-copilot-icon", "gitlab-icon",
      "discord-icon", "docker-icon", "figma-icon", "facebook-icon",
      "instagram-icon", "linkedin-icon", "twitter-icon", "twitter-x-icon",
      "youtube-icon", "spotify-icon", "slack-icon", "snapchat-icon",
      "pinterest-icon", "whatsapp-icon", "gmail-icon", "python-icon",
      "javascript-icon", "typescript-icon", "golang-icon", "nodejs-icon",
      "mysql-icon",
    )
  ) return "brand";

  // 상태·기호: 체크/경고/정보/잠금/별 + 순수 글리프
  if (
    is("ampersand-icon", "copyright-icon", "question-mark", "at-sign-icon",
       "hashtag-icon", "subscript-icon", "dialpad-icon", "info-circle-icon",
       "triangle-alert-icon", "lock-icon", "shield-check", "star-icon",
       "x-icon", "checked-icon", "filled-checked-icon", "simple-checked-icon",
       "double-check-icon")
  ) return "symbol";

  // 방향·화살표: 방향 이동 전반
  if (
    has("arrow", "chevron") ||
    is("expand-icon", "external-link-icon", "download-icon", "upload-icon",
       "logout-icon", "send-icon", "send-horizontal-icon", "refresh-icon",
       "history-circle-icon")
  ) return "arrow";

  // 쇼핑·금융: 돈·결제·쇼핑·보상
  if (
    has("cart", "currency", "coin", "wallet") ||
    is("credit-card", "rosette-discount-icon", "rosette-discount-check-icon",
       "trophy-icon", "rosette-icon")
  ) return "commerce";

  // 사람·감정: 사람·표정·마음
  if (
    has("user") ||
    is("users-icon", "users-group-icon", "angry-icon", "annoyed-icon",
       "meh-icon", "ghost-icon", "skull-emoji", "party-popper-icon",
       "hand-heart-icon", "heart-icon", "like-icon", "scan-heart-icon",
       "accessibility-icon", "paw-print-icon")
  ) return "people";

  // 커뮤니케이션: 메일·메시지·알림·전화
  if (
    has("mail", "message", "bell") ||
    is("telephone-icon", "phone-volume")
  ) return "comm";

  // 연결·네트워크: 신호·연결·클라우드·전 세계
  if (
    has("wifi", "bluetooth", "plug", "cloud") ||
    is("link-icon", "unlink-icon", "globe-icon", "world-icon", "router-icon",
       "satellite-dish-icon")
  ) return "network";

  // 미디어·기기: 소리·영상·하드웨어·기기
  if (
    has("camera", "volume", "battery") ||
    is("player-icon", "vinyl-icon", "drum-icon", "gamepad-icon",
       "device-airpods-icon", "washing-machine-icon", "dino-icon", "cpu-icon",
       "radio-icon")
  ) return "media";

  // 파일·개발·데이터: 코드·터미널·차트·문서·스캔
  if (
    has("chart", "code") ||
    is("terminal-icon", "bug-icon", "brain-circuit-icon", "keyframes-icon",
       "qrcode-icon", "scan-barcode-icon", "gauge-icon", "file-description-icon",
       "book-icon", "library-icon", "bookmark-icon")
  ) return "data";

  // 인터페이스·편집: 레이아웃·편집 조작·화면 컨트롤
  if (
    has("layout", "slider", "align", "dots", "layer", "stack") ||
    is("toggle-icon", "filter-icon", "unordered-list-icon", "focus-icon",
       "magnifier-icon", "eye-icon", "eye-off-icon", "copy-icon",
       "copy-off-icon", "save-icon", "trash-icon", "pen-icon", "paint-icon",
       "gear-icon", "sliders-horizontal-icon", "target-icon", "locate-icon",
       "mouse-pointer-2-icon")
  ) return "ui";

  // 자연·음식·여행: 나머지 실물/장소/자연/일상 (포괄 버킷)
  return "life";
}

// ── 카테고리 내부 정렬 순서 (많이 쓰는 것 먼저) ─────────────────────────
const POPULAR = {
  arrow: [
    "right-chevron", "down-chevron",
    "arrow-narrow-right-icon", "arrow-narrow-left-icon",
    "arrow-narrow-up-icon", "arrow-narrow-down-icon",
    "download-icon", "upload-icon", "external-link-icon", "refresh-icon",
    "expand-icon", "arrow-back-icon", "arrow-back-up-icon",
    "send-icon", "send-horizontal-icon", "logout-icon", "history-circle-icon",
    "arrow-big-right-icon", "arrow-big-left-icon",
    "arrow-big-up-icon", "arrow-big-down-icon",
  ],
  ui: [
    "magnifier-icon", "filter-icon", "eye-icon", "eye-off-icon",
    "copy-icon", "save-icon", "trash-icon", "pen-icon",
    "gear-icon", "sliders-horizontal-icon", "toggle-icon",
    "dots-vertical-icon", "dots-horizontal-icon",
    "layout-dashboard-icon", "layers-icon", "unordered-list-icon",
    "align-center-icon", "target-icon", "focus-icon",
    "locate-icon", "mouse-pointer-2-icon", "paint-icon", "copy-off-icon",
  ],
  brand: [
    "brand-google-icon", "apple-brand-logo", "facebook-icon", "kakaotalk-icon",
    "naver-icon", "github-icon", "instagram-icon", "youtube-icon",
    "twitter-x-icon", "twitter-icon", "linkedin-icon",
    "kakao-pay-icon", "naver-pay-icon", "toss-icon", "coupang-icon",
    "baemin-icon", "discord-icon", "slack-icon", "whatsapp-icon",
    "brand-telegram-icon", "gmail-icon", "netflix-icon", "tiktok-icon",
    "spotify-icon", "amazon-icon", "brand-openai-icon", "brand-anthropic-icon",
    "brand-gemini-icon", "brand-chrome-icon", "brand-notion-icon", "figma-icon",
    "brand-react-icon", "nodejs-icon", "python-icon", "kakao-bank-icon",
    "kb-bank-icon", "shinhan-icon", "daangn-icon", "musinsa-icon",
    "market-kurly-icon", "melon-icon", "kakaomap-icon", "naver-map-icon",
  ],
  comm: [
    "message-circle-icon", "mail-filled-icon", "filled-bell-icon",
    "bell-off-icon", "telephone-icon", "phone-volume",
  ],
  people: [
    "user-icon", "users-icon", "user-plus-icon", "user-check-icon",
    "heart-icon", "like-icon", "users-group-icon", "hand-heart-icon",
    "party-popper-icon", "angry-icon", "annoyed-icon", "meh-icon",
    "ghost-icon", "skull-emoji", "scan-heart-icon", "accessibility-icon",
    "paw-print-icon",
  ],
  media: [
    "camera-icon", "volume-2-icon", "volume-x-icon", "player-icon",
    "camera-off-icon", "battery-icon", "battery-charging-icon", "gamepad-icon",
    "cpu-icon", "device-airpods-icon", "radio-icon", "drum-icon", "vinyl-icon",
    "battery-pause-icon", "washing-machine-icon", "dino-icon",
  ],
  commerce: [
    "cart-icon", "shopping-cart-icon", "credit-card", "wallet-icon",
    "currency-dollar-icon", "currency-euro-icon", "coin-bitcoin-icon",
    "currency-bitcoin-icon", "currency-ethereum-icon", "currency-rupee-icon",
    "rosette-discount-icon", "rosette-discount-check-icon", "trophy-icon",
  ],
  network: [
    "wifi-icon", "wifi-off-icon", "link-icon", "unlink-icon", "globe-icon",
    "bluetooth-connected-icon", "cloud-1-icon", "cloud-2-icon", "cloud-3-icon",
    "plug-connected-icon", "plug-connected-x-icon", "world-icon",
    "router-icon", "satellite-dish-icon",
  ],
  data: [
    "file-description-icon", "code-icon", "code-xml-icon", "terminal-icon",
    "chart-bar-icon", "chart-line-icon", "chart-pie-icon", "bookmark-icon",
    "book-icon", "qrcode-icon", "bug-icon", "brain-circuit-icon",
    "scan-barcode-icon", "chart-histogram-icon", "chart-covariate-icon",
    "keyframes-icon", "library-icon", "gauge-icon",
  ],
  life: [
    "home-icon", "clock-icon", "map-pin-icon", "sparkles-icon", "bulb-svg",
    "moon-icon", "rocket-icon", "flame-icon", "airplane-icon", "coffee-icon",
    "alarm-clock-plus-icon", "rainbow-icon", "brightness-down-icon",
    "banana-icon", "soup-icon", "candy-cane-icon", "ambulance-icon",
    "truck-electric-icon", "hotel-icon", "passport-icon", "travel-bag",
  ],
  symbol: [
    "checked-icon", "x-icon", "info-circle-icon", "triangle-alert-icon",
    "lock-icon", "shield-check", "star-icon", "question-mark",
    "at-sign-icon", "hashtag-icon", "double-check-icon", "simple-checked-icon",
    "filled-checked-icon", "ampersand-icon", "copyright-icon",
    "subscript-icon", "dialpad-icon",
  ],
};

// icon-source/icons + customIcons 를 읽어 정렬·라벨링된 items 배열을 반환한다.
// { items, counts, failed, missingKo } 를 돌려준다.
export function collectItems() {
  // letter-a ~ letter-z(알파벳 낱자)는 아이콘 용도가 약해 제외 — 문자 UI 아님
  const files = readdirSync(ICONS_DIR).filter(
    (f) => f.endsWith(".tsx") && f !== "types.ts" && !f.startsWith("letter-"),
  );

  const items = [];
  let failed = 0;
  for (const f of files) {
    const tsx = readFileSync(join(ICONS_DIR, f), "utf8");
    const svg = extractSvg(tsx);
    const name = f.replace(/\.tsx$/, "");
    if (!svg || !svg.includes("<svg")) {
      failed++;
      continue;
    }
    items.push({ name, svg });
  }

  // 커스텀 로고(한국·인기 서비스) 병합 — 브랜드·로고 카테고리로 편입
  for (const c of customIcons) {
    items.push({ name: c.name, svg: c.svg, cat: c.cat || "brand" });
  }

  for (const it of items) it.cat = it.cat || categorize(it.name);

  // (카테고리 표시 순 → 카테고리 내 인기 순 → 알파벳) 으로 최종 정렬
  const catOrder = Object.fromEntries(CATEGORIES.map((c, i) => [c.key, i]));
  const popRank = {};
  for (const [cat, list] of Object.entries(POPULAR)) {
    list.forEach((name, i) => (popRank[name] = i));
  }
  items.sort((a, b) => {
    const ca = catOrder[a.cat] ?? 99, cb = catOrder[b.cat] ?? 99;
    if (ca !== cb) return ca - cb;
    const pa = popRank[a.name] ?? 999, pb = popRank[b.name] ?? 999;
    if (pa !== pb) return pa - pb;
    return a.name.localeCompare(b.name);
  });

  // 카테고리별 개수 (전체 제외)
  const counts = {};
  for (const it of items) counts[it.cat] = (counts[it.cat] || 0) + 1;

  // 한국어 라벨 매핑 (없으면 영어 파일명 폴백 + 경고)
  const missingKo = [];
  for (const it of items) {
    it.ko = koLabels[it.name];
    if (!it.ko) {
      missingKo.push(it.name);
      it.ko = it.name;
    }
  }

  return { items, counts, failed, missingKo };
}
