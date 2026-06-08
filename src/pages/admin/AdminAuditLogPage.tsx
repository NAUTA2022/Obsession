import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  adminService,
  type AuditAction,
  type AuditEntry,
  type ListAuditParams,
} from '../../services/api/admin.service';

const ACTIONS: AuditAction[] = [
  'ROLE_CHANGED',
  'STATUS_CHANGED',
  'PASSWORD_RESET',
  'FORCE_LOGOUT',
  'USER_DELETED',
  'USER_RESTORED',
];

const actionBadge: Record<AuditAction, string> = {
  ROLE_CHANGED: 'bg-purple-100 text-purple-700',
  STATUS_CHANGED: 'bg-amber-100 text-amber-700',
  PASSWORD_RESET: 'bg-blue-100 text-blue-700',
  FORCE_LOGOUT: 'bg-orange-100 text-orange-700',
  USER_DELETED: 'bg-red-100 text-red-700',
  USER_RESTORED: 'bg-green-100 text-green-700',
};

export default function AdminAuditLogPage() {
  const [params, setParams] = useState<ListAuditParams>({ page: 1, limit: 50 });
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchAudit = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.listAudit(params);
      if (res.success && res.data) {
        setEntries(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar el audit log');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { fetchAudit(); }, [fetchAudit]);

  const updateFilter = (patch: Partial<ListAuditParams>) =>
    setParams((p) => ({ ...p, ...patch, page: 1 }));

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Audit log</h1>
        <p className="text-sm text-gray-500 mt-0.5">{total} eventos</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex flex-wrap gap-3">
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          value={params.action ?? ''}
          onChange={(e) => updateFilter({ action: (e.target.value || undefined) as AuditAction | undefined })}
        >
          <option value="">Todas las acciones</option>
          {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <input
          type="date"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          value={params.from ?? ''}
          onChange={(e) => updateFilter({ from: e.target.value || undefined })}
        />
        <input
          type="date"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          value={params.to ?? ''}
          onChange={(e) => updateFilter({ to: e.target.value || undefined })}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Fecha</th>
              <th className="text-left px-4 py-3 font-medium">Acción</th>
              <th className="text-left px-4 py-3 font-medium">Admin</th>
              <th className="text-left px-4 py-3 font-medium">Usuario afectado</th>
              <th className="text-left px-4 py-3 font-medium">Detalles</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">Cargando…</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-gray-400">Sin eventos</td></tr>
            ) : entries.map((e) => (
              <tr key={e.id} className="border-t border-gray-100 align-top">
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                  {new Date(e.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${actionBadge[e.action]}`}>
                    {e.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 text-xs">
                  {e.actor ? `@${e.actor.username}` : e.actorId}
                </td>
                <td className="px-4 py-3 text-gray-700 text-xs">
                  {e.targetUser ? `@${e.targetUser.username}` : e.targetUserId ?? '—'}
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 font-mono max-w-xs break-words whitespace-pre-wrap">
                  {e.metadata ? JSON.stringify(e.metadata) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <div>Página {params.page ?? 1} de {totalPages}</div>
        <div className="flex gap-2">
          <button
            disabled={(params.page ?? 1) <= 1}
            onClick={() => setParams((p) => ({ ...p, page: Math.max(1, (p.page ?? 1) - 1) }))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            disabled={(params.page ?? 1) >= totalPages}
            onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
            className="px-3 py-1.5 border border-gray-200 rounded-lg disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
