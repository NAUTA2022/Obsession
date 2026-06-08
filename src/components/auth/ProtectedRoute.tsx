import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { ROUTES } from '../../constants/routes';
import type { UserRole } from '../../types/auth';
import { USER_ROLES } from '../../types/auth';
import { usePermissions } from '../../hooks/usePermissions';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
  /** Permiso (capability) requerido. Tiene prioridad sobre requiredRole(s). */
  requiredPermission?: string;
  /** Lista de permisos; basta con tener uno (OR). */
  requiredPermissions?: string[];
  fallback?: ReactNode;
}

export const ProtectedRoute = ({
  children,
  redirectTo = ROUTES.login,
  requireAuth = true,
  requiredRole,
  requiredRoles,
  requiredPermission,
  requiredPermissions,
  fallback
}: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const { hasAnyPermission } = usePermissions();
  const location = useLocation();

  if (isLoading) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (requireAuth && (!isAuthenticated || !user)) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Página principal del rol (para redirecciones cuando falta acceso).
  const roleHome = () => {
    if (!user) return ROUTES.login;
    if (user.role === USER_ROLES.VENDEDOR) return ROUTES['seller-dashboard'];
    if (user.role === USER_ROLES.CUSTOMER) return ROUTES['customer-creators'];
    return ROUTES['creator-dashboard'];
  };

  // 1) Acceso por capabilities (preferido, alineado con el PDF).
  const permsToCheck = [
    ...(requiredPermission ? [requiredPermission] : []),
    ...(requiredPermissions ?? []),
  ];
  if (permsToCheck.length > 0 && !hasAnyPermission(permsToCheck)) {
    return <Navigate to={roleHome()} replace />;
  }

  // 2) Acceso por rol (legacy — se mantiene durante la transición).
  // El vendedor hereda (por ahora) los permisos de customer en rutas legacy.
  const roleAllowed = (allowed: UserRole) =>
    user?.role === allowed ||
    (user?.role === USER_ROLES.VENDEDOR && allowed === USER_ROLES.CUSTOMER);

  if (requiredRole && !roleAllowed(requiredRole)) {
    return <Navigate to={roleHome()} replace />;
  }

  if (requiredRoles && requiredRoles.length > 0 && user && !requiredRoles.some(roleAllowed)) {
    return <Navigate to={roleHome()} replace />;
  }

  return <>{children}</>;
};

export const PublicRoute = ({
  children,
  redirectTo = ROUTES.dashboard
}: Omit<ProtectedRouteProps, 'requireAuth'>) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

const ADMIN_EMAIL = 'andresquinteros2017@gmail.com';

/** Rutas exclusivas del admin — solo accesibles con el email autorizado. */
export const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-amber-500" />
      </div>
    );
  }

  if (!isAuthenticated || !user) return <Navigate to={ROUTES.login} replace />;

  const canAccessAdmin = user.email === ADMIN_EMAIL || user.role === 'admin';
  if (!canAccessAdmin) return <Navigate to="/" replace />;

  return <>{children}</>;
};

// Exportación por defecto para compatibilidad
export default ProtectedRoute;
