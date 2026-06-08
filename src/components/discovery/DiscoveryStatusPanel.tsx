import { useState, useEffect } from 'react';
import { Heart, SkipForward, Sparkles, ChevronDown, MessageCircle, ShoppingBag, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { creatorsService, type Creator } from '../../services/api/creators.service';
import { swipeService } from '../../services/api/swipe.service';
import { images } from '../../config/assets';

type StatusGroup = 'undiscovered' | 'liked' | 'passed';

interface GroupedCreator extends Creator {
  _status: StatusGroup;
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  count: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function Section({ title, icon, color, count, open, onToggle, children }: SectionProps) {
  return (
    <div className="rounded-xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white dark:bg-[#111118] hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={`w-6 h-6 flex items-center justify-center rounded-lg ${color}`}>
            {icon}
          </span>
          <span className="text-xs font-semibold text-gray-900 dark:text-white/80">{title}</span>
          <span className="text-[11px] text-gray-400 dark:text-white/25">({count})</span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && count > 0 && (
        <div className="divide-y divide-gray-50 dark:divide-white/[0.03]">
          {children}
        </div>
      )}
      {open && count === 0 && (
        <div className="px-3 py-4 text-xs text-gray-400 dark:text-white/25 text-center bg-gray-50/50 dark:bg-white/[0.02]">
          Sin creadoras aquí
        </div>
      )}
    </div>
  );
}

interface RowProps {
  creator: Creator;
  status: StatusGroup;
  onLike: (id: string) => void;
  onPass: (id: string) => void;
  onMessage: (id: string) => void;
  onViewShop: (id: string) => void;
}

function CreatorRow({ creator, status, onLike, onPass, onMessage, onViewShop }: RowProps) {
  const name = creator.displayName || creator.username;
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-[#111118] hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
      <img
        src={creator.profilePicture || images.sampleProfile}
        alt=""
        className="w-8 h-8 rounded-full object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-900 dark:text-white/80 truncate">{name}</p>
        <p className="text-[10px] text-gray-400 dark:text-white/25 truncate">{creator.contentType ?? ''}</p>
      </div>
      {/* Action buttons — visible on hover on desktop */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {status !== 'liked' && (
          <button
            onClick={() => onLike(creator.id)}
            title="Me interesa"
            className="w-6 h-6 flex items-center justify-center rounded-full bg-green-50 dark:bg-green-500/10 text-green-500 hover:bg-green-100 transition-colors"
          >
            <Heart className="w-3 h-3" />
          </button>
        )}
        {status !== 'passed' && (
          <button
            onClick={() => onPass(creator.id)}
            title="Descartar"
            className="w-6 h-6 flex items-center justify-center rounded-full bg-red-50 dark:bg-red-500/10 text-red-400 hover:bg-red-100 transition-colors"
          >
            <SkipForward className="w-3 h-3" />
          </button>
        )}
        {status === 'passed' && (
          <button
            onClick={() => onLike(creator.id)}
            title="Segunda oportunidad"
            className="w-6 h-6 flex items-center justify-center rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-500 hover:bg-violet-100 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
        {status === 'liked' && (
          <>
            <button
              onClick={() => onMessage(creator.id)}
              title="Mensaje"
              className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 hover:bg-blue-100 transition-colors"
            >
              <MessageCircle className="w-3 h-3" />
            </button>
            <button
              onClick={() => onViewShop(creator.id)}
              title="Ver contenido"
              className="w-6 h-6 flex items-center justify-center rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-500 hover:bg-violet-100 transition-colors"
            >
              <ShoppingBag className="w-3 h-3" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function DiscoveryStatusPanel() {
  const [all, setAll] = useState<Creator[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Record<StatusGroup, boolean>>({
    undiscovered: true,
    liked: true,
    passed: false,
  });

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const [creatorsRes, liked, passed] = await Promise.all([
          creatorsService.getAllCreators(),
          swipeService.getLikedCreators(),
          swipeService.getPassedCreators(),
        ]);
        const allList = creatorsRes.data?.data ?? creatorsRes.data ?? [];
        setAll(Array.isArray(allList) ? allList : []);
        setLikedIds(new Set(liked.map((c: Creator) => c.id)));
        setPassedIds(new Set(passed.map((c: Creator) => c.id)));
      } catch {
        // noop — panel shows empty state
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLike = (id: string) => {
    setLikedIds((prev) => new Set([...prev, id]));
    setPassedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
  };
  const handlePass = (id: string) => {
    setPassedIds((prev) => new Set([...prev, id]));
    setLikedIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
  };

  const toggle = (g: StatusGroup) => setOpen((p) => ({ ...p, [g]: !p[g] }));

  const liked = all.filter((c) => likedIds.has(c.id));
  const passed = all.filter((c) => passedIds.has(c.id));
  const undiscovered = all.filter((c) => !likedIds.has(c.id) && !passedIds.has(c.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-5 h-5 rounded-full border-2 border-[#6850E8] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Section
        title="Sin descubrir"
        icon={<Sparkles className="w-3.5 h-3.5 text-amber-500" />}
        color="bg-amber-500/10"
        count={undiscovered.length}
        open={open.undiscovered}
        onToggle={() => toggle('undiscovered')}
      >
        {undiscovered.slice(0, 20).map((c) => (
          <CreatorRow
            key={c.id}
            creator={c}
            status="undiscovered"
            onLike={handleLike}
            onPass={handlePass}
            onMessage={(id) => navigate(`/messages/new?to=${id}`)}
            onViewShop={(id) => navigate(`/customer/creator/${id}`)}
          />
        ))}
      </Section>

      <Section
        title="Me gusta"
        icon={<Heart className="w-3.5 h-3.5 text-green-500" />}
        color="bg-green-500/10"
        count={liked.length}
        open={open.liked}
        onToggle={() => toggle('liked')}
      >
        {liked.map((c) => (
          <CreatorRow
            key={c.id}
            creator={c}
            status="liked"
            onLike={handleLike}
            onPass={handlePass}
            onMessage={(id) => navigate(`/messages/new?to=${id}`)}
            onViewShop={(id) => navigate(`/customer/creator/${id}`)}
          />
        ))}
      </Section>

      <Section
        title="Descartadas"
        icon={<SkipForward className="w-3.5 h-3.5 text-gray-400" />}
        color="bg-gray-500/10"
        count={passed.length}
        open={open.passed}
        onToggle={() => toggle('passed')}
      >
        {passed.map((c) => (
          <CreatorRow
            key={c.id}
            creator={c}
            status="passed"
            onLike={handleLike}
            onPass={handlePass}
            onMessage={(id) => navigate(`/messages/new?to=${id}`)}
            onViewShop={(id) => navigate(`/customer/creator/${id}`)}
          />
        ))}
      </Section>
    </div>
  );
}
