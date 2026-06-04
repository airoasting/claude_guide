import React, { useState, useEffect } from 'react';
import { X, Key } from 'lucide-react';

const OnboardingBanner = ({ hasKeys, onSettingsOpen }) => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // 세션 내 닫힘 여부 확인
    const wasDismissed = sessionStorage.getItem('ceo-banner-dismissed') === 'true';
    if (!wasDismissed && !hasKeys) {
      setVisible(true);
      setDismissed(false);
    } else {
      setVisible(false);
    }
  }, [hasKeys]);

  const handleDismiss = () => {
    sessionStorage.setItem('ceo-banner-dismissed', 'true');
    setDismissed(true);
    setTimeout(() => setVisible(false), 300);
  };

  if (!visible) return null;

  return (
    <div
      className="nm-inset px-5 py-3 flex items-center justify-between gap-4 fade-in-up"
      style={{
        borderColor: 'var(--accent)',
        borderWidth: 1,
        opacity: dismissed ? 0 : 1,
        transition: 'opacity 0.3s ease',
      }}
    >
      <div className="flex items-center gap-3">
        <Key size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: 'var(--text-sub)' }}>
          <strong style={{ color: 'var(--text)' }}>AI 기능을 사용하려면 API 키를 입력하세요.</strong>
          {' '}현재 샘플 데이터로 표시 중입니다.
        </span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          className="nm-btn"
          onClick={onSettingsOpen}
          style={{ fontSize: 12, padding: '4px 10px' }}
        >
          설정하기
        </button>
        <button
          className="nm-btn"
          onClick={handleDismiss}
          aria-label="배너 닫기"
          style={{ padding: '4px 8px' }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

export default OnboardingBanner;
