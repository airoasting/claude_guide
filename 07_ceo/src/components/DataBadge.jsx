import React from 'react';
import { timeAgo } from '../utils/formatters.js';

// 데이터 소스 상태 배지
// live: true → 🟢 LIVE · N분 전
// live: false → 🟡 SAMPLE
const DataBadge = ({ live, timestamp }) => {
  const dotColor = live ? '#22C55E' : '#F59E0B';
  const label = live ? `LIVE${timestamp ? ' · ' + timeAgo(timestamp) : ''}` : 'SAMPLE';

  return (
    <span
      className="inline-flex items-center gap-1 select-none"
      style={{ fontSize: 11, opacity: 0.7, color: 'var(--text-caption)' }}
    >
      <span
        style={{
          display: 'inline-block',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: dotColor,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
};

export default DataBadge;
