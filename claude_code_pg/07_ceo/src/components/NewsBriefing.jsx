import React, { useState, useCallback } from 'react';
import { RefreshCw, ExternalLink, Bot, ChevronDown } from 'lucide-react';
import DataBadge from './DataBadge.jsx';
import { NewsSkeleton } from './Skeleton.jsx';
import SummaryModal from './SummaryModal.jsx';
import { fetchSummary } from '../utils/api.js';
import { INDUSTRIES } from '../constants/mockData.js';

const NewsCard = ({ item, index, anthropicKey, onSummaryOpen }) => {
  const canOpenUrl = !!item.source_url;
  const canSummarize = !!anthropicKey;

  return (
    <div
      className="p-3 fade-in-up"
      style={{ animationDelay: `${index * 80}ms`, borderBottom: '1px dashed var(--border-subtle)' }}
    >
      {/* 번호 + 제목 */}
      <div className="flex items-start gap-2">
        <span
          style={{
            minWidth: 22,
            height: 22,
            borderRadius: '50%',
            background: 'var(--accent-light)',
            color: 'var(--accent)',
            fontSize: 11,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          {index + 1}
        </span>
        <div className="flex-1">
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', lineHeight: 1.4 }}>
            {item.headline}
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-sub)', marginTop: 4, lineHeight: 1.5 }}>
            {item.summary}
          </p>
          {item.why_it_matters && (
            <p
              style={{
                fontSize: 12,
                color: 'var(--accent)',
                marginTop: 4,
                fontWeight: 500,
              }}
            >
              💡 {item.why_it_matters}
            </p>
          )}

          {/* 버튼 */}
          <div className="flex items-center gap-2 mt-3">
            {canOpenUrl ? (
              <a
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="nm-btn inline-flex items-center gap-1"
                style={{ fontSize: 11, padding: '4px 8px' }}
              >
                <ExternalLink size={11} />
                원문보기
              </a>
            ) : (
              <button
                className="nm-btn inline-flex items-center gap-1"
                disabled
                title="실시간 데이터에서만 제공"
                style={{ fontSize: 11, padding: '4px 8px' }}
              >
                <ExternalLink size={11} />
                원문보기
              </button>
            )}

            <button
              className="nm-btn inline-flex items-center gap-1"
              disabled={!canSummarize}
              title={canSummarize ? '클로드 심층 요약' : 'API 키가 필요합니다'}
              style={{ fontSize: 11, padding: '4px 8px' }}
              onClick={() => onSummaryOpen(item)}
            >
              <Bot size={11} />
              요약보기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const NewsBriefing = ({
  news,
  loading,
  live,
  timestamp,
  industry,
  onIndustryChange,
  onRefresh,
  cooldown,
  anthropicKey,
  onToast,
}) => {
  const [selectedNews, setSelectedNews] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryCache, setSummaryCache] = useState({});
  const [rotating, setRotating] = useState(false);

  const handleSummaryOpen = useCallback(
    async (item) => {
      setSelectedNews(item);
      setSummaryOpen(true);

      if (summaryCache[item.id]) {
        setSummaryText(summaryCache[item.id]);
        setSummaryLoading(false);
        return;
      }

      setSummaryText('');
      setSummaryLoading(true);
      try {
        const text = await fetchSummary(item, anthropicKey);
        setSummaryText(text);
        setSummaryCache((prev) => ({ ...prev, [item.id]: text }));
      } catch (e) {
        const status = parseInt(e.message);
        if (status === 401) onToast('❌ API 키를 확인해주세요', 'error');
        else if (status === 429) onToast('⏱️ 요청 한도 초과, 잠시 후 다시 시도', 'error');
        else onToast('📡 요약 실패, 다시 시도해주세요', 'error');
        setSummaryOpen(false);
      } finally {
        setSummaryLoading(false);
      }
    },
    [anthropicKey, summaryCache, onToast]
  );

  const handleRefresh = () => {
    if (cooldown > 0) return;
    setRotating(true);
    setTimeout(() => setRotating(false), 600);
    onRefresh();
  };

  return (
    <>
      <section
        className="nm-card flex flex-col fade-in-up"
        style={{ animationDelay: '150ms', height: 423, minHeight: 0 }}
      >
        {/* 고정 헤더 */}
        <div
          className="flex items-center justify-between px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize: 15, fontWeight: 700 }}>📰 AI 뉴스 브리핑</span>
            <DataBadge live={live} timestamp={timestamp} />
          </div>

          <div className="flex items-center gap-2">
            {/* 산업 선택 */}
            <div className="relative">
              <select
                value={industry}
                onChange={(e) => onIndustryChange(e.target.value)}
                className="nm-inset appearance-none cursor-pointer pr-6"
                style={{
                  fontSize: 12,
                  padding: '4px 8px',
                  color: 'var(--text)',
                  background: 'var(--bg)',
                  border: 'none',
                  outline: 'none',
                }}
                aria-label="산업 선택"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
              <ChevronDown
                size={12}
                style={{
                  position: 'absolute',
                  right: 6,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: 'var(--accent)',
                }}
              />
            </div>

            {/* 새로고침 */}
            <button
              className="nm-btn inline-flex items-center gap-1"
              onClick={handleRefresh}
              disabled={cooldown > 0}
              aria-label="뉴스 새로고침"
              style={{ fontSize: 12, padding: '4px 8px' }}
            >
              <RefreshCw
                size={12}
                style={{
                  transition: 'transform 0.6s',
                  transform: rotating ? 'rotate(360deg)' : 'none',
                }}
              />
              {cooldown > 0 ? `${cooldown}s` : ''}
            </button>
          </div>
        </div>

        {/* 스크롤 콘텐츠 */}
        <div className="widget-scroll flex-1" style={{ padding: '4px 0', minHeight: 0, overflow: 'auto' }}>
          {loading ? (
            <div className="p-4">
              <NewsSkeleton count={5} />
            </div>
          ) : news.length === 0 ? (
            <div
              className="flex items-center justify-center h-32"
              style={{ color: 'var(--text-sub)', fontSize: 14 }}
            >
              뉴스를 불러오는 중입니다...
            </div>
          ) : (
            news.map((item, i) => (
              <NewsCard
                key={item.id || i}
                item={item}
                index={i}
                anthropicKey={anthropicKey}
                onSummaryOpen={handleSummaryOpen}
              />
            ))
          )}
        </div>
      </section>

      {/* 요약 모달 */}
      {summaryOpen && (
        <SummaryModal
          newsItem={selectedNews}
          summary={summaryText}
          loading={summaryLoading}
          onClose={() => setSummaryOpen(false)}
        />
      )}
    </>
  );
};

export default NewsBriefing;
