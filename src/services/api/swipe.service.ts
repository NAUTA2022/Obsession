import apiClient from './client';
import type { Creator } from './creators.service';

const BASE = '/swipes';

export type SwipeDirection = 'like' | 'pass';

export interface SwipeResult {
  match: boolean;
  conversationId?: string;
}

export interface MatchUser {
  id: string;
  username: string;
  displayName: string;
  profilePicture: string | null;
  bio: string | null;
  role: string;
}

export const swipeService = {
  /**
   * Registra un swipe (like/pass). Si es like mutuo, devuelve match + conversationId.
   */
  swipe: async (targetId: string, direction: SwipeDirection): Promise<SwipeResult> => {
    const response = await apiClient.post<SwipeResult>(BASE, { targetId, direction });
    return response.data ?? { match: false };
  },

  /**
   * IDs ya swipeados por el usuario (para excluirlos del deck).
   */
  getSwipedIds: async (): Promise<string[]> => {
    const response = await apiClient.get<{ targetIds: string[] }>(`${BASE}/mine`);
    return response.data?.targetIds ?? [];
  },

  /**
   * Usuarios con match mutuo.
   */
  getMatches: async (): Promise<MatchUser[]> => {
    const response = await apiClient.get<{ data: MatchUser[] }>(`${BASE}/matches`);
    return response.data?.data ?? [];
  },

  /**
   * Creadoras a las que di "me interesa" (guardadas como me gustan).
   */
  getLikedCreators: async (): Promise<Creator[]> => {
    const response = await apiClient.get<{ data: Creator[] }>(`${BASE}/liked`);
    return response.data?.data ?? [];
  },

  /**
   * Creadoras que descarté.
   */
  getPassedCreators: async (): Promise<Creator[]> => {
    const response = await apiClient.get<{ data: Creator[] }>(`${BASE}/passed`);
    return response.data?.data ?? [];
  },
};

export default swipeService;
