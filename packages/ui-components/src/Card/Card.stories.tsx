import type { Meta, StoryObj } from '@storybook/react';
import { Card } from './Card';
import { useState } from 'react';
import { FiMapPin, FiStar, FiClock, FiPercent, FiHeart, FiShare2, FiTag, FiInfo } from 'react-icons/fi';

const meta = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Versatile card component for displaying partner venues, offers, and content across the BOOM platform.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'compact', 'featured', 'horizontal'],
      description: 'Card layout variant',
    },
    elevation: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl'],
      description: 'Shadow elevation level',
    },
    interactive: {
      control: 'boolean',
      description: 'Enable hover and click interactions',
    },
    loading: {
      control: 'boolean',
      description: 'Show loading skeleton',
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data for stories
const restaurantData = {
  id: '1',
  title: 'La Vita è Bella',
  subtitle: 'Italian Restaurant',
  description: 'Authentic Italian cuisine in the heart of Sofia. Experience traditional recipes with a modern twist.',
  image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
  category: 'Fine Dining',
  rating: 4.8,
  reviews: 324,
  discount: 20,
  location: 'Sofia, Bulgaria',
  priceRange: '€€€',
  badges: ['Top Rated', 'Chef\'s Choice'],
  features: ['Outdoor Seating', 'Wine Selection', 'Live Music'],
};

const hotelData = {
  id: '2',
  title: 'Grand Hotel Sofia',
  subtitle: '5-Star Luxury Hotel',
  description: 'Experience luxury and comfort in the heart of Sofia. Premium amenities and exceptional service.',
  image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
  category: 'Hotels',
  rating: 4.9,
  reviews: 1250,
  discount: 15,
  location: 'Sofia City Center',
  priceRange: '€€€€',
  badges: ['Luxury', 'Business Friendly'],
  features: ['Spa & Wellness', 'Rooftop Bar', 'Concierge Service'],
};

const spaData = {
  id: '3',
  title: 'Serenity Spa & Wellness',
  subtitle: 'Premium Spa Experience',
  description: 'Rejuvenate your body and mind with our comprehensive wellness treatments and therapies.',
  image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&h=600&fit=crop',
  category: 'Wellness & Spa',
  rating: 4.7,
  reviews: 892,
  discount: 25,
  location: 'Vitosha District',
  priceRange: '€€€',
  badges: ['Award Winning', 'Eco-Friendly'],
  features: ['Massage Therapy', 'Sauna & Steam', 'Beauty Treatments'],
};

// Default card story
export const Default: Story = {
  args: {
    variant: 'default',
    elevation: 'md',
    interactive: true,
    className: 'w-80',
    children: (
      <div className="p-6">
        <div className="relative mb-4">
          <img 
            src={restaurantData.image} 
            alt={restaurantData.title}
            className="w-full h-48 object-cover rounded-lg"
          />
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            -{restaurantData.discount}%
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">{restaurantData.title}</h3>
            <div className="flex items-center gap-1">
              <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium">{restaurantData.rating}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">{restaurantData.subtitle}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FiMapPin className="w-4 h-4" />
            <span>{restaurantData.location}</span>
            <span>•</span>
            <span>{restaurantData.priceRange}</span>
          </div>
          <p className="text-sm text-gray-700 line-clamp-2">{restaurantData.description}</p>
          <div className="flex gap-2 pt-2">
            {restaurantData.badges.map((badge) => (
              <span key={badge} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    ),
  },
};

// Compact card variant
export const Compact: Story = {
  args: {
    variant: 'compact',
    elevation: 'sm',
    interactive: true,
    className: 'w-64',
    children: (
      <div className="p-4">
        <div className="flex items-center gap-3">
          <img 
            src={spaData.image} 
            alt={spaData.title}
            className="w-16 h-16 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{spaData.title}</h4>
            <p className="text-xs text-gray-600">{spaData.category}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-red-600 font-semibold">-{spaData.discount}%</span>
              <div className="flex items-center gap-1">
                <FiStar className="w-3 h-3 text-yellow-400 fill-current" />
                <span className="text-xs">{spaData.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
};

// Featured card variant
export const Featured: Story = {
  args: {
    variant: 'featured',
    elevation: 'xl',
    interactive: true,
    className: 'w-96',
    children: (
      <div>
        <div className="relative h-64">
          <img 
            src={hotelData.image} 
            alt={hotelData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold">
            -{hotelData.discount}%
          </div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-2xl font-bold mb-1">{hotelData.title}</h2>
            <p className="text-sm opacity-90">{hotelData.subtitle}</p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                <FiStar className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="font-semibold">{hotelData.rating}</span>
                <span className="text-sm opacity-75">({hotelData.reviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-gray-700 mb-4">{hotelData.description}</p>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <FiMapPin className="w-4 h-4" />
            <span>{hotelData.location}</span>
            <span>•</span>
            <span>{hotelData.priceRange}</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {hotelData.features.map((feature) => (
              <span key={feature} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                <FiTag className="inline w-3 h-3 mr-1" />
                {feature}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              View Details
            </button>
            <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FiHeart className="w-5 h-5" />
            </button>
            <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <FiShare2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    ),
  },
};

// Horizontal card variant
export const Horizontal: Story = {
  args: {
    variant: 'horizontal',
    elevation: 'md',
    interactive: true,
    className: 'w-full max-w-2xl',
    children: (
      <div className="flex">
        <img 
          src={restaurantData.image} 
          alt={restaurantData.title}
          className="w-48 h-48 object-cover"
        />
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-xl font-bold">{restaurantData.title}</h3>
              <p className="text-sm text-gray-600">{restaurantData.subtitle}</p>
            </div>
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              -{restaurantData.discount}%
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <FiStar className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-medium text-gray-900">{restaurantData.rating}</span>
              <span>({restaurantData.reviews})</span>
            </div>
            <div className="flex items-center gap-1">
              <FiMapPin className="w-4 h-4" />
              <span>{restaurantData.location}</span>
            </div>
            <span>{restaurantData.priceRange}</span>
          </div>
          <p className="text-sm text-gray-700 mb-3">{restaurantData.description}</p>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {restaurantData.badges.map((badge) => (
                <span key={badge} className="px-2 py-1 bg-blue-100 text
}}}