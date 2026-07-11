import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';
import { getGreeting, formatDate, formatTime } from '../utils/formatters.js';
import { WeatherSkeleton } from './Skeleton.jsx';

const Header = ({ name, weather, weatherLoading, onSettingsOpen }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  const greeting = getGreeting();

  return (
    <header
      className="nm-card px-6 py-4 flex items-center justify-between gap-4 fade-in-up"
      style={{ animationDelay: '0ms' }}
    >
      {/* 인사 + 날짜 */}
      <div>
        <h1
          className="font-header-kr"
          style={{ color: 'var(--text)', fontSize: 22, fontFamily: "'Pretendard', system-ui, sans-serif" }}
        >
          {greeting}, {name}
        </h1>
        <p style={{ color: 'var(--text-sub)', fontSize: 13, marginTop: 2 }}>
          {formatDate(now)} · {formatTime(now)}
        </p>
      </div>

      {/* 날씨 */}
      <div className="flex items-center gap-4">
        {weatherLoading ? (
          <WeatherSkeleton />
        ) : weather ? (
          <div
            className="flex items-center gap-2"
            style={{ color: 'var(--text)', fontSize: 15 }}
          >
            <span style={{ fontSize: 22 }}>{weather.emoji}</span>
            <span style={{ fontFamily: "'Pretendard', system-ui, sans-serif", fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em' }}>
              {weather.temp}°C
            </span>
            <span style={{ color: 'var(--text-sub)', fontSize: 13 }}>{weather.city}</span>
          </div>
        ) : null}

        {/* 설정 버튼 */}
        <button
          className="nm-btn flex items-center gap-1"
          onClick={onSettingsOpen}
          aria-label="설정 열기"
          style={{ padding: '8px 12px' }}
        >
          <Settings size={16} />
          <span style={{ fontSize: 13 }}>설정</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
