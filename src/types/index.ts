// Tipos de la API
export * from './api'

// Tipos de autenticación
export * from './auth'

// Tipos de UI (si los tienes)
export * from './ui'

// Re-exportar tipos comunes que se usan en toda la aplicación
export * from './gallery'
export type { ApiResponse, RequestConfig, PaginatedResponse, QueryParams } from './api'
export type { 
  User, 
  AuthResponse, 
  LoginFormData, 
  RegisterFormData,
  UserRole,
  AuthState 
} from './auth'
