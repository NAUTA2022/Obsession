import apiClient from './client';
import type { CallMode, CallPlan } from '../../types/bookings';

const BASE = '/call-plans';

export interface CreateCallPlanInput {
  mode: CallMode;
  durationMinutes: number;
  priceCents: number;
  currency?: string;
  title?: string;
  description?: string;
  isFeatured?: boolean;
}

export type UpdateCallPlanInput = Partial<CreateCallPlanInput> & { isActive?: boolean };

export const callPlansService = {
  /**
   * Lista los planes públicos activos de una creadora, opcionalmente filtrados por modo.
   */
  listByCreator: async (creatorId: string, mode?: CallMode): Promise<CallPlan[]> => {
    const params = new URLSearchParams({ creatorId });
    if (mode) params.append('mode', mode);
    const response = await apiClient.get<CallPlan[]>(`${BASE}?${params.toString()}`);
    return response.data ?? [];
  },

  /**
   * Lista los planes de la creadora autenticada (incluye inactivos).
   */
  listMine: async (): Promise<CallPlan[]> => {
    const response = await apiClient.get<CallPlan[]>(`${BASE}/me`);
    return response.data ?? [];
  },

  /**
   * Crea un nuevo plan de llamada para la creadora autenticada.
   */
  create: async (input: CreateCallPlanInput): Promise<CallPlan> => {
    const response = await apiClient.post<CallPlan>(BASE, input);
    return response.data!;
  },

  /**
   * Actualiza parcialmente un plan existente.
   */
  update: async (id: string, patch: UpdateCallPlanInput): Promise<CallPlan> => {
    const response = await apiClient.patch<CallPlan>(`${BASE}/${id}`, patch);
    return response.data!;
  },

  /**
   * Elimina (o desactiva) un plan de llamada.
   */
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};

export default callPlansService;
