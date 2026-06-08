import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import { useThemeStore } from './themeStore';
import { applyTheme, systemPrefersDark, watchSystemTheme } from './themeManager';

/**
 * Provider único de tema para toda la app:
 * - Mantiene la clase `dark` (Tailwind) sincronizada con la preferencia.
 * - Reacciona en vivo a los cambios de tema del sistema operativo.
 * - Sincroniza MUI (`palette.mode`) para que sus componentes (inputs, modales,
 *   wizards, incl. los que se renderizan en portales) sigan el modo oscuro.
 *
 * El primer pintado lo resuelve el script anti-parpadeo de `index.html`; aquí
 * solo mantenemos todo en sincronía a partir del montaje.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const [systemDark, setSystemDark] = useState(systemPrefersDark);

  // Cambios del tema del SO (solo relevantes cuando theme === 'system').
  useEffect(() => watchSystemTheme(() => setSystemDark(systemPrefersDark())), []);

  const mode: 'light' | 'dark' =
    theme === 'dark' || (theme === 'system' && systemDark) ? 'dark' : 'light';

  // Mantiene la clase `dark` del <html> en sincronía con preferencia + SO.
  useEffect(() => {
    applyTheme(theme);
  }, [theme, systemDark]);

  const muiTheme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          // Brand color — morado del logo "obsesion"
          primary: { main: '#6850e8', light: '#977dfb', dark: '#5836d4', contrastText: '#ffffff' },
          secondary: { main: '#977dfb' },
        },
      }),
    [mode],
  );

  return <MuiThemeProvider theme={muiTheme}>{children}</MuiThemeProvider>;
}

export default ThemeProvider;
