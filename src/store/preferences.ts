import { create } from 'zustand';

// El tema vive ahora en su propio módulo: `src/theme/`. Aquí solo queda el idioma.

type PreferencesState = {
  language: string;
  setLanguage: (lang: string) => void;
};

const getInitialLanguage = (): string => {
  return localStorage.getItem('language') ?? 'es';
};

export const usePreferencesStore = create<PreferencesState>((set) => ({
  language: getInitialLanguage(),
  setLanguage: (language) => {
    localStorage.setItem('language', language);
    set({ language });
  },
}));
