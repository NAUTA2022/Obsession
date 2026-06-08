import { create } from 'zustand';
import type { Theme } from './types';
import { getStoredTheme, storeTheme, applyTheme } from './themeManager';

type ThemeState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

/** Estado del tema. Persiste y aplica al documento en cada cambio. */
export const useThemeStore = create<ThemeState>((set) => ({
  theme: getStoredTheme(),
  setTheme: (theme) => {
    storeTheme(theme);
    applyTheme(theme);
    set({ theme });
  },
}));
