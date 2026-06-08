import apiClient from './client';

export interface WhatsAppStatus {
  isConnected: boolean;
  phoneNumber?: string;
  profileName?: string;
  phoneNumberId?: string;
  wabaId?: string;
}

export interface MetaConfigParams {
  phoneNumberId: string;
  accessToken: string;
  wabaId?: string;
}

export interface WhatsAppChat {
  id: string;
  name: string;
  isGroup: boolean;
  unreadCount: number;
  timestamp: number;
  lastMessage?: string;
}

export interface WhatsAppContact {
  id: string;
  name: string;
  number: string;
  isMyContact: boolean;
  profilePicUrl?: string;
}

export interface WhatsAppMessage {
  id: string;
  body: string;
  from: string;
  to: string;
  timestamp: number;
  type: string;
  hasMedia: boolean;
  fromMe: boolean;
}

export interface SendMessageRequest {
  chatId: string;
  message: string;
}

class WhatsAppService {
  async getStatus(): Promise<WhatsAppStatus> {
    const response = await apiClient.get<WhatsAppStatus>('/whatsapp/status', {
      timeout: 30000, // 30 segundos para permitir inicialización
    });
    return response.data;
  }

  async saveConfig(data: MetaConfigParams): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>('/whatsapp/config', data);
    return response.data;
  }

  async completeEmbeddedSignup(code: string, phoneNumberId: string, wabaId: string): Promise<any> {
    const response = await apiClient.post('/whatsapp/embedded-signup', { code, phoneNumberId, wabaId });
    return response.data;
  }

  async disconnect(): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>('/whatsapp/disconnect');
    return response.data;
  }

  async getChats(): Promise<WhatsAppChat[]> {
    const response = await apiClient.get<{ chats: WhatsAppChat[] }>('/whatsapp/chats', {
      timeout: 30000, // 30 segundos
    });
    return response.data.chats;
  }

  async getContacts(): Promise<WhatsAppContact[]> {
    const response = await apiClient.get<{ contacts: WhatsAppContact[] }>('/whatsapp/contacts', {
      timeout: 30000, // 30 segundos
    });
    return response.data.contacts;
  }

  async getMessages(chatId: string, limit: number = 50): Promise<WhatsAppMessage[]> {
    const response = await apiClient.get<{ messages: WhatsAppMessage[] }>(
      `/whatsapp/messages/${chatId}?limit=${limit}`,
      {
        timeout: 20000, // 20 segundos
      }
    );
    return response.data.messages;
  }

  async sendMessage(data: SendMessageRequest): Promise<any> {
    const response = await apiClient.post('/whatsapp/send', data, {
      timeout: 15000, // 15 segundos
    });
    return response.data;
  }
}

export default new WhatsAppService();
