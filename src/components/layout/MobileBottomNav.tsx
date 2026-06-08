import { NavLink } from 'react-router-dom';
import { LayoutDashboard, MessageCircle, BarChart3, Package, Users, ShoppingBag, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/auth';
import { useUIStore } from '../../store/ui';
import { ROUTES } from '../../constants/routes';

type Tab = { label: string; path: string; icon: React.ElementType };

const CREATOR_TABS: Tab[] = [
  { label: 'Inicio',    path: ROUTES['creator-dashboard'],   icon: LayoutDashboard },
  { label: 'Mensajes', path: ROUTES.messages,                icon: MessageCircle   },
  { label: 'CRM',      path: ROUTES['creator-crm'],          icon: BarChart3       },
  { label: 'Productos',path: ROUTES['creator-products'],     icon: Package         },
];

const CUSTOMER_TABS: Tab[] = [
  { label: 'Creadoras', path: ROUTES['customer-creators'],  icon: Users           },
  { label: 'Mensajes',  path: ROUTES.messages,              icon: MessageCircle   },
  { label: 'Compras',   path: ROUTES['customer-purchases'], icon: ShoppingBag     },
  { label: 'Planes',    path: ROUTES['customer-planes'],    icon: Package         },
];

const SELLER_TABS: Tab[] = [
  { label: 'Inicio',    path: ROUTES['seller-dashboard'],   icon: LayoutDashboard },
  { label: 'Chats',     path: ROUTES['seller-chat'],        icon: MessageCircle   },
  { label: 'Creadoras', path: ROUTES['seller-creators'],    icon: Users           },
  { label: 'Links',     path: ROUTES['seller-links'],       icon: Package         },
];

const ADMIN_TABS: Tab[] = [
  { label: 'Usuarios',  path: ROUTES['admin-users'],        icon: Users           },
  { label: 'Creadoras', path: ROUTES['admin-creators'],     icon: Package         },
  { label: 'Pagos',     path: ROUTES['admin-payments'],     icon: ShoppingBag     },
  { label: 'IA',        path: ROUTES['admin-ai'],           icon: BarChart3       },
];

function getTabsByRole(role?: string): Tab[] {
  switch (role) {
    case 'creator':  return CREATOR_TABS;
    case 'customer': return CUSTOMER_TABS;
    case 'vendedor': return SELLER_TABS;
    case 'admin':
    case 'moderator': return ADMIN_TABS;
    default: return CREATOR_TABS;
  }
}

export default function MobileBottomNav() {
  const user = useAuthStore((s) => s.user);
  const openSidebar = useUIStore((s) => s.openSidebar);
  const tabs = getTabsByRole(user?.role);

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t
      bg-white/90 backdrop-blur-md border-gray-200/80
      dark:bg-[#0D0D14]/95 dark:border-white/[0.06]
      safe-bottom"
    >
      <div className="flex items-stretch h-16">
        {tabs.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-semibold transition-colors select-none ${
                isActive
                  ? 'text-[#6850E8]'
                  : 'text-gray-400 dark:text-white/30 active:text-gray-600 dark:active:text-white/60'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`relative flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-[#6850E8]/10' : ''
                }`}>
                  <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#6850E8]" />
                  )}
                </span>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
