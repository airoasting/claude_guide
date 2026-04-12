import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import DataBadge from './DataBadge.jsx';
import { MarketSkeleton } from './Skeleton.jsx';
import { formatValue, changeColor, changeArrow } from '../utils/formatters.js';

const SparkLine = ({ data, color }) => (
  <div style={{ width: 40, height: 20 }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          dot={false}
          strokeWidth={1.5}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

const MarketRow = ({ item, prevValue }) => {
  const color = changeColor(item.change, item.region);
  const arrow = changeArrow(item.change);
  const [bouncing, setBouncing] = useState(false);

  useEffect(() => {
    if (prevValue && prevValue !== item.value) {
      setBouncing(true);
      const t = setTimeout(() => setBouncing(false), 400);
      return () => clearTimeout(t);
    }
  }, [item.value, prevValue]);

  return (
    <div
      className="flex items-center justify-between px-4 py-2"
      style={{ borderBottom: '1px dashed var(--border-subtle)' }}
    >
      {/* 이름 */}
      <span style={{ fontSize: 13, color: 'var(--text-sub)', minWidth: 64 }}>{item.name}</span>

      {/* 값 */}
      <span
        className={bouncing ? 'animate-bounce-value' : ''}
        style={{
          fontFamily: "'Pretendard', system-ui, sans-serif",
          fontSize: 15,
          fontWeight: 500,
          color: 'var(--text)',
        }}
      >
        {formatValue(item.value, item.format)}
      </span>

      {/* 변동 */}
      <span style={{ fontSize: 12, color, minWidth: 60, textAlign: 'right' }}>
        {arrow} {Math.abs(item.change).toFixed(2)}%
      </span>

      {/* 스파크라인 */}
      <SparkLine data={item.history} color={color} />
    </div>
  );
};

const MarketIndicators = ({ markets, loading, live, timestamp }) => {
  const prevRef = useRef({});

  useEffect(() => {
    if (markets.length > 0) {
      const map = {};
      markets.forEach((m) => (map[m.id] = m.value));
      prevRef.current = map;
    }
  }, [markets]);

  return (
    <section
      className="nm-card flex flex-col fade-in-up"
      style={{ animationDelay: '200ms', minHeight: 0 }}
    >
      {/* 고정 헤더 */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 15, fontWeight: 700 }}>💱 시장 지표</span>
          <DataBadge live={live} timestamp={timestamp} />
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-caption)' }}>KOSPI·S&P·BTC: SAMPLE</span>
      </div>

      {/* 스크롤 콘텐츠 */}
      <div className="widget-scroll flex-1" style={{ maxHeight: 200 }}>
        {loading ? (
          <div className="p-4">
            <MarketSkeleton />
          </div>
        ) : (
          markets.map((item) => (
            <MarketRow
              key={item.id}
              item={item}
              prevValue={prevRef.current[item.id]}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default MarketIndicators;
