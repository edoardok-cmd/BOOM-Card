import { ReactNode, CSSProperties, HTMLAttributes } from 'react';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled' | 'glass';
export type CardSize = 'small' | 'medium' | 'large';
export type CardStatus = 'active' | 'inactive' | 'pending' | 'expired';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * The variant style of the card
   * @default 'default'
   */
  variant?: CardVariant;
  
  /**
   * The size of the card
   * @default 'medium'
   */
  size?: CardSize;
  
  /**
   * The status of the card (affects visual styling)
   */
  status?: CardStatus;
  
  /**
   * Whether the card is interactive (clickable/hoverable)
   * @default false
   */
  interactive?: boolean;
  
  /**
   * Whether the card is currently selected
   * @default false
   */
  selected?: boolean;
  
  /**
   * Whether the card is disabled
   * @default false
   */
  disabled?: boolean;
  
  /**
   * Whether the card is loading
   * @default false
   */
  loading?: boolean;
  
  /**
   * Custom width for the card
   */
  width?: string | number;
  
  /**
   * Custom height for the card
   */
  height?: string | number;
  
  /**
   * Additional CSS styles
   */
  style?: CSSProperties;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Content to be rendered inside the card
   */
  children?: ReactNode;
  
  /**
   * Header content or component
   */
  header?: ReactNode;
  
  /**
   * Footer content or component
   */
  footer?: ReactNode;
  
  /**
   * Media content (image, video, etc.)
   */
  media?: ReactNode;
  
  /**
   * Position of media relative to content
   * @default 'top'
   */
  mediaPosition?: 'top' | 'left' | 'right' | 'bottom';
  
  /**
   * Padding inside the card
   * @default 'medium'
   */
  padding?: 'none' | 'small' | 'medium' | 'large';
  
  /**
   * Border radius of the card
   * @default 'medium'
   */
  borderRadius?: 'none' | 'small' | 'medium' | 'large' | 'xlarge';
  
  /**
   * Shadow depth of the card
   * @default 'small'
   */
  shadow?: 'none' | 'small' | 'medium' | 'large';
  
  /**
   * Click handler for interactive cards
   */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  
  /**
   * Double click handler
   */
  onDoubleClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  
  /**
   * Mouse enter handler
   */
  onMouseEnter?: (event: React.MouseEvent<HTMLDivElement>) => void;
  
  /**
   * Mouse leave handler
   */
  onMouseLeave?: (event: React.MouseEvent<HTMLDivElement>) => void;
  
  /**
   * Accessibility label
   */
  ariaLabel?: string;
  
  /**
   * Accessibility role
   */
  role?: string;
  
  /**
   * Test ID for testing purposes
   */
  testId?: string;
  
  /**
   * Animation type when card appears
   */
  animation?: 'fade' | 'slide' | 'scale' | 'none';
  
  /**
   * Animation duration in milliseconds
   * @default 300
   */
  animationDuration?: number;
  
  /**
   * Whether to show a skeleton loader
   * @default false
   */
  skeleton?: boolean;
  
  /**
   * Aspect ratio for the card
   */
  aspectRatio?: string;
}

export interface DiscountCardProps extends CardProps {
  /**
   * Partner/venue name
   */
  partnerName: string;
  
  /**
   * Partner logo URL
   */
  partnerLogo?: string;
  
  /**
   * Discount percentage
   */
  discountPercentage: number;
  
  /**
   * Category of the partner
   */
  category: PartnerCategory;
  
  /**
   * Subcategory of the partner
   */
  subcategory?: string;
  
  /**
   * Location/address
   */
  location?: string;
  
  /**
   * Distance from user (if available)
   */
  distance?: number;
  
  /**
   * Rating out of 5
   */
  rating?: number;
  
  /**
   * Number of reviews
   */
  reviewCount?: number;
  
  /**
   * Price range (1-4)
   */
  priceRange?: 1 | 2 | 3 | 4;
  
  /**
   * Whether partner is currently open
   */
  isOpen?: boolean;
  
  /**
   * Operating hours
   */
  operatingHours?: OperatingHours;
  
  /**
   * Tags for filtering
   */
  tags?: string[];
  
  /**
   * Whether this is a featured partner
   */
  featured?: boolean;
  
  /**
   * Whether this is a new partner
   */
  isNew?: boolean;
  
  /**
   * Expiration date of the discount
   */
  expirationDate?: Date;
  
  /**
   * Minimum purchase amount
   */
  minimumPurchase?: number;
  
  /**
   * Maximum discount amount
   */
  maxDiscountAmount?: number;
  
  /**
   * Terms and conditions
   */
  terms?: string;
  
  /**
   * QR code data
   */
  qrCodeData?: string;
  
  /**
   * Whether user has saved this card
   */
  isSaved?: boolean;
  
  /**
   * Whether user has used this discount
   */
  hasUsed?: boolean;
  
  /**
   * Number of times used
   */
  usageCount?: number;
  
  /**
   * Dietary options available
   */
  dietaryOptions?: DietaryOption[];
  
  /**
   * Cuisine types (for restaurants)
   */
  cuisineTypes?: string[];
  
  /**
   * Amenities (for hotels)
   */
  amenities?: string[];
  
  /**
   * Hotel star rating
   */
  starRating?: 1 | 2 | 3 | 4 | 5;
  
  /**
   * Callback when save button is clicked
   */
  onSave?: (partnerId: string) => void;
  
  /**
   * Callback when QR code is clicked
   */
  onShowQR?: (partnerId: string) => void;
  
  /**
   * Callback when share button is clicked
   */
  onShare?: (partnerId: string) => void;
}

export type PartnerCategory = 
  | 'restaurant'
  | 'cafe'
  | 'bar'
  | 'nightclub'
  | 'hotel'
  | 'spa'
  | 'entertainment'
  | 'adventure'
  | 'transportation'
  | 'shopping'
  | 'other';

export type DietaryOption = 
  | 'vegan'
  | 'vegetarian'
  | 'halal'
  | 'gluten-free'
  | 'kosher'
  | 'dairy-free'
  | 'nut-free';

export interface OperatingHours {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
}

export interface DayHours {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface CardHeaderProps {
  /**
   * Title text
   */
  title?: string;
  
  /**
   * Subtitle text
   */
  subtitle?: string;
  
  /**
   * Avatar or icon
   */
  avatar?: ReactNode;
  
  /**
   * Action buttons or menu
   */
  action?: ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Additional styles
   */
  style?: CSSProperties;
}

export interface CardContentProps {
  /**
   * Content to display
   */
  children: ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Additional styles
   */
  style?: CSSProperties;
}

export interface CardActionsProps {
  /**
   * Action buttons or elements
   */
  children: ReactNode;
  
  /**
   * Alignment of actions
   * @default 'right'
   */
  align?: 'left' | 'center' | 'right' | 'space-between';
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Additional styles
   */
  style?: CSSProperties;
}

export interface CardMediaProps {
  /**
   * Image source URL
   */
  src?: string;
  
  /**
   * Alternative text for accessibility
   */
  alt?: string;
  
  /**
   * Media type
   * @default 'image'
   */
  type?: 'image' | 'video' | 'iframe';
  
  /**
   * Video or iframe source
   */
  videoSrc?: string;
  
  /**
   * Height of the media
   */
  height?: string | number;
  
  /**
   * Object fit for images
   * @default 'cover'
   */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  
  /**
   * Overlay content
   */
  overlay?: ReactNode;
  
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Error state
   */
  error?: boolean;
  
  /**
   * Fallback content when media fails to load
   */
  fallback?: ReactNode;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Additional styles
   */
  style?: CSSProperties;
  
  /**
   * Click handler
   */
  onClick?: () => void;
}

export interface CardSkeletonProps {
  /**
   * Number of skeleton cards to show
   * @default 1
   */
  count?: number;
  
  /**
   * Card variant
   * @default 'default'
   */
  variant?: CardVariant;
  
  /**
   * Card size
   * @default 'medium'
   */
  size?: CardSize;
  
  /**
   * Whether to show header skeleton
   * @default true
   */
  showHeader?: boolean;
  
  /**
   * Whether to show media skeleton
   * @default true
   */
  showMedia?: boolean;
  
  /**
   * Whether to show content skeleton
   * @default true
   */
  showContent?: boolean;
  
  /**
   * Whether to show actions skeleton
   * @default true
   */
  showActions?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Additional styles
   */
  style?: CSSProperties;
}

export interface CardGroupProps {
  /**
   * Card components to group
   */
  children: ReactNode;
  
  /**
   * Layout direction
   * @default 'row'
   */
  direction?: 'row' | 'column';
  
  /**
   * Spacing between cards
   * @default 'medium'
   */
  spacing?: 'none' | 'small' | 'medium' | 'large';
  
  /**
   * Whether to wrap cards
   * @default true
   */
  wrap?: boolean;
  
  /**
   * Alignment of cards
   * @default 'flex-start'
   */
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  
  /**
   * Justification of cards
   * @default 'flex-start'
   */
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Additional styles
   */
  style?: CSSProperties;
}
