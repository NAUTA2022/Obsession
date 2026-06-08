// Cliente HTTP base
export { apiClient } from "./client";

// Servicios específicos
export { authService, type AuthService } from "./auth.service";
export { profileService, type ProfileService } from "./profile.service";

// Re-exportar tipos desde el archivo centralizado
export type {
  ApiResponse,
  RequestConfig,
  PaginatedResponse,
  QueryParams,
  CustomHeaders,
  ApiError,
} from "../../types/api";

export type {
  LoginFormData,
  RegisterFormData,
  AuthResponse,
  User,
  UserRole,
  AuthState,
} from "../../types/auth";

// Contacts service
export { contactsService } from './contacts.service';
export type { Contact, CreateContactDto, UpdateContactDto } from './contacts.service';

// Chat service
export { chatService } from './chat.service';
export type { ChatMessage, MessagesResponse, Conversation } from './chat.service';

// Bot service
export { botService } from './bot.service';
export type { BotConfig } from './bot.service';
