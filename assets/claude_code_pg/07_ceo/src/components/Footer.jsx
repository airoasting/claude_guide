import React from 'react';
import { formatTime } from '../utils/formatters.js';

const Footer = ({ lastUpdated }) => {
  const timeStr = lastUpdated ? formatTime(new Date(lastUpdated)) : null;

  return (
    <footer
      className="flex items-center justify-between px-2 fade-in-up"
      style={{
        animationDelay: '400ms',
        fontSize: 12,
        color: 'var(--text-caption)',
        height: 24,
      }}
    >
      <span>{timeStr ? `마지막 갱신 ${timeStr}` : '갱신 중...'}</span>
      <span>CEO 모닝 브리핑 v5.2</span>
    </footer>
  );
};

export default Footer;
