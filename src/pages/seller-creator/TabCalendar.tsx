import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Clock, CheckCircle2, XCircle,
  CalendarPlus, X, Bell, Check, Calendar, TrendingUp,
} from 'lucide-react';
import { MOCK_BOOKINGS, type MockBooking } from './mockData';
import toast from 'react-hot-toast';

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const STATUS_CFG = {
  upcoming:  { label: 'Próxima',    icon: Clock,        dot: 'bg-blue-500',    badge: 'bg-blue-500/10 text-blue-500',       bar: 'bg-blue-500' },
  completed: { label: 'Completada', icon: CheckCircle2, dot: 'bg-emerald-500', badge: 'bg-emerald-500/10 text-emerald-500', bar: 'bg-emerald-500' },
  cancelled: { label: 'Cancelada',  icon: XCircle,      dot: 'bg-rose-400',    badge: 'bg-rose-500/10 text-rose-400',       bar: 'bg-rose-400' },
};

const WEEKDAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const MONTHS   = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// ── Request availability modal ────────────────────────────────────────────────

function RequestAvailabilityModal({ onClose }: { onClose: () => void }) {
  const [dates, setDates] = useState('');
  const [hours, setHours] = useState('');
  const [note,  setNote]  = useState('');
  const [sent,  setSent]  = useState(false);

  const handleSend = () => {
    if (!dates.trim()) { toast.error('Indica las fechas'); return; }
    setSent(true);
    setTimeout(() => { toast.success('Solicitud enviada a la creadora'); onClose(); }, 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 24, opacity: 0 }}
        className="w-full max-w-sm bg-white dark:bg-[#1A1A2E] rounded-3xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white/90">Solicitar disponibilidad</p>
            <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">Envía una petición a la creadora</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]">
            <X className="w-4 h-4" />
          </button>
        </div>
        {sent ? (
          <div className="flex flex-col items-center justify-center py-10 px-5 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </motion.div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white/90">Enviando solicitud...</p>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/40 mb-1.5 uppercase tracking-wide">Fechas deseadas *</label>
              <input value={dates} onChange={e => setDates(e.target.value)} placeholder="Ej: lunes 12 y martes 13 de junio"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-700 dark:text-white/70 placeholder-gray-300 dark:placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6850E8]/30 transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/40 mb-1.5 uppercase tracking-wide">Horario preferido</label>
              <input value={hours} onChange={e => setHours(e.target.value)} placeholder="Ej: 14:00 - 18:00"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-700 dark:text-white/70 placeholder-gray-300 dark:placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6850E8]/30 transition-all" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/40 mb-1.5 uppercase tracking-wide">Nota adicional</label>
              <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Estrategia o contexto de ventas..."
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-700 dark:text-white/70 placeholder-gray-300 dark:placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6850E8]/30 transition-all resize-none" />
            </div>
            <button onClick={handleSend} className="w-full py-3 rounded-2xl text-sm font-semibold bg-[#6850E8] text-white hover:bg-[#5a44d4] transition-colors">
              Enviar solicitud
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Day detail panel ──────────────────────────────────────────────────────────

function DayPanel({ date, bookings, onClose }: { date: Date; bookings: MockBooking[]; onClose: () => void }) {
  const label = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute inset-0 bg-gray-50 dark:bg-[#0D0D14] z-20 flex flex-col"
    >
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 dark:border-white/[0.06] shrink-0 bg-white dark:bg-[#111118]">
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-white/90 capitalize truncate">{label}</p>
          <p className="text-xs text-gray-400 dark:text-white/30">
            {bookings.length === 0 ? 'Sin sesiones' : `${bookings.length} sesión${bookings.length !== 1 ? 'es' : ''}`}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5">
        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.04] flex items-center justify-center mb-3">
              <Calendar className="w-6 h-6 text-gray-300 dark:text-white/15" />
            </div>
            <p className="text-sm font-medium text-gray-400 dark:text-white/30">Sin sesiones este día</p>
          </div>
        ) : (
          bookings.sort((a, b) => a.time.localeCompare(b.time)).map(b => {
            const cfg = STATUS_CFG[b.status];
            const StatusIcon = cfg.icon;
            return (
              <div key={b.id} className={`flex gap-0 bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden ${b.status === 'upcoming' ? 'ring-1 ring-[#6850E8]/20' : ''}`}>
                <div className={`w-1 flex-shrink-0 ${cfg.bar}`} />
                <div className="flex-1 flex items-center gap-3 p-3.5">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${b.gradient} flex items-center justify-center flex-shrink-0`}>
                    <span className="text-xs font-bold text-white">{b.clientInitials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white/90">{b.client}</p>
                    <p className="text-xs text-gray-400 dark:text-white/30 truncate">{b.product}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <p className="text-sm font-bold text-gray-700 dark:text-white/60 tabular-nums">{b.time}</p>
                    <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                      <StatusIcon className="w-2.5 h-2.5" />
                      {cfg.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {bookings.some(b => b.status === 'upcoming') && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-white/[0.06] shrink-0">
          <button
            onClick={() => toast.success('Notificaciones enviadas a todos los clientes del día')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#6850E8]/10 text-[#6850E8] dark:text-[#9277F5] text-sm font-semibold hover:bg-[#6850E8]/20 transition-colors"
          >
            <Bell className="w-3.5 h-3.5" />
            Notificar a todos los clientes
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ── Main Calendar ─────────────────────────────────────────────────────────────

export default function TabCalendar() {
  const today = new Date();
  const [viewYear,  setViewYear]  = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [modalOpen,   setModalOpen]   = useState(false);

  // Build bookings map: key = "YYYY-MM-DD" → bookings[]
  const bookingMap = new Map<string, MockBooking[]>();
  MOCK_BOOKINGS.forEach(b => {
    const d = new Date(b.isoDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    bookingMap.set(key, [...(bookingMap.get(key) ?? []), b]);
  });

  const dayKey = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  // Calendar grid
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth     = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; month: 'prev' | 'current' | 'next'; date: Date }[] = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    cells.push({ day: d, month: 'prev', date: new Date(viewYear, viewMonth - 1, d) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month: 'current', date: new Date(viewYear, viewMonth, d) });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, month: 'next', date: new Date(viewYear, viewMonth + 1, d) });
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
    setSelectedDay(null);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
    setSelectedDay(null);
  };

  const selectedBookings = selectedDay
    ? (bookingMap.get(dayKey(selectedDay.getFullYear(), selectedDay.getMonth(), selectedDay.getDate())) ?? [])
    : [];

  const upcoming  = MOCK_BOOKINGS.filter(b => b.status === 'upcoming').length;
  const completed = MOCK_BOOKINGS.filter(b => b.status === 'completed').length;
  const revenue   = MOCK_BOOKINGS.filter(b => b.status === 'completed').reduce((s, b) => s + b.amount, 0);

  return (
    <div className="flex flex-col h-full relative overflow-hidden">

      {/* ── Header stats ── */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-4 flex items-center gap-3">
          {/* Upcoming */}
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-black text-blue-500 leading-none">{upcoming}</p>
              <p className="text-[10px] text-gray-400 dark:text-white/30 mt-0.5">Próximas</p>
            </div>
          </div>

          <div className="w-px h-8 bg-gray-100 dark:bg-white/[0.06]" />

          {/* Completed */}
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <p className="text-lg font-black text-emerald-500 leading-none">{completed}</p>
              <p className="text-[10px] text-gray-400 dark:text-white/30 mt-0.5">Completadas</p>
            </div>
          </div>

          <div className="w-px h-8 bg-gray-100 dark:bg-white/[0.06]" />

          {/* Revenue */}
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-9 h-9 rounded-xl bg-[#6850E8]/10 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-[#6850E8]" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-[#6850E8] dark:text-[#9277F5] leading-none truncate">{COP(revenue)}</p>
              <p className="text-[10px] text-gray-400 dark:text-white/30 mt-0.5">Generados</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Calendar card ── */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden">

          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-white/[0.04]">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="text-sm font-bold text-gray-900 dark:text-white/90">
              {MONTHS[viewMonth]} {viewYear}
            </p>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {WEEKDAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-bold text-gray-300 dark:text-white/20 py-1">{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-1 px-3 pb-4">
            {cells.map((cell, idx) => {
              const key = dayKey(cell.date.getFullYear(), cell.date.getMonth(), cell.date.getDate());
              const cellBookings = bookingMap.get(key) ?? [];
              const isToday    = cell.date.toDateString() === today.toDateString();
              const isSelected = selectedDay?.toDateString() === cell.date.toDateString();
              const isOther    = cell.month !== 'current';
              const hasUpcoming  = cellBookings.some(b => b.status === 'upcoming');
              const hasCompleted = cellBookings.some(b => b.status === 'completed');
              const hasCancelled = cellBookings.some(b => b.status === 'cancelled');

              return (
                <motion.button
                  key={idx}
                  whileTap={{ scale: 0.88 }}
                  onClick={() => setSelectedDay(cell.date)}
                  className={`relative flex flex-col items-center justify-center py-2 rounded-xl min-h-[48px] transition-all duration-150 ${
                    isOther ? 'opacity-20' : ''
                  } ${
                    isSelected
                      ? 'bg-[#6850E8] shadow-lg shadow-[#6850E8]/25'
                      : isToday
                      ? 'bg-[#6850E8]/10 dark:bg-[#6850E8]/15 ring-1 ring-[#6850E8]/30'
                      : cellBookings.length > 0
                      ? 'hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                      : 'hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <span className={`text-xs font-semibold leading-none ${
                    isSelected ? 'text-white'
                    : isToday  ? 'text-[#6850E8] dark:text-[#9277F5]'
                    : 'text-gray-700 dark:text-white/70'
                  }`}>
                    {cell.day}
                  </span>

                  {/* Dot indicators */}
                  {cellBookings.length > 0 && (
                    <div className="flex gap-0.5 mt-1.5">
                      {hasUpcoming  && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />}
                      {hasCompleted && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/70' : 'bg-emerald-500'}`} />}
                      {hasCancelled && <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white/50' : 'bg-rose-400'}`} />}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Legend + CTA */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-50 dark:border-white/[0.04]">
            <div className="flex items-center gap-3">
              {[
                { dot: 'bg-blue-500',    label: 'Próxima' },
                { dot: 'bg-emerald-500', label: 'Completada' },
                { dot: 'bg-rose-400',    label: 'Cancelada' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
                  <span className="text-[10px] text-gray-300 dark:text-white/20">{item.label}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6850E8] text-white text-[11px] font-semibold rounded-lg hover:bg-[#5a44d4] transition-colors shadow-sm"
            >
              <CalendarPlus className="w-3 h-3" />
              Pedir disponibilidad
            </button>
          </div>
        </div>
      </div>

      {/* Day detail panel — overlays */}
      <AnimatePresence>
        {selectedDay && (
          <DayPanel
            date={selectedDay}
            bookings={selectedBookings}
            onClose={() => setSelectedDay(null)}
          />
        )}
      </AnimatePresence>

      {/* Request availability modal */}
      <AnimatePresence>
        {modalOpen && <RequestAvailabilityModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
