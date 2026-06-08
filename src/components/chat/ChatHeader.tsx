import React from 'react';
import type { ChatPlatform } from '../../types/chat';

interface ChatHeaderProps {
  platforms: ChatPlatform[];
  activePlatform: string;
  onPlatformChange: (platform: 'whatsapp' | 'telegram' | 'instagram') => void;
}


export const ChatHeader: React.FC<ChatHeaderProps> = ({
  platforms,
  activePlatform,
  onPlatformChange
}) => {
  return (
    <div className="flex justify-center items-center py-4 border-b border-gray-200 bg-white">
      <div className="flex space-x-8">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => onPlatformChange(platform.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              platform.id === activePlatform
                ? 'text-green-600 border-b-2 border-green-600 font-semibold'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl">{platform.icon}</span>
            <span className="font-medium">{platform.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
