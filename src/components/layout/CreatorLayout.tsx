import { Outlet } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import { PERMISSIONS } from '../../constants/permissions';

/**
 * Grupo de rutas /creator/*. Guard delgado por capability; reutiliza el chrome
 * de AppLayout y renderiza el contenido del módulo.
 */
export default function CreatorLayout() {
  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.CREATOR_DASHBOARD_VIEW}>
      <Outlet />
    </ProtectedRoute>
  );
}
