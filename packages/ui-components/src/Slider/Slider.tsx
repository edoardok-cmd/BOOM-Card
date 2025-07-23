import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

export interface SliderItem {
  id: string;
  content: React.ReactNode;
  label?: string;
  ariaLabel?: string;
}

export interface SliderProps {
  items: SliderItem[];
  className?: string;
  itemClassName?: string;
  showControls?: boolean;
  showDots?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  slidesToShow?: number;
  slidesToScroll?: number;
  gap?: number;
  loop?: boolean;
  vertical?: boolean;
  pauseOnHover?: boolean;
  animationDuration?: number;
  easing?: string;
  onSlideChange?: (currentIndex: number) => void;
  renderPrevButton?: (props: SliderControlProps) => React.ReactNode;
  renderNextButton?: (props: SliderControlProps) => React.ReactNode;
  renderDot?: (props: SliderDotProps) => React.ReactNode;
  responsive?: ResponsiveConfig[];
  testId?: string;
}

export interface ResponsiveConfig {
  breakpoint: number;
  settings: Partial<SliderProps>;
}

export interface SliderControlProps {
  onClick: () => void;
  disabled: boolean;
  className?: string;
  ariaLabel: string;
}

export interface SliderDotProps {
  index: number;
  isActive: boolean;
  onClick: () => void;
  className?: string;
  ariaLabel: string;
}

const Slider: React.FC<SliderProps> = ({
  items,
  className,
  itemClassName,
  showControls = true,
  showDots = true,
  autoPlay = false,
  autoPlayInterval = 5000,
  slidesToShow = 1,
  slidesToScroll = 1,
  gap = 16,
  loop = false,
  vertical = false,
  pauseOnHover = true,
  animationDuration = 300,
  easing = 'ease-in-out',
  onSlideChange,
  renderPrevButton,
  renderNextButton,
  renderDot,
  responsive = [],
  testId = 'slider',
}) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [currentSettings, setCurrentSettings] = useState<Partial<SliderProps>>({});
  const sliderRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Apply responsive settings based on screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const applicableSettings = responsive
        .filter((config) => width <= config.breakpoint)
        .sort((a, b) => a.breakpoint - b.breakpoint)[0];

      setCurrentSettings(applicableSettings?.settings || {});
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [responsive]);

  // Merge current settings with props
  const finalSlidesToShow = currentSettings.slidesToShow || slidesToShow;
  const finalSlidesToScroll = currentSettings.slidesToScroll || slidesToScroll;
  const finalGap = currentSettings.gap ?? gap;

  const totalSlides = items.length;
  const maxIndex = Math.max(0, totalSlides - finalSlidesToShow);

  // Handle slide change callback
  useEffect(() => {
    onSlideChange?.(currentIndex);
  }, [currentIndex, onSlideChange]);

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && totalSlides > finalSlidesToShow) {
      intervalRef.current = setInterval(() => {
        handleNext();
      }, autoPlayInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      };
  }, [isPlaying, currentIndex, totalSlides, finalSlidesToShow, autoPlayInterval]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex === 0) {
        return loop ? maxIndex : 0;
      }
      return Math.max(0, prevIndex - finalSlidesToScroll);
    });
  }, [loop, maxIndex, finalSlidesToScroll]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + finalSlidesToScroll;
      if (nextIndex > maxIndex) {
        return loop ? 0 : maxIndex;
      }
      return nextIndex;
    });
  }, [loop, maxIndex, finalSlidesToScroll]);

  const handleDotClick = (index: number) => {
    setCurrentIndex(index * finalSlidesToScroll);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0][vertical ? 'clientY' : 'clientX']);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0][vertical ? 'clientY' : 'clientX']);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isSignificantSwipe = Math.abs(distance) > 50;

    if (isSignificantSwipe) {
      if (distance > 0) {
        handleNext();
      } else {
        handlePrev();
      }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        handlePrev();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        handleNext();
      };

    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('keydown', handleKeyDown);
      return () => slider.removeEventListener('keydown', handleKeyDown);
    }, [handlePrev, handleNext]);

  const handleMouseEnter = () => {
    if (pauseOnHover && autoPlay) {
      setIsPlaying(false);
    };

  const handleMouseLeave = () => {
    if (pauseOnHover && autoPlay) {
      setIsPlaying(true);
    };

  const defaultPrevButton = (props: SliderControlProps) => (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      className={cn(
        'absolute top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        vertical ? '-top-4 left-1/2 -translate-x-1/2 rotate-90' : 'left-2',
        props.className
      )}
      aria-label={props.ariaLabel}
      data-testid={`${testId}-prev-button`}
    >
      <ChevronLeft className="w-6 h-6" />
    </button>
  );

  const defaultNextButton = (props: SliderControlProps) => (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      className={cn(
        'absolute top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
        vertical ? '-bottom-4 left-1/2 -translate-x-1/2 rotate-90' : 'right-2',
        props.className
      )}
      aria-label={props.ariaLabel}
      data-testid={`${testId}-next-button`}
    >
      <ChevronRight className="w-6 h-6" />
    </button>
  );

  const defaultDot = (props: SliderDotProps) => (
    <button
      onClick={props.onClick}
      className={cn(
        'w-2 h-2 rounded-full transition-all duration-300',
        props.isActive ? 'bg-primary w-6' : 'bg-gray-300 hover:bg-gray-400',
        props.className
      )}
      aria-label={props.ariaLabel}
      data-testid={`${testId}-dot-${props.index}`}
    />
  );

  const PrevButton = renderPrevButton || defaultPrevButton;
  const NextButton = renderNextButton || defaultNextButton;
  const Dot = renderDot || defaultDot;

  const slideWidth = vertical ? 100 : 100 / finalSlidesToShow;
  const slideHeight = vertical ? 100 / finalSlidesToShow : 100;
  const translateValue = vertical
    ? -(currentIndex * slideHeight)
    : -(currentIndex * slideWidth);

  const numberOfDots = Math.ceil((totalSlides - finalSlidesToShow + 1) / finalSlidesToScroll);

  return (
    <div
      ref={sliderRef}
      className={cn('relative overflow-hidden', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      role="region"
      aria-roledescription={t('slider.roleDescription', 'carousel')}
      aria-label={t('slider.ariaLabel', 'Content slider')}
      data-testid={testId}
      tabIndex={0}
    >
      <div
        className={cn(
          'flex transition-transform',
          vertical ? 'flex-col' : 'flex-row'
        )}
        style={{
          transform: vertical
            ? `translateY(${translateValue}%)`
            : `translateX(${translateValue}%)`,
          transitionDuration: `${animationDuration}ms`,
          transitionTimingFunction: easing,
          gap: `${finalGap}px`,
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.id}
            className={cn('flex-shrink-0', itemClassName)}
            style={{
              width: vertical ? '100%' : `${slideWidth}%`,
              height: vertical ? `${slideHeight}%` : 'auto',
            }}
            role="group"
            aria-roledescription={t('slider.slide', 'slide')}
            aria-label={
              item.ariaLabel ||
              item.label ||
              t('slider.slideLabel', { index: index + 1 })
            }
            data-testid={`${testId}-slide-${index}`}
          >
            {item.content}
          </div>
        ))}
      </div>

      {showControls && totalSlides > finalSlidesToShow && (
        <>
          <PrevButton
            onClick={handlePrev}
            disabled={!loop && currentIndex === 0}
            ariaLabel={t('slider.previousSlide', 'Previous slide')}
            className=""
          />
          <NextButton
            onClick={handleNext}
            disabled={!loop && currentIndex >= maxIndex}
            ariaLabel={t('slider.nextSlide', 'Next slide')}
            className=""
          />
        </>
      )}

      {showDots && totalSlides > finalSlidesToShow && (
        <div
          className={cn(
            'absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2',
            vertical && 'flex-col right-4 left-auto top-1/2 -translate-y-1/2 translate-x-0'
          )}
          role="tablist"
          aria-label={t('slider.pagination', 'Slider pagination')}
          data-testid={`${testId}-dots`}
        >
          {Array.from({ length: numberOfDots }).map((_, index) => (
            <Dot
              key={index}
              index={index}
              isActive={Math.floor(currentIndex / finalSlidesToScroll) === index}
              onClick={() => handleDotClick(index)}
              ariaLabel={t('slider.goToSlide', { index: index + 1 })}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Slider;

}
}
}
}
}
}
