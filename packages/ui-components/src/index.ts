// Core UI Components
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { Card } from './components/Card';
export type { CardProps } from './components/Card';

export { Input } from './components/Input';
export type { InputProps } from './components/Input';

export { Select } from './components/Select';
export type { SelectProps } from './components/Select';

export { Modal } from './components/Modal';
export type { ModalProps } from './components/Modal';

export { Dropdown } from './components/Dropdown';
export type { DropdownProps } from './components/Dropdown';

export { Tabs } from './components/Tabs';
export type { TabsProps } from './components/Tabs';

export { Badge } from './components/Badge';
export type { BadgeProps } from './components/Badge';

export { Avatar } from './components/Avatar';
export type { AvatarProps } from './components/Avatar';

export { Spinner } from './components/Spinner';
export type { SpinnerProps } from './components/Spinner';

export { Toast } from './components/Toast';
export type { ToastProps } from './components/Toast';

export { Tooltip } from './components/Tooltip';
export type { TooltipProps } from './components/Tooltip';

// Layout Components
export { Container } from './components/layout/Container';
export type { ContainerProps } from './components/layout/Container';

export { Grid } from './components/layout/Grid';
export type { GridProps } from './components/layout/Grid';

export { Stack } from './components/layout/Stack';
export type { StackProps } from './components/layout/Stack';

export { Divider } from './components/layout/Divider';
export type { DividerProps } from './components/layout/Divider';

// Navigation Components
export { Navbar } from './components/navigation/Navbar';
export type { NavbarProps } from './components/navigation/Navbar';

export { Breadcrumb } from './components/navigation/Breadcrumb';
export type { BreadcrumbProps } from './components/navigation/Breadcrumb';

export { Pagination } from './components/navigation/Pagination';
export type { PaginationProps } from './components/navigation/Pagination';

export { Sidebar } from './components/navigation/Sidebar';
export type { SidebarProps } from './components/navigation/Sidebar';

// Data Display Components
export { Table } from './components/data/Table';
export type { TableProps } from './components/data/Table';

export { List } from './components/data/List';
export type { ListProps } from './components/data/List';

export { Stat } from './components/data/Stat';
export type { StatProps } from './components/data/Stat';

export { Progress } from './components/data/Progress';
export type { ProgressProps } from './components/data/Progress';

// Form Components
export { Form } from './components/form/Form';
export type { FormProps } from './components/form/Form';

export { Checkbox } from './components/form/Checkbox';
export type { CheckboxProps } from './components/form/Checkbox';

export { Radio } from './components/form/Radio';
export type { RadioProps } from './components/form/Radio';

export { Switch } from './components/form/Switch';
export type { SwitchProps } from './components/form/Switch';

export { Slider } from './components/form/Slider';
export type { SliderProps } from './components/form/Slider';

export { DatePicker } from './components/form/DatePicker';
export type { DatePickerProps } from './components/form/DatePicker';

export { FileUpload } from './components/form/FileUpload';
export type { FileUploadProps } from './components/form/FileUpload';

// Feedback Components
export { Alert } from './components/feedback/Alert';
export type { AlertProps } from './components/feedback/Alert';

export { Skeleton } from './components/feedback/Skeleton';
export type { SkeletonProps } from './components/feedback/Skeleton';

export { EmptyState } from './components/feedback/EmptyState';
export type { EmptyStateProps } from './components/feedback/EmptyState';

// BOOM Card Specific Components
export { DiscountCard } from './components/boom/DiscountCard';
export type { DiscountCardProps } from './components/boom/DiscountCard';

export { PartnerCard } from './components/boom/PartnerCard';
export type { PartnerCardProps } from './components/boom/PartnerCard';

export { QRScanner } from './components/boom/QRScanner';
export type { QRScannerProps } from './components/boom/QRScanner';

export { QRGenerator } from './components/boom/QRGenerator';
export type { QRGeneratorProps } from './components/boom/QRGenerator';

export { LocationMap } from './components/boom/LocationMap';
export type { LocationMapProps } from './components/boom/LocationMap';

export { CategoryFilter } from './components/boom/CategoryFilter';
export type { CategoryFilterProps } from './components/boom/CategoryFilter';

export { DiscountBadge } from './components/boom/DiscountBadge';
export type { DiscountBadgeProps } from './components/boom/DiscountBadge';

export { RatingDisplay } from './components/boom/RatingDisplay';
export type { RatingDisplayProps } from './components/boom/RatingDisplay';

export { OpeningHours } from './components/boom/OpeningHours';
export type { OpeningHoursProps } from './components/boom/OpeningHours';

export { SubscriptionCard } from './components/boom/SubscriptionCard';
export type { SubscriptionCardProps } from './components/boom/SubscriptionCard';

export { TransactionHistory } from './components/boom/TransactionHistory';
export type { TransactionHistoryProps } from './components/boom/TransactionHistory';

export { SavingsTracker } from './components/boom/SavingsTracker';
export type { SavingsTrackerProps } from './components/boom/SavingsTracker';

// Charts & Analytics Components
export { BarChart } from './components/charts/BarChart';
export type { BarChartProps } from './components/charts/BarChart';

export { LineChart } from './components/charts/LineChart';
export type { LineChartProps } from './components/charts/LineChart';

export { PieChart } from './components/charts/PieChart';
export type { PieChartProps } from './components/charts/PieChart';

export { MetricCard } from './components/charts/MetricCard';
export type { MetricCardProps } from './components/charts/MetricCard';

// Icons
export * from './icons';

// Hooks
export { useTheme } from './hooks/useTheme';
export { useBreakpoint } from './hooks/useBreakpoint';
export { useToast } from './hooks/useToast';
export { useModal } from './hooks/useModal';
export { useLocale } from './hooks/useLocale';
export { useGeolocation } from './hooks/useGeolocation';
export { useQRScanner } from './hooks/useQRScanner';
export { useInfiniteScroll } from './hooks/useInfiniteScroll';
export { useDebounce } from './hooks/useDebounce';
export { useClickOutside } from './hooks/useClickOutside';

// Utils
export * from './utils/colors';
export * from './utils/spacing';
export * from './utils/typography';
export * from './utils/breakpoints';
export * from './utils/animations';
export * from './utils/shadows';
export * from './utils/formatters';
export * from './utils/validators';

// Themes
export { defaultTheme } from './themes/default';
export { darkTheme } from './themes/dark';
export type { Theme } from './themes/types';

// Providers
export { ThemeProvider } from './providers/ThemeProvider';
export type { ThemeProviderProps } from './providers/ThemeProvider';

export { LocaleProvider } from './providers/LocaleProvider';
export type { LocaleProviderProps } from './providers/LocaleProvider';

export { ToastProvider } from './providers/ToastProvider';
export type { ToastProviderProps } from './providers/ToastProvider';

// Types
export * from './types';

// Constants
export * from './constants';

// Version
export const VERSION = '1.0.0';
