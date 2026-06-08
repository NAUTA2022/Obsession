import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from '../../components/ui/Modal';
import {
  adminService,
  type AdminUser,
  type ListUsersParams,
  type UserStatus,
} from '../../services/api/admin.service';
import { USER_ROLES, type UserRole } from '../../types/auth';
import { useAuthStore } from '../../store/auth';

const ROLE_OPTIONS: UserRole[] = [
  USER_ROLES.ADMIN,
  USER_ROLES.CREATOR,
  USER_ROLES.CUSTOMER,
  USER_ROLES.MODERATOR,
];

const STATUS_OPTIONS: UserStatus[] = ['active', 'inactive', 'suspended', 'pending'];

const roleBadgeClass: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-700',
  creator: 'bg-pink-100 text-pink-700',
  customer: 'bg-blue-100 text-blue-700',
  moderator: 'bg-amber-100 text-amber-700',
};

const statusBadgeClass: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-600',
  suspended: 'bg-red-100 text-red-700',
  pending: 'bg-yellow-100 text-yellow-700',
};

type ModalKind =
  | { type: 'role'; user: AdminUser }
  | { type: 'status'; user: AdminUser }
  | { type: 'reset'; user: AdminUser }
  | { type: 'logout'; user: AdminUser }
  | { type: 'delete'; user: AdminUser }
  | { type: 'restore'; user: AdminUser }
  | { type: 'resetResult'; user: AdminUser; token: string; expiresAt: string }
  | null;

export default function AdminUsersPage() {
  const me = useAuthStore((s) => s.user);
  const [params, setParams] = useState<ListUsersParams>({ page: 1, limit: 20 });
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalKind>(null);
  const [working, setWorking] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.listUsers(params);
      if (res.success && res.data) {
        setUsers(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const closeModal = () => setModal(null);

  const handleChangeRole = async (user: AdminUser, role: UserRole) => {
    setWorking(true);
    try {
      await adminService.changeRole(user.id, role);
      toast.success(`Rol actualizado a ${role}`);
      closeModal();
      await fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar rol');
    } finally {
      setWorking(false);
    }
  };

  const handleChangeStatus = async (user: AdminUser, status: UserStatus) => {
    setWorking(true);
    try {
      await adminService.changeStatus(user.id, status);
      toast.success(`Status actualizado a ${status}`);
      closeModal();
      await fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al cambiar status');
    } finally {
      setWorking(false);
    }
  };

  const handleResetPassword = async (user: AdminUser) => {
    setWorking(true);
    try {
      const res = await adminService.resetPassword(user.id);
      if (res.success && res.data) {
        setModal({ type: 'resetResult', user, token: res.data.token, expiresAt: res.data.expiresAt });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al generar token');
    } finally {
      setWorking(false);
    }
  };

  const handleForceLogout = async (user: AdminUser) => {
    setWorking(true);
    try {
      await adminService.forceLogout(user.id);
      toast.success('Sesiones invalidadas');
      closeModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al forzar logout');
    } finally {
      setWorking(false);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    setWorking(true);
    try {
      await adminService.softDelete(user.id);
      toast.success('Usuario eliminado');
      closeModal();
      await fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al eliminar');
    } finally {
      setWorking(false);
    }
  };

  const handleRestore = async (user: AdminUser) => {
    setWorking(true);
    try {
      await adminService.restore(user.id);
      toast.success('Usuario restaurado');
      closeModal();
      await fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al restaurar');
    } finally {
      setWorking(false);
    }
  };

  const updateFilter = (patch: Partial<ListUsersParams>) =>
    setParams((p) => ({ ...p, ...patch, page: 1 }));

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Gestión de usuarios</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {total} usuario{total === 1 ? '' : 's'} en total
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Buscar por email, usuario o nombre…"
          className="flex-1 min-w-[240px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#6F5AF6]/30"
          value={params.search ?? ''}
          onChange={(e) => updateFilter({ search: e.target.value || undefined })}
        />
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          value={params.role ?? ''}
          onChange={(e) => updateFilter({ role: (e.target.value || undefined) as UserRole | undefined })}
        >
          <option value="">Todos los roles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          value={params.status ?? ''}
          onChange={(e) => updateFilter({ status: (e.target.value || undefined) as UserStatus | undefined })}
        >
          <option value="">Todos los estados</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={!!params.includeDeleted}
            onChange={(e) => updateFilter({ includeDeleted: e.target.checked || undefined })}
          />
          Incluir eliminados
        </label>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Usuario</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Rol</th>
              <th className="text-left px-4 py-3 font-medium">Estado</th>
              <th className="text-left px-4 py-3 font-medium">Creado</th>
              <th className="text-right px-4 py-3 font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">Cargando…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">Sin usuarios</td></tr>
            ) : users.map((u) => {
              const isSelf = me?.id === u.id;
              const isDeleted = !!u.deletedAt;
              return (
                <tr key={u.id} className="border-t border-gray-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600 overflow-hidden">
                        {u.profilePicture ? (
                          <img src={u.profilePicture} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (u.firstName?.[0] ?? '?').toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {u.firstName} {u.lastName}
                          {isSelf && <span className="ml-2 text-xs text-gray-400">(tú)</span>}
                        </div>
                        <div className="text-xs text-gray-500">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${roleBadgeClass[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusBadgeClass[u.status]}`}>
                      {u.status}
                    </span>
                    {isDeleted && (
                      <span className="ml-2 inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-600">
                        eliminado
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex gap-1 flex-wrap justify-end">
                      <ActionButton disabled={isSelf} onClick={() => setModal({ type: 'role', user: u })}>Rol</ActionButton>
                      <ActionButton disabled={isSelf} onClick={() => setModal({ type: 'status', user: u })}>Estado</ActionButton>
                      <ActionButton onClick={() => setModal({ type: 'reset', user: u })}>Reset pwd</ActionButton>
                      <ActionButton disabled={isSelf} onClick={() => setModal({ type: 'logout', user: u })}>Force logout</ActionButton>
                      {isDeleted ? (
                        <ActionButton variant="success" onClick={() => setModal({ type: 'restore', user: u })}>Restaurar</ActionButton>
                      ) : (
                        <ActionButton variant="danger" disabled={isSelf} onClick={() => setModal({ type: 'delete', user: u })}>Eliminar</ActionButton>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
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

      {modal?.type === 'role' && (
        <SimpleSelectModal
          title={`Cambiar rol de @${modal.user.username}`}
          current={modal.user.role}
          options={ROLE_OPTIONS}
          working={working}
          onClose={closeModal}
          onConfirm={(v) => handleChangeRole(modal.user, v as UserRole)}
        />
      )}
      {modal?.type === 'status' && (
        <SimpleSelectModal
          title={`Cambiar estado de @${modal.user.username}`}
          current={modal.user.status}
          options={STATUS_OPTIONS}
          working={working}
          onClose={closeModal}
          onConfirm={(v) => handleChangeStatus(modal.user, v as UserStatus)}
        />
      )}
      {modal?.type === 'reset' && (
        <ConfirmModal
          title="Generar token de reset de contraseña"
          message={`Se generará un token de 24h para @${modal.user.username}. Se mostrará una sola vez.`}
          confirmLabel="Generar"
          working={working}
          onClose={closeModal}
          onConfirm={() => handleResetPassword(modal.user)}
        />
      )}
      {modal?.type === 'logout' && (
        <ConfirmModal
          title="Forzar cierre de sesiones"
          message={`Todos los tokens activos de @${modal.user.username} dejarán de funcionar.`}
          confirmLabel="Forzar logout"
          working={working}
          onClose={closeModal}
          onConfirm={() => handleForceLogout(modal.user)}
        />
      )}
      {modal?.type === 'delete' && (
        <ConfirmModal
          title="Eliminar usuario"
          message={`¿Eliminar a @${modal.user.username}? Es un soft delete, podrás restaurarlo.`}
          confirmLabel="Eliminar"
          variant="danger"
          working={working}
          onClose={closeModal}
          onConfirm={() => handleDelete(modal.user)}
        />
      )}
      {modal?.type === 'restore' && (
        <ConfirmModal
          title="Restaurar usuario"
          message={`¿Restaurar a @${modal.user.username}?`}
          confirmLabel="Restaurar"
          working={working}
          onClose={closeModal}
          onConfirm={() => handleRestore(modal.user)}
        />
      )}
      {modal?.type === 'resetResult' && (
        <Modal isOpen onClose={closeModal} maxWidth="md">
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Token generado</h3>
            <p className="text-sm text-gray-500">
              Para @{modal.user.username}. Válido hasta {new Date(modal.expiresAt).toLocaleString()}. Cópialo ahora,
              no se mostrará de nuevo.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 font-mono text-xs break-all">
              {modal.token}
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(modal.token);
                  toast.success('Token copiado');
                }}
                className="px-4 py-2 bg-[#6F5AF6] text-white text-sm rounded-lg hover:opacity-90"
              >
                Copiar
              </button>
              <button onClick={closeModal} className="px-4 py-2 border border-gray-200 text-sm rounded-lg">
                Cerrar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = 'default',
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'danger' | 'success';
}) {
  const base = 'text-xs px-2 py-1 rounded border transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const styles = {
    default: 'border-gray-200 text-gray-700 hover:bg-gray-50',
    danger: 'border-red-200 text-red-600 hover:bg-red-50',
    success: 'border-green-200 text-green-700 hover:bg-green-50',
  } as const;
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
}

function SimpleSelectModal({
  title,
  current,
  options,
  working,
  onClose,
  onConfirm,
}: {
  title: string;
  current: string;
  options: readonly string[];
  working: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
}) {
  const [value, setValue] = useState(current);
  return (
    <Modal isOpen onClose={onClose} maxWidth="sm">
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <select
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        >
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-sm rounded-lg">
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(value)}
            disabled={working || value === current}
            className="px-4 py-2 bg-[#6F5AF6] text-white text-sm rounded-lg disabled:opacity-50"
          >
            {working ? 'Guardando…' : 'Confirmar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function ConfirmModal({
  title,
  message,
  confirmLabel,
  variant = 'default',
  working,
  onClose,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  variant?: 'default' | 'danger';
  working: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal isOpen onClose={onClose} maxWidth="sm">
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-sm rounded-lg">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={working}
            className={`px-4 py-2 text-white text-sm rounded-lg disabled:opacity-50 ${
              variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-[#6F5AF6] hover:opacity-90'
            }`}
          >
            {working ? 'Procesando…' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
