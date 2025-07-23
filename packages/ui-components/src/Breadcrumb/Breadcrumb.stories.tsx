import type { Meta, StoryObj } from '@storybook/react';
import { Breadcrumb } from './Breadcrumb';
import { Home, ChevronRight } from 'lucide-react';

const meta = {
  title: 'Navigation/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A breadcrumb navigation component for the BOOM Card platform with support for icons, custom separators, and responsive behavior.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      description: 'Array of breadcrumb items',
      control: 'object',
    },
    separator: {
      description: 'Custom separator element between breadcrumb items',
      control: 'text',
    },
    maxItems: {
      description: 'Maximum number of items to display before collapsing',
      control: 'number',
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text',
    },
    homeIcon: {
      description: 'Custom home icon element',
      control: false,
    },
    responsive: {
      description: 'Enable responsive behavior for mobile devices',
      control: 'boolean',
    },
    variant: {
      description: 'Visual variant of the breadcrumb',
      control: 'select',
      options: ['default', 'contained', 'minimal'],
    },
    size: {
      description: 'Size variant of the breadcrumb',
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    showTooltips: {
      description: 'Show tooltips for truncated items',
      control: 'boolean',
    },
    ariaLabel: {
      description: 'ARIA label for accessibility',
      control: 'text',
    },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic breadcrumb
export const Default: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Food & Drink', href: '/food-drink' },
      { label: 'Restaurants', href: '/food-drink/restaurants' },
      { label: 'Fine Dining', href: '/food-drink/restaurants/fine-dining' },
    ],
  },
};

// With home icon
export const WithHomeIcon: Story = {
  args: {
    items: [
      { label: 'Home', href: '/', icon: <Home size={16} /> },
      { label: 'Entertainment', href: '/entertainment' },
      { label: 'Nightclubs', href: '/entertainment/nightclubs' },
    ],
    homeIcon: <Home size={16} />,
  },
};

// Custom separator
export const CustomSeparator: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Accommodation', href: '/accommodation' },
      { label: 'Hotels', href: '/accommodation/hotels' },
      { label: '5 Star Hotels', href: '/accommodation/hotels/5-star' },
    ],
    separator: <ChevronRight size={16} className="text-gray-400" />,
  },
};

// Long breadcrumb with max items
export const CollapsedItems: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Experiences & Services', href: '/experiences' },
      { label: 'Wellness & Spa', href: '/experiences/wellness-spa' },
      { label: 'Day Spas', href: '/experiences/wellness-spa/day-spas' },
      { label: 'Sofia Region', href: '/experiences/wellness-spa/day-spas/sofia' },
      { label: 'Premium Spa Center', href: '/experiences/wellness-spa/day-spas/sofia/premium-spa' },
    ],
    maxItems: 4,
    homeIcon: <Home size={16} />,
  },
};

// Different variants
export const ContainedVariant: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Partners', href: '/partners' },
      { label: 'Restaurant Partners', href: '/partners/restaurants' },
    ],
    variant: 'contained',
  },
};

export const MinimalVariant: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'My Account', href: '/account' },
      { label: 'Subscriptions', href: '/account/subscriptions' },
    ],
    variant: 'minimal',
  },
};

// Different sizes
export const SmallSize: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Search Results', href: '/search' },
    ],
    size: 'sm',
  },
};

export const LargeSize: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Categories', href: '/categories' },
      { label: 'Popular', href: '/categories/popular' },
    ],
    size: 'lg',
  },
};

// With truncated items and tooltips
export const TruncatedWithTooltips: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Entertainment & Nightlife', href: '/entertainment', maxWidth: 120 },
      { label: 'Live Music Venues & Concert Halls', href: '/entertainment/live-music', maxWidth: 150 },
      { label: 'Jazz Club "The Blue Note Sofia"', href: '/entertainment/live-music/blue-note', maxWidth: 180 },
    ],
    showTooltips: true,
  },
};

// Mobile responsive
export const MobileResponsive: Story = {
  args: {
    items: [
      { label: 'Home', href: '/', icon: <Home size={16} /> },
      { label: 'Food & Drink', href: '/food-drink' },
      { label: 'Cafés', href: '/food-drink/cafes' },
      { label: 'Specialty Coffee', href: '/food-drink/cafes/specialty' },
    ],
    responsive: true,
    maxItems: 3,
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

// Partner dashboard breadcrumb
export const PartnerDashboard: Story = {
  args: {
    items: [
      { label: 'Dashboard', href: '/partner/dashboard', icon: <Home size={16} /> },
      { label: 'Locations', href: '/partner/locations' },
      { label: 'Sofia Central', href: '/partner/locations/sofia-central' },
      { label: 'Edit Details', href: '/partner/locations/sofia-central/edit' },
    ],
    variant: 'contained',
  },
};

// Admin panel breadcrumb
export const AdminPanel: Story = {
  args: {
    items: [
      { label: 'Admin', href: '/admin', icon: <Home size={16} /> },
      { label: 'Partners', href: '/admin/partners' },
      { label: 'Pending Approval', href: '/admin/partners/pending' },
      { label: 'Restaurant Application #1234', href: '/admin/partners/pending/1234' },
    ],
    separator: '/',
    variant: 'minimal',
  },
};

// With current page indicator
export const WithCurrentPage: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'My Account', href: '/account' },
      { label: 'Order History', href: '/account/orders' },
      { label: 'Order #BC-2024-001', current: true },
    ],
  },
};

// Bulgarian language example
export const BulgarianLanguage: Story = {
  args: {
    items: [
      { label: 'Начало', href: '/' },
      { label: 'Храна и напитки', href: '/food-drink' },
      { label: 'Ресторанти', href: '/food-drink/restaurants' },
      { label: 'Италианска кухня', href: '/food-drink/restaurants/italian' },
    ],
    ariaLabel: 'Навигационна пътека',
  },
};

// Complex navigation path
export const ComplexPath: Story = {
  args: {
    items: [
      { label: 'Home', href: '/', icon: <Home size={16} /> },
      { label: 'Experiences', href: '/experiences' },
      { label: 'Adventure Activities', href: '/experiences/adventure' },
      { label: 'Water Sports', href: '/experiences/adventure/water-sports' },
      { label: 'Jet Ski Rentals', href: '/experiences/adventure/water-sports/jet-ski' },
      { label: 'Black Sea Coast', href: '/experiences/adventure/water-sports/jet-ski/black-sea' },
      { label: 'Sunny Beach Marina', current: true },
    ],
    maxItems: 5,
    showTooltips: true,
    responsive: true,
  },
};

// Loading state
export const LoadingState: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Loading...', loading: true },
    ],
  },
};

// Error state
export const ErrorState: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Page Not Found', error: true, className: 'text-red-600' },
    ],
  },
};

// With badges
export const WithBadges: Story = {
  args: {
    items: [
      { label: 'Home', href: '/' },
      { label: 'Promotions', href: '/promotions', badge: 'New' },
      { label: 'Limited Time Offers', href: '/promotions/limited-time', badge: '5' },
      { label: 'Flash Sale', current: true, badge: 'Live' },
    ],
  },
};

// Accessibility focused
export const AccessibilityFocused: Story = {
  args: {
    items: [
      { label: 'Home', href: '/', ariaLabel: 'Go to homepage' },
      { label: 'Search', href: '/search', ariaLabel: 'Search results' },
      { label: 'Restaurants in Sofia', href: '/search/restaurants-sofia', ariaLabel: 'Restaurant search results for Sofia' },
      { label: 'Page 2', current: true, ariaLabel: 'Current page: 2' },
    ],
    ariaLabel: 'Breadcrumb navigation',
    role: 'navigation',
  },
};
