import React from 'react';
import { cn } from '../../utils/cn';
import { gradients, focusRings } from '../../config/branding';


export type HeroCardProps = {
  imageSrc: string;
  imageAlt?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  audio?: React.ReactNode;
  ctaText?: string;
  onCtaClick?: () => void;
  className?: string;
  contentClassName?: string;
  mediaClassName?: string;
}

export default function HeroCard({
  imageSrc,
  imageAlt = '',
  title,
  description,
  audio,
  ctaText,
  onCtaClick,
  className,
  contentClassName,
  mediaClassName,
}: HeroCardProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-2xl shadow-lg',
        'bg-[url("/src/assets/images/bgImage.png")] bg-cover bg-center bg-no-repeat',
        'text-white',
        className,
      )}
    >
            <div className={cn('p-3 sm:p-4 lg:p-6 xl:p-8 mx-auto max-w-7xl', contentClassName)}>
        <div className="flex flex-col 2xl:grid 2xl:items-center gap-4 sm:gap-6 2xl:grid-cols-[minmax(200px,350px),1fr]">
          {/* Image Container */}
          <div className={cn('mx-auto w-full max-w-[200px] xs:max-w-[240px] sm:max-w-[280px] lg:max-w-[280px] xl:max-w-[320px]', mediaClassName)}>
            <div className="relative">
              <div className="rounded-2xl sm:rounded-3xl border-2 sm:border-4 border-white/20 p-1.5 sm:p-2 shadow-2xl backdrop-blur-sm">
                <img
                  src={imageSrc}
                  alt={imageAlt}
                  className="aspect-square w-full rounded-xl sm:rounded-2xl object-cover"
                />
              </div>
            </div>
          </div>
          
          {/* Content Container */}
          <div className="space-y-3 sm:space-y-4 flex-1 min-w-0">
            <h2 className="text-balance text-lg xs:text-xl sm:text-2xl lg:text-3xl xl:text-3xl 2xl:text-4xl font-extrabold text-center 2xl:text-left leading-tight">
              {title}
            </h2>
            {description ? (
              <p className="text-xs xs:text-sm sm:text-base lg:text-base xl:text-base leading-5 sm:leading-6 text-center 2xl:text-left text-white/90 max-w-none 2xl:max-w-2xl">
                {description}
              </p>
            ) : null}
            
            {/* Controls Container */}
            <div className='flex flex-col sm:flex-row justify-center 2xl:justify-start items-center 2xl:items-start gap-3 sm:gap-4 pt-2'>
              {audio ? (
                <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md 2xl:max-w-[320px] order-2 sm:order-1">
                  {audio}
                </div>
              ) : null}
              {ctaText ? (
                <div className="w-full max-w-xs sm:max-w-sm lg:max-w-md 2xl:w-auto 2xl:flex-shrink-0 order-1 sm:order-2">
                  <button
                    className={cn(
                      'w-full 2xl:w-auto inline-flex items-center justify-center rounded-full px-4 sm:px-6 py-2.5 sm:py-2.5 h-11 font-medium text-white shadow-lg transition-all duration-200 hover:opacity-95 hover:shadow-xl text-sm sm:text-base whitespace-nowrap 2xl:min-w-[140px]', 
                      gradients.primary, 
                      focusRings.brand
                    )}
                    onClick={onCtaClick}
                  >
                    {ctaText}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


