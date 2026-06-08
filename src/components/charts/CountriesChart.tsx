import { useState } from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useMousePosition } from '../../hooks/useMousePosition';

type CountryData = { name: string; flag: string; clients: number; percentage: number; color: string; mapName: string };

const ACCENT = '#6850E8';

const countriesData: CountryData[] = [
  { name: 'USA',       flag: '🇺🇸', clients: 1240, percentage: 80,  color: '#6850E8', mapName: 'United States of America' },
  { name: 'Japón',     flag: '🇯🇵', clients: 940,  percentage: 60,  color: '#3B82F6', mapName: 'Japan'   },
  { name: 'Francia',   flag: '🇫🇷', clients: 760,  percentage: 49,  color: '#10B981', mapName: 'France'  },
  { name: 'Alemania',  flag: '🇩🇪', clients: 1240, percentage: 100, color: '#F59E0B', mapName: 'Germany' },
];

const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const highlightMap: Record<string, CountryData> = {};
countriesData.forEach((c) => { highlightMap[c.mapName] = c; });

export default function CountriesChart() {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);
  const [year, setYear] = useState('2025');
  const isDark = useDarkMode();
  const { mousePosition } = useMousePosition();

  const mapBg    = isDark ? '#1a1a26' : '#f8fafc';
  const mapOther = isDark ? '#1e1e2e' : '#e2e8f0';
  const mapBorder = isDark ? '#2a2a3a' : '#ffffff';

  const hoveredData = hoveredCountry ? highlightMap[hoveredCountry] : null;

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white border border-gray-100 shadow-sm dark:bg-[#111118] dark:border-white/[0.06] overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-white/40 mb-1">
            Países alcanzados
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white/90">
            {countriesData.length}
            <span className="text-sm font-normal text-gray-400 dark:text-white/35 ml-1">países</span>
          </p>
        </div>
        <div className="flex gap-1 rounded-xl p-1 bg-gray-50 dark:bg-white/[0.04]">
          {['2025', '2024', '2023'].map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={[
                'px-2.5 py-0.5 rounded-lg text-xs font-semibold transition-all',
                year === y
                  ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-400 dark:text-white/35',
              ].join(' ')}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div
        className="relative mx-5 rounded-xl overflow-hidden flex-shrink-0"
        style={{ height: 200, background: mapBg }}
      >
        <ComposableMap
          projection="geoEqualEarth"
          className="w-full h-full"
          projectionConfig={{ scale: 200, center: [0, 10] }}
        >
          <ZoomableGroup center={[0, 10]} zoom={1}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name = geo.properties.name;
                  const cData = highlightMap[name];
                  const isHovered = hoveredCountry === name;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => setHoveredCountry(name)}
                      onMouseLeave={() => setHoveredCountry(null)}
                      style={{
                        default: {
                          fill: cData ? (isHovered ? cData.color : `${cData.color}cc`) : mapOther,
                          stroke: mapBorder,
                          strokeWidth: 0.5,
                          outline: 'none',
                          transition: 'fill 0.15s ease',
                        },
                        hover: {
                          fill: cData ? cData.color : isDark ? '#2a2a3a' : '#cbd5e1',
                          stroke: mapBorder,
                          strokeWidth: 0.5,
                          outline: 'none',
                        },
                        pressed: { fill: cData ? cData.color : mapOther, outline: 'none' },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>

        {/* Legend overlay */}
        <div className="absolute bottom-2 left-2 flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-lg px-2 py-1" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}>
            <span className="w-2 h-2 rounded-sm" style={{ background: ACCENT }} />
            <span className="text-[10px] text-white/70 font-medium">Alcanzados</span>
          </div>
        </div>

        {/* Tooltip */}
        {hoveredCountry && (
          <div
            className="fixed z-50 pointer-events-none rounded-xl shadow-xl px-3 py-2.5 text-sm"
            style={{
              left: mousePosition.x + 14,
              top: mousePosition.y - 40,
              background: isDark ? '#1a1a26' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'}`,
            }}
          >
            <p className="font-semibold text-gray-900 dark:text-white/90">
              {hoveredData?.flag} {hoveredData?.name ?? hoveredCountry}
            </p>
            {hoveredData && (
              <p className="text-xs text-gray-400 dark:text-white/40 mt-0.5">
                {hoveredData.clients.toLocaleString()} clientes · {hoveredData.percentage}%
              </p>
            )}
          </div>
        )}
      </div>

      {/* Country list */}
      <div className="flex-1 min-h-0 overflow-auto px-5 py-4 space-y-3">
        {countriesData.map((country) => (
          <div key={country.name} className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
              style={{ background: `${country.color}15` }}
            >
              {country.flag}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-gray-800 dark:text-white/80">{country.name}</p>
                <span className="text-xs font-bold tabular-nums" style={{ color: country.color }}>
                  {country.percentage}%
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-gray-100 dark:bg-white/[0.05] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${country.percentage}%`, background: country.color }}
                />
              </div>
              <p className="text-[10px] text-gray-400 dark:text-white/30 mt-0.5">
                {country.clients.toLocaleString()} clientes
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
