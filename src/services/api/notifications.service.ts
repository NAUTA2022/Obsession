import apiClient from './client';

export type NotificationType =
  | 'collaboration_request'
  | 'collaboration_accepted'
  | 'collaboration_rejected'
  | 'creator_call_setup';

export interface NotificationData {
  fromUserId?: string;
  fromName?: string;
  fromPhoto?: string | null;
  conversationId?: string;
  /** Ruta a la que navega la acción de la notificación (notifs locales/del sistema). */
  actionRoute?: string;
  /** Texto del botón de acción. */
  actionLabel?: string;
  [key: string]: any;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  data: NotificationData;
  read: boolean;
  createdAt: string;
}

export const notificationsService = {
  list: async (page = 1): Promise<AppNotification[]> => {
    const res = await apiClient.get<{ data: AppNotification[] }>(`/notifications?page=${page}`);
    return res.data?.data ?? [];
  },

  unreadCount: async (): Promise<number> => {
    const res = await apiClient.get<{ count: number }>(`/notifications/unread-count`);
    return res.data?.count ?? 0;
  },

  markRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await apiClient.patch(`/notifications/read-all`);
  },
};

export default notificationsService;
