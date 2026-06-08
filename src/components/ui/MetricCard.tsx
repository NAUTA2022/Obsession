import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import ReactApexChart from 'react-apexcharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';

type MetricCardProps = {
  title: string;
  value: string | number;
  trend?: number;
  sparklineData?: number[];
  accentColor?: string;
  icon?: ReactNode;
  gradient?: string;
  className?: string;
};

export default function MetricCard({
  title,
  value,
  trend,
  sparklineData,
  accentColor = '#6850E8',
  icon,
  className,
}: MetricCardProps) {
  const isDark = useDarkMode();
  const isPositive = trend !== undefined && trend >= 0;

  const sparkOptions = {
    chart: {
      type: 'area' as const,
      sparkline: { enabled: true },
      background: 'transparent',
      animations: { enabled: true, speed: 600 },
    },
    stroke: { curve: 'smooth' as const, width: 2 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0,
        stops: [0, 100],
        colorStops: [
          { offset: 0, color: accentColor, opacity: 0.35 },
          { offset: 100, color: accentColor, opacity: 0 },
        ],
      },
    },
    colors: [accentColor],
    tooltip: { enabled: false },
    grid: { padding: { top: 4, bottom: 0, left: 0, right: 0 } },
  };

  return (
    <div
      className={twMerge(
        'relative flex flex-col justify-between overflow-hidden rounded-2xl p-5 h-full',
        'bg-white border border-gray-100 shadow-sm',
        'dark:bg-[#111118] dark:border-white/[0.06] dark:shadow-none',
        className
      )}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-white/40">
          {title}
        </p>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl"
               style={{ backgroundColor: `${accentColor}18` }}>
            <span style={{ color: accentColor }} className="[&>svg]:w-4 [&>svg]:h-4">{icon}</span>
          </div>
        )}
      </div>

      {/* Value */}
      <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white/90 tabular-nums">
        {value}
      </p>

      {/* Trend badge */}
      {trend !== undefined && (
        <div className="mt-2 flex items-center gap-1.5">
          <span
            className={twMerge(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold',
              isPositive
                ? 'bg-emerald-500/10 text-emerald-500'
                : 'bg-red-500/10 text-red-400'
            )}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{trend}%
          </span>
          <span className="text-xs text-gray-400 dark:text-white/30">vs mes anterior</span>
        </div>
      )}

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="mt-3 -mx-1 -mb-1">
          <ReactApexChart
            options={sparkOptions}
            series={[{ data: sparklineData }]}
            type="area"
            height={48}
            key={isDark ? 'dark' : 'light'}
          />
        </div>
      )}
    </div>
  );
}
