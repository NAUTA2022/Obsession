import { apiClient } from "./client";
import type { ApiResponse } from "../../types/api";
import type {
  User,
  UpdateProfileRequest,
  PasswordChangeRequest,
} from "../../types/auth";

export interface UpdateProfilePictureResponse {
  message: string;
  profilePictureUrl: string;
}

export class ProfileService {
  private readonly baseEndpoint = "/users";

  /**
   * Obtiene el perfil del usuario actual
   */
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.get<User>(`/auth/me`);
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error fetching profile",
      );
    }
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(
    data: UpdateProfileRequest,
  ): Promise<ApiResponse<User>> {
    try {
      const response = await apiClient.patch<User>(
        `${this.baseEndpoint}/profile`,
        data,
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error updating profile",
      );
    }
  }

  /**
   * Actualiza la imagen de perfil
   */
  async updateProfilePicture(
    file: File,
  ): Promise<ApiResponse<UpdateProfilePictureResponse>> {
    try {
      const response = await apiClient.uploadFile<UpdateProfilePictureResponse>(
        `${this.baseEndpoint}/profile/picture`,
        file,
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : "Error uploading profile picture",
      );
    }
  }

  /**
   * Cambia la contraseña del usuario
   */
  async changePassword(
    data: PasswordChangeRequest,
  ): Promise<ApiResponse<{ message: string }>> {
    try {
      const response = await apiClient.patch<{ message: string }>(
        `/auth/change-password`,
        data,
      );
      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : "Error changing password",
      );
    }
  }
}

export const profileService = new ProfileService();

export default profileService;
