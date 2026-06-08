import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import {
  Box, Typography, Avatar, IconButton, TextField, InputAdornment,
  CircularProgress, Switch, Tooltip, Paper,
} from '@mui/material';
import { Search as SearchIcon, MoreVert as MoreVertIcon, Call as CallIcon, Videocam as VideocamIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Bot, Users, ShoppingBag } from 'lucide-react';
import { useCall } from '../components/calls/CallProvider';
import { LockedMessageBubble } from '../components/chat/LockedMessageBubble';
import { LockedContentSender } from '../components/chat/LockedContentSender';
import { MessageInput } from '../components/chat/MessageInput';
import { useAuthStore } from '../store/auth';
import { chatService } from '../services/api/chat.service';
import { workTeamsService } from '../services/api/work-teams.service';
import type { WorkTeamCreator } from '../services/api/work-teams.service';
import { useChatNative } from '../hooks/useChatNative';
import type { ChatConversation, ChatMessage } from '../types/chat-native';
import { env } from '../config/env';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' });
}

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
export default function InternalChatPage() {
  const currentUser = useAuthStore((s) => s.user);


  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loadingInbox, setLoadingInbox] = useState(false);
  const [search, setSearch] = useState('');

  // Conversación activa
  const [activeConv, setActiveConv] = useState<ChatConversation | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [togglingAi, setTogglingAi] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeConvIdRef = useRef<string | null>(null);
  useEffect(() => { activeConvIdRef.current = activeConv?.id ?? null; });

  // ── Work-teams creators (para el botón de tienda) ────────────────────────
  const [allCreators, setAllCreators] = useState<WorkTeamCreator[]>([]);

  useEffect(() => {
    workTeamsService.getWorkTeams()
      .then(async ({ ownedGroups, memberGroups }) => {
        const groups = [...ownedGroups, ...memberGroups];
        const results = await Promise.all(groups.map(g => workTeamsService.getWorkTeamCreators(g.id)));
        setAllCreators(results.flatMap(r => r.creators));
      })
      .catch(() => {});
  }, []);

  const activeCreator = useMemo(() => {
    if (!activeConv?.delegatedCollaborationId || allCreators.length === 0) return null;
    return allCreators.find(c => c.collaborationId === activeConv.delegatedCollaborationId) ?? null;
  }, [activeConv, allCreators]);

  const storeUrl = useMemo(() => {
    if (!activeCreator?.creatorLink) return null;
    const linkCode = activeCreator.creatorLink.replace('https://touch.vip/', '');
    return `${env.TOUCHAPP_URL}/shared-profile/${linkCode}${activeCreator.referralCode ? `?ref=${activeCreator.referralCode}` : ''}`;
  }, [activeCreator]);

  // ── Hook de chat (socket + sendMessage + sendFile) ──────────────────────
  const { messages, isConnected, sendMessage, sendFile, setMessages, peerIsTyping, sendTyping } = useChatNative({
    conversationId: activeConv?.id ?? null,
    onAiDisabled: (convId) => {
      if (convId === activeConvIdRef.current) setAiEnabled(false);
      setConversations(prev =>
        prev.map(c => c.id === convId ? { ...c, aiEnabled: false } : c)
      );
    },
  });

  // ---------------------------------------------------------------------------
  // Cargar inbox de la creadora
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setLoadingInbox(true);
    chatService.getInbox()
      .then((data) => setConversations(data))
      .catch((err) => console.error('[InternalChat] Error cargando inbox:', err))
      .finally(() => setLoadingInbox(false));
  }, []);

  // ---------------------------------------------------------------------------
  // Seleccionar conversación — carga historial
  // ---------------------------------------------------------------------------
  const handleSelectConversation = useCallback((conv: ChatConversation) => {
    setActiveConv(conv);
    setAiEnabled(conv.aiEnabled);
    setHistoryLoaded(false);
    setMessages([]);
    chatService.getMessages(conv.id)
      .then((history) => {
        setMessages(history);
        setHistoryLoaded(true);
      })
      .catch(() => setHistoryLoaded(true));
  }, [setMessages]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---------------------------------------------------------------------------
  // Toggle IA
  // ---------------------------------------------------------------------------
  const handleToggleAi = async () => {
    if (!activeConv) return;
    const next = !aiEnabled;
    setTogglingAi(true);
    try {
      await chatService.toggleAi(activeConv.id, next);
      setAiEnabled(next);
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConv.id ? { ...c, aiEnabled: next } : c)),
      );
    } finally {
      setTogglingAi(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Recargar mensajes (tras enviar contenido bloqueado)
  // ---------------------------------------------------------------------------
  const reloadMessages = useCallback(() => {
    if (!activeConv) return;
    chatService.getMessages(activeConv.id).then((history) => setMessages(history));
  }, [activeConv, setMessages]);

  const filteredConversations = conversations.filter((c) => {
    const name = c.client?.displayName || c.client?.firstName || c.client?.username || '';
    return name.toLowerCase().includes(search.toLowerCase());
  });

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <Box
      sx={{
        height: 'calc(100vh - 120px)',
        display: 'flex',
        bgcolor: '#f0f2f5',
        m: { xs: -2, md: -3 },
        mt: 0,
        width: 'calc(100% + 32px)',
        marginLeft: { xs: '-16px', md: '-24px' },
      }}
    >
      {/* ── Sidebar de conversaciones ─────────────────────────────────────── */}
      <Box
        sx={{
          width: { xs: '100%', md: 320 },
          minWidth: { xs: '100%', md: 320 },
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'white',
          // En móvil ocupa toda la pantalla y se oculta al abrir un chat.
          display: { xs: activeConv ? 'none' : 'flex', md: 'flex' },
          flexDirection: 'column',
          height: '100%',
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1.5 }}>
            Conversaciones
          </Typography>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                bgcolor: '#f0f2f5',
                '& fieldset': { border: 'none' },
              },
            }}
          />
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {loadingInbox ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
              <CircularProgress size={28} sx={{ color: '#7B5CF6' }} />
            </Box>
          ) : filteredConversations.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Users size={40} className="text-gray-200 mx-auto mb-3" />
              <Typography variant="body2" color="text.secondary">
                Aún no tienes conversaciones
              </Typography>
              <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                Los clientes aparecerán aquí cuando escriban
              </Typography>
            </Box>
          ) : (
            filteredConversations.map((conv) => {
              const client = conv.client;
              const name = client?.displayName || client?.firstName || client?.username || 'Visitante';
              const avatar = client?.profilePicture;
              return (
                <Box
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    bgcolor: activeConv?.id === conv.id ? '#f0f2f5' : 'transparent',
                    '&:hover': { bgcolor: '#f5f5f5' },
                  }}
                >
                  <Avatar src={avatar} sx={{ bgcolor: '#dfe5e7', color: '#667781' }}>
                    {name[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {name}
                      </Typography>
                      {conv.lastMessage && (
                        <Typography variant="caption" color="text.disabled">
                          {formatTime(conv.lastMessage.createdAt)}
                        </Typography>
                      )}
                    </Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {conv.lastMessage?.content ?? 'Sin mensajes'}
                    </Typography>
                  </Box>
                  {conv.aiEnabled && (
                    <Tooltip title="IA activa">
                      <Bot size={14} className="text-purple-500 shrink-0" />
                    </Tooltip>
                  )}
                </Box>
              );
            })
          )}
        </Box>
      </Box>

      {/* ── Área de mensajes ──────────────────────────────────────────────── */}
      <Box sx={{ flex: 1, display: { xs: activeConv ? 'flex' : 'none', md: 'flex' }, flexDirection: 'column', height: '100%', overflow: 'hidden', minWidth: 0 }}>
        {!activeConv ? (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f2f5' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Selecciona una conversación
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Elige un chat para comenzar a responder
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            {/* Header con toggle de IA */}
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: 'divider',
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <IconButton
                  size="small"
                  onClick={() => setActiveConv(null)}
                  sx={{ display: { xs: 'inline-flex', md: 'none' }, color: '#54656f' }}
                  aria-label="Volver a conversaciones"
                >
                  <ArrowBackIcon />
                </IconButton>
                <Avatar sx={{ bgcolor: '#dfe5e7', color: '#667781' }}>
                  {(activeConv.client?.displayName || activeConv.client?.firstName || 'V')[0]}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeConv.client?.displayName || activeConv.client?.firstName || activeConv.client?.username || 'Visitante'}
                </Typography>
              </Box>

              {/* Toggle IA + botón tienda */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                <CallButtons conversationId={activeConv.id} />
                {storeUrl && (
                  <Tooltip title={`Tienda de @${activeCreator?.creatorUsername} · Galería · Servicios · Productos`}>
                    <IconButton
                      component="a"
                      href={storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      size="small"
                      sx={{ color: '#8b5cf6' }}
                    >
                      <ShoppingBag size={18} />
                    </IconButton>
                  </Tooltip>
                )}
                <Bot size={18} className={aiEnabled ? 'text-purple-500' : 'text-gray-400'} />
                {/* Texto descriptivo de la IA: oculto en móvil para no desbordar el header */}
                <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'flex-start' }}>
                  <Typography variant="body2" color={aiEnabled ? 'primary' : 'text.secondary'} sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                    {aiEnabled ? 'IA respondiendo' : 'Respondo yo'}
                  </Typography>
                  {aiEnabled && (
                    <Typography variant="caption" sx={{ fontSize: '10px', color: '#a78bfa', lineHeight: 1.2 }}>
                      Si escribes manualmente, la IA se desactivará
                    </Typography>
                  )}
                </Box>
                <Tooltip title={aiEnabled ? 'Desactivar IA' : 'Activar IA'}>
                  <span>
                    <Switch
                      checked={aiEnabled}
                      onChange={handleToggleAi}
                      disabled={togglingAi}
                      size="small"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': { color: '#7B5CF6' },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: '#7B5CF6' },
                      }}
                    />
                  </span>
                </Tooltip>
                <IconButton size="small">
                  <MoreVertIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Mensajes */}
            <Box
              sx={{
                flex: 1,
                p: 3,
                overflowY: 'auto',
                bgcolor: '#efeae2',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              {!historyLoaded ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: '#7B5CF6' }} />
                </Box>
              ) : messages.length === 0 ? (
                <Typography color="text.secondary" textAlign="center" variant="body2">
                  No hay mensajes aún
                </Typography>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isFromMe = msg.senderId === currentUser?.id;

                    if (msg.type === 'system') {
                      return (
                        <Typography key={msg.id} variant="caption" textAlign="center" color="text.secondary" sx={{ display: 'block' }}>
                          {msg.content}
                        </Typography>
                      );
                    }

                    if (msg.type === 'locked_media') {
                      return (
                        <Box key={msg.id} sx={{ alignSelf: isFromMe ? 'flex-end' : 'flex-start', maxWidth: { xs: '85%', md: 360 } }}>
                          <LockedMessageBubble
                            messageId={msg.id}
                            price={msg.price ?? 0}
                            blurredUrl={msg.blurredThumbnailUrl ?? 'https://via.placeholder.com/360x240/1a1a2e/ffffff?text=🔒'}
                            mediaUrl={msg.mediaUrl ?? undefined}
                            isUnlockedInitially={msg.isUnlockedByCurrentUser ?? false}
                            onUnlockSubmit={async (messageId, transactionId) =>
                              chatService.unlockMessage(messageId, currentUser?.id ?? '', transactionId)
                            }
                          />
                        </Box>
                      );
                    }

                    if (msg.type === 'image' && msg.mediaUrl) {
                      return (
                        <Box key={msg.id} sx={{ alignSelf: isFromMe ? 'flex-end' : 'flex-start', maxWidth: { xs: '85%', md: 300 } }}>
                          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <a href={msg.mediaUrl} target="_blank" rel="noreferrer">
                              <img src={msg.mediaUrl} alt={msg.content} style={{ maxWidth: '100%', maxHeight: 240, display: 'block', objectFit: 'cover' }} />
                            </a>
                            <Box sx={{ px: 1.5, py: 0.5, bgcolor: isFromMe ? '#7bc862' : 'white' }}>
                              <Typography variant="caption" sx={{ color: isFromMe ? 'rgba(255,255,255,0.8)' : '#667781', display: 'block', textAlign: 'right' }}>
                                {formatTime(msg.createdAt)}
                              </Typography>
                            </Box>
                          </Paper>
                        </Box>
                      );
                    }

                    if (msg.type === 'video' && msg.mediaUrl) {
                      return (
                        <Box key={msg.id} sx={{ alignSelf: isFromMe ? 'flex-end' : 'flex-start', maxWidth: { xs: '85%', md: 320 } }}>
                          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <video src={msg.mediaUrl} controls style={{ maxWidth: '100%', maxHeight: 240, display: 'block' }} />
                            <Box sx={{ px: 1.5, py: 0.5, bgcolor: isFromMe ? '#7bc862' : 'white' }}>
                              <Typography variant="caption" sx={{ color: isFromMe ? 'rgba(255,255,255,0.8)' : '#667781', display: 'block', textAlign: 'right' }}>
                                {formatTime(msg.createdAt)}
                              </Typography>
                            </Box>
                          </Paper>
                        </Box>
                      );
                    }

                    if (msg.type === 'document' && msg.mediaUrl) {
                      return (
                        <Box key={msg.id} sx={{ alignSelf: isFromMe ? 'flex-end' : 'flex-start', maxWidth: { xs: '85%', md: 280 } }}>
                          <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2, bgcolor: isFromMe ? '#7bc862' : 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography fontSize={24}>📄</Typography>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 500, color: isFromMe ? 'white' : 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {msg.content}
                              </Typography>
                              <a href={msg.mediaUrl} download={msg.content} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: isFromMe ? 'rgba(255,255,255,0.85)' : '#1976d2' }}>
                                Descargar
                              </a>
                            </Box>
                          </Paper>
                        </Box>
                      );
                    }

                    return (
                      <Box key={msg.id} sx={{ alignSelf: isFromMe ? 'flex-end' : 'flex-start', maxWidth: '65%' }}>
                        <Paper
                          elevation={1}
                          sx={{ p: 1.5, bgcolor: isFromMe ? '#7bc862' : 'white', borderRadius: 2 }}
                        >
                          <Typography
                            variant="body1"
                            sx={{ fontSize: '0.95rem', mb: 0.5, color: isFromMe ? 'white' : 'inherit' }}
                          >
                            {msg.content}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ fontSize: '0.7rem', color: isFromMe ? 'rgba(255,255,255,0.8)' : '#667781', display: 'block', textAlign: 'right' }}
                          >
                            {formatTime(msg.createdAt)}
                          </Typography>
                        </Paper>
                      </Box>
                    );
                  })}
                  {peerIsTyping && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, justifyContent: 'flex-start', mt: 0.5 }}>
                      <Box
                        sx={{
                          px: 2, py: 1.5, borderRadius: '18px',
                          borderBottomLeftRadius: '4px',
                          bgcolor: 'white', border: '1px solid #e5e7eb',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                          display: 'flex', gap: '4px', alignItems: 'center', height: 36,
                        }}
                      >
                        {[0, 150, 300].map((delay) => (
                          <span
                            key={delay}
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </Box>

            {/* Input */}
            {currentUser?.id && (
              <Box sx={{ px: 2, pt: 1.5, pb: 0, bgcolor: '#f0f2f5' }}>
                <LockedContentSender
                  conversationId={activeConv.id}
                  senderId={currentUser.id}
                  onMessageCreated={reloadMessages}
                />
              </Box>
            )}
            <MessageInput
              onSendMessage={sendMessage}
              onSendFile={sendFile}
              disabled={!isConnected}
              onTyping={sendTyping}
            />
          </>
        )}
      </Box>
    </Box>
  );
}

function CallButtons({ conversationId }: { conversationId: string }) {
  const { startCall, state } = useCall();
  const disabled = state !== 'idle' && state !== 'ended';
  return (
    <>
      <Tooltip title="Llamada de voz">
        <span>
          <IconButton
            size="small"
            disabled={disabled}
            onClick={() => startCall(conversationId, 'audio')}
            sx={{ color: '#22c55e' }}
          >
            <CallIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Videollamada">
        <span>
          <IconButton
            size="small"
            disabled={disabled}
            onClick={() => startCall(conversationId, 'video')}
            sx={{ color: '#6850e8' }}
          >
            <VideocamIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </>
  );
}
