import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Copy, CheckCheck, Video, Phone,
  Clock, User, ShieldCheck, KeyRound, Sparkles,
} from 'lucide-react';
import { Box } from '@mui/material';
import { useCall } from '../components/calls/call-context';
import toast from 'react-hot-toast';

/* ── code derivation ─────────────────────────────────────────
   Deterministic per bookingId — same code every time,
   no ambiguous chars (0/O, 1/I), always 6 chars formatted XXX-XXX  */
function deriveCode(id: string): string {
  const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let h = 5381;
  for (let i = 0; i < id.length; i++) {
    h = Math.imul(h, 31) + id.charCodeAt(i) | 0;
  }
  h = Math.abs(h);
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += CHARS[h % CHARS.length];
    h = Math.abs((Math.imul(h, 1664525) + 1013904223) | 0);
  }
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

/* ── time helpers ─────────────────────────────────────────── */
function fmtDate(iso: string) {
  return new Intl.DateTimeFormat('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso));
}

function fmtDuration(sec: number) {
  const m = Math.round(sec / 60);
  return m >= 60 ? `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}min` : ''}` : `${m} min`;
}

function useCountdown(targetIso: string) {
  const [diff, setDiff] = useState(() => new Date(targetIso).getTime() - Date.now());
  useEffect(() => {
    const id = setInterval(() => setDiff(new Date(targetIso).getTime() - Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  const abs   = Math.abs(diff);
  const sign  = diff < 0 ? '-' : '+';
  const mm    = String(Math.floor(abs / 60_000)).padStart(2, '0');
  const ss    = String(Math.floor((abs % 60_000) / 1000)).padStart(2, '0');
  return { diff, sign, mm, ss, late: diff < 0 };
}

/* ── code digit tile ─────────────────────────────────────── */
function CodeTile({ char, index }: { char: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.35 + index * 0.07, type: 'spring', stiffness: 400, damping: 22 }}
      className="w-12 h-14 sm:w-14 sm:h-16 rounded-xl flex items-center justify-center
                 bg-white/[0.06] border border-white/[0.12]
                 text-2xl sm:text-3xl font-bold tracking-widest text-white
                 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
    >
      {char}
    </motion.div>
  );
}

/* ── lobby screen ─────────────────────────────────────────── */
interface BookingLike {
  id: string;
  mode: 'video' | 'audio';
  scheduledStart: string;
  scheduledEnd: string;
  durationSeconds: number;
  priceCents: number;
  currency: string;
  client?: { displayName?: string; profilePicture?: string };
  callPlan?: { title?: string };
}

function CodeLobby({
  bookingId,
  booking,
  onEnter,
}: {
  bookingId: string;
  booking: BookingLike | null;
  onEnter: () => void;
}) {
  const navigate    = useNavigate();
  const code        = deriveCode(bookingId);
  const digits      = code.replace('-', '');
  const [copied, setCopied] = useState(false);
  const [entering, setEntering] = useState(false);

  const countdown = useCountdown(booking?.scheduledStart ?? new Date().toISOString());

  const client    = booking?.client;
  const planTitle = booking?.callPlan?.title
    ?? (booking?.mode === 'video' ? 'Videollamada' : 'Llamada de audio');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.replace('-', '')).catch(() => {});
    setCopied(true);
    toast.success('Código copiado');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleEnter = () => {
    setEntering(true);
    onEnter();
  };

  return (
    <div className="fixed inset-0 bg-[#08080f] flex flex-col overflow-hidden">

      {/* ── ambient glow ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-[#6850E8]/20 blur-[120px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-[#9277F5]/10 blur-[100px]" />
      </div>

      {/* ── top bar ── */}
      <div className="relative z-10 flex items-center justify-between px-4 sm:px-6 pt-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        {/* countdown pill */}
        {booking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border ${
              countdown.late
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-white/[0.06] border-white/[0.10] text-white/60'
            }`}
          >
            <Clock className="w-3 h-3" />
            {countdown.late
              ? `${countdown.mm}:${countdown.ss} de retraso`
              : `Empieza en ${countdown.mm}:${countdown.ss}`
            }
          </motion.div>
        )}
      </div>

      {/* ── main content ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6 overflow-y-auto">

        {/* client info */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center gap-3 text-center"
        >
          {client?.profilePicture ? (
            <img src={client.profilePicture} alt="" className="w-16 h-16 rounded-2xl object-cover ring-2 ring-white/10" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
              <User className="w-7 h-7 text-white/30" />
            </div>
          )}
          <div>
            <p className="text-lg font-bold text-white leading-tight">
              {client?.displayName ?? 'Cliente'}
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className={`flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5 ${
                booking?.mode === 'video'
                  ? 'bg-violet-500/15 text-violet-400'
                  : 'bg-blue-500/15 text-blue-400'
              }`}>
                {booking?.mode === 'video' ? <Video className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                {booking?.mode === 'video' ? 'Video' : 'Audio'}
              </span>
              <span className="text-xs text-white/40">{planTitle}</span>
              {booking && (
                <>
                  <span className="text-white/20">·</span>
                  <span className="text-xs text-white/40">{fmtDuration(booking.durationSeconds)}</span>
                </>
              )}
            </div>
            {booking && (
              <p className="text-[11px] text-white/30 mt-1 capitalize">{fmtDate(booking.scheduledStart)}</p>
            )}
          </div>
        </motion.div>

        {/* divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.25 }}
          className="w-full max-w-xs h-px bg-white/[0.06]"
        />

        {/* code section */}
        <div className="flex flex-col items-center gap-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-lg bg-[#6850E8]/20 flex items-center justify-center">
              <KeyRound className="w-3.5 h-3.5 text-[#9277F5]" />
            </div>
            <p className="text-sm font-semibold text-white/60 uppercase tracking-widest text-[11px]">
              Código único de sesión
            </p>
          </motion.div>

          {/* digit tiles */}
          <div className="flex items-center gap-2">
            {digits.slice(0, 3).map((ch, i) => (
              <CodeTile key={i} char={ch} index={i} />
            ))}
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="text-2xl font-light text-white/20 mx-1"
            >
              —
            </motion.span>
            {digits.slice(3).map((ch, i) => (
              <CodeTile key={i + 3} char={ch} index={i + 3} />
            ))}
          </div>

          {/* copy button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white/90 text-sm font-medium transition-all"
          >
            <AnimatePresence mode="wait">
              {copied
                ? <motion.span key="ok" initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="flex items-center gap-2 text-emerald-400">
                    <CheckCheck className="w-4 h-4" /> Copiado
                  </motion.span>
                : <motion.span key="copy" initial={{ scale: 0.7 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                    <Copy className="w-4 h-4" /> Copiar código
                  </motion.span>
              }
            </AnimatePresence>
          </motion.button>
        </div>

        {/* instruction card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="w-full max-w-sm rounded-2xl bg-white/[0.04] border border-white/[0.07] p-4 space-y-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-xl bg-[#6850E8]/20 shrink-0 flex items-center justify-center mt-0.5">
              <Sparkles className="w-3.5 h-3.5 text-[#9277F5]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white/80 leading-tight">Cómo usar el código</p>
              <ol className="mt-2 space-y-1.5 text-xs text-white/45 leading-relaxed list-none">
                <li className="flex gap-2"><span className="text-[#9277F5] font-bold shrink-0">1.</span>Cuando el cliente se conecte, dile el código en voz alta o compártelo por chat.</li>
                <li className="flex gap-2"><span className="text-[#9277F5] font-bold shrink-0">2.</span>Ambos deben introducir el mismo código para confirmar asistencia.</li>
                <li className="flex gap-2"><span className="text-[#9277F5] font-bold shrink-0">3.</span>Al confirmar los dos, el pago en custodia se libera automáticamente a tu cuenta.</li>
              </ol>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-white/[0.05]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#9277F5] shrink-0" />
            <p className="text-[10px] text-white/30 leading-relaxed">
              El código expira al finalizar la sesión. Si ninguna parte lo introduce en los primeros 30 min, la sesión se cancela y el cliente recibe el reembolso.
            </p>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          onClick={handleEnter}
          disabled={entering}
          className="w-full max-w-sm py-3.5 rounded-2xl bg-[#6850E8] hover:bg-[#5940d8] disabled:opacity-60 text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-colors shadow-lg shadow-[#6850E8]/30"
        >
          {entering ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Conectando…
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              Entrar a la sesión
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────── */

export default function CallPage() {
  const { bookingId }  = useParams<{ bookingId: string }>();
  const location        = useLocation();
  const call            = useCall();
  const joinedRef       = useRef(false);
  const [phase, setPhase] = useState<'lobby' | 'joining'>('lobby');

  // Booking passed via router state (from CreatorBookings)
  const booking: BookingLike | null = (location.state as { booking?: BookingLike } | null)?.booking ?? null;

  const handleEnter = () => {
    if (!bookingId || joinedRef.current) return;
    joinedRef.current = true;
    setPhase('joining');
    call.joinBooking(bookingId).catch(() => undefined);
  };

  if (phase === 'lobby') {
    return (
      <AnimatePresence>
        <motion.div
          key="lobby"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <CodeLobby
            bookingId={bookingId ?? 'demo'}
            booking={booking}
            onEnter={handleEnter}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  // Phase: joining — dark bg while CallOverlay (from CallProvider) takes over
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: '#0f1419',
        zIndex: 1,
      }}
    />
  );
}
