import { Outlet } from 'react-router-dom';
import ProtectedRoute from '../auth/ProtectedRoute';
import { PERMISSIONS } from '../../constants/permissions';

/**
 * Grupo de rutas /seller/* (rol backend "vendedor"). Guard delgado por capability.
 */
export default function SellerLayout() {
  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.SELLER_DASHBOARD_VIEW}>
      <Outlet />
    </ProtectedRoute>
  );
}
