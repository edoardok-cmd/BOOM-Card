import type { Meta, StoryObj } from '@storybook/react';
import { Tabs } from './Tabs';
import { useState } from 'react';
import { FiHome, FiUsers, FiSettings, FiBarChart2, FiGift, FiMapPin } from 'react-icons/fi';

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible tabs component for organizing content into switchable panels.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    defaultValue: {
      description: 'Default active tab value',
      control: 'text',
    },
    value: {
      description: 'Controlled active tab value',
      control: 'text',
    },
    onValueChange: {
      description: 'Callback when tab changes',
      action: 'onValueChange',
    },
    orientation: {
      description: 'Tabs orientation',
      control: 'radio',
      options: ['horizontal', 'vertical'],
    },
    variant: {
      description: 'Visual variant of tabs',
      control: 'select',
      options: ['default', 'pills', 'underline', 'bordered'],
    },
    size: {
      description: 'Size of tabs',
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
    fullWidth: {
      description: 'Whether tabs should take full width',
      control: 'boolean',
    },
    disabled: {
      description: 'Whether tabs are disabled',
      control: 'boolean',
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text',
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic usage
export const Default: Story = {
  args: {
    defaultValue: 'overview',
    children: (
      <>
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="analytics">Analytics</Tabs.Trigger>
          <Tabs.Trigger value="reports">Reports</Tabs.Trigger>
          <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="overview" className="p-4">
          <h3 className="text-lg font-semibold mb-2">Dashboard Overview</h3>
          <p className="text-gray-600">
            Welcome to your BOOM Card dashboard. Here you can view your discount statistics,
            manage your subscription, and explore available offers.
          </p>
        </Tabs.Content>
        <Tabs.Content value="analytics" className="p-4">
          <h3 className="text-lg font-semibold mb-2">Analytics</h3>
          <p className="text-gray-600">
            Track your savings, usage patterns, and favorite merchants. View detailed insights
            about your discount card usage.
          </p>
        </Tabs.Content>
        <Tabs.Content value="reports" className="p-4">
          <h3 className="text-lg font-semibold mb-2">Reports</h3>
          <p className="text-gray-600">
            Generate and download detailed reports of your transactions, savings history,
            and merchant visits.
          </p>
        </Tabs.Content>
        <Tabs.Content value="settings" className="p-4">
          <h3 className="text-lg font-semibold mb-2">Settings</h3>
          <p className="text-gray-600">
            Manage your account preferences, notification settings, and subscription details.
          </p>
        </Tabs.Content>
      </>
    ),
  },
};

// With icons
export const WithIcons: Story = {
  args: {
    defaultValue: 'home',
    variant: 'pills',
    children: (
      <>
        <Tabs.List>
          <Tabs.Trigger value="home">
            <FiHome className="w-4 h-4 mr-2" />
            Home
          </Tabs.Trigger>
          <Tabs.Trigger value="partners">
            <FiUsers className="w-4 h-4 mr-2" />
            Partners
          </Tabs.Trigger>
          <Tabs.Trigger value="offers">
            <FiGift className="w-4 h-4 mr-2" />
            Offers
          </Tabs.Trigger>
          <Tabs.Trigger value="locations">
            <FiMapPin className="w-4 h-4 mr-2" />
            Locations
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="home" className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Welcome to BOOM Card</h3>
            <p className="text-sm text-gray-600">
              Discover amazing discounts at restaurants, hotels, spas, and entertainment venues.
            </p>
          </div>
        </Tabs.Content>
        <Tabs.Content value="partners" className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Our Partners</h3>
            <p className="text-sm text-gray-600">
              Browse through our network of partner establishments offering exclusive discounts.
            </p>
          </div>
        </Tabs.Content>
        <Tabs.Content value="offers" className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Current Offers</h3>
            <p className="text-sm text-gray-600">
              View all active discount offers available with your BOOM Card membership.
            </p>
          </div>
        </Tabs.Content>
        <Tabs.Content value="locations" className="p-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Find Locations</h3>
            <p className="text-sm text-gray-600">
              Discover partner locations near you using our interactive map.
            </p>
          </div>
        </Tabs.Content>
      </>
    ),
  },
};

// Vertical orientation
export const Vertical: Story = {
  args: {
    defaultValue: 'restaurants',
    orientation: 'vertical',
    className: 'flex h-64',
    children: (
      <>
        <Tabs.List className="w-48">
          <Tabs.Trigger value="restaurants">Restaurants</Tabs.Trigger>
          <Tabs.Trigger value="hotels">Hotels</Tabs.Trigger>
          <Tabs.Trigger value="spa">Spa & Wellness</Tabs.Trigger>
          <Tabs.Trigger value="entertainment">Entertainment</Tabs.Trigger>
        </Tabs.List>
        <div className="flex-1">
          <Tabs.Content value="restaurants" className="p-4 h-full">
            <h3 className="font-semibold mb-2">Restaurant Partners</h3>
            <p className="text-sm text-gray-600">
              Enjoy discounts at fine dining, casual restaurants, cafés, and bars.
              Save up to 20% on your dining experiences.
            </p>
          </Tabs.Content>
          <Tabs.Content value="hotels" className="p-4 h-full">
            <h3 className="font-semibold mb-2">Hotel Partners</h3>
            <p className="text-sm text-gray-600">
              Get exclusive rates at boutique hotels, business hotels, and vacation rentals.
              Perfect for business trips or weekend getaways.
            </p>
          </Tabs.Content>
          <Tabs.Content value="spa" className="p-4 h-full">
            <h3 className="font-semibold mb-2">Spa & Wellness</h3>
            <p className="text-sm text-gray-600">
              Relax and rejuvenate with discounts on spa treatments, massages,
              and wellness services at premium locations.
            </p>
          </Tabs.Content>
          <Tabs.Content value="entertainment" className="p-4 h-full">
            <h3 className="font-semibold mb-2">Entertainment Venues</h3>
            <p className="text-sm text-gray-600">
              Experience nightlife, live music, comedy clubs, and cultural events
              with special BOOM Card member pricing.
            </p>
          </Tabs.Content>
        </div>
      </>
    ),
  },
};

// Underline variant
export const Underline: Story = {
  args: {
    defaultValue: 'overview',
    variant: 'underline',
    fullWidth: true,
    children: (
      <>
        <Tabs.List>
          <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
          <Tabs.Trigger value="transactions">Transactions</Tabs.Trigger>
          <Tabs.Trigger value="savings">Savings</Tabs.Trigger>
          <Tabs.Trigger value="statistics">Statistics</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="overview" className="p-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="text-sm text-gray-600">Total Savings</h4>
              <p className="text-2xl font-bold">€1,234</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="text-sm text-gray-600">Visits This Month</h4>
              <p className="text-2xl font-bold">23</p>
            </div>
            <div className="bg-gray-50 p-4 rounded">
              <h4 className="text-sm text-gray-600">Average Discount</h4>
              <p className="text-2xl font-bold">15%</p>
            </div>
          </div>
        </Tabs.Content>
        <Tabs.Content value="transactions" className="p-4">
          <p className="text-gray-600">Your recent discount transactions will appear here.</p>
        </Tabs.Content>
        <Tabs.Content value="savings" className="p-4">
          <p className="text-gray-600">Track your cumulative savings over time.</p>
        </Tabs.Content>
        <Tabs.Content value="statistics" className="p-4">
          <p className="text-gray-600">View detailed statistics and analytics.</p>
        </Tabs.Content>
      </>
    ),
  },
};

// Bordered variant
export const Bordered: Story = {
  args: {
    defaultValue: 'active',
    variant: 'bordered',
    children: (
      <>
        <Tabs.List>
          <Tabs.Trigger value="active">Active Offers</Tabs.Trigger>
          <Tabs.Trigger value="upcoming">Upcoming</Tabs.Trigger>
          <Tabs.Trigger value="expired">Expired</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="active" className="p-4">
          <div className="space-y-3">
            <div className="border rounded p-3">
              <h4 className="font-semibold">Restaurant Week Special</h4>
              <p className="text-sm text-gray-600">20% off a
}}