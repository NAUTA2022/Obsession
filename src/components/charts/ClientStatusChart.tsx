import { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { useDarkMode } from '../../hooks/useDarkMode';

const weeks: Record<string, { days: string[]; exitoso: number[]; pendiente: number[]; perdido: number[] }> = {
  'Esta semana': {
    days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    exitoso:   [80, 128, 100, 123, 17, 125, 90],
    pendiente: [122, 55, 20, 45, 11, 50, 33],
    perdido:   [15, 40, 15, 30, 9, 35, 22],
  },
  'Semana pasada': {
    days: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    exitoso:   [60, 95, 88, 110, 42, 98, 75],
    pendiente: [88, 70, 35, 55, 28, 62, 44],
    perdido:   [22, 18, 25, 12, 30, 8, 18],
  },
};

const COLORS = { exitoso: '#10B981', pendiente: '#6850E8', perdido: '#EF4444' };

export default function ClientStatusChart() {
  const [period, setPeriod] = useState('Esta semana');
  const isDark = useDarkMode();
  const data = weeks[period];

  const labelColor = isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8';
  const gridColor  = isDark ? 'rgba(255,255,255,0.04)' : '#f1f5f9';
  const tooltipBg  = isDark ? '#1a1a26' : '#ffffff';

  const options = {
    chart: {
      type: 'area' as const,
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { speed: 700 },
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth' as const, width: 2.5 },
    colors: [COLORS.exitoso, COLORS.pendiente, COLORS.perdido],
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: [0.22, 0.15, 0.1],
        opacityTo:   [0,    0,    0],
        stops: [0, 90],
      },
    },
    grid: {
      borderColor: gridColor,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: { top: 0, right: 4, bottom: 0, left: 4 },
    },
    xaxis: {
      categories: data.days,
      axisBorder: { show: false },
      axisTicks:  { show: false },
      labels: { style: { colors: labelColor, fontSize: '11px', fontFamily: 'inherit' } },
    },
    yaxis: {
      labels: {
        style: { colors: labelColor, fontSize: '11px', fontFamily: 'inherit' },
        offsetX: -6,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      custom: ({ series, dataPointIndex, w }: any) => {
        const day = w.globals.labels[dataPointIndex];
        const items = [
          { label: 'Exitoso',   color: COLORS.exitoso,   v: series[0][dataPointIndex] },
          { label: 'Pendiente', color: COLORS.pendiente, v: series[1][dataPointIndex] },
          { label: 'Perdido',   color: COLORS.perdido,   v: series[2][dataPointIndex] },
        ];
        const rows = items.map(i =>
          `<div style="display:flex;justify-content:space-between;gap:20px;margin-bottom:4px">
             <span style="display:flex;align-items:center;gap:6px;font-size:11px;color:${isDark ? 'rgba(255,255,255,0.5)' : '#64748b'}">
               <span style="width:6px;height:6px;border-radius:50%;background:${i.color};display:inline-block"></span>${i.label}
             </span>
             <span style="font-size:12px;font-weight:700;color:${isDark ? '#f1f5f9' : '#1e293b'}">${i.v}</span>
           </div>`
        ).join('');
        return `<div style="background:${tooltipBg};border:1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#e2e8f0'};border-radius:12px;padding:10px 14px;font-family:inherit">
          <div style="font-size:11px;font-weight:600;color:${isDark ? 'rgba(255,255,255,0.35)' : '#94a3b8'};margin-bottom:8px">${day}</div>
          ${rows}
        </div>`;
      },
    },
    legend: { show: false },
    markers: { size: 0, hover: { size: 4 } },
  };

  const series = [
    { name: 'Exitoso',   data: data.exitoso   },
    { name: 'Pendiente', data: data.pendiente },
    { name: 'Perdido',   data: data.perdido   },
  ];

  const totals = {
    exitoso:   data.exitoso.reduce((a, b) => a + b, 0),
    pendiente: data.pendiente.reduce((a, b) => a + b, 0),
    perdido:   data.perdido.reduce((a, b) => a + b, 0),
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white border border-gray-100 shadow-sm dark:bg-[#111118] dark:border-white/[0.06] p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-white/40 mb-1.5">
            Estado de clientes
          </p>
          <div className="flex items-center gap-4">
            {[
              { label: 'Exitoso',   color: COLORS.exitoso,   v: totals.exitoso   },
              { label: 'Pendiente', color: COLORS.pendiente, v: totals.pendiente },
              { label: 'Perdido',   color: COLORS.perdido,   v: totals.perdido   },
            ].map(({ label, color, v }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                <span className="text-xs text-gray-400 dark:text-white/40">{label}</span>
                <span className="text-xs font-bold text-gray-700 dark:text-white/70">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-1 rounded-xl p-1 bg-gray-50 dark:bg-white/[0.04]">
          {Object.keys(weeks).map((w) => (
            <button
              key={w}
              onClick={() => setPeriod(w)}
              className={[
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap',
                period === w
                  ? 'bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-400 dark:text-white/35 hover:text-gray-600 dark:hover:text-white/60',
              ].join(' ')}
            >
              {w}
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
            key={`${isDark}-${period}`}
          />
        </div>
      </div>
    </div>
  );
}
