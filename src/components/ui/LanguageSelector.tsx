import Dropdown from './Dropdown';
import IconButton from './IconButton';
import { LANGUAGES } from '../../constants/app';
import { usePreferencesStore } from '../../store/preferences';

export default function LanguageSelector() {
  const language = usePreferencesStore((s) => s.language);
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];

  return (
    <Dropdown
      trigger={<IconButton aria-label="Idioma" className="h-9 w-9 text-xs font-semibold sm:h-10 sm:w-10">{current.label}</IconButton>}
    >
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800 ${
            lang.code === language ? 'bg-gray-50 dark:bg-gray-800/70' : ''
          }`}
          onClick={() => setLanguage(lang.code)}
        >
          {lang.label}
        </button>
      ))}
    </Dropdown>
  );
}


