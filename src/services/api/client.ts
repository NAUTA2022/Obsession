import { env } from "../../config/env";
import type {
  ApiResponse,
  RequestConfig,
  HttpClientConfig,
  CustomHeaders,
  ApiError,
} from "../../types/api";

/**
 * Configuración base del cliente HTTP
 */
const API_CONFIG: HttpClientConfig = {
  baseURL: env.API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

/**
 * Cliente HTTP personalizado con interceptores
 */
class ApiClient {
  private baseURL: string;
  private defaultConfig: RequestConfig;
  private refreshInFlight: Promise<string | null> | null = null;

  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.defaultConfig = {
      headers: API_CONFIG.headers,
      timeout: API_CONFIG.timeout,
    };
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return (
      localStorage.getItem("refreshToken") ||
      localStorage.getItem(env.REFRESH_TOKEN_KEY)
    );
  }

  private persistTokens(accessToken: string, refreshToken?: string, expiresIn?: number): void {
    localStorage.setItem(env.AUTH_STORAGE_KEY, accessToken);
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem(env.REFRESH_TOKEN_KEY, refreshToken);
    }
    if (typeof expiresIn === "number") {
      localStorage.setItem("expiresIn", String(expiresIn));
      localStorage.setItem("expiresAt", String(Date.now() + expiresIn * 1000));
    }
  }

  private async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) return null;

      const json = await response.json();
      const data = json?.data ?? json;
      const newAccess: string | undefined = data?.accessToken;
      const newRefresh: string | undefined = data?.refreshToken;
      const expiresIn: number | undefined = data?.expiresIn;
      if (!newAccess) return null;

      this.persistTokens(newAccess, newRefresh, expiresIn);
      return newAccess;
    } catch {
      return null;
    }
  }

  private getOrStartRefresh(): Promise<string | null> {
    if (!this.refreshInFlight) {
      this.refreshInFlight = this.refreshAccessToken().finally(() => {
        this.refreshInFlight = null;
      });
    }
    return this.refreshInFlight;
  }

  /**
   * Obtiene el token de autenticación del localStorage
   */
  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(env.AUTH_STORAGE_KEY);
    }
    return null;
  }

  /**
   * Prepara los headers de la petición
   */
  private prepareHeaders(customHeaders?: CustomHeaders): HeadersInit {
    const headers = new Headers(this.defaultConfig.headers);

    // Agregar token de autenticación si existe
    const token = this.getAuthToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    // Agregar headers personalizados
    if (customHeaders) {
      Object.entries(customHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
    }

    return headers;
  }

  /**
   * Maneja la respuesta de la API
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      // Manejar errores HTTP
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      try {
        if (contentType?.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        }
      } catch {
        // Si no se puede parsear el error, usar el mensaje por defecto
      }

      // 401 se propaga como error etiquetado para que requestWithTimeout
      // pueda intentar refresh + retry antes de decidir invocar handleUnauthorized.
      if (response.status === 401) {
        const err = new Error(errorMessage) as Error & { status?: number; url?: string };
        err.status = 401;
        err.url = response.url;
        throw err;
      }

      throw new Error(errorMessage);
    }

    // Respuesta exitosa
    try {
      if (contentType?.includes("application/json")) {
        const data = await response.json();
        return {
          success: true,
          data: data.data || data,
          message: data.message,
          statusCode: response.status,
        };
      } else {
        // Para respuestas que no son JSON (ej: archivos)
        const data = await response.text();
        return {
          success: true,
          data: data as any,
          statusCode: response.status,
        };
      }
    } catch (error) {
      throw new Error("Error al procesar la respuesta del servidor");
    }
  }

  /**
   * Sólo actúa cuando el refresh ya falló o el 401 viene de un endpoint
   * crítico (/auth/me, /auth/refresh). Limpia todas las claves de token
   * (incluyendo las legacy escritas por el store) y dispara el evento
   * "auth:unauthorized" para que la app decida la redirección.
   */
  private handleUnauthorized(url: string = ""): void {
    if (typeof window === "undefined") return;

    const isAuthCritical =
      !url || url.includes("/auth/me") || url.includes("/auth/refresh");
    if (!isAuthCritical) return;

    localStorage.removeItem(env.AUTH_STORAGE_KEY);
    localStorage.removeItem(env.REFRESH_TOKEN_KEY);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("expiresIn");
    localStorage.removeItem("expiresAt");

    const currentPath = window.location.pathname;
    const authPages = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify-email", "/p/"];
    const isAuthPage = authPages.some((page) => currentPath.startsWith(page));

    if (!isAuthPage) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
  }

  /**
   * Realiza una petición HTTP con timeout
   */
  private async requestWithTimeout<T>(
    url: string,
    config: RequestConfig,
    isRetry = false,
  ): Promise<ApiResponse<T>> {
    const { timeout = API_CONFIG.timeout, ...requestConfig } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...requestConfig,
        credentials: "include", // Importante: Permite enviar y recibir cookies
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return await this.handleResponse<T>(response);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("The request took too long");
        }

        const status = (error as Error & { status?: number }).status;
        const isAuthEndpoint = url.includes("/auth/refresh") || url.includes("/auth/login");
        if (status === 401 && !isRetry && !isAuthEndpoint) {
          const newToken = await this.getOrStartRefresh();
          if (newToken) {
            const retryHeaders = new Headers(requestConfig.headers as HeadersInit | undefined);
            retryHeaders.set("Authorization", `Bearer ${newToken}`);
            return this.requestWithTimeout<T>(
              url,
              { ...config, headers: retryHeaders },
              true,
            );
          }
          // refresh falló → handleUnauthorized decide si redirige
          this.handleUnauthorized(url);
        }

        throw error;
      }

      throw new Error("Unknown error in the request");
    }
  }

  /**
   * Realiza una petición GET
   */
  async get<T>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.prepareHeaders(config?.headers as CustomHeaders);

    return this.requestWithTimeout<T>(url, {
      method: "GET",
      headers,
      ...config,
    });
  }

  /**
   * Realiza una petición POST
   */
  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.prepareHeaders(config?.headers as CustomHeaders);

    // Si data es FormData, no serializarlo y remover Content-Type
    let body: any;
    if (data instanceof FormData) {
      body = data;
      // Remover Content-Type para que el navegador lo establezca con boundary
      if (headers instanceof Headers) {
        headers.delete("Content-Type");
      }
    } else {
      body = data ? JSON.stringify(data) : undefined;
    }

    return this.requestWithTimeout<T>(url, {
      method: "POST",
      headers,
      body,
      ...config,
    });
  }
  /**
   * Realiza una petición PUT
   */
  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.prepareHeaders(config?.headers as CustomHeaders);

    return this.requestWithTimeout<T>(url, {
      method: "PUT",
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  /**
   * Realiza una petición PATCH
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.prepareHeaders(config?.headers as CustomHeaders);

    return this.requestWithTimeout<T>(url, {
      method: "PATCH",
      headers,
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
  }

  /**
   * Realiza una petición DELETE
   */
  async delete<T>(
    endpoint: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.prepareHeaders(config?.headers as CustomHeaders);

    return this.requestWithTimeout<T>(url, {
      method: "DELETE",
      headers,
      ...config,
    });
  }

  /**
   * Sube un archivo
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    onProgress?: (progress: number) => void,
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = this.prepareHeaders();

    // Remover Content-Type para que el navegador lo establezca automáticamente
    if (headers instanceof Headers) {
      headers.delete("Content-Type");
    }

    const formData = new FormData();
    formData.append("file", file);

    return this.requestWithTimeout<T>(url, {
      method: "POST",
      headers,
      body: formData,
    });
  }
}

// Instancia única del cliente
export const apiClient = new ApiClient();

export default apiClient;
