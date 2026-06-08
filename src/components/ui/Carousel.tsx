import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselProps {
  children: React.ReactNode[];
  className?: string;
  itemsPerView?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap?: number;
  showDots?: boolean;
  showArrows?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  addHorizontalPadding?: boolean;
  useNaturalWidth?: boolean;
}

export default function Carousel({
  children,
  className = '',
  itemsPerView = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 16,
  showDots = true,
  showArrows = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  addHorizontalPadding = false,
  useNaturalWidth = false,
}: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);

  const [itemsToShow, setItemsToShow] = useState(itemsPerView.desktop);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Responsive items calculation
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setItemsToShow(itemsPerView.mobile);
      } else if (width < 1024) {
        setItemsToShow(itemsPerView.tablet);
      } else {
        setItemsToShow(itemsPerView.desktop);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [itemsPerView]);

  // Auto play functionality
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, currentIndex]);

  const maxIndex = Math.max(0, children.length - Math.floor(itemsToShow));

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  // Touch/Mouse events for mobile and desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault();
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const endX = e.pageX;
    const diff = startX - endX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < maxIndex) {
        nextSlide();
      } else if (diff < 0 && currentIndex > 0) {
        prevSlide();
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const endX = e.changedTouches[0].pageX;
    const diff = startX - endX;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentIndex < maxIndex) {
        nextSlide();
      } else if (diff < 0 && currentIndex > 0) {
        prevSlide();
      }
    }
  };

  // Calculate transform for smooth sliding
  const translateX = -currentIndex * (100 / itemsToShow);

  return (
    <div className={`relative ${className}`}>
      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div
          ref={carouselRef}
          className="flex transition-transform duration-300 ease-in-out cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(${translateX}%)`,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {children.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={useNaturalWidth ? {
                paddingLeft: addHorizontalPadding && index === 0 ? '16px' : '0',
                paddingRight: index === children.length - 1 ? (addHorizontalPadding ? '16px' : '0') : `${gap}px`,
              } : {
                width: `${100 / itemsToShow}%`,
                paddingLeft: addHorizontalPadding && index === 0 ? '16px' : '0',
                paddingRight: itemsToShow === 1 ? '0' : (addHorizontalPadding && index === children.length - 1 ? '16px' : `${gap}px`),
              }}
            >
              <div className={`w-full h-full ${itemsToShow === 1 ? 'flex justify-center' : ''}`}>
                {child}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {showArrows && children.length > itemsToShow && (
        <>
          <button
            onClick={prevSlide}
            className={`absolute left-0 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              itemsToShow === 1 
                ? 'top-16 -translate-x-2' 
                : 'top-1/2 -translate-y-1/2 -translate-x-2'
            }`}
            disabled={currentIndex === 0}
            aria-label="Slide anterior"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={nextSlide}
            className={`absolute right-0 z-10 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              itemsToShow === 1 
                ? 'top-16 translate-x-2' 
                : 'top-1/2 -translate-y-1/2 translate-x-2'
            }`}
            disabled={currentIndex >= maxIndex}
            aria-label="Slide siguiente"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && children.length > itemsToShow && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? 'bg-blue-500 w-6'
                  : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
              aria-label={`Ir al slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
