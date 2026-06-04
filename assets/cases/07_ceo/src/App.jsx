import React, { useState, useEffect, useCallback, useRef } from 'react';
import useLocalStorage from './hooks/useLocalStorage.js';
import { fetchWeather, fetchMarkets, fetchNews, fetchQuote } from './utils/api.js';
import {
  initTokenClient,
  getValidToken,
  saveToken,
  revokeToken,
  fetchTodayEvents,
} from './utils/calendar.js';
import { MOCK_WEATHER, MOCK_MARKETS, MOCK_QUOTES, MOCK_NEWS, MOCK_EVENTS } from './constants/mockData.js';

// Components
import OnboardingBanner from './components/OnboardingBanner.jsx';
import Header from './components/Header.jsx';
import NewsBriefing from './components/NewsBriefing.jsx';
import MarketIndicators from './components/MarketIndicators.jsx';
import AiQuote from './components/AiQuote.jsx';
import TodaySchedule from './components/TodaySchedule.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import Toast from './components/Toast.jsx';
import Footer from './components/Footer.jsx';

const GCAL_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const REFRESH_COOLDOWN = 30; // 초

export default function App() {
  // ─── 영구 설정 (localStorage) ─────────────────────────
  const [settings, setSettings] = useLocalStorage('ceo-settings', {
    name: '대표님',
    industry: 'IT·테크',
    city: 'Seoul',
  });
  const [apiKeys, setApiKeys] = useLocalStorage('ceo-keys', {});

  // ─── 런타임 데이터 ───────────────────────────────────
  const [weather, setWeather] = useState(MOCK_WEATHER);
  const [news, setNews] = useState(MOCK_NEWS['IT·테크']);
  const [markets, setMarkets] = useState(MOCK_MARKETS);
  const [quote, setQuote] = useState(MOCK_QUOTES[0]);
  const [events, setEvents] = useState(MOCK_EVENTS);

  // ─── 로딩 상태 ───────────────────────────────────────
  const [loading, setLoading] = useState({
    weather: false,
    news: false,
    markets: false,
    quote: false,
    events: false,
  });

  // ─── LIVE 상태 ───────────────────────────────────────
  const [liveStatus, setLiveStatus] = useState({
    weather: false,
    news: false,
    markets: false,
    quote: false,
    events: false,
  });

  // ─── 마지막 갱신 시각 ─────────────────────────────────
  const [lastFetched, setLastFetched] = useState({
    weather: null, news: null, markets: null, quote: null, events: null,
  });

  const [lastUpdated, setLastUpdated] = useState(null);

  // ─── UI 상태 ────────────────────────────────────────
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [newsCooldown, setNewsCooldown] = useState(0);

  // ─── Google Calendar ────────────────────────────────
  const [gcalConnected, setGcalConnected] = useState(false);
  const [gcalEmail, setGcalEmail] = useState('');

  const cooldownRef = useRef(null);

  // ─── 토스트 ─────────────────────────────────────────
  const showToast = useCallback((message, type = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  // ─── 쿨다운 타이머 ───────────────────────────────────
  const startCooldown = useCallback(() => {
    setNewsCooldown(REFRESH_COOLDOWN);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setNewsCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ─── 날씨 ────────────────────────────────────────────
  const loadWeather = useCallback(async (city, keys) => {
    setLoading((p) => ({ ...p, weather: true }));
    const { data, live } = await fetchWeather(city, keys.owm);
    setWeather(data);
    setLiveStatus((p) => ({ ...p, weather: live }));
    setLastFetched((p) => ({ ...p, weather: Date.now() }));
    setLoading((p) => ({ ...p, weather: false }));
  }, []);

  // ─── 뉴스 ────────────────────────────────────────────
  const loadNews = useCallback(async (industry, keys) => {
    setLoading((p) => ({ ...p, news: true }));
    const { data, live, error } = await fetchNews(industry, keys.anthropic, MOCK_NEWS);
    setNews(data);
    setLiveStatus((p) => ({ ...p, news: live }));
    setLastFetched((p) => ({ ...p, news: Date.now() }));
    setLoading((p) => ({ ...p, news: false }));
    if (error === 401) showToast('❌ API 키를 확인해주세요', 'error');
    else if (error === 429) showToast('⏱️ 요청 한도 초과, 잠시 후 다시 시도', 'error');
    else if (!live && keys.anthropic) showToast('📡 연결 실패, 샘플 데이터로 표시합니다', 'error');
  }, [showToast]);

  // ─── 시장 지표 ───────────────────────────────────────
  const loadMarkets = useCallback(async (keys, currentMarkets) => {
    setLoading((p) => ({ ...p, markets: true }));
    const { data, live } = await fetchMarkets(keys.er, currentMarkets);
    setMarkets(data);
    setLiveStatus((p) => ({ ...p, markets: live }));
    setLastFetched((p) => ({ ...p, markets: Date.now() }));
    setLoading((p) => ({ ...p, markets: false }));
  }, []);

  // ─── 명언 ────────────────────────────────────────────
  const loadQuote = useCallback(async (keys) => {
    setLoading((p) => ({ ...p, quote: true }));
    const { data, live } = await fetchQuote(keys.anthropic, MOCK_QUOTES);
    setQuote(data);
    setLiveStatus((p) => ({ ...p, quote: live }));
    setLastFetched((p) => ({ ...p, quote: Date.now() }));
    setLoading((p) => ({ ...p, quote: false }));
  }, []);

  // ─── Google Calendar ────────────────────────────────
  const loadEvents = useCallback(async (token) => {
    setLoading((p) => ({ ...p, events: true }));
    try {
      const data = await fetchTodayEvents(token);
      setEvents(data);
      setLiveStatus((p) => ({ ...p, events: true }));
      setLastFetched((p) => ({ ...p, events: Date.now() }));
    } catch {
      setEvents(MOCK_EVENTS);
      setLiveStatus((p) => ({ ...p, events: false }));
      showToast('📅 일정 로드 실패, 샘플 데이터로 표시합니다', 'error');
    } finally {
      setLoading((p) => ({ ...p, events: false }));
    }
  }, [showToast]);

  // ─── 초기 로드 ───────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      await Promise.allSettled([
        loadWeather(settings.city, apiKeys),
        loadNews(settings.industry, apiKeys),
        loadMarkets(apiKeys, MOCK_MARKETS),
        loadQuote(apiKeys),
      ]);
      setLastUpdated(Date.now());
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Google Calendar 초기화 ──────────────────────────
  useEffect(() => {
    const initGcal = () => {
      if (!GCAL_CLIENT_ID || !window.google?.accounts?.oauth2) return;

      initTokenClient(GCAL_CLIENT_ID, (response) => {
        if (response.access_token) {
          saveToken(response);
          setGcalConnected(true);
          loadEvents(response.access_token);
        }
      });

      const token = getValidToken();
      if (token) {
        setGcalConnected(true);
        loadEvents(token);
      } else if (localStorage.getItem('ceo-gcal-token')) {
        showToast('📅 Google Calendar 세션이 만료되었습니다. 재연결해주세요.', 'warning');
      }
    };

    // GIS SDK 로드 대기
    if (window.google?.accounts?.oauth2) {
      initGcal();
    } else {
      window.addEventListener('load', initGcal);
      return () => window.removeEventListener('load', initGcal);
    }
  }, [loadEvents, showToast]);

  // ─── 산업 변경 → 뉴스 재호출 ────────────────────────
  const prevIndustry = useRef(settings.industry);
  useEffect(() => {
    if (prevIndustry.current !== settings.industry) {
      prevIndustry.current = settings.industry;
      loadNews(settings.industry, apiKeys);
      startCooldown();
    }
  }, [settings.industry, apiKeys, loadNews, startCooldown]);

  // ─── 도시 변경 → 날씨 재호출 (1초 디바운스) ─────────
  const cityDebounce = useRef(null);
  const prevCity = useRef(settings.city);
  useEffect(() => {
    if (prevCity.current !== settings.city) {
      prevCity.current = settings.city;
      if (cityDebounce.current) clearTimeout(cityDebounce.current);
      cityDebounce.current = setTimeout(() => {
        loadWeather(settings.city, apiKeys);
      }, 1000);
    }
    return () => {
      if (cityDebounce.current) clearTimeout(cityDebounce.current);
    };
  }, [settings.city, apiKeys, loadWeather]);

  // ─── API 키 저장/삭제 ────────────────────────────────
  const handleKeysSave = useCallback((id, key) => {
    const newKeys = { ...apiKeys, [id]: key };
    setApiKeys(newKeys);
    // 해당 위젯 재호출
    if (id === 'anthropic') {
      loadNews(settings.industry, newKeys);
      loadQuote(newKeys);
    } else if (id === 'owm') {
      loadWeather(settings.city, newKeys);
    } else if (id === 'er') {
      loadMarkets(newKeys, markets);
    }
    setLastUpdated(Date.now());
  }, [apiKeys, setApiKeys, settings, loadNews, loadQuote, loadWeather, loadMarkets, markets]);

  const handleKeysDelete = useCallback((id) => {
    const newKeys = { ...apiKeys };
    delete newKeys[id];
    setApiKeys(newKeys);
    // mock으로 복귀
    if (id === 'anthropic') {
      setNews(MOCK_NEWS[settings.industry] || MOCK_NEWS['IT·테크']);
      setQuote(MOCK_QUOTES[Math.floor(Math.random() * MOCK_QUOTES.length)]);
      setLiveStatus((p) => ({ ...p, news: false, quote: false }));
    } else if (id === 'owm') {
      setWeather(MOCK_WEATHER);
      setLiveStatus((p) => ({ ...p, weather: false }));
    } else if (id === 'er') {
      setMarkets(MOCK_MARKETS);
      setLiveStatus((p) => ({ ...p, markets: false }));
    }
  }, [apiKeys, setApiKeys, settings.industry]);

  // ─── 뉴스 수동 새로고침 ──────────────────────────────
  const handleNewsRefresh = useCallback(() => {
    if (newsCooldown > 0) return;
    loadNews(settings.industry, apiKeys);
    startCooldown();
    setLastUpdated(Date.now());
  }, [newsCooldown, settings.industry, apiKeys, loadNews, startCooldown]);

  // ─── 일정 수동 새로고침 ──────────────────────────────
  const handleEventsRefresh = useCallback(() => {
    const token = getValidToken();
    if (token) {
      loadEvents(token);
    } else if (gcalConnected) {
      showToast('📅 세션 만료, 재연결이 필요합니다.', 'warning');
    }
    setLastUpdated(Date.now());
  }, [gcalConnected, loadEvents, showToast]);

  // ─── Google Calendar 연결 ────────────────────────────
  const handleGcalConnect = useCallback(() => {
    if (!GCAL_CLIENT_ID) {
      showToast('Google Client ID가 설정되지 않았습니다.', 'error');
      return;
    }
    import('./utils/calendar.js').then(({ requestAccess }) => requestAccess());
  }, [showToast]);

  const handleGcalDisconnect = useCallback(() => {
    revokeToken();
    setGcalConnected(false);
    setGcalEmail('');
    setEvents(MOCK_EVENTS);
    setLiveStatus((p) => ({ ...p, events: false }));
    showToast('📅 Google Calendar 연결이 해제되었습니다.', 'success');
  }, [showToast]);

  const handleGcalSync = useCallback(() => {
    handleEventsRefresh();
  }, [handleEventsRefresh]);

  // ─── API 키 존재 여부 ────────────────────────────────
  const hasAnyKey = Object.keys(apiKeys).length > 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        padding: '16px',
        maxWidth: 1280,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* 온보딩 배너 */}
      <OnboardingBanner
        hasKeys={hasAnyKey}
        onSettingsOpen={() => setSettingsOpen(true)}
      />

      {/* 헤더 */}
      <Header
        name={settings.name}
        weather={weather}
        weatherLoading={loading.weather}
        onSettingsOpen={() => setSettingsOpen(true)}
      />

      {/* 2단 레이아웃: 뉴스(60%) + 우측 패널(40%) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 2fr)',
          gap: 12,
          alignItems: 'start',
          flex: 1,
          minHeight: 0,
        }}
        className="responsive-grid"
      >
        {/* 뉴스 브리핑 */}
        <NewsBriefing
          news={news}
          loading={loading.news}
          live={liveStatus.news}
          timestamp={lastFetched.news}
          industry={settings.industry}
          onIndustryChange={(ind) => setSettings({ ...settings, industry: ind })}
          onRefresh={handleNewsRefresh}
          cooldown={newsCooldown}
          anthropicKey={apiKeys.anthropic}
          onToast={showToast}
        />

        {/* 우측: 시장 지표 + AI 명언 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
          <MarketIndicators
            markets={markets}
            loading={loading.markets}
            live={liveStatus.markets}
            timestamp={lastFetched.markets}
          />
          <AiQuote
            quote={quote}
            loading={loading.quote}
            live={liveStatus.quote}
            timestamp={lastFetched.quote}
          />
        </div>
      </div>

      {/* 오늘의 일정 */}
      <TodaySchedule
        events={events}
        loading={loading.events}
        live={liveStatus.events}
        timestamp={lastFetched.events}
        onRefresh={handleEventsRefresh}
      />

      {/* 푸터 */}
      <Footer lastUpdated={lastUpdated} />

      {/* 설정 패널 */}
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
        apiKeys={apiKeys}
        onKeysSave={handleKeysSave}
        onKeysDelete={handleKeysDelete}
        onToast={showToast}
        gcalConnected={gcalConnected}
        gcalEmail={gcalEmail}
        onGcalConnect={handleGcalConnect}
        onGcalDisconnect={handleGcalDisconnect}
        onGcalSync={handleGcalSync}
      />

      {/* 토스트 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
