import { useState, useEffect } from 'react';

// hydration flash 방지: 초기값으로 렌더링 후 localStorage에서 동기화
function useLocalStorage(key, initialValue) {
  const [stored, setStored] = useState(initialValue);

  useEffect(() => {
    try {
      const v = localStorage.getItem(key);
      if (v !== null) setStored(JSON.parse(v));
    } catch {}
  }, [key]);

  const setValue = (value) => {
    const next = typeof value === 'function' ? value(stored) : value;
    setStored(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
  };

  return [stored, setValue];
}

export default useLocalStorage;
