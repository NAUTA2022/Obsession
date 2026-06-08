import { Flame } from 'lucide-react';

export type DiscoveryViewMode = 'grid' | 'swipe';

interface Props {
  mode: DiscoveryViewMode;
  onChange: (mode: DiscoveryViewMode) => void;
}

export default function DiscoveryToggle({ mode, onChange }: Props) {
  const on = mode === 'swipe';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(on ? 'grid' : 'swipe')}
      className={`group inline-flex items-center gap-2.5 rounded-xl border px-3 py-1.5 text-sm font-medium transition-all ${
        on
          ? 'border-primary-300 bg-primary-50 text-primary-700 dark:border-primary-400/40 dark:bg-primary-500/10 dark:text-primary-200'
          : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300 dark:border-white/10 dark:bg-gray-900 dark:text-gray-300'
      }`}
    >
      <Flame
        className={`h-4 w-4 transition-colors ${on ? 'text-primary-500' : 'text-gray-400 group-hover:text-primary-400'}`}
      />
      Descubrir
      {/* Track */}
      <span
        className={`relative ml-0.5 inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          on ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        {/* Knob */}
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
            on ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
}
