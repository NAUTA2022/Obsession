import { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useDarkMode } from '../../hooks/useDarkMode';

type SalesData = { vendedores: number; miClonAI: number; yo: number };
type Props = { title: string; data: SalesData; className?: string };

const ITEMS = [
  { key: 'miClonAI' as const, label: 'Mi Clon AI', color: '#6850E8' },
  { key: 'vendedores' as const, label: 'Vendedores', color: '#3B82F6' },
  { key: 'yo' as const,        label: 'Yo',          color: '#10B981' },
];

export default function SalesGaugeChart({ title, data, className }: Props) {
  const [year, setYear] = useState('2025');
  const isDark = useDarkMode();

  const total = data.miClonAI + data.vendedores + data.yo;
  const series = ITEMS.map(({ key }) => Math.round((data[key] / total) * 100));

  const trackColor = isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9';
  const labelColor = isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8';

  const options: ApexOptions = {
    chart: {
      type: 'radialBar',
      background: 'transparent',
      animations: { enabled: true, speed: 800 },
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: -120,
        endAngle: 120,
        hollow: {
          margin: 8,
          size: '52%',
          background: 'transparent',
        },
        track: {
          background: trackColor,
          strokeWidth: '100%',
          margin: 4,
        },
        dataLabels: {
          name: { show: false },
          value: { show: false },
          total: {
            show: true,
            label: 'Total',
            formatter: () => total.toString(),
            fontSize: '20px',
            fontWeight: '700',
            fontFamily: 'inherit',
            color: isDark ? 'rgba(255,255,255,0.85)' : '#1e293b',
          },
        },
      },
    },
    stroke: { lineCap: 'round' },
    colors: ITEMS.map((i) => i.color),
    labels: ITEMS.map((i) => i.label),
    legend: { show: false },
    tooltip: { enabled: false },
  };

  return (
    <div
      className={[
        'flex flex-col h-full rounded-2xl bg-white border border-gray-100 shadow-sm',
        'dark:bg-[#111118] dark:border-white/[0.06] p-5',
        className ?? '',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-white/40">
          {title}
        </p>
        <div className="flex gap-1 rounded-xl p-1 bg-gray-50 dark:bg-white/[0.04]">
          {['2025', '2024'].map((y) => (
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

      {/* Chart */}
      <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden">
        <ReactApexChart
          options={options}
          series={series}
          type="radialBar"
          height={160}
          key={isDark ? 'dark' : 'light'}
        />
      </div>

      {/* Legend */}
      <div className="space-y-2.5 mt-1">
        {ITEMS.map(({ key, label, color }) => {
          const val = data[key];
          const pct = Math.round((val / total) * 100);
          return (
            <div key={key} className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
              <span className="flex-1 text-xs text-gray-500 dark:text-white/40">{label}</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
                <span className="text-xs font-bold tabular-nums text-gray-700 dark:text-white/70 w-8 text-right">
                  {val}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
