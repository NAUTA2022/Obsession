import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, MessageCircle, Search, Globe, Star, SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react';
import { images } from '../config/assets';
import { sellerService, type SellerListItem } from '../services/api/seller.service';
import { chatService } from '../services/api/chat.service';
import { ROUTES } from '../constants/routes';
import { AVAILABLE_CATEGORIES, AVAILABLE_LANGUAGES, getCategoryLabel, getLanguageLabel } from '../constants/sellerOptions';
import DiscoveryToggle, { type DiscoveryViewMode } from '../components/discovery/DiscoveryToggle';
import DiscoverySwipeSection from '../components/discovery/DiscoverySwipeSection';
import DiscoveryStatusPanel from '../components/discovery/DiscoveryStatusPanel';

// ── Filter state ──────────────────────────────────────────────────────────────
interface Filters {
  categories: string[];
  languages: string[];
  commissionMin: number;
  commissionMax: number;
}

const DEFAULT_FILTERS: Filters = { categories: [], languages: [], commissionMin: 0, commissionMax: 50 };

function activeFilterCount(f: Filters) {
  return f.categories.length + f.languages.length +
    (f.commissionMin > 0 || f.commissionMax < 50 ? 1 : 0);
}

// ── Filter panel ───────────────────────────────────────────────────────────────
function FilterPanel({ filters, onChange, onClose }: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<Filters>(filters);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const t = setTimeout(() => document.addEventListener('mousedown', handler), 0);
    return () => { clearTimeout(t); document.removeEventListener('mousedown', handler); };
  }, [onClose]);

  const toggle = <K extends 'categories' | 'languages'>(key: K, val: string) => {
    setLocal(p => {
      const arr = p[key].includes(val) ? p[key].filter(x => x !== val) : [...p[key], val];
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
      {/* Header */}
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

        {/* Languages */}
        <div>
          <p className="text-[11px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider mb-2">Idiomas</p>
          <div className="flex flex-wrap gap-1.5">
            {AVAILABLE_LANGUAGES.map(l => {
              const active = local.languages.includes(l.code);
              return (
                <button
                  key={l.code}
                  onClick={() => toggle('languages', l.code)}
                  className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${
                    active
                      ? 'bg-[#6850E8] border-[#6850E8] text-white'
                      : 'border-gray-100 dark:border-white/[0.08] text-gray-500 dark:text-white/40 hover:border-[#6850E8]/40 hover:text-[#6850E8] dark:hover:text-[#9277F5]'
                  }`}
                >
                  <span>{l.flag}</span>
                  {active && <Check className="w-3 h-3" />}
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Commission range */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider">Comisión</p>
            <span className="text-xs font-bold text-[#6850E8]">{local.commissionMin}% — {local.commissionMax}%</span>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Mínimo', key: 'commissionMin' as const, min: 0, max: local.commissionMax },
              { label: 'Máximo', key: 'commissionMax' as const, min: local.commissionMin, max: 50 },
            ].map(({ label, key, min, max }) => (
              <div key={key}>
                <div className="flex justify-between text-[10px] text-gray-400 dark:text-white/25 mb-1">
                  <span>{label}</span><span>{local[key]}%</span>
                </div>
                <input
                  type="range" min={min} max={max} step={1} value={local[key]}
                  onChange={e => setLocal(p => ({ ...p, [key]: Number(e.target.value) }))}
                  className="w-full accent-[#6850E8]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Apply */}
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

// ── Seller card ────────────────────────────────────────────────────────────────
function SellerGridCard({ s, onMessage }: { s: SellerListItem; onMessage: (id: string) => void }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#111118] shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-36 bg-gradient-to-br from-blue-100 to-violet-100 dark:from-blue-900/20 dark:to-violet-900/20">
        <img
          src={s.profilePicture || images.sampleProfile}
          alt={s.displayName}
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] font-medium text-white">Activo</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <div>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white/90 truncate">{s.displayName}</h3>
          <p className="text-xs text-gray-400 dark:text-white/35 flex items-center gap-1 mt-0.5">
            <Globe className="w-3 h-3" />
            {s.location || 'Internacional'}
          </p>
        </div>

        <p className="line-clamp-2 text-xs text-gray-500 dark:text-white/40 leading-relaxed">
          {s.description || 'Vendedor colaborativo especializado en productos digitales.'}
        </p>

        <div className="flex flex-wrap gap-1">
          {s.productCategories?.slice(0, 2).map((c) => (
            <span key={c} className="rounded-full bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:text-blue-400">
              {getCategoryLabel(c)}
            </span>
          ))}
          {s.languages?.slice(0, 2).map((l) => (
            <span key={l} className="rounded-full bg-gray-100 dark:bg-white/[0.06] px-2 py-0.5 text-[10px] text-gray-500 dark:text-white/40">
              {getLanguageLabel(l)}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-gray-700 dark:text-white/70">{s.commissionPercentage}%</span>
            <span className="text-xs text-gray-400 dark:text-white/30">comisión</span>
          </div>
        </div>

        <button
          onClick={() => onMessage(s.userId)}
          className="mt-auto flex items-center justify-center gap-1.5 rounded-xl bg-[#6850E8] hover:bg-[#5940d8] py-2 text-xs font-semibold text-white transition-colors"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Enviar mensaje
        </button>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function DiscoverSellersPage() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<DiscoveryViewMode>('grid');
  const [sellers, setSellers] = useState<SellerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setLoading(true);
    sellerService
      .listSellers()
      .then(setSellers)
      .catch(() => setSellers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleMessage = async (userId: string) => {
    try {
      const { conversationId } = await chatService.startConversationWith(userId);
      navigate(`${ROUTES['creator-inbox']}?c=${conversationId}`);
    } catch {
      toast.error('No se pudo iniciar la conversación');
    }
  };

  const filterCount = activeFilterCount(filters);

  const filtered = sellers.filter(s => {
    const matchSearch = !search ||
      s.displayName.toLowerCase().includes(search.toLowerCase()) ||
      s.description?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filters.categories.length === 0 ||
      filters.categories.some(c => s.productCategories?.includes(c));
    const matchLang = filters.languages.length === 0 ||
      filters.languages.some(l => s.languages?.includes(l));
    const matchComm = (s.commissionPercentage ?? 0) >= filters.commissionMin &&
      (s.commissionPercentage ?? 50) <= filters.commissionMax;
    return matchSearch && matchCat && matchLang && matchComm;
  });

  return (
    <div className="w-full h-full animate-fade-in">

      {/* ── Header ── */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Descubrir vendedores
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-white/40">
            Encuentra vendedores para colaborar y hacer crecer tus ventas.
          </p>
        </div>
        <DiscoveryToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {/* ── Mobile fullscreen swipe ── */}
      {viewMode === 'swipe' && (
        <div className="lg:hidden fixed inset-0 z-40">
          <DiscoverySwipeSection
            audience="sellers"
            emptyLabel="No hay más vendedores por ahora"
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
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar por nombre, categoría o idioma..."
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

            {/* Filter button */}
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

              {/* Dropdown panel */}
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
                {filters.languages.map(l => (
                  <span key={l} className="flex items-center gap-1.5 text-[11px] font-semibold bg-[#6850E8]/10 text-[#6850E8] dark:text-[#9277F5] rounded-full px-2.5 py-1">
                    {getLanguageLabel(l)}
                    <button onClick={() => setFilters(p => ({ ...p, languages: p.languages.filter(x => x !== l) }))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {(filters.commissionMin > 0 || filters.commissionMax < 50) && (
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold bg-[#6850E8]/10 text-[#6850E8] dark:text-[#9277F5] rounded-full px-2.5 py-1">
                    {filters.commissionMin}%–{filters.commissionMax}% comisión
                    <button onClick={() => setFilters(p => ({ ...p, commissionMin: 0, commissionMax: 50 }))}>
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="text-[11px] font-semibold text-gray-400 dark:text-white/30 hover:text-red-500 transition-colors px-1"
                >
                  Limpiar todo
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#6850E8]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 dark:text-white/40 text-base">
                {search ? 'No se encontraron vendedores con ese criterio' : 'No hay vendedores disponibles'}
              </p>
              {search && (
                <button onClick={() => setSearch('')} className="mt-2 text-sm text-[#6850E8] hover:underline">
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((s) => (
                <SellerGridCard key={s.userId} s={s} onMessage={handleMessage} />
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
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6850E8]/10 text-[#6850E8]">
                  <Flame className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">Descubrir vendedores</h2>
                  <p className="text-xs text-gray-400 dark:text-white/30 truncate">Desliza o usa los botones</p>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-0">
                <DiscoverySwipeSection audience="sellers" emptyLabel="No hay más vendedores por ahora" />
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
