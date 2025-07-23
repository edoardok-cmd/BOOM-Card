import type { Meta, StoryObj } from '@storybook/react';
import { Menu } from './Menu';
import { useState } from 'react';
import { 
  Home, 
  Restaurant, 
  Martini, 
  Hotel, 
  Sparkles,
  Search,
  User,
  Settings,
  LogOut,
  ChevronRight,
  Coffee,
  Music,
  Calendar,
  MapPin,
  Star,
  TrendingUp,
  Globe
} from 'lucide-react';

const meta = {
  title: 'Components/Menu',
  component: Menu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile menu component for BOOM Card platform navigation with support for nested items, icons, and responsive design.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'ghost'],
      description: 'Visual style variant of the menu',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the menu items',
    },
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
      description: 'Menu orientation',
    },
  },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

// Main navigation menu items
const mainNavItems = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    href: '/',
  },
  {
    id: 'food-drink',
    label: 'Food & Drink',
    icon: Restaurant,
    items: [
      {
        id: 'restaurants',
        label: 'Restaurants',
        icon: Restaurant,
        items: [
          { id: 'fine-dining', label: 'Fine Dining', href: '/food-drink/restaurants/fine-dining' },
          { id: 'casual-dining', label: 'Casual Dining', href: '/food-drink/restaurants/casual-dining' },
          { id: 'fast-food', label: 'Fast Food', href: '/food-drink/restaurants/fast-food' },
          { id: 'vegan', label: 'Vegan', href: '/food-drink/restaurants/vegan' },
          { id: 'vegetarian', label: 'Vegetarian', href: '/food-drink/restaurants/vegetarian' },
        ],
      },
      {
        id: 'cafes',
        label: 'Cafés & Coffee',
        icon: Coffee,
        href: '/food-drink/cafes',
      },
      {
        id: 'bars',
        label: 'Bars & Pubs',
        icon: Martini,
        items: [
          { id: 'sky-bars', label: 'Sky Bars', href: '/food-drink/bars/sky-bars' },
          { id: 'cocktail-bars', label: 'Cocktail Bars', href: '/food-drink/bars/cocktail-bars' },
          { id: 'sports-bars', label: 'Sports Bars', href: '/food-drink/bars/sports-bars' },
          { id: 'wine-bars', label: 'Wine Bars', href: '/food-drink/bars/wine-bars' },
        ],
      },
    ],
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: Music,
    items: [
      { id: 'nightclubs', label: 'Nightclubs', href: '/entertainment/nightclubs' },
      { id: 'live-music', label: 'Live Music', href: '/entertainment/live-music' },
      { id: 'comedy-clubs', label: 'Comedy Clubs', href: '/entertainment/comedy-clubs' },
      { id: 'cultural-events', label: 'Cultural Events', href: '/entertainment/cultural-events' },
      { id: 'gaming-centers', label: 'Gaming Centers', href: '/entertainment/gaming-centers' },
    ],
  },
  {
    id: 'accommodation',
    label: 'Accommodation',
    icon: Hotel,
    items: [
      { id: 'luxury-hotels', label: 'Luxury Hotels (5★)', href: '/accommodation/luxury' },
      { id: 'business-hotels', label: 'Business Hotels (4★)', href: '/accommodation/business' },
      { id: 'boutique-hotels', label: 'Boutique Hotels', href: '/accommodation/boutique' },
      { id: 'bed-breakfast', label: 'Bed & Breakfast', href: '/accommodation/bed-breakfast' },
      { id: 'vacation-rentals', label: 'Vacation Rentals', href: '/accommodation/vacation-rentals' },
    ],
  },
  {
    id: 'experiences',
    label: 'Experiences',
    icon: Sparkles,
    items: [
      { id: 'adventure', label: 'Adventure Activities', href: '/experiences/adventure' },
      { id: 'wellness-spa', label: 'Wellness & Spa', href: '/experiences/wellness-spa' },
      { id: 'wine-tastings', label: 'Wine & Food Tastings', href: '/experiences/tastings' },
      { id: 'escape-rooms', label: 'Escape Rooms', href: '/experiences/escape-rooms' },
      { id: 'transportation', label: 'Transportation', href: '/experiences/transportation' },
    ],
  },
];

// User menu items
const userMenuItems = [
  {
    id: 'profile',
    label: 'My Profile',
    icon: User,
    href: '/profile',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings',
  },
  {
    id: 'logout',
    label: 'Logout',
    icon: LogOut,
    onClick: () => console.log('Logout clicked'),
  },
];

// Mobile menu items with Bulgarian translations
const mobileMenuItems = [
  {
    id: 'search',
    label: 'Search',
    labelBg: 'Търсене',
    icon: Search,
    href: '/search',
  },
  {
    id: 'nearby',
    label: 'Nearby',
    labelBg: 'Наблизо',
    icon: MapPin,
    href: '/nearby',
  },
  {
    id: 'favorites',
    label: 'Favorites',
    labelBg: 'Любими',
    icon: Star,
    href: '/favorites',
  },
  {
    id: 'trending',
    label: 'Trending',
    labelBg: 'Популярни',
    icon: TrendingUp,
    href: '/trending',
  },
];

// Partner dashboard menu
const partnerMenuItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/partner/dashboard',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: TrendingUp,
    items: [
      { id: 'overview', label: 'Overview', href: '/partner/analytics' },
      { id: 'transactions', label: 'Transactions', href: '/partner/analytics/transactions' },
      { id: 'customers', label: 'Customers', href: '/partner/analytics/customers' },
      { id: 'reports', label: 'Reports', href: '/partner/analytics/reports' },
    ],
  },
  {
    id: 'promotions',
    label: 'Promotions',
    icon: Sparkles,
    items: [
      { id: 'active', label: 'Active Promotions', href: '/partner/promotions/active' },
      { id: 'create', label: 'Create New', href: '/partner/promotions/new' },
      { id: 'scheduled', label: 'Scheduled', href: '/partner/promotions/scheduled' },
      { id: 'history', label: 'History', href: '/partner/promotions/history' },
    ],
  },
];

export const Default: Story = {
  args: {
    items: mainNavItems,
    orientation: 'horizontal',
    variant: 'default',
    size: 'md',
  },
};

export const VerticalNavigation: Story = {
  args: {
    items: mainNavItems,
    orientation: 'vertical',
    variant: 'default',
    size: 'md',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export const UserDropdown: Story = {
  args: {
    items: userMenuItems,
    orientation: 'vertical',
    variant: 'ghost',
    size: 'sm',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '200px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '8px' }}>
        <Story />
      </div>
    ),
  ],
};

export const MobileMenu: Story = {
  args: {
    items: mobileMenuItems.map(item => ({
      ...item,
      label: item.label, // Default to English
    })),
    orientation: 'horizontal',
    variant: 'primary',
    size: 'lg',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        <Story />
      </div>
    ),
  ],
};

export const PartnerDashboard: Story = {
  args: {
    items: partnerMenuItems,
    orientation: 'vertical',
    variant: 'secondary',
    size: 'md',
    collapsible: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '280px', height: '600px', background: '#f9fafb', padding: '16px', borderRadius: '12px' }}>
        <Story />
      </div>
    ),
  ],
};

export const WithActiveState: Story = {
  render: () => {
    const [activeItem, setActiveItem] = useState('food-drink');
    
    const itemsWithActive = mainNavItems.map(item => ({
      ...item,
      active: item.id === activeItem,
      onClick: () => setActiveItem(item.id),
    }));

    return <Menu items={itemsWithActive} orientation="horizontal" />;
  },
};

export const WithBadges: Story = {
  args: {
    items: [
      {
        id: 'notifications',
        label: 'Notifications',
        icon: Calendar,
        badge: '5',
        badgeVariant: 'danger',
        href: '/notifications',
      },
      {
        id: 'messages',
        label: 'Messages',
        icon: User,
        badge: '12',
        badgeVariant: 'primary',
        href: '/messages',
      },
      {
        id: 'updates',
        label: 'Updates',
        icon: TrendingUp,
        badge: 'New',
        badgeVariant: 'success',
        href: '/updates',
      },
    ],
    orientation: 'vertical',
    size: 'md',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '250px' }}>
        <Story />
      </div>
    ),
  ],
};

export const Multilingual: Story = {
  render: () => {
    const [language, setLanguage] = useState<'en' | 'bg'>('en');
    
    const multilingualItems = [
      {
        id: 'home',
        label: language === 'en' ? 'Home' : 'Начало',
        icon: Home,
        href: '/',
      },
      {
        id: 'search',
        label: language === 'en' ? 'Search' : 'Търсене',
        icon: Search,
        href: '/search',
      },
      {
        id: 'favorites',
        label: language === 'en' ? 'Favorites' : 'Любими',
        icon: Star,
        href: '/favorites',
      },
      {
        id: 'profile',
        label: language === 'en' ? 'Profile' : 'Профил',
        icon: User,
        href: '/profile',
      },
    ];

    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setLanguage('en')}
            style={{
              padding: '8px 16px',
              marginRight: '8px',
              background: language === 'en' ? '#3b82f6' : '#e5e7eb',
              color: language === 'en' ? 'white' : 'black',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <Globe size={16} style={{ display: 'inline', marginRight: '4px' }} />
            English
          </button>
          <button
            onClick={() => setLanguage('bg')}
            style={{
              padding: '8px 16px',
              background: language === 'bg' ? '#3b82f6' : '#e5e7eb',
              color: language === 'bg' ? 'white' : 'black',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <Globe size={16} style={{ display: 'inline', marginRight: '4px' }} />
            Български
          </button>
        </div>
        <Menu items={multilingualItems} orientation="horizontal" variant="primary" />
      </div>
    );
  },
};

export const ResponsiveMenu: Story = {
  args: {
    items: mainNavItems,
    orientation: 'horizontal',
    variant: 'default',
    size: 'md',
    responsive: true,
    mobileBreakpoint: 768,
  },
  parameters: {
    viewport: {
      defaultViewport: 'responsive',
    },
  },
};

export const WithCustomStyling: Story = {
  args: {
    items: mainNavItems.slice(0, 3),
    orientation: 'horizontal',
    variant: 'ghost',
    size: 'lg',
    className: 'custom-menu',
  },
  decorators: [
    (Story) => (
      <>
        <style>{`
          .custom-menu {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 16px;
            border-radius: 12px;
          }
          .custom-menu .menu-item {
            color: white;
            transition: all 0.3s ease;
          }
          .custom-menu .menu-item:hover {
            transform: translateY(-2px);
            background: rgba(255, 255, 255, 0.2);
          }
        `}</style>
        <Story />
      </>
    ),
  ],
};
