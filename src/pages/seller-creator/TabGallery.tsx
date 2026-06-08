import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Images, Bot, Lock, Check, Send, X,
  Play, Image as ImageIcon,
} from 'lucide-react';
import { MOCK_GALLERY, type GalleryItem } from './mockData';
import toast from 'react-hot-toast';

type Section = 'all' | 'public' | 'ai' | 'premium';

const SECTION_LABELS: Record<Section, string> = {
  all:     'Todo',
  public:  'Pública',
  ai:      'Creaciones IA',
  premium: 'Premium',
};

const TYPE_ICON = {
  photo: <ImageIcon className="w-3 h-3" />,
  video: <Play className="w-3 h-3" />,
  ai:    <Bot className="w-3 h-3" />,
};

const TYPE_COLOR = {
  photo:   'bg-white/90 text-gray-700',
  video:   'bg-rose-500 text-white',
  ai:      'bg-[#6850E8] text-white',
};

export default function TabGallery() {
  const [section, setSection]   = useState<Section>('all');
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sendOpen, setSendOpen] = useState(false);
  const [preview, setPreview]   = useState<GalleryItem | null>(null);

  const filtered = MOCK_GALLERY.filter(g => section === 'all' || g.section === section);

  const toggleSelect = (id: string) => {
    if (!multiSelect) return;
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const startMultiSelect = (id: string) => {
    setMultiSelect(true);
    setSelectedIds(new Set([id]));
  };

  const cancelMultiSelect = () => {
    setMultiSelect(false);
    setSelectedIds(new Set());
  };

  const handleSend = (contactName: string) => {
    toast.success(`${selectedIds.size} archivo(s) enviados a ${contactName}`);
    cancelMultiSelect();
    setSendOpen(false);
  };

  const contacts = ['Mariana García', 'Valentina Ríos', 'Andrea Morales', 'Camila Soto'];

  return (
    <div className="flex flex-col h-full">
      {/* Demo banner */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-400/[0.08] border border-amber-200/60 dark:border-amber-400/20 rounded-xl px-3 py-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <p className="text-[11px] text-amber-700 dark:text-amber-400/90">
            Galería de ejemplo — contenido de la creadora disponible para compartir con tus contactos
          </p>
        </div>
      </div>

      {/* Section filters */}
      <div className="flex items-center gap-1.5 px-4 pb-3 overflow-x-auto [&::-webkit-scrollbar]:h-0 shrink-0">
        {(['all', 'public', 'ai', 'premium'] as Section[]).map(s => {
          const Icon = s === 'ai' ? Bot : s === 'premium' ? Lock : Images;
          return (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                section === s
                  ? 'bg-[#6850E8] text-white'
                  : 'bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/[0.09]'
              }`}
            >
              <Icon className="w-3 h-3" />
              {SECTION_LABELS[s]}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-0.5 ${
                section === s ? 'bg-white/20' : 'bg-gray-200 dark:bg-white/[0.08]'
              }`}>
                {s === 'all' ? MOCK_GALLERY.length : MOCK_GALLERY.filter(g => g.section === s).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Multi-select toolbar */}
      <AnimatePresence>
        {multiSelect && (
          <motion.div
            initial={{ y: -8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }}
            className="flex items-center gap-3 mx-4 mb-3 px-4 py-2.5 bg-[#6850E8]/10 dark:bg-[#6850E8]/15 border border-[#6850E8]/20 rounded-2xl shrink-0"
          >
            <Check className="w-3.5 h-3.5 text-[#6850E8]" />
            <p className="text-xs font-semibold text-[#6850E8] flex-1">
              {selectedIds.size} {selectedIds.size === 1 ? 'archivo seleccionado' : 'archivos seleccionados'}
            </p>
            <button
              onClick={() => selectedIds.size > 0 ? setSendOpen(true) : null}
              disabled={selectedIds.size === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6850E8] text-white text-xs font-semibold rounded-xl hover:bg-[#5a44d4] transition-colors disabled:opacity-40"
            >
              <Send className="w-3 h-3" />
              Enviar a contacto
            </button>
            <button onClick={cancelMultiSelect} className="text-[#6850E8]/60 hover:text-[#6850E8] transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <AnimatePresence mode="popLayout">
            {filtered.map(item => {
              const isSelected = selectedIds.has(item.id);
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => multiSelect ? toggleSelect(item.id) : setPreview(item)}
                  onContextMenu={e => { e.preventDefault(); startMultiSelect(item.id); }}
                  className={`group relative rounded-2xl overflow-hidden aspect-square bg-gray-100 dark:bg-white/[0.04] cursor-pointer ring-2 transition-all ${
                    isSelected ? 'ring-[#6850E8] scale-[0.97]' : 'ring-transparent'
                  }`}
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  {/* Type badge */}
                  <div className={`absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${TYPE_COLOR[item.type]}`}>
                    {TYPE_ICON[item.type]}
                    {item.type === 'ai' ? 'IA' : item.type === 'video' ? 'Video' : 'Foto'}
                  </div>

                  {/* Premium lock */}
                  {item.section === 'premium' && !isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Lock className="w-3 h-3 text-white" />
                    </div>
                  )}

                  {/* Selection check */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-2 right-2 w-6 h-6 bg-[#6850E8] rounded-full flex items-center justify-center ring-2 ring-white"
                      >
                        <Check className="w-3 h-3 text-white" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Bottom title on hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-[11px] text-white font-medium truncate flex-1">{item.title}</p>
                      {!multiSelect && (
                        <button
                          onClick={e => { e.stopPropagation(); startMultiSelect(item.id); }}
                          className="text-[10px] text-white/80 bg-black/40 px-1.5 py-0.5 rounded-full whitespace-nowrap"
                        >
                          Seleccionar
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Images className="w-8 h-8 text-gray-200 dark:text-white/10 mb-3" />
            <p className="text-sm text-gray-400 dark:text-white/30">Sin contenido en esta sección</p>
          </div>
        )}
      </div>

      {/* Send-to-contact modal */}
      <AnimatePresence>
        {sendOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setSendOpen(false)}
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 24, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-[#1A1A2E] rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-5 pt-5 pb-3 border-b border-gray-100 dark:border-white/[0.06]">
                <p className="text-sm font-bold text-gray-900 dark:text-white/90">Enviar a contacto</p>
                <p className="text-xs text-gray-400 dark:text-white/30 mt-0.5">
                  {selectedIds.size} archivo(s) seleccionados
                </p>
              </div>
              <ul className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {contacts.map(name => (
                  <li key={name}>
                    <button
                      onClick={() => handleSend(name)}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 dark:text-white/70 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{name[0]}</span>
                      </div>
                      {name}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="px-5 py-4">
                <button
                  onClick={() => setSendOpen(false)}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-white/[0.06] text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/[0.10] transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative max-w-lg w-full"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={preview.url}
                alt={preview.title}
                className="w-full rounded-2xl object-cover max-h-[80vh]"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-2xl flex items-end justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{preview.title}</p>
                  <p className="text-xs text-white/60 capitalize">{preview.section}</p>
                </div>
                <button
                  onClick={() => { startMultiSelect(preview.id); setPreview(null); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#6850E8] text-white text-xs font-semibold rounded-xl"
                >
                  <Send className="w-3 h-3" /> Seleccionar
                </button>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
