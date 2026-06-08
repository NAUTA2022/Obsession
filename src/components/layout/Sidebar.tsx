import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, ChevronDown, X } from 'lucide-react';
import { getNavigation } from '../../constants/navigationByRole';
import type { NavItem } from '../../constants/navigationByRole';
import { useUIStore } from '../../store/ui';
import { useAuthStore } from '../../store/auth';
import { usePermissions } from '../../hooks/usePermissions';
import { ROUTES } from '../../constants/routes';
import SidebarTeams from './SidebarTeams';
import SidebarCreatorsList from './SidebarCreatorsList';
import { useLogout } from '../../hooks/useLogout';
import Avatar from '../ui/Avatar';


export default function Sidebar() {
  const isSidebarOpen      = useUIStore((s) => s.isSidebarOpen);
  const isSidebarCollapsed = useUIStore((s) => s.isSidebarCollapsed);
  const closeSidebar       = useUIStore((s) => s.closeSidebar);

  const user        = useAuthStore((s) => s.user);
  const [expanded, setExpanded] = useState<string[]>([]);
  const logout    = useLogout();
  const { hasPermission } = usePermissions();

  const collapsed = isSidebarCollapsed;

  const handleNavClick = () => {
    if (window.innerWidth < 768) closeSidebar();
  };

  const filterItems = (items: NavItem[]): NavItem[] =>
    items
      .filter((i) => hasPermission(i.permission))
      .map((i) =>
        i.children ? { ...i, children: i.children.filter((c) => hasPermission(c.permission)) } : i
      );

  const raw = getNavigation();
  const nav = {
    primary:   filterItems(raw.primary),
    secondary: filterItems(raw.secondary),
    fourth:    filterItems(raw.fourth),
  };

  const toggleExpand = (label: string) =>
    setExpanded((p) => p.includes(label) ? p.filter((x) => x !== label) : [...p, label]);

  /* ─── Nav item renderer ─── */
  const renderItem = (item: NavItem, depth = 0) => {
    const Icon = item.icon;
    const isExp = expanded.includes(item.label);
    const hasKids = item.children && item.children.length > 0;
    const imgUrl = item.label === 'Perfil' && user?.profilePicture ? user.profilePicture : item.imageUrl;

    const iconEl = imgUrl
      ? <Avatar src={imgUrl} alt="" size={18} />
      : Icon
        ? <Icon className="w-[18px] h-[18px] shrink-0" />
        : null;

    const activeClass = 'bg-[#6850E8]/10 text-[#6850E8] dark:bg-[#6850E8]/15 dark:text-[#9277F5]';
    const idleClass   = 'text-gray-600 hover:bg-gray-100 dark:text-white/50 dark:hover:bg-white/[0.05] dark:hover:text-white/80';

    /* Collapsed (icon-only rail) */
    if (collapsed) {
      return (
        <li key={item.path}>
          <NavLink
            to={item.path}
            title={item.label}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center justify-center rounded-xl p-2.5 transition-colors ${isActive ? activeClass : idleClass}`
            }
          >
            {iconEl}
          </NavLink>
        </li>
      );
    }

    /* Custom expandable (e.g. Equipos, Mis Creadoras) */
    if (item.customExpandable) {
      const expandContent = item.expandType === 'creators-list'
        ? <SidebarCreatorsList />
        : <SidebarTeams />;

      return (
        <li key={item.path}>
          <button
            onClick={() => toggleExpand(item.label)}
            className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isExp ? activeClass : idleClass}`}
          >
            <span className="flex items-center gap-3">{iconEl}<span>{item.label}</span></span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExp ? 'rotate-180' : ''}`} />
          </button>
          {isExp && expandContent}
        </li>
      );
    }

    /* Item with children */
    if (hasKids) {
      return (
        <motion.li key={item.path} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          <button
            onClick={() => toggleExpand(item.label)}
            className={`w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${idleClass}`}
          >
            <span className="flex items-center gap-3">{iconEl}<span>{item.label}</span></span>
            <motion.span animate={{ rotate: isExp ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-3.5 h-3.5" />
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {isExp && (
              <motion.ul
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden ml-7 mt-0.5 space-y-0.5 border-l border-gray-200/70 dark:border-white/[0.06] pl-3"
              >
                {item.children!.map((child) => renderItem(child, 1))}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.li>
      );
    }

    /* Leaf item */
    return (
      <motion.li key={item.path} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
        <NavLink
          to={item.path}
          onClick={handleNavClick}
          className={({ isActive }) =>
            `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive ? activeClass : idleClass}`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-xl bg-[#6850E8]/10 dark:bg-[#6850E8]/15"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{iconEl}</span>
              <span className={`relative z-10 ${depth === 0 ? '' : 'text-xs'}`}>{item.label}</span>
            </>
          )}
        </NavLink>
      </motion.li>
    );
  };

  /* ─── Sidebar body ─── */
  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity md:hidden ${
          isSidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeSidebar}
      />

      <aside
        className={[
          'flex flex-col shrink-0',
          'bg-white dark:bg-[#0D0D14]',
          'border-r border-gray-200/70 dark:border-white/[0.06]',
          'transition-[width,transform] duration-200 ease-out',
          // Mobile: fixed overlay drawer
          'fixed inset-y-0 left-0 z-50',
          // Desktop: relative flex item (overrides fixed, participates in layout)
          'md:relative md:z-auto md:inset-auto md:translate-x-0',
          // Mobile slide control only
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          // Width
          collapsed ? 'w-[68px] px-2' : 'w-[240px] px-3',
        ].join(' ')}
      >
        {/* ── Mobile header: spacer + close button ── */}
        <div className="md:hidden shrink-0 flex items-center justify-between h-14 border-b border-gray-100 dark:border-white/[0.06] px-3 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400/70 dark:text-white/20">
            Menú
          </span>
          <button
            onClick={closeSidebar}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors dark:text-white/30 dark:hover:bg-white/[0.06] dark:hover:text-white/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pb-2 pt-3 [&::-webkit-scrollbar]:w-0">
          <div className="space-y-4">
            {/* Primary */}
            <div>
              {!collapsed && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400/70 dark:text-white/20 px-3 mb-1.5">
                  Principal
                </p>
              )}
              <ul className="space-y-0.5">
                {nav.primary.map((item) => renderItem(item))}
              </ul>
            </div>

            {/* Secondary */}
            {nav.secondary.length > 0 && (
              <div>
                {!collapsed && (
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400/70 dark:text-white/20 px-3 mb-1.5">
                    Herramientas
                  </p>
                )}
                <ul className="space-y-0.5">
                  {nav.secondary.map((item) => renderItem(item))}
                </ul>
              </div>
            )}
          </div>
        </nav>

        {/* ── Bottom: settings + logout ── */}
        <div className="shrink-0 border-t border-gray-200/70 dark:border-white/[0.06] pt-2 pb-3 space-y-0.5">
          {nav.fourth.map((item) => renderItem(item))}
          <button
            onClick={logout}
            title="Cerrar sesión"
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:text-red-400/80 dark:hover:bg-red-500/[0.08] transition-colors ${
              collapsed ? 'justify-center' : ''
            }`}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
