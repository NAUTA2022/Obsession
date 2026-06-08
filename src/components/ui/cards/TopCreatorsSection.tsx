import { cn } from "../../../utils/cn";
import { Trophy } from "lucide-react";

type Creator = {
  id: string | number;
  rank: number;
  avatar: string;
  name: string;
};

type TopCreatorsSectionProps = {
  title?: string;
  creators: Creator[];
  onViewProfile?: (creatorId: string | number) => void;
  className?: string;
};

// Medallas para el podio (1-3); el resto en morado suave.
const rankStyles: Record<number, string> = {
  1: 'bg-gradient-to-br from-amber-300 to-yellow-500 text-white shadow-[0_4px_12px_-2px_rgba(245,158,11,0.6)]',
  2: 'bg-gradient-to-br from-slate-300 to-slate-400 text-white',
  3: 'bg-gradient-to-br from-orange-300 to-amber-600 text-white',
};

export default function TopCreatorsSection({
  title = "Top creadoras",
  creators,
  onViewProfile,
  className,
}: TopCreatorsSectionProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-gray-900',
        className,
      )}
    >
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-400/10 text-primary-600 ring-1 ring-primary-500/25 dark:text-primary-300">
          <Trophy className="h-4 w-4" />
        </span>
        <h3 className="font-display text-base font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
      </div>
      <div className="space-y-0.5">
        {creators.map((creator) => (
          <div
            key={creator.id}
            className="group flex items-center justify-between rounded-xl p-1.5 transition-colors hover:bg-primary-50/70 dark:hover:bg-white/5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[0.7rem] font-bold',
                  rankStyles[creator.rank] ??
                    'bg-primary-500/10 text-primary-600 dark:text-primary-300',
                )}
              >
                {creator.rank}
              </span>
              <img
                src={creator.avatar}
                alt={`Avatar de ${creator.name}`}
                className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white dark:ring-gray-800"
              />
              <span className="truncate text-xs font-medium text-gray-900 dark:text-gray-100">
                {creator.name}
              </span>
            </div>
            <button
              onClick={() => onViewProfile?.(creator.id)}
              className="shrink-0 rounded-full bg-primary-600 hover:bg-primary-700 px-3 py-1 text-xs font-medium text-white shadow-[0_6px_16px_-6px_rgba(104,80,232,0.7)] transition-all hover:shadow-[0_10px_22px_-6px_rgba(104,80,232,0.85)]"
            >
              Ver perfil
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
