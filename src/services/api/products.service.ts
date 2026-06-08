import { apiClient } from "./client";
import type { ApiResponse } from "../../types/api";

export enum ProductType {
  PACKAGE = "package",
  SINGLE = "single",
  SERVICE = "service",
}

export enum ProductStatus {
  DRAFT = "draft",
  ACTIVE = "active",
  ARCHIVED = "archived",
}

export enum FileType {
  IMAGE = "image",
  VIDEO = "video",
  DOCUMENT = "document",
  AUDIO = "audio",
}

export interface ProductAnalytics {
  viewsTotal: number;
  viewsTrend: number;       // % vs previous period
  salesTotal: number;
  salesTrend: number;
  revenueTotal: number;
  revenueTrend: number;
  conversionRate: number;
  conversionTrend: number;
  chartData: {
    dates: string[];
    views: number[];
    sales: number[];
    revenue: number[];
  };
  topCountries: { country: string; count: number; flag: string }[];
  topSources: { source: string; count: number; pct: number }[];
}

export interface ProductBuyer {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  profilePicture?: string;
  purchaseDate: string;
  amount: number;
  couponUsed?: string;
}

export interface SendCouponDto {
  userIds: string[];
  code: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  expiresAt?: string;
  message?: string;
}

export interface ProductFile {
  id: string;
  fileUrl: string;
  fileType: FileType;
  fileName: string;
  fileSize: number;
  order?: number;
  mimeType?: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  type: ProductType;
  status: ProductStatus;
  thumbnailUrl: string;
  photoCount?: number;
  videoCount?: number;
  packageContents?: string;
  totalSales: number;
  views: number;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  files?: ProductFile[];
  creator?: {
    id: string;
    displayName: string;
    profilePicture: string;
  };
}

export interface CreateProductDto {
  title: string;
  description: string;
  price: number;
  type: ProductType;
  status?: ProductStatus;
  thumbnailUrl?: string;
  photoCount?: number;
  videoCount?: number;
  packageContents?: string;
}

export interface UpdateProductDto {
  title?: string;
  description?: string;
  price?: number;
  type?: ProductType;
  status?: ProductStatus;
  thumbnailUrl?: string;
  photoCount?: number;
  videoCount?: number;
  packageContents?: string;
}

export class ProductsService {
  protected readonly baseEndpoint = "/products";

  async getAllProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await apiClient.get<Product[]>(this.baseEndpoint);
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error fetching products",
      );
    }
  }

  async getProductsByCreator(
    creatorId: string,
  ): Promise<ApiResponse<Product[]>> {
    try {
      const response = await apiClient.get<Product[]>(
        `${this.baseEndpoint}/creator/${creatorId}`,
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Error fetching creator products",
      );
    }
  }

  async getProductById(productId: string): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.get<Product>(
        `${this.baseEndpoint}/${productId}`,
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error fetching product",
      );
    }
  }

  async getMyProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await apiClient.get<Product[]>(
        `${this.baseEndpoint}/my-products`,
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error fetching my products",
      );
    }
  }
}

export class ProductsServiceExtended extends ProductsService {
  async createProduct(data: CreateProductDto): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.post<Product>(this.baseEndpoint, data);
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error creating product",
      );
    }
  }

  async updateProduct(
    productId: string,
    data: UpdateProductDto,
  ): Promise<ApiResponse<Product>> {
    try {
      const response = await apiClient.put<Product>(
        `${this.baseEndpoint}/${productId}`,
        data,
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error updating product",
      );
    }
  }

  async deleteProduct(productId: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(
        `${this.baseEndpoint}/${productId}`,
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error deleting product",
      );
    }
  }

  async uploadProductFile(
    productId: string,
    file: File,
    fileType: FileType,
  ): Promise<ApiResponse<ProductFile>> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileType", fileType);

      const response = await apiClient.post<ProductFile>(
        `${this.baseEndpoint}/${productId}/upload`,
        formData,
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error uploading file",
      );
    }
  }

  async deleteProductFile(
    productId: string,
    fileId: string,
  ): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete<void>(
        `${this.baseEndpoint}/${productId}/files/${fileId}`,
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error deleting file",
      );
    }
  }

  async getProductAnalytics(productId: string): Promise<ApiResponse<ProductAnalytics>> {
    try {
      const response = await apiClient.get<ProductAnalytics>(
        `${this.baseEndpoint}/${productId}/analytics`,
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error fetching product analytics",
      );
    }
  }

  async getProductBuyers(
    productId: string,
    page = 1,
    limit = 20,
  ): Promise<ApiResponse<{ buyers: ProductBuyer[]; total: number }>> {
    try {
      const response = await apiClient.get<{ buyers: ProductBuyer[]; total: number }>(
        `${this.baseEndpoint}/${productId}/buyers?page=${page}&limit=${limit}`,
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error fetching product buyers",
      );
    }
  }

  async sendProductCoupon(
    productId: string,
    dto: SendCouponDto,
  ): Promise<ApiResponse<{ sent: number }>> {
    try {
      const response = await apiClient.post<{ sent: number }>(
        `${this.baseEndpoint}/${productId}/send-coupon`,
        dto,
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error sending coupon",
      );
    }
  }

  async uploadThumbnail(file: File): Promise<ApiResponse<{ url: string }>> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post<{ url: string }>(
        `${this.baseEndpoint}/upload-thumbnail`,
        formData,
      );
      return response;
    } catch (error) {
      console.error("Error uploading thumbnail:", error);
      throw new Error(
        error instanceof Error ? error.message : "Error uploading thumbnail",
      );
    }
  }
}

export const productsService = new ProductsService();
export const productsServiceExtended = new ProductsServiceExtended();
