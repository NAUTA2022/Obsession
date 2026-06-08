import { Outlet } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import { PERMISSIONS } from '../../constants/permissions';

/**
 * Grupo de rutas /customer/*. Guard delgado por capability; reutiliza el chrome
 * de AppLayout (que lo envuelve) y renderiza el contenido del módulo.
 */
export default function CustomerLayout() {
  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.CUSTOMER_CREATORS_BROWSE}>
      <Outlet />
    </ProtectedRoute>
  );
}
