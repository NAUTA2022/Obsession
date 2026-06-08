import apiClient from './client';

const BASE = '/sellers';

export interface RegisterSellerInput {
  nationality: string; // ISO country code, e.g. 'US'
  state: string;
  languages: string[]; // e.g. ['es', 'en']
  collaborationSlots: number;
  commissionPercentage: number; // 0..20
  description?: string;
  productCategories: string[]; // 1..5
}

export interface SellerProfile {
  id: string;
  userId: string;
  nationality: string;
  state: string;
  languages: string[];
  collaborationSlots: number;
  commissionPercentage: number;
  description?: string;
  productCategories: string[];
  isActive: boolean;
}

export interface RegisterSellerResponse {
  message: string;
  seller: SellerProfile;
  role: string;
}

export interface SellerListItem {
  userId: string;
  username: string;
  displayName: string;
  profilePicture: string | null;
  bio: string | null;
  location: string | null;
  nationality: string;
  state: string;
  languages: string[];
  productCategories: string[];
  commissionPercentage: number;
  collaborationSlots: number;
  description: string | null;
}

export interface SellerListFilters {
  productCategory?: string;
  nationality?: string;
  search?: string;
}

export const sellerService = {
  /**
   * Lista vendedores activos para la vista de descubrimiento.
   */
  listSellers: async (filters?: SellerListFilters): Promise<SellerListItem[]> => {
    const params = new URLSearchParams();
    if (filters?.productCategory) params.append('productCategory', filters.productCategory);
    if (filters?.nationality) params.append('nationality', filters.nationality);
    if (filters?.search) params.append('search', filters.search);
    const qs = params.toString();
    const response = await apiClient.get<{ data: SellerListItem[] }>(
      `${BASE}${qs ? `?${qs}` : ''}`,
    );
    return response.data?.data ?? [];
  },

  /**
   * Registra/actualiza el perfil de vendedor y cambia el rol del usuario a 'vendedor'.
   */
  register: async (input: RegisterSellerInput): Promise<RegisterSellerResponse> => {
    const response = await apiClient.post<RegisterSellerResponse>(`${BASE}/register`, input);
    return response.data!;
  },

  /**
   * Devuelve el perfil de vendedor del usuario autenticado, o null si aún no existe.
   */
  getMine: async (): Promise<SellerProfile | null> => {
    try {
      const response = await apiClient.get<SellerProfile>(`${BASE}/me`);
      return response.data ?? null;
    } catch {
      return null;
    }
  },
};

export default sellerService;
