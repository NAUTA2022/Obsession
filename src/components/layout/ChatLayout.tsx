import React from 'react';
import { ChatSidebar } from '../chat/ChatSidebar';
import { ChatArea } from '../chat/ChatArea';
import { MessageInput } from '../chat/MessageInput';
import type { Contact, Message, ChatPlatform } from '../../types/chat';
import { cn } from '../../utils/cn';

interface ChatLayoutProps {
  platforms: ChatPlatform[];
  activePlatform: string;
  contacts: Contact[];
  activeContact: Contact | null;
  messages: Message[];
  onPlatformChange: (platform: 'whatsapp' | 'telegram' | 'instagram') => void;
  onContactSelect: (contact: Contact) => void;
  onSearch: (query: string) => void;
  onSendMessage: (message: string) => void;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  platforms: _platforms,
  activePlatform: _activePlatform,
  contacts,
  activeContact,
  messages,
  onPlatformChange: _onPlatformChange,
  onContactSelect,
  onSearch,
  onSendMessage
}) => {
  return (
    <div className="h-full flex flex-col ">
      {/* Header con selector de plataforma */}
  
      
      {/* Contenido principal del chat */}
      <div className="flex-1 flex overflow-hidden gap-4">
        {/* Sidebar con contactos */}
        <ChatSidebar
          contacts={contacts}
          activeContact={activeContact}
          onContactSelect={onContactSelect}
          onSearch={onSearch}
        />
        
        {/* Área principal del chat */}
        <div className={cn("flex-1 flex flex-col border rounded-lg")}>
          <ChatArea
            activeContact={activeContact}
            messages={messages}
          />
          
          {/* Input para escribir mensajes */}
          <MessageInput
            onSendMessage={onSendMessage}
            disabled={!activeContact}
          />
        </div>
      </div>
    </div>
  );
};
