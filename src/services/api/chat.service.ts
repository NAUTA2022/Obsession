import apiClient from './client';
import type { ChatConversation, ChatMessage, GuestInitResponse } from '../../types/chat-native';
import { GUEST_SESSION_KEY, GUEST_USER_ID_KEY } from '../../types/chat-native';

const BASE = '/chat';

export const chatService = {
  /**
   * Inicializar sesión guest. Envía el guestSessionId guardado en
   * localStorage si ya existe uno, para recuperar la conversación previa.
   */
  initGuest: async (
    creatorUsername: string,
    delegated?: { delegatedCreatorName: string; delegatedCreatorPhoto?: string; delegatedCreatorId?: number; delegatedReferralCode?: string; delegatedCollaborationId?: number },
  ): Promise<GuestInitResponse> => {
    const existingSessionId = localStorage.getItem(GUEST_SESSION_KEY);
    const response = await apiClient.post<GuestInitResponse>(`${BASE}/guest/init`, {
      creatorUsername,
      ...(existingSessionId ? { guestSessionId: existingSessionId } : {}),
      ...(delegated || {}),
    });
    const data = response.data!;
    if (data.guestUserId) {
      localStorage.setItem(GUEST_USER_ID_KEY, data.guestUserId);
    }
    return data;
  },

  /**
   * Iniciar conversación como usuario registrado (requiere JWT).
   * Devuelve { conversationId } sin crear un guest.
   */
  startConversation: async (
    creatorUsername: string,
    delegated?: { delegatedCreatorName?: string; delegatedCreatorPhoto?: string; delegatedCreatorId?: number; delegatedReferralCode?: string; delegatedCollaborationId?: number },
  ): Promise<{ conversationId: string }> => {
    const response = await apiClient.post<{ conversationId: string }>(
      `${BASE}/conversations/start`,
      { creatorUsername, ...(delegated || {}) },
    );
    return response.data!;
  },

  /**
   * Inicia (o recupera) una conversación con otro usuario por id, sin asumir roles.
   * Usado por la vista de descubrimiento (swipe) y los matches.
   */
  startConversationWith: async (targetUserId: string): Promise<{ conversationId: string }> => {
    const response = await apiClient.post<{ conversationId: string }>(
      `${BASE}/conversations/start-with`,
      { targetUserId },
    );
    return response.data!;
  },

  /**
   * Cargar la bandeja de entrada de la creadora (requiere JWT).
   */
  getInbox: async (): Promise<ChatConversation[]> => {
    const response = await apiClient.get<ChatConversation[]>(`${BASE}/inbox`);
    return response.data ?? [];
  },

  /**
   * Cargar la bandeja de entrada del cliente (requiere JWT).
   */
  getClientInbox: async (): Promise<ChatConversation[]> => {
    const response = await apiClient.get<ChatConversation[]>(`${BASE}/client/inbox`);
    return response.data ?? [];
  },

  /**
   * Cargar historial de mensajes (usuario autenticado con JWT).
   */
  getMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(
      `${BASE}/conversations/${conversationId}/messages`,
    );
    return response.data ?? [];
  },

  /**
   * Cargar historial de mensajes para visitantes anónimos.
   */
  getGuestMessages: async (conversationId: string): Promise<ChatMessage[]> => {
    const guestSessionId = localStorage.getItem(GUEST_SESSION_KEY);
    if (!guestSessionId) return [];
    const response = await apiClient.get<ChatMessage[]>(
      `${BASE}/guest/conversations/${conversationId}/messages?guestSessionId=${guestSessionId}`,
    );
    return response.data ?? [];
  },

  /**
   * Obtener conversaciones filtradas por creadora delegada (work teams).
   */
  getDelegatedConversations: async (creatorName: string): Promise<ChatConversation[]> => {
    const response = await apiClient.get<ChatConversation[]>(
      `${BASE}/delegated/${encodeURIComponent(creatorName)}`,
    );
    return response.data ?? [];
  },

  /**
   * Activa o desactiva el autopilot de IA para una conversación específica.
   */
  toggleAi: async (
    conversationId: string,
    aiEnabled: boolean,
    contextMode: 'none' | 'current' | 'external' = 'none',
    context?: string | null,
  ): Promise<any> => {
    const response = await apiClient.patch(`${BASE}/conversations/${conversationId}/ai`, {
      aiEnabled,
      contextMode,
      context: context ?? null,
    });
    return response.data;
  },

  /**
   * Envía un producto propio como mensaje bloqueado en el chat.
   */
  sendProductAsGift: async (
    productId: string,
    conversationId: string,
    senderId: string,
  ): Promise<any> => {
    const response = await apiClient.post(`${BASE}/monetization/send-product`, {
      productId,
      conversationId,
      senderId,
    });
    return response.data;
  },

  /**
   * Sube un archivo (imagen, video o documento) al chat.
   * El backend lo guarda en S3 y emite el mensaje por WebSocket automáticamente.
   */
  uploadChatFile: async (
    conversationId: string,
    file: File,
    guestSessionId?: string,
  ): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    if (guestSessionId) {
      formData.append('guestSessionId', guestSessionId);
      await apiClient.post(
        `${BASE}/guest/conversations/${conversationId}/upload`,
        formData,
      );
    } else {
      await apiClient.post(
        `${BASE}/conversations/${conversationId}/upload`,
        formData,
      );
    }

  },

  /**
   * Envía un producto externo (TouchApp) como mensaje bloqueado.
   */
  sendExternalProductAsGift: async (
    conversationId: string,
    senderId: string,
    title: string,
    price: number,
    thumbnailUrl: string,
    blurredThumbnailUrl?: string,
    paymentUrl?: string,
  ): Promise<any> => {
    const response = await apiClient.post(`${BASE}/monetization/send-external-product`, {
      conversationId,
      senderId,
      title,
      price,
      thumbnailUrl,
      blurredThumbnailUrl: blurredThumbnailUrl || thumbnailUrl,
      paymentUrl: paymentUrl || '',
    });
    return response.data;
  },

  /**
   * Desbloquea un mensaje de pago. Devuelve la mediaUrl real.
   */
  unlockMessage: async (
    messageId: string,
    userId: string,
    transactionId: string,
  ): Promise<string> => {
    const response = await apiClient.post<string>(`${BASE}/monetization/unlock`, {
      messageId,
      userId,
      transactionId,
    });
    return response.data!;
  },
};

export default chatService;
