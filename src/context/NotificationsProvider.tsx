import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { env } from '../config/env';
import { notificationsService, type AppNotification } from '../services/api/notifications.service';
import { swipeService } from '../services/api/swipe.service';
import { useAuthStore } from '../store/auth';
import { ROUTES } from '../constants/routes';
import { USER_ROLES } from '../types/auth';

const SOCKET_URL = env.API_BASE_URL.replace('/api/v1', '');

// --- Notificaciones locales (cliente), persistidas en localStorage ---
// Permiten avisos generados en el frontend (p.ej. "configura tus llamadas")
// sin depender de que el backend los emita.
const LOCAL_KEY = 'localNotifications';

function loadLocal(): AppNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]') as AppNotification[];
  } catch {
    return [];
  }
}

function saveLocal(list: AppNotification[]) {
  if (typeof window !== 'undefined') localStorage.setItem(LOCAL_KEY, JSON.stringify(list));
}

const isLocalId = (id: string) => id.startsWith('local-');

interface NotificationsContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  accept: (n: AppNotification) => Promise<void>;
  reject: (n: AppNotification) => Promise<void>;
  openChat: (conversationId: string) => void;
  /** Inserta una notificación local (cliente) en la campanita. */
  pushLocal: (n: AppNotification) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications debe usarse dentro de NotificationsProvider');
  return ctx;
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);
  const userId = useAuthStore((s) => s.user?.id);

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const inboxRoute =
    role === USER_ROLES.CREATOR ? ROUTES['creator-inbox'] : ROUTES['client-inbox'];

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const [list, count] = await Promise.all([
        notificationsService.list(),
        notificationsService.unreadCount(),
      ]);
      // Releer las locales DESPUÉS del await: si se insertó una notificación
      // local mientras el fetch estaba en vuelo (p.ej. justo al re-montar tras
      // el cambio de rol), no debe perderse al fijar el estado.
      const local = loadLocal();
      const localUnread = local.filter((n) => !n.read).length;
      // Las locales van primero (encima) y se conservan junto a las del backend.
      setNotifications([...local, ...list]);
      setUnreadCount(count + localUnread);
    } catch {
      const local = loadLocal();
      setNotifications(local);
      setUnreadCount(local.filter((n) => !n.read).length);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Carga inicial
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Socket en tiempo real
  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const socket = io(`${SOCKET_URL}/notifications`, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
    });
    socketRef.current = socket;

    socket.on('newNotification', (n: AppNotification) => {
      setNotifications((prev) => [n, ...prev.filter((x) => x.id !== n.id)]);
      setUnreadCount((c) => c + 1);
      toast(n.body || n.title, { icon: '🔔' });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, userId]);

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => {
      const wasUnread = prev.find((n) => n.id === id && !n.read);
      if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
      return prev.map((n) => (n.id === id ? { ...n, read: true } : n));
    });
    if (isLocalId(id)) {
      saveLocal(loadLocal().map((n) => (n.id === id ? { ...n, read: true } : n)));
      return;
    }
    try {
      await notificationsService.markRead(id);
    } catch {
      /* ignore */
    }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    saveLocal(loadLocal().map((n) => ({ ...n, read: true })));
    try {
      await notificationsService.markAllRead();
    } catch {
      /* ignore */
    }
  }, []);

  const pushLocal = useCallback((n: AppNotification) => {
    // Upsert: si ya existía con ese id, se reemplaza y vuelve arriba.
    const current = loadLocal().filter((x) => x.id !== n.id);
    saveLocal([n, ...current]);
    setNotifications((prev) => {
      const existing = prev.find((x) => x.id === n.id);
      if (!n.read && (!existing || existing.read)) setUnreadCount((c) => c + 1);
      return [n, ...prev.filter((x) => x.id !== n.id)];
    });
    toast(n.body || n.title, { icon: '🔔' });
  }, []);

  // Cuando el usuario es creadora, ofrecer configurar sus planes de llamada
  // vía notificación en la campanita — una sola vez por usuario en este navegador.
  //
  // Usamos un marcador PERSISTENTE (localStorage) en vez de detectar la
  // transición de rol con un ref en memoria: al activar la cuenta, switchRole
  // pone isLoading=true y ProtectedRoute desmonta AppLayout (y este provider)
  // mientras muestra el spinner; al volver, el provider se re-monta ya con
  // rol "creator", por lo que un ref en memoria perdía la transición y la
  // notificación nunca llegaba. El marcador sobrevive al re-montaje y a recargas.
  useEffect(() => {
    if (!isAuthenticated || !role || !userId) return;
    if (role !== USER_ROLES.CREATOR) return;
    const flagKey = `creatorCallSetupNotified:${userId}`;
    if (typeof window !== 'undefined' && localStorage.getItem(flagKey) === '1') return;
    if (typeof window !== 'undefined') localStorage.setItem(flagKey, '1');
    pushLocal({
      id: 'local-creator-call-setup',
      type: 'creator_call_setup',
      title: 'Configura tus planes de llamada',
      body: '¿Quieres configurar tus planes de llamada y disponibilidad? Conecta tu Google Calendar y define tus horarios.',
      data: { actionRoute: ROUTES['creator-call-settings'], actionLabel: 'Configurar' },
      read: false,
      createdAt: new Date().toISOString(),
    });
  }, [role, isAuthenticated, userId, pushLocal]);

  const openChat = useCallback(
    (conversationId: string) => {
      navigate(`${inboxRoute}?c=${conversationId}`);
    },
    [navigate, inboxRoute],
  );

  const accept = useCallback(
    async (n: AppNotification) => {
      const fromUserId = n.data?.fromUserId;
      if (!fromUserId) return;
      await markRead(n.id);
      try {
        const res = await swipeService.swipe(fromUserId, 'like');
        if (res.match && res.conversationId) {
          toast.success('¡Colaboración aceptada!');
          openChat(res.conversationId);
        }
      } catch {
        toast.error('No se pudo aceptar la solicitud');
      }
    },
    [markRead, openChat],
  );

  const reject = useCallback(
    async (n: AppNotification) => {
      const fromUserId = n.data?.fromUserId;
      if (!fromUserId) return;
      await markRead(n.id);
      try {
        await swipeService.swipe(fromUserId, 'pass');
      } catch {
        /* ignore */
      }
    },
    [markRead],
  );

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        refresh,
        markRead,
        markAllRead,
        accept,
        reject,
        openChat,
        pushLocal,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export default NotificationsProvider;
