import apiClient from './client';
import type { GoogleCalendarStatus } from '../../types/bookings';

const BASE = '/integrations/google';

export interface UpdateGoogleCalendarInput {
  calendarId: string;
}

export const googleCalendarService = {
  /**
   * Devuelve la URL de OAuth para que la creadora conecte su Google Calendar.
   */
  getOAuthUrl: async (): Promise<{ url: string }> => {
    const response = await apiClient.get<{ url: string }>(`${BASE}/oauth-url`);
    return response.data!;
  },

  /**
   * Devuelve el estado actual de la integración Google Calendar
   * de la creadora autenticada.
   */
  getMine: async (): Promise<GoogleCalendarStatus> => {
    const response = await apiClient.get<GoogleCalendarStatus>(`${BASE}/me`);
    return response.data!;
  },

  /**
   * Actualiza el calendario seleccionado para sincronizar bookings.
   */
  update: async (input: UpdateGoogleCalendarInput): Promise<GoogleCalendarStatus> => {
    const response = await apiClient.patch<GoogleCalendarStatus>(`${BASE}/me`, input);
    return response.data!;
  },

  /**
   * Desconecta la integración con Google Calendar.
   */
  disconnect: async (): Promise<void> => {
    await apiClient.post(`${BASE}/disconnect`);
  },
};

export default googleCalendarService;
