import { useTranslation } from '../../hooks/useTranslation';

type Seller = { id: string; name: string; subtitle: string; sales: number; avatar: string; color: string };

const RANK_COLORS = ['#F59E0B', '#94a3b8', '#CD7F32'];

const topSellers: Seller[] = [
  { id: '1', name: 'Mi Clon AI', subtitle: 'Agente IA · 01',  sales: 150, avatar: '🤖', color: '#6850E8' },
  { id: '2', name: 'Wade Warren',    subtitle: 'Vendedor · 36254', sales: 50,  avatar: '👨‍💼', color: '#3B82F6' },
  { id: '3', name: 'Albert Flores',  subtitle: 'Vendedor · 36255', sales: 20,  avatar: '👨‍💻', color: '#10B981' },
  { id: '4', name: 'Bessie Cooper',  subtitle: 'Vendedor · 36256', sales: 10,  avatar: '👩‍💼', color: '#F59E0B' },
  { id: '5', name: 'Arlene McCoy',   subtitle: 'Vendedor · 36257', sales: 5,   avatar: '👩‍💻', color: '#EF4444' },
  { id: '6', name: 'Devon Lane',     subtitle: 'Vendedor · 36258', sales: 3,   avatar: '🧑‍💻', color: '#8B5CF6' },
];

export default function TopSellers() {
  const { t } = useTranslation();
  const maxSales = Math.max(...topSellers.map((s) => s.sales));

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white border border-gray-100 shadow-sm dark:bg-[#111118] dark:border-white/[0.06] p-5">
      {/* Header */}
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400 dark:text-white/40 mb-0.5">
          {t('crm.topSellers')}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white/90">
          {topSellers.reduce((a, s) => a + s.sales, 0)}
          <span className="text-sm font-normal text-gray-400 dark:text-white/35 ml-1">ventas totales</span>
        </p>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-auto space-y-1">
        {topSellers.map((seller, i) => {
          const pct = Math.round((seller.sales / maxSales) * 100);
          const isTop3 = i < 3;
          return (
            <div
              key={seller.id}
              className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]"
            >
              {/* Rank */}
              <div className="w-5 flex-shrink-0 text-center">
                {isTop3 ? (
                  <span className="text-base leading-none" style={{ filter: 'drop-shadow(0 0 4px currentColor)' }}>
                    {['🥇', '🥈', '🥉'][i]}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-gray-300 dark:text-white/20">{i + 1}</span>
                )}
              </div>

              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ backgroundColor: `${seller.color}18` }}
              >
                {seller.avatar}
              </div>

              {/* Name + bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-semibold text-gray-800 dark:text-white/80 truncate">{seller.name}</p>
                  <span
                    className="text-xs font-bold tabular-nums ml-2 flex-shrink-0"
                    style={{ color: seller.color }}
                  >
                    {seller.sales}
                  </span>
                </div>
                <div className="h-1 w-full rounded-full bg-gray-100 dark:bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: seller.color }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
