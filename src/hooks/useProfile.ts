import { useState, useCallback } from "react";
import { profileService } from "../services/api/profile.service";
import type {
  User,
  UpdateProfileRequest,
  PasswordChangeRequest,
} from "../types/auth";
import { useAuthStore } from "../store/auth";

interface UseProfileReturn {
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: UpdateProfileRequest) => Promise<void>;
  updateProfilePicture: (file: File) => Promise<void>;
  changePassword: (data: PasswordChangeRequest) => Promise<void>;
  fetchProfile: () => Promise<void>;
}

export function useProfile(): UseProfileReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { updateUser } = useAuthStore();

  const fetchProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await profileService.getProfile();
      if (response.success && response.data) {
        updateUser(response.data);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error loading profile";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [updateUser]);

  const updateProfile = useCallback(
    async (data: UpdateProfileRequest) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await profileService.updateProfile(data);
        if (response.success && response.data) {
          updateUser(response.data);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Error updating profile";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [updateUser],
  );

  const updateProfilePicture = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await profileService.updateProfilePicture(file);
        if (response.success) {
          // Recargar el perfil completo para obtener la nueva URL de la imagen
          await fetchProfile();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error uploading profile picture";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchProfile],
  );

  const changePassword = useCallback(async (data: PasswordChangeRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      await profileService.changePassword(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error changing password";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    updateProfile,
    updateProfilePicture,
    changePassword,
    fetchProfile,
  };
}

export default useProfile;
