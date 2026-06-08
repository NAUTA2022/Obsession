import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  ChevronDown, Users, Loader2,
  LayoutDashboard, MessageCircle, ShoppingBag,
  CalendarDays, Target, Images, Contact2,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CollabCreator {
  id: string;
  displayName: string;
  username: string;
  profilePicture?: string;
}

// ── Mock data (mirrors CollaborationsPage) ────────────────────────────────────
// Replace with real API call when `/seller/my-creators` endpoint is available.

const MOCK_CREATORS: CollabCreator[] = [
  {
    id: 'c1',
    displayName: 'Valentina López',
    username: 'vale_creator',
    profilePicture: 'https://i.pravatar.cc/150?u=vale_creator',
  },
  {
    id: 'c2',
    displayName: 'Sofía Ramírez',
    username: 'sofia_content',
    profilePicture: 'https://i.pravatar.cc/150?u=sofia_content',
  },
  {
    id: 'c3',
    displayName: 'Camila Torres',
    username: 'cami_studio',
    profilePicture: 'https://i.pravatar.cc/150?u=cami_studio',
  },
];

// ── Sub-tool definitions ───────────────────────────────────────────────────────
// Each tool links to /seller/creator/:username/<tab>

const SUB_TOOLS = [
  { id: 'dashboard',     label: 'Dashboard',             icon: LayoutDashboard },
  { id: 'conversations', label: 'Conversaciones',        icon: MessageCircle },
  { id: 'products',      label: 'Productos y servicios', icon: ShoppingBag },
  { id: 'bookings',      label: 'Calendario',            icon: CalendarDays },
  { id: 'crm',           label: 'CRM',                   icon: Target },
  { id: 'studio',        label: 'Galería',               icon: Images },
  { id: 'contacts',      label: 'Contactos',             icon: Contact2 },
] as const;

// ── Component ─────────────────────────────────────────────────────────────────

export default function SidebarCreatorsList() {
  const [creators, setCreators] = useState<CollabCreator[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Simulate API fetch — replace with real call when endpoint is ready
    const timer = setTimeout(() => {
      setCreators(MOCK_CREATORS);
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const toggle = (id: string) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (loading) {
    return (
      <div className="ml-4 mt-1 flex items-center gap-2 py-2">
        <Loader2 className="h-3 w-3 animate-spin text-gray-400 dark:text-white/20" />
        <span className="text-xs text-gray-400 dark:text-white/30">Cargando...</span>
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <div className="ml-4 mt-1 py-2">
        <span className="text-xs text-gray-400 dark:text-white/30">Sin creadoras</span>
      </div>
    );
  }

  return (
    <ul className="ml-3 mt-1 space-y-0.5">
      {creators.map((creator) => {
        const isOpen = expandedIds.has(creator.id);
        const basePath = `/seller/creator/${creator.username}`;

        return (
          <li key={creator.id}>
            {/* ── Creator header row ── */}
            <button
              onClick={() => toggle(creator.id)}
              className="w-full flex items-center gap-2.5 rounded-xl px-2 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 dark:text-white/60 dark:hover:bg-white/[0.05] dark:hover:text-white/80 transition-colors"
            >
              {creator.profilePicture ? (
                <img
                  src={creator.profilePicture}
                  alt=""
                  className="h-6 w-6 rounded-full object-cover flex-shrink-0 ring-1 ring-gray-200 dark:ring-white/[0.08]"
                />
              ) : (
                <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 dark:from-[#6850E8]/80 dark:to-purple-700 flex items-center justify-center flex-shrink-0">
                  <Users className="h-3 w-3 text-white" />
                </div>
              )}
              <span className="flex-1 truncate text-left">{creator.displayName}</span>
              <ChevronDown
                className={`h-3 w-3 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {/* ── Sub-tools — each tab gets its own route ── */}
            {isOpen && (
              <ul className="ml-8 mt-0.5 mb-1 space-y-0.5 border-l border-gray-200/60 dark:border-white/[0.05] pl-2.5">
                {SUB_TOOLS.map((tool) => {
                  const Icon = tool.icon;
                  const to = `${basePath}/${tool.id}`;

                  return (
                    <li key={tool.id}>
                      <NavLink
                        to={to}
                        end
                        className={({ isActive }) =>
                          `flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors ${
                            isActive
                              ? 'bg-[#6850E8]/10 text-[#6850E8] dark:bg-[#6850E8]/15 dark:text-[#9277F5]'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-white/40 dark:hover:text-white/70 dark:hover:bg-white/[0.04]'
                          }`
                        }
                      >
                        <Icon className="h-3 w-3 flex-shrink-0" />
                        <span>{tool.label}</span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}
