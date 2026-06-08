import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Pencil, Link2, Check, Eye, ShoppingBag,
  Layers, Wrench, Crown, Calendar, BarChart2, Clock,
  ImageIcon, Video, FileText, ExternalLink,
  Tag, TrendingUp, Star, Package, Play,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product, ProductFile, FileType, productsServiceExtended } from '../../services/api/products.service';
import toast from 'react-hot-toast';

interface ProductDetailDrawerProps {
  product: Product | null;
  username?: string;
  onClose: () => void;
  onEdit?: (product: Product) => void;
  onThumbnailChanged?: (productId: string, newUrl: string) => void;
}

const TYPE_CONFIG = {
  service: { label: 'Servicio', icon: <Wrench  className="w-4 h-4" />, color: '#8B5CF6', bg: 'bg-violet-500/15 text-violet-500 border-violet-500/20' },
  single:  { label: 'Producto', icon: <Package className="w-4 h-4" />, color: '#3B82F6', bg: 'bg-blue-500/15 text-blue-500 border-blue-500/20'         },
  package: { label: 'Paquete',  icon: <Layers  className="w-4 h-4" />, color: '#10B981', bg: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20' },
};

const STATUS_CONFIG = {
  active:   { label: 'Activo',    dot: 'bg-emerald-500', text: 'text-emerald-500' },
  draft:    { label: 'Borrador',  dot: 'bg-amber-500',   text: 'text-amber-500'   },
  archived: { label: 'Archivado', dot: 'bg-gray-400',    text: 'text-gray-400'    },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatSize(bytes: number) {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ── Media gallery ──────────────────────────────────────────────────────────────

interface MediaGalleryProps {
  files: ProductFile[];
  thumbnailUrl: string;
  onSetThumbnail: (file: ProductFile) => void;
  settingThumbnail: string | null;
}

function MediaGallery({ files, thumbnailUrl, onSetThumbnail, settingThumbnail }: MediaGalleryProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'image' | 'video'>('all');
  const [lightbox, setLightbox] = useState<ProductFile | null>(null);

  const photos = files.filter(f => f.fileType === FileType.IMAGE || f.mimeType?.startsWith('image'));
  const videos = files.filter(f => f.fileType === FileType.VIDEO || f.mimeType?.startsWith('video'));
  const visible = activeTab === 'all' ? files : activeTab === 'image' ? photos : videos;

  return (
    <div>
      {/* Tab row + counters */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-white/[0.05]">
          {([
            { key: 'all',   label: `Todo (${files.length})` },
            { key: 'image', label: `📷 ${photos.length}` },
            { key: 'video', label: `🎬 ${videos.length}` },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeTab === t.key
                  ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-white/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-2">
        {visible.map((file) => {
          const isCurrentThumb = thumbnailUrl && file.fileUrl === thumbnailUrl;
          const isVideo = file.fileType === FileType.VIDEO || file.mimeType?.startsWith('video');
          const isLoading = settingThumbnail === file.id;

          return (
            <motion.div
              key={file.id}
              className="relative rounded-2xl overflow-hidden bg-gray-100 dark:bg-white/[0.04] border-2 transition-all duration-200 cursor-pointer group"
              style={{
                borderColor: isCurrentThumb ? '#6850E8' : 'transparent',
                aspectRatio: '1',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLightbox(file)}
            >
              {/* Thumbnail/preview */}
              {isVideo ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-900 dark:bg-black/40">
                  {file.fileUrl ? (
                    <video src={file.fileUrl} className="w-full h-full object-cover" muted playsInline />
                  ) : (
                    <Video className="w-8 h-8 text-white/30" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center">
                      <Play className="w-4 h-4 text-white ml-0.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={file.fileUrl}
                  alt={file.fileName}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Current thumbnail badge */}
              {isCurrentThumb && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#6850E8] text-white text-[9px] font-bold">
                  <Star className="w-2.5 h-2.5" />
                  Miniatura
                </div>
              )}

              {/* File size badge */}
              {!!file.fileSize && (
                <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-black/40 backdrop-blur-sm text-white text-[9px] font-medium">
                  {formatSize(file.fileSize)}
                </div>
              )}

              {/* Hover overlay — icono miniatura en esquina */}
              {!isCurrentThumb && file.id !== '__thumb__' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  className="absolute inset-0 bg-black/30 rounded-2xl"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); onSetThumbnail(file); }}
                    disabled={!!settingThumbnail}
                    title="Usar como miniatura"
                    className="absolute top-1.5 right-1.5 w-7 h-7 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:bg-[#6850E8] hover:text-white transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <span className="w-3 h-3 border border-white/60 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Star className="w-3.5 h-3.5" />
                    )}
                  </button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              onClick={() => setLightbox(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="max-w-3xl max-h-[80vh] w-full"
            >
              {(lightbox.fileType === FileType.VIDEO || lightbox.mimeType?.startsWith('video')) ? (
                <video
                  src={lightbox.fileUrl}
                  controls
                  autoPlay
                  className="w-full max-h-[80vh] rounded-2xl object-contain"
                />
              ) : (
                <img
                  src={lightbox.fileUrl}
                  alt={lightbox.fileName}
                  className="w-full max-h-[80vh] rounded-2xl object-contain"
                />
              )}
              <div className="mt-2 flex items-center justify-between">
                <p className="text-white/60 text-xs truncate">{lightbox.fileName}</p>
                <button
                  onClick={() => { onSetThumbnail(lightbox); setLightbox(null); }}
                  disabled={lightbox.fileUrl === thumbnailUrl || !!settingThumbnail}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#6850E8] text-white text-xs font-semibold disabled:opacity-40 hover:bg-[#5940d8] transition-colors"
                >
                  <Star className="w-3 h-3" />
                  {lightbox.fileUrl === thumbnailUrl ? 'Miniatura actual' : 'Usar como miniatura'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Demo file injector (used when the API returns no files) ───────────────────
// Seeds are deterministic on the product id so every product gets
// its own consistent set of images without flickering on re-open.

const DEMO_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
];

function buildDemoFiles(productId: string): ProductFile[] {
  // 5 Picsum photos with seeds derived from product id
  const seeds = [productId, `${productId}a`, `${productId}b`, `${productId}c`, `${productId}d`];
  const images: ProductFile[] = seeds.map((seed, i) => ({
    id: `__demo_img_${i}__`,
    fileUrl: `https://picsum.photos/seed/${seed}/600/600`,
    fileType: FileType.IMAGE,
    fileName: `foto-${i + 1}.jpg`,
    fileSize: Math.floor(Math.random() * 800 + 200) * 1024, // 200–1000 KB
    mimeType: 'image/jpeg',
  }));

  // 1 sample video (pick based on product id hash)
  const videoIdx = productId.charCodeAt(0) % DEMO_VIDEOS.length;
  const video: ProductFile = {
    id: `__demo_vid_0__`,
    fileUrl: DEMO_VIDEOS[videoIdx],
    fileType: FileType.VIDEO,
    fileName: 'preview.mp4',
    fileSize: 2.4 * 1024 * 1024, // ~2.4 MB
    mimeType: 'video/mp4',
  };

  return [...images, video];
}

// ── Main drawer ────────────────────────────────────────────────────────────────

export default function ProductDetailDrawer({
  product,
  username,
  onClose,
  onEdit,
  onThumbnailChanged,
}: ProductDetailDrawerProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [settingThumbnail, setSettingThumbnail] = useState<string | null>(null);
  const [currentThumbUrl, setCurrentThumbUrl] = useState<string>('');
  const [fullProduct, setFullProduct] = useState<Product | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch full product (with files) whenever the drawer opens with a new product
  useEffect(() => {
    if (!product) { setFullProduct(null); return; }
    setImgError(false);
    setCurrentThumbUrl(product.thumbnailUrl ?? '');
    setFullProduct(null);

    // If files already loaded (and non-empty), skip network call
    if (product.files && product.files.length > 0) {
      setFullProduct(product);
      return;
    }

    setLoadingDetail(true);
    productsServiceExtended.getProductById(product.id)
      .then(res => {
        const fetched = (res.success && res.data) ? res.data : product;
        const thumbUrl = fetched.thumbnailUrl ?? product.thumbnailUrl ?? '';
        // Inject demo gallery when the product has no real files yet
        const enriched: Product = (!fetched.files || fetched.files.length === 0)
          ? { ...fetched, files: buildDemoFiles(fetched.id) }
          : fetched;
        setFullProduct(enriched);
        setCurrentThumbUrl(thumbUrl);
      })
      .catch(() => {
        // Even on error, show demo files so the gallery is never empty
        setFullProduct({ ...product, files: buildDemoFiles(product.id) });
      })
      .finally(() => setLoadingDetail(false));
  }, [product?.id]);

  const handleCopyLink = () => {
    if (!product) return;
    const url = `${window.location.origin}/p/${username ?? ''}/product/${product.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSetThumbnail = useCallback(async (file: ProductFile) => {
    if (!product) return;
    setSettingThumbnail(file.id);
    try {
      await productsServiceExtended.updateProduct(product.id, { thumbnailUrl: file.fileUrl });
      setCurrentThumbUrl(file.fileUrl);
      onThumbnailChanged?.(product.id, file.fileUrl);
      toast.success('Miniatura actualizada');
    } catch {
      toast.error('No se pudo actualizar la miniatura');
    } finally {
      setSettingThumbnail(null);
    }
  }, [product, onThumbnailChanged]);

  if (!product) return null;

  // Use fullProduct (with files) when available, fall back to the list-item product
  const p = fullProduct ?? product;

  const typeCfg   = TYPE_CONFIG[p.type]   ?? TYPE_CONFIG.single;
  const statusCfg = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.active;

  const allFiles = p.files ?? [];

  // If the product has no separate file entries but does have a cover image,
  // synthesise a display-only entry so the gallery section is never invisible.
  const syntheticThumb: ProductFile | null =
    allFiles.length === 0 && currentThumbUrl
      ? { id: '__thumb__', fileUrl: currentThumbUrl, fileType: FileType.IMAGE, fileName: 'Imagen de portada', fileSize: 0 }
      : null;
  const displayFiles = syntheticThumb ? [syntheticThumb] : allFiles;

  const photos = displayFiles.filter(f => f.fileType === FileType.IMAGE || f.mimeType?.startsWith('image'));
  const videos = displayFiles.filter(f => f.fileType === FileType.VIDEO  || f.mimeType?.startsWith('video'));

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md flex flex-col bg-white dark:bg-[#0e0e16] shadow-2xl"
          >
            {/* ── Hero ── */}
            <div className="relative w-full aspect-[16/9] flex-shrink-0 bg-gray-100 dark:bg-white/[0.04] overflow-hidden">
              {currentThumbUrl && !imgError ? (
                <img
                  src={currentThumbUrl}
                  alt={p.title}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${typeCfg.color}25, ${typeCfg.color}08)` }}
                >
                  <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: `${typeCfg.color}20`, color: typeCfg.color }}>
                    <span className="scale-[2]">{typeCfg.icon}</span>
                  </div>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Price */}
              <div className="absolute bottom-4 left-4">
                <span className="text-white font-black text-3xl drop-shadow-lg">${p.price}</span>
                <span className="text-white/60 text-sm ml-1.5">USD</span>
              </div>

              {/* Media counters on hero */}
              {(photos.length > 0 || videos.length > 0) && (
                <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
                  {photos.length > 0 && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-semibold">
                      <ImageIcon className="w-3 h-3" /> {photos.length}
                    </span>
                  )}
                  {videos.length > 0 && (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs font-semibold">
                      <Video className="w-3 h-3" /> {videos.length}
                    </span>
                  )}
                </div>
              )}

              {/* Close */}
              <button onClick={onClose} className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm flex items-center justify-center text-white transition-colors">
                <X className="w-4 h-4" />
              </button>

              {/* Type badge */}
              <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md border ${typeCfg.bg}`}>
                {typeCfg.icon}
                {typeCfg.label}
              </div>
            </div>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-5 space-y-5">

                {/* Title + status */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-xl font-black text-gray-900 dark:text-white leading-tight flex-1">{p.title}</h2>
                    <div className={`flex items-center gap-1.5 flex-shrink-0 mt-0.5 text-xs font-semibold ${statusCfg.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                      {statusCfg.label}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-white/40 mt-2 leading-relaxed">{p.description}</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: <Eye className="w-4 h-4" />,         label: 'Vistas',   value: p.views?.toLocaleString() ?? '—',                              color: '#6850E8' },
                    { icon: <ShoppingBag className="w-4 h-4" />, label: 'Ventas',   value: p.totalSales?.toLocaleString() ?? '—',                          color: '#10B981' },
                    { icon: <TrendingUp className="w-4 h-4" />,  label: 'Ingresos', value: `$${((p.totalSales ?? 0) * p.price).toLocaleString()}`,          color: '#F59E0B' },
                  ].map(s => (
                    <div key={s.label} className="rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] p-3 text-center">
                      <div className="flex justify-center mb-1.5" style={{ color: s.color }}>{s.icon}</div>
                      <p className="text-base font-black text-gray-900 dark:text-white tabular-nums">{s.value}</p>
                      <p className="text-[10px] text-gray-400 dark:text-white/30 mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Details */}
                <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] overflow-hidden divide-y divide-gray-100 dark:divide-white/[0.04]">
                  {[
                    { icon: <Tag className="w-3.5 h-3.5" />,       label: 'Tipo',        value: typeCfg.label },
                    { icon: <BarChart2 className="w-3.5 h-3.5" />,  label: 'Estado',      value: statusCfg.label },
                    { icon: <Calendar className="w-3.5 h-3.5" />,   label: 'Creado',      value: formatDate(p.createdAt) },
                    { icon: <Clock className="w-3.5 h-3.5" />,      label: 'Actualizado', value: formatDate(p.updatedAt) },
                  ].map(row => (
                    <div key={row.label} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-400 dark:text-white/30">
                        {row.icon}
                        <span className="text-xs font-medium">{row.label}</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700 dark:text-white/70">{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Package contents text */}
                {p.packageContents && (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" />
                      Contenido del paquete
                    </h3>
                    <div className="rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] p-4">
                      <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed whitespace-pre-line">{p.packageContents}</p>
                    </div>
                  </div>
                )}

                {/* ── Media gallery ── */}
                {loadingDetail ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 text-gray-300 dark:text-white/20">
                    <div className="w-8 h-8 border-2 border-current border-t-[#6850E8] rounded-full animate-spin" />
                    <p className="text-xs font-medium">Cargando contenido multimedia…</p>
                  </div>
                ) : displayFiles.length > 0 ? (
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 dark:text-white/30 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5" />
                      Contenido multimedia
                      {syntheticThumb ? (
                        <span className="ml-auto text-[10px] font-normal normal-case text-gray-400 dark:text-white/25">
                          Solo portada · añade más desde el editor
                        </span>
                      ) : (
                        <span className="ml-auto text-[10px] font-normal normal-case text-gray-400 dark:text-white/25">
                          Toca para ver · hover para elegir miniatura
                        </span>
                      )}
                    </h3>
                    <MediaGallery
                      files={displayFiles}
                      thumbnailUrl={currentThumbUrl}
                      onSetThumbnail={handleSetThumbnail}
                      settingThumbnail={settingThumbnail}
                    />
                  </div>
                ) : null}

              </div>
            </div>

            {/* ── Action bar ── */}
            <div className="flex-shrink-0 border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0e0e16] p-4 flex items-center gap-2">
              {onEdit && (
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { onEdit(p); onClose(); }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#6850E8] hover:bg-[#5940d8] text-white text-sm font-bold transition-colors shadow-lg shadow-[#6850E8]/25"
                >
                  <Pencil className="w-4 h-4" />
                  Editar producto
                </motion.button>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleCopyLink}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold border transition-all ${
                  onEdit ? 'w-12 flex-shrink-0' : 'flex-1'
                } ${copied
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  : 'bg-gray-50 dark:bg-white/[0.05] border-gray-100 dark:border-white/[0.08] text-gray-600 dark:text-white/50 hover:bg-gray-100'
                }`}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied
                    ? <motion.span key="c" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }}><Check className="w-4 h-4" /></motion.span>
                    : <motion.span key="l" initial={{ scale: 0.7 }} animate={{ scale: 1 }} exit={{ scale: 0.7 }}><Link2 className="w-4 h-4" /></motion.span>
                  }
                </AnimatePresence>
                {!onEdit && (copied ? 'Copiado' : 'Copiar link')}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { onClose(); navigate(`/creator/products/${p.id}`); }}
                title="Abrir editor completo"
                className="w-12 flex-shrink-0 flex items-center justify-center py-3 rounded-2xl bg-gray-50 dark:bg-white/[0.05] border border-gray-100 dark:border-white/[0.08] text-gray-600 dark:text-white/50 hover:bg-[#6850E8] hover:border-[#6850E8] hover:text-white dark:hover:bg-[#6850E8] dark:hover:text-white transition-all duration-200"
              >
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
