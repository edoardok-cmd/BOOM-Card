import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

export interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  separatorClassName?: string;
  maxItems?: number;
  showHome?: boolean;
  homeLabel?: string;
  homeHref?: string;
  truncateMiddle?: boolean;
  'aria-label'?: string;
}

const BreadcrumbSeparator: React.FC<{ className?: string; children?: React.ReactNode }> = ({
  className,
  children = <ChevronRight className="w-4 h-4" />
}) => {
  return (
    <span 
      className={cn('mx-2 text-gray-400', className)}
      aria-hidden="true"
    >
      {children}
    </span>
  );
};

const BreadcrumbItem: React.FC<{
  item: BreadcrumbItem;
  isLast: boolean;
  className?: string;
  activeClassName?: string;
}> = ({ item, isLast, className, activeClassName }) => {
  const baseClasses = cn(
    'inline-flex items-center gap-1.5 text-sm font-medium transition-colors',
    'hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded',
    className
  );

  const content = (
    <>
      {item.icon && <span className="w-4 h-4">{item.icon}</span>}
      <span>{item.label}</span>
    </>
  );

  if (isLast || !item.href) {
    return (
      <span 
        className={cn(
          baseClasses,
          'text-gray-900 cursor-default',
          item.isActive && activeClassName
        )}
        aria-current={isLast ? 'page' : undefined}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      to={item.href}
      className={cn(
        baseClasses,
        'text-gray-600 hover:text-gray-900'
      )}
    >
      {content}
    </Link>
  );
};

const generateBreadcrumbsFromPath = (pathname: string, t: any): BreadcrumbItem[] => {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Route to label mapping
  const routeLabels: Record<string, string> = {
    'food-drink': t('breadcrumb.foodDrink'),
    'restaurants': t('breadcrumb.restaurants'),
    'cafes': t('breadcrumb.cafes'),
    'bars': t('breadcrumb.bars'),
    'entertainment': t('breadcrumb.entertainment'),
    'nightclubs': t('breadcrumb.nightclubs'),
    'live-music': t('breadcrumb.liveMusic'),
    'accommodation': t('breadcrumb.accommodation'),
    'hotels': t('breadcrumb.hotels'),
    'experiences': t('breadcrumb.experiences'),
    'spa-wellness': t('breadcrumb.spaWellness'),
    'activities': t('breadcrumb.activities'),
    'partners': t('breadcrumb.partners'),
    'about': t('breadcrumb.about'),
    'contact': t('breadcrumb.contact'),
    'profile': t('breadcrumb.profile'),
    'settings': t('breadcrumb.settings'),
    'subscription': t('breadcrumb.subscription'),
    'favorites': t('breadcrumb.favorites'),
    'history': t('breadcrumb.history')
  };

  let currentPath = '';
  paths.forEach((path, index) => {
    currentPath += `/${path}`;
    
    // Skip certain paths like IDs
    if (!/^\d+$/.test(path) && !/^[a-f0-9-]{36}$/i.test(path)) {
      breadcrumbs.push({
        label: routeLabels[path] || path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
        href: currentPath,
        isActive: index === paths.length - 1
      });
    });

  return breadcrumbs;
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator,
  className,
  itemClassName,
  activeItemClassName,
  separatorClassName,
  maxItems = 0,
  showHome = true,
  homeLabel,
  homeHref = '/',
  truncateMiddle = true,
  'aria-label': ariaLabel,
  ...props
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  
  // Generate breadcrumbs from path if items not provided
  const breadcrumbItems = items || generateBreadcrumbsFromPath(location.pathname, t);
  
  // Add home item if requested
  const allItems = showHome
    ? [
        {
          label: homeLabel || t('breadcrumb.home'),
          href: homeHref,
          icon: <Home className="w-4 h-4" />
        },
        ...breadcrumbItems
      ]
    : breadcrumbItems;

  // Handle truncation
  let displayItems = allItems;
  if (maxItems > 0 && allItems.length > maxItems) {
    if (truncateMiddle) {
      const startItems = Math.ceil((maxItems - 1) / 2);
      const endItems = Math.floor((maxItems - 1) / 2);
      displayItems = [
        ...allItems.slice(0, startItems),
        { label: '...', href: undefined },
        ...allItems.slice(allItems.length - endItems)
      ];
    } else {
      displayItems = [
        ...allItems.slice(0, maxItems - 1),
        { label: '...', href: undefined },
        allItems[allItems.length - 1]
      ];
    }

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label={ariaLabel || t('breadcrumb.ariaLabel')}
      className={cn('flex items-center text-sm', className)}
      {...props}
    >
      <ol className="inline-flex items-center">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          
          return (
            <li key={`${item.href}-${index}`} className="inline-flex items-center">
              <BreadcrumbItem
                item={item}
                isLast={isLast}
                className={itemClassName}
                activeClassName={activeItemClassName}
              />
              {!isLast && (
                <BreadcrumbSeparator className={separatorClassName}>
                  {separator}
                </BreadcrumbSeparator>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

}
}
