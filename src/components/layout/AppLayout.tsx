import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import BecomeCreatorBanner from './BecomeCreatorBanner';
import { NotificationsProvider } from '../../context/NotificationsProvider';
import { useAuthStore } from '../../store/auth';
import { useUIStore } from '../../store/ui';
import MotionPage from '../motion/MotionPage';

const ROLE_COLORS: Record<string, string> = {
  creator:  'bg-violet-500 text-white',
  customer: 'bg-blue-500 text-white',
  vendedor: 'bg-cyan-500 text-white',
  admin:    'bg-amber-500 text-white',
  moderator:'bg-emerald-500 text-white',
};

const ROLE_LABELS: Record<string, string> = {
  creator:  'Creator',
  customer: 'Customer',
  vendedor: 'Seller',
  admin:    'Admin',
  moderator:'Moderator',
};

const FULL_BLEED_ROUTES = ['become-creator', 'become-seller', 'onboarding'];

export default function AppLayout() {
  const { pathname } = useLocation();
  const isFullBleed = FULL_BLEED_ROUTES.some((r) => pathname.includes(r));
  const user = useAuthStore((s) => s.user);
  const openSidebar = useUIStore((s) => s.openSidebar);

  return (
    <NotificationsProvider>
      <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-gray-50 dark:bg-gray-950">
        <Navbar />

        <div className="flex flex-1 overflow-hidden min-h-0">
          <Sidebar />

          <div className="flex flex-1 flex-col overflow-hidden min-w-0">
            <main
              className={
                isFullBleed
                  ? 'w-full flex-1 overflow-y-auto'
                  : 'w-full flex-1 overflow-y-auto p-4 pb-24 md:p-6 md:pb-4'
              }
            >
              {!isFullBleed && <BecomeCreatorBanner />}
              <AnimatePresence mode="wait" initial={false}>
                <MotionPage key={pathname}>
                  <Outlet />
                </MotionPage>
              </AnimatePresence>
            </main>
            <Footer />
          </div>
        </div>

        <MobileBottomNav />

      </div>
    </NotificationsProvider>
  );
}
