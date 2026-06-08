import React from 'react';
import type { Contact } from '../../types/chat';

interface ContactItemProps {
  contact: Contact;
  isActive: boolean;
  onClick: (contact: Contact) => void;
}

export const ContactItem: React.FC<ContactItemProps> = ({
  contact,
  isActive,
  onClick
}) => {
  return (
    <div
      onClick={() => onClick(contact)}
      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-green-50 border-l-4 border-green-500'
          : 'hover:bg-gray-50'
      }`}
    >
      <div className="relative">
        <img
          src={contact.avatar}
          alt={contact.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        {contact.isOnline && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h3 className={`font-medium truncate ${
            isActive ? 'text-green-700' : 'text-gray-900'
          }`}>
            {contact.name}
          </h3>
          <span className="text-xs text-gray-500">{contact.lastMessageTime}</span>
        </div>
        
        <p className="text-sm text-gray-600 truncate">{contact.lastMessage}</p>
      </div>
      
      {contact.unreadCount > 0 && (
        <div className="flex-shrink-0">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-orange-500 text-white text-xs font-medium rounded-full">
            {contact.unreadCount}
          </span>
        </div>
      )}
    </div>
  );
};
