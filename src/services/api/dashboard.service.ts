import { apiClient } from "./client";
import type { ApiResponse } from "../../types/api";

export interface ProgressStats {
  conversations: number;
  salesAchieved: number;
  agentSales: number;
}

export interface PerformanceData {
  categories: string[];
  data: number[];
}

export interface ProductStats {
  id: string;
  name: string;
  type: string;
  productImage: string;
  creatorAvatar: string;
  creatorName: string;
  description: string;
  price: number;
  totalSales: number;
}

export interface SaleItem {
  items: string;
  precio: string;
  pagoVendedor: string;
  pagoAgente: string;
  pagoObsesion: string;
  ingresoFinal: string;
  date: string;
}

export interface Competitor {
  id: string;
  competitorImage: string;
  creatorAvatar: string;
  creatorName: string;
  lastMonthEarnings: number;
}

export interface TopCreator {
  id: string;
  rank: number;
  avatar: string;
  name: string;
  totalEarnings: number;
}

export interface DashboardStats {
  progress: ProgressStats;
  performance: PerformanceData;
  successfulProducts: ProductStats[];
  latestSales: SaleItem[];
  competitors: Competitor[];
  topCreators: TopCreator[];
}

export class DashboardService {
  private readonly baseEndpoint = "/dashboard";

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      const response = await apiClient.get<DashboardStats>(
        `${this.baseEndpoint}/stats`,
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error fetching dashboard stats",
      );
    }
  }
}

export const dashboardService = new DashboardService();

export default dashboardService;
