import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, Wallet, BookOpen, ChevronRight } from 'lucide-react';
import Dropdown from './Dropdown';
import Avatar from './Avatar';
import type { UserRole } from '../../types/auth';
import { useAuthStore } from '../../store/auth';
import { useLogout } from '../../hooks/useLogout';
import { ROUTES } from '../../constants/routes';

const ROLE_LABELS: Record<string, string> = {
  creator:  'Entrar como creadora',
  customer: 'Entrar como cliente',
  vendedor: 'Entrar como vendedor',
  moderator:'Entrar como moderador',
  admin:    'Administración',
};

const ROLE_CURRENT: Record<string, string> = {
  creator:  'Creadora',
  customer: 'Cliente',
  vendedor: 'Vendedor',
  moderator:'Moderador',
  admin:    'Admin',
};

const ROLE_COLORS: Record<string, string> = {
  creator:  'text-violet-500 dark:text-violet-400',
  customer: 'text-blue-500 dark:text-blue-400',
  vendedor: 'text-cyan-500 dark:text-cyan-400',
  moderator:'text-emerald-500 dark:text-emerald-400',
  admin:    'text-amber-500 dark:text-amber-400',
};

function truncateAddress(addr: string) {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function UserMenu() {
  const { user, switchRole, isLoading } = useAuthStore();
  const logout = useLogout();
  const navigate = useNavigate();

  const getUserName = () => {
    if (user?.firstName) return `${user.firstName} ${user.lastName ?? ''}`.trim();
    return user?.username ?? 'Usuario';
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const handleRoleChange = async (role: UserRole) => {
    if (role === user?.role) return;
    try { await switchRole(role); } catch { /* noop */ }
  };

  // Roles disponibles para cambiar (mismo criterio que sidebar)
  const switchableRoles: UserRole[] = [
    'customer',
    ...(user?.creatorOnboarded ? ['creator' as UserRole] : []),
    ...(user?.sellerOnboarded  ? ['vendedor' as UserRole] : []),
  ];

  // Mock wallet address — en producción viene de thirdweb useAddress()
  const walletAddress = user?.email
    ? `0x${[...user.email].reduce((acc, c) => acc + c.charCodeAt(0).toString(16), '').slice(0, 40).padEnd(40, '0')}`
    : null;

  const name = getUserName();

  return (
    <Dropdown
      trigger={
        <button className="flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6850E8]/50">
          <Avatar
            src={user?.profilePicture}
            fallback={getInitials(name)}
            size={32}
          />
        </button>
      }
    >
      <div className="w-64 py-1">

        {/* ── Header: avatar + nombre + email ── */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
          <Avatar
            src={user?.profilePicture}
            fallback={getInitials(name)}
            size={40}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white/90 truncate">{name}</p>
            <p className="text-xs text-gray-400 dark:text-white/30 truncate">{user?.email}</p>
            {user?.role && (
              <p className={`text-[11px] font-semibold mt-0.5 ${ROLE_COLORS[user.role] ?? 'text-gray-400'}`}>
                {ROLE_CURRENT[user.role] ?? user.role}
              </p>
            )}
          </div>
        </div>

        {/* ── Wallet conectada ── */}
        {walletAddress && (
          <div className="mx-3 mt-2 flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-white/[0.04] px-3 py-2">
            <Wallet className="w-3.5 h-3.5 shrink-0 text-[#6850E8]" />
            <span className="text-xs font-mono text-gray-500 dark:text-white/40 truncate">
              {truncateAddress(walletAddress)}
            </span>
          </div>
        )}

        {/* ── Cambiar rol ── */}
        {switchableRoles.length > 1 && (
          <div className="mt-2 border-t border-gray-100 dark:border-white/[0.06] pt-1">
            <p className="px-4 pt-1 pb-0.5 text-[10px] font-bold uppercase tracking-widest text-gray-400/70 dark:text-white/20">
              Cambiar modo
            </p>
            {switchableRoles.map((role) => {
              const isCurrent = user?.role === role;
              return (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  disabled={isLoading || isCurrent}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                    isCurrent
                      ? 'text-[#6850E8] dark:text-[#9277F5] cursor-default'
                      : 'text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/[0.03]'
                  }`}
                >
                  <span className="font-medium">{ROLE_LABELS[role]}</span>
                  {isCurrent ? (
                    <span className="text-[9px] font-bold uppercase tracking-wide bg-[#6850E8]/10 text-[#6850E8] dark:text-[#9277F5] rounded-full px-2 py-0.5">
                      Actual
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-30" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Navegación ── */}
        <div className="mt-1 border-t border-gray-100 dark:border-white/[0.06] pt-1">
          <button
            onClick={() => navigate(ROUTES.profile)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
          >
            <User className="w-4 h-4 shrink-0 text-gray-400 dark:text-white/25" />
            Perfil
          </button>
          <button
            onClick={() => navigate(ROUTES.settings)}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
          >
            <Settings className="w-4 h-4 shrink-0 text-gray-400 dark:text-white/25" />
            Ajustes
          </button>
          {/* Documentación — solo en mobile (en desktop está en el navbar) */}
          <button
            onClick={() => navigate('/documentation')}
            className="sm:hidden w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
          >
            <BookOpen className="w-4 h-4 shrink-0 text-gray-400 dark:text-white/25" />
            Documentación
          </button>
        </div>

        {/* ── Logout ── */}
        <div className="border-t border-gray-100 dark:border-white/[0.06] pt-1 mt-1">
          <button
            onClick={logout}
            disabled={isLoading}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 dark:text-red-400/80 hover:bg-red-50 dark:hover:bg-red-500/[0.06] transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {isLoading ? 'Cerrando...' : 'Cerrar sesión'}
          </button>
        </div>

      </div>
    </Dropdown>
  );
}
