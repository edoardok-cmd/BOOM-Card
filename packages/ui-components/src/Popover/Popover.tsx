import React, { useState, useRef, useEffect, useCallback, ReactNode, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { useKeyPress } from '../../hooks/useKeyPress';
import { cn } from '../../utils/cn';

export type PopoverPlacement = 
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export type PopoverTrigger = 'click' | 'hover' | 'focus' | 'manual';

export interface PopoverProps {
  children: ReactNode;
  content: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: PopoverPlacement;
  trigger?: PopoverTrigger;
  offset?: number;
  className?: string;
  contentClassName?: string;
  showArrow?: boolean;
  closeOnClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  delay?: number;
  animationDuration?: number;
  zIndex?: number;
  maxWidth?: number;
  minWidth?: number;
  portal?: boolean;
  portalContainer?: HTMLElement;
  disabled?: boolean;
  ariaLabel?: string;
  role?: string;
  id?: string;
  onClickOutside?: () => void;
}

interface PopoverPosition {
  top: number;
  left: number;
  placement: PopoverPlacement;
}

const ARROW_SIZE = 8;
const DEFAULT_OFFSET = 10;
const DEFAULT_ANIMATION_DURATION = 200;
const DEFAULT_DELAY = 200;

export const Popover: React.FC<PopoverProps> = ({
  children,
  content,
  isOpen: controlledIsOpen,
  onOpenChange,
  placement = 'bottom',
  trigger = 'click',
  offset = DEFAULT_OFFSET,
  className,
  contentClassName,
  showArrow = true,
  closeOnClick = true,
  closeOnEscape = true,
  showCloseButton = false,
  delay = DEFAULT_DELAY,
  animationDuration = DEFAULT_ANIMATION_DURATION,
  zIndex = 9999,
  maxWidth = 320,
  minWidth = 150,
  portal = true,
  portalContainer,
  disabled = false,
  ariaLabel,
  role = 'dialog',
  id,
  onClickOutside,
}) => {
  const { t } = useTranslation();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [position, setPosition] = useState<PopoverPosition>({ top: 0, left: 0, placement });
  const [isMounted, setIsMounted] = useState(false);
  
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : internalIsOpen;

  // Mount state for portal
  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      };
  }, []);

  // Handle open state changes
  const handleOpenChange = useCallback((open: boolean) => {
    if (disabled) return;
    
    if (isControlled) {
      onOpenChange?.(open);
    } else {
      setInternalIsOpen(open);
      onOpenChange?.(open);
    }, [disabled, isControlled, onOpenChange]);

  // Calculate popover position
  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !contentRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    let top = 0;
    let left = 0;
    let actualPlacement = placement;

    // Calculate initial position based on placement
    switch (placement) {
      case 'top':
        top = triggerRect.top - contentRect.height - offset;
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
        break;
      case 'top-start':
        top = triggerRect.top - contentRect.height - offset;
        left = triggerRect.left;
        break;
      case 'top-end':
        top = triggerRect.top - contentRect.height - offset;
        left = triggerRect.right - contentRect.width;
        break;
      case 'bottom':
        top = triggerRect.bottom + offset;
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
        break;
      case 'bottom-start':
        top = triggerRect.bottom + offset;
        left = triggerRect.left;
        break;
      case 'bottom-end':
        top = triggerRect.bottom + offset;
        left = triggerRect.right - contentRect.width;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
        left = triggerRect.left - contentRect.width - offset;
        break;
      case 'left-start':
        top = triggerRect.top;
        left = triggerRect.left - contentRect.width - offset;
        break;
      case 'left-end':
        top = triggerRect.bottom - contentRect.height;
        left = triggerRect.left - contentRect.width - offset;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - contentRect.height) / 2;
        left = triggerRect.right + offset;
        break;
      case 'right-start':
        top = triggerRect.top;
        left = triggerRect.right + offset;
        break;
      case 'right-end':
        top = triggerRect.bottom - contentRect.height;
        left = triggerRect.right + offset;
        break;
    }

    // Adjust for viewport boundaries
    if (left < 0) {
      left = offset;
    } else if (left + contentRect.width > viewport.width) {
      left = viewport.width - contentRect.width - offset;
    }

    if (top < 0) {
      // Flip to bottom
      if (placement.startsWith('top')) {
        top = triggerRect.bottom + offset;
        actualPlacement = placement.replace('top', 'bottom') as PopoverPlacement;
      } else {
        top = offset;
      } else if (top + contentRect.height > viewport.height) {
      // Flip to top
      if (placement.startsWith('bottom')) {
        top = triggerRect.top - contentRect.height - offset;
        actualPlacement = placement.replace('bottom', 'top') as PopoverPlacement;
      } else {
        top = viewport.height - contentRect.height - offset;
      }

    setPosition({ top, left, placement: actualPlacement });
  }, [placement, offset]);

  // Update position when open
  useEffect(() => {
    if (isOpen) {
      calculatePosition();
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition);
      
      return () => {
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition);
      };
    }, [isOpen, calculatePosition]);

  // Handle trigger events
  const handleTriggerClick = useCallback(() => {
    if (trigger === 'click') {
      handleOpenChange(!isOpen);
    }, [trigger, isOpen, handleOpenChange]);

  const handleTriggerMouseEnter = useCallback(() => {
    if (trigger === 'hover') {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = setTimeout(() => {
        handleOpenChange(true);
      }, delay);
    }, [trigger, delay, handleOpenChange]);

  const handleTriggerMouseLeave = useCallback(() => {
    if (trigger === 'hover') {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = setTimeout(() => {
        handleOpenChange(false);
      }, delay);
    }, [trigger, delay, handleOpenChange]);

  const handleTriggerFocus = useCallback(() => {
    if (trigger === 'focus') {
      handleOpenChange(true);
    }, [trigger, handleOpenChange]);

  const handleTriggerBlur = useCallback(() => {
    if (trigger === 'focus') {
      handleOpenChange(false);
    }, [trigger, handleOpenChange]);

  // Handle content click
  const handleContentClick = useCallback(() => {
    if (closeOnClick && trigger === 'click') {
      handleOpenChange(false);
    }, [closeOnClick, trigger, handleOpenChange]);

  // Handle click outside
  useClickOutside([triggerRef, contentRef], () => {
    if (isOpen) {
      handleOpenChange(false);
      onClickOutside?.();
    });

  // Handle escape key
  useKeyPress('Escape', () => {
    if (isOpen && closeOnEscape) {
      handleOpenChange(false);
    });

  // Get arrow styles
  const getArrowStyles = (): CSSProperties => {
    const styles: CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    };

    const arrowColor = 'var(--popover-bg, #ffffff)';

    switch (position.placement) {
      case 'top':
      case 'top-start':
      case 'top-end':
        styles.bottom = -ARROW_SIZE;
        styles.left = '50%';
        styles.transform = 'translateX(-50%)';
        styles.borderWidth = `${ARROW_SIZE}px ${ARROW_SIZE}px 0`;
        styles.borderColor = `${arrowColor} transparent transparent`;
        break;
      case 'bottom':
      case 'bottom-start':
      case 'bottom-end':
        styles.top = -ARROW_SIZE;
        styles.left = '50%';
        styles.transform = 'translateX(-50%)';
        styles.borderWidth = `0 ${ARROW_SIZE}px ${ARROW_SIZE}px`;
        styles.borderColor = `transparent transparent ${arrowColor}`;
        break;
      case 'left':
      case 'left-start':
      case 'left-end':
        styles.right = -ARROW_SIZE;
        styles.top = '50%';
        styles.transform = 'translateY(-50%)';
        styles.borderWidth = `${ARROW_SIZE}px 0 ${ARROW_SIZE}px ${ARROW_SIZE}px`;
        styles.borderColor = `transparent transparent transparent ${arrowColor}`;
        break;
      case 'right':
      case 'right-start':
      case 'right-end':
        styles.left = -ARROW_SIZE;
        styles.top = '50%';
        styles.transform = 'translateY(-50%)';
        styles.borderWidth = `${ARROW_SIZE}px ${ARROW_SIZE}px ${ARROW_SIZE}px 0`;
        styles.borderColor = `transparent ${arrowColor} transparent transparent`;
        break;
    }

    return styles;
  };

  // Animation variants
  const popoverVariants = {
    hidden: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: animationDuration / 1000,
      },
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: animationDuration / 1000,
      },
    },
  };

  // Render popover content
  const popoverContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={contentRef}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={popoverVariants}
          className={cn(
            'boom-popover',
            'fixed',
            'bg-white',
            'rounded-lg',
            'shadow-lg',
            'border',
            'border-gray-200',
            'p-4',
            'outline-none',
            contentClassName
          )}
          style={{
            top: position.top,
            left: position.left,
            zIndex,
            maxWidth,
            minWidth,
            '--popover-bg': '#ffffff',
          } as CSSProperties}
          role={role}
          aria-label={ariaLabel}
          id={id}
          onClick={handleContentClick}
          onMouseEnter={trigger === 'hover' ? handleTriggerMouseEnter : undefined}
          onMouseLeave={trigger === 'hover' ? handleTriggerMouseLeave : undefined}
        >
          {showCloseButton && (
            <button
              type="button"
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenChange(false);
              }}
              aria-label={t('common.close')}
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          )}
          
          {content}
          
  
}
}
}
}
}
}
}
}
}
}
}
}
}
}
}
