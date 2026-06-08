import React, { useState } from 'react';
import type { Contact } from '../../types/chat';
import { ContactItem } from './ContactItem';
import SearchInput from '../ui/SearchInput';
import { bgColors, borderColors } from '../../config/branding';
import { cn } from '../../utils/cn';

interface ChatSidebarProps {
    contacts: Contact[];
    activeContact: Contact | null;
    onContactSelect: (contact: Contact) => void;
    onSearch: (query: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    contacts,
    activeContact,
    onContactSelect,
    onSearch
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        onSearch(query);
    };

    return (
        <div className={cn("w-80  border  flex flex-col rounded-lg", bgColors.white, borderColors.gray)}>
            {/* Header del sidebar */}
            <div className={cn("p-4 border-b")}>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Chat</h2>
                {/* Perfil del usuario */}
                <div className={cn("flex items-center space-x-3 p-3  rounded-lg", borderColors.gray)}>
                    <div className="relative">
                        <img
                            src="/src/assets/images/photoProfile.jpg"
                            alt="Usuario"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className={cn("absolute -bottom-1 -right-1 w-3 h-3 border-2 rounded-full", bgColors.green, borderColors.white)}></div>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium text-gray-900">Nombre creadora</h3>
                        <p className={cn("text-sm", bgColors.green)}>En línea</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Barra de búsqueda */}
            <div className={cn("p-4 border-b", borderColors.gray, bgColors.white)}>
                <SearchInput
                    placeholder="Buscar"
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                    className="w-full"
                />
            </div>

            {/* Lista de contactos */}
            <div className={cn("flex-1 overflow-y-auto ",)} >
                <div className="p-2">
                    {contacts.map((contact) => (
                        <ContactItem
                            key={contact.id}
                            contact={contact}
                            isActive={activeContact?.id === contact.id}
                            onClick={onContactSelect}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
