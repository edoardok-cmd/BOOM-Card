import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils/cn';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { usePrevious } from '../../hooks/usePrevious';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
  ariaLabel?: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab?: string;
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline' | 'enclosed';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  scrollable?: boolean;
  centered?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  tabClassName?: string;
  activeTabClassName?: string;
  contentClassName?: string;
  indicatorClassName?: string;
  'aria-label'?: string;
  children?: React.ReactNode;
}

export interface TabPanelProps {
  tabId: string;
  children: React.ReactNode;
  className?: string;
  keepMounted?: boolean;
}

const TabPanel: React.FC<TabPanelProps> = ({ 
  tabId, 
  children, 
  className,
  keepMounted = false 
}) => {
  const { activeTabId } = useTabsContext();
  const isActive = activeTabId === tabId;

  if (!keepMounted && !isActive) {
    return null;
  }

  return (
    <div
      role="tabpanel"
      id={`tabpanel-${tabId}`}
      aria-labelledby={`tab-${tabId}`}
      hidden={!isActive}
      className={cn(
        'focus:outline-none',
        !isActive && keepMounted && 'hidden',)
        className
      )}
    >
      {children}
    </div>
  );
};

interface TabsContextValue {
  activeTabId: string;
  setActiveTab: (tabId: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('useTabsContext must be used within TabsProvider');
  }
  return context;
};

export const Tabs: React.FC<TabsProps> & { Panel: typeof TabPanel } = ({
  tabs,
  activeTab,
  defaultTab,
  onChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  scrollable = false,
  centered = false,
  orientation = 'horizontal',
  className,
  tabClassName,
  activeTabClassName,
  contentClassName,
  indicatorClassName,
  'aria-label': ariaLabel,
  children
}) => {
  const { t } = useTranslation();
  const [internalActiveTab, setInternalActiveTab] = useState(
    activeTab || defaultTab || tabs[0]?.id
  );
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const indicatorRef = useRef<HTMLDivElement>(null);
  const scrollIntervalRef = useRef<NodeJS.Timeout>();
  const isMobile = useMediaQuery('(max-width: 640px)');
  const previousActiveTab = usePrevious(internalActiveTab);

  const activeTabId = activeTab ?? internalActiveTab;

  // Update internal state when controlled activeTab changes
  useEffect(() => {
    if (activeTab !== undefined) {
      setInternalActiveTab(activeTab);
    }, [activeTab]);

  // Check scroll buttons visibility
  const checkScrollButtons = useCallback(() => {
    if (!scrollable || !tabsRef.current || orientation === 'vertical') return;

    const { scrollLeft, scrollWidth, clientWidth } = tabsRef.current;
    setShowLeftScroll(scrollLeft > 0);
    setShowRightScroll(scrollLeft + clientWidth < scrollWidth - 1);
  }, [scrollable, orientation]);

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener('resize', checkScrollButtons);
    return () => window.removeEventListener('resize', checkScrollButtons);
  }, [checkScrollButtons]);

  // Update indicator position
  useEffect(() => {
    if (variant !== 'underline' || !indicatorRef.current) return;

    const activeTabElement = tabRefs.current.get(activeTabId);
    if (!activeTabElement) return;

    const { offsetLeft, offsetWidth } = activeTabElement;
    indicatorRef.current.style.transform = `translateX(${offsetLeft}px)`;
    indicatorRef.current.style.width = `${offsetWidth}px`;
  }, [activeTabId, variant, tabs]);

  // Scroll active tab into view
  useEffect(() => {
    if (!scrollable || !tabsRef.current) return;

    if (!activeTabElement) return;

    const container = tabsRef.current;
    const { offsetLeft, offsetWidth } = activeTabElement;
    const { scrollLeft, clientWidth } = container;

    if (offsetLeft < scrollLeft) {
      container.scrollTo({ left: offsetLeft - 20, behavior: 'smooth' });
    } else if (offsetLeft + offsetWidth > scrollLeft + clientWidth) {
      container.scrollTo({ 
        left: offsetLeft + offsetWidth - clientWidth + 20, 
        behavior: 'smooth' 
      });
    }, [activeTabId, scrollable]);

  const handleTabClick = useCallback((tabId: string, disabled?: boolean) => {
    if (disabled) return;

    if (activeTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onChange?.(tabId);
  }, [activeTab, onChange]);

  const handleScroll = useCallback((direction: 'left' | 'right') => {
    if (!tabsRef.current) return;

    const scrollAmount = 200;
    const { scrollLeft } = tabsRef.current;
    const newScrollLeft = direction === 'left' 
      ? scrollLeft - scrollAmount 
      : scrollLeft + scrollAmount;

    tabsRef.current.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  }, []);

  const startScrolling = useCallback((direction: 'left' | 'right') => {
    handleScroll(direction);
    scrollIntervalRef.current = setInterval(() => handleScroll(direction), 300);
  }, [handleScroll]);

  const stopScrolling = useCallback(() => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }, []);

  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3'
  };

  const variantClasses = {
    default: 'border-b border-gray-200 dark:border-gray-700',
    pills: 'bg-gray-100 dark:bg-gray-800 p-1 rounded-lg',
    underline: 'relative',
    enclosed: 'border border-gray-200 dark:border-gray-700 rounded-lg p-1'
  };

  const tabVariantClasses = {
    default: cn(
      'hover:text-gray-700 dark:hover:text-gray-300',
      'border-b-2 border-transparent',
      'data-[active=true]:border-primary-500 data-[active=true]:text-primary-600',
      'dark:data-[active=true]:border-primary-400 dark:data-[active=true]:text-primary-400'
    ),
    pills: cn(
      'rounded-md',
      'hover:bg-gray-200 dark:hover:bg-gray-700',
      'data-[active=true]:bg-white dark:data-[active=true]:bg-gray-900',
      'data-[active=true]:shadow-sm'
    ),
    underline: cn(
      'hover:text-gray-700 dark:hover:text-gray-300',
      'data-[active=true]:text-primary-600 dark:data-[active=true]:text-primary-400'
    ),
    enclosed: cn(
      'rounded-md',
      'hover:bg-gray-100 dark:hover:bg-gray-700',
      'data-[active=true]:bg-white dark:data-[active=true]:bg-gray-900',
      'data-[active=true]:shadow-sm'
    )
  };

  const contextValue = useMemo(() => ({
    activeTabId,
    setActiveTab: handleTabClick
  }), [activeTabId, handleTabClick]);

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('w-full', className)}>
        <div className={cn('relative', orientation === 'vertical' && 'flex')}>
          {/* Scroll button left */}
          {scrollable && showLeftScroll && orientation === 'horizontal' && (
            <button
              type="button"
              onClick={() => handleScroll('left')}
              onMouseDown={() => startScrolling('left')}
              onMouseUp={stopScrolling}
              onMouseLeave={stopScrolling}
              className={cn(
                'absolute left-0 top-0 z-10 h-full px-2',
                'bg-gradient-to-r from-white dark:from-gray-900 to-transparent',
                'hover:from-gray-50 dark:hover:from-gray-800',
                'focus:outline-none focus:ring-2 focus:ring-primary-500'
              )}
              aria-label={t('tabs.scrollLeft', 'Scroll left')}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}

          {/* Tabs container */}
          <div
            ref={tabsRef}
            role="tablist"
            aria-label={ariaLabel}
            aria-orientation={orientation}
            onScroll={checkScrollButtons}
            className={cn(
              'relative',)
              variantClasses[variant],
              scrollable && orientation === 'horizontal' && 'overflow-x-auto scrollbar-hide',
              orientation === 'vertical' && 'flex-col space-y-1 w-48',
              orientation === 'horizontal' && 'flex',
              fullWidth && orientation === 'horizontal' && 'w-full',
              centered && orientation === 'horizontal' && 'justify-center'
            )}
          >
            <div
              className={cn(
                'flex',
                orientation === 'vertical' && 'flex-col space-y-1',
                orientation === 'horizontal' && 'space-x-1',
                fullWidth && orientation === 'horizontal' && 'w-full'
              )}
            >
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  ref={(el) => {
                    if (el) tabRefs.current.set(tab.id, el);
                  }}
                  id={`tab-${tab.id}`}
                  role="tab"
                  type="button"
                  onClick={() => handleTabClick(tab.id, tab.disabled)}
                  disabled={tab.disabled}
                  aria-selected={activeTabId === tab.id}
                  aria-controls={`tabpanel-${tab.id}`}
                  aria-label={tab.ariaLabel || tab.label}
                  data-active={activeTabId === tab.id}
                  tabIndex={activeTabId === tab.id ? 0 : -1}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight' && orientation === 'horizontal') {
                      const nextTab = tabs[index + 1];
                      if (nextTab && !nextTab.disabled) {
                        handleTabClick(nextTab.id);
                        tabRefs.current.get(nextTab.id)?.focus();
                      } else if (e.key === 'ArrowLeft' && orientation === 'horizontal') {
                      const prevTab = tabs[index - 1];
                      if (prevTab && !prevTab.disabled) {
                        handleTabClick(prevTab.id);
                        tabRefs.current.get(prevTab.id)?.focus();
                      } else if (e.key === 'ArrowDown' && orientation === 'vertical') {
                      if (nextTab && !nextTab.disabled) {
                        handleTabClick(nextTab.id);
                        tabRefs.current.get(nextTab.id)?.focus();
                      } else if (e.key === 'ArrowUp' && orientation === 'vertical') {
                      if (prevTab && !prevTab.disabled) {
                        handleTabClick(prevTab.id);
                        tabRefs.current.get(prevTab.id)?.focus();
                      } else if (e.key === 'Home') {
                      const firstEnabledTab = tabs.find(t => !t.disabled);
                      if (firstEnabledTab) {
                        handleTabClick(firstEnabledTab.id);
                        tabRefs.current.get(firstEnabledTab.id)?.focus();
                      } else if (e.key === 'End') {
 
}}}}}
}
}
}
}
}
}
}
}
