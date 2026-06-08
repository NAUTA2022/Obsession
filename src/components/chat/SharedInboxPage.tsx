import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { chatService } from '../../services/api/chat.service';
import { useChatNative } from '../../hooks/useChatNative';
import type { InboxUpdate } from '../../hooks/useChatNative';
import { useAuthStore } from '../../store/auth';
import type { ChatConversation, ChatMessage, ChatParticipant } from '../../types/chat-native';
import { MessageInput } from './MessageInput';
import { ImageLightbox } from './ImageLightbox';
import { VideoBubble } from './VideoBubble';
import { useCall } from '../calls/CallProvider';
import { BookCallModal } from '../calls/BookCallModal';
import { Tooltip } from '@mui/material';
import { callPlansService } from '../../services/api/callPlans.service';
import type { CallMode } from '../../types/bookings';
import { ProductGiftSender } from './ProductGiftSender';
import { LockedMessageBubble } from './LockedMessageBubble';
import { Bot, PenSquare, X, Search, Link2, Copy, Check as CheckIcon } from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Sidebar: conversación ────────────────────────────────────────────────────

function ConversationItem({
  conv,
  isActive,
  participantKey,
  defaultName,
  onClick,
}: {
  conv: ChatConversation;
  isActive: boolean;
  participantKey: 'client' | 'creator';
  defaultName: string;
  onClick: () => void;
}) {
  const participant = conv[participantKey] as ChatParticipant | undefined;
  const delegatedName = conv.delegatedCreatorName;
  const name = delegatedName
    ? `${participant?.firstName || participant?.username || defaultName} → ${delegatedName}`
    : (participant?.displayName || participant?.firstName || participant?.username || defaultName);
  const avatar = conv.delegatedCreatorPhoto || participant?.profilePicture;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
        isActive
          ? 'bg-blue-50 dark:bg-blue-950 border-l-4 border-blue-600'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent'
      }`}
    >
      <div className="w-10 h-10 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
        {avatar ? (
          <img src={avatar} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-blue-600 font-semibold text-sm">{name[0].toUpperCase()}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline">
          <span className={`text-sm font-medium truncate ${isActive ? 'text-blue-700' : 'text-gray-900 dark:text-white'}`}>
            {name}
          </span>
          {conv.lastMessage && (
            <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
              {formatTime(conv.lastMessage.createdAt)}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
          {conv.lastMessage?.content ?? 'Sin mensajes aún'}
        </p>
      </div>
      {conv.unreadCount > 0 && (
        <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
          {conv.unreadCount}
        </span>
      )}
    </button>
  );
}

// ─── Burbuja de mensaje ───────────────────────────────────────────────────────

function MessageBubble({
  message,
  currentUserId,
}: {
  message: ChatMessage;
  currentUserId?: string;
}) {
  if (message.type === 'system') {
    return (
      <div className="flex justify-center">
        <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  const [lightbox, setLightbox] = useState(false);
  const isOwn = message.senderId === currentUserId;
  const align = isOwn ? 'justify-end' : 'justify-start';
  const tailRadius = {
    borderBottomRightRadius: isOwn ? 4 : undefined,
    borderBottomLeftRadius: isOwn ? undefined : 4,
  };

  // ── Imagen ──
  if (message.type === 'image' && message.mediaUrl) {
    return (
      <div className={`flex ${align}`}>
        <div className="flex flex-col gap-0.5">
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
            isOwn ? 'bg-blue-600' : 'bg-white dark:bg-gray-700 shadow-sm'
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
          isOwn ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
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

// ─── Componente compartido ────────────────────────────────────────────────────

interface SharedInboxPageProps {
  mode: 'creator' | 'client';
}

export default function SharedInboxPage({ mode }: SharedInboxPageProps) {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const creatorParam = mode === 'client' ? searchParams.get('creator') : null;
  const convParam = searchParams.get('c'); // abrir una conversación concreta por id

  const participantKey: 'client' | 'creator' = mode === 'creator' ? 'client' : 'creator';
  const defaultName     = mode === 'creator' ? 'Visitante' : 'Creadora';
  const emptyStateTitle = mode === 'creator' ? 'Obsesión Mensajes' : 'Tus mensajes';

  // ─── New chat modal ──────────────────────────────────────────────────────
  const [newChatOpen, setNewChatOpen]   = useState(false);
  const [newChatTab, setNewChatTab]     = useState<'user' | 'link'>('user');
  const [newChatInput, setNewChatInput] = useState('');
  const [linkCopied, setLinkCopied]     = useState(false);

  const externalChatLink = `${window.location.origin}/chat?ref=${user?.username ?? 'me'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(externalChatLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleNewChatSearch = async () => {
    if (!newChatInput.trim()) return;
    try {
      const { conversationId } = await chatService.startConversationWith(newChatInput.trim());
      const inbox = await (mode === 'creator' ? chatService.getInbox() : chatService.getClientInbox());
      setConversations(inbox);
      const found = inbox.find(c => c.id === conversationId);
      if (found) selectConversation(found);
      setNewChatOpen(false);
      setNewChatInput('');
    } catch {
      toast.error('No se encontró el usuario');
    }
  };

  // ─── AI toggle (solo modo creadora) ──────────────────────────────────────
  const [aiEnabled, setAiEnabled]   = useState(false);
  const [togglingAi, setTogglingAi] = useState(false);
  const [aiContextModalOpen, setAiContextModalOpen] = useState(false);
  const [aiContextChoice, setAiContextChoice] = useState<'none' | 'current' | 'external'>('none');
  const [aiExternalContext, setAiExternalContext] = useState('');

  // Función de carga estable (no cambia entre renders porque mode no cambia)
  const fetchInbox = useCallback(() => {
    return mode === 'creator'
      ? chatService.getInbox()
      : chatService.getClientInbox();
  }, [mode]);

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConv, setActiveConv]       = useState<ChatConversation | null>(null);
  const [isLoadingInbox, setIsLoadingInbox] = useState(true);
  const [historyLoaded, setHistoryLoaded]   = useState(false);

  const messagesEndRef        = useRef<HTMLDivElement>(null);
  const activeConvIdRef       = useRef<string | null>(null);
  const userIdRef             = useRef<string | undefined>(undefined);
  const didStartConvRef       = useRef(false);   // ?creator= flow: solo una vez
  const pendingConvIdRef      = useRef<string | null>(null); // ID a auto-seleccionar
  const autoSelectDoneRef     = useRef(false);   // Garantiza selección única
  const isFirstConnectionRef  = useRef(true);    // Para detectar reconexiones

  // Sincronizar refs anti-stale-closure
  useEffect(() => { activeConvIdRef.current = activeConv?.id ?? null; });
  useEffect(() => { userIdRef.current = user?.id; });

  // ─── handleInboxUpdate ───────────────────────────────────────────────────

  const handleInboxUpdate = useCallback((update: InboxUpdate) => {
    setConversations((prev) => {
      const idx = prev.findIndex((c) => c.id === update.conversationId);
      if (idx === -1) return prev;

      const isActive  = activeConvIdRef.current === update.conversationId;
      const isFromMe  = update.lastMessage.senderId === userIdRef.current;

      const updated = {
        ...prev[idx],
        lastMessage: {
          ...prev[idx].lastMessage,
          content:   update.lastMessage.content,
          createdAt: update.lastMessage.createdAt,
          senderId:  update.lastMessage.senderId,
        } as ChatMessage,
        unreadCount: (!isActive && !isFromMe)
          ? prev[idx].unreadCount + 1
          : prev[idx].unreadCount,
      };
      const rest = prev.filter((_, i) => i !== idx);
      return [updated, ...rest];
    });
  }, []);

  const { messages, isConnected, sendMessage, sendFile, setMessages, peerIsTyping, sendTyping } = useChatNative({
    conversationId: activeConv?.id ?? null,
    onInboxUpdate: handleInboxUpdate,
    onAiDisabled: (convId) => {
      if (convId === activeConvIdRef.current) setAiEnabled(false);
      setConversations(prev =>
        prev.map(c => c.id === convId ? { ...c, aiEnabled: false } : c)
      );
    },
  });

  // ─── selectConversation ──────────────────────────────────────────────────
  // Memoizado: solo cambia cuando cambia activeConv.id
  // Siempre resetea el badge ANTES de activar la conversación

  const selectConversation = useCallback((conv: ChatConversation) => {
    setConversations(prev =>
      prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c)
    );
    setAiEnabled(conv.aiEnabled);

    if (activeConv?.id === conv.id) {
      // Misma conversación: recargar mensajes sin re-joinear el socket
      setHistoryLoaded(false);
      setMessages([]);
      chatService.getMessages(conv.id).then((history) => {
        setMessages(history);
        setHistoryLoaded(true);
      });
      return;
    }
    setActiveConv(conv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConv?.id, setMessages]);

  // ─── Toggle IA ──────────────────────────────────────────────────────────

  const applyToggleAi = async (
    next: boolean,
    contextMode: 'none' | 'current' | 'external',
    context: string | null,
  ) => {
    if (!activeConv) return;
    setTogglingAi(true);
    try {
      await chatService.toggleAi(activeConv.id, next, contextMode, context);
      setAiEnabled(next);
      setConversations(prev =>
        prev.map(c => c.id === activeConv.id ? { ...c, aiEnabled: next } : c),
      );
    } catch {
      setAiEnabled(!next);
    } finally {
      setTogglingAi(false);
    }
  };

  const handleToggleAi = async () => {
    if (!activeConv) return;
    if (aiEnabled) {
      await applyToggleAi(false, 'none', null);
      return;
    }
    setAiContextChoice('none');
    setAiExternalContext('');
    setAiContextModalOpen(true);
  };

  const buildCurrentChatContext = (): string => {
    return messages
      .filter(m => m.type === 'text' && m.content?.trim())
      .slice(-30)
      .map(m => {
        const who = m.senderId === user?.id ? 'Yo' : 'Cliente';
        return `${who}: ${m.content}`;
      })
      .join('\n');
  };

  const handleConfirmAiContext = async () => {
    let context: string | null = null;
    if (aiContextChoice === 'current') {
      context = buildCurrentChatContext();
    } else if (aiContextChoice === 'external') {
      context = aiExternalContext.trim() || null;
    }
    setAiContextModalOpen(false);
    await applyToggleAi(true, aiContextChoice, context);
  };

  // ─── Recargar mensajes (tras enviar gift card) ────────────────────────────

  const reloadMessages = useCallback(() => {
    if (!activeConv) return;
    chatService.getMessages(activeConv.id).then((history) => {
      setMessages(history);
    });
  }, [activeConv, setMessages]);

  // ─── loadInbox ───────────────────────────────────────────────────────────

  const loadInbox = useCallback(async () => {
    try {
      setIsLoadingInbox(true);
      const data = await fetchInbox();

      // Abrir directamente una conversación por id (?c=) — desde swipe/match
      if (convParam) pendingConvIdRef.current = convParam;

      if (mode === 'client' && creatorParam && !didStartConvRef.current) {
        // Flujo ?creator=username → iniciar/buscar conversación
        didStartConvRef.current = true;
        try {
          const { conversationId } = await chatService.startConversation(creatorParam);
          pendingConvIdRef.current = conversationId; // se lee en el efecto de auto-select
          const found = data.find(c => c.id === conversationId);
          if (found) {
            setConversations(data);
          } else {
            // Conversación recién creada: recargar
            const fresh = await chatService.getClientInbox();
            setConversations(fresh);
          }
        } catch (err) {
          console.error('Error iniciando conversación con creadora:', err);
          setConversations(data); // fallback: selecciona la primera
        }
      } else {
        setConversations(data);
      }
    } catch (err) {
      console.error('Error cargando inbox:', err);
    } finally {
      setIsLoadingInbox(false);
    }
  }, [fetchInbox, mode, creatorParam, convParam]);

  useEffect(() => {
    loadInbox();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Auto-select (efecto reactivo, garantía ante cualquier timing) ────────
  // Se dispara cuando conversations o activeConv cambian.
  // autoSelectDoneRef impide selecciones repetidas.

  useEffect(() => {
    if (autoSelectDoneRef.current) return;
    if (isLoadingInbox || conversations.length === 0) return;
    if (activeConv) {
      autoSelectDoneRef.current = true; // ya hay conversación activa, marcar como hecho
      return;
    }

    autoSelectDoneRef.current = true;

    const target = pendingConvIdRef.current
      ? (conversations.find(c => c.id === pendingConvIdRef.current) ?? conversations[0])
      : conversations[0];

    selectConversation(target);
  }, [conversations, activeConv, isLoadingInbox, selectConversation]);

  // ─── Cargar historial al cambiar la conversación activa ──────────────────

  useEffect(() => {
    if (!activeConv) return;
    setHistoryLoaded(false);
    setMessages([]);
    chatService.getMessages(activeConv.id).then((history) => {
      setMessages(history);
      setHistoryLoaded(true);
    });
  }, [activeConv?.id, setMessages]);

  // ─── Scroll al fondo con nuevos mensajes ─────────────────────────────────

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ─── Refrescar inbox al reconectar el socket ──────────────────────────────
  // Si el socket se cayó y reconectó, pueden haberse perdido inboxUpdate events.
  // Se refresca silenciosamente para sincronizar el estado con el backend.

  useEffect(() => {
    if (!isConnected) return;

    if (isFirstConnectionRef.current) {
      isFirstConnectionRef.current = false;
      return; // Primera conexión: loadInbox ya maneja la carga inicial
    }

    // Reconexión: sincronizar conversaciones sin mostrar el loader
    fetchInbox()
      .then(data => setConversations(data))
      .catch(() => {});
  }, [isConnected, fetchInbox]);

  // ─── Nombre del participante activo ──────────────────────────────────────

  const activeParticipant = activeConv
    ? (activeConv[participantKey] as ChatParticipant | undefined)
    : null;
  const activeDelegated = activeConv?.delegatedCreatorName;
  const activeName = activeDelegated
    ? `${activeParticipant?.firstName || activeParticipant?.username || defaultName} → ${activeDelegated}`
    : (activeParticipant?.displayName || activeParticipant?.firstName || activeParticipant?.username || defaultName);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full bg-white rounded-lg overflow-hidden shadow-sm dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`flex-shrink-0 border-r border-gray-200 dark:border-gray-700 flex flex-col w-full md:w-72 ${activeConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-2">
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white text-lg">Mensajes</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{conversations.length} conversaciones</p>
          </div>
          <button
            onClick={() => { setNewChatOpen(true); setNewChatTab('user'); setNewChatInput(''); }}
            title="Nuevo chat"
            className="mt-0.5 flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-colors"
          >
            <PenSquare className="w-4 h-4" />
          </button>
        </div>

        {/* ── New chat modal ── */}
        {newChatOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setNewChatOpen(false)} />
            <div className="relative w-full max-w-sm bg-white dark:bg-[#111118] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-white/[0.06]">
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Nuevo chat</h2>
                <button onClick={() => setNewChatOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {/* Tabs */}
              <div className="flex border-b border-gray-100 dark:border-white/[0.06]">
                {(['user', 'link'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setNewChatTab(tab)}
                    className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${
                      newChatTab === tab
                        ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                        : 'text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/60'
                    }`}
                  >
                    {tab === 'user' ? 'Buscar usuario' : 'Link externo'}
                  </button>
                ))}
              </div>
              {/* Body */}
              <div className="p-5">
                {newChatTab === 'user' ? (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 dark:text-white/40">Escribe el nombre de usuario o correo del destinatario.</p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30" />
                        <input
                          type="text"
                          placeholder="@usuario o correo"
                          value={newChatInput}
                          onChange={e => setNewChatInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleNewChatSearch()}
                          className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                          autoFocus
                        />
                      </div>
                      <button
                        onClick={handleNewChatSearch}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
                      >
                        Ir
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-gray-500 dark:text-white/40">Comparte este link para que alguien inicie un chat contigo directamente.</p>
                    <div className="flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] px-3 py-2.5">
                      <Link2 className="w-4 h-4 text-gray-400 dark:text-white/30 flex-shrink-0" />
                      <span className="flex-1 text-xs text-gray-600 dark:text-white/50 truncate">{externalChatLink}</span>
                      <button
                        onClick={handleCopyLink}
                        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-200 dark:hover:bg-white/[0.08] transition-colors"
                      >
                        {linkCopied ? <CheckIcon className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-white/25">Cualquier persona con este link puede escribirte como visitante.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {isLoadingInbox ? (
            <div className="flex items-center justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="text-center py-10 px-4">
              <p className="text-gray-400 dark:text-gray-500 text-sm">No tienes mensajes aún</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={activeConv?.id === conv.id}
                participantKey={participantKey}
                defaultName={defaultName}
                onClick={() => selectConversation(conv)}
              />
            ))
          )}
        </div>
      </div>

      {/* Área de chat */}
      {activeConv ? (
        <div className="flex-1 flex flex-col w-full md:w-auto">
          {/* Header */}
          <div className="flex items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <button
              onClick={() => setActiveConv(null)}
              className="mr-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors md:hidden"
              title="Volver a mensajes"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm mr-3 flex-shrink-0">
              {activeName[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 dark:text-white text-sm">{activeName}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isConnected ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                    En línea
                  </span>
                ) : (
                  'Desconectado'
                )}
              </p>
            </div>

            {/* Llamada / Videollamada — sólo cuando el usuario actual es cliente */}
            {mode === 'client' && activeConv.creatorId && (
              <InboxCallButtons
                conversationId={activeConv.id}
                creatorId={String(activeConv.creatorId)}
                creatorDisplayName={activeName}
              />
            )}

            {/* AI toggle — solo para la creadora */}
            {mode === 'creator' && (
              <div className="flex flex-col items-end gap-0.5 ml-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Bot
                    size={16}
                    className={aiEnabled ? 'text-purple-500' : 'text-gray-300 dark:text-gray-600'}
                  />
                  <span className={`text-xs font-medium ${aiEnabled ? 'text-purple-600' : 'text-gray-400 dark:text-gray-500'}`}>
                    {aiEnabled ? 'IA respondiendo' : 'Respondo yo'}
                  </span>
                  <button
                    onClick={handleToggleAi}
                    disabled={togglingAi}
                    title={aiEnabled ? 'Desactivar IA' : 'Activar IA'}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                      aiEnabled ? 'bg-purple-500' : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        aiEnabled ? 'translate-x-4' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                {aiEnabled && (
                  <p className="text-[10px] text-purple-400 leading-tight text-right max-w-[160px]">
                    Si escribes manualmente, la IA se desactivará
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Mensajes */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2 bg-gray-50 dark:bg-gray-800">
            {!historyLoaded ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 dark:text-gray-500 text-sm">Sin mensajes aún</p>
              </div>
            ) : (
              messages.map((msg) => {
                if (msg.type === 'locked_media') {
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <LockedMessageBubble
                        messageId={msg.id}
                        price={msg.price ?? 0}
                        blurredUrl={msg.blurredThumbnailUrl ?? 'https://via.placeholder.com/360x240/1a1a2e/ffffff?text=🔒'}
                        mediaUrl={msg.mediaUrl ?? undefined}
                        isUnlockedInitially={msg.isUnlockedByCurrentUser ?? false}
                        onUnlockSubmit={(messageId, transactionId) =>
                          chatService.unlockMessage(messageId, user?.id ?? '', transactionId)
                        }
                        paymentUrl={msg.paymentUrl || (activeConv?.delegatedCreatorName ? 'https://paymments.touchup.space/' : undefined)}
                      />
                    </div>
                  );
                }
                return <MessageBubble key={msg.id} message={msg} currentUserId={user?.id} />;
              })
            )}
            {activeConv && peerIsTyping && (
              <div className="flex items-end gap-2 justify-start">
                <div
                  className="px-4 py-3 rounded-2xl bg-white dark:bg-gray-700 shadow-sm border border-gray-100 dark:border-gray-600"
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
          {mode === 'creator' && activeConv && user?.id && (
            <div className="flex items-center gap-2 px-4 pt-2 pb-0 bg-white dark:bg-gray-900">
              <ProductGiftSender
                conversationId={activeConv.id}
                senderId={user.id}
                onMessageCreated={reloadMessages}
                delegatedCreatorId={activeConv.delegatedCreatorId ?? undefined}
                delegatedCreatorName={activeConv.delegatedCreatorName ?? undefined}
                delegatedCollaborationId={activeConv.delegatedCollaborationId ?? undefined}
              />
              <span className="text-xs text-gray-400 dark:text-gray-500">Enviar producto</span>
            </div>
          )}
          <MessageInput
            onSendMessage={sendMessage}
            onSendFile={sendFile}
            disabled={!isConnected}
            onTyping={sendTyping}
          />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-800">
          <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-gray-700 dark:text-gray-200 font-semibold text-sm">{emptyStateTitle}</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Selecciona una conversación para empezar</p>
          </div>
        </div>
      )}

      {aiContextModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Bot size={20} className="text-purple-500" />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Contexto para la IA</h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Elige cómo darle contexto a la IA antes de que empiece a responder por ti.
            </p>

            <div className="space-y-2 mb-4">
              {[
                { value: 'none',     label: 'No deseo agregar contexto a la IA' },
                { value: 'current',  label: 'Revisar conversación del chat actual' },
                { value: 'external', label: 'Deseo escribir un contexto externo a Obsession' },
              ].map(opt => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                    aiContextChoice === opt.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="ai-context-choice"
                    value={opt.value}
                    checked={aiContextChoice === opt.value}
                    onChange={() => setAiContextChoice(opt.value as 'none' | 'current' | 'external')}
                    className="mt-0.5 accent-purple-500"
                  />
                  <span className="text-sm text-gray-800 dark:text-gray-100">{opt.label}</span>
                </label>
              ))}
            </div>

            {aiContextChoice === 'external' && (
              <textarea
                value={aiExternalContext}
                onChange={e => setAiExternalContext(e.target.value)}
                placeholder="Escribe el contexto externo que quieres darle a la IA…"
                rows={4}
                className="w-full mb-4 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAiContextModalOpen(false)}
                disabled={togglingAi}
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAiContext}
                disabled={togglingAi || (aiContextChoice === 'external' && !aiExternalContext.trim())}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {togglingAi ? 'Activando…' : 'Activar IA'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InboxCallButtons({
  conversationId: _conversationId,
  creatorId,
  creatorDisplayName,
}: {
  conversationId: string;
  creatorId: string;
  creatorDisplayName?: string;
}) {
  const { state } = useCall();
  const callBusy = state !== 'idle' && state !== 'ended';

  const [modesAvailable, setModesAvailable] = useState<Record<CallMode, boolean>>({
    audio: false,
    video: false,
  });
  const [bookingMode, setBookingMode] = useState<CallMode | null>(null);

  useEffect(() => {
    if (!creatorId) return;
    let cancelled = false;
    callPlansService
      .listByCreator(creatorId)
      .then((plans) => {
        if (cancelled) return;
        const active = plans.filter((p) => p.isActive);
        setModesAvailable({
          audio: active.some((p) => p.mode === 'audio'),
          video: active.some((p) => p.mode === 'video'),
        });
      })
      .catch((err) => {
        if (!cancelled) console.error('[InboxCallButtons] plans error', err);
      });
    return () => {
      cancelled = true;
    };
  }, [creatorId]);

  const renderButton = (m: CallMode) => {
    const enabled = modesAvailable[m] && !callBusy;
    const tooltip = !modesAvailable[m]
      ? `Esta creadora aún no ofrece llamadas de ${m === 'audio' ? 'audio' : 'vídeo'}`
      : m === 'audio'
        ? 'Reservar llamada de voz'
        : 'Reservar videollamada';
    const colorClasses =
      m === 'audio'
        ? 'text-green-600 hover:bg-green-50'
        : 'text-blue-600 hover:bg-blue-50';
    const icon =
      m === 'audio' ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.28a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.21l-2.06 1.03a11 11 0 005.42 5.42l1.03-2.06a1 1 0 011.21-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.82 21 3 14.18 3 6V5z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );

    return (
      <Tooltip title={tooltip} arrow>
        <span>
          <button
            type="button"
            onClick={() => enabled && setBookingMode(m)}
            disabled={!enabled}
            aria-label={tooltip}
            className={`p-2 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${colorClasses}`}
          >
            {icon}
          </button>
        </span>
      </Tooltip>
    );
  };

  return (
    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
      {renderButton('audio')}
      {renderButton('video')}
      {bookingMode && (
        <BookCallModal
          open={!!bookingMode}
          onClose={() => setBookingMode(null)}
          creatorId={creatorId}
          creatorDisplayName={creatorDisplayName}
          mode={bookingMode}
        />
      )}
    </div>
  );
}
