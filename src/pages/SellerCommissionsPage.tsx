import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Banknote, TrendingUp, Clock, CheckCircle2, Search,
  Filter, ChevronDown, ArrowUpRight, Download, X,
  DollarSign, Calendar, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

// ── Mock data ──────────────────────────────────────────────────────────────────

type CommissionStatus = 'pagada' | 'pendiente' | 'en_proceso';

interface Commission {
  id: string;
  creator: string;
  creatorUsername: string;
  client: string;
  product: string;
  saleAmount: number;
  commissionPct: number;
  earned: number;
  status: CommissionStatus;
  date: string;
  gradient: string;
}

const MOCK_COMMISSIONS: Commission[] = [
  { id: 'c1',  creator: 'Valentina López', creatorUsername: 'vale_creator',  client: 'Isabella Mora',    product: 'Pack VIP',          saleAmount: 249_900, commissionPct: 15, earned: 37_485, status: 'pagada',     date: '2026-06-08', gradient: 'from-violet-400 to-purple-600'  },
  { id: 'c2',  creator: 'Valentina López', creatorUsername: 'vale_creator',  client: 'Mariana García',   product: 'Sesión 1:1',        saleAmount: 149_900, commissionPct: 15, earned: 22_485, status: 'pagada',     date: '2026-06-07', gradient: 'from-violet-400 to-purple-600'  },
  { id: 'c3',  creator: 'Sofía Ramírez',   creatorUsername: 'sofia_creator', client: 'Valentina Ríos',   product: 'Pack Fotos',        saleAmount: 112_000, commissionPct: 12, earned: 13_440, status: 'pagada',     date: '2026-06-06', gradient: 'from-pink-400 to-rose-500'       },
  { id: 'c4',  creator: 'Camila Torres',   creatorUsername: 'camila_vip',    client: 'Andrea Morales',   product: 'Suscripción',       saleAmount: 49_500,  commissionPct: 18, earned: 8_910,  status: 'en_proceso', date: '2026-06-05', gradient: 'from-blue-400 to-indigo-500'    },
  { id: 'c5',  creator: 'Valentina López', creatorUsername: 'vale_creator',  client: 'Camila Soto',      product: 'Pack Fotos',        saleAmount: 89_900,  commissionPct: 15, earned: 13_485, status: 'pagada',     date: '2026-06-04', gradient: 'from-violet-400 to-purple-600'  },
  { id: 'c6',  creator: 'Sofía Ramírez',   creatorUsername: 'sofia_creator', client: 'Lucía Fernández',  product: 'Video Personal',    saleAmount: 75_000,  commissionPct: 12, earned: 9_000,  status: 'pendiente',  date: '2026-06-03', gradient: 'from-pink-400 to-rose-500'       },
  { id: 'c7',  creator: 'Valentina López', creatorUsername: 'vale_creator',  client: 'Diana Castillo',   product: 'Membresía Gold',    saleAmount: 199_000, commissionPct: 15, earned: 29_850, status: 'pendiente',  date: '2026-06-02', gradient: 'from-violet-400 to-purple-600'  },
  { id: 'c8',  creator: 'Camila Torres',   creatorUsername: 'camila_vip',    client: 'Paola Herrera',    product: 'Pack Premium',      saleAmount: 159_000, commissionPct: 18, earned: 28_620, status: 'en_proceso', date: '2026-06-01', gradient: 'from-blue-400 to-indigo-500'    },
  { id: 'c9',  creator: 'Sofía Ramírez',   creatorUsername: 'sofia_creator', client: 'Natalia Gómez',    product: 'Sesión Grupal',     saleAmount: 55_000,  commissionPct: 12, earned: 6_600,  status: 'pagada',     date: '2026-05-30', gradient: 'from-pink-400 to-rose-500'       },
  { id: 'c10', creator: 'Valentina López', creatorUsername: 'vale_creator',  client: 'Sara Medina',      product: 'Pack VIP',          saleAmount: 249_900, commissionPct: 15, earned: 37_485, status: 'pagada',     date: '2026-05-28', gradient: 'from-violet-400 to-purple-600'  },
];

const STATUS_CONFIG: Record<CommissionStatus, { label: string; pill: string; icon: typeof CheckCircle2 }> = {
  pagada:     { label: 'Pagada',      pill: 'bg-emerald-500/10 text-emerald-500',  icon: CheckCircle2 },
  pendiente:  { label: 'Pendiente',   pill: 'bg-amber-400/10 text-amber-500',      icon: Clock        },
  en_proceso: { label: 'En proceso',  pill: 'bg-blue-500/10 text-blue-500',        icon: ArrowUpRight },
};

// ── Withdraw modal ─────────────────────────────────────────────────────────────

function WithdrawModal({ available, onClose }: { available: number; onClose: () => void }) {
  const [amount, setAmount] = useState(COP(available).replace(/[^0-9]/g, ''));
  const [sent, setSent] = useState(false);

  const handleWithdraw = () => {
    setSent(true);
    setTimeout(() => {
      toast.success('Solicitud de retiro enviada');
      onClose();
    }, 1200);
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
            <p className="text-sm font-bold text-gray-900 dark:text-white/90">Solicitar retiro</p>
            <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">Disponible: {COP(available)}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06]">
            <X className="w-4 h-4" />
          </button>
        </div>
        {sent ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            </motion.div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white/90">Procesando retiro...</p>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 dark:text-white/40 mb-1.5 uppercase tracking-wide">Monto a retirar (COP)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-white/20" />
                <input
                  value={amount}
                  onChange={e => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-700 dark:text-white/70 outline-none focus:ring-2 focus:ring-[#6850E8]/30 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-colors">
                Cancelar
              </button>
              <button onClick={handleWithdraw} className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-[#6850E8] text-white hover:bg-[#5a44d4] transition-colors">
                Solicitar retiro
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SellerCommissionsPage() {
  const [search, setSearch]       = useState('');
  const [filterCreator, setFilter] = useState('all');
  const [filterStatus, setFilterS] = useState<'all' | CommissionStatus>('all');
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const totalEarned   = MOCK_COMMISSIONS.reduce((s, c) => s + c.earned, 0);
  const totalPaid     = MOCK_COMMISSIONS.filter(c => c.status === 'pagada').reduce((s, c) => s + c.earned, 0);
  const totalPending  = MOCK_COMMISSIONS.filter(c => c.status !== 'pagada').reduce((s, c) => s + c.earned, 0);
  const thisMonth     = MOCK_COMMISSIONS.filter(c => c.date.startsWith('2026-06')).reduce((s, c) => s + c.earned, 0);

  const creators = ['all', ...Array.from(new Set(MOCK_COMMISSIONS.map(c => c.creatorUsername)))];

  const filtered = MOCK_COMMISSIONS.filter(c => {
    const matchSearch  = c.client.toLowerCase().includes(search.toLowerCase()) || c.product.toLowerCase().includes(search.toLowerCase()) || c.creator.toLowerCase().includes(search.toLowerCase());
    const matchCreator = filterCreator === 'all' || c.creatorUsername === filterCreator;
    const matchStatus  = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchCreator && matchStatus;
  });

  return (
    <div className="w-full flex flex-col gap-6 px-5 py-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Comisiones</h1>
          <p className="text-sm text-gray-400 dark:text-white/35 mt-0.5">Historial de comisiones ganadas por tus creadoras</p>
        </div>
        <button
          onClick={() => setWithdrawOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#6850E8] text-white text-sm font-bold rounded-xl hover:bg-[#5a44d4] transition-colors shadow-sm"
        >
          <Banknote className="w-4 h-4" />
          Solicitar retiro
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total ganado',   value: COP(totalEarned),  icon: <TrendingUp className="w-5 h-5" />,   color: '#6850E8', bg: '#6850E810', delta: '+22% vs mes anterior', up: true  },
          { label: 'Este mes',       value: COP(thisMonth),    icon: <Calendar className="w-5 h-5" />,     color: '#3B82F6', bg: '#3B82F610', delta: '8 ventas',              up: null  },
          { label: 'Ya pagado',      value: COP(totalPaid),    icon: <CheckCircle2 className="w-5 h-5" />, color: '#10B981', bg: '#10B98110', delta: '7 transacciones',        up: null  },
          { label: 'Por cobrar',     value: COP(totalPending), icon: <Clock className="w-5 h-5" />,        color: '#F59E0B', bg: '#F59E0B10', delta: '3 pendientes',           up: null  },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] p-4 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg, color: s.color }}>
                {s.icon}
              </div>
              {s.up !== null ? (
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />{s.delta}
                </span>
              ) : (
                <span className="text-xs font-medium text-gray-400 dark:text-white/30">{s.delta}</span>
              )}
            </div>
            <p className="text-xl font-black text-gray-900 dark:text-white tabular-nums">{s.value}</p>
            <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-white/20" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por cliente, producto o creadora..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-700 dark:text-white/70 placeholder-gray-300 dark:placeholder-white/20 outline-none focus:ring-2 focus:ring-[#6850E8]/30 transition-all"
          />
        </div>

        {/* Creator filter */}
        <div className="relative">
          <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-white/20 pointer-events-none" />
          <select
            value={filterCreator}
            onChange={e => setFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 text-sm bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] rounded-xl text-gray-700 dark:text-white/70 outline-none focus:ring-2 focus:ring-[#6850E8]/30 appearance-none transition-all"
          >
            <option value="all">Todas las creadoras</option>
            {creators.filter(c => c !== 'all').map(c => (
              <option key={c} value={c}>@{c}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 dark:text-white/20 pointer-events-none" />
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.04]">
          {(['all', 'pagada', 'en_proceso', 'pendiente'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterS(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterStatus === s
                  ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60'
              }`}
            >
              {s === 'all' ? 'Todas' : s === 'en_proceso' ? 'En proceso' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <button
          onClick={() => toast('Exportando CSV...')}
          className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-gray-500 dark:text-white/40 bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.08] rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Exportar
        </button>
      </div>

      {/* Commission list */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="hidden lg:grid grid-cols-[1fr_1fr_1fr_120px_120px_100px_100px] gap-3 px-5 py-3 bg-gray-50/60 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/[0.04]">
          {['Creadora', 'Cliente', 'Producto', 'Venta', 'Comisión', 'Fecha', 'Estado'].map(h => (
            <span key={h} className="text-[11px] font-semibold text-gray-400 dark:text-white/25 uppercase tracking-wider">{h}</span>
          ))}
        </div>

        <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
          <AnimatePresence>
            {filtered.map((c, i) => {
              const { label, pill, icon: StatusIcon } = STATUS_CONFIG[c.status];
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_120px_120px_100px_100px] gap-2 lg:gap-3 px-5 py-4 hover:bg-gray-50/40 dark:hover:bg-white/[0.015] transition-colors"
                >
                  {/* Creator */}
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                      {c.creator.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white/80 truncate">{c.creator}</p>
                      <p className="text-[10px] text-gray-400 dark:text-white/25">@{c.creatorUsername}</p>
                    </div>
                  </div>
                  {/* Client */}
                  <p className="text-sm text-gray-600 dark:text-white/50 self-center">{c.client}</p>
                  {/* Product */}
                  <p className="text-sm text-gray-600 dark:text-white/50 self-center truncate">{c.product}</p>
                  {/* Sale amount */}
                  <p className="text-sm font-semibold text-gray-700 dark:text-white/60 self-center tabular-nums">{COP(c.saleAmount)}</p>
                  {/* Earned */}
                  <div className="self-center">
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">+{COP(c.earned)}</p>
                    <p className="text-[10px] text-gray-400 dark:text-white/25">{c.commissionPct}%</p>
                  </div>
                  {/* Date */}
                  <p className="text-xs text-gray-400 dark:text-white/30 self-center">
                    {new Date(c.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </p>
                  {/* Status */}
                  <div className="self-center">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${pill}`}>
                      <StatusIcon className="w-3 h-3" />
                      {label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Banknote className="w-8 h-8 text-gray-200 dark:text-white/10 mb-3" />
              <p className="text-sm font-medium text-gray-400 dark:text-white/30">Sin resultados</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {withdrawOpen && <WithdrawModal available={totalPending} onClose={() => setWithdrawOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
