import { apiClient } from "./client";
import type { ApiResponse } from "../../types/api";

export interface GalleryImage {
  id: string;
  imageUrl: string;
  title: string | null;
  description: string | null;
  views: number;
  likes: number;
  createdAt?: string;
}

export interface Creator {
  id: string;
  username: string;
  displayName: string;
  profilePicture: string | null;
  bio: string | null;
  location: string | null;
  contentType: string | null;
  totalEarnings: number;
  createdAt: string;
  gallery?: GalleryImage[];
}

export interface CreatorFilters {
  location?: string;
  contentType?: string;
  search?: string;
}

export class CreatorsService {
  private readonly baseEndpoint = "/users/creators";

  /**
   * Obtiene todas las creadoras con filtros opcionales
   */
  async getAllCreators(filters?: CreatorFilters): Promise<ApiResponse<{ data: Creator[] }>> {
    try {
      const params = new URLSearchParams();
      if (filters?.location) params.append('location', filters.location);
      if (filters?.contentType) params.append('contentType', filters.contentType);
      if (filters?.search) params.append('search', filters.search);
      
      const queryString = params.toString();
      const endpoint = queryString ? `${this.baseEndpoint}?${queryString}` : this.baseEndpoint;
      
      const response = await apiClient.get<{ data: Creator[] }>(endpoint);
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error fetching creators",
      );
    }
  }

  /**
   * Obtiene las top creadoras por ganancias
   */
  async getTopCreators(limit: number = 10): Promise<ApiResponse<{ data: Creator[] }>> {
    try {
      const response = await apiClient.get<{ data: Creator[] }>(
        `${this.baseEndpoint}/top?limit=${limit}`,
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error fetching top creators",
      );
    }
  }

  /**
   * Obtiene el perfil público de una creadora
   */
  async getCreatorProfile(creatorId: string): Promise<ApiResponse<Creator>> {
    try {
      const response = await apiClient.get<Creator>(
        `${this.baseEndpoint}/${creatorId}/profile`,
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error fetching creator profile",
      );
    }
  }

  /**
   * Obtiene el perfil público de una creadora por username (sin auth)
   */
  async getPublicProfile(username: string): Promise<ApiResponse<Creator>> {
    try {
      const response = await apiClient.get<Creator>(
        `${this.baseEndpoint}/by-username/${username}`,
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error fetching creator profile",
      );
    }
  }

  /**
   * Obtiene la galería de una creadora
   */
  async getCreatorGallery(creatorId: string): Promise<ApiResponse<{ images: GalleryImage[] }>> {
    try {
      const response = await apiClient.get<{ images: GalleryImage[] }>(
        `${this.baseEndpoint}/${creatorId}/gallery`,
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error fetching creator gallery",
      );
    }
  }
}

export const creatorsService = new CreatorsService();
export default creatorsService;
