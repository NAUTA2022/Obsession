export interface Contact {
  id: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  platform: 'whatsapp' | 'telegram' | 'instagram';
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  isFromUser: boolean;
  contactId: string;
  platform: 'whatsapp' | 'telegram' | 'instagram';
}

export interface ChatPlatform {
  id: 'whatsapp' | 'telegram' | 'instagram';
  name: string;
  icon: string;
  isActive: boolean;
}

export interface ChatState {
  activePlatform: 'whatsapp' | 'telegram' | 'instagram';
  activeContact: Contact | null;
  contacts: Contact[];
  messages: Message[];
  isLoading: boolean;
}
