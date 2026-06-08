import { useState, useEffect } from 'react';
import { Heart, SkipForward, Sparkles, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { CreatorCard } from '../ui/cards';
import { creatorsService, type Creator } from '../../services/api/creators.service';
import { swipeService } from '../../services/api/swipe.service';
import { images } from '../../config/assets';

type StatusGroup = 'undiscovered' | 'liked' | 'passed';
const PAGE_SIZE = 9;

/* ── Pagination ── */
function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  if (total <= 1) return null;

  let start = Math.max(1, page - 2);
  const end = Math.min(total, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);
  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);

  const btn = (p: number, label: React.ReactNode, active = false, disabled = false) => (
    <button
      key={String(p)}
      onClick={() => !disabled && onChange(p)}
      disabled={disabled}
      className={`min-w-[28px] h-7 px-1 flex items-center justify-center rounded-lg text-xs font-medium transition-colors disabled:opacity-30 disabled:pointer-events-none ${
        active
          ? 'bg-[#6850E8] text-white'
          : 'text-gray-600 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/[0.06]'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-center gap-0.5 pt-4 pb-1">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {start > 1 && (
        <>
          {btn(1, '1')}
          {start > 2 && <span className="text-xs text-gray-300 dark:text-white/20 px-0.5">…</span>}
        </>
      )}

      {pages.map((p) => btn(p, p, p === page))}

      {end < total && (
        <>
          {end < total - 1 && <span className="text-xs text-gray-300 dark:text-white/20 px-0.5">…</span>}
          {btn(total, total)}
        </>
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === total}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.06] disabled:opacity-30 disabled:pointer-events-none transition-colors"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/* ── Section ── */
interface SectionProps {
  title: string;
  icon: React.ReactNode;
  accentColor: string;
  creators: Creator[];
  open: boolean;
  onToggle: () => void;
  onLike: (id: string) => void;
  onPass: (id: string) => void;
  status: StatusGroup;
}

function GroupSection({ title, icon, accentColor, creators, open, onToggle, onLike, onPass, status }: SectionProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(creators.length / PAGE_SIZE));
  const slice = creators.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePageChange = (p: number) => {
    setPage(p);
    // scroll the section into view smoothly
  };

  // Reset to page 1 when list changes
  useEffect(() => { setPage(1); }, [creators.length]);

  return (
    <div className="rounded-2xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
      {/* Section header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-[#0D0D14] hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <span className={`w-7 h-7 flex items-center justify-center rounded-xl ${accentColor}`}>
            {icon}
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white/85">{title}</span>
          <span className="text-xs text-gray-400 dark:text-white/25 bg-gray-100 dark:bg-white/[0.06] px-2 py-0.5 rounded-full">
            {creators.length}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="border-t border-gray-100 dark:border-white/[0.04] bg-gray-50/50 dark:bg-white/[0.01] px-4 pt-4 pb-3">
          {creators.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-white/25 text-center py-6">
              Sin creadoras aquí todavía
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slice.map((creator) => (
                  <div key={creator.id} className="relative">
                    <CreatorCard
                      id={creator.id}
                      username={creator.username}
                      name={creator.displayName || creator.username}
                      description={creator.bio || 'Contenido exclusivo'}
                      imageUrl={creator.profilePicture || images.sampleProfile}
                      followers={Math.floor((creator.totalEarnings ?? 0) * 100)}
                    />
                    {/* Floating status action */}
                    {status === 'undiscovered' && (
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          onClick={() => onLike(creator.id)}
                          title="Me gusta"
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-white/90 dark:bg-[#111118]/90 shadow text-green-500 hover:bg-white hover:scale-110 transition-all"
                        >
                          <Heart className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onPass(creator.id)}
                          title="Descartar"
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-white/90 dark:bg-[#111118]/90 shadow text-red-400 hover:bg-white hover:scale-110 transition-all"
                        >
                          <SkipForward className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {status === 'liked' && (
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => onPass(creator.id)}
                          title="Descartar"
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-white/90 dark:bg-[#111118]/90 shadow text-red-400 hover:bg-white hover:scale-110 transition-all"
                        >
                          <SkipForward className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {status === 'passed' && (
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={() => onLike(creator.id)}
                          title="Segunda oportunidad"
                          className="w-6 h-6 flex items-center justify-center rounded-full bg-white/90 dark:bg-[#111118]/90 shadow text-violet-500 hover:bg-white hover:scale-110 transition-all"
                        >
                          <Heart className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Pagination page={page} total={totalPages} onChange={handlePageChange} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main export ── */
export default function DiscoveryGroupedGrid() {
  const [all, setAll] = useState<Creator[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [passedIds, setPassedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Record<StatusGroup, boolean>>({
    undiscovered: true,
    liked: true,
    passed: false,
  });

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
        // noop
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
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 rounded-full border-2 border-[#6850E8] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <GroupSection
        title="Sin descubrir"
        icon={<Sparkles className="w-4 h-4 text-amber-500" />}
        accentColor="bg-amber-500/10"
        creators={undiscovered}
        open={open.undiscovered}
        onToggle={() => toggle('undiscovered')}
        onLike={handleLike}
        onPass={handlePass}
        status="undiscovered"
      />
      <GroupSection
        title="Me gusta"
        icon={<Heart className="w-4 h-4 text-green-500" />}
        accentColor="bg-green-500/10"
        creators={liked}
        open={open.liked}
        onToggle={() => toggle('liked')}
        onLike={handleLike}
        onPass={handlePass}
        status="liked"
      />
      <GroupSection
        title="Descartadas"
        icon={<SkipForward className="w-4 h-4 text-gray-400" />}
        accentColor="bg-gray-500/10"
        creators={passed}
        open={open.passed}
        onToggle={() => toggle('passed')}
        onLike={handleLike}
        onPass={handlePass}
        status="passed"
      />
    </div>
  );
}
