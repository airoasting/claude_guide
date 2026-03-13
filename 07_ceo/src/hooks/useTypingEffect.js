import { useState, useEffect, useRef } from 'react';

// 타이핑 효과 훅
// text: 출력할 문자열
// speed: 글자당 ms (기본 30ms)
// enabled: false면 즉시 전체 출력
function useTypingEffect(text, speed = 30, enabled = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!text) {
      setDisplayed('');
      setDone(false);
      return;
    }

    // 모션 감소 설정이면 즉시 표시
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!enabled || prefersReduced) {
      setDisplayed(text);
      setDone(true);
      return;
    }

    setDisplayed('');
    setDone(false);
    let i = 0;

    const tick = () => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i < text.length) {
        timerRef.current = setTimeout(tick, speed);
      } else {
        setDone(true);
      }
    };

    timerRef.current = setTimeout(tick, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, speed, enabled]);

  return { displayed, done };
}

export default useTypingEffect;
