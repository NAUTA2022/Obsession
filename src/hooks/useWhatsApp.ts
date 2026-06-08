import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import whatsAppService, {
  WhatsAppStatus,
  WhatsAppChat,
  WhatsAppMessage,
  WhatsAppContact,
} from "../services/api/whatsapp.service";
import { env } from "../config/env";

// Determinar dinámicamente la URL base del WebSocket asegurando que tenga el origin correcto
const getWsUrl = () => {
  if (env.API_BASE_URL.startsWith('http')) {
    return env.API_BASE_URL.replace("/api/v1", "");
  }
  // Si la API_BASE_URL es relativa (ej: /api/v1), usamos el dominio actual pero forzamos el puerto del backend (3000) en dev
  return window.location.origin.replace('3001', '3000');
};
const WS_URL = getWsUrl();

export const useWhatsApp = () => {
  const [status, setStatus] = useState<WhatsAppStatus>({ isConnected: false });
  const [chats, setChats] = useState<WhatsAppChat[]>([]);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const userIdRef = useRef<string | null>(null);
  const currentChatIdRef = useRef<string | null>(null);

  // Inicializar WebSocket
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      userIdRef.current = user.id;

      const socket = io(`${WS_URL}/whatsapp`, {
        query: { userId: user.id },
        transports: ["websocket"],
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("✅ WebSocket conectado");
      });

      socket.on("authenticated", () => {
        console.log("✅ WhatsApp autenticado");
        setStatus({ isConnected: true });
      });

      socket.on("ready", (data: { phoneNumber: string }) => {
        console.log("✅ WhatsApp conectado:", data.phoneNumber);
        setStatus({ isConnected: true, phoneNumber: data.phoneNumber });
        loadChats();
      });

      socket.on("message", (message: any) => {
        console.log("💬 Nuevo mensaje recibido:", message);

        // Solo agregar el mensaje si es del chat actualmente abierto
        if (currentChatIdRef.current === message.chatId) {
          setMessages((prev) => {
            // Evitar duplicados
            const exists = prev.some((m) => m.id === message.messageId);
            if (exists) return prev;

            return [
              ...prev,
              {
                id: message.messageId,
                body: message.content,
                from: message.chatId,
                to: "",
                timestamp: Math.floor(
                  new Date(message.timestamp).getTime() / 1000,
                ),
                type: message.mediaType || "chat",
                hasMedia: !!message.mediaType,
                fromMe: message.direction === "OUTGOING",
              },
            ];
          });
        }

        // Actualizar el chat en la lista con el nuevo mensaje
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === message.chatId
              ? {
                ...chat,
                lastMessage: message.content,
                unreadCount: chat.unreadCount + 1,
              }
              : chat,
          ),
        );
      });

      socket.on("disconnected", (data: { reason: string }) => {
        console.log("❌ WhatsApp desconectado:", data.reason);
        setStatus({ isConnected: false });
      });

      socket.on("disconnect", () => {
        console.log("🔌 WebSocket desconectado");
      });

      socket.on("error", (error: any) => {
        console.error("❌ WebSocket error:", error);
        setError("Error de conexión con WebSocket");
      });

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const statusData = await whatsAppService.getStatus();
      setStatus(statusData);
      if (statusData.isConnected) {
        // Cargar los chats automáticamente si ya está conectado
        loadChats();
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al verificar estado";
      console.error("❌ Error checking status:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveConfig = useCallback(async (data: { phoneNumberId: string, accessToken: string, wabaId?: string }) => {
    try {
      setLoading(true);
      setError(null);
      await whatsAppService.saveConfig(data);
      console.log("✅ Configuración guardada exitosamente");
      await checkStatus();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error al guardar configuración";
      console.error("❌ Error saving config:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [checkStatus]);

  const launchEmbeddedSignup = useCallback(() => {
    setError(null);
    setLoading(true);

    // Store signup data from the message event
    let signupData: { phone_number_id?: string; waba_id?: string } = {};

    // Listen for the WA_EMBEDDED_SIGNUP message event from the Facebook popup
    const messageHandler = (event: MessageEvent) => {
      if (!event.origin.endsWith('facebook.com')) return;
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'WA_EMBEDDED_SIGNUP') {
          console.log('📱 Embedded Signup event:', data);
          if (data.event === 'FINISH' && data.data) {
            signupData = {
              phone_number_id: data.data.phone_number_id,
              waba_id: data.data.waba_id,
            };
          } else if (data.event === 'CANCEL') {
            console.log('❌ User cancelled signup at step:', data.data?.current_step);
            setError('Registro cancelado por el usuario');
            setLoading(false);
          }
        }
      } catch {
        // Non-JSON messages from Facebook, ignore
      }
    };

    window.addEventListener('message', messageHandler);

    // Initialize the Facebook SDK if not already done
    const FB = (window as any).FB;
    if (!FB) {
      setError('Facebook SDK no se ha cargado. Recarga la página.');
      setLoading(false);
      return;
    }

    const appId = (window as any).__META_APP_ID || import.meta.env.VITE_META_APP_ID;
    const configId = (window as any).__META_CONFIG_ID || import.meta.env.VITE_META_CONFIG_ID;

    if (!configId) {
      setError('Facebook Login no está configurado aún. Usa la opción "Configurar manualmente".');
      setLoading(false);
      window.removeEventListener('message', messageHandler);
      return;
    }

    try {
      FB.init({
        appId: appId,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v19.0',
      });

      // Launch the Embedded Signup flow
      FB.login(
        async (response: any) => {
          window.removeEventListener('message', messageHandler);

          if (response.authResponse) {
            const code = response.authResponse.code;
            console.log('✅ Got authorization code from Facebook');

            // Wait a brief moment for the message event to fire
            await new Promise((resolve) => setTimeout(resolve, 500));

            const phoneNumberId = signupData.phone_number_id;
            const wabaId = signupData.waba_id;

            if (!phoneNumberId || !wabaId) {
              setError('No se recibieron los datos de WhatsApp. Intenta de nuevo.');
              setLoading(false);
              return;
            }

            try {
              await whatsAppService.completeEmbeddedSignup(code, phoneNumberId, wabaId);
              console.log('✅ Embedded Signup completado exitosamente');
              await checkStatus();
            } catch (err) {
              const errorMsg = err instanceof Error ? err.message : 'Error al completar el registro';
              console.error('❌ Error completing embedded signup:', errorMsg);
              setError(errorMsg);
            }
          } else {
            console.log('❌ Facebook login cancelled or failed');
            setError('Inicio de sesión con Facebook cancelado');
          }
          setLoading(false);
        },
        {
          config_id: configId,
          response_type: 'code',
          override_default_response_type: true,
          extras: {
            setup: {},
          },
        },
      );
    } catch (err) {
      window.removeEventListener('message', messageHandler);
      console.error('❌ FB.login error:', err);
      setError('Facebook Login requiere HTTPS. Usa la opción "Configurar manualmente" en desarrollo local.');
      setLoading(false);
    }
  }, [checkStatus]);

  const disconnect = useCallback(async () => {
    try {
      setLoading(true);
      await whatsAppService.disconnect();
      setStatus({ isConnected: false });
      setChats([]);
      setMessages([]);
      currentChatIdRef.current = null;
      console.log("✅ Desconectado exitosamente");
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al desconectar";
      console.error("❌ Error disconnecting:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const chatsData = await whatsAppService.getChats();
      setChats(chatsData);
      console.log(`✅ Cargados ${chatsData.length} chats`);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al cargar chats";
      console.error("❌ Error loading chats:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const contactsData = await whatsAppService.getContacts();
      setContacts(contactsData);
      console.log(`✅ Cargados ${contactsData.length} contactos`);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al cargar contactos";
      console.error("❌ Error loading contacts:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (chatId: string) => {
    try {
      setLoading(true);
      setError(null);
      currentChatIdRef.current = chatId;
      const messagesData = await whatsAppService.getMessages(chatId);
      setMessages(messagesData);
      console.log(
        `✅ Cargados ${messagesData.length} mensajes para chat ${chatId}`,
      );
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al cargar mensajes";
      console.error("❌ Error loading messages:", errorMsg);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendMessage = useCallback(async (chatId: string, message: string) => {
    try {
      setLoading(true);
      setError(null);

      console.log(`📤 Enviando mensaje a ${chatId}: "${message}"`);

      const result = await whatsAppService.sendMessage({ chatId, message });

      console.log("✅ Mensaje enviado:", result);

      // Agregar el mensaje enviado a la lista localmente (optimistic update)
      const newMessage: WhatsAppMessage = {
        id: result.data?.id || Date.now().toString(),
        body: message,
        from: "me",
        to: chatId,
        timestamp: Math.floor(Date.now() / 1000),
        type: "chat",
        hasMedia: false,
        fromMe: true,
      };

      setMessages((prev) => [...prev, newMessage]);

      // Actualizar el último mensaje del chat
      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId ? { ...chat, lastMessage: message } : chat,
        ),
      );
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Error al enviar mensaje";
      console.error("❌ Error sending message:", errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    status,
    chats,
    contacts,
    messages,
    loading,
    error,
    checkStatus,
    saveConfig,
    launchEmbeddedSignup,
    disconnect,
    loadChats,
    loadContacts,
    loadMessages,
    sendMessage,
  };
};
