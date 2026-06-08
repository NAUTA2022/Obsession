// Types for authentication forms
export interface LoginFormData {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  terms: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormState<T> {
  values: T;
  errors: FormErrors;
  isLoading: boolean;
  isSuccess: boolean;
}

// Form action types
export type FormActionType =
  | "SET_FIELD"
  | "SET_ERROR"
  | "SET_LOADING"
  | "RESET_FORM";

export interface FormAction {
  type: FormActionType;
  payload: any;
}

// Constantes para roles de usuario - ACTUALIZADOS PARA COINCIDIR CON EL BACKEND
export const USER_ROLES = {
  ADMIN: "admin",
  CUSTOMER: "customer", // Usuario común que compra (antes era USUARIO)
  CREATOR: "creator", // Creadora de contenido (antes era MODELO)
  MODERATOR: "moderator",
  VENDEDOR: "vendedor", // Vendedor colaborativo
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Para retrocompatibilidad con el código existente
export const USER_ROLES_LEGACY = {
  MODELO: "creator", // Mapeo de modelo -> creator
  USUARIO: "customer", // Mapeo de usuario -> customer
  ADMIN: "admin",
  SALESPERSON: "moderator", // Mapeo de salesperson -> moderator
} as const;

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
  expiresIn?: number;
  tokenType?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status?: string;
  isEmailVerified?: boolean;
  profilePicture?: string;
  bio?: string;
  displayName?: string;
  phoneNumber?: string;
  location?: string;
  contentType?: string;
  creatorOnboarded?: boolean;
  sellerOnboarded?: boolean;
  totalEarnings?: number;
  galleryImages?: string[];
  createdAt?: string;
  updatedAt?: string;
  // Propiedades legacy para compatibilidad
  name?: string;
  isActive?: boolean;
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Profile update types
export interface UpdateProfileRequest {
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  location?: string;
  displayName?: string;
  profilePicture?: string;
  contentType?: string;
  galleryImages?: string[];
}

export interface UpdateProfilePictureRequest {
  file: File;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  changePassword: (passwordData: PasswordChangeRequest) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (resetData: PasswordResetConfirmRequest) => Promise<void>;
}
