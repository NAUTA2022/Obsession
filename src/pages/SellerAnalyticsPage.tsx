import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Users, DollarSign, Target,
  BarChart2, ArrowUpRight, CheckCircle2, Clock,
} from 'lucide-react';
import RevenueChart from '../components/charts/RevenueChart';
import ClientStatusChart from '../components/charts/ClientStatusChart';
import CountriesChart from '../components/charts/CountriesChart';
import SalesGaugeChart from '../components/charts/SalesGaugeChart';

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

// ── Mock data ──────────────────────────────────────────────────────────────────

const CREATOR_PERFORMANCE = [
  { name: 'Valentina López', username: 'vale_creator',  sales: 18, revenue: 349_800, contacts: 14, conversion: 22, commission: 15, trend: +22, gradient: 'from-violet-400 to-purple-600' },
  { name: 'Sofía Ramírez',   username: 'sofia_creator', sales: 11, revenue: 198_000, contacts: 10, conversion: 17, commission: 12, trend: +8,  gradient: 'from-pink-400 to-rose-500'     },
  { name: 'Camila Torres',   username: 'camila_vip',    sales: 7,  revenue: 134_400, contacts: 7,  conversion: 14, commission: 18, trend: -3,  gradient: 'from-blue-400 to-indigo-500'   },
];

const FUNNEL = [
  { label: 'Alcance total',      n: 284, pct: 100, color: 'bg-slate-300 dark:bg-white/20'  },
  { label: 'Contactos activos',  n: 38,  pct: 13,  color: 'bg-blue-400/70'                 },
  { label: 'Conversaciones',     n: 22,  pct: 8,   color: 'bg-violet-400/70'               },
  { label: 'Propuestas enviadas',n: 14,  pct: 5,   color: 'bg-amber-400/80'                },
  { label: 'Ventas cerradas',    n: 5,   pct: 1.8, color: 'bg-emerald-400/80'              },
];

const PERIOD_TABS = ['7D', '30D', '90D', '1A'];

// ── Metric card ───────────────────────────────────────────────────────────────

function MetricCard({ label, value, delta, up, icon, color, bg, delay }: {
  label: string; value: string; delta: string; up: boolean | null;
  icon: React.ReactNode; color: string; bg: string; delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg, color }}>
          {icon}
        </div>
        {up !== null ? (
          <span className={`text-xs font-bold flex items-center gap-0.5 ${up ? 'text-emerald-500' : 'text-red-400'}`}>
            {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {delta}
          </span>
        ) : (
          <span className="text-xs font-medium text-gray-400 dark:text-white/30">{delta}</span>
        )}
      </div>
      <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{value}</p>
      <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{label}</p>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function SellerAnalyticsPage() {
  const [period, setPeriod] = useState('30D');

  const maxRevenue = Math.max(...CREATOR_PERFORMANCE.map(c => c.revenue));

  return (
    <div className="w-full flex flex-col gap-6 px-5 py-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-400 dark:text-white/35 mt-0.5">Rendimiento de ventas y conversión</p>
        </div>
        {/* Period selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.04]">
          {PERIOD_TABS.map(t => (
            <button
              key={t}
              onClick={() => setPeriod(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                period === t
                  ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Comisiones totales" value={COP(682_200)} delta="+22%" up={true}  icon={<DollarSign className="w-5 h-5" />} color="#6850E8" bg="#6850E810" delay={0} />
        <MetricCard label="Contactos generados" value="38"          delta="+5 nuevos"  up={true}  icon={<Users className="w-5 h-5" />}     color="#3B82F6" bg="#3B82F610" delay={0.06} />
        <MetricCard label="Tasa de conversión"  value="13.2%"       delta="-1.3pp"  up={false} icon={<Target className="w-5 h-5" />}    color="#F59E0B" bg="#F59E0B10" delay={0.12} />
        <MetricCard label="Ventas cerradas"     value="36"          delta="+8 vs anterior" up={null}  icon={<CheckCircle2 className="w-5 h-5" />} color="#10B981" bg="#10B98110" delay={0.18} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
        <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
          <RevenueChart />
        </div>
        <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
          <SalesGaugeChart
            title="Ingresos por creadora"
            data={{ vendedores: 349800, miClonAI: 198000, yo: 134400 }}
          />
        </div>
      </div>

      {/* Creator performance table */}
      <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-white/[0.04]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#6850E8]/10 flex items-center justify-center text-[#6850E8]">
              <BarChart2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Rendimiento por creadora</h3>
          </div>
        </div>

        <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
          {CREATOR_PERFORMANCE.map((c, i) => (
            <motion.div
              key={c.username}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className="px-5 py-4"
            >
              {/* Top row */}
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-black w-5 flex-shrink-0 ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-400' : 'text-amber-700/50'}`}>
                  #{i + 1}
                </span>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-white text-xs font-black flex-shrink-0`}>
                  {c.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-white/80 truncate">{c.name}</p>
                  <p className="text-[10px] text-gray-400 dark:text-white/25">@{c.username} · {c.commission}% comisión</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{COP(c.revenue)}</p>
                    <p className="text-[10px] text-gray-400 dark:text-white/25">{c.sales} ventas</p>
                  </div>
                  <span className={`flex items-center gap-0.5 text-xs font-bold ${c.trend > 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                    {c.trend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {Math.abs(c.trend)}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="pl-8 grid grid-cols-3 gap-3">
                {[
                  { label: 'Contactos', val: c.contacts, max: 14, color: 'bg-blue-400/70' },
                  { label: 'Ingresos',  val: c.revenue,  max: maxRevenue, color: 'bg-[#6850E8]/70' },
                  { label: 'Conversión', val: c.conversion, max: 25, color: 'bg-emerald-400/70', suffix: '%' },
                ].map(bar => (
                  <div key={bar.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-gray-400 dark:text-white/30">{bar.label}</span>
                      <span className="text-[10px] font-bold text-gray-600 dark:text-white/50 tabular-nums">
                        {bar.label === 'Ingresos' ? COP(bar.val as number) : `${bar.val}${bar.suffix ?? ''}`}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(bar.val / bar.max) * 100}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: i * 0.1 }}
                        className={`h-full rounded-full ${bar.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom row: funnel + charts */}
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr_1fr] gap-4">

        {/* Conversion funnel */}
        <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-[#6850E8]/10 flex items-center justify-center text-[#6850E8]">
              <Target className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Embudo de conversión</h3>
          </div>
          <div className="space-y-3">
            {FUNNEL.map((row, i) => (
              <div key={row.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 dark:text-white/40">{row.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-gray-700 dark:text-white/60 tabular-nums">{row.n}</span>
                    <span className="text-[10px] text-gray-300 dark:text-white/20 tabular-nums w-10 text-right">{row.pct}%</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.pct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut', delay: i * 0.1 }}
                    className={`h-full rounded-full ${row.color}`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/[0.04]">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 dark:text-white/30">Alcance → Venta</span>
              <div className="flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-sm font-black text-emerald-500">1.8%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Client status */}
        <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
          <ClientStatusChart />
        </div>

        {/* Countries */}
        <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
          <CountriesChart />
        </div>
      </div>

      {/* Time-to-close metric */}
      <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Tiempo promedio de cierre por etapa</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { stage: 'Selección',       days: 1.2, color: 'bg-slate-400/70'   },
            { stage: 'Propuesta',       days: 2.8, color: 'bg-blue-400/70'    },
            { stage: 'Negociación',     days: 4.1, color: 'bg-amber-400/80'   },
            { stage: 'Revisión',        days: 2.5, color: 'bg-violet-400/70'  },
            { stage: 'Cierre ✅',       days: 0.8, color: 'bg-emerald-500/80' },
            { stage: 'Cierre ❌',       days: 3.2, color: 'bg-red-400/70'     },
            { stage: 'Seguimiento',     days: 5.6, color: 'bg-indigo-400/70'  },
          ].map(s => (
            <div key={s.stage} className="bg-gray-50 dark:bg-white/[0.03] rounded-2xl p-3 text-center">
              <p className="text-xl font-black text-gray-900 dark:text-white tabular-nums">{s.days}</p>
              <p className="text-[9px] font-bold text-gray-400 dark:text-white/25 mb-2">días prom.</p>
              <div className="h-1.5 bg-gray-200 dark:bg-white/[0.08] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(s.days / 6) * 100}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`h-full rounded-full ${s.color}`}
                />
              </div>
              <p className="text-[9px] text-gray-400 dark:text-white/25 mt-2 leading-tight">{s.stage}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
