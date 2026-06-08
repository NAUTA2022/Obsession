import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Button,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
  InputAdornment,
} from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  EmojiEmotions as EmojiIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useWhatsApp } from "../hooks/useWhatsApp";
import { LockedMessageBubble } from "../components/chat/LockedMessageBubble";
import { LockedContentSender } from "../components/chat/LockedContentSender";
import { useAuthStore } from "../store/auth";
import { apiClient } from "../services/api/client";

const ChatMessagePage: React.FC = () => {
  const {
    status,
    chats,
    messages,
    loading,
    error,
    checkStatus,
    saveConfig,
    launchEmbeddedSignup,
    disconnect,
    loadChats,
    loadMessages,
    sendMessage,
  } = useWhatsApp();

  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showManualConfig, setShowManualConfig] = useState(false);
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [wabaId, setWabaId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = useAuthStore((s) => s.user);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check connection status at mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Handle chat selection
  const handleChatSelect = (chatId: string) => {
    setSelectedChat(chatId);
    loadMessages(chatId);
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !messageText.trim()) return;

    try {
      await sendMessage(selectedChat, messageText);
      setMessageText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleManualConnect = async () => {
    if (!phoneNumberId || !accessToken) return;
    await saveConfig({ phoneNumberId, accessToken, wabaId });
  };

  const selectedChatData = chats.find((chat) => chat.id === selectedChat);
  const filteredChats = chats.filter((chat) =>
    chat.name?.toLowerCase().includes(searchText.toLowerCase()),
  );

  // Vista de conexión
  if (!status.isConnected) {
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f0f2f5",
        }}
      >
        <Paper elevation={3} sx={{ p: 5, textAlign: "center", maxWidth: 480 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
              Conectar WhatsApp
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vincula tu número de WhatsApp Business para empezar a recibir y
              enviar mensajes.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Opción 1: Embedded Signup */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={launchEmbeddedSignup}
            disabled={loading}
            sx={{
              bgcolor: "#1877F2",
              "&:hover": { bgcolor: "#166FE5" },
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              py: 1.5,
              borderRadius: 2,
              mb: 2,
            }}
          >
            {loading && !showManualConfig ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Conectar con Facebook"
            )}
          </Button>

          {/* Divider */}
          <Box sx={{ display: "flex", alignItems: "center", my: 2 }}>
            <Box sx={{ flex: 1, height: "1px", bgcolor: "#e0e0e0" }} />
            <Typography variant="caption" sx={{ px: 2, color: "text.secondary" }}>
              o
            </Typography>
            <Box sx={{ flex: 1, height: "1px", bgcolor: "#e0e0e0" }} />
          </Box>

          {/* Opción 2: Configuración manual */}
          {!showManualConfig ? (
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => setShowManualConfig(true)}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                borderColor: "#d0d0d0",
                color: "text.secondary",
                "&:hover": { borderColor: "#999", bgcolor: "#fafafa" },
              }}
            >
              Configurar manualmente
            </Button>
          ) : (
            <Box sx={{ textAlign: "left" }}>
              <TextField
                fullWidth
                label="Phone Number ID"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Access Token"
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="WABA ID (opcional)"
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
                size="small"
                sx={{ mb: 2 }}
              />
              <Button
                fullWidth
                variant="contained"
                onClick={handleManualConnect}
                disabled={loading || !phoneNumberId || !accessToken}
                sx={{
                  bgcolor: "#25D366",
                  "&:hover": { bgcolor: "#1da851" },
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : (
                  "Conectar"
                )}
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "calc(100vh - 120px)",
        display: "flex",
        bgcolor: "#f0f2f5",
        m: { xs: -2, md: -3 },
        mt: 0,
        width: "calc(100% + 32px)",
        marginLeft: { xs: "-16px", md: "-24px" },
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", md: "350px" },
          minWidth: { xs: "100%", md: "350px" },
          borderRight: 1,
          padding: "12px",
          borderColor: "divider",
          height: "100%",
          // En móvil el sidebar ocupa toda la pantalla y se oculta al abrir un chat.
          display: { xs: selectedChat ? "none" : "flex", md: "flex" },
          flexDirection: "column",
          bgcolor: "white",
        }}
      >
        {/* Header de la lista */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Conversaciones
            </Typography>
            <IconButton size="small" onClick={disconnect}>
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* Buscador */}
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "#f0f2f5",
                "& fieldset": {
                  border: "none",
                },
              },
            }}
          />
        </Box>

        {/* Lista de conversaciones */}
        <List sx={{ p: 0, overflow: "auto", flex: 1 }}>
          {filteredChats.length === 0 && !loading && (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography color="text.secondary" variant="body2">
                No hay conversaciones
              </Typography>
            </Box>
          )}
          {filteredChats.map((chat) => (
            <ListItemButton
              key={chat.id}
              selected={selectedChat === chat.id}
              onClick={() => handleChatSelect(chat.id)}
              sx={{
                py: 1.5,
                px: 2,
                "&.Mui-selected": {
                  bgcolor: "#f0f2f5",
                },
                "&:hover": {
                  bgcolor: "#f5f5f5",
                },
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: "#dfe5e7", color: "#667781" }}>
                  {chat.name?.[0] || "?"}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography
                    variant="body1"
                    sx={{ fontWeight: 500, fontSize: "0.95rem" }}
                  >
                    {chat.name}
                  </Typography>
                }
                secondary={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      fontSize: "0.85rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {chat.lastMessage || "Sin mensajes"}
                  </Typography>
                }
              />
              {chat.unreadCount > 0 && (
                <Box
                  sx={{
                    backgroundColor: "#25D366",
                    color: "white",
                    borderRadius: "50%",
                    minWidth: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    px: 0.5,
                  }}
                >
                  {chat.unreadCount}
                </Box>
              )}
            </ListItemButton>
          ))}
        </List>
      </Box>

      {/* Ventana de mensajes */}
      <Box
        sx={{
          flex: 1,
          // En móvil sólo se muestra cuando hay un chat abierto.
          display: { xs: selectedChat ? "flex" : "none", md: "flex" },
          flexDirection: "column",
          height: "100%",
          minWidth: 0,
        }}
      >
        {!selectedChat ? (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#f0f2f5",
            }}
          >
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                Selecciona una conversación
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Elige un chat para comenzar a enviar mensajes
              </Typography>
            </Box>
          </Box>
        ) : (
          <>
            {/* Header del chat seleccionado */}
            <Box
              sx={{
                p: 2,
                borderBottom: 1,
                borderColor: "divider",
                bgcolor: "#f0f2f5",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                <IconButton
                  size="small"
                  onClick={() => setSelectedChat(null)}
                  sx={{ display: { xs: "inline-flex", md: "none" }, color: "#54656f" }}
                  aria-label="Volver a conversaciones"
                >
                  <ArrowBackIcon />
                </IconButton>
                <Avatar sx={{ bgcolor: "#dfe5e7", color: "#667781" }}>
                  {selectedChatData?.name?.[0] || "?"}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {selectedChatData?.name}
                </Typography>
              </Box>
              <IconButton size="small">
                <MoreVertIcon />
              </IconButton>
            </Box>

            {/* Mensajes */}
            <Box
              sx={{
                flex: 1,
                p: 3,
                overflow: "auto",
                bgcolor: "white",
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='%23efeae2'/%3E%3Cpath d='M50 0L0 50M100 50L50 100' stroke='%23d9d9d9' stroke-width='.5' opacity='.1'/%3E%3C/svg%3E\")",
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {loading && messages.length === 0 ? (
                <Box sx={{ textAlign: "center", py: 4 }}>
                  <CircularProgress sx={{ color: "#5B96F7" }} />
                </Box>
              ) : messages.length === 0 ? (
                <Typography
                  color="text.secondary"
                  textAlign="center"
                  variant="body2"
                >
                  No hay mensajes
                </Typography>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isFromMe = msg.fromMe;
                    const messageColor = isFromMe ? "white" : "inherit";
                    const timeColor = isFromMe ? "rgba(255,255,255,0.8)" : "#667781";
                    const bgColor = isFromMe ? "#7bc862" : "#f0f2f5";

                    // --- Contenido Bloqueado (Dev B) ---
                    if ((msg as any).type === 'locked_media' && (msg as any).blurredThumbnailUrl) {
                      return (
                        <Box
                          key={msg.id}
                          sx={{ alignSelf: isFromMe ? "flex-end" : "flex-start", maxWidth: { xs: "80%", md: "360px" } }}
                        >
                          <LockedMessageBubble
                            messageId={msg.id}
                            price={(msg as any).price || 0}
                            blurredUrl={(msg as any).blurredThumbnailUrl}
                            mediaUrl={(msg as any).mediaUrl}
                            isUnlockedInitially={(msg as any).isUnlockedByCurrentUser || false}
                            onUnlockSubmit={async (messageId, transactionId) => {
                              const res = await apiClient.post('/chat/monetization/unlock', {
                                messageId,
                                userId: currentUser?.id,
                                transactionId,
                              });
                              if (!res.success) throw new Error('Pago fallido');
                              return res.data as string;
                            }}
                          />
                        </Box>
                      );
                    }
                    // ------------------------------------

                    return (
                      <Box
                        key={msg.id}
                        sx={{
                          alignSelf: isFromMe ? "flex-end" : "flex-start",
                          maxWidth: "65%",
                        }}
                      >
                        <Paper
                          elevation={1}
                          sx={{
                            p: 1.5,
                            bgcolor: bgColor,
                            borderRadius: 2,
                            position: "relative",
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{
                              fontSize: "0.95rem",
                              mb: 0.5,
                              color: messageColor,
                            }}
                          >
                            {msg.body}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "0.7rem",
                              color: timeColor,
                              display: "block",
                              textAlign: "right",
                            }}
                          >
                            {new Date(msg.timestamp * 1000).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                              },
                            )}
                          </Typography>
                        </Paper>
                      </Box>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </Box>

            {/* Input de mensaje */}
            <Box sx={{ p: 2, bgcolor: "#f0f2f5" }}>
              <Box sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                <IconButton size="small" sx={{ color: "#54656f" }}>
                  <EmojiIcon />
                </IconButton>
                <IconButton size="small" sx={{ color: "#54656f" }}>
                  <AttachFileIcon />
                </IconButton>

                {/* Botón de Gift Card / Contenido Bloqueado (Dev B) */}
                {selectedChat && currentUser?.id && (
                  <LockedContentSender
                    conversationId={selectedChat}
                    senderId={currentUser.id}
                    onMessageCreated={() => loadMessages(selectedChat)}
                  />
                )}
                <TextField
                  fullWidth
                  placeholder="Escribe un mensaje..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  multiline
                  maxRows={4}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                      bgcolor: "white",
                      "& fieldset": {
                        borderColor: "transparent",
                      },
                      "&:hover fieldset": {
                        borderColor: "transparent",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "transparent",
                      },
                    },
                  }}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || loading}
                  sx={{
                    bgcolor: "#5B96F7",
                    color: "white",
                    "&:hover": {
                      bgcolor: "#4A7FE0",
                    },
                    "&.Mui-disabled": {
                      bgcolor: "#e0e0e0",
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ChatMessagePage;
