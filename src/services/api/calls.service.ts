import apiClient from './client';

export interface LiveKitCredentials {
  url: string;
  token: string;
  room: string;
  identity: string;
  expiresIn: number;
  // Campos opcionales esperados cuando el token se solicita para un booking.
  // TODO(backend): el endpoint POST /calls/token debe devolver `bookingId` y `effectiveEndAt`
  // (ISO string del scheduledEnd + extensionsTotalSeconds) cuando se pase bookingId, para
  // que el frontend pueda mostrar el contador exacto sin pedir el booking adicionalmente.
  bookingId?: string;
  effectiveEndAt?: string;
}

export type FetchTokenArg = string | { conversationId: string } | { bookingId: string };

export const callsService = {
  /**
   * Pide credenciales para LiveKit. Acepta:
   * - string  → conversationId (compat hacia atrás con `getToken`)
   * - { conversationId }
   * - { bookingId }
   */
  fetchToken: async (arg: FetchTokenArg): Promise<LiveKitCredentials> => {
    const body =
      typeof arg === 'string'
        ? { conversationId: arg }
        : arg;
    const response = await apiClient.post<LiveKitCredentials>('/calls/token', body);
    return response.data!;
  },

  // Compat: mantener la firma antigua para no romper llamadas existentes.
  getToken: async (conversationId: string): Promise<LiveKitCredentials> => {
    const response = await apiClient.post<LiveKitCredentials>('/calls/token', { conversationId });
    return response.data!;
  },
};
