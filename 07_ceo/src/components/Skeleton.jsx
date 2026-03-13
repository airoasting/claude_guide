import React from 'react';

// 개별 스켈레톤 블록
const SkeletonBlock = ({ className = '', style = {} }) => (
  <div className={`nm-skeleton ${className}`} style={style} />
);

// 뉴스 카드 스켈레톤 × count
export const NewsSkeleton = ({ count = 5 }) => (
  <div className="space-y-4">
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="p-3 space-y-2"
        style={{ animationDelay: `${i * 150}ms` }}
      >
        <SkeletonBlock className="h-4 w-3/4 rounded" />
        <SkeletonBlock className="h-3 w-full rounded" />
        <SkeletonBlock className="h-3 w-5/6 rounded" />
        <SkeletonBlock className="h-3 w-2/3 rounded" />
      </div>
    ))}
  </div>
);

// 시장 지표 스켈레톤 × 5행
export const MarketSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="flex items-center justify-between px-2"
        style={{ animationDelay: `${i * 150}ms` }}
      >
        <SkeletonBlock className="h-4 w-20 rounded" />
        <SkeletonBlock className="h-4 w-16 rounded" />
        <SkeletonBlock className="h-5 w-10 rounded" />
      </div>
    ))}
  </div>
);

// AI 명언 스켈레톤
export const QuoteSkeleton = () => (
  <div className="space-y-2 px-2">
    <SkeletonBlock className="h-4 w-full rounded" />
    <SkeletonBlock className="h-4 w-4/5 rounded" />
    <SkeletonBlock className="h-3 w-24 rounded mt-2" />
  </div>
);

// 날씨 스켈레톤
export const WeatherSkeleton = () => (
  <SkeletonBlock className="h-6 w-24 rounded" />
);

// 일정 스켈레톤 × 3행
export const EventSkeleton = () => (
  <div className="space-y-3">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="flex items-start gap-3 px-2"
        style={{ animationDelay: `${i * 150}ms` }}
      >
        <SkeletonBlock className="h-3 w-3 rounded-full mt-1" style={{ minWidth: 12 }} />
        <div className="flex-1 space-y-1">
          <SkeletonBlock className="h-4 w-32 rounded" />
          <SkeletonBlock className="h-3 w-48 rounded" />
        </div>
      </div>
    ))}
  </div>
);

export default SkeletonBlock;
