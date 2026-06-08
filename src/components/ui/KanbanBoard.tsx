import { useState } from 'react';
import {
  DndContext, DragOverlay, PointerSensor, TouchSensor,
  useSensor, useSensors, closestCorners,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import KanbanColumn from './KanbanColumn';
import DealCard, { DealCardData, DealStageLocal } from './DealCard';
import toast from 'react-hot-toast';
import {
  Search, Send, ArrowLeftRight, Eye, Trophy, XCircle, PackageCheck,
} from 'lucide-react';

interface ColumnDef {
  id: DealStageLocal;
  title: string;
  icon: React.ReactNode;
  iconColor: string;
  accent: string;
  accentLight: string;
}

const COLUMNS: ColumnDef[] = [
  { id: 'selection',     title: 'Selección',             icon: <Search className="w-3.5 h-3.5" />,        iconColor: 'text-slate-400    bg-slate-400/10',   accent: 'bg-slate-400',    accentLight: 'bg-slate-500/[0.05]'  },
  { id: 'proposal',      title: 'Propuesta enviada',     icon: <Send className="w-3.5 h-3.5" />,          iconColor: 'text-blue-400     bg-blue-400/10',    accent: 'bg-blue-400',     accentLight: 'bg-blue-500/[0.05]'   },
  { id: 'negotiation',   title: 'En negociación',        icon: <ArrowLeftRight className="w-3.5 h-3.5" />,iconColor: 'text-amber-400    bg-amber-400/10',   accent: 'bg-amber-400',    accentLight: 'bg-amber-500/[0.05]'  },
  { id: 'review',        title: 'Revisión cliente',      icon: <Eye className="w-3.5 h-3.5" />,           iconColor: 'text-violet-400   bg-violet-400/10',  accent: 'bg-violet-400',   accentLight: 'bg-violet-500/[0.05]' },
  { id: 'closing-green', title: 'Cierre exitoso',        icon: <Trophy className="w-3.5 h-3.5" />,        iconColor: 'text-emerald-500  bg-emerald-500/10', accent: 'bg-emerald-500',  accentLight: 'bg-emerald-500/[0.05]'},
  { id: 'closing-red',   title: 'Trato perdido',         icon: <XCircle className="w-3.5 h-3.5" />,       iconColor: 'text-red-400      bg-red-400/10',     accent: 'bg-red-400',      accentLight: 'bg-red-500/[0.05]'    },
  { id: 'delivery',      title: 'Entrega & seguimiento', icon: <PackageCheck className="w-3.5 h-3.5" />,  iconColor: 'text-indigo-400   bg-indigo-400/10',  accent: 'bg-indigo-400',   accentLight: 'bg-indigo-500/[0.05]' },
];

interface KanbanBoardProps {
  deals: DealCardData[];
  onDealsChange?: (deals: DealCardData[]) => void;
}

export default function KanbanBoard({ deals, onDealsChange }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  // Group deals by stage
  const byStage: Record<string, DealCardData[]> = {};
  COLUMNS.forEach(c => { byStage[c.id] = []; });
  deals.forEach(d => { if (byStage[d.stage]) byStage[d.stage].push(d); });

  const activeDeal = deals.find(d => d.id === activeId) ?? null;

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;

    const activeId  = active.id as string;
    const overId    = over.id   as string;

    if (activeId === overId) return;

    const activeDeal = deals.find(d => d.id === activeId);
    if (!activeDeal) return;

    // Determine the target stage:
    // - If dropped on a column droppable → over.data.current.stage (the column id)
    // - If dropped on another deal card  → use that deal's stage
    const overData = over.data.current;
    let targetStage: DealStageLocal;

    if (overData?.type === 'Column') {
      targetStage = overData.stage as DealStageLocal;
    } else if (overData?.type === 'Deal') {
      targetStage = overData.stage as DealStageLocal;
    } else {
      // over.id is a column id (string match)
      const matchedCol = COLUMNS.find(c => c.id === overId);
      if (matchedCol) {
        targetStage = matchedCol.id;
      } else {
        return;
      }
    }

    if (targetStage === activeDeal.stage) {
      // Same column reorder
      const col = byStage[activeDeal.stage];
      const oldIdx = col.findIndex(d => d.id === activeId);
      const newIdx = col.findIndex(d => d.id === overId);
      if (oldIdx === -1 || newIdx === -1) return;
      const reordered = arrayMove(col, oldIdx, newIdx);
      const updated = deals.map(d => {
        const r = reordered.find(r => r.id === d.id);
        return r ?? d;
      });
      onDealsChange?.(updated);
    } else {
      // Move to different column
      const updated = deals.map(d =>
        d.id === activeId ? { ...d, stage: targetStage } : d
      );
      const colLabel = COLUMNS.find(c => c.id === targetStage)?.title ?? targetStage;
      toast.success(`Movido a "${colLabel}"`);
      onDealsChange?.(updated);
    }
  };

  const handleDragCancel = () => setActiveId(null);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-white/[0.04] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/[0.10]">
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.title}
            icon={col.icon}
            iconColor={col.iconColor}
            accent={col.accent}
            accentLight={col.accentLight}
            deals={byStage[col.id] || []}
            onAddDeal={() => toast('Usa el botón "Nuevo trato" para añadir')}
          />
        ))}
      </div>

      {/* Drag overlay — renders a floating copy of the dragged card */}
      <DragOverlay dropAnimation={{ duration: 180, easing: 'ease' }}>
        {activeDeal ? <DealCard {...activeDeal} isDragOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
