// 숫자 포맷
export const formatValue = (value, format) => {
  if (format === 'krw') return value.toLocaleString('ko-KR') + '원';
  if (format === 'index') return value.toLocaleString('ko-KR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  if (format === 'usd') return '$' + value.toLocaleString('en-US');
  return value.toLocaleString();
};

// 상대 시간
export const timeAgo = (timestamp) => {
  if (!timestamp) return '';
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return '방금';
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  return `${Math.floor(diff / 3600)}시간 전`;
};

// 날씨 이모지
export const weatherEmoji = (desc) => {
  const d = (desc || '').toLowerCase();
  if (d.includes('맑') || d.includes('clear')) return '☀️';
  if (d.includes('구름') || d.includes('cloud')) return '⛅';
  if (d.includes('비') || d.includes('rain')) return '🌧️';
  if (d.includes('눈') || d.includes('snow')) return '❄️';
  if (d.includes('흐') || d.includes('overcast')) return '☁️';
  if (d.includes('안개') || d.includes('fog') || d.includes('mist')) return '🌫️';
  return '🌤️';
};

// 시간대별 인사
export const getGreeting = () => {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return '좋은 아침입니다';
  if (h >= 12 && h < 18) return '좋은 오후입니다';
  return '좋은 저녁입니다';
};

// 날짜 포맷 (ko-KR)
export const formatDate = (date = new Date()) =>
  date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

// 시각 포맷
export const formatTime = (date = new Date()) =>
  date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

// 변동률 색상
export const changeColor = (change, region = 'us') => {
  if (region === 'kr') {
    return change >= 0 ? 'var(--positive-kr)' : 'var(--negative-kr)';
  }
  return change >= 0 ? 'var(--positive-us)' : 'var(--negative-us)';
};

// 변동 화살표
export const changeArrow = (change) => (change >= 0 ? '▲' : '▼');
