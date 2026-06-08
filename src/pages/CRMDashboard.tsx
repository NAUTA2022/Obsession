import { Users, TrendingUp, DollarSign, Zap } from 'lucide-react';
import { MetricCard } from '../components/ui';
import {
  CountriesChart,
  ClientStatusChart,
  TopSellers,
  SalesGaugeChart,
  RevenueChart,
} from '../components/charts';

const KPI_CARDS = [
  {
    title: 'Ingresos totales',
    value: '$24,580',
    trend: 12.5,
    accentColor: '#6850E8',
    icon: <DollarSign />,
    sparklineData: [14200, 16800, 15300, 18700, 17200, 21400, 19600, 22300, 21500, 24580],
  },
  {
    title: 'Clientes activos',
    value: '1,247',
    trend: 8.2,
    accentColor: '#10B981',
    icon: <Users />,
    sparklineData: [920, 980, 1010, 1050, 1090, 1120, 1160, 1190, 1220, 1247],
  },
  {
    title: 'Conversión',
    value: '34.7%',
    trend: 2.1,
    accentColor: '#3B82F6',
    icon: <TrendingUp />,
    sparklineData: [28, 30, 29, 31, 32, 30, 33, 34, 33, 34.7],
  },
  {
    title: 'Ticket promedio',
    value: '$1,840',
    trend: -0.4,
    accentColor: '#F59E0B',
    icon: <Zap />,
    sparklineData: [1920, 1880, 1900, 1860, 1870, 1850, 1880, 1840, 1860, 1840],
  },
];

export default function CRMDashboard() {
  return (
    <div className="w-full space-y-5">

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPI_CARDS.map((card) => (
          <div key={card.title} className="h-[168px]">
            <MetricCard {...card} />
          </div>
        ))}
      </div>

      {/* Revenue + Sales gauge */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 h-[300px]">
          <RevenueChart />
        </div>
        <div className="xl:col-span-1 h-[300px]">
          <SalesGaugeChart
            title="Ventas por canal"
            data={{ vendedores: 120, miClonAI: 150, yo: 10 }}
          />
        </div>
      </div>

      {/* Countries + Client status + Top sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 h-[520px]">
          <CountriesChart />
        </div>
        <div className="lg:col-span-4 h-[520px]">
          <ClientStatusChart />
        </div>
        <div className="lg:col-span-3 h-[520px]">
          <TopSellers />
        </div>
      </div>

    </div>
  );
}
