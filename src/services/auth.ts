import { apiService } from './api';
import type { User, UserRole } from '../types/auth';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    available_roles: UserRole[];
    expires_at: string;
  };
}

export interface SwitchRoleRequest {
  role: UserRole;
}

export interface SwitchRoleResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    expires_at: string;
  };
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    return apiService.post<LoginResponse>('/auth/login', credentials);
  }

  async switchRole(role: UserRole): Promise<SwitchRoleResponse> {
    return apiService.post<SwitchRoleResponse>('/auth/switch-role', { role });
  }

  async logout(): Promise<void> {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        await apiService.post('/auth/logout', { token });
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }
  }

  async getAvailableRoles(): Promise<UserRole[]> {
    return apiService.get<UserRole[]>('/auth/available-roles');
  }

  // Helper methods for token management
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
