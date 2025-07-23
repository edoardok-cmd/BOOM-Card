import { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'success' | 'warning' | 'ghost' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type ButtonShape = 'default' | 'rounded' | 'pill' | 'square';

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  /**
   * The variant style of the button
   * @default 'primary'
   */
  variant?: ButtonVariant;
  
  /**
   * The size of the button
   * @default 'md'
   */
  size?: ButtonSize;
  
  /**
   * The shape of the button
   * @default 'default'
   */
  shape?: ButtonShape;
  
  /**
   * Whether the button should take full width of its container
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Whether to show loading state
   * @default false
   */
  loading?: boolean;
  
  /**
   * Custom loading text to display when loading
   */
  loadingText?: string;
  
  /**
   * Icon to display before the button text
   */
  leftIcon?: ReactNode;
  
  /**
   * Icon to display after the button text
   */
  rightIcon?: ReactNode;
  
  /**
   * Whether to render the button as an icon-only button
   * @default false
   */
  iconOnly?: boolean;
  
  /**
   * Aria label for accessibility (required when iconOnly is true)
   */
  ariaLabel?: string;
  
  /**
   * The button type
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';
  
  /**
   * Whether the button is in active/pressed state
   * @default false
   */
  active?: boolean;
  
  /**
   * Custom className to be merged with default styles
   */
  className?: string;
  
  /**
   * Children content of the button
   */
  children?: ReactNode;
  
  /**
   * Whether to apply hover animation
   * @default true
   */
  animate?: boolean;
  
  /**
   * Whether to show ripple effect on click
   * @default true
   */
  ripple?: boolean;
  
  /**
   * Custom ripple color
   */
  rippleColor?: string;
  
  /**
   * Tooltip text to display on hover
   */
  tooltip?: string;
  
  /**
   * Position of the tooltip
   * @default 'top'
   */
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
  
  /**
   * Whether to show a badge on the button
   */
  badge?: string | number;
  
  /**
   * Position of the badge
   * @default 'top-right'
   */
  badgePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  
  /**
   * Badge variant style
   * @default 'primary'
   */
  badgeVariant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  
  /**
   * Whether the button should have a gradient background
   * @default false
   */
  gradient?: boolean;
  
  /**
   * Custom gradient colors [from, to]
   */
  gradientColors?: [string, string];
  
  /**
   * Whether to show a shadow
   * @default false
   */
  shadow?: boolean;
  
  /**
   * Shadow size
   * @default 'md'
   */
  shadowSize?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Border style
   */
  borderStyle?: 'solid' | 'dashed' | 'dotted';
  
  /**
   * Whether the button should glow on hover
   * @default false
   */
  glow?: boolean;
  
  /**
   * Custom glow color
   */
  glowColor?: string;
  
  /**
   * Whether to uppercase the text
   * @default false
   */
  uppercase?: boolean;
  
  /**
   * Font weight of the button text
   * @default 'medium'
   */
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  
  /**
   * Letter spacing
   * @default 'normal'
   */
  letterSpacing?: 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest';
  
  /**
   * Text alignment within the button
   * @default 'center'
   */
  textAlign?: 'left' | 'center' | 'right';
  
  /**
   * Whether to truncate overflow text
   * @default false
   */
  truncate?: boolean;
  
  /**
   * Disable all animations
   * @default false
   */
  disableAnimations?: boolean;
  
  /**
   * Custom transition duration in ms
   * @default 200
   */
  transitionDuration?: number;
  
  /**
   * Whether the button is in a selected state
   * @default false
   */
  selected?: boolean;
  
  /**
   * Group name for button groups
   */
  group?: string;
  
  /**
   * Position within a button group
   */
  groupPosition?: 'first' | 'middle' | 'last' | 'only';
  
  /**
   * Custom color override
   */
  color?: string;
  
  /**
   * Custom background color override
   */
  backgroundColor?: string;
  
  /**
   * Custom border color override
   */
  borderColor?: string;
  
  /**
   * Accessibility: whether button is expanded
   */
  ariaExpanded?: boolean;
  
  /**
   * Accessibility: controls another element
   */
  ariaControls?: string;
  
  /**
   * Accessibility: describes the button
   */
  ariaDescribedBy?: string;
  
  /**
   * Data attributes for testing
   */
  dataTestId?: string;
  
  /**
   * Analytics tracking ID
   */
  trackingId?: string;
  
  /**
   * Analytics event name
   */
  trackingEvent?: string;
  
  /**
   * Custom analytics data
   */
  trackingData?: Record<string, any>;
  
  /**
   * Callback fired when button gains focus
   */
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  
  /**
   * Callback fired when button loses focus
   */
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  
  /**
   * Callback fired on mouse enter
   */
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /**
   * Callback fired on mouse leave
   */
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /**
   * Callback fired on mouse down
   */
  onMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /**
   * Callback fired on mouse up
   */
  onMouseUp?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  
  /**
   * Callback fired on key down
   */
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  
  /**
   * Callback fired on key up
   */
  onKeyUp?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  
  /**
   * Callback fired on animation end
   */
  onAnimationEnd?: () => void;
  
  /**
   * Whether to prevent default on click
   * @default false
   */
  preventDefault?: boolean;
  
  /**
   * Whether to stop propagation on click
   * @default false
   */
  stopPropagation?: boolean;
  
  /**
   * Debounce delay for click events in ms
   */
  debounceDelay?: number;
  
  /**
   * Whether button click should trigger haptic feedback on mobile
   * @default false
   */
  hapticFeedback?: boolean;
  
  /**
   * Custom render function for button content
   */
  renderContent?: (props: ButtonContentRenderProps) => ReactNode;
}

export interface ButtonContentRenderProps {
  loading: boolean;
  children: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export interface ButtonGroupProps {
  /**
   * The buttons in the group
   */
  children: ReactNode;
  
  /**
   * Whether buttons should be attached
   * @default true
   */
  attached?: boolean;
  
  /**
   * Orientation of the group
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  
  /**
   * Size for all buttons in the group
   */
  size?: ButtonSize;
  
  /**
   * Variant for all buttons in the group
   */
  variant?: ButtonVariant;
  
  /**
   * Whether the group should take full width
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Custom className
   */
  className?: string;
  
  /**
   * Gap between buttons when not attached
   * @default 'sm'
   */
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Whether to wrap buttons on small screens
   * @default false
   */
  wrap?: boolean;
  
  /**
   * Alignment of buttons
   * @default 'start'
   */
  align?: 'start' | 'center' | 'end' | 'stretch';
  
  /**
   * Justify content
   * @default 'start'
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  
  /**
   * Role for accessibility
   * @default 'group'
   */
  role?: string;
  
  /**
   * Aria label for the group
   */
  ariaLabel?: string;
}

export interface ButtonToggleProps extends Omit<ButtonProps, 'onClick'> {
  /**
   * Whether the toggle is checked
   * @default false
   */
  checked?: boolean;
  
  /**
   * Default checked state for uncontrolled component
   * @default false
   */
  defaultChecked?: boolean;
  
  /**
   * Callback fired when toggle state changes
   */
  onChange?: (checked: boolean) => void;
  
  /**
   * Name attribute for form submission
   */
  name?: string;
  
  /**
   * Value attribute for form submission
   */
  value?: string;
}

export interface IconButtonProps extends Omit<ButtonProps, 'children' | 'leftIcon' | 'rightIcon' | 'iconOnly'> {
  /**
   * The icon to display
   */
  icon: ReactNode;
  
  /**
   * Aria label for accessibility (required)
   */
  ariaLabel: string;
}

export interface FloatingActionButtonProps extends IconButtonProps {
  /**
   * Position of the FAB
   * @default 'bottom-right'
   */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  
  /**
   * Whether the FAB should be fixed position
   * @default true
   */
  fixed?: boolean;
  
  /**
   * Offset from edges in pixels
   * @default { x: 16, y: 16 }
   */
  offset?: { x: number; y: number };
  
  /**
   * Z-index for stacking
   * @default 1000
   */
  zIndex?: number;
  
  /**
   * Whether to show extended label
   * @default false
   */
  extended?: boolean;
  
  /**
   * Label text when extended
   */
  label?: string;
  
  /**
   * Whether to auto-hide on scroll
   * @default false
   */
  autoHide?: boolean;
  
  /**
   * Scroll threshold for auto-hide
   * @default 100
   */
  scrollThreshold?: number;
}

export interface SplitButtonProps extends Omit<ButtonProps, 'rightIcon'> {
  /**
   * Options for the dropdown menu
   */
  options: SplitButtonOption[];
  
  /**
   * Callback fired when an option is selected
   */
  onOptionSelect?: (option: SplitButtonOption) => void;
  
  /**
   * Whether the dropdown is open
   */
  open?: boolean;
  
  /**
   * Default open state for uncontrolled component
   */
  defaultOpen?: boolean;
  
  /**
   * Callback fired when dropdown state changes
   */
  onOpenChange?: (open: boolean) => void;
  
  /**
   * Placement of the dropdown
   * @default 'bottom-end'
   */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end';
  
  /**
   * Custom dropdown icon
   */
  dropdownIcon?: ReactNode;
  
  /**
   * Aria label for dropdown button
   */
  dropdownAriaLabel?: string;
}

export interface SplitButtonOption {
  /**
   * Unique identifier
   */
  id: string;
  
  /**
   * Display label
   */
  label: string;
  
  /**
   * Optional icon
   */
  icon?: ReactNode;
  
  /**
   * Whether the option is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether to show a divider after this option
   * @default false
   */
  divider?: boolean;
  
  /**
   * Whether this option is dangerous/destructive
   * @default false
   */
  danger?: boolean;
  
  /**
   * Click handler for the option
   */
  onClick?: () => void;
}

export type ButtonRef = HTMLButtonElement;
