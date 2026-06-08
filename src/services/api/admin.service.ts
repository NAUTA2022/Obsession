import { apiClient } from './client';
import type { ApiResponse } from '../../types/api';
import type { User, UserRole } from '../../types/auth';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface AdminUser extends User {
  status: UserStatus;
  deletedAt?: string | null;
  lastLogin?: string | null;
}

export interface PaginatedUsers {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  status?: UserStatus;
  role?: UserRole;
  search?: string;
  includeDeleted?: boolean;
}

export type AuditAction =
  | 'ROLE_CHANGED'
  | 'STATUS_CHANGED'
  | 'PASSWORD_RESET'
  | 'FORCE_LOGOUT'
  | 'USER_DELETED'
  | 'USER_RESTORED';

export interface AuditEntry {
  id: string;
  action: AuditAction;
  actorId: string;
  actor: { id: string; email: string; username: string } | null;
  targetUserId: string | null;
  targetUser: { id: string; email: string; username: string } | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface PaginatedAudit {
  data: AuditEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ListAuditParams {
  page?: number;
  limit?: number;
  actorId?: string;
  targetUserId?: string;
  action?: AuditAction;
  from?: string;
  to?: string;
}

const BASE = '/admin/users';

function toQuery(params: Record<string, unknown> | undefined): string {
  if (!params) return '';
  const qs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return qs ? `?${qs}` : '';
}

class AdminService {
  listUsers(params?: ListUsersParams): Promise<ApiResponse<PaginatedUsers>> {
    return apiClient.get<PaginatedUsers>(`${BASE}${toQuery(params)}`);
  }

  getUser(id: string): Promise<ApiResponse<AdminUser>> {
    return apiClient.get<AdminUser>(`${BASE}/${id}`);
  }

  changeRole(id: string, role: UserRole): Promise<ApiResponse<AdminUser>> {
    return apiClient.patch<AdminUser>(`${BASE}/${id}/role`, { role });
  }

  changeStatus(id: string, status: UserStatus): Promise<ApiResponse<AdminUser>> {
    return apiClient.patch<AdminUser>(`${BASE}/${id}/status`, { status });
  }

  resetPassword(id: string): Promise<ApiResponse<{ token: string; expiresAt: string }>> {
    return apiClient.post<{ token: string; expiresAt: string }>(`${BASE}/${id}/reset-password`);
  }

  forceLogout(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`${BASE}/${id}/force-logout`);
  }

  softDelete(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.delete<{ success: boolean }>(`${BASE}/${id}`);
  }

  restore(id: string): Promise<ApiResponse<{ success: boolean }>> {
    return apiClient.post<{ success: boolean }>(`${BASE}/${id}/restore`);
  }

  listAudit(params?: ListAuditParams): Promise<ApiResponse<PaginatedAudit>> {
    return apiClient.get<PaginatedAudit>(`/admin/audit-log${toQuery(params)}`);
  }
}

export const adminService = new AdminService();
