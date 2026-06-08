import { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useDarkMode } from '../../hooks/useDarkMode';

const monthlyData: Record<string, { months: string[]; revenue: number[]; target: number[] }> = {
  '2025': {
    months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    revenue: [18400, 22100, 19800, 27300, 24600, 31200, 28900, 34500, 30100, 38700, 35200, 42800],
    target:  [20000, 22000, 22000, 25000, 26000, 28000, 30000, 32000, 34000, 36000, 38000, 40000],
  },
  '2024': {
    months: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    revenue: [12800, 15300, 13900, 18700, 17200, 21400, 19600, 23800, 21500, 26900, 24400, 29700],
    target:  [14000, 15000, 16000, 18000, 19000, 21000, 22000, 24000, 25000, 27000, 28000, 30000],
  },
};

export default function RevenueChart() {
  const [year, setYear] = useState('2025');
  const isDark = useDarkMode();
  const data = monthlyData[year];

  const labelColor = isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8';
  const gridColor  = isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9';
  const tooltipBg  = isDark ? '#1a1a26' : '#ffffff';
  const tooltipText = isDark ? '#e2e8f0' : '#1e293b';

  const total = data.revenue.reduce((a, b) => a + b, 0);
  const totalFormatted = `$${(total / 1000).toFixed(1)}k`;

  const options = {
    chart: {
      type: 'area' as const,
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true, speed: 800 },
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' as const, width: [3, 2] },
    colors: ['#6850E8', '#10B981'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: [0.25, 0.12],
        opacityTo:   [0,    0],
        stops: [0, 90, 100],
      },
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 0, bottom: 0, left: 8 },
    },
    xaxis: {
      categories: data.months,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: labelColor, fontSize: '11px', fontFamily: 'inherit' } },
      crosshairs: { stroke: { color: isDark ? 'rgba(255,255,255,0.15)' : '#e2e8f0', width: 1 } },
    },
    yaxis: {
      labels: {
        style: { colors: labelColor, fontSize: '11px', fontFamily: 'inherit' },
        formatter: (v: number) => `$${(v / 1000).toFixed(0)}k`,
        offsetX: -8,
      },
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      style: { fontSize: '12px' },
      custom: ({ series, seriesIndex, dataPointIndex, w }: any) => {
        const month = w.globals.labels[dataPointIndex];
        const rev = series[0][dataPointIndex];
        const tgt = series[1][dataPointIndex];
        const diff = rev - tgt;
        const diffColor = diff >= 0 ? '#10B981' : '#EF4444';
        return `
          <div style="background:${tooltipBg};border:1px solid ${isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0'};border-radius:12px;padding:10px 14px;font-family:inherit;color:${tooltipText}">
            <div style="font-size:11px;opacity:0.5;margin-bottom:6px;font-weight:500">${month}</div>
            <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:4px">
              <span style="font-size:12px;opacity:0.6">Revenue</span>
              <span style="font-size:13px;font-weight:700;color:#6850E8">$${rev.toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:4px">
              <span style="font-size:12px;opacity:0.6">Target</span>
              <span style="font-size:13px;font-weight:600;color:#10B981">$${tgt.toLocaleString()}</span>
            </div>
            <div style="font-size:11px;color:${diffColor};font-weight:600;margin-top:4px;text-align:right">${diff >= 0 ? '+' : ''}$${diff.toLocaleString()}</div>
          </div>`;
      },
    },
    legend: { show: false },
    markers: { size: 0, hover: { size: 5 } },
  };

  const series = [
    { name: 'Revenue', data: data.revenue },
    { name: 'Target',  data: data.target  },
  ];

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white border border-gray-100 shadow-sm dark:bg-[#111118] dark:border-white/[0.06] p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-white/40 mb-1">
            Ingresos
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white/90 tabular-nums">
            {totalFormatted}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#6850E8]" />
              <span className="text-xs text-gray-400 dark:text-white/35">Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-400 dark:text-white/35">Target</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1 rounded-xl p-1 bg-gray-50 dark:bg-white/[0.04]">
          {Object.keys(monthlyData).reverse().map((y) => (
            <button
              key={y}
              onClick={() => setYear(y)}
              className={[
                'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                year === y
                  ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-400 dark:text-white/35 hover:text-gray-600 dark:hover:text-white/60',
              ].join(' ')}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 -mx-2 relative">
        <div className="absolute inset-0">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height="100%"
            key={`${isDark}-${year}`}
          />
        </div>
      </div>
    </div>
  );
}
