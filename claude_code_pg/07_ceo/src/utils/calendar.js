// Google Calendar OAuth 2.0 연동

const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let tokenClient = null;

// tokenClient 초기화
export const initTokenClient = (clientId, callback) => {
  if (!window.google?.accounts?.oauth2) return;
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback,
  });
  return tokenClient;
};

// 인증 팝업 열기
export const requestAccess = () => {
  if (!tokenClient) return;
  tokenClient.requestAccessToken({ prompt: 'consent' });
};

// 토큰 유효성 확인
export const getValidToken = () => {
  const token = localStorage.getItem('ceo-gcal-token');
  const expiry = parseInt(localStorage.getItem('ceo-gcal-expiry') || '0');
  if (!token) return null;
  if (Date.now() > expiry - 300000) {
    // 만료 5분 전 → 자동 재인증 시도
    if (tokenClient) tokenClient.requestAccessToken({ prompt: '' });
    return null;
  }
  return token;
};

// 토큰 저장
export const saveToken = (response) => {
  if (response.access_token) {
    localStorage.setItem('ceo-gcal-token', response.access_token);
    localStorage.setItem(
      'ceo-gcal-expiry',
      String(Date.now() + response.expires_in * 1000)
    );
  }
};

// 토큰 삭제 (연결 해제)
export const revokeToken = () => {
  const token = localStorage.getItem('ceo-gcal-token');
  if (token && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(token);
  }
  localStorage.removeItem('ceo-gcal-token');
  localStorage.removeItem('ceo-gcal-expiry');
};

// 오늘 일정 가져오기
export const fetchTodayEvents = async (token) => {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const params = new URLSearchParams({
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: 'true',
    orderBy: 'startTime',
  });

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(res.status);
  const data = await res.json();

  return data.items.map((event) => ({
    id: event.id,
    title: event.summary || '(제목 없음)',
    time: event.start.dateTime
      ? new Date(event.start.dateTime).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '종일',
    endTime: event.end.dateTime
      ? new Date(event.end.dateTime).toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      : null,
    location: event.location || null,
    isAllDay: !event.start.dateTime,
    isMeeting: (event.attendees?.length || 0) > 1,
    attendeeCount: event.attendees?.length || 0,
    meetLink: event.hangoutLink || null,
    status: event.status,
  }));
};
