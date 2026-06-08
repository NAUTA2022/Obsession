import { createContext, useContext } from 'react';
import type { useLiveKitCall } from '../../hooks/useLiveKitCall';

export type CallCtx = ReturnType<typeof useLiveKitCall>;

export const CallContext = createContext<CallCtx | null>(null);

export function useCall(): CallCtx {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall debe usarse dentro de CallProvider');
  return ctx;
}
