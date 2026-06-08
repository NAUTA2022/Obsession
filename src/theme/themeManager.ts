import type { Theme, ResolvedTheme } from './types';

/**
 * Lógica de tema sin React. Única fuente de verdad para leer/guardar la
 * preferencia, resolverla a claro/oscuro y aplicarla al documento.
 *
 * Comparte la clave `theme` de localStorage con el script anti-parpadeo de
 * `index.html`, que aplica el tema antes de que React monte.
 */

const STORAGE_KEY = 'theme';
const SYSTEM_QUERY = '(prefers-color-scheme: dark)';

export const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light';
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'light';
};

export const storeTheme = (theme: Theme): void => {
  if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, theme);
};

export const systemPrefersDark = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia(SYSTEM_QUERY).matches;

/** Resuelve la preferencia (incluido `system`) al tema efectivo. */
export const resolveTheme = (theme: Theme): ResolvedTheme =>
  theme === 'dark' || (theme === 'system' && systemPrefersDark()) ? 'dark' : 'light';

/** Aplica el tema al `<html>`: clase `dark` (Tailwind) + `color-scheme` nativo. */
export const applyTheme = (theme: Theme): void => {
  if (typeof document === 'undefined') return;
  const resolved = resolveTheme(theme);
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
};

/** Suscribe a cambios del tema del SO. Devuelve la función de limpieza. */
export const watchSystemTheme = (onChange: () => void): (() => void) => {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia(SYSTEM_QUERY);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
};
