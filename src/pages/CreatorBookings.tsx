import { useEffect, useState, useCallback } from 'react';
import {
  Video, Phone, CalendarX, Clock, ShieldCheck,
  AlertTriangle, CheckCircle2, XCircle, KeyRound,
  ChevronRight, User, X, MessageCircle, Star,
  Calendar, DollarSign, Mail, AtSign,
  BellRing, CalendarClock, Percent, Timer,
  Send, CheckCheck, Ban, MoreHorizontal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import bookingsService from '../services/api/bookings.service';
import type { Booking, BookingStatus } from '../types/bookings';

/* ── helpers ─────────────────────────────────────────────── */

function fmtShort(iso: string) {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}
function fmtPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency', currency: (currency || 'USD').toUpperCase(),
  }).format(cents / 100);
}
function fmtDuration(sec: number) {
  const m = Math.round(sec / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}min` : ''}` : `${m} min`;
}
function fmtTime(iso: string) {
  return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
}
function minsLate(scheduledStart: string): number {
  return Math.floor((Date.now() - new Date(scheduledStart).getTime()) / 60_000);
}
function canJoinNow(b: Booking) {
  const now = Date.now();
  const start = new Date(b.scheduledStart).getTime();
  const end   = new Date(b.scheduledEnd).getTime();
  return now >= start - 5 * 60_000 && now <= end + 5 * 60_000;
}
function isManageable(b: Booking): boolean {
  return (b.status === 'paid' || b.status === 'in_progress') &&
    new Date(b.scheduledEnd).getTime() > Date.now();
}

/* ── status config ───────────────────────────────────────── */

const STATUS_CFG: Record<BookingStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending_payment:    { label: 'Pago pendiente',          color: 'text-amber-500 bg-amber-500/10',       icon: <Clock className="w-3 h-3" /> },
  paid:               { label: 'Pago en custodia',        color: 'text-violet-400 bg-violet-500/10',     icon: <ShieldCheck className="w-3 h-3" /> },
  in_progress:        { label: 'En curso',                color: 'text-blue-400 bg-blue-500/10',         icon: <Video className="w-3 h-3" /> },
  completed:          { label: 'Completada',              color: 'text-emerald-400 bg-emerald-500/10',   icon: <CheckCircle2 className="w-3 h-3" /> },
  cancelled:          { label: 'Cancelada',               color: 'text-gray-400 bg-gray-500/10',         icon: <XCircle className="w-3 h-3" /> },
  refunded_no_show:   { label: 'Reembolso — no asistió', color: 'text-red-400 bg-red-500/10',           icon: <AlertTriangle className="w-3 h-3" /> },
  refunded_cancelled: { label: 'Reembolso — cancelada',  color: 'text-gray-400 bg-gray-500/10',         icon: <XCircle className="w-3 h-3" /> },
};

/* ── management state types ──────────────────────────────── */

type PostponeStatus = 'pending' | 'accepted' | 'declined';
interface PostponeRequest { newTime: string; status: PostponeStatus; requestedAt: string; }
interface BookingMgmt { lateNotified: boolean; lateNotifiedAt?: string; postpone?: PostponeRequest; }

/* ── compact info banner ─────────────────────────────────── */

function EscrowInfoBanner() {
  const [open, setOpen] = useState(false);
  const rules = [
    { icon: BellRing,      color: 'text-amber-400',  text: 'Sin penalización hasta 15 min' },
    { icon: Percent,       color: 'text-orange-400', text: '−10% de pago tras 15 min' },
    { icon: Ban,           color: 'text-red-400',    text: 'Cancelación automática tras 30 min' },
    { icon: CalendarClock, color: 'text-blue-400',   text: 'Aplazamiento si el cliente acepta' },
  ];
  return (
    <div className="mb-5 rounded-2xl border border-[#6850E8]/20 bg-[#6850E8]/[0.06] overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#9277F5] shrink-0" />
          <span className="text-sm font-semibold text-[#9277F5]">Pago en custodia segura</span>
          <span className="hidden sm:block text-xs text-[#9277F5]/50">· ambas partes confirman con código único</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-[#9277F5]/50 transition-transform duration-200 shrink-0 ${open ? 'rotate-90' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-white/50 leading-relaxed">
                El dinero se libera a tu cuenta solo cuando ambas partes ingresan el código único al inicio de la sesión.
                Si no asistes, el cliente recibe el reembolso automáticamente.
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {rules.map(({ icon: Icon, color, text }) => (
                  <div key={text} className="flex items-center gap-1.5 text-[11px] text-white/40">
                    <Icon className={`w-3 h-3 shrink-0 ${color}`} />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── client profile modal ────────────────────────────────── */

interface ClientInfo {
  id: string; displayName: string; username?: string;
  profilePicture?: string; email?: string;
}

function ClientProfileModal({ client, bookings, onClose, onMessage }: {
  client: ClientInfo; bookings: Booking[];
  onClose: () => void; onMessage: () => void;
}) {
  const clientBookings = bookings.filter((b) => b.clientId === client.id);
  const completed  = clientBookings.filter((b) => b.status === 'completed');
  const totalSpent = completed.reduce((s, b) => s + b.priceCents, 0);
  const recent = [...clientBookings]
    .sort((a, b) => new Date(b.scheduledStart).getTime() - new Date(a.scheduledStart).getTime())
    .slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }} transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="w-full max-w-md bg-white dark:bg-[#111118] rounded-2xl border border-gray-100 dark:border-white/[0.07] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-24 bg-gradient-to-br from-[#6850E8]/30 via-[#9277F5]/20 to-transparent">
          <button onClick={onClose} className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-black/20 hover:bg-black/30 flex items-center justify-center text-white/70 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 pb-5">
          <div className="-mt-10 flex items-end justify-between mb-4">
            <div className="relative">
              {client.profilePicture
                ? <img src={client.profilePicture} alt={client.displayName} className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-[#111118]" />
                : <div className="w-20 h-20 rounded-2xl bg-[#6850E8]/20 ring-4 ring-white dark:ring-[#111118] flex items-center justify-center"><User className="w-8 h-8 text-[#9277F5]" /></div>
              }
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <Star className="w-3 h-3 fill-current" /> 4.8
            </div>
          </div>
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{client.displayName}</h2>
            {client.username && <p className="text-sm text-gray-400 dark:text-white/40 mt-0.5 flex items-center gap-1"><AtSign className="w-3 h-3" />{client.username}</p>}
            {client.email    && <p className="text-sm text-gray-500 dark:text-white/50 mt-1 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400 dark:text-white/30" />{client.email}</p>}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-5">
            {[
              { icon: Calendar,     label: 'Sesiones',     value: clientBookings.length },
              { icon: CheckCircle2, label: 'Completadas',  value: completed.length },
              { icon: DollarSign,   label: 'Total gastado', value: `$${(totalSpent / 100).toFixed(0)}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.05] p-3">
                <Icon className="w-4 h-4 text-[#9277F5]" />
                <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
                <span className="text-[10px] text-gray-400 dark:text-white/30 text-center leading-tight">{label}</span>
              </div>
            ))}
          </div>
          {recent.length > 0 && (
            <div className="mb-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-2">Sesiones recientes</p>
              <div className="space-y-1.5">
                {recent.map((s) => {
                  const sc = STATUS_CFG[s.status] ?? STATUS_CFG['paid'];
                  return (
                    <div key={s.id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] px-3 py-2.5 border border-gray-100 dark:border-white/[0.04]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.status === 'completed' ? 'bg-emerald-400' : s.status.startsWith('refunded') ? 'bg-red-400' : 'bg-amber-400'}`} />
                        <span className="text-xs text-gray-600 dark:text-white/60 truncate">
                          {new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' }).format(new Date(s.scheduledStart))}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${sc.color}`}>{sc.label}</span>
                        <span className="text-xs font-semibold text-gray-700 dark:text-white/70">{fmtPrice(s.priceCents, s.currency)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={onMessage} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6850E8] hover:bg-[#5940d8] text-white text-sm font-semibold transition-colors">
              <MessageCircle className="w-4 h-4" /> Enviar mensaje
            </button>
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/[0.04] text-sm font-medium transition-colors">
              Cerrar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── postpone modal ──────────────────────────────────────── */

function PostponeModal({ booking, onClose, onSubmit }: {
  booking: Booking; onClose: () => void;
  onSubmit: (bookingId: string, newTime: string) => void;
}) {
  const origStart = new Date(booking.scheduledStart);
  const defaultNew = new Date(origStart.getTime() + 30 * 60_000);
  const toLocalInput = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const [newTime, setNewTime] = useState(toLocalInput(defaultNew));
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const minTime = toLocalInput(new Date(origStart.getTime() + 5 * 60_000));
  const rawClient = (booking as unknown as { client?: { displayName?: string } }).client;
  const clientName = rawClient?.displayName ?? `Cliente ${booking.clientId.slice(0, 6)}`;
  const newDate = new Date(newTime);
  const diffMin = Math.round((newDate.getTime() - origStart.getTime()) / 60_000);

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    onSubmit(booking.id, new Date(newTime).toISOString());
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }} transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="w-full max-w-md bg-white dark:bg-[#111118] rounded-2xl border border-gray-100 dark:border-white/[0.07] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <CalendarClock className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Solicitar aplazamiento</h3>
              <p className="text-xs text-gray-400 dark:text-white/40">{clientName} debe aceptar el cambio</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-1">Hora actual</p>
            <p className="text-sm font-semibold text-gray-700 dark:text-white/80">{fmtShort(booking.scheduledStart)}</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-white/60 mb-1.5">Nueva hora propuesta</label>
            <input type="datetime-local" value={newTime} min={minTime} onChange={(e) => setNewTime(e.target.value)}
              className="w-full rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6850E8]/40 transition-all" />
            {diffMin > 0 && (
              <p className="text-xs text-gray-400 dark:text-white/40 mt-1.5 flex items-center gap-1">
                <Timer className="w-3 h-3" />
                +{diffMin >= 60 ? `${Math.floor(diffMin / 60)}h ${diffMin % 60 > 0 ? `${diffMin % 60}min` : ''}`.trim() : `${diffMin} min`} después
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-white/60 mb-1.5">
              Motivo <span className="font-normal text-gray-400 dark:text-white/30">(opcional)</span>
            </label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Tuve una emergencia, ¿podemos mover la sesión?" rows={2}
              className="w-full rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#6850E8]/40 resize-none transition-all" />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSubmit} disabled={submitting || !newTime || diffMin <= 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6850E8] hover:bg-[#5940d8] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors">
              {submitting
                ? <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Enviando…</>
                : <><Send className="w-4 h-4" />Enviar solicitud</>}
            </button>
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/[0.04] text-sm font-medium transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── cancel confirm modal ────────────────────────────────── */

function CancelModal({ booking, onClose, onConfirm }: {
  booking: Booking; onClose: () => void; onConfirm: () => void;
}) {
  const rawClient = (booking as unknown as { client?: { displayName?: string } }).client;
  const clientName = rawClient?.displayName ?? `Cliente ${booking.clientId.slice(0, 6)}`;
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    onConfirm();
    onClose();
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 8 }} transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="w-full max-w-sm bg-white dark:bg-[#111118] rounded-2xl border border-gray-100 dark:border-white/[0.07] shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Cancelar reserva</h3>
            <p className="text-xs text-gray-500 dark:text-white/40 mt-1 leading-relaxed">
              Se enviará una notificación a <strong className="text-gray-700 dark:text-white/70">{clientName}</strong> y se procesará el reembolso automáticamente.
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-amber-500/8 border border-amber-500/20 p-3 text-xs text-amber-400 mb-5">
          <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5 mb-0.5" />
          Esta acción no se puede deshacer. El pago en custodia será liberado al cliente.
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/[0.04] text-sm font-medium transition-colors">
            Volver
          </button>
          <button onClick={handleConfirm} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
            {loading ? <><div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />Cancelando…</> : <><Ban className="w-4 h-4" />Sí, cancelar</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── booking card ────────────────────────────────────────── */

interface CardProps {
  booking: Booking;
  mgmt: BookingMgmt;
  onJoin: (id: string) => void;
  onClientClick: (client: ClientInfo) => void;
  onLateNotify: (id: string) => void;
  onOpenPostpone: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
}

function BookingCard({ booking: b, mgmt, onJoin, onClientClick, onLateNotify, onOpenPostpone, onCancel }: CardProps) {
  const cfg        = STATUS_CFG[b.status] ?? STATUS_CFG['paid'];
  const joinable   = canJoinNow(b);
  const manageable = isManageable(b);
  const late       = minsLate(b.scheduledStart);
  const [showMore, setShowMore] = useState(false);

  const showPenalty   = manageable && late > 15 && late <= 30;
  const showCancelled = manageable && late > 30;

  const rawClient = (b as unknown as { client?: { id?: string; displayName?: string; username?: string; profilePicture?: string; email?: string } }).client;
  const clientInfo: ClientInfo = {
    id: rawClient?.id ?? b.clientId,
    displayName: rawClient?.displayName ?? `Cliente ${b.clientId.slice(0, 6)}`,
    username: rawClient?.username,
    profilePicture: rawClient?.profilePicture,
    email: rawClient?.email,
  };

  // Left accent color
  const accentColor = joinable
    ? 'bg-[#6850E8]'
    : showCancelled ? 'bg-red-500'
    : showPenalty   ? 'bg-orange-400'
    : manageable    ? 'bg-violet-400/60'
    : 'bg-gray-200 dark:bg-white/[0.08]';

  const postpone = mgmt.postpone;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] overflow-hidden flex shadow-sm"
    >
      {/* Left accent */}
      <div className={`w-1 shrink-0 ${accentColor} transition-colors duration-300`} />

      <div className="flex-1 min-w-0 p-4 space-y-3">

        {/* ── Header: avatar + name + status ── */}
        <div className="flex items-center gap-3">
          <button onClick={() => onClientClick(clientInfo)} className="shrink-0 group focus:outline-none">
            {clientInfo.profilePicture
              ? <img src={clientInfo.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-[#6850E8]/40 transition-all" />
              : <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center ring-2 ring-transparent group-hover:ring-[#6850E8]/40 transition-all">
                  <User className="w-5 h-5 text-white" />
                </div>
            }
          </button>

          <div className="flex-1 min-w-0">
            <button
              onClick={() => onClientClick(clientInfo)}
              className="text-sm font-semibold text-gray-900 dark:text-white/90 hover:text-[#6850E8] dark:hover:text-[#9277F5] transition-colors text-left block leading-tight truncate w-full"
            >
              {clientInfo.displayName}
            </button>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-1.5 py-0.5 shrink-0 ${b.mode === 'video' ? 'bg-violet-500/10 text-violet-400' : 'bg-blue-500/10 text-blue-400'}`}>
                {b.mode === 'video' ? <Video className="w-2.5 h-2.5" /> : <Phone className="w-2.5 h-2.5" />}
                {b.mode === 'video' ? 'Video' : 'Audio'}
              </span>
              <span className="text-[11px] text-gray-400 dark:text-white/30 truncate">
                {(b as unknown as { callPlan?: { title?: string } }).callPlan?.title ?? ''}
              </span>
            </div>
          </div>

          <span className={`shrink-0 flex items-center gap-1 text-[10px] font-semibold rounded-full px-2 py-0.5 ${cfg.color}`}>
            {cfg.icon}{cfg.label}
          </span>
        </div>

        {/* ── Time + price ── */}
        <div className="flex items-center justify-between gap-2 bg-gray-50 dark:bg-white/[0.03] rounded-xl px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-white/40 min-w-0">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">
              {postpone?.status === 'accepted'
                ? <><s className="opacity-50">{fmtShort(b.scheduledStart)}</s>{' → '}<span className="text-emerald-400 font-medium">{fmtShort(postpone.newTime)}</span></>
                : fmtShort(b.scheduledStart)
              }
            </span>
            <span className="text-gray-300 dark:text-white/15 shrink-0">·</span>
            <span className="shrink-0">{fmtDuration(b.durationSeconds)}</span>
          </div>
          <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0">
            {fmtPrice(b.priceCents, b.currency)}
          </span>
        </div>

        {/* ── Join CTA (only when joinable) ── */}
        {joinable && (
          <motion.button
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            onClick={() => onJoin(b.id)}
            className="w-full py-3 rounded-xl bg-[#6850E8] hover:bg-[#5940d8] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#6850E8]/20"
          >
            <KeyRound className="w-4 h-4" />
            Ingresar con código único
            <ChevronRight className="w-4 h-4 opacity-60" />
          </motion.button>
        )}

        {/* ── Compact alert banners ── */}
        <AnimatePresence>
          {showCancelled && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
              <Ban className="w-3.5 h-3.5 shrink-0" />
              <span>Cancelada automáticamente · reembolso al cliente procesado</span>
            </motion.div>
          )}
          {showPenalty && !showCancelled && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 rounded-xl bg-orange-500/10 border border-orange-500/20 px-3 py-2 text-xs text-orange-400">
              <Percent className="w-3.5 h-3.5 shrink-0" />
              <span><strong>{late} min de retraso</strong> · descuento del 10% activo · cancelación en {30 - late} min</span>
            </motion.div>
          )}
          {postpone?.status === 'pending' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 rounded-xl bg-blue-500/10 border border-blue-500/20 px-3 py-2 text-xs text-blue-400">
              <div className="w-3 h-3 rounded-full border-2 border-blue-400 border-t-transparent animate-spin shrink-0" />
              <span>Aplazamiento pendiente → <strong>{fmtTime(postpone.newTime)}</strong></span>
            </motion.div>
          )}
          {postpone?.status === 'accepted' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-400">
              <CheckCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Sesión movida a las <strong>{fmtTime(postpone.newTime)}</strong> · cliente confirmó</span>
            </motion.div>
          )}
          {postpone?.status === 'declined' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-400">
              <XCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Cliente rechazó el aplazamiento · horario original activo</span>
            </motion.div>
          )}
          {mgmt.lateNotified && !postpone && !showCancelled && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-400">
              <BellRing className="w-3.5 h-3.5 shrink-0" />
              <span>Cliente notificado · sin penalización hasta 15 min</span>
            </motion.div>
          )}
          {b.status === 'refunded_no_show' && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-2 rounded-xl bg-red-500/8 border border-red-500/20 px-3 py-2 text-xs text-red-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Reembolso por no asistencia · sin registro de las dos partes</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Management actions (active bookings only) ── */}
        {manageable && !showCancelled && postpone?.status !== 'accepted' && (
          <div className="flex items-center gap-2">
            {/* Llegaré tarde */}
            <button
              onClick={() => onLateNotify(b.id)}
              disabled={mgmt.lateNotified}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                mgmt.lateNotified
                  ? 'bg-amber-500/8 border-amber-500/15 text-amber-400/50 cursor-default'
                  : 'bg-amber-500/8 border-amber-500/20 text-amber-500 dark:text-amber-400 hover:bg-amber-500/15'
              }`}
            >
              <BellRing className="w-3.5 h-3.5 shrink-0" />
              {mgmt.lateNotified ? 'Notificado' : 'Llegaré tarde'}
            </button>

            {/* Aplazar */}
            <button
              onClick={() => onOpenPostpone(b)}
              disabled={postpone?.status === 'pending'}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                postpone?.status === 'pending'
                  ? 'bg-blue-500/8 border-blue-500/15 text-blue-400/50 cursor-default'
                  : 'bg-blue-500/8 border-blue-500/20 text-blue-500 dark:text-blue-400 hover:bg-blue-500/15'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5 shrink-0" />
              {postpone?.status === 'declined' ? 'Reintentar' : 'Aplazar'}
            </button>

            {/* More options */}
            <div className="relative">
              <button
                onClick={() => setShowMore(!showMore)}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/[0.08] text-gray-400 dark:text-white/30 hover:bg-gray-50 dark:hover:bg-white/[0.05] hover:text-gray-600 dark:hover:text-white/50 transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {showMore && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.92, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.92, y: -4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute bottom-10 right-0 w-44 rounded-2xl bg-white dark:bg-[#1a1a28] border border-gray-100 dark:border-white/[0.08] shadow-xl overflow-hidden z-20"
                  >
                    <button
                      onClick={() => { setShowMore(false); onClientClick(clientInfo); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-gray-600 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-gray-400 dark:text-white/30" />
                      Ver perfil del cliente
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-white/[0.06] mx-3" />
                    <button
                      onClick={() => { setShowMore(false); onCancel(b); }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-red-500 hover:bg-red-500/5 transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      Cancelar reserva
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── section ─────────────────────────────────────────────── */

function Section({ title, subtitle, count, children, empty, variant = 'default' }: {
  title: string; subtitle?: string; count: number;
  children: React.ReactNode; empty?: React.ReactNode;
  variant?: 'default' | 'danger';
}) {
  const countCls = variant === 'danger' ? 'bg-red-500/15 text-red-400' : 'bg-[#6850E8]/15 text-[#9277F5]';
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white/90">{title}</h2>
        {count > 0 && <span className={`text-xs font-bold rounded-full px-2 py-0.5 ${countCls}`}>{count}</span>}
      </div>
      {subtitle && <p className="text-xs text-gray-400 dark:text-white/30 mb-4">{subtitle}</p>}
      {count === 0 ? empty : <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">{children}</div>}
    </section>
  );
}

/* ── demo seeds ──────────────────────────────────────────── */

const DEMO_SEEDS: Record<string, BookingMgmt> = {
  b3:  { lateNotified: true,  lateNotifiedAt: new Date().toISOString() },
  b6:  { lateNotified: true,  lateNotifiedAt: new Date().toISOString() },
  b8:  { lateNotified: false, postpone: { newTime: '2026-06-09T16:30:00Z', status: 'pending',  requestedAt: new Date().toISOString() } },
  b9:  { lateNotified: false, postpone: { newTime: '2026-06-10T15:30:00Z', status: 'accepted', requestedAt: new Date().toISOString() } },
  b10: { lateNotified: true,  lateNotifiedAt: new Date().toISOString(), postpone: { newTime: '2026-06-11T13:00:00Z', status: 'declined', requestedAt: new Date().toISOString() } },
};

/* ── page ────────────────────────────────────────────────── */

type TabValue = 'active' | 'past';

export default function CreatorBookings() {
  const [tab,            setTab]            = useState<TabValue>('active');
  const [bookings,       setBookings]       = useState<Booking[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [selectedClient, setSelectedClient] = useState<ClientInfo | null>(null);
  const [postponeTarget, setPostponeTarget] = useState<Booking | null>(null);
  const [cancelTarget,   setCancelTarget]   = useState<Booking | null>(null);
  const [mgmtMap,        setMgmtMap]        = useState<Record<string, BookingMgmt>>({});
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await bookingsService.listMine({ as: 'creator' });
        setBookings(data);
        const seed: Record<string, BookingMgmt> = {};
        data.forEach((b) => { seed[b.id] = DEMO_SEEDS[b.id] ?? { lateNotified: false }; });
        setMgmtMap(seed);
      } catch {
        toast.error('No pudimos cargar tus reservas');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getMgmt = useCallback((id: string): BookingMgmt => mgmtMap[id] ?? { lateNotified: false }, [mgmtMap]);
  const patchMgmt = useCallback((id: string, patch: Partial<BookingMgmt>) =>
    setMgmtMap((prev) => ({ ...prev, [id]: { ...prev[id] ?? { lateNotified: false }, ...patch } })), []);

  const handleLateNotify = useCallback((bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    const name = (booking as unknown as { client?: { displayName?: string } })?.client?.displayName ?? 'El cliente';
    patchMgmt(bookingId, { lateNotified: true, lateNotifiedAt: new Date().toISOString() });
    toast.success(`Notificación enviada a ${name}`);
  }, [bookings, patchMgmt]);

  const handlePostponeSubmit = useCallback((bookingId: string, newTime: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    const name = (booking as unknown as { client?: { displayName?: string } })?.client?.displayName ?? 'El cliente';
    patchMgmt(bookingId, { postpone: { newTime, status: 'pending', requestedAt: new Date().toISOString() } });
    toast(`Solicitud enviada a ${name}…`);
    const accepted = Math.random() > 0.35;
    setTimeout(() => {
      patchMgmt(bookingId, { postpone: { newTime, status: accepted ? 'accepted' : 'declined', requestedAt: new Date().toISOString() } });
      if (accepted) toast.success(`${name} aceptó el aplazamiento`, { duration: 5000 });
      else toast.error(`${name} rechazó el aplazamiento`, { duration: 5000 });
    }, 4000);
  }, [bookings, patchMgmt]);

  const handleCancelConfirm = useCallback(() => {
    if (!cancelTarget) return;
    setBookings(prev => prev.map(b => b.id === cancelTarget.id ? { ...b, status: 'cancelled' as BookingStatus } : b));
    toast.success('Reserva cancelada · reembolso procesado al cliente');
  }, [cancelTarget]);

  const now = new Date();
  const _allActive    = bookings.filter((b) => b.status === 'paid' && new Date(b.scheduledEnd) > now).sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());
  const autoCancelled = _allActive.filter((b) => minsLate(b.scheduledStart) > 30);
  const incoming      = _allActive.filter((b) => minsLate(b.scheduledStart) <= 30);
  const upcoming      = bookings.filter((b) => b.status === 'in_progress' && new Date(b.scheduledEnd) > now).sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());
  const past          = bookings.filter((b) => ['completed', 'cancelled', 'refunded_no_show', 'refunded_cancelled'].includes(b.status) || new Date(b.scheduledEnd) < now).sort((a, b) => new Date(b.scheduledStart).getTime() - new Date(a.scheduledStart).getTime());

  const cardProps = (b: Booking) => ({
    booking: b, mgmt: getMgmt(b.id),
    onJoin: (id: string) => { const raw = bookings.find((bk) => bk.id === id); navigate(`/calls/${id}`, { state: { booking: raw } }); },
    onClientClick: setSelectedClient,
    onLateNotify: handleLateNotify,
    onOpenPostpone: setPostponeTarget,
    onCancel: setCancelTarget,
  });

  const EMPTY_STATE = (msg: string) => (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-white/20 gap-2">
      <CalendarX className="w-10 h-10" strokeWidth={1.2} />
      <p className="text-sm">{msg}</p>
    </div>
  );

  return (
    <div className="w-full animate-fade-in max-w-5xl">

      {/* Modals */}
      <AnimatePresence>
        {selectedClient && (
          <ClientProfileModal client={selectedClient} bookings={bookings} onClose={() => setSelectedClient(null)}
            onMessage={() => { toast.success(`Abriendo chat con ${selectedClient.displayName}…`); setSelectedClient(null); }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {postponeTarget && (
          <PostponeModal booking={postponeTarget} onClose={() => setPostponeTarget(null)}
            onSubmit={(id, time) => { handlePostponeSubmit(id, time); setPostponeTarget(null); }} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {cancelTarget && (
          <CancelModal booking={cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={handleCancelConfirm} />
        )}
      </AnimatePresence>

      {/* Page header */}
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Mis reservas</h1>
        <p className="text-sm text-gray-500 dark:text-white/40 mt-1">Gestiona las sesiones que tus clientes han reservado contigo</p>
      </div>

      {/* Escrow compact banner */}
      <EscrowInfoBanner />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-white/[0.04] rounded-xl p-1 w-fit">
        {([{ value: 'active', label: 'Activas' }, { value: 'past', label: 'Pasadas' }] as const).map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.value ? 'bg-white dark:bg-white/[0.08] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 rounded-full border-2 border-[#6850E8] border-t-transparent animate-spin" />
        </div>
      ) : tab === 'active' ? (
        <>
          <Section title="Entrantes" subtitle="Sesiones activas con pago en custodia." count={incoming.length} empty={EMPTY_STATE('No tienes reservas entrantes')}>
            {incoming.map((b) => <BookingCard key={b.id} {...cardProps(b)} />)}
          </Section>

          {autoCancelled.length > 0 && (
            <Section title="Canceladas por retraso" subtitle="Superaron 30 min de espera · reembolso procesado." count={autoCancelled.length} variant="danger">
              {autoCancelled.map((b) => <BookingCard key={b.id} {...cardProps(b)} />)}
            </Section>
          )}

          <Section title="Próximas confirmadas" subtitle="En curso o próximas a comenzar." count={upcoming.length} empty={EMPTY_STATE('No tienes sesiones próximas')}>
            {upcoming.map((b) => <BookingCard key={b.id} {...cardProps(b)} />)}
          </Section>
        </>
      ) : (
        <Section title="Historial" subtitle="Completadas, canceladas o reembolsadas." count={past.length} empty={EMPTY_STATE('No tienes reservas pasadas')}>
          {past.map((b) => <BookingCard key={b.id} {...cardProps(b)} />)}
        </Section>
      )}
    </div>
  );
}
