import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, MessageCircle, Search, Globe, Star, SlidersHorizontal, X, Check, Users, Percent, Send, Handshake, BadgeCheck, ChevronRight } from 'lucide-react';
import { images } from '../config/assets';
import creatorsService, { type Creator } from '../services/api/creators.service';
import { chatService } from '../services/api/chat.service';
import { useAuthStore } from '../store/auth';
import { ROUTES } from '../constants/routes';
import { AVAILABLE_CATEGORIES, getCategoryLabel } from '../constants/sellerOptions';
import DiscoveryToggle, { type DiscoveryViewMode } from '../components/discovery/DiscoveryToggle';
import DiscoverySwipeSection from '../components/discovery/DiscoverySwipeSection';
import DiscoveryStatusPanel from '../components/discovery/DiscoveryStatusPanel';
import Avatar from '../components/ui/Avatar';

// ── Filter state ───────────────────────────────────────────────────────────────
interface Filters {
  categories: string[];
  locations: string[];
}

const DEFAULT_FILTERS: Filters = { categories: [], locations: [] };

function activeFilterCount(f: Filters) {
  return f.categories.length + f.locations.length;
}

// ── Filter panel ───────────────────────────────────────────────────────────────
const LOCATIONS = ['Argentina', 'México', 'Colombia', 'España', 'Chile', 'Perú', 'Venezuela', 'Internacional'];

function FilterPanel({ filters, onChange, onClose }: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<Filters>(filters);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [onClose]);

  const toggle = <K extends keyof Filters>(key: K, val: string) => {
    setLocal(p => {
      const arr = (p[key] as string[]).includes(val)
        ? (p[key] as string[]).filter(x => x !== val)
        : [...(p[key] as string[]), val];
      return { ...p, [key]: arr };
    });
  };

  const apply = () => { onChange(local); onClose(); };
  const reset = () => { setLocal(DEFAULT_FILTERS); onChange(DEFAULT_FILTERS); };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 420, damping: 30 }}
      className="absolute left-0 top-full mt-2 z-50 w-80 rounded-2xl border border-gray-100 dark:border-white/[0.10] bg-white dark:bg-[#111118] shadow-2xl shadow-black/10 dark:shadow-black/40 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/[0.06]">
        <p className="text-sm font-bold text-gray-900 dark:text-white">Filtros</p>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="text-[11px] font-semibold text-gray-400 dark:text-white/30 hover:text-[#6850E8] dark:hover:text-[#9277F5] transition-colors">
            Limpiar
          </button>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-300 dark:text-white/20 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5 max-h-[70vh] overflow-y-auto [&::-webkit-scrollbar]:w-0">
        {/* Categories */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider mb-2">Categorías</p>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_CATEGORIES.map(c => {
              const active = local.categories.includes(c.value);
              return (
                <button
                  key={c.value}
                  onClick={() => toggle('categories', c.value)}
                  className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                    active
                      ? 'bg-[#6850E8] border-[#6850E8] text-white'
                      : 'border-gray-100 dark:border-white/[0.08] text-gray-500 dark:text-white/40 hover:border-[#6850E8]/40 hover:text-[#6850E8] dark:hover:text-[#9277F5]'
                  }`}
                >
                  {active && <Check className="w-3 h-3" />}
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider mb-2">Ubicación</p>
          <div className="flex flex-wrap gap-1.5">
            {LOCATIONS.map(loc => {
              const active = local.locations.includes(loc);
              return (
                <button
                  key={loc}
                  onClick={() => toggle('locations', loc)}
                  className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                    active
                      ? 'bg-[#6850E8] border-[#6850E8] text-white'
                      : 'border-gray-100 dark:border-white/[0.08] text-gray-500 dark:text-white/40 hover:border-[#6850E8]/40 hover:text-[#6850E8] dark:hover:text-[#9277F5]'
                  }`}
                >
                  {active && <Check className="w-3 h-3" />}
                  {loc}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t border-gray-100 dark:border-white/[0.06]">
        <button
          onClick={apply}
          className="w-full py-2.5 rounded-xl bg-[#6850E8] hover:bg-[#5940d8] text-white text-sm font-semibold transition-colors"
        >
          Aplicar filtros
          {activeFilterCount(local) > 0 && (
            <span className="ml-2 bg-white/20 rounded-full px-2 py-0.5 text-xs">{activeFilterCount(local)}</span>
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ── Collaboration request modal ────────────────────────────────────────────────
function CollabModal({ creator, onClose, onSend }: {
  creator: Creator;
  onClose: () => void;
  onSend: (commission: number, message: string) => void;
}) {
  const user = useAuthStore(s => s.user);
  const [commission, setCommission] = useState(15);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const sellerName = user?.displayName ?? user?.firstName ?? 'Tú';
  const sellerInitials = sellerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const handleSend = async () => {
    if (!message.trim()) { toast.error('Escribí un mensaje'); return; }
    setSending(true);
    await new Promise(r => setTimeout(r, 600)); // simula envío
    onSend(commission, message);
    setSending(false);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md bg-white dark:bg-[#111118] rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header gradient */}
          <div className="relative bg-gradient-to-br from-[#6850E8] via-violet-600 to-fuchsia-600 px-6 pt-6 pb-10">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-2 mb-1">
              <Handshake className="w-4 h-4 text-white/80" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-wider">Solicitud de colaboración</span>
            </div>
            <h2 className="text-xl font-black text-white">Colaborar con {creator.displayName}</h2>
          </div>

          {/* Profiles preview — overlap cards */}
          <div className="relative -mt-6 px-6 mb-5">
            <div className="bg-white dark:bg-[#1a1a28] rounded-2xl border border-gray-100 dark:border-white/[0.08] shadow-lg p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-white/30 mb-3">
                Partes de la colaboración
              </p>
              <div className="flex items-center gap-3">
                {/* Seller */}
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="relative">
                    <Avatar src={user?.profilePicture} fallback={sellerInitials} size={52} />
                    <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-[#6850E8] border-2 border-white dark:border-[#1a1a28]">
                      <BadgeCheck className="w-3 h-3 text-white" />
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[80px]">{sellerName}</p>
                    <span className="text-[10px] font-semibold text-[#6850E8] dark:text-[#9277F5] bg-[#6850E8]/10 px-1.5 py-0.5 rounded-full">Vendedor</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-0.5">
                    <ChevronRight className="w-4 h-4 text-gray-300 dark:text-white/20" />
                    <ChevronRight className="w-4 h-4 text-gray-400 dark:text-white/30 -ml-2" />
                  </div>
                  <span className="text-[9px] font-bold text-gray-400 dark:text-white/25 uppercase tracking-wide">colab</span>
                </div>

                {/* Creator */}
                <div className="flex flex-col items-center gap-1.5 flex-1">
                  <div className="relative">
                    <Avatar src={creator.profilePicture ?? undefined} fallback={creator.displayName.slice(0, 2).toUpperCase()} size={52} />
                    <span className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center w-5 h-5 rounded-full bg-rose-500 border-2 border-white dark:border-[#1a1a28]">
                      <Star className="w-3 h-3 text-white fill-white" />
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate max-w-[80px]">{creator.displayName}</p>
                    <span className="text-[10px] font-semibold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-full">Creadora</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="px-6 pb-6 space-y-5">

            {/* Commission */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-[#6850E8]" />
                  Comisión propuesta
                </label>
                <span className="text-lg font-black text-[#6850E8] dark:text-[#9277F5] tabular-nums">
                  {commission}%
                </span>
              </div>
              <input
                type="range"
                min={5} max={40} step={1}
                value={commission}
                onChange={e => setCommission(Number(e.target.value))}
                className="w-full accent-[#6850E8]"
              />
              <div className="flex justify-between text-[10px] text-gray-400 dark:text-white/25 mt-1">
                <span>5%</span>
                <span className="text-[#6850E8]/60 font-semibold">Recomendado: 15–25%</span>
                <span>40%</span>
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="text-sm font-bold text-gray-900 dark:text-white block mb-2">
                Mensaje de presentación
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                placeholder={`Hola ${creator.displayName.split(' ')[0]}, me gustaría colaborar contigo para ayudarte a generar más ventas...`}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.04] text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#6850E8]/30 resize-none transition-all"
              />
              <p className="text-[10px] text-gray-400 dark:text-white/25 mt-1 text-right">{message.length}/500</p>
            </div>

            {/* Send */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSend}
              disabled={sending}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#6850E8] to-violet-600 hover:from-[#5940d8] hover:to-violet-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#6850E8]/25"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {sending ? 'Enviando...' : 'Enviar solicitud'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Creator grid card ──────────────────────────────────────────────────────────
function CreatorGridCard({ c, onCollaborate }: { c: Creator; onCollaborate: (id: string) => void }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#111118] shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-36 bg-gradient-to-br from-rose-100 to-violet-100 dark:from-rose-900/20 dark:to-violet-900/20">
        <img
          src={c.profilePicture || images.sampleProfile}
          alt={c.displayName}
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-medium text-white">Activa</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <div>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white/90 truncate">{c.displayName}</h3>
          <p className="text-xs text-gray-400 dark:text-white/35 flex items-center gap-1 mt-0.5">
            <Globe className="w-3 h-3" />
            {c.location || 'Internacional'}
          </p>
        </div>

        <p className="line-clamp-2 text-xs text-gray-500 dark:text-white/40 leading-relaxed">
          {c.bio || 'Creadora de contenido digital especializada en conectar con su audiencia.'}
        </p>

        {c.contentType && (
          <div className="flex flex-wrap gap-1">
            <span className="rounded-full bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 text-[10px] font-medium text-rose-600 dark:text-rose-400">
              {getCategoryLabel(c.contentType) || c.contentType}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-violet-400" />
            <span className="text-xs font-bold text-gray-700 dark:text-white/70">
              {c.totalEarnings > 0
                ? new Intl.NumberFormat('es').format(c.totalEarnings)
                : '—'}
            </span>
            <span className="text-xs text-gray-400 dark:text-white/30">ingresos</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-gray-700 dark:text-white/70">4.8</span>
          </div>
        </div>

        <button
          onClick={() => onCollaborate(c.id)}
          className="mt-auto flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#6850E8] to-violet-600 hover:from-[#5940d8] hover:to-violet-700 py-2 text-xs font-semibold text-white transition-all shadow-sm shadow-[#6850E8]/20"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Solicitar colaboración
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function DiscoverCreatorsPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<DiscoveryViewMode>('grid');
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [collabTarget, setCollabTarget] = useState<Creator | null>(null);

  useEffect(() => {
    setLoading(true);
    creatorsService
      .getAllCreators()
      .then(res => setCreators(res.data?.data ?? []))
      .catch(() => setCreators([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCollaborate = useCallback((creatorId: string) => {
    const creator = creators.find(c => c.id === creatorId);
    if (creator) setCollabTarget(creator);
  }, [creators]);

  const handleSendCollab = useCallback(async (commission: number, message: string) => {
    if (!collabTarget) return;
    try {
      const { conversationId } = await chatService.startConversationWith(collabTarget.id);
      toast.success(`Solicitud enviada a ${collabTarget.displayName} con ${commission}% de comisión`);
      setCollabTarget(null);
      navigate(`${ROUTES['seller-chat']}?c=${conversationId}`);
    } catch {
      toast.error('No se pudo enviar la solicitud');
    }
  }, [collabTarget, navigate]);

  const filterCount = activeFilterCount(filters);

  const filtered = creators.filter(c => {
    const matchSearch = !search ||
      c.displayName.toLowerCase().includes(search.toLowerCase()) ||
      c.bio?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filters.categories.length === 0 ||
      filters.categories.includes(c.contentType ?? '');
    const matchLoc = filters.locations.length === 0 ||
      filters.locations.some(l => c.location?.toLowerCase().includes(l.toLowerCase()));
    return matchSearch && matchCat && matchLoc;
  });

  return (
    <div className="w-full h-full animate-fade-in">

      {/* ── Collab modal ── */}
      {collabTarget && (
        <CollabModal
          creator={collabTarget}
          onClose={() => setCollabTarget(null)}
          onSend={handleSendCollab}
        />
      )}

      {/* ── Header ── */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Descubrir Creadoras
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-white/40">
            Encuentra creadoras para colaborar y hacer crecer tus comisiones.
          </p>
        </div>
        <DiscoveryToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {/* ── Mobile fullscreen swipe ── */}
      {viewMode === 'swipe' && (
        <div className="lg:hidden fixed inset-0 z-40">
          <DiscoverySwipeSection
            audience="creators"
            emptyLabel="No hay más creadoras por ahora"
            fullscreen
            onClose={() => setViewMode('grid')}
          />
        </div>
      )}

      {/* ── Desktop layout ── */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5 xl:grid-cols-6">

        {/* Left: grid */}
        <div className="min-w-0 lg:col-span-3 xl:col-span-4 flex flex-col gap-5">

          {/* Search + filter bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nombre, categoría o ubicación..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#111118] text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#6850E8]/30 shadow-sm transition-all"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/20 hover:text-gray-500 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative flex-shrink-0">
              <motion.button
                onClick={() => setShowFilters(v => !v)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-all shadow-sm ${
                  showFilters || filterCount > 0
                    ? 'bg-[#6850E8] border-[#6850E8] text-white shadow-[#6850E8]/25'
                    : 'bg-white dark:bg-[#111118] border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-white/50 hover:border-gray-300 dark:hover:border-white/[0.15]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filtros</span>
                {filterCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/25 text-[10px] font-bold">
                    {filterCount}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {showFilters && (
                  <FilterPanel
                    filters={filters}
                    onChange={setFilters}
                    onClose={() => setShowFilters(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Active filter chips */}
          <AnimatePresence>
            {filterCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 overflow-hidden"
              >
                {filters.categories.map(c => (
                  <span key={c} className="flex items-center gap-1.5 text-[11px] font-semibold bg-[#6850E8]/10 text-[#6850E8] dark:text-[#9277F5] rounded-full px-2.5 py-1">
                    {getCategoryLabel(c)}
                    <button onClick={() => setFilters(p => ({ ...p, categories: p.categories.filter(x => x !== c) }))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.locations.map(l => (
                  <span key={l} className="flex items-center gap-1.5 text-[11px] font-semibold bg-[#6850E8]/10 text-[#6850E8] dark:text-[#9277F5] rounded-full px-2.5 py-1">
                    {l}
                    <button onClick={() => setFilters(p => ({ ...p, locations: p.locations.filter(x => x !== l) }))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="text-[11px] font-semibold text-gray-400 dark:text-white/30 hover:text-red-500 transition-colors px-1"
                >
                  Limpiar todo
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#6850E8]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-white/40 text-base">
                {search ? 'No se encontraron creadoras con ese criterio' : 'No hay creadoras disponibles'}
              </p>
              {search && (
                <button onClick={() => setSearch('')} className="mt-2 text-sm text-[#6850E8] hover:underline">
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(c => (
                <CreatorGridCard key={c.id} c={c} onCollaborate={handleCollaborate} />
              ))}
            </div>
          )}
        </div>

        {/* Right: sticky panel */}
        <div className="hidden lg:block min-w-0 lg:col-span-2 xl:col-span-2">
          {viewMode === 'swipe' ? (
            <div
              className="sticky flex flex-col gap-4 rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-[#111118] overflow-hidden"
              style={{ top: '4.5rem', maxHeight: 'calc(100vh - 5.5rem)' }}
            >
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3 dark:border-white/[0.06] shrink-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                  <Flame className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">Descubrir Creadoras</h2>
                  <p className="text-xs text-gray-400 dark:text-white/30 truncate">Desliza o usa los botones</p>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-0">
                <DiscoverySwipeSection audience="creators" emptyLabel="No hay más creadoras por ahora" />
              </div>
            </div>
          ) : (
            <div
              className="sticky flex flex-col gap-3 rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-[#111118] overflow-hidden"
              style={{ top: '4.5rem', maxHeight: 'calc(100vh - 5.5rem)' }}
            >
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90 shrink-0">Estado de descubrimiento</h2>
              <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-0">
                <DiscoveryStatusPanel />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
