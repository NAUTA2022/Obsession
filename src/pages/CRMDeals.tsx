import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, DragEndEvent, DragOverEvent, DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  TrendingUp, DollarSign, Trophy, Target,
  Plus, Search, SlidersHorizontal, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { KanbanBoard } from '../components/ui';
import DealCard, { DealCardData, DealStageLocal } from '../components/ui/DealCard';

// ── Rich mock data ─────────────────────────────────────────────────────────────

const MOCK_DEALS: DealCardData[] = [
  // Selection
  {
    id: 'd1', stage: 'selection', name: 'Valentina Ríos', phone: '+57 311 234 5678',
    value: 850, tag: 'Pack contenido', dueDate: '10 jun', priority: 'medium',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Valentina&backgroundColor=b6e3f4',
  },
  {
    id: 'd2', stage: 'selection', name: 'Mateo Guerrero', phone: '+57 300 876 5432',
    value: 1200, tag: 'Reels ads', dueDate: '12 jun', priority: 'high',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Mateo&backgroundColor=ffdfbf',
  },
  {
    id: 'd3', stage: 'selection', name: 'Sara Montoya',
    value: 450, tag: 'Story pack', dueDate: '15 jun', priority: 'low',
  },

  // Proposal
  {
    id: 'd4', stage: 'proposal', name: 'Andrés Castillo', phone: '+57 315 543 9870',
    value: 2300, tag: 'Campaña completa', dueDate: '8 jun', priority: 'high',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Andres&backgroundColor=c0aede',
  },
  {
    id: 'd5', stage: 'proposal', name: 'Luisa Fernández',
    value: 780, tag: 'UGC pack', dueDate: '11 jun', priority: 'medium',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Luisa&backgroundColor=ffd5dc',
  },

  // Negotiation
  {
    id: 'd6', stage: 'negotiation', name: 'Carlos Méndez', phone: '+57 320 112 4455',
    value: 3100, tag: 'Brand deal', dueDate: '7 jun', priority: 'high',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Carlos&backgroundColor=d1f4cc',
  },
  {
    id: 'd7', stage: 'negotiation', name: 'Daniela Vargas',
    value: 990, tag: 'Reel mensual', dueDate: '9 jun', priority: 'medium',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Daniela&backgroundColor=ffe4c8',
  },

  // Review
  {
    id: 'd8', stage: 'review', name: 'Felipe Morales', phone: '+57 304 667 8821',
    value: 5500, tag: 'Embajadora', dueDate: '6 jun', priority: 'high',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Felipe&backgroundColor=b6e3f4',
  },
  {
    id: 'd9', stage: 'review', name: 'Natalia Ospina',
    value: 1800, tag: 'Pack 3 reels', dueDate: '8 jun', priority: 'medium',
  },

  // Closing green
  {
    id: 'd10', stage: 'closing-green', name: 'Sebastián Torres', phone: '+57 318 990 2233',
    value: 4200, tag: 'Campaña Q2', dueDate: '1 jun', priority: 'high',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sebastian&backgroundColor=c0aede',
  },
  {
    id: 'd11', stage: 'closing-green', name: 'Isabela Cano',
    value: 1100, tag: 'Story ads', dueDate: '3 jun', priority: 'low',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Isabela&backgroundColor=ffd5dc',
  },

  // Closing red
  {
    id: 'd12', stage: 'closing-red', name: 'Ricardo Palacios',
    value: 2000, tag: 'Brand deal', dueDate: '28 may', priority: 'medium',
  },

  // Delivery
  {
    id: 'd13', stage: 'delivery', name: 'Camila Rincón', phone: '+57 316 221 8890',
    value: 3800, tag: 'Campaña activa', dueDate: '20 jun', priority: 'high',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Camila&backgroundColor=d1f4cc',
  },
  {
    id: 'd14', stage: 'delivery', name: 'Juliana Pérez',
    value: 950, tag: 'Reels pack', dueDate: '18 jun', priority: 'medium',
    avatar: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Juliana&backgroundColor=b6e3f4',
  },
];

// ── New deal modal ─────────────────────────────────────────────────────────────

function NewDealModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (deal: DealCardData) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [value, setValue] = useState('');
  const [tag, setTag] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSave = () => {
    if (!name.trim()) { toast.error('El nombre es obligatorio'); return; }
    const deal: DealCardData = {
      id: `deal-${Date.now()}`,
      stage: 'selection',
      name: name.trim(),
      phone: phone.trim() || undefined,
      value: value ? Number(value) : undefined,
      tag: tag.trim() || undefined,
      priority,
    };
    onSave(deal);
    toast.success('Trato creado ✓');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.08] shadow-2xl p-6 space-y-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Nuevo trato</h3>
            <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">Entrará en Selección</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 dark:text-white/25 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        {[
          { label: 'Nombre del contacto *', value: name, setter: setName, placeholder: 'Ej: María López', type: 'text' },
          { label: 'Teléfono', value: phone, setter: setPhone, placeholder: '+57 300 000 0000', type: 'tel' },
          { label: 'Valor ($)', value: value, setter: setValue, placeholder: '1500', type: 'number' },
          { label: 'Etiqueta', value: tag, setter: setTag, placeholder: 'Ej: Pack reels', type: 'text' },
        ].map(field => (
          <div key={field.label}>
            <label className="text-xs font-semibold text-gray-500 dark:text-white/40 mb-1.5 block">{field.label}</label>
            <input
              type={field.type}
              value={field.value}
              onChange={e => field.setter(e.target.value)}
              placeholder={field.placeholder}
              className="w-full rounded-xl border border-gray-100 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03] text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#6850E8]/25 transition-all"
            />
          </div>
        ))}

        {/* Priority */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-white/40 mb-1.5 block">Prioridad</label>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map(p => (
              <button key={p} onClick={() => setPriority(p)}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  priority === p
                    ? p === 'high' ? 'bg-red-500/15 border-red-500/30 text-red-500'
                      : p === 'medium' ? 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                    : 'border-gray-100 dark:border-white/[0.07] text-gray-400 dark:text-white/30 hover:border-gray-200'
                }`}>
                {p === 'high' ? 'Alta' : p === 'medium' ? 'Media' : 'Baja'}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-100 dark:border-white/[0.08] text-sm text-gray-500 dark:text-white/40 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
            Cancelar
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-[#6850E8] hover:bg-[#5940d8] text-white text-sm font-semibold transition-colors shadow-lg shadow-[#6850E8]/25"
          >
            Crear trato
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function CRMDealsPage() {
  const [deals, setDeals] = useState<DealCardData[]>(MOCK_DEALS);
  const [activeDeal, setActiveDeal] = useState<DealCardData | null>(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // ── Stats
  const totalValue  = deals.reduce((s, d) => s + (d.value || 0), 0);
  const activeDeals = deals.filter(d => d.stage !== 'closing-green' && d.stage !== 'closing-red').length;
  const wonDeals    = deals.filter(d => d.stage === 'closing-green').length;
  const lostDeals   = deals.filter(d => d.stage === 'closing-red').length;
  const total       = wonDeals + lostDeals;
  const winRate     = total > 0 ? Math.round((wonDeals / total) * 100) : 0;

  const stats = [
    { icon: <DollarSign className="w-4 h-4" />, label: 'Pipeline total',  value: `$${totalValue.toLocaleString()}`, color: '#6850E8', bg: 'bg-[#6850E8]/10' },
    { icon: <Target className="w-4 h-4" />,     label: 'Tratos activos',  value: activeDeals,                       color: '#3B82F6', bg: 'bg-blue-500/10'  },
    { icon: <Trophy className="w-4 h-4" />,     label: 'Cerrados ganados',value: wonDeals,                          color: '#10B981', bg: 'bg-emerald-500/10'},
    { icon: <TrendingUp className="w-4 h-4" />, label: 'Tasa de cierre',  value: `${winRate}%`,                     color: '#F59E0B', bg: 'bg-amber-500/10'  },
  ];

  // ── Filtered deals
  const filtered = deals.filter(d => {
    const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) || (d.tag || '').toLowerCase().includes(search.toLowerCase());
    const matchPriority = filterPriority === 'all' || d.priority === filterPriority;
    return matchSearch && matchPriority;
  });

  // ── DnD handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const deal = deals.find(d => d.id === event.active.id);
    setActiveDeal(deal || null);
  }, [deals]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const isOverDeal   = over.data.current?.type === 'Deal';
    const isOverColumn = over.data.current?.type === 'Column';

    setDeals(current => {
      const activeIdx = current.findIndex(d => d.id === activeId);
      if (activeIdx === -1) return current;

      if (isOverDeal) {
        const overIdx = current.findIndex(d => d.id === overId);
        const newDeals = [...current];
        newDeals[activeIdx] = { ...newDeals[activeIdx], stage: current[overIdx].stage };
        return arrayMove(newDeals, activeIdx, overIdx);
      }

      if (isOverColumn) {
        const newDeals = [...current];
        newDeals[activeIdx] = { ...newDeals[activeIdx], stage: overId as DealStageLocal };
        return newDeals;
      }

      return current;
    });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;
    // optimistic — already updated in dragOver; just a no-op here unless you hit an API
    toast.success('Trato actualizado');
    void active; void over;
  }, []);

  const handleAddDeal = (deal: DealCardData) => {
    setDeals(d => [deal, ...d]);
  };

  return (
    <div className="w-full flex flex-col gap-5 h-full">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#6850E8]/10 flex items-center justify-center text-[#6850E8] flex-shrink-0">
              <Target className="w-5 h-5" />
            </div>
            Ofertas
          </h2>
          <p className="text-sm text-gray-400 dark:text-white/35 mt-1">
            Arrastra las tarjetas entre columnas para actualizar el estado de cada trato.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Priority filter */}
          <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
            {[
              { v: 'all',    label: 'Todos', dot: null },
              { v: 'high',   label: 'Alta',  dot: 'bg-red-500'    },
              { v: 'medium', label: 'Media', dot: 'bg-amber-400'  },
              { v: 'low',    label: 'Baja',  dot: 'bg-emerald-500'},
            ].map(f => (
              <button
                key={f.v}
                onClick={() => setFilterPriority(f.v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterPriority === f.v
                    ? 'bg-white dark:bg-white/[0.10] text-gray-800 dark:text-white shadow-sm'
                    : 'text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/50'
                }`}
              >
                {f.dot && <span className={`w-1.5 h-1.5 rounded-full ${f.dot} flex-shrink-0`} />}
                {f.label}
              </button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#6850E8] hover:bg-[#5940d8] text-white text-sm font-semibold transition-colors shadow-lg shadow-[#6850E8]/25"
          >
            <Plus className="w-4 h-4" />
            Nueva oferta
          </motion.button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-shrink-0">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-3 rounded-2xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] px-4 py-3.5 shadow-sm"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`} style={{ color: s.color }}>
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-gray-400 dark:text-white/35 truncate">{s.label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white tabular-nums leading-tight">{s.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Search bar ── */}
      <div className="relative flex-shrink-0">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-white/20 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nombre o etiqueta..."
          className="w-full max-w-sm pl-10 pr-4 py-2.5 rounded-xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-[#111118] text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#6850E8]/20 transition-all shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 dark:text-white/20 hover:text-gray-500 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Board ── */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <KanbanBoard deals={filtered} />

          {/* Drag overlay — beautiful ghost */}
          <DragOverlay dropAnimation={{ duration: 220, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
            {activeDeal && (
              <div className="w-[272px]">
                <DealCard {...activeDeal} isDragOverlay />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 rounded-2xl border border-dashed border-gray-200 dark:border-white/[0.08]"
        >
          <TrendingUp className="w-10 h-10 text-gray-200 dark:text-white/[0.12] mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-400 dark:text-white/35">
            {search ? 'Sin resultados para esa búsqueda' : 'No hay tratos en el pipeline'}
          </p>
          <p className="text-xs text-gray-300 dark:text-white/20 mt-1">
            {search ? 'Prueba con otro nombre o etiqueta.' : 'Crea tu primera oferta para comenzar.'}
          </p>
          {!search && (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6850E8] hover:bg-[#5940d8] text-white text-sm font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" /> Nueva oferta
            </motion.button>
          )}
        </motion.div>
      )}

      {/* ── New deal modal ── */}
      <AnimatePresence>
        {showModal && (
          <NewDealModal
            onClose={() => setShowModal(false)}
            onSave={handleAddDeal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
