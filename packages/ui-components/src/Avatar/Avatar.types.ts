import { ReactNode } from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarVariant = 'circular' | 'rounded' | 'square';
export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps {
  /**
   * The source URL of the avatar image
   */
  src?: string;
  
  /**
   * Alternative text for the avatar image
   */
  alt?: string;
  
  /**
   * The name of the user - used for generating initials if no image is provided
   */
  name?: string;
  
  /**
   * The size of the avatar
   * @default 'md'
   */
  size?: AvatarSize;
  
  /**
   * The shape variant of the avatar
   * @default 'circular'
   */
  variant?: AvatarVariant;
  
  /**
   * User's online status indicator
   */
  status?: AvatarStatus;
  
  /**
   * Whether to show the status indicator
   * @default false
   */
  showStatus?: boolean;
  
  /**
   * Custom className for styling
   */
  className?: string;
  
  /**
   * Fallback icon to display when no image or initials are available
   */
  fallbackIcon?: ReactNode;
  
  /**
   * Background color for initials or fallback
   */
  backgroundColor?: string;
  
  /**
   * Text color for initials
   */
  textColor?: string;
  
  /**
   * Whether the avatar is clickable
   * @default false
   */
  clickable?: boolean;
  
  /**
   * Click handler for the avatar
   */
  onClick?: () => void;
  
  /**
   * Badge content to display on the avatar (e.g., notification count)
   */
  badge?: ReactNode;
  
  /**
   * Position of the badge
   * @default 'bottom-right'
   */
  badgePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  
  /**
   * Whether to lazy load the image
   * @default true
   */
  lazyLoad?: boolean;
  
  /**
   * Loading state of the avatar
   */
  loading?: boolean;
  
  /**
   * Error handler for image loading failures
   */
  onError?: (error: Event) => void;
  
  /**
   * Success handler for image loading
   */
  onLoad?: () => void;
  
  /**
   * ARIA label for accessibility
   */
  ariaLabel?: string;
  
  /**
   * Test ID for testing purposes
   */
  testId?: string;
}

export interface AvatarGroupProps {
  /**
   * Array of avatar props for each avatar in the group
   */
  avatars: AvatarProps[];
  
  /**
   * Maximum number of avatars to display before showing count
   * @default 4
   */
  max?: number;
  
  /**
   * Size of avatars in the group
   * @default 'md'
   */
  size?: AvatarSize;
  
  /**
   * Spacing between avatars (negative values for overlap)
   * @default -8
   */
  spacing?: number;
  
  /**
   * Custom className for the group container
   */
  className?: string;
  
  /**
   * Whether to show total count
   * @default true
   */
  showCount?: boolean;
  
  /**
   * Custom render function for the count badge
   */
  renderCount?: (remaining: number) => ReactNode;
  
  /**
   * Click handler for the count badge
   */
  onCountClick?: () => void;
}

export interface AvatarSizeConfig {
  container: string;
  image: string;
  text: string;
  status: string;
  badge: string;
}

export interface AvatarTheme {
  sizes: Record<AvatarSize, AvatarSizeConfig>;
  variants: Record<AvatarVariant, string>;
  status: {
    colors: Record<AvatarStatus, string>;
    position: string;
  };
  badge: {
    position: Record<string, string>;
    style: string;
  };
  fallback: {
    backgroundColor: string;
    textColor: string;
  };
}
