import { useState, useRef, useEffect } from 'react';
import { Search, X, Menu, BookOpen, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/ui';
import { usePageTitle } from '../../hooks/usePageTitle';
import { images } from '../../config/assets';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageSelector from '../ui/LanguageSelector';
import NotificationsMenu from '../ui/NotificationsMenu';
import UserMenu from '../ui/UserMenu';

export default function Navbar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const toggleSidebar          = useUIStore((s) => s.toggleSidebar);
  const toggleSidebarCollapsed = useUIStore((s) => s.toggleSidebarCollapsed);
  const isSidebarCollapsed     = useUIStore((s) => s.isSidebarCollapsed);
  const pageTitle              = usePageTitle();

  const handleToggle = () => {
    if (window.innerWidth < 768) toggleSidebar();
    else toggleSidebarCollapsed();
  };

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  return (
    <header className="sticky top-0 z-30 w-full
      border-b border-gray-200/80 bg-white/90 backdrop-blur-md
      dark:border-white/[0.06] dark:bg-[#0D0D14]/95">
      <div className="flex h-14 items-center gap-2 px-3 sm:px-4">

        {/* Left — hamburger + logo */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleToggle}
            aria-label="Abrir menú"
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors dark:text-white/40 dark:hover:bg-white/[0.06] dark:hover:text-white/80"
          >
            <Menu className="w-[18px] h-[18px]" />
          </button>

          {/* Logo — icono cuadrado en mobile, logotipo completo en sm+ */}
          <button
            onClick={() => window.location.assign('/')}
            className="flex items-center focus:outline-none"
          >
            <img
              src={images.brandIcon}
              alt="Obsesion"
              className="h-8 w-8 rounded-xl object-cover sm:hidden"
            />
            <img
              src={images.brandLogo}
              alt="Obsesion"
              className="hidden sm:block h-7 w-auto object-contain"
            />
          </button>

          {/* Sidebar collapse toggle — desktop only, right of logo */}
          <button
            onClick={toggleSidebarCollapsed}
            aria-label={isSidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors dark:text-white/30 dark:hover:bg-white/[0.06] dark:hover:text-white/60"
          >
            {isSidebarCollapsed
              ? <ChevronsRight className="w-4 h-4" />
              : <ChevronsLeft className="w-4 h-4" />
            }
          </button>
        </div>

        {/* Center — page title or search */}
        <div className="flex-1 flex items-center justify-center">
          {searchOpen ? (
            <div className="w-full max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30" />
              <input
                ref={searchRef}
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && setSearchOpen(false)}
                placeholder="Buscar..."
                className="w-full pl-9 pr-9 py-2 text-sm rounded-xl
                  bg-gray-100 border-0 outline-none placeholder-gray-400
                  focus:bg-gray-200 transition-colors
                  dark:bg-white/[0.07] dark:text-white/90 dark:placeholder-white/25
                  dark:focus:bg-white/[0.1]"
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchValue(''); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-white/30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <h1 className="hidden md:block text-sm font-semibold text-gray-700 dark:text-white/70 select-none">
              {pageTitle}
            </h1>
          )}
        </div>

        {/* Right — always show theme toggle + notifs + user */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors dark:text-white/40 dark:hover:bg-white/[0.06] dark:hover:text-white/80"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme toggle — always visible */}
          <ThemeToggle />

          {/* Language — only on sm+ to save space on very small screens */}
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          {/* Documentation — desktop only */}
          <button
            onClick={() => navigate('/documentation')}
            title="Documentación"
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors dark:text-white/40 dark:hover:bg-white/[0.06] dark:hover:text-white/80"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <NotificationsMenu />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
