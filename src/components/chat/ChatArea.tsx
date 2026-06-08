import React from 'react';
import type { Contact, Message } from '../../types/chat';
import { MessageBubble } from './MessageBubble';
import { bgColors } from '../../config/branding';
import { cn } from '../../utils/cn';

interface ChatAreaProps {
  activeContact: Contact | null;
  messages: Message[];
}

export const ChatArea: React.FC<ChatAreaProps> = ({ activeContact, messages }) => {
  if (!activeContact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-medium text-gray-600 mb-2">
            Selecciona un contacto
          </h3>
          <p className="text-gray-500">
            Elige un contacto de la lista para comenzar a chatear
          </p>
        </div>
      </div>
    );
  }

  const filteredMessages = messages.filter(
    (message) => message.contactId === activeContact.id
  );

  return (
    <div className="flex-1 flex flex-col bg-white rounded-lg">
      {/* Header del chat */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={activeContact.avatar}
              alt={activeContact.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            {activeContact.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{activeContact.name}</h3>
            <p className="text-sm text-green-600">
              {activeContact.isOnline ? 'En línea' : 'Desconectado'}
            </p>
          </div>
        </div>
        
        <div className="relative">
          <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
          
          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 hidden">
            <div className="py-1">
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Perfil de cliente
              </button>
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Eliminar todo
              </button>
              <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Bloquear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className={cn("overflow-y-auto p-4 h-96", bgColors.white)} >
        {filteredMessages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No hay mensajes aún. ¡Comienza la conversación!
          </div>
        ) : (
          filteredMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
      </div>
      
    </div>
  );
};
