import { apiClient } from "./client";
import type { Product } from "./products.service";

export interface TouchAppProduct extends Omit<Product, 'thumbnailUrl'> {
  thumbnailUrl: string | null;
  source: 'touchapp';
}

export class TouchAppService {
  async getTouchAppProducts(): Promise<TouchAppProduct[]> {
    const response = await apiClient.get<TouchAppProduct[]>('/products/touchapp');
    if (response.success && response.data) {
      return response.data;
    }
    return [];
  }
}

export const touchAppService = new TouchAppService();
