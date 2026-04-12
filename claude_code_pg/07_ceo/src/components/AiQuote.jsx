import React, { useState, useEffect } from 'react';
import DataBadge from './DataBadge.jsx';
import { QuoteSkeleton } from './Skeleton.jsx';
import useTypingEffect from '../hooks/useTypingEffect.js';

const AiQuote = ({ quote, loading, live, timestamp }) => {
  const [showAuthor, setShowAuthor] = useState(false);
  const [showInsight, setShowInsight] = useState(false);

  const { displayed: typedQuote, done: quoteDone } = useTypingEffect(
    quote?.quote || '',
    40,
    !loading && !!quote
  );

  // 명언 타이핑 완료 → 저자 → insight 순차 표시
  useEffect(() => {
    if (!quoteDone) {
      setShowAuthor(false);
      setShowInsight(false);
      return;
    }
    const t1 = setTimeout(() => setShowAuthor(true), 100);
    const t2 = setTimeout(() => setShowInsight(true), 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [quoteDone]);

  // quote 변경 시 상태 초기화
  useEffect(() => {
    setShowAuthor(false);
    setShowInsight(false);
  }, [quote?.quote]);

  return (
    <section
      className="nm-card flex flex-col fade-in-up"
      style={{ animationDelay: '250ms', minHeight: 0 }}
    >
      {/* 고정 헤더 */}
      <div
        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <span style={{ fontSize: 15, fontWeight: 700 }}>💡 AI 오늘의 한마디</span>
        <DataBadge live={live} timestamp={timestamp} />
      </div>

      {/* 스크롤 콘텐츠 */}
      <div className="widget-scroll flex-1 px-4 py-3" style={{ maxHeight: 150 }}>
        {loading || !quote ? (
          <QuoteSkeleton />
        ) : (
          <div>
            {/* 명언 */}
            <p
              style={{
                fontSize: 14,
                color: 'var(--text)',
                lineHeight: 1.7,
                fontStyle: 'italic',
              }}
            >
              "{typedQuote}"
            </p>

            {/* 저자 */}
            {showAuthor && (
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--accent)',
                  fontWeight: 600,
                  marginTop: 6,
                  opacity: showAuthor ? 1 : 0,
                  transition: 'opacity 0.5s ease',
                }}
              >
                — {quote.author}
              </p>
            )}

            {/* 인사이트 */}
            {showInsight && quote.insight && (
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--text-sub)',
                  marginTop: 6,
                  padding: '6px 10px',
                  background: 'var(--accent-light)',
                  borderRadius: 8,
                  opacity: showInsight ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                  lineHeight: 1.5,
                }}
              >
                📌 {quote.insight}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AiQuote;
