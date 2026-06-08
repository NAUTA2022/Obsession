import { Construction } from 'lucide-react';

interface ComingSoonProps {
  title?: string;
  description?: string;
}

/**
 * Placeholder para rutas de la nueva arquitectura cuyo módulo aún no se
 * implementa. Mantiene la estructura navegable (sidebar + guards verificables)
 * sin construir la funcionalidad todavía.
 */
export default function ComingSoon({ title = 'Próximamente', description }: ComingSoonProps) {
  return (
    <div className="flex h-full min-h-[60vh] flex-col items-center justify-center text-center px-4 sm:px-6">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800">
        <Construction className="h-8 w-8" />
      </div>
      <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
        {description ?? 'Este módulo está en construcción. La estructura ya existe y la funcionalidad llegará pronto.'}
      </p>
    </div>
  );
}
