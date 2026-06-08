import { Outlet } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import { PERMISSIONS } from '../../constants/permissions';

/**
 * Grupo de rutas /admin/*. Guard delgado por capability.
 * Acepta cualquier permiso admin (incluye moderator para moderación/reportes).
 */
export default function AdminLayout() {
  return (
    <ProtectedRoute
      requiredPermissions={[
        PERMISSIONS.ADMIN_USERS_MANAGE,
        PERMISSIONS.ADMIN_MODERATION_MANAGE,
        PERMISSIONS.ADMIN_REPORTS_VIEW,
      ]}
    >
      <Outlet />
    </ProtectedRoute>
  );
}
