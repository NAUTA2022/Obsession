import React from 'react';
import type { Message } from '../../types/chat';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  return (
    <div className={`flex ${message.isFromUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          message.isFromUser
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 text-gray-900'
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className={`text-xs mt-2 ${
          message.isFromUser ? 'text-green-100' : 'text-gray-500'
        }`}>
          {message.timestamp}
        </p>
      </div>
    </div>
  );
};
