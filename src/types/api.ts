/**
 * Tipos para las respuestas de la API
 */

/**
 * Respuesta estándar de la API
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  statusCode?: number
}

/**
 * Configuración para las peticiones HTTP
 */
export interface RequestConfig extends RequestInit {
  timeout?: number
  retries?: number
  retryDelay?: number
}

/**
 * Configuración de paginación
 */
export interface PaginationParams {
  page?: number
  limit?: number
  total?: number
}

/**
 * Respuesta paginada
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationParams
}

/**
 * Configuración de filtros
 */
export interface FilterParams {
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  [key: string]: any
}

/**
 * Configuración de query parameters
 */
export interface QueryParams extends PaginationParams, FilterParams {}

/**
 * Headers personalizados
 */
export interface CustomHeaders {
  [key: string]: string
}

/**
 * Configuración de timeout
 */
export interface TimeoutConfig {
  timeout?: number
  retries?: number
  retryDelay?: number
}

/**
 * Configuración de upload
 */
export interface UploadConfig {
  onProgress?: (progress: number) => void
  maxFileSize?: number
  allowedTypes?: string[]
}

/**
 * Error de la API
 */
export interface ApiError {
  message: string
  code?: string
  details?: any
  statusCode?: number
}

/**
 * Estado de la petición
 */
export interface RequestState<T = any> {
  data: T | null
  loading: boolean
  error: ApiError | null
  success: boolean
}

/**
 * Callback para manejar respuestas
 */
export type ResponseHandler<T> = (response: ApiResponse<T>) => void

/**
 * Callback para manejar errores
 */
export type ErrorHandler = (error: ApiError) => void

/**
 * Callback para manejar progreso
 */
export type ProgressHandler = (progress: number) => void

/**
 * Configuración de interceptores
 */
export interface InterceptorConfig {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>
  onResponse?: <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>
  onError?: (error: ApiError) => ApiError | Promise<ApiError>
}

/**
 * Configuración del cliente HTTP
 */
export interface HttpClientConfig {
  baseURL: string
  timeout: number
  headers: CustomHeaders
  interceptors?: InterceptorConfig
}

/**
 * Métodos HTTP disponibles
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

/**
 * Configuración de cache
 */
export interface CacheConfig {
  enabled: boolean
  ttl: number // Time to live en milisegundos
  maxSize: number
}

/**
 * Configuración de rate limiting
 */
export interface RateLimitConfig {
  enabled: boolean
  maxRequests: number
  windowMs: number
}

/**
 * Configuración completa del cliente
 */
export interface ClientConfig extends HttpClientConfig {
  cache?: CacheConfig
  rateLimit?: RateLimitConfig
  retry?: {
    enabled: boolean
    maxRetries: number
    retryDelay: number
  }
}
