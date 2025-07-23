import { ReactNode, MouseEvent, KeyboardEvent } from 'react';

export interface MenuItemOption {
  id: string;
  label: string;
  value: string;
  icon?: ReactNode;
  disabled?: boolean;
  description?: string;
  badge?: string | number;
  badgeVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  divider?: boolean;
  submenu?: MenuItemOption[];
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  href?: string;
  target?: '_blank' | '_self' | '_parent' | '_top';
  rel?: string;
  className?: string;
  role?: string;
  'aria-label'?: string;
  'data-testid'?: string;
}

export interface MenuGroupOption {
  id: string;
  label?: string;
  items: MenuItemOption[];
  className?: string;
}

export type MenuAlignment = 'left' | 'right' | 'center';
export type MenuPlacement = 'top' | 'bottom' | 'left' | 'right' | 'auto';
export type MenuTrigger = 'click' | 'hover' | 'focus' | 'contextmenu';
export type MenuSize = 'small' | 'medium' | 'large';
export type MenuVariant = 'default' | 'primary' | 'secondary' | 'ghost';

export interface MenuProps {
  id?: string;
  items?: MenuItemOption[];
  groups?: MenuGroupOption[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  triggerClassName?: string;
  menuClassName?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  disabledItemClassName?: string;
  placement?: MenuPlacement;
  alignment?: MenuAlignment;
  triggerOn?: MenuTrigger | MenuTrigger[];
  size?: MenuSize;
  variant?: MenuVariant;
  closeOnSelect?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  showArrow?: boolean;
  offset?: number;
  flip?: boolean;
  preventOverflow?: boolean;
  boundary?: HTMLElement | 'viewport' | 'scrollParent';
  maxHeight?: number | string;
  minWidth?: number | string;
  maxWidth?: number | string;
  zIndex?: number;
  portalTarget?: HTMLElement | null;
  animationDuration?: number;
  onSelect?: (item: MenuItemOption) => void;
  onClose?: () => void;
  onOpen?: () => void;
  renderItem?: (item: MenuItemOption, index: number) => ReactNode;
  renderGroup?: (group: MenuGroupOption, index: number) => ReactNode;
  emptyMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
  error?: boolean;
  errorMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchEmptyMessage?: string;
  virtualScroll?: boolean;
  itemHeight?: number;
  overscan?: number;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  role?: string;
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

export interface MenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  selectedItem: MenuItemOption | null;
  setSelectedItem: (item: MenuItemOption | null) => void;
  placement: MenuPlacement;
  alignment: MenuAlignment;
  size: MenuSize;
  variant: MenuVariant;
  closeOnSelect: boolean;
  onSelect?: (item: MenuItemOption) => void;
  searchValue: string;
  setSearchValue: (value: string) => void;
  filteredItems: MenuItemOption[];
  flattenedItems: MenuItemOption[];
  registerItem: (id: string, element: HTMLElement) => void;
  unregisterItem: (id: string) => void;
  focusItem: (id: string) => void;
  handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

export interface MenuItemProps extends Omit<MenuItemOption, 'id'> {
  index?: number;
  isActive?: boolean;
  isSelected?: boolean;
  onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (event: MouseEvent<HTMLElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
}

export interface MenuGroupProps extends Omit<MenuGroupOption, 'id'> {
  index?: number;
}

export interface MenuSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
  clearable?: boolean;
  onClear?: () => void;
  autoFocus?: boolean;
  'aria-label'?: string;
  'data-testid'?: string;
}

export interface MenuDividerProps {
  className?: string;
  style?: React.CSSProperties;
}

export interface MenuHeaderProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface MenuFooterProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface UseMenuOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  placement?: MenuPlacement;
  alignment?: MenuAlignment;
  triggerOn?: MenuTrigger | MenuTrigger[];
  closeOnSelect?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  items?: MenuItemOption[];
  groups?: MenuGroupOption[];
  searchable?: boolean;
  onSelect?: (item: MenuItemOption) => void;
}

export interface UseMenuReturn {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  triggerProps: {
    ref: React.RefObject<HTMLElement>;
    onClick?: (event: MouseEvent<HTMLElement>) => void;
    onMouseEnter?: (event: MouseEvent<HTMLElement>) => void;
    onMouseLeave?: (event: MouseEvent<HTMLElement>) => void;
    onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
    onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
    onContextMenu?: (event: MouseEvent<HTMLElement>) => void;
    'aria-haspopup': 'menu';
    'aria-expanded': boolean;
    'aria-controls'?: string;
  };
  menuProps: {
    ref: React.RefObject<HTMLElement>;
    role: 'menu';
    'aria-labelledby'?: string;
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  };
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  selectedItem: MenuItemOption | null;
  searchValue: string;
  setSearchValue: (value: string) => void;
  filteredItems: MenuItemOption[];
  flattenedItems: MenuItemOption[];
}

export interface MenuPositionOptions {
  triggerElement: HTMLElement | null;
  menuElement: HTMLElement | null;
  placement: MenuPlacement;
  alignment: MenuAlignment;
  offset: number;
  flip: boolean;
  preventOverflow: boolean;
  boundary: HTMLElement | 'viewport' | 'scrollParent';
}

export interface MenuPosition {
  top: number;
  left: number;
  transformOrigin: string;
  placement: MenuPlacement;
  alignment: MenuAlignment;
}

export interface MenuKeyboardHandlers {
  ArrowUp: () => void;
  ArrowDown: () => void;
  ArrowLeft: () => void;
  ArrowRight: () => void;
  Home: () => void;
  End: () => void;
  Enter: () => void;
  Space: () => void;
  Escape: () => void;
  Tab: (shiftKey: boolean) => void;
}

export interface MenuAccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-haspopup'?: 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
  'aria-expanded'?: boolean;
  'aria-controls'?: string;
  'aria-activedescendant'?: string;
  'aria-orientation'?: 'horizontal' | 'vertical';
  'aria-disabled'?: boolean;
  'aria-busy'?: boolean;
  'aria-live'?: 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
  role?: string;
  tabIndex?: number;
}

export interface MenuAnimationOptions {
  duration?: number;
  easing?: string;
  enterFrom?: string;
  enterTo?: string;
  exitFrom?: string;
  exitTo?: string;
}

export interface MenuTheme {
  colors: {
    background: string;
    backgroundHover: string;
    backgroundActive: string;
    backgroundDisabled: string;
    text: string;
    textHover: string;
    textActive: string;
    textDisabled: string;
    border: string;
    divider: string;
    shadow: string;
    scrollbar: string;
    scrollbarThumb: string;
  };
  spacing: {
    paddingX: string;
    paddingY: string;
    itemPaddingX: string;
    itemPaddingY: string;
    groupPaddingY: string;
    searchPadding: string;
  };
  typography: {
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
    fontFamily: string;
  };
  borderRadius: string;
  boxShadow: string;
  transition: string;
}

export interface MenuStaticMethods {
  show: (options: MenuShowOptions) => void;
  hide: (id?: string) => void;
  hideAll: () => void;
  update: (id: string, options: Partial<MenuShowOptions>) => void;
}

export interface MenuShowOptions extends Omit<MenuProps, 'trigger' | 'open' | 'defaultOpen'> {
  id?: string;
  triggerElement: HTMLElement;
  onClose?: () => void;
}
