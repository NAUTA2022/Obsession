import { useNavigate } from 'react-router-dom';
import Dropdown from './Dropdown';
import IconButton from './IconButton';
import { icons } from '../../config/icons';
import { useNotifications } from '../../context/NotificationsProvider';
import { ROUTES } from '../../constants/routes';
import type { AppNotification } from '../../services/api/notifications.service';
import Avatar from './Avatar';

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

export default function NotificationsMenu() {
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead, accept, reject, openChat } = useNotifications();

  const renderActions = (n: AppNotification) => {
    if (n.data?.actionRoute) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            void markRead(n.id);
            navigate(n.data!.actionRoute!);
          }}
          className="mt-2 rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
        >
          {n.data.actionLabel || 'Abrir'}
        </button>
      );
    }
    if (n.type === 'collaboration_request') {
      return (
        <div className="mt-2 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              void accept(n);
            }}
            className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
          >
            Aceptar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              void reject(n);
            }}
            className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Rechazar
          </button>
        </div>
      );
    }
    if (n.type === 'collaboration_accepted' && n.data?.conversationId) {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openChat(n.data.conversationId!);
          }}
          className="mt-2 rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
        >
          Abrir chat
        </button>
      );
    }
    return null;
  };

  return (
    <Dropdown
      trigger={
        <IconButton aria-label="Notificaciones" className="h-9 w-9 sm:h-10 sm:w-10">
          <div className="relative">
            <icons.bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
        </IconButton>
      }
    >
      <div className="max-h-96 w-80 overflow-auto p-1">
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-xs font-semibold text-gray-500">Notificaciones</span>
          {unreadCount > 0 && (
            <button
              onClick={() => void markAllRead()}
              className="text-[11px] font-medium text-blue-600 hover:underline"
            >
              Marcar todas
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="px-3 py-6 text-center text-sm text-gray-400">Sin notificaciones</div>
        ) : (
          notifications.slice(0, 8).map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm ${
                n.read ? '' : 'bg-blue-50/60'
              }`}
            >
              {n.type === 'creator_call_setup' ? (
                <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <icons.calendar className="h-4 w-4" />
                </div>
              ) : (
                <Avatar
                  src={n.data?.fromPhoto}
                  alt=""
                  size={32}
                  className="mt-0.5 flex-shrink-0"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="font-medium text-gray-900">{n.title}</div>
                {n.body && <div className="text-xs text-gray-600">{n.body}</div>}
                <div className="text-[10px] text-gray-400">{timeAgo(n.createdAt)}</div>
                {renderActions(n)}
              </div>
            </div>
          ))
        )}

        <button
          onClick={() => navigate(ROUTES.notifications)}
          className="mt-1 w-full rounded-md px-3 py-2 text-center text-xs font-medium text-blue-600 hover:bg-gray-50"
        >
          Ver todas
        </button>
      </div>
    </Dropdown>
  );
}
