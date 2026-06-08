import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, MessageCircle, Calendar, ShoppingBag,
  Sparkles, Users, DollarSign, Star,
  Image as ImageIcon, Wand2, ChevronRight,
  ArrowUpRight, Clock, CheckCircle2, Package,
  Bot, BarChart2, Zap, Crown, Eye, Download,
  Video, Plus,
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { ROUTES } from '../constants/routes';
import RevenueChart from '../components/charts/RevenueChart';
import ClientStatusChart from '../components/charts/ClientStatusChart';
import SalesGaugeChart from '../components/charts/SalesGaugeChart';
import CountriesChart from '../components/charts/CountriesChart';

// ── Helpers ────────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

// ── Mock data ──────────────────────────────────────────────────────────────────

const STATS = [
  {
    label: 'Ingresos del mes',
    value: '$3,240',
    delta: '+18%',
    up: true,
    icon: <DollarSign className="w-5 h-5" />,
    color: '#6850E8',
    bg: '#6850E810',
  },
  {
    label: 'Conversaciones',
    value: '84',
    delta: '+6',
    up: true,
    icon: <MessageCircle className="w-5 h-5" />,
    color: '#3B82F6',
    bg: '#3B82F610',
  },
  {
    label: 'Reservas pendientes',
    value: '7',
    delta: '2 hoy',
    up: null,
    icon: <Calendar className="w-5 h-5" />,
    color: '#F59E0B',
    bg: '#F59E0B10',
  },
  {
    label: 'Productos activos',
    value: '12',
    delta: '+2 esta semana',
    up: null,
    icon: <Package className="w-5 h-5" />,
    color: '#10B981',
    bg: '#10B98110',
  },
];

const QUICK_ACCESS = [
  { label: 'Productos',        icon: <ShoppingBag className="w-5 h-5" />,   route: ROUTES.products,             color: '#6850E8', gradient: 'from-[#6850E8] to-[#9277F5]' },
  { label: 'CRM · Deals',     icon: <BarChart2 className="w-5 h-5" />,      route: ROUTES['crm-deals'],         color: '#3B82F6', gradient: 'from-[#3B82F6] to-[#60A5FA]' },
  { label: 'Mensajes',         icon: <MessageCircle className="w-5 h-5" />, route: ROUTES['creator-inbox'],     color: '#8B5CF6', gradient: 'from-[#8B5CF6] to-[#A78BFA]' },
  { label: 'Reservas',         icon: <Calendar className="w-5 h-5" />,      route: '/creator/bookings',         color: '#F59E0B', gradient: 'from-[#F59E0B] to-[#FBBF24]' },
  { label: 'Studio AI',        icon: <Sparkles className="w-5 h-5" />,      route: ROUTES['creator-studio-ai'], color: '#EC4899', gradient: 'from-[#EC4899] to-[#F472B6]' },
  { label: 'Vendedores',       icon: <Users className="w-5 h-5" />,         route: ROUTES['discover-sellers'],  color: '#10B981', gradient: 'from-[#10B981] to-[#34D399]' },
  { label: 'Ingresos',         icon: <TrendingUp className="w-5 h-5" />,    route: ROUTES['creator-earnings'],  color: '#14B8A6', gradient: 'from-[#14B8A6] to-[#2DD4BF]' },
  { label: 'Membresía',        icon: <Crown className="w-5 h-5" />,         route: ROUTES.membership,           color: '#F59E0B', gradient: 'from-[#F59E0B] to-[#FBBF24]' },
];

const UPCOMING_BOOKINGS = [
  { id: 1, client: 'Laura M.',    type: 'videocall', time: 'Hoy 4:00 PM',    avatar: 'LM', color: '#6850E8' },
  { id: 2, client: 'Carlos R.',   type: 'call',      time: 'Hoy 6:30 PM',    avatar: 'CR', color: '#3B82F6' },
  { id: 3, client: 'Sofía T.',    type: 'videocall', time: 'Mañana 10:00 AM', avatar: 'ST', color: '#EC4899' },
  { id: 4, client: 'Miguel A.',   type: 'call',      time: 'Mañana 3:00 PM', avatar: 'MA', color: '#10B981' },
];

const RECENT_SALES = [
  { id: 1, product: 'Pack Premium',    buyer: 'Laura M.',  amount: '$120', time: 'hace 1h',  status: 'paid' },
  { id: 2, product: 'Sesión 1:1',      buyer: 'Carlos R.', amount: '$80',  time: 'hace 3h',  status: 'paid' },
  { id: 3, product: 'Pack Básico',     buyer: 'Sofía T.',  amount: '$45',  time: 'hace 5h',  status: 'paid' },
  { id: 4, product: 'Consultoría',     buyer: 'Miguel A.', amount: '$200', time: 'ayer',     status: 'paid' },
  { id: 5, product: 'Pack Premium',    buyer: 'Andrea L.', amount: '$120', time: 'ayer',     status: 'paid' },
];

// Gallery mock — placeholders with gradient colors
const GALLERY_ITEMS = [
  { id: 1,  type: 'ai',    label: 'Generación IA',   color: '#6850E8', aspectRatio: 'tall'   },
  { id: 2,  type: 'photo', label: 'Foto',             color: '#3B82F6', aspectRatio: 'wide'   },
  { id: 3,  type: 'video', label: 'Video',            color: '#EC4899', aspectRatio: 'square' },
  { id: 4,  type: 'ai',    label: 'Generación IA',   color: '#8B5CF6', aspectRatio: 'square' },
  { id: 5,  type: 'photo', label: 'Foto',             color: '#10B981', aspectRatio: 'tall'   },
  { id: 6,  type: 'ai',    label: 'Generación IA',   color: '#F59E0B', aspectRatio: 'wide'   },
  { id: 7,  type: 'video', label: 'Video',            color: '#14B8A6', aspectRatio: 'square' },
  { id: 8,  type: 'photo', label: 'Foto',             color: '#EF4444', aspectRatio: 'square' },
  { id: 9,  type: 'ai',    label: 'Generación IA',   color: '#6850E8', aspectRatio: 'wide'   },
  { id: 10, type: 'photo', label: 'Foto',             color: '#3B82F6', aspectRatio: 'square' },
  { id: 11, type: 'video', label: 'Video',            color: '#F59E0B', aspectRatio: 'square' },
  { id: 12, type: 'ai',    label: 'Generación IA',   color: '#EC4899', aspectRatio: 'tall'   },
];

// ── Gallery item ───────────────────────────────────────────────────────────────

function GalleryItem({ item, index }: { item: typeof GALLERY_ITEMS[number]; index: number }) {
  const [hovered, setHovered] = useState(false);

  const heightClass =
    item.aspectRatio === 'tall'   ? 'row-span-2' :
    item.aspectRatio === 'wide'   ? 'col-span-2' : '';

  const TypeIcon =
    item.type === 'video' ? Video :
    item.type === 'ai'    ? Wand2 : ImageIcon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04 }}
      className={`relative rounded-2xl overflow-hidden cursor-pointer group ${heightClass}`}
      style={{ minHeight: item.aspectRatio === 'tall' ? 240 : 116 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* gradient placeholder */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${item.color}60 0%, ${item.color}20 100%)`,
          backgroundColor: `${item.color}15`,
        }}
      />

      {/* center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <TypeIcon className="w-8 h-8 opacity-20" style={{ color: item.color }} />
      </div>

      {/* type badge */}
      <div className="absolute top-2 left-2">
        <span
          className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: item.color }}
        >
          <TypeIcon className="w-2.5 h-2.5" />
          {item.type === 'ai' ? 'IA' : item.type === 'video' ? 'Video' : 'Foto'}
        </span>
      </div>

      {/* hover overlay */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center gap-2"
          >
            <button className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white">
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white">
              <Download className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

const GALLERY_TABS = [
  { key: 'all',   label: 'Todas'          },
  { key: 'ai',    label: 'Generaciones IA' },
  { key: 'photo', label: 'Fotos'          },
  { key: 'video', label: 'Videos'         },
];

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const [galleryTab, setGalleryTab] = useState('all');

  const filteredGallery = galleryTab === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(i => i.type === galleryTab);

  return (
    <div className="w-full flex flex-col gap-7">

      {/* ── Welcome header ── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            {greeting()}, {user?.displayName?.split(' ')[0] ?? 'creadora'} 👋
          </h1>
          <p className="text-sm text-gray-400 dark:text-white/35 mt-0.5">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate(ROUTES['creator-studio-ai'])}
            className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-[#6850E8] to-[#9277F5] text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-[#6850E8]/25 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            Studio AI
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate(ROUTES.products)}
            className="hidden sm:flex items-center gap-2 bg-white dark:bg-white/[0.06] border border-gray-100 dark:border-white/[0.08] text-gray-700 dark:text-white/70 text-sm font-bold px-4 py-2.5 rounded-xl transition-all hover:bg-gray-50 dark:hover:bg-white/[0.09]"
          >
            <Plus className="w-4 h-4" />
            Producto
          </motion.button>
        </div>
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
              {s.up !== null && (
                <span className={`text-xs font-bold flex items-center gap-0.5 ${s.up ? 'text-emerald-500' : 'text-red-400'}`}>
                  <TrendingUp className={`w-3 h-3 ${!s.up && 'rotate-180'}`} />
                  {s.delta}
                </span>
              )}
              {s.up === null && (
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
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-110`}
              >
                {item.icon}
              </div>
              <span className="text-[10px] font-semibold text-gray-500 dark:text-white/40 text-center leading-tight">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* ── Analítica ── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider">Analítica</h2>
          <button
            onClick={() => navigate(ROUTES['creator-earnings'])}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6850E8] dark:text-[#9277F5] hover:opacity-80 transition-opacity"
          >
            Ver reporte completo <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Row 1: Revenue chart (wide) + Sales gauge */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
          <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
            <RevenueChart />
          </div>
          <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
            <SalesGaugeChart
              title="Origen de ventas"
              data={{ vendedores: 120, miClonAI: 150, yo: 10 }}
            />
          </div>
        </div>

        {/* Row 2: Client status + Countries */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
            <ClientStatusChart />
          </div>
          <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] shadow-sm overflow-hidden">
            <CountriesChart />
          </div>
        </div>
      </div>

      {/* ── Main content: gallery + sidebar ── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">

        {/* Mi Galería */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Mi Galería</h2>
              <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{GALLERY_ITEMS.length} archivos · fotos, videos y generaciones IA</p>
            </div>
            <button
              onClick={() => navigate(ROUTES.gallery)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#6850E8] dark:text-[#9277F5] hover:opacity-80 transition-opacity"
            >
              Ver galería completa
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.04] w-fit">
            {GALLERY_TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setGalleryTab(t.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  galleryTab === t.key
                    ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* grid */}
          <div
            className="grid gap-2.5"
            style={{
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridAutoRows: '116px',
            }}
          >
            {filteredGallery.map((item, i) => (
              <GalleryItem key={item.id} item={item} index={i} />
            ))}

            {/* Upload CTA */}
            <motion.button
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: filteredGallery.length * 0.04 }}
              className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/[0.08] flex flex-col items-center justify-center gap-1.5 text-gray-300 dark:text-white/20 hover:border-[#6850E8]/40 hover:text-[#6850E8]/50 dark:hover:border-[#6850E8]/30 dark:hover:text-[#6850E8]/40 transition-colors group"
            >
              <Plus className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Subir</span>
            </motion.button>
          </div>
        </div>

        {/* Right sidebar: bookings + sales */}
        <div className="flex flex-col gap-4">

          {/* Próximas reservas */}
          <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-white/[0.04]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Próximas reservas</h3>
              </div>
              <button
                onClick={() => navigate('/creator/bookings')}
                className="text-[#6850E8] dark:text-[#9277F5] hover:opacity-70 transition-opacity"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
              {UPCOMING_BOOKINGS.map(b => (
                <div key={b.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: `${b.color}25`, color: b.color }}
                  >
                    {b.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/80 truncate">{b.client}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {b.type === 'videocall'
                        ? <Video className="w-3 h-3 text-gray-400 dark:text-white/25" />
                        : <Clock className="w-3 h-3 text-gray-400 dark:text-white/25" />
                      }
                      <p className="text-[11px] text-gray-400 dark:text-white/30">{b.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ventas recientes */}
          <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] overflow-hidden shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-white/[0.04]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#10B981]/10 flex items-center justify-center text-[#10B981]">
                  <Star className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Ventas recientes</h3>
              </div>
              <button
                onClick={() => navigate(ROUTES['creator-earnings'])}
                className="text-[#6850E8] dark:text-[#9277F5] hover:opacity-70 transition-opacity"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/[0.04]">
              {RECENT_SALES.map(s => (
                <div key={s.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white/80 truncate">{s.product}</p>
                    <p className="text-[11px] text-gray-400 dark:text-white/30">{s.buyer} · {s.time}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums flex-shrink-0">{s.amount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bot IA status */}
          <div className="rounded-3xl bg-gradient-to-br from-[#6850E8] to-[#9277F5] p-5 text-white shadow-lg shadow-[#6850E8]/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold">Asistente IA</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-[11px] text-white/70">Activo · 1,283 respuestas</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/15 p-2.5 text-center">
                <p className="text-lg font-black tabular-nums">94%</p>
                <p className="text-[10px] text-white/60">Tasa respuesta</p>
              </div>
              <div className="rounded-xl bg-white/15 p-2.5 text-center">
                <p className="text-lg font-black tabular-nums">1.2s</p>
                <p className="text-[10px] text-white/60">Tiempo medio</p>
              </div>
            </div>
            <button
              onClick={() => navigate(ROUTES.settings)}
              className="mt-3 w-full py-2 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              Configurar bot <Zap className="w-3 h-3" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
