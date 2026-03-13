import { parseNewsResponse, extractText } from './parseClaude.js';
import { weatherEmoji } from './formatters.js';
import { MOCK_WEATHER, MOCK_MARKETS, MOCK_QUOTES, MOCK_NEWS } from '../constants/mockData.js';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// ─── Anthropic 키 테스트 ──────────────────────────────────
export const testAnthropic = async (key) => {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }],
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(res.status);
};

// ─── OWM 키 테스트 ───────────────────────────────────────
export const testOWM = async (key) => {
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=${key}`,
    { signal: AbortSignal.timeout(3000) }
  );
  if (!res.ok) throw new Error(res.status);
};

// ─── ExchangeRate 키 테스트 ──────────────────────────────
export const testER = async (key) => {
  const res = await fetch(
    `https://v6.exchangerate-api.com/v6/${key}/latest/USD`,
    { signal: AbortSignal.timeout(3000) }
  );
  if (!res.ok) throw new Error(res.status);
};

// ─── 날씨 가져오기 ───────────────────────────────────────
export const fetchWeather = async (city, owmKey) => {
  if (!owmKey) return { data: MOCK_WEATHER, live: false };
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${owmKey}&units=metric&lang=kr`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) throw new Error(res.status);
    const d = await res.json();
    return {
      data: {
        city: d.name,
        temp: Math.round(d.main.temp),
        desc: d.weather[0].description,
        emoji: weatherEmoji(d.weather[0].description),
        humidity: d.main.humidity,
        wind: d.wind.speed,
      },
      live: true,
    };
  } catch {
    return { data: MOCK_WEATHER, live: false };
  }
};

// ─── 환율 가져오기 ───────────────────────────────────────
export const fetchMarkets = async (erKey, currentMarkets) => {
  if (!erKey) return { data: currentMarkets, live: false };
  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${erKey}/latest/USD`,
      { signal: AbortSignal.timeout(3000) }
    );
    if (!res.ok) throw new Error(res.status);
    const d = await res.json();
    const rates = d.conversion_rates;
    return {
      data: currentMarkets.map((m) => {
        if (m.id === 'usd') {
          const val = Math.round(rates.KRW);
          return { ...m, value: val, history: [...m.history.slice(1), { day: 6, value: val }], live: true };
        }
        if (m.id === 'eur') {
          const val = Math.round((rates.KRW / rates.EUR));
          return { ...m, value: val, history: [...m.history.slice(1), { day: 6, value: val }], live: true };
        }
        return m;
      }),
      live: true,
    };
  } catch {
    return { data: currentMarkets, live: false };
  }
};

// ─── 뉴스 브리핑 ─────────────────────────────────────────
const BRIEFING_PROMPT = (industry, today) =>
  `오늘(${today}) CEO 모닝 브리핑을 위한 ${industry} 분야 AI 뉴스 10건을 한국어로 작성해주세요.

각 항목을 아래 JSON 형식으로 정확히 반환하세요:
[
  {
    "headline": "제목 (20자 이내)",
    "summary": "2-3문장 요약",
    "why_it_matters": "CEO 관점 핵심 시사점 1문장",
    "source_url": "출처 URL 또는 null"
  }
]

규칙:
- 반드시 JSON 배열만 반환 (설명 없이)
- 최신 뉴스 우선
- 비즈니스 임팩트 중심으로 작성
- 정확히 10건`;

export const fetchNews = async (industry, anthropicKey, mockNews) => {
  if (!anthropicKey) return { data: mockNews[industry] || mockNews['IT·테크'], live: false };
  const today = new Date().toLocaleDateString('ko-KR');
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 3000,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: BRIEFING_PROMPT(industry, today) }],
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(res.status);
    const d = await res.json();
    const parsed = parseNewsResponse(d.content);
    if (!parsed || parsed.length === 0) throw new Error('parse_fail');
    return { data: parsed, live: true };
  } catch (e) {
    const status = parseInt(e.message);
    return { data: mockNews[industry] || mockNews['IT·테크'], live: false, error: status };
  }
};

// ─── AI 명언 ──────────────────────────────────────────────
export const fetchQuote = async (anthropicKey, mockQuotes) => {
  if (!anthropicKey) {
    return { data: mockQuotes[Math.floor(Math.random() * mockQuotes.length)], live: false };
  }
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `CEO를 위한 오늘의 영감 있는 명언을 골라주세요.
아래 JSON 형식으로만 응답하세요:
{"quote":"명언 내용","author":"저자 이름","insight":"CEO 관점 오늘의 실천 조언 1문장"}

조건: 경영·리더십·혁신 관련 명언, 반드시 JSON만 반환`,
          },
        ],
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(res.status);
    const d = await res.json();
    const text = extractText(d.content);
    const cleaned = text.replace(/```json\n?|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return { data: parsed, live: true };
  } catch {
    return { data: mockQuotes[Math.floor(Math.random() * mockQuotes.length)], live: false };
  }
};

// ─── 뉴스 요약 ───────────────────────────────────────────
export const fetchSummary = async (newsItem, anthropicKey) => {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1000,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [
        {
          role: 'user',
          content: `다음 뉴스를 CEO 관점에서 500자 내외로 심층 요약하세요.
뉴스: ${newsItem.headline}
내용: ${newsItem.summary}
${newsItem.source_url ? `원문: ${newsItem.source_url}` : ''}

포함: 핵심 상세 · 비즈니스 영향 · CEO 액션 아이템 1~2개
형식: 마크다운 없이 순수 텍스트, 500자 내외.`,
        },
      ],
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(res.status);
  const d = await res.json();
  return extractText(d.content);
};
