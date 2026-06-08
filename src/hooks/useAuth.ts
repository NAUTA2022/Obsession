import { useAuthStore } from "../store/auth";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import type { UserRole } from "../types/auth";
import { USER_ROLES } from "../types/auth";

export function useAuth() {
  const auth = useAuthStore();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await auth.logout();
      navigate(ROUTES.login);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const switchRole = async (role: UserRole) => {
    try {
      await auth.switchRole(role);
      if (role === USER_ROLES.CUSTOMER) {
        navigate(ROUTES.creators);
      } else {
        navigate(ROUTES.dashboard);
      }
    } catch (error) {
      console.error("Role switch failed:", error);
      throw error;
    }
  };

  const hasRole = (requiredRoles: UserRole[]) =>
    auth.user ? requiredRoles.includes(auth.user.role) : false;

  return {
    ...auth,
    logout,
    switchRole,
    hasRole,
    isCustomer: () => hasRole([USER_ROLES.CUSTOMER]),
    isCreator: () => hasRole([USER_ROLES.CREATOR]),
    isAdmin: () => hasRole([USER_ROLES.ADMIN]),
  };
}
