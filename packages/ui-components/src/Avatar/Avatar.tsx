import React, { useState, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const avatarVariants = cva(
  'relative inline-flex items-center justify-center overflow-hidden rounded-full font-medium transition-all duration-200',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-xs',
        sm: 'h-8 w-8 text-sm',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
        xl: 'h-16 w-16 text-xl',
        '2xl': 'h-20 w-20 text-2xl',
      },
      variant: {
        circular: '',
        rounded: 'rounded-lg',
        square: 'rounded-none',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'circular',
    },
  }
);

const statusIndicatorVariants = cva(
  'absolute border-2 border-white rounded-full',
  {
    variants: {
      size: {
        xs: 'h-2 w-2',
        sm: 'h-2.5 w-2.5',
        md: 'h-3 w-3',
        lg: 'h-3.5 w-3.5',
        xl: 'h-4 w-4',
        '2xl': 'h-5 w-5',
      },
      position: {
        'bottom-right': 'bottom-0 right-0',
        'bottom-left': 'bottom-0 left-0',
        'top-right': 'top-0 right-0',
        'top-left': 'top-0 left-0',
      },
      status: {
        online: 'bg-green-500',
        offline: 'bg-gray-400',
        busy: 'bg-red-500',
        away: 'bg-yellow-500',
      },
    },
    defaultVariants: {
      size: 'md',
      position: 'bottom-right',
      status: 'offline',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  statusPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  showStatus?: boolean;
  onImageError?: (error: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  loading?: 'lazy' | 'eager';
  crossOrigin?: 'anonymous' | 'use-credentials';
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

function getInitials(name: string): string {
  const cleanName = name.trim();
  if (!cleanName) return '';
  
  const words = cleanName.split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return words
    .slice(0, 2)
    .map(word => word[0])
    .join('')
    .toUpperCase();
}

function generateColorFromString(str: string): string {
  if (!str) return '#9CA3AF';
  
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      src,
      alt = '',
      fallback = '',
      size,
      variant,
      status,
      statusPosition = 'bottom-right',
      showStatus = false,
      onImageError,
      loading = 'lazy',
      crossOrigin,
      referrerPolicy,
      style,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      setImageError(false);
      setIsLoading(true);
    }, [src]);

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setImageError(true);
      setIsLoading(false);
      onImageError?.(e);
    };

    const handleImageLoad = () => {
      setIsLoading(false);
    };

    const initials = getInitials(fallback || alt);
    const backgroundColor = generateColorFromString(fallback || alt);

    const showFallback = !src || imageError;

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size, variant }), className)}
        style={{
          ...style,
          backgroundColor: showFallback ? backgroundColor : undefined,
        }}
        {...props}
      >
        {/* Loading skeleton */}
        {isLoading && src && !imageError && (
          <div className="absolute inset-0 animate-pulse bg-gray-200" />
        )}

        {/* Avatar image */}
        {src && !imageError && (
          <img
            src={src}
            alt={alt}
            loading={loading}
            crossOrigin={crossOrigin}
            referrerPolicy={referrerPolicy}
            onError={handleImageError}
            onLoad={handleImageLoad}
            className={cn(
              'h-full w-full object-cover',
              variant === 'circular' && 'rounded-full',
              variant === 'rounded' && 'rounded-lg',
              isLoading && 'opacity-0'
            )}
          />
        )}

        {/* Fallback content */}
        {showFallback && (
          <span
            className="select-none text-white"
            aria-label={alt || fallback}
          >
            {initials}
          </span>
        )}

        {/* Status indicator */}
        {showStatus && status && (
          <span
            className={cn(
              statusIndicatorVariants({
                size,
                position: statusPosition,
                status,
              })
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// AvatarGroup component for displaying multiple avatars
export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
  size?: AvatarProps['size'];
  spacing?: 'tight' | 'normal' | 'loose';
}

const spacingVariants = {
  tight: '-space-x-2',
  normal: '-space-x-3',
  loose: '-space-x-4',
};

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, max = 5, size = 'md', spacing = 'normal', className, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const visibleChildren = childrenArray.slice(0, max);
    const remainingCount = childrenArray.length - max;

    return (
      <div
        ref={ref}
        className={cn('flex items-center', spacingVariants[spacing], className)}
        {...props}
      >
        {visibleChildren.map((child, index) => (
          <div
            key={index}
            className="relative inline-block ring-2 ring-white"
            style={{ zIndex: visibleChildren.length - index }}
          >
            {React.isValidElement(child) && child.type === Avatar
              ? React.cloneElement(child as React.ReactElement<AvatarProps>, { size })
              : child}
          </div>
        ))}
        
        {remainingCount > 0 && (
          <div
            className={cn(
              avatarVariants({ size }),
              'relative inline-block bg-gray-300 text-gray-700 ring-2 ring-white'
            )}
            style={{ zIndex: 0 }}
          >
            <span className="text-sm font-medium">+{remainingCount}</span>
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';
