import React from 'react';

// 토스트 알림 컴포넌트
// type: "success" | "error" | "warning"
const Toast = ({ message, type = 'error', onClose }) => {
  const bg =
    type === 'success'
      ? '#16A34A'
      : type === 'warning'
      ? '#F59E0B'
      : '#DC2626';

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-4 left-1/2 z-50 px-6 py-3 rounded-xl text-white text-sm shadow-lg animate-slideDown"
      style={{ background: bg, transform: 'translateX(-50%)' }}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-3 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="닫기"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
