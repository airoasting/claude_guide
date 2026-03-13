import React, { useEffect, useCallback } from 'react';
import { X, ExternalLink, Loader } from 'lucide-react';
import useTypingEffect from '../hooks/useTypingEffect.js';

const SummaryModal = ({ newsItem, summary, loading, onClose }) => {
  const { displayed } = useTypingEffect(summary || '', 20, !loading && !!summary);

  // Escape 키로 닫기
  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  if (!newsItem) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(160,170,183,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="뉴스 요약"
    >
      <div
        className="nm-card w-full max-w-xl p-6 relative"
        style={{ maxHeight: '80vh', overflowY: 'auto' }}
      >
        {/* 닫기 */}
        <button
          className="nm-btn absolute top-4 right-4"
          onClick={onClose}
          aria-label="닫기"
          style={{ padding: '6px 8px' }}
        >
          <X size={16} />
        </button>

        {/* 제목 */}
        <h2
          className="pr-10 mb-4"
          style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4 }}
        >
          📰 {newsItem.headline}
        </h2>

        <div style={{ height: 1, background: 'var(--border-subtle)', marginBottom: 16 }} />

        {/* 본문 */}
        {loading ? (
          <div className="flex items-center gap-3" style={{ color: 'var(--text-sub)', padding: '20px 0' }}>
            <Loader size={18} className="animate-spin" />
            <span style={{ fontSize: 14 }}>Claude가 심층 요약 중...</span>
          </div>
        ) : (
          <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {displayed}
          </p>
        )}

        {/* 원문 링크 */}
        {newsItem.source_url && (
          <>
            <div style={{ height: 1, background: 'var(--border-subtle)', margin: '16px 0' }} />
            <a
              href={newsItem.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="nm-btn inline-flex items-center gap-1"
              style={{ fontSize: 13 }}
            >
              <ExternalLink size={13} />
              원문보기
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default SummaryModal;
