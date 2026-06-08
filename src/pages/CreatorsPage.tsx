import { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { images } from '../config/assets';
import { CreatorCard, AdSpace } from '../components/ui/cards';
import SearchAndFilters from '../components/ui/SearchAndFilters';
import { creatorsService, type Creator } from '../services/api/creators.service';
import { swipeService } from '../services/api/swipe.service';
import DiscoverySwipeSection from '../components/discovery/DiscoverySwipeSection';
import DiscoveryToggle from '../components/discovery/DiscoveryToggle';
import DiscoveryStatusPanel from '../components/discovery/DiscoveryStatusPanel';
import DiscoveryGroupedGrid from '../components/discovery/DiscoveryGroupedGrid';

export default function CreatorsPage() {
  const [searchValue, setSearchValue] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceFilter, setPriceFilter] = useState('');
  const [savedFilter, setSavedFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'swipe'>('grid');

  const [creators, setCreators] = useState<Creator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadCreators(); }, []);
  useEffect(() => { loadCreators(); }, [locationFilter, typeFilter, savedFilter]);

  const loadCreators = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (savedFilter === 'liked' || savedFilter === 'passed') {
        const saved = savedFilter === 'liked'
          ? await swipeService.getLikedCreators()
          : await swipeService.getPassedCreators();
        setCreators(saved);
        return;
      }

      const filters: Record<string, string> = {};
      if (locationFilter) filters.location = locationFilter;
      if (typeFilter) filters.contentType = typeFilter;
      if (searchValue) filters.search = searchValue;

      const response = await creatorsService.getAllCreators(
        Object.keys(filters).length > 0 ? filters : undefined
      );
      if (response.success && response.data) {
        setCreators(response.data.data || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar creadoras');
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button onClick={loadCreators} className="mt-4 rounded-xl bg-[#6850E8] px-5 py-2.5 font-medium text-white">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full animate-fade-in">

      {/* ── Header ── */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Novedades
          </h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-white/40">
            Descubre nuevas creadoras y contenido exclusivo.
          </p>
        </div>
        <DiscoveryToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {/* ── Mobile fullscreen swipe overlay ── */}
      {viewMode === 'swipe' && (
        <div className="lg:hidden fixed inset-0 z-40">
          <DiscoverySwipeSection
            audience="creators"
            emptyLabel="No hay más creadoras por ahora"
            fullscreen
            onClose={() => setViewMode('grid')}
            onSecondChance={() => { setSavedFilter('passed'); setViewMode('grid'); }}
            onViewLiked={() => { setSavedFilter('liked'); setViewMode('grid'); }}
          />
        </div>
      )}

      {/* ── Desktop layout ── */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-5 xl:grid-cols-6">

        {/* Left: grouped grid (discover on) OR search + flat grid (discover off) */}
        <div className="min-w-0 lg:col-span-3 xl:col-span-4 flex flex-col gap-6">
          {viewMode === 'swipe' ? (
            <DiscoveryGroupedGrid />
          ) : (
            <>
              <SearchAndFilters
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                onSearch={loadCreators}
                typeFilter={typeFilter}
                locationFilter={locationFilter}
                priceFilter={priceFilter}
                savedFilter={savedFilter}
                onTypeFilterChange={setTypeFilter}
                onLocationFilterChange={setLocationFilter}
                onPriceFilterChange={setPriceFilter}
                onSavedFilterChange={setSavedFilter}
              />

              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#6850E8]" />
                </div>
              ) : creators.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-white/40 text-lg">
                    {savedFilter === 'liked'
                      ? 'Aún no tienes creadoras en "Me gustan"'
                      : savedFilter === 'passed'
                        ? 'No has descartado ninguna creadora'
                        : 'No se encontraron creadoras'}
                  </p>
                  <p className="text-gray-400 dark:text-white/25 text-sm mt-2">
                    {savedFilter
                      ? 'Activa "Descubrir" y desliza para guardar o descartar creadoras'
                      : 'Intenta ajustar los filtros o buscar con otros términos'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {creators.map((creator) => (
                    <CreatorCard
                      key={creator.id}
                      id={creator.id}
                      username={creator.username}
                      name={creator.displayName || creator.username}
                      description={creator.bio || 'Contenido exclusivo'}
                      imageUrl={creator.profilePicture || images.sampleProfile}
                      followers={Math.floor(creator.totalEarnings * 100)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: swipe deck (discover on) OR status panel (discover off) */}
        <div className="hidden lg:block min-w-0 lg:col-span-2 xl:col-span-2">
          {viewMode === 'swipe' ? (
            <div
              className="sticky flex flex-col gap-4 rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-[#111118] overflow-hidden"
              style={{ top: '4.5rem', maxHeight: 'calc(100vh - 5.5rem)' }}
            >
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3 dark:border-white/[0.06] shrink-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6850E8]/10 text-[#6850E8]">
                  <Flame className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90">
                    Descubrir creadoras
                  </h2>
                  <p className="text-xs text-gray-400 dark:text-white/30 truncate">
                    Desliza o usa los botones
                  </p>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-0">
                <DiscoverySwipeSection
                  audience="creators"
                  emptyLabel="No hay más creadoras por ahora"
                />
              </div>
            </div>
          ) : (
            <div
              className="sticky flex flex-col gap-3 rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm dark:border-white/[0.06] dark:bg-[#111118] overflow-hidden"
              style={{ top: '4.5rem', maxHeight: 'calc(100vh - 5.5rem)' }}
            >
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white/90 shrink-0">
                Estado de descubrimiento
              </h2>
              <div className="flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:w-0">
                <DiscoveryStatusPanel />
              </div>
              <AdSpace />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
