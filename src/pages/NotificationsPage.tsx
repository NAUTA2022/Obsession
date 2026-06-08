import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationsProvider';
import { icons } from '../config/icons';
import type { AppNotification } from '../services/api/notifications.service';
import Avatar from '../components/ui/Avatar';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  return `hace ${d}d`;
}

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, unreadCount, loading, markRead, markAllRead, accept, reject, openChat } =
    useNotifications();

  const renderActions = (n: AppNotification) => {
    if (n.data?.actionRoute) {
      return (
        <button
          onClick={() => {
            void markRead(n.id);
            navigate(n.data!.actionRoute!);
          }}
          className="mt-2 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          {n.data.actionLabel || 'Abrir'}
        </button>
      );
    }
    if (n.type === 'collaboration_request') {
      return (
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => void accept(n)}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Aceptar
          </button>
          <button
            onClick={() => void reject(n)}
            className="rounded-lg border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Rechazar
          </button>
        </div>
      );
    }
    if (n.type === 'collaboration_accepted' && n.data?.conversationId) {
      return (
        <button
          onClick={() => openChat(n.data.conversationId!)}
          className="mt-2 rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          Abrir chat
        </button>
      );
    }
    return null;
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Notificaciones</h1>
        {unreadCount > 0 && (
          <button
            onClick={() => void markAllRead()}
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-blue-600" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-xl border bg-white py-16 text-center text-gray-400">
          No tienes notificaciones
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 rounded-xl border bg-white p-4 ${
                n.read ? '' : 'border-blue-200 bg-blue-50/50'
              }`}
            >
              {n.type === 'creator_call_setup' ? (
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <icons.calendar className="h-5 w-5" />
                </div>
              ) : (
                <Avatar
                  src={n.data?.fromPhoto}
                  alt=""
                  size={44}
                  className="flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900">{n.title}</div>
                {n.body && <div className="text-sm text-gray-600">{n.body}</div>}
                <div className="mt-0.5 text-xs text-gray-400">{timeAgo(n.createdAt)}</div>
                {renderActions(n)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
