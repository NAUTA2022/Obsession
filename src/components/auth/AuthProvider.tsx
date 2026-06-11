import { ReactNode, useEffect, useState } from "react";
import { useAuthStore } from "../../store/auth";
import { apiClient } from "../../services/api/client";
import type { User } from "../../types/auth";

interface AuthProviderProps {
  children: ReactNode;
}

const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/check-email',
  '/p/',
];

const DEV_MOCK_USER: User = {
  id: "dev-mock-001",
  username: "dev_user",
  email: "andresquinteros2017@gmail.com",
  firstName: "Dev",
  lastName: "User",
  role: "customer",          // siempre arranca como cliente al recargar
  isEmailVerified: true,
  creatorOnboarded: true,    // permite cambiar a creadora
  sellerOnboarded: true,     // permite cambiar a vendedor
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // En desarrollo, bypass total: inyecta usuario mock sin llamar al API
    if (import.meta.env.DEV) {
      useAuthStore.setState({
        user: DEV_MOCK_USER,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        tokens: { accessToken: "dev-token", refreshToken: "dev-refresh" },
      });
      setIsChecking(false);
      return;
    }

    const checkAuth = async () => {
      const isPublicRoute = PUBLIC_ROUTES.some(route =>
        window.location.pathname.startsWith(route)
      );
      if (isPublicRoute) {
        setIsChecking(false);
        return;
      }
      try {
        const response = await apiClient.get<User>("/auth/me");
        if (response.success && response.data) {
          const storedAccessToken = localStorage.getItem("accessToken");
          const storedRefreshToken = localStorage.getItem("refreshToken");
          const storedExpiresAt = localStorage.getItem("expiresAt");
          // Siempre arrancar como cliente al recargar (si tiene roles adicionales)
          const userData = (response.data.creatorOnboarded || response.data.sellerOnboarded)
            ? { ...response.data, role: 'customer' as const }
            : response.data;
          useAuthStore.setState({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
            tokens: storedAccessToken
              ? {
                  accessToken: storedAccessToken,
                  refreshToken: storedRefreshToken || "",
                  expiresAt: storedExpiresAt ? parseInt(storedExpiresAt) : undefined,
                }
              : null,
          });
        } else {
          useAuthStore.setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } catch {
        useAuthStore.setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      } finally {
        setIsChecking(false);
      }
    };

    checkAuth();
  }, []);

  // Cuando cualquier llamada API recibe 401 en auth/me o auth/refresh,
  // limpiar el store para que ProtectedRoute redirija a /login sin reload
  useEffect(() => {
    const handleUnauthorized = () => {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        tokens: null,
      });
    };
    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized);
  }, []);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B021C]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
