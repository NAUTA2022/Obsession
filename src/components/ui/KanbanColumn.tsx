import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import DealCard, { DealCardData } from './DealCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  iconColor: string;    // e.g. 'text-violet-400 bg-violet-400/10'
  accent: string;       // tailwind bg color for the top strip, e.g. 'bg-violet-500'
  accentLight: string;  // subtle bg when dragging over, e.g. 'bg-violet-500/[0.05]'
  deals: DealCardData[];
  onAddDeal?: () => void;
}

export default function KanbanColumn({
  id, title, icon, iconColor, accent, accentLight, deals, onAddDeal,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { type: 'Column', stage: id },
  });

  return (
    <motion.div
      layout
      className="flex flex-col w-[272px] flex-shrink-0"
    >
      {/* Column header */}
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}>
            {icon}
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-white/75">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 dark:text-white/30 bg-gray-100 dark:bg-white/[0.06] rounded-full w-6 h-6 flex items-center justify-center">
            {deals.length}
          </span>
          <button
            onClick={onAddDeal}
            className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 dark:text-white/20 hover:bg-gray-100 dark:hover:bg-white/[0.07] hover:text-gray-500 dark:hover:text-white/50 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Accent strip */}
      <div className={`h-0.5 rounded-full mb-3 ${accent} opacity-70`} />

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-2xl border transition-all duration-200 min-h-[120px] p-2 ${
          isOver
            ? `${accentLight} border-[#6850E8]/30`
            : 'border-transparent'
        }`}
      >
        <SortableContext items={deals.map(d => d.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2.5">
            <AnimatePresence>
              {deals.map((deal) => (
                <DealCard key={deal.id} {...deal} />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>

        {/* Empty state */}
        {deals.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-8 gap-2"
          >
            <p className="text-[11px] text-gray-300 dark:text-white/20 text-center">
              Sin tratos aquí
            </p>
            <button
              onClick={onAddDeal}
              className="text-[11px] text-gray-400 dark:text-white/25 hover:text-[#6850E8] dark:hover:text-[#9277F5] transition-colors font-medium"
            >
              + Añadir trato
            </button>
          </motion.div>
        )}
      </div>

      {/* Add card button at bottom */}
      {deals.length > 0 && (
        <motion.button
          onClick={onAddDeal}
          whileHover={{ backgroundColor: 'rgba(104,80,232,0.06)' }}
          className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl text-xs text-gray-400 dark:text-white/25 hover:text-[#6850E8] dark:hover:text-[#9277F5] transition-colors w-full"
        >
          <Plus className="w-3.5 h-3.5" />
          Añadir trato
        </motion.button>
      )}
    </motion.div>
  );
}
