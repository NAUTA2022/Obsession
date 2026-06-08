import ReactApexChart from 'react-apexcharts';
import { Select } from '../ui';
import { chartColors } from '../../config/branding';

const salesData = [
  { category: 'vendedores', value: 120, color: chartColors.blue, label: 'Vendedores: 120' },
  { category: 'ai', value: 150, color: chartColors.orange, label: 'Mi clon (AI): 150' },
  { category: 'yo', value: 10, color: chartColors.green, label: 'Yo: 10' },
];

const periodOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function SalesChart() {
  const total = salesData.reduce((sum, item) => sum + item.value, 0);

  // Convert values to percentages for ApexCharts
  const series = salesData.map(item => Math.round((item.value / total) * 100));

  const options = {
    chart: {
      type: 'radialBar' as const,
      height: 200,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          margin: 15,
          size: '70%',
          background: 'transparent',
        },
        track: {
          background: chartColors.gray.medium,
          strokeWidth: '97%',
          margin: 5,
          dropShadow: {
            enabled: false,
          }
        },
        dataLabels: {
          showOn: "always",
          name: {
            show: false,
          },
          value: {
            show: false,
          },
          total: {
            show: false,
          }
        }
      }
    },
    stroke: {
      lineCap: 'round' as const
    },
    fill: {
      type: 'solid',
      colors: salesData.map(item => item.color)
    },
    labels: ['', '', ''], // Empty labels to hide them
    legend: {
      show: false
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Ventas</h3>
        <Select 
          options={periodOptions} 
          value="monthly" 
          placeholder="Monthly"
          className="w-24"
        />
      </div>

      <div className="flex items-center space-x-6 flex-1">
        {/* Legend */}
        <div className="flex-1 space-y-3">
          {salesData.map((item) => (
            <div key={item.category} className="flex items-center space-x-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm text-gray-700">{item.label}</span>
            </div>
          ))}
        </div>

        {/* ApexCharts RadialBar Gauge */}
        <div className="w-40 h-20">
          <ReactApexChart
            options={options}
            series={series}
            type="radialBar"
            height={80}
          />
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">Reporte de ventas</p>
      </div>
    </div>
  );
}


