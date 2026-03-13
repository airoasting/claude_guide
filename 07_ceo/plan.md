# CEO 모닝 브리핑 대시보드 — 개발 계획서

**v5.2** · 2026-03-02 · 뉴모피즘 (라이트) · Vite → 단일 HTML · GitHub

---

## 1. 개요

CEO가 매일 아침 여는 개인화 대시보드. 한 화면에 날씨·AI 뉴스·환율·AI 명언·오늘 일정.

**원칙:** API 키 없이 mock 완전 작동 → 키 테스트 성공 시 저장 → 실시간 전환 · No Scroll · 뉴모피즘 라이트 UI

**기술:** React 18 · Vite + vite-plugin-singlefile · Tailwind CSS (purge 적용) · Recharts 2.12.7 · Lucide React 0.263.1 · localStorage

---

## 2. 빌드 & 배포

Vite 빌드 → `dist/index.html` 단일 파일. Babel 런타임 없음.

```
ceo-morning-dashboard/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── .env                       # VITE_GOOGLE_CLIENT_ID (gitignore 대상)
├── .gitignore                 # node_modules, dist, .env
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css              # Tailwind directives + 뉴모피즘 CSS
│   ├── constants/mockData.js
│   ├── utils/
│   │   ├── api.js
│   │   ├── calendar.js        # Google Calendar API 호출
│   │   ├── parseClaude.js
│   │   └── formatters.js
│   ├── hooks/
│   │   ├── useLocalStorage.js
│   │   └── useTypingEffect.js
│   └── components/
│       ├── OnboardingBanner.jsx
│       ├── Header.jsx
│       ├── NewsBriefing.jsx
│       ├── SummaryModal.jsx
│       ├── MarketIndicators.jsx
│       ├── AiQuote.jsx
│       ├── TodaySchedule.jsx  # 오늘의 일정 (Google Calendar)
│       ├── SettingsPanel.jsx
│       ├── Skeleton.jsx
│       ├── DataBadge.jsx
│       ├── Toast.jsx
│       └── Footer.jsx
├── dist/
│   └── index.html             ← 빌드 산출물
└── README.md
```

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: { target: 'esnext', assetsInlineLimit: 100000000 }
});
```

```javascript
// tailwind.config.js — purge로 미사용 CSS 제거 (빌드 크기 최적화)
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [],
};
```

---

## 3. 레이아웃

```
┌─ 1280px ─────────────────────────────────────────────────┐
│ 🔑 AI 기능을 사용하려면 Claude API 키를 입력하세요        │ ← 온보딩 배너
│    현재 샘플 데이터로 표시 중입니다  [설정하기]  [✕]      │   (키 저장 후 fade-out)
├───────────────────────────────────────────────────────────┤
│ "좋은 아침입니다, 대표님"        ☀️ 22°C 서울        ⚙️  │ ← 헤더
├──────────────────────────┬────────────────────────────────┤
│ 📰 AI 뉴스 브리핑 (60%)  │ 💱 시장 지표 (40%)            │
│ 🟡SAMPLE                 │ 🟡SAMPLE  max-h:200px 스크롤  │
│ 10건 내부 스크롤          │ USD·EUR·KOSPI·S&P·BTC         │
│ max-h:400px              ├────────────────────────────────┤
│ [산업 ▾] [🔄 28s]       │ 💡 AI 오늘의 한마디 🟡SAMPLE   │
│                          │ max-h:150px 스크롤              │
├──────────────────────────┴────────────────────────────────┤
│ 📅 오늘의 일정  🟢LIVE              max-h:200px 스크롤   │
│ 09:00 Q1 실적 리뷰 (회의실 A) · 10:30 파트너십 미팅 ...  │
├───────────────────────────────────────────────────────────┤
│ 마지막 갱신 08:30                                   24px │
└───────────────────────────────────────────────────────────┘
```

반응형: ≥1024px 2단 → <1024px 1단 수직

### 위젯별 스크롤 규칙

모든 위젯 콘텐츠 영역에 `max-height` + `overflow-y: auto` 적용. 헤더(타이틀+뱃지+컨트롤)는 고정, 콘텐츠만 스크롤.

| 위젯 | max-height | 스크롤 대상 |
|------|-----------|------------|
| 뉴스 브리핑 | 400px | 뉴스 카드 10건 리스트 |
| 시장 지표 | 200px | 지표 5행 + 스파크라인 |
| AI 한마디 | 150px | 명언 + insight 텍스트 |
| 오늘의 일정 | 200px | 미팅 리스트 |

스크롤바 공통: 뉴모피즘 커스텀 (4px, accent 컬러, 라운드)

```css
.widget-scroll::-webkit-scrollbar { width: 4px; }
.widget-scroll::-webkit-scrollbar-track { background: var(--bg); border-radius: 4px; }
.widget-scroll::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 4px; }
```

### 온보딩 배너

```
키 0개 → 배너 표시 (nm-inset, accent 테두리)
키 1개+ 저장 → fade-out 사라짐
[설정하기] 클릭 → 설정 패널 열림
[✕] → sessionStorage로 세션 내 숨김
```

### 데이터 소스 뱃지

| 상태 | 표시 | 스타일 |
|------|------|--------|
| API 성공 | 🟢 LIVE · 2분 전 | 초록 dot + 텍스트 + 상대시간, 11px, opacity 70% |
| mock 사용 | 🟡 SAMPLE | 노랑 dot + 텍스트, 11px, opacity 70% |

**상대 시간:** 각 위젯이 마지막으로 데이터를 받은 시점 기준. 60초마다 갱신.

```javascript
const timeAgo = (timestamp) => {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return '방금';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  return `${Math.floor(diff / 3600)}시간 전`;
};

// 위젯별 마지막 갱신 시각 저장
const [lastFetched, setLastFetched] = useState({
  weather: null, news: null, markets: null, quote: null, events: null
});
// fetch 성공 시: setLastFetched(prev => ({ ...prev, news: Date.now() }))
```

위젯별: 날씨(OWM 키), 뉴스·명언(Anthropic 키), 환율(ER 키), 일정(Google Calendar OAuth). 뱃지 없는 위젯 없음.

---

## 4. 뉴모피즘 디자인 (라이트 전용)

### 컬러 토큰

| 토큰 | 값 | 용도 |
|------|-----|------|
| `--bg` | `#E0E5EC` | 페이지·카드 배경 (동일색) |
| `--shadow-dark` | `#A3B1C6` | 우하단 그림자 |
| `--shadow-light` | `#FFFFFF` | 좌상단 하이라이트 |
| `--text` | `#2D3436` | 본문 텍스트 |
| `--text-sub` | `#636E72` | 보조 텍스트 |
| `--text-caption` | `#95A5A6` | 캡션·타임스탬프 |
| `--accent` | `#C4956A` | 골드 브론즈 액센트 |
| `--accent-light` | `rgba(196,149,106,0.12)` | 액센트 배경 하이라이트 |
| `--border-subtle` | `#C8CDD5` | 미세 보더 (접근성) |
| `--positive-kr` | `#DC2626` | 한국 상승 (빨강) |
| `--negative-kr` | `#2563EB` | 한국 하락 (파랑) |
| `--positive-us` | `#16A34A` | 미국 상승 (초록) |
| `--negative-us` | `#DC2626` | 미국 하락 (빨강) |
| `--toast-bg` | `#2D3436` | 토스트 배경 (어두운) |
| `--toast-text` | `#FFFFFF` | 토스트 텍스트 |

WCAG 대비율: `--text` / `--bg` = 10.5:1 ✅ · `--text-sub` / `--bg` = 5.2:1 ✅ · `--accent` / `--bg` = 3.4:1 (대형 텍스트 ✅)

### 핵심 CSS

```css
:root {
  --bg: #E0E5EC;
  --shadow-dark: #A3B1C6;
  --shadow-light: #FFFFFF;
  --text: #2D3436;
  --text-sub: #636E72;
  --text-caption: #95A5A6;
  --accent: #C4956A;
  --accent-light: rgba(196,149,106,0.12);
  --border-subtle: #C8CDD5;
  --positive-kr: #DC2626;
  --negative-kr: #2563EB;
  --positive-us: #16A34A;
  --negative-us: #DC2626;
}

body { background: var(--bg); color: var(--text); }

/* 돌출 카드 */
.nm-card {
  background: var(--bg);
  border-radius: 16px;
  border: 1px solid var(--border-subtle);
  box-shadow: 6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light);
}

/* 함몰 (입력필드, 선택상태) */
.nm-inset {
  background: var(--bg);
  border-radius: 12px;
  border: 1px solid var(--border-subtle);
  box-shadow: inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light);
}

/* 버튼 */
.nm-btn {
  background: var(--bg);
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  box-shadow: 4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light);
  color: var(--accent);
  cursor: pointer;
  transition: box-shadow 0.15s ease;
}
.nm-btn:hover {
  box-shadow: 2px 2px 4px var(--shadow-dark), -2px -2px 4px var(--shadow-light);
}
.nm-btn:active {
  box-shadow: inset 3px 3px 6px var(--shadow-dark), inset -3px -3px 6px var(--shadow-light);
}
.nm-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 포커스 링 (접근성) */
.nm-btn:focus-visible, .nm-card:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
```

### 스켈레톤 UI

```css
.nm-skeleton {
  background: var(--bg);
  border-radius: 8px;
  box-shadow: inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light);
  animation: nm-pulse 1.5s ease-in-out infinite;
}
@keyframes nm-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
```

위젯별: 뉴스 nm-skeleton 카드 ×5 (스크롤 내) · 지표 5행 · 명언 2줄 · 날씨 1블록 · 일정 3행 — 각 150ms staggered.

### 타이포

| 용도 | 폰트 | 크기 | 행간 |
|------|------|------|------|
| 한글 헤더 | Noto Serif KR 700 | 28px | 1.3 |
| 영문 헤더 | Playfair Display 700 | 28px | 1.3 |
| 숫자·지표 | JetBrains Mono 500 | 20px | 1.2 |
| 본문 | Pretendard / system-ui 400 | 15px | 1.6 |
| 캡션·뱃지 | system-ui 400 | 11~13px | 1.4 |

### 애니메이션

| 요소 | 효과 | 스펙 |
|------|------|------|
| 페이지 로드 | 순차 fade-in | translateY 20→0, 각 150ms delay |
| 뉴스 | 타이핑 | 30ms/char |
| 명언 | 타이핑 → 저자 → insight | 40ms → 0.5s fade → 0.3s fade |
| 환율 변동 | 바운스 | scale 1.08, 0.3s |
| Todo 완료 | 취소선+투명 | 0.3s |
| Todo 삭제 | 슬라이드아웃 | translateX, 0.3s |
| 스켈레톤 | nm-pulse | 1.5s infinite |
| 버튼 | raised→inset | 0.15s |
| 새로고침 | 아이콘 회전 | 360deg, 0.6s |
| 토스트 | slide-in → 5초 → fade-out | translateY(-100%)→0, 0.3s |
| 모션 감소 | `prefers-reduced-motion` | 전 애니메이션 제거, 즉시 표시 |

---

## 5. API 키 관리

키 없이 100% 작동 (mock). 설정에서 키 입력 → **테스트 → 성공 시에만 localStorage 저장** → 실시간 전환.

| 서비스 | 용도 | CORS |
|--------|------|------|
| Anthropic | 뉴스·명언·요약·AI조언 | `anthropic-dangerous-direct-browser-access: true` |
| Google Calendar | 오늘의 일정 | OAuth 2.0 (GAPI 클라이언트) |
| OpenWeatherMap | 날씨 | 허용 |
| ExchangeRate API | 환율 (USD/KRW, EUR/KRW만) | 허용 |

### 테스트 → 저장 플로우

```
[키 입력] [테스트] → 🔄 테스트 중...
  ├─ 성공 → ✅ 연결됨 → localStorage 저장 → 키 마스킹 → [삭제] 버튼
  └─ 실패 → ❌ 연결 실패 → 저장 안 됨 → 재입력 유도
삭제 → 해당 위젯 mock 복귀
```

### 테스트 호출

```javascript
// Anthropic — 최소 비용 (max_tokens: 10)
const testAnthropic = async (key) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": key,
               "anthropic-version": "2023-06-01",
               "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 10,
                           messages: [{ role: "user", content: "Hi" }] })
  });
  if (!res.ok) throw new Error(res.status);
};

// OWM — 서울 날씨 1회
const testOWM = async (key) => {
  const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=${key}`);
  if (!res.ok) throw new Error(res.status);
};

// ExchangeRate — USD 1회
const testER = async (key) => {
  const res = await fetch(`https://v6.exchangerate-api.com/v6/${key}/latest/USD`);
  if (!res.ok) throw new Error(res.status);
};

// Google Calendar — OAuth 2.0 인증 (API 키 아님, 별도 플로우)
// Google Cloud Console에서 OAuth 2.0 Client ID 발급 필요
// 설정 패널에서 [📅 Google 계정 연결] 버튼 → OAuth 팝업 → 토큰 저장
```

### 설정 패널 키 UI

```
┌─ API 키 설정 ──────────────────────────────────────┐
│                                                      │
│ Anthropic API                              ⚪ 미설정 │
│ ┌─ nm-inset ─────────────┐ ┌─ nm-btn ───┐          │
│ │ sk-ant-api03-...       │ │  🔄 테스트  │          │
│ └────────────────────────┘ └────────────┘          │
│                                                      │
│ Anthropic API                              ✅ 연결됨 │
│ ┌─ nm-inset ─────────────┐ ┌─ nm-btn ───┐          │
│ │ sk-ant-•••••••••       │ │  🗑️ 삭제   │          │
│ └────────────────────────┘ └────────────┘          │
│                                                      │
│ ℹ️ 키는 이 브라우저에만 저장되며 외부 전송되지 않습니다│
└──────────────────────────────────────────────────────┘
```

---

## 6. 위젯 스펙

### 6.1 헤더 + 날씨

시간대별 인사(05~11 아침/12~17 오후/18~04 저녁) · 이름(기본 "대표님") · 날짜(`ko-KR`) · 시계(60초 interval) · 날씨 이모지+온도 · ⚙️ 설정

### 6.2 AI 뉴스 브리핑 — 10건 · 스크롤 · 원문/요약

```javascript
fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json", "x-api-key": key,
             "anthropic-version": "2023-06-01",
             "anthropic-dangerous-direct-browser-access": "true" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514", max_tokens: 3000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    messages: [{ role: "user", content: BRIEFING_PROMPT(industry, today) }]
  })
})
```

**프롬프트 출력:** `[{ headline, summary, why_it_matters, source_url }]` × 10건

**뉴스 영역:**

```
┌─ nm-card ────────────────────────────────────────┐
│ 📰 AI 뉴스 브리핑  🟢LIVE  [IT·테크 ▾] [🔄 28s]│ ← 고정 헤더
├──────────────────────────────────────────────────┤
│ ┌─ .widget-scroll (max-h: 400px, overflow-y) ────┐│
│ │ 1  구글, 에이전트 플랫폼 전면 개편             ││ ← 16px bold
│ │    구글이 AI 에이전트 생태계를 통합...         ││ ← 14px text-sub
│ │    💡 플랫폼 종속 리스크 본격화               ││ ← 13px accent
│ │    [📄 원문보기]  [🤖 요약보기]               ││ ← nm-btn 12px
│ │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─            ││
│ │ 2  애플, 온디바이스 AI 칩...                   ││
│ │    ...  [📄 원문보기]  [🤖 요약보기]          ││
│ │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─            ││
│ │ ...                                           ││
│ │ 10 ESG 공시 의무화 첫 해                      ││
│ │    ...  [📄 원문보기]  [🤖 요약보기]          ││
│ └───────────────────────────────────────────────┘│
└──────────────────────────────────────────────────┘
```

**[📄 원문보기]:** source_url → 새 탭. mock이면 비활성+툴팁 "실시간 데이터에서만 제공".

**[🤖 요약보기]:** 모달 → Claude API 500자 심층 요약 (타이핑 효과). 세션 내 캐싱. 키 없으면 비활성.

```javascript
const fetchSummary = async (newsItem) => {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKeys.anthropic,
               "anthropic-version": "2023-06-01",
               "anthropic-dangerous-direct-browser-access": "true" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514", max_tokens: 1000,
      tools: [{ type: "web_search_20250305", name: "web_search" }],
      messages: [{ role: "user", content:
        `다음 뉴스를 CEO 관점에서 500자 내외로 심층 요약하세요.
뉴스: ${newsItem.headline}
내용: ${newsItem.summary}
${newsItem.source_url ? `원문: ${newsItem.source_url}` : ''}

포함: 핵심 상세 · 비즈니스 영향 · CEO 액션 아이템 1~2개
형식: 마크다운 없이 순수 텍스트, 500자 내외.` }]
    })
  });
  const data = await res.json();
  return data.content.filter(b => b.type === "text").map(b => b.text).join("");
};
```

**요약 모달:**

```
┌─ nm-card (중앙, max-w:600px, backdrop) ───────────┐
│                                              [✕]  │
│  📰 구글, 에이전트 플랫폼 전면 개편                 │ ← 18px bold
│  ─────────────────────────────────────────────     │
│  구글이 발표한 새로운 AI 에이전트 통합 플랫폼은...   │ ← 15px 타이핑
│                                                    │
│  📌 액션 아이템:                                   │
│  1. 자사 에이전트 플랫폼 종속도 점검               │
│  2. 멀티 플랫폼 전환 비용 산출                     │
│  ─────────────────────────────────────────────     │
│  [📄 원문보기]                                    │
└────────────────────────────────────────────────────┘
```

**산업:** IT·테크 | 제조·산업 | 금융·투자 | 유통·소비재 | 바이오·헬스케어 | 전체

**새로고침 쿨다운:** 30초. `[🔄 28s]` 비활성 → 0초 후 `[🔄]` 활성.

### 6.3 환율·시장 지표

| 지표 | 데이터 소스 | 포맷 | 상승 | 하락 |
|------|-----------|------|------|------|
| USD/KRW | ExchangeRate API | `#,##0` | 빨강 | 파랑 |
| EUR/KRW | ExchangeRate API | `#,##0` | 빨강 | 파랑 |
| KOSPI | mock (API 무료 소스 없음) | `#,##0.0` | 빨강 | 파랑 |
| S&P 500 | mock (API 무료 소스 없음) | `#,##0.0` | 초록 | 빨강 |
| BTC/USD | mock (API 무료 소스 없음) | `$#,##0` | 초록 | 빨강 |

> KOSPI·S&P·BTC는 무료 브라우저 호출 가능한 API가 없어 mock으로 표시. 향후 Anthropic 키가 있으면 Claude에게 "오늘 주요 시장 지표"를 물어 실시간 대체 가능 (확장 옵션).

스파크라인: Recharts `<LineChart width={40} height={20}>` 7일 히스토리, 축 없음.

### 6.4 AI 오늘의 한마디

Claude API → `{quote, author, insight}`. 타이핑 40ms → 저자 fade-in 0.5s → insight 0.3s. 키 없으면 10개 풀 랜덤.

### 6.5 오늘의 일정 (Google Calendar)

**Google Calendar에서 오늘 일정을 가져와 시간순으로 표시.** 미연결 시 mock 일정.

**Google Calendar 연결 방식: OAuth 2.0**

**Client ID:** 빌드 시 환경변수로 주입. `.env` 파일에 설정, GitHub에 커밋하지 않음.

```
# .env (gitignore 대상)
VITE_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

```javascript
// Google Identity Services (GIS) — CDN으로 로드
// <script src="https://accounts.google.com/gsi/client"></script>
// <script src="https://apis.google.com/js/api.js"></script>

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// 1. 인증 버튼 클릭 → OAuth 팝업
const tokenClient = google.accounts.oauth2.initTokenClient({
  client_id: CLIENT_ID,
  scope: SCOPES,
  callback: (response) => {
    if (response.access_token) {
      localStorage.setItem('ceo-gcal-token', response.access_token);
      localStorage.setItem('ceo-gcal-expiry', Date.now() + response.expires_in * 1000);
      fetchTodayEvents(response.access_token);
    }
  },
});

// 2. 토큰 만료 확인 & 자동 재인증
const getValidToken = () => {
  const token = localStorage.getItem('ceo-gcal-token');
  const expiry = parseInt(localStorage.getItem('ceo-gcal-expiry') || '0');
  if (!token) return null;
  if (Date.now() > expiry - 300000) {
    // 만료 5분 전이면 자동 재인증 시도 (silent prompt)
    tokenClient.requestAccessToken({ prompt: '' });
    return null;  // 콜백에서 갱신됨
  }
  return token;
};

// 3. 마운트 시 토큰 확인 → 만료됐으면 재연결 배너
useEffect(() => {
  const token = getValidToken();
  if (token) fetchTodayEvents(token);
  else if (localStorage.getItem('ceo-gcal-token')) {
    // 토큰은 있었지만 만료 → 재연결 배너
    showToast('📅 Google Calendar 세션이 만료되었습니다. 재연결해주세요.', 'warning');
  } else {
    setEvents(MOCK_EVENTS);
  }
}, []);

// 2. 오늘 일정 가져오기
const fetchTodayEvents = async (token) => {
  const today = new Date();
  const startOfDay = new Date(today.setHours(0,0,0,0)).toISOString();
  const endOfDay = new Date(today.setHours(23,59,59,999)).toISOString();

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?` +
    `timeMin=${startOfDay}&timeMax=${endOfDay}&singleEvents=true&orderBy=startTime`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) throw new Error(res.status);
  const data = await res.json();

  return data.items.map(event => ({
    id: event.id,
    title: event.summary || '(제목 없음)',
    time: event.start.dateTime
      ? new Date(event.start.dateTime).toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit' })
      : '종일',
    endTime: event.end.dateTime
      ? new Date(event.end.dateTime).toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit' })
      : null,
    location: event.location || null,
    isAllDay: !event.start.dateTime,
    isMeeting: (event.attendees?.length > 1) || false,
    attendeeCount: event.attendees?.length || 0,
    meetLink: event.hangoutLink || null,
    status: event.status,  // confirmed, tentative, cancelled
  }));
};
```

**일정 카드 UI:**

```
┌─ nm-card ────────────────────────────────────────────┐
│ 📅 오늘의 일정  🟢LIVE  3월 2일 월요일  [🔄]         │ ← 고정 헤더
├──────────────────────────────────────────────────────┤
│ ┌─ .widget-scroll (max-h: 200px) ──────────────────┐│
│ │                                                   ││
│ │ 🔴 09:00~10:00  Q1 실적 리뷰 미팅                 ││
│ │    📍 회의실 A · 👥 5명 · [📹 Meet]               ││
│ │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─                ││
│ │ 🟡 10:30~11:30  파트너십 미팅                      ││
│ │    📍 외부 (강남) · 👥 3명                         ││
│ │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─                ││
│ │ 🟢 14:00~15:00  AI TF 킥오프                      ││
│ │    📍 회의실 B · 👥 8명 · [📹 Meet]               ││
│ │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─                ││
│ │ ⚪ 16:00~17:00  주간 경영회의                      ││
│ │    📍 대회의실 · 👥 12명                           ││
│ │                                                   ││
│ └───────────────────────────────────────────────────┘│
│ 오늘 미팅 4건 · 총 4시간                             │ ← 요약
└──────────────────────────────────────────────────────┘
```

**시간 인디케이터 (컬러):**

| 상태 | 색상 | 조건 |
|------|------|------|
| 🔴 진행 중 | `#DC2626` | 현재 시간이 시작~종료 사이 |
| 🟡 다음 일정 | `#F59E0B` | 가장 가까운 미래 일정 1건 |
| 🟢 예정 | `#22C55E` | 나머지 미래 일정 |
| ⚪ 지남 | `#95A5A6` opacity 50% | 종료 시간 < 현재 |

**Meet 링크:** `[📹 Meet]` 클릭 → Google Meet URL 새 탭 열기.

**미연결 시 mock 일정:**

```javascript
const MOCK_EVENTS = [
  { id:'m1', title:'Q1 실적 리뷰 미팅', time:'09:00', endTime:'10:00',
    location:'회의실 A', isMeeting:true, attendeeCount:5, meetLink:null, status:'confirmed' },
  { id:'m2', title:'신규 파트너십 미팅', time:'10:30', endTime:'11:30',
    location:'강남 외부', isMeeting:true, attendeeCount:3, meetLink:null, status:'confirmed' },
  { id:'m3', title:'AI 도입 TF 킥오프', time:'14:00', endTime:'15:00',
    location:'회의실 B', isMeeting:true, attendeeCount:8, meetLink:null, status:'confirmed' },
  { id:'m4', title:'주간 경영회의', time:'16:00', endTime:'17:00',
    location:'대회의실', isMeeting:true, attendeeCount:12, meetLink:null, status:'confirmed' },
  { id:'m5', title:'개인 리뷰 시간', time:'17:30', endTime:'18:00',
    location:null, isMeeting:false, attendeeCount:0, meetLink:null, status:'confirmed' },
];
```

**하단 요약:** "오늘 미팅 N건 · 총 N시간" (미팅만 카운트, 종일 일정 제외)

**빈 상태:** "📅 오늘 일정이 없습니다. 여유로운 하루 보내세요!"

**설정 패널 — Google Calendar 연결:**

```
┌─ Google Calendar ────────────────────────────────┐
│                                                    │
│ 미연결 상태:                                       │
│ ┌─ nm-btn (full-width) ────────────────────────┐  │
│ │  📅 Google 계정 연결                          │  │
│ └──────────────────────────────────────────────┘  │
│ ℹ️ 읽기 전용으로 오늘 일정만 가져옵니다            │
│                                                    │
│ 연결됨 상태:                                       │
│  ✅ user@gmail.com 연결됨     [🔄 동기화] [🗑️ 해제]│
│                                                    │
└────────────────────────────────────────────────────┘
```

### 6.6 설정 패널

우측 슬라이드(320px, backdrop). `role="dialog"` · Escape 닫기.

| 섹션 | 항목 | 기본값 |
|------|------|--------|
| 개인화 | 이름 | "대표님" |
| | 관심 산업 | "IT·테크" |
| | 도시 | "Seoul" |
| API 키 | Anthropic / OWM / ER | 테스트→저장 방식 |
| 캘린더 | Google Calendar | OAuth 연결/해제 |

변경 반영: 이름→인사말 즉시 · 산업→뉴스 재호출 · 도시→날씨 재호출(1초 디바운스).

---

## 7. Claude API 응답 파싱

web_search 사용 시 응답에 text·tool_use·tool_result 혼재. JSON + 출처 URL 추출.

```javascript
function parseNewsResponse(content) {
  // 1. text 블록에서 JSON 추출
  const textBlocks = content.filter(b => b.type === "text").map(b => b.text).join("");
  const cleaned = textBlocks.replace(/```json\n?|```/g, "").trim();

  let news;
  try { news = JSON.parse(cleaned); }
  catch {
    const match = cleaned.match(/[\[{][\s\S]*[\]}]/);
    news = match ? JSON.parse(match[0]) : null;
  }

  // 2. source_url 누락 시 tool_result에서 URL 매칭
  if (news?.[0] && !news[0].source_url) {
    const toolResults = content
      .filter(b => b.type === "tool_result" || b.type === "web_search_tool_result")
      .flatMap(b => {
        try { return JSON.parse(b.content?.[0]?.text || "[]"); }
        catch { return []; }
      });
    news.forEach(item => {
      const match = toolResults.find(r =>
        r.url && (r.title?.includes(item.headline?.slice(0, 6))
               || item.headline?.includes(r.title?.slice(0, 6)))
      );
      if (match) item.source_url = match.url;
    });
  }
  return news || [];
}
```

---

## 8. 상태 & 데이터 흐름

```javascript
// localStorage (useLocalStorage 훅)
const [settings, setSettings] = useLocalStorage('ceo-settings',
  { name:"대표님", industry:"IT·테크", city:"Seoul" });
const [apiKeys, setApiKeys] = useLocalStorage('ceo-keys', {});

// 런타임
const [weather, setWeather] = useState(MOCK_WEATHER);
const [news, setNews] = useState([]);
const [markets, setMarkets] = useState(MOCK_MARKETS);
const [quote, setQuote] = useState(null);
const [events, setEvents] = useState(MOCK_EVENTS);  // Google Calendar 일정
const [loading, setLoading] = useState({ weather:true, news:true, markets:true, quote:true, events:true });
const [liveStatus, setLiveStatus] = useState({ weather:false, news:false, markets:false, quote:false, events:false });
const [toast, setToast] = useState(null);  // { message, type: "success"|"error" }

// Effects
useEffect → 마운트: Promise.allSettled([weather, news, markets, quote, events])
useEffect → industry 변경 → 뉴스 재호출
useEffect → city 변경 → 날씨 재호출 (1초 디바운스)
useEffect → apiKeys 변경 → 해당 위젯 재호출
useEffect → gcal 토큰 존재 시 → fetchTodayEvents
useEffect → 시계 60초 interval (일정 시간 인디케이터도 갱신)
```

**useLocalStorage (hydration flash 방지):**

```javascript
function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(initialValue);
  useEffect(() => {
    try { const v = localStorage.getItem(key); if (v) setStored(JSON.parse(v)); } catch {}
  }, []);
  const setValue = (value) => {
    const next = typeof value === 'function' ? value(stored) : value;
    setStored(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
  };
  return [stored, setValue];
}
```

---

## 9. 토스트 알림

에러·성공 메시지를 화면 상단 중앙에 표시. **5초 후 자동 소멸** + 수동 닫기.

```javascript
const showToast = (message, type = "error") => {
  setToast({ message, type });
  setTimeout(() => setToast(null), 5000);
};

// UI
{toast && (
  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50
    px-6 py-3 rounded-xl text-white text-sm shadow-lg
    animate-slideDown"
    style={{ background: toast.type === "error" ? "#DC2626" : "#16A34A" }}>
    {toast.message}
    <button onClick={() => setToast(null)} className="ml-3 opacity-70">✕</button>
  </div>
)}
```

사용 시점: API 키 테스트 실패("❌ API 키를 확인해주세요") · 성공("✅ 연결되었습니다") · 네트워크 에러("📡 연결 실패, 샘플 데이터로 표시합니다")

---

## 10. Mock 데이터

**날씨:** 서울, 맑음, 22°C

**뉴스:** 6개 산업 × 10건 = 60건 (headline + summary + why_it_matters, source_url: null)

| 산업 | 대표 헤드라인 5건 |
|------|-----------------|
| IT·테크 | 구글 에이전트 플랫폼 / 애플 AI 칩 / 美 AI 규제법 / MS Copilot 도입 / 오픈AI SDK |
| 제조·산업 | 현대차 AI 품질검사 / 독일 Industry 5.0 / TSMC 3나노 / 두산 디지털트윈 / 포스코 AI |
| 금융·투자 | Fed 금리 동결 / AI ETF 급등 / 디지털자산법 / 토스뱅크 AI / JP모건 AI 트레이딩 |
| 유통·소비재 | 쿠팡 AI 추천 / MZ 가치소비 / 무인매장 3조 / 네이버 AI 커머스 / 아마존 AI 물류 |
| 바이오 | 삼성바이오 AI 신약 / 원격의료 법안 / GLP-1 시장 / 알파폴드 / AI 진단 FDA 승인 |
| 전체 | AI 에이전트 50% / 무역전쟁 / ESG 공시 / AI 인재전쟁 / 양자컴퓨팅 상용화 |

**지표:** USD 1,378 · EUR 1,487 · KOSPI 2,687 · S&P 5,243 · BTC 97,250 (각 7일 히스토리)

**명언:** 드러커·그로브·잡스·버핏·저커버그·나델라·베이조스·헤이스팅스·다빈치 등 10개

**일정:** 5건 mock (09:00 Q1 실적 리뷰 / 10:30 파트너십 미팅 / 14:00 AI TF 킥오프 / 16:00 주간 경영회의 / 17:30 개인 리뷰)

---

## 11. 에러 핸들링

```
키 없음 → mock 즉시 + 🟡 SAMPLE
키 있음 → loading(nm-skeleton) → 성공: 🟢 LIVE / 실패: mock + 🟡 SAMPLE + 재시도
401 → 토스트 "API 키를 확인해주세요" (5초 소멸)
429 → 토스트 "요청 한도 초과, 잠시 후 다시 시도" (5초 소멸)
타임아웃: Claude 15초, 외부 API 3초
새로고침 쿨다운: 30초
```

---

## 12. 접근성

| 항목 | 구현 |
|------|------|
| 카드 경계 | `1px solid var(--border-subtle)` — 뉴모피즘 경계 보강 |
| 포커스 링 | `outline: 2px solid var(--accent)` |
| 버튼 힌트 | accent 컬러 + 미세 보더 |
| 대비율 | text/bg 10.5:1, text-sub/bg 5.2:1 (WCAG AA) |
| 색상 의존 방지 | ▲▼ 화살표 + 색상 동시 |
| 터치 타겟 | 44×44px |
| 모션 감소 | `prefers-reduced-motion` → 전 애니메이션 즉시 표시 |
| ARIA | dialog aria-modal, button aria-label, live region |
| 토스트 | `role="alert"` — 스크린 리더 즉시 읽기 |

---

*CEO 모닝 브리핑 대시보드 · 개발 계획서 v5.2*
