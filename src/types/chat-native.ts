// Tipos del sistema de chat nativo (independiente del módulo WhatsApp)

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;       // userId o 'SYSTEM'
  content: string;
  type: 'text' | 'locked_media' | 'system' | 'image' | 'video' | 'document';
  isRead: boolean;
  createdAt: string;
  // Monetization fields (locked_media)
  isLocked?: boolean;
  price?: number;
  mediaUrl?: string | null;
  blurredThumbnailUrl?: string | null;
  isUnlockedByCurrentUser?: boolean;
  paymentUrl?: string | null;
}

export interface ChatParticipant {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  profilePicture?: string;
  isGuest?: boolean;
}

export interface ChatConversation {
  id: string;
  creatorId: string;
  clientId: string;
  creator?: ChatParticipant;
  client?: ChatParticipant;
  status: 'active' | 'archived';
  aiEnabled: boolean;
  delegatedCreatorName?: string | null;
  delegatedCreatorPhoto?: string | null;
  delegatedCreatorId?: number | null;
  delegatedReferralCode?: string | null;
  delegatedCollaborationId?: number | null;
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GuestInitResponse {
  guestSessionId: string;
  conversationId: string;
  guestUserId: string;
}

export const GUEST_SESSION_KEY = 'chat_guest_session_id';
export const GUEST_CONVERSATION_KEY = 'chat_guest_conversation_id';
export const GUEST_USER_ID_KEY = 'chat_guest_user_id';
