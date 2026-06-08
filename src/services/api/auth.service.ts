import { apiClient } from "./client";
import type { ApiResponse } from "../../types/api";
import type { AuthResponse } from "../../types/auth";

export interface TouchAppStatus {
  linked: boolean;
  username: string | null;
  /** true si el access_token todavía sirve (o pudo refrescarse) */
  valid?: boolean;
  /** indica si la vinculación tiene refresh_token (legacy = false) */
  hasRefreshToken?: boolean;
  reason?: 'expired' | 'no-token';
}

export interface ThirdwebVerifyRequest {
  thirdwebUserId: string;
  walletAddress: string;
  email?: string;
  chainId?: number;
}

export class AuthService {
  private readonly baseEndpoint = "/auth";

  async verifyThirdweb(data: ThirdwebVerifyRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      return await apiClient.post<AuthResponse>(
        `${this.baseEndpoint}/thirdweb/verify`,
        data,
      );
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Error al verificar wallet");
    }
  }

  async getMe(): Promise<ApiResponse<any>> {
    try {
      return await apiClient.get<any>(`${this.baseEndpoint}/me`);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Error fetching user profile");
    }
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post(`${this.baseEndpoint}/logout`, {});
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  async getTouchAppStatus(): Promise<ApiResponse<TouchAppStatus>> {
    return apiClient.get<TouchAppStatus>(`${this.baseEndpoint}/touchapp-status`);
  }

  async switchRole(role: string): Promise<ApiResponse<any>> {
    try {
      return await apiClient.post<any>('/users/switch-role', { role });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Error switching role");
    }
  }
}

export const authService = new AuthService();
export default authService;
