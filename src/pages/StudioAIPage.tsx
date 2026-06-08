import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  motion, AnimatePresence, useMotionValue, useTransform, useSpring,
} from 'framer-motion';
import {
  Sparkles, Image, Video, Upload, X,
  Wand2, Camera, Film, RefreshCw, ZoomIn, Layers, Bot,
  ArrowUp, Paperclip, ChevronLeft, Mic, Send, Check, Download,
  ArrowRight, Lightbulb, MessageSquare, Type,
  Copy, Maximize2, UserSquare2, HelpCircle,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────────

type FeatureId =
  | 'chat' | 'text-to-image' | 'image-to-image' | 'text-to-video'
  | 'image-to-video' | 'video-to-video' | 'deepfake-photo' | 'deepfake-video'
  | 'photo-variations' | 'upscale';

interface AIFeature {
  id: FeatureId;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  color: string;
  from: string;
  to: string;
  inputs: ('prompt' | 'image' | 'video' | 'face-image')[];
}

interface ChatMsg { id: string; role: 'user' | 'assistant'; text: string }

// ── Feature definitions ────────────────────────────────────────────────────────

const FEATURES: AIFeature[] = [
  { id: 'chat',            label: 'Chat IA',         sublabel: 'Asistente inteligente',   icon: <Bot className="w-5 h-5" />,      color: 'from-violet-500 to-indigo-600',  from: '#8B5CF6', to: '#4F46E5', inputs: ['prompt'] },
  { id: 'text-to-image',   label: 'Text → Imagen',   sublabel: 'Crea desde texto',         icon: <Wand2 className="w-5 h-5" />,    color: 'from-pink-500 to-rose-500',      from: '#EC4899', to: '#F43F5E', inputs: ['prompt'] },
  { id: 'image-to-image',  label: 'Img → Img',       sublabel: 'Transforma una foto',      icon: <RefreshCw className="w-5 h-5" />,color: 'from-orange-500 to-amber-500',   from: '#F97316', to: '#F59E0B', inputs: ['image', 'prompt'] },
  { id: 'text-to-video',   label: 'Text → Video',    sublabel: 'Genera video desde texto', icon: <Film className="w-5 h-5" />,     color: 'from-cyan-500 to-blue-600',      from: '#06B6D4', to: '#2563EB', inputs: ['prompt'] },
  { id: 'image-to-video',  label: 'Img → Video',     sublabel: 'Anima una imagen',         icon: <Video className="w-5 h-5" />,    color: 'from-teal-500 to-emerald-600',   from: '#14B8A6', to: '#059669', inputs: ['image', 'prompt'] },
  { id: 'video-to-video',  label: 'Vid → Vid',       sublabel: 'Re-estiliza un video',     icon: <Layers className="w-5 h-5" />,   color: 'from-purple-500 to-violet-600',  from: '#A855F7', to: '#7C3AED', inputs: ['video', 'prompt'] },
  { id: 'deepfake-photo',  label: 'Deepfake Foto',   sublabel: 'Swap de cara en foto',     icon: <Camera className="w-5 h-5" />,   color: 'from-rose-500 to-pink-600',      from: '#F43F5E', to: '#DB2777', inputs: ['face-image', 'image'] },
  { id: 'deepfake-video',  label: 'Deepfake Video',  sublabel: 'Swap de cara en video',    icon: <Film className="w-5 h-5" />,     color: 'from-red-500 to-rose-600',       from: '#EF4444', to: '#F43F5E', inputs: ['face-image', 'video'] },
  { id: 'photo-variations',label: '1 → 5 Fotos',     sublabel: 'Variaciones de imagen',    icon: <Image className="w-5 h-5" />,    color: 'from-indigo-500 to-blue-600',    from: '#6366F1', to: '#2563EB', inputs: ['image', 'prompt'] },
  { id: 'upscale',         label: 'LQ → HQ',         sublabel: 'Mejora la resolución',     icon: <ZoomIn className="w-5 h-5" />,   color: 'from-emerald-500 to-green-600',  from: '#10B981', to: '#16A34A', inputs: ['image'] },
];

const SUGGESTIONS = [
  { label: 'Caption para Instagram', icon: '✨' },
  { label: 'Ideas de contenido',     icon: '💡' },
  { label: 'Imagen de producto',     icon: '🎨' },
  { label: 'Bio de perfil',          icon: '📝' },
  { label: 'Estrategia de ventas',   icon: '🚀' },
];

const SAMPLE: Record<string, string> = {
  default:   'Soy tu asistente de IA. Puedo ayudarte a crear contenido, redactar textos, responder preguntas y mucho más. ¿En qué puedo ayudarte hoy?',
  hola:      '¡Hola! Estoy aquí para ayudarte. ¿Quieres que redacte textos, genere ideas de contenido o te ayude con estrategia? ¿Por dónde empezamos?',
  imagen:    'Para generar imágenes, selecciona "Text → Imagen" o "Img → Img" en los modos de arriba. Puedo crear fotorrealismo, ilustraciones, arte digital y más.',
  video:     'Para videos, elige "Text → Video", "Img → Video" o "Vid → Vid". Puedo animar fotos, crear clips desde texto o re-estilizar videos.',
  caption:   '✨ Aquí tienes captions listos para publicar:\n\n"El éxito no es un destino, es el camino que recorres cada día."\n\n"Creando desde la pasión, entregando con propósito. ¿Lista para lo que viene?"\n\n"No publiques contenido. Publica conexiones."',
  contenido: '📅 Ideas para esta semana:\n\n1. Behind the scenes de tu proceso\n2. Testimonio de cliente satisfecho\n3. Tip rápido de tu área\n4. Poll interactivo con tu audiencia\n5. Reels de transformación',
  estrategia:'🚀 Estrategia de ventas:\n\n• Activa tu bot en horario pico (8-10am / 7-9pm)\n• Envía cupón a leads inactivos >7 días\n• Usa los primeros 3 mensajes para crear urgencia\n• Cierra con testimonios + garantía',
};

// ── Aurora background ──────────────────────────────────────────────────────────

const ORBS = [
  { color: '#7C3AED', x: ['0%', '25%', '-10%', '5%', '0%'], y: ['0%', '-15%', '20%', '-5%', '0%'], s: [1, 1.15, 0.9, 1.1, 1], dur: 22 },
  { color: '#2563EB', x: ['0%', '-20%', '15%', '-8%', '0%'], y: ['0%', '20%', '-12%', '15%', '0%'], s: [1, 0.9, 1.2, 0.95, 1], dur: 28 },
  { color: '#EC4899', x: ['0%', '15%', '-20%', '10%', '0%'], y: ['0%', '-20%', '10%', '-15%', '0%'], s: [1, 1.1, 0.85, 1.05, 1], dur: 18 },
  { color: '#06B6D4', x: ['0%', '-12%', '18%', '-5%', '0%'], y: ['0%', '12%', '-18%', '8%', '0%'], s: [1, 1.05, 1.15, 0.9, 1], dur: 32 },
];

function AuroraBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          animate={{ x: orb.x, y: orb.y, scale: orb.s }}
          transition={{ duration: orb.dur, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
          className="absolute rounded-full blur-3xl opacity-[0.13] dark:opacity-[0.20]"
          style={{
            width: 580 + i * 80,
            height: 580 + i * 80,
            background: orb.color,
            top: `${8 + i * 14}%`,
            left: `${3 + i * 17}%`,
          }}
        />
      ))}
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(108,80,232,1) 1px, transparent 1px), linear-gradient(90deg, rgba(108,80,232,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
    </div>
  );
}

// ── Floating sparkles ──────────────────────────────────────────────────────────

function FloatingSparkles() {
  const sparks = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: `${8 + (i * 7) % 84}%`,
    top: `${10 + (i * 11) % 75}%`,
    delay: (i * 0.4) % 3,
    dur: 2.5 + (i % 4) * 0.7,
    size: i % 3 === 0 ? 3 : i % 3 === 1 ? 2 : 1.5,
  }));
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {sparks.map(s => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white dark:bg-white"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.2, 0.5], y: [0, -18, 0] }}
          transition={{ duration: s.dur, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ── 3D tilt card hook ─────────────────────────────────────────────────────────

function FeatureCard({ feature, onClick }: { feature: AIFeature; onClick: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-40, 40], [8, -8]);
  const rotateY = useTransform(x, [-40, 40], [-8, 8]);
  const springX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 600 }}
      whileHover={{ y: -6, scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className="group flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white/80 dark:bg-white/[0.04] backdrop-blur-sm hover:border-transparent hover:shadow-xl transition-shadow relative overflow-hidden"
    >
      {/* Glow on hover */}
      <motion.div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.08] transition-opacity duration-300`}
      />
      <div
        className={`relative w-11 h-11 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-lg`}
        style={{ boxShadow: `0 8px 24px ${feature.from}40` }}
      >
        {feature.icon}
      </div>
      <div className="relative text-center">
        <p className="text-[11px] font-bold text-gray-700 dark:text-white/70 leading-tight">{feature.label}</p>
        <p className="text-[9px] text-gray-400 dark:text-white/25 mt-0.5 leading-tight">{feature.sublabel}</p>
      </div>
    </motion.button>
  );
}

// ── Animated heading ───────────────────────────────────────────────────────────

function AnimatedHeading() {
  const words = ['¿Qué', 'quieres', 'crear', 'hoy?'];
  return (
    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white leading-tight text-center">
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-2"
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.15 + i * 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

// ── Glowing input bar ──────────────────────────────────────────────────────────

function GlowInput({
  value, onChange, onSubmit, placeholder, rows = 2,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder: string;
  rows?: number;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative">
      <AnimatePresence>
        {focused && (
          <motion.div
            className="absolute -inset-0.5 rounded-[20px] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'linear-gradient(135deg, #6850E8, #EC4899, #06B6D4, #6850E8)',
              backgroundSize: '300% 300%',
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-[20px]"
              animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{
                background: 'linear-gradient(135deg, #6850E8, #EC4899, #06B6D4, #6850E8)',
                backgroundSize: '300% 300%',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className={`relative rounded-2xl border bg-white/90 dark:bg-[#0D0D14]/90 backdrop-blur-xl shadow-xl p-4 transition-colors ${focused ? 'border-transparent' : 'border-gray-200 dark:border-white/[0.08]'}`}>
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          rows={rows}
          className="w-full resize-none bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/20 focus:outline-none"
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-white/[0.05]">
          <div className="flex items-center gap-1">
            {[Paperclip, Image, Mic].map((Icon, i) => (
              <motion.button key={i} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 dark:text-white/20 hover:bg-gray-100 dark:hover:bg-white/[0.06] hover:text-gray-500 dark:hover:text-white/50 transition-colors">
                <Icon className="w-4 h-4" />
              </motion.button>
            ))}
          </div>
          <motion.button
            onClick={onSubmit}
            disabled={!value.trim()}
            whileHover={value.trim() ? { scale: 1.05 } : {}}
            whileTap={value.trim() ? { scale: 0.95 } : {}}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              value.trim()
                ? 'bg-gradient-to-r from-[#6850E8] to-indigo-600 text-white shadow-lg shadow-[#6850E8]/30'
                : 'bg-gray-100 dark:bg-white/[0.05] text-gray-300 dark:text-white/15 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            Enviar
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ── File dropzone ──────────────────────────────────────────────────────────────

function FileDropzone({ label, accept, preview, onFile, onClear }: {
  label: string; accept: string; preview?: string;
  onFile: (f: File, url: string) => void; onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file, URL.createObjectURL(file));
  };
  return (
    <motion.div
      animate={{ borderColor: dragging ? '#6850E8' : undefined }}
      whileHover={{ scale: 1.01 }}
      className={`relative rounded-2xl border-2 border-dashed cursor-pointer overflow-hidden transition-colors ${
        preview ? 'border-[#6850E8]/40' : dragging ? 'border-[#6850E8] bg-[#6850E8]/[0.04]' : 'border-gray-200 dark:border-white/[0.08] hover:border-[#6850E8]/40'
      }`}
      onDrop={handleDrop}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onClick={() => !preview && ref.current?.click()}
    >
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f, URL.createObjectURL(f)); }} />
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
            {accept.includes('video')
              ? <video src={preview} className="w-full h-40 object-cover" />
              : <img src={preview} alt="" className="w-full h-40 object-cover" />}
            <button onClick={e => { e.stopPropagation(); onClear(); }}
              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10 gap-2.5">
            <motion.div animate={dragging ? { scale: 1.2, y: -4 } : { scale: 1, y: 0 }}
              className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center text-gray-400 dark:text-white/20">
              <Upload className="w-5 h-5" />
            </motion.div>
            <p className="text-xs text-gray-400 dark:text-white/25 text-center">{label}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Tool guide data ────────────────────────────────────────────────────────────

interface GuideStep { icon: React.ReactNode; title: string; desc: string; color: string }
interface ToolGuideData {
  description: string;
  steps: [GuideStep, GuideStep, GuideStep];
  useCases: string[];
  tip: string;
}

const GUIDES: Record<FeatureId, ToolGuideData> = {
  'chat': {
    description: 'Tu asistente creativo personal disponible 24/7. Redacta captions, genera ideas, crea estrategias de venta, escribe scripts o simplemente chatea para desbloquear tu creatividad.',
    steps: [
      { icon: <Type className="w-3.5 h-3.5" />,        title: 'Escribe tu solicitud',     desc: 'Pregunta, pide textos o describe lo que necesitas',        color: 'bg-violet-500' },
      { icon: <Sparkles className="w-3.5 h-3.5" />,    title: 'IA analiza y responde',    desc: 'Modelo entrenado en millones de contenidos creativos',      color: 'bg-indigo-500' },
      { icon: <MessageSquare className="w-3.5 h-3.5" />, title: 'Texto listo para usar',  desc: 'Copia, edita o itera sobre la respuesta generada',          color: 'bg-blue-500'   },
    ],
    useCases: ['Captions de Instagram', 'Ideas de Reels', 'Scripts de venta', 'Bio de perfil', 'Respuestas a DMs', 'Estrategia de contenido'],
    tip: 'Sé específico: en vez de "dame ideas", di "5 ideas de Reels para una coach de fitness en junio apuntando a mujeres 25-35".',
  },
  'text-to-image': {
    description: 'Convierte cualquier descripción escrita en una imagen fotorrealista o artística en segundos. Sin cámara, sin estudio, sin Photoshop.',
    steps: [
      { icon: <Type className="w-3.5 h-3.5" />,        title: 'Describe la imagen',       desc: 'Sé detallado: sujeto, estilo, iluminación, cámara',         color: 'bg-pink-500'   },
      { icon: <Sparkles className="w-3.5 h-3.5" />,    title: 'IA genera píxel a píxel',  desc: 'Modelos de difusión construyen la imagen desde tu texto',    color: 'bg-rose-500'   },
      { icon: <Image className="w-3.5 h-3.5" />,       title: 'Imagen lista',             desc: 'Descarga en alta resolución y úsala donde quieras',         color: 'bg-orange-500' },
    ],
    useCases: ['Fotos de producto', 'Fondos para Reels', 'Miniaturas de YouTube', 'Arte para merch', 'Pósters promocionales', 'Avatares IA'],
    tip: 'Añade detalles técnicos: "shot on Sony A7R IV, f/1.8, golden hour, bokeh background, studio product photography" eleva la calidad drásticamente.',
  },
  'image-to-image': {
    description: 'Transforma una foto existente manteniendo su estructura pero cambiando el estilo visual, la iluminación, el fondo o el concepto artístico completo.',
    steps: [
      { icon: <Upload className="w-3.5 h-3.5" />,      title: 'Sube tu imagen',           desc: 'JPG o PNG, cualquier resolución mínima 512px',              color: 'bg-orange-500' },
      { icon: <RefreshCw className="w-3.5 h-3.5" />,   title: 'IA re-estiliza',           desc: 'Mantiene composición, transforma el aspecto visual',        color: 'bg-amber-500'  },
      { icon: <Image className="w-3.5 h-3.5" />,       title: 'Foto transformada',        desc: 'Mismo sujeto, estética completamente nueva',                color: 'bg-yellow-500' },
    ],
    useCases: ['Cambiar fondo de producto', 'Filtro artístico', 'Día a noche', 'Cambiar ropa en foto', 'Estilo editorial', 'Versión anime de una foto'],
    tip: 'Un prompt de estilo preciso como "minimalist studio lighting, pure white background, professional product photography" da resultados muy consistentes.',
  },
  'text-to-video': {
    description: 'Genera clips de video de hasta 10 segundos solo con texto. Ideal para crear B-roll, intros, transiciones o material visual para ads sin necesidad de cámara.',
    steps: [
      { icon: <Type className="w-3.5 h-3.5" />,        title: 'Describe la escena',       desc: 'Incluye acción, ambiente, iluminación y movimiento de cámara', color: 'bg-cyan-500' },
      { icon: <Sparkles className="w-3.5 h-3.5" />,    title: 'IA genera frame a frame',  desc: 'Renderiza cada fotograma basándose en tu descripción',        color: 'bg-blue-500'  },
      { icon: <Film className="w-3.5 h-3.5" />,        title: 'Video MP4 listo',          desc: 'Descarga y usa en cualquier editor o red social',             color: 'bg-indigo-500' },
    ],
    useCases: ['B-roll para YouTube', 'Intro de Reels', 'Clips para ads', 'Fondos animados', 'Visualizaciones abstractas', 'Demo de producto'],
    tip: 'Especifica el movimiento: "slow push in", "aerial shot tracking right", "handheld documentary style". Los verbos de movimiento son clave para videos cinematográficos.',
  },
  'image-to-video': {
    description: 'Toma cualquier imagen estática y la convierte en un video animado con movimiento natural y fluido. La IA infiere cómo se movería el sujeto.',
    steps: [
      { icon: <Upload className="w-3.5 h-3.5" />,      title: 'Sube una imagen',          desc: 'Foto, ilustración o cualquier imagen estática',              color: 'bg-teal-500'    },
      { icon: <Sparkles className="w-3.5 h-3.5" />,    title: 'IA genera movimiento',     desc: 'Infiere física, profundidad y animación natural del sujeto',  color: 'bg-emerald-500' },
      { icon: <Video className="w-3.5 h-3.5" />,       title: 'Imagen animada',           desc: 'Tu foto cobra vida como un video fluido',                    color: 'bg-green-500'   },
    ],
    useCases: ['Animar foto de perfil', 'Dar vida a producto', 'Intro cinematográfico', 'Animar ilustraciones', 'Stories llamativos', 'Avatar animado'],
    tip: 'Imágenes con sujetos bien definidos y fondo limpio dan los mejores resultados. Evita fotos muy cargadas o con múltiples sujetos de igual importancia.',
  },
  'video-to-video': {
    description: 'Re-estiliza un video completo aplicando una estética artística diferente manteniendo la acción y composición original. Transforma cualquier clip en algo completamente nuevo.',
    steps: [
      { icon: <Upload className="w-3.5 h-3.5" />,      title: 'Sube tu video',            desc: 'MP4, MOV o cualquier formato de video estándar',             color: 'bg-purple-500'  },
      { icon: <Layers className="w-3.5 h-3.5" />,      title: 'IA aplica el estilo',      desc: 'Re-renderiza cada frame con el estilo indicado en el prompt', color: 'bg-violet-500'  },
      { icon: <Film className="w-3.5 h-3.5" />,        title: 'Video re-estilizado',      desc: 'Misma acción, estética completamente diferente',             color: 'bg-indigo-500'  },
    ],
    useCases: ['Estilo anime', 'Render 3D fotorrealista', 'Pintura al óleo', 'Estética retro/VHS', 'Neon cyberpunk', 'Acuarela animada'],
    tip: 'Videos cortos de 3-5 segundos generan resultados más consistentes y rápidos. Clips más largos pueden tener variación de estilo entre escenas.',
  },
  'deepfake-photo': {
    description: 'Intercambia el rostro de cualquier persona en una foto con total naturalidad y realismo. La IA preserva iluminación, expresión y escala del rostro destino.',
    steps: [
      { icon: <UserSquare2 className="w-3.5 h-3.5" />, title: 'Sube la cara a insertar',  desc: 'Foto frontal, bien iluminada, sin oclusiones',               color: 'bg-rose-500'   },
      { icon: <Camera className="w-3.5 h-3.5" />,      title: 'IA mapea y fusiona',       desc: 'Detecta landmarks faciales y blending realista con la escena', color: 'bg-pink-500'  },
      { icon: <Image className="w-3.5 h-3.5" />,       title: 'Foto con cara nueva',      desc: 'Resultado natural respetando la iluminación del entorno',    color: 'bg-red-500'    },
    ],
    useCases: ['Cómo quedarías en otro look', 'Pósters personalizados', 'Contenido creativo', 'Avatar personalizado', 'Memes', 'Retoque artístico'],
    tip: 'La foto del rostro debe ser lo más frontal posible, con buena iluminación uniforme y sin gafas, gorros ni oclusiones para el mejor resultado.',
  },
  'deepfake-video': {
    description: 'Reemplaza el rostro en un video completo manteniendo expresiones, movimientos y sincronía labial de forma totalmente convincente frame a frame.',
    steps: [
      { icon: <UserSquare2 className="w-3.5 h-3.5" />, title: 'Foto del rostro + video',  desc: 'Una foto frontal clara + el video destino donde insertar la cara', color: 'bg-red-500'   },
      { icon: <Film className="w-3.5 h-3.5" />,        title: 'IA trackea frame a frame', desc: 'Detecta y reemplaza el rostro en cada fotograma con blending',     color: 'bg-rose-500'  },
      { icon: <Video className="w-3.5 h-3.5" />,       title: 'Video con cara nueva',     desc: 'Expresiones y movimientos naturales preservados',                  color: 'bg-pink-500'  },
    ],
    useCases: ['Contenido de humor creativo', 'Efectos especiales', 'Avatar para streams', 'Videos personalizados', 'Marketing con personajes', 'Storytelling'],
    tip: 'El video destino debe tener buena iluminación constante y el rostro visible la mayor parte del clip. Iluminación variable dificulta el blending.',
  },
  'photo-variations': {
    description: 'A partir de una sola imagen de referencia, genera 5 variaciones únicas que mantienen el espíritu del original explorando composiciones, iluminaciones y detalles alternativos.',
    steps: [
      { icon: <Upload className="w-3.5 h-3.5" />,      title: 'Sube tu imagen base',      desc: 'La referencia visual que quieres explorar en variantes',     color: 'bg-indigo-500' },
      { icon: <Copy className="w-3.5 h-3.5" />,        title: 'IA genera 5 versiones',    desc: 'Diferentes composiciones, ángulos y detalles del mismo concepto', color: 'bg-blue-500' },
      { icon: <Image className="w-3.5 h-3.5" />,       title: '5 variaciones únicas',     desc: 'Elige la que mejor se adapte a tu necesidad',               color: 'bg-sky-500'    },
    ],
    useCases: ['A/B testing de producto', 'Distintas poses del personaje', 'Opciones de portada', 'Thumbnails alternativos', 'Variaciones de merch', 'Explorar estilos'],
    tip: 'Añade en el prompt la dirección de variación: "different angles", "more dramatic lighting", "alternative outfit" para guiar hacia el tipo de variantes que quieres.',
  },
  'upscale': {
    description: 'Mejora la resolución de cualquier imagen hasta 4x su tamaño original, reconstruyendo detalles, texturas y nitidez que no existían en la imagen baja calidad.',
    steps: [
      { icon: <Upload className="w-3.5 h-3.5" />,      title: 'Sube la imagen pequeña',   desc: 'Cualquier imagen de baja resolución o calidad degradada',    color: 'bg-emerald-500' },
      { icon: <ZoomIn className="w-3.5 h-3.5" />,      title: 'IA reconstruye detalles',  desc: 'Infiere y regenera texturas, bordes y detalles finos',       color: 'bg-green-500'   },
      { icon: <Maximize2 className="w-3.5 h-3.5" />,   title: 'Imagen en alta res',       desc: 'Hasta 4× más grande, lista para imprimir o publicar',       color: 'bg-teal-500'    },
    ],
    useCases: ['Recuperar fotos antiguas', 'Mejorar capturas de pantalla', 'Preparar para imprimir', 'Mejorar fotos de producto', 'Restaurar imágenes', 'Agrandar thumbnails'],
    tip: 'Funciona mejor con contenido reconocible (caras, productos, textos). Imágenes abstractas o muy borrosas tienen resultados más impredecibles.',
  },
};

// ── Tool guide component (floating panel) ─────────────────────────────────────

function ToolGuide({ feature, onClose }: { feature: AIFeature; onClose: () => void }) {
  const guide = GUIDES[feature.id];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-gray-100 dark:border-white/[0.07] sticky top-0 bg-white dark:bg-[#111118] rounded-t-2xl z-10">
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
            <Lightbulb className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800 dark:text-white/80 leading-none">Cómo funciona</p>
            <p className="text-[10px] text-gray-400 dark:text-white/30 mt-0.5">{feature.label}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-lg text-gray-300 dark:text-white/20 hover:bg-gray-100 dark:hover:bg-white/[0.07] hover:text-gray-500 dark:hover:text-white/50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">

        {/* description */}
        <p className="text-xs text-gray-500 dark:text-white/40 leading-relaxed">
          {guide.description}
        </p>

        {/* step flow */}
        <div className="flex items-stretch gap-1.5">
          {guide.steps.map((step, i) => (
            <React.Fragment key={i}>
              <div className="flex-1 flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] text-center">
                <div className={`w-7 h-7 rounded-lg ${step.color} flex items-center justify-center text-white shrink-0`}>
                  {step.icon}
                </div>
                <p className="text-[10px] font-bold text-gray-700 dark:text-white/60 leading-tight">{step.title}</p>
                <p className="text-[9px] text-gray-400 dark:text-white/25 leading-tight">{step.desc}</p>
              </div>
              {i < 2 && (
                <div className="flex items-center self-center shrink-0">
                  <ArrowRight className="w-3 h-3 text-gray-200 dark:text-white/10" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* use case chips */}
        <div>
          <p className="text-[10px] font-bold text-gray-400 dark:text-white/25 uppercase tracking-widest mb-2">Úsalo para</p>
          <div className="flex flex-wrap gap-1.5">
            {guide.useCases.map(uc => (
              <span key={uc} className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-gray-100 dark:border-white/[0.06] text-gray-500 dark:text-white/35">
                {uc}
              </span>
            ))}
          </div>
        </div>

        {/* pro tip */}
        <div className="flex gap-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/[0.07] border border-amber-100 dark:border-amber-500/20 p-3">
          <span className="text-sm shrink-0">💡</span>
          <p className="text-[11px] text-amber-700 dark:text-amber-400/80 leading-relaxed">
            <strong className="font-bold">Pro tip:</strong> {guide.tip}
          </p>
        </div>

      </div>
    </div>
  );
}

// ── Generation panel (split layout) ───────────────────────────────────────────

function GenerationPanel({ feature }: { feature: AIFeature }) {
  const [prompt, setPrompt] = useState('');
  const [imagePreview, setImagePreview] = useState<string | undefined>();
  const [facePreview, setFacePreview] = useState<string | undefined>();
  const [videoPreview, setVideoPreview] = useState<string | undefined>();
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  const PLACEHOLDER = 'https://images.unsplash.com/photo-1614729375290-b1b9e37e5f88?w=512&q=80';

  const handleGenerate = async () => {
    setGenerating(true); setResult(null); setProgress(0);
    for (let i = 0; i <= 100; i += 3) {
      await new Promise(r => setTimeout(r, 70));
      setProgress(i);
    }
    setResult(PLACEHOLDER); setGenerating(false);
  };

  const needsPrompt = feature.inputs.includes('prompt');
  const needsImage  = feature.inputs.includes('image');
  const needsVideo  = feature.inputs.includes('video');
  const needsFace   = feature.inputs.includes('face-image');
  const canGen = (!needsPrompt || feature.id === 'upscale' || prompt.trim().length > 0)
    && (!needsImage || !!imagePreview) && (!needsFace || !!facePreview) && (!needsVideo || !!videoPreview);
  const STYLES = ['Fotorrealista', 'Anime', 'Acuarela', 'Cyberpunk', 'Minimalista', '3D Render'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full"
    >
      {/* ── LEFT: inputs ── */}
      <div className="flex flex-col gap-4">
        {needsFace && (
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-white/30 mb-2">Foto del rostro</p>
            <FileDropzone label="Arrastra o sube una foto del rostro" accept="image/*"
              preview={facePreview} onFile={(_, url) => setFacePreview(url)} onClear={() => setFacePreview(undefined)} />
          </div>
        )}
        {needsImage && (
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-white/30 mb-2">{needsFace ? 'Imagen destino' : 'Imagen de entrada'}</p>
            <FileDropzone label="Arrastra o sube una imagen" accept="image/*"
              preview={imagePreview} onFile={(_, url) => setImagePreview(url)} onClear={() => setImagePreview(undefined)} />
          </div>
        )}
        {needsVideo && (
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-white/30 mb-2">Video de entrada</p>
            <FileDropzone label="Arrastra o sube un video" accept="video/*"
              preview={videoPreview} onFile={(_, url) => setVideoPreview(url)} onClear={() => setVideoPreview(undefined)} />
          </div>
        )}
        {needsPrompt && feature.id !== 'upscale' && (
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-white/30 mb-2">Prompt</p>
            <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
              placeholder="Describe con detalle lo que quieres generar..." rows={4}
              className="w-full resize-none rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.03] text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/15 px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#6850E8]/25 transition-all" />
          </div>
        )}
        {['text-to-image', 'image-to-image', 'photo-variations'].includes(feature.id) && (
          <div>
            <p className="text-xs font-semibold text-gray-400 dark:text-white/30 mb-2">Estilo visual</p>
            <div className="flex gap-2 flex-wrap">
              {STYLES.map(s => (
                <motion.button key={s} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedStyle(selectedStyle === s ? null : s)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedStyle === s
                      ? `bg-gradient-to-r ${feature.color} text-white shadow-sm`
                      : 'border border-gray-100 dark:border-white/[0.07] text-gray-500 dark:text-white/35 hover:border-[#6850E8]/30'
                  }`}>{s}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Generate button */}
        <div className="mt-auto pt-2">
          <motion.button
            onClick={handleGenerate}
            disabled={!canGen || generating}
            whileHover={canGen && !generating ? { scale: 1.02, y: -1 } : {}}
            whileTap={canGen && !generating ? { scale: 0.98 } : {}}
            className={`relative w-full overflow-hidden flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
              canGen && !generating
                ? `bg-gradient-to-r ${feature.color} text-white shadow-lg`
                : 'bg-gray-100 dark:bg-white/[0.04] text-gray-300 dark:text-white/15 cursor-not-allowed'
            }`}
            style={canGen ? { boxShadow: `0 8px 24px ${feature.from}50` } : {}}
          >
            {canGen && !generating && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                animate={{ x: ['-200%', '200%'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1 }}
              />
            )}
            {generating
              ? <><RefreshCw className="w-4 h-4 animate-spin" />Generando...</>
              : <><Sparkles className="w-4 h-4" />Generar ahora</>
            }
          </motion.button>
          <AnimatePresence>
            {generating && (
              <motion.div initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} exit={{ opacity: 0 }}
                style={{ originX: 0 }}
                className="mt-2 rounded-full bg-gray-100 dark:bg-white/[0.05] h-1 overflow-hidden">
                <motion.div className={`h-full rounded-full bg-gradient-to-r ${feature.color}`}
                  animate={{ width: `${progress}%` }} transition={{ ease: 'linear' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── RIGHT: output / preview ── */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold text-gray-400 dark:text-white/30">Resultado</p>
        <div className="flex-1 rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden relative min-h-[280px]">
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="absolute inset-0 flex flex-col"
              >
                <div className="relative flex-1 overflow-hidden">
                  <img src={result} alt="" className="w-full h-full object-cover" />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-lg"
                  >
                    <Check className="w-3 h-3" /> Listo
                  </motion.div>
                </div>
                <div className="flex gap-2 p-3 bg-white dark:bg-[#111118] border-t border-gray-50 dark:border-white/[0.04]">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#6850E8] text-white text-xs font-semibold hover:bg-[#5940d8] transition-colors">
                    <Download className="w-3.5 h-3.5" /> Descargar
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setResult(null)}
                    className="py-2.5 px-4 rounded-xl border border-gray-100 dark:border-white/[0.06] text-xs font-medium text-gray-500 dark:text-white/35 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-colors">
                    Nueva
                  </motion.button>
                </div>
              </motion.div>
            ) : generating ? (
              <motion.div
                key="generating"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6"
              >
                {/* Animated generation preview */}
                <div className="relative w-20 h-20">
                  <motion.div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-20`}
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <div className={`absolute inset-2 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white`}>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                      <Sparkles className="w-7 h-7" />
                    </motion.div>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-700 dark:text-white/70">Generando tu {feature.label}…</p>
                  <p className="text-xs text-gray-400 dark:text-white/30 mt-1">{Math.round(progress)}% completado</p>
                </div>
                {/* Scanning lines effect */}
                <div className="w-full max-w-[180px] h-1 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full bg-gradient-to-r ${feature.color}`}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: 'linear' }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6"
              >
                {/* Placeholder grid pattern */}
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                  style={{
                    backgroundImage: 'linear-gradient(#6850E8 1px, transparent 1px), linear-gradient(90deg, #6850E8 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />
                <motion.div
                  className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} opacity-15 flex items-center justify-center`}
                  animate={{ scale: [1, 1.05, 1], opacity: [0.15, 0.22, 0.15] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color}`} style={{ opacity: 0.15 }} />
                </motion.div>
                <div className="relative text-center">
                  <p className="text-sm font-semibold text-gray-400 dark:text-white/30">Tu resultado aparecerá aquí</p>
                  <p className="text-xs text-gray-300 dark:text-white/20 mt-1">
                    Configura los parámetros y presiona <span className="font-semibold">Generar ahora</span>
                  </p>
                </div>
                {/* Dashed frame corners */}
                {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos, i) => (
                  <div key={i} className={`absolute ${pos} w-5 h-5 border-[#6850E8]/20`}
                    style={{
                      borderTop: i < 2 ? '2px solid' : 'none',
                      borderBottom: i >= 2 ? '2px solid' : 'none',
                      borderLeft: i % 2 === 0 ? '2px solid' : 'none',
                      borderRight: i % 2 === 1 ? '2px solid' : 'none',
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ── Chat panel ─────────────────────────────────────────────────────────────────

function ChatPanel({ messages, onSend, loading }: {
  messages: ChatMsg[]; onSend: (t: string) => void; loading: boolean;
}) {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = () => { if (!input.trim() || loading) return; onSend(input); setInput(''); };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-y-auto py-4 px-1 [&::-webkit-scrollbar]:w-0">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.05 }}
                    className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-violet-500/30"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </motion.div>
                )}
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-[#6850E8] to-indigo-600 text-white rounded-tr-sm shadow-md shadow-[#6850E8]/25'
                    : 'bg-gray-100 dark:bg-white/[0.06] text-gray-800 dark:text-white/80 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-500/30">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </motion.div>
              </div>
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-2xl rounded-tl-sm px-4 py-3.5">
                {[0, 1, 2].map(i => (
                  <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-white/40"
                    animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="flex-shrink-0 mt-3">
        <motion.div
          animate={focused ? { boxShadow: '0 0 0 2px rgba(104,80,232,0.25)' } : { boxShadow: '0 0 0 1px rgba(0,0,0,0.04)' }}
          className="flex items-end gap-2 rounded-2xl border border-gray-100 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-2 transition-colors"
        >
          <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-300 dark:text-white/20 hover:bg-gray-100 dark:hover:bg-white/[0.05] hover:text-gray-500 transition-colors flex-shrink-0">
            <Paperclip className="w-4 h-4" />
          </motion.button>
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            placeholder="Escribe tu mensaje..." rows={1}
            className="flex-1 resize-none bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-300 dark:placeholder-white/15 focus:outline-none max-h-32 py-1.5" />
          <motion.button onClick={send} disabled={!input.trim() || loading}
            whileHover={input.trim() && !loading ? { scale: 1.1 } : {}}
            whileTap={input.trim() && !loading ? { scale: 0.9 } : {}}
            className={`w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0 transition-all ${
              input.trim() && !loading
                ? 'bg-gradient-to-br from-[#6850E8] to-indigo-600 text-white shadow-md shadow-[#6850E8]/30'
                : 'bg-gray-100 dark:bg-white/[0.05] text-gray-300 dark:text-white/15 cursor-not-allowed'
            }`}>
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        </motion.div>
        <p className="text-center text-[10px] text-gray-300 dark:text-white/15 mt-2">
          La IA puede cometer errores. Verifica la información importante.
        </p>
      </div>
    </div>
  );
}

// ── Landing screen ─────────────────────────────────────────────────────────────

function LandingScreen({ onSend, onSelectFeature }: {
  onSend: (t: string) => void; onSelectFeature: (id: FeatureId) => void;
}) {
  const [input, setInput] = useState('');
  const submit = useCallback(() => { if (!input.trim()) return; onSend(input); setInput(''); }, [input, onSend]);
  const nonChat = FEATURES.filter(f => f.id !== 'chat');

  return (
    <div className="relative flex flex-col items-center gap-8 py-8 px-2 min-h-[70vh] justify-center">
      <AuroraBackground />
      <FloatingSparkles />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#6850E8]/25 bg-[#6850E8]/10 backdrop-blur-sm"
      >
        <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}>
          <Sparkles className="w-3.5 h-3.5 text-[#6850E8]" />
        </motion.span>
        <span className="text-xs font-bold text-[#6850E8] tracking-wide">Studio AI</span>
      </motion.div>

      {/* Heading */}
      <div className="relative z-10 text-center">
        <AnimatedHeading />
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          className="text-sm text-gray-400 dark:text-white/30 mt-3 max-w-sm mx-auto"
        >
          Chat inteligente, imágenes, videos, deepfakes y más en un solo lugar.
        </motion.p>
      </div>

      {/* Input */}
      <motion.div
        className="relative z-10 w-full max-w-2xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <GlowInput value={input} onChange={setInput} onSubmit={submit} placeholder="Pregunta algo o describe lo que quieres crear..." />

        {/* Suggestion chips */}
        <motion.div
          className="flex flex-wrap gap-2 mt-3 justify-center"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.06, delayChildren: 0.6 } } }}
        >
          {SUGGESTIONS.map(s => (
            <motion.button
              key={s.label}
              variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSend(s.label)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gray-100 dark:border-white/[0.07] bg-white/70 dark:bg-white/[0.03] backdrop-blur-sm text-xs text-gray-500 dark:text-white/35 hover:border-[#6850E8]/30 hover:text-[#6850E8] transition-all"
            >
              <span>{s.icon}</span>{s.label}
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Feature grid */}
      <div className="relative z-10 w-full max-w-2xl">
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
          className="text-[10px] font-bold text-gray-400 dark:text-white/20 uppercase tracking-wider mb-3 text-center"
        >
          Modos de generación IA
        </motion.p>
        <motion.div
          className="grid grid-cols-3 sm:grid-cols-5 gap-2.5"
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.05, delayChildren: 0.75 } } }}
        >
          {nonChat.map(f => (
            <motion.div
              key={f.id}
              variants={{ hidden: { opacity: 0, y: 16, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1 } }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
            >
              <FeatureCard feature={f} onClick={() => onSelectFeature(f.id)} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function StudioAIPage() {
  const [view, setView] = useState<'landing' | 'chat' | 'generation'>('landing');
  const [activeFeature, setActiveFeature] = useState<FeatureId>('chat');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const feature = FEATURES.find(f => f.id === activeFeature)!;

  const sendChatMessage = useCallback(async (text: string) => {
    setView('chat');
    setActiveFeature('chat');
    const userMsg: ChatMsg = { id: Date.now().toString(), role: 'user', text };
    setMessages(m => [...m, userMsg]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 850));
    const lower = text.toLowerCase();
    const reply = Object.entries(SAMPLE).find(([k]) => k !== 'default' && lower.includes(k))?.[1] ?? SAMPLE.default;
    setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: 'assistant', text: reply }]);
    setLoading(false);
  }, []);

  const selectFeature = useCallback((id: FeatureId) => {
    setActiveFeature(id);
    setView(id === 'chat' ? 'chat' : 'generation');
    setShowGuide(true);
  }, []);

  return (
    <div className={`w-full flex flex-col gap-0 ${view !== 'landing' ? 'h-full' : ''}`}>
      <AnimatePresence mode="wait" initial={false}>
        {view === 'landing' ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(6px)' }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="w-full"
          >
            <LandingScreen onSend={sendChatMessage} onSelectFeature={selectFeature} />
          </motion.div>
        ) : (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 min-h-0 flex flex-col gap-4"
          >
            {/* Top bar */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <motion.button
                onClick={() => setView('landing')}
                whileHover={{ scale: 1.08, x: -1 }}
                whileTap={{ scale: 0.94 }}
                className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#111118] text-gray-400 dark:text-white/30 shadow-sm hover:border-gray-200 dark:hover:border-white/[0.1] hover:text-gray-700 dark:hover:text-white/60 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>

              <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden flex-1">
                {FEATURES.map(f => (
                  <motion.button
                    key={f.id}
                    onClick={() => selectFeature(f.id)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className={`relative flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors overflow-hidden ${
                      activeFeature === f.id
                        ? 'border-transparent text-white shadow-md'
                        : 'bg-white dark:bg-[#111118] border-gray-100 dark:border-white/[0.06] text-gray-500 dark:text-white/40 hover:border-gray-200 dark:hover:border-white/[0.1]'
                    }`}
                    style={activeFeature === f.id ? { boxShadow: `0 4px 16px ${f.from}50` } : {}}
                  >
                    {activeFeature === f.id && (
                      <motion.div
                        layoutId="tab-bg"
                        className={`absolute inset-0 bg-gradient-to-r ${f.color}`}
                        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                      />
                    )}
                    <span className="relative z-10">{f.icon}</span>
                    <span className="relative z-10">{f.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Panel card wrapper — relative so floating guide is positioned inside */}
            <div className="relative flex-1 min-h-0">

            <motion.div
              className="h-full rounded-2xl border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#111118] shadow-sm overflow-hidden flex flex-col"
              style={{ boxShadow: `0 0 0 1px ${feature.from}15, 0 4px 24px ${feature.from}08` }}
            >
              {/* Panel header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50 dark:border-white/[0.04] flex-shrink-0">
                <motion.div
                  key={activeFeature}
                  initial={{ scale: 0.7, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className={`w-8 h-8 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white shadow-sm`}
                  style={{ boxShadow: `0 4px 12px ${feature.from}40` }}
                >
                  {feature.icon}
                </motion.div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{feature.label}</p>
                  <p className="text-xs text-gray-400 dark:text-white/25">{feature.sublabel}</p>
                </div>
                {view === 'generation' && (
                  <motion.span
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-[#6850E8] bg-[#6850E8]/10 px-2.5 py-1 rounded-full"
                  >
                    <Sparkles className="w-3 h-3" /> Powered by AI
                  </motion.span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-h-0 overflow-y-auto p-5 [&::-webkit-scrollbar]:w-0">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature + view}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="h-full"
                  >
                    {view === 'chat' ? (
                      <ChatPanel messages={messages} onSend={sendChatMessage} loading={loading} />
                    ) : (
                      <GenerationPanel feature={feature} />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>

              {/* ── Floating guide panel ── */}
              <AnimatePresence>
                {showGuide && view === 'generation' && (
                  <motion.div
                    initial={{ opacity: 0, y: 16, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                    className="absolute right-4 bottom-16 z-30 w-[320px] max-h-[72vh] overflow-y-auto [&::-webkit-scrollbar]:w-0 rounded-2xl border border-gray-100 dark:border-white/[0.10] bg-white dark:bg-[#111118] shadow-2xl shadow-black/20 dark:shadow-black/50"
                  >
                    <ToolGuide feature={feature} onClose={() => setShowGuide(false)} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── ? toggle button ── */}
              {view === 'generation' && (
                <motion.button
                  onClick={() => setShowGuide(s => !s)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className={`absolute right-4 bottom-4 z-30 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
                    showGuide
                      ? `bg-gradient-to-br ${feature.color} text-white`
                      : 'bg-white dark:bg-[#1a1a25] border border-gray-100 dark:border-white/[0.12] text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/60'
                  }`}
                  style={showGuide ? { boxShadow: `0 6px 20px ${feature.from}55` } : {}}
                  title={showGuide ? 'Cerrar guía' : 'Ver cómo funciona'}
                >
                  <HelpCircle className="w-5 h-5" />
                </motion.button>
              )}

            </div>{/* end panel card wrapper */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
