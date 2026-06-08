import { Megaphone } from 'lucide-react';

export default function AdSpace() {
  return (
    <div className="group relative flex h-[380px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-primary-200 bg-gradient-to-br from-primary-50/60 to-white transition-colors hover:border-primary-300 dark:border-white/10 dark:from-white/[0.03] dark:to-transparent">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500/15 to-primary-400/10 text-primary-500 ring-1 ring-primary-500/20 transition-transform duration-300 group-hover:scale-110 dark:text-primary-300">
          <Megaphone className="h-6 w-6" />
        </span>
        <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
          Espacio para anuncios
        </span>
      </div>
    </div>
  );
}
