import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { env } from '../config/env';
import { chatService } from '../services/api/chat.service';
import { useChatNative } from '../hooks/useChatNative';
import { useAuthStore } from '../store/auth';
import type { ChatConversation, ChatMessage } from '../types/chat-native';
import { GUEST_SESSION_KEY, GUEST_CONVERSATION_KEY } from '../types/chat-native';
import { MessageInput } from '../components/chat/MessageInput';
import { ImageLightbox } from '../components/chat/ImageLightbox';
import { VideoBubble } from '../components/chat/VideoBubble';
import { LockedMessageBubble } from '../components/chat/LockedMessageBubble';
import { useCall } from '../components/calls/CallProvider';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function ChatPage() {
  const [searchParams] = useSearchParams();
  const creatorUsername = searchParams.get('creator'); // ej: "andy"
  const delegatedCreatorName = searchParams.get('dcn') ?? undefined;
  const delegatedCreatorPhoto = searchParams.get('dcp') ?? undefined;
  const delegatedCreatorId = searchParams.get('dci') ? Number(searchParams.get('dci')) : undefined;
  const delegatedReferralCode = searchParams.get('drc') ?? undefined;
  const delegatedCollaborationId = searchParams.get('dcol') ? Number(searchParams.get('dcol')) : undefined;
  const touchappLinkCode = searchParams.get('tl');
  const storeUrl = touchappLinkCode
    ? `${env.TOUCHAPP_URL}/shared-profile/${touchappLinkCode}${delegatedReferralCode ? `?ref=${delegatedReferralCode}` : ''}`
    : null;

  const { user } = useAuthStore();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Solo leer guestSessionId de localStorage si el usuario NO está logueado
  const [guestSessionId, setGuestSessionId] = useState<string | null>(
    () => user ? null : localStorage.getItem(GUEST_SESSION_KEY),
  );

  const { messages, isConnected, sendMessage, sendFile, setMessages } = useChatNative({
    conversationId,
    guestSessionId,
  });

  const { startCall, state: callState } = useCall();
  const callDisabled = !conversationId || (callState !== 'idle' && callState !== 'ended');

  // ─── Inicialización ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!creatorUsername) {
      setIsInitializing(false);
      return;
    }
    initConversation(creatorUsername);
  }, [creatorUsername]);

  const initConversation = async (username: string) => {
    try {
      setIsInitializing(true);
      setError(null);

      let convId: string;

      if (user) {
        // Usuario registrado: endpoint protegido con JWT
        const result = await chatService.startConversation(
          username,
          delegatedCreatorName ? { delegatedCreatorName, delegatedCreatorPhoto, delegatedCreatorId, delegatedReferralCode, delegatedCollaborationId } : undefined,
        );
        convId = result.conversationId;
      } else {
        // Visitante anónimo: usa o genera guestSessionId en localStorage
        const result = await chatService.initGuest(username);
        localStorage.setItem(GUEST_SESSION_KEY, result.guestSessionId);
        localStorage.setItem(GUEST_CONVERSATION_KEY, result.conversationId);
        setGuestSessionId(result.guestSessionId);
        convId = result.conversationId;
      }

      // Cargar historial de mensajes (guests usan endpoint público)
      const history = user
        ? await chatService.getMessages(convId)
        : await chatService.getGuestMessages(convId);
      setMessages(history);
      setConversationId(convId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar el chat');
    } finally {
      setIsInitializing(false);
    }
  };

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Render estados ────────────────────────────────────────────────────────

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Conectando al chat...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-500 font-medium mb-2">No se pudo iniciar el chat</p>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          {creatorUsername && (
            <button
              onClick={() => initConversation(creatorUsername)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              Reintentar
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!creatorUsername) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-5xl mb-3">💬</div>
          <p className="text-gray-500">Selecciona una creadora para iniciar el chat</p>
        </div>
      </div>
    );
  }

  // ─── Vista principal ───────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm mr-3 flex-shrink-0">
          {creatorUsername[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-900 dark:text-white text-sm truncate">@{creatorUsername}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {isConnected ? (
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                En línea
              </span>
            ) : (
              'Conectando...'
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => conversationId && startCall(conversationId, 'audio')}
          disabled={callDisabled}
          title="Llamada de voz"
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V8.5a1 1 0 01-.553.894l-1.45.725a11.042 11.042 0 005.516 5.516l.725-1.45A1 1 0 0114.5 13.586H17a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V19a2 2 0 01-2 2h-1C9.163 21 3 14.837 3 7V6z" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => conversationId && startCall(conversationId, 'video')}
          disabled={callDisabled}
          title="Videollamada"
          className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
        {storeUrl && (
          <a
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Tienda de @${creatorUsername} · Galería · Servicios · Productos`}
            className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-purple-500"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </a>
        )}
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50 dark:bg-gray-800">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 dark:text-gray-500 text-sm">No hay mensajes aún. ¡Saluda!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} currentUserId={user?.id} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={sendMessage}
        onSendFile={sendFile}
        disabled={!isConnected || !conversationId}
      />
    </div>
  );
}

// ─── Sub-componente: burbuja de mensaje ───────────────────────────────────────

function MessageItem({
  message,
  currentUserId,
}: {
  message: ChatMessage;
  currentUserId?: string;
}) {
  const [lightbox, setLightbox] = useState(false);
  const isSystem = message.type === 'system';
  const isOwn = !isSystem && message.senderId === currentUserId;
  const align = isOwn ? 'justify-end' : 'justify-start';
  const tailRadius = {
    borderBottomRightRadius: isOwn ? 4 : undefined,
    borderBottomLeftRadius: isOwn ? undefined : 4,
  };

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-gray-400 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  // ── Contenido bloqueado (producto Touch) ──
  if (message.type === 'locked_media') {
    return (
      <div className={`flex ${align}`}>
        <LockedMessageBubble
          messageId={message.id}
          price={message.price ?? 0}
          blurredUrl={message.blurredThumbnailUrl ?? ''}
          mediaUrl={message.mediaUrl ?? undefined}
          isUnlockedInitially={message.isUnlockedByCurrentUser ?? false}
          paymentUrl={message.paymentUrl ?? undefined}
          onUnlockSubmit={async () => ''}
        />
      </div>
    );
  }

  // ── Imagen ──
  if (message.type === 'image' && message.mediaUrl) {
    return (
      <div className={`flex ${align}`}>
        <div className="flex flex-col items-end gap-0.5">
          <button
            onClick={() => setLightbox(true)}
            className="relative block rounded-2xl overflow-hidden max-w-[260px] shadow-sm cursor-zoom-in focus:outline-none"
            style={tailRadius}
          >
            <img
              src={message.mediaUrl}
              alt={message.content}
              className="block w-full object-cover max-h-64"
            />
            <span
              className="absolute bottom-2 right-2.5 text-[10px] text-white font-medium px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(6px)' }}
            >
              {formatTime(message.createdAt)}
            </span>
          </button>
        </div>
        {lightbox && (
          <ImageLightbox
            src={message.mediaUrl}
            alt={message.content}
            onClose={() => setLightbox(false)}
          />
        )}
      </div>
    );
  }

  // ── Video ──
  if (message.type === 'video' && message.mediaUrl) {
    return (
      <div className={`flex ${align}`}>
        <VideoBubble
          src={message.mediaUrl}
          createdAt={message.createdAt}
          isOwn={isOwn}
          formatTime={formatTime}
        />
      </div>
    );
  }

  // ── Documento ──
  if (message.type === 'document' && message.mediaUrl) {
    return (
      <div className={`flex ${align}`}>
        <div
          className={`rounded-2xl px-3.5 py-3 max-w-[260px] ${
            isOwn
              ? 'bg-blue-600'
              : 'bg-white dark:bg-gray-800 shadow-sm'
          }`}
          style={{ borderBottomRightRadius: isOwn ? 4 : undefined, borderBottomLeftRadius: isOwn ? undefined : 4 }}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isOwn ? 'bg-white/20' : 'bg-blue-50 dark:bg-blue-900'
            }`}>
              <svg className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-semibold truncate ${isOwn ? 'text-white' : 'text-gray-800 dark:text-gray-100'}`}>
                {message.content}
              </p>
              <p className={`text-[10px] mt-0.5 ${isOwn ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
                Documento
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <a
              href={message.mediaUrl}
              download={message.content}
              target="_blank"
              rel="noreferrer"
              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                isOwn ? 'bg-white/20 text-white' : 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
              }`}
            >
              ↓ Descargar
            </a>
            <span className={`text-[10px] ${isOwn ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
              {formatTime(message.createdAt)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Texto (default) ──
  return (
    <div className={`flex ${align}`}>
      <div
        className={`px-4 py-2.5 rounded-2xl text-sm max-w-xs lg:max-w-md ${
          isOwn
            ? 'bg-blue-600 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
        }`}
        style={{ borderBottomRightRadius: isOwn ? 4 : undefined, borderBottomLeftRadius: isOwn ? undefined : 4 }}
      >
        <p className="leading-relaxed">{message.content}</p>
        <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-blue-200' : 'text-gray-400 dark:text-gray-500'}`}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
