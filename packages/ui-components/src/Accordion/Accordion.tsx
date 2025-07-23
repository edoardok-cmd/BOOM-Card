import React, { useState, useRef, useEffect, createContext, useContext } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

// Context for managing accordion state
interface AccordionContextValue {
  expandedItems: Set<string>;
  toggleItem: (id: string) => void;
  allowMultiple: boolean;
}

const AccordionContext = createContext<AccordionContextValue | null>(null);

// Hook to use accordion context
const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error('useAccordion must be used within an AccordionProvider');
  }
  return context;
};

// Types and interfaces
export interface AccordionProps {
  children: React.ReactNode;
  allowMultiple?: boolean;
  defaultExpanded?: string[];
  className?: string;
  variant?: 'default' | 'bordered' | 'separated';
  size?: 'sm' | 'md' | 'lg';
}

export interface AccordionItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export interface AccordionTriggerProps {
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export interface AccordionContentProps {
  children: React.ReactNode;
  className?: string;
  transitionDuration?: number;
}

// Accordion root component
export const Accordion: React.FC<AccordionProps> = ({
  children,
  allowMultiple = false,
  defaultExpanded = [],
  className,
  variant = 'default',
  size = 'md',
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(defaultExpanded)
  );

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(id);
      }
      
      return newSet;
    });
  };

  const variantClasses = {
    default: 'divide-y divide-gray-200',
    bordered: 'border border-gray-200 rounded-lg divide-y divide-gray-200',
    separated: 'space-y-2',
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <AccordionContext.Provider value={{ expandedItems, toggleItem, allowMultiple }}>
      <div
        className={twMerge(
          'w-full',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        role="presentation"
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
};

// Accordion item component
export const AccordionItem: React.FC<AccordionItemProps> = ({
  id,
  children,
  className,
  disabled = false,
}) => {
  const { expandedItems } = useAccordion();
  const isExpanded = expandedItems.has(id);

  return (
    <div
      className={twMerge(
        'group',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      data-state={isExpanded ? 'open' : 'closed'}
      data-disabled={disabled}
    >
      {children}
    </div>
  );
};

// Accordion trigger component
export const AccordionTrigger: React.FC<AccordionTriggerProps> = ({
  children,
  className,
  icon,
  iconPosition = 'right',
}) => {
  const parentItem = useRef<HTMLElement | null>(null);
  const { expandedItems, toggleItem } = useAccordion();
  const [itemId, setItemId] = useState<string | null>(null);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    // Find parent AccordionItem to get id and disabled state
    let parent = parentItem.current?.parentElement;
    while (parent) {
      if (parent.hasAttribute('data-state')) {
        const item = parent.querySelector('[data-accordion-item-id]');
        if (item) {
          setItemId(item.getAttribute('data-accordion-item-id'));
        }
        setIsDisabled(parent.getAttribute('data-disabled') === 'true');
        break;
      }
      parent = parent.parentElement;
    }, []);


  const handleClick = () => {
    if (itemId && !isDisabled) {
      toggleItem(itemId);
    };

  const iconElement = icon || (
    <ChevronDownIcon
      className={twMerge(
        'h-4 w-4 transition-transform duration-200',
        isExpanded && 'rotate-180'
      )}
    />
  );

  return (
    <button
      ref={parentItem as any}
      type="button"
      onClick={handleClick}
      disabled={isDisabled}
      aria-expanded={isExpanded}
      className={twMerge(
        'flex w-full items-center justify-between py-4 px-5 text-left transition-colors',
        'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50',
        'disabled:cursor-not-allowed disabled:hover:bg-transparent',
        className
      )}
    >
      {iconPosition === 'left' && (
        <span className="mr-3 flex-shrink-0">{iconElement}</span>
      )}
      <span className="flex-1">{children}</span>
      {iconPosition === 'right' && (
        <span className="ml-3 flex-shrink-0">{iconElement}</span>
      )}
    </button>
  );
};

// Accordion content component
export const AccordionContent: React.FC<AccordionContentProps> = ({
  children,
  className,
  transitionDuration = 200,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const { expandedItems } = useAccordion();
  const [itemId, setItemId] = useState<string | null>(null);
  const [height, setHeight] = useState<number>(0);

  useEffect(() => {
    // Find parent AccordionItem to get id
    while (parent) {
      if (parent.hasAttribute('data-state')) {
        if (item) {
          setItemId(item.getAttribute('data-accordion-item-id'));
        }
        break;
      }
      parent = parent.parentElement;
    }, []);

  useEffect(() => {
    if (contentRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setHeight(entry.contentRect.height);
        });

      resizeObserver.observe(contentRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }, []);


  return (
    <div ref={parentItem as any}>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: transitionDuration / 1000 },
              opacity: { duration: (transitionDuration / 1000) * 0.5 },
            }}
            className="overflow-hidden"
          >
            <div
              ref={contentRef}
              className={twMerge('px-5 pb-4 pt-0', className)}
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Hidden element to store item ID
export const AccordionItemId: React.FC<{ id: string }> = ({ id }) => {
  return <div data-accordion-item-id={id} className="hidden" />;
};

// Compound component pattern
Accordion.displayName = 'Accordion';
AccordionItem.displayName = 'AccordionItem';
AccordionTrigger.displayName = 'AccordionTrigger';
AccordionContent.displayName = 'AccordionContent';

// Export everything
export default Accordion;

}
}
}
}
}
