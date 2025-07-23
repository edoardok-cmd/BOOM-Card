import React, { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const cardVariants = cva(
  'rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200',
  {
    variants: {
      variant: {
        default: 'border-gray-200 bg-white hover:shadow-md',
        elevated: 'border-gray-100 bg-white shadow-lg hover:shadow-xl',
        outlined: 'border-gray-300 bg-transparent shadow-none hover:border-gray-400',
        ghost: 'border-transparent bg-gray-50 shadow-none hover:bg-gray-100',
        premium: 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-lg',
      },
      size: {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
      },
      interactive: {
        true: 'cursor-pointer',
        false: 'cursor-default',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      interactive: false,
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: ReactNode;
  asChild?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, interactive, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, interactive }), className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

const cardHeaderVariants = cva('flex flex-col space-y-1.5', {
  variants: {
    size: {
      sm: 'pb-3',
      md: 'pb-4',
      lg: 'pb-5',
      xl: 'pb-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface CardHeaderProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardHeaderVariants> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardHeaderVariants({ size }), className)}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'CardHeader';

const cardTitleVariants = cva('font-semibold leading-none tracking-tight', {
  variants: {
    size: {
      sm: 'text-lg',
      md: 'text-xl',
      lg: 'text-2xl',
      xl: 'text-3xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface CardTitleProps
  extends HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof cardTitleVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, size, as: Component = 'h3', ...props }, ref) => {
    return (
      <Component
        ref={ref}
        className={cn(cardTitleVariants({ size }), className)}
        {...props}
      />
    );
  }
);

CardTitle.displayName = 'CardTitle';

const cardDescriptionVariants = cva('text-muted-foreground', {
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface CardDescriptionProps
  extends HTMLAttributes<HTMLParagraphElement>,
    VariantProps<typeof cardDescriptionVariants> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <p
        ref={ref}
        className={cn(cardDescriptionVariants({ size }), className)}
        {...props}
      />
    );
  }
);

CardDescription.displayName = 'CardDescription';

const cardContentVariants = cva('', {
  variants: {
    size: {
      sm: 'pt-3',
      md: 'pt-4',
      lg: 'pt-5',
      xl: 'pt-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface CardContentProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardContentVariants> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardContentVariants({ size }), className)}
        {...props}
      />
    );
  }
);

CardContent.displayName = 'CardContent';

const cardFooterVariants = cva('flex items-center', {
  variants: {
    size: {
      sm: 'pt-3',
      md: 'pt-4',
      lg: 'pt-5',
      xl: 'pt-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface CardFooterProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardFooterVariants> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardFooterVariants({ size }), className)}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Specialized card components for BOOM platform

export interface DiscountCardProps extends CardProps {
  discount: number;
  partnerName: string;
  category: string;
  imageUrl?: string;
  validUntil?: Date;
  isPremium?: boolean;
  onClick?: () => void;
}

export const DiscountCard = forwardRef<HTMLDivElement, DiscountCardProps>(
  (
    {
      discount,
      partnerName,
      category,
      imageUrl,
      validUntil,
      isPremium,
      onClick,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        variant={isPremium ? 'premium' : 'default'}
        interactive={!!onClick}
        onClick={onClick}
        className={cn('overflow-hidden', className)}
        {...props}
      >
        {imageUrl && (
          <div className="relative h-48 -mx-6 -mt-6 mb-4">
            <img
              src={imageUrl}
              alt={partnerName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              -{discount}%
            </div>
          </div>
        )}
        <CardHeader size="sm">
          <CardTitle size="sm">{partnerName}</CardTitle>
          <CardDescription size="sm">{category}</CardDescription>
        </CardHeader>
        {validUntil && (
          <CardFooter size="sm" className="text-sm text-muted-foreground">
            Valid until {validUntil.toLocaleDateString()}
          </CardFooter>
        )}
      </Card>
    );
  }
);

DiscountCard.displayName = 'DiscountCard';

export interface StatsCardProps extends CardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: ReactNode;
}

export const StatsCard = forwardRef<HTMLDivElement, StatsCardProps>(
  ({ title, value, description, trend, icon, className, ...props }, ref) => {
    return (
      <Card ref={ref} className={className} {...props}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground ml-1">from last month</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);

StatsCard.displayName = 'StatsCard';

export interface PartnerCardProps extends CardProps {
  name: string;
  category: string;
  logo?: string;
  rating?: number;
  reviewCount?: number;
  discount: number;
  location?: string;
  isPremium?: boolean;
  isVerified?: boolean;
  onClick?: () => void;
}

export const PartnerCard = forwardRef<HTMLDivElement, PartnerCardProps>(
  (
    {
      name,
      category,
      logo,
      rating,
      reviewCount,
      discount,
      location,
      isPremium,
      isVerified,
      onClick,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        variant={isPremium ? 'premium' : 'default'}
        interactive={!!onClick}
        onClick={onClick}
        className={cn('relative', className)}
        {...props}
      >
        {isVerified && (
          <div className="absolute top-2 right-2">
            <div className="bg-blue-600 text-white p-1 rounded-full">
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        )}
        <div className="flex items-start space-x-4">
          {logo && (
            <div className="flex-shrink-0">
              <img
                src={logo}
                alt={name}
                className="w-16 h-16 rounded-lg object-cover"
                loading="lazy"
              />
            </div>
          )}
          <div className="flex-1">
            <CardHeader className="p-0">
              <CardTitle size="sm">{name}</CardTitle>
              <CardDescription size="sm">{category}</CardDescription>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {rating && (
                    <div className="flex items-center space-x-1">
                      <svg
                        className="w-4 h-4 text-yellow-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium">{rating}</span>
                      {reviewCount && (
                        <span className="text-sm text-muted-foreground">
                          ({reviewCount})
                        </span>
                      )}
                    </div>
                  )}
                  {location && (
                    <span className="text-sm text-muted-foreground">
                      {location}
                    </span>
                  )}
                </div>
                <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{discount}%
                </div>
              </div>
            </CardContent>
          </div>
        </div>
      </Card>
    );
  }
);

PartnerCard.displayName = 'PartnerCard';

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
