export type PricingPlanTier = 'basic' | 'mid' | 'premium';
export type PricingPlanStatus = 'draft' | 'active';

export interface PricingPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  originalPrice: number | null;
  tier: PricingPlanTier;
  features: string[];
  isFeatured: boolean;
  accentColor: string | null;
  status: PricingPlanStatus;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePricingPlanDto {
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  tier: PricingPlanTier;
  features?: string[];
  isFeatured?: boolean;
  accentColor?: string;
}

export type UpdatePricingPlanDto = Partial<CreatePricingPlanDto>;
