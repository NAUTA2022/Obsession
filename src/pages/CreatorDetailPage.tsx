import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, X, ShoppingBag, MapPin, Tag, Image, Video,
  Lock, Maximize2, ChevronLeftIcon, ChevronRight,
  Video as VideoIcon, Phone, Clock, Shield, AlertTriangle, Calendar,
} from 'lucide-react';
import { images } from '../config/assets';
import { creatorsService, type Creator } from '../services/api/creators.service';
import { productsService, type Product } from '../services/api/products.service';
import { callPlansService } from '../services/api/callPlans.service';
import { availabilityService } from '../services/api/availability.service';
import type { CallPlan, AvailabilitySlot } from '../types/bookings';
import Avatar from '../components/ui/Avatar';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  package: 'Paquete', single: 'Único', content: 'Contenido',
  service: 'Servicio', bundle: 'Bundle', membership: 'Membresía',
  digital_content: 'Digital', physical_product: 'Físico',
};
const TYPE_COLORS: Record<string, string> = {
  package: 'bg-violet-500/10 text-violet-500 dark:bg-violet-500/20',
  single:  'bg-blue-500/10 text-blue-500 dark:bg-blue-500/20',
  content: 'bg-emerald-500/10 text-emerald-500 dark:bg-emerald-500/20',
  service: 'bg-amber-500/10 text-amber-500 dark:bg-amber-500/20',
  bundle:  'bg-pink-500/10 text-pink-500 dark:bg-pink-500/20',
  membership: 'bg-cyan-500/10 text-cyan-500 dark:bg-cyan-500/20',
  digital_content: 'bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20',
};
const previewSeeds = (id: string) =>
  [1, 2, 3, 4].map(i => `https://picsum.photos/seed/${id}-prev${i}/200/200`);

const fmt = (cents: number, currency = 'USD') =>
  new Intl.NumberFormat('es', { style: 'currency', currency, maximumFractionDigits: 0 }).format(cents / 100);

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// ─── Blurred preview grid ──────────────────────────────────────────────────────

function BlurredGrid({ productId }: { productId: string }) {
  const seeds = previewSeeds(productId);
  return (
    <div className="grid grid-cols-2 gap-0.5 h-full">
      {seeds.map((src, i) => (
        <div key={i} className="relative overflow-hidden bg-gray-200 dark:bg-white/[0.06]">
          <img src={src} alt="" className="w-full h-full object-cover blur-sm scale-110 brightness-50" />
          {i === 1 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black/50 rounded-full p-1.5">
                <Lock className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Content Product Modal ─────────────────────────────────────────────────────

function ContentProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const seeds = previewSeeds(product.id);

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && (expanded ? setExpanded(false) : onClose());
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose, expanded]);

  const typeLabel = TYPE_LABELS[product.type] ?? product.type;
  const typeColor = TYPE_COLORS[product.type] ?? 'bg-gray-100 text-gray-600';

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-3 sm:px-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full sm:max-w-2xl bg-white dark:bg-[#111118] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Top: thumbnail + blurred grid */}
          <div className="flex h-56">
            {/* Left: main image */}
            <div className="relative w-1/2 bg-gray-100 dark:bg-white/[0.04] shrink-0">
              <img
                src={product.thumbnailUrl || images.sampleProfile}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setExpanded(true)}
                className="absolute bottom-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-lg p-1.5 transition-colors"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColor}`}>
                {typeLabel}
              </span>
            </div>

            {/* Right: blurred preview grid */}
            <div className="w-1/2">
              <div className="grid grid-cols-2 gap-0.5 h-full">
                {seeds.map((src, i) => (
                  <div key={i} className="relative overflow-hidden bg-gray-200 dark:bg-white/[0.06]">
                    <img src={src} alt="" className="w-full h-full object-cover blur-sm scale-110 brightness-50" />
                    {i === 1 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                        <div className="bg-black/60 rounded-full p-2">
                          <Lock className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white text-[10px] font-semibold">Compra para ver</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors z-10"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Details */}
          <div className="p-5 space-y-4">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{product.title}</h2>
              <p className="text-sm text-gray-500 dark:text-white/50 mt-1 leading-relaxed">{product.description}</p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-white/40">
              {(product.photoCount ?? 0) > 0 && (
                <span className="flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5" />{product.photoCount} fotos
                </span>
              )}
              {(product.videoCount ?? 0) > 0 && (
                <span className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5" />{product.videoCount} videos
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />{product.totalSales} ventas
              </span>
            </div>

            {/* Price + CTA */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/[0.06]">
              <div>
                <p className="text-xs text-gray-400 dark:text-white/30">Precio</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${product.price}</p>
              </div>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6850E8] text-white text-sm font-semibold hover:bg-[#5a44d4] transition-colors">
                <ShoppingBag className="w-4 h-4" />
                Comprar ahora
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen preview */}
      {expanded && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90"
          onClick={() => setExpanded(false)}
        >
          <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={() => setExpanded(false)}>
            <X className="w-6 h-6" />
          </button>
          <img
            src={product.thumbnailUrl || images.sampleProfile}
            alt={product.title}
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

// ─── Call Plan Booking Modal ───────────────────────────────────────────────────

function CallPlanBookingModal({ plan, creatorId, creatorName, onClose }: {
  plan: CallPlan; creatorId: string; creatorName: string; onClose: () => void;
}) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<AvailabilitySlot | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Fetch slots when date selected
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    const from = new Date(selectedDate); from.setHours(0, 0, 0, 0);
    const to   = new Date(selectedDate); to.setHours(23, 59, 59, 999);
    availabilityService.getSlots({ creatorId, planId: plan.id, from: from.toISOString(), to: to.toISOString() })
      .then(result => {
        if (Array.isArray(result)) setSlots(result);
        else setSlots([]);
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, creatorId, plan.id]);

  // Build calendar days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const isAvailable = (day: number) => {
    const d = new Date(year, month, day);
    const wd = d.getDay();
    return wd >= 1 && wd <= 5 && d >= today;
  };
  const isSelected = (day: number) =>
    selectedDate?.getDate() === day && selectedDate?.getMonth() === month && selectedDate?.getFullYear() === year;

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  if (confirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#111118] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.06] p-8 max-w-sm w-full text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
            <Shield className="w-7 h-7 text-emerald-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">¡Reserva confirmada!</h2>
          <p className="text-sm text-gray-500 dark:text-white/50">
            Tu pago de <strong className="text-gray-900 dark:text-white">{fmt(plan.priceCents, plan.currency)}</strong> quedará en custodia hasta que la sesión sea completada.
          </p>
          <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 text-left">
            <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">Recibirás un código único por email para ingresar a la llamada. Ambas partes deben ingresarlo al momento exacto de la cita.</p>
          </div>
          <button onClick={onClose} className="w-full py-2.5 rounded-xl bg-[#6850E8] text-white text-sm font-semibold hover:bg-[#5a44d4] transition-colors">
            Entendido
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-3 sm:px-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full sm:max-w-lg bg-white dark:bg-[#111118] rounded-2xl shadow-2xl border border-gray-100 dark:border-white/[0.06] flex flex-col max-h-[92dvh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-white/[0.06] shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${plan.mode === 'video' ? 'bg-violet-500/10 text-violet-500' : 'bg-blue-500/10 text-blue-500'}`}>
                {plan.mode === 'video' ? <VideoIcon className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                {plan.mode === 'video' ? 'Video llamada' : 'Llamada de voz'}
              </span>
              <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-white/30">
                <Clock className="w-3 h-3" />{plan.durationMinutes} min
              </span>
            </div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">{plan.title}</h2>
            <p className="text-xs text-gray-500 dark:text-white/40 leading-relaxed">{plan.description}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-white/70 ml-3 mt-0.5 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {/* Calendar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.05] text-gray-400 transition-colors">
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {MONTHS_ES[month]} {year}
              </p>
              <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.05] text-gray-400 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {DAYS_ES.map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-gray-400 dark:text-white/30 py-1">{d}</div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7 gap-0.5">
              {blanks.map((_, i) => <div key={`b${i}`} />)}
              {days.map(day => {
                const avail = isAvailable(day);
                const sel   = isSelected(day);
                return (
                  <button
                    key={day}
                    disabled={!avail}
                    onClick={() => setSelectedDate(new Date(year, month, day))}
                    className={`aspect-square rounded-lg text-xs font-medium transition-all ${
                      sel
                        ? 'bg-[#6850E8] text-white'
                        : avail
                          ? 'hover:bg-[#6850E8]/10 text-gray-900 dark:text-white/80'
                          : 'text-gray-300 dark:text-white/15 cursor-not-allowed'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time slots */}
          {selectedDate && (
            <div>
              <p className="text-xs font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider mb-2">
                Horarios — {selectedDate.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              {loadingSlots ? (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 border-2 border-[#6850E8]/30 border-t-[#6850E8] rounded-full animate-spin" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-white/30 text-center py-3">Sin disponibilidad este día</p>
              ) : (
                <div className="grid grid-cols-4 gap-1.5">
                  {slots.map(slot => {
                    const isSel = selectedSlot?.startAt === slot.startAt;
                    return (
                      <button
                        key={slot.startAt}
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          isSel
                            ? 'bg-[#6850E8] border-[#6850E8] text-white'
                            : 'border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-white/60 hover:border-[#6850E8] hover:text-[#6850E8]'
                        }`}
                      >
                        {formatTime(slot.startAt)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Escrow info */}
          <div className="rounded-xl bg-amber-50 dark:bg-amber-500/[0.08] border border-amber-200 dark:border-amber-500/20 p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Pago en custodia</p>
            </div>
            <p className="text-xs text-amber-700/80 dark:text-amber-400/70 leading-relaxed">
              Tu pago queda retenido hasta que la sesión sea confirmada. La creadora tiene hasta 24h para aceptar o cancelar. Si cancela, recibes reembolso completo.
            </p>
            <div className="flex items-start gap-1.5 pt-1 border-t border-amber-200 dark:border-amber-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-700/80 dark:text-amber-400/70 leading-relaxed">
                Ambas partes deben ingresar un <strong>código único</strong> al momento exacto de la cita para que el pago se libere. Si la creadora no se presenta, el dinero es reembolsado automáticamente.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 py-4 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400 dark:text-white/30">Total</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{fmt(plan.priceCents, plan.currency)}</p>
          </div>
          <button
            disabled={!selectedSlot}
            onClick={() => selectedSlot && setConfirmed(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6850E8] text-white text-sm font-semibold hover:bg-[#5a44d4] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Calendar className="w-4 h-4" />
            {selectedSlot ? 'Confirmar reserva' : 'Elige un horario'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Product Card ──────────────────────────────────────────────────────────────

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const typeLabel = TYPE_LABELS[product.type] ?? product.type;
  const typeColor = TYPE_COLORS[product.type] ?? 'bg-gray-100 text-gray-600';

  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl border border-gray-100 dark:border-white/[0.06] overflow-hidden hover:border-[#6850E8]/40 hover:shadow-md transition-all bg-white dark:bg-[#111118]"
    >
      {/* Card visual: left thumb + right blurred grid */}
      <div className="flex h-32">
        <div className="relative w-1/2 bg-gray-100 dark:bg-white/[0.04] shrink-0 overflow-hidden">
          <img
            src={product.thumbnailUrl || images.sampleProfile}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <span className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${typeColor}`}>
            {typeLabel}
          </span>
        </div>
        <div className="w-1/2 overflow-hidden">
          <BlurredGrid productId={product.id} />
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{product.title}</p>
        <p className="text-[11px] text-gray-400 dark:text-white/30 line-clamp-1">{product.description}</p>
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-sm font-bold text-[#6850E8]">${product.price}</span>
          <div className="flex items-center gap-2 text-[10px] text-gray-400 dark:text-white/30">
            {(product.photoCount ?? 0) > 0 && (
              <span className="flex items-center gap-0.5"><Image className="w-3 h-3" />{product.photoCount}</span>
            )}
            {(product.videoCount ?? 0) > 0 && (
              <span className="flex items-center gap-0.5"><Video className="w-3 h-3" />{product.videoCount}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Call Plan Card ────────────────────────────────────────────────────────────

function CallPlanCard({ plan, onClick }: { plan: CallPlan; onClick: () => void }) {
  const isVideo = plan.mode === 'video';
  return (
    <button
      onClick={onClick}
      className="group w-full text-left rounded-xl border border-gray-100 dark:border-white/[0.06] overflow-hidden hover:border-[#6850E8]/40 hover:shadow-md transition-all bg-white dark:bg-[#111118] p-4 space-y-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isVideo ? 'bg-violet-500/10' : 'bg-blue-500/10'}`}>
          {isVideo
            ? <VideoIcon className="w-4 h-4 text-violet-500" />
            : <Phone className="w-4 h-4 text-blue-500" />
          }
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isVideo ? 'bg-violet-500/10 text-violet-500' : 'bg-blue-500/10 text-blue-500'}`}>
          {isVideo ? 'Video' : 'Audio'}
        </span>
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-900 dark:text-white">{plan.title}</p>
        <p className="text-[11px] text-gray-400 dark:text-white/30 line-clamp-2 mt-0.5">{plan.description}</p>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-white/[0.06]">
        <span className="text-sm font-bold text-[#6850E8]">{fmt(plan.priceCents, plan.currency)}</span>
        <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-white/30">
          <Clock className="w-3 h-3" />{plan.durationMinutes} min
        </span>
      </div>
    </button>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CreatorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [creator, setCreator]     = useState<Creator | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [products, setProducts]   = useState<Product[]>([]);
  const [callPlans, setCallPlans] = useState<CallPlan[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedPlan, setSelectedPlan]       = useState<CallPlan | null>(null);

  const fetchData = useCallback(async () => {
    if (!id) { setError('ID no proporcionado'); setLoading(false); return; }
    try {
      setLoading(true);
      const [profileRes, galleryRes, productsRes, plansRes] = await Promise.all([
        creatorsService.getCreatorProfile(id),
        creatorsService.getCreatorGallery(id),
        productsService.getProductsByCreator(id),
        callPlansService.listByCreator(id),
      ]);
      setCreator(profileRes.data ?? null);
      setGalleryImages(galleryRes.data?.images?.map(img => img.imageUrl) ?? []);
      setProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setCallPlans(Array.isArray(plansRes) ? plansRes : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#6850E8]/20 border-t-[#6850E8]" />
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-3">
          <p className="text-red-500 font-medium">{error ?? 'Creadora no encontrada'}</p>
          <button onClick={() => navigate(-1)} className="text-sm text-[#6850E8] hover:underline">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-white/40 hover:text-gray-900 dark:hover:text-white/80 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver a Creadoras
      </button>

      {/* Profile + Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-200/70 dark:border-white/[0.06] bg-white dark:bg-[#111118] overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-[#6850E8] to-[#3CA1FF]" />
            <div className="px-5 pb-5 -mt-10">
              <Avatar src={creator.profilePicture} alt={creator.displayName} name={creator.displayName} size={72}
                className="border-4 border-white dark:border-[#111118] shadow-md" />
              <h2 className="mt-3 text-base font-bold text-gray-900 dark:text-white">{creator.displayName}</h2>
              <p className="text-xs text-gray-500 dark:text-white/40">@{creator.username}</p>
              {creator.bio && (
                <p className="mt-2 text-xs text-gray-600 dark:text-white/50 leading-relaxed line-clamp-3">{creator.bio}</p>
              )}
              <div className="mt-3 space-y-1.5 text-xs">
                {creator.location && (
                  <span className="flex items-center gap-1.5 text-gray-400 dark:text-white/30">
                    <MapPin className="w-3.5 h-3.5" />{creator.location}
                  </span>
                )}
                {creator.contentType && (
                  <span className="flex items-center gap-1.5 text-gray-400 dark:text-white/30">
                    <Tag className="w-3.5 h-3.5" />{creator.contentType}
                  </span>
                )}
              </div>
              <button className="mt-4 w-full py-2 rounded-xl bg-[#6850E8] text-white text-xs font-semibold hover:bg-[#5a44d4] transition-colors">
                Iniciar chat
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {galleryImages.length > 0 ? (
            <div className="rounded-2xl border border-gray-200/70 dark:border-white/[0.06] overflow-hidden">
              {/* @ts-ignore */}
              <PhotoGallery images={galleryImages} />
            </div>
          ) : (
            <div className="h-full min-h-[200px] rounded-2xl border border-gray-200/70 dark:border-white/[0.06] bg-white dark:bg-[#111118] flex items-center justify-center">
              <p className="text-sm text-gray-400 dark:text-white/30">Sin galería disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      {products.length > 0 && (
        <div className="rounded-2xl border border-gray-200/70 dark:border-white/[0.06] bg-white dark:bg-[#0D0D14] p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
            Contenido <span className="text-gray-400 dark:text-white/30 font-normal">({products.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} />
            ))}
          </div>
        </div>
      )}

      {/* Call Plans */}
      {callPlans.length > 0 && (
        <div className="rounded-2xl border border-gray-200/70 dark:border-white/[0.06] bg-white dark:bg-[#0D0D14] p-5">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-1">
            Sesiones disponibles <span className="text-gray-400 dark:text-white/30 font-normal">({callPlans.length})</span>
          </h3>
          <p className="text-xs text-gray-400 dark:text-white/30 mb-4">Reserva una llamada privada. El pago queda en custodia hasta la sesión.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {callPlans.map(p => (
              <CallPlanCard key={p.id} plan={p} onClick={() => setSelectedPlan(p)} />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {selectedProduct && (
        <ContentProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
      {selectedPlan && (
        <CallPlanBookingModal
          plan={selectedPlan}
          creatorId={creator.id}
          creatorName={creator.displayName}
          onClose={() => setSelectedPlan(null)}
        />
      )}
    </div>
  );
}
