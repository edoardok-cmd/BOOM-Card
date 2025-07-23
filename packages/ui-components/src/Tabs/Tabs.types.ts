import { ReactNode, HTMLAttributes } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  badge?: string | number;
  ariaLabel?: string;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /**
   * Array of tab items to render
   */
  tabs: TabItem[];
  
  /**
   * Currently active tab id
   */
  activeTab?: string;
  
  /**
   * Default active tab id (for uncontrolled component)
   */
  defaultActiveTab?: string;
  
  /**
   * Callback fired when active tab changes
   */
  onChange?: (tabId: string) => void;
  
  /**
   * Visual variant of the tabs
   */
  variant?: 'default' | 'pills' | 'underline' | 'bordered';
  
  /**
   * Size of the tabs
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Color scheme for the tabs
   */
  colorScheme?: 'primary' | 'secondary' | 'accent' | 'neutral';
  
  /**
   * Whether tabs should take full width
   */
  fullWidth?: boolean;
  
  /**
   * Orientation of the tabs
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * Whether to show dividers between tabs
   */
  showDividers?: boolean;
  
  /**
   * Whether tabs are scrollable when overflow
   */
  scrollable?: boolean;
  
  /**
   * Animation type for tab transitions
   */
  animation?: 'none' | 'fade' | 'slide';
  
  /**
   * Whether to lazy load tab content
   */
  lazyLoad?: boolean;
  
  /**
   * Whether to keep mounted inactive tabs
   */
  keepMounted?: boolean;
  
  /**
   * Custom class for tabs container
   */
  containerClassName?: string;
  
  /**
   * Custom class for tab list
   */
  tabListClassName?: string;
  
  /**
   * Custom class for tab panels
   */
  tabPanelClassName?: string;
  
  /**
   * Custom class for individual tabs
   */
  tabClassName?: string;
  
  /**
   * Accessibility label for the tab list
   */
  ariaLabel?: string;
}

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Tab items
   */
  tabs: TabItem[];
  
  /**
   * Active tab id
   */
  activeTab: string;
  
  /**
   * Tab click handler
   */
  onTabClick: (tabId: string) => void;
  
  /**
   * Visual variant
   */
  variant: TabsProps['variant'];
  
  /**
   * Size variant
   */
  size: TabsProps['size'];
  
  /**
   * Color scheme
   */
  colorScheme: TabsProps['colorScheme'];
  
  /**
   * Full width flag
   */
  fullWidth: boolean;
  
  /**
   * Orientation
   */
  orientation: TabsProps['orientation'];
  
  /**
   * Show dividers flag
   */
  showDividers: boolean;
  
  /**
   * Scrollable flag
   */
  scrollable: boolean;
  
  /**
   * Custom tab class
   */
  tabClassName?: string;
}

export interface TabProps extends HTMLAttributes<HTMLButtonElement> {
  /**
   * Tab item data
   */
  tab: TabItem;
  
  /**
   * Whether this tab is active
   */
  isActive: boolean;
  
  /**
   * Tab click handler
   */
  onTabClick: () => void;
  
  /**
   * Visual variant
   */
  variant: TabsProps['variant'];
  
  /**
   * Size variant
   */
  size: TabsProps['size'];
  
  /**
   * Color scheme
   */
  colorScheme: TabsProps['colorScheme'];
  
  /**
   * Orientation
   */
  orientation: TabsProps['orientation'];
  
  /**
   * Tab index in the list
   */
  index: number;
  
  /**
   * Total number of tabs
   */
  totalTabs: number;
}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Tab item data
   */
  tab: TabItem;
  
  /**
   * Whether this panel is active
   */
  isActive: boolean;
  
  /**
   * Animation type
   */
  animation: TabsProps['animation'];
  
  /**
   * Whether to keep mounted when inactive
   */
  keepMounted: boolean;
  
  /**
   * Whether to lazy load content
   */
  lazyLoad: boolean;
  
  /**
   * Whether content has been loaded
   */
  hasLoaded: boolean;
}

export interface TabIndicatorProps {
  /**
   * Position and dimensions of the indicator
   */
  position: {
    left: number;
    width: number;
    top?: number;
    height?: number;
  };
  
  /**
   * Visual variant
   */
  variant: TabsProps['variant'];
  
  /**
   * Color scheme
   */
  colorScheme: TabsProps['colorScheme'];
  
  /**
   * Orientation
   */
  orientation: TabsProps['orientation'];
}

export interface TabScrollButtonProps extends HTMLAttributes<HTMLButtonElement> {
  /**
   * Scroll direction
   */
  direction: 'left' | 'right' | 'up' | 'down';
  
  /**
   * Whether button is visible
   */
  visible: boolean;
  
  /**
   * Size variant
   */
  size: TabsProps['size'];
  
  /**
   * Color scheme
   */
  colorScheme: TabsProps['colorScheme'];
}

export interface TabBadgeProps {
  /**
   * Badge content
   */
  content: string | number;
  
  /**
   * Whether tab is active
   */
  isActive: boolean;
  
  /**
   * Color scheme
   */
  colorScheme: TabsProps['colorScheme'];
  
  /**
   * Size variant
   */
  size: TabsProps['size'];
}

// Utility types for styling
export type TabVariantStyles = {
  container: string;
  tabList: string;
  tab: string;
  activeTab: string;
  disabledTab: string;
  tabPanel: string;
  indicator: string;
};

export type TabSizeStyles = {
  tab: string;
  icon: string;
  badge: string;
  fontSize: string;
  padding: string;
};

export type TabColorSchemeStyles = {
  tab: string;
  activeTab: string;
  indicator: string;
  badge: string;
};

// Event types
export interface TabChangeEvent {
  tabId: string;
  previousTabId: string;
  index: number;
}

// Context type for internal state management
export interface TabsContextValue {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  variant: TabsProps['variant'];
  size: TabsProps['size'];
  colorScheme: TabsProps['colorScheme'];
  orientation: TabsProps['orientation'];
  animation: TabsProps['animation'];
  lazyLoad: boolean;
  keepMounted: boolean;
  loadedTabs: Set<string>;
  markTabAsLoaded: (tabId: string) => void;
}
