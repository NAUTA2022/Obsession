type StatusBadgeProps = {
  status: string;
  className?: string;
};

const STATUS_MAP: Record<string, { label: string; pill: string; dot: string }> = {
  Aprobado:  { label: 'Aprobado',  pill: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  Pendiente: { label: 'Pendiente', pill: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',         dot: 'bg-amber-400'  },
  Rechazado: { label: 'Rechazado', pill: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',                 dot: 'bg-red-500'    },
  // English fallbacks from legacy mock data
  active:    { label: 'Aprobado',  pill: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  pending:   { label: 'Pendiente', pill: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',         dot: 'bg-amber-400'  },
  inactive:  { label: 'Inactivo',  pill: 'bg-gray-50 dark:bg-white/[0.04] text-gray-500 dark:text-white/35',            dot: 'bg-gray-400'   },
};

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const s = STATUS_MAP[status] ?? { label: status, pill: 'bg-gray-50 dark:bg-white/[0.04] text-gray-500 dark:text-white/35', dot: 'bg-gray-400' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${s.pill} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`} />
      {s.label}
    </span>
  );
}
