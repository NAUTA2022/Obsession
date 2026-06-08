import { useState, useRef, useEffect } from 'react';
import {
  ImagePlus, Video, X, Info, Tag, Clock, CalendarDays,
  Phone, VideoIcon, Lightbulb, ChevronDown, ChevronUp,
  ShoppingBag, Settings, Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ProductType, ProductStatus, CreateProductDto, UpdateProductDto,
  Product, productsServiceExtended,
} from '../../services/api/products.service';
import apiClient from '../../services/api/client';

/* ────────────────────────────────────────────────────────── */
/* Types                                                        */
/* ────────────────────────────────────────────────────────── */
type FormCategory  = 'product' | 'service';
type ServiceType   = 'call' | 'videocall';
type DurationUnit  = 'min' | 'hr';
type ApprovalTime  = 'instant' | '30min' | '1h' | '4h' | '24h';

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  kind: 'image' | 'video';
}

const APPROVAL_LABELS: Record<ApprovalTime, string> = {
  instant: 'Instantáneo (automático)',
  '30min': '30 minutos',
  '1h':    '1 hora',
  '4h':    '4 horas',
  '24h':   '24 horas',
};

const PRESET_TAGS = [
  'Baile sensual', 'Striptease', 'Masturbación', 'Juguetes', 'Consolador',
  'Baño de leche', 'Lencería', 'ROI', 'ASMR', 'Fitness', 'Yoga', 'Cocina',
  'Coaching', 'Música', 'Arte', 'Gaming', 'Moda', 'Belleza', 'Meditación',
];

const PRODUCT_TIPS = [
  'Sé específico: "12 fotos en lencería roja" convierte mejor que "fotos exclusivas".',
  'Menciona el formato y calidad: HD, RAW, MP4 1080p, etc.',
  'Crea expectativa: describe la sensación, no solo el contenido.',
  'Usa números: "Pack de 20 fotos + 3 videos de 2 min" atrae más clics.',
];

const SERVICE_TIPS = [
  'Especifica exactamente qué harás durante la llamada.',
  'Menciona idioma, si aplica, y si harás algo a pedido.',
  'Añade un límite claro: "sin grabación" o "grabación incluida".',
  'Precio por minuto extra visible genera más confianza.',
];

/* ────────────────────────────────────────────────────────── */
/* Small sub-components                                         */
/* ────────────────────────────────────────────────────────── */

function PillOption({
  active, onClick, icon: Icon, label, sub,
}: { active: boolean; onClick: () => void; icon?: React.ComponentType<any>; label: string; sub?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-1 rounded-xl border-2 py-3 px-2 text-sm font-semibold transition-all ${
        active
          ? 'border-[#6850E8] bg-[#6850E8]/8 text-[#6850E8] dark:bg-[#6850E8]/12 dark:text-[#9277F5]'
          : 'border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-white/40 hover:border-gray-300 dark:hover:border-white/20'
      }`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{label}</span>
      {sub && <span className="text-[10px] font-normal opacity-60">{sub}</span>}
    </button>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium text-gray-700 dark:text-white/70 mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-sm text-gray-900 dark:text-white/90 placeholder-gray-400 dark:placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#6850E8]/40 focus:border-[#6850E8]/50 transition-colors ${className}`}
    />
  );
}

function Textarea({ className = '', ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-sm text-gray-900 dark:text-white/90 placeholder-gray-400 dark:placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#6850E8]/40 focus:border-[#6850E8]/50 transition-colors resize-none ${className}`}
    />
  );
}

function TipsBox({ tips }: { tips: string[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1.5 rounded-xl border border-amber-200/60 dark:border-amber-400/15 bg-amber-50/60 dark:bg-amber-400/[0.06]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400/80"
      >
        <Lightbulb className="w-3.5 h-3.5 shrink-0" />
        Consejos para escribir mejor
        {open ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
      </button>
      {open && (
        <ul className="px-3 pb-2.5 space-y-1">
          {tips.map((t, i) => (
            <li key={i} className="flex gap-2 text-xs text-amber-700/80 dark:text-amber-400/60">
              <span className="shrink-0 mt-0.5">•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5.5 rounded-full transition-colors ${checked ? 'bg-[#6850E8]' : 'bg-gray-200 dark:bg-white/10'}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </div>
      <span className="text-sm text-gray-700 dark:text-white/70">{label}</span>
    </label>
  );
}

function TagsInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState('');
  const add = (tag: string) => {
    const t = tag.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput('');
  };
  const remove = (tag: string) => onChange(tags.filter((t) => t !== tag));

  return (
    <div className="space-y-2">
      {/* Selected tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-1 rounded-full bg-[#6850E8]/10 dark:bg-[#6850E8]/15 text-[#6850E8] dark:text-[#9277F5] px-2.5 py-0.5 text-xs font-medium">
              {t}
              <button type="button" onClick={() => remove(t)} className="opacity-60 hover:opacity-100">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      {/* Custom input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(input); } }}
          placeholder="Escribe una etiqueta y presiona Enter..."
          className="flex-1"
        />
        {input.trim() && (
          <button
            type="button"
            onClick={() => add(input)}
            className="px-3 rounded-xl bg-[#6850E8] text-white text-xs font-semibold hover:bg-[#5940d8] transition-colors"
          >
            Añadir
          </button>
        )}
      </div>
      {/* Presets */}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_TAGS.filter((t) => !tags.includes(t)).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => add(t)}
            className="rounded-full border border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-white/40 px-2.5 py-0.5 text-xs hover:border-[#6850E8]/50 hover:text-[#6850E8] dark:hover:text-[#9277F5] transition-colors"
          >
            + {t}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Media uploader                                               */
/* ────────────────────────────────────────────────────────── */
function MediaUploader({ files, onChange }: { files: MediaFile[]; onChange: (f: MediaFile[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = (raw: FileList | null) => {
    if (!raw) return;
    const next: MediaFile[] = [];
    Array.from(raw).forEach((file) => {
      const kind: 'image' | 'video' = file.type.startsWith('video/') ? 'video' : 'image';
      const preview = URL.createObjectURL(file);
      next.push({ id: `${Date.now()}-${Math.random()}`, file, preview, kind });
    });
    onChange([...files, ...next]);
  };

  const remove = (id: string) => {
    onChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 cursor-pointer transition-all ${
          dragging
            ? 'border-[#6850E8] bg-[#6850E8]/5'
            : 'border-gray-200 dark:border-white/[0.08] hover:border-[#6850E8]/50 hover:bg-gray-50 dark:hover:bg-white/[0.02]'
        }`}
      >
        <div className="flex items-center gap-2 text-gray-400 dark:text-white/30">
          <ImagePlus className="w-5 h-5" />
          <Video className="w-5 h-5" />
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-white/40">
          Arrastra o <span className="text-[#6850E8] dark:text-[#9277F5]">selecciona archivos</span>
        </p>
        <p className="text-xs text-gray-400 dark:text-white/25">Imágenes y videos · sin límite</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {files.map((f) => (
            <div key={f.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-white/[0.05]">
              {f.kind === 'image' ? (
                <img src={f.preview} alt="" className="w-full h-full object-cover" />
              ) : (
                <video src={f.preview} className="w-full h-full object-cover" muted />
              )}
              {f.kind === 'video' && (
                <span className="absolute bottom-1 left-1 bg-black/60 rounded-md px-1.5 py-0.5 text-[10px] text-white font-semibold flex items-center gap-1">
                  <Video className="w-2.5 h-2.5" /> VIDEO
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(f.id)}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {/* Add more */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-200 dark:border-white/[0.08] flex items-center justify-center text-gray-400 hover:border-[#6850E8]/50 hover:text-[#6850E8] transition-colors"
          >
            <ImagePlus className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Thumbnail picker                                             */
/* ────────────────────────────────────────────────────────── */
function ThumbnailPicker({ preview, onChange }: { preview: string; onChange: (file: File, url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => ref.current?.click()}
      className="relative w-full aspect-video max-w-xs rounded-xl overflow-hidden border-2 border-dashed border-gray-200 dark:border-white/[0.08] cursor-pointer hover:border-[#6850E8]/50 transition-colors bg-gray-50 dark:bg-white/[0.03] flex items-center justify-center"
    >
      {preview ? (
        <img src={preview} alt="Miniatura" className="w-full h-full object-cover" />
      ) : (
        <div className="flex flex-col items-center gap-1 text-gray-400 dark:text-white/30">
          <ImagePlus className="w-6 h-6" />
          <span className="text-xs">Subir miniatura</span>
        </div>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const url = URL.createObjectURL(file);
          onChange(file, url);
        }}
      />
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/* Main Form                                                    */
/* ────────────────────────────────────────────────────────── */
interface ProductFormProps {
  product?: Product;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const navigate = useNavigate();
  const isEdit = !!product;

  /* Category */
  const [category, setCategory] = useState<FormCategory>('product');

  /* Google Calendar status */
  const [calendarConnected, setCalendarConnected] = useState<boolean | null>(null);
  useEffect(() => {
    apiClient.get<{ connected: boolean }>('/google-calendar/status')
      .then((r) => setCalendarConnected((r.data as any)?.connected ?? false))
      .catch(() => setCalendarConnected(false));
  }, []);

  /* Product fields */
  const [subType, setSubType]   = useState<'single' | 'package'>(product?.type === ProductType.PACKAGE ? 'package' : 'single');
  const [title, setTitle]       = useState(product?.title ?? '');
  const [desc, setDesc]         = useState(product?.description ?? '');
  const [price, setPrice]       = useState<string>(String(product?.price ?? ''));
  const [status, setStatus]     = useState<ProductStatus>(product?.status ?? ProductStatus.ACTIVE);
  const [tags, setTags]         = useState<string[]>([]);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [thumbFile, setThumbFile]   = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState(product?.thumbnailUrl ?? '');

  /* Service fields */
  const [svcType, setSvcType]         = useState<ServiceType>('videocall');
  const [durationVal, setDurationVal] = useState<string>('30');
  const [durationUnit, setDurationUnit] = useState<DurationUnit>('min');
  const [extraMins, setExtraMins]     = useState(false);
  const [approvalTime, setApprovalTime] = useState<ApprovalTime>('1h');

  /* Submission */
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let thumbnailUrl = product?.thumbnailUrl ?? '';
      if (thumbFile) {
        const up = await productsServiceExtended.uploadThumbnail(thumbFile);
        if (up.success && up.data) thumbnailUrl = up.data.url;
      }

      const dto: CreateProductDto = {
        title,
        description: desc,
        price: parseFloat(price) || 0,
        type: category === 'service' ? ProductType.SERVICE : subType === 'package' ? ProductType.PACKAGE : ProductType.SINGLE,
        status,
        thumbnailUrl,
      };

      const res = isEdit && product
        ? await productsServiceExtended.updateProduct(product.id, dto)
        : await productsServiceExtended.createProduct(dto);

      if (res.success) {
        onSuccess?.();
      } else {
        setError(`Error al ${isEdit ? 'actualizar' : 'crear'}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  /* ── Shared section wrapper ── */
  const Section = ({ children }: { children: React.ReactNode }) => (
    <div className="space-y-4">{children}</div>
  );

  /* ── Calendar not connected screen ── */
  if (category === 'service' && calendarConnected === false) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white/90">
            {isEdit ? 'Editar' : 'Crear nuevo'}
          </h2>
          {/* Category toggle */}
          <div className="flex gap-2 mt-3">
            <PillOption active={category === 'product'} onClick={() => setCategory('product')}
              icon={ShoppingBag} label="Producto" />
            <PillOption active={category === 'service'} onClick={() => setCategory('service')}
              icon={VideoIcon} label="Servicio" />
          </div>
        </div>

        {/* Warning */}
        <div className="rounded-2xl border border-amber-200 dark:border-amber-400/20 bg-amber-50 dark:bg-amber-400/[0.07] p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <CalendarDays className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">
              Necesitas conectar Google Calendar
            </p>
          </div>
          <p className="text-xs text-amber-700/80 dark:text-amber-400/70 leading-relaxed">
            Para ofrecer servicios (llamadas, videollamadas) los clientes necesitan agendar con base en tu disponibilidad real. Conecta tu Google Calendar y configura tus horarios disponibles antes de crear un servicio.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => navigate('/creator/settings?tab=calendar')}
              className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Ir a configuración
            </button>
            <button
              type="button"
              onClick={() => setCalendarConnected(true)}
              className="flex items-center gap-2 rounded-xl border border-amber-300 dark:border-amber-400/30 text-amber-700 dark:text-amber-400 text-sm font-medium px-4 py-2 hover:bg-amber-100 dark:hover:bg-amber-400/10 transition-colors"
            >
              Ya lo configuré
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          {onCancel && (
            <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 dark:text-white/40 dark:hover:text-white/60">
              Cancelar
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ── Main form ── */
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Header + category */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white/90 mb-3">
          {isEdit ? 'Editar' : 'Crear nuevo'}
        </h2>
        <div className="flex gap-2">
          <PillOption active={category === 'product'} onClick={() => setCategory('product')}
            icon={ShoppingBag} label="Producto" sub="fotos · videos" />
          <PillOption active={category === 'service'} onClick={() => setCategory('service')}
            icon={VideoIcon} label="Servicio" sub="llamadas · citas" />
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* ═══════════════ PRODUCTO ═══════════════ */}
      {category === 'product' && (
        <Section>
          {/* Sub-type */}
          <div>
            <FieldLabel>Tipo de producto</FieldLabel>
            <div className="flex gap-2">
              <PillOption active={subType === 'single'} onClick={() => setSubType('single')}
                icon={ImagePlus} label="Individual" sub="1 foto o video" />
              <PillOption active={subType === 'package'} onClick={() => setSubType('package')}
                icon={Tag} label="Paquete" sub="varios archivos" />
            </div>
          </div>

          {/* Media upload */}
          <div>
            <FieldLabel>Fotos y videos</FieldLabel>
            <MediaUploader files={mediaFiles} onChange={setMediaFiles} />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-white/25">
              Los archivos se entregan al cliente al comprar. Soporta JPG, PNG, MP4, MOV y más.
            </p>
          </div>

          {/* Title */}
          <div>
            <FieldLabel required>Título</FieldLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ej: Pack de 12 fotos exclusivas en lencería"
              maxLength={80}
            />
            <div className="flex justify-between mt-1">
              <TipsBox tips={PRODUCT_TIPS} />
              <span className="text-[10px] text-gray-300 dark:text-white/20 ml-2 mt-1 shrink-0">{title.length}/80</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <FieldLabel required>Descripción</FieldLabel>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
              rows={4}
              placeholder="Describe qué incluye este contenido, el estilo, el ambiente, detalles especiales..."
              maxLength={500}
            />
            <span className="text-[10px] text-gray-300 dark:text-white/20">{desc.length}/500</span>
          </div>

          {/* Tags */}
          <div>
            <FieldLabel>Etiquetas</FieldLabel>
            <TagsInput tags={tags} onChange={setTags} />
            <p className="mt-1.5 text-xs text-gray-400 dark:text-white/25">
              Las etiquetas mejoran tu visibilidad en el marketplace.
            </p>
          </div>

          {/* Thumbnail */}
          <div>
            <FieldLabel>Miniatura (portada del producto)</FieldLabel>
            <ThumbnailPicker
              preview={thumbPreview}
              onChange={(file, url) => { setThumbFile(file); setThumbPreview(url); }}
            />
          </div>

          {/* Price */}
          <div>
            <FieldLabel required>Precio (USD)</FieldLabel>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min="0"
                step="0.01"
                placeholder="19.00"
                className="pl-7"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <FieldLabel>Visibilidad</FieldLabel>
            <div className="flex gap-2">
              <PillOption active={status === ProductStatus.ACTIVE} onClick={() => setStatus(ProductStatus.ACTIVE)}
                icon={Check} label="Activo" sub="visible en marketplace" />
              <PillOption active={status === ProductStatus.DRAFT} onClick={() => setStatus(ProductStatus.DRAFT)}
                label="Borrador" sub="no visible aún" />
            </div>
          </div>
        </Section>
      )}

      {/* ═══════════════ SERVICIO ═══════════════ */}
      {category === 'service' && calendarConnected && (
        <Section>
          {/* Google Calendar connected banner */}
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.08] border border-emerald-200 dark:border-emerald-500/20 px-3 py-2">
            <CalendarDays className="w-4 h-4 text-emerald-500 shrink-0" />
            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              Google Calendar conectado · tu disponibilidad se sincroniza automáticamente
            </p>
          </div>

          {/* Service type */}
          <div>
            <FieldLabel>Tipo de servicio</FieldLabel>
            <div className="flex gap-2">
              <PillOption active={svcType === 'call'} onClick={() => setSvcType('call')}
                icon={Phone} label="Llamada" sub="solo audio" />
              <PillOption active={svcType === 'videocall'} onClick={() => setSvcType('videocall')}
                icon={VideoIcon} label="Videollamada" sub="cámara activada" />
            </div>
          </div>

          {/* Duration */}
          <div>
            <FieldLabel required>Duración de la sesión</FieldLabel>
            <div className="flex gap-2">
              <Input
                type="number"
                value={durationVal}
                onChange={(e) => setDurationVal(e.target.value)}
                min="1"
                placeholder="30"
                className="flex-1"
              />
              <div className="flex rounded-xl border border-gray-200 dark:border-white/[0.08] overflow-hidden shrink-0">
                {(['min', 'hr'] as DurationUnit[]).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setDurationUnit(u)}
                    className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
                      durationUnit === u
                        ? 'bg-[#6850E8] text-white'
                        : 'text-gray-500 dark:text-white/40 hover:bg-gray-50 dark:hover:bg-white/[0.04]'
                    }`}
                  >
                    {u === 'min' ? 'min' : 'hora'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <FieldLabel required>Título del servicio</FieldLabel>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder={`Ej: ${svcType === 'videocall' ? 'Videollamada privada 30 min — a tu petición' : 'Llamada exclusiva 20 min'}`}
              maxLength={80}
            />
            <div className="flex justify-between mt-1">
              <TipsBox tips={SERVICE_TIPS} />
              <span className="text-[10px] text-gray-300 dark:text-white/20 ml-2 mt-1 shrink-0">{title.length}/80</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <FieldLabel required>Descripción</FieldLabel>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              required
              rows={4}
              placeholder="Describe qué harás durante la sesión, qué puede pedir el cliente, ambiente, límites, etc."
              maxLength={500}
            />
            <span className="text-[10px] text-gray-300 dark:text-white/20">{desc.length}/500</span>
          </div>

          {/* Thumbnail */}
          <div>
            <FieldLabel>Miniatura</FieldLabel>
            <ThumbnailPicker
              preview={thumbPreview}
              onChange={(file, url) => { setThumbFile(file); setThumbPreview(url); }}
            />
          </div>

          {/* Tags */}
          <div>
            <FieldLabel>Etiquetas</FieldLabel>
            <TagsInput tags={tags} onChange={setTags} />
          </div>

          {/* Price */}
          <div>
            <FieldLabel required>Precio de la sesión (USD)</FieldLabel>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required min="0" step="0.01"
                placeholder="29.00"
                className="pl-7"
              />
            </div>
          </div>

          {/* Extra minutes */}
          <div className="rounded-xl border border-gray-200 dark:border-white/[0.08] p-4 space-y-2">
            <Toggle
              checked={extraMins}
              onChange={setExtraMins}
              label="Permitir compra de minutos extra durante la sesión"
            />
            {extraMins && (
              <p className="text-xs text-gray-400 dark:text-white/30 pl-[52px]">
                El cliente podrá comprar bloques de minutos adicionales en tiempo real mientras la llamada está activa.
              </p>
            )}
          </div>

          {/* Approval time */}
          <div>
            <FieldLabel>Tiempo de respuesta para confirmar agenda</FieldLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.entries(APPROVAL_LABELS) as [ApprovalTime, string][]).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setApprovalTime(k)}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-colors ${
                    approvalTime === k
                      ? 'border-[#6850E8] bg-[#6850E8]/8 text-[#6850E8] dark:bg-[#6850E8]/12 dark:text-[#9277F5]'
                      : 'border-gray-200 dark:border-white/[0.08] text-gray-500 dark:text-white/40 hover:border-gray-300'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  {v}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-gray-400 dark:text-white/25">
              {approvalTime === 'instant'
                ? 'Las reservas se confirman automáticamente sin tu intervención.'
                : `Tienes ${APPROVAL_LABELS[approvalTime]} para aprobar o rechazar cada reserva.`}
            </p>
          </div>

          {/* Status */}
          <div>
            <FieldLabel>Visibilidad</FieldLabel>
            <div className="flex gap-2">
              <PillOption active={status === ProductStatus.ACTIVE} onClick={() => setStatus(ProductStatus.ACTIVE)}
                icon={Check} label="Activo" sub="visible en marketplace" />
              <PillOption active={status === ProductStatus.DRAFT} onClick={() => setStatus(ProductStatus.DRAFT)}
                label="Borrador" sub="no visible aún" />
            </div>
          </div>
        </Section>
      )}

      {/* Submit */}
      <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-white/[0.06]">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-200 dark:border-white/[0.08] py-2.5 text-sm font-semibold text-gray-600 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading || (category === 'service' && !calendarConnected)}
          className="flex-1 rounded-xl bg-[#6850E8] hover:bg-[#5940d8] disabled:opacity-50 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          {loading
            ? (isEdit ? 'Guardando...' : 'Creando...')
            : (isEdit ? 'Guardar cambios' : `Crear ${category === 'service' ? 'servicio' : 'producto'}`)}
        </button>
      </div>
    </form>
  );
}
