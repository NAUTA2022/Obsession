import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, LayoutDashboard, MessageCircle, ShoppingBag,
  CalendarDays, Target, Images, Contact2, Loader2,
} from 'lucide-react';
import { workTeamsService } from '../services/api/work-teams.service';
import type { WorkTeamCreator } from '../services/api/work-teams.service';
import Avatar from '../components/ui/Avatar';

// ── Tab components ────────────────────────────────────────────────────────────
import TabDashboard     from './seller-creator/TabDashboard';
import TabConversations from './seller-creator/TabConversations';
import TabProducts      from './seller-creator/TabProducts';
import TabCalendar      from './seller-creator/TabCalendar';
import TabCRM           from './seller-creator/TabCRM';
import TabGallery       from './seller-creator/TabGallery';
import TabContacts      from './seller-creator/TabContacts';

// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'dashboard',     label: 'Dashboard',      icon: LayoutDashboard },
  { id: 'conversations', label: 'Conversaciones', icon: MessageCircle },
  { id: 'products',      label: 'Productos y servicios', icon: ShoppingBag },
  { id: 'bookings',      label: 'Calendario',     icon: CalendarDays },
  { id: 'crm',           label: 'CRM',            icon: Target },
  { id: 'studio',        label: 'Galería',        icon: Images },
  { id: 'contacts',      label: 'Contactos',      icon: Contact2 },
] as const;

type TabId = (typeof TABS)[number]['id'];

// ─────────────────────────────────────────────────────────────────────────────

export default function SellerCreatorViewPage() {
  const { username, '*': subPath } = useParams<{ username: string; '*': string }>();
  const navigate = useNavigate();

  const activeTab: TabId = (subPath?.split('/')[0] as TabId) || 'dashboard';

  const [creatorInfo, setCreatorInfo]   = useState<WorkTeamCreator | null>(null);
  const [headerLoading, setHeaderLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    workTeamsService
      .getWorkTeams()
      .then(async ({ ownedGroups, memberGroups }) => {
        const groups  = [...ownedGroups, ...memberGroups];
        const results = await Promise.all(groups.map(g => workTeamsService.getWorkTeamCreators(g.id)));
        const all     = results.flatMap(r => r.creators);
        setCreatorInfo(all.find(c => c.creatorUsername === username) ?? null);
      })
      .catch(() => {})
      .finally(() => setHeaderLoading(false));
  }, [username]);

  const commission   = creatorInfo?.myCommission ?? 15;
  const mockAvatar   = `https://i.pravatar.cc/150?u=${username}`;
  const goTab        = (id: TabId) => navigate(`/seller/creator/${username}/${id}`, { replace: true });

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0D0D14]">

      {/* ── Creator header ── */}
      <div className="shrink-0 bg-white dark:bg-[#111118] border-b border-gray-100 dark:border-white/[0.06]">

        {/* Top bar: back + creator info */}
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate('/seller/creators')}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {headerLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-28 rounded bg-gray-100 dark:bg-white/[0.06] animate-pulse" />
                <div className="h-2.5 w-20 rounded bg-gray-100 dark:bg-white/[0.04] animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Avatar src={creatorInfo?.creatorPhoto ?? mockAvatar} name={username ?? ''} size={36} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white/90 truncate">
                  {creatorInfo?.creatorName ?? `@${username}`}
                </p>
                <p className="text-xs text-gray-400 dark:text-white/30">
                  {commission}% comisión · {creatorInfo?.mySales ?? 5} ventas
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-0.5 px-3 pb-0 overflow-x-auto [&::-webkit-scrollbar]:h-0">
          {TABS.map(tab => {
            const Icon     = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => goTab(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap flex-shrink-0 transition-colors ${
                  isActive
                    ? 'text-[#6850E8] dark:text-[#9277F5]'
                    : 'text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {tab.label}
                {isActive && (
                  <motion.div
                    layoutId="seller-creator-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6850E8] dark:bg-[#9277F5] rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className={`flex-1 ${activeTab === 'conversations' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className={activeTab === 'conversations' ? 'h-full' : 'min-h-full'}
          >
            {activeTab === 'dashboard'     && <TabDashboard creator={creatorInfo} username={username!} />}
            {activeTab === 'conversations' && <TabConversations username={username!} />}
            {activeTab === 'products'      && <TabProducts username={username!} commission={commission} />}
            {activeTab === 'bookings'      && <TabCalendar />}
            {activeTab === 'crm'           && <TabCRM />}
            {activeTab === 'studio'        && <TabGallery />}
            {activeTab === 'contacts'      && <TabContacts />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
