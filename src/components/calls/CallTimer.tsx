import { useEffect, useRef, useState, useMemo } from 'react';

export interface CallTimerProps {
  endsAt: Date | string;
  warningThresholdSeconds?: number;
  onWarning?: () => void;
  onExpire?: () => void;
}

function fmt(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds);
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = Math.floor(s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export function CallTimer({
  endsAt,
  warningThresholdSeconds = 60,
  onWarning,
  onExpire,
}: CallTimerProps) {
  const endMs = useMemo(
    () => (endsAt instanceof Date ? endsAt.getTime() : new Date(endsAt).getTime()),
    [endsAt],
  );

  const computeRemaining = () => Math.max(0, Math.ceil((endMs - Date.now()) / 1000));
  const [remaining, setRemaining] = useState<number>(computeRemaining);

  const warnedRef = useRef(false);
  const expiredRef = useRef(false);

  // Reset cuando cambia endsAt (p. ej. al extender la llamada).
  useEffect(() => {
    warnedRef.current = false;
    expiredRef.current = false;
    setRemaining(computeRemaining());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endMs]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const next = computeRemaining();
      setRemaining((prev) => (prev === next ? prev : next));
    }, 250);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endMs]);

  useEffect(() => {
    if (!warnedRef.current && remaining <= warningThresholdSeconds && remaining > 0) {
      warnedRef.current = true;
      onWarning?.();
    }
    if (!expiredRef.current && remaining <= 0) {
      expiredRef.current = true;
      onExpire?.();
    }
  }, [remaining, warningThresholdSeconds, onWarning, onExpire]);

  const isWarning = remaining <= warningThresholdSeconds;

  return (
    <div
      className={[
        'pointer-events-none select-none',
        'rounded-full px-3 py-1 font-mono text-lg tabular-nums',
        'backdrop-blur-md text-white shadow-lg',
        isWarning
          ? 'bg-red-600 text-white animate-pulse'
          : 'bg-black/40',
      ].join(' ')}
      aria-live="polite"
      aria-label={`Tiempo restante ${fmt(remaining)}`}
    >
      {fmt(remaining)}
    </div>
  );
}

export default CallTimer;
