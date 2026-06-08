import {icons} from '../../config/icons'
import Dropdown from './Dropdown';
import IconButton from './IconButton';
import { useThemeStore } from '../../theme/themeStore';

export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const icon = theme === 'dark' ? <icons.moon className="h-4 w-4" /> : theme === 'light' ? <icons.sun className="h-4 w-4" /> : <icons.laptop className="h-4 w-4" />;

  return (
    <Dropdown
      trigger={<IconButton aria-label="Tema" className="h-9 w-9 sm:h-10 sm:w-10">{icon}</IconButton>}
    >
      <button className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setTheme('light')}>
        <div className="flex items-center gap-2"><icons.sun className="h-4 w-4" /> Claro</div>
      </button>
      <button className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setTheme('dark')}>
        <div className="flex items-center gap-2"><icons.moon className="h-4 w-4" /> Oscuro</div>
      </button>
      <button className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-800" onClick={() => setTheme('system')}>
        <div className="flex items-center gap-2"><icons.laptop className="h-4 w-4" /> Sistema</div>
      </button>
    </Dropdown>
  );
}


