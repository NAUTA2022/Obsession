import { useEffect, useRef, useState } from 'react';

/**
 * Resplandor sutil que sigue al cursor con un ligero retardo (trailing).
 * - Morado de marca, adaptado a tema claro (multiply) y oscuro (screen).
 * - Se desactiva con `prefers-reduced-motion` y en dispositivos sin puntero fino (táctiles).
 * - `pointer-events: none`, así que nunca interfiere con clics.
 */
export default function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [isDark, setIsDark] = useState(
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark'),
  );

  // Habilitar solo en punteros finos y sin reduced-motion.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setEnabled(finePointer && !reduced);
  }, []);

  // Seguir cambios de tema (la app togglea la clase `dark` en <html>).
  useEffect(() => {
    const el = document.documentElement;
    const obs = new MutationObserver(() => setIsDark(el.classList.contains('dark')));
    obs.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const node = ref.current;
    if (!node) return;

    let raf = 0;
    let visible = false;
    // Posición real (suavizada) y objetivo (cursor).
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { ...pos };

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
      if (!visible) {
        visible = true;
        node.style.opacity = '1';
      }
    };
    const onLeave = () => {
      visible = false;
      node.style.opacity = '0';
    };

    const tick = () => {
      // Lerp: retardo suave hacia el cursor.
      pos.x += (target.x - pos.x) * 0.14;
      pos.y += (target.y - pos.y) * 0.14;
      node.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[5] h-[300px] w-[300px] rounded-full opacity-0 transition-opacity duration-500 will-change-transform"
      style={{
        background: isDark
          ? 'radial-gradient(circle, rgba(120,98,240,0.10) 0%, rgba(104,80,232,0.05) 40%, transparent 70%)'
          : 'radial-gradient(circle, rgba(104,80,232,0.08) 0%, rgba(146,121,245,0.04) 40%, transparent 70%)',
        mixBlendMode: isDark ? 'screen' : 'multiply',
        filter: 'blur(10px)',
      }}
    />
  );
}
