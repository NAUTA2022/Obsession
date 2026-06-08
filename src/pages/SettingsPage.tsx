import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Trash2, Sun, Moon, Monitor, Bell,
  Shield, ChevronRight, User, Lock,
  Check, Bot,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BotConfigPanel } from '../components/chat/BotConfigPanel';
import { useAuthStore } from '../store/auth';
import { useThemeStore } from '../theme/themeStore';
import { botService, type BotConfig } from '../services/api/bot.service';
import apiClient from '../services/api/client';
import { ROUTES } from '../constants/routes';
import toast from 'react-hot-toast';
import { useLogout } from '../hooks/useLogout';
import type { Theme } from '../theme/types';

// ── Fade-in wrapper ────────────────────────────────────────────────────────────

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

// ── Section card ───────────────────────────────────────────────────────────────

function Section({ title, icon, children, delay = 0 }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.3, delay }}
      className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] overflow-hidden shadow-sm"
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 dark:border-white/[0.04]">
        <div className="w-8 h-8 rounded-xl bg-[#6850E8]/10 flex items-center justify-center text-[#6850E8] flex-shrink-0">
          {icon}
        </div>
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
        {children}
      </div>
    </motion.div>
  );
}

// ── Toggle row ─────────────────────────────────────────────────────────────────

function ToggleRow({ label, sub, value, onChange }: {
  label: string;
  sub?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-white/80">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-[#6850E8]' : 'bg-gray-200 dark:bg-white/[0.10]'}`}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 700, damping: 35 }}
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md"
          style={{ x: value ? 20 : 0 }}
        />
      </button>
    </div>
  );
}

// ── Link row ───────────────────────────────────────────────────────────────────

function LinkRow({ label, sub, onClick }: {
  label: string;
  sub?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-gray-50/70 dark:hover:bg-white/[0.02] transition-colors text-left"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-white/80">{label}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{sub}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-white/20 flex-shrink-0" />
    </button>
  );
}

// ── Theme selector ─────────────────────────────────────────────────────────────

function ThemeSelector() {
  const theme = useThemeStore(s => s.theme);
  const setTheme = useThemeStore(s => s.setTheme);

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light',  label: 'Claro',   icon: <Sun className="w-4 h-4" />     },
    { value: 'dark',   label: 'Oscuro',  icon: <Moon className="w-4 h-4" />    },
    { value: 'system', label: 'Sistema', icon: <Monitor className="w-4 h-4" /> },
  ];

  return (
    <div className="px-5 py-4">
      <p className="text-xs text-gray-400 dark:text-white/30 mb-3">Elige cómo quieres ver la aplicación</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => setTheme(o.value)}
            className={`relative flex flex-col items-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition-all ${
              theme === o.value
                ? 'bg-[#6850E8] border-[#6850E8] text-white shadow-lg shadow-[#6850E8]/25'
                : 'border-gray-100 dark:border-white/[0.08] text-gray-500 dark:text-white/40 hover:border-gray-200 dark:hover:border-white/[0.14] bg-gray-50/50 dark:bg-white/[0.02]'
            }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              theme === o.value ? 'bg-white/20' : 'bg-gray-100 dark:bg-white/[0.06]'
            }`}>
              {o.icon}
            </div>
            {o.label}
            {theme === o.value && (
              <motion.span layoutId="theme-check" className="absolute top-2 right-2">
                <Check className="w-3 h-3" />
              </motion.span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Profile hero ───────────────────────────────────────────────────────────────

function ProfileHero({ user, onClick }: { user: { displayName?: string; email?: string; profilePicture?: string; username?: string } | null; onClick: () => void }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.3, delay: 0 }}
      onClick={onClick}
      className="cursor-pointer rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm p-5 flex items-center gap-4 hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors"
    >
      {user?.profilePicture ? (
        <img src={user.profilePicture} alt="" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100 dark:ring-white/[0.08] flex-shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6850E8] to-violet-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 shadow-lg shadow-[#6850E8]/20">
          {(user?.displayName ?? 'U')[0].toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-base font-bold text-gray-900 dark:text-white truncate">
          {user?.displayName ?? 'Usuario'}
        </p>
        {user?.username && (
          <p className="text-sm text-[#6850E8] dark:text-[#9277F5] mt-0.5">@{user.username}</p>
        )}
        <p className="text-xs text-gray-400 dark:text-white/30 truncate mt-0.5">
          {user?.email ?? ''}
        </p>
      </div>
      <div className="flex-shrink-0 flex items-center gap-2 text-xs font-semibold text-[#6850E8] dark:text-[#9277F5]">
        Editar perfil
        <ChevronRight className="w-4 h-4" />
      </div>
    </motion.div>
  );
}

// ── Delete confirm ─────────────────────────────────────────────────────────────

function DeleteConfirm({ onConfirm, onCancel, loading }: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mx-5 mb-4 rounded-2xl bg-red-50 dark:bg-red-500/[0.07] border border-red-100 dark:border-red-500/20 p-4">
        <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">¿Eliminar tu cuenta?</p>
        <p className="text-xs text-red-500/70 dark:text-red-400/60 mb-4 leading-relaxed">
          Esta acción es irreversible. Perderás todos tus datos, productos, ingresos y configuraciones.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.10] text-sm font-semibold text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? 'Eliminando…' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const navigate = useNavigate();

  const [initialBotConfig, setInitialBotConfig] = useState<Partial<BotConfig> | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const [notifs, setNotifs] = useState({
    messages:      true,
    newBookings:   true,
    payments:      true,
    sellerUpdates: false,
    marketing:     false,
    pushMobile:    true,
  });

  const [privacy, setPrivacy] = useState({
    showOnline:     true,
    profilePublic:  true,
    analyticsShare: false,
  });

  useEffect(() => {
    if (!user?.id || user.role !== 'creator') return;
    botService.getConfig(user.id)
      .then(config => { if (config) setInitialBotConfig(config); })
      .catch(() => {});
  }, [user?.id]);

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    setDeletingAccount(true);
    try {
      await apiClient.delete(`/users/${user.id}/soft`);
      toast.success('Cuenta eliminada');
      await logout();
    } catch {
      toast.error('No se pudo eliminar la cuenta. Contacta soporte.');
    } finally {
      setDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleSaveBotConfig = async (config: Partial<BotConfig>) => {
    if (!user?.id) return;
    await botService.updateConfig(user.id, config);
  };

  const toggle = (key: keyof typeof notifs) =>
    setNotifs(p => ({ ...p, [key]: !p[key] }));

  const togglePrivacy = (key: keyof typeof privacy) =>
    setPrivacy(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="w-full flex flex-col gap-5">

      {/* Header */}
      <motion.div variants={fadeUp} initial="initial" animate="animate" transition={{ duration: 0.25 }}>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configuración</h1>
        <p className="text-sm text-gray-400 dark:text-white/35 mt-0.5">
          Preferencias, privacidad y gestión de tu cuenta.
        </p>
      </motion.div>

      {/* ── Profile hero ── */}
      <ProfileHero user={user} onClick={() => navigate(ROUTES.perfil ?? '/creator/perfil')} />

      {/* ── Cuenta ── */}
      <Section title="Cuenta" icon={<User className="w-4 h-4" />} delay={0.05}>
        <LinkRow label="Cambiar contraseña" sub="Actualiza tu contraseña de acceso" onClick={() => toast('Próximamente', { icon: '🔒' })} />
        <LinkRow label="Verificación en dos pasos" sub="Añade una capa extra de seguridad" onClick={() => toast('Próximamente', { icon: '📱' })} />
      </Section>

      {/* ── Apariencia ── */}
      <Section title="Apariencia" icon={<Sun className="w-4 h-4" />} delay={0.1}>
        <ThemeSelector />
      </Section>

      {/* ── Notificaciones ── */}
      <Section title="Notificaciones" icon={<Bell className="w-4 h-4" />} delay={0.15}>
        <ToggleRow label="Nuevos mensajes"              sub="Cuando alguien te envía un mensaje"           value={notifs.messages}      onChange={() => toggle('messages')} />
        <ToggleRow label="Nuevas reservas"              sub="Cuando un cliente agenda una sesión"          value={notifs.newBookings}   onChange={() => toggle('newBookings')} />
        <ToggleRow label="Pagos y cobros"               sub="Confirmaciones de pago y retiros"             value={notifs.payments}      onChange={() => toggle('payments')} />
        <ToggleRow label="Actualizaciones de vendedores" sub="Actividad de tu equipo de ventas"            value={notifs.sellerUpdates} onChange={() => toggle('sellerUpdates')} />
        <ToggleRow label="Notificaciones push móvil"    sub="En la app y dispositivos vinculados"          value={notifs.pushMobile}    onChange={() => toggle('pushMobile')} />
        <ToggleRow label="Emails de marketing"          sub="Novedades, tips y ofertas especiales"         value={notifs.marketing}     onChange={() => toggle('marketing')} />
      </Section>

      {/* ── Privacidad ── */}
      <Section title="Privacidad" icon={<Shield className="w-4 h-4" />} delay={0.2}>
        <ToggleRow label="Mostrar estado en línea" sub="Los clientes pueden ver cuando estás activa"     value={privacy.showOnline}    onChange={() => togglePrivacy('showOnline')} />
        <ToggleRow label="Perfil público"          sub="Tu perfil aparece en búsquedas y directorios"   value={privacy.profilePublic} onChange={() => togglePrivacy('profilePublic')} />
        <ToggleRow label="Compartir datos de uso"  sub="Ayuda a mejorar la plataforma de forma anónima" value={privacy.analyticsShare} onChange={() => togglePrivacy('analyticsShare')} />
        <LinkRow   label="Descargar mis datos"     sub="Exporta una copia de toda tu información"       onClick={() => toast('Generando exportación…', { icon: '📦' })} />
      </Section>

      {/* ── Bot IA ── */}
      {user?.role === 'creator' && (
        <Section title="Asistente IA" icon={<Bot className="w-4 h-4" />} delay={0.25}>
          <div className="px-5 pb-1 pt-3">
            <p className="text-xs text-gray-400 dark:text-white/30 mb-4">
              IA de tu perfil{user.username ? ` @${user.username}` : ''} · Responde automáticamente a tus clientes.{' '}
              <span className="text-[#6850E8]/70 dark:text-[#9277F5]/60">
                Para IA de vendedores asignados ve a <strong>Equipos de Trabajo</strong>.
              </span>
            </p>
            <BotConfigPanel
              creatorId={user.id}
              initialConfig={initialBotConfig}
              onSaveConfig={handleSaveBotConfig}
            />
          </div>
        </Section>
      )}

      {/* ── Sesión y zona de peligro ── */}
      <Section title="Zona de peligro" icon={<Lock className="w-4 h-4" />} delay={0.3}>
        <div className="px-5 py-4 space-y-3">
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={async () => { await logout(); }}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-gray-100 dark:border-white/[0.08] bg-gray-50/50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/[0.05] text-gray-700 dark:text-white/60 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-white/[0.06] flex items-center justify-center shadow-sm flex-shrink-0">
              <LogOut className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Cerrar sesión</p>
              <p className="text-xs text-gray-400 dark:text-white/25 mt-0.5">Salir de tu cuenta en este dispositivo</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            onClick={() => setShowDeleteConfirm(v => !v)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-red-100 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/[0.05] hover:bg-red-50 dark:hover:bg-red-500/[0.08] text-red-600 dark:text-red-400 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-red-500/10 flex items-center justify-center shadow-sm flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold">Eliminar cuenta permanentemente</p>
              <p className="text-xs text-red-400/70 dark:text-red-400/50 mt-0.5">Esta acción no se puede deshacer</p>
            </div>
          </motion.button>
        </div>

        <AnimatePresence>
          {showDeleteConfirm && (
            <DeleteConfirm
              onConfirm={handleDeleteAccount}
              onCancel={() => setShowDeleteConfirm(false)}
              loading={deletingAccount}
            />
          )}
        </AnimatePresence>
      </Section>

      {/* Footer */}
      <p className="text-center text-[11px] text-gray-300 dark:text-white/15 pb-2">
        Obsession v2.4.1 ·{' '}
        <button className="hover:text-gray-500 transition-colors" onClick={() => toast('Términos', { icon: '📄' })}>Términos</button>
        {' · '}
        <button className="hover:text-gray-500 transition-colors" onClick={() => toast('Privacidad', { icon: '🔒' })}>Privacidad</button>
      </p>
    </div>
  );
}
