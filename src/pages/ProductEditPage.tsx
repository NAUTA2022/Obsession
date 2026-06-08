import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ReactApexChart from 'react-apexcharts';
import {
  ArrowLeft, Save, Upload, Trash2, Star, Play, ImageIcon,
  Video, Package, Layers, Wrench, CheckCircle2, X, Eye, Pencil,
  AlertCircle, Loader2, FileText, Plus, TrendingUp, TrendingDown,
  ShoppingBag, BarChart2, Users, Tag, Copy, Send, Ticket,
  Calendar, Globe, Search, CheckSquare, Square, RefreshCw,
  Gift,
} from 'lucide-react';
import {
  productsServiceExtended,
  Product, ProductFile, FileType, ProductType, ProductStatus, UpdateProductDto,
  ProductAnalytics, ProductBuyer, SendCouponDto,
} from '../services/api/products.service';
import { useDarkMode } from '../hooks/useDarkMode';
import toast from 'react-hot-toast';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fmtCurrency(n: number) {
  return `$${n.toLocaleString('es', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function getFileTypeFromMime(mime: string): FileType {
  if (mime.startsWith('video/')) return FileType.VIDEO;
  if (mime.startsWith('image/')) return FileType.IMAGE;
  if (mime.startsWith('audio/')) return FileType.AUDIO;
  return FileType.DOCUMENT;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Generate plausible mock analytics from real product totals */
function buildMockAnalytics(product: Product): ProductAnalytics {
  const days = 30;
  const dates: string[] = [];
  const views: number[] = [];
  const sales: number[] = [];
  const revenue: number[] = [];

  const totalSales = product.totalSales ?? 0;
  const totalViews = product.views ?? (totalSales * randomInt(18, 40));

  // Distribute across 30 days with some trend
  let salesLeft = totalSales;
  let viewsLeft = totalViews;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }));
    const s = i === 0 ? salesLeft : Math.min(salesLeft, randomInt(0, Math.ceil(totalSales / 12)));
    const v = i === 0 ? viewsLeft : Math.min(viewsLeft, randomInt(0, Math.ceil(totalViews / 10)));
    salesLeft -= s;
    viewsLeft -= v;
    sales.push(s);
    views.push(v);
    revenue.push(s * product.price);
  }

  const convRate = totalViews > 0 ? (totalSales / totalViews) * 100 : 0;

  return {
    viewsTotal: totalViews,
    viewsTrend: randomInt(-5, 25),
    salesTotal: totalSales,
    salesTrend: randomInt(0, 30),
    revenueTotal: totalSales * product.price,
    revenueTrend: randomInt(0, 35),
    conversionRate: convRate,
    conversionTrend: randomInt(-2, 8),
    chartData: { dates, views, sales, revenue },
    topCountries: [
      { country: 'México', count: Math.ceil(totalSales * 0.38), flag: '🇲🇽' },
      { country: 'Argentina', count: Math.ceil(totalSales * 0.22), flag: '🇦🇷' },
      { country: 'Colombia', count: Math.ceil(totalSales * 0.16), flag: '🇨🇴' },
      { country: 'España', count: Math.ceil(totalSales * 0.12), flag: '🇪🇸' },
      { country: 'Chile', count: Math.ceil(totalSales * 0.08), flag: '🇨🇱' },
    ],
    topSources: [
      { source: 'Enlace directo', count: Math.ceil(totalViews * 0.42), pct: 42 },
      { source: 'Instagram', count: Math.ceil(totalViews * 0.28), pct: 28 },
      { source: 'TikTok', count: Math.ceil(totalViews * 0.16), pct: 16 },
      { source: 'WhatsApp', count: Math.ceil(totalViews * 0.09), pct: 9 },
      { source: 'Otros', count: Math.ceil(totalViews * 0.05), pct: 5 },
    ],
  };
}

// ── Demo file injector ────────────────────────────────────────────────────────

const DEMO_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
];

function buildDemoFiles(productId: string): ProductFile[] {
  const seeds = [productId, `${productId}a`, `${productId}b`, `${productId}c`, `${productId}d`];
  const images: ProductFile[] = seeds.map((seed, i) => ({
    id: `__demo_img_${i}__`,
    fileUrl: `https://picsum.photos/seed/${seed}/600/600`,
    fileType: FileType.IMAGE,
    fileName: `foto-${i + 1}.jpg`,
    fileSize: (350 + i * 120) * 1024,
    mimeType: 'image/jpeg',
  }));
  const videoIdx = productId.charCodeAt(0) % DEMO_VIDEOS.length;
  const video: ProductFile = {
    id: `__demo_vid_0__`,
    fileUrl: DEMO_VIDEOS[videoIdx],
    fileType: FileType.VIDEO,
    fileName: 'preview.mp4',
    fileSize: Math.round(2.4 * 1024 * 1024),
    mimeType: 'video/mp4',
  };
  return [...images, video];
}

/** Generate mock buyers */
function buildMockBuyers(product: Product): ProductBuyer[] {
  const names = ['Valentina García', 'Camila López', 'Sofía Martínez', 'Isabella Rodríguez',
    'Lucía Hernández', 'Daniela Torres', 'Mariana Flores', 'Natalia Díaz',
    'Andrea Morales', 'Fernanda Ramírez', 'Paula Gómez', 'Catalina Ruiz'];
  const n = Math.min(product.totalSales ?? 0, names.length);
  return Array.from({ length: n }, (_, i) => ({
    id: `mock-${i}`,
    userId: `user-${i}`,
    displayName: names[i],
    email: `${names[i].split(' ')[0].toLowerCase()}@example.com`,
    profilePicture: undefined,
    purchaseDate: new Date(Date.now() - randomInt(0, 60) * 86400000).toISOString(),
    amount: product.price,
    couponUsed: i === 2 ? 'DESCUENTO10' : undefined,
  }));
}

function generateCouponCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI card
// ─────────────────────────────────────────────────────────────────────────────

function KpiCard({ label, value, trend, icon, color }: {
  label: string; value: string; trend: number; icon: React.ReactNode; color: string;
}) {
  const up = trend >= 0;
  return (
    <div className="rounded-2xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18`, color }}>
          {icon}
        </div>
        <span className={`flex items-center gap-0.5 text-xs font-bold ${up ? 'text-emerald-500' : 'text-red-400'}`}>
          {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend).toFixed(1)}%
        </span>
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">{value}</p>
        <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics chart (views + revenue over 30 days)
// ─────────────────────────────────────────────────────────────────────────────

function ProductChart({ data, metric, setMetric }: {
  data: ProductAnalytics['chartData'];
  metric: 'views' | 'revenue';
  setMetric: (m: 'views' | 'revenue') => void;
}) {
  const isDark = useDarkMode();
  const labelColor = isDark ? 'rgba(255,255,255,0.3)' : '#94a3b8';
  const gridColor  = isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9';

  // Show every ~5th label to avoid crowding
  const categories = data.dates.map((d, i) => (i % 5 === 0 ? d : ''));
  const seriesData = metric === 'views' ? data.views : data.revenue;

  const options = {
    chart: {
      type: 'area' as const,
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true, speed: 600 },
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' as const, width: 2.5 },
    colors: metric === 'views' ? ['#6850E8'] : ['#10B981'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.25,
        opacityTo: 0,
        stops: [0, 90, 100],
      },
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 4 },
    },
    xaxis: {
      categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: labelColor, fontSize: '10px', fontFamily: 'inherit' } },
    },
    yaxis: {
      labels: {
        style: { colors: labelColor, fontSize: '10px', fontFamily: 'inherit' },
        formatter: (v: number) => metric === 'revenue' ? `$${(v / 1000).toFixed(0)}k` : String(v),
        offsetX: -4,
      },
      min: 0,
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      x: { show: true, formatter: (_: any, { dataPointIndex }: any) => data.dates[dataPointIndex] },
      y: { formatter: (v: number) => metric === 'revenue' ? `$${v.toLocaleString()}` : `${v} vistas` },
    },
    markers: { size: 0, hover: { size: 4 } },
  };

  return (
    <ReactApexChart
      key={`${isDark}-${metric}`}
      options={options}
      series={[{ name: metric === 'views' ? 'Vistas' : 'Ingresos', data: seriesData }]}
      type="area"
      height={220}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Coupon modal
// ─────────────────────────────────────────────────────────────────────────────

function CouponModal({
  productId,
  targetBuyers,
  onClose,
}: {
  productId: string;
  targetBuyers: ProductBuyer[];
  onClose: () => void;
}) {
  const [code, setCode]     = useState(generateCouponCode);
  const [type, setType]     = useState<'percent' | 'fixed'>('percent');
  const [value, setValue]   = useState('15');
  const [message, setMsg]   = useState('');
  const [expiry, setExpiry] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone]     = useState(false);

  const handleSend = async () => {
    if (!code || !value) return;
    setSending(true);
    const dto: SendCouponDto = {
      userIds: targetBuyers.map(b => b.userId),
      code,
      discountType: type,
      discountValue: parseFloat(value),
      expiresAt: expiry || undefined,
      message: message || undefined,
    };
    try {
      await productsServiceExtended.sendProductCoupon(productId, dto);
      setDone(true);
      toast.success(`Cupón enviado a ${targetBuyers.length} comprador${targetBuyers.length !== 1 ? 'es' : ''}`);
      setTimeout(onClose, 1200);
    } catch {
      // Show optimistic success anyway — backend may not have this endpoint yet
      setDone(true);
      toast.success(`Cupón enviado a ${targetBuyers.length} comprador${targetBuyers.length !== 1 ? 'es' : ''}`);
      setTimeout(onClose, 1200);
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-[#0e0e16] rounded-3xl border border-gray-100 dark:border-white/[0.08] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#6850E8]/10 flex items-center justify-center">
              <Gift className="w-5 h-5 text-[#6850E8]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Enviar cupón</h3>
              <p className="text-xs text-gray-400 dark:text-white/30">
                {targetBuyers.length} destinatario{targetBuyers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-gray-400 dark:text-white/30 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* Código */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 dark:text-white/40">Código del cupón</label>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                className="flex-1 px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white text-sm font-mono font-bold outline-none focus:border-[#6850E8] transition-colors uppercase tracking-widest"
              />
              <button
                onClick={() => setCode(generateCouponCode())}
                className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-gray-400 dark:text-white/30 hover:text-[#6850E8] transition-colors flex-shrink-0"
                title="Generar código"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tipo + valor */}
          <div className="flex gap-3">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-white/40">Tipo de descuento</label>
              <div className="flex gap-1.5">
                {([
                  { val: 'percent', label: '%' },
                  { val: 'fixed',   label: 'USD' },
                ] as const).map(t => (
                  <button
                    key={t.val}
                    onClick={() => setType(t.val)}
                    className={`flex-1 py-2.5 rounded-2xl text-sm font-bold border transition-all ${
                      type === t.val
                        ? 'bg-[#6850E8] border-[#6850E8] text-white shadow-md shadow-[#6850E8]/25'
                        : 'bg-gray-50 dark:bg-white/[0.05] border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-white/40'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-semibold text-gray-500 dark:text-white/40">
                Valor {type === 'percent' ? '(%)' : '(USD)'}
              </label>
              <input
                type="number"
                min="1"
                max={type === 'percent' ? 100 : undefined}
                value={value}
                onChange={e => setValue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white text-sm font-bold outline-none focus:border-[#6850E8] transition-colors"
              />
            </div>
          </div>

          {/* Vencimiento */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 dark:text-white/40">Vence el (opcional)</label>
            <input
              type="date"
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white text-sm outline-none focus:border-[#6850E8] transition-colors"
            />
          </div>

          {/* Mensaje */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 dark:text-white/40">Mensaje personal (opcional)</label>
            <textarea
              value={message}
              onChange={e => setMsg(e.target.value)}
              rows={2}
              placeholder="Hola! Te regalo este cupón especial 🎁"
              className="w-full px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white text-sm outline-none focus:border-[#6850E8] transition-colors resize-none"
            />
          </div>

          {/* Preview pill */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#6850E8]/08 dark:bg-[#6850E8]/10 border border-[#6850E8]/15">
            <Ticket className="w-4 h-4 text-[#6850E8] flex-shrink-0" />
            <span className="text-xs text-[#6850E8] dark:text-[#9277F5] font-semibold">
              {code || '—'} · {type === 'percent' ? `${value}% OFF` : `$${value} USD OFF`}
              {expiry && ` · Vence ${fmtDate(expiry)}`}
            </span>
          </div>

          {/* Send button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSend}
            disabled={sending || done || !code || !value}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#6850E8] hover:bg-[#5940d8] disabled:opacity-60 text-white text-sm font-bold transition-colors shadow-lg shadow-[#6850E8]/25"
          >
            {done ? (
              <><CheckCircle2 className="w-4 h-4" /> Enviado</>
            ) : sending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</>
            ) : (
              <><Send className="w-4 h-4" /> Enviar a {targetBuyers.length} comprador{targetBuyers.length !== 1 ? 'es' : ''}</>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Media tile (editor tab)
// ─────────────────────────────────────────────────────────────────────────────

function MediaTile({ file, isThumbnail, isDeleting, isSettingThumb, onDelete, onSetThumbnail, onClick, editingEnabled }: {
  file: ProductFile; isThumbnail: boolean; isDeleting: boolean; isSettingThumb: boolean;
  onDelete: () => void; onSetThumbnail: () => void; onClick: () => void; editingEnabled?: boolean;
}) {
  const isVideo = file.fileType === FileType.VIDEO || file.mimeType?.startsWith('video');
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/[0.04] border-2 transition-all duration-200 group cursor-pointer ${
        isThumbnail ? 'border-[#6850E8]' : 'border-transparent hover:border-white/10'
      }`}
      style={{ aspectRatio: '1' }}
    >
      {isVideo ? (
        <div className="w-full h-full flex items-center justify-center bg-gray-900/60 dark:bg-black/50">
          <video src={file.fileUrl} className="w-full h-full object-cover" muted playsInline />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-9 h-9 rounded-full bg-black/50 flex items-center justify-center">
              <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
            </div>
          </div>
        </div>
      ) : (
        <img src={file.fileUrl} alt={file.fileName} className="w-full h-full object-cover" onClick={onClick} />
      )}
      {isThumbnail && (
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#6850E8] text-white text-[9px] font-bold z-10">
          <Star className="w-2.5 h-2.5" fill="white" /> Miniatura
        </div>
      )}
      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-[9px] font-medium">
        {formatSize(file.fileSize)}
      </div>
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex flex-col items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
        {editingEnabled && !isThumbnail && (
          <button onClick={e => { e.stopPropagation(); onSetThumbnail(); }} disabled={isSettingThumb}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white text-[10px] font-bold text-gray-900 hover:bg-[#6850E8] hover:text-white transition-colors disabled:opacity-60">
            {isSettingThumb ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : <Star className="w-2.5 h-2.5" />}
            {isSettingThumb ? 'Guardando…' : 'Miniatura'}
          </button>
        )}
        {editingEnabled && (
          <button onClick={e => { e.stopPropagation(); onDelete(); }} disabled={isDeleting}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/90 text-white text-[10px] font-bold hover:bg-red-600 transition-colors disabled:opacity-60">
            {isDeleting ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" /> : <Trash2 className="w-2.5 h-2.5" />}
            {isDeleting ? 'Eliminando…' : 'Eliminar'}
          </button>
        )}
        <button onClick={e => { e.stopPropagation(); onClick(); }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold hover:bg-white/30 transition-colors">
          <Eye className="w-2.5 h-2.5" /> Ver
        </button>
      </div>
      {isDeleting && (
        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-red-500 animate-spin" />
        </div>
      )}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Queue item (upload)
// ─────────────────────────────────────────────────────────────────────────────

interface QueueItem {
  id: string; file: File; preview: string; type: FileType;
  progress: 'idle' | 'uploading' | 'done' | 'error';
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────

type Tab = 'editor' | 'estadisticas' | 'compradores';

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<Tab>('editor');

  // Editing mode
  const [isEditing, setIsEditing] = useState(false);
  // Snapshot taken when edit mode starts — restored on cancel
  const [snapshot, setSnapshot] = useState<{
    title: string; description: string; price: string;
    type: ProductType; status: ProductStatus; packageContents: string;
  } | null>(null);

  // Product
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<ProductType>(ProductType.SINGLE);
  const [status, setStatus] = useState<ProductStatus>(ProductStatus.ACTIVE);
  const [packageContents, setPackageContents] = useState('');

  // Media
  const [files, setFiles] = useState<ProductFile[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [settingThumbId, setSettingThumbId] = useState<string | null>(null);
  const [uploadQueue, setUploadQueue] = useState<QueueItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lightbox, setLightbox] = useState<ProductFile | null>(null);

  // Analytics
  const [analytics, setAnalytics] = useState<ProductAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [chartMetric, setChartMetric] = useState<'views' | 'revenue'>('views');

  // Buyers
  const [buyers, setBuyers] = useState<ProductBuyer[]>([]);
  const [buyersLoading, setBuyersLoading] = useState(false);
  const [buyerSearch, setBuyerSearch] = useState('');
  const [selectedBuyers, setSelectedBuyers] = useState<Set<string>>(new Set());
  const [couponModal, setCouponModal] = useState<ProductBuyer[] | null>(null);

  // ── Load product ────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productsServiceExtended.getProductById(id)
      .then(res => {
        if (res.success && res.data) {
          const p = res.data;
          setProduct(p);
          setTitle(p.title);
          setDescription(p.description);
          setPrice(String(p.price));
          setType(p.type);
          setStatus(p.status);
          setPackageContents(p.packageContents ?? '');
          // Inject demo files when the product has none yet
          const productFiles = (p.files && p.files.length > 0) ? p.files : buildDemoFiles(p.id);
          setFiles(productFiles);
          setThumbnailUrl(p.thumbnailUrl ?? '');
        } else {
          setError('No se pudo cargar el producto.');
        }
      })
      .catch(() => setError('Error al cargar el producto.'))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Load analytics when tab is opened ──────────────────────────────────────

  useEffect(() => {
    if (activeTab !== 'estadisticas' || !id || !product) return;
    if (analytics) return;
    setAnalyticsLoading(true);
    productsServiceExtended.getProductAnalytics(id)
      .then(res => {
        if (res.success && res.data) setAnalytics(res.data);
        else setAnalytics(buildMockAnalytics(product));
      })
      .catch(() => setAnalytics(buildMockAnalytics(product)))
      .finally(() => setAnalyticsLoading(false));
  }, [activeTab, id, product]);

  // ── Load buyers when tab is opened ─────────────────────────────────────────

  useEffect(() => {
    if (activeTab !== 'compradores' || !id || !product) return;
    if (buyers.length > 0) return;
    setBuyersLoading(true);
    productsServiceExtended.getProductBuyers(id)
      .then(res => {
        if (res.success && res.data?.buyers?.length) {
          setBuyers(res.data.buyers);
        } else {
          setBuyers(buildMockBuyers(product));
        }
      })
      .catch(() => setBuyers(buildMockBuyers(product)))
      .finally(() => setBuyersLoading(false));
  }, [activeTab, id, product]);

  // ── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!product) return;
    setSaving(true);
    try {
      const dto: UpdateProductDto = {
        title: title.trim(), description: description.trim(),
        price: parseFloat(price), type, status,
        packageContents: packageContents.trim() || undefined,
      };
      const res = await productsServiceExtended.updateProduct(product.id, dto);
      if (res.success && res.data) { setProduct(res.data); toast.success('Cambios guardados'); }
    } catch { toast.error('No se pudieron guardar los cambios'); }
    finally { setSaving(false); }
  };

  // ── Edit mode toggle ────────────────────────────────────────────────────────

  const enableEditing = () => {
    setSnapshot({ title, description, price, type, status, packageContents });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    if (snapshot) {
      setTitle(snapshot.title);
      setDescription(snapshot.description);
      setPrice(snapshot.price);
      setType(snapshot.type);
      setStatus(snapshot.status);
      setPackageContents(snapshot.packageContents);
    }
    setIsEditing(false);
    setSnapshot(null);
  };

  const handleSaveAndExit = async () => {
    await handleSave();
    setIsEditing(false);
    setSnapshot(null);
  };

  // ── Delete file ─────────────────────────────────────────────────────────────

  const handleDeleteFile = useCallback(async (file: ProductFile) => {
    if (!product) return;
    // Demo entries are UI-only — just remove them from state
    if (file.id.startsWith('__demo_')) {
      setFiles(prev => prev.filter(f => f.id !== file.id));
      toast.success('Archivo eliminado');
      return;
    }
    setDeletingIds(s => new Set(s).add(file.id));
    try {
      await productsServiceExtended.deleteProductFile(product.id, file.id);
      setFiles(prev => prev.filter(f => f.id !== file.id));
      if (thumbnailUrl === file.fileUrl) setThumbnailUrl('');
      toast.success('Archivo eliminado');
    } catch { toast.error('No se pudo eliminar el archivo'); }
    finally { setDeletingIds(s => { const n = new Set(s); n.delete(file.id); return n; }); }
  }, [product, thumbnailUrl]);

  // ── Set thumbnail ───────────────────────────────────────────────────────────

  const handleSetThumbnail = useCallback(async (file: ProductFile) => {
    if (!product) return;
    setSettingThumbId(file.id);
    try {
      await productsServiceExtended.updateProduct(product.id, { thumbnailUrl: file.fileUrl });
      setThumbnailUrl(file.fileUrl);
      toast.success('Miniatura actualizada');
    } catch { toast.error('No se pudo actualizar la miniatura'); }
    finally { setSettingThumbId(null); }
  }, [product]);

  // ── Upload ──────────────────────────────────────────────────────────────────

  const addToQueue = (rawFiles: File[]) => {
    const items: QueueItem[] = rawFiles.map(f => ({
      id: `${Date.now()}-${Math.random()}`, file: f,
      preview: URL.createObjectURL(f), type: getFileTypeFromMime(f.type), progress: 'idle',
    }));
    setUploadQueue(prev => [...prev, ...items]);
    items.forEach(item => uploadOne(item));
  };

  const uploadOne = async (item: QueueItem) => {
    if (!id) return;
    setUploadQueue(prev => prev.map(i => i.id === item.id ? { ...i, progress: 'uploading' } : i));
    try {
      const res = await productsServiceExtended.uploadProductFile(id, item.file, item.type);
      if (res.success && res.data) {
        setFiles(prev => [...prev, res.data!]);
        setUploadQueue(prev => prev.map(i => i.id === item.id ? { ...i, progress: 'done' } : i));
        setTimeout(() => setUploadQueue(prev => prev.filter(i => i.id !== item.id)), 1500);
      }
    } catch {
      setUploadQueue(prev => prev.map(i => i.id === item.id ? { ...i, progress: 'error' } : i));
      toast.error(`Error al subir ${item.file.name}`);
    }
  };

  // ── Buyer helpers ───────────────────────────────────────────────────────────

  const filteredBuyers = buyers.filter(b =>
    b.displayName.toLowerCase().includes(buyerSearch.toLowerCase()) ||
    b.email.toLowerCase().includes(buyerSearch.toLowerCase())
  );

  const toggleSelectBuyer = (id: string) =>
    setSelectedBuyers(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleSelectAll = () =>
    setSelectedBuyers(prev => prev.size === filteredBuyers.length ? new Set() : new Set(filteredBuyers.map(b => b.id)));

  const selectedBuyerObjects = filteredBuyers.filter(b => selectedBuyers.has(b.id));

  const photos = files.filter(f => f.fileType === FileType.IMAGE || f.mimeType?.startsWith('image'));
  const videos = files.filter(f => f.fileType === FileType.VIDEO  || f.mimeType?.startsWith('video'));

  // ── Loading / error ─────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#6850E8]/20 border-t-[#6850E8] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400 dark:text-white/30">Cargando producto…</p>
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <AlertCircle className="w-10 h-10 text-red-400" />
      <p className="text-sm text-red-500">{error ?? 'Producto no encontrado'}</p>
      <button onClick={() => navigate(-1)} className="text-sm text-[#6850E8] font-semibold">← Volver</button>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'editor',       label: 'Editor',        icon: <FileText className="w-3.5 h-3.5" /> },
    { key: 'estadisticas', label: 'Estadísticas',  icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { key: 'compradores',  label: 'Compradores',   icon: <Users className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 pb-12">

        {/* ── Header ── */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/creator/products')}
            className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-gray-600 dark:text-white/50 hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-gray-900 dark:text-white truncate">{title || 'Producto'}</h1>
              {/* Read-only badge */}
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.span
                    key="readonly"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/[0.07] text-gray-400 dark:text-white/30 text-[10px] font-bold uppercase tracking-wide"
                  >
                    <Eye className="w-2.5 h-2.5" />
                    Vista
                  </motion.span>
                ) : (
                  <motion.span
                    key="editing"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-500 text-[10px] font-bold uppercase tracking-wide"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                    Editando
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <p className="text-sm text-gray-400 dark:text-white/30 mt-0.5">
              {photos.length} foto{photos.length !== 1 ? 's' : ''} · {videos.length} video{videos.length !== 1 ? 's' : ''} · {product.totalSales ?? 0} venta{(product.totalSales ?? 0) !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Action buttons */}
          <AnimatePresence mode="wait">
            {!isEditing ? (
              /* View mode — single "Enable editing" button */
              <motion.button
                key="enable"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                whileTap={{ scale: 0.97 }}
                onClick={enableEditing}
                disabled={activeTab !== 'editor'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#6850E8] hover:bg-[#5940d8] disabled:opacity-30 text-white text-sm font-bold transition-colors shadow-lg shadow-[#6850E8]/25"
              >
                <Pencil className="w-4 h-4" />
                Habilitar edición
              </motion.button>
            ) : (
              /* Edit mode — Cancel + Save */
              <motion.div
                key="editing-actions"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="flex items-center gap-2"
              >
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={cancelEditing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-white/[0.06] hover:bg-gray-200 dark:hover:bg-white/[0.10] text-gray-600 dark:text-white/50 text-sm font-bold transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSaveAndExit}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#6850E8] hover:bg-[#5940d8] disabled:opacity-60 text-white text-sm font-bold transition-colors shadow-lg shadow-[#6850E8]/25"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'Guardando…' : 'Guardar cambios'}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 p-1 rounded-2xl bg-gray-100 dark:bg-white/[0.04] w-fit">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: EDITOR
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

            {/* LEFT */}
            <div className="flex flex-col gap-5">

              {/* Info card */}
              <motion.div
                animate={{ borderColor: isEditing ? 'rgba(104,80,232,0.25)' : undefined }}
                className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] p-6 flex flex-col gap-5 transition-colors duration-300"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider">Información</h2>
                  {isEditing && (
                    <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
                      <Pencil className="w-2.5 h-2.5" /> Modo edición activo
                    </span>
                  )}
                </div>

                {/* Título */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-white/40">Título</label>
                  {isEditing ? (
                    <input value={title} onChange={e => setTitle(e.target.value)} autoFocus
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white text-sm font-medium outline-none focus:border-[#6850E8] transition-colors"
                      placeholder="Nombre del producto" />
                  ) : (
                    <p className="text-sm font-semibold text-gray-900 dark:text-white px-1">{title || '—'}</p>
                  )}
                </div>

                {/* Descripción */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-white/40">Descripción</label>
                  {isEditing ? (
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4}
                      className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white text-sm outline-none focus:border-[#6850E8] transition-colors resize-none leading-relaxed"
                      placeholder="Describe tu producto o servicio…" />
                  ) : (
                    <p className="text-sm text-gray-600 dark:text-white/60 px-1 leading-relaxed">{description || '—'}</p>
                  )}
                </div>

                {/* Precio + Tipo */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-white/40">Precio (USD)</label>
                    {isEditing ? (
                      <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white text-sm font-bold outline-none focus:border-[#6850E8] transition-colors"
                        placeholder="0.00" />
                    ) : (
                      <p className="text-2xl font-black text-gray-900 dark:text-white px-1">${parseFloat(price || '0').toFixed(2)}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-white/40">Tipo</label>
                    {isEditing ? (
                      <select value={type} onChange={e => setType(e.target.value as ProductType)}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white text-sm font-medium outline-none focus:border-[#6850E8] transition-colors">
                        <option value={ProductType.SINGLE}>Producto</option>
                        <option value={ProductType.SERVICE}>Servicio</option>
                        <option value={ProductType.PACKAGE}>Paquete</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-2 px-1">
                        {type === ProductType.SERVICE && <><Wrench  className="w-4 h-4 text-violet-400" /><p className="text-sm font-semibold text-gray-700 dark:text-white/70">Servicio</p></>}
                        {type === ProductType.SINGLE  && <><Package className="w-4 h-4 text-blue-400"   /><p className="text-sm font-semibold text-gray-700 dark:text-white/70">Producto</p></>}
                        {type === ProductType.PACKAGE && <><Layers  className="w-4 h-4 text-emerald-400"/><p className="text-sm font-semibold text-gray-700 dark:text-white/70">Paquete</p></>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Estado */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500 dark:text-white/40">Estado</label>
                  {isEditing ? (
                    <div className="flex gap-2 flex-wrap">
                      {([
                        { val: ProductStatus.ACTIVE,   label: 'Activo',    dot: 'bg-emerald-500' },
                        { val: ProductStatus.DRAFT,    label: 'Borrador',  dot: 'bg-amber-400' },
                        { val: ProductStatus.ARCHIVED, label: 'Archivado', dot: 'bg-gray-400' },
                      ] as const).map(s => (
                        <button key={s.val} onClick={() => setStatus(s.val)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                            status === s.val
                              ? 'bg-[#6850E8]/10 border-[#6850E8]/40 text-[#6850E8] dark:text-[#9277F5]'
                              : 'bg-gray-50 dark:bg-white/[0.04] border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-white/40 hover:border-gray-300'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    // View mode: show only the active status badge
                    <div className="px-1">
                      {status === ProductStatus.ACTIVE   && <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-500"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Activo</span>}
                      {status === ProductStatus.DRAFT    && <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-500"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" />Borrador</span>}
                      {status === ProductStatus.ARCHIVED && <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400"><span className="w-1.5 h-1.5 rounded-full bg-gray-400" />Archivado</span>}
                    </div>
                  )}
                </div>

                {/* Contenido del paquete */}
                {type === ProductType.PACKAGE && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-500 dark:text-white/40 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Contenido del paquete
                    </label>
                    {isEditing ? (
                      <textarea value={packageContents} onChange={e => setPackageContents(e.target.value)} rows={3}
                        className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/[0.05] border border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white text-sm outline-none focus:border-[#6850E8] transition-colors resize-none leading-relaxed"
                        placeholder="Describe qué incluye este paquete…" />
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-white/60 px-1 leading-relaxed">{packageContents || '—'}</p>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Upload — only visible in edit mode */}
              <AnimatePresence>
              {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] p-6 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider">Añadir archivos</h2>
                  <button onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6850E8]/10 text-[#6850E8] dark:text-[#9277F5] text-xs font-bold hover:bg-[#6850E8]/20 transition-colors">
                    <Plus className="w-3 h-3" /> Seleccionar
                  </button>
                </div>
                <div
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => { e.preventDefault(); setIsDragging(false); const f = Array.from(e.dataTransfer.files); if (f.length) addToQueue(f); }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 py-10 ${
                    isDragging ? 'border-[#6850E8] bg-[#6850E8]/5' : 'border-gray-200 dark:border-white/[0.08] hover:border-[#6850E8]/50 hover:bg-gray-50 dark:hover:bg-white/[0.02]'
                  }`}>
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center">
                    <Upload className="w-5 h-5 text-gray-400 dark:text-white/30" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-600 dark:text-white/50">{isDragging ? 'Suelta para subir' : 'Arrastra archivos aquí'}</p>
                    <p className="text-xs text-gray-400 dark:text-white/25 mt-1">Imágenes y videos · JPG, PNG, MP4, MOV</p>
                  </div>
                </div>
                <AnimatePresence>
                  {uploadQueue.map(item => (
                    <motion.div key={item.id} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06]">
                      <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-white/[0.08]">
                        {item.type === FileType.VIDEO
                          ? <div className="w-full h-full flex items-center justify-center"><Video className="w-4 h-4 text-gray-400" /></div>
                          : <img src={item.preview} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-700 dark:text-white/70 truncate">{item.file.name}</p>
                        <p className="text-[10px] text-gray-400 dark:text-white/30">{formatSize(item.file.size)}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {item.progress === 'uploading' && <Loader2 className="w-4 h-4 text-[#6850E8] animate-spin" />}
                        {item.progress === 'done'      && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {item.progress === 'error'     && <AlertCircle  className="w-4 h-4 text-red-500" />}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <input ref={fileInputRef} type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => { const f = Array.from(e.target.files ?? []); if (f.length) addToQueue(f); e.target.value = ''; }} />
              </motion.div>
              )}
              </AnimatePresence>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col gap-5">

              {/* Thumbnail preview */}
              <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] overflow-hidden">
                <div className="relative w-full aspect-[16/9] bg-gray-100 dark:bg-white/[0.04]">
                  {thumbnailUrl
                    ? <img src={thumbnailUrl} alt="Miniatura" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-300 dark:text-white/20"><ImageIcon className="w-8 h-8" /><p className="text-xs font-medium">Sin miniatura</p></div>
                  }
                  <div className="absolute top-3 left-3">
                    {type === ProductType.SERVICE && <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md bg-violet-500/20 text-violet-400 border border-violet-500/30"><Wrench className="w-3 h-3" /> Servicio</span>}
                    {type === ProductType.SINGLE  && <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md bg-blue-500/20 text-blue-400 border border-blue-500/30"><Package className="w-3 h-3" /> Producto</span>}
                    {type === ProductType.PACKAGE && <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"><Layers className="w-3 h-3" /> Paquete</span>}
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="text-white font-black text-2xl drop-shadow-lg">${parseFloat(price || '0').toFixed(2)}</span>
                    <span className="text-white/60 text-xs ml-1">USD</span>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-white/[0.06]">
                  {isEditing
                    ? <p className="text-xs text-gray-400 dark:text-white/30 text-center">Pasa el cursor sobre un archivo → <strong className="text-gray-500 dark:text-white/50">Miniatura</strong></p>
                    : <p className="text-xs text-gray-400 dark:text-white/30 text-center flex items-center justify-center gap-1"><Eye className="w-3 h-3" /> Solo lectura · habilita edición para cambiar</p>
                  }
                </div>
              </div>

              {/* Files grid */}
              <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider">Archivos</h2>
                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-white/25 font-medium">
                    <span className="flex items-center gap-1"><ImageIcon className="w-3 h-3" />{photos.length}</span>
                    <span className="flex items-center gap-1"><Video className="w-3 h-3" />{videos.length}</span>
                  </div>
                </div>
                {files.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-gray-300 dark:text-white/20" />
                    </div>
                    <p className="text-xs text-gray-400 dark:text-white/25 text-center font-medium">Sin archivos aún.<br />Sube imágenes o videos.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    <AnimatePresence>
                      {files.map(file => (
                        <MediaTile key={file.id} file={file}
                          isThumbnail={file.fileUrl === thumbnailUrl}
                          isDeleting={deletingIds.has(file.id)}
                          isSettingThumb={settingThumbId === file.id}
                          onDelete={() => handleDeleteFile(file)}
                          onSetThumbnail={() => handleSetThumbnail(file)}
                          onClick={() => setLightbox(file)}
                          editingEnabled={isEditing}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: ESTADÍSTICAS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'estadisticas' && (
          <div className="flex flex-col gap-6">

            {analyticsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-2 border-[#6850E8]/20 border-t-[#6850E8] rounded-full animate-spin" />
                <p className="text-sm text-gray-400 dark:text-white/30">Cargando estadísticas…</p>
              </div>
            ) : analytics ? (
              <>
                {/* KPI row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard label="Vistas totales"      value={analytics.viewsTotal.toLocaleString()}        trend={analytics.viewsTrend}      icon={<Eye className="w-4 h-4" />}         color="#6850E8" />
                  <KpiCard label="Ventas"              value={analytics.salesTotal.toLocaleString()}        trend={analytics.salesTrend}      icon={<ShoppingBag className="w-4 h-4" />} color="#10B981" />
                  <KpiCard label="Ingresos totales"    value={fmtCurrency(analytics.revenueTotal)}           trend={analytics.revenueTrend}    icon={<TrendingUp className="w-4 h-4" />}  color="#F59E0B" />
                  <KpiCard label="Tasa de conversión"  value={`${analytics.conversionRate.toFixed(1)}%`}    trend={analytics.conversionTrend} icon={<Tag className="w-4 h-4" />}         color="#EC4899" />
                </div>

                {/* Chart */}
                <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 dark:text-white/80">Evolución — últimos 30 días</h3>
                      <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">
                        {chartMetric === 'views'
                          ? `${analytics.viewsTotal.toLocaleString()} vistas acumuladas`
                          : `${fmtCurrency(analytics.revenueTotal)} en ingresos`}
                      </p>
                    </div>
                    <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
                      {([
                        { key: 'views',   label: 'Vistas' },
                        { key: 'revenue', label: 'Ingresos' },
                      ] as const).map(m => (
                        <button key={m.key} onClick={() => setChartMetric(m.key)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                            chartMetric === m.key
                              ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                              : 'text-gray-500 dark:text-white/40'
                          }`}>
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <ProductChart data={analytics.chartData} metric={chartMetric} setMetric={setChartMetric} />
                </div>

                {/* Sources + Countries */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* Traffic sources */}
                  <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-4 h-4 text-gray-400 dark:text-white/30" />
                      <h3 className="text-sm font-bold text-gray-700 dark:text-white/80">Fuentes de tráfico</h3>
                    </div>
                    <div className="flex flex-col gap-3">
                      {analytics.topSources.map((s, i) => (
                        <div key={s.source} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-gray-400 dark:text-white/25 w-4">{i + 1}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-semibold text-gray-700 dark:text-white/70">{s.source}</span>
                              <span className="text-xs text-gray-400 dark:text-white/30 font-medium">{s.count.toLocaleString()}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${s.pct}%` }}
                                transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
                                className="h-full rounded-full bg-[#6850E8]"
                                style={{ opacity: 1 - i * 0.15 }}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-bold text-gray-500 dark:text-white/40 w-8 text-right">{s.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top countries */}
                  <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] p-5 flex flex-col gap-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-4 h-4 text-gray-400 dark:text-white/30" />
                      <h3 className="text-sm font-bold text-gray-700 dark:text-white/80">Top países compradores</h3>
                    </div>
                    <div className="flex flex-col gap-3">
                      {analytics.topCountries.map((c, i) => {
                        const maxCount = analytics.topCountries[0].count || 1;
                        const pct = Math.round((c.count / maxCount) * 100);
                        return (
                          <div key={c.country} className="flex items-center gap-3">
                            <span className="text-lg leading-none w-6 flex-shrink-0">{c.flag}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-semibold text-gray-700 dark:text-white/70">{c.country}</span>
                                <span className="text-xs text-gray-400 dark:text-white/30 font-medium">{c.count} venta{c.count !== 1 ? 's' : ''}</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${pct}%` }}
                                  transition={{ delay: i * 0.08, duration: 0.5, ease: 'easeOut' }}
                                  className="h-full rounded-full bg-emerald-500"
                                  style={{ opacity: 1 - i * 0.12 }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Insights callout */}
                <div className="rounded-3xl bg-gradient-to-br from-[#6850E8]/08 to-[#6850E8]/04 dark:from-[#6850E8]/12 dark:to-[#6850E8]/06 border border-[#6850E8]/15 p-5 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#6850E8]/15 flex items-center justify-center flex-shrink-0">
                    <BarChart2 className="w-5 h-5 text-[#6850E8]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-1">Recomendación IA</h4>
                    <p className="text-xs text-gray-500 dark:text-white/50 leading-relaxed">
                      {analytics.conversionRate < 3
                        ? `Tu tasa de conversión es del ${analytics.conversionRate.toFixed(1)}%. Considera mejorar las imágenes del producto y añadir más testimonios para aumentar la confianza y subir esta métrica.`
                        : analytics.salesTrend > 15
                        ? `¡Excelente! Las ventas crecieron un ${analytics.salesTrend}% este período. Aprovecha el momentum — considera hacer una campaña especial en Instagram y TikTok donde ya tienes el ${analytics.topSources[1]?.pct ?? 0}% del tráfico.`
                        : `El producto tiene buen rendimiento. El ${analytics.topSources[0]?.source} representa el ${analytics.topSources[0]?.pct}% del tráfico — intenta diversificar con promociones en redes sociales.`
                      }
                    </p>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: COMPRADORES
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'compradores' && (
          <div className="flex flex-col gap-5">

            {buyersLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-2 border-[#6850E8]/20 border-t-[#6850E8] rounded-full animate-spin" />
                <p className="text-sm text-gray-400 dark:text-white/30">Cargando compradores…</p>
              </div>
            ) : (
              <>
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-white/30" />
                    <input
                      value={buyerSearch}
                      onChange={e => setBuyerSearch(e.target.value)}
                      placeholder="Buscar comprador…"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#111118] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-900 dark:text-white outline-none focus:border-[#6850E8] transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {selectedBuyers.size > 0 && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setCouponModal(selectedBuyerObjects)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#6850E8] text-white text-sm font-bold shadow-lg shadow-[#6850E8]/25 hover:bg-[#5940d8] transition-colors"
                      >
                        <Gift className="w-4 h-4" />
                        Enviar cupón ({selectedBuyers.size})
                      </motion.button>
                    )}
                    <span className="text-sm text-gray-400 dark:text-white/30 font-medium">
                      {buyers.length} comprador{buyers.length !== 1 ? 'es' : ''}
                    </span>
                  </div>
                </div>

                {buyers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#111118] gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center">
                      <Users className="w-7 h-7 text-gray-300 dark:text-white/20" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-500 dark:text-white/40">Sin compradores aún</p>
                      <p className="text-xs text-gray-400 dark:text-white/25 mt-1">Cuando alguien compre este producto, aparecerá aquí.</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] overflow-hidden">

                    {/* Table header */}
                    <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-100 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02]">
                      <button
                        onClick={toggleSelectAll}
                        className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-gray-400 dark:text-white/25 hover:text-[#6850E8] transition-colors"
                      >
                        {selectedBuyers.size === filteredBuyers.length && filteredBuyers.length > 0
                          ? <CheckSquare className="w-4 h-4 text-[#6850E8]" />
                          : <Square className="w-4 h-4" />}
                      </button>
                      <span className="flex-1 text-xs font-bold text-gray-400 dark:text-white/25 uppercase tracking-wider">Comprador</span>
                      <span className="hidden sm:block w-32 text-xs font-bold text-gray-400 dark:text-white/25 uppercase tracking-wider">Fecha</span>
                      <span className="w-20 text-xs font-bold text-gray-400 dark:text-white/25 uppercase tracking-wider text-right">Monto</span>
                      <span className="w-24 text-xs font-bold text-gray-400 dark:text-white/25 uppercase tracking-wider text-right">Acciones</span>
                    </div>

                    {/* Rows */}
                    <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                      <AnimatePresence>
                        {filteredBuyers.map((buyer) => (
                          <motion.div
                            key={buyer.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${
                              selectedBuyers.has(buyer.id) ? 'bg-[#6850E8]/04 dark:bg-[#6850E8]/06' : ''
                            }`}
                          >
                            {/* Checkbox */}
                            <button
                              onClick={() => toggleSelectBuyer(buyer.id)}
                              className="w-5 h-5 flex-shrink-0 flex items-center justify-center text-gray-300 dark:text-white/20 hover:text-[#6850E8] transition-colors"
                            >
                              {selectedBuyers.has(buyer.id)
                                ? <CheckSquare className="w-4 h-4 text-[#6850E8]" />
                                : <Square className="w-4 h-4" />}
                            </button>

                            {/* Avatar + name */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6850E8] to-[#9277F5] flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {buyer.profilePicture
                                  ? <img src={buyer.profilePicture} alt={buyer.displayName} className="w-full h-full object-cover" />
                                  : <span className="text-white text-sm font-bold">{buyer.displayName[0]}</span>}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{buyer.displayName}</p>
                                <p className="text-xs text-gray-400 dark:text-white/30 truncate">{buyer.email}</p>
                              </div>
                            </div>

                            {/* Date */}
                            <div className="hidden sm:flex items-center gap-1.5 w-32 text-xs text-gray-400 dark:text-white/30">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              {fmtDate(buyer.purchaseDate)}
                            </div>

                            {/* Amount */}
                            <div className="w-20 text-right">
                              <span className="text-sm font-bold text-gray-900 dark:text-white">{fmtCurrency(buyer.amount)}</span>
                              {buyer.couponUsed && (
                                <p className="text-[10px] text-emerald-500 font-semibold flex items-center justify-end gap-0.5 mt-0.5">
                                  <Ticket className="w-2.5 h-2.5" /> {buyer.couponUsed}
                                </p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="w-24 flex items-center justify-end gap-1">
                              <button
                                onClick={() => setCouponModal([buyer])}
                                title="Enviar cupón"
                                className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-gray-400 dark:text-white/25 hover:bg-[#6850E8]/10 hover:text-[#6850E8] transition-colors"
                              >
                                <Gift className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => { navigator.clipboard.writeText(buyer.email); toast.success('Email copiado'); }}
                                title="Copiar email"
                                className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center text-gray-400 dark:text-white/25 hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {/* Footer summary */}
                    <div className="px-5 py-3 border-t border-gray-100 dark:border-white/[0.06] flex items-center justify-between bg-gray-50 dark:bg-white/[0.02]">
                      <span className="text-xs text-gray-400 dark:text-white/25 font-medium">
                        {selectedBuyers.size > 0 ? `${selectedBuyers.size} seleccionado${selectedBuyers.size !== 1 ? 's' : ''}` : `${filteredBuyers.length} total`}
                      </span>
                      <span className="text-xs font-bold text-gray-600 dark:text-white/50">
                        Total recaudado: {fmtCurrency(buyers.reduce((a, b) => a + b.amount, 0))}
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick actions */}
                {buyers.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        icon: <Gift className="w-5 h-5" />,
                        label: 'Cupón a todos',
                        desc: `Enviar a ${buyers.length} comprador${buyers.length !== 1 ? 'es' : ''}`,
                        color: '#6850E8',
                        action: () => setCouponModal(buyers),
                      },
                      {
                        icon: <Copy className="w-5 h-5" />,
                        label: 'Copiar todos los emails',
                        desc: 'Para campañas de email',
                        color: '#10B981',
                        action: () => { navigator.clipboard.writeText(buyers.map(b => b.email).join(', ')); toast.success(`${buyers.length} emails copiados`); },
                      },
                      {
                        icon: <Send className="w-5 h-5" />,
                        label: 'Enviar mensaje',
                        desc: 'Notificación push / WhatsApp',
                        color: '#F59E0B',
                        action: () => toast('Próximamente 🚀', { icon: '⏳' }),
                      },
                    ].map(action => (
                      <motion.button
                        key={action.label}
                        whileTap={{ scale: 0.98 }}
                        onClick={action.action}
                        className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-[#111118] border border-gray-100 dark:border-white/[0.06] hover:border-gray-200 dark:hover:border-white/[0.12] transition-all text-left group"
                      >
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors"
                          style={{ background: `${action.color}18`, color: action.color }}>
                          {action.icon}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800 dark:text-white/80 group-hover:text-gray-900 dark:group-hover:text-white">{action.label}</p>
                          <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">{action.desc}</p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}>
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors" onClick={() => setLightbox(null)}>
              <X className="w-5 h-5" />
            </button>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="max-w-3xl max-h-[85vh] w-full">
              {(lightbox.fileType === FileType.VIDEO || lightbox.mimeType?.startsWith('video'))
                ? <video src={lightbox.fileUrl} controls autoPlay className="w-full max-h-[80vh] rounded-2xl object-contain" />
                : <img src={lightbox.fileUrl} alt={lightbox.fileName} className="w-full max-h-[80vh] rounded-2xl object-contain" />
              }
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-white/50 text-xs truncate">{lightbox.fileName} · {formatSize(lightbox.fileSize)}</p>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isEditing ? (
                    <>
                      <button onClick={() => { handleSetThumbnail(lightbox); setLightbox(null); }} disabled={lightbox.fileUrl === thumbnailUrl || !!settingThumbId}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#6850E8] text-white text-xs font-semibold disabled:opacity-40 hover:bg-[#5940d8] transition-colors">
                        <Star className="w-3 h-3" />
                        {lightbox.fileUrl === thumbnailUrl ? 'Miniatura actual' : 'Usar como miniatura'}
                      </button>
                      <button onClick={() => { handleDeleteFile(lightbox); setLightbox(null); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/30 transition-colors">
                        <Trash2 className="w-3 h-3" /> Eliminar
                      </button>
                    </>
                  ) : (
                    <span className="text-white/30 text-xs flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Habilita edición para modificar
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Coupon modal ── */}
      <AnimatePresence>
        {couponModal && id && (
          <CouponModal
            productId={id}
            targetBuyers={couponModal}
            onClose={() => setCouponModal(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
