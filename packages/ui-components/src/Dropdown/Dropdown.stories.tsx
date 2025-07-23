import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Dropdown } from './Dropdown';
import { MapPin, Clock, DollarSign, Star, Filter, Search } from 'lucide-react';

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile dropdown component for the BOOM Card platform with multiple variants and configurations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'primary', 'secondary', 'ghost'],
      description: 'Visual style variant of the dropdown',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Size of the dropdown',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the dropdown is disabled',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether the dropdown should take full width',
    },
    align: {
      control: 'select',
      options: ['left', 'right', 'center'],
      description: 'Alignment of the dropdown menu',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text when no option is selected',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic dropdown story
export const Default: Story = {
  args: {
    placeholder: 'Select an option',
    options: [
      { value: 'restaurants', label: 'Restaurants' },
      { value: 'hotels', label: 'Hotels' },
      { value: 'spa', label: 'Spa & Wellness' },
      { value: 'entertainment', label: 'Entertainment' },
    ],
  },
};

// Category dropdown with icons
export const CategoryDropdown: Story = {
  args: {
    placeholder: 'Select category',
    variant: 'primary',
    options: [
      { 
        value: 'food-drink', 
        label: 'Food & Drink',
        icon: '🍽️',
        description: 'Restaurants, cafés, bars'
      },
      { 
        value: 'entertainment', 
        label: 'Entertainment',
        icon: '🎭',
        description: 'Nightlife, events, activities'
      },
      { 
        value: 'accommodation', 
        label: 'Accommodation',
        icon: '🏨',
        description: 'Hotels, B&Bs, rentals'
      },
      { 
        value: 'experiences', 
        label: 'Experiences',
        icon: '🎯',
        description: 'Adventures, spa, tours'
      },
    ],
  },
};

// Location dropdown
export const LocationDropdown: Story = {
  args: {
    placeholder: 'Select location',
    searchable: true,
    icon: <MapPin className="w-4 h-4" />,
    options: [
      { value: 'sofia', label: 'Sofia', count: 245 },
      { value: 'plovdiv', label: 'Plovdiv', count: 128 },
      { value: 'varna', label: 'Varna', count: 186 },
      { value: 'burgas', label: 'Burgas', count: 92 },
      { value: 'bansko', label: 'Bansko', count: 47 },
      { value: 'sunny-beach', label: 'Sunny Beach', count: 134 },
    ],
  },
};

// Discount filter dropdown
export const DiscountFilter: Story = {
  args: {
    placeholder: 'Discount percentage',
    icon: <DollarSign className="w-4 h-4" />,
    options: [
      { value: '10', label: '10% or more', badge: 'Popular' },
      { value: '20', label: '20% or more' },
      { value: '30', label: '30% or more' },
      { value: '40', label: '40% or more', badge: 'Best Value' },
      { value: '50', label: '50% or more', badge: 'Hot Deal' },
    ],
  },
};

// Multi-select dropdown
export const MultiSelect: Story = {
  args: {
    placeholder: 'Select cuisine types',
    multiple: true,
    searchable: true,
    options: [
      { value: 'bulgarian', label: 'Bulgarian' },
      { value: 'italian', label: 'Italian' },
      { value: 'asian', label: 'Asian' },
      { value: 'mediterranean', label: 'Mediterranean' },
      { value: 'mexican', label: 'Mexican' },
      { value: 'american', label: 'American' },
      { value: 'french', label: 'French' },
      { value: 'indian', label: 'Indian' },
      { value: 'sushi', label: 'Sushi & Japanese' },
      { value: 'vegan', label: 'Vegan', icon: '🌱' },
      { value: 'vegetarian', label: 'Vegetarian', icon: '🥗' },
      { value: 'gluten-free', label: 'Gluten-Free', icon: '🌾' },
    ],
  },
};

// Sort dropdown
export const SortDropdown: Story = {
  args: {
    placeholder: 'Sort by',
    size: 'sm',
    variant: 'ghost',
    options: [
      { value: 'recommended', label: 'Recommended', icon: <Star className="w-4 h-4" /> },
      { value: 'discount-high', label: 'Highest Discount' },
      { value: 'discount-low', label: 'Lowest Discount' },
      { value: 'newest', label: 'Newest First' },
      { value: 'rating', label: 'Highest Rated' },
      { value: 'distance', label: 'Nearest First' },
      { value: 'popular', label: 'Most Popular' },
    ],
  },
};

// Language selector dropdown
export const LanguageSelector: Story = {
  args: {
    placeholder: 'EN',
    size: 'sm',
    variant: 'ghost',
    hideChevron: true,
    options: [
      { value: 'en', label: 'English', icon: '🇬🇧' },
      { value: 'bg', label: 'Български', icon: '🇧🇬' },
    ],
  },
};

// Opening hours dropdown
export const OpeningHours: Story = {
  args: {
    placeholder: 'Open now',
    icon: <Clock className="w-4 h-4" />,
    options: [
      { value: 'now', label: 'Open now', description: 'Currently accepting customers' },
      { value: 'today', label: 'Open today' },
      { value: 'tomorrow', label: 'Open tomorrow' },
      { value: 'weekend', label: 'Open on weekends' },
      { value: '24-7', label: 'Open 24/7' },
    ],
  },
};

// Grouped options dropdown
export const GroupedOptions: Story = {
  args: {
    placeholder: 'Select partner type',
    searchable: true,
    options: [
      {
        group: 'Food & Drink',
        items: [
          { value: 'fine-dining', label: 'Fine Dining' },
          { value: 'casual-dining', label: 'Casual Dining' },
          { value: 'fast-food', label: 'Fast Food' },
          { value: 'cafes', label: 'Cafés & Coffee' },
          { value: 'bars', label: 'Bars & Pubs' },
        ],
      },
      {
        group: 'Entertainment',
        items: [
          { value: 'nightclubs', label: 'Nightclubs' },
          { value: 'live-music', label: 'Live Music' },
          { value: 'comedy', label: 'Comedy Clubs' },
          { value: 'theaters', label: 'Theaters' },
          { value: 'gaming', label: 'Gaming Centers' },
        ],
      },
      {
        group: 'Hotels',
        items: [
          { value: '5-star', label: '5 Star Hotels' },
          { value: '4-star', label: '4 Star Hotels' },
          { value: '3-star', label: '3 Star Hotels' },
          { value: 'boutique', label: 'Boutique Hotels' },
          { value: 'business', label: 'Business Hotels' },
        ],
      },
    ],
  },
};

// Loading state
export const Loading: Story = {
  args: {
    placeholder: 'Loading options...',
    loading: true,
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    placeholder: 'Disabled dropdown',
    disabled: true,
    options: [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ],
  },
};

// Error state
export const WithError: Story = {
  args: {
    placeholder: 'Select an option',
    error: 'Please select a valid option',
    options: [
      { value: '1', label: 'Option 1' },
      { value: '2', label: 'Option 2' },
    ],
  },
};

// Custom trigger dropdown
export const CustomTrigger: Story = {
  args: {
    placeholder: 'Filter results',
    customTrigger: (
      <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
        <Filter className="w-4 h-4" />
        <span>Advanced Filters</span>
      </button>
    ),
    options: [
      { value: 'price-low', label: 'Price: Low to High' },
      { value: 'price-high', label: 'Price: High to Low' },
      { value: 'rating', label: 'Rating: High to Low' },
      { value: 'distance', label: 'Distance: Near to Far' },
    ],
  },
};

// Interactive example with state management
export const InteractiveExample = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState('');

  return (
    <div className="space-y-4 w-96">
      <h3 className="text-lg font-semibold">Search Filters</h3>
      
      <Dropdown
        placeholder="Select category"
        value={selectedCategory}
        onChange={setSelectedCategory}
        options={[
          { value: 'restaurants', label: 'Restaurants', icon: '🍽️' },
          { value: 'hotels', label: 'Hotels', icon: '🏨' },
          { value: 'spa', label: 'Spa & Wellness', icon: '💆' },
          { value: 'entertainment', label: 'Entertainment', icon: '🎭' },
        ]}
      />

      <Dropdown
        placeholder="Select location"
        value={selectedLocation}
        onChange={setSelectedLocation}
        searchable
        options={[
          { value: 'sofia', label: 'Sofia' },
          { value: 'plovdiv', label: 'Plovdiv' },
          { value: 'varna', label: 'Varna' },
          { value: 'burgas', label: 'Burgas' },
        ]}
      />

      <Dropdown
        placeholder="Minimum discount"
        value={selectedDiscount}
        onChange={setSelectedDiscount}
        options={[
          { value: '10', label: '10% or more' },
          { value: '20', label: '20% or more' },
          { value: '30', label: '30% or more' },
          { value: '40', label: '40% or more' },
        ]}
      />

      {(selectedCategory || selectedLocation || selectedDiscount) && (
        <div className="p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">Active filters:</p>
          <ul className="mt-2 space-y-1 text-sm">
            {selectedCategory && <li>C
}}}