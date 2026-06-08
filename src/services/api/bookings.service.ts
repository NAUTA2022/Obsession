import apiClient from './client';
import type { Booking, BookingExtension } from '../../types/bookings';

const BASE = '/bookings';

export interface CreateBookingInput {
  callPlanId: string;
  scheduledStart: string;
  /** Ruta relativa a la que volver si el usuario cancela el pago en Stripe. */
  cancelPath?: string;
}

export interface CreateBookingResponse {
  booking: Booking;
  /** URL de Stripe Checkout a la que redirigir para pagar. */
  checkoutUrl: string | null;
}

export interface ListMineParams {
  as: 'client' | 'creator';
  filter?: 'upcoming' | 'past';
}

export interface ExtendBookingResponse {
  extension: BookingExtension;
  clientSecret: string;
}

export type ExtendMinutes = 5 | 10 | 15;

export const bookingsService = {
  /**
   * Crea un booking en estado pending_payment y devuelve la URL de Stripe
   * Checkout a la que redirigir para completar el pago.
   */
  create: async (input: CreateBookingInput): Promise<CreateBookingResponse> => {
    const response = await apiClient.post<CreateBookingResponse>(BASE, input);
    return response.data!;
  },

  /**
   * Lista los bookings del usuario autenticado, filtrados por rol
   * (client | creator) y por ventana temporal (upcoming | past).
   */
  listMine: async ({ as, filter }: ListMineParams): Promise<Booking[]> => {
    const params = new URLSearchParams({ as });
    if (filter) params.set('filter', filter);
    const response = await apiClient.get<Booking[]>(`${BASE}/mine?${params.toString()}`);
    return response.data ?? [];
  },

  /**
   * Cancela un booking. El backend aplicará la política de reembolso.
   */
  cancel: async (id: string): Promise<Booking> => {
    const response = await apiClient.post<Booking>(`${BASE}/${id}/cancel`);
    return response.data!;
  },

  /**
   * Solicita una extensión de la llamada en curso (5, 10 o 15 minutos).
   * Devuelve el clientSecret de Stripe para cobrar la extensión.
   */
  extend: async (id: string, additionalMinutes: ExtendMinutes): Promise<ExtendBookingResponse> => {
    const response = await apiClient.post<ExtendBookingResponse>(`${BASE}/${id}/extend`, {
      additionalMinutes,
    });
    return response.data!;
  },
};

export default bookingsService;
