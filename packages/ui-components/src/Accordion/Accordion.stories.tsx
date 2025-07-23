import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion';
import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const meta = {
  title: 'Components/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible accordion component for displaying collapsible content sections. Supports single or multiple open panels, custom icons, and various styling options.'
      }
  },
  tags: ['autodocs'],
  argTypes: {
    items: {
      description: 'Array of accordion items with title and content',
      control: 'object'
    },
    defaultOpen: {
      description: 'Indices of items that should be open by default',
      control: 'array'
    },
    allowMultiple: {
      description: 'Whether multiple items can be open at the same time',
      control: 'boolean'
    },
    variant: {
      description: 'Visual style variant',
      control: 'select',
      options: ['default', 'bordered', 'separated', 'minimal']
    },
    size: {
      description: 'Size of the accordion',
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    iconPosition: {
      description: 'Position of the expand/collapse icon',
      control: 'radio',
      options: ['left', 'right']
    },
    disabled: {
      description: 'Whether the accordion is disabled',
      control: 'boolean'
    },
    className: {
      description: 'Additional CSS classes',
      control: 'text'
    }
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data for stories
const faqItems = [
  {
    id: '1',
    title: 'What is BOOM Card?',
    content: 'BOOM Card is a comprehensive discount platform that connects you with exclusive deals at restaurants, hotels, spas, and entertainment venues. Simply show your QR code at participating locations to enjoy instant savings.'
  },
  {
    id: '2',
    title: 'How much can I save with BOOM Card?',
    content: 'BOOM Card members typically save 10-30% at participating venues. Some exclusive partnerships offer even higher discounts during special promotions. Your savings quickly exceed the subscription cost.'
  },
  {
    id: '3',
    title: 'Where can I use my BOOM Card?',
    content: 'BOOM Card is accepted at hundreds of locations including fine dining restaurants, cafés, hotels, spas, nightclubs, and entertainment venues. Check our interactive map to find partners near you.'
  },
  {
    id: '4',
    title: 'How does the QR code work?',
    content: 'Each member receives a unique QR code in the mobile app. Simply present it to staff at participating venues before payment. The discount is automatically applied to your bill.'
  },
  {
    id: '5',
    title: 'Can I share my BOOM Card with others?',
    content: 'BOOM Card memberships are personal and non-transferable. Each QR code is linked to a specific member account. However, some plans allow you to add family members at a discounted rate.'
  }
];

const categoriesItems = [
  {
    id: 'food',
    title: 'Food & Dining',
    content: (
      <ul className="space-y-2 text-sm">
        <li>• Fine Dining Restaurants</li>
        <li>• Casual Dining & Bistros</li>
        <li>• Fast Food & Quick Service</li>
        <li>• Cafés & Coffee Shops</li>
        <li>• Bars & Pubs</li>
        <li>• Dietary Options (Vegan, Gluten-Free, etc.)</li>
      </ul>
    )
  },
  {
    id: 'entertainment',
    title: 'Entertainment & Nightlife',
    content: (
      <ul className="space-y-2 text-sm">
        <li>• Nightclubs & Dance Venues</li>
        <li>• Live Music & Concert Halls</li>
        <li>• Comedy Clubs</li>
        <li>• Theaters & Cultural Events</li>
        <li>• Gaming Centers & Arcades</li>
        <li>• Escape Rooms</li>
      </ul>
    )
  },
  {
    id: 'accommodation',
    title: 'Hotels & Accommodation',
    content: (
      <ul className="space-y-2 text-sm">
        <li>• Luxury Hotels (4-5 Star)</li>
        <li>• Business Hotels</li>
        <li>• Boutique Hotels</li>
        <li>• Bed & Breakfasts</li>
        <li>• Vacation Rentals</li>
        <li>• Airport Hotels</li>
      </ul>
    )
  },
  {
    id: 'wellness',
    title: 'Wellness & Services',
    content: (
      <ul className="space-y-2 text-sm">
        <li>• Spa & Wellness Centers</li>
        <li>• Fitness & Gyms</li>
        <li>• Beauty Salons</li>
        <li>• Medical Services</li>
        <li>• Pet Services</li>
        <li>• Transportation Services</li>
      </ul>
    )
  }
];

const pricingItems = [
  {
    id: 'basic',
    title: 'Basic Plan - €9.99/month',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">Perfect for occasional diners and casual users.</p>
        <ul className="space-y-2 text-sm">
          <li>✓ Access to 200+ partner venues</li>
          <li>✓ 10-15% average discount</li>
          <li>✓ Mobile app access</li>
          <li>✓ Email support</li>
        </ul>
        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">
          Get Started
        </button>
      </div>
    )
  },
  {
    id: 'premium',
    title: 'Premium Plan - €19.99/month',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">Ideal for food enthusiasts and frequent diners.</p>
        <ul className="space-y-2 text-sm">
          <li>✓ Access to 500+ partner venues</li>
          <li>✓ 15-25% average discount</li>
          <li>✓ Priority reservations</li>
          <li>✓ Exclusive member events</li>
          <li>✓ 24/7 phone support</li>
        </ul>
        <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700">
          Get Premium
        </button>
      </div>
    )
  },
  {
    id: 'family',
    title: 'Family Plan - €29.99/month',
    content: (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">Best value for families and groups.</p>
        <ul className="space-y-2 text-sm">
          <li>✓ Everything in Premium</li>
          <li>✓ Up to 4 family members</li>
          <li>✓ 20-30% average discount</li>
          <li>✓ Birthday special offers</li>
          <li>✓ Dedicated account manager</li>
        </ul>
        <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700">
          Get Family Plan
        </button>
      </div>
    )
  }
];

export const Default: Story = {
  args: {
    items: faqItems,
    allowMultiple: false,
    variant: 'default',
    size: 'md',
    iconPosition: 'right'
  };

export const MultipleOpen: Story = {
  args: {
    items: faqItems,
    allowMultiple: true,
    defaultOpen: ['1', '3'],
    variant: 'default',
    size: 'md'
  };

export const Bordered: Story = {
  args: {
    items: categoriesItems,
    allowMultiple: true,
    variant: 'bordered',
    size: 'md',
    iconPosition: 'left'
  };

export const Separated: Story = {
  args: {
    items: pricingItems,
    allowMultiple: false,
    variant: 'separated',
    size: 'lg',
    defaultOpen: ['premium']
  };

export const Minimal: Story = {
  args: {
    items: faqItems.slice(0, 3),
    variant: 'minimal',
    size: 'sm',
    iconPosition: 'right'
  };

export const CustomIcons: Story = {
  args: {
    items: faqItems,
    variant: 'bordered',
    expandIcon: <ChevronRightIcon className="w-5 h-5" />,
    collapseIcon: <ChevronDownIcon className="w-5 h-5" />,
    iconPosition: 'left'
  };

export const WithCustomStyling: Story = {
  args: {
    items: categoriesItems,
    variant: 'separated',
    className: 'shadow-lg rounded-lg p-4 bg-gray-50',
    itemClassName: 'hover:bg-blue-50 transition-colors',
    contentClassName: 'text-gray-700 leading-relaxed'
  };

export const Disabled: Story = {
  args: {
    items: faqItems.slice(0, 2),
    disabled: true,
    variant: 'default'
  };

export const InteractiveExample: Story = {
  render: () => {
    const [openItems, setOpenItems] = useState<string[]>(['1']);
    
    const handleToggle = (itemId: string) => {
      setOpenItems(prev => 
        prev.includes(itemId) 
          ? prev.filter(id => id !== itemId)
          : [...prev, itemId]
      );
    };

    return (
      <div className="w-full max-w-2xl space-y-4">
        <div className="text-center mb-6">
          <h3 className="text-lg font-semibold mb-2">Interactive Accordion Demo</h3>
          <p className="text-sm text-gray-600">
            Currently open: {openItems.length > 0 ? openItems.join(', ') : 'None'}
          </p>
        </div>
        <Accordion
          items={faqItems}
          allowMultiple={true}
          variant="bordered"
          openItems={openItems}
          onToggle={handleToggle}
        />
      </div>
    );
  };

export const LoadingState: Story = {
  args: {
    items: [
      {
        id: '1',
        title: 'Loading content...',
        content: (
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
        )
      }
    ],
    defaultOpen: ['1']
  };

export const WithNestedContent: Story = {
  args: {
    items: [
      {
        id: 'nested',
        title: 'Partner Benefits Overview',
        content: (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-semibold text-blue-900 mb-2">Revenue Growth</h4>
              <p className="text-sm text-blue-700">
                Partners report an average 25% increase in customer traffic within the first 3 months.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounde
}}}
}
}
}
}
}
}
}
}
}
}
}
}
