import { create } from "zustand";
import type { User, AuthState, UserRole } from "../types/auth";
import { authService } from "../services/api/auth.service";
import type { ThirdwebVerifyRequest } from "../services/api/auth.service";
import { env } from "../config/env";

interface AuthStore extends AuthState {
  loginWithThirdweb: (data: ThirdwebVerifyRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
  switchRole: (role: UserRole) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const useAuthStore = create<AuthStore>()((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  tokens: null,

  loginWithThirdweb: async (data: ThirdwebVerifyRequest) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.verifyThirdweb(data);

      if (response.success && response.data) {
        const { user, accessToken, refreshToken, expiresIn } = response.data;

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem(env.AUTH_STORAGE_KEY, accessToken); // clave que usa apiClient
        localStorage.setItem("refreshToken", refreshToken);
        if (expiresIn) {
          localStorage.setItem("expiresIn", expiresIn.toString());
          localStorage.setItem("expiresAt", (Date.now() + expiresIn * 1000).toString());
        }

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          tokens: {
            accessToken,
            refreshToken,
            expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : undefined,
          },
        });
      } else {
        set({ isLoading: false, error: "Thirdweb authentication failed" });
        throw new Error("Thirdweb authentication failed");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Thirdweb authentication failed";
      set({ isLoading: false, error: errorMessage });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem(env.AUTH_STORAGE_KEY);
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("expiresIn");
      localStorage.removeItem("expiresAt");
      localStorage.removeItem("tokenType");

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        tokens: null,
      });
    }
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },

  switchRole: async (role: UserRole) => {
    // En DEV no hay backend — cambiamos el rol directamente en el store
    if (import.meta.env.DEV) {
      const currentUser = get().user;
      if (currentUser) {
        const updatedUser: User = { ...currentUser, role, creatorOnboarded: true };
        set({ user: updatedUser });
      }
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await authService.switchRole(role);
      if (response.success && response.data) {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            role: response.data.role,
            ...(response.data.creatorOnboarded !== undefined
              ? { creatorOnboarded: response.data.creatorOnboarded }
              : {}),
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          set({ user: updatedUser, isLoading: false, error: null });
        }
      } else {
        set({ isLoading: false, error: "Role switch failed" });
        throw new Error("Role switch failed");
      }
    } catch (error) {
      set({ isLoading: false, error: error instanceof Error ? error.message : "Role switch failed" });
      throw error;
    }
  },
}));
