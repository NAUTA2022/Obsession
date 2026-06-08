import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { env } from '../config/env';
import { creatorsService } from '../services/api/creators.service';
import type { Creator } from '../services/api/creators.service';
import { chatService } from '../services/api/chat.service';
import { useChatNative } from '../hooks/useChatNative';
import { useAuthStore } from '../store/auth';
import { GUEST_SESSION_KEY, GUEST_CONVERSATION_KEY, GUEST_USER_ID_KEY } from '../types/chat-native';
import type { ChatMessage } from '../types/chat-native';
import { MessageInput } from '../components/chat/MessageInput';
import { ImageLightbox } from '../components/chat/ImageLightbox';
import { VideoBubble } from '../components/chat/VideoBubble';
import { LockedMessageBubble } from '../components/chat/LockedMessageBubble';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function Avatar({
  src,
  name,
  size = 64,
}: {
  src?: string | null;
  name: string;
  size?: number;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="rounded-full object-cover ring-4 ring-white shadow-md"
        style={{ width: size, height: size }}
      />
    );
  }
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white ring-4 ring-white shadow-md"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      }}
    >
      {initials}
    </div>
  );
}

// ─── Burbuja de mensaje ────────────────────────────────────────────────────────

function MessageItem({ message }: { message: ChatMessage }) {
  const [lightbox, setLightbox] = useState(false);
  // Leer directamente de localStorage en cada render — siempre sincronizado
  const guestUserId = localStorage.getItem(GUEST_USER_ID_KEY);
  const isSystem = message.type === 'system';
  const isOwn = !isSystem && message.senderId === guestUserId;

  const tailRadius = {
    borderBottomRightRadius: isOwn ? 4 : undefined,
    borderBottomLeftRadius: isOwn ? undefined : 4,
  };

  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-gray-400 bg-gray-100 px-4 py-1.5 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  // ── Contenido bloqueado (producto Touch) ──
  if (message.type === 'locked_media') {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <LockedMessageBubble
          messageId={message.id}
          price={message.price ?? 0}
          blurredUrl={message.blurredThumbnailUrl ?? ''}
          mediaUrl={message.mediaUrl ?? undefined}
          isUnlockedInitially={false}
          paymentUrl={message.paymentUrl ?? undefined}
          onUnlockSubmit={async () => ''}
        />
      </div>
    );
  }

  // ── Imagen ──
  if (message.type === 'image' && message.mediaUrl) {
    return (
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div className="flex flex-col items-end gap-0.5">
          <button
            onClick={() => setLightbox(true)}
            className="relative block rounded-2xl overflow-hidden max-w-[240px] shadow-sm cursor-zoom-in focus:outline-none"
            style={tailRadius}
          >
            <img
              src={message.mediaUrl}
              alt={message.content}
              className="block w-full object-cover max-h-56"
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
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
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
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`rounded-2xl px-3.5 py-3 max-w-[240px] ${
            isOwn
              ? 'bg-gradient-to-br from-indigo-500 to-violet-600'
              : 'bg-white shadow-sm border border-gray-100'
          }`}
          style={tailRadius}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isOwn ? 'bg-white/20' : 'bg-indigo-50'
            }`}>
              <svg className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-semibold truncate ${isOwn ? 'text-white' : 'text-gray-800'}`}>
                {message.content}
              </p>
              <p className={`text-[10px] mt-0.5 ${isOwn ? 'text-indigo-200' : 'text-gray-400'}`}>
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
                isOwn ? 'bg-white/20 text-white' : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              ↓ Descargar
            </a>
            <span className={`text-[10px] ${isOwn ? 'text-indigo-200' : 'text-gray-400'}`}>
              {formatTime(message.createdAt)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Texto (default) ──
  return (
    <div className={`flex items-end gap-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
          isOwn
            ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white'
            : 'bg-white text-gray-800 border border-gray-100'
        }`}
        style={tailRadius}
      >
        <p className="leading-relaxed">{message.content}</p>
        <p className={`text-[10px] mt-1 text-right ${isOwn ? 'text-indigo-200' : 'text-gray-400'}`}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

type ViewState = 'profile' | 'chat';

export default function PublicCreatorProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const delegatedCreatorName = searchParams.get('dcn');
  const delegatedCreatorPhoto = searchParams.get('dcp');
  const delegatedCreatorId = searchParams.get('dci');
  const delegatedReferralCode = searchParams.get('drc');
  const delegatedCollaborationId = searchParams.get('dcol');
  const touchappLinkCode = searchParams.get('tl');
  const storeUrl = touchappLinkCode
    ? `${env.TOUCHAPP_URL}/shared-profile/${touchappLinkCode}${delegatedReferralCode ? `?ref=${delegatedReferralCode}` : ''}`
    : null;

  const { user } = useAuthStore();

  const [view, setView] = useState<ViewState>('profile');
  const [creator, setCreator] = useState<Creator | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [isInitializingChat, setIsInitializingChat] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const autoStartedRef = useRef(false);

  const { messages, isConnected, sendMessage, sendFile, setMessages, botIsTyping, sendTyping } = useChatNative({ conversationId, guestSessionId });

  // ─── Cargar perfil público ────────────────────────────────────────────────

  useEffect(() => {
    if (!username) return;
    setIsLoadingProfile(true);
    creatorsService
      .getPublicProfile(username)
      .then((res) => {
        if (res.data) setCreator(res.data);
        else setProfileError('Creadora no encontrada');
      })
      .catch(() => setProfileError('Creadora no encontrada'))
      .finally(() => setIsLoadingProfile(false));
  }, [username]);

  // Auto-iniciar chat cuando el usuario vuelve del flujo de login
  useEffect(() => {
    const shouldAutoStart = searchParams.get('autoStart') === '1';
    if (!shouldAutoStart || !user || !creator || isLoadingProfile || autoStartedRef.current) return;
    autoStartedRef.current = true;

    // Redirigir al chat normal de Obsesión con los params delegados
    const params = new URLSearchParams({ creator: username! });
    if (delegatedCreatorName) params.set('dcn', delegatedCreatorName);
    if (delegatedCreatorPhoto) params.set('dcp', delegatedCreatorPhoto);
    if (delegatedCreatorId) params.set('dci', delegatedCreatorId);
    if (delegatedReferralCode) params.set('drc', delegatedReferralCode);
    if (delegatedCollaborationId) params.set('dcol', delegatedCollaborationId);
    if (touchappLinkCode) params.set('tl', touchappLinkCode);
    navigate(`/chat?${params.toString()}`);
  }, [user, creator, isLoadingProfile]);

  // Scroll automático al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Iniciar chat ─────────────────────────────────────────────────────────

  const handleStartChat = async () => {
    if (!username) return;
    try {
      setIsInitializingChat(true);
      setChatError(null);

      if (user) {
        // Usuario logueado (cualquier rol) → chat con su cuenta como cliente
        const result = await chatService.startConversation(username);
        const history = await chatService.getMessages(result.conversationId);
        setMessages(history);
        setConversationId(result.conversationId);
        setView('chat');
      } else {
        // Visitante anónimo → guest session
        const result = await chatService.initGuest(
          username,
          delegatedCreatorName
            ? {
                delegatedCreatorName,
                delegatedCreatorPhoto: delegatedCreatorPhoto || undefined,
                delegatedCreatorId: delegatedCreatorId ? Number(delegatedCreatorId) : undefined,
                delegatedReferralCode: delegatedReferralCode || undefined,
                delegatedCollaborationId: delegatedCollaborationId ? Number(delegatedCollaborationId) : undefined,
              }
            : undefined,
        );
        localStorage.setItem(GUEST_SESSION_KEY, result.guestSessionId);
        localStorage.setItem(GUEST_CONVERSATION_KEY, result.conversationId);
        const history = await chatService.getGuestMessages(result.conversationId);
        setMessages(history);
        setGuestSessionId(result.guestSessionId);
        setConversationId(result.conversationId);
        setView('chat');
      }
    } catch (err) {
      setChatError(err instanceof Error ? err.message : 'Error al iniciar el chat');
    } finally {
      setIsInitializingChat(false);
    }
  };

  // ─── Loading ──────────────────────────────────────────────────────────────

  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (profileError || !creator) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-50">
        <div className="text-center bg-white p-10 rounded-2xl shadow-lg max-w-xs mx-4">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-gray-800 font-semibold mb-2">Perfil no encontrado</p>
          <p className="text-gray-400 text-sm leading-relaxed">
            El enlace puede ser incorrecto o ya no está disponible.
          </p>
        </div>
      </div>
    );
  }

  const creatorName = delegatedCreatorName || creator.displayName || creator.username;

  // ─── Vista de PERFIL ──────────────────────────────────────────────────────

  if (view === 'profile') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-100 via-indigo-50 to-purple-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Card principal */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Banner de color */}
            <div
              className="h-28"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
              }}
            />

            {/* Avatar sobre el banner */}
            <div className="px-6 pb-6">
              <div className="-mt-12 mb-4 flex justify-center">
                <Avatar src={creator.profilePicture} name={creatorName} size={88} />
              </div>

              <div className="text-center mb-5">
                <h1 className="text-xl font-bold text-gray-900">{creatorName}</h1>
                <p className="text-sm text-indigo-500 font-medium mt-0.5">@{creator.username}</p>

                {creator.location && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {creator.location}
                  </p>
                )}

                {creator.contentType && (
                  <span className="inline-block mt-2 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
                    {creator.contentType}
                  </span>
                )}

                {creator.bio && (
                  <p className="text-sm text-gray-500 mt-3 leading-relaxed">{creator.bio}</p>
                )}
              </div>

              {chatError && (
                <p className="text-red-500 text-xs text-center mb-3 bg-red-50 py-2 px-3 rounded-lg">
                  {chatError}
                </p>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleStartChat}
                  disabled={isInitializingChat}
                  className="w-full py-3.5 text-white font-semibold rounded-2xl transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                  style={{
                    background: isInitializingChat
                      ? '#a5b4fc'
                      : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  }}
                >
                  {isInitializingChat ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Conectando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Chatear ahora
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    const current = window.location.pathname + window.location.search;
                    const separator = current.includes('?') ? '&' : '?';
                    navigate(`/login?redirect=${encodeURIComponent(current + separator + 'autoStart=1')}`);
                  }}
                  className="w-full py-3 border-2 border-gray-200 text-gray-600 font-medium rounded-2xl hover:border-indigo-300 hover:text-indigo-600 transition-all text-sm"
                >
                  Crear cuenta o iniciar sesión
                </button>

                {storeUrl && (
                  <a
                    href={storeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Tienda de @${creator.username} · Galería · Servicios · Productos`}
                    className="w-full py-3 flex items-center justify-center gap-2 border-2 border-purple-200 text-purple-600 font-medium rounded-2xl hover:border-purple-400 hover:bg-purple-50 transition-all text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Ver tienda
                  </a>
                )}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-5">
            Powered by <span className="font-semibold text-indigo-400">Obsesión</span>
          </p>
        </div>
      </div>
    );
  }

  // ─── Vista de CHAT ────────────────────────────────────────────────────────

  return (
    <div
      className="flex flex-col"
      style={{ height: '100dvh', background: 'linear-gradient(135deg, #ede9fe 0%, #e0e7ff 50%, #f3e8ff 100%)' }}
    >
      <div
        className="bg-white md:rounded-3xl md:shadow-xl w-full md:max-w-2xl md:mx-auto md:my-4 flex flex-col overflow-hidden"
        style={{ flex: 1 }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3 text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
        >
          <button
            onClick={() => setView('profile')}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
            aria-label="Volver al perfil"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="relative">
            <Avatar src={creator.profilePicture} name={creatorName} size={38} />
            {isConnected && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{creatorName}</p>
            <p className="text-xs text-indigo-200">
              {isConnected ? 'En línea' : 'Conectando...'}
            </p>
          </div>

          {storeUrl && (
            <a
              href={storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`Tienda de @${creator.username} · Galería · Servicios · Productos`}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </a>
          )}
        </div>

        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50/60">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #e0e7ff, #ede9fe)' }}
              >
                <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 font-medium text-sm">¡Empieza la conversación!</p>
                <p className="text-gray-400 text-xs mt-1">Escribe un mensaje para conectar con {creatorName}</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => <MessageItem key={msg.id} message={msg} />)
          )}
          {botIsTyping && (
            <div className="flex items-end gap-2 justify-start">
              <div
                className="px-4 py-3 rounded-2xl bg-white border border-gray-100 shadow-sm"
                style={{ borderBottomLeftRadius: 4 }}
              >
                <div className="flex gap-1 items-center h-4">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <MessageInput
          onSendMessage={sendMessage}
          onSendFile={sendFile}
          disabled={!isConnected || !conversationId}
          onTyping={sendTyping}
        />
      </div>
    </div>
  );
}
