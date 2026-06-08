import { useState, useCallback } from 'react';
import type { Contact, Message, ChatPlatform, ChatState } from '../types/chat';

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Kathryn Murphy',
    avatar: '/src/assets/images/photoProfile.jpg',
    isOnline: true,
    lastMessage: 'hey! there I\'m...',
    lastMessageTime: '12:30 PM',
    unreadCount: 8,
    platform: 'whatsapp'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    avatar: '/src/assets/images/photoProfile.jpg',
    isOnline: true,
    lastMessage: 'Can you help me with...',
    lastMessageTime: '11:45 AM',
    unreadCount: 3,
    platform: 'whatsapp'
  },
  {
    id: '3',
    name: 'Mike Chen',
    avatar: '/src/assets/images/photoProfile.jpg',
    isOnline: false,
    lastMessage: 'Thanks for the info!',
    lastMessageTime: '10:20 AM',
    unreadCount: 0,
    platform: 'whatsapp'
  },
  {
    id: '4',
    name: 'Emma Wilson',
    avatar: '/src/assets/images/photoProfile.jpg',
    isOnline: true,
    lastMessage: 'I\'ll send it right away',
    lastMessageTime: '9:15 AM',
    unreadCount: 5,
    platform: 'whatsapp'
  },
  {
    id: '5',
    name: 'David Brown',
    avatar: '/src/assets/images/photoProfile.jpg',
    isOnline: false,
    lastMessage: 'Perfect, see you tomorrow',
    lastMessageTime: '8:30 AM',
    unreadCount: 0,
    platform: 'whatsapp'
  }
];

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters.',
    timestamp: '6:30 PM',
    isFromUser: false,
    contactId: '1',
    platform: 'whatsapp'
  },
  {
    id: '2',
    content: 'There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour,',
    timestamp: '6:34 PM',
    isFromUser: true,
    contactId: '1',
    platform: 'whatsapp'
  },
  {
    id: '3',
    content: 'The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using \'Content here, content here\', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default.Contrary to popular belief, Lorem Ipsum is not simply random text is the model text for your company.',
    timestamp: '6:38 PM',
    isFromUser: false,
    contactId: '1',
    platform: 'whatsapp'
  }
];

const platforms: ChatPlatform[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '📱',
    isActive: true
  },
  {
    id: 'telegram',
    name: 'Telegram',
    icon: '✈️',
    isActive: false
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    isActive: false
  }
];

export const useChat = () => {
  const [state, setState] = useState<ChatState>({
    activePlatform: 'whatsapp',
    activeContact: mockContacts[0],
    contacts: mockContacts,
    messages: mockMessages,
    isLoading: false
  });

  const setActivePlatform = useCallback((platform: 'whatsapp' | 'telegram' | 'instagram') => {
    setState(prev => ({
      ...prev,
      activePlatform: platform,
      activeContact: null
    }));
  }, []);

  const setActiveContact = useCallback((contact: Contact) => {
    setState(prev => ({
      ...prev,
      activeContact: contact
    }));
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (!state.activeContact) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      isFromUser: true,
      contactId: state.activeContact.id,
      platform: state.activePlatform
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  }, [state.activeContact, state.activePlatform]);

  const searchContacts = useCallback((query: string) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, contacts: mockContacts }));
      return;
    }

    const filtered = mockContacts.filter(contact =>
      contact.name.toLowerCase().includes(query.toLowerCase())
    );
    setState(prev => ({ ...prev, contacts: filtered }));
  }, []);

  return {
    ...state,
    platforms,
    setActivePlatform,
    setActiveContact,
    sendMessage,
    searchContacts
  };
};
