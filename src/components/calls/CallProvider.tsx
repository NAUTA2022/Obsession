import { type ReactNode } from 'react';
import { useLiveKitCall } from '../../hooks/useLiveKitCall';
import { CallOverlay } from './CallOverlay';
import { CallContext } from './call-context';

export { useCall } from './call-context';

export function CallProvider({ children }: { children: ReactNode }) {
  const call = useLiveKitCall();
  return (
    <CallContext.Provider value={call}>
      {children}
      <CallOverlay />
    </CallContext.Provider>
  );
}
