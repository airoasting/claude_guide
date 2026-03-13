import React, { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, XCircle, Loader, Trash2, Calendar, RefreshCw } from 'lucide-react';
import { testAnthropic, testOWM, testER } from '../utils/api.js';
import { requestAccess, revokeToken } from '../utils/calendar.js';
import { INDUSTRIES } from '../constants/mockData.js';

const KEY_CONFIGS = [
  { id: 'anthropic', label: 'Anthropic API', placeholder: 'sk-ant-api03-...', testFn: testAnthropic },
  { id: 'owm', label: 'OpenWeatherMap API', placeholder: 'API Key', testFn: testOWM },
  { id: 'er', label: 'ExchangeRate API', placeholder: 'API Key', testFn: testER },
];

const KeyRow = ({ config, storedKey, onSave, onDelete, onToast }) => {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState(storedKey ? 'saved' : 'idle'); // idle | testing | success | error | saved

  useEffect(() => {
    setStatus(storedKey ? 'saved' : 'idle');
    setInput('');
  }, [storedKey]);

  const handleTest = async () => {
    const key = input.trim();
    if (!key) return;
    setStatus('testing');
    try {
      await config.testFn(key);
      setStatus('success');
      onSave(config.id, key);
      onToast('✅ 연결되었습니다', 'success');
    } catch (e) {
      setStatus('error');
      const code = parseInt(e.message);
      if (code === 401) onToast('❌ 유효하지 않은 API 키입니다', 'error');
      else onToast('❌ API 키를 확인해주세요', 'error');
    }
  };

  const handleDelete = () => {
    onDelete(config.id);
    setStatus('idle');
    setInput('');
    onToast('🗑️ 키가 삭제되었습니다', 'success');
  };

  const maskKey = (key) => key.slice(0, 8) + '•'.repeat(Math.min(12, key.length - 8));

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
          {config.label}
        </label>
        {status === 'saved' && (
          <span className="flex items-center gap-1" style={{ fontSize: 11, color: '#22C55E' }}>
            <CheckCircle size={12} /> 연결됨
          </span>
        )}
        {status === 'idle' && (
          <span style={{ fontSize: 11, color: 'var(--text-caption)' }}>⚪ 미설정</span>
        )}
        {status === 'error' && (
          <span className="flex items-center gap-1" style={{ fontSize: 11, color: '#DC2626' }}>
            <XCircle size={12} /> 연결 실패
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type={status === 'saved' ? 'text' : 'password'}
          value={status === 'saved' ? maskKey(storedKey) : input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={status === 'saved' ? '' : config.placeholder}
          readOnly={status === 'saved'}
          className="nm-inset flex-1"
          style={{
            fontSize: 12,
            padding: '7px 10px',
            color: 'var(--text)',
            outline: 'none',
            border: 'none',
            background: 'transparent',
            width: 0,
          }}
          onKeyDown={(e) => e.key === 'Enter' && status !== 'saved' && handleTest()}
        />

        {status === 'saved' ? (
          <button
            className="nm-btn flex items-center gap-1"
            onClick={handleDelete}
            style={{ fontSize: 12, padding: '6px 10px' }}
          >
            <Trash2 size={13} />
            삭제
          </button>
        ) : (
          <button
            className="nm-btn flex items-center gap-1"
            onClick={handleTest}
            disabled={status === 'testing' || !input.trim()}
            style={{ fontSize: 12, padding: '6px 10px' }}
          >
            {status === 'testing' ? (
              <><Loader size={13} className="animate-spin" /> 테스트 중</>
            ) : (
              '🔄 테스트'
            )}
          </button>
        )}
      </div>
    </div>
  );
};

const SettingsPanel = ({
  open,
  onClose,
  settings,
  onSettingsChange,
  apiKeys,
  onKeysSave,
  onKeysDelete,
  onToast,
  gcalConnected,
  gcalEmail,
  onGcalConnect,
  onGcalDisconnect,
  onGcalSync,
}) => {
  const handleKey = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, handleKey]);

  if (!open) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(160,170,183,0.3)' }}
        onClick={onClose}
      />

      {/* 패널 */}
      <div
        className="nm-card fixed right-0 top-0 bottom-0 z-50 settings-panel-enter overflow-y-auto"
        style={{ width: 320, borderRadius: '16px 0 0 16px' }}
        role="dialog"
        aria-modal="true"
        aria-label="설정"
      >
        {/* 헤더 */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>⚙️ 설정</h2>
          <button
            className="nm-btn"
            onClick={onClose}
            aria-label="설정 닫기"
            style={{ padding: '6px 8px' }}
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-6">
          {/* ─── 개인화 섹션 ─── */}
          <section>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              개인화
            </h3>

            {/* 이름 */}
            <div className="mb-4">
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                이름 (호칭)
              </label>
              <input
                type="text"
                value={settings.name}
                onChange={(e) => onSettingsChange({ ...settings, name: e.target.value })}
                className="nm-inset w-full"
                style={{ fontSize: 13, padding: '7px 10px', color: 'var(--text)', outline: 'none', border: 'none', background: 'transparent' }}
                placeholder="대표님"
              />
            </div>

            {/* 관심 산업 */}
            <div className="mb-4">
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                관심 산업
              </label>
              <select
                value={settings.industry}
                onChange={(e) => onSettingsChange({ ...settings, industry: e.target.value })}
                className="nm-inset w-full"
                style={{ fontSize: 13, padding: '7px 10px', color: 'var(--text)', background: 'var(--bg)', border: 'none', outline: 'none' }}
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>

            {/* 도시 */}
            <div className="mb-4">
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 6 }}>
                날씨 도시 (영문)
              </label>
              <input
                type="text"
                value={settings.city}
                onChange={(e) => onSettingsChange({ ...settings, city: e.target.value })}
                className="nm-inset w-full"
                style={{ fontSize: 13, padding: '7px 10px', color: 'var(--text)', outline: 'none', border: 'none', background: 'transparent' }}
                placeholder="Seoul"
              />
            </div>
          </section>

          {/* ─── API 키 섹션 ─── */}
          <section>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              API 키
            </h3>

            {KEY_CONFIGS.map((cfg) => (
              <KeyRow
                key={cfg.id}
                config={cfg}
                storedKey={apiKeys[cfg.id] || ''}
                onSave={onKeysSave}
                onDelete={onKeysDelete}
                onToast={onToast}
              />
            ))}

            <p style={{ fontSize: 11, color: 'var(--text-caption)', marginTop: 8 }}>
              ℹ️ 키는 이 브라우저에만 저장되며 외부에 전송되지 않습니다.
            </p>
          </section>

          {/* ─── Google Calendar 섹션 ─── */}
          <section>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-sub)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
              Google Calendar
            </h3>

            {gcalConnected ? (
              <div>
                <p
                  className="flex items-center gap-2 mb-3"
                  style={{ fontSize: 13, color: 'var(--text)' }}
                >
                  <CheckCircle size={14} style={{ color: '#22C55E' }} />
                  <span style={{ fontSize: 12, color: 'var(--text-sub)' }}>{gcalEmail || '연결됨'}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    className="nm-btn flex-1 flex items-center justify-center gap-1"
                    onClick={onGcalSync}
                    style={{ fontSize: 12, padding: '7px' }}
                  >
                    <RefreshCw size={13} /> 동기화
                  </button>
                  <button
                    className="nm-btn flex-1 flex items-center justify-center gap-1"
                    onClick={onGcalDisconnect}
                    style={{ fontSize: 12, padding: '7px', color: '#DC2626' }}
                  >
                    <Trash2 size={13} /> 연결 해제
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <button
                  className="nm-btn w-full flex items-center justify-center gap-2"
                  onClick={onGcalConnect}
                  style={{ fontSize: 13, padding: '10px' }}
                >
                  <Calendar size={15} />
                  📅 Google 계정 연결
                </button>
                <p style={{ fontSize: 11, color: 'var(--text-caption)', marginTop: 8 }}>
                  ℹ️ 읽기 전용으로 오늘 일정만 가져옵니다.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
