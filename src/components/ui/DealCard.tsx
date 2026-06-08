import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { Phone, DollarSign, GripVertical, Calendar } from 'lucide-react';

export type DealStageLocal =
  | 'selection' | 'proposal' | 'negotiation'
  | 'review' | 'closing-green' | 'closing-red' | 'delivery';

export interface DealCardData {
  id: string;
  name: string;
  phone?: string;
  stage: DealStageLocal;
  value?: number;
  avatar?: string;
  tag?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface DealCardProps extends DealCardData {
  disabled?: boolean;
  isDragOverlay?: boolean;
}

const PRIORITY_COLOR: Record<string, string> = {
  low:    'bg-emerald-500/15 text-emerald-500',
  medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  high:   'bg-red-500/15 text-red-500',
};

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

export default function DealCard({
  id, name, phone, stage, value, avatar, tag, dueDate, priority,
  disabled = false, isDragOverlay = false,
}: DealCardProps) {
  const {
    attributes, listeners, setNodeRef,
    transform, transition, isDragging,
  } = useSortable({
    id,
    data: { type: 'Deal', dealId: id, stage },
    disabled,
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  // Ghost placeholder while dragging
  if (isDragging && !isDragOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="rounded-2xl border-2 border-dashed border-[#6850E8]/30 bg-[#6850E8]/[0.04] min-h-[88px]"
      />
    );
  }

  return (
    <motion.div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={isDragOverlay ? {} : style}
      {...(isDragOverlay ? {} : { ...attributes, ...listeners })}
      layout={!isDragOverlay}
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      className={`group select-none rounded-2xl bg-white dark:bg-[#18181f] border border-gray-100 dark:border-white/[0.07] p-3.5 shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-white/[0.12] transition-all cursor-grab active:cursor-grabbing ${
        isDragOverlay ? 'shadow-2xl shadow-black/20 rotate-1 scale-[1.02]' : ''
      }`}
    >
      {/* Top row: avatar + name + grip */}
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-9 h-9 rounded-xl object-cover ring-2 ring-white dark:ring-[#18181f]"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6850E8] to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
              {initials(name)}
            </div>
          )}
          {priority && (
            <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white dark:border-[#18181f] ${
              priority === 'high' ? 'bg-red-500' : priority === 'medium' ? 'bg-amber-400' : 'bg-emerald-500'
            }`} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight truncate">
            {name}
          </p>
          {phone && (
            <div className="flex items-center gap-1 mt-0.5">
              <Phone className="w-3 h-3 text-gray-300 dark:text-white/20 flex-shrink-0" />
              <p className="text-[11px] text-gray-400 dark:text-white/30 truncate">{phone}</p>
            </div>
          )}
        </div>

        {/* Drag handle */}
        <GripVertical className="w-4 h-4 text-gray-200 dark:text-white/[0.12] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
      </div>

      {/* Middle: tag */}
      {tag && (
        <div className="mt-2.5">
          <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#6850E8]/10 text-[#6850E8] dark:text-[#9277F5]">
            {tag}
          </span>
        </div>
      )}

      {/* Bottom: value + due date */}
      <div className="flex items-center justify-between gap-2 mt-2.5 pt-2.5 border-t border-gray-50 dark:border-white/[0.04]">
        {value != null ? (
          <div className="flex items-center gap-1 text-xs font-bold text-gray-700 dark:text-white/70">
            <DollarSign className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            {value.toLocaleString()}
          </div>
        ) : <div />}

        {dueDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-gray-300 dark:text-white/20" />
            <span className="text-[10px] text-gray-400 dark:text-white/30">{dueDate}</span>
          </div>
        )}

        {priority && (
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${PRIORITY_COLOR[priority]}`}>
            {priority === 'high' ? 'Alta' : priority === 'medium' ? 'Media' : 'Baja'}
          </span>
        )}
      </div>
    </motion.div>
  );
}
