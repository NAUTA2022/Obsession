import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, MessageCircle, Users, DollarSign,
  Target, ChevronRight, ArrowUpRight, Clock,
  CheckCircle2, Star, Banknote, Trophy, Zap,
  BarChart2, UserCircle2, Sparkles, Copy, Check,
  ShoppingBag, CalendarDays,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { ROUTES } from '../constants/routes';
import RevenueChart from '../components/charts/RevenueChart';
import SalesGaugeChart from '../components/charts/SalesGaugeChart';

// ── Helpers ────────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

// ── Mock data ──────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: 'Comisiones del mes',
    value: COP(487_200),
    delta: '+22%',
    up: true,
    icon: <Banknote className="w-5 h-5" />,
    color: '#6850E8',
    bg: '#6850E810',
  },
  {
    label: 'Tratos activos',
    value: '14',
    delta: '+3 esta semana',
    up: true,
    icon: <Target className="w-5 h-5" />,
    color: '#3B82F6',
    bg: '#3B82F610',
  },
  {
    label: 'Contactos totales',
    value: '38',
    delta: '+5 nuevos',
    up: true,
    icon: <Users className="w-5 h-5" />,
    color: '#10B981',
    bg: '#10B98110',
  },
  {
    label: 'Creadoras activas',
    value: '3',
    delta: '1 nueva',
    up: null,
    icon: <Star className="w-5 h-5" />,
    color: '#F59E0B',
    bg: '#F59E0B10',
  },
];

const QUICK_ACCESS = [
  { label: 'Mis Creadoras', icon: <Users className="w-5 h-5" />,        route: ROUTES['seller-creators'], gradient: 'from-[#6850E8] to-[#9277F5]' },
  { label: 'CRM',           icon: <Target className="w-5 h-5" />,       route: '/seller/creators',        gradient: 'from-[#3B82F6] to-[#60A5FA]' },
  { label: 'Conversaciones',icon: <MessageCircle className="w-5 h-5" />,route: '/seller/creators',        gradient: 'from-[#8B5CF6] to-[#A78BFA]' },
  { label: 'Contactos',     icon: <UserCircle2 className="w-5 h-5" />,  route: '/seller/creators',        gradient: 'from-[#EC4899] to-[#F472B6]' },
  { label: 'Productos',     icon: <ShoppingBag className="w-5 h-5" />,  route: '/seller/creators',        gradient: 'from-[#10B981] to-[#34D399]' },
  { label: 'Calendario',    icon: <CalendarDays className="w-5 h-5" />, route: '/seller/creators',        gradient: 'from-[#F59E0B] to-[#FBBF24]' },
  { label: 'IA Comercial',  icon: <Sparkles className="w-5 h-5" />,     route: '/seller/ai-sales',        gradient: 'from-[#EF4444] to-[#F87171]' },
  { label: 'Comisiones',    icon: <BarChart2 className="w-5 h-5" />,    route: '/seller/commissions',     gradient: 'from-[#14B8A6] to-[#2DD4BF]' },
];

const TOP_CREATORS = [
  { name: 'Valentina López', username: 'vale_creator',  sales: 18, earnings: 349_800, commission: 15, gradient: 'from-violet-400 to-purple-600',  avatar: null },
  { name: 'Sofía Ramírez',   username: 'sofia_creator', sales: 11, earnings: 198_000, commission: 12, gradient: 'from-pink-400 to-rose-500',       avatar: null },
  { name: 'Camila Torres',   username: 'camila_vip',    sales: 7,  earnings: 134_400, commission: 18, gradient: 'from-blue-400 to-indigo-500',     avatar: null },
];

const RECENT_SALES = [
  { id: 1, product: 'Pack VIP',     creator: 'vale_creator',  client: 'Isabella Mora',  amount: 37_485, commission: 15, time: 'hace 30 min' },
  { id: 2, product: 'Sesión 1:1',   creator: 'vale_creator',  client: 'Mariana García', amount: 22_485, commission: 15, time: 'hace 2h'     },
  { id: 3, product: 'Pack Premium', creator: 'sofia_creator', client: 'Valentina Ríos', amount: 13_440, commission: 12, time: 'ayer'        },
  { id: 4, product: 'Suscripción',  creator: 'camila_vip',    client: 'Andrea Morales', amount: 8_910,  commission: 18, time: 'ayer'        },
  { id: 5, product: 'Pack Fotos',   creator: 'vale_creator',  client: 'Camila Soto',    amount: 13_485, commission: 15, time: 'hace 2 días' },
];

const ACTIVE_DEALS = [
  { id: 1, name: 'Isabella Mora',    stage: 'En negociación',   value: 249_900, priority: 'high',   creator: 'vale_creator'  },
  { id: 2, name: 'Mariana García',   stage: 'Propuesta enviada',value: 149_900, priority: 'alta',   creator: 'vale_creator'  },
  { id: 3, name: 'Diana Castillo',   stage: 'Selección',        value: 89_900,  priority: 'medium', creator: 'sofia_creator' },
  { id: 4, name: 'Paola Herrera',    stage: 'Revisión cliente', value: 49_900,  priority: 'low',    creator: 'camila_vip'    },
];

const PRIORITY_STYLE: Record<string, string> = {
  high:   'bg-red-500/10 text-red-500',
  alta:   'bg-red-500/10 text-red-500',
  medium: 'bg-amber-500/10 text-amber-500',
  low:    'bg-emerald-500/10 text-emerald-500',
};

const PRIORITY_LABEL: Record<string, string> = {
  high: 'Alta', alta: 'Alta', medium: 'Media', low: 'Baja',
};

// ── Main page ──────────────────────────────────────────────────────────────────

export default function SellerDashboardPage() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const [copiedLink, setCopiedLink] = useState(false);

  const profileLink = `${window.location.origin}/vendedor/${user?.username ?? 'me'}`;

  const copyLink = () => {
    navigator.clipboard.writeText(profileLink).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const totalEarnings = RECENT_SALES.reduce((s, r) => s + r.amount, 0);
  const conversionRate = Math.round((RECENT_SALES.length / 38) * 100);

  return (
    <div className="w-full flex flex-col gap-7 px-5 py-6">

      {/* ── Welcome header ── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {greeting()}, {user?.displayName?.split(' ')[0] ?? 'vendedor'} 👋
          </h1>
          <p className="text-sm text-gray-400 dark:text-white/35 mt-0.5">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Referral link copy */}
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={copyLink}
          className={`hidden sm:flex items-center gap-2 text-sm font-bold px-4 py-2.5 rounded-xl border transition-all ${
            copiedLink
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-white dark:bg-white/[0.06] border-gray-100 dark:border-white/[0.08] text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.09]'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {copiedLink ? (
              <motion.span key="check" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="flex items-center gap-2">
                <Check className="w-4 h-4" /> Copiado
              </motion.span>
            ) : (
              <motion.span key="copy" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="flex items-center gap-2">
                <Copy className="w-4 h-4" /> Enviar mi perfil
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg, color: s.color }}>
                {s.icon}
              </div>
              {s.up !== null ? (
                <span className={`text-xs font-bold flex items-center gap-0.5 ${s.up ? 'text-emerald-500' : 'text-red-400'}`}>
                  <TrendingUp className={`w-3 h-3 ${!s.up && 'rotate-180'}`} />
                  {s.delta}
                </span>
              ) : (
                <span className="text-xs font-medium text-gray-400 dark:text-white/30">{s.delta}</span>
              )}
            </div>
            <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{s.value}</p>
            <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── Quick access ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider">Acceso rápido</h2>
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
          {QUICK_ACCESS.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(item.route)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm hover:shadow-md transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110`}>
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold text-gray-500 dark:text-white/40 text-center leading-tight">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Analytics ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider">Analítica de ventas</h2>
          <button
            onClick={() => navigate('/seller/analytics')}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6850E8] dark:text-[#9277F5] hover:opacity-80 transition-opacity"
          >
            Ver reporte completo <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
          <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
            <RevenueChart />
          </div>
          <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
            <SalesGaugeChart
              title="Ventas por creadora"
              data={{ vendedores: 349800, miClonAI: 198000, yo: 134400 }}
            />
          </div>
        </div>
      </div>

      {/* ── Main content: left + right ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">

        {/* Left: Active deals + Recent sales */}
        <div className="flex flex-col gap-5">

          {/* Tratos activos */}
          <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-white/[0.04]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#6850E8]/10 flex items-center justify-center text-[#6850E8]">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Tratos activos</h3>
              </div>
              <button
                onClick={() => navigate(ROUTES['seller-creators'])}
                className="flex items-center gap-1 text-xs font-semibold text-[#6850E8] dark:text-[#9277F5] hover:opacity-70 transition-opacity"
              >
                Ver CRM <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
              {ACTIVE_DEALS.map((deal, i) => (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6850E8]/20 to-violet-500/20 flex items-center justify-center text-[#6850E8] text-xs font-black flex-shrink-0">
                    {deal.name.split(' ').slice(0, 2).map(w => w[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/80 truncate">{deal.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-gray-400 dark:text-white/25">@{deal.creator}</span>
                      <span className="text-gray-200 dark:text-white/10">·</span>
                      <span className="text-[10px] text-gray-400 dark:text-white/25">{deal.stage}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-bold text-gray-700 dark:text-white/60 tabular-nums">
                      {COP(deal.value)}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${PRIORITY_STYLE[deal.priority]}`}>
                      {PRIORITY_LABEL[deal.priority]}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Ventas recientes */}
          <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-white/[0.04]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Ventas recientes</h3>
              </div>
              <button
                onClick={() => navigate('/seller/commissions')}
                className="flex items-center gap-1 text-xs font-semibold text-[#6850E8] dark:text-[#9277F5] hover:opacity-70 transition-opacity"
              >
                Ver todas <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
              {RECENT_SALES.map((sale, i) => (
                <motion.div
                  key={sale.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/80 truncate">{sale.product}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-gray-400 dark:text-white/25 truncate">{sale.client}</span>
                      <span className="text-gray-200 dark:text-white/10">·</span>
                      <span className="text-[10px] text-gray-400 dark:text-white/25">@{sale.creator}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{COP(sale.amount)}
                    </span>
                    <span className="text-[10px] text-gray-300 dark:text-white/20">{sale.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Total */}
            <div className="flex items-center justify-between px-5 py-3 bg-emerald-50/50 dark:bg-emerald-500/[0.04] border-t border-emerald-100 dark:border-emerald-500/10">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400/80">Total comisiones (período)</span>
              <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 tabular-nums">{COP(totalEarnings)}</span>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-4">

          {/* Mis creadoras */}
          <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-white/[0.04]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
                  <Trophy className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Mis creadoras</h3>
              </div>
              <button
                onClick={() => navigate(ROUTES['seller-creators'])}
                className="text-[#6850E8] dark:text-[#9277F5] hover:opacity-70 transition-opacity"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
              {TOP_CREATORS.map((c, i) => (
                <motion.button
                  key={c.username}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => navigate(`/seller/creator/${c.username}/dashboard`)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors text-left"
                >
                  {/* rank */}
                  <span className={`text-xs font-black w-4 flex-shrink-0 ${
                    i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-400' : 'text-amber-700/60'
                  }`}>
                    #{i + 1}
                  </span>
                  {/* avatar */}
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
                    {c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/80 truncate">{c.name}</p>
                    <p className="text-[10px] text-gray-400 dark:text-white/25">{c.sales} ventas · {c.commission}%</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {COP(c.earnings)}
                    </p>
                    <p className="text-[9px] text-gray-300 dark:text-white/15">generado</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Performance summary */}
          <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] overflow-hidden shadow-sm p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Rendimiento del mes</h3>

            {/* Conversion funnel */}
            <div className="space-y-2.5">
              {[
                { label: 'Contactos',       n: 38, pct: 100, color: 'bg-slate-300 dark:bg-white/20' },
                { label: 'Conversaciones',  n: 22, pct: 58,  color: 'bg-blue-400/70'                },
                { label: 'Propuestas',      n: 14, pct: 37,  color: 'bg-violet-400/70'              },
                { label: 'Ventas cerradas', n: 5,  pct: 13,  color: 'bg-emerald-400/80'             },
              ].map(row => (
                <div key={row.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-gray-500 dark:text-white/40">{row.label}</span>
                    <span className="text-[11px] font-bold text-gray-700 dark:text-white/60 tabular-nums">{row.n}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.pct}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                      className={`h-full rounded-full ${row.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Conversion rate */}
            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/[0.04] flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-white/30">Tasa de conversión</span>
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#6850E8]" />
                <span className="text-sm font-black text-[#6850E8] dark:text-[#9277F5]">{conversionRate}%</span>
              </div>
            </div>
          </div>

          {/* Mi perfil de vendedor */}
          <div className="rounded-3xl bg-gradient-to-br from-[#6850E8]/10 to-violet-500/5 dark:from-[#6850E8]/15 dark:to-violet-500/10 border border-[#6850E8]/20 overflow-hidden p-5">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#6850E8]" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Mi perfil de vendedor</h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-white/40 mb-3 leading-relaxed">
              Comparte tu perfil público con métricas, hitos y botón de colaboración
            </p>
            <div className="flex items-center gap-2 bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] rounded-xl px-3 py-2 mb-3">
              <span className="flex-1 text-[11px] text-gray-500 dark:text-white/40 truncate font-mono">{profileLink}</span>
              <button
                onClick={copyLink}
                className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                  copiedLink
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-[#6850E8]/10 text-[#6850E8] hover:bg-[#6850E8]/20'
                }`}
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <button
              onClick={() => navigate(`/vendedor/${user?.username ?? 'me'}`)}
              className="w-full flex items-center justify-center gap-2 text-xs font-bold text-[#6850E8] dark:text-[#9277F5] py-2 rounded-xl bg-[#6850E8]/10 hover:bg-[#6850E8]/20 transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" /> Ver mi perfil público
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
