import { useEffect, useState } from 'react';

/**
 * Devuelve `true` cuando el viewport está por debajo del breakpoint indicado.
 * Centraliza los chequeos de `window.innerWidth` dispersos por la app.
 *
 * @param breakpoint Ancho (px) por debajo del cual se considera móvil. Por
 *                   defecto 768 (coincide con el `md` de Tailwind).
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = () => setIsMobile(mq.matches);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
}

export default useIsMobile;
