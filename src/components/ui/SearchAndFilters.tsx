import { Search, SlidersHorizontal, Check, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface SearchAndFiltersProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  typeFilter: string;
  locationFilter: string;
  priceFilter: string;
  savedFilter: string;
  onTypeFilterChange: (value: string) => void;
  onLocationFilterChange: (value: string) => void;
  onPriceFilterChange: (value: string) => void;
  onSavedFilterChange: (value: string) => void;
}

type Option = { value: string; label: string };

const TYPE_OPTIONS: Option[] = [
  { value: 'lifestyle', label: 'Lifestyle' },
  { value: 'fashion', label: 'Moda' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'art', label: 'Arte' },
  { value: 'wellness', label: 'Bienestar' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'coaching', label: 'Coaching' },
];

const LOCATION_OPTIONS: Option[] = [
  { value: 'mexico', label: 'México' },
  { value: 'colombia', label: 'Colombia' },
  { value: 'argentina', label: 'Argentina' },
  { value: 'spain', label: 'España' },
  { value: 'chile', label: 'Chile' },
  { value: 'venezuela', label: 'Venezuela' },
];

const PRICE_OPTIONS: Option[] = [
  { value: '0-10',  label: '$0 – $10' },
  { value: '10-25', label: '$10 – $25' },
  { value: '25-50', label: '$25 – $50' },
  { value: '50+',   label: '$50+' },
];

const SAVED_OPTIONS: Option[] = [
  { value: 'liked',  label: 'Me gustan' },
  { value: 'passed', label: 'Descartadas' },
];

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400/80 dark:text-white/25 mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(selected ? '' : opt.value)}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                selected
                  ? 'bg-[#6850E8]/10 text-[#6850E8] dark:bg-[#6850E8]/20 dark:text-[#9277F5]'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/[0.05] dark:text-white/50 dark:hover:bg-white/[0.09]'
              }`}
            >
              {selected && <Check className="w-3 h-3" />}
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SearchAndFilters({
  searchValue,
  onSearchChange,
  onSearch,
  typeFilter,
  locationFilter,
  priceFilter,
  savedFilter,
  onTypeFilterChange,
  onLocationFilterChange,
  onPriceFilterChange,
  onSavedFilterChange,
}: SearchAndFiltersProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const activeCount = [typeFilter, locationFilter, priceFilter, savedFilter].filter(Boolean).length;

  const clearAll = () => {
    onTypeFilterChange('');
    onLocationFilterChange('');
    onPriceFilterChange('');
    onSavedFilterChange('');
  };

  // Close on outside click
  useEffect(() => {
    if (!filtersOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setFiltersOpen(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [filtersOpen]);

  return (
    <div className="mb-6 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 transition-shadow placeholder:text-gray-400 focus:border-[#6850E8]/40 focus:outline-none focus:ring-4 focus:ring-[#6850E8]/10 dark:border-white/10 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-[#6850E8]/30"
          />
        </div>

        {/* Search button */}
        <button
          onClick={onSearch}
          className="flex shrink-0 items-center justify-center rounded-xl bg-[#6850E8] hover:bg-[#5940d8] p-2.5 text-white shadow-[0_8px_20px_-8px_rgba(104,80,232,0.7)] transition-all"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Filtros button */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
              activeCount > 0 || filtersOpen
                ? 'border-[#6850E8]/30 bg-[#6850E8]/8 text-[#6850E8] dark:border-[#6850E8]/30 dark:bg-[#6850E8]/12 dark:text-[#9277F5]'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 dark:border-white/10 dark:bg-gray-900 dark:text-gray-300'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filtros</span>
            {activeCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#6850E8] text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>

          {/* Filter panel */}
          {filtersOpen && (
            <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-[0_20px_50px_-16px_rgba(2,6,23,0.25)] dark:border-white/[0.07] dark:bg-[#111118]">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-900 dark:text-white/90">Filtros</p>
                {activeCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 dark:text-red-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                    Limpiar
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <ChipGroup
                  label="Tipo de contenido"
                  options={TYPE_OPTIONS}
                  value={typeFilter}
                  onChange={onTypeFilterChange}
                />
                <ChipGroup
                  label="Ubicación"
                  options={LOCATION_OPTIONS}
                  value={locationFilter}
                  onChange={onLocationFilterChange}
                />
                <ChipGroup
                  label="Rango de precio"
                  options={PRICE_OPTIONS}
                  value={priceFilter}
                  onChange={onPriceFilterChange}
                />
                <ChipGroup
                  label="Mostrar"
                  options={SAVED_OPTIONS}
                  value={savedFilter}
                  onChange={onSavedFilterChange}
                />
              </div>

              <button
                onClick={() => { onSearch(); setFiltersOpen(false); }}
                className="mt-4 w-full rounded-xl bg-[#6850E8] hover:bg-[#5940d8] py-2 text-sm font-semibold text-white transition-colors"
              >
                Aplicar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
