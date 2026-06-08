export interface DiscoveryMeta {
  label: string;
  value: string;
}

/** Perfil normalizado para que el deck de swipe sea agnóstico del público. */
export interface DiscoveryProfile {
  id: string; // userId
  username: string;
  name: string;
  description: string;
  mainPhoto: string;
  gallery: string[];
  meta: DiscoveryMeta[];
  productCount?: number;
  priceRange?: string; // e.g. "$9 – $89"
}

export type DiscoveryAudience = 'creators' | 'sellers';
