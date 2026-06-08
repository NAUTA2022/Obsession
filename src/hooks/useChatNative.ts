import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { env } from '../config/env';
import type { ChatMessage } from '../types/chat-native';
import { GUEST_SESSION_KEY } from '../types/chat-native';
import { chatService } from '../services/api/chat.service';

// Quitar el prefijo /api/v1 para la URL base del socket
const SOCKET_URL = env.API_BASE_URL.replace('/api/v1', '');

export interface InboxUpdate {
  conversationId: string;
  lastMessage: { content: string; createdAt: string; senderId: string };
}

interface UseChatNativeOptions {
  conversationId: string | null;
  onInboxUpdate?: (update: InboxUpdate) => void;
  guestSessionId?: string | null;
  onAiDisabled?: (conversationId: string) => void;
}

interface UseChatNativeReturn {
  messages: ChatMessage[];
  isConnected: boolean;
  sendMessage: (content: string) => void;
  sendFile: (file: File) => Promise<void>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  peerIsTyping: boolean;
  botIsTyping: boolean;
  sendTyping: () => void;
}

export function useChatNative({ conversationId, onInboxUpdate, guestSessionId, onAiDisabled }: UseChatNativeOptions): UseChatNativeReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [peerIsTyping, setPeerIsTyping] = useState(false);
  const [botIsTyping, setBotIsTyping] = useState(false);

  // Refs para acceder a valores actuales dentro de callbacks sin recrear el socket
  const conversationIdRef = useRef(conversationId);
  const onInboxUpdateRef = useRef(onInboxUpdate);
  const onAiDisabledRef = useRef(onAiDisabled);
  // Ref del guestSessionId explícito — debe declararse ANTES del effect de socket
  const guestSessionIdRef = useRef(guestSessionId);
  const peerTypingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => { conversationIdRef.current = conversationId; });
  useEffect(() => { onInboxUpdateRef.current = onInboxUpdate; });
  useEffect(() => { onAiDisabledRef.current = onAiDisabled; });
  useEffect(() => { guestSessionIdRef.current = guestSessionId; });

  // Crear el socket cuando haya razón para conectarse
  // (conversación activa para clientes, o callback de inbox para creadoras)
  const shouldConnect = !!conversationId || !!onInboxUpdate;

  useEffect(() => {
    if (!shouldConnect) return;

    // Si el llamador pasó guestSessionId explícito, forzar modo guest (ignorar JWT)
    const explicitGuestSessionId = guestSessionIdRef.current;
    const rawToken = explicitGuestSessionId ? null : localStorage.getItem('accessToken');
    const expiresAt = Number(localStorage.getItem('expiresAt') || '0');
    // No usar token si ya expiró — caer en guestSessionId
    const isExpired = expiresAt > 0 && expiresAt <= Date.now();
    const token = isExpired ? null : rawToken;
    const guestId = explicitGuestSessionId ?? localStorage.getItem(GUEST_SESSION_KEY);

    const authPayload = token
      ? { token: `Bearer ${token}` }
      : guestId
        ? { guestSessionId: guestId }
        : null;

    if (!authPayload) return;

    const socket = io(`${SOCKET_URL}/chat`, {
      auth: authPayload,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
    });

    // Emitir joinRoom solo cuando el backend confirma que la autenticación está completa.
    // Esto evita la race condition donde joinRoom llegaba antes de que handleConnection
    // terminara el await a BD y populara socketToUser.
    socket.on('authenticated', () => {
      if (conversationIdRef.current) {
        socket.emit('joinRoom', { conversationId: conversationIdRef.current });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('newMessage', (message: ChatMessage) => {
      // Solo agregar mensajes de la conversación activa actual
      if (conversationIdRef.current && message.conversationId !== conversationIdRef.current) return;
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === message.id);
        if (exists) return prev;
        return [...prev, message];
      });
    });

    socket.on('inboxUpdate', (update: InboxUpdate) => {
      onInboxUpdateRef.current?.(update);
    });

    socket.on('peerTyping', ({ conversationId: cid, typing }: { conversationId: string; typing: boolean }) => {
      if (cid !== conversationIdRef.current) return;
      setPeerIsTyping(typing);
      if (typing) {
        if (peerTypingTimerRef.current) clearTimeout(peerTypingTimerRef.current);
        peerTypingTimerRef.current = setTimeout(() => setPeerIsTyping(false), 5000);
      }
    });

    socket.on('botTyping', ({ conversationId: cid, typing }: { conversationId: string; typing: boolean }) => {
      if (cid !== conversationIdRef.current) return;
      setBotIsTyping(typing);
    });

    socket.on('aiStatusChanged', ({ conversationId: cid, aiEnabled }: { conversationId: string; aiEnabled: boolean }) => {
      if (!aiEnabled) onAiDisabledRef.current?.(cid);
    });

    socket.on('connect_error', (err) => {
      console.error('[Chat] Error de conexión:', err.message);
    });

    socket.on('error', (err) => {
      console.error('[Chat] Error del servidor:', err);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      setPeerIsTyping(false);
      setBotIsTyping(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldConnect]);

  // Unirse a la nueva sala cuando cambia la conversación activa (socket ya conectado)
  useEffect(() => {
    if (!socketRef.current?.connected || !conversationId) return;
    socketRef.current.emit('joinRoom', { conversationId });
  }, [conversationId]);

  const sendMessage = useCallback(
    (content: string) => {
      if (!socketRef.current || !conversationIdRef.current || !content.trim()) return;
      socketRef.current.emit('sendMessage', {
        conversationId: conversationIdRef.current,
        content: content.trim(),
        type: 'text',
      });
    },
    [],
  );

  /**
   * Sube un archivo al chat vía REST.
   * El backend lo guarda en S3, persiste el mensaje y emite 'newMessage' por WebSocket.
   * No necesitamos emitir nada por socket — el backend lo hace automáticamente.
   */
  const sendFile = useCallback(async (file: File) => {
    if (!conversationIdRef.current) {
      console.warn('[Chat] sendFile: no hay conversación activa');
      return;
    }
    // Solo usar guestId si no hay JWT — evita usar sesión guest vieja cuando el user está logueado
    const hasJwt = !!localStorage.getItem('accessToken');
    const guestId = hasJwt ? null : (guestSessionIdRef.current ?? localStorage.getItem(GUEST_SESSION_KEY));
    await chatService.uploadChatFile(
      conversationIdRef.current,
      file,
      guestId ?? undefined,
    );
  }, []);

  const sendTyping = useCallback(() => {
    if (!socketRef.current?.connected || !conversationIdRef.current) return;
    socketRef.current.emit('typing', { conversationId: conversationIdRef.current, typing: true });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socketRef.current?.emit('typing', { conversationId: conversationIdRef.current, typing: false });
    }, 1500);
  }, []);

  return { messages, isConnected, sendMessage, sendFile, setMessages, peerIsTyping, botIsTyping, sendTyping };
}
