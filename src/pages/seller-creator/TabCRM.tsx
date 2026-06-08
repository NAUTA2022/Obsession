import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Target, TrendingUp, Trophy, Plus, X, Save, User, DollarSign, StickyNote, Layers } from 'lucide-react';
import KanbanBoard from '../../components/ui/KanbanBoard';
import type { DealCardData, DealStageLocal } from '../../components/ui/DealCard';
import { MOCK_DEALS, MOCK_CONTACTS } from './mockData';
import toast from 'react-hot-toast';

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

const STAGE_OPTIONS: { value: DealStageLocal; label: string }[] = [
  { value: 'selection',     label: 'Selección' },
  { value: 'proposal',      label: 'Propuesta enviada' },
  { value: 'negotiation',   label: 'En negociación' },
  { value: 'review',        label: 'Revisión cliente' },
  { value: 'closing-green', label: 'Cierre exitoso' },
  { value: 'closing-red',   label: 'Trato perdido' },
  { value: 'delivery',      label: 'Entrega & seguimiento' },
];

// ── Add Deal Modal ────────────────────────────────────────────────────────────

function AddDealModal({ onClose, onAdd }: { onClose: () => void; onAdd: (d: DealCardData) => void }) {
  const [contactId, setContactId] = useState('');
  const [customName, setCustomName] = useState('');
  const [phone,  setPhone]  = useState('');
  const [stage,  setStage]  = useState<DealStageLocal>('selection');
  const [value,  setValue]  = useState('');
  const [tag,    setTag]    = useState('');
  const [note,   setNote]   = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const selectedContact = MOCK_CONTACTS.find(c => c.id === contactId);
  const displayName = selectedContact?.name ?? customName;

  const save = () => {
    if (!displayName.trim()) { toast.error('Ingresa el nombre del contacto'); return; }
    const deal: DealCardData = {
      id: `deal_${Date.now()}`,
      name: displayName.trim(),
      phone: (selectedContact?.phoneNumber ?? phone.trim()) || undefined,
      stage,
      value: value ? Number(value.replace(/\D/g, '')) : undefined,
      tag: tag.trim() || undefined,
      priority,
    };
    onAdd(deal);
    toast.success(`Trato creado para ${deal.name}`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        className="w-full max-w-sm bg-white dark:bg-[#1A1A2E] rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100 dark:border-white/[0.06]">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white/90">Nuevo trato</p>
            <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">Añadir al pipeline de ventas</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">

          {/* Contact picker */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/40 mb-1.5 uppercase tracking-wide">
              Contacto *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-white/20 pointer-events-none" />
              <select
                value={contactId}
                onChange={e => { setContactId(e.target.value); setCustomName(''); }}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-800 dark:text-white/80 outline-none focus:ring-2 focus:ring-[#6850E8]/30 transition-all appearance-none"
              >
                <option value="">— Seleccionar contacto existente —</option>
                {MOCK_CONTACTS.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
                <option value="__new__">+ Ingresar nombre manualmente</option>
              </select>
            </div>
            {(contactId === '__new__' || (!contactId && customName !== undefined)) && (
              <input
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Nombre del contacto"
                className="mt-2 w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-800 dark:text-white/80 placeholder-gray-300 dark:placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6850E8]/30 transition-all"
              />
            )}
          </div>

          {/* Phone (only if manual) */}
          {contactId === '__new__' && (
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/40 mb-1.5 uppercase tracking-wide">
                Teléfono
              </label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+57 300 000 0000"
                type="tel"
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-800 dark:text-white/80 placeholder-gray-300 dark:placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6850E8]/30 transition-all"
              />
            </div>
          )}

          {/* Stage */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/40 mb-1.5 uppercase tracking-wide">
              Estado en pipeline *
            </label>
            <div className="relative">
              <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-white/20 pointer-events-none" />
              <select
                value={stage}
                onChange={e => setStage(e.target.value as DealStageLocal)}
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-800 dark:text-white/80 outline-none focus:ring-2 focus:ring-[#6850E8]/30 transition-all appearance-none"
              >
                {STAGE_OPTIONS.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Value */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/40 mb-1.5 uppercase tracking-wide">
              Valor del trato (COP)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-white/20" />
              <input
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="149900"
                type="number"
                min="0"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-800 dark:text-white/80 placeholder-gray-300 dark:placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6850E8]/30 transition-all"
              />
            </div>
          </div>

          {/* Tag (product) */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/40 mb-1.5 uppercase tracking-wide">
              Producto / etiqueta
            </label>
            <input
              value={tag}
              onChange={e => setTag(e.target.value)}
              placeholder="Sesión 1:1, Pack Fotos..."
              className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-800 dark:text-white/80 placeholder-gray-300 dark:placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6850E8]/30 transition-all"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/40 mb-2 uppercase tracking-wide">
              Prioridad
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    priority === p
                      ? p === 'high'   ? 'bg-red-500/15 text-red-500 ring-1 ring-red-400/30'
                      : p === 'medium' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 ring-1 ring-amber-400/30'
                      :                  'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-400/30'
                      : 'bg-gray-100 dark:bg-white/[0.06] text-gray-400 dark:text-white/30 hover:bg-gray-200 dark:hover:bg-white/[0.10]'
                  }`}
                >
                  {p === 'low' ? 'Baja' : p === 'medium' ? 'Media' : 'Alta'}
                </button>
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/40 mb-1.5 uppercase tracking-wide">
              Nota
            </label>
            <div className="relative">
              <StickyNote className="absolute left-3 top-3 w-3.5 h-3.5 text-gray-400 dark:text-white/20" />
              <textarea
                rows={2}
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Contexto, próximos pasos..."
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-800 dark:text-white/80 placeholder-gray-300 dark:placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6850E8]/30 transition-all resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={save}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold bg-[#6850E8] text-white hover:bg-[#5a44d4] transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Crear trato
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function TabCRM() {
  const [deals, setDeals] = useState<DealCardData[]>(MOCK_DEALS);
  const [addOpen, setAddOpen] = useState(false);

  const activeDeals = deals.filter(d => !['closing-green', 'closing-red'].includes(d.stage));
  const wonDeals    = deals.filter(d => d.stage === 'closing-green');
  const pipelineVal = activeDeals.reduce((s, d) => s + (d.value ?? 0), 0);
  const wonVal      = wonDeals.reduce((s, d) => s + (d.value ?? 0), 0);

  const handleAdd = (d: DealCardData) => setDeals(prev => [...prev, d]);

  return (
    <div className="flex flex-col h-full">
      {/* Demo banner + add button */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-400/[0.08] border border-amber-200/60 dark:border-amber-400/20 rounded-xl px-3 py-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <p className="text-[11px] text-amber-700 dark:text-amber-400/90 flex-1">
            Pipeline de ejemplo — aquí verás el estado de cada oportunidad con clientes de esta creadora
          </p>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6850E8] text-white text-xs font-semibold rounded-lg hover:bg-[#5a44d4] transition-colors flex-shrink-0 shadow-sm"
          >
            <Plus className="w-3 h-3" />
            Nuevo trato
          </button>
        </div>
      </div>

      {/* Summary row */}
      <div className="px-4 pb-4 shrink-0">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Target className="w-3 h-3 text-[#6850E8]" />
              <p className="text-[9px] font-medium text-gray-400 dark:text-white/30">Activos</p>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white/90 leading-none">{activeDeals.length}</p>
            <p className="text-[9px] text-gray-400 dark:text-white/25 mt-0.5">{COP(pipelineVal)}</p>
          </div>
          <div className="bg-emerald-50 dark:bg-emerald-500/[0.06] border border-emerald-100 dark:border-emerald-500/20 rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Trophy className="w-3 h-3 text-emerald-500" />
              <p className="text-[9px] font-medium text-emerald-600/70 dark:text-emerald-400/50">Ganados</p>
            </div>
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 leading-none">{wonDeals.length}</p>
            <p className="text-[9px] text-emerald-600/60 dark:text-emerald-400/40 mt-0.5">{COP(wonVal)}</p>
          </div>
          <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="w-3 h-3 text-violet-500" />
              <p className="text-[9px] font-medium text-gray-400 dark:text-white/30">Conversión</p>
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white/90 leading-none">
              {deals.length > 0 ? Math.round(wonDeals.length / deals.length * 100) : 0}%
            </p>
            <p className="text-[9px] text-gray-400 dark:text-white/25 mt-0.5">{deals.length} totales</p>
          </div>
        </div>
      </div>

      {/* Kanban — horizontal scroll */}
      <div className="flex-1 overflow-x-auto px-4 pb-6">
        <KanbanBoard deals={deals} onDealsChange={setDeals} />
      </div>

      {/* Add deal modal */}
      <AnimatePresence>
        {addOpen && <AddDealModal onClose={() => setAddOpen(false)} onAdd={handleAdd} />}
      </AnimatePresence>
    </div>
  );
}
