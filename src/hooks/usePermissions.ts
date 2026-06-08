import { useMemo } from 'react';
import { useAuthStore } from '../store/auth';
import { ROLE_PERMISSIONS } from '../constants/permissions';
import type { Permission } from '../constants/permissions';

/**
 * Hook de capabilities. Resuelve los permisos del usuario actual a partir de su
 * rol (ver `src/constants/permissions.ts`) y expone helpers para consultarlos.
 *
 * Es la ÚNICA fuente de verdad para visibilidad/acceso en la UI: componentes y
 * guards consultan `hasPermission` en vez de leer `user.role`.
 */
export function usePermissions() {
  const user = useAuthStore((s) => s.user);

  const permissions = useMemo<Permission[]>(() => {
    if (!user?.role) return [];
    return ROLE_PERMISSIONS[user.role] ?? [];
  }, [user?.role]);

  const permissionSet = useMemo(() => new Set<string>(permissions), [permissions]);

  const hasPermission = (permission?: string | null): boolean => {
    if (!permission) return true; // sin permiso requerido => visible/accesible
    return permissionSet.has(permission);
  };

  const hasAnyPermission = (perms?: string[] | null): boolean => {
    if (!perms || perms.length === 0) return true;
    return perms.some((p) => permissionSet.has(p));
  };

  return { permissions, hasPermission, hasAnyPermission };
}
