import apiClient from './client';
import type { AvailabilityResult, AvailabilitySlot } from '../../types/bookings';

const BASE = '/bookings/availability';

export interface GetSlotsParams {
  creatorId: string;
  planId: string;
  from: string;
  to: string;
}

export const availabilityService = {
  /**
   * Obtiene los slots disponibles para una creadora y un plan en el rango dado.
   * Si Google Calendar está caído (HTTP 503), devuelve un objeto
   * `{ unavailable: true, reason: 'google_calendar_unavailable' }` en lugar
   * de propagar el error, para que la UI muestre el estado degradado.
   */
  getSlots: async ({ creatorId, planId, from, to }: GetSlotsParams): Promise<AvailabilityResult> => {
    const params = new URLSearchParams({ creatorId, planId, from, to });
    try {
      const response = await apiClient.get<AvailabilitySlot[]>(`${BASE}?${params.toString()}`);
      return response.data ?? [];
    } catch (error) {
      const status = (error as Error & { status?: number }).status;
      if (status === 503) {
        return { unavailable: true, reason: 'google_calendar_unavailable' };
      }
      throw error;
    }
  },
};

export default availabilityService;
