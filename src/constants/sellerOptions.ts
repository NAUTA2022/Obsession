import countries from 'i18n-iso-countries';
import esLocale from 'i18n-iso-countries/langs/es.json';

countries.registerLocale(esLocale as any);

export const AVAILABLE_LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'Inglés', flag: '🇺🇸' },
  { code: 'fr', label: 'Francés', flag: '🇫🇷' },
  { code: 'de', label: 'Alemán', flag: '🇩🇪' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', label: 'Portugués', flag: '🇵🇹' },
];

export const AVAILABLE_CATEGORIES = [
  { value: '3d_models', label: 'Modelos 3D' },
  { value: '3d_services', label: 'Servicios de Artista 3D' },
  { value: 'textures', label: 'Texturas' },
  { value: 'animations', label: 'Animaciones' },
  { value: 'characters', label: 'Personajes' },
  { value: 'environments', label: 'Entornos' },
  { value: 'props', label: 'Props' },
  { value: 'game_assets', label: 'Assets de juego' },
  { value: 'vfx', label: 'VFX' },
  { value: 'plugins', label: 'Plugins' },
  { value: 'tools', label: 'Herramientas' },
  { value: 'others', label: 'Otros' },
];

export const MAX_CATEGORIES = 5;
export const MAX_DESCRIPTION = 500;

/** Devuelve el listado de países (código ISO + nombre en español), ordenado. */
export function getCountryOptions(): Array<{ code: string; name: string }> {
  const names = countries.getNames('es', { select: 'official' }) as Record<string, string>;
  return Object.keys(names)
    .map((code) => ({ code, name: names[code] }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Nombre legible del país a partir del código ISO; devuelve el código si no se encuentra. */
export function getCountryName(code: string): string {
  if (!code) return '';
  return (countries.getName(code, 'es', { select: 'official' }) as string) || code;
}

export function getLanguageLabel(code: string): string {
  const found = AVAILABLE_LANGUAGES.find((l) => l.code === code);
  return found ? `${found.flag} ${found.label}` : code;
}

export function getCategoryLabel(value: string): string {
  return AVAILABLE_CATEGORIES.find((c) => c.value === value)?.label || value;
}
