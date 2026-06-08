import { useState } from 'react';
import { ShoppingBag, DollarSign } from 'lucide-react';
import type { DiscoveryProfile } from '../../types/discovery';

interface Props {
  profile: DiscoveryProfile;
  interactive?: boolean;
  /** Extra bottom padding so overlaid action buttons don't cover info. */
  bottomOffset?: number;
}

export default function DiscoveryProfileCard({ profile, interactive = true, bottomOffset = 0 }: Props) {
  const photos = [profile.mainPhoto, ...profile.gallery.filter((g) => g !== profile.mainPhoto)];
  const [index, setIndex] = useState(0);
  const total = photos.length;

  const go = (dir: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIndex((i) => (i + dir + total) % total);
  };

  // Tap-zone navigation: tap left 40% → prev, right 40% → next
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || total <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width;
    if (ratio < 0.4) go(-1);
    else if (ratio > 0.6) go(1);
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800 shadow-xl select-none"
      onClick={handleTap}
    >
      <img
        src={photos[index]}
        alt={profile.name}
        draggable={false}
        className="h-full w-full object-cover pointer-events-none"
      />

      {/* Story-style gallery indicators */}
      {total > 1 && (
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
          {photos.map((_, i) => (
            <span
              key={i}
              className={`h-[3px] flex-1 rounded-full transition-all ${i === index ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}

      {/* Bottom gradient + info */}
      <div
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-5 pt-16 text-white"
        style={{ paddingBottom: bottomOffset > 0 ? `${bottomOffset + 16}px` : '20px' }}
      >
        <h3 className="text-2xl font-bold drop-shadow leading-tight">{profile.name}</h3>

        {profile.description && (
          <p className="mt-1 text-sm text-white/85 line-clamp-2 leading-snug">{profile.description}</p>
        )}

        {/* Product count + price range */}
        {(profile.productCount != null || profile.priceRange) && (
          <div className="mt-2 flex items-center gap-3">
            {profile.productCount != null && (
              <span className="flex items-center gap-1 text-xs text-white/80">
                <ShoppingBag className="w-3 h-3" />
                {profile.productCount} productos
              </span>
            )}
            {profile.priceRange && (
              <span className="flex items-center gap-1 text-xs text-white/80">
                <DollarSign className="w-3 h-3" />
                {profile.priceRange}
              </span>
            )}
          </div>
        )}

        {/* Meta tags (location, content type) */}
        {profile.meta.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {profile.meta.map((m, i) => (
              <span
                key={i}
                className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-medium backdrop-blur-sm"
              >
                {m.label ? `${m.label}: ` : ''}
                {m.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
