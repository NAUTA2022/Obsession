import { apiClient } from './client';
import type { ApiResponse } from '../../types/api';
import type { PricingPlan, CreatePricingPlanDto, UpdatePricingPlanDto } from '../../types/pricing';

const BASE = '/pricing-plans';

class PricingPlansService {
  async getActive(): Promise<ApiResponse<PricingPlan[]>> {
    try {
      return await apiClient.get<PricingPlan[]>(BASE);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching active pricing plans');
    }
  }

  async getAll(): Promise<ApiResponse<PricingPlan[]>> {
    try {
      return await apiClient.get<PricingPlan[]>(`${BASE}/admin`);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error fetching pricing plans');
    }
  }

  async create(dto: CreatePricingPlanDto): Promise<ApiResponse<PricingPlan>> {
    try {
      return await apiClient.post<PricingPlan>(BASE, dto);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error creating pricing plan');
    }
  }

  async update(id: string, dto: UpdatePricingPlanDto): Promise<ApiResponse<PricingPlan>> {
    try {
      return await apiClient.patch<PricingPlan>(`${BASE}/${id}`, dto);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error updating pricing plan');
    }
  }

  async activate(id: string): Promise<ApiResponse<PricingPlan>> {
    try {
      return await apiClient.patch<PricingPlan>(`${BASE}/${id}/activate`, {});
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error activating pricing plan');
    }
  }

  async deactivate(id: string): Promise<ApiResponse<PricingPlan>> {
    try {
      return await apiClient.patch<PricingPlan>(`${BASE}/${id}/deactivate`, {});
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error deactivating pricing plan');
    }
  }

  async remove(id: string): Promise<ApiResponse<void>> {
    try {
      return await apiClient.delete<void>(`${BASE}/${id}`);
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Error deleting pricing plan');
    }
  }
}

export const pricingPlansService = new PricingPlansService();
