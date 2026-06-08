import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, Button, Tooltip } from '@mui/material';
import toast from 'react-hot-toast';
import { callPlansService } from '../../services/api/callPlans.service';
import { availabilityService } from '../../services/api/availability.service';
import { bookingsService } from '../../services/api/bookings.service';
import type {
  AvailabilityResult,
  AvailabilitySlot,
  CallMode,
  CallPlan,
} from '../../types/bookings';

// ─── Helpers de fecha (Date nativo + Intl, sin date-fns) ──────────────────────

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
}
function addMonths(d: Date, n: number) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}
function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

const monthFormatter = new Intl.DateTimeFormat('es-ES', {
  month: 'long',
  year: 'numeric',
});
const slotTimeFormatter = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
});
const dayFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

function formatPrice(cents: number, currency: string) {
  try {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency?.toUpperCase() || 'EUR',
      minimumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency?.toUpperCase() || ''}`.trim();
  }
}

// ─── Tipos / Props ────────────────────────────────────────────────────────────

interface BookCallModalProps {
  open: boolean;
  onClose: () => void;
  creatorId: string;
  creatorDisplayName?: string;
  mode: CallMode;
}

type Step = 1 | 2 | 3;

// ─── Indicador de pasos ───────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }) {
  const labels: Record<Step, string> = {
    1: 'Plan',
    2: 'Fecha y hora',
    3: 'Pago',
  };
  return (
    <div className="flex items-center justify-center gap-3 mb-5">
      {[1, 2, 3].map((n) => {
        const active = step === n;
        const done = step > n;
        return (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                active
                  ? 'bg-blue-600 text-white scale-110 shadow-md'
                  : done
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-200 text-gray-500'
              }`}
            >
              {n}
            </div>
            <span
              className={`text-xs hidden sm:inline ${
                active ? 'font-semibold text-gray-800' : 'text-gray-400'
              }`}
            >
              {labels[n as Step]}
            </span>
            {n < 3 && (
              <div
                className={`w-6 h-px ${done ? 'bg-blue-300' : 'bg-gray-200'}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Paso 1: selección de plan ────────────────────────────────────────────────

function PlanStep({
  plans,
  loading,
  selectedId,
  onSelect,
}: {
  plans: CallPlan[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (p: CallPlan) => void;
}) {
  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500 animate-pulse">
        Cargando planes…
      </div>
    );
  }
  if (plans.length === 0) {
    return (
      <div className="py-10 text-center text-gray-500">
        Esta creadora aún no ofrece llamadas de este tipo.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {plans.map((p) => {
        const isSelected = selectedId === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p)}
            className={`relative text-left rounded-xl p-4 transition hover:scale-[1.02] border-2 ${
              isSelected
                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-300'
                : p.isFeatured
                  ? 'border-blue-600 bg-white shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-200'
            }`}
          >
            {p.isFeatured && (
              <span className="absolute -top-2 right-3 text-[10px] font-bold text-white bg-blue-600 px-2 py-0.5 rounded-full">
                Más popular
              </span>
            )}
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="font-semibold text-gray-900 text-sm">
                {p.title || `Llamada ${p.mode === 'video' ? 'de vídeo' : 'de voz'}`}
              </h3>
              <span className="text-xs text-gray-500">{p.durationMinutes} min</span>
            </div>
            {p.description && (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{p.description}</p>
            )}
            <p className="text-lg font-bold text-blue-700">
              {formatPrice(p.priceCents, p.currency)}
            </p>
          </button>
        );
      })}
    </div>
  );
}

// ─── Paso 2: fecha y hora ─────────────────────────────────────────────────────

function CalendarStep({
  creatorId,
  plan,
  selectedSlot,
  onSelectSlot,
}: {
  creatorId: string;
  plan: CallPlan;
  selectedSlot: AvailabilitySlot | null;
  onSelectSlot: (s: AvailabilitySlot) => void;
}) {
  const [visibleMonth, setVisibleMonth] = useState<Date>(startOfMonth(new Date()));
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const clientTz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setUnavailable(false);
      const now = new Date();
      const from = startOfMonth(visibleMonth);
      const to = endOfMonth(visibleMonth);
      const effectiveFrom = from < now ? now : from;
      try {
        const result: AvailabilityResult = await availabilityService.getSlots({
          creatorId,
          planId: plan.id,
          from: effectiveFrom.toISOString(),
          to: to.toISOString(),
        });
        if (cancelled) return;
        if (Array.isArray(result)) {
          setSlots(result);
        } else {
          setSlots([]);
          setUnavailable(true);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[BookCallModal] availability error', err);
          toast.error('No pudimos cargar la disponibilidad.');
          setSlots([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [creatorId, plan.id, visibleMonth]);

  // Mapa día → slots
  const slotsByDay = useMemo(() => {
    const map = new Map<string, AvailabilitySlot[]>();
    for (const s of slots) {
      const d = new Date(s.startAt);
      const key = dayKey(d);
      const arr = map.get(key) || [];
      arr.push(s);
      map.set(key, arr);
    }
    return map;
  }, [slots]);

  // Construcción de cuadrícula (lunes como primer día)
  const gridDays = useMemo(() => {
    const first = startOfMonth(visibleMonth);
    const last = endOfMonth(visibleMonth);
    // weekday 0=Sun … en es-ES la semana empieza en lunes
    const startWeekday = (first.getDay() + 6) % 7; // 0 si lunes
    const totalDays = last.getDate();
    const cells: Array<Date | null> = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++) {
      cells.push(new Date(first.getFullYear(), first.getMonth(), d));
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [visibleMonth]);

  const todayKey = dayKey(new Date());
  const daySlots =
    selectedDay && slotsByDay.has(dayKey(selectedDay))
      ? slotsByDay.get(dayKey(selectedDay))!
      : [];

  return (
    <div className="flex flex-col gap-3">
      {unavailable && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs px-3 py-2">
          Esta creadora no tiene su agenda disponible ahora mismo.
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
          aria-label="Mes anterior"
        >
          ‹
        </button>
        <h4 className="font-semibold text-gray-800 capitalize text-sm">
          {monthFormatter.format(visibleMonth)}
        </h4>
        <button
          type="button"
          onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
          className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500"
          aria-label="Mes siguiente"
        >
          ›
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-gray-400 font-medium">
        {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {gridDays.map((d, i) => {
          if (!d) return <div key={i} />;
          const k = dayKey(d);
          const hasSlots = slotsByDay.has(k);
          const isToday = k === todayKey;
          const isSelected = selectedDay && isSameDay(d, selectedDay);
          const isPast = d < new Date(new Date().setHours(0, 0, 0, 0));
          return (
            <button
              key={i}
              type="button"
              disabled={!hasSlots || isPast}
              onClick={() => setSelectedDay(d)}
              className={`aspect-square text-xs rounded-lg transition flex items-center justify-center relative ${
                isSelected
                  ? 'bg-blue-600 text-white font-bold'
                  : hasSlots
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium'
                    : isPast
                      ? 'text-gray-300'
                      : 'text-gray-400'
              } ${isToday && !isSelected ? 'ring-1 ring-blue-300' : ''}`}
            >
              {d.getDate()}
              {hasSlots && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="text-center text-xs text-gray-400 py-2 animate-pulse">
          Cargando disponibilidad…
        </div>
      )}

      {selectedDay && !loading && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-2 capitalize">
            {dayFormatter.format(selectedDay)}
          </p>
          {daySlots.length === 0 ? (
            <p className="text-xs text-gray-400">No hay huecos para este día.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {daySlots.map((s) => {
                const start = new Date(s.startAt);
                const end = new Date(s.endAt);
                const isSel =
                  selectedSlot &&
                  selectedSlot.startAt === s.startAt &&
                  selectedSlot.endAt === s.endAt;
                return (
                  <button
                    key={s.startAt}
                    type="button"
                    onClick={() => onSelectSlot(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition hover:scale-[1.02] ${
                      isSel
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {slotTimeFormatter.format(start)} – {slotTimeFormatter.format(end)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      <p className="text-[11px] text-gray-400 mt-1">
        Horarios mostrados en tu zona horaria ({clientTz}).
      </p>
    </div>
  );
}

// ─── Modal principal ──────────────────────────────────────────────────────────

export function BookCallModal({
  open,
  onClose,
  creatorId,
  creatorDisplayName,
  mode,
}: BookCallModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [plans, setPlans] = useState<CallPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<CallPlan | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [creatingBooking, setCreatingBooking] = useState(false);

  // Reset al abrir / cerrar
  useEffect(() => {
    if (!open) {
      setStep(1);
      setSelectedPlan(null);
      setSelectedSlot(null);
      setCreatingBooking(false);
    }
  }, [open]);

  // Cargar planes al abrir
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoadingPlans(true);
    callPlansService
      .listByCreator(creatorId, mode)
      .then((list) => {
        if (!cancelled) setPlans(list.filter((p) => p.isActive));
      })
      .catch((err) => {
        if (!cancelled) {
          console.error('[BookCallModal] plans error', err);
          toast.error('No pudimos cargar los planes.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingPlans(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, creatorId, mode]);

  const handleContinueToPayment = async () => {
    if (!selectedPlan || !selectedSlot) return;
    setCreatingBooking(true);
    try {
      const { checkoutUrl } = await bookingsService.create({
        callPlanId: selectedPlan.id,
        scheduledStart: selectedSlot.startAt,
        // Vuelve a donde está el usuario si cancela el pago en Stripe.
        cancelPath: window.location.pathname + window.location.search,
      });
      if (!checkoutUrl) {
        toast.error('No pudimos iniciar el pago. Intenta de nuevo.');
        setCreatingBooking(false);
        return;
      }
      // Redirige a la página de pago alojada por Stripe (Checkout).
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error('[BookCallModal] create booking', err);
      toast.error('No pudimos crear la reserva. Intenta de nuevo.');
      setCreatingBooking(false);
    }
  };

  const canGoNext =
    (step === 1 && !!selectedPlan) || (step === 2 && !!selectedSlot);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{ sx: { borderRadius: '20px', p: { xs: 0.5, sm: 1 } } }}
    >
      <DialogContent>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-blue-700">
            Reservar llamada {mode === 'video' ? 'de vídeo' : 'de voz'}
            {creatorDisplayName ? ` con ${creatorDisplayName}` : ''}
          </h2>
        </div>

        <StepIndicator step={step} />

        {step === 1 && (
          <PlanStep
            plans={plans}
            loading={loadingPlans}
            selectedId={selectedPlan?.id ?? null}
            onSelect={(p) => setSelectedPlan(p)}
          />
        )}

        {step === 2 && selectedPlan && (
          <CalendarStep
            creatorId={creatorId}
            plan={selectedPlan}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
          />
        )}

        {step !== 3 && (
          <div className="flex justify-between items-center mt-6">
            <Button
              onClick={() => setStep((s) => (s === 2 ? 1 : s) as Step)}
              disabled={step === 1}
              color="inherit"
              sx={{ textTransform: 'none' }}
            >
              Atrás
            </Button>
            <Button
              variant="contained"
              disabled={!canGoNext || creatingBooking}
              onClick={() => {
                if (step === 1) setStep(2);
                else if (step === 2) handleContinueToPayment();
              }}
              className="!bg-blue-600 hover:!bg-blue-700 !text-white !font-bold !rounded-xl !px-6"
              sx={{ textTransform: 'none' }}
            >
              {step === 1
                ? 'Siguiente'
                : creatingBooking
                  ? 'Creando reserva…'
                  : 'Continuar al pago'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default BookCallModal;

// Tooltip re-export por conveniencia (algunos consumidores lo importan junto al modal)
export { Tooltip };
