import apiClient from './client';
import type { CreatorWorkingHours, CreatorWorkingHoursRule } from '../../types/bookings';

const BASE = '/creator-working-hours';

export interface UpsertWorkingHoursInput {
  timezone: string;
  rules: CreatorWorkingHoursRule[];
  slotGranularityMinutes?: number;
  minNoticeMinutes?: number;
  maxAdvanceDays?: number;
}

export const workingHoursService = {
  /**
   * Devuelve las working hours de la creadora autenticada.
   */
  getMine: async (): Promise<CreatorWorkingHours | null> => {
    const response = await apiClient.get<CreatorWorkingHours>(`${BASE}/me`);
    return response.data ?? null;
  },

  /**
   * Devuelve las working hours públicas de una creadora.
   */
  getByCreator: async (creatorId: string): Promise<CreatorWorkingHours | null> => {
    const response = await apiClient.get<CreatorWorkingHours>(`${BASE}/${creatorId}`);
    return response.data ?? null;
  },

  /**
   * Crea o reemplaza las working hours de la creadora autenticada.
   */
  upsert: async (input: UpsertWorkingHoursInput): Promise<CreatorWorkingHours> => {
    const response = await apiClient.put<CreatorWorkingHours>(BASE, input);
    return response.data!;
  },
};

export default workingHoursService;
