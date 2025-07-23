import React, { useState, useRef, useEffect, ReactNode, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { usePopper } from 'react-popper';
import type { Placement, PositioningStrategy } from '@popperjs/core';

export interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  placement?: Placement;
  trigger?: 'hover' | 'click' | 'focus' | 'manual';
  delay?: number;
  hideDelay?: number;
  disabled?: boolean;
  arrow?: boolean;
  offset?: [number, number];
  strategy?: PositioningStrategy;
  className?: string;
  contentClassName?: string;
  arrowClassName?: string;
  maxWidth?: number;
  zIndex?: number;
  interactive?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  testId?: string;
}

interface TooltipState {
  isOpen: boolean;
  showTimeout?: NodeJS.Timeout;
  hideTimeout?: NodeJS.Timeout;
}

const ARROW_SIZE = 8;
const DEFAULT_DELAY = 200;
const DEFAULT_HIDE_DELAY = 0;
const DEFAULT_MAX_WIDTH = 300;
const DEFAULT_Z_INDEX = 9999;

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = 'top',
  trigger = 'hover',
  delay = DEFAULT_DELAY,
  hideDelay = DEFAULT_HIDE_DELAY,
  disabled = false,
  arrow = true,
  offset = [0, 8],
  strategy = 'absolute',
  className = '',
  contentClassName = '',
  arrowClassName = '',
  maxWidth = DEFAULT_MAX_WIDTH,
  zIndex = DEFAULT_Z_INDEX,
  interactive = false,
  open: controlledOpen,
  onOpenChange,
  testId,
}) => {
  const { t } = useTranslation();
  const [state, setState] = useState<TooltipState>({ isOpen: false });
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null);
  const [arrowElement, setArrowElement] = useState<HTMLDivElement | null>(null);
  const childRef = useRef<HTMLElement>(null);

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : state.isOpen;

  const { styles, attributes, update } = usePopper(referenceElement, popperElement, {
    placement,
    strategy,
    modifiers: [
      {
        name: 'offset',
        options: {
          offset,
        },
      },
      {
        name: 'arrow',
        options: {
          element: arrowElement,
          padding: 5,
        },
      },
      {
        name: 'preventOverflow',
        options: {
          boundary: 'viewport',
          padding: 8,
        },
      },
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['bottom', 'top', 'left', 'right'],
        },
      },
    ],
  });

  // Clear timeouts on unmount
  useEffect(() => {
    return () => {
      if (state.showTimeout) clearTimeout(state.showTimeout);
      if (state.hideTimeout) clearTimeout(state.hideTimeout);
    };
  }, [state.showTimeout, state.hideTimeout]);

  // Update popper position when content changes
  useEffect(() => {
    if (isOpen && update) {
      update();
    }, [isOpen, update, content]);

  const handleOpen = () => {
    if (disabled) return;

    if (state.hideTimeout) {
      clearTimeout(state.hideTimeout);
      setState(prev => ({ ...prev, hideTimeout: undefined }));
    }

    const showTimeout = setTimeout(() => {
      if (isControlled) {
        onOpenChange?.(true);
      } else {
        setState(prev => ({ ...prev, isOpen: true }));
      }, delay);

    setState(prev => ({ ...prev, showTimeout }));
  };

  const handleClose = () => {
    if (state.showTimeout) {
      clearTimeout(state.showTimeout);
      setState(prev => ({ ...prev, showTimeout: undefined }));
    }

    const hideTimeout = setTimeout(() => {
      if (isControlled) {
        onOpenChange?.(false);
      } else {
        setState(prev => ({ ...prev, isOpen: false }));
      }, hideDelay);

    setState(prev => ({ ...prev, hideTimeout }));
  };

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    };

  // Event handlers based on trigger type
  const triggerProps: Record<string, any> = {};

  if (!isControlled && !disabled) {
    switch (trigger) {
      case 'hover':
        triggerProps.onMouseEnter = handleOpen;
        triggerProps.onMouseLeave = handleClose;
        if (interactive) {
          triggerProps.onFocus = handleOpen;
          triggerProps.onBlur = handleClose;
        }
        break;
      case 'click':
        triggerProps.onClick = (e: React.MouseEvent) => {
          e.stopPropagation();
          handleToggle();
        };
        break;
      case 'focus':
        triggerProps.onFocus = handleOpen;
        triggerProps.onBlur = handleClose;
        break;
    }

  // Handle click outside for click trigger
  useEffect(() => {
    if (trigger === 'click' && isOpen && !isControlled) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          referenceElement &&
          !referenceElement.contains(event.target as Node) &&
          popperElement &&
          !popperElement.contains(event.target as Node)
        ) {
          handleClose();
        };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [trigger, isOpen, isControlled, referenceElement, popperElement]);

  // Clone child element and attach ref and events
  const childElement = React.Children.only(children) as React.ReactElement;
  const triggerElement = React.cloneElement(childElement, {
    ...triggerProps,
    ref: (node: HTMLElement) => {
      setReferenceElement(node);
      if (childRef.current) {
        childRef.current = node;
      }
      // Handle original ref if exists
      const { ref } = childElement as any;
      if (ref) {
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref.current !== undefined) {
          ref.current = node;
        }
    },
  });

  const tooltipContent = (
    <AnimatePresence>
      {isOpen && content && (
        <motion.div
          ref={setPopperElement}
          style={{
            ...styles.popper,
            zIndex,
            maxWidth,
          }}
          {...attributes.popper}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className={`boom-tooltip ${className}`}
          data-testid={testId}
          onMouseEnter={interactive && trigger === 'hover' ? handleOpen : undefined}
          onMouseLeave={interactive && trigger === 'hover' ? handleClose : undefined}
        >
          <div
            className={`boom-tooltip__content ${contentClassName}`}
            style={{
              backgroundColor: 'var(--tooltip-bg, #1a1a1a)',
              color: 'var(--tooltip-color, #ffffff)',
              padding: 'var(--tooltip-padding, 8px 12px)',
              borderRadius: 'var(--tooltip-radius, 6px)',
              fontSize: 'var(--tooltip-font-size, 14px)',
              lineHeight: 'var(--tooltip-line-height, 1.5)',
              boxShadow: 'var(--tooltip-shadow, 0 2px 8px rgba(0, 0, 0, 0.15))',
            }}
          >
            {content}
          </div>
          {arrow && (
            <div
              ref={setArrowElement}
              style={styles.arrow}
              className={`boom-tooltip__arrow ${arrowClassName}`}
              data-popper-arrow
            >
              <div
                style={{
                  width: ARROW_SIZE,
                  height: ARROW_SIZE,
                  backgroundColor: 'var(--tooltip-bg, #1a1a1a)',
                  transform: 'rotate(45deg)',
                  position: 'absolute',
                  top: placement.startsWith('bottom') ? -ARROW_SIZE / 2 : 'auto',
                  bottom: placement.startsWith('top') ? -ARROW_SIZE / 2 : 'auto',
                  left: placement.startsWith('right') ? -ARROW_SIZE / 2 : 'auto',
                  right: placement.startsWith('left') ? -ARROW_SIZE / 2 : 'auto',
                }}
              />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {triggerElement}
      {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </>
  );
};

// CSS custom properties for theming
const tooltipStyles = `
  .boom-tooltip {
    pointer-events: none;
  }

  .boom-tooltip.interactive {
    pointer-events: auto;
  }

  .boom-tooltip__content {
    position: relative;
    z-index: 1;
  }

  .boom-tooltip__arrow {
    position: absolute;
    pointer-events: none;
  }

  .boom-tooltip__arrow > div {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  /* Dark theme support */
  [data-theme="dark"] {
    --tooltip-bg: #ffffff;
    --tooltip-color: #1a1a1a;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .boom-tooltip {
      --tooltip-font-size: 12px;
      --tooltip-padding: 6px 10px;
    }
`;

// Export styles for inclusion in global styles
export const tooltipGlobalStyles = tooltipStyles;

// Export variants for consistent styling
export const tooltipVariants = {
  default: {
    '--tooltip-bg': '#1a1a1a',
    '--tooltip-color': '#ffffff',
  },
  light: {
    '--tooltip-bg': '#ffffff',
    '--tooltip-color': '#1a1a1a',
    '--tooltip-shadow': '0 2px 12px rgba(0, 0, 0, 0.1)',
  },
  error: {
    '--tooltip-bg': '#dc2626',
    '--tooltip-color': '#ffffff',
  },
  success: {
    '--tooltip-bg': '#16a34a',
    '--tooltip-color': '#ffffff',
  },
  warning: {
    '--tooltip-bg': '#f59e0b',
    '--tooltip-color': '#ffffff',
  },
  info: {
    '--tooltip-bg': '#3b82f6',
    '--tooltip-color': '#ffffff',
  },
} as const;

export type TooltipVariant = keyof typeof tooltipVariants;

// Hook for programmatic tooltip control
export const useTooltip = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);

  const show = (tooltipContent?: ReactNode) => {
    if (tooltipContent) setContent(tooltipContent);
    setIsOpen(true);
  };

  const hide = () => {
    setIsOpen(false);
  };

  const toggle = () => {
    setIsOpen(prev => !prev);
  };

  return {
    isOpen,
    content,
    show,
    hide,
    toggle,
    setContent,
  };
};

export default Tooltip;

}
}
}
}
}
}
}
}
}
