import { ReactNode, HTMLAttributes } from 'react';

export interface AccordionItem {
  id: string;
  title: string | ReactNode;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
  badge?: string | number;
  badgeVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';
}

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  items: AccordionItem[];
  defaultOpenItems?: string[];
  openItems?: string[];
  onChange?: (openItems: string[]) => void;
  allowMultiple?: boolean;
  collapsible?: boolean;
  variant?: 'default' | 'bordered' | 'separated' | 'flush';
  size?: 'sm' | 'md' | 'lg';
  iconPosition?: 'left' | 'right';
  expandIcon?: ReactNode;
  collapseIcon?: ReactNode;
  animationDuration?: number;
  disabled?: boolean;
  className?: string;
  itemClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
  onItemClick?: (itemId: string, isOpen: boolean) => void;
  renderHeader?: (item: AccordionItem, isOpen: boolean) => ReactNode;
  renderContent?: (item: AccordionItem) => ReactNode;
}

export interface AccordionHeaderProps {
  item: AccordionItem;
  isOpen: boolean;
  onClick: () => void;
  disabled?: boolean;
  iconPosition?: 'left' | 'right';
  expandIcon?: ReactNode;
  collapseIcon?: ReactNode;
  className?: string;
  renderHeader?: (item: AccordionItem, isOpen: boolean) => ReactNode;
}

export interface AccordionContentProps {
  item: AccordionItem;
  isOpen: boolean;
  animationDuration?: number;
  className?: string;
  renderContent?: (item: AccordionItem) => ReactNode;
}

export interface AccordionContextValue {
  openItems: string[];
  toggleItem: (itemId: string) => void;
  allowMultiple: boolean;
  collapsible: boolean;
}

export interface UseAccordionProps {
  defaultOpenItems?: string[];
  openItems?: string[];
  onChange?: (openItems: string[]) => void;
  allowMultiple?: boolean;
  collapsible?: boolean;
}

export interface UseAccordionReturn {
  openItems: string[];
  isItemOpen: (itemId: string) => boolean;
  toggleItem: (itemId: string) => void;
  openItem: (itemId: string) => void;
  closeItem: (itemId: string) => void;
  openAll: () => void;
  closeAll: () => void;
}
