import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Video } from 'lucide-react';
import DataBadge from './DataBadge.jsx';
import { EventSkeleton } from './Skeleton.jsx';

// 시간 문자열 → 오늘 날짜의 Date 객체
const timeToDate = (timeStr) => {
  if (!timeStr || timeStr === '종일') return null;
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

// 이벤트 상태 판별
const getEventStatus = (event, now, nextId) => {
  if (event.isAllDay) return 'upcoming';
  const start = timeToDate(event.time);
  const end = timeToDate(event.endTime);
  if (!start) return 'upcoming';
  if (end && now > end) return 'past';
  if (start <= now && end && now <= end) return 'ongoing';
  if (event.id === nextId) return 'next';
  return 'upcoming';
};

const STATUS_CONFIG = {
  ongoing: { dot: '🔴', color: '#DC2626', label: '진행 중' },
  next: { dot: '🟡', color: '#F59E0B', label: '다음 일정' },
  upcoming: { dot: '🟢', color: '#22C55E', label: '예정' },
  past: { dot: '⚪', color: '#95A5A6', label: '지남' },
};

const EventItem = ({ event, status }) => {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.upcoming;
  const isPast = status === 'past';

  return (
    <div
      className="px-4 py-3"
      style={{
        borderBottom: '1px dashed var(--border-subtle)',
        opacity: isPast ? 0.5 : 1,
        transition: 'opacity 0.3s',
      }}
    >
      <div className="flex items-start gap-3">
        {/* 상태 도트 */}
        <span style={{ fontSize: 10, marginTop: 4, flexShrink: 0 }}>{cfg.dot}</span>

        <div className="flex-1">
          {/* 시간 + 제목 */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              style={{
                fontFamily: "'Pretendard', system-ui, sans-serif",
                fontSize: 13,
                color: cfg.color,
                fontWeight: 500,
              }}
            >
              {event.time}{event.endTime ? `~${event.endTime}` : ''}
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text)',
                textDecoration: isPast ? 'line-through' : 'none',
              }}
            >
              {event.title}
            </span>
          </div>

          {/* 메타 정보 */}
          <div
            className="flex items-center gap-3 mt-1 flex-wrap"
            style={{ fontSize: 12, color: 'var(--text-sub)' }}
          >
            {event.location && <span>📍 {event.location}</span>}
            {event.attendeeCount > 0 && <span>👥 {event.attendeeCount}명</span>}
            {event.meetLink && (
              <a
                href={event.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="nm-btn inline-flex items-center gap-1"
                style={{ fontSize: 11, padding: '2px 6px' }}
              >
                <Video size={10} />
                Meet
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const TodaySchedule = ({ events, loading, live, timestamp, onRefresh }) => {
  const [now, setNow] = useState(new Date());
  const [rotating, setRotating] = useState(false);

  // 60초마다 시간 갱신 (시간 인디케이터 업데이트)
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  // 다음 일정 ID 계산
  const nextEventId = useCallback(() => {
    const future = events.filter((e) => {
      const start = timeToDate(e.time);
      return start && start > now;
    });
    future.sort((a, b) => {
      const ta = timeToDate(a.time);
      const tb = timeToDate(b.time);
      return ta - tb;
    });
    return future[0]?.id || null;
  }, [events, now]);

  const nextId = nextEventId();

  // 미팅 통계
  const meetingCount = events.filter((e) => e.isMeeting && !e.isAllDay).length;
  const totalHours = events
    .filter((e) => e.isMeeting && !e.isAllDay && e.endTime)
    .reduce((sum, e) => {
      const s = timeToDate(e.time);
      const en = timeToDate(e.endTime);
      if (s && en) return sum + (en - s) / 3600000;
      return sum;
    }, 0);

  const handleRefresh = () => {
    setRotating(true);
    setTimeout(() => setRotating(false), 600);
    onRefresh();
  };

  const today = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });

  return (
    <section
      className="nm-card flex flex-col fade-in-up"
      style={{ animationDelay: '300ms', minHeight: 0 }}
    >
      {/* 고정 헤더 */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontSize: 15, fontWeight: 700 }}>📅 오늘의 일정</span>
          <DataBadge live={live} timestamp={timestamp} />
          <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{today}</span>
        </div>

        <button
          className="nm-btn inline-flex items-center gap-1"
          onClick={handleRefresh}
          aria-label="일정 새로고침"
          style={{ fontSize: 12, padding: '4px 8px' }}
        >
          <RefreshCw
            size={12}
            style={{
              transition: 'transform 0.6s',
              transform: rotating ? 'rotate(360deg)' : 'none',
            }}
          />
        </button>
      </div>

      {/* 스크롤 콘텐츠 */}
      <div className="widget-scroll flex-1" style={{ maxHeight: 200 }}>
        {loading ? (
          <div className="p-4">
            <EventSkeleton />
          </div>
        ) : events.length === 0 ? (
          <div
            className="flex items-center justify-center h-24"
            style={{ color: 'var(--text-sub)', fontSize: 14 }}
          >
            📅 오늘 일정이 없습니다. 여유로운 하루 보내세요!
          </div>
        ) : (
          events.map((event) => {
            const status = getEventStatus(event, now, nextId);
            return <EventItem key={event.id} event={event} status={status} />;
          })
        )}
      </div>

      {/* 하단 요약 */}
      {!loading && events.length > 0 && (
        <div
          className="px-4 py-2 flex-shrink-0"
          style={{
            borderTop: '1px solid var(--border-subtle)',
            fontSize: 12,
            color: 'var(--text-caption)',
          }}
        >
          오늘 미팅 {meetingCount}건 · 총 {totalHours % 1 === 0 ? totalHours : totalHours.toFixed(1)}시간
        </div>
      )}
    </section>
  );
};

export default TodaySchedule;
