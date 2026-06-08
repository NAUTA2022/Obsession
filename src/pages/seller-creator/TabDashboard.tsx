import { motion } from 'framer-motion';
import {
  MessageCircle, Users, CalendarDays, Target,
  Copy, TrendingUp, DollarSign, Banknote, Link as LinkIcon,
  ArrowUpRight,
} from 'lucide-react';
import type { WorkTeamCreator } from '../../services/api/work-teams.service';
import { MOCK_CONVERSATIONS, MOCK_CONTACTS, MOCK_BOOKINGS, MOCK_DEALS, MOCK_PRODUCTS } from './mockData';
import toast from 'react-hot-toast';

interface Props {
  creator: WorkTeamCreator | null;
  username: string;
}

const COP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export default function TabDashboard({ creator, username }: Props) {
  const commission   = creator?.myCommission ?? 15;
  const mySales      = creator?.mySales ?? 5;
  const wonDeals     = MOCK_DEALS.filter(d => d.stage === 'closing-green');
  const totalRevenue = wonDeals.reduce((s, d) => s + (d.value ?? 0), 0);
  const myEarnings   = Math.round(totalRevenue * commission / 100);
  const link = creator?.creatorLink
    ? `${creator.creatorLink}${creator.referralCode ? `?ref=${creator.referralCode}` : ''}`
    : `https://touch.vip/${username}?ref=seller`;

  const activeDeals = MOCK_DEALS.filter(d => !['closing-green', 'closing-red'].includes(d.stage));
  const pipelineVal = activeDeals.reduce((s, d) => s + (d.value ?? 0), 0);

  // Top product by (theoretical) sales rank
  const topProduct = MOCK_PRODUCTS.reduce((a, b) => (a.totalSales > b.totalSales ? a : b));
  const topEarning = Math.round(topProduct.price * commission / 100);

  // Funnel
  const funnel = [
    { label: 'Contactos',      n: MOCK_CONTACTS.length,      pct: 100, color: 'bg-slate-300 dark:bg-white/20' },
    { label: 'Conversaciones', n: MOCK_CONVERSATIONS.length, pct: Math.round(MOCK_CONVERSATIONS.length / MOCK_CONTACTS.length * 100), color: 'bg-blue-400/70' },
    { label: 'Propuestas',     n: activeDeals.length,        pct: Math.round(activeDeals.length / MOCK_CONTACTS.length * 100),       color: 'bg-violet-400/70' },
    { label: 'Ventas',         n: mySales,                   pct: Math.round(mySales / MOCK_CONTACTS.length * 100),                  color: 'bg-emerald-400/80' },
  ];

  // Recent activity (latest bookings + conversations mixed)
  const recentActivity = [
    ...MOCK_BOOKINGS.filter(b => b.status === 'completed').slice(0, 2).map(b => ({
      id: b.id,
      icon: CalendarDays,
      iconCls: 'bg-violet-500/10 text-violet-500',
      text: `Sesión completada con ${b.client}`,
      sub: COP(b.amount),
      time: b.dateLabel,
    })),
    ...MOCK_CONVERSATIONS.filter(c => c.status === 'sold').slice(0, 2).map(c => ({
      id: c.id,
      icon: DollarSign,
      iconCls: 'bg-emerald-500/10 text-emerald-500',
      text: `Venta cerrada — ${c.name}`,
      sub: 'Venta confirmada',
      time: c.time,
    })),
  ].slice(0, 4);

  return (
    <div className="p-4 space-y-4 w-full">

      {/* ── Revenue hero card ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6850E8] to-purple-700 p-5 text-white">
        <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-white/[0.07]" />
        <div className="absolute -bottom-6 right-4 w-24 h-24 rounded-full bg-white/[0.05]" />
        <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">Ingresos estimados</p>
        <p className="text-3xl font-bold tracking-tight">{COP(myEarnings)}</p>
        <p className="text-sm text-white/60 mt-1">
          {commission}% de comisión · {COP(totalRevenue)} en ventas cerradas
        </p>
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-[10px] text-white/50">Ventas cerradas</p>
            <p className="text-lg font-bold">{mySales}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-[10px] text-white/50">Pipeline</p>
            <p className="text-lg font-bold">{COP(pipelineVal)}</p>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <p className="text-[10px] text-white/50">Conversión</p>
            <p className="text-lg font-bold">
              {MOCK_CONTACTS.length > 0 ? Math.round(mySales / MOCK_CONTACTS.length * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: MessageCircle, label: 'Conversaciones', value: MOCK_CONVERSATIONS.length, sub: `${MOCK_CONVERSATIONS.filter(c => c.status === 'open').length} activas`, color: 'bg-blue-500/10 text-blue-500' },
          { icon: Users,         label: 'Contactos',      value: MOCK_CONTACTS.length,      sub: `${MOCK_CONTACTS.filter(c => c.status === 'Aprobado').length} aprobados`, color: 'bg-orange-500/10 text-orange-500' },
          { icon: CalendarDays,  label: 'Reservas hoy',   value: MOCK_BOOKINGS.filter(b => b.dateLabel === 'Hoy').length, sub: 'pendientes', color: 'bg-violet-500/10 text-violet-500' },
          { icon: Target,        label: 'Deals activos',  value: activeDeals.length, sub: 'en pipeline', color: 'bg-amber-500/10 text-amber-500' },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-4 flex items-start gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 dark:text-white/30 font-medium">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white/90 leading-tight">{stat.value}</p>
                <p className="text-[10px] text-gray-400 dark:text-white/25">{stat.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Conversion funnel ── */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-white/[0.04]">
          <TrendingUp className="w-3.5 h-3.5 text-[#6850E8]" />
          <p className="text-xs font-semibold text-gray-700 dark:text-white/60">Embudo de conversión</p>
        </div>
        <div className="p-4 space-y-3">
          {funnel.map((row, i) => (
            <div key={row.label} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-lg bg-gray-50 dark:bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] font-bold text-gray-400 dark:text-white/30">{i + 1}</span>
              </div>
              <p className="text-xs text-gray-600 dark:text-white/50 w-28 flex-shrink-0">{row.label}</p>
              <div className="flex-1 h-2 bg-gray-100 dark:bg-white/[0.05] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${row.pct}%` }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${row.color}`}
                />
              </div>
              <span className="text-sm font-bold text-gray-700 dark:text-white/60 w-5 text-right flex-shrink-0">{row.n}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Top product ── */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-white/[0.04]">
          <Banknote className="w-3.5 h-3.5 text-emerald-500" />
          <p className="text-xs font-semibold text-gray-700 dark:text-white/60">Producto más vendido</p>
        </div>
        <div className="flex items-center gap-3 p-4">
          {topProduct.thumbnail && (
            <img
              src={topProduct.thumbnail}
              alt={topProduct.title}
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white/90 truncate">{topProduct.title}</p>
            <p className="text-xs text-gray-400 dark:text-white/30 truncate">{topProduct.description}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs font-bold text-gray-700 dark:text-white/60">{COP(topProduct.price)}</span>
              <span className="text-[10px] text-gray-300 dark:text-white/15">·</span>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                +{COP(topEarning)} por venta
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-500/[0.08] border border-amber-100 dark:border-amber-500/20 rounded-xl px-2.5 py-1.5 flex-shrink-0">
            <ArrowUpRight className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{topProduct.totalSales}</span>
          </div>
        </div>
      </div>

      {/* ── Recent activity ── */}
      {recentActivity.length > 0 && (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-white/[0.04]">
            <p className="text-xs font-semibold text-gray-700 dark:text-white/60">Actividad reciente</p>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
            {recentActivity.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${item.iconCls}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 dark:text-white/70 truncate">{item.text}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{item.sub}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-white/25 flex-shrink-0">{item.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Sale link ── */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.06] rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <LinkIcon className="w-3.5 h-3.5 text-[#6850E8]" />
          <p className="text-xs font-semibold text-gray-700 dark:text-white/60">Tu link de venta</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-white/[0.03] rounded-xl px-3 py-2.5">
          <p className="flex-1 text-xs font-mono text-[#6850E8] dark:text-[#9277F5] truncate">{link}</p>
          <button
            onClick={() => { navigator.clipboard.writeText(link); toast.success('Link copiado'); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#6850E8] text-white text-[11px] font-semibold rounded-lg hover:bg-[#5a44d4] transition-colors flex-shrink-0"
          >
            <Copy className="w-3 h-3" /> Copiar
          </button>
        </div>
      </div>
    </div>
  );
}
